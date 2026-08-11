// ════════════════════════════════════════════════════════════════════
// ◆  03-tags.js — TagsCliente
// ════════════════════════════════════════════════════════════════════

function TagsCliente({
  cliente,
  ventas,
  style
}) {
  const cl = cliente;
  const TH = {
    background: "rgba(56,138,221,0.28)",
    color: "#ffffff",
    border: "1px solid rgba(56,138,221,0.5)",
    borderRadius: 6,
    padding: "3px 9px",
    fontSize: 13,
    fontWeight: 700,
    display: "inline-block"
  };
  const TP = {
    background: "rgba(245,158,11,0.28)",
    color: "#ffffff",
    border: "1px solid rgba(245,158,11,0.55)",
    borderRadius: 6,
    padding: "3px 9px",
    fontSize: 13,
    fontWeight: 700,
    display: "inline-block"
  };
  const TD = {
    background: "rgba(226,75,74,0.25)",
    color: "#ffffff",
    border: "1px solid rgba(226,75,74,0.5)",
    borderRadius: 6,
    padding: "3px 9px",
    fontSize: 13,
    fontWeight: 700,
    display: "inline-block"
  };
  const TF = {
    background: "rgba(29,158,117,0.25)",
    color: "#ffffff",
    border: "1px solid rgba(29,158,117,0.5)",
    borderRadius: 6,
    padding: "3px 9px",
    fontSize: 13,
    fontWeight: 700,
    display: "inline-block"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 5,
      ...(style || {})
    }
  }, (() => {
    const real = {
      sifon: Math.max(0, (Number(cl.sifon) || 0) + prestadoClienteDe(cl, "sifon", ventas)),
      b10: Math.max(0, (Number(cl.bidon10) || 0) + prestadoClienteDe(cl, "bidon10", ventas)),
      b20: Math.max(0, (Number(cl.bidon20) || 0) + prestadoClienteDe(cl, "bidon20", ventas))
    };
    return /*#__PURE__*/React.createElement(React.Fragment, null, real.sifon > 0 && /*#__PURE__*/React.createElement("span", {
      style: TH
    }, "Sif ×", real.sifon), real.b10 > 0 && /*#__PURE__*/React.createElement("span", {
      style: TH
    }, "10L ×", real.b10), real.b20 > 0 && /*#__PURE__*/React.createElement("span", {
      style: TH
    }, "20L ×", real.b20), cl.dispenser > 0 && /*#__PURE__*/React.createElement("span", {
      style: TH
    }, "Disp ×", cl.dispenser));
  })(), (cl.saldo || 0) < 0 && /*#__PURE__*/React.createElement("span", {
    style: TD
  }, "Debe ", fmt(Math.abs(cl.saldo))), (cl.saldo || 0) > 0 && /*#__PURE__*/React.createElement("span", {
    style: TF
  }, "A favor ", fmt(cl.saldo)));
}

// ─── Cloud Storage (Firebase Firestore) ─────────────────────────────────────