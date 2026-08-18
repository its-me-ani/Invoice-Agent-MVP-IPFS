#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const bordersDir = __dirname;
const jsonDir = path.join(bordersDir, 'json');
const jsonlFile = path.join(bordersDir, 'border_training.jsonl');

// Create json directory if it doesn't exist
if (!fs.existsSync(jsonDir)) {
    fs.mkdirSync(jsonDir);
}

// Get all .msc files
const files = fs.readdirSync(bordersDir)
    .filter(f => f.endsWith('.msc'))
    .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
    });

console.log('='.repeat(70));
console.log('CONVERTING MSC FILES TO JSON FORMAT');
console.log('='.repeat(70));
console.log(`Found ${files.length} .msc files\n`);

const trainingData = [];
let convertedCount = 0;

files.forEach((file, index) => {
    const filePath = path.join(bordersDir, file);
    const savestr = fs.readFileSync(filePath, 'utf8').trim();

    // Parse the MSC content to extract information
    const lines = savestr.split('\n');
    const cellLines = lines.filter(l => l.startsWith('cell:'));
    const borderLines = lines.filter(l => l.startsWith('border:'));
    const fileNum = parseInt(file.match(/\d+/)?.[0] || '0');

    // Analyze border usage
    const borderInfo = analyzeBorders(savestr);

    // Generate training instruction
    const training = generateTrainingData(fileNum, savestr, borderInfo);

    // Create JSON structure matching invoice format
    const jsonData = {
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

    // Write JSON file
    const jsonFileName = file.replace('.msc', '.json');
    const jsonFilePath = path.join(jsonDir, jsonFileName);
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));

    // Add to training data
    trainingData.push(training);

    convertedCount++;
    console.log(`[${index + 1}/${files.length}] ${file} -> ${jsonFileName}`);
    console.log(`  Instruction: ${training.instruction.substring(0, 60)}...`);
});

// Write JSONL file
const jsonlContent = trainingData.map(item => JSON.stringify(item)).join('\n');
fs.writeFileSync(jsonlFile, jsonlContent);

console.log('\n' + '='.repeat(70));
console.log('CONVERSION COMPLETE');
console.log('='.repeat(70));
console.log(`JSON files created: ${convertedCount}`);
console.log(`JSON directory: ${jsonDir}`);
console.log(`JSONL file: ${jsonlFile}`);
console.log(`Training examples: ${trainingData.length}`);
console.log('='.repeat(70));

/**
 * Analyze border usage in savestr
 */
function analyzeBorders(savestr) {
    const lines = savestr.split('\n');
    const info = {
        borderDefinitions: [],
        cellsWithBorders: [],
        styles: new Set(),
        colors: new Set(),
        thicknesses: new Set(),
        sides: { top: 0, right: 0, bottom: 0, left: 0, all: 0, none: 0, mixed: 0 }
    };

    // Parse border definitions
    lines.filter(l => l.startsWith('border:')).forEach(line => {
        const match = line.match(/border:(\d+):(\d+px)\s+(solid|dashed|dotted|double)\s+(.+)/);
        if (match) {
            const [_, num, thickness, style, color] = match;
            info.borderDefinitions.push({ num, thickness, style, color });
            info.styles.add(style);
            info.colors.add(color);
            info.thicknesses.add(thickness);
        }
    });

    // Parse cell borders
    lines.filter(l => l.startsWith('cell:')).forEach(line => {
        const bMatch = line.match(/b:(\d+):(\d+):(\d+):(\d+)/);
        if (bMatch) {
            const [_, top, right, bottom, left] = bMatch.map(Number);
            const coord = line.match(/cell:([A-Z]+\d+)/)?.[1];

            info.cellsWithBorders.push({ coord, top, right, bottom, left });

            // Count side usage
            if (top === 0 && right === 0 && bottom === 0 && left === 0) {
                info.sides.none++;
            } else if (top > 0 && right > 0 && bottom > 0 && left > 0 &&
                top === right && right === bottom && bottom === left) {
                info.sides.all++;
            } else {
                info.sides.mixed++;
                if (top > 0) info.sides.top++;
                if (right > 0) info.sides.right++;
                if (bottom > 0) info.sides.bottom++;
                if (left > 0) info.sides.left++;
            }
        }
    });

    return info;
}

/**
 * Generate training data based on file content
 */
function generateTrainingData(fileNum, savestr, borderInfo) {
    const examples = {
        // Single sides
        1: {
            instruction: "Create a cell with a border only on the top side",
            plan: "Define border → Apply border with b:1:0:0:0 → Top only, other sides zero",
            output: "cell:A1:t:Single Border - Top Only:b:1:0:0:0"
        },
        2: {
            instruction: "Create a cell with a border only on the right side",
            plan: "Define border → Apply border with b:0:1:0:0 → Right only, other sides zero",
            output: "cell:A1:t:Single Border - Right Only:b:0:1:0:0"
        },
        3: {
            instruction: "Create a cell with a border only on the bottom side",
            plan: "Define border → Apply border with b:0:0:1:0 → Bottom only, other sides zero",
            output: "cell:A1:t:Single Border - Bottom Only:b:0:0:1:0"
        },
        4: {
            instruction: "Create a cell with a border only on the left side",
            plan: "Define border → Apply border with b:0:0:0:1 → Left only, other sides zero",
            output: "cell:A1:t:Single Border - Left Only:b:0:0:0:1"
        },
        5: {
            instruction: "Create a cell with borders on all sides using the same style",
            plan: "Define border → Apply to all sides with b:1:1:1:1 → Same border reference for all",
            output: "cell:A1:t:All Borders - Same Style:b:1:1:1:1"
        },
        6: {
            instruction: "Create a cell with different border styles on each side",
            plan: "Define 4 borders (solid, dashed, dotted, double) → Apply with b:1:2:3:4 → Each side different",
            output: "cell:A1:t:Mixed Borders - Different Styles:b:1:2:3:4"
        },
        7: {
            instruction: "Create a cell with a thick 5px border on all sides",
            plan: "Define 5px solid border → Apply to all sides with b:1:1:1:1 → Thick uniform border",
            output: "border:1:5px solid rgb(0,0,0)"
        },
        8: {
            instruction: "Create a cell with a red dashed border on all sides",
            plan: "Define 2px dashed red border → Apply to all sides → Dashed style with red color",
            output: "border:1:2px dashed rgb(255,0,0)"
        },
        9: {
            instruction: "Create a cell with a blue dotted border on all sides",
            plan: "Define 1px dotted blue border → Apply to all sides → Dotted style pattern",
            output: "border:1:1px dotted rgb(0,0,255)"
        },
        10: {
            instruction: "Create a cell with a black double border on all sides",
            plan: "Define 3px double black border → Apply to all sides → Double line border style",
            output: "border:1:3px double rgb(0,0,0)"
        },
        11: {
            instruction: "Create a cell with a border using hex color format",
            plan: "Define border with hex color #FF5733 → Apply to all sides → Use hex instead of rgb",
            output: "border:1:2px solid #FF5733"
        },
        12: {
            instruction: "Create a cell with borders on top and bottom only",
            plan: "Define border → Apply with b:1:0:1:0 → Top and bottom, no left/right",
            output: "cell:A1:t:Top and Bottom Only:b:1:0:1:0"
        },
        13: {
            instruction: "Create a cell with borders on left and right only",
            plan: "Define border → Apply with b:0:1:0:1 → Left and right, no top/bottom",
            output: "cell:A1:t:Left and Right Only:b:0:1:0:1"
        },
        14: {
            instruction: "Create multiple cells each with borders on all sides",
            plan: "Define border once → Apply same border to all cells → Efficient border reuse",
            output: "cell:A1:t:Multiple Cells with Borders:b:1:1:1:1"
        },
        15: {
            instruction: "Create a table header row with thicker bottom border",
            plan: "Define 1px and 2px borders → Headers use b:1:1:2:1 → Data rows use lighter borders",
            output: "cell:A1:t:Table Header:b:1:1:2:1"
        },
        16: {
            instruction: "Create a cell with no borders",
            plan: "Apply b:0:0:0:0 or omit border attribute → No border definitions needed",
            output: "cell:A1:t:No Border Cell:b:0:0:0:0"
        },
        17: {
            instruction: "Create a cell with green borders on all sides",
            plan: "Define green rgb(0,255,0) border → Apply to all sides → Green color emphasis",
            output: "border:1:2px solid rgb(0,255,0)"
        },
        18: {
            instruction: "Create a cell with yellow dashed borders",
            plan: "Define yellow dashed border → Apply to all sides → Combine color and style",
            output: "border:1:2px dashed rgb(255,255,0)"
        },
        19: {
            instruction: "Create a cell with purple dotted borders",
            plan: "Define purple dotted border → Apply to all sides → Custom color with dotted style",
            output: "border:1:1px dotted rgb(128,0,128)"
        },
        20: {
            instruction: "Create a cell with cyan borders and numeric value",
            plan: "Define cyan border → Add value attribute → Combine data with formatting",
            output: "cell:A1:t:Cyan Border with Value:v:100:b:1:1:1:1"
        },
        21: {
            instruction: "Create cells with formulas and borders, thicker border for total",
            plan: "Define 1px and 2px borders → Data cells use light borders → Total uses thick border",
            output: "cell:A4:vtf:n:600:SUM(A1\\cA3):b:2:2:2:2"
        },
        22: {
            instruction: "Create an invoice table with header, data rows, and total row with borders",
            plan: "Define borders → Header row with thick borders → Data rows normal → Total row emphasized",
            output: savestr.split('\n').find(l => l.includes('Invoice Table'))
        },
        23: {
            instruction: "Create a cell with orange borders on all sides",
            plan: "Define orange rgb(255,165,0) border → Apply uniformly → Bright color accent",
            output: "border:1:3px solid rgb(255,165,0)"
        },
        24: {
            instruction: "Create a cell with pink dashed borders",
            plan: "Define pink dashed border → Apply to all sides → Soft color with dashed pattern",
            output: "border:1:2px dashed rgb(255,192,203)"
        },
        25: {
            instruction: "Create a cell with brown double borders",
            plan: "Define brown double border → Apply to all sides → Earth tone with double lines",
            output: "border:1:3px double rgb(139,69,19)"
        },
        26: {
            instruction: "Create a cell with navy blue solid borders",
            plan: "Define navy rgb(0,0,128) border → Apply to all sides → Dark blue professional look",
            output: "border:1:2px solid rgb(0,0,128)"
        },
        27: {
            instruction: "Create a cell with borders on top and left only (corner emphasis)",
            plan: "Define border → Apply with b:1:0:0:1 → Top-left corner emphasis",
            output: "cell:A1:t:Teal Border - Top Left Only:b:1:0:0:1"
        },
        28: {
            instruction: "Create a cell with borders on bottom and right only (corner emphasis)",
            plan: "Define border → Apply with b:0:1:1:0 → Bottom-right corner emphasis",
            output: "cell:A1:t:Maroon Border - Bottom Right:b:0:1:1:0"
        },
        29: {
            instruction: "Create a cell with light gray borders on all sides",
            plan: "Define light gray rgb(211,211,211) border → Apply uniformly → Subtle border",
            output: "border:1:1px solid rgb(211,211,211)"
        },
        30: {
            instruction: "Create a cell with dark gray borders on all sides",
            plan: "Define dark gray rgb(64,64,64) border → Apply uniformly → Strong contrast",
            output: "border:1:2px solid rgb(64,64,64)"
        },
        31: {
            instruction: "Create a merged cell with thick red borders",
            plan: "Define borders → Merge with colspan:2:rowspan:2 → Apply thick border b:2:2:2:2",
            output: "cell:A1:t:Merged Cell with Border:colspan:2:rowspan:2:b:2:2:2:2"
        },
        32: {
            instruction: "Create a cell with thin gray dotted borders",
            plan: "Define 1px dotted gray border → Apply to all sides → Subtle dotted pattern",
            output: "border:1:1px dotted rgb(128,128,128)"
        },
        33: {
            instruction: "Create a cell with thick red double borders",
            plan: "Define 4px double red border → Apply to all sides → Bold double-line style",
            output: "border:1:4px double rgb(255,0,0)"
        },
        34: {
            instruction: "Create a cell with different hex color borders on each side",
            plan: "Define 4 borders with hex colors → Apply b:1:2:3:4 → Each side unique hex color",
            output: "cell:A1:t:Hex Color Variants:b:1:2:3:4"
        },
        35: {
            instruction: "Create a cell with very thick 6px solid border",
            plan: "Define 6px solid border → Apply to all sides → Extra thick emphasis",
            output: "border:1:6px solid rgb(0,0,0)"
        },
        36: {
            instruction: "Create a vertical grid pattern with selective borders",
            plan: "Top cell: b:1:1:0:1 → Middle: b:0:1:0:1 → Bottom: b:0:1:1:1 → Grid effect",
            output: "cell:A1:t:Grid Pattern Top:b:1:1:0:1"
        },
        37: {
            instruction: "Create a 3x2 table grid with shared borders",
            plan: "Define border once → First column has left border → Last column closes → Rows share borders",
            output: "cell:A1:t:Col 1 Row 1:b:1:1:1:1"
        },
        38: {
            instruction: "Create a cell with white borders on colored background",
            plan: "Define white border → Add background color → White borders visible on dark bg",
            output: "border:1:2px solid rgb(255,255,255)"
        },
        39: {
            instruction: "Create a cell with silver borders on all sides",
            plan: "Define silver rgb(192,192,192) border → Apply uniformly → Metallic appearance",
            output: "border:1:2px solid rgb(192,192,192)"
        },
        40: {
            instruction: "Create a cell with gold borders on all sides",
            plan: "Define gold rgb(255,215,0) border → Apply uniformly → Luxury gold accent",
            output: "border:1:2px solid rgb(255,215,0)"
        },
        41: {
            instruction: "Create a merged cell spanning 2 columns and 4 rows with thick black borders",
            plan: "Define 2px solid border → Create merged cell with colspan:2:rowspan:4 → Apply border to all sides",
            output: "cell:B2:b:1:1:1:1:colspan:2:rowspan:4"
        },
        42: {
            instruction: "Create a table with outer and vertical column borders only",
            plan: "Top row: all borders → Data rows: left/right borders only → Bottom row: all borders → Creates column-separated grid",
            output: "cell:B2:b:1:1:1:1"
        },
        43: {
            instruction: "Create a table with vertical borders and alternating row shading",
            plan: "Define border and gray background → Apply vertical borders to all rows → Alternate rows with bg:1 → Column-separated with shading",
            output: "cell:B4:b:0:1:0:1:bg:1"
        },
        44: {
            instruction: "Create a table with merged title header and column borders",
            plan: "Merge top row across columns for title → Add borders with spacing → Apply center alignment and padding",
            output: "cell:B2:t:Invoice:b:1:1:1:1:l:1:cf:1:colspan:5"
        },
        45: {
            instruction: "Create a table with title, borders, and cell padding",
            plan: "Merge header row → Apply borders to all cells → Add 5px top/bottom padding to content rows → Center title",
            output: "layout:2:padding:5px * 5px *;vertical-align:*;"
        },
        46: {
            instruction: "Create a fully bordered grid with alternating row background colors",
            plan: "Define border and light gray color → Apply all borders to every cell → Alternate rows with bg:1 → Complete grid structure",
            output: "cell:B3:b:1:1:0:1:bg:1"
        },
        47: {
            instruction: "Create a course schedule table with color theme and merged lunch row",
            plan: "Define orange theme colors → Create header with title → Add day columns → Merge LUNCH row across all columns → Apply vertical borders",
            output: "cell:C7:t:LUNCH:b:0:1:0:0:bg:4:cf:1:colspan:4"
        },
        48: {
            instruction: "Create a comparison matrix with color-coded rows and columns",
            plan: "Define purple/lavender theme → Color-code row headers cycling through colors → Column headers with matching colors → Apply borders",
            output: "cell:B4:t:Product 1:b:0:1:0:1:bg:2:cf:2:f:2:l:3"
        },
        49: {
            instruction: "Create a table with left column borders only and alternating yellow backgrounds",
            plan: "Define two yellow shades → Apply left borders only to columns B and F → Alternate rows between colors → Checkerboard effect with borders",
            output: "cell:B2:b:0:0:0:1:bg:1"
        },
        50: {
            instruction: "Create a minimalist table with left edge borders and light blue striped rows",
            plan: "Define light blue background → Apply left borders to first column only → Alternate rows with bg:1 → Clean vertical stripe pattern",
            output: "cell:B2:b:0:0:0:1:bg:1"
        }
    };

    return examples[fileNum] || {
        instruction: `Create border styling for example ${fileNum}`,
        plan: `Define borders → Apply to cells → Use ${[...borderInfo.styles].join(', ')} styles`,
        output: savestr.split('\n').find(l => l.startsWith('cell:') || l.startsWith('border:'))
    };
}
