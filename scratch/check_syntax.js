const fs = require('fs');

const genFile = fs.readFileSync('scratch/generate_system_flows.js', 'utf8');
const roadmapIndex = genFile.indexOf('const flowRoadmaps =');
const htmlContentIndex = genFile.indexOf('const htmlContent =');

// Safely extract flowRoadmaps by running it in VM
const vm = require('vm');
const roadmapsCode = genFile.slice(roadmapIndex, htmlContentIndex);
const ctx = {};
vm.runInNewContext(roadmapsCode + '\nctx.roadmaps = flowRoadmaps;', { ctx });
const flowRoadmaps = ctx.roadmaps;

console.log('FlowRoadmaps loaded:', Object.keys(flowRoadmaps));
console.log('flow1:', flowRoadmaps.flow1.length, 'steps');
console.log('flow2:', flowRoadmaps.flow2.length, 'steps');
console.log('flow3:', flowRoadmaps.flow3.length, 'steps');
