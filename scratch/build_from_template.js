const fs = require('fs');
const vm = require('vm');
const { execSync } = require('child_process');

console.log('1. Loading flowRoadmaps and flowsData...');
const genFile = fs.readFileSync('scratch/generate_system_flows.js', 'utf8');
const roadmapIndex = genFile.indexOf('const flowRoadmaps =');
const stopIndex = genFile.indexOf('const template =');
const roadmapsCode = genFile.slice(roadmapIndex, stopIndex !== -1 ? stopIndex : genFile.indexOf('const htmlContent ='));
const ctx = { fs };
vm.runInNewContext(roadmapsCode + '\nctx.roadmaps = flowRoadmaps;', { ctx, fs });
const flowRoadmaps = ctx.roadmaps;

const flowsData = JSON.parse(fs.readFileSync('graphify-out/flows_data.json', 'utf8'));

console.log('2. Reading template...');
const template = fs.readFileSync('scratch/system-flows-template.html', 'utf8');

console.log('3. Injecting data into template...');
const output = template
  .replace('/* FLOWS_DATA_PLACEHOLDER */', JSON.stringify(flowsData))
  .replace('/* ROADMAPS_PLACEHOLDER */', JSON.stringify(flowRoadmaps));

console.log('4. Writing to graphify-out/system-flows-viewer.html...');
fs.writeFileSync('graphify-out/system-flows-viewer.html', output);

console.log('5. Verifying JavaScript syntax...');
const scriptMatch = output.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/);
if (!scriptMatch) {
  throw new Error('Script block not found in output!');
}

fs.writeFileSync('scratch/temp_check.js', scriptMatch[1]);
execSync('node --check scratch/temp_check.js', { stdio: 'inherit' });
console.log('SUCCESS! JavaScript syntax is 100% valid!');
