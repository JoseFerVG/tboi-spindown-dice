import xml.etree.ElementTree as ET

meta_tree = ET.parse('temp_pack/extracted_resources/resources/items_metadata.xml')
meta_root = meta_tree.getroot()

matches = [e for e in meta_root if e.get('id') == '1']
for m in matches:
    print(m.tag, m.attrib)
matches_3 = [e for e in meta_root if e.get('id') == '3']
for m in matches_3:
    print(m.tag, m.attrib)
