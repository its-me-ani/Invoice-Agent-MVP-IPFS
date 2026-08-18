import json
import os
from itertools import cycle

OUTPUT_DIR = "/home/anirudh-sharma/Desktop/StarkAgent/Dataset Prep Tools/dataset/layout/basic/msc-syntax"


def create_msc_content(config):
    savestr_parts = ["version:1.5"]

    # Cells
    for coord, props in config.get("cells", {}).items():
        cell_str = f"cell:{coord}"
        b_vals = props.get("b")
        if b_vals is not None:
            b_str = ":".join(str(x) if x is not None else "" for x in b_vals)
            cell_str += f":b:{b_str}"
        for key, val in props.items():
            if key == "b":
                continue
            cell_str += f":{key}:{val}"
        savestr_parts.append(cell_str)

    # Columns
    for col, width in config.get("cols", {}).items():
        savestr_parts.append(f"col:{col}:w:{width}")

    # Sheet dimensions
    rows = config.get("rows", 12)
    cols = config.get("sheet_cols", 8)
    savestr_parts.append(f"sheet:c:{cols}:r:{rows}")

    # Definitions
    for idx, val in config.get("borders", {}).items():
        savestr_parts.append(f"border:{idx}:{val}")

    for idx, val in config.get("colors", {}).items():
        savestr_parts.append(f"color:{idx}:{val}")

    for idx, val in config.get("layouts", {}).items():
        savestr_parts.append(f"layout:{idx}:{val}")

    for idx, val in config.get("fonts", {}).items():
        savestr_parts.append(f"font:{idx}:{val}")

    for idx, val in config.get("cellformats", {}).items():
        savestr_parts.append(f"cellformat:{idx}:{val}")

    savestr = "\n".join(savestr_parts) + "\n"

    msc_dict = {
        "numsheets": 1,
        "currentid": "sheet1",
        "currentname": "sheet1",
        "sheetArr": {
            "sheet1": {
                "sheetstr": {"savestr": savestr},
                "name": "sheet1",
                "hidden": "0",
            }
        },
    }
    return json.dumps(msc_dict, indent=2)


def border_cell(all_sides=True, sides=None, border_idx=1):
    if all_sides:
        return [border_idx, border_idx, border_idx, border_idx]
    sides = sides or [False, False, False, False]
    return [border_idx if s else None for s in sides]


patterns = []
idx = 1

# Borders (1-15)
border_variants = [
    ("1px solid black on all sides", "1px solid rgb(0,0,0)", [1, 1, 1, 1]),
    ("2px solid black on all sides", "2px solid rgb(0,0,0)", [1, 1, 1, 1]),
    ("1px dotted black", "1px dotted rgb(0,0,0)", [1, 1, 1, 1]),
    ("1px dashed black", "1px dashed rgb(0,0,0)", [1, 1, 1, 1]),
    ("2px solid red", "2px solid rgb(200,0,0)", [1, 1, 1, 1]),
    ("3px double black", "3px double rgb(0,0,0)", [1, 1, 1, 1]),
    ("3px solid green", "3px solid rgb(0,128,0)", [1, 1, 1, 1]),
    ("1px solid blue", "1px solid rgb(0,0,255)", [1, 1, 1, 1]),
    ("1px solid gray", "1px solid rgb(128,128,128)", [1, 1, 1, 1]),
    ("4px solid heavy black", "4px solid rgb(0,0,0)", [1, 1, 1, 1]),
    ("top border only", "1px solid rgb(0,0,0)", [1, None, None, None]),
    ("right border only", "1px solid rgb(0,0,0)", [None, 1, None, None]),
    ("bottom border only", "1px solid rgb(0,0,0)", [None, None, 1, None]),
    ("left border only", "1px solid rgb(0,0,0)", [None, None, None, 1]),
    ("top and bottom borders", "2px solid rgb(0,0,0)", [1, None, 1, None]),
]
for desc, style, sides in border_variants:
    patterns.append(
        {
            "filename": f"{idx}.msc",
            "prompt": f"Single B2 cell with {desc}",
            "cells": {"B2": {"b": sides}},
            "borders": {1: style},
            "cols": {"A": 12, "B": 50},
            "sheet_cols": 6,
            "rows": 8,
        }
    )
    idx += 1

# Dimensions (16-25)
width_sets = [
    ("Column B width 30px", {"A": 12, "B": 30}),
    ("Column B width 80px", {"A": 12, "B": 80}),
    ("Columns B and C widths 40px and 90px", {"A": 12, "B": 40, "C": 90}),
    ("Columns B-D widths 25/50/75", {"A": 12, "B": 25, "C": 50, "D": 75}),
    ("Five equal columns 60px", {
     "A": 12, "B": 60, "C": 60, "D": 60, "E": 60, "F": 60}),
    ("Alternating widths 20/70/20/70",
     {"A": 12, "B": 20, "C": 70, "D": 20, "E": 70}),
    ("Narrow gutter on A (8px) and wide B (120px)", {"A": 8, "B": 120}),
    ("Square grid columns 50px across B-E",
     {"A": 10, "B": 50, "C": 50, "D": 50, "E": 50}),
    ("Wide first data col 140px then 60px", {"A": 10, "B": 140, "C": 60}),
    ("Tiny spacer column C 5px with wider neighbors",
     {"A": 12, "B": 70, "C": 5, "D": 70}),
]
for desc, cols in width_sets:
    patterns.append(
        {
            "filename": f"{idx}.msc",
            "prompt": desc,
            "cells": {"B2": {"b": [1, 1, 1, 1]}},
            "borders": {1: "1px solid rgb(0,0,0)"},
            "cols": cols,
            "sheet_cols": max(6, len(cols) + 1),
            "rows": 8,
        }
    )
    idx += 1

# Merging (26-35)
merge_patterns = [
    ("Horizontal merge across B-C", {"B2": {"b": [1, 1, 1, 1], "colspan": 2}}),
    ("Horizontal merge across B-D", {"B2": {"b": [1, 1, 1, 1], "colspan": 3}}),
    ("Vertical merge down B2:B3", {"B2": {"b": [1, 1, 1, 1], "rowspan": 2}}),
    ("Vertical merge down B2:B4", {"B2": {"b": [1, 1, 1, 1], "rowspan": 3}}),
    ("2x2 block merge starting B2", {
     "B2": {"b": [1, 1, 1, 1], "colspan": 2, "rowspan": 2}}),
    ("3x2 block merge starting B2", {
     "B2": {"b": [1, 1, 1, 1], "colspan": 3, "rowspan": 2}}),
    ("2x3 block merge starting B2", {
     "B2": {"b": [1, 1, 1, 1], "colspan": 2, "rowspan": 3}}),
    ("Cross shape with vertical B3:B5 and horizontal C4:D4", {
        "B3": {"b": [1, 1, 1, 1], "rowspan": 3},
        "C4": {"b": [1, 1, 1, 1], "colspan": 2},
    }),
    ("Header row merge B2:E2 with body cells below", {
        "B2": {"b": [1, 1, 1, 1], "colspan": 4},
        "B3": {"b": [1, 1, 1, 1]}, "C3": {"b": [1, 1, 1, 1]}, "D3": {"b": [1, 1, 1, 1]}, "E3": {"b": [1, 1, 1, 1]},
    }),
    ("Side label merge down B2:B5 with row cells C2:E5", {
        "B2": {"b": [1, 1, 1, 1], "rowspan": 4},
        **{f"{col}{row}": {"b": [1, 1, 1, 1]} for row in range(2, 6) for col in ["C", "D", "E"]}
    }),
]
for desc, cells in merge_patterns:
    patterns.append(
        {
            "filename": f"{idx}.msc",
            "prompt": f"Merge example: {desc}",
            "cells": cells,
            "borders": {1: "1px solid rgb(0,0,0)"},
            "cols": {"A": 12, "B": 60, "C": 60, "D": 60, "E": 60},
            "sheet_cols": 8,
            "rows": 10,
        }
    )
    idx += 1

# Padding & alignment (36-45)
pad_values = [
    ("5px padding middle align", "padding:5px 5px 5px 5px;vertical-align:middle;"),
    ("10px padding middle align", "padding:10px 10px 10px 10px;vertical-align:middle;"),
    ("15px padding top align", "padding:15px 15px 15px 15px;vertical-align:top;"),
    ("10px top/bottom padding only",
     "padding:10px 0px 10px 0px;vertical-align:middle;"),
    ("12px left/right padding only",
     "padding:0px 12px 0px 12px;vertical-align:middle;"),
    ("6px padding bottom align", "padding:6px 6px 6px 6px;vertical-align:bottom;"),
    ("20px padding center align", "padding:20px 20px 20px 20px;vertical-align:middle;"),
    ("Stacked padding: left 8px vs right 16px",
     "padding:8px 16px 8px 16px;vertical-align:middle;"),
    ("Compact padding 3px with top align",
     "padding:3px 3px 3px 3px;vertical-align:top;"),
    ("Wide padding 24px bottom align",
     "padding:24px 24px 24px 24px;vertical-align:bottom;"),
]
for desc, layout_val in pad_values:
    patterns.append(
        {
            "filename": f"{idx}.msc",
            "prompt": f"Single cell with {desc}",
            "cells": {"B2": {"b": [1, 1, 1, 1], "l": 1, "t": desc}},
            "borders": {1: "1px solid rgb(0,0,0)"},
            "layouts": {1: layout_val},
            "cols": {"A": 12, "B": 120},
            "cellformats": {1: "center"},
            "sheet_cols": 6,
            "rows": 8,
        }
    )
    idx += 1

# Background color basics (46-55)
bg_colors = [
    ("light gray background", "rgb(240,240,240)"),
    ("soft yellow background", "rgb(255,255,200)"),
    ("pale blue background", "rgb(220,235,255)"),
    ("mint background", "rgb(210,245,225)"),
    ("peach background", "rgb(255,228,210)"),
    ("lavender background", "rgb(235,230,250)"),
    ("light cyan background", "rgb(224,255,255)"),
    ("light pink background", "rgb(255,228,240)"),
    ("sand background", "rgb(245,245,220)"),
    ("ghost white background", "rgb(248,248,255)"),
]
for desc, color in bg_colors:
    patterns.append(
        {
            "filename": f"{idx}.msc",
            "prompt": f"Single cell with {desc}",
            "cells": {"B2": {"bg": 1, "b": [1, 1, 1, 1]}},
            "colors": {1: color},
            "borders": {1: "1px solid rgb(0,0,0)"},
            "cols": {"A": 12, "B": 80},
            "sheet_cols": 6,
            "rows": 8,
        }
    )
    idx += 1

# Text alignment & font (56-65)
text_cases = [
    {
        "desc": "Centered label 'Center'",
        "align": "center",
        "font": "bold 11pt Arial",
        "text": "Center",
        "layout": "padding:6px 6px 6px 6px;vertical-align:middle;",
    },
    {
        "desc": "Left aligned label 'Left'",
        "align": "left",
        "font": "normal 10pt Arial",
        "text": "Left",
        "layout": "padding:6px 6px 6px 6px;vertical-align:middle;",
    },
    {
        "desc": "Right aligned label 'Right'",
        "align": "right",
        "font": "normal 10pt Arial",
        "text": "Right",
        "layout": "padding:6px 6px 6px 6px;vertical-align:middle;",
    },
    {
        "desc": "Top aligned text with 8pt",
        "align": "center",
        "font": "normal 8pt Verdana",
        "text": "Top text",
        "layout": "padding:6px 6px 6px 6px;vertical-align:top;",
    },
    {
        "desc": "Bottom aligned text with 12pt",
        "align": "center",
        "font": "normal 12pt Georgia",
        "text": "Bottom text",
        "layout": "padding:6px 6px 6px 6px;vertical-align:bottom;",
    },
    {
        "desc": "Bold header in 14pt",
        "align": "center",
        "font": "bold 14pt Times New Roman",
        "text": "Header",
        "layout": "padding:8px 8px 8px 8px;vertical-align:middle;",
    },
    {
        "desc": "Italic note in 10pt",
        "align": "center",
        "font": "italic 10pt Georgia",
        "text": "Note",
        "layout": "padding:8px 8px 8px 8px;vertical-align:middle;",
    },
    {
        "desc": "Mono text 11pt",
        "align": "center",
        "font": "normal 11pt Courier New",
        "text": "Code",
        "layout": "padding:8px 8px 8px 8px;vertical-align:middle;",
    },
    {
        "desc": "Wide title with padding",
        "align": "center",
        "font": "bold 16pt Arial",
        "text": "Title",
        "layout": "padding:12px 12px 12px 12px;vertical-align:middle;",
    },
    {
        "desc": "Label with right align and 6px padding",
        "align": "right",
        "font": "normal 10pt Arial",
        "text": "Amount",
        "layout": "padding:6px 6px 6px 6px;vertical-align:middle;",
    },
]

for case in text_cases:
    patterns.append(
        {
            "filename": f"{idx}.msc",
            "prompt": case["desc"],
            "cells": {"B2": {"b": [1, 1, 1, 1], "t": case["text"], "cf": 1, "l": 1, "f": 1}},
            "borders": {1: "1px solid rgb(0,0,0)"},
            "cellformats": {1: case["align"]},
            "fonts": {1: case["font"]},
            "layouts": {1: case["layout"]},
            "cols": {"A": 12, "B": 120},
            "sheet_cols": 6,
            "rows": 8,
        }
    )
    idx += 1

# Grid patterns & backgrounds (66-80)
# Helper to build checker or stripe grids


def fill_grid(start_col, start_row, width, height, border_idx=1, color_cycle=None, vertical=False):
    cells = {}
    cols = [chr(ord(start_col) + i) for i in range(width)]
    color_iter = None
    if color_cycle:
        color_iter = cycle(color_cycle)
    for r in range(start_row, start_row + height):
        for ci, c in enumerate(cols):
            bg_idx = None
            if color_cycle:
                idx_cycle = (ci if vertical else (
                    r - start_row)) % len(color_cycle)
                bg_idx = color_cycle[idx_cycle]
            cells[f"{c}{r}"] = {
                "b": [border_idx, border_idx, border_idx, border_idx]}
            if bg_idx:
                cells[f"{c}{r}"]["bg"] = bg_idx
    return cells


pattern_grid_defs = [
    ("2x2 grid with all borders", fill_grid(
        "B", 2, 2, 2), {1: "1px solid rgb(0,0,0)"}, {}, 4),
    ("3x3 grid with all borders", fill_grid(
        "B", 2, 3, 3), {1: "1px solid rgb(0,0,0)"}, {}, 5),
    ("4x4 checker black/white", fill_grid("B", 2, 4, 4, 1, [1, 2], False), {
     1: "1px solid rgb(0,0,0)"}, {1: "rgb(30,30,30)", 2: "rgb(245,245,245)"}, 6),
    ("3x4 vertical stripes gray/white", fill_grid("B", 2, 3, 4, 1, [1, 2], True), {
     1: "1px solid rgb(0,0,0)"}, {1: "rgb(230,230,230)", 2: "rgb(255,255,255)"}, 5),
    ("5x2 header band top row shaded", fill_grid("B", 3, 5, 2),
     {1: "1px solid rgb(0,0,0)"}, {1: "rgb(235,245,255)"}, 7),
    ("2x3 with alternating pastel rows", fill_grid("B", 2, 2, 3, 1, [1, 2, 3], False), {
     1: "1px solid rgb(0,0,0)"}, {1: "rgb(255,240,245)", 2: "rgb(240,255,240)", 3: "rgb(240,248,255)"}, 5),
    ("3x3 with thick outer border", fill_grid(
        "B", 2, 3, 3), {1: "2px solid rgb(0,0,0)"}, {}, 5),
    ("2x4 with only column borders", fill_grid("B", 2, 2, 4),
     {1: "1px solid rgb(0,0,0)"}, {}, 4, True),
    ("Row stripe table 4x3 light blue bands", fill_grid("B", 2, 4, 3, 1, [1, 2], False), {
     1: "1px solid rgb(0,0,0)"}, {1: "rgb(225,240,255)", 2: "rgb(245,250,255)"}, 6),
    ("Column stripe table 4x3 warm grays", fill_grid("B", 2, 4, 3, 1, [1, 2], True), {
     1: "1px solid rgb(0,0,0)"}, {1: "rgb(245,245,245)", 2: "rgb(235,235,235)"}, 6),
    ("3x3 with center cell highlighted", {**fill_grid("B", 2, 3, 3), "C3": {"b": [
     1, 1, 1, 1], "bg": 2}}, {1: "1px solid rgb(0,0,0)"}, {2: "rgb(255,250,205)"}, 5),
    ("2x2 with diagonally different colors", {"B2": {"b": [1, 1, 1, 1], "bg": 1}, "C2": {"b": [1, 1, 1, 1], "bg": 2}, "B3": {"b": [
     1, 1, 1, 1], "bg": 2}, "C3": {"b": [1, 1, 1, 1], "bg": 1}}, {1: "1px solid rgb(0,0,0)"}, {1: "rgb(250,240,230)", 2: "rgb(230,245,255)"}, 4),
    ("3x2 grid with first column bold border", fill_grid("B", 2, 3, 2),
     {1: "1px solid rgb(0,0,0)", 2: "2px solid rgb(0,0,0)"}, {}, 5),
    ("4x2 grid with bottom row shaded", {**fill_grid("B", 2, 4, 2), **{f"{chr(ord('B')+c)}3": {"b": [
     1, 1, 1, 1], "bg": 1} for c in range(4)}}, {1: "1px solid rgb(0,0,0)"}, {1: "rgb(235,245,255)"}, 6),
    ("2x5 tall list with alternating shading", fill_grid("B", 2, 2, 5, 1, [1, 2], False), {
     1: "1px solid rgb(0,0,0)"}, {1: "rgb(250,250,250)", 2: "rgb(235,235,235)"}, 5),
]

for desc, cells, borders, colors, sheet_cols, *rest in pattern_grid_defs:
    patterns.append(
        {
            "filename": f"{idx}.msc",
            "prompt": desc,
            "cells": cells,
            "borders": borders,
            "colors": colors,
            "cols": {"A": 10, "B": 60, "C": 60, "D": 60, "E": 60, "F": 60},
            "sheet_cols": sheet_cols,
            "rows": 12,
        }
    )
    idx += 1

# Mixed layout teaching blocks (81-95)
mixed_defs = [
    ("Merged header over 3 cols with border and padding", {
        "B2": {"b": [1, 1, 1, 1], "colspan": 3, "t": "Header", "cf": 1, "f": 1, "l": 1},
        "B3": {"b": [1, 1, 1, 1]}, "C3": {"b": [1, 1, 1, 1]}, "D3": {"b": [1, 1, 1, 1]},
    }, {1: "1px solid rgb(0,0,0)"}, {}, {1: "center"}, {1: "bold 12pt Arial"}, {1: "padding:10px 10px 10px 10px;vertical-align:middle;"}, {"A": 10, "B": 70, "C": 70, "D": 70}),
    ("Left sidebar merged rows with shaded background", {
        "B2": {"b": [1, 1, 1, 1], "rowspan": 4, "bg": 1},
        **{f"C{r}": {"b": [1, 1, 1, 1]} for r in range(2, 6)},
        **{f"D{r}": {"b": [1, 1, 1, 1]} for r in range(2, 6)},
    }, {1: "1px solid rgb(0,0,0)"}, {1: "rgb(235,245,255)"}, {}, {}, {}, {"A": 10, "B": 80, "C": 80, "D": 80}),
    ("Two-column layout with different padding", {
        "B2": {"b": [1, 1, 1, 1], "l": 1, "t": "Left"},
        "C2": {"b": [1, 1, 1, 1], "l": 2, "t": "Right"},
    }, {1: "1px solid rgb(0,0,0)"}, {}, {1: "center"}, {1: "normal 10pt Arial"}, {1: "padding:6px 12px 6px 12px;vertical-align:middle;", 2: "padding:12px 6px 12px 6px;vertical-align:middle;"}, {"A": 12, "B": 90, "C": 90}),
    ("Top border only row of 3 cells", {"B2": {"b": [1, None, None, None]}, "C2": {"b": [1, None, None, None]}, "D2": {
     "b": [1, None, None, None]}}, {1: "2px solid rgb(0,0,0)"}, {}, {}, {}, {}, {"A": 10, "B": 70, "C": 70, "D": 70}),
    ("Bottom border only row of 3 cells", {"B2": {"b": [None, None, 1, None]}, "C2": {"b": [None, None, 1, None]}, "D2": {
     "b": [None, None, 1, None]}}, {1: "2px solid rgb(0,0,0)"}, {}, {}, {}, {}, {"A": 10, "B": 70, "C": 70, "D": 70}),
    ("Alternating column backgrounds with no borders", {
        "B2": {"bg": 1}, "C2": {"bg": 2}, "D2": {"bg": 1}, "E2": {"bg": 2}
    }, {}, {1: "rgb(245,245,245)", 2: "rgb(230,230,230)"}, {}, {}, {}, {"A": 10, "B": 60, "C": 60, "D": 60, "E": 60}),
    ("Outline table with header shade", {
        "B2": {"b": [1, 1, 1, 1], "colspan": 3, "bg": 1},
        **{f"{col}3": {"b": [1, 1, 1, 1]} for col in ["B", "C", "D"]},
    }, {1: "1px solid rgb(0,0,0)"}, {1: "rgb(235,245,255)"}, {}, {}, {}, {"A": 10, "B": 70, "C": 70, "D": 70}),
    ("Four-cell block with different border weights", {
        "B2": {"b": [1, 2, 1, 2]}, "C2": {"b": [2, 1, 2, 1]},
        "B3": {"b": [2, 1, 2, 1]}, "C3": {"b": [1, 2, 1, 2]},
    }, {1: "1px solid rgb(0,0,0)", 2: "2px solid rgb(0,0,0)"}, {}, {}, {}, {}, {"A": 10, "B": 70, "C": 70}),
    ("Two-row layout with top padding heavier", {
        "B2": {"b": [1, 1, 1, 1], "l": 1, "t": "Top"},
        "B3": {"b": [1, 1, 1, 1], "l": 2, "t": "Bottom"},
    }, {1: "1px solid rgb(0,0,0)"}, {}, {1: "center"}, {1: "bold 11pt Arial"}, {1: "padding:14px 10px 6px 10px;vertical-align:middle;", 2: "padding:6px 10px 14px 10px;vertical-align:middle;"}, {"A": 12, "B": 120}),
    ("Thick outline with inner thin grid", {
        **fill_grid("B", 2, 3, 3),
    }, {1: "1px solid rgb(0,0,0)", 2: "3px solid rgb(0,0,0)"}, {}, {}, {}, {}, {"A": 10, "B": 60, "C": 60, "D": 60}),
    ("Three columns with alternating padding and background", {
        "B2": {"b": [1, 1, 1, 1], "l": 1, "bg": 1, "t": "A"},
        "C2": {"b": [1, 1, 1, 1], "l": 2, "bg": 2, "t": "B"},
        "D2": {"b": [1, 1, 1, 1], "l": 1, "bg": 1, "t": "C"},
    }, {1: "1px solid rgb(0,0,0)"}, {1: "rgb(245,245,245)", 2: "rgb(230,240,255)"}, {1: "center"}, {1: "normal 11pt Arial"}, {1: "padding:6px 10px 6px 10px;vertical-align:middle;", 2: "padding:10px 6px 10px 6px;vertical-align:middle;"}, {"A": 10, "B": 70, "C": 70, "D": 70}),
    ("Two-column comparison with different font weights", {
        "B2": {"b": [1, 1, 1, 1], "t": "Left", "f": 1, "cf": 1},
        "C2": {"b": [1, 1, 1, 1], "t": "Right", "f": 2, "cf": 1},
    }, {1: "1px solid rgb(0,0,0)"}, {}, {1: "center"}, {1: "normal 11pt Arial", 2: "bold 11pt Arial"}, {}, {"A": 12, "B": 80, "C": 80}),
    ("Row of three with only outer borders", {
        "B2": {"b": [1, None, None, 1]}, "C2": {"b": [None, None, None, None]}, "D2": {"b": [1, 1, None, None]},
    }, {1: "2px solid rgb(0,0,0)"}, {}, {}, {}, {}, {"A": 10, "B": 70, "C": 70, "D": 70}),
    ("Card with title and body padding", {
        "B2": {"b": [1, 1, None, 1], "t": "Title", "f": 1, "cf": 1, "l": 1},
        "B3": {"b": [None, 1, 1, 1], "t": "Body", "l": 2},
    }, {1: "1px solid rgb(0,0,0)"}, {}, {1: "center"}, {1: "bold 12pt Arial"}, {1: "padding:10px 10px 4px 10px;vertical-align:middle;", 2: "padding:12px 12px 12px 12px;vertical-align:top;"}, {"A": 12, "B": 140}),
]

for desc, cells, borders, colors, cellformats, fonts, layouts, cols in mixed_defs:
    patterns.append(
        {
            "filename": f"{idx}.msc",
            "prompt": desc,
            "cells": cells,
            "borders": borders,
            "cellformats": cellformats,
            "fonts": fonts,
            "layouts": layouts,
            "cols": cols,
            "colors": colors,
            "sheet_cols": max(6, len(cols) + 1),
            "rows": 12,
        }
    )
    idx += 1

# Advanced teaching (96-100)
advanced_defs = [
    ("Dashboard: merged header, two columns, shaded sidebar", {
        "B2": {"b": [1, 1, 1, 1], "colspan": 4, "t": "Dashboard", "f": 1, "cf": 1, "l": 1, "bg": 1},
        "B3": {"b": [1, 1, 1, 1], "rowspan": 4, "bg": 2},
        "C3": {"b": [1, 1, 1, 1]}, "D3": {"b": [1, 1, 1, 1]}, "E3": {"b": [1, 1, 1, 1]},
        "C4": {"b": [1, 1, 1, 1]}, "D4": {"b": [1, 1, 1, 1]}, "E4": {"b": [1, 1, 1, 1]},
        "C5": {"b": [1, 1, 1, 1]}, "D5": {"b": [1, 1, 1, 1]}, "E5": {"b": [1, 1, 1, 1]},
        "C6": {"b": [1, 1, 1, 1]}, "D6": {"b": [1, 1, 1, 1]}, "E6": {"b": [1, 1, 1, 1]},
    }, {1: "1px solid rgb(0,0,0)"}, {1: "rgb(235,245,255)", 2: "rgb(245,245,245)"}, {1: "center"}, {1: "bold 14pt Arial"}, {1: "padding:12px 12px 12px 12px;vertical-align:middle;"}, {"A": 10, "B": 60, "C": 90, "D": 90, "E": 90}),
    ("Invoice header: merged title and two detail rows", {
        "B2": {"b": [1, 1, 1, 1], "colspan": 3, "t": "Invoice", "f": 1, "cf": 1, "bg": 1, "l": 1},
        "B3": {"b": [1, 1, 1, 1], "t": "Bill To", "f": 2, "cf": 1},
        "C3": {"b": [1, 1, 1, 1]}, "D3": {"b": [1, 1, 1, 1]},
        "B4": {"b": [1, 1, 1, 1], "t": "Ship To", "f": 2, "cf": 1},
        "C4": {"b": [1, 1, 1, 1]}, "D4": {"b": [1, 1, 1, 1]},
    }, {1: "1px solid rgb(0,0,0)"}, {1: "rgb(240,248,255)"}, {1: "center"}, {1: "bold 14pt Georgia", 2: "bold 10pt Georgia"}, {1: "padding:10px 10px 10px 10px;vertical-align:middle;"}, {"A": 10, "B": 90, "C": 90, "D": 90}),
    ("Comparison grid with alternating borders", {
        **fill_grid("B", 2, 3, 3),
    }, {1: "1px solid rgb(0,0,0)", 2: "2px solid rgb(0,0,0)"}, {}, {}, {}, {}, {"A": 10, "B": 70, "C": 70, "D": 70}),
    ("Checklist layout with left ticks column narrow", {
        "B2": {"b": [1, 1, 1, 1], "bg": 1},
        "C2": {"b": [1, 1, 1, 1], "t": "Item 1"},
        "B3": {"b": [1, 1, 1, 1], "bg": 1},
        "C3": {"b": [1, 1, 1, 1], "t": "Item 2"},
        "B4": {"b": [1, 1, 1, 1], "bg": 1},
        "C4": {"b": [1, 1, 1, 1], "t": "Item 3"},
    }, {1: "1px solid rgb(0,0,0)"}, {1: "rgb(235,235,235)"}, {1: "left"}, {}, {1: "padding:6px 6px 6px 6px;vertical-align:middle;"}, {"A": 10, "B": 30, "C": 140}),
    ("Kanban lanes three columns with colored headers", {
        "B2": {"b": [1, 1, 1, 1], "t": "To Do", "bg": 1, "cf": 1, "f": 1, "l": 1},
        "C2": {"b": [1, 1, 1, 1], "t": "Doing", "bg": 2, "cf": 1, "f": 1, "l": 1},
        "D2": {"b": [1, 1, 1, 1], "t": "Done", "bg": 3, "cf": 1, "f": 1, "l": 1},
        "B3": {"b": [1, 1, 1, 1]}, "C3": {"b": [1, 1, 1, 1]}, "D3": {"b": [1, 1, 1, 1]},
        "B4": {"b": [1, 1, 1, 1]}, "C4": {"b": [1, 1, 1, 1]}, "D4": {"b": [1, 1, 1, 1]},
    }, {1: "1px solid rgb(0,0,0)"}, {1: "rgb(224,255,255)", 2: "rgb(255,250,205)", 3: "rgb(232,245,233)"}, {1: "center"}, {1: "bold 11pt Arial"}, {1: "padding:8px 8px 8px 8px;vertical-align:middle;"}, {"A": 10, "B": 90, "C": 90, "D": 90}),
    ("Blank canvas with outer border and gutters", {
        "B2": {"b": [2, 2, 2, 2], "colspan": 4, "rowspan": 8},
    }, {1: "1px solid rgb(0,0,0)", 2: "2px solid rgb(0,0,0)"}, {}, {}, {}, {}, {"A": 20, "B": 200, "C": 10, "D": 10, "E": 10}),
]

for desc, cells, borders, colors, cellformats, fonts, layouts, cols in advanced_defs:
    patterns.append(
        {
            "filename": f"{idx}.msc",
            "prompt": desc,
            "cells": cells,
            "borders": borders,
            "colors": colors,
            "cellformats": cellformats,
            "fonts": fonts,
            "layouts": layouts,
            "cols": cols,
            "sheet_cols": max(6, len(cols) + 1),
            "rows": 14,
        }
    )
    idx += 1

# Ensure we produced exactly 100 patterns
assert idx == 101, f"Expected 100 patterns, got {idx-1}"

# Write files and prompt map
os.makedirs(OUTPUT_DIR, exist_ok=True)
prompt_map = {}
for item in patterns:
    content = create_msc_content(item)
    out_path = os.path.join(OUTPUT_DIR, item["filename"])
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(content)
    prompt_map[item["filename"]] = item["prompt"]

prompt_js_path = os.path.join(OUTPUT_DIR, "prompt.js")
with open(prompt_js_path, "w", encoding="utf-8") as f:
    f.write("module.exports = " + json.dumps(prompt_map, indent=2) + "\n")

print(f"Wrote {len(patterns)} MSC files to {OUTPUT_DIR}")
