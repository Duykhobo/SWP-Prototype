const fs = require('fs');

const content = fs.readFileSync('scratch/generate_system_flows.js', 'utf8');
const marker = 'const htmlContent = `<!DOCTYPE html>';
const idx = content.indexOf(marker);

if (idx !== -1) {
  const head = content.slice(0, idx);
  const tail = [
    "const template = fs.readFileSync('scratch/system-flows-template.html', 'utf8');",
    "const htmlContent = template",
    "  .replace('/* FLOWS_DATA_PLACEHOLDER */', JSON.stringify(flowsData))",
    "  .replace('/* ROADMAPS_PLACEHOLDER */', JSON.stringify(flowRoadmaps));",
    "",
    "fs.writeFileSync('graphify-out/system-flows-viewer.html', htmlContent);",
    "console.log('Successfully updated system-flows-viewer.html with SVG Swimlane Architectural Blueprint and code grounding!');",
    ""
  ].join('\n');

  fs.writeFileSync('scratch/generate_system_flows.js', head + tail);
  console.log('Updated scratch/generate_system_flows.js successfully!');
} else {
  console.log('Marker not found');
}
