with open('temp_pack/tools/ResourceExtractor/filelist.txt', 'r', errors='ignore') as f:
    for i, line in enumerate(f):
        if 'collectibles_723_spindowndice.png' in line:
            print('Line index of Spindown Dice in filelist:', i)
            break
