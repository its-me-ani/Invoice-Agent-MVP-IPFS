#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const paddingsDir = __dirname;
const jsonDir = path.join(paddingsDir, 'json');

if (!fs.existsSync(jsonDir)) {
    fs.mkdirSync(jsonDir, { recursive: true });
}

function generateTrainingData(fileNum) {
    const trainingData = {
        1: { instruction: "Create cell with top padding only", plan: "Use layout with padding:10px * * * for top padding only" },
        2: { instruction: "Create cell with left padding only", plan: "Use layout with padding:* * * 15px for left padding only" },
        3: { instruction: "Create cell with uniform padding on all sides", plan: "Use layout with padding:20px 20px 20px 20px for equal padding" },
        4: { instruction: "Create cell with top and bottom padding", plan: "Use layout with padding:15px * 15px * for vertical padding" },
        5: { instruction: "Create cell with left and right padding", plan: "Use layout with padding:* 10px * 10px for horizontal padding" },
        6: { instruction: "Create cell with different padding on each side", plan: "Use layout with padding:5px 10px 15px 20px for top, right, bottom, left" },
        7: { instruction: "Create cell with large padding", plan: "Apply layout with padding:30px 30px 30px 30px for spacious cell" },
        8: { instruction: "Create multiple cells with different padding values", plan: "Define multiple layouts with varying padding specifications" },
        9: { instruction: "Create cell with padding and vertical alignment", plan: "Combine padding layout with vertical-align property" },
        10: { instruction: "Create cell with minimal padding", plan: "Use layout with small padding values like 2px" }
    };
    return trainingData[fileNum] || { instruction: "Create cell with padding", plan: "Add padding layout to cell" };
}

const processedFiles = [];
for (let i = 1; i <= 10; i++) {
    const mscFile = path.join(paddingsDir, `${i}.msc`);

    if (!fs.existsSync(mscFile)) {
        console.log(`⚠️  Skipping ${i}.msc (not found)`);
        continue;
    }

    const mscContent = fs.readFileSync(mscFile, 'utf8').trim();

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

const trainingFile = path.join(paddingsDir, 'paddings_training.jsonl');
const trainingLines = [];

for (let i = 1; i <= 10; i++) {
    const mscFile = path.join(paddingsDir, `${i}.msc`);
    if (!fs.existsSync(mscFile)) continue;

    const mscContent = fs.readFileSync(mscFile, 'utf8').trim();
    const training = generateTrainingData(i);

    const jsonLine = JSON.stringify({
        instruction: training.instruction,
        input: "",
        output: mscContent.trim(),
        plan: training.plan
    });
    trainingLines.push(jsonLine);
}

fs.writeFileSync(trainingFile, trainingLines.join('\n'));
console.log(`✅ Generated ${trainingLines.length} training examples → paddings_training.jsonl\n`);

console.log('🎉 Conversion complete!');
console.log(`   JSON files: ${jsonDir}`);
console.log(`   Training data: ${trainingFile}`);
