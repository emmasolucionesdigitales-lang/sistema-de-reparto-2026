# -*- coding: utf-8 -*-
path = "09-clientes.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

edits = []
def do(old, new, label):
    edits.append((old, new, label))

# Edit1: agrega PRODS_BADGE justo antes del return de ClienteCard.
old1 = '''      setClienteExpandidoId(siguiente ? siguiente.id : null);
    };
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        ...s.card,
        boxShadow: "0 2px 10px rgba(0,0,0,0.35)",'''
new1 = '''      setClienteExpandidoId(siguiente ? siguiente.id : null);
    };
    // Envases (fijos + prestados) que tiene el cliente -- misma lista real
    // de productos que en Stock, asi un producto nuevo tambien aparece aca
    //  (pedido de Guillermo, 19/11/2026, portado de La Catalina).
    const PRODS_BADGE = ((productos || []).filter(p => p.trackStock !== false).map(p => [claveStockDeProducto(p), p.nombre]));
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        ...s.card,
        boxShadow: "0 2px 10px rgba(0,0,0,0.35)",'''
do(old1, new1, "Edit1 add PRODS_BADGE")

# Edit2: pills fijas -> dinamico via PRODS_BADGE.
old2 = '''    }, (() => {
      const real = {
        sifon: Math.max(0, (Number(c.sifon) || 0) + prestadoClienteDe(c, "sifon", todasVentas || ventas)),
        bidon10: Math.max(0, (Number(c.bidon10) || 0) + prestadoClienteDe(c, "bidon10", todasVentas || ventas)),
        bidon20: Math.max(0, (Number(c.bidon20) || 0) + prestadoClienteDe(c, "bidon20", todasVentas || ventas))
      };
      const pill = txt => /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 12,
          fontWeight: 600,
          padding: "4px 10px",
          borderRadius: 20,
          background: "var(--color-background-info)",
          color: "var(--color-text-primary)"
        }
      }, txt);
      return /*#__PURE__*/React.createElement(React.Fragment, null, real.sifon > 0 && pill(`Sifón×N${real.sifon}`), real.bidon10 > 0 && pill(`10L×N${real.bidon10}`), real.bidon20 > 0 && pill(`20L×N${real.bidon20}`), c.dispenser > 0 && pill(`Disp×N${c.dispenser}`));
    })(), atendido && /*#__PURE__*/React.createElement("span", {'''
new2 = '''    }, (() => {
      const pill = txt => /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 12,
          fontWeight: 600,
          padding: "4px 10px",
          borderRadius: 20,
          background: "var(--color-background-info)",
          color: "var(--color-text-primary)"
        }
      }, txt);
      return /*#__PURE__*/React.createElement(React.Fragment, null, PRODS_BADGE.map(([k, lbl]) => {
        const real = Math.max(0, (Number(c[k]) || 0) + prestadoClienteDe(c, k, todasVentas || ventas));
        return real > 0 ? /*#__PURE__*/React.createElement(React.Fragment, { key: k }, pill(`${lbl.replace(" 1.5L", "")}×N${real}`)) : null;
      }));
    })(), atendido && /*#__PURE__*/React.createElement("span", {'''
do(old2, new2, "Edit2 badge pills -> PRODS_BADGE")

# Edit3: card DetalleCliente -> dinamico.
old3 = '''  })), (() => {
    const exTotal = {
      sifon: prestadoClienteDe(cliente, "sifon", historial),
      bidon10: prestadoClienteDe(cliente, "bidon10", historial),
      bidon20: prestadoClienteDe(cliente, "bidon20", historial)
    };
    const hab = {
      sifon: cliente.sifon || 0,
      bidon10: cliente.bidon10 || 0,
      bidon20: cliente.bidon20 || 0
    };
    const total = {
      sifon: hab.sifon + exTotal.sifon,
      bidon10: hab.bidon10 + exTotal.bidon10,
      bidon20: hab.bidon20 + exTotal.bidon20
    };
    const hayExtra = exTotal.sifon !== 0 || exTotal.bidon10 !== 0 || exTotal.bidon20 !== 0;
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        ...s.card,
        margin: "0 0 10px",
        background: "var(--color-background-tertiary)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "var(--color-text-secondary)",
        marginBottom: 8
      }
    }, "📦 En poder del cliente ahora"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        flexWrap: "wrap"
      }
    }, total.sifon > 0 && /*#__PURE__*/React.createElement("div", {
      style: s.metricCard
    }, /*#__PURE__*/React.createElement("div", {
      style: s.metricLabel
    }, "Sifón"), /*#__PURE__*/React.createElement("div", {
      style: {
        ...s.metricVal,
        color: exTotal.sifon > 0 ? "var(--color-text-warning)" : exTotal.sifon < 0 ? "var(--color-text-success)" : "var(--color-text-primary)"
      }
    }, total.sifon)), total.bidon10 > 0 && /*#__PURE__*/React.createElement("div", {
      style: s.metricCard
    }, /*#__PURE__*/React.createElement("div", {
      style: s.metricLabel
    }, "10L"), /*#__PURE__*/React.createElement("div", {
      style: {
        ...s.metricVal,
        color: exTotal.bidon10 > 0 ? "var(--color-text-warning)" : exTotal.bidon10 < 0 ? "var(--color-text-success)" : "var(--color-text-primary)"
      }
    }, total.bidon10)), total.bidon20 > 0 && /*#__PURE__*/React.createElement("div", {
      style: s.metricCard
    }, /*#__PURE__*/React.createElement("div", {
      style: s.metricLabel
    }, "20L"), /*#__PURE__*/React.createElement("div", {
      style: {
        ...s.metricVal,
        color: exTotal.bidon20 > 0 ? "var(--color-text-warning)" : exTotal.bidon20 < 0 ? "var(--color-text-success)" : "var(--color-text-primary)"
      }
    }, total.bidon20)), cliente.dispenser > 0 && /*#__PURE__*/React.createElement("div", {
      style: s.metricCard
    }, /*#__PURE__*/React.createElement("div", {
      style: s.metricLabel
    }, "Dispenser"), /*#__PURE__*/React.createElement("div", {
      style: s.metricVal
    }, cliente.dispenser)), !total.sifon && !total.bidon10 && !total.bidon20 && !cliente.dispenser && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        color: "var(--color-text-tertiary)"
      }
    }, "Sin envases")), hayExtra && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "var(--color-text-tertiary)",
        marginTop: 8,
        borderTop: "0.5px solid var(--color-border-tertiary)",
        paddingTop: 6
      }
    }, (hab.sifon > 0 || hab.bidon10 > 0 || hab.bidon20 > 0) && /*#__PURE__*/React.createElement("span", null, "Habitual: ", hab.sifon > 0 ? `Sifón×N${hab.sifon} ` : "", hab.bidon10 > 0 ? `10L×N${hab.bidon10} ` : "", hab.bidon20 > 0 ? `20L×N${hab.bidon20}` : "", " · "), exTotal.sifon !== 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        color: exTotal.sifon > 0 ? "var(--color-text-warning)" : "var(--color-text-success)"
      }
    }, exTotal.sifon > 0 ? `+${exTotal.sifon} sif. extra` : ` −${Math.abs(exTotal.sifon)} sif. devueltos`, " "), exTotal.bidon10 !== 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        color: exTotal.bidon10 > 0 ? "var(--color-text-warning)" : "var(--color-text-success)"
      }
    }, exTotal.bidon10 > 0 ? `+${exTotal.bidon10} 10L extra` : ` −${Math.abs(exTotal.bidon10)} 10L devueltos`, " "), exTotal.bidon20 !== 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        color: exTotal.bidon20 > 0 ? "var(--color-text-warning)" : "var(--color-text-success)"
      }
    }, exTotal.bidon20 > 0 ? `+${exTotal.bidon20} 20L extra` : ` −${Math.abs(exTotal.bidon20)} 20L devueltos`))));
  })(), /*#__PURE__*/React.createElement("div", {'''
new3 = '''  })), (() => {
    const PRODS_DET = (productos || []).filter(p => p.trackStock !== false).map(p => [claveStockDeProducto(p), p.nombre.replace(" 1.5L", "")]);
    const exTotal = {};
    const hab = {};
    const total = {};
    PRODS_DET.forEach(([k]) => {
      exTotal[k] = prestadoClienteDe(cliente, k, historial);
      hab[k] = cliente[k] || 0;
      total[k] = hab[k] + exTotal[k];
    });
    const hayExtra = PRODS_DET.some(([k]) => exTotal[k] !== 0);
    const hayAlgunoTotal = PRODS_DET.some(([k]) => total[k] > 0);
    const metricCards = PRODS_DET.map(([k, lbl]) => total[k] > 0 ? /*#__PURE__*/React.createElement("div", {
      key: k,
      style: s.metricCard
    }, /*#__PURE__*/React.createElement("div", {
      style: s.metricLabel
    }, lbl), /*#__PURE__*/React.createElement("div", {
      style: {
        ...s.metricVal,
        color: exTotal[k] > 0 ? "var(--color-text-warning)" : exTotal[k] < 0 ? "var(--color-text-success)" : "var(--color-text-primary)"
      }
    }, total[k])) : null);
    const extraSpans = PRODS_DET.map(([k, lbl]) => exTotal[k] !== 0 ? /*#__PURE__*/React.createElement("span", {
      key: k,
      style: {
        color: exTotal[k] > 0 ? "var(--color-text-warning)" : "var(--color-text-success)"
      }
    }, exTotal[k] > 0 ? `+${exTotal[k]} ${lbl} extra ` : ` −${Math.abs(exTotal[k])} ${lbl} devueltos `) : null);
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        ...s.card,
        margin: "0 0 10px",
        background: "var(--color-background-tertiary)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: "var(--color-text-secondary)",
        marginBottom: 8
      }
    }, "📦 En poder del cliente ahora"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        flexWrap: "wrap"
      }
    }, metricCards, !hayAlgunoTotal && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        color: "var(--color-text-tertiary)"
      }
    }, "Sin envases"))), hayExtra && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "var(--color-text-tertiary)",
        marginTop: 8,
        borderTop: "0.5px solid var(--color-border-tertiary)",
        paddingTop: 6
      }
    }, PRODS_DET.some(([k]) => hab[k] > 0) && /*#__PURE__*/React.createElement("span", null, "Habitual: ", PRODS_DET.map(([k, lbl]) => hab[k] > 0 ? `${lbl}×${hab[k]} ` : "").join(""), " · "), extraSpans));
  })(), /*#__PURE__*/React.createElement("div", {'''
do(old3, new3, "Edit3 metricCards -> PRODS_DET")

for old, new, label in edits:
    n = src.count(old)
    assert n == 1, "%s: expected 1 occurrences, found %d" % (label, n)
    src = src.replace(old, new)
    print(label, "OK")

with open(path, "w", encoding="utf-8") as f:
    f.write(src)
print("09-clientes.js ALL EDITS OK")
