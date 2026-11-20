# -*- coding: utf-8 -*-
path = "08-menu.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

edits = []  # (old, new, label, expected_count)
def do(old, new, label, expected=1):
    edits.append((old, new, label, expected))

# EDIT 1: top setup -- CAJON_SODA..prodKey block.
old1 = (
'  const CAJON_SODA = 6;\n'
'  const getProdCosto = nombre => {\n'
'    const p = (productos || []).find(x => x.nombre === nombre);\n'
'    return p ? p.costo || 0 : 0;\n'
'  };\n'
'  const costSifon = getProdCosto("Sifón 1.5L") || 133.33;\n'
'  const costB10 = getProdCosto("Bidón 10L") || 800;\n'
'  const costB20 = getProdCosto("Bidón 20L") || 1100;\n'
'  const COSTO_CAJON_SODA = costSifon * CAJON_SODA;\n'
'  const prodKey = {\n'
'    "Bidón 10L": "b10",\n'
'    "Bidón 20L": "b20",\n'
'    "Sifón 1.5L": "soda"\n'
'  };'
)
new1 = (
'  // Pedido de Guillermo (19/11/2026, portado de La Catalina): el cierre\n'
'  // del dia usaba 3 claves cortas fijas (soda/b10/b20) sin relacion con\n'
'  // las de stock, y dejaba afuera cualquier producto nuevo. Ahora se arma\n'
'  // sola, a partir de los productos reales marcados para ir al camion\n'
'  // (ver productosDeCarga/claveCargaDeProducto en 04-utils.js).\n'
'  const productosCarga = productosDeCarga(productos);\n'
'  const clavesCarga = productosCarga.map(claveCargaDeProducto);\n'
'  const ceroCarga = () => Object.fromEntries(clavesCarga.map(k => [k, 0]));\n'
'  const ceroCargaSk = () => Object.fromEntries(productosCarga.map(p => [claveStockDeProducto(p), 0]));\n'
'  const dispProd = (productos || []).find(p => p.esDispenser);\n'
'  const dispNombre = dispProd ? dispProd.nombre : "Dispenser";\n'
'  const nombreAPk = Object.fromEntries(productosCarga.map(p => [p.nombre, claveCargaDeProducto(p)]));\n'
'  const labelCorto = p => (p && p.nombre || "").replace(" 1.5L", "");\n'
'  const CAJON_SODA = 6;\n'
'  const getProdCosto = nombre => {\n'
'    const p = (productos || []).find(x => x.nombre === nombre);\n'
'    return p ? p.costo || 0 : 0;\n'
'  };\n'
'  const costSifon = getProdCosto("Sifón 1.5L") || 133.33;\n'
'  const costB10 = getProdCosto("Bidón 10L") || 800;\n'
'  const costB20 = getProdCosto("Bidón 20L") || 1100;\n'
'  const COSTO_CAJON_SODA = costSifon * CAJON_SODA;\n'
'  const prodKey = nombreAPk;'
)
do(old1, new1, "Edit1 top setup")

# EDIT 2: totalesPorProd fixed -> dynamic.
old2 = (
'  const totalesPorProd = {\n'
'    b10: {\n'
'      vacios: 0,\n'
'      plata: 0,\n'
'      llenar: 0\n'
'    },\n'
'    b20: {\n'
'      vacios: 0,\n'
'      plata: 0,\n'
'      llenar: 0\n'
'    },\n'
'    soda: {\n'
'      vacios: 0,\n'
'      plata: 0,\n'
'      llenar: 0,\n'
'      cajones: 0\n'
'    }\n'
'  };'
)
new2 = (
'  const totalesPorProd = Object.fromEntries(clavesCarga.map(pk => [\n'
'    pk,\n'
'    pk === "soda" ? { vacios: 0, plata: 0, llenar: 0, cajones: 0 } : { vacios: 0, plata: 0, llenar: 0 }\n'
'  ]));'
)
do(old2, new2, "Edit2 totalesPorProd")

# EDIT 3: add forEach after totalesPorProd.b20.llenar line, for new products.
old3 = (
'  totalesPorProd.soda.llenar = sodaCajones * COSTO_CAJON_SODA;\n'
'  totalesPorProd.b10.llenar = totalesPorProd.b10.vacios * costB10;\n'
'  totalesPorProd.b20.llenar = totalesPorProd.b20.vacios * costB20;'
)
new3 = (
'  totalesPorProd.soda.llenar = sodaCajones * COSTO_CAJON_SODA;\n'
'  totalesPorProd.b10.llenar = totalesPorProd.b10.vacios * costB10;\n'
'  totalesPorProd.b20.llenar = totalesPorProd.b20.vacios * costB20;\n'
'  productosCarga.forEach(p => {\n'
'    const pk = claveCargaDeProducto(p);\n'
'    if (pk === "soda" || pk === "b10" || pk === "b20") return;\n'
'    totalesPorProd[pk].llenar = totalesPorProd[pk].vacios * (p.costo || 0);\n'
'  });'
)
do(old3, new3, "Edit3 llenar nuevos productos")

# EDIT 4: pesoAuto/bultosAuto -> + pesoExtra/bultosExtra.
old4 = (
'  const sifonesCargados = Number(planilla?.productos?.soda?.llenos || 0);\n'
'  const b10Cargados = Number(planilla?.productos?.b10?.llenos || 0);\n'
'  const b20Cargados = Number(planilla?.productos?.b20?.llenos || 0);\n'
'  const cajonesCargados = calcCajones(sifonesCargados);\n'
'  const pesoAuto = cajonesCargados * 13 + b10Cargados * 10 + b20Cargados * 20;\n'
'  const bultosAuto = cajonesCargados + b10Cargados + b20Cargados;'
)
new4 = (
'  const sifonesCargados = Number(planilla?.productos?.soda?.llenos || 0);\n'
'  const b10Cargados = Number(planilla?.productos?.b10?.llenos || 0);\n'
'  const b20Cargados = Number(planilla?.productos?.b20?.llenos || 0);\n'
'  const cajonesCargados = calcCajones(sifonesCargados);\n'
'  // Pedido de Guillermo (19/11/2026, portado de La Catalina): el peso/bultos\n'
'  // es solo un dato informativo de cuanto lleva el camion. Un producto\n'
'  // nuevo suma su propio peso SOLO si se le cargo un "peso" (kg por\n'
'  // unidad) al crearlo -- si no, no inventa un numero, no suma nada.\n'
'  const otrosProdsPeso = productosCarga.filter(p => !["soda", "b10", "b20"].includes(claveCargaDeProducto(p)));\n'
'  const pesoExtra = otrosProdsPeso.reduce((acc, p) => acc + Number(planilla?.productos?.[claveCargaDeProducto(p)]?.llenos || 0) * (Number(p.peso) || 0), 0);\n'
'  const bultosExtra = otrosProdsPeso.reduce((acc, p) => acc + Number(planilla?.productos?.[claveCargaDeProducto(p)]?.llenos || 0), 0);\n'
'  const pesoAuto = cajonesCargados * 13 + b10Cargados * 10 + b20Cargados * 20 + pesoExtra;\n'
'  const bultosAuto = cajonesCargados + b10Cargados + b20Cargados + bultosExtra;'
)
do(old4, new4, "Edit4 peso/bultos extra")

# EDIT 5: planKeyToStockKey fixed -> dynamic.
old5 = (
'  const planKeyToStockKey = {\n'
'    "soda": "sifon",\n'
'    "b10": "bidon10",\n'
'    "b20": "bidon20"\n'
'  };'
)
new5 = '  const planKeyToStockKey = Object.fromEntries(productosCarga.map(p => [claveCargaDeProducto(p), claveStockDeProducto(p)]));'
do(old5, new5, "Edit5 planKeyToStockKey")

# EDIT 6: PROD_LABEL fixed -> dynamic.
old6 = (
'  const PROD_LABEL = {\n'
'    soda: "Sifones",\n'
'    b10: "Bidón 10L",\n'
'    b20: "Bidón 20L"\n'
'  };'
)
new6 = '  const PROD_LABEL = Object.fromEntries(productosCarga.map(p => [claveCargaDeProducto(p), claveCargaDeProducto(p) === "soda" ? "Sifones" : p.nombre]));'
do(old6, new6, "Edit6 PROD_LABEL")

# EDIT 7: realesLlenos/realesVacios/realesParaLlenar init -> dynamico (string vacio).
old7 = (
'  const [realesLlenos, setRealesLlenos] = useState({\n'
'    soda: "",\n'
'    b10: "",\n'
'    b20: ""\n'
'  });\n'
'  const [realesVacios, setRealesVacios] = useState({\n'
'    soda: "",\n'
'    b10: "",\n'
'    b20: ""\n'
'  });\n'
'  const [realesParaLlenar, setRealesParaLlenar] = useState({\n'
'    soda: "",\n'
'    b10: "",\n'
'    b20: ""\n'
'  });'
)
new7 = (
'  const ceroCargaStr = () => Object.fromEntries(clavesCarga.map(k => [k, ""]));\n'
'  const [realesLlenos, setRealesLlenos] = useState(ceroCargaStr());\n'
'  const [realesVacios, setRealesVacios] = useState(ceroCargaStr());\n'
'  const [realesParaLlenar, setRealesParaLlenar] = useState(ceroCargaStr());'
)
do(old7, new7, "Edit7 reales* init")

# EDIT 8: guardarCapacidadFija default.
old8 = '  if (!s2.capacidadFija) s2.capacidadFija = { soda: 0, b10: 0, b20: 0 };'
new8 = '  if (!s2.capacidadFija) s2.capacidadFija = ceroCarga();'
do(old8, new8, "Edit8 capacidadFija default")

# EDIT 9: llenosCargados fixed -> dynamic.
old9 = (
'  const llenosCargados = {\n'
'    soda: Number(datos.productos?.soda?.llenos || 0),\n'
'    b10: Number(datos.productos?.b10?.llenos || 0),\n'
'    b20: Number(datos.productos?.b20?.llenos || 0)\n'
'  };'
)
new9 = '  const llenosCargados = Object.fromEntries(clavesCarga.map(pk => [pk, Number(datos.productos?.[pk]?.llenos || 0)]));'
do(old9, new9, "Edit9 llenosCargados")

# EDIT 10: vendidosDia fixed -> dynamic.
old10 = (
'  const vendidosDia = {\n'
'    soda: 0,\n'
'    b10: 0,\n'
'    b20: 0,\n'
'    disp: 0\n'
'  };'
)
new10 = '  const vendidosDia = { ...ceroCarga(), disp: 0 };'
do(old10, new10, "Edit10 vendidosDia")

# EDIT 11: prestadosDia/devueltosDia fixed -> dynamic.
old11 = (
'  const prestadosDia = {\n'
'      soda: 0,\n'
'      b10: 0,\n'
'      b20: 0,\n'
'      disp: 0\n'
'    },\n'
'    devueltosDia = {\n'
'      soda: 0,\n'
'      b10: 0,\n'
'      b20: 0,\n'
'      disp: 0\n'
'    };'
)
new11 = (
'  const prestadosDia = { ...ceroCarga(), disp: 0 },\n'
'    devueltosDia = { ...ceroCarga(), disp: 0 };'
)
do(old11, new11, "Edit11 prestadosDia/devueltosDia")

# EDIT 12a/12b: los 7 ["soda","b10","b20"] restantes (el de filas se hace en Edit18).
old12a = '["soda", "b10", "b20"].forEach(pk => {'
new12a = 'clavesCarga.forEach(pk => {'
do(old12a, new12a, "Edit12a forEach x6", expected=6)

old12b = '["soda", "b10", "b20"].some(pk => diffDeposito[pk] !== 0)'
new12b = 'clavesCarga.some(pk => diffDeposito[pk] !== 0)'
do(old12b, new12b, "Edit12b some")

# EDIT 14: enClientesPrestado init.
old14 = '  const enClientesPrestado = { soda: 0, b10: 0, b20: 0 };'
new14 = '  const enClientesPrestado = ceroCarga();'
do(old14, new14, "Edit14 enClientesPrestado")

# EDIT 15: CAPACIDAD_FIJA fixed -> dynamic.
old15 = (
'  const CAPACIDAD_FIJA = stock?.capacidadFija && (stock.capacidadFija.soda || stock.capacidadFija.b10 || stock.capacidadFija.b20) ? stock.capacidadFija : {\n'
'    soda: (stock?.soderia?.sifon || 0) + (stock?.soderia_vacios?.sifon || 0) + enClientesPrestado.soda,\n'
'    b10: (stock?.soderia?.bidon10 || 0) + (stock?.soderia_vacios?.bidon10 || 0) + enClientesPrestado.b10,\n'
'    b20: (stock?.soderia?.bidon20 || 0) + (stock?.soderia_vacios?.bidon20 || 0) + enClientesPrestado.b20\n'
'  };'
)
new15 = (
'  const CAPACIDAD_FIJA = stock?.capacidadFija && clavesCarga.some(pk => stock.capacidadFija[pk]) ? stock.capacidadFija : Object.fromEntries(clavesCarga.map(pk => {\n'
'    const sk = planKeyToStockKey[pk];\n'
'    return [pk, (stock?.soderia?.[sk] || 0) + (stock?.soderia_vacios?.[sk] || 0) + (enClientesPrestado[pk] || 0)];\n'
'  }));'
)
do(old15, new15, "Edit15 CAPACIDAD_FIJA")

# EDIT 16: tabla Vendido/Prestado/Devuelto -- array fijo -> dinamico.
old16 = '}, h))), [["Soda", "soda"], ["10L", "b10"], ["20L", "b20"], ["Dispenser", "disp"]].map(([label, pk]) => /*#__PURE__*/React.createElement("div", {'
new16 = '}, h))), [...productosCarga.map(p => [claveCargaDeProducto(p) === "soda" ? "Soda" : labelCorto(p), claveCargaDeProducto(p)]), [dispNombre, "disp"]].map(([label, pk]) => /*#__PURE__*/React.createElement("div", {'
do(old16, new16, "Edit16 tabla vendido/prestado/devuelto")

# EDIT 17: tabla "LO QUE VUELVE A SODERIA" -- array fijo -> dinamico.
old17 = '}, [["Soda", "soda"], ["10L", "b10"], ["20L", "b20"]].map(([label, pk]) => {'
new17 = '}, productosCarga.map(p => [claveCargaDeProducto(p) === "soda" ? "Soda" : labelCorto(p), claveCargaDeProducto(p)]).map(([label, pk]) => {'
do(old17, new17, "Edit17 tabla sutoreria")

# EDIT 18: LBL/filas del cartel de movimiento de deposito.
old18 = (
'      const LBL = { soda: "Sifón", b10: "Bidón 10L", b20: "Bidón 20L" };\n'
'      const filas = ["soda", "b10", "b20"].filter(pk => diffDeposito[pk] !== 0);'
)
new18 = (
'      const LBL = Object.fromEntries(productosCarga.map(p => [claveCargaDeProducto(p), labelCorto(p)]));\n'
'      const filas = clavesCarga.filter(pk => diffDeposito[pk] !== 0);'
)
do(old18, new18, "Edit18 LBL/filas")

for old, new, label, expected in edits:
    n = src.count(old)
    assert n == expected, "%s: expected %d occurrences, found %d" % (label, expected, n)
    src = src.replace(old, new)
    print(label, "OK (%d)" % expected)

with open(path, "w", encoding="utf-8") as f:
    f.write(src)
print("08-menu.js (PlanillaDelDia head) ALL EDITS OK")
