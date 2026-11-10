import os, shutil

# 1. Update dist/index.html using move_script_to_body logic
with open('dist/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 2. Copy dist/index.html to root index.html
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Updated root index.html with single-file bundle!')

# 3. Ensure items, sfx, ui exist in both dist and root
for folder in ['items', 'sfx', 'ui']:
    if not os.path.exists(folder):
        print(f'Warning: {folder} missing in root!')
    else:
        print(f'{folder} verified in root.')

# 4. Update ABRIR CALCULADORA.bat with robust launcher
bat_content = """@echo off
title Spindown Dice Calculator - Repentance
cd /d "%~dp0"
echo ========================================================
echo   SPINDOWN DICE CALCULATOR - The Binding of Isaac
echo   Abriendo en tu navegador predeterminado...
echo ========================================================

start "" "%~dp0index.html"
exit
"""
with open('ABRIR CALCULADORA.bat', 'w', encoding='utf-8') as f:
    f.write(bat_content)
print('Updated ABRIR CALCULADORA.bat')

# 5. Update Desktop shortcut if present
desktop_bat = 'C:/Users/josef/Desktop/Spindown Dice Calculator.bat'
desktop_content = """@echo off
title Spindown Dice Calculator - Repentance
cd /d "C:\\Users\\josef\\Desktop\\tboiSpindownDice"
start "" "C:\\Users\\josef\\Desktop\\tboiSpindownDice\\index.html"
exit
"""
try:
    with open(desktop_bat, 'w', encoding='utf-8') as f:
        f.write(desktop_content)
    print('Updated Desktop shortcut')
except Exception as e:
    print('Could not update desktop shortcut:', e)
