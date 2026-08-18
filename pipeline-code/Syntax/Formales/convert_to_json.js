#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const formalesDir = __dirname;
const jsonDir = path.join(formalesDir, 'json');

// Create json directory if it doesn't exist
if (!fs.existsSync(jsonDir)) {
    fs.mkdirSync(jsonDir, { recursive: true });
}

// Training data generator - maps file numbers to instruction/plan/output triples
function generateTrainingData(fileNum) {
    const trainingData = {
        1: {
            instruction: "Create a simple addition formula",
            plan: "Add two numbers in cells A1 and A2",
            output: "cell:A3:vtf:n:30:A1+A2"
        },
        2: {
            instruction: "Create a subtraction formula",
            plan: "Subtract A2 from A1",
            output: "cell:A3:vtf:n:10:A1-A2"
        },
        3: {
            instruction: "Create a multiplication formula",
            plan: "Multiply values in A1 and A2",
            output: "cell:A3:vtf:n:200:A1*A2"
        },
        4: {
            instruction: "Create a division formula",
            plan: "Divide A1 by A2",
            output: "cell:A3:vtf:n:5:A1/A2"
        },
        5: {
            instruction: "Sum a range of cells",
            plan: "Use SUM function to add cells A1 through A3",
            output: "cell:A4:vtf:n:60:SUM(A1\\cA3)"
        },
        6: {
            instruction: "Calculate average of numbers",
            plan: "Use AVERAGE function on range A1 to A5",
            output: "cell:A6:vtf:n:30:AVERAGE(A1\\cA5)"
        },
        7: {
            instruction: "Find minimum value in range",
            plan: "Use MIN function to find smallest value in A1:A4",
            output: "cell:A5:vtf:n:10:MIN(A1\\cA4)"
        },
        8: {
            instruction: "Find maximum value in range",
            plan: "Use MAX function to find largest value in A1:A4",
            output: "cell:A5:vtf:n:100:MAX(A1\\cA4)"
        },
        9: {
            instruction: "Count numeric values",
            plan: "Use COUNT function to count numbers in range A1:A3",
            output: "cell:A4:vtf:n:3:COUNT(A1\\cA3)"
        },
        10: {
            instruction: "Calculate power of a number",
            plan: "Raise A1 to the power of 2",
            output: "cell:A2:vtf:n:100:POWER(A1,2)"
        },
        11: {
            instruction: "Calculate square root",
            plan: "Find square root of value in A1",
            output: "cell:A2:vtf:n:5:SQRT(A1)"
        },
        12: {
            instruction: "Get absolute value",
            plan: "Use ABS to get absolute value of A1",
            output: "cell:A2:vtf:n:10:ABS(A1)"
        },
        13: {
            instruction: "Round a number to nearest integer",
            plan: "Use ROUND to round A1 to 0 decimal places",
            output: "cell:A2:vtf:n:3:ROUND(A1,0)"
        },
        14: {
            instruction: "Round down to integer",
            plan: "Use INT to get integer part of A1",
            output: "cell:A2:vtf:n:3:INT(A1)"
        },
        15: {
            instruction: "Calculate modulus remainder",
            plan: "Find remainder when A1 is divided by 3",
            output: "cell:A2:vtf:n:1:MOD(A1,3)"
        },
        16: {
            instruction: "Use Pi constant in calculation",
            plan: "Calculate area of circle with radius in A1",
            output: "cell:A2:vtf:n:78.53981633974483:PI()*POWER(A1,2)"
        },
        17: {
            instruction: "Convert text to uppercase",
            plan: "Use UPPER to convert A1 text to uppercase",
            output: "cell:A2:vtf:t:HELLO:UPPER(A1)"
        },
        18: {
            instruction: "Convert text to lowercase",
            plan: "Use LOWER to convert A1 text to lowercase",
            output: "cell:A2:vtf:t:world:LOWER(A1)"
        },
        19: {
            instruction: "Get length of text",
            plan: "Use LEN to count characters in A1",
            output: "cell:A2:vtf:n:11:LEN(A1)"
        },
        20: {
            instruction: "Concatenate text strings",
            plan: "Join text from A1 and A2 with space",
            output: "cell:A3:vtf:t:Hello World:A1&\" \"&A2"
        },
        21: {
            instruction: "Extract left portion of text",
            plan: "Get first 3 characters from A1",
            output: "cell:A2:vtf:t:For:LEFT(A1,3)"
        },
        22: {
            instruction: "Extract right portion of text",
            plan: "Get last 4 characters from A1",
            output: "cell:A2:vtf:t:mula:RIGHT(A1,4)"
        },
        23: {
            instruction: "Extract middle portion of text",
            plan: "Get 5 characters from A1 starting at position 4",
            output: "cell:A2:vtf:t:cialC:MID(A1,4,5)"
        },
        24: {
            instruction: "Compare if value is greater",
            plan: "Check if A1 is greater than A2",
            output: "cell:A3:vtf:n:1:A1>A2"
        },
        25: {
            instruction: "Check if values are equal",
            plan: "Compare A1 and A2 for equality",
            output: "cell:A3:vtf:n:1:A1=A2"
        },
        26: {
            instruction: "Create conditional IF formula",
            plan: "Return 'Pass' if A1>60, otherwise 'Fail'",
            output: "cell:A2:vtf:t:Pass:IF(A1>60,\"Pass\",\"Fail\")"
        },
        27: {
            instruction: "Use AND logical function",
            plan: "Check if both A1>50 and A2>50",
            output: "cell:A3:vtf:n:1:AND(A1>50,A2>50)"
        },
        28: {
            instruction: "Use OR logical function",
            plan: "Check if either A1>90 or A2>90",
            output: "cell:A3:vtf:n:1:OR(A1>90,A2>90)"
        },
        29: {
            instruction: "Use NOT logical function",
            plan: "Negate the result of A1<50",
            output: "cell:A2:vtf:n:1:NOT(A1<50)"
        },
        30: {
            instruction: "Use PI constant",
            plan: "Display the value of Pi",
            output: "cell:A1:vtf:n:3.141592653589793:PI()"
        },
        31: {
            instruction: "Count all non-empty cells",
            plan: "Use COUNTA to count values in A1:A3",
            output: "cell:A4:vtf:n:3:COUNTA(A1\\cA3)"
        },
        32: {
            instruction: "Sum cells matching criteria",
            plan: "Use SUMIF to sum values in A1:A4 that are >50",
            output: "cell:A5:vtf:n:180:SUMIF(A1\\cA4,\">50\")"
        },
        33: {
            instruction: "Count cells matching criteria",
            plan: "Use COUNTIF to count cells in A1:A4 where value>50",
            output: "cell:A5:vtf:n:3:COUNTIF(A1\\cA4,\">50\")"
        },
        34: {
            instruction: "Calculate loan payment",
            plan: "Use PMT to calculate monthly payment with rate 0.005, 360 periods, 200000 principal",
            output: "cell:A4:vtf:n:-1199.1010558513144:PMT(A1,A2,A3)"
        },
        35: {
            instruction: "Get today's date",
            plan: "Use TODAY function to return current date",
            output: "cell:A1:vtf:nd:45658:TODAY()"
        },
        36: {
            instruction: "Get current date and time",
            plan: "Use NOW function to return current timestamp",
            output: "cell:A1:vtf:nd:45658.5:NOW()"
        },
        37: {
            instruction: "Create date from components",
            plan: "Use DATE to create date from year, month, day",
            output: "cell:A1:vtf:nd:45292:DATE(2023,12,15)"
        },
        38: {
            instruction: "Extract year from date",
            plan: "Use YEAR to get year from date in A1",
            output: "cell:A2:vtf:n:2023:YEAR(A1)"
        },
        39: {
            instruction: "Extract month from date",
            plan: "Use MONTH to get month number from A1",
            output: "cell:A2:vtf:n:12:MONTH(A1)"
        },
        40: {
            instruction: "Extract day from date",
            plan: "Use DAY to get day of month from A1",
            output: "cell:A2:vtf:n:15:DAY(A1)"
        },
        41: {
            instruction: "Choose value from list by index",
            plan: "Use CHOOSE to select from list based on A1",
            output: "cell:A5:vtf:t:Gold:CHOOSE(A1,\"Bronze\",\"Silver\",\"Gold\",\"Platinum\")"
        },
        42: {
            instruction: "Chain multiple operations",
            plan: "Multiply, add, then divide in sequence",
            output: "cell:A5:vtf:n:7:((A1*A2)+A3)/A4"
        },
        43: {
            instruction: "Combine functions in formula",
            plan: "Round the average of a range",
            output: "cell:A3:vtf:n:15:ROUND(AVERAGE(A1\\cA2),0)"
        },
        44: {
            instruction: "Create product total calculation",
            plan: "Calculate product of quantity and price, then sum totals",
            output: "cell:B4:vtf:n:275:SUM(B1\\cB3)"
        },
        45: {
            instruction: "Convert to proper case",
            plan: "Use PROPER to capitalize first letter of each word",
            output: "cell:A2:vtf:t:John Doe:PROPER(A1)"
        },
        46: {
            instruction: "Substitute text in string",
            plan: "Use SUBSTITUTE to replace 'old' with 'new' in A1",
            output: "cell:A2:vtf:t:This is new text:SUBSTITUTE(A1,\"old\",\"new\")"
        },
        47: {
            instruction: "Find position of text",
            plan: "Use FIND to locate position of 'World' in A1",
            output: "cell:A2:vtf:n:7:FIND(\"World\",A1)"
        },
        48: {
            instruction: "Extract hour from time",
            plan: "Use HOUR to get hour component from timestamp",
            output: "cell:A2:vtf:n:14:HOUR(A1)"
        },
        49: {
            instruction: "Use boolean constants",
            plan: "Create formula with TRUE and FALSE values",
            output: "cell:A1:vtf:n:1:TRUE()\ncell:A2:vtf:n:0:FALSE()"
        },
        50: {
            instruction: "Create pricing table with formulas",
            plan: "Build complete product pricing calculation with multiple formulas",
            output: "cell:D1:vtf:n:99:B1*C1\ncell:D2:vtf:n:198:B2*C2\ncell:D3:vtf:n:297:B3*C3\ncell:D4:vtf:n:594:SUM(D1\\cD3)"
        }
    };

    return trainingData[fileNum] || null;
}

// Get all .msc files (excluding negative examples)
const files = fs.readdirSync(formalesDir)
    .filter(f => f.endsWith('.msc') && !f.startsWith('neg-'))
    .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
    });

console.log('Converting .msc files to JSON format...\n');

const trainingExamples = [];
let convertedCount = 0;

files.forEach((file) => {
    const fileNum = parseInt(file.match(/\d+/)?.[0] || '0');
    const filePath = path.join(formalesDir, file);
    const savestr = fs.readFileSync(filePath, 'utf8').trim();

    // Create JSON object in correct format matching Borders/Fonts structure
    const jsonObj = {
        "numsheets": 1,
        "currentid": "sheet1",
        "currentname": "sheet1",
        "sheetArr": {
            "sheet1": {
                "sheetstr": {
                    "savestr": savestr
                },
                "name": "sheet1",
                "hidden": "0"
            }
        }
    };

    // Write individual JSON file
    const jsonFilePath = path.join(jsonDir, file.replace('.msc', '.json'));
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonObj, null, 2));

    // Get training data for this file
    const training = generateTrainingData(fileNum);
    if (training) {
        trainingExamples.push({
            instruction: training.instruction,
            plan: training.plan,
            output: training.output
        });
    }

    convertedCount++;
    console.log(`✓ Converted ${file} -> ${path.basename(jsonFilePath)}`);
});

// Create training JSONL file
const jsonlPath = path.join(formalesDir, 'formula_training.jsonl');
const jsonlContent = trainingExamples.map(ex => JSON.stringify(ex)).join('\n');
fs.writeFileSync(jsonlPath, jsonlContent);

console.log(`\n${'='.repeat(70)}`);
console.log('CONVERSION SUMMARY');
console.log('='.repeat(70));
console.log(`Converted files: ${convertedCount}`);
console.log(`JSON files created: ${convertedCount} (in json/ directory)`);
console.log(`Training examples: ${trainingExamples.length} (in formula_training.jsonl)`);
console.log('='.repeat(70));
