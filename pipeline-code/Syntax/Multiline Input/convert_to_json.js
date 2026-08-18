#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const multilineDir = __dirname;
const jsonDir = path.join(multilineDir, 'json');

if (!fs.existsSync(jsonDir)) {
    fs.mkdirSync(jsonDir, { recursive: true });
}

function generateTrainingData(fileNum) {
    const trainingData = {
        1: { instruction: "Create cell with two lines of text", plan: "Use \\n escape sequence to create line break between two lines" },
        2: { instruction: "Create cell with three lines of text", plan: "Use multiple \\n escape sequences to separate three lines" },
        3: { instruction: "Create multiline cell with bullet points", plan: "Use \\n to create list-like structure with bullet characters" },
        4: { instruction: "Create cell with address spanning multiple lines", plan: "Split address into street, city, state lines using \\n" },
        5: { instruction: "Create multiline cell with mixed content", plan: "Combine header and content lines with \\n separators" },
        6: { instruction: "Create cell with numbered list", plan: "Use \\n between numbered items to create vertical list" },
        7: { instruction: "Create multiline cell with blank line", plan: "Use double \\n\\n to create empty line between content" },
        8: { instruction: "Create cell with poem or verse", plan: "Use \\n to preserve line breaks in poetic text" },
        9: { instruction: "Create cell with long multiline paragraph", plan: "Break long text into multiple lines for readability using \\n" },
        10: { instruction: "Create multiline cell with formatted sections", plan: "Use \\n to separate different sections with headers and content" }
    };
    return trainingData[fileNum] || { instruction: "Create multiline text", plan: "Add multiline content to cell" };
}

const processedFiles = [];
for (let i = 1; i <= 10; i++) {
    const mscFile = path.join(multilineDir, `${i}.msc`);

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

const trainingFile = path.join(multilineDir, 'multiline_training.jsonl');
const trainingLines = [];

for (let i = 1; i <= 10; i++) {
    const mscFile = path.join(multilineDir, `${i}.msc`);
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
console.log(`✅ Generated ${trainingLines.length} training examples → multiline_training.jsonl\n`);

console.log('🎉 Conversion complete!');
console.log(`   JSON files: ${jsonDir}`);
console.log(`   Training data: ${trainingFile}`);
