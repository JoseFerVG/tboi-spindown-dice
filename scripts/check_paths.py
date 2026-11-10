with open('temp_pack/tools/ResourceExtractor/filelist.txt', 'r', errors='ignore') as f:
    lines = [l.strip() for l in f if 'collectibles' in l.lower()]

for item_id in [442, 500, 600, 700]:
    matches = [l for l in lines if f'_{item_id}_' in l]
    print(f'Matches for {item_id}:', matches)
