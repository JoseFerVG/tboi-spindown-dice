with open('temp_pack/tools/ResourceExtractor/filelist.txt', 'r', errors='ignore') as f:
    for i, line in enumerate(f):
        if line.strip().endswith('items.xml'):
            print(f'{i}: {line.strip()}')
