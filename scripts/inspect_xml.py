import xml.etree.ElementTree as ET

tree = ET.parse('temp_pack/extracted_resources/resources/items.xml')
root = tree.getroot()
collectibles = root.findall('passive') + root.findall('active') + root.findall('familiar')
print('Total collectibles found in XML:', len(collectibles))

items = []
for c in collectibles:
    item_id = int(c.get('id', 0))
    name = c.get('name', '')
    desc = c.get('description', '')
    quality = c.get('quality', '')
    gfx = c.get('gfx', '')
    items.append((item_id, name, desc, quality, gfx))

items.sort(key=lambda x: x[0])
print('Lowest item:', items[0])
print('Highest item:', items[-1])
print('Items count with ID > 700:', len([x for x in items if x[0] >= 700]))
