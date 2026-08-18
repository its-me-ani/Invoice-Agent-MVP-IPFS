#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const formatNumberDir = __dirname;

// Get all positive example .msc files
const files = fs.readdirSync(formatNumberDir)
    .filter(f => f.endsWith('.msc') && !f.startsWith('neg-'))
    .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
    });

console.log('='.repeat(70));
console.log('VALIDATING FORMAT NUMBER EXAMPLES');
console.log('='.repeat(70));
console.log(`Found ${files.length} files to validate\n`);

let passCount = 0;
let failCount = 0;
const errors = [];

files.forEach((file, index) => {
    const filePath = path.join(formatNumberDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim() !== '');

    let hasErrors = false;
    const fileErrors = [];

    // Check 1: Must start with version
    if (!lines[0] || !lines[0].startsWith('version:')) {
        fileErrors.push('Missing or invalid version line');
        hasErrors = true;
    }

    // Check 2: Must have at least one cell with ntvf attribute
    const cellLines = lines.filter(l => l.startsWith('cell:'));
    if (cellLines.length === 0) {
        fileErrors.push('No cell definitions found');
        hasErrors = true;
    }

    const cellsWithNtvf = cellLines.filter(l => l.includes(':ntvf:'));
    if (cellsWithNtvf.length === 0) {
        fileErrors.push('No cells with ntvf (number value format) attribute');
        hasErrors = true;
    }

    // Check 3: Must have sheet line
    const sheetLines = lines.filter(l => l.startsWith('sheet:'));
    if (sheetLines.length === 0) {
        fileErrors.push('Missing sheet line');
        hasErrors = true;
    }

    // Check 4: Must have valueformat definitions
    const valueFormatLines = lines.filter(l => l.startsWith('valueformat:'));
    if (valueFormatLines.length === 0) {
        fileErrors.push('Missing valueformat definition');
        hasErrors = true;
    }

    // Check 5: Validate ntvf references match valueformat definitions
    const valueFormatIds = valueFormatLines.map(l => {
        const match = l.match(/valueformat:(\d+):/);
        return match ? parseInt(match[1]) : null;
    }).filter(id => id !== null);

    cellsWithNtvf.forEach(cellLine => {
        const match = cellLine.match(/:ntvf:(\d+)/);
        if (match) {
            const refId = parseInt(match[1]);
            if (!valueFormatIds.includes(refId)) {
                fileErrors.push(`Cell references ntvf:${refId} but valueformat:${refId} is not defined`);
                hasErrors = true;
            }
        }
    });

    // Check 6: Validate valueformat pattern is not empty
    valueFormatLines.forEach(line => {
        const parts = line.split(':');
        if (parts.length < 3 || !parts[2]) {
            fileErrors.push(`Invalid valueformat definition: ${line}`);
            hasErrors = true;
        }
    });

    // Check 7: Cells with ntvf should have numeric values
    cellsWithNtvf.forEach(cellLine => {
        if (!cellLine.includes(':v:')) {
            fileErrors.push(`Cell with ntvf must have numeric value (v:), found: ${cellLine}`);
            hasErrors = true;
        }
    });

    if (hasErrors) {
        failCount++;
        console.log(`✗ [${index + 1}/${files.length}] ${file}`);
        fileErrors.forEach(err => console.log(`  - ${err}`));
        errors.push({ file, errors: fileErrors });
    } else {
        passCount++;
        console.log(`✓ [${index + 1}/${files.length}] ${file}`);
    }
});

console.log('\n' + '='.repeat(70));
console.log('VALIDATION SUMMARY');
console.log('='.repeat(70));
console.log(`Total files: ${files.length}`);
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);
console.log('='.repeat(70));

if (failCount > 0) {
    console.log('\nERRORS FOUND:');
    errors.forEach(({ file, errors }) => {
        console.log(`\n${file}:`);
        errors.forEach(err => console.log(`  - ${err}`));
    });
    process.exit(1);
} else {
    console.log('\n✓ All files validated successfully!');
    process.exit(0);
}
