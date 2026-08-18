#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const SocialCalcValidator = require('../validator.js');

const bordersDir = __dirname;
const jsonlFile = path.join(bordersDir, 'border_negative_training.jsonl');

// Get all negative example files
const files = fs.readdirSync(bordersDir)
    .filter(f => f.startsWith('neg-') && f.endsWith('.msc'))
    .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
    });

console.log('='.repeat(70));
console.log('GENERATING NEGATIVE EXAMPLES TRAINING DATA');
console.log('='.repeat(70));
console.log(`Found ${files.length} negative example files\n`);

// Define error descriptions and corrections for each example
const errorExamples = {
    'neg-1.msc': {
        error: 'Empty border values (:: instead of :0:)',
        instruction: 'Identify and fix the empty border values in the cell border definition',
        invalidCode: 'cell:A1:t:Employee:b::1::1',
        validCode: 'cell:A1:t:Employee:b:0:1:0:1',
        explanation: 'Empty border positions must be replaced with 0 (no border), not left empty. The syntax b::1::1 creates undefined references for top and bottom borders.'
    },
    'neg-2.msc': {
        error: 'Invalid color format - named color instead of rgb()',
        instruction: 'Fix the border definition that uses an invalid color format',
        invalidCode: 'border:2:2px dashed blue',
        validCode: 'border:2:2px dashed rgb(0,0,255)',
        explanation: 'SocialCalc requires colors in rgb(R,G,B) format. Named colors like "blue", "red", etc. are not supported.'
    },
    'neg-3.msc': {
        error: 'Trailing colon after border definition',
        instruction: 'Remove the trailing colon from the cell border attribute',
        invalidCode: 'cell:A1:t:Name:b:1:1:1:1:',
        validCode: 'cell:A1:t:Name:b:1:1:1:1',
        explanation: 'Border definitions must end with the fourth position value. Extra colons create parsing errors by suggesting another attribute without a name.'
    },
    'neg-4.msc': {
        error: 'Undefined border reference',
        instruction: 'Fix the cell that references a border ID that does not exist',
        invalidCode: 'cell:A1:t:Item:b:5:1:1:1',
        validCode: 'cell:A1:t:Item:b:1:1:1:1',
        explanation: 'Cell references border:5 but only border:1 is defined. All border IDs used in cells must have corresponding border definitions, or define the missing border.'
    },
    'neg-5.msc': {
        error: 'Incomplete border tuple - only 2 values',
        instruction: 'Complete the border definition with all 4 required position values',
        invalidCode: 'cell:A1:t:Status:b:1:1',
        validCode: 'cell:A1:t:Status:b:1:1:0:0',
        explanation: 'Border attribute requires exactly 4 values in the format b:top:right:bottom:left. Missing values cause parsing failures.'
    },
    'neg-6.msc': {
        error: 'Double colon before attribute',
        instruction: 'Remove the extra colon between border definition and background attribute',
        invalidCode: 'cell:A1:t:Month:b:1:1:1:1::bg:2',
        validCode: 'cell:A1:t:Month:b:1:1:1:1:bg:2',
        explanation: 'Double colons (::) create empty attribute names, causing the parser to fail. Each attribute should be separated by a single colon.'
    },
    'neg-7.msc': {
        error: 'Empty border definition',
        instruction: 'Complete the border definition with thickness, style, and color',
        invalidCode: 'border:2:',
        validCode: 'border:2:1px solid rgb(0,0,0)',
        explanation: 'Border definitions must include three parts: thickness (e.g., 1px), style (solid, dashed, dotted), and color in rgb() format.'
    },
    'neg-8.msc': {
        error: 'Invalid border thickness keyword',
        instruction: 'Replace the CSS keyword thickness with a pixel value',
        invalidCode: 'border:1:thick solid rgb(0,0,0)',
        validCode: 'border:1:3px solid rgb(0,0,0)',
        explanation: 'CSS keywords like "thin", "medium", "thick" are not supported. Use explicit pixel values like 1px, 2px, 3px instead.'
    },
    'neg-9.msc': {
        error: 'Too many border values - 5 instead of 4',
        instruction: 'Fix the border definition that has too many position values',
        invalidCode: 'cell:A1:t:Team:b:1:1:1:1:1',
        validCode: 'cell:A1:t:Team:b:1:1:1:1',
        explanation: 'Border attribute requires exactly 4 values (top:right:bottom:left). Extra values cause parsing errors as they appear to be unnamed attributes.'
    },
    'neg-10.msc': {
        error: 'Incomplete border tuple - only 3 values',
        instruction: 'Add the missing fourth value to the border definition',
        invalidCode: 'cell:A1:t:Category:b:1:1:1',
        validCode: 'cell:A1:t:Category:b:1:1:1:0',
        explanation: 'Border attribute must have all 4 position values specified: top, right, bottom, and left. Missing the left border value causes validation to fail.'
    }
};

const trainingData = [];

files.forEach((file) => {
    const filePath = path.join(bordersDir, file);
    const savestr = fs.readFileSync(filePath, 'utf8').trim();

    const validator = new SocialCalcValidator();
    const result = validator.validate(savestr);

    const errorInfo = errorExamples[file];

    if (!errorInfo) {
        console.warn(`Warning: No error description found for ${file}`);
        return;
    }

    const trainingExample = {
        instruction: errorInfo.instruction,
        error_type: errorInfo.error,
        invalid_code: errorInfo.invalidCode,
        valid_code: errorInfo.validCode,
        explanation: errorInfo.explanation,
        validator_message: result.errors[0]?.message || 'Unknown error',
        full_context: savestr
    };

    trainingData.push(trainingExample);

    console.log(`✓ Processed ${file}: ${errorInfo.error}`);
});

// Write JSONL file (one JSON object per line)
const jsonlContent = trainingData.map(item => JSON.stringify(item)).join('\n');
fs.writeFileSync(jsonlFile, jsonlContent);

console.log('\n' + '='.repeat(70));
console.log('NEGATIVE EXAMPLES TRAINING DATA GENERATED');
console.log('='.repeat(70));
console.log(`Output file: ${jsonlFile}`);
console.log(`Total examples: ${trainingData.length}`);
console.log('='.repeat(70));
