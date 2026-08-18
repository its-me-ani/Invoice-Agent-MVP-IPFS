#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const formatNumberDir = __dirname;

// Get all negative example .msc files
const files = fs.readdirSync(formatNumberDir)
    .filter(f => f.endsWith('.msc') && f.startsWith('neg-'))
    .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
    });

console.log('='.repeat(70));
console.log('VALIDATING NEGATIVE FORMAT NUMBER EXAMPLES');
console.log('='.repeat(70));
console.log(`Found ${files.length} negative examples to validate\n`);

const expectedErrors = {
    'neg-1.msc': 'References undefined valueformat:99',
    'neg-2.msc': 'Missing valueformat definition',
    'neg-3.msc': 'Non-numeric valueformat ID (abc)',
    'neg-4.msc': 'Empty valueformat pattern',
    'neg-5.msc': 'Duplicate ntvf attributes on same cell',
    'neg-6.msc': 'Text value with number format (should use v: not t:)',
    'neg-7.msc': 'Negative valueformat ID',
    'neg-8.msc': 'Invalid format pattern (wrong comma placement)',
    'neg-9.msc': 'Cell references valueformat:1 but only valueformat:2 defined',
    'neg-10.msc': 'Double percent signs in pattern'
};

let validCount = 0;
let invalidCount = 0;

files.forEach((file, index) => {
    const filePath = path.join(formatNumberDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim() !== '');

    const expectedError = expectedErrors[file] || 'Unknown error expected';

    console.log(`[${index + 1}/${files.length}] ${file}`);
    console.log(`  Expected Error: ${expectedError}`);

    // Verify the file demonstrates the expected error
    let demonstratesError = false;

    if (file === 'neg-1.msc' && content.includes('ntvf:99') && !content.includes('valueformat:99')) {
        demonstratesError = true;
    } else if (file === 'neg-2.msc' && content.includes('ntvf:') && !content.includes('valueformat:')) {
        demonstratesError = true;
    } else if (file === 'neg-3.msc' && content.includes('ntvf:abc')) {
        demonstratesError = true;
    } else if (file === 'neg-4.msc' && content.match(/valueformat:\d+:$/m)) {
        demonstratesError = true;
    } else if (file === 'neg-5.msc' && content.match(/ntvf:\d+:ntvf:\d+/)) {
        demonstratesError = true;
    } else if (file === 'neg-6.msc' && content.includes(':t:') && content.includes('ntvf:')) {
        demonstratesError = true;
    } else if (file === 'neg-7.msc' && content.includes('ntvf:-')) {
        demonstratesError = true;
    } else if (file === 'neg-8.msc' && content.includes('##,##,##0')) {
        demonstratesError = true;
    } else if (file === 'neg-9.msc') {
        const hasNtvf1 = content.includes('ntvf:1');
        const hasValueformat1 = content.includes('valueformat:1');
        const hasValueformat2 = content.includes('valueformat:2');
        if (hasNtvf1 && !hasValueformat1 && hasValueformat2) {
            demonstratesError = true;
        }
    } else if (file === 'neg-10.msc' && content.includes('0.00%%')) {
        demonstratesError = true;
    }

    if (demonstratesError) {
        console.log(`  ✓ Correctly demonstrates expected error\n`);
        validCount++;
    } else {
        console.log(`  ✗ Does NOT demonstrate expected error\n`);
        invalidCount++;
    }
});

console.log('='.repeat(70));
console.log('NEGATIVE EXAMPLES VALIDATION SUMMARY');
console.log('='.repeat(70));
console.log(`Total negative examples: ${files.length}`);
console.log(`Valid (demonstrates error): ${validCount}`);
console.log(`Invalid (doesn't demonstrate error): ${invalidCount}`);
console.log('='.repeat(70));

if (invalidCount > 0) {
    console.log('\n✗ Some negative examples do not properly demonstrate errors');
    process.exit(1);
} else {
    console.log('\n✓ All negative examples properly demonstrate expected errors!');
    process.exit(0);
}
