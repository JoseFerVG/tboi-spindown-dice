import xml.etree.ElementTree as ET

tree = ET.parse('temp_pack/extracted_resources/resources/items.xml')
root = tree.getroot()
collectibles = root.findall('passive') + root.findall('active') + root.findall('familiar')
print('Total collectibles found in items.xml:', len(collectibles))

ids = [int(c.get('id', 0)) for c in collectibles]
print('Max ID:', max(ids))
for c in collectibles:
    if c.get('id') == '723':
        print('Spindown dice XML entry:', c.attrib)
    if c.get('id') == '628':
        print('Death Certificate XML entry:', c.attrib)
