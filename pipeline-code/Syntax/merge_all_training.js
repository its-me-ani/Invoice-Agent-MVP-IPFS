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

// Training file patterns
const trainingFilePatterns = [
    'alignment_training.jsonl',
    'border_training.jsonl',
    'dimensions_training.jsonl',
    'font_training.jsonl',
    'formula_training.jsonl',
    'format_number_training.jsonl',
    'format_text_training.jsonl',
    'links_training.jsonl',
    'multiline_training.jsonl',
    'paddings_training.jsonl'
];

const OUTPUT_DIR = path.join(__dirname, 'json_syntax');
const OUTPUT_TRAINING = path.join(__dirname, 'training-syntax.jsonl');

console.log('🚀 Starting merge process...\n');

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✅ Created directory: ${OUTPUT_DIR}`);
} else {
    console.log(`📁 Output directory exists: ${OUTPUT_DIR}`);
}

// Clear output training file
if (fs.existsSync(OUTPUT_TRAINING)) {
    fs.unlinkSync(OUTPUT_TRAINING);
    console.log(`🗑️  Cleared existing: ${OUTPUT_TRAINING}`);
}

let totalTrainingLines = 0;
let totalJsonFiles = 0;
let processedFolders = 0;

// Process each folder
folders.forEach(folder => {
    const folderPath = path.join(__dirname, folder);

    if (!fs.existsSync(folderPath)) {
        console.log(`⚠️  Folder not found: ${folder}`);
        return;
    }

    console.log(`\n📂 Processing: ${folder}`);

    // Find and merge training file (exclude negative training files)
    const files = fs.readdirSync(folderPath);
    const trainingFile = files.find(f =>
        f.endsWith('_training.jsonl') &&
        !f.includes('negative') &&
        !f.includes('_neg_')
    );

    if (trainingFile) {
        const trainingPath = path.join(folderPath, trainingFile);
        const content = fs.readFileSync(trainingPath, 'utf8');
        const lines = content.trim().split('\n').filter(line => line.trim());

        // Append to output training file
        fs.appendFileSync(OUTPUT_TRAINING, content.trim() + '\n');

        totalTrainingLines += lines.length;
        console.log(`  ✅ Merged ${lines.length} training examples from ${trainingFile}`);
    } else {
        console.log(`  ⚠️  No training file found`);
    }

    // Copy JSON files
    const jsonDir = path.join(folderPath, 'json');
    if (fs.existsSync(jsonDir)) {
        const jsonFiles = fs.readdirSync(jsonDir).filter(f => f.endsWith('.json') && !f.startsWith('neg-'));

        jsonFiles.forEach(jsonFile => {
            const sourcePath = path.join(jsonDir, jsonFile);

            // Create unique name: foldername_filename.json
            const folderPrefix = folder.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_-]/g, '');
            const destFileName = `${folderPrefix}_${jsonFile}`;
            const destPath = path.join(OUTPUT_DIR, destFileName);

            fs.copyFileSync(sourcePath, destPath);
            totalJsonFiles++;
        });

        console.log(`  ✅ Copied ${jsonFiles.length} JSON files`);
    } else {
        console.log(`  ⚠️  No json/ directory found`);
    }

    processedFolders++;
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('✨ MERGE COMPLETE ✨');
console.log('='.repeat(60));
console.log(`📊 Processed folders: ${processedFolders}/${folders.length}`);
console.log(`📝 Total training examples: ${totalTrainingLines}`);
console.log(`📄 Total JSON files copied: ${totalJsonFiles}`);
console.log(`\n📁 Output files:`);
console.log(`   Training: ${OUTPUT_TRAINING}`);
console.log(`   JSON dir: ${OUTPUT_DIR}`);
console.log('='.repeat(60));

// Verify output
if (fs.existsSync(OUTPUT_TRAINING)) {
    const finalContent = fs.readFileSync(OUTPUT_TRAINING, 'utf8');
    const finalLines = finalContent.trim().split('\n').length;
    console.log(`\n✅ Verification: ${finalLines} lines in ${OUTPUT_TRAINING}`);
} else {
    console.log(`\n❌ Error: Output training file not created`);
}

if (fs.existsSync(OUTPUT_DIR)) {
    const finalJsonCount = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.json')).length;
    console.log(`✅ Verification: ${finalJsonCount} files in ${OUTPUT_DIR}`);
} else {
    console.log(`❌ Error: Output directory not created`);
}

console.log('\n🎉 Done!\n');
