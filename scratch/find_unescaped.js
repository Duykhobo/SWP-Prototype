const fs = require('fs');
const content = fs.readFileSync('scratch/build_perfect_viewer.js', 'utf8');
const lines = content.split('\n');
const dollarBrace = String.fromCharCode(36) + '{';
const escDollarBrace = '\\' + dollarBrace;

lines.forEach((line, idx) => {
  let pos = 0;
  while ((pos = line.indexOf(dollarBrace, pos)) !== -1) {
    if (pos === 0 || line[pos - 1] !== '\\') {
      if (!line.includes('flowsData') && !line.includes('roadmapsCode')) {
        console.log(`Unescaped line ${idx + 1}: ${line.trim()}`);
      }
    }
    pos += 2;
  }
});
