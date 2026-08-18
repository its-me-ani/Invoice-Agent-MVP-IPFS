#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const fontsDir = __dirname;
const jsonDir = path.join(fontsDir, 'json');
const jsonlFile = path.join(fontsDir, 'font_training.jsonl');

// Create json directory if it doesn't exist
if (!fs.existsSync(jsonDir)) {
    fs.mkdirSync(jsonDir);
}

// Get all .msc files (excluding negative examples)
const files = fs.readdirSync(fontsDir)
    .filter(f => f.endsWith('.msc') && !f.startsWith('neg-'))
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
    const filePath = path.join(fontsDir, file);
    const savestr = fs.readFileSync(filePath, 'utf8').trim();

    // Parse the MSC content to extract information
    const fileNum = parseInt(file.match(/\d+/)?.[0] || '0');

    // Analyze font usage
    const fontInfo = analyzeFonts(savestr);

    // Generate training instruction
    const training = generateTrainingData(fileNum, savestr, fontInfo);

    // Create JSON structure matching Formales format
    const jsonData = {
        filename: file,
        content: savestr,
        lines: savestr.split('\n').filter(l => l.trim() !== ''),
        cellCount: savestr.split('\n').filter(l => l.startsWith('cell:')).length,
        fontCount: savestr.split('\n').filter(l => l.startsWith('font:')).length
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
 * Analyze font usage in savestr
 */
function analyzeFonts(savestr) {
    const lines = savestr.split('\n');
    const info = {
        fontDefinitions: [],
        cellsWithFonts: [],
        styles: new Set(),
        weights: new Set(),
        sizes: new Set(),
        families: new Set()
    };

    // Parse font definitions
    lines.filter(l => l.startsWith('font:')).forEach(line => {
        const match = line.match(/font:(\d+):(\S+)\s+(\S+)\s+(\S+)\s+(.+)/);
        if (match) {
            const [_, num, style, weight, size, family] = match;
            info.fontDefinitions.push({ num, style, weight, size, family });
            info.styles.add(style);
            info.weights.add(weight);
            info.sizes.add(size);
            info.families.add(family);
        }
    });

    // Parse cell fonts
    lines.filter(l => l.startsWith('cell:')).forEach(line => {
        const fMatch = line.match(/f:(\d+)/);
        if (fMatch) {
            const fontRef = fMatch[1];
            const coord = line.match(/cell:([A-Z]+\d+)/)?.[1];
            info.cellsWithFonts.push({ coord, fontRef });
        }
    });

    return info;
}

/**
 * Generate training data based on file content
 */
function generateTrainingData(fileNum, savestr, fontInfo) {
    const examples = {
        1: {
            instruction: "Create a cell with bold text",
            plan: "Define font with bold weight → Apply font with f:1 → Use 'normal bold 12pt Arial'",
            output: "cell:A1:t:Bold Text:f:1"
        },
        2: {
            instruction: "Create a cell with italic text",
            plan: "Define font with italic style → Apply font with f:1 → Use 'italic normal 12pt Arial'",
            output: "cell:A1:t:Italic Text:f:1"
        },
        3: {
            instruction: "Create a cell with bold italic text",
            plan: "Define font with both italic style and bold weight → Apply font → Combine style and weight",
            output: "font:1:italic bold 12pt Arial"
        },
        4: {
            instruction: "Create a cell with large 18pt font",
            plan: "Define font with 18pt size → Apply to cell → Larger text emphasis",
            output: "font:1:normal normal 18pt Arial"
        },
        5: {
            instruction: "Create a cell with small 8pt font",
            plan: "Define font with 8pt size → Apply to cell → Smaller text for fine print",
            output: "font:1:normal normal 8pt Arial"
        },
        6: {
            instruction: "Create a cell with Times New Roman font",
            plan: "Define font with Times New Roman family → Apply to cell → Serif font style",
            output: "font:1:normal normal 12pt 'Times New Roman',serif"
        },
        7: {
            instruction: "Create a cell with Verdana font",
            plan: "Define font with Verdana family → Apply to cell → Sans-serif web-safe font",
            output: "font:1:normal normal 12pt Verdana,sans-serif"
        },
        8: {
            instruction: "Create a cell with Courier New monospace font",
            plan: "Define font with Courier New family → Apply to cell → Fixed-width font for code",
            output: "font:1:normal normal 12pt 'Courier New',monospace"
        },
        9: {
            instruction: "Create a cell with x-large named size",
            plan: "Define font with x-large named size → Apply to cell → Use named size instead of point size",
            output: "font:1:normal normal x-large Arial"
        },
        10: {
            instruction: "Create a cell with medium named size",
            plan: "Define font with medium named size → Apply to cell → Standard medium size",
            output: "font:1:normal normal medium Arial"
        },
        11: {
            instruction: "Create a cell with small named size",
            plan: "Define font with small named size → Apply to cell → Named small size",
            output: "font:1:normal normal small Arial"
        },
        12: {
            instruction: "Create a cell with large named size",
            plan: "Define font with large named size → Apply to cell → Named large size",
            output: "font:1:normal normal large Arial"
        },
        13: {
            instruction: "Create a cell with 14px font size",
            plan: "Define font with pixel-based size → Apply to cell → Use px instead of pt",
            output: "font:1:normal normal 14px Arial"
        },
        14: {
            instruction: "Create a cell with bold Helvetica font",
            plan: "Define font with bold weight and Helvetica family → Apply to cell → Sans-serif bold",
            output: "font:1:normal bold 12pt Helvetica,sans-serif"
        },
        15: {
            instruction: "Create a cell with large bold text",
            plan: "Define font with 16pt size and bold weight → Apply to cell → Emphasized large text",
            output: "font:1:normal bold 16pt Arial"
        },
        16: {
            instruction: "Create a cell with large italic text",
            plan: "Define font with 16pt size and italic style → Apply to cell → Large emphasized italic",
            output: "font:1:italic normal 16pt Arial"
        },
        17: {
            instruction: "Create a cell with small bold italic text",
            plan: "Define font with 9pt, bold, and italic → Apply to cell → Small emphasized text",
            output: "font:1:italic bold 9pt Arial"
        },
        18: {
            instruction: "Create a cell with wildcard style (use default)",
            plan: "Define font with * for style → Bold weight specified → Use default style",
            output: "font:1:* bold 12pt Arial"
        },
        19: {
            instruction: "Create a cell with wildcard weight (use default)",
            plan: "Define font with * for weight → Italic style specified → Use default weight",
            output: "font:1:italic * 12pt Arial"
        },
        20: {
            instruction: "Create a cell with wildcard size (use default)",
            plan: "Define font with * for size → Style and weight specified → Use default size",
            output: "font:1:normal bold * Arial"
        },
        21: {
            instruction: "Create a cell with wildcard family (use default)",
            plan: "Define font with * for family → Other properties specified → Use default font family",
            output: "font:1:normal bold 12pt *"
        },
        22: {
            instruction: "Create a cell with all wildcards (use all defaults)",
            plan: "Define font with all * → Apply to cell → Use all default values",
            output: "font:1:* * * *"
        },
        23: {
            instruction: "Create multiple cells with different font styles",
            plan: "Define 2 fonts → Apply font 1 to first cell → Apply font 2 to second cell → Different styling",
            output: "cell:A1:t:Multiple Fonts:f:1"
        },
        24: {
            instruction: "Create a document structure with header, body, and footer fonts",
            plan: "Define 3 fonts (large bold, normal, small italic) → Apply to respective cells → Document hierarchy",
            output: "font:1:normal bold 18pt Arial"
        },
        25: {
            instruction: "Create a cell with Georgia serif font",
            plan: "Define font with Georgia family → Apply to cell → Classic serif font",
            output: "font:1:normal normal 12pt Georgia,serif"
        },
        26: {
            instruction: "Create a cell with Tahoma sans-serif font",
            plan: "Define font with Tahoma family → Apply to cell → Clean sans-serif",
            output: "font:1:normal normal 12pt Tahoma,sans-serif"
        },
        27: {
            instruction: "Create a cell with Trebuchet MS font",
            plan: "Define font with Trebuchet MS family → Apply to cell → Rounded sans-serif",
            output: "font:1:normal normal 12pt 'Trebuchet MS',sans-serif"
        },
        28: {
            instruction: "Create a cell with bold Impact font",
            plan: "Define font with Impact family and bold weight → Apply to cell → Heavy display font",
            output: "font:1:normal bold 14pt Impact,sans-serif"
        },
        29: {
            instruction: "Create a cell with Comic Sans MS font",
            plan: "Define font with Comic Sans family → Apply to cell → Casual cursive font",
            output: "font:1:normal normal 12pt 'Comic Sans MS',cursive"
        },
        30: {
            instruction: "Create a cell with very small 6pt font",
            plan: "Define font with 6pt size → Apply to cell → Minimum readable size",
            output: "font:1:normal normal 6pt Arial"
        },
        31: {
            instruction: "Create a cell with 24pt font",
            plan: "Define font with 24pt size → Apply to cell → Large heading size",
            output: "font:1:normal normal 24pt Arial"
        },
        32: {
            instruction: "Create a cell with 36pt font",
            plan: "Define font with 36pt size → Apply to cell → Extra large title",
            output: "font:1:normal normal 36pt Arial"
        },
        33: {
            instruction: "Create a cell with 48pt font",
            plan: "Define font with 48pt size → Apply to cell → Display size text",
            output: "font:1:normal normal 48pt Arial"
        },
        34: {
            instruction: "Create a cell with 72pt font",
            plan: "Define font with 72pt size → Apply to cell → Maximum standard size",
            output: "font:1:normal normal 72pt Arial"
        },
        35: {
            instruction: "Create a cell with 8px font size",
            plan: "Define font with 8px size → Apply to cell → Minimum pixel size",
            output: "font:1:normal normal 8px Arial"
        },
        36: {
            instruction: "Create a cell with 20px font size",
            plan: "Define font with 20px size → Apply to cell → Medium pixel-based size",
            output: "font:1:normal normal 20px Arial"
        },
        37: {
            instruction: "Create a cell with 36px font size",
            plan: "Define font with 36px size → Apply to cell → Large pixel-based size",
            output: "font:1:normal normal 36px Arial"
        },
        38: {
            instruction: "Create a table with bold headers and normal data rows",
            plan: "Define 2 fonts → Bold for headers → Normal for data → Apply to respective rows",
            output: "cell:A1:t:Table Header:f:1"
        },
        39: {
            instruction: "Create a multi-level document with different font sizes",
            plan: "Define 4 fonts (title 20pt, subtitle 16pt, content 12pt, note 10pt) → Apply hierarchy",
            output: "font:1:normal bold 20pt Arial"
        },
        40: {
            instruction: "Create a cell with Arial Helvetica sans-serif font stack",
            plan: "Define font with fallback stack → Apply to cell → Multiple font fallbacks",
            output: "font:1:normal normal 12pt Arial,Helvetica,sans-serif"
        },
        41: {
            instruction: "Create a cell with bold Times New Roman with fallbacks",
            plan: "Define font with Times family and fallbacks → Bold weight → Serif font stack",
            output: "font:1:normal bold 14pt 'Times New Roman',Times,serif"
        },
        42: {
            instruction: "Create a cell with italic Courier with monospace fallback",
            plan: "Define font with Courier family and fallbacks → Italic style → Monospace stack",
            output: "font:1:italic normal 12pt 'Courier New',Courier,monospace"
        },
        43: {
            instruction: "Create a cell with bold italic large Verdana",
            plan: "Define font with Verdana, 18pt, bold, and italic → Apply all styles → Maximum emphasis",
            output: "font:1:italic bold 18pt Verdana,Geneva,sans-serif"
        },
        44: {
            instruction: "Create a form with bold labels and monospace input font",
            plan: "Define 2 fonts → Bold Arial for labels → Courier for input values → Different purposes",
            output: "font:1:normal bold 12pt Arial"
        },
        45: {
            instruction: "Create priority levels with different bold and size",
            plan: "Define 3 fonts → High: 14pt bold → Medium: 12pt bold → Low: 10pt normal → Visual hierarchy",
            output: "font:1:normal bold 14pt Arial"
        },
        46: {
            instruction: "Create a cell with Palatino font",
            plan: "Define font with Palatino family → Apply to cell → Classic serif",
            output: "font:1:normal normal 12pt 'Palatino Linotype',Palatino,serif"
        },
        47: {
            instruction: "Create a cell with Garamond font",
            plan: "Define font with Garamond family → Apply to cell → Traditional serif",
            output: "font:1:normal normal 12pt Garamond,serif"
        },
        48: {
            instruction: "Create a book layout with title, chapter, and body fonts",
            plan: "Define 3 fonts → Title: 24pt bold Georgia → Chapter: 16pt bold italic → Body: 12pt normal",
            output: "font:1:normal bold 24pt Georgia,serif"
        },
        49: {
            instruction: "Create code snippet with italic comment and normal code font",
            plan: "Define 2 Courier fonts → Italic 10pt for comments → Normal 12pt for code → Code formatting",
            output: "font:1:italic normal 10pt 'Courier New',monospace"
        },
        50: {
            instruction: "Create a company header with large Impact logo, italic tagline, and small contact info",
            plan: "Define 3 fonts → 32pt bold Impact → 14pt italic Arial → 10pt Verdana → Company branding",
            output: "font:1:normal bold 32pt Impact,sans-serif"
        }
    };

    return examples[fileNum] || {
        instruction: `Create font styling for example ${fileNum}`,
        plan: `Define fonts → Apply to cells → Use ${[...fontInfo.families].join(', ')} families`,
        output: savestr.split('\n').find(l => l.startsWith('cell:') || l.startsWith('font:'))
    };
}
