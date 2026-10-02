const fs = require("fs");

function dumpAllNodes(filename) {
  const xml = fs.readFileSync("docs/04_business_flows/" + filename, "utf8");
  console.log("====== " + filename + " ======");
  const regex = /<mxCell\s+id="([^"]+)"[^>]*value="([^"]*)"/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    if (
      match[1] !== "0" &&
      match[1] !== "1" &&
      !match[1].startsWith("lane") &&
      match[1] !== "title" &&
      match[1] !== "intro" &&
      match[1] !== "top_section" &&
      match[1] !== "container_01a" &&
      match[1] !== "container_01b" &&
      match[1] !== "container_common"
    ) {
      const val = match[2]
        .replace(/&lt;br\s*\/?&gt;/gi, " ")
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&")
        .trim();
      if (val.length > 0) {
        console.log(`{ id: "${match[1]}", label: "${val.slice(0, 45)}" },`);
      }
    }
  }
}

dumpAllNodes("FLOW_01_SYSTEM_MERGED.xml");
dumpAllNodes("FLOW_02_SYSTEM_MERGED.xml");
dumpAllNodes("FLOW_03_SYSTEM_MERGED.xml");
