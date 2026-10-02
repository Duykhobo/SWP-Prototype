const fs = require('fs');

const html = fs.readFileSync('graphify-out/system-flows-viewer.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/);
const code = scriptMatch[1];

// Let's write the code to a temporary js file and run node --check on it
fs.writeFileSync('scratch/temp_script.js', code);
console.log('Written scratch/temp_script.js, checking with child_process...');

const { execSync } = require('child_process');
try {
  execSync('node --check scratch/temp_script.js');
  console.log('node --check passed!');
} catch (e) {
  console.log('Error output:\n', e.output ? e.output.toString() : e.message);
}
