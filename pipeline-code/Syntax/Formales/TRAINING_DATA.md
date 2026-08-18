# Formula Training Data Documentation

## Overview
This document explains the training data format used in `formula_training.jsonl` for fine-tuning language models on SocialCalc formula generation.

## File Format: JSONL (JSON Lines)

Each line in `formula_training.jsonl` is a complete, independent JSON object. This format is commonly used for:
- Machine learning training data
- Streaming data processing
- Line-by-line data ingestion

### Structure
```json
{"instruction": "...", "plan": "...", "output": "..."}
{"instruction": "...", "plan": "...", "output": "..."}
{"instruction": "...", "plan": "...", "output": "..."}
```

## Training Example Schema

Each training example contains three fields:

### 1. `instruction` (string)
**Purpose**: What the user wants to accomplish

**Characteristics**:
- User-facing language
- Task-oriented
- Natural language description
- 3-10 words typically

**Examples**:
```json
"Create a simple addition formula"
"Calculate average of numbers"
"Convert text to uppercase"
"Sum cells matching criteria"
```

### 2. `plan` (string)
**Purpose**: How to accomplish the task (intermediate reasoning step)

**Characteristics**:
- More technical than instruction
- Describes the approach
- Mentions specific functions or operations
- Still in natural language

**Examples**:
```json
"Add two numbers in cells A1 and A2"
"Use AVERAGE function on range A1 to A5"
"Use UPPER to convert A1 text to uppercase"
"Use SUMIF to sum values in A1:A4 that are >50"
```

### 3. `output` (string)
**Purpose**: The actual SocialCalc formula syntax

**Characteristics**:
- Exact SocialCalc save format
- Must be valid syntax
- Includes full cell definition
- May contain multiple lines (separated by `\n`)

**Examples**:
```json
"cell:A3:vtf:n:30:A1+A2"
"cell:A6:vtf:n:30:AVERAGE(A1\\cA5)"
"cell:A2:vtf:t:HELLO:UPPER(A1)"
"cell:A5:vtf:n:180:SUMIF(A1\\cA4,\">50\")"
```

## Complete Example

```json
{
  "instruction": "Calculate average of numbers",
  "plan": "Use AVERAGE function on range A1 to A5",
  "output": "cell:A6:vtf:n:30:AVERAGE(A1\\cA5)"
}
```

### Breakdown:
1. **User says**: "Calculate average of numbers"
2. **Model thinks**: "I'll use AVERAGE function on range A1 to A5"
3. **Model generates**: `cell:A6:vtf:n:30:AVERAGE(A1\cA5)`

## Training Data Statistics

```
Total examples: 50
Average instruction length: ~6 words
Average plan length: ~10 words
Average output length: ~35 characters
```

## Categories Covered

### Arithmetic Operations (4 examples)
```json
{"instruction": "Create a simple addition formula", "plan": "Add two numbers in cells A1 and A2", "output": "cell:A3:vtf:n:30:A1+A2"}
```

### Aggregate Functions (5 examples)
```json
{"instruction": "Sum a range of cells", "plan": "Use SUM function to add cells A1 through A3", "output": "cell:A4:vtf:n:60:SUM(A1\\cA3)"}
```

### Mathematical Functions (7 examples)
```json
{"instruction": "Calculate square root", "plan": "Find square root of value in A1", "output": "cell:A2:vtf:n:5:SQRT(A1)"}
```

### Text Functions (10 examples)
```json
{"instruction": "Convert text to uppercase", "plan": "Use UPPER to convert A1 text to uppercase", "output": "cell:A2:vtf:t:HELLO:UPPER(A1)"}
```

### Logical Operations (6 examples)
```json
{"instruction": "Create conditional IF formula", "plan": "Return 'Pass' if A1>60, otherwise 'Fail'", "output": "cell:A2:vtf:t:Pass:IF(A1>60,\"Pass\",\"Fail\")"}
```

### Date/Time Functions (7 examples)
```json
{"instruction": "Get today's date", "plan": "Use TODAY function to return current date", "output": "cell:A1:vtf:nd:45658:TODAY()"}
```

### Statistical Functions (3 examples)
```json
{"instruction": "Sum cells matching criteria", "plan": "Use SUMIF to sum values in A1:A4 that are >50", "output": "cell:A5:vtf:n:180:SUMIF(A1\\cA4,\">50\")"}
```

### Financial Functions (1 example)
```json
{"instruction": "Calculate loan payment", "plan": "Use PMT to calculate monthly payment with rate 0.005, 360 periods, 200000 principal", "output": "cell:A4:vtf:n:-1199.1010558513144:PMT(A1,A2,A3)"}
```

### Complex Formulas (7 examples)
```json
{"instruction": "Chain multiple operations", "plan": "Multiply, add, then divide in sequence", "output": "cell:A5:vtf:n:7:((A1*A2)+A3)/A4"}
```

## Special Handling in Output

### 1. Escaped Colons
In JSON, backslashes must be escaped:
```json
"output": "cell:A5:vtf:n:150:SUM(A1\\cA5)"
                                     ^^
                                   Escaped!
```

This becomes `SUM(A1\cA5)` when parsed.

### 2. Escaped Quotes
Double quotes in formulas must be escaped:
```json
"output": "cell:A2:vtf:t:Pass:IF(A1>60,\"Pass\",\"Fail\")"
                                        ^^      ^^    ^^
```

### 3. Multiple Lines
Some outputs contain multiple cell definitions:
```json
"output": "cell:A1:vtf:n:1:TRUE()\ncell:A2:vtf:n:0:FALSE()"
```

This represents two separate cell definitions.

## Usage in Training

### Fine-tuning Scenario
1. **Input**: Instruction + Plan
2. **Expected Output**: Formula syntax

### Prompt Template Example
```
Instruction: {instruction}
Plan: {plan}
Generate the SocialCalc formula:
```

### Expected Completion
```
{output}
```

### Full Example
```
Instruction: Calculate average of numbers
Plan: Use AVERAGE function on range A1 to A5
Generate the SocialCalc formula:

cell:A6:vtf:n:30:AVERAGE(A1\cA5)
```

## Quality Assurance

All training examples have been:
- ✅ Validated for syntax correctness (100% pass rate)
- ✅ Tested with SocialCalc validator
- ✅ Verified for proper range notation (`\c` usage)
- ✅ Checked for balanced parentheses
- ✅ Confirmed accurate value predictions

## Loading the Data

### Python
```python
import json

training_data = []
with open('formula_training.jsonl', 'r') as f:
    for line in f:
        training_data.append(json.loads(line))

# Access examples
for example in training_data:
    instruction = example['instruction']
    plan = example['plan']
    output = example['output']
    # Process...
```

### JavaScript/Node.js
```javascript
const fs = require('fs');

const lines = fs.readFileSync('formula_training.jsonl', 'utf8').split('\n');
const training_data = lines
    .filter(line => line.trim())
    .map(line => JSON.parse(line));

// Access examples
training_data.forEach(example => {
    const { instruction, plan, output } = example;
    // Process...
});
```

### Command Line
```bash
# Count examples
wc -l formula_training.jsonl

# View first example
head -n 1 formula_training.jsonl | jq .

# Search for specific function
grep -i "AVERAGE" formula_training.jsonl | jq .

# Extract all instructions
jq -r '.instruction' formula_training.jsonl
```

## Data Augmentation Ideas

### 1. Vary Instructions
```json
Original: "Calculate average of numbers"
Variants:
  - "Find the average"
  - "Get mean value"
  - "Compute average"
  - "Calculate the mean"
```

### 2. Vary Plans
```json
Original: "Use AVERAGE function on range A1 to A5"
Variants:
  - "Apply AVERAGE to cells A1 through A5"
  - "Calculate AVERAGE(A1:A5)"
  - "Use AVERAGE with range A1-A5"
```

### 3. Generalize Output
Replace specific values with placeholders for more generic training.

## Best Practices

### For Instruction
- Keep it user-friendly
- Use common terminology
- Be specific but concise
- Avoid technical jargon

### For Plan
- Bridge instruction and output
- Mention specific functions
- Describe the approach
- Be more technical than instruction

### For Output
- Use exact SocialCalc syntax
- Include complete cell definition
- Ensure all parentheses balanced
- Use `\c` for ranges
- Escape special characters

## Validation

To verify training data integrity:

```bash
# Check JSON validity
jq empty formula_training.jsonl

# Count examples
wc -l formula_training.jsonl

# Verify all have required fields
jq -e '.instruction and .plan and .output' formula_training.jsonl

# Check for empty fields
jq -r 'select(.instruction == "" or .plan == "" or .output == "")' formula_training.jsonl
```

## Related Files

- **1.msc - 50.msc**: Source files for training examples
- **json/*.json**: Individual JSON representations
- **README.md**: Complete formula syntax reference
- **SUMMARY.md**: Quick overview

## Extending the Dataset

To add new training examples:

1. Create new .msc file with valid formula
2. Add entry to `generateTrainingData()` in `convert_to_json.js`
3. Run `node convert_to_json.js`
4. Verify with `jq empty formula_training.jsonl`

Example addition:
```javascript
51: {
    instruction: "Your instruction here",
    plan: "Your plan here",
    output: "cell:A1:vtf:n:100:YOUR_FORMULA"
}
```

## Training Recommendations

1. **Shuffle data** before training to avoid ordering bias
2. **Split dataset**: 80% train, 10% validation, 10% test
3. **Augment instructions** with paraphrases
4. **Balance categories** to avoid bias toward arithmetic
5. **Include negative examples** if training on error correction
6. **Validate outputs** with actual SocialCalc parser

## License and Usage

This training data is designed for:
- Fine-tuning language models
- Formula generation systems
- Spreadsheet AI assistants
- Educational purposes
- Research applications

## Contact and Contribution

To contribute new examples or report issues:
1. Validate with `validate_all.js`
2. Add to `convert_to_json.js`
3. Regenerate JSONL
4. Update documentation
