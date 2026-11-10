import xml.etree.ElementTree as ET

tree = ET.parse('temp_pack/extracted_resources/resources/itempools.xml')
root = tree.getroot()
print('Pools found:', [p.get('Name') for p in root.findall('Pool')])
