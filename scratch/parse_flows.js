const fs = require('fs');
const path = require('path');

function parseMxFile(filePath) {
  const xml = fs.readFileSync(filePath, 'utf8');
  const cells = [];
  const regex = /<mxCell\s+([^>]+)(?:\/>|>(.*?)<\/mxCell>)/gs;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const attrs = match[1];
    const inner = match[2] || '';
    const idM = attrs.match(/id="([^"]+)"/);
    const parentM = attrs.match(/parent="([^"]+)"/);
    const valueM = attrs.match(/value="([^"]*)"/);
    const styleM = attrs.match(/style="([^"]*)"/);
    const vertexM = attrs.match(/vertex="([^"]+)"/);
    const edgeM = attrs.match(/edge="([^"]+)"/);
    const sourceM = attrs.match(/source="([^"]+)"/);
    const targetM = attrs.match(/target="([^"]+)"/);

    let geom = null;
    const geomM = inner.match(/<mxGeometry\s+([^>]+)\/?>/);
    if (geomM) {
      const xM = geomM[1].match(/x="([^"]+)"/);
      const yM = geomM[1].match(/y="([^"]+)"/);
      const wM = geomM[1].match(/width="([^"]+)"/);
      const hM = geomM[1].match(/height="([^"]+)"/);
      const points = [];
      const arrayPointsM = inner.match(/<Array as="points">([\s\S]*?)<\/Array>/);
      if (arrayPointsM) {
        const ptRegex = /<mxPoint\s+x="([^"]+)"\s+y="([^"]+)"/g;
        let pMatch;
        while ((pMatch = ptRegex.exec(arrayPointsM[1])) !== null) {
          points.push({ x: parseFloat(pMatch[1]), y: parseFloat(pMatch[2]) });
        }
      }
      geom = {
        x: xM ? parseFloat(xM[1]) : 0,
        y: yM ? parseFloat(yM[1]) : 0,
        width: wM ? parseFloat(wM[1]) : 0,
        height: hM ? parseFloat(hM[1]) : 0,
        points: points
      };
    }

    if (idM && idM[1] !== '0' && idM[1] !== '1') {
      cells.push({
        id: idM[1],
        parent: parentM ? parentM[1] : null,
        value: valueM ? valueM[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"') : '',
        style: styleM ? styleM[1] : '',
        isVertex: vertexM && vertexM[1] === '1',
        isEdge: edgeM && edgeM[1] === '1',
        source: sourceM ? sourceM[1] : null,
        target: targetM ? targetM[1] : null,
        geometry: geom
      });
    }
  }
  return { rawXml: xml, cells };
}

const f1 = parseMxFile('docs/04_business_flows/FLOW_01_SYSTEM_MERGED.xml');
const f2 = parseMxFile('docs/04_business_flows/FLOW_02_SYSTEM_MERGED.xml');
const f3 = parseMxFile('docs/04_business_flows/FLOW_03_SYSTEM_MERGED.xml');

console.log('Flow 01:', f1.cells.filter(c => c.isVertex).length, 'nodes,', f1.cells.filter(c => c.isEdge).length, 'edges');
console.log('Flow 02:', f2.cells.filter(c => c.isVertex).length, 'nodes,', f2.cells.filter(c => c.isEdge).length, 'edges');
console.log('Flow 03:', f3.cells.filter(c => c.isVertex).length, 'nodes,', f3.cells.filter(c => c.isEdge).length, 'edges');

// Save parsed JSON to scratch
fs.writeFileSync('graphify-out/flows_data.json', JSON.stringify({
  flow1: { title: "FLOW 01 · SIGN-IN & ACCOUNT REGISTRATION", nodes: f1.cells.filter(c => c.isVertex), edges: f1.cells.filter(c => c.isEdge), xml: f1.rawXml },
  flow2: { title: "FLOW 02 · ESTATE PLAN SETUP & ACTIVATION", nodes: f2.cells.filter(c => c.isVertex), edges: f2.cells.filter(c => c.isEdge), xml: f2.rawXml },
  flow3: { title: "FLOW 03 · DEAD MAN'S SWITCH (DMS) & HANDOVER", nodes: f3.cells.filter(c => c.isVertex), edges: f3.cells.filter(c => c.isEdge), xml: f3.rawXml }
}, null, 2));

console.log('Saved graphify-out/flows_data.json');
