with open('temp_pack/tools/ResourceExtractor/filelist.txt', 'r', errors='ignore') as f:
    for i, line in enumerate(f):
        if 'collectibles' in line and 12500 <= i <= 14500:
            print(f'{i}: {line.strip()}')
            if i > 13700:
                break
