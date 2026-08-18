# Static Files - Modular Structure

This directory has been reorganized into a modular structure for better maintainability and organization.

## Directory Structure

```
static/
├── vendor/              # Third-party libraries
│   ├── jquery/          # jQuery and plugins (Flot charting)
│   │   ├── jquery.min.js
│   │   ├── jquery.flot.min.js
│   │   ├── jquery.flot.pie.js
│   │   ├── jquery.flot.stack.js
│   │   ├── jquery.flot.threshold.multiple.js
│   │   ├── jquery.flot.valuelabels.js
│   │   └── jquery.sparkline.min.js
│   ├── highcharts/      # Highcharts charting library
│   ├── highslide/       # Highslide image gallery
│   ├── jsxgraph/        # JSXGraph mathematical plotting
│   │   └── jsxgraphcore.js
│   └── polyfills/       # Browser compatibility polyfills
│       ├── json2.js
│       └── excanvas.min.js
│
├── socialcalc/          # Core SocialCalc spreadsheet engine
│   ├── core/            # Core engine files
│   │   ├── socialcalcconstants.js
│   │   ├── socialcalc-3.js
│   │   └── socialcalc-3.js.bk
│   ├── editors/         # Editor components
│   │   ├── socialcalctableeditor.js
│   │   └── socialcalctouch.js
│   ├── workbook/        # Multi-sheet workbook functionality
│   │   ├── socialcalcworkbook.js
│   │   ├── socialcalcworkbook.js.bk
│   │   ├── socialcalcworkbookcontrol.js
│   │   └── socialcalcworkbookcontrol.js.orig
│   ├── controls/        # UI controls
│   │   ├── socialcalcspreadsheetcontrol.js
│   │   └── socialcalcpopup.js
│   ├── utils/           # Utility functions
│   │   ├── formatnumber2.js
│   │   ├── formula1.js
│   │   └── socialcalcimages.js
│   ├── viewer/          # Read-only viewer
│   │   └── socialcalcviewer.js
│   └── graph/           # Graphing functionality
│       └── socialcalcgraph.js
│
├── data-sources/        # External data integrations
│   ├── normalizedata.js
│   ├── msndatasource.js
│   ├── smartmoneydatasource.js
│   └── statements.js
│
├── app/                 # Application-specific code
│   ├── autosave.js      # Auto-save functionality
│   ├── updater.js       # Real-time updates
│   └── paging.js        # Pagination
│
├── css/                 # Stylesheets
│   ├── socialcalc.css   # Main SocialCalc styles
│   ├── screen.css       # Screen display styles
│   ├── print.css        # Print styles
│   ├── fonts.css        # Font definitions
│   └── ie.css           # Internet Explorer fixes
│
├── images/              # Image assets
│   └── ...
│
├── test/                # Test files
│   ├── testgraph.html
│   ├── testhighcharts.html
│   ├── testsparklines.html
│   ├── testworkbook.html
│   └── urlJump.html
│
└── runappios43c/        # iOS app resources
    └── ...
```

## File Loading Order (Critical!)

The SocialCalc files must be loaded in this specific order:

1. **Core Foundation** (must load first):
   - `socialcalc/core/socialcalcconstants.js`
   - `socialcalc/core/socialcalc-3.js`

2. **Editors**:
   - `socialcalc/editors/socialcalctouch.js`
   - `socialcalc/editors/socialcalctableeditor.js`

3. **Utilities**:
   - `socialcalc/utils/formatnumber2.js`
   - `socialcalc/utils/formula1.js`

4. **Controls**:
   - `socialcalc/controls/socialcalcpopup.js`
   - `socialcalc/controls/socialcalcspreadsheetcontrol.js`

5. **Workbook** (if using multi-sheet):
   - `socialcalc/workbook/socialcalcworkbook.js`
   - `socialcalc/workbook/socialcalcworkbookcontrol.js`

6. **Additional Features**:
   - `socialcalc/utils/socialcalcimages.js`
   - `socialcalc/graph/socialcalcgraph.js` (if using graphs)

## Benefits of This Structure

1. **Clear Separation**: Vendor code vs application code vs SocialCalc engine
2. **Easy Updates**: Update third-party libraries without touching app code
3. **Better Caching**: Different cache strategies per directory
4. **Intuitive Navigation**: Developers can quickly find files
5. **Module Bundling Ready**: Can easily create bundles per category
6. **Version Control**: Easier to track changes by category

## Migration Notes

All template references have been updated to use the new paths:
- `templates/importcollabload.html` - Main application template
- `templates/base.html` - Base template
- `templates/allusersheets.html` - User sheets template
- `static/test/*.html` - Test files

The Flask `url_for('static', filename='...')` calls automatically handle the new paths.

## Testing

After modularization, verify:
1. Main application loads without console errors
2. All JavaScript functionality works
3. Stylesheets load correctly
4. Charts and graphs render properly
5. Auto-save functionality works
6. All images display correctly
