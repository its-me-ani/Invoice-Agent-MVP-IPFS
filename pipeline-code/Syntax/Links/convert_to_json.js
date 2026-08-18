#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const linksDir = __dirname;
const jsonDir = path.join(linksDir, 'json');

if (!fs.existsSync(jsonDir)) {
    fs.mkdirSync(jsonDir, { recursive: true });
}

function generateTrainingData(fileNum) {
    const trainingData = {
        1: { instruction: "Create basic link that opens in current tab", plan: "Use single angle brackets <URL> with text-link valueformat and tvf:1 reference" },
        2: { instruction: "Create multiple links that open in new tabs", plan: "Use double angle brackets <<URL>> for new tab behavior with text-link format" },
        3: { instruction: "Create email link with mailto protocol", plan: "Use mailto\\c protocol in angle brackets with display text" },
        4: { instruction: "Create GitHub repository link opening in new tab", plan: "Apply double angle brackets <<URL>> to open in new browser tab" },
        5: { instruction: "Create colored links with current tab behavior", plan: "Combine color formats with single angle bracket link syntax" },
        6: { instruction: "Create bold link opening in new tab", plan: "Apply font formatting with double angle bracket link for new tab" },
        7: { instruction: "Create FTP link with current tab", plan: "Use ftp\\c protocol with single angle brackets" },
        8: { instruction: "Create telephone link", plan: "Use tel\\c protocol for clickable phone numbers" },
        9: { instruction: "Create link with query parameters opening in new tab", plan: "Include query string in URL with double angle brackets" },
        10: { instruction: "Create navigation menu with mixed link behaviors", plan: "Use both single and double angle brackets for current/new tab options" }
    };
    return trainingData[fileNum] || { instruction: "Create link", plan: "Add link to cell" };
}

const processedFiles = [];
for (let i = 1; i <= 10; i++) {
    const mscFile = path.join(linksDir, `${i}.msc`);

    if (!fs.existsSync(mscFile)) {
        console.log(`⚠️  Skipping ${i}.msc (not found)`);
        continue;
    }

    const mscContent = fs.readFileSync(mscFile, 'utf8');

    const jsonData = {
        "numsheets": 1,
        "currentid": "sheet1",
        "currentname": "sheet1",
        "sheetArr": {
            "sheet1": {
                "sheetstr": {
                    "savestr": mscContent
                },
                "name": "sheet1",
                "hidden": "0"
            }
        }
    };

    const jsonFile = path.join(jsonDir, `${i}.json`);
    fs.writeFileSync(jsonFile, JSON.stringify(jsonData, null, 2));

    processedFiles.push(i);
    console.log(`✅ Converted ${i}.msc → ${i}.json`);
}

console.log(`\n📊 Converted ${processedFiles.length} MSC files to JSON\n`);

const trainingFile = path.join(linksDir, 'links_training.jsonl');
const trainingLines = [];

for (let i = 1; i <= 10; i++) {
    const mscFile = path.join(linksDir, `${i}.msc`);
    if (!fs.existsSync(mscFile)) continue;

    const mscContent = fs.readFileSync(mscFile, 'utf8').trim();
    const training = generateTrainingData(i); const jsonLine = JSON.stringify({
        instruction: training.instruction,
        input: "",
        output: mscContent.trim(),
        plan: training.plan
    });
    trainingLines.push(jsonLine);
}

fs.writeFileSync(trainingFile, trainingLines.join('\n'));
console.log(`✅ Generated ${trainingLines.length} training examples → links_training.jsonl\n`);

console.log('🎉 Conversion complete!');
console.log(`   JSON files: ${jsonDir}`);
console.log(`   Training data: ${trainingFile}`);
