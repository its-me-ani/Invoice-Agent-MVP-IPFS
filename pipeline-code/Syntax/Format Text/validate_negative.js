#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const SocialCalcValidator = require('../../validator.js');

const formatTextDir = __dirname;
const files = fs.readdirSync(formatTextDir)
    .filter(f => f.startsWith('neg-') && f.endsWith('.msc'))
    .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
    });

console.log('='.repeat(70));
console.log('VALIDATING FORMAT TEXT NEGATIVE EXAMPLES');
console.log('='.repeat(70));
console.log(`Found ${files.length} negative .msc files to validate\n`);

let totalWithErrors = 0;
let totalWithoutErrors = 0;
const results = [];

files.forEach((file, index) => {
    const filePath = path.join(formatTextDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    console.log(`[${index + 1}/${files.length}] Validating ${file}...`);

    const validator = new SocialCalcValidator({
        verbose: false,
        strictMode: false
    });
    const result = validator.validate(content);

    if (!result.valid) {
        console.log(`  ✅ HAS ERRORS (as expected) - ${result.errorCount} errors`);
        totalWithErrors++;

        // Show errors
        result.errors.slice(0, 2).forEach(err => {
            console.log(`     Line ${err.line}: ${err.message}`);
        });
        if (result.errors.length > 2) {
            console.log(`     ... and ${result.errors.length - 2} more errors`);
        }
    } else {
        console.log(`  ⚠️  NO ERRORS (unexpected - should be invalid)`);
        totalWithoutErrors++;
    }

    results.push({
        file: file,
        hasErrors: !result.valid,
        errorCount: result.errorCount,
        errors: result.errors
    });

    console.log();
});

console.log('='.repeat(70));
console.log('NEGATIVE EXAMPLES SUMMARY');
console.log('='.repeat(70));
console.log(`Total negative examples: ${files.length}`);
console.log(`With errors (correct): ${totalWithErrors} ✅`);
console.log(`Without errors (incorrect): ${totalWithoutErrors} ⚠️`);
console.log(`Accuracy: ${((totalWithErrors / files.length) * 100).toFixed(1)}%`);

console.log('\n' + '='.repeat(70));
console.log('NEGATIVE EXAMPLES PURPOSE');
console.log('='.repeat(70));
results.forEach(({ file, hasErrors, errorCount, errors }) => {
    console.log(`\n${file}: ${hasErrors ? `${errorCount} errors ✅` : 'No errors ⚠️'}`);
    if (hasErrors && errors.length > 0) {
        console.log(`  Purpose: Demonstrates ${errors[0].message}`);
    }
});

console.log('\n' + '='.repeat(70));
