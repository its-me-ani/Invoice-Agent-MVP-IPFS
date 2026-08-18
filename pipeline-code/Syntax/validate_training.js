#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('='.repeat(80));
console.log('Training Data Validation Report');
console.log('='.repeat(80));
console.log('');

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

const trainingFiles = {
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

let totalEntries = 0;
let totalJsonFiles = 0;
let allValid = true;

for (const folder of folders) {
    const folderPath = path.join(__dirname, folder);
    const jsonPath = path.join(folderPath, 'json');
    const trainingFile = path.join(folderPath, trainingFiles[folder]);

    console.log(`\n📁 ${folder}`);
    console.log('-'.repeat(80));

    // Count JSON files
    const jsonFiles = fs.readdirSync(jsonPath).filter(f => f.endsWith('.json'));
    console.log(`   JSON files: ${jsonFiles.length}`);
    totalJsonFiles += jsonFiles.length;

    // Read and validate training file
    const trainingContent = fs.readFileSync(trainingFile, 'utf8').trim().split('\n');
    console.log(`   Training entries: ${trainingContent.length}`);
    totalEntries += trainingContent.length;

    // Check consistency
    if (jsonFiles.length !== trainingContent.length) {
        console.log(`   ⚠️  WARNING: Mismatch between JSON files and training entries!`);
        allValid = false;
    } else {
        console.log(`   ✅ Count matches`);
    }

    // Validate format of first entry
    try {
        const firstEntry = JSON.parse(trainingContent[0]);
        const keys = Object.keys(firstEntry).sort();

        if (keys.includes('instruction') && keys.includes('plan') && keys.includes('final_output')) {
            console.log(`   ✅ Format: instruction, plan, final_output`);
        } else {
            console.log(`   ❌ Format issue: ${keys.join(', ')}`);
            allValid = false;
        }

        // Check if final_output has version
        if (firstEntry.final_output && firstEntry.final_output.startsWith('version:1.5')) {
            console.log(`   ✅ final_output starts with version:1.5`);
        } else {
            console.log(`   ❌ final_output doesn't start with version:1.5`);
            allValid = false;
        }

        // Verify against first JSON file
        const firstJsonPath = path.join(jsonPath, '1.json');
        if (fs.existsSync(firstJsonPath)) {
            const jsonContent = JSON.parse(fs.readFileSync(firstJsonPath, 'utf8'));
            const savestr = jsonContent.sheetArr?.sheet1?.sheetstr?.savestr?.trimEnd() ||
                jsonContent.sheetArr?.[Object.keys(jsonContent.sheetArr)[0]]?.sheetstr?.savestr?.trimEnd();

            if (savestr === firstEntry.final_output) {
                console.log(`   ✅ final_output matches savestr from json/1.json`);
            } else {
                console.log(`   ❌ final_output doesn't match savestr from json/1.json`);
                allValid = false;
            }
        }

    } catch (error) {
        console.log(`   ❌ JSON parsing error: ${error.message}`);
        allValid = false;
    }
}

console.log('\n');
console.log('='.repeat(80));
console.log('Summary');
console.log('='.repeat(80));
console.log(`Total folders processed: ${folders.length}`);
console.log(`Total JSON files: ${totalJsonFiles}`);
console.log(`Total training entries: ${totalEntries}`);
console.log(`Match status: ${totalJsonFiles === totalEntries ? '✅ Perfect match' : '⚠️  Mismatch'}`);
console.log('');

if (allValid) {
    console.log('✅ All training files are valid and consistent!');
} else {
    console.log('⚠️  Some issues were found. Please review the details above.');
}

console.log('');
console.log('='.repeat(80));
