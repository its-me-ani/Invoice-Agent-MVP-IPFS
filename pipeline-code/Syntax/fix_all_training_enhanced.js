#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Folders to process
const folders = [
    'Alignments',
    'Borders',
    'dimensions-merging',
    'Fonts',
    'Formales',
    'Format Number',
    'Format Text',
    'Links',
    'Multiline Input',
    'Paddings'
];

// Enhanced instruction generators that analyze the savestr content
function generateInstruction(folderName, savestr, fileNum) {
    switch (folderName) {
        case 'Alignments':
            if (savestr.includes('cellformat') && savestr.includes(':left')) return 'Create cell with left horizontal alignment';
            if (savestr.includes('cellformat') && savestr.includes(':center')) return 'Create cell with center horizontal alignment';
            if (savestr.includes('cellformat') && savestr.includes(':right')) return 'Create cell with right horizontal alignment';
            if (savestr.includes('vertical-align:top') && !savestr.includes('cellformat')) return 'Create cell with top vertical alignment';
            if (savestr.includes('vertical-align:middle') && !savestr.includes('cellformat')) return 'Create cell with middle vertical alignment';
            if (savestr.includes('vertical-align:bottom') && !savestr.includes('cellformat')) return 'Create cell with bottom vertical alignment';
            if (savestr.includes('cellformat') && savestr.includes('vertical-align')) {
                const hAlign = savestr.includes(':left') ? 'left' : savestr.includes(':center') ? 'center' : 'right';
                const vAlign = savestr.includes(':top') ? 'top' : savestr.includes(':middle') ? 'middle' : 'bottom';
                return `Create cell with ${hAlign} horizontal and ${vAlign} vertical alignment`;
            }
            return `Create cell with alignment configuration ${fileNum}`;

        case 'Borders':
            const borderPattern = savestr.match(/b:(\d):(\d):(\d):(\d)/);
            if (borderPattern) {
                const [_, top, right, bottom, left] = borderPattern;
                const sides = [];
                if (top !== '0') sides.push('top');
                if (right !== '0') sides.push('right');
                if (bottom !== '0') sides.push('bottom');
                if (left !== '0') sides.push('left');

                if (sides.length === 0) return 'Create cell with no borders';
                if (sides.length === 4) {
                    if (top === right && right === bottom && bottom === left) {
                        return 'Create cell with borders on all sides using the same style';
                    }
                    return 'Create cell with different border styles on each side';
                }
                if (sides.length === 1) return `Create cell with border only on the ${sides[0]} side`;
                return `Create cell with borders on ${sides.join(' and ')} sides`;
            }
            // Check for border definition
            if (savestr.match(/border:\d+:\d+px (solid|dashed|dotted|double)/)) {
                const style = savestr.match(/(solid|dashed|dotted|double)/)[1];
                const width = savestr.match(/(\d+)px/)[1];
                const colorMatch = savestr.match(/rgb\((\d+),(\d+),(\d+)\)/);
                if (colorMatch) {
                    const [_, r, g, b] = colorMatch.map(Number);
                    if (r > 200 && g < 50 && b < 50) return `Create cell with red ${style} border`;
                    if (r < 50 && g < 50 && b > 200) return `Create cell with blue ${style} border`;
                    if (r < 50 && g > 200 && b < 50) return `Create cell with green ${style} border`;
                }
                return `Create cell with ${width}px ${style} border`;
            }
            return `Create cell with border configuration ${fileNum}`;

        case 'dimensions-merging':
            const colspanMatch = savestr.match(/colspan:(\d+)/);
            const rowspanMatch = savestr.match(/rowspan:(\d+)/);
            const colspan = colspanMatch ? parseInt(colspanMatch[1]) : 1;
            const rowspan = rowspanMatch ? parseInt(rowspanMatch[1]) : 1;

            if (colspan > 1 && rowspan > 1) {
                return `Create ${colspan}x${rowspan} merged cell block`;
            }
            if (colspan > 1) {
                return `Create cell spanning ${colspan} columns`;
            }
            if (rowspan > 1) {
                return `Create cell spanning ${rowspan} rows`;
            }
            return `Create merged cell configuration ${fileNum}`;

        case 'Fonts':
            const fontMatch = savestr.match(/font:\d+:([^\n]+)/);
            if (fontMatch) {
                const fontDef = fontMatch[1];
                let desc = [];
                if (fontDef.includes('bold')) desc.push('bold');
                if (fontDef.includes('italic') && fontDef.startsWith('italic')) desc.push('italic');
                const sizeMatch = fontDef.match(/(\d+)(pt|px)/);
                if (sizeMatch) desc.push(`${sizeMatch[1]}${sizeMatch[2]}`);
                const fontFamily = fontDef.match(/(?:pt|px|large|medium|small|x-large)\s+([^,\n]+)/);
                if (fontFamily && fontFamily[1] !== 'Arial' && fontFamily[1] !== '*') {
                    desc.push(fontFamily[1].replace(/'/g, ''));
                }
                if (desc.length > 0) {
                    return `Create cell with ${desc.join(' ')} font`;
                }
            }
            return `Create cell with font configuration ${fileNum}`;

        case 'Formales':
            // Check for specific functions
            if (savestr.includes(':SUM(')) return 'Calculate sum of cell range using SUM function';
            if (savestr.includes(':AVERAGE(')) return 'Calculate average of cell range using AVERAGE function';
            if (savestr.includes(':MIN(')) return 'Find minimum value in cell range using MIN function';
            if (savestr.includes(':MAX(')) return 'Find maximum value in cell range using MAX function';
            if (savestr.includes(':COUNT(') && !savestr.includes('COUNTA') && !savestr.includes('COUNTIF')) return 'Count numeric values in range using COUNT function';
            if (savestr.includes(':COUNTA(')) return 'Count non-empty cells in range using COUNTA function';
            if (savestr.includes(':COUNTIF(')) return 'Count cells matching criteria using COUNTIF function';
            if (savestr.includes(':SUMIF(')) return 'Sum cells matching criteria using SUMIF function';
            if (savestr.includes(':IF(')) return 'Create conditional IF formula that returns different values based on condition';
            if (savestr.includes(':AND(')) return 'Check if all conditions are true using AND function';
            if (savestr.includes(':OR(')) return 'Check if any condition is true using OR function';
            if (savestr.includes(':NOT(')) return 'Negate boolean value using NOT function';
            if (savestr.includes(':POWER(')) return 'Calculate power/exponent using POWER function';
            if (savestr.includes(':SQRT(')) return 'Calculate square root using SQRT function';
            if (savestr.includes(':ABS(')) return 'Get absolute value using ABS function';
            if (savestr.includes(':ROUND(')) return 'Round number to specified decimals using ROUND function';
            if (savestr.includes(':INT(')) return 'Get integer part of number using INT function';
            if (savestr.includes(':MOD(')) return 'Calculate modulus remainder using MOD function';
            if (savestr.includes(':PI()')) return 'Use mathematical constant PI in calculation';
            if (savestr.includes(':UPPER(')) return 'Convert text to uppercase using UPPER function';
            if (savestr.includes(':LOWER(')) return 'Convert text to lowercase using LOWER function';
            if (savestr.includes(':PROPER(')) return 'Convert text to proper case using PROPER function';
            if (savestr.includes(':LEN(')) return 'Get text length using LEN function';
            if (savestr.includes(':LEFT(')) return 'Extract leftmost characters using LEFT function';
            if (savestr.includes(':RIGHT(')) return 'Extract rightmost characters using RIGHT function';
            if (savestr.includes(':MID(')) return 'Extract middle portion of text using MID function';
            if (savestr.includes(':SUBSTITUTE(')) return 'Replace text within string using SUBSTITUTE function';
            if (savestr.includes(':FIND(')) return 'Find position of substring using FIND function';
            if (savestr.includes(':CONCATENATE(') || savestr.includes('&')) return 'Concatenate text strings using & operator';
            if (savestr.includes(':TODAY()')) return 'Get current date using TODAY function';
            if (savestr.includes(':NOW()')) return 'Get current date and time using NOW function';
            if (savestr.includes(':DATE(')) return 'Create date from year, month, day using DATE function';
            if (savestr.includes(':YEAR(')) return 'Extract year from date using YEAR function';
            if (savestr.includes(':MONTH(')) return 'Extract month from date using MONTH function';
            if (savestr.includes(':DAY(')) return 'Extract day from date using DAY function';
            if (savestr.includes(':HOUR(')) return 'Extract hour from time using HOUR function';
            if (savestr.includes(':PMT(')) return 'Calculate loan payment using PMT function';
            if (savestr.includes(':CHOOSE(')) return 'Select value from list by index using CHOOSE function';
            if (savestr.includes(':TRUE()')) return 'Use boolean TRUE value in formula';
            if (savestr.includes(':FALSE()')) return 'Use boolean FALSE value in formula';
            // Check for basic operators
            if (savestr.match(/:A\d+\+A\d+/)) return 'Add two cell values using + operator';
            if (savestr.match(/:A\d+-A\d+/)) return 'Subtract two cell values using - operator';
            if (savestr.match(/:A\d+\*A\d+/) || savestr.match(/:A\d+\*B\d+/)) return 'Multiply cell values using * operator';
            if (savestr.match(/:A\d+\/A\d+/)) return 'Divide cell values using / operator';
            // Check for comparison operators
            if (savestr.includes(':A') && savestr.includes('>A')) return 'Compare if one value is greater than another';
            if (savestr.includes(':A') && savestr.includes('=A')) return 'Check if two values are equal';
            // Complex formulas
            if (savestr.match(/\*.*[+-].*\//) || savestr.match(/\/.*[+-].*\*/)) return 'Calculate using multiple arithmetic operations';
            return `Create formula with function or calculation ${fileNum}`;

        case 'Format Number':
            if (savestr.includes('#,##0.00')) return 'Format number with comma separators and two decimal places';
            if (savestr.includes('#,##0.0000')) return 'Format number with comma separators and four decimal places';
            if (savestr.includes('#,##0') && !savestr.includes('.')) return 'Format number with comma separators';
            if (savestr.includes('0.00%')) return 'Format number as percentage with two decimals';
            if (savestr.includes('$#,##0.00')) return 'Format as currency with cents';
            if (savestr.includes('$#,##0') && !savestr.includes('.')) return 'Format as currency without decimals';
            if (savestr.includes('mm/dd/yyyy')) return 'Format date as full date with slashes';
            if (savestr.includes('yyyy-mm-dd')) return 'Format date in ISO format';
            if (savestr.includes('h\\cmm AM/PM')) return 'Format time with AM/PM indicator';
            if (savestr.includes('h\\cmm\\css')) return 'Format time with seconds';
            return `Format number with pattern ${fileNum}`;

        case 'Format Text':
            if (savestr.includes('text-plain')) return 'Create cell with plain text format';
            if (savestr.includes('<b>')) return 'Create cell with bold HTML text';
            if (savestr.includes('<i>')) return 'Create cell with italic HTML text';
            if (savestr.includes('<u>')) return 'Create cell with underlined HTML text';
            if (savestr.includes('<img')) return 'Embed image using HTML img tag';
            if (savestr.includes('<svg')) return 'Create SVG graphic in cell';
            if (savestr.includes('text-link')) return 'Create hyperlink in cell';
            return `Create cell with text format ${fileNum}`;

        case 'Links':
            if (savestr.includes('<<')) return 'Create link that opens in new tab';
            if (savestr.includes('mailto')) return 'Create email link with mailto protocol';
            if (savestr.includes('tel')) return 'Create telephone link';
            if (savestr.includes('<http') || savestr.includes('<https')) return 'Create basic link that opens in current tab';
            return `Create link configuration ${fileNum}`;

        case 'Multiline Input':
            const lineCount = (savestr.match(/\\n/g) || []).length + 1;
            if (lineCount === 2) return 'Create cell with two lines of text';
            if (lineCount === 3) return 'Create cell with three lines of text';
            if (lineCount > 3) return `Create cell with ${lineCount} lines of text`;
            return `Create multiline cell ${fileNum}`;

        case 'Paddings':
            const paddingMatch = savestr.match(/padding:([^;]+);/);
            if (paddingMatch) {
                const padding = paddingMatch[1];
                const parts = padding.split(/\s+/);
                const nonWildcard = parts.filter(p => p !== '*');
                if (nonWildcard.length === 0) return 'Create cell with no specific padding';
                if (nonWildcard.length === 4 && parts.every((p, i, a) => p === a[0] && p !== '*')) {
                    return 'Create cell with uniform padding on all sides';
                }
                if (parts[0] !== '*' && parts[1] === '*' && parts[2] === '*' && parts[3] === '*') {
                    return 'Create cell with top padding only';
                }
                if (parts[0] === '*' && parts[1] !== '*' && parts[2] === '*' && parts[3] === '*') {
                    return 'Create cell with right padding only';
                }
                if (parts[0] === '*' && parts[1] === '*' && parts[2] !== '*' && parts[3] === '*') {
                    return 'Create cell with bottom padding only';
                }
                if (parts[0] === '*' && parts[1] === '*' && parts[2] === '*' && parts[3] !== '*') {
                    return 'Create cell with left padding only';
                }
                return 'Create cell with custom padding configuration';
            }
            return `Create cell with padding ${fileNum}`;

        default:
            return `Create ${folderName.toLowerCase()} example ${fileNum}`;
    }
}

// Enhanced plan generators
function generatePlan(folderName, savestr) {
    switch (folderName) {
        case 'Alignments':
            if (savestr.includes('cellformat') && savestr.includes(':left')) return 'Apply cellformat with left alignment to text cell';
            if (savestr.includes('cellformat') && savestr.includes(':center')) return 'Apply cellformat with center alignment to text cell';
            if (savestr.includes('cellformat') && savestr.includes(':right')) return 'Apply cellformat with right alignment to text cell';
            if (savestr.includes('vertical-align:top')) return 'Apply layout with vertical-align:top to position content at top';
            if (savestr.includes('vertical-align:middle')) return 'Apply layout with vertical-align:middle to center content vertically';
            if (savestr.includes('vertical-align:bottom')) return 'Apply layout with vertical-align:bottom to position content at bottom';
            return 'Apply alignment configuration to cell';

        case 'Borders':
            return 'Define border properties with style, width, and color, then apply to cell sides using b: attribute';

        case 'dimensions-merging':
            return 'Define cell with colspan/rowspan attributes and mark all covered cells as empty';

        case 'Fonts':
            return 'Define font with style, weight, size, and family, then apply to cell using f: attribute';

        case 'Formales':
            // Generate specific plans based on formula type
            if (savestr.includes(':SUM(')) return 'Create vtf cell with SUM function to add cell range values';
            if (savestr.includes(':AVERAGE(')) return 'Create vtf cell with AVERAGE function to calculate mean of range';
            if (savestr.includes(':MIN(') || savestr.includes(':MAX(')) return 'Create vtf cell with MIN/MAX function to find extreme value in range';
            if (savestr.includes(':COUNT(') || savestr.includes(':COUNTA(')) return 'Create vtf cell with COUNT/COUNTA function to count cells in range';
            if (savestr.includes(':COUNTIF(') || savestr.includes(':SUMIF(')) return 'Create vtf cell with conditional function (SUMIF/COUNTIF) using criteria';
            if (savestr.includes(':IF(')) return 'Create vtf cell with IF function for conditional logic (condition, true_value, false_value)';
            if (savestr.includes(':AND(') || savestr.includes(':OR(') || savestr.includes(':NOT(')) return 'Create vtf cell with logical function (AND/OR/NOT) for boolean operations';
            if (savestr.includes(':POWER(') || savestr.includes(':SQRT(')) return 'Create vtf cell with mathematical function for power/root calculations';
            if (savestr.includes(':ABS(') || savestr.includes(':ROUND(') || savestr.includes(':INT(') || savestr.includes(':MOD(')) return 'Create vtf cell with numeric function for rounding or calculations';
            if (savestr.includes(':UPPER(') || savestr.includes(':LOWER(') || savestr.includes(':PROPER(')) return 'Create vtf cell with text case conversion function';
            if (savestr.includes(':LEN(') || savestr.includes(':LEFT(') || savestr.includes(':RIGHT(') || savestr.includes(':MID(')) return 'Create vtf cell with text manipulation function to extract or measure text';
            if (savestr.includes(':SUBSTITUTE(') || savestr.includes(':FIND(')) return 'Create vtf cell with text search/replace function';
            if (savestr.includes(':TODAY(') || savestr.includes(':NOW(') || savestr.includes(':DATE(')) return 'Create vtf cell with date function';
            if (savestr.includes(':YEAR(') || savestr.includes(':MONTH(') || savestr.includes(':DAY(') || savestr.includes(':HOUR(')) return 'Create vtf cell with date/time component extraction function';
            if (savestr.includes(':PMT(')) return 'Create vtf cell with PMT financial function to calculate loan payments';
            if (savestr.includes(':CHOOSE(')) return 'Create vtf cell with CHOOSE function to select value from list by index';
            if (savestr.includes(':PI()')) return 'Create vtf cell using PI() constant in mathematical calculation';
            if (savestr.includes(':TRUE()') || savestr.includes(':FALSE()')) return 'Create vtf cell with boolean constant (TRUE/FALSE)';
            if (savestr.match(/:[A-Z]\d+[+\-*/][A-Z]\d+/)) return 'Create vtf cell with basic arithmetic formula using cell references';
            if (savestr.match(/:[A-Z]\d+[>=<]/)) return 'Create vtf cell with comparison operator to compare cell values';
            if (savestr.includes('&')) return 'Create vtf cell with text concatenation using & operator';
            return 'Create vtf cell with formula expression and expected result value';

        case 'Format Number':
            return 'Apply valueformat with ntvf attribute to control number display pattern';

        case 'Format Text':
            if (savestr.includes('text-html')) return 'Use text-html valueformat with tvf attribute to render HTML/SVG content';
            if (savestr.includes('text-link')) return 'Use text-link valueformat with tvf attribute to create clickable links';
            return 'Apply text valueformat to control text rendering';

        case 'Links':
            if (savestr.includes('<<')) return 'Use double angle brackets <<URL>> with text-link format for new tab behavior';
            return 'Use single angle brackets <URL> with text-link valueformat for current tab';

        case 'Multiline Input':
            return 'Use \\n escape sequence to create line breaks in cell text content';

        case 'Paddings':
            return 'Define layout with padding values (top right bottom left) and vertical-align property';

        default:
            return `Apply ${folderName.toLowerCase()} configuration`;
    }
}

function processFolder(folderName) {
    const basePath = path.join(__dirname, folderName);
    const jsonDir = path.join(basePath, 'json');

    if (!fs.existsSync(jsonDir)) {
        console.log(`Skipping ${folderName} - no json directory found`);
        return;
    }

    const jsonFiles = fs.readdirSync(jsonDir)
        .filter(f => f.endsWith('.json'))
        .sort((a, b) => {
            const numA = parseInt(a.replace('.json', ''));
            const numB = parseInt(b.replace('.json', ''));
            return numA - numB;
        });

    const trainingData = [];

    for (const jsonFile of jsonFiles) {
        const jsonPath = path.join(jsonDir, jsonFile);
        const fileNum = jsonFile.replace('.json', '');

        try {
            const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            const savestr = jsonContent.sheetArr?.sheet1?.sheetstr?.savestr ||
                jsonContent.sheetArr?.[Object.keys(jsonContent.sheetArr)[0]]?.sheetstr?.savestr;

            if (!savestr) {
                console.warn(`Warning: No savestr found in ${folderName}/${jsonFile}`);
                continue;
            }

            // Clean up the savestr - remove trailing newlines
            const cleanSavestr = savestr.trimEnd();

            // Generate instruction and plan
            const instruction = generateInstruction(folderName, cleanSavestr, fileNum);
            const plan = generatePlan(folderName, cleanSavestr);

            trainingData.push({
                instruction,
                plan,
                final_output: cleanSavestr
            });

        } catch (error) {
            console.error(`Error processing ${folderName}/${jsonFile}:`, error.message);
        }
    }

    // Determine the output filename
    const trainingFilenames = {
        'Alignments': 'alignment_training.jsonl',
        'Borders': 'border_training.jsonl',
        'dimensions-merging': 'dimensions_training.jsonl',
        'Fonts': 'font_training.jsonl',
        'Formales': 'formula_training.jsonl',
        'Format Number': 'format_number_training.jsonl',
        'Format Text': 'format_text_training.jsonl',
        'Links': 'links_training.jsonl',
        'Multiline Input': 'multiline_training.jsonl',
        'Paddings': 'paddings_training.jsonl'
    };

    const outputFile = path.join(basePath, trainingFilenames[folderName] || 'training.jsonl');

    // Write JSONL file
    const jsonlContent = trainingData.map(entry => JSON.stringify(entry)).join('\n');
    fs.writeFileSync(outputFile, jsonlContent + '\n', 'utf8');

    console.log(`✓ Generated ${outputFile} with ${trainingData.length} entries`);
}

// Process all folders
console.log('Starting enhanced training data generation...\n');
folders.forEach(folder => {
    try {
        processFolder(folder);
    } catch (error) {
        console.error(`Error processing folder ${folder}:`, error.message);
    }
});
console.log('\nDone!');
