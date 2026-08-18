#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const SocialCalcValidator = require('../../validator.js');

const dimensionsDir = __dirname;
const negFiles = fs.readdirSync(dimensionsDir)
    .filter(f => f.startsWith('neg-') && f.endsWith('.msc'))
    .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
    });

console.log('='.repeat(70));
console.log('VALIDATING NEGATIVE EXAMPLES - DIMENSIONS & MERGING');
console.log('='.repeat(70));
console.log(`Found ${negFiles.length} negative examples to validate\n`);

let totalPassed = 0; // Should have errors
let totalFailed = 0; // Should NOT be valid

negFiles.forEach((file, index) => {
    const filePath = path.join(dimensionsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    console.log(`[${index + 1}/${negFiles.length}] Validating ${file}...`);

    const validator = new SocialCalcValidator({
        verbose: false,
        strictMode: false
    });
    const result = validator.validate(content);

    if (!result.valid) {
        console.log(`  ✅ CORRECTLY INVALID - ${result.errorCount} errors detected`);
        totalPassed++;

        // Print errors
        result.errors.forEach(err => {
            console.log(`     Line ${err.line}: ${err.message}`);
        });
    } else {
        console.log(`  ❌ UNEXPECTEDLY VALID - Should have errors!`);
        totalFailed++;
    }
    console.log();
});

console.log('='.repeat(70));
console.log('NEGATIVE VALIDATION SUMMARY');
console.log('='.repeat(70));
console.log(`Total negative examples: ${negFiles.length}`);
console.log(`Correctly invalid: ${totalPassed} ✅`);
console.log(`Unexpectedly valid: ${totalFailed} ❌`);
console.log(`Success rate: ${((totalPassed / negFiles.length) * 100).toFixed(1)}%`);
console.log('\n' + '='.repeat(70));

// Exit with error code if any negative examples are unexpectedly valid
process.exit(totalFailed > 0 ? 1 : 0);
