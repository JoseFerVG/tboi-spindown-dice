with open('C:/Program Files (x86)/Steam/steamapps/common/The Binding of Isaac Rebirth/tools/ResourceExtractor/filelist.txt', 'r', errors='ignore') as f:
    lines = [line.strip() for line in f if line.strip()]
print('Total files in filelist.txt:', len(lines))
collectibles = [l for l in lines if 'collectibles' in l]
print('Collectibles in filelist.txt:', len(collectibles))
print('Sample collectibles:', collectibles[:5])
