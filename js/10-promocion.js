// ════════════════════════════════════════════════════════════════════
// ◆  10-promocion.js — Módulo Promoción completo
// ════════════════════════════════════════════════════════════════════

function CargaHistorica({
  clientes,
  productos,
  onGuardar,
  onVolver,
  enConfig
}) {
  const DIAS_REP = ["Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const [fecha, setFecha] = React.useState("2026-01-06");
  const [dia, setDia] = React.useState("Martes");
  const [filas, setFilas] = React.useState([]);
  const [guardando, setGuardando] = React.useState(false);
  const [guardados, setGuardados] = React.useState(0);

  // Clientes del día seleccionado
  const clientesDia = clientes.filter(c => c.dia === dia).sort((a, b) => (a.orden || 999) - (b.orden || 999));

  // Al cambiar la fecha, auto-detectar el día
  const onFechaChange = f => {
    setFecha(f);
    const d = new Date(f + 'T12:00:00');
    const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const nombreDia = dias[d.getDay()];
    if (DIAS_REP.includes(nombreDia)) setDia(nombreDia);
  };

  // Fila vacía
  const filaVacia = (clienteId = "") => ({
    clienteId,
    cantidad_sifon: 0,
    cantidad_b10: 0,
    cantidad_b20: 0,
    pago: "contado",
    monto: "",
    obs: ""
  });

  // Cargar clientes del día como filas
  const cargarClientes = () => {
    setFilas(clientesDia.map(c => filaVacia(c.id)));
  };
  const setFila = (i, campo, val) => setFilas(fs => fs.map((f, j) => j === i ? {
    ...f,
    [campo]: val
  } : f));
  const filasConVenta = filas.filter(f => f.clienteId && (f.cantidad_sifon > 0 || f.cantidad_b10 > 0 || f.cantidad_b20 > 0 || Number(f.monto) > 0));
  const guardar = () => {
    if (!filasConVenta.length) {
      alert("No hay ventas para guardar");
      return;
    }
    const nuevasVentas = [];
    const fechaKey = fecha;
    filasConVenta.forEach(f => {
      const c = clientes.find(x => x.id === f.clienteId);
      if (!c) return;
      const ps = productos || [];
      const detalle = [];
      const getSifon = ps.find(p => p.nombre === "Sifón 1.5L");
      const getB10 = ps.find(p => p.nombre === "Bidón 10L");
      const getB20 = ps.find(p => p.nombre === "Bidón 20L");
      if (f.cantidad_sifon > 0 && getSifon) detalle.push({
        nombre: getSifon.nombre,
        cantidad: Number(f.cantidad_sifon),
        precio: getSifon.precio,
        total: Number(f.cantidad_sifon) * getSifon.precio
      });
      if (f.cantidad_b10 > 0 && getB10) detalle.push({
        nombre: getB10.nombre,
        cantidad: Number(f.cantidad_b10),
        precio: getB10.precio,
        total: Number(f.cantidad_b10) * getB10.precio
      });
      if (f.cantidad_b20 > 0 && getB20) detalle.push({
        nombre: getB20.nombre,
        cantidad: Number(f.cantidad_b20),
        precio: getB20.precio,
        total: Number(f.cantidad_b20) * getB20.precio
      });
      if (!detalle.length && Number(f.monto) > 0) detalle.push({
        nombre: "Venta histórica",
        cantidad: 1,
        precio: Number(f.monto),
        total: Number(f.monto)
      });
      const bruto = detalle.reduce((a, d) => a + d.total, 0);
      const pagadoNum = Number(f.monto) || bruto;
      const saldoDelta = f.pago === "fiado" ? -bruto : pagadoNum - bruto;
      nuevasVentas.push({
        id: Date.now() + nuevasVentas.length,
        clienteId: c.id,
        cliente: c.nombre,
        dia,
        fechaKey,
        fecha: `${fecha} (historial)`,
        detalle,
        pago: f.pago,
        obs: f.obs || "Carga histórica",
        bruto,
        desc: 0,
        neto: bruto,
        costo: 0,
        ganancia: bruto,
        pagadoNum,
        saldoAplicado: 0,
        saldoDelta,
        envPrest: [],
        envDev: []
      });
    });
    setGuardando(true);
    onGuardar(nuevasVentas);
    setGuardados(g => g + nuevasVentas.length);
    setFilas([]);
    setGuardando(false);
    alert(`✅ ${nuevasVentas.length} ventas guardadas para el ${fecha}`);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: s.screen
  }, !enConfig && /*#__PURE__*/React.createElement(HeaderApp, {
    titulo: "Carga histórica",
    onVolver: onVolver
  }), !enConfig && guardados > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "4px 16px 0",
      fontSize: 12,
      color: "#4dd9a0"
    }
  }, "✓ ", guardados, " guardadas"), enConfig && guardados > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "4px 16px",
      fontSize: 12,
      color: "#4dd9a0"
    }
  }, "✓ ", guardados, " ventas guardadas"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...s.card,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 2
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Fecha del reparto"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    style: s.input,
    value: fecha,
    min: "2026-01-01",
    max: "2026-03-31",
    onChange: e => onFechaChange(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Día"), /*#__PURE__*/React.createElement("select", {
    style: s.select,
    value: dia,
    onChange: e => setDia(e.target.value)
  }, DIAS_REP.map(d => /*#__PURE__*/React.createElement("option", {
    key: d
  }, d))))), /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btnPrimary,
      width: "100%",
      padding: "12px",
      fontSize: 14
    },
    onClick: cargarClientes
  }, "📋 Cargar clientes del ", dia, " (", clientesDia.length, " clientes)")), filas.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--color-text-secondary)",
      marginBottom: 8
    }
  }, "Dejá en 0 los que no compraron ese día. Solo se guardan los que tienen cantidad o monto."), filas.map((f, i) => {
    const c = clientes.find(x => x.id === f.clienteId);
    if (!c) return null;
    const tieneVenta = f.cantidad_sifon > 0 || f.cantidad_b10 > 0 || f.cantidad_b20 > 0 || Number(f.monto) > 0;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        ...s.card,
        margin: "0 0 8px",
        borderLeft: tieneVenta ? "3px solid #4dd9a0" : "0.5px solid var(--color-border-tertiary)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 500,
        color: "var(--color-text-primary)",
        marginBottom: 8
      }
    }, c.orden && /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--color-text-tertiary)",
        fontSize: 12,
        marginRight: 6
      }
    }, "#", c.orden), c.nombre, c.sifon > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: "var(--color-text-tertiary)",
        marginLeft: 6
      }
    }, "hab: S×", c.sifon, c.bidon10 > 0 ? ` B10×${c.bidon10}` : "", c.bidon20 > 0 ? ` B20×${c.bidon20}` : "")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 6,
        marginBottom: 8
      }
    }, [["cantidad_sifon", "Sifón"], ["cantidad_b10", "Bidón 10L"], ["cantidad_b20", "Bidón 20L"]].map(([k, l]) => /*#__PURE__*/React.createElement("div", {
      key: k
    }, /*#__PURE__*/React.createElement("label", {
      style: {
        ...s.label,
        fontSize: 10
      }
    }, l), /*#__PURE__*/React.createElement("input", {
      style: {
        ...s.inputNum,
        textAlign: "center"
      },
      type: "number",
      min: 0,
      value: f[k] || "",
      placeholder: "0",
      onChange: e => setFila(i, k, Number(e.target.value) || 0)
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: {
        ...s.label,
        fontSize: 10
      }
    }, "Pago"), /*#__PURE__*/React.createElement("select", {
      style: {
        ...s.select,
        fontSize: 12
      },
      value: f.pago,
      onChange: e => setFila(i, "pago", e.target.value)
    }, [["contado", "Contado"], ["transferencia", "Transfer."], ["fiado", "Fiado"]].map(([v, l]) => /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, l)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: {
        ...s.label,
        fontSize: 10
      }
    }, "Monto cobrado $"), /*#__PURE__*/React.createElement("input", {
      style: {
        ...s.inputNum,
        textAlign: "right"
      },
      type: "number",
      min: 0,
      value: f.monto,
      placeholder: "auto",
      onChange: e => setFila(i, "monto", e.target.value)
    }))));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      ...s.card,
      margin: "8px 0",
      background: "var(--color-background-secondary)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--color-text-secondary)"
    }
  }, filasConVenta.length, " ventas a guardar del ", fecha)), /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btnPrimary,
      width: "100%",
      padding: "14px",
      fontSize: 15,
      borderRadius: 12,
      opacity: filasConVenta.length === 0 ? 0.5 : 1
    },
    disabled: filasConVenta.length === 0,
    onClick: guardar
  }, "💾 Guardar ", filasConVenta.length, " ventas del ", fecha), /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btn,
      width: "100%",
      padding: "10px",
      fontSize: 13,
      marginTop: 8
    },
    onClick: () => setFilas([])
  }, "Limpiar y cargar otro día")), filas.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "40px 20px",
      color: "var(--color-text-tertiary)",
      fontSize: 14,
      lineHeight: 1.8
    }
  }, "Seleccioná una fecha y tocá", "\n", "\"Cargar clientes del día\"", "\n", "para empezar la carga.")));
}
function Promocion({
  prospectos,
  onSave,
  onConvertir,
  onVolver
}) {
  const [diaActivo, setDiaActivo] = useState("");
  const [subVista, setSubVista] = useState("menu"); // menu | dia | detalle | nuevo | comodato | importar
  const [selId, setSelId] = useState(null);
  const hoyISO = new Date().toLocaleDateString("en-CA");
  const compras = p => (p.visitas || []).filter(v => v.resultado === "compro").length;
  const semanas = p => Math.floor((Date.now() - new Date(p.fechaInicio || hoyISO).getTime()) / (7 * 24 * 3600 * 1000));
  const listo = p => compras(p) >= 4;
  const visitadoHoy = p => (p.visitas || []).some(v => v.fecha === hoyISO);
  const porDia = d => prospectos.filter(p => p.dia === d && p.estado !== "convertido");
  const selP = prospectos.find(p => p.id === selId);
  const registrar = (id, resultado) => {
    const nps = prospectos.map(p => {
      if (p.id !== id) return p;
      const v = [...(p.visitas || []), {
        fecha: hoyISO,
        resultado
      }];
      return {
        ...p,
        visitas: v,
        listoConvertir: v.filter(x => x.resultado === "compro").length >= 4
      };
    });
    onSave(nps);
  };
  const guardarComodato = (id, cmd) => {
    onSave(prospectos.map(p => p.id === id ? {
      ...p,
      comodato: {
        ...cmd,
        fecha: new Date().toLocaleDateString("es-AR")
      }
    } : p));
  };
  const agregarProspecto = datos => {
    onSave([...prospectos, {
      ...datos,
      id: Date.now(),
      estado: "activo",
      fechaInicio: hoyISO,
      visitas: [],
      listoConvertir: false
    }]);
  };
  const eliminar = id => {
    onSave(prospectos.filter(p => p.id !== id));
  };
  if (subVista === "nuevo") return /*#__PURE__*/React.createElement(PromoNuevo, {
    diaInicial: diaActivo || "Martes",
    onGuardar: d => {
      agregarProspecto(d);
      setDiaActivo(d.dia);
      setSubVista("dia");
    },
    onVolver: () => setSubVista(diaActivo ? "dia" : "menu")
  });
  if (subVista === "comodato" && selP) return /*#__PURE__*/React.createElement(PromoComodato, {
    prospecto: selP,
    onGuardar: cmd => {
      guardarComodato(selP.id, cmd);
      setSubVista("detalle");
    },
    onVolver: () => setSubVista("detalle")
  });
  if (subVista === "detalle" && selP) return /*#__PURE__*/React.createElement(PromoDetalle, {
    prospecto: selP,
    listo: listo(selP),
    comprasCount: compras(selP),
    semanasCount: semanas(selP),
    visitadoHoy: visitadoHoy(selP),
    onRegistrar: r => registrar(selP.id, r),
    onComodato: () => setSubVista("comodato"),
    onEditar: datos => onSave(prospectos.map(p => p.id === selP.id ? {
      ...p,
      ...datos
    } : p)),
    onActualizarEnvases: (id, cambios) => {
      onSave(prospectos.map(p => p.id === id ? {
        ...p,
        ...cambios
      } : p));
    },
    onConvertir: () => {
      onConvertir({
        nombre: selP.nombre,
        dia: selP.dia,
        barrio: selP.barrio || "",
        manzana: selP.manzana || "",
        lote: selP.lote || "",
        sector: selP.sector || "",
        calle: selP.calle || "",
        nro: selP.nro || "",
        aclaracion: selP.depto || "",
        telefono: selP.telefono || "",
        maps: selP.maps || "",
        notas: selP.notas || "",
        sifon: selP.sifon || selP.comodato?.sifon || 0,
        bidon10: selP.bidon10 || selP.comodato?.bidon10 || 0,
        bidon20: selP.bidon20 || selP.comodato?.bidon20 || 0,
        dispenser: selP.dispenser || selP.comodato?.dispenser || 0,
        orden: undefined
      });
      setSubVista("dia");
    },
    onEliminar: () => {
      eliminar(selP.id);
      setSubVista("dia");
    },
    onVolver: () => setSubVista("dia")
  });
  if (subVista === "importar") return /*#__PURE__*/React.createElement("div", {
    style: s.screen
  }, /*#__PURE__*/React.createElement(HeaderApp, {
    titulo: "Importar prospectos · Excel",
    onVolver: () => setSubVista("menu")
  }), /*#__PURE__*/React.createElement(ImportarExcelTab, {
    clientes: [],
    prospectos: prospectos || [],
    modoSoloProspectos: true,
    onImportar: (_cls, nuevosProspectos) => {
      if (nuevosProspectos.length) {
        onSave([...prospectos, ...nuevosProspectos]);
        alert(`✅ ${nuevosProspectos.length} prospecto${nuevosProspectos.length > 1 ? "s" : ""} importado${nuevosProspectos.length > 1 ? "s" : ""}`);
      }
      setSubVista("menu");
    }
  }));
  if (subVista === "dia") {
    const lista = porDia(diaActivo);
    return /*#__PURE__*/React.createElement("div", {
      style: s.screen
    }, /*#__PURE__*/React.createElement(HeaderApp, {
      titulo: `Promoción · ${diaActivo}`,
      onVolver: () => setSubVista("menu")
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "8px 14px 4px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6,
        flexWrap: "wrap",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: s.badge("info")
    }, lista.length, " prospectos"), lista.filter(listo).length > 0 && /*#__PURE__*/React.createElement("span", {
      style: s.badge("success")
    }, lista.filter(listo).length, " listos ✓"), /*#__PURE__*/React.createElement("button", {
      style: {
        ...s.btn,
        fontSize: 11,
        padding: "3px 10px",
        marginLeft: "auto",
        background: "#185FA5",
        color: "#e2eaf4",
        border: "none"
      },
      onClick: () => setSubVista("nuevo")
    }, "+ Nuevo"))), lista.length === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        padding: "40px 20px",
        color: "var(--color-text-tertiary)",
        fontSize: 14
      }
    }, "No hay prospectos para ", diaActivo, ".", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12
      }
    }, "Tocá \"+ Nuevo\" para agregar uno.")), lista.map(p => {
      const c = compras(p),
        s = semanas(p),
        vhoy = visitadoHoy(p),
        lst = listo(p);
      const bc = lst ? "#4dd9a0" : vhoy ? "#5daaff" : "var(--color-border-tertiary)";
      return /*#__PURE__*/React.createElement("div", {
        key: p.id,
        style: {
          ...s.card,
          borderLeft: `3px solid ${bc}`,
          cursor: "pointer"
        },
        onClick: () => {
          setSelId(p.id);
          setSubVista("detalle");
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 500,
          fontSize: 14,
          color: "var(--color-text-primary)"
        }
      }, p.nombre), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 11,
          color: "var(--color-text-secondary)",
          marginTop: 2
        }
      }, direccionProspecto(p)), p.fechaInicio && /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 10,
          color: "var(--color-text-tertiary)",
          marginTop: 1
        }
      }, "Cargado: ", new Date(p.fechaInicio).toLocaleDateString("es-AR")), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          gap: 5,
          flexWrap: "wrap",
          marginTop: 5
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: s.tag
      }, s, " sem."), /*#__PURE__*/React.createElement("span", {
        style: {
          ...s.tag,
          color: "#4dd9a0"
        }
      }, c, "/4 compras"), lst && /*#__PURE__*/React.createElement("span", {
        style: s.badge("success")
      }, "✓ Listo"), vhoy && /*#__PURE__*/React.createElement("span", {
        style: s.badge("info")
      }, "Visitado hoy"), p.comodato && /*#__PURE__*/React.createElement("span", {
        style: s.badge("warning")
      }, "📋 Comodato"))), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          gap: 8,
          marginLeft: 10
        }
      }, p.maps && /*#__PURE__*/React.createElement("a", {
        href: p.maps,
        target: "_blank",
        rel: "noreferrer",
        style: {
          fontSize: 18,
          textDecoration: "none"
        },
        onClick: e => e.stopPropagation()
      }, "📍"), p.telefono && /*#__PURE__*/React.createElement("a", {
        href: `https://wa.me/54${p.telefono}`,
        target: "_blank",
        rel: "noreferrer",
        style: {
          fontSize: 18,
          textDecoration: "none"
        },
        onClick: e => e.stopPropagation()
      }, "💬"))), /*#__PURE__*/React.createElement("div", {
        style: {
          height: 5,
          borderRadius: 3,
          background: "var(--color-background-tertiary)",
          marginTop: 8
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          height: 5,
          borderRadius: 3,
          background: lst ? "#4dd9a0" : "#185FA5",
          width: `${Math.min(100, c / 4 * 100)}%`
        }
      })), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 10,
          color: "var(--color-text-tertiary)",
          marginTop: 3
        }
      }, lst ? "✓ 4 semanas completadas" : `${c}/4 semanas de compra`));
    }));
  }

  // ── Menú principal ─────────────────────────────────────────────────────────
  const activos = prospectos.filter(p => p.estado === "activo").length;
  const listos = prospectos.filter(p => p.listoConvertir && p.estado === "activo").length;
  const convertidos = prospectos.filter(p => p.estado === "convertido").length;
  return /*#__PURE__*/React.createElement("div", {
    style: s.screen
  }, /*#__PURE__*/React.createElement(HeaderApp, {
    titulo: "Promoción",
    onVolver: onVolver
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      ...s.grid3,
      padding: "10px 14px 8px",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: s.metricCard
  }, /*#__PURE__*/React.createElement("div", {
    style: s.metricLabel
  }, "En promoción"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...s.metricVal,
      color: "#5daaff"
    }
  }, activos)), /*#__PURE__*/React.createElement("div", {
    style: s.metricCard
  }, /*#__PURE__*/React.createElement("div", {
    style: s.metricLabel
  }, "Listos ✓"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...s.metricVal,
      color: "#4dd9a0"
    }
  }, listos)), /*#__PURE__*/React.createElement("div", {
    style: s.metricCard
  }, /*#__PURE__*/React.createElement("div", {
    style: s.metricLabel
  }, "Convertidos"), /*#__PURE__*/React.createElement("div", {
    style: s.metricVal
  }, convertidos))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      padding: "0 14px 8px"
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btn,
      flex: 1,
      fontSize: 12,
      background: "#1a5e35",
      color: "#4dd9a0",
      border: "none"
    },
    onClick: () => setSubVista("importar")
  }, "📥 Excel"), /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btn,
      flex: 1,
      fontSize: 12,
      background: "#185FA5",
      color: "#e2eaf4",
      border: "none"
    },
    onClick: () => setSubVista("nuevo")
  }, "+ Nuevo")), listos > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      ...s.card,
      margin: "0 14px 6px",
      background: "#0a2e1f",
      border: "0.5px solid #4dd9a0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#4dd9a0",
      fontWeight: 500
    }
  }, "✓ ", listos, " listo", listos > 1 ? "s" : "", " para convertir"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--color-text-secondary)",
      marginTop: 2
    }
  }, "Entrá al día para agregarlos como clientes")), /*#__PURE__*/React.createElement("span", {
    style: s.sectionTitle
  }, "Seleccionar día"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 14px",
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, DIAS.map(d => {
    const total = porDia(d).length,
      lst = porDia(d).filter(listo).length;
    return /*#__PURE__*/React.createElement("button", {
      key: d,
      style: {
        ...s.card,
        margin: 0,
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 16px"
      },
      onClick: () => {
        setDiaActivo(d);
        setSubVista("dia");
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 500,
        color: "var(--color-text-primary)"
      }
    }, d), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--color-text-secondary)",
        marginTop: 2
      }
    }, total, " prospectos", lst > 0 ? ` · ${lst} listos` : "")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6,
        alignItems: "center"
      }
    }, lst > 0 && /*#__PURE__*/React.createElement("span", {
      style: s.badge("success")
    }, lst, " ✓"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--color-text-tertiary)",
        fontSize: 18
      }
    }, "→")));
  })));
}
function EditarProspecto({
  prospecto: p,
  onGuardar,
  onVolver
}) {
  const [d, setD] = useState({
    nombre: p.nombre || "",
    dia: p.dia || "Martes",
    barrio: p.barrio || "",
    sector: p.sector || "",
    manzana: p.manzana || "",
    lote: p.lote || "",
    calle: p.calle || "",
    nro: p.nro || "",
    piso: p.piso || "",
    depto: p.depto || "",
    telefono: p.telefono || "",
    maps: p.maps || "",
    notas: p.notas || "",
    dni: p.dni || "",
    foto: p.foto || "",
    orden: p.orden || "",
    sifon: p.sifon || 0,
    bidon10: p.bidon10 || 0,
    bidon20: p.bidon20 || 0,
    dispenser: p.dispenser || 0
  });
  const s2 = (k, v) => setD(x => ({
    ...x,
    [k]: v
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: s.screen
  }, /*#__PURE__*/React.createElement(HeaderApp, {
    titulo: "Editar prospecto",
    onVolver: onVolver
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14,
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: s.grid2
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Día de visita"), /*#__PURE__*/React.createElement("select", {
    style: s.select,
    value: d.dia,
    onChange: e => s2("dia", e.target.value)
  }, DIAS.map(x => /*#__PURE__*/React.createElement("option", {
    key: x,
    value: x
  }, x)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Orden en promoción"), /*#__PURE__*/React.createElement("input", {
    style: s.input,
    type: "number",
    min: 1,
    placeholder: "opcional",
    value: d.orden || "",
    onChange: e => s2("orden", e.target.value)
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Familia / Nombre *"), /*#__PURE__*/React.createElement("input", {
    style: s.input,
    placeholder: "Apellido y nombre",
    value: d.nombre,
    onChange: e => s2("nombre", e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Barrio"), /*#__PURE__*/React.createElement("input", {
    style: s.input,
    placeholder: "Barrio",
    value: d.barrio,
    onChange: e => s2("barrio", e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    style: s.grid3
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Sector"), /*#__PURE__*/React.createElement("input", {
    style: s.input,
    placeholder: "Sec",
    value: d.sector,
    onChange: e => s2("sector", e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Manzana"), /*#__PURE__*/React.createElement("input", {
    style: s.input,
    placeholder: "Mz",
    value: d.manzana,
    onChange: e => s2("manzana", e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Lote"), /*#__PURE__*/React.createElement("input", {
    style: s.input,
    placeholder: "Lote",
    value: d.lote,
    onChange: e => s2("lote", e.target.value)
  }))), /*#__PURE__*/React.createElement("div", {
    style: s.grid2
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Calle"), /*#__PURE__*/React.createElement("input", {
    style: s.input,
    placeholder: "Calle",
    value: d.calle,
    onChange: e => s2("calle", e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Número"), /*#__PURE__*/React.createElement("input", {
    style: s.input,
    placeholder: "Nro",
    value: d.nro,
    onChange: e => s2("nro", e.target.value)
  }))), /*#__PURE__*/React.createElement("div", {
    style: s.grid2
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Piso"), /*#__PURE__*/React.createElement("input", {
    style: s.input,
    placeholder: "—",
    value: d.piso,
    onChange: e => s2("piso", e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Depto"), /*#__PURE__*/React.createElement("input", {
    style: s.input,
    placeholder: "—",
    value: d.depto,
    onChange: e => s2("depto", e.target.value)
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Teléfono (sin 0 ni 15)"), /*#__PURE__*/React.createElement("input", {
    style: s.input,
    placeholder: "3816559000",
    value: d.telefono,
    onChange: e => s2("telefono", e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "D.N.I."), /*#__PURE__*/React.createElement("input", {
    style: s.input,
    placeholder: "00.000.000",
    value: d.dni,
    onChange: e => s2("dni", e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Link Google Maps"), /*#__PURE__*/React.createElement("input", {
    style: s.input,
    placeholder: "https://maps.app.goo.gl/...",
    value: d.maps,
    onChange: e => s2("maps", e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Link foto del domicilio"), /*#__PURE__*/React.createElement("input", {
    style: s.input,
    placeholder: "https://...",
    value: d.foto,
    onChange: e => s2("foto", e.target.value)
  })), d.foto && /*#__PURE__*/React.createElement("img", {
    src: d.foto,
    alt: "Domicilio",
    style: {
      width: "100%",
      borderRadius: 8,
      maxHeight: 180,
      objectFit: "cover"
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Notas"), /*#__PURE__*/React.createElement("input", {
    style: s.input,
    placeholder: "timbre roto, perro, deuda...",
    value: d.notas,
    onChange: e => s2("notas", e.target.value)
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      ...s.label,
      fontSize: 13,
      marginTop: 4
    }
  }, "Envases en comodato"), /*#__PURE__*/React.createElement("div", {
    style: s.grid3
  }, [["sifon", "Sifón"], ["bidon10", "10L"], ["bidon20", "20L"]].map(([k, l]) => /*#__PURE__*/React.createElement("div", {
    key: k
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      ...s.label,
      textAlign: "center"
    }
  }, l), /*#__PURE__*/React.createElement("input", {
    style: {
      ...s.input,
      textAlign: "center"
    },
    type: "number",
    min: 0,
    value: d[k] || 0,
    onChange: e => s2(k, Number(e.target.value))
  })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Dispenser"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btn,
      padding: "5px 14px",
      fontSize: 18,
      lineHeight: 1
    },
    onClick: () => s2("dispenser", Math.max(0, (d.dispenser || 0) - 1))
  }, "−"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 500,
      minWidth: 28,
      textAlign: "center",
      color: "var(--color-text-primary)"
    }
  }, d.dispenser || 0), /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btn,
      padding: "5px 14px",
      fontSize: 18,
      lineHeight: 1
    },
    onClick: () => s2("dispenser", (d.dispenser || 0) + 1)
  }, "+"))), /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btnPrimary,
      marginTop: 6,
      opacity: !d.nombre ? 0.45 : 1
    },
    disabled: !d.nombre,
    onClick: () => onGuardar(d)
  }, "Guardar cambios")));
}
function EnvasesProspecto({
  prospecto: p,
  onActualizar
}) {
  const [editando, setEditando] = useState(false);
  const [vals, setVals] = useState({
    sifon: p.sifon || 0,
    bidon10: p.bidon10 || 0,
    bidon20: p.bidon20 || 0,
    dispenser: p.dispenser || 0
  });
  const sv = (k, v) => setVals(x => ({
    ...x,
    [k]: v
  }));
  const tiene = vals.sifon > 0 || vals.bidon10 > 0 || vals.bidon20 > 0 || vals.dispenser > 0;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...s.card,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: editando ? 10 : 0
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: "var(--color-text-primary)"
    }
  }, "Envases en comodato"), !editando && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 5,
      flexWrap: "wrap",
      marginTop: 4
    }
  }, vals.sifon > 0 && /*#__PURE__*/React.createElement("span", {
    style: s.tag
  }, "Sifón ×", vals.sifon), vals.bidon10 > 0 && /*#__PURE__*/React.createElement("span", {
    style: s.tag
  }, "10L ×", vals.bidon10), vals.bidon20 > 0 && /*#__PURE__*/React.createElement("span", {
    style: s.tag
  }, "20L ×", vals.bidon20), vals.dispenser > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      ...s.tag,
      color: "#5daaff"
    }
  }, "Disp ×", vals.dispenser), !tiene && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--color-text-tertiary)"
    }
  }, "Sin envases cargados"))), /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btn,
      fontSize: 11,
      padding: "4px 10px"
    },
    onClick: () => {
      if (editando) {
        onActualizar({
          sifon: vals.sifon,
          bidon10: vals.bidon10,
          bidon20: vals.bidon20,
          dispenser: vals.dispenser
        });
      }
      setEditando(!editando);
    }
  }, editando ? "Guardar" : "Editar")), editando && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: s.grid3
  }, [["sifon", "Sifón"], ["bidon10", "Bidón 10L"], ["bidon20", "Bidón 20L"]].map(([k, l]) => /*#__PURE__*/React.createElement("div", {
    key: k
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      ...s.label,
      textAlign: "center"
    }
  }, l), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4,
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btn,
      padding: "3px 10px",
      fontSize: 16,
      lineHeight: 1
    },
    onClick: () => sv(k, Math.max(0, (vals[k] || 0) - 1))
  }, "−"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      fontWeight: 500,
      minWidth: 24,
      textAlign: "center",
      color: "var(--color-text-primary)"
    }
  }, vals[k] || 0), /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btn,
      padding: "3px 10px",
      fontSize: 16,
      lineHeight: 1
    },
    onClick: () => sv(k, (vals[k] || 0) + 1)
  }, "+"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Dispenser"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btn,
      padding: "4px 14px",
      fontSize: 18,
      lineHeight: 1
    },
    onClick: () => sv("dispenser", Math.max(0, (vals.dispenser || 0) - 1))
  }, "−"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 500,
      minWidth: 28,
      textAlign: "center",
      color: "var(--color-text-primary)"
    }
  }, vals.dispenser || 0), /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btn,
      padding: "4px 14px",
      fontSize: 18,
      lineHeight: 1
    },
    onClick: () => sv("dispenser", (vals.dispenser || 0) + 1)
  }, "+"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--color-text-secondary)"
    }
  }, "unidades")))));
}
function PromoDetalle({
  prospecto: p,
  ventas,
  noVisitas,
  productos,
  listo,
  comprasCount,
  semanasCount,
  visitadoHoy,
  ventaHoy,
  fecha,
  onRegistrar,
  onNoEsta,
  onNoQuiere,
  onComodato,
  onConvertir,
  onEliminar,
  onVolver,
  onActualizarEnvases,
  onEditar,
  onEliminarVenta
}) {
  const [editando, setEditando] = useState(false);
  if (editando) return /*#__PURE__*/React.createElement(EditarProspecto, {
    prospecto: p,
    onGuardar: datos => {
      onEditar(datos);
      setEditando(false);
    },
    onVolver: () => setEditando(false)
  });
  const ventasReales = (ventas || []).filter(v => !v._esAjuste);
  const nvItems = (noVisitas || []).map(nv => ({
    ...nv,
    _esNoVisita: true,
    fechaKey: nv.fecha
  }));
  const historial = [...ventasReales, ...nvItems].sort((a, b) => (b.fechaKey || "").localeCompare(a.fechaKey || "") || (b.id || 0) - (a.id || 0));
  const totalComprado = ventasReales.filter(v => !v._esCobro).reduce((a, v) => a + (v.neto || 0), 0);
  return /*#__PURE__*/React.createElement("div", {
    style: s.screen
  }, /*#__PURE__*/React.createElement(HeaderApp, {
    titulo: "Promoción",
    onVolver: onVolver
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--color-background-secondary)",
      borderRadius: 10,
      margin: "8px 14px 0",
      padding: "10px 14px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      color: "var(--color-text-primary)"
    }
  }, p.nombre), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btn,
      fontSize: 11,
      padding: "4px 10px"
    },
    onClick: () => setEditando(true)
  }, "Editar"), /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btn,
      fontSize: 11,
      padding: "4px 10px"
    },
    onClick: onComodato
  }, "📋"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...s.card,
      borderLeft: "3px solid #f5b942",
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      borderRadius: 10,
      background: "#2e1f06",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 16,
      fontWeight: 700,
      color: "#f5b942",
      flexShrink: 0
    }
  }, "P"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 500,
      fontSize: 15,
      color: "var(--color-text-primary)"
    }
  }, p.nombre), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--color-text-secondary)"
    }
  }, p.dia, direccionProspecto(p) ? ` · ${direccionProspecto(p)}` : "")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, p.maps && /*#__PURE__*/React.createElement("a", {
    href: p.maps,
    target: "_blank",
    rel: "noreferrer",
    style: {
      fontSize: 24,
      textDecoration: "none"
    }
  }, "📍"), p.telefono && /*#__PURE__*/React.createElement("a", {
    href: `https://wa.me/54${p.telefono}`,
    target: "_blank",
    rel: "noreferrer",
    style: {
      fontSize: 24,
      textDecoration: "none"
    }
  }, "💬"))), p.fechaInicio && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--color-text-tertiary)"
    }
  }, "En promoción desde ", new Date(p.fechaInicio).toLocaleDateString("es-AR")), p.dni && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--color-text-secondary)",
      marginTop: 2
    }
  }, "DNI: ", p.dni), p.notas && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--color-text-warning)",
      marginTop: 4
    }
  }, "📝 ", p.notas)), /*#__PURE__*/React.createElement("div", {
    style: {
      ...s.grid3,
      marginBottom: 10,
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: s.metricCard
  }, /*#__PURE__*/React.createElement("div", {
    style: s.metricLabel
  }, "Semanas"), /*#__PURE__*/React.createElement("div", {
    style: s.metricVal
  }, semanasCount)), /*#__PURE__*/React.createElement("div", {
    style: {
      ...s.metricCard,
      background: comprasCount >= 4 ? "#0a2e1f" : undefined
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: s.metricLabel
  }, "Compras"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...s.metricVal,
      color: comprasCount >= 4 ? "#4dd9a0" : "var(--color-text-primary)"
    }
  }, comprasCount, "/4")), /*#__PURE__*/React.createElement("div", {
    style: s.metricCard
  }, /*#__PURE__*/React.createElement("div", {
    style: s.metricLabel
  }, "Total"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...s.metricVal,
      fontSize: 14
    }
  }, fmt(totalComprado)))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...s.card,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 10,
      borderRadius: 5,
      background: "var(--color-background-tertiary)",
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 10,
      borderRadius: 5,
      background: listo ? "#4dd9a0" : "#185FA5",
      width: `${Math.min(100, comprasCount / 4 * 100)}%`,
      transition: "width 0.4s"
    }
  })), listo ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#4dd9a0",
      fontWeight: 500
    }
  }, "✓ Completó 4 semanas — listo para convertir") : /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--color-text-secondary)"
    }
  }, "Faltan ", Math.max(0, 4 - comprasCount), " compras más para convertir")), /*#__PURE__*/React.createElement(EnvasesProspecto, {
    prospecto: p,
    onActualizar: cambios => onActualizarEnvases(p.id, cambios)
  }), p.comodato && /*#__PURE__*/React.createElement("div", {
    style: {
      ...s.card,
      marginBottom: 10,
      background: "var(--color-background-tertiary)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--color-text-secondary)",
      marginBottom: 4,
      fontWeight: 500
    }
  }, "📋 Comodato entregado · ", p.comodato.fecha), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      flexWrap: "wrap"
    }
  }, p.comodato.sifon > 0 && /*#__PURE__*/React.createElement("span", {
    style: s.tag
  }, "Sifón ×", p.comodato.sifon), p.comodato.bidon10 > 0 && /*#__PURE__*/React.createElement("span", {
    style: s.tag
  }, "Bidón 10L ×", p.comodato.bidon10), p.comodato.bidon20 > 0 && /*#__PURE__*/React.createElement("span", {
    style: s.tag
  }, "Bidón 20L ×", p.comodato.bidon20), p.comodato.dispenser > 0 && /*#__PURE__*/React.createElement("span", {
    style: s.tag
  }, "Dispenser ×", p.comodato.dispenser))), listo && /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btnPrimary,
      marginBottom: 10,
      background: "#0F6E56"
    },
    onClick: () => {
      if (window.confirm("¿Convertir a " + p.nombre + " en cliente regular de " + p.dia + "?")) onConvertir(p);
    }
  }, "✓ Convertir a cliente regular de ", p.dia), ventaHoy ? /*#__PURE__*/React.createElement("div", {
    style: {
      ...s.card,
      margin: "0 0 12px",
      borderLeft: "3px solid #1D9E75",
      padding: "10px 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: "#4dd9a0"
    }
  }, "✓ Entrega registrada hoy"), /*#__PURE__*/React.createElement("span", {
    style: s.badge("success")
  }, fmt(ventaHoy.neto))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--color-text-secondary)",
      marginTop: 4
    }
  }, (ventaHoy.detalle || []).map(d => d.nombre + " ×" + d.cantidad).join(" · "), " · ", ventaHoy.pago)) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      background: "var(--color-background-warning)",
      color: "var(--color-text-warning)",
      border: "1px solid var(--color-border-warning)",
      borderRadius: 10,
      padding: "12px 0",
      fontSize: 13,
      cursor: "pointer",
      fontWeight: 500,
      flex: 1
    },
    onClick: onNoEsta
  }, "🔄 No está"), /*#__PURE__*/React.createElement("button", {
    style: {
      background: "var(--color-background-danger)",
      color: "var(--color-text-danger)",
      border: "1px solid var(--color-border-danger)",
      borderRadius: 10,
      padding: "12px 0",
      fontSize: 13,
      cursor: "pointer",
      fontWeight: 500,
      flex: 1
    },
    onClick: onNoQuiere
  }, "🚫 No quiere"), /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btnPrimary,
      padding: "12px 0",
      fontSize: 14,
      borderRadius: 10,
      flex: 2
    },
    onClick: onRegistrar
  }, "📦 Registrar entrega")), /*#__PURE__*/React.createElement("details", {
    style: {
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("summary", {
    style: {
      cursor: "pointer",
      listStyle: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "var(--color-background-tertiary)",
      borderRadius: 8,
      padding: "10px 14px",
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: "var(--color-text-primary)"
    }
  }, "📋 Historial completo"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--color-text-tertiary)"
    }
  }, "▾")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      flexWrap: "wrap",
      marginBottom: 8
    }
  }, [["🛒", "#3b82f6", "Venta"], ["🚪", "#f59e0b", "No estaba"], ["🙅", "#ef4444", "No quiso"]].map(([ico, col, lbl]) => /*#__PURE__*/React.createElement("span", {
    key: lbl,
    style: {
      fontSize: 10,
      color: col,
      background: col + "18",
      border: "0.5px solid " + col + "44",
      borderRadius: 20,
      padding: "2px 7px",
      fontWeight: 600
    }
  }, ico, " ", lbl))), historial.length === 0 && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: "var(--color-text-tertiary)",
      padding: "4px 0"
    }
  }, "Sin registros aún"), historial.map((item, idx) => {
    if (item._esNoVisita) {
      const esNoEsta = item.motivo === "noesta" || item.motivo === "noesta2";
      return /*#__PURE__*/React.createElement("div", {
        key: "nv" + idx,
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 12px",
          marginBottom: 6,
          background: esNoEsta ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)",
          borderRadius: 10,
          border: "0.5px solid " + (esNoEsta ? "rgba(245,158,11,0.3)" : "rgba(239,68,68,0.3)")
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 18
        }
      }, esNoEsta ? "🚪" : "🙅"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 13,
          fontWeight: 600,
          color: esNoEsta ? "#f59e0b" : "#ef4444"
        }
      }, esNoEsta ? "No estaba en casa" : "No quiso comprar"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 11,
          color: "var(--color-text-tertiary)"
        }
      }, item.fechaKey, " · ", item.dia)));
    }
    const v = item;
    if (v._esCobro) return /*#__PURE__*/React.createElement("div", {
      key: v.id,
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 12px",
        marginBottom: 6,
        background: "rgba(16,185,129,0.08)",
        borderRadius: 10,
        border: "0.5px solid rgba(16,185,129,0.3)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18
      }
    }, "💳"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: "#10b981"
      }
    }, "Cobro de deuda"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "var(--color-text-tertiary)"
      }
    }, v.fechaKey, " · ", v.pago))), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 15,
        fontWeight: 700,
        color: "#10b981"
      }
    }, "+", fmt(v.pagadoNum)));
    return /*#__PURE__*/React.createElement("div", {
      key: v.id,
      style: {
        marginBottom: 6,
        padding: "10px 12px",
        background: "rgba(59,130,246,0.06)",
        borderRadius: 10,
        border: "0.5px solid rgba(59,130,246,0.2)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 3,
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6,
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 16
      }
    }, "🛒"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: "var(--color-text-tertiary)"
      }
    }, v.fechaKey || v.dia)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 15,
        fontWeight: 700,
        color: "#3b82f6"
      }
    }, fmt(v.neto))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: "var(--color-text-primary)",
        marginBottom: 2,
        paddingLeft: 22
      }
    }, (v.detalle || []).map(d => d.nombre + " ×" + d.cantidad).join(" · ")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "var(--color-text-secondary)",
        paddingLeft: 22,
        marginBottom: 4
      }
    }, v.pago, v.saldoAplicado > 0 ? " · saldo apl. " + fmt(v.saldoAplicado) : "", v.obs ? " · " + v.obs : ""), onEliminarVenta && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "flex-end"
      }
    }, /*#__PURE__*/React.createElement("button", {
      style: {
        fontSize: 10,
        color: "var(--color-text-danger)",
        background: "none",
        border: "none",
        cursor: "pointer"
      },
      onClick: () => {
        if (window.confirm("¿Eliminar esta venta?")) onEliminarVenta(v.id);
      }
    }, "Eliminar")));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...s.divider,
      marginTop: 16
    }
  }), /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btnDanger,
      width: "100%",
      padding: "10px"
    },
    onClick: () => {
      if (window.confirm("¿Eliminar a " + p.nombre + "?")) onEliminar();
    }
  }, "Eliminar prospecto")));
}
function PromoNuevo({
  diaInicial,
  onGuardar,
  onVolver
}) {
  const [d, setD] = useState({
    nombre: "",
    dia: diaInicial,
    barrio: "",
    sector: "",
    manzana: "",
    lote: "",
    calle: "",
    nro: "",
    piso: "",
    depto: "",
    telefono: "",
    maps: "",
    notas: "",
    dni: "",
    orden: "",
    sifon: 0,
    bidon10: 0,
    bidon20: 0,
    dispenser: 0
  });
  const s2 = (k, v) => setD(x => ({
    ...x,
    [k]: v
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: s.screen
  }, /*#__PURE__*/React.createElement(HeaderApp, {
    titulo: "Nuevo prospecto",
    onVolver: onVolver
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14,
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Día de visita"), /*#__PURE__*/React.createElement("select", {
    style: s.select,
    value: d.dia,
    onChange: e => s2("dia", e.target.value)
  }, DIAS.map(x => /*#__PURE__*/React.createElement("option", {
    key: x,
    value: x
  }, x)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Orden en promoción (opcional)"), /*#__PURE__*/React.createElement("input", {
    style: s.input,
    type: "number",
    min: 1,
    placeholder: "solo para ordenar la lista de promoción",
    value: d.orden || "",
    onChange: e => s2("orden", e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--color-text-tertiary)",
      marginTop: 3
    }
  }, "El número de ruta se asigna cuando se convierte en cliente regular")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Familia / Nombre *"), /*#__PURE__*/React.createElement("input", {
    style: s.input,
    placeholder: "Apellido y nombre",
    value: d.nombre,
    onChange: e => s2("nombre", e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Barrio"), /*#__PURE__*/React.createElement("input", {
    style: s.input,
    placeholder: "Barrio",
    value: d.barrio,
    onChange: e => s2("barrio", e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    style: s.grid3
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Sector"), /*#__PURE__*/React.createElement("input", {
    style: s.input,
    placeholder: "Sec",
    value: d.sector,
    onChange: e => s2("sector", e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Manzana"), /*#__PURE__*/React.createElement("input", {
    style: s.input,
    placeholder: "Mz",
    value: d.manzana,
    onChange: e => s2("manzana", e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Lote"), /*#__PURE__*/React.createElement("input", {
    style: s.input,
    placeholder: "Lote",
    value: d.lote,
    onChange: e => s2("lote", e.target.value)
  }))), /*#__PURE__*/React.createElement("div", {
    style: s.grid2
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Calle"), /*#__PURE__*/React.createElement("input", {
    style: s.input,
    placeholder: "Calle",
    value: d.calle,
    onChange: e => s2("calle", e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Número"), /*#__PURE__*/React.createElement("input", {
    style: s.input,
    placeholder: "Nro",
    value: d.nro,
    onChange: e => s2("nro", e.target.value)
  }))), /*#__PURE__*/React.createElement("div", {
    style: s.grid2
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Piso"), /*#__PURE__*/React.createElement("input", {
    style: s.input,
    placeholder: "—",
    value: d.piso,
    onChange: e => s2("piso", e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Depto"), /*#__PURE__*/React.createElement("input", {
    style: s.input,
    placeholder: "—",
    value: d.depto,
    onChange: e => s2("depto", e.target.value)
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Teléfono (sin 0 ni 15)"), /*#__PURE__*/React.createElement("input", {
    style: s.input,
    placeholder: "3816559000",
    value: d.telefono,
    onChange: e => s2("telefono", e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "D.N.I."), /*#__PURE__*/React.createElement("input", {
    style: s.input,
    placeholder: "00.000.000",
    value: d.dni,
    onChange: e => s2("dni", e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Link Google Maps"), /*#__PURE__*/React.createElement("input", {
    style: s.input,
    placeholder: "https://maps.app.goo.gl/...",
    value: d.maps,
    onChange: e => s2("maps", e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Notas"), /*#__PURE__*/React.createElement("input", {
    style: s.input,
    placeholder: "timbre roto, perro, deuda...",
    value: d.notas,
    onChange: e => s2("notas", e.target.value)
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      ...s.label,
      fontSize: 13,
      marginTop: 4
    }
  }, "Envases entregados en comodato"), /*#__PURE__*/React.createElement("div", {
    style: s.grid3
  }, [["sifon", "Sifón"], ["bidon10", "Bidón 10L"], ["bidon20", "Bidón 20L"]].map(([k, l]) => /*#__PURE__*/React.createElement("div", {
    key: k
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      ...s.label,
      textAlign: "center"
    }
  }, l), /*#__PURE__*/React.createElement("input", {
    style: {
      ...s.input,
      textAlign: "center"
    },
    type: "number",
    min: 0,
    value: d[k] || 0,
    onChange: e => s2(k, Number(e.target.value))
  })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Dispenser"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btn,
      padding: "5px 14px",
      fontSize: 18,
      lineHeight: 1
    },
    onClick: () => s2("dispenser", Math.max(0, (d.dispenser || 0) - 1))
  }, "−"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 500,
      minWidth: 28,
      textAlign: "center",
      color: "var(--color-text-primary)"
    }
  }, d.dispenser || 0), /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btn,
      padding: "5px 14px",
      fontSize: 18,
      lineHeight: 1
    },
    onClick: () => s2("dispenser", (d.dispenser || 0) + 1)
  }, "+"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--color-text-secondary)"
    }
  }, "unidades"))), /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btnPrimary,
      marginTop: 4,
      opacity: !d.nombre ? 0.45 : 1
    },
    disabled: !d.nombre,
    onClick: () => onGuardar(d)
  }, "Agregar prospecto")));
}
function PromoComodato({
  prospecto: p,
  onGuardar,
  onVolver
}) {
  const [c, setC] = useState(p.comodato || {
    sifon: 0,
    bidon10: 0,
    bidon20: 0,
    dispenser: 0,
    aclaracion: "",
    dni: "",
    piso: "",
    depto: ""
  });
  const sc = (k, v) => setC(x => ({
    ...x,
    [k]: v
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: s.screen
  }, /*#__PURE__*/React.createElement(HeaderApp, {
    titulo: `Comodato · ${p.nombre}`,
    onVolver: onVolver
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...s.card,
      textAlign: "center",
      marginBottom: 10,
      background: "var(--color-background-tertiary)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--color-text-secondary)"
    }
  }, "Sistema de Reparto"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 500,
      color: "#5daaff",
      margin: "4px 0"
    }
  }, "LA CATALINA"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--color-text-secondary)"
    }
  }, "De Guillermo Carabajal Ponce"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: "var(--color-text-primary)",
      marginTop: 6
    }
  }, "Comodato — Ficha del cliente")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--color-text-secondary)",
      marginBottom: 10
    }
  }, "San Miguel de Tucumán: ", new Date().toLocaleDateString("es-AR")), [["Familia", p.nombre], ["Barrio", p.barrio], ["Sec / Mz / Lote", `${p.sector || "—"} / ${p.manzana || "—"} / ${p.lote || "—"}`], ["Calle", p.calle ? `${p.calle} ${p.nro || ""}` : ""]].filter(([, v]) => v).map(([l, v]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      display: "flex",
      justifyContent: "space-between",
      padding: "6px 0",
      borderBottom: "0.5px solid var(--color-border-tertiary)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--color-text-secondary)"
    }
  }, l), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--color-text-primary)",
      fontWeight: 500
    }
  }, v))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...s.grid2,
      margin: "10px 0"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Piso"), /*#__PURE__*/React.createElement("input", {
    style: s.input,
    placeholder: "—",
    value: c.piso || "",
    onChange: e => sc("piso", e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Depto"), /*#__PURE__*/React.createElement("input", {
    style: s.input,
    placeholder: "—",
    value: c.depto || "",
    onChange: e => sc("depto", e.target.value)
  }))), /*#__PURE__*/React.createElement("div", {
    style: s.divider
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      padding: "4px 0 10px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: "var(--color-text-primary)"
    }
  }, "Producto"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: "var(--color-text-primary)"
    }
  }, "Cantidad")), [["sifon", "Sifón 1500cc"], ["bidon10", "Bidón 10 lts."], ["bidon20", "Bidón 20 lts."], ["dispenser", "Dispenser"]].map(([k, l]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 0",
      borderBottom: "0.5px solid var(--color-border-tertiary)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: "var(--color-text-primary)"
    }
  }, l), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btn,
      padding: "4px 14px",
      fontSize: 18,
      lineHeight: 1
    },
    onClick: () => sc(k, Math.max(0, (c[k] || 0) - 1))
  }, "−"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 500,
      minWidth: 30,
      textAlign: "center",
      color: "var(--color-text-primary)"
    }
  }, c[k] || 0), /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btn,
      padding: "4px 14px",
      fontSize: 18,
      lineHeight: 1
    },
    onClick: () => sc(k, (c[k] || 0) + 1)
  }, "+"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--color-text-secondary)"
    }
  }, "Unid.")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "Aclaración / Firma"), /*#__PURE__*/React.createElement("input", {
    style: s.input,
    placeholder: "Nombre en letra de imprenta",
    value: c.aclaracion || "",
    onChange: e => sc("aclaracion", e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "D.N.I."), /*#__PURE__*/React.createElement("input", {
    style: s.input,
    placeholder: "00.000.000",
    value: c.dni || "",
    onChange: e => sc("dni", e.target.value)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...s.card,
      margin: "12px 0",
      background: "var(--color-background-tertiary)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--color-text-tertiary)",
      lineHeight: 1.6
    }
  }, "El comodato es un contrato por el cual una parte entrega a la otra gratuitamente una especie, mueble o bien raíz, para que haga uso de ella, con cargo de restituir la misma especie después de terminado el uso.")), /*#__PURE__*/React.createElement("button", {
    style: s.btnPrimary,
    onClick: () => onGuardar(c)
  }, "Guardar comodato")));
}
