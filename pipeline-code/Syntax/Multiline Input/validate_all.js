#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const SocialCalcValidator = require('../../validator.js');

const multilineDir = __dirname;
const files = fs.readdirSync(multilineDir)
    .filter(f => f.endsWith('.msc') && !f.startsWith('neg-'))
    .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
    });

console.log('='.repeat(70));
console.log('VALIDATING MULTILINE INPUT TRAINING DATASET');
console.log('='.repeat(70));
console.log(`Found ${files.length} .msc files to validate\n`);

let totalValid = 0;
let totalInvalid = 0;
const errors = [];

files.forEach((file, index) => {
    const filePath = path.join(multilineDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    console.log(`[${index + 1}/${files.length}] Validating ${file}...`);

    const validator = new SocialCalcValidator({
        verbose: false,
        strictMode: false
    });
    const result = validator.validate(content);

    if (result.valid) {
        const multilineCount = content.split('\\n').length - 1;
        console.log(`  ✅ VALID - ${result.cells} cells, ${multilineCount} newlines`);
        totalValid++;
    } else {
        console.log(`  ❌ INVALID - ${result.errorCount} errors`);
        totalInvalid++;
        errors.push({
            file: file,
            errors: result.errors
        });

        result.errors.slice(0, 3).forEach(err => {
            console.log(`     Line ${err.line}: ${err.message}`);
        });
        if (result.errors.length > 3) {
            console.log(`     ... and ${result.errors.length - 3} more errors`);
        }
    }
    console.log();
});

console.log('='.repeat(70));
console.log('VALIDATION SUMMARY');
console.log('='.repeat(70));
console.log(`Total files: ${files.length}`);
console.log(`Valid: ${totalValid} ✅`);
console.log(`Invalid: ${totalInvalid} ❌`);
console.log(`Success rate: ${((totalValid / files.length) * 100).toFixed(1)}%`);

if (errors.length > 0) {
    console.log('\n' + '='.repeat(70));
    console.log('DETAILED ERRORS');
    console.log('='.repeat(70));
    errors.forEach(({ file, errors: fileErrors }) => {
        console.log(`\n${file}:`);
        fileErrors.forEach(err => {
            console.log(`  Line ${err.line} [${err.level}]: ${err.message}`);
        });
    });
}

console.log('\n' + '='.repeat(70));

process.exit(totalInvalid > 0 ? 1 : 0);
