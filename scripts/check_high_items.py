with open('temp_pack/tools/ResourceExtractor/filelist.txt', 'r', errors='ignore') as f:
    files = [l.strip() for l in f if 'collectibles' in l.lower()]
print('Total collectibles in list:', len(files))
sample_high = [f for f in files if any(f'collectibles_{i}' in f for i in range(700, 725))]
print('High collectibles:', sample_high)
