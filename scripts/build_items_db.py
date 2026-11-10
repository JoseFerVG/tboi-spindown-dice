import sys, os, re, json, urllib.request
import xml.etree.ElementTree as ET

sys.stdout.reconfigure(encoding='utf-8')

print("Starting Isaac database builder...")

# 1. Fetch names
def fetch_names(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Python'})
    content = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')
    names = {}
    for m in re.finditer(r'\[C_ID\s*\.\.\s*(\d+)\]\s*=\s*"([^"]+)"', content):
        names[int(m.group(1))] = m.group(2)
    return names

names_en = fetch_names('https://raw.githubusercontent.com/wofsauge/External-Item-Descriptions/master/descriptions/names/en_us.lua')
names_es = fetch_names('https://raw.githubusercontent.com/wofsauge/External-Item-Descriptions/master/descriptions/names/spa.lua')

print(f"Loaded {len(names_en)} EN names, {len(names_es)} ES names")

# 2. Fetch descriptions from AB+ and Repentance
def fetch_eid_descs(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Python'})
    content = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')
    descs = {}
    pattern = r'\[(\d+)\]\s*=\s*\{([^}]+)\}'
    for m in re.finditer(pattern, content):
        item_id = int(m.group(1))
        # Match quoted strings, handle escaped quotes
        parts = re.findall(r'"([^"\\]*(?:\\.[^"\\]*)*)"', m.group(2))
        if len(parts) >= 3 and parts[0].isdigit():
            # [id] = { "id", "Name", "Desc" }
            descs[item_id] = {'pickup': '', 'desc': parts[2]}
        elif len(parts) >= 2:
            # [id] = { "Name", "Desc" }
            descs[item_id] = {'pickup': '', 'desc': parts[1]}
    return descs

descs_en_ab = fetch_eid_descs('https://raw.githubusercontent.com/wofsauge/External-Item-Descriptions/master/descriptions/ab+/en_us.lua')
descs_en_rep = fetch_eid_descs('https://raw.githubusercontent.com/wofsauge/External-Item-Descriptions/master/descriptions/rep/en_us.lua')
descs_es_ab = fetch_eid_descs('https://raw.githubusercontent.com/wofsauge/External-Item-Descriptions/master/descriptions/ab+/spa.lua')
descs_es_rep = fetch_eid_descs('https://raw.githubusercontent.com/wofsauge/External-Item-Descriptions/master/descriptions/rep/spa.lua')

descs_en = {**descs_en_ab, **descs_en_rep}
descs_es = {**descs_es_ab, **descs_es_rep}

print(f"Loaded {len(descs_en)} EN descs, {len(descs_es)} ES descs")

# 3. Parse XML files
# Metadata for quality & tags
meta_tree = ET.parse('temp_pack/extracted_resources/resources/items_metadata.xml')
meta_root = meta_tree.getroot()
metadata = {}
for item in meta_root:
    iid = int(item.get('id', 0))
    metadata[iid] = {
        'quality': int(item.get('quality', 0)),
        'tags': item.get('tags', '').split()
    }

# Items XML for types & charges & raw name/desc if needed
items_tree = ET.parse('temp_pack/extracted_resources/resources/items.xml')
items_root = items_tree.getroot()
xml_items = {}
for cat in ['passive', 'active', 'familiar']:
    for node in items_root.findall(cat):
        iid = int(node.get('id', 0))
        xml_items[iid] = {
            'type': cat,
            'maxcharges': int(node.get('maxcharges', 0)),
            'chargetype': node.get('chargetype', 'normal'),
            'achievement': node.get('achievement'),
            'gfx': node.get('gfx', '')
        }

# Pools
pools_tree = ET.parse('temp_pack/extracted_resources/resources/itempools.xml')
pools_root = pools_tree.getroot()
item_pools = {}
for pool in pools_root.findall('Pool'):
    pool_name = pool.get('Name')
    for it in pool.findall('Item'):
        iid = int(it.get('Id', 0))
        item_pools.setdefault(iid, []).append(pool_name)

# 4. Check available sprites
sprites_dir = 'temp_pack/extracted_resources/resources/gfx/items/collectibles'
available_sprites = set(os.listdir(sprites_dir))

# Known Spindown skipped items (hardcoded exclusions / dummy / hidden)
# ID 43, 61 (empty gaps)
# ID 59 (Book of Belial passive)
# ID 656 (Damocles passive)
# ID 714 (Recall)
# ID 715 (Hold)
HARDCODED_SKIPPED_IDS = {43, 59, 61, 656, 714, 715}

clean_db = []
max_id = max(max(names_en.keys()), max(xml_items.keys()))
print(f"Max item ID is {max_id}")

for iid in range(1, max_id + 1):
    # Check if item exists in XML or names
    if iid not in xml_items and iid not in names_en:
        continue

    x_info = xml_items.get(iid, {})
    m_info = metadata.get(iid, {'quality': 1, 'tags': []})

    # Sprite matching
    # Pattern: collectibles_{iid:03d}_*.png
    sprite_file = None
    for s in available_sprites:
        if s.startswith(f"collectibles_{iid:03d}_") or s.startswith(f"collectibles_{iid}_"):
            sprite_file = s
            break
    if not sprite_file:
        # Fallback check
        for s in available_sprites:
            if f"_{iid}_" in s:
                sprite_file = s
                break

    name_en = names_en.get(iid, f"Item {iid}")
    name_es = names_es.get(iid, name_en)

    desc_en_raw = descs_en.get(iid, {}).get('desc', '')
    desc_es_raw = descs_es.get(iid, {}).get('desc', '')

    # Clean EID markup (e.g. {{TearsUp}} -> [Tears], # -> newlines)
    def clean_eid(text):
        if not text:
            return ""
        text = text.replace('#', '\n')
        text = re.sub(r'\{\{[^}]+\}\}', '', text)
        return text.strip()

    is_skipped = (iid in HARDCODED_SKIPPED_IDS) or (x_info.get('type') is None and iid not in xml_items)

    clean_db.append({
        'id': iid,
        'name_en': name_en,
        'name_es': name_es,
        'desc_en': clean_eid(desc_en_raw),
        'desc_es': clean_eid(desc_es_raw),
        'quality': m_info.get('quality', 1),
        'type': x_info.get('type', 'passive'),
        'maxcharges': x_info.get('maxcharges', 0),
        'achievement': x_info.get('achievement'),
        'tags': m_info.get('tags', []),
        'pools': item_pools.get(iid, []),
        'sprite': sprite_file if sprite_file else 'questionmark.png',
        'is_skipped_default': is_skipped
    })

print(f"Constructed database with {len(clean_db)} valid collectibles!")
with open('scripts/test_db_sample.json', 'w', encoding='utf-8') as f:
    json.dump(clean_db[:10] + [item for item in clean_db if item['id'] in [118, 182, 356, 628, 723]], f, indent=2, ensure_ascii=False)
print("Saved sample to scripts/test_db_sample.json")
