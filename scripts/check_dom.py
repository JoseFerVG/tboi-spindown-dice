with open('out_dom.txt', 'r', encoding='utf-8') as f:
    text = f.read()

root_pos = text.find('id="root"')
if root_pos != -1:
    print('Found root! Content around root:')
    print(text[root_pos:root_pos+800])
else:
    print('Root not found!')
