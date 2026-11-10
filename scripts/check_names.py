import sys, urllib.request, re
sys.stdout.reconfigure(encoding='utf-8')

req = urllib.request.Request('https://raw.githubusercontent.com/wofsauge/External-Item-Descriptions/master/descriptions/names/en_us.lua', headers={'User-Agent': 'Python'})
content = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')
print('names/en_us.lua len:', len(content))
for line in content.splitlines()[:20]:
    print(line)
