import sys, urllib.request, re
sys.stdout.reconfigure(encoding='utf-8')

req = urllib.request.Request('https://raw.githubusercontent.com/wofsauge/External-Item-Descriptions/master/descriptions/names/spa.lua', headers={'User-Agent': 'Python'})
content = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')
print('names/spa.lua len:', len(content))
for line in content.splitlines()[12:30]:
    print(line)
