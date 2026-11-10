import os, shutil, subprocess, time

temp_dir = 'C:/Users/josef/Desktop/tboiSpindownDice/temp_pack'
if os.path.exists(temp_dir):
    shutil.rmtree(temp_dir)

os.makedirs(f'{temp_dir}/resources/packed', exist_ok=True)
os.makedirs(f'{temp_dir}/tools/ResourceExtractor', exist_ok=True)

game_dir = 'C:/Program Files (x86)/Steam/steamapps/common/The Binding of Isaac Rebirth'

# Copy ResourceExtractor.exe and filelist.txt
shutil.copy2(f'{game_dir}/tools/ResourceExtractor/ResourceExtractor.exe', f'{temp_dir}/tools/ResourceExtractor/')
shutil.copy2(f'{game_dir}/tools/ResourceExtractor/filelist.txt', f'{temp_dir}/tools/ResourceExtractor/')

# Hardlink only the archives we need: config.a, graphics.a, repentance.a, afterbirth.a, afterbirthp.a
archives = ['config.a', 'graphics.a', 'repentance.a', 'afterbirth.a', 'afterbirthp.a']
for a in archives:
    src = f'{game_dir}/resources/packed/{a}'
    dst = f'{temp_dir}/resources/packed/{a}'
    if os.path.exists(src):
        try:
            os.link(src, dst)
            print(f'Hardlinked {a}')
        except Exception as e:
            print(f'Failed to link {a}: {e}')

# Run ResourceExtractor in temp_dir
start = time.time()
p = subprocess.Popen(
    [f'{temp_dir}/tools/ResourceExtractor/ResourceExtractor.exe'],
    cwd=f'{temp_dir}/tools/ResourceExtractor',
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)

stdout, stderr = p.communicate(input='\n\n', timeout=60)
print('Execution finished in:', time.time() - start)
print('Exit code:', p.returncode)
print('Stdout tail:', stdout[-500:])
