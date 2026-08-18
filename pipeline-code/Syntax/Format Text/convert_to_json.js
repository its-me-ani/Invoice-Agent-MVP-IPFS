#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const formatTextDir = __dirname;
const jsonDir = path.join(formatTextDir, 'json');

// Create json directory if it doesn't exist
if (!fs.existsSync(jsonDir)) {
    fs.mkdirSync(jsonDir, { recursive: true });
}

// Training data generator
function generateTrainingData(fileNum) {
    const trainingData = {
        1: {
            instruction: "Create cell with default text format",
            plan: "Use simple text without any format specification for default rendering",
            output: "cell:A1:t:Simple Text - Default Format"
        },
        2: {
            instruction: "Create cell with plain text format",
            plan: "Apply text-plain valueformat to explicitly render as plain text",
            output: "cell:A1:t:Plain Text:tvf:1\nvalueformat:1:text-plain"
        },
        3: {
            instruction: "Create cell with bold HTML text",
            plan: "Use text-html format with <b> tags to render bold text",
            output: "cell:A1:t:<b>Bold Text</b>:tvf:1\nvalueformat:1:text-html"
        },
        4: {
            instruction: "Create cell with italic HTML text",
            plan: "Apply text-html format with <i> tags for italic rendering",
            output: "cell:A1:t:<i>Italic Text</i>:tvf:1\nvalueformat:1:text-html"
        },
        5: {
            instruction: "Create cell with underlined HTML text",
            plan: "Use text-html format with <u> tags to underline text",
            output: "cell:A1:t:<u>Underlined Text</u>:tvf:1\nvalueformat:1:text-html"
        },
        6: {
            instruction: "Embed image using HTML img tag",
            plan: "Use text-html format with <img> tag to embed external image with width and height",
            output: "cell:A1:t:<img src=\"https\\c//example.com/logo.png\" width=\"100\" height=\"50\" />:tvf:1\nvalueformat:1:text-html"
        },
        7: {
            instruction: "Create simple SVG circle logo",
            plan: "Use text-html format with inline SVG to render a blue circle graphic",
            output: "cell:A1:t:<svg width=\"50\" height=\"50\"><circle cx=\"25\" cy=\"25\" r=\"20\" fill=\"blue\" /></svg>:tvf:1\nvalueformat:1:text-html"
        },
        8: {
            instruction: "Create SVG logo with text and background",
            plan: "Use text-html format with SVG rect and text elements to create branded logo",
            output: "cell:A1:t:<svg width=\"100\" height=\"40\"><rect width=\"100\" height=\"40\" fill=\"red\" /><text x=\"50\" y=\"25\" fill=\"white\" text-anchor=\"middle\">LOGO</text></svg>:tvf:1\nvalueformat:1:text-html"
        },
        9: {
            instruction: "Create SVG company logo with polygon shape",
            plan: "Use text-html format with SVG polygon and text for professional company logo",
            output: "cell:A1:t:<svg width=\"120\" height=\"80\"><polygon points=\"10,10 110,10 110,70 10,70\" fill=\"green\" stroke=\"black\" stroke-width=\"2\"/><text x=\"60\" y=\"45\" fill=\"white\" text-anchor=\"middle\" font-size=\"16\">Company</text></svg>:tvf:1\nvalueformat:1:text-html"
        },
        10: {
            instruction: "Create styled text with custom color",
            plan: "Use text-html format with inline CSS to render red colored text",
            output: "cell:A1:t:<div style=\"color\\cred;\">Red Text</div>:tvf:1\nvalueformat:1:text-html"
        },
        11: {
            instruction: "Create highlighted text with background color",
            plan: "Apply text-html format with span and inline styles for yellow background highlight",
            output: "cell:A1:t:<span style=\"background-color\\cyellow; padding\\c5px;\">Highlighted</span>:tvf:1\nvalueformat:1:text-html"
        },
        12: {
            instruction: "Create hyperlink in cell",
            plan: "Use text-link format with anchor tag to create clickable link",
            output: "cell:A1:t:<a href=\"https\\c//example.com\">Visit Website</a>:tvf:1\nvalueformat:1:text-link"
        },
        13: {
            instruction: "Create large bold text with custom styling",
            plan: "Apply text-html format with paragraph tag and inline CSS for large bold font",
            output: "cell:A1:t:<p style=\"font-size\\c20px; font-weight\\cbold;\">Large Bold Text</p>:tvf:1\nvalueformat:1:text-html"
        },
        14: {
            instruction: "Embed base64 encoded image",
            plan: "Use text-html format with img tag and data URI to embed inline image",
            output: "cell:A1:t:<img src=\"data\\cimage/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA\" alt=\"Icon\" />:tvf:1\nvalueformat:1:text-html"
        },
        15: {
            instruction: "Create SVG triangle icon",
            plan: "Use text-html format with SVG path element to draw triangle shape",
            output: "cell:A1:t:<svg width=\"60\" height=\"60\"><path d=\"M30,10 L50,50 L10,50 Z\" fill=\"orange\" /></svg>:tvf:1\nvalueformat:1:text-html"
        },
        16: {
            instruction: "Create header with logo using mixed formats",
            plan: "Use text-plain for header and text-html for SVG logo in separate cells",
            output: "cell:A1:t:Company Name:tvf:1\ncell:A2:t:<svg width=\"150\" height=\"60\"><ellipse cx=\"75\" cy=\"30\" rx=\"70\" ry=\"25\" fill=\"purple\" /><text x=\"75\" y=\"35\" fill=\"white\" text-anchor=\"middle\" font-size=\"14\">LOGO</text></svg>:tvf:2\nvalueformat:1:text-plain\nvalueformat:2:text-html"
        },
        17: {
            instruction: "Create superscript text",
            plan: "Use text-html format with <sup> tag for superscript rendering",
            output: "cell:A1:t:<sup>Superscript</sup> Text:tvf:1\nvalueformat:1:text-html"
        },
        18: {
            instruction: "Create subscript text",
            plan: "Apply text-html format with <sub> tag for subscript rendering",
            output: "cell:A1:t:<sub>Subscript</sub> Text:tvf:1\nvalueformat:1:text-html"
        },
        19: {
            instruction: "Display code snippet in cell",
            plan: "Use text-html format with <code> tag to render monospace code text",
            output: "cell:A1:t:<code>function() { return true; }</code>:tvf:1\nvalueformat:1:text-html"
        },
        20: {
            instruction: "Create preformatted text block",
            plan: "Apply text-html format with <pre> tag to preserve whitespace and line breaks",
            output: "cell:A1:t:<pre>Preformatted\\n  Text\\n    With Spaces</pre>:tvf:1\nvalueformat:1:text-html"
        },
        21: {
            instruction: "Create unordered list in cell",
            plan: "Use text-html format with <ul> and <li> tags to render bullet list",
            output: "cell:A1:t:<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>:tvf:1\nvalueformat:1:text-html"
        },
        22: {
            instruction: "Create ordered list in cell",
            plan: "Apply text-html format with <ol> and <li> tags to render numbered list",
            output: "cell:A1:t:<ol><li>First</li><li>Second</li><li>Third</li></ol>:tvf:1\nvalueformat:1:text-html"
        },
        23: {
            instruction: "Embed HTML table in cell",
            plan: "Use text-html format with table, tr, td tags to create nested table structure",
            output: "cell:A1:t:<table><tr><td>Cell 1</td><td>Cell 2</td></tr><tr><td>Cell 3</td><td>Cell 4</td></tr></table>:tvf:1\nvalueformat:1:text-html"
        },
        24: {
            instruction: "Create invoice header with financial icon",
            plan: "Use mixed formats: plain text for header, SVG with dollar symbol for branding",
            output: "cell:A1:t:Invoice Header:tvf:1\ncell:B1:t:<svg width=\"80\" height=\"80\"><rect width=\"80\" height=\"80\" fill=\"#4A90E2\"/><circle cx=\"40\" cy=\"40\" r=\"30\" fill=\"white\"/><text x=\"40\" y=\"45\" fill=\"#4A90E2\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"bold\">$</text></svg>:tvf:2\nvalueformat:1:text-plain\nvalueformat:2:text-html"
        },
        25: {
            instruction: "Create gradient background SVG",
            plan: "Use text-html with SVG gradient definition to create colorful gradient rectangle",
            output: "cell:A1:t:<svg width=\"100\" height=\"100\"><defs><linearGradient id=\"grad1\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"100%\"><stop offset=\"0%\" style=\"stop-color\\crgb(255,255,0);stop-opacity\\c1\" /><stop offset=\"100%\" style=\"stop-color\\crgb(255,0,0);stop-opacity\\c1\" /></linearGradient></defs><rect width=\"100\" height=\"100\" fill=\"url(#grad1)\" /></svg>:tvf:1\nvalueformat:1:text-html"
        },
        26: {
            instruction: "Create signature section with image and text",
            plan: "Use text-html for signature image and text-plain for name and title",
            output: "cell:A1:t:<img src=\"https\\c//example.com/signature.png\" width=\"200\" height=\"60\" alt=\"Signature\" />:tvf:1\ncell:A2:t:John Doe:tvf:2\ncell:A3:t:CEO:tvf:2\nvalueformat:1:text-html\nvalueformat:2:text-plain"
        },
        27: {
            instruction: "Create brand name with SVG text styling",
            plan: "Use text-html with SVG text element for styled brand typography",
            output: "cell:A1:t:<svg width=\"120\" height=\"40\"><text x=\"10\" y=\"25\" font-family=\"Arial\" font-size=\"24\" font-weight=\"bold\" fill=\"#333\">BrandName</text></svg>:tvf:1\nvalueformat:1:text-html"
        },
        28: {
            instruction: "Create verification checkmark icon with text",
            plan: "Use text-html with SVG checkbox and checkmark paths for verified badge",
            output: "cell:A1:t:<svg width=\"50\" height=\"50\"><g><rect x=\"5\" y=\"5\" width=\"40\" height=\"40\" fill=\"none\" stroke=\"black\" stroke-width=\"3\"/><line x1=\"15\" y1=\"25\" x2=\"25\" y2=\"35\" stroke=\"green\" stroke-width=\"3\"/><line x1=\"25\" y1=\"35\" x2=\"40\" y2=\"15\" stroke=\"green\" stroke-width=\"3\"/></g></svg>:tvf:1\ncell:B1:t:Verified\nvalueformat:1:text-html"
        },
        29: {
            instruction: "Create profile display with image and name",
            plan: "Use text-html with div containing rounded image and inline text",
            output: "cell:A1:t:<div><img src=\"https\\c//cdn.example.com/profile.jpg\" width=\"50\" height=\"50\" style=\"border-radius\\c50%;\" /><span style=\"margin-left\\c10px;\">John Smith</span></div>:tvf:1\nvalueformat:1:text-html"
        },
        30: {
            instruction: "Create comprehensive company logo with SVG",
            plan: "Use text-html with complex SVG including background, text, and decorative circles",
            output: "cell:A1:t:<svg width=\"200\" height=\"100\" xmlns=\"http\\c//www.w3.org/2000/svg\"><rect width=\"200\" height=\"100\" fill=\"#2E86AB\"/><text x=\"100\" y=\"50\" font-family=\"Verdana\" font-size=\"28\" fill=\"white\" text-anchor=\"middle\" alignment-baseline=\"middle\">TechCorp</text><circle cx=\"30\" cy=\"30\" r=\"15\" fill=\"#A23B72\"/><circle cx=\"170\" cy=\"70\" r=\"15\" fill=\"#F18F01\"/></svg>:tvf:1\nvalueformat:1:text-html"
        }
    };

    return trainingData[fileNum] || null;
}

// Process MSC files (1-30)
const processedFiles = [];
for (let i = 1; i <= 30; i++) {
    const mscFile = path.join(formatTextDir, `${i}.msc`);

    if (!fs.existsSync(mscFile)) {
        console.log(`⚠️  Skipping ${i}.msc (not found)`);
        continue;
    }

    const mscContent = fs.readFileSync(mscFile, 'utf8');

    // Create JSON structure
    const jsonData = {
        "numsheets": 1,
        "currentid": "sheet1",
        "sheetArr": {
            "sheet1": {
                "sheetstr": {
                    "savestr": mscContent
                }
            }
        }
    };

    // Write JSON file
    const jsonFile = path.join(jsonDir, `${i}.json`);
    fs.writeFileSync(jsonFile, JSON.stringify(jsonData, null, 2));

    processedFiles.push(i);
    console.log(`✅ Converted ${i}.msc → ${i}.json`);
}

console.log(`\n📊 Converted ${processedFiles.length} MSC files to JSON\n`);

// Generate training data JSONL
const trainingFile = path.join(formatTextDir, 'format_text_training.jsonl');
let trainingCount = 0;

const trainingLines = [];
for (let i = 1; i <= 30; i++) {
    const training = generateTrainingData(i);
    if (training) {
        const jsonLine = JSON.stringify({
            instruction: training.instruction,
            input: "",
            output: `version:1.5\n${training.output}\nsheet:c:1:r:1`,
            plan: training.plan
        });
        trainingLines.push(jsonLine);
        trainingCount++;
    }
}

fs.writeFileSync(trainingFile, trainingLines.join('\n'));
console.log(`✅ Generated ${trainingCount} training examples → format_text_training.jsonl\n`);

console.log('🎉 Conversion complete!');
console.log(`   JSON files: ${jsonDir}`);
console.log(`   Training data: ${trainingFile}`);
