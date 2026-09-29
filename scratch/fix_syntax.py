import re

ts_path = r'c:\Users\ThanhDuy\Documents\01_Code_Projects\SWP-Prototype\client\src\features\workflow-visualizer\InteractiveWorkflowVisualizer.tsx'
with open(ts_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace any multiline single quoted strings in object properties with backticks
# Notice inside inner, if there's any ` it should be escaped, and \' can become '
def fix_multiline(content):
    # Regex matching key: '...multiline...' with optional trailing comma
    # Using lazy match for inner content
    pattern = re.compile(r'(\b[a-zA-Z0-9_]+:\s*)\'([^\']*\n[^\']*?)\'(\s*,)', re.DOTALL)
    
    # Run iteratively until no more matches
    prev = None
    while prev != content:
        prev = content
        content = pattern.sub(lambda m: f"{m.group(1)}`{m.group(2)}`{m.group(3)}", content)
    
    return content

content = fix_multiline(content)

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete. Let's verify.")
