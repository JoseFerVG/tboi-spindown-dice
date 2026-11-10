import os, shutil

# 1. Back up dev index.html as index.dev.html
if os.path.exists('index.html'):
    shutil.copy2('index.html', 'index.dev.html')
    print('Backed up index.html to index.dev.html')

# 2. Copy the built standalone index.html to root index.html
shutil.copy2('dist/index.html', 'index.html')
print('Copied dist/index.html to root index.html')

# 3. Ensure items, sfx, ui exist in root folder alongside index.html
for folder in ['items', 'sfx', 'ui']:
    src = f'dist/{folder}'
    dst = folder
    if not os.path.exists(dst):
        shutil.copytree(src, dst)
        print(f'Copied {src} to {dst}')
    else:
        print(f'{dst} already exists in root')

# 4. Create ABRIR CALCULADORA.bat in root folder
bat_content = """@echo off
title Spindown Dice Calculator
echo Abriendo la Calculadora de Spindown Dice en tu navegador...
start "" "%~dp0index.html"
exit
"""

with open('ABRIR CALCULADORA.bat', 'w', encoding='utf-8') as f:
    f.write(bat_content)

print('Created ABRIR CALCULADORA.bat successfully!')

# 5. Also create a desktop shortcut if possible
desktop_path = 'C:/Users/josef/Desktop'
bat_desktop = os.path.join(desktop_path, 'Spindown Dice Calculator.bat')
bat_desktop_content = f"""@echo off
title Spindown Dice Calculator
echo Abriendo la Calculadora de Spindown Dice...
start "" "C:\\Users\\josef\\Desktop\\tboiSpindownDice\\index.html"
exit
"""
with open(bat_desktop, 'w', encoding='utf-8') as f:
    f.write(bat_desktop_content)
print(f'Created shortcut on Desktop at: {bat_desktop}')
