#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const alignmentsDir = __dirname;
const jsonDir = path.join(alignmentsDir, 'json');

if (!fs.existsSync(jsonDir)) {
    fs.mkdirSync(jsonDir, { recursive: true });
}

function generateTrainingData(fileNum) {
    const trainingData = {
        1: {
            instruction: "Create cell with left horizontal alignment",
            plan: "Apply cellformat with left alignment to text cell",
            output: "cell:A1:t:Left Aligned:cf:1\ncellformat:1:left"
        },
        2: {
            instruction: "Create cell with center horizontal alignment",
            plan: "Apply cellformat with center alignment to text cell",
            output: "cell:A1:t:Center Aligned:cf:1\ncellformat:1:center"
        },
        3: {
            instruction: "Create cell with right horizontal alignment",
            plan: "Apply cellformat with right alignment to text cell",
            output: "cell:A1:t:Right Aligned:cf:1\ncellformat:1:right"
        },
        4: {
            instruction: "Create cell with top vertical alignment",
            plan: "Apply layout with vertical-align:top to position content at top",
            output: "cell:A1:t:Top Aligned:l:1\nlayout:1:padding:* * * *;vertical-align:top;"
        },
        5: {
            instruction: "Create cell with middle vertical alignment",
            plan: "Apply layout with vertical-align:middle to center content vertically",
            output: "cell:A1:t:Middle Aligned:l:1\nlayout:1:padding:* * * *;vertical-align:middle;"
        },
        6: {
            instruction: "Create cell with bottom vertical alignment",
            plan: "Apply layout with vertical-align:bottom to position content at bottom",
            output: "cell:A1:t:Bottom Aligned:l:1\nlayout:1:padding:* * * *;vertical-align:bottom;"
        },
        7: {
            instruction: "Create cell with left horizontal and top vertical alignment",
            plan: "Combine cellformat:left with layout vertical-align:top for top-left positioning",
            output: "cell:A1:t:Left + Top:cf:1:l:1\ncellformat:1:left\nlayout:1:padding:* * * *;vertical-align:top;"
        },
        8: {
            instruction: "Create cell with center horizontal and middle vertical alignment",
            plan: "Combine cellformat:center with layout vertical-align:middle for perfect centering",
            output: "cell:A1:t:Center + Middle:cf:1:l:1\ncellformat:1:center\nlayout:1:padding:* * * *;vertical-align:middle;"
        },
        9: {
            instruction: "Create cell with right horizontal and bottom vertical alignment",
            plan: "Combine cellformat:right with layout vertical-align:bottom for bottom-right positioning",
            output: "cell:A1:t:Right + Bottom:cf:1:l:1\ncellformat:1:right\nlayout:1:padding:* * * *;vertical-align:bottom;"
        },
        10: {
            instruction: "Create table with mixed alignments for text and numbers",
            plan: "Use left alignment for text headers and right alignment for numeric values",
            output: "cell:A1:t:Header:cf:1\ncell:A2:t:Left Text:cf:1\ncell:A3:v:1234:cf:2\ncellformat:1:left\ncellformat:2:right"
        },
        11: {
            instruction: "Create document with centered title and left-aligned content",
            plan: "Use center alignment for title/subtitle, left alignment for body content",
            output: "cell:A1:t:Title:cf:1\ncell:A2:t:Subtitle:cf:1\ncell:A3:t:Content:cf:2\ncellformat:1:center\ncellformat:2:left"
        },
        12: {
            instruction: "Create product table with left names and right prices",
            plan: "Align product names left and amounts right for easy reading",
            output: "cell:A1:t:Name:cf:1\ncell:B1:t:Amount:cf:2\ncell:A2:t:Product A:cf:1\ncell:B2:v:99.99:cf:2\ncellformat:1:left\ncellformat:2:right"
        },
        13: {
            instruction: "Create invoice header with centered company name and right-aligned invoice number",
            plan: "Center company name at top, right-align invoice number with padding",
            output: "cell:A1:t:Company Name:cf:1:l:1\ncell:A2:t:Invoice #12345:cf:2:l:2\ncellformat:1:center\ncellformat:2:right\nlayout:1:padding:10px * * *;vertical-align:top;\nlayout:2:padding:* 10px * *;vertical-align:top;"
        },
        14: {
            instruction: "Create header row with left, center, and right aligned columns",
            plan: "Distribute three headers with different horizontal alignments",
            output: "cell:A1:t:Left Header:cf:1:l:1\ncell:B1:t:Center Header:cf:2:l:1\ncell:C1:t:Right Header:cf:3:l:1\ncellformat:1:left\ncellformat:2:center\ncellformat:3:right\nlayout:1:padding:5px * * *;vertical-align:middle;"
        },
        15: {
            instruction: "Create 3x3 grid with all alignment combinations",
            plan: "Create grid showing all combinations of horizontal (left/center/right) and vertical (top/middle/bottom) alignments",
            output: "cell:A1:t:Top Left:cf:1:l:1\ncell:B1:t:Top Center:cf:2:l:1\ncell:C1:t:Top Right:cf:3:l:1\ncell:A2:t:Middle Left:cf:1:l:2\ncell:B2:t:Middle Center:cf:2:l:2\ncell:C2:t:Middle Right:cf:3:l:2\ncell:A3:t:Bottom Left:cf:1:l:3\ncell:B3:t:Bottom Center:cf:2:l:3\ncell:C3:t:Bottom Right:cf:3:l:3\ncellformat:1:left\ncellformat:2:center\ncellformat:3:right\nlayout:1:padding:* * * *;vertical-align:top;\nlayout:2:padding:* * * *;vertical-align:middle;\nlayout:3:padding:* * * *;vertical-align:bottom;"
        },
        16: {
            instruction: "Create table with centered merged header spanning multiple columns",
            plan: "Center-align title spanning 3 columns, then use mixed alignments for data columns",
            output: "cell:A1:t:Centered Title:cf:1:l:1:colspan:3\ncell:A2:t:Item:cf:2\ncell:B2:t:Price:cf:1\ncell:C2:t:Total:cf:3\ncellformat:1:center\ncellformat:2:left\ncellformat:3:right\nlayout:1:padding:10px * * *;vertical-align:middle;"
        },
        17: {
            instruction: "Create text cells with different vertical alignments and padding",
            plan: "Demonstrate top and bottom vertical alignment with varied padding for visual distinction",
            output: "cell:A1:t:Description:cf:1:l:1\ncell:A2:t:This is a longer text that demonstrates left alignment with top vertical positioning:cf:1:l:1\ncell:A3:t:Short text:cf:1:l:2\ncellformat:1:left\nlayout:1:padding:5px * * 5px;vertical-align:top;\nlayout:2:padding:5px * * 5px;vertical-align:bottom;"
        },
        18: {
            instruction: "Create report with centered title and right-aligned date/totals",
            plan: "Use centered alignment for report title, right alignment for date and summary values with appropriate padding",
            output: "cell:A1:t:REPORT TITLE:cf:1:l:1\ncell:A2:t:Date\\c 12/14/2025:cf:2:l:2\ncell:A3:t:Summary Data:cf:1:l:1\ncell:A4:t:Total\\c $1,234.56:cf:2:l:2\ncellformat:1:center\ncellformat:2:right\nlayout:1:padding:15px * 10px *;vertical-align:middle;\nlayout:2:padding:5px 10px * *;vertical-align:top;"
        },
        19: {
            instruction: "Create employee table with left-aligned text and right-aligned salary",
            plan: "Format employee data table with left alignment for names/departments and right alignment for numeric salary values",
            output: "cell:A1:t:Name:cf:1:l:1\ncell:B1:t:Department:cf:1:l:1\ncell:C1:t:Salary:cf:2:l:1\ncell:A2:t:John Doe:cf:1:l:2\ncell:B2:t:Engineering:cf:1:l:2\ncell:C2:v:75000:cf:2:l:2\ncell:A3:t:Jane Smith:cf:1:l:2\ncell:B3:t:Marketing:cf:1:l:2\ncell:C3:v:68000:cf:2:l:2\ncellformat:1:left\ncellformat:2:right\nlayout:1:padding:8px * * 8px;vertical-align:middle;\nlayout:2:padding:5px * * 5px;vertical-align:middle;"
        },
        20: {
            instruction: "Create quarterly report with centered title and right-aligned numeric data",
            plan: "Center main title spanning columns, center quarter labels, right-align all numeric values with appropriate layouts",
            output: "cell:A1:t:Quarter Report:cf:1:l:1:colspan:4\ncell:A2:t:Q1:cf:1:l:2\ncell:B2:t:Q2:cf:1:l:2\ncell:C2:t:Q3:cf:1:l:2\ncell:D2:t:Q4:cf:1:l:2\ncell:A3:v:1250:cf:2:l:2\ncell:B3:v:1380:cf:2:l:2\ncell:C3:v:1420:cf:2:l:2\ncell:D3:v:1560:cf:2:l:2\ncell:A4:t:Total:cf:1:l:3\ncell:B4:v:5610:cf:2:l:3:colspan:3\ncellformat:1:center\ncellformat:2:right\nlayout:1:padding:15px * 10px *;vertical-align:middle;\nlayout:2:padding:5px * * *;vertical-align:middle;\nlayout:3:padding:10px * 5px *;vertical-align:bottom;"
        }
    };

    return trainingData[fileNum] || null;
}

const processedFiles = [];
for (let i = 1; i <= 20; i++) {
    const mscFile = path.join(alignmentsDir, `${i}.msc`);

    if (!fs.existsSync(mscFile)) {
        console.log(`⚠️  Skipping ${i}.msc (not found)`);
        continue;
    }

    const mscContent = fs.readFileSync(mscFile, 'utf8');

    const jsonData = {
        "numsheets": 1,
        "currentid": "sheet1",
        "sheetArr": {
            "sheet1": {
                "sheetstr": {
                    "savestr": mscContent
                }
            }
        }
    };

    const jsonFile = path.join(jsonDir, `${i}.json`);
    fs.writeFileSync(jsonFile, JSON.stringify(jsonData, null, 2));

    processedFiles.push(i);
    console.log(`✅ Converted ${i}.msc → ${i}.json`);
}

console.log(`\n📊 Converted ${processedFiles.length} MSC files to JSON\n`);

const trainingFile = path.join(alignmentsDir, 'alignment_training.jsonl');
let trainingCount = 0;

const trainingLines = [];
for (let i = 1; i <= 20; i++) {
    const training = generateTrainingData(i);
    if (training) {
        const jsonLine = JSON.stringify({
            instruction: training.instruction,
            input: "",
            output: `version:1.5\n${training.output}\nsheet:c:1:r:1`,
            plan: training.plan
        });
        trainingLines.push(jsonLine);
        trainingCount++;
    }
}

fs.writeFileSync(trainingFile, trainingLines.join('\n'));
console.log(`✅ Generated ${trainingCount} training examples → alignment_training.jsonl\n`);

console.log('🎉 Conversion complete!');
console.log(`   JSON files: ${jsonDir}`);
console.log(`   Training data: ${trainingFile}`);
