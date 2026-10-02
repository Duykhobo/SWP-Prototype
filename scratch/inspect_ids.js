const fs = require('fs');

function inspectXml(filename) {
  const xml = fs.readFileSync('docs/04_business_flows/' + filename, 'utf8');
  console.log('=== ' + filename + ' ===');
  const regex = /<mxCell\s+id="([^"]+)"[^>]*value="([^"]*)"[^>]*vertex="1"/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const id = match[1];
    if (id !== '0' && id !== '1' && !id.startsWith('lane') && id !== 'title' && id !== 'intro' && id !== 'top_section' && !id.startsWith('container') && id !== 'legend') {
      const val = match[2].replace(/&lt;br\s*\/?&gt;/gi, ' ').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
      console.log(`{ id: "${id}", val: "${val}" },`);
    }
  }
}

inspectXml('FLOW_02_SYSTEM_MERGED.xml');


