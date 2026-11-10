import sys, os, re, json, urllib.request
import xml.etree.ElementTree as ET

sys.stdout.reconfigure(encoding='utf-8')

print("Generating full production items_db.json...")

# 1. Names
def fetch_names(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    content = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')
    names = {}
    for m in re.finditer(r'\[C_ID\s*\.\.\s*(\d+)\]\s*=\s*"([^"]+)"', content):
        names[int(m.group(1))] = m.group(2)
    return names

names_en = fetch_names('https://raw.githubusercontent.com/wofsauge/External-Item-Descriptions/master/descriptions/names/en_us.lua')
names_es = fetch_names('https://raw.githubusercontent.com/wofsauge/External-Item-Descriptions/master/descriptions/names/spa.lua')

# 2. Descriptions
def extract_collectibles_from_lua(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    content = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')
    
    col_start = content.find("Collectibles")
    if col_start == -1:
        col_start = 0
    col_end = len(content)
    for marker in ["Trinkets", "Cards", "Pills"]:
        pos = content.find(marker, col_start + 20)
        if pos != -1 and pos < col_end:
            col_end = pos
            
    col_text = content[col_start:col_end]
    results = {}
    for m in re.finditer(r'\{"(\d+)",\s*"([^"\\]*(?:\\.[^"\\]*)*)",\s*"([^"\\]*(?:\\.[^"\\]*)*)"\}', col_text):
        iid = int(m.group(1))
        results[iid] = {'name': m.group(2), 'desc': m.group(3)}
    for m in re.finditer(r'\[(\d+)\]\s*=\s*\{(?:"(\d+)",\s*)?"([^"\\]*(?:\\.[^"\\]*)*)",\s*"([^"\\]*(?:\\.[^"\\]*)*)"\}', col_text):
        iid = int(m.group(1))
        results[iid] = {'name': m.group(3), 'desc': m.group(4)}
    return results

en_ab = extract_collectibles_from_lua('https://raw.githubusercontent.com/wofsauge/External-Item-Descriptions/master/descriptions/ab+/en_us.lua')
en_rep = extract_collectibles_from_lua('https://raw.githubusercontent.com/wofsauge/External-Item-Descriptions/master/descriptions/rep/en_us.lua')
en_descs = {**en_ab, **en_rep}

es_ab = extract_collectibles_from_lua('https://raw.githubusercontent.com/wofsauge/External-Item-Descriptions/master/descriptions/ab+/spa.lua')
es_rep = extract_collectibles_from_lua('https://raw.githubusercontent.com/wofsauge/External-Item-Descriptions/master/descriptions/rep/spa.lua')
es_descs = {**es_ab, **es_rep}

# 3. XML Metadata (Only <item>)
meta_tree = ET.parse('temp_pack/extracted_resources/resources/items_metadata.xml')
meta_root = meta_tree.getroot()
metadata = {}
for elem in meta_root:
    if elem.tag == 'item':
        iid = int(elem.get('id', 0))
        metadata[iid] = {
            'quality': int(elem.get('quality', 1)),
            'tags': elem.get('tags', '').split()
        }

# 4. XML Items (Passive, Active, Familiar)
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

# 5. Item Pools
pools_tree = ET.parse('temp_pack/extracted_resources/resources/itempools.xml')
pools_root = pools_tree.getroot()
item_pools = {}
for pool in pools_root.findall('Pool'):
    pname = pool.get('Name')
    for it in pool.findall('Item'):
        iid = int(it.get('Id', 0))
        item_pools.setdefault(iid, []).append(pname)

# 6. Available Sprites
sprites_dir = 'public/items'
sprites_list = os.listdir(sprites_dir)

HARDCODED_SKIPPED = {43, 59, 61, 656, 714, 715}

def clean_desc(text):
    if not text:
        return ""
    text = text.replace('\\"', '"').replace('\\n', '\n')
    text = text.replace('#', '\n• ')
    if not text.startswith('• '):
        text = '• ' + text
    # Clean EID icon tags like {{Heart}}, {{Tears}}, etc.
    text = re.sub(r'\{\{[^}]+\}\}', '', text)
    # Clean extra spaces
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()

items_list = []
max_id = 732

for iid in range(1, max_id + 1):
    x_info = xml_items.get(iid)
    name_e = names_en.get(iid)
    if not x_info and not name_e:
        # Non-existent ID gap
        continue

    m_info = metadata.get(iid, {'quality': 1, 'tags': []})

    # Find sprite
    sprite_file = None
    for s in sprites_list:
        if s.startswith(f"collectibles_{iid:03d}_") or s.startswith(f"collectibles_{iid}_"):
            sprite_file = s
            break
    if not sprite_file:
        for s in sprites_list:
            if f"_{iid}_" in s:
                sprite_file = s
                break
    if not sprite_file:
        sprite_file = "questionmark.png"

    # Names
    name_en = names_en.get(iid, f"Item #{iid}")
    name_es = names_es.get(iid, name_en)

    # Descriptions
    d_en = en_descs.get(iid, {}).get('desc', '')
    d_es = es_descs.get(iid, {}).get('desc', '')

    is_skipped = (iid in HARDCODED_SKIPPED)

    items_list.append({
        'id': iid,
        'name_en': name_en,
        'name_es': name_es,
        'desc_en': clean_desc(d_en),
        'desc_es': clean_desc(d_es),
        'quality': m_info['quality'],
        'type': x_info['type'] if x_info else 'passive',
        'maxcharges': x_info['maxcharges'] if x_info else 0,
        'achievement': x_info.get('achievement') if x_info else None,
        'tags': m_info['tags'],
        'pools': list(set(item_pools.get(iid, []))),
        'sprite': sprite_file,
        'is_skipped_default': is_skipped
    })

print(f"Total items added to DB: {len(items_list)}")

# Save to public/items_db.json
with open('public/items_db.json', 'w', encoding='utf-8') as f:
    json.dump(items_list, f, indent=2, ensure_ascii=False)

print("Saved public/items_db.json successfully!")
