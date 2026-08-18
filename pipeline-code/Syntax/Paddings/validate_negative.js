#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const SocialCalcValidator = require('../../validator.js');

const paddingsDir = __dirname;
const files = fs.readdirSync(paddingsDir)
    .filter(f => f.startsWith('neg-') && f.endsWith('.msc'))
    .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
    });

console.log('='.repeat(70));
console.log('VALIDATING NEGATIVE PADDING EXAMPLES');
console.log('='.repeat(70));
console.log(`Found ${files.length} negative example files to validate\n`);

let totalErrors = 0;
let totalUnexpectedlyValid = 0;

files.forEach((file, index) => {
    const filePath = path.join(paddingsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    console.log(`[${index + 1}/${files.length}] Validating ${file}...`);

    const validator = new SocialCalcValidator({
        verbose: false,
        strictMode: false,
        enableSemanticLevel: true
    });
    const result = validator.validate(content);

    if (result.valid) {
        console.log(`  ⚠️  UNEXPECTEDLY VALID - This should have errors!`);
        totalUnexpectedlyValid++;
    } else {
        console.log(`  ✅ CORRECTLY INVALID - ${result.errorCount} errors found`);
        totalErrors++;

        // Print first 2 errors
        result.errors.slice(0, 2).forEach(err => {
            console.log(`     Line ${err.line}: ${err.message}`);
        });
        if (result.errors.length > 2) {
            console.log(`     ... and ${result.errors.length - 2} more errors`);
        }
    }
});

console.log('\n' + '='.repeat(70));
console.log('NEGATIVE VALIDATION SUMMARY');
console.log('='.repeat(70));
console.log(`Total negative examples: ${files.length}`);
console.log(`Correctly invalid: ${totalErrors}`);
console.log(`Unexpectedly valid: ${totalUnexpectedlyValid}`);

if (totalUnexpectedlyValid > 0) {
    console.log('\n⚠️  WARNING: Some negative examples did not produce errors!');
    console.log('These files need to be fixed to ensure they contain actual errors.');
}

console.log('\n' + '='.repeat(70));
process.exit(totalUnexpectedlyValid > 0 ? 1 : 0);
