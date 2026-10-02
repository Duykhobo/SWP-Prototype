import xml.etree.ElementTree as ET

tree = ET.parse("docs/04_business_flows/FLOW_02_SYSTEM_MERGED.xml")
root = tree.getroot()

parents = {}
for cell in root.iter("mxCell"):
    p = cell.attrib.get("parent")
    cid = cell.attrib.get("id")
    parents[cid] = p

print("Total cells:", len(parents))
lane_children = {k: v for k, v in parents.items() if v and v.startswith("lane")}
print("Cells whose parent is a lane:", lane_children)
