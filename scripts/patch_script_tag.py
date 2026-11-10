for path in ['index.html', 'dist/index.html']:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace('<script type="module" crossorigin>', '<script>')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Patched {path}')
