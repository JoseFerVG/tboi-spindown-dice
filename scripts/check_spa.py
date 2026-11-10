import sys, urllib.request, re
sys.stdout.reconfigure(encoding='utf-8')

url = 'https://raw.githubusercontent.com/wofsauge/External-Item-Descriptions/master/descriptions/rep/spa.lua'
req = urllib.request.Request(url, headers={'User-Agent': 'Python'})
content = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

matches = re.findall(r'\[(\d+)\]\s*=\s*\{([^}]+)\}', content)
print("Regex table matches:", len(matches))
if matches:
    print("Match 0:", matches[0])
else:
    for line in content.splitlines()[30:60]:
        print(line)
