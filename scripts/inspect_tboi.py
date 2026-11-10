import sys, urllib.request, gzip, re
sys.stdout.reconfigure(encoding='utf-8')

url = 'https://tboi.com/assets/main.css'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Accept-Encoding': 'gzip'})
resp = urllib.request.urlopen(req)
raw = resp.read()
try:
    content = gzip.decompress(raw).decode('utf-8', errors='ignore')
except:
    content = raw.decode('utf-8', errors='ignore')

print("Decompressed len:", len(content))
# Find sprite urls
sprites = re.findall(r'url\(["\']?([^"\')]+)["\']?\)', content)
print("Unique URLs:", set(sprites))
# Find some item classes
print("Sample item rules:")
for line in content.splitlines():
    if 'reb-itm' in line or 're-itm001' in line:
        print(line[:120])
        break
