import xml.etree.ElementTree as ET

tree = ET.parse('docs/04_business_flows/FLOW_01_SYSTEM_MERGED.xml')
root = tree.getroot()
cells = {c.get('id'): c for c in root.iter('mxCell') if c.get('id')}

def check_lane_collisions(lane_id):
    children = [c for c in cells.values() if c.get('parent') == lane_id and c.get('vertex') == '1']
    for i in range(len(children)):
        for j in range(i+1, len(children)):
            c1, c2 = children[i], children[j]
            g1 = c1.find('mxGeometry')
            g2 = c2.find('mxGeometry')
            x1, y1, w1, h1 = float(g1.get('x')), float(g1.get('y')), float(g1.get('width')), float(g1.get('height'))
            x2, y2, w2, h2 = float(g2.get('x')), float(g2.get('y')), float(g2.get('width')), float(g2.get('height'))
            
            # Check overlap
            if (x1 < x2 + w2 and x1 + w1 > x2 and y1 < y2 + h2 and y1 + h1 > y2):
                cid1 = c1.get('id')
                cid2 = c2.get('id')
                print(f"Collision in {lane_id}: {cid1} ({x1},{y1},{w1},{h1}) overlaps {cid2} ({x2},{y2},{w2},{h2})")

lanes = [c.get('id') for c in cells.values() if 'lane' in c.get('id', '')]
for lid in lanes:
    check_lane_collisions(lid)
print("Collision check complete!")
