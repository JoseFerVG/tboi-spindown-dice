import sys, urllib.request, re
sys.stdout.reconfigure(encoding='utf-8')

def extract_collectibles_from_lua(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Python'})
    content = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')
    
    # We want to find collectibles block
    # It stops when trinkets or cards block starts
    col_start = content.find("Collectibles")
    if col_start == -1:
        col_start = 0
    # Find next section: Trinkets or Cards
    col_end = len(content)
    for marker in ["Trinkets", "Cards", "Pills"]:
        pos = content.find(marker, col_start + 20)
        if pos != -1 and pos < col_end:
            col_end = pos
            
    col_text = content[col_start:col_end]
    
    results = {}
    # Pattern 1: {"123", "Name", "Desc"}
    for m in re.finditer(r'\{"(\d+)",\s*"([^"\\]*(?:\\.[^"\\]*)*)",\s*"([^"\\]*(?:\\.[^"\\]*)*)"\}', col_text):
        iid = int(m.group(1))
        name = m.group(2)
        desc = m.group(3)
        results[iid] = {'name': name, 'desc': desc}
    # Pattern 2: [123] = {"123", "Name", "Desc"} or [123] = {"Name", "Desc"}
    for m in re.finditer(r'\[(\d+)\]\s*=\s*\{(?:"(\d+)",\s*)?"([^"\\]*(?:\\.[^"\\]*)*)",\s*"([^"\\]*(?:\\.[^"\\]*)*)"\}', col_text):
        iid = int(m.group(1))
        name = m.group(3)
        desc = m.group(4)
        results[iid] = {'name': name, 'desc': desc}
        
    return results

en_ab = extract_collectibles_from_lua('https://raw.githubusercontent.com/wofsauge/External-Item-Descriptions/master/descriptions/ab+/en_us.lua')
en_rep = extract_collectibles_from_lua('https://raw.githubusercontent.com/wofsauge/External-Item-Descriptions/master/descriptions/rep/en_us.lua')
en_all = {**en_ab, **en_rep}

es_ab = extract_collectibles_from_lua('https://raw.githubusercontent.com/wofsauge/External-Item-Descriptions/master/descriptions/ab+/spa.lua')
es_rep = extract_collectibles_from_lua('https://raw.githubusercontent.com/wofsauge/External-Item-Descriptions/master/descriptions/rep/spa.lua')
es_all = {**es_ab, **es_rep}

print(f"Total EN items parsed: {len(en_all)}")
print(f"Total ES items parsed: {len(es_all)}")

print("Sample 1 EN:", en_all[1])
print("Sample 1 ES:", es_all[1])
print("Sample 628 EN (Death Certificate):", en_all.get(628))
print("Sample 628 ES (Death Certificate):", es_all.get(628))
print("Sample 723 EN (Spindown Dice):", en_all.get(723))
print("Sample 723 ES (Spindown Dice):", es_all.get(723))
