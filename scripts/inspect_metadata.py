import xml.etree.ElementTree as ET

tree = ET.parse('temp_pack/extracted_resources/resources/items_metadata.xml')
root = tree.getroot()
print('Root tag:', root.tag)
print('Children count:', len(list(root)))
sample = list(root)[:5]
for s in sample:
    print(s.tag, s.attrib)

# Check for item 723
for s in root:
    if s.get('id') == '723':
        print('Item 723 metadata:', s.attrib)
