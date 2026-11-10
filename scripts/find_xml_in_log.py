with open('temp_pack/tools/ResourceExtractor/ResourceExtractor_log.txt', 'r', errors='ignore') as f:
    for i, line in enumerate(f):
        if 'items.xml' in line:
            print(f'{i}: {line.strip()}')
