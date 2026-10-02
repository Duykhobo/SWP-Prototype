with open('docs/04_business_flows/FLOW_03_SYSTEM_MERGED.xml', 'r', encoding='utf-8') as f:
    content = f.read()

print('as_ count:', content.count('as_='))
print('as="geometry" count:', content.count('as="geometry"'))
print('&amp;lt; count:', content.count('&amp;lt;'))
print('&lt;br/&gt; count:', content.count('&lt;br/&gt;'))
print('Total characters:', len(content))
