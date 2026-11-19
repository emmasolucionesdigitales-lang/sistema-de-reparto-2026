# -*- coding: utf-8 -*-
path = "09-clientes.js"
X = chr(0xD7)  # ×
ARROW = chr(0x2192)  # not used here but kept for reference

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

edits = []
def do(old, new, label):
    edits.append((old, new, label))

# Edit2: pills fijas -> dinamico via PRODS_BADGE.
old2 = (
'    }, (() => {\n'
'      const real = {\n'
'        sifon: Math.max(0, (Number(c.sifon) || 0) + prestadoClienteDe(c, "sifon", todasVentas || ventas)),\n'
'        bidon10: Math.max(0, (Number(c.bidon10) || 0) + prestadoClienteDe(c, "bidon10", todasVentas || ventas)),\n'
'        bidon20: Math.max(0, (Number(c.bidon20) || 0) + prestadoClienteDe(c, "bidon20", todasVentas || ventas))\n'
'      };\n'
'      const pill = txt => /*#__PURE__*/React.createElement("span", {\n'
'        style: {\n'
'          fontSize: 12,\n'
'          fontWeight: 600,\n'
'          padding: "4px 10px",\n'
'          borderRadius: 20,\n'
'          background: "var(--color-background-info)",\n'
'          color: "var(--color-text-primary)"\n'
'        }\n'
'      }, txt);\n'
'      return /*#__PURE__*/React.createElement(React.Fragment, null, real.sifon > 0 && pill(`Sif' + chr(0xF3) + 'n' + X + '${real.sifon}`), real.bidon10 > 0 && pill(`10L' + X + '${real.bidon10}`), real.bidon20 > 0 && pill(`20L' + X + '${real.bidon20}`), c.dispenser > 0 && pill(`Disp' + X + '${c.dispenser}`));\n'
'    })(), atendido && /*#__PURE__*/React.createElement("span", {'
)
new2 = (
'    }, (() => {\n'
'      const pill = txt => /*#__PURE__*/React.createElement("span", {\n'
'        style: {\n'
'          fontSize: 12,\n'
'          fontWeight: 600,\n'
'          padding: "4px 10px",\n'
'          borderRadius: 20,\n'
'          background: "var(--color-background-info)",\n'
'          color: "var(--color-text-primary)"\n'
'        }\n'
'      }, txt);\n'
'      return /*#__PURE__*/React.createElement(React.Fragment, null, PRODS_BADGE.map(([k, lbl]) => {\n'
'        const real = Math.max(0, (Number(c[k]) || 0) + prestadoClienteDe(c, k, todasVentas || ventas));\n'
'        return real > 0 ? /*#__PURE__*/React.createElement(React.Fragment, { key: k }, pill(`${lbl.replace(" 1.5L", "")}' + X + '${real}`)) : null;\n'
'      }));\n'
'    })(), atendido && /*#__PURE__*/React.createElement("span", {'
)
do(old2, new2, "Edit2 badge pills -> PRODS_BADGE")

n = src.count(old2)
if n != 1:
    idx = src.find('    }, (() => {\n      const real = {')
    print("DEBUG found-at", idx, "count", n)
    if idx >= 0:
        print(repr(src[idx:idx+850]))
    raise SystemExit("Edit2 mismatch, aborting (no write)")
src = src.replace(old2, new2)
print("Edit2 OK")

with open(path, "w", encoding="utf-8") as f:
    f.write(src)
print("phaseD2 ALL EDITS OK")
