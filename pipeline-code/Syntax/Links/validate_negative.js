#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const SocialCalcValidator = require('../../validator.js');

const linksDir = __dirname;

const files = fs.readdirSync(linksDir)
    .filter(f => f.startsWith('neg-') && f.endsWith('.msc'))
    .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
    });

console.log('='.repeat(70));
console.log('VALIDATING NEGATIVE LINK EXAMPLES');
console.log('='.repeat(70));
console.log(`Found ${files.length} negative example files\n`);

let totalErrors = 0;

files.forEach((file) => {
    const filePath = path.join(linksDir, file);
    const savestr = fs.readFileSync(filePath, 'utf8');

    const validator = new SocialCalcValidator();
    const result = validator.validate(savestr);

    console.log(`\n${'='.repeat(70)}`);
    console.log(`FILE: ${file}`);
    console.log('='.repeat(70));

    if (result.valid) {
        console.log('❌ UNEXPECTED: File is VALID (should have errors)');
    } else {
        console.log(`✓ File has errors as expected (${result.errorCount} errors)`);
        totalErrors += result.errorCount;

        if (result.errors.length > 0) {
            console.log('\nErrors found:');
            result.errors.forEach((error, idx) => {
                console.log(`  ${idx + 1}. Line ${error.line}: ${error.message}`);
                if (error.context) {
                    console.log(`     Context: ${error.context}`);
                }
            });
        }
    }
});

console.log('\n' + '='.repeat(70));
console.log('SUMMARY');
console.log('='.repeat(70));
console.log(`Total files: ${files.length}`);
console.log(`Total errors found: ${totalErrors}`);
console.log('='.repeat(70));
