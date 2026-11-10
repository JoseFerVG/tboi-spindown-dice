import sys, urllib.request, re
sys.stdout.reconfigure(encoding='utf-8')

req = urllib.request.Request('https://raw.githubusercontent.com/wofsauge/External-Item-Descriptions/master/descriptions/ab+/en_us.lua', headers={'User-Agent': 'Python'})
content = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

for line in content.splitlines()[:50]:
    print(line)
