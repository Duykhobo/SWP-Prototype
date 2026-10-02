const fs = require('fs');
const content = fs.readFileSync('scratch/user_prompt_raw.txt', 'utf8');

const parts = content.split(/%3CmxGraphModel%3E/g);
console.log('Total mxGraphModel parts found:', parts.length - 1);

const decodedModels = [];
for (let i = 1; i < parts.length; i++) {
    const rawPart = '%3CmxGraphModel%3E' + parts[i];
    const endTag = '%3C%2FmxGraphModel%3E';
    const endIdx = rawPart.indexOf(endTag);
    if (endIdx !== -1) {
        const fullEncoded = rawPart.substring(0, endIdx + endTag.length);
        const decoded = decodeURIComponent(fullEncoded);
        decodedModels.push(decoded);
        console.log(`Model ${i} length: ${decoded.length}`);
        
        const titleMatch = decoded.match(/value="([^"]*FLOW[^"]*)"/i);
        console.log(`Model ${i} title:`, titleMatch ? titleMatch[1] : 'No FLOW title');
    }
}

decodedModels.forEach((m, idx) => {
    fs.writeFileSync(`scratch/decoded_flow_${idx + 1}.xml`, m, 'utf8');
});
console.log('Saved decoded models to scratch directory');
