import xml.etree.ElementTree as ET

tree = ET.parse('temp_pack/extracted_resources/resources/translations.xml')
root = tree.getroot()
print('Root tag:', root.tag)
for elem in root[:10]:
    print(elem.tag, elem.attrib)

# Search for SPINDOWN_DICE
found = 0
for elem in root.iter():
    if 'SPINDOWN_DICE' in elem.get('key', '') or 'SPINDOWN_DICE' in elem.get('name', ''):
        print('Found translation:', elem.tag, elem.attrib, elem.text)
        found += 1
        if found > 5:
            break
