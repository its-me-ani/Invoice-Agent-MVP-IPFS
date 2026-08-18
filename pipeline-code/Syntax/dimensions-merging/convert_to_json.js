#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const dimensionsDir = __dirname;
const jsonDir = path.join(dimensionsDir, 'json');
const jsonlFile = path.join(dimensionsDir, 'dimensions_training.jsonl');

// Create json directory if it doesn't exist
if (!fs.existsSync(jsonDir)) {
    fs.mkdirSync(jsonDir);
}

// Get all .msc files (excluding negative examples)
const files = fs.readdirSync(dimensionsDir)
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
    const filePath = path.join(dimensionsDir, file);
    const savestr = fs.readFileSync(filePath, 'utf8').trim();

    // Parse the MSC content to extract information
    const fileNum = parseInt(file.match(/\d+/)?.[0] || '0');

    // Analyze merge usage
    const mergeInfo = analyzeMerges(savestr);

    // Generate training instruction
    const training = generateTrainingData(fileNum, savestr, mergeInfo);

    // Create JSON structure
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
 * Analyze merge usage in savestr
 */
function analyzeMerges(savestr) {
    const lines = savestr.split('\n');
    const info = {
        mergedCells: [],
        emptyCells: [],
        totalCells: 0,
        maxColspan: 0,
        maxRowspan: 0,
        mergeTypes: { horizontal: 0, vertical: 0, both: 0 }
    };

    // Parse cell lines
    lines.filter(l => l.startsWith('cell:')).forEach(line => {
        info.totalCells++;

        const coord = line.match(/cell:([A-Z]+\d+)/)?.[1];
        const colspanMatch = line.match(/colspan:(\d+)/);
        const rowspanMatch = line.match(/rowspan:(\d+)/);

        if (colspanMatch || rowspanMatch) {
            const colspan = colspanMatch ? parseInt(colspanMatch[1]) : 1;
            const rowspan = rowspanMatch ? parseInt(rowspanMatch[1]) : 1;

            info.mergedCells.push({ coord, colspan, rowspan });

            if (colspan > info.maxColspan) info.maxColspan = colspan;
            if (rowspan > info.maxRowspan) info.maxRowspan = rowspan;

            if (colspan > 1 && rowspan > 1) {
                info.mergeTypes.both++;
            } else if (colspan > 1) {
                info.mergeTypes.horizontal++;
            } else if (rowspan > 1) {
                info.mergeTypes.vertical++;
            }
        }

        // Check if it's an empty cell (merged cell placeholder)
        if (line.match(/^cell:[A-Z]+\d+:$/)) {
            info.emptyCells.push(coord);
        }
    });

    return info;
}

/**
 * Generate training data based on file content
 */
function generateTrainingData(fileNum, savestr, mergeInfo) {
    const examples = {
        1: {
            instruction: "Create a cell that spans 2 columns horizontally",
            plan: "Define cell A1 with colspan:2 → Mark B1 as empty → 2x1 horizontal merge",
            output: "cell:A1:t:Simple 2x1 Merge:colspan:2\ncell:B1:"
        },
        2: {
            instruction: "Create a cell that spans 2 rows vertically",
            plan: "Define cell A1 with rowspan:2 → Mark A2 as empty → 1x2 vertical merge",
            output: "cell:A1:t:Simple 1x2 Merge:rowspan:2\ncell:A2:"
        },
        3: {
            instruction: "Create a 2x2 merged cell block",
            plan: "Define cell A1 with colspan:2 rowspan:2 → Mark B1, A2, B2 as empty → All cells in merge area must be marked",
            output: "cell:A1:t:2x2 Grid Merge:colspan:2:rowspan:2\ncell:B1:\ncell:A2:\ncell:B2:"
        },
        4: {
            instruction: "Create a cell that spans 3 columns",
            plan: "Define cell A1 with colspan:3 → Mark B1 and C1 as empty → Wide horizontal span",
            output: "cell:A1:t:3x1 Horizontal Merge:colspan:3\ncell:B1:\ncell:C1:"
        },
        5: {
            instruction: "Create a cell that spans 3 rows",
            plan: "Define cell A1 with rowspan:3 → Mark A2 and A3 as empty → Tall vertical span",
            output: "cell:A1:t:1x3 Vertical Merge:rowspan:3\ncell:A2:\ncell:A3:"
        },
        6: {
            instruction: "Create a large 3x3 merged cell",
            plan: "Define cell A1 with colspan:3 rowspan:3 → Mark all 8 cells (B1,C1,A2,B2,C2,A3,B3,C3) as empty → Large square merge",
            output: "cell:A1:t:3x3 Large Merge:colspan:3:rowspan:3"
        },
        7: {
            instruction: "Create a header row that spans 4 columns with data cells below",
            plan: "Merge A1 across 4 columns → Add individual data cells in row 2 → Common table header pattern",
            output: "cell:A1:t:Header:colspan:4\ncell:B1:\ncell:C1:\ncell:D1:"
        },
        8: {
            instruction: "Create a label column that spans 4 rows with items beside it",
            plan: "Merge A1 down 4 rows → Add individual items in column B → Sidebar label pattern",
            output: "cell:A1:t:Label:rowspan:4\ncell:A2:\ncell:A3:\ncell:A4:"
        },
        9: {
            instruction: "Create a mixed layout with horizontal header and vertical sidebar",
            plan: "Merge A1 across 3 columns → Merge A2 down 2 rows → Multiple merges in one table",
            output: "cell:A1:t:Title:colspan:3"
        },
        10: {
            instruction: "Create a 2x2 merge that starts at A1 (not at top-left corner)",
            plan: "Position merge at A1 → colspan:2 rowspan:2 → Mark B1, A2, B2 as empty → Include surrounding cells",
            output: "cell:A1:t:2x2 at A2:colspan:2:rowspan:2"
        },
        11: {
            instruction: "Create a table with a merged row in the middle",
            plan: "Individual cells in rows 1 and 3 → Merge entire row 2 → Sandwich pattern",
            output: "cell:A2:t:Merged Row:colspan:3\ncell:B2:\ncell:C2:"
        },
        12: {
            instruction: "Create a table with a merged column in the middle",
            plan: "Individual cells in columns A and C → Merge entire column B → Vertical division",
            output: "cell:B1:t:Merged Col:rowspan:3\ncell:B2:\ncell:B3:"
        },
        13: {
            instruction: "Create a 4x2 wide merge (4 columns, 2 rows)",
            plan: "colspan:4 rowspan:2 → Mark 7 cells empty (4 in row 1, 3 in row 2) → Wide banner area",
            output: "cell:A1:t:4x2 Merge:colspan:4:rowspan:2"
        },
        14: {
            instruction: "Create a 2x4 tall merge (2 columns, 4 rows)",
            plan: "colspan:2 rowspan:4 → Mark 7 cells empty → Tall sidebar area",
            output: "cell:A1:t:2x4 Merge:colspan:2:rowspan:4"
        },
        15: {
            instruction: "Create a 4x4 grid with four 2x2 merged blocks",
            plan: "Four separate 2x2 merges at A1, C1, A3, C3 → Each marks 3 additional cells empty → Complex grid pattern",
            output: "cell:A1:t:Top Left:colspan:2:rowspan:2"
        },
        16: {
            instruction: "Create a very wide merge spanning 5 columns",
            plan: "colspan:5 → Mark B1, C1, D1, E1 as empty → Banner header",
            output: "cell:A1:t:5x1 Wide:colspan:5"
        },
        17: {
            instruction: "Create a very tall merge spanning 5 rows",
            plan: "rowspan:5 → Mark A2, A3, A4, A5 as empty → Tall sidebar",
            output: "cell:A1:t:1x5 Tall:rowspan:5"
        },
        18: {
            instruction: "Create nested header structure with main and sub-headers",
            plan: "Main header spans 5 columns → Two sub-headers span 2 and 3 columns → Hierarchical layout",
            output: "cell:A1:t:Main Header:colspan:5\ncell:A2:t:Sub 1:colspan:2\ncell:C2:t:Sub 2:colspan:3"
        },
        19: {
            instruction: "Create vertical layout with different height sections",
            plan: "Three columns with rowspan:2, rowspan:3, rowspan:2 → Asymmetric heights",
            output: "cell:A1:t:Left:rowspan:2\ncell:B1:t:Mid:rowspan:3\ncell:C1:t:Right:rowspan:2"
        },
        20: {
            instruction: "Create a centered 3x3 merge with border cells",
            plan: "3x3 merge at A1 → Add cells in column D and row 4 → Center focus with periphery",
            output: "cell:A1:t:Center Merge:colspan:3:rowspan:3"
        },
        21: {
            instruction: "Create invoice-style header with item description merge",
            plan: "Header spans 6 columns → Item column spans 3 columns in row 2 → Invoice table structure",
            output: "cell:A1:t:Invoice Header:colspan:6\ncell:B2:t:Item:colspan:3"
        },
        22: {
            instruction: "Create company header with logo, info, and invoice details",
            plan: "Logo spans 3 rows → Company info and invoice details beside it → Business document layout",
            output: "cell:A1:t:Logo:rowspan:3"
        },
        23: {
            instruction: "Create quarterly report header with merged quarter labels",
            plan: "Q1 spans 3 columns → Q2 spans 3 columns → Monthly columns below → Calendar structure",
            output: "cell:A1:t:Q1:colspan:3\ncell:D1:t:Q2:colspan:3"
        },
        24: {
            instruction: "Create contact table with merged name and contact columns",
            plan: "Name column spans 2 cells → Contact column spans 2 cells → Grouped information",
            output: "cell:B1:t:Name:colspan:2\ncell:D1:t:Contact:colspan:2"
        },
        25: {
            instruction: "Create pivot table style with merged row and column headers",
            plan: "Category and Product span 2 rows → Sales spans 2 columns → Cross-reference structure",
            output: "cell:A1:t:Category:rowspan:2\ncell:B1:t:Product:rowspan:2\ncell:C1:t:Sales:colspan:2"
        },
        26: {
            instruction: "Create complex table with mixed merges in different rows",
            plan: "4x2 merge at top → 2x1 merge in row 3 → Regular cells in row 4 → Multi-level structure",
            output: "cell:A1:t:Complex Table:colspan:4:rowspan:2"
        },
        27: {
            instruction: "Create weekly calendar header spanning 7 days",
            plan: "Week label spans all 7 columns → Individual day names below → Calendar header",
            output: "cell:A1:t:Week 1:colspan:7"
        },
        28: {
            instruction: "Create daily schedule with time label spanning multiple hours",
            plan: "Day label spans 7 rows → Time slots beside it → Schedule sidebar",
            output: "cell:A1:t:Mon:rowspan:7"
        },
        29: {
            instruction: "Create dashboard layout with header and metrics section",
            plan: "Dashboard header spans 5 columns → Metrics label spans 3 rows → Dashboard structure",
            output: "cell:A1:t:Dashboard:colspan:5:rowspan:1\ncell:A2:t:Metrics:rowspan:3"
        },
        30: {
            instruction: "Create page layout with title, content, sidebar, and footer",
            plan: "Title 3x2 → Content 2x1 → Sidebar 1x2 → Footer mixed → Complete page layout",
            output: "cell:A1:t:Title Area:colspan:3:rowspan:2"
        },
        31: {
            instruction: "Create full-width banner spanning 8 columns",
            plan: "Single cell spanning entire width → colspan:8 → Full banner",
            output: "cell:A1:t:Full Row:colspan:8"
        },
        32: {
            instruction: "Create full-height sidebar spanning 8 rows",
            plan: "Single cell spanning entire height → rowspan:8 → Full sidebar",
            output: "cell:A1:t:Full Col:rowspan:8"
        },
        33: {
            instruction: "Create nested structure with three 2x2 blocks side by side",
            plan: "6 columns total → Three 2x2 merges at A2, C2, E2 → Header spans all 6 → Nested blocks",
            output: "cell:A1:t:Nested Structure:colspan:6"
        },
        34: {
            instruction: "Create report with title, sections, and total footer",
            plan: "Title spans 4 columns → Two section headers span 2 each → Total footer spans 4 → Report structure",
            output: "cell:A1:t:Report Title:colspan:4\ncell:A2:t:Section 1:colspan:2\ncell:C2:t:Section 2:colspan:2"
        },
        35: {
            instruction: "Create framed content with side, top, and bottom bars",
            plan: "Side spans 4 rows → Top and Bottom span 3 columns → Content in middle → Frame layout",
            output: "cell:A1:t:Side:rowspan:4\ncell:B1:t:Top:colspan:3\ncell:B4:t:Bottom:colspan:3"
        },
        36: {
            instruction: "Create maximum 4x4 merge covering entire area",
            plan: "Single merge spanning 4 columns and 4 rows → All 15 other cells empty → Full coverage",
            output: "cell:A1:t:Matrix 4x4:colspan:4:rowspan:4"
        },
        37: {
            instruction: "Create header with two sections and merged bottom",
            plan: "Two 2x1 headers → Individual sub-items → Merged footer spans 4 → Hierarchical structure",
            output: "cell:A1:t:H1:colspan:2\ncell:C1:t:H2:colspan:2\ncell:A3:t:Merged Bottom:colspan:4"
        },
        38: {
            instruction: "Create table with vertical sections merged at top and horizontal footer",
            plan: "Four 1x2 vertical sections → Merged footer spans all 4 columns → Column grouping",
            output: "cell:A1:t:V1:rowspan:2\ncell:B1:t:V2:rowspan:2\ncell:C1:t:V3:rowspan:2\ncell:D1:t:V4:rowspan:2"
        },
        39: {
            instruction: "Create product table with merged title and name columns",
            plan: "Title spans 5 columns → Name column spans 2 cells → Product data layout",
            output: "cell:A1:t:Product Table:colspan:5\ncell:B2:t:Name:colspan:2"
        },
        40: {
            instruction: "Create schedule grid with time label, event merges, and summary",
            plan: "Time spans 3 rows → Two event headers span 2 columns each → Summary spans 4 → Complex schedule",
            output: "cell:A1:t:Schedule Grid:colspan:5\ncell:A2:t:Time:rowspan:3\ncell:B2:t:Event 1:colspan:2\ncell:D2:t:Event 2:colspan:2"
        },
        41: {
            instruction: "Create annual calendar header spanning all 12 months",
            plan: "Year label spans 12 columns → Individual month names below → Full year header",
            output: "cell:A1:t:Year 2024:colspan:12"
        },
        42: {
            instruction: "Create hourly schedule sidebar spanning 12 hours",
            plan: "Hours label spans 12 rows → Individual hour slots beside → Full day schedule",
            output: "cell:A1:t:Hours:rowspan:12"
        },
        43: {
            instruction: "Create large 5x5 merged central area",
            plan: "Single cell spanning 5 columns and 5 rows → 24 cells marked empty → Maximum square merge",
            output: "cell:A1:t:5x5 Center:colspan:5:rowspan:5"
        },
        44: {
            instruction: "Create wide banner spanning 10 columns",
            plan: "Ultra-wide merge across 10 columns → Full-width advertisement area",
            output: "cell:A1:t:Banner:colspan:10"
        },
        45: {
            instruction: "Create tall sidebar spanning 10 rows",
            plan: "Ultra-tall merge across 10 rows → Navigation sidebar",
            output: "cell:A1:t:Sidebar:rowspan:10"
        },
        46: {
            instruction: "Create layout with top bar, center area, and bottom bar",
            plan: "Top spans 3 columns → Center 2x2 merge → Bottom spans 3 → Sandwich layout",
            output: "cell:A1:t:Top:colspan:3\ncell:B2:t:Center:colspan:2:rowspan:2\ncell:A4:t:Bottom:colspan:3"
        },
        47: {
            instruction: "Create side-by-side meeting room layout with 3x2 blocks",
            plan: "Two 3x2 merges side by side → Six columns total → Room allocation layout",
            output: "cell:A1:t:Meeting Room A:colspan:3:rowspan:2\ncell:D1:t:Meeting Room B:colspan:3:rowspan:2"
        },
        48: {
            instruction: "Create department structure with vertical sections and teams",
            plan: "Two department labels span 3 rows each → Team names beside each → Org chart style",
            output: "cell:A1:t:Dept A:rowspan:3\ncell:C1:t:Dept B:rowspan:3"
        },
        49: {
            instruction: "Create report with grand header, sections, and footer",
            plan: "Grand header spans 6 → Two sections span 3 each → Footer spans 6 → Full document",
            output: "cell:A1:t:Grand Header:colspan:6:rowspan:1\ncell:A2:t:Section A:colspan:3\ncell:D2:t:Section B:colspan:3"
        },
        50: {
            instruction: "Create complex web layout with nav, header, main, sidebar, footer",
            plan: "Nav spans 4 rows → Header spans 5 columns → Main 3x2 → Side 2x2 → Footer 5 → Complete layout",
            output: "cell:A1:t:Complex Layout:colspan:6\ncell:A2:t:Nav:rowspan:4\ncell:B2:t:Header:colspan:5\ncell:B3:t:Main:colspan:3:rowspan:2"
        },
        51: {
            instruction: "Create simple table with margin and varying column widths starting from B2",
            plan: "Reserve column A (30px) for margin → Start design at B2 → Apply different widths to columns B, C, D → Proper document layout",
            output: "cell:B2:t:Header\ncol:A:w:30\ncol:B:w:100\ncol:C:w:200\ncol:D:w:150"
        },
        52: {
            instruction: "Create product table with left margin and wide description column starting at B2",
            plan: "Column A margin (30px) → Start at B2 with merged title → Description column (300px) wider than others → Professional spacing",
            output: "cell:B2:t:Title:colspan:3\ncol:A:w:30\ncol:B:w:80\ncol:C:w:300\ncol:D:w:100\ncol:E:w:80"
        },
        53: {
            instruction: "Create dashboard with margin and equal metric columns from B2",
            plan: "Left margin column A (25px) → Begin at B2 → Four equal-width metric columns (120px each) → Balanced dashboard",
            output: "cell:B2:t:Dashboard:colspan:4\ncol:A:w:25\ncol:B:w:120\ncol:C:w:120\ncol:D:w:120\ncol:E:w:120"
        },
        54: {
            instruction: "Create contact list with margin and extra-wide email column starting B2",
            plan: "Margin in column A (30px) → Start content at B2 → Email column (250px) much wider for addresses → Name columns (120px) → ID narrow (60px)",
            output: "cell:B2:t:Contact List:colspan:5\ncol:A:w:30\ncol:B:w:60\ncol:C:w:120\ncol:D:w:120\ncol:E:w:250\ncol:F:w:120"
        },
        55: {
            instruction: "Create invoice with margin and wide description area from B2",
            plan: "Column A margin (30px) → Design starts B2 → Description column (300px) for product details → Narrow columns for qty/price",
            output: "cell:B2:t:Invoice\ncol:A:w:30\ncol:B:w:300\ncol:C:w:80\ncol:D:w:100"
        },
        56: {
            instruction: "Create weekly schedule with margin and consistent day columns from B2",
            plan: "Margin column A (30px) → Start at B2 → Day columns (100px) consistent → First day column (80px) for labels",
            output: "cell:B2:t:Schedule:colspan:6\ncol:A:w:30\ncol:B:w:80\ncol:C:w:100\ncol:D:w:100\ncol:E:w:100\ncol:F:w:100\ncol:G:w:80"
        },
        57: {
            instruction: "Create report with margin, merged title, and equal section widths from B2",
            plan: "Column A margin (30px) → Start B2 with 2x2 merged title → Four equal sections (150px each) → Structured report",
            output: "cell:B2:t:Report Title:colspan:4:rowspan:2\ncol:A:w:30\ncol:B:w:150\ncol:C:w:150\ncol:D:w:150\ncol:E:w:150"
        },
        58: {
            instruction: "Create web layout with margin, narrow nav, and wide content from B2",
            plan: "Margin column A (30px) → Nav sidebar B (120px) → Main content columns (200px each) → Standard web layout margins",
            output: "cell:B2:t:Navigation:rowspan:4\ncol:A:w:30\ncol:B:w:120\ncol:C:w:200\ncol:D:w:200\ncol:E:w:200"
        },
        59: {
            instruction: "Create quarterly data table with margin and uniform columns from B2",
            plan: "Left margin A (30px) → Content from B2 → Label column B (100px) → Quarter columns equal width (100px) → Grid alignment",
            output: "cell:B2:t:Quarterly Data:colspan:5\ncol:A:w:30\ncol:B:w:100\ncol:C:w:100\ncol:D:w:100\ncol:E:w:100\ncol:F:w:100"
        },
        60: {
            instruction: "Create company profile with margin and manager name column from B2",
            plan: "Margin column A (30px) → Start B2 → Department (150px), Manager names (180px wider for full names), Team size (120px) → Professional document",
            output: "cell:B2:t:Company Profile:colspan:3:rowspan:2\ncol:A:w:30\ncol:B:w:150\ncol:C:w:180\ncol:D:w:120"
        }
    };

    const data = examples[fileNum] || {
        instruction: `Work with merged cells and dimensions in a spreadsheet`,
        plan: `Analyze merge requirements → Apply colspan/rowspan → Mark affected cells as empty`,
        output: savestr.split('\n')[1] // First cell line
    };

    return {
        instruction: data.instruction,
        input: "",
        output: savestr,
        plan: data.plan
    };
}
