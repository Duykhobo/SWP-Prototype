const fs = require('fs');

['FLOW_01_SYSTEM_MERGED.xml', 'FLOW_02_SYSTEM_MERGED.xml', 'FLOW_03_SYSTEM_MERGED.xml'].forEach(filename => {
  const xml = fs.readFileSync('docs/04_business_flows/' + filename, 'utf8');
  console.log('====== ' + filename + ' ======');
  const tagRegex = /<mxCell\s+([^>]+)(?:\/>|>)/g;
  let match;
  while ((match = tagRegex.exec(xml)) !== null) {
    const attrs = match[1];
    if (attrs.includes('vertex="1"')) {
      const idM = attrs.match(/id="([^"]+)"/);
      const valM = attrs.match(/value="([^"]*)"/);
      if (idM) {
        const id = idM[1];
        if (!id.startsWith('lane') && id !== 'top_section' && !id.startsWith('container') && id !== 'title' && id !== 'intro' && !id.startsWith('annot') && id !== 'legend') {
          const val = valM ? valM[1].replace(/&lt;br\s*\/?&gt;/gi, ' ').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim() : '';
          console.log(`{ id: "${id}", val: "${val.slice(0, 50)}" },`);
        }
      }
    }
  }
});
