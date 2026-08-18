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

// Instructions mapping for each folder type
const instructionTemplates = {
    'Alignments': (num, savestr) => {
        if (savestr.includes('cellformat') && savestr.includes('left')) return 'Create cell with left horizontal alignment';
        if (savestr.includes('cellformat') && savestr.includes('center')) return 'Create cell with center horizontal alignment';
        if (savestr.includes('cellformat') && savestr.includes('right')) return 'Create cell with right horizontal alignment';
        if (savestr.includes('vertical-align:top')) return 'Create cell with top vertical alignment';
        if (savestr.includes('vertical-align:middle')) return 'Create cell with middle vertical alignment';
        if (savestr.includes('vertical-align:bottom')) return 'Create cell with bottom vertical alignment';
        return `Create cell with alignment configuration ${num}`;
    },
    'Borders': (num, savestr) => `Create cell with border configuration ${num}`,
    'dimensions-merging': (num, savestr) => {
        if (savestr.includes('colspan') && savestr.includes('rowspan')) return `Create merged cell spanning multiple rows and columns`;
        if (savestr.includes('colspan')) return `Create cell spanning multiple columns`;
        if (savestr.includes('rowspan')) return `Create cell spanning multiple rows`;
        return `Create cell with dimensions/merging ${num}`;
    },
    'Fonts': (num, savestr) => `Create cell with font configuration ${num}`,
    'Formales': (num, savestr) => `Create cell with formula ${num}`,
    'Format Number': (num, savestr) => `Format number with specific pattern ${num}`,
    'Format Text': (num, savestr) => `Create cell with text format ${num}`,
    'Links': (num, savestr) => `Create cell with link ${num}`,
    'Multiline Input': (num, savestr) => `Create cell with multiline text ${num}`,
    'Paddings': (num, savestr) => `Create cell with padding configuration ${num}`
};

// Plan templates for each folder type
const planTemplates = {
    'Alignments': (savestr) => {
        if (savestr.includes('cellformat') && savestr.includes('left')) return 'Apply cellformat with left alignment to text cell';
        if (savestr.includes('cellformat') && savestr.includes('center')) return 'Apply cellformat with center alignment to text cell';
        if (savestr.includes('cellformat') && savestr.includes('right')) return 'Apply cellformat with right alignment to text cell';
        if (savestr.includes('vertical-align:top')) return 'Apply layout with vertical-align:top to position content at top';
        if (savestr.includes('vertical-align:middle')) return 'Apply layout with vertical-align:middle to center content vertically';
        if (savestr.includes('vertical-align:bottom')) return 'Apply layout with vertical-align:bottom to position content at bottom';
        return 'Apply alignment configuration to cell';
    },
    'Borders': (savestr) => 'Define border properties and apply to cell',
    'dimensions-merging': (savestr) => 'Define cell dimensions with colspan/rowspan and mark covered cells as empty',
    'Fonts': (savestr) => 'Define font properties and apply to cell',
    'Formales': (savestr) => 'Create formula cell with appropriate value type and formula expression',
    'Format Number': (savestr) => 'Apply number format pattern to display value',
    'Format Text': (savestr) => 'Apply text format valueformat to cell',
    'Links': (savestr) => 'Create link in cell with text-link valueformat',
    'Multiline Input': (savestr) => 'Use \\n escape sequence to create line breaks in cell text',
    'Paddings': (savestr) => 'Apply layout with padding values and vertical alignment'
};

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

            // Generate instruction
            const instruction = typeof instructionTemplates[folderName] === 'function'
                ? instructionTemplates[folderName](fileNum, cleanSavestr)
                : `Create ${folderName.toLowerCase()} example ${fileNum}`;

            // Generate plan
            const plan = typeof planTemplates[folderName] === 'function'
                ? planTemplates[folderName](cleanSavestr)
                : `Define and apply ${folderName.toLowerCase()} configuration`;

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
console.log('Starting training data generation...\n');
folders.forEach(folder => {
    try {
        processFolder(folder);
    } catch (error) {
        console.error(`Error processing folder ${folder}:`, error.message);
    }
});
console.log('\nDone!');
