with open('temp_pack/tools/ResourceExtractor/filelist.txt', 'r', errors='ignore') as f:
    for line in f:
        l = line.strip()
        if 'collectibles_442' in l or 'collectibles_550' in l or 'collectibles_723' in l:
            print('Line:', l)
