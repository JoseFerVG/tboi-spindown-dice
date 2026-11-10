import sys, urllib.request, re
sys.stdout.reconfigure(encoding='utf-8')

def parse_eid_lua(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Python'})
    content = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')
    # Match patterns like: [1] = {"1", "The Sad Onion", "Tears up..."}, or [1] = {"The Sad Onion", "..."}
    # Or in spa.lua: [2] = {"2", "El Ojo Interior", "Disparo triple#..."}
    items = {}
    pattern = r'\[(\d+)\]\s*=\s*\{([^}]+)\}'
    for m in re.finditer(pattern, content):
        item_id = int(m.group(1))
        # Extract quoted strings
        parts = re.findall(r'"([^"\\]*(?:\\.[^"\\]*)*)"', m.group(2))
        if len(parts) >= 3 and parts[0].isdigit():
            items[item_id] = {'name': parts[1], 'desc': parts[2]}
        elif len(parts) >= 2:
            items[item_id] = {'name': parts[0], 'desc': parts[1]}
    return items

spa = parse_eid_lua('https://raw.githubusercontent.com/wofsauge/External-Item-Descriptions/master/descriptions/rep/spa.lua')
en = parse_eid_lua('https://raw.githubusercontent.com/wofsauge/External-Item-Descriptions/master/descriptions/rep/en_us.lua')

print('Spanish items count:', len(spa))
print('English items count:', len(en))
print('Sample 1 EN:', en.get(1))
print('Sample 1 ES:', spa.get(1))
print('Sample 723 EN (Spindown Dice):', en.get(723))
print('Sample 723 ES (Spindown Dice):', spa.get(723))
print('Sample 356 EN (Car Battery):', en.get(356))
print('Sample 356 ES (Car Battery):', spa.get(356))
print('Sample 628 EN (Death Certificate):', en.get(628))
