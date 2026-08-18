#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const formatNumberDir = __dirname;
const jsonDir = path.join(formatNumberDir, 'json');

// Create json directory if it doesn't exist
if (!fs.existsSync(jsonDir)) {
    fs.mkdirSync(jsonDir, { recursive: true });
}

// Training data generator - maps file numbers to instruction/plan/output triples
function generateTrainingData(fileNum) {
    const trainingData = {
        1: {
            instruction: "Format number with comma separators",
            plan: "Apply #,##0 format to display number with thousands separators",
            output: "cell:A1:v:1234:ntvf:1\nvalueformat:1:#,##0"
        },
        2: {
            instruction: "Format number with two decimal places",
            plan: "Apply #,##0.00 format to show number with comma separators and 2 decimals",
            output: "cell:A1:v:1234.56:ntvf:1\nvalueformat:1:#,##0.00"
        },
        3: {
            instruction: "Format number with four decimal places",
            plan: "Apply #,##0.0000 format for high precision number display",
            output: "cell:A1:v:1234.5678:ntvf:1\nvalueformat:1:#,##0.0000"
        },
        4: {
            instruction: "Format as plain integer",
            plan: "Use format 0 to display number without decimals or separators",
            output: "cell:A1:v:1234:ntvf:1\nvalueformat:1:0"
        },
        5: {
            instruction: "Format as percentage",
            plan: "Apply 0.00% format to display decimal as percentage",
            output: "cell:A1:v:0.75:ntvf:1\nvalueformat:1:0.00%"
        },
        6: {
            instruction: "Format as currency without decimals",
            plan: "Use $#,##0 format for dollar amounts without cents",
            output: "cell:A1:v:1234:ntvf:1\nvalueformat:1:$#,##0"
        },
        7: {
            instruction: "Format as currency with cents",
            plan: "Apply $#,##0.00 format for standard dollar amounts",
            output: "cell:A1:v:1234.56:ntvf:1\nvalueformat:1:$#,##0.00"
        },
        8: {
            instruction: "Format negative currency with parentheses",
            plan: "Use ($#,##0) format to show negative amounts in parentheses",
            output: "cell:A1:v:-1234:ntvf:1\nvalueformat:1:($#,##0)"
        },
        9: {
            instruction: "Format as short date",
            plan: "Apply m/d/yy format to display date in short format",
            output: "cell:A1:v:38718:ntvf:1\nvalueformat:1:m/d/yy"
        },
        10: {
            instruction: "Format as full date with slashes",
            plan: "Use mm/dd/yyyy format for complete date display",
            output: "cell:A1:v:38718:ntvf:1\nvalueformat:1:mm/dd/yyyy"
        },
        11: {
            instruction: "Format as ISO date",
            plan: "Apply yyyy-mm-dd format for international standard date",
            output: "cell:A1:v:38718:ntvf:1\nvalueformat:1:yyyy-mm-dd"
        },
        12: {
            instruction: "Format date with short month name",
            plan: "Use d-mmm-yy format to display date with abbreviated month",
            output: "cell:A1:v:38718:ntvf:1\nvalueformat:1:d-mmm-yy"
        },
        13: {
            instruction: "Format date with full month name",
            plan: "Apply dd-mmm-yyyy for date with full month abbreviation",
            output: "cell:A1:v:38718:ntvf:1\nvalueformat:1:dd-mmm-yyyy"
        },
        14: {
            instruction: "Format date in long format",
            plan: "Use mmmm d, yyyy format for spelled-out month name",
            output: "cell:A1:v:38718:ntvf:1\nvalueformat:1:mmmm d, yyyy"
        },
        15: {
            instruction: "Format time in 12-hour format",
            plan: "Apply h\\cmm format to display time without AM/PM",
            output: "cell:A1:v:0.520833:ntvf:1\nvalueformat:1:h\\cmm"
        },
        16: {
            instruction: "Format time with AM/PM indicator",
            plan: "Use h\\cmm AM/PM format for 12-hour time with meridian",
            output: "cell:A1:v:0.520833:ntvf:1\nvalueformat:1:h\\cmm AM/PM"
        },
        17: {
            instruction: "Format time with seconds",
            plan: "Apply h\\cmm\\css format to include seconds in time display",
            output: "cell:A1:v:0.521354:ntvf:1\nvalueformat:1:h\\cmm\\css"
        },
        18: {
            instruction: "Format time with padded hours",
            plan: "Use hh\\cmm\\css format for zero-padded hours",
            output: "cell:A1:v:0.521354:ntvf:1\nvalueformat:1:hh\\cmm\\css"
        },
        19: {
            instruction: "Format large number with decimals",
            plan: "Apply #,##0.00 to display millions with comma separators",
            output: "cell:A1:v:1234567.89:ntvf:1\nvalueformat:1:#,##0.00"
        },
        20: {
            instruction: "Format small decimal as percentage",
            plan: "Convert 0.125 to 12.50% using percentage format",
            output: "cell:A1:v:0.125:ntvf:1\nvalueformat:1:0.00%"
        },
        21: {
            instruction: "Format multiple prices consistently",
            plan: "Apply same currency format to list of product prices",
            output: "cell:A1:v:99.99:ntvf:1\ncell:A2:v:149.99:ntvf:1\ncell:A3:v:249.99:ntvf:1\nvalueformat:1:$#,##0.00"
        },
        22: {
            instruction: "Format million with separators",
            plan: "Display 1,000,000 with comma separators",
            output: "cell:A1:v:1000000:ntvf:1\nvalueformat:1:#,##0"
        },
        23: {
            instruction: "Format Pi with precision",
            plan: "Show mathematical constant with 4 decimal places",
            output: "cell:A1:v:3.14159265:ntvf:1\nvalueformat:1:#,##0.0000"
        },
        24: {
            instruction: "Format date in long text format",
            plan: "Display date as 'December 15, 2023' format",
            output: "cell:A1:v:45292:ntvf:1\nvalueformat:1:mmmm d, yyyy"
        },
        25: {
            instruction: "Format afternoon time with AM/PM",
            plan: "Show 2:00 PM using 12-hour time format",
            output: "cell:A1:v:0.583333:ntvf:1\nvalueformat:1:h\\cmm AM/PM"
        },
        26: {
            instruction: "Format decimal values list",
            plan: "Apply consistent decimal formatting to multiple values",
            output: "cell:A1:v:50.5:ntvf:1\ncell:A2:v:75.25:ntvf:1\ncell:A3:v:100.75:ntvf:1\nvalueformat:1:#,##0.00"
        },
        27: {
            instruction: "Format negative amount with parentheses",
            plan: "Show negative currency as ($500.50) instead of -$500.50",
            output: "cell:A1:v:-500.50:ntvf:1\nvalueformat:1:($#,##0.00)"
        },
        28: {
            instruction: "Format as percentage near 100%",
            plan: "Display 0.9999 as 99.99% with percentage format",
            output: "cell:A1:v:0.9999:ntvf:1\nvalueformat:1:0.00%"
        },
        29: {
            instruction: "Format date with full month abbreviation",
            plan: "Show date as 01-Jan-2023 format",
            output: "cell:A1:v:44927:ntvf:1\nvalueformat:1:dd-mmm-yyyy"
        },
        30: {
            instruction: "Apply different precision formats",
            plan: "Use multiple valueformat definitions for varied decimal places",
            output: "cell:A1:v:12345.678:ntvf:1\ncell:A2:v:98765.432:ntvf:2\nvalueformat:1:#,##0.00\nvalueformat:2:#,##0.0000"
        },
        31: {
            instruction: "Compare currency and plain number formats",
            plan: "Display same value with and without currency symbol",
            output: "cell:A1:v:1234.56:ntvf:1\ncell:B1:v:1234.56:ntvf:2\nvalueformat:1:$#,##0.00\nvalueformat:2:#,##0.00"
        },
        32: {
            instruction: "Format percentage list",
            plan: "Show multiple decimal values as percentages",
            output: "cell:A1:v:0.5:ntvf:1\ncell:A2:v:0.25:ntvf:1\ncell:A3:v:0.75:ntvf:1\nvalueformat:1:0.00%"
        },
        33: {
            instruction: "Format date range with ISO format",
            plan: "Display multiple dates in yyyy-mm-dd format",
            output: "cell:A1:v:38718:ntvf:1\ncell:A2:v:39083:ntvf:1\ncell:A3:v:39448:ntvf:1\nvalueformat:1:yyyy-mm-dd"
        },
        34: {
            instruction: "Format time schedule",
            plan: "Show different times of day with AM/PM",
            output: "cell:A1:v:0.375:ntvf:1\ncell:A2:v:0.625:ntvf:1\ncell:A3:v:0.875:ntvf:1\nvalueformat:1:h\\cmm AM/PM"
        },
        35: {
            instruction: "Format very large number",
            plan: "Display number approaching billion with proper formatting",
            output: "cell:A1:v:999999999.99:ntvf:1\nvalueformat:1:#,##0.00"
        },
        36: {
            instruction: "Format very small decimal",
            plan: "Show tiny decimal with 4-place precision",
            output: "cell:A1:v:0.00001:ntvf:1\nvalueformat:1:#,##0.0000"
        },
        37: {
            instruction: "Format multi-million dollar amount",
            plan: "Display large currency value with proper separators",
            output: "cell:A1:v:2958465.75:ntvf:1\nvalueformat:1:$#,##0.00"
        },
        38: {
            instruction: "Format date with short month",
            plan: "Show date as 15-Feb-25 format",
            output: "cell:A1:v:45657:ntvf:1\nvalueformat:1:d-mmm-yy"
        },
        39: {
            instruction: "Format early morning time",
            plan: "Display 1:00 AM with padded format",
            output: "cell:A1:v:0.041667:ntvf:1\nvalueformat:1:hh\\cmm\\css"
        },
        40: {
            instruction: "Format mixed number and currency totals",
            plan: "Use different formats for items and total",
            output: "cell:A1:v:100:ntvf:1\ncell:A2:v:200:ntvf:1\ncell:A3:v:300:ntvf:1\ncell:A4:v:600:ntvf:2\nvalueformat:1:#,##0\nvalueformat:2:$#,##0"
        },
        41: {
            instruction: "Format various percentage values",
            plan: "Display range from 6.25% to 87.5%",
            output: "cell:A1:v:0.0625:ntvf:1\ncell:A2:v:0.125:ntvf:1\ncell:A3:v:0.875:ntvf:1\nvalueformat:1:0.00%"
        },
        42: {
            instruction: "Format negative amounts list",
            plan: "Show multiple negative values with parentheses format",
            output: "cell:A1:v:-10.50:ntvf:1\ncell:A2:v:-250.75:ntvf:1\ncell:A3:v:-1000.00:ntvf:1\nvalueformat:1:($#,##0.00)"
        },
        43: {
            instruction: "Format date comparison",
            plan: "Show two dates in short format for comparison",
            output: "cell:A1:v:42005:ntvf:1\ncell:A2:v:42370:ntvf:1\nvalueformat:1:m/d/yy"
        },
        44: {
            instruction: "Format evening time",
            plan: "Display 5:30 PM without seconds",
            output: "cell:A1:v:0.729167:ntvf:1\nvalueformat:1:h\\cmm"
        },
        45: {
            instruction: "Format millions comparison",
            plan: "Show two large numbers with thousand separators",
            output: "cell:A1:v:5000000:ntvf:1\ncell:A2:v:7500000:ntvf:1\nvalueformat:1:#,##0"
        },
        46: {
            instruction: "Format Euler's number",
            plan: "Display mathematical constant e with precision",
            output: "cell:A1:v:2.718281828:ntvf:1\nvalueformat:1:#,##0.0000"
        },
        47: {
            instruction: "Format historical date",
            plan: "Show date from 2020 in long format",
            output: "cell:A1:v:43831:ntvf:1\nvalueformat:1:mmmm d, yyyy"
        },
        48: {
            instruction: "Format late night time",
            plan: "Display 11:00 PM with full precision",
            output: "cell:A1:v:0.958333:ntvf:1\nvalueformat:1:hh\\cmm\\css"
        },
        49: {
            instruction: "Format invoice line items",
            plan: "Apply currency format to multiple product prices in row",
            output: "cell:A1:v:1500.00:ntvf:1\ncell:B1:v:2500.00:ntvf:1\ncell:C1:v:3500.00:ntvf:1\nvalueformat:1:$#,##0.00"
        },
        50: {
            instruction: "Format shopping cart with total",
            plan: "Show item prices in currency and total with different format",
            output: "cell:A1:v:10.99:ntvf:1\ncell:A2:v:20.99:ntvf:1\ncell:A3:v:30.99:ntvf:1\ncell:A4:v:40.99:ntvf:1\ncell:A5:v:103.96:ntvf:2\nvalueformat:1:$#,##0.00\nvalueformat:2:#,##0.00"
        }
    };

    return trainingData[fileNum] || null;
}

// Get all .msc files (excluding negative examples)
const files = fs.readdirSync(formatNumberDir)
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
    const filePath = path.join(formatNumberDir, file);
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
const jsonlPath = path.join(formatNumberDir, 'format_number_training.jsonl');
const jsonlContent = trainingExamples.map(ex => JSON.stringify(ex)).join('\n');
fs.writeFileSync(jsonlPath, jsonlContent);

console.log(`\n${'='.repeat(70)}`);
console.log('CONVERSION SUMMARY');
console.log('='.repeat(70));
console.log(`Converted files: ${convertedCount}`);
console.log(`JSON files created: ${convertedCount} (in json/ directory)`);
console.log(`Training examples: ${trainingExamples.length} (in format_number_training.jsonl)`);
console.log('='.repeat(70));
