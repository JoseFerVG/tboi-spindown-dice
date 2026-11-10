import json

with open('dist/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

print('Length:', len(html))
print('headEnd:', html.find('</head>'))
print('bodyStart:', html.find('<body'))
print('rootIdx:', html.find('id="root"'))
print('scriptIdx:', html.find('<script'))
print('First 100 chars of script tag:')
s_idx = html.find('<script')
if s_idx != -1:
    print(html[s_idx:s_idx+100])
