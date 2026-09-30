import os
import re

file_path = r"c:\Users\ThanhDuy\Documents\01_Code_Projects\SWP-Prototype\client\src\features\workflow-visualizer\InteractiveWorkflowVisualizer.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Check if plainMechanism is already present in steps
print("Current plainMechanism occurrences:", content.count("plainMechanism"))
