with open('C:/Program Files (x86)/Steam/steamapps/common/The Binding of Isaac Rebirth/tools/ResourceExtractor/filelist.txt', 'r', errors='ignore') as f:
    files = [l.strip() for l in f if l.strip()]

for f in files:
    if f.endswith('items.xml'):
        print('items.xml:', f)
    if 'collectibles_001' in f:
        print('collectibles_001:', f)
