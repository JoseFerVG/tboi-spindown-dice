with open('index.html', 'r', encoding='utf-8') as f:
    lines = [f.readline() for _ in range(25)]
    print(''.join(lines))
