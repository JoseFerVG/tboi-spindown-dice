import sys, urllib.request, re
sys.stdout.reconfigure(encoding='utf-8')

req = urllib.request.Request('https://raw.githubusercontent.com/wofsauge/External-Item-Descriptions/master/descriptions/rep/spa.lua', headers={'User-Agent': 'Python'})
content = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

for line in content.splitlines():
    if '723' in line:
        print(line)
