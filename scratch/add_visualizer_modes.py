import os

file_path = r"c:\Users\ThanhDuy\Documents\01_Code_Projects\SWP-Prototype\client\src\features\workflow-visualizer\InteractiveWorkflowVisualizer.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# 1. Add viewMode state
old_state = "  const [showExceptions, setShowExceptions] = useState<boolean>(false);"
new_state = """  const [showExceptions, setShowExceptions] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'simulation' | 'blueprint' | 'crypto_model'>('simulation');"""

if old_state in text and "viewMode" not in text:
    text = text.replace(old_state, new_state, 1)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(text)

print("Added viewMode state successfully!")
