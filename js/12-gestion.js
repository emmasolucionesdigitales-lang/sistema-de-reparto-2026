// ════════════════════════════════════════════════════════════════════
// ◆  11-gestion.js — GestionClientes · FormCliente
//    TABS: Lista · Fiados · Agenda · Importar Excel
// ════════════════════════════════════════════════════════════════════

// ── Tab: Fiados ──────────────────────────────────────────────────────
function FiadosTab({
  clientes
}) {
  const conFiado = [...clientes].filter(c => (c.saldo || 0) < 0).sort((a, b) => (a.saldo || 0) - (b.saldo || 0));
  const totalFiado = conFiado.reduce((a, c) => a + Math.abs(c.saldo || 0), 0);
  if (conFiado.length === 0) return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 40,
      textAlign: "center",
      color: "var(--color-text-secondary)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 40,
      marginBottom: 12
    }
  }, "✅"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 500,
      color: "var(--color-text-primary)"
    }
  }, "Sin fiados pendientes"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      marginTop: 4
    }
  }, "Todos los clientes están al día"));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...s.card,
      margin: "10px 14px",
      background: "var(--color-background-danger)",
      borderLeft: "3px solid var(--color-text-danger)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--color-text-danger)",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      marginBottom: 4
    }
  }, "Total fiado pendiente"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 26,
      fontWeight: 700,
      color: "var(--color-text-danger)"
    }
  }, fmt(totalFiado)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--color-text-tertiary)",
      marginTop: 2
    }
  }, conFiado.length, " cliente", conFiado.length > 1 ? "s" : "", " con saldo negativo")), conFiado.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.id,
    style: {
      ...s.card,
      margin: "6px 14px",
      borderLeft: "3px solid var(--color-text-danger)"
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
      fontSize: 15,
      fontWeight: 500,
      color: "var(--color-text-primary)"
    }
  }, c.nombre), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--color-text-secondary)",
      marginTop: 2
    }
  }, c.dia, c.barrio ? ` · ${c.barrio}` : c.calle ? ` · ${c.calle}` : ""), c.telefono && /*#__PURE__*/React.createElement("a", {
    href: `https://wa.me/54${c.telefono}`,
    target: "_blank",
    rel: "noreferrer",
    style: {
      fontSize: 12,
      color: "#4dd9a0",
      marginTop: 3,
      display: "block",
      textDecoration: "none"
    }
  }, "💬 ", c.telefono)), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      color: "var(--color-text-danger)"
    }
  }, "Debe"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 700,
      color: "var(--color-text-danger)"
    }
  }, fmt(Math.abs(c.saldo || 0))), (c.sifon > 0 || c.bidon10 > 0 || c.bidon20 > 0) && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "var(--color-text-tertiary)",
      marginTop: 2
    }
  }, c.sifon > 0 ? `Sifón×${c.sifon} ` : "", c.bidon10 > 0 ? `10L×${c.bidon10} ` : "", c.bidon20 > 0 ? `20L×${c.bidon20}` : ""))))));
}

// ── Tab: Agenda ──────────────────────────────────────────────────────
function AgendaTab({
  recordatorios,
  onConfirmarRecordatorio
}) {
  const activos = [...(recordatorios || [])].filter(r => !r.confirmado).sort((a, b) => (a.fecha || "").localeCompare(b.fecha || ""));
  const confirmados = [...(recordatorios || [])].filter(r => r.confirmado).sort((a, b) => (b.fecha || "").localeCompare(a.fecha || "")).slice(0, 10);
  if (activos.length === 0 && confirmados.length === 0) return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 40,
      textAlign: "center",
      color: "var(--color-text-secondary)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 40,
      marginBottom: 12
    }
  }, "📅"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 500,
      color: "var(--color-text-primary)"
    }
  }, "Sin recordatorios"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      marginTop: 4,
      lineHeight: 1.6
    }
  }, "Los recordatorios se crean desde el detalle de cada cliente"));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 20
    }
  }, activos.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: s.sectionTitle
  }, "🔔 Pendientes · ", activos.length), activos.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.id,
    style: {
      ...s.card,
      margin: "6px 14px",
      background: "var(--color-background-info)",
      border: "0.5px solid #5daaff",
      display: "flex",
      gap: 8,
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: "var(--color-text-info)"
    }
  }, r.clienteNombre), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--color-text-tertiary)",
      marginTop: 2
    }
  }, r.dia, " · ", r.fecha, r.hora ? ` · ${r.hora}` : ""), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--color-text-primary)",
      marginTop: 4
    }
  }, r.tipo === "cobro" ? "💰" : "🏠", " ", r.motivo)), /*#__PURE__*/React.createElement("button", {
    style: {
      background: "#4dd9a0",
      color: "#0a2e1f",
      border: "none",
      borderRadius: 8,
      padding: "8px 14px",
      fontSize: 12,
      fontWeight: 700,
      cursor: "pointer",
      flexShrink: 0,
      marginTop: 2
    },
    onClick: () => onConfirmarRecordatorio && onConfirmarRecordatorio(r.id)
  }, "✓ Listo")))), confirmados.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      ...s.sectionTitle,
      marginTop: 8
    }
  }, "✅ Completados recientes"), confirmados.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.id,
    style: {
      ...s.card,
      margin: "4px 14px",
      opacity: 0.55
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--color-text-secondary)"
    }
  }, r.clienteNombre, " ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--color-text-tertiary)"
    }
  }, "· ", r.dia)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--color-text-tertiary)",
      marginTop: 2
    }
  }, r.motivo)))));
}

// ── Tab: Importar Excel ──────────────────────────────────────────────
// SIMPLE: seleccionar → auto-detectar → preview → confirmar
// Sin mapeo manual · Sin async/await (incompatible con Babel in-browser)
// ImportarExcelTab (importación de clientes/prospectos por Excel) — eliminada.
// El componente no se usaba en ningún lado (no había ninguna pantalla que lo
// renderizara); se saca junto con el resto de la funcionalidad de prospectos.
// ── GestionClientes (con tabs) ───────────────────────────────────────
function GestionClientes({
  clientes,
  onEditar,
  onEliminar,
  onNuevo,
  onVolver,
  onReordenarTodo,
  onRegistrarVenta,
  onVerDetalle,
  ventas,
  recordatorios,
  onConfirmarRecordatorio,
  onImportar,
  onIr,
  productos,
  onGuardarCambio,
  onPerdida,
  onPerdidaCliente
}) {
  const [tab, setTab] = React.useState("lista"); // lista | fiados | agenda | importar
  const [fotoClienteId, setFotoClienteId] = React.useState(null);
  const fotoCliente = fotoClienteId ? clientes.find(c => c.id === fotoClienteId) : null;
  const [busqueda, setBusqueda] = useState("");
  const [filtroDia, setFiltroDia] = useState("todos");
  const [modoNuevo, setModoNuevo] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [cambioId, setCambioId] = useState(null);
  const [clienteMoviendo, setClienteMoviendo] = useState(null); // id del cliente "levantado", esperando destino (mismo día)

  const moverCliente = (idOrigen, idDestino) => {
    if (idOrigen === idDestino) return;
    const origen = clientes.find(c => c.id === idOrigen);
    const destino = clientes.find(c => c.id === idDestino);
    if (!origen || !destino) return;
    if (origen.dia !== destino.dia) {
      alert("Solo podés reordenar dentro del mismo día.");
      return;
    }
    const delDia = [...clientes].filter(c => c.dia === origen.dia).sort((a, b) => (a.orden || 9999) - (b.orden || 9999));
    const idsDelDia = delDia.map(c => c.id);
    const idxOrigen = idsDelDia.indexOf(idOrigen),
      idxDestino = idsDelDia.indexOf(idDestino);
    if (idxOrigen === -1 || idxDestino === -1) return;
    const nuevoOrden = [...idsDelDia];
    const [item] = nuevoOrden.splice(idxOrigen, 1);
    nuevoOrden.splice(idxDestino, 0, item);
    const posMap = {};
    nuevoOrden.forEach((id, i) => {
      posMap[id] = i + 1;
    });
    onReordenarTodo(clientes.map(c => posMap[c.id] !== undefined ? {
      ...c,
      orden: posMap[c.id]
    } : c));
  };
  // (extraEnvases: cálculo de prestado por historial, sin usos en este
  // archivo — reemplazado por prestadoClienteDe donde hace falta.)
  const filtrados = clientes.filter(c => filtroDia === "todos" || c.dia === filtroDia).filter(c => buscarCliente(c, busqueda) > 0).sort((a, b) => {
    // Con búsqueda activa: primero las coincidencias por DOMICILIO
    if (busqueda.trim()) {
      const dif = buscarCliente(b, busqueda) - buscarCliente(a, busqueda);
      if (dif !== 0) return dif;
    }
    if (a.dia !== b.dia) return DIAS.indexOf(a.dia) - DIAS.indexOf(b.dia);
    return (a.orden || 9999) - (b.orden || 9999);
  });

  // Contadores para badges en tabs
  const cantFiados = clientes.filter(c => (c.saldo || 0) < 0).length;
  const cantAgenda = (recordatorios || []).filter(r => !r.confirmado).length;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: s.screen
  }, /*#__PURE__*/React.createElement(HeaderApp, {
    titulo: "Clientes",
    onVolver: onVolver
  }), onIr && /*#__PURE__*/React.createElement(ClientesTabs, {
    activo: "todos",
    onIr: onIr
  }), tab === "lista" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px 14px 6px"
    }
  }, /*#__PURE__*/React.createElement("input", {
    style: s.input,
    placeholder: "Buscar por domicilio, nombre o teléfono...",
    value: busqueda,
    onChange: e => setBusqueda(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      marginTop: 8,
      flexWrap: "wrap",
      alignItems: "center"
    }
  }, ["todos", ...DIAS].map(d => /*#__PURE__*/React.createElement("button", {
    key: d,
    style: {
      ...s.btn,
      fontSize: 11,
      padding: "3px 10px",
      background: filtroDia === d ? "#185FA5" : "var(--color-background-tertiary)",
      color: filtroDia === d ? "#e2eaf4" : "var(--color-text-secondary)",
      border: filtroDia === d ? "none" : "0.5px solid var(--color-border-secondary)"
    },
    onClick: () => setFiltroDia(d)
  }, d === "todos" ? "Todos" : d)), /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btn,
      fontSize: 11,
      padding: "3px 10px",
      marginLeft: "auto",
      background: "#185FA5",
      color: "#e2eaf4",
      border: "none"
    },
    onClick: () => {
      setModoNuevo(true);
      setEditandoId(null);
    }
  }, "+ Nuevo"), /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btn,
      fontSize: 11,
      padding: "3px 10px"
    },
    onClick: () => {
      const porDia = {};
      DIAS.forEach(d => {
        porDia[d] = [...clientes].filter(c => c.dia === d).sort((a, b) => (a.orden || 9999) - (b.orden || 9999));
      });
      const compactados = clientes.map(c => {
        const lista = porDia[c.dia];
        const idx = lista.findIndex(x => x.id === c.id);
        return idx >= 0 ? {
          ...c,
          orden: idx + 1
        } : c;
      });
      if (window.confirm("¿Reordenar todos los clientes eliminando los huecos?")) onReordenarTodo(compactados);
    }
  }, "↺ Reordenar")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 11,
      color: clienteMoviendo ? "var(--color-text-warning)" : "var(--color-text-tertiary)",
      marginTop: 6,
      fontWeight: clienteMoviendo ? 600 : 400
    }
  }, clienteMoviendo ? `📍 Tocá el # de dónde debería ir "${clientes.find(c => c.id === clienteMoviendo)?.nombre || ""}" (mismo día · tocá el mismo para cancelar)` : `${filtrados.length} clientes${filtroDia !== "todos" ? ` · ${filtroDia}` : ""} · Tocá el # de un cliente para moverlo dentro de su día`)), modoNuevo && /*#__PURE__*/React.createElement("div", {
    style: {
      ...s.card,
      margin: "6px 14px",
      borderLeft: "3px solid #185FA5"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...s.row,
      justifyContent: "space-between",
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: "var(--color-text-primary)"
    }
  }, "Nuevo cliente"), /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btn,
      fontSize: 11,
      padding: "3px 10px"
    },
    onClick: () => setModoNuevo(false)
  }, "Cancelar")), /*#__PURE__*/React.createElement(FormCliente, {
    inicial: {
      nombre: "",
      dia: "Martes",
      barrio: "",
      manzana: "",
      lote: "",
      sector: "",
      calle: "",
      nro: "",
      aclaracion: "",
      telefono: "",
      maps: "",
      notas: "",
      sifon: 0,
      bidon10: 0,
      bidon20: 0,
      orden: ""
    },
    onGuardar: datos => {
      onNuevo(datos);
      setModoNuevo(false);
    }
  })), filtrados.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.id,
    style: {
      ...s.card,
      borderLeft: editandoId === c.id ? "3px solid #5daaff" : "0.5px solid var(--color-border-tertiary)"
    }
  }, editandoId === c.id ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      ...s.row,
      justifyContent: "space-between",
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: "var(--color-text-primary)"
    }
  }, "Editando"), /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btn,
      fontSize: 11,
      padding: "3px 10px"
    },
    onClick: () => setEditandoId(null)
  }, "Cancelar")), /*#__PURE__*/React.createElement(FormCliente, {
    inicial: c,
    onGuardar: datos => {
      onEditar(c.id, datos);
      setEditandoId(null);
    }
  })) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 10,
      cursor: onVerDetalle ? "pointer" : "default"
    },
    onClick: () => onVerDetalle && onVerDetalle(c)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: 8,
      flexShrink: 0,
      background: clienteMoviendo === c.id ? "#185FA5" : clienteMoviendo && clientes.find(x => x.id === clienteMoviendo)?.dia === c.dia ? "var(--color-background-warning)" : "var(--color-background-tertiary)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 12,
      fontWeight: 600,
      color: clienteMoviendo === c.id ? "#fff" : clienteMoviendo && clientes.find(x => x.id === clienteMoviendo)?.dia === c.dia ? "var(--color-text-warning)" : "var(--color-text-tertiary)",
      border: clienteMoviendo === c.id ? "1.5px solid #5daaff" : "none"
    },
    onClick: e => {
      e.stopPropagation();
      if (clienteMoviendo === null) setClienteMoviendo(c.id);else if (clienteMoviendo === c.id) setClienteMoviendo(null);else {
        moverCliente(clienteMoviendo, c.id);
        setClienteMoviendo(null);
      }
    }
  }, clienteMoviendo === c.id ? "✓" : c.orden || "#"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      marginBottom: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 18,
      color: "#ffffff",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, c.nombre), /*#__PURE__*/React.createElement("span", {
    style: {
      background: "#1D9E75",
      color: "#fff",
      fontSize: 10,
      padding: "1px 7px",
      borderRadius: 20,
      fontWeight: 700,
      flexShrink: 0
    }
  }, c.dia)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      color: "#e2eaf4",
      fontWeight: 600,
      marginTop: 2,
      marginBottom: 4
    }
  }, direccionCliente(c)), c.notas && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--color-text-warning)",
      marginBottom: 4
    }
  }, "📝 ", c.notas), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 4,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement(TagsCliente, {
    cliente: c,
    ventas: ventas
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      flexShrink: 0,
      alignItems: "center"
    }
  }, (c.maps || c.lat && c.lng) && /*#__PURE__*/React.createElement("a", {
    href: c.maps || `https://www.google.com/maps?q=${c.lat},${c.lng}`,
    target: "_blank",
    rel: "noreferrer",
    style: {
      fontSize: 18,
      textDecoration: "none"
    },
    onClick: e => e.stopPropagation()
  }, "📍"), c.telefono && /*#__PURE__*/React.createElement("a", {
    href: `https://wa.me/54${c.telefono}`,
    target: "_blank",
    rel: "noreferrer",
    style: {
      fontSize: 18,
      textDecoration: "none"
    },
    onClick: e => e.stopPropagation()
  }, "💬"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      cursor: "pointer",
      lineHeight: 1
    },
    onClick: e => {
      e.stopPropagation();
      setFotoClienteId(fotoClienteId === c.id ? null : c.id);
    }
  }, "📷"))), /*#__PURE__*/React.createElement(PieEnvases, {
    c: c,
    ventas: ventas,
    onEditar: onEditar,
    onPerdida: onPerdida,
    onPerdidaCliente: onPerdidaCliente,
    izquierda: /*#__PURE__*/React.createElement("button", {
      style: {
        width: 28,
        height: 28,
        borderRadius: 8,
        cursor: "pointer",
        background: "var(--color-background-danger)",
        color: "var(--color-text-danger)",
        border: "1px solid var(--color-border-danger)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13
      },
      onClick: e => {
        e.stopPropagation();
        onEliminar(c.id);
      },
      title: "Eliminar cliente"
    }, "🗑️")
  }, onRegistrarVenta && /*#__PURE__*/React.createElement("button", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      padding: "5px 12px",
      borderRadius: 20,
      cursor: "pointer",
      background: "#185FA5",
      color: "#e2eaf4",
      border: "none"
    },
    onClick: e => {
      e.stopPropagation();
      onRegistrarVenta(c);
    }
  }, "💰 Venta"), /*#__PURE__*/React.createElement("button", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      padding: "5px 12px",
      borderRadius: 20,
      cursor: "pointer",
      background: "var(--color-background-tertiary)",
      color: "var(--color-text-secondary)",
      border: "0.5px solid var(--color-border-secondary)"
    },
    onClick: e => {
      e.stopPropagation();
      setCambioId(cambioId === c.id ? null : c.id);
    }
  }, "🔄 Cambio"), /*#__PURE__*/React.createElement("button", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      padding: "5px 12px",
      borderRadius: 20,
      cursor: "pointer",
      background: "var(--color-background-tertiary)",
      color: "var(--color-text-secondary)",
      border: "0.5px solid var(--color-border-secondary)"
    },
    onClick: e => {
      e.stopPropagation();
      setEditandoId(c.id);
    }
  }, "✏️ Editar")), cambioId === c.id && /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement(CambioEnvasePanel, {
    productos: productos,
    onConfirmar: (productoViejo, productoNuevo, motivo) => {
      const vt = {
        id: Date.now(),
        clienteId: c.id,
        cliente: c.nombre,
        dia: c.dia,
        fechaKey: new Date().toLocaleDateString("en-CA"),
        fecha: new Date().toLocaleString("es-AR"),
        detalle: [{
          nombre: "Cambio de envase",
          cantidad: 1,
          precio: 0,
          total: 0
        }],
        pago: "cambio",
        obs: `Cambio: ${productoViejo} → ${productoNuevo}${motivo.trim() ? ` · ${motivo.trim()}` : ""}`,
        neto: 0,
        bruto: 0,
        desc: 0,
        costo: 0,
        ganancia: 0,
        pagadoNum: 0,
        saldoDelta: 0,
        envDev: [{
          prod: productoViejo,
          cant: 1
        }],
        envPrest: [{
          prod: productoNuevo,
          cant: 1
        }],
        _esCambio: true,
        _upd: Date.now()
      };
      onGuardarCambio && onGuardarCambio(vt);
      setCambioId(null);
    },
    onCancelar: () => setCambioId(null)
  }))))), filtrados.length === 0 && !modoNuevo && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "40px 20px",
      color: "var(--color-text-tertiary)",
      fontSize: 14
    }
  }, "No hay clientes", filtroDia !== "todos" ? ` en ${filtroDia}` : "", ".")), tab === "fiados" && /*#__PURE__*/React.createElement(FiadosTab, {
    clientes: clientes
  }), tab === "agenda" && /*#__PURE__*/React.createElement(AgendaTab, {
    recordatorios: recordatorios,
    onConfirmarRecordatorio: onConfirmarRecordatorio
  }), tab === "mapa" && /*#__PURE__*/React.createElement(MapaClientes, {
    clientes: clientes,
    dia: "todos",
    fecha: "",
    ventas: [],
    noVisitas: [],
    onSeleccionar: c => {
      onVerDetalle && onVerDetalle(c);
    },
    onActualizar: lista => {
      onReordenarTodo && onReordenarTodo(lista);
    },
    onVolver: () => setTab("lista")
  })), fotoClienteId && /*#__PURE__*/React.createElement(FotoClienteModal, {
    cliente: fotoCliente,
    onCerrar: () => setFotoClienteId(null),
    onGuardarFoto: b64 => onEditar(fotoClienteId, {
      foto: b64
    })
  }));
}
function CargaGPSMasiva({
  clientes,
  onActualizar,
  onVolver
}) {
  const sinGPS = React.useMemo(() => (clientes || []).filter(c => !c.lat || !c.lng), []);
  const [idx, setIdx] = React.useState(0);
  const [latVal, setLatVal] = React.useState("");
  const [lngVal, setLngVal] = React.useState("");
  const [guardados, setGuardados] = React.useState(0);
  const [listo, setListo] = React.useState(false);
  const actualizados = React.useRef([...clientes]);
  const cliente = sinGPS[idx] || null;
  const coordsDelLink = cliente?.maps ? extraerCoordsDeURL(cliente.maps) : null;
  React.useEffect(() => {
    if (!cliente) return;
    if (coordsDelLink) {
      setLatVal(String(coordsDelLink.lat));
      setLngVal(String(coordsDelLink.lng));
    } else {
      setLatVal("");
      setLngVal("");
    }
  }, [idx]);
  const guardarYSiguiente = (omitir = false) => {
    if (!omitir && cliente) {
      const lat = parseFloat(latVal),
        lng = parseFloat(lngVal);
      if (!isNaN(lat) && !isNaN(lng)) {
        const i = actualizados.current.findIndex(c => c.id === cliente.id);
        if (i >= 0) actualizados.current[i] = {
          ...actualizados.current[i],
          lat,
          lng
        };
        const nuevosGuardados = guardados + 1;
        setGuardados(nuevosGuardados);
        const esUltimo = idx + 1 >= sinGPS.length;
        if (nuevosGuardados % 5 === 0 || esUltimo) onActualizar([...actualizados.current]);
      }
    }
    setLatVal("");
    setLngVal("");
    if (idx + 1 >= sinGPS.length) setListo(true);else setIdx(i => i + 1);
  };
  if (sinGPS.length === 0 || listo || !cliente) return /*#__PURE__*/React.createElement("div", {
    style: {
      ...s.screen,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      padding: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 48
    }
  }, "✅"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 600,
      color: "var(--color-text-primary)",
      textAlign: "center"
    }
  }, "¡GPS cargado!"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--color-text-secondary)",
      textAlign: "center"
    }
  }, guardados, " cliente", guardados !== 1 ? "s" : "", " con GPS guardado."), /*#__PURE__*/React.createElement("button", {
    style: s.btnPrimary,
    onClick: onVolver
  }, "Ver mapa →"));
  const progreso = Math.round(idx / sinGPS.length * 100);
  const dir = cliente.calle ? `${cliente.calle} ${cliente.nro || ""}`.trim() : cliente.manzana ? `Mz ${cliente.manzana} L ${cliente.lote || ""} · ${cliente.barrio || ""}` : cliente.barrio || "";
  const latOk = latVal && lngVal && !isNaN(parseFloat(latVal)) && !isNaN(parseFloat(lngVal));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...s.screen,
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement(HeaderApp, {
    titulo: `Cargar GPS · ${idx + 1}/${sinGPS.length}`,
    onVolver: onVolver
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 4,
      background: "var(--color-background-tertiary)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      background: "#185FA5",
      width: `${progreso}%`,
      transition: "width 0.3s"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...s.card,
      margin: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 600,
      color: "var(--color-text-primary)",
      marginBottom: 2
    }
  }, cliente.nombre), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--color-text-secondary)"
    }
  }, cliente.dia, " · ", dir), cliente.maps && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "var(--color-text-tertiary)",
      marginTop: 2,
      wordBreak: "break-all"
    }
  }, cliente.maps)), coordsDelLink && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--color-background-success)",
      borderRadius: 10,
      padding: "10px 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--color-text-success)",
      fontWeight: 600
    }
  }, "✓ Coordenadas extraídas del link"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--color-text-success)"
    }
  }, coordsDelLink.lat.toFixed(5), ", ", coordsDelLink.lng.toFixed(5))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--color-background-info)",
      borderRadius: 10,
      padding: "10px 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--color-text-info)",
      fontWeight: 600,
      marginBottom: 4
    }
  }, "📋 Cómo obtener las coordenadas:"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--color-text-secondary)",
      lineHeight: 1.8
    }
  }, "1. Tocá ", /*#__PURE__*/React.createElement("b", null, "\"Abrir en Maps\""), " abajo", /*#__PURE__*/React.createElement("br", null), "2. ", /*#__PURE__*/React.createElement("b", null, "Mantené presionado"), " el punto del cliente", /*#__PURE__*/React.createElement("br", null), "3. Aparecen los números arriba: ", /*#__PURE__*/React.createElement("b", null, "-26.865, -65.217"), /*#__PURE__*/React.createElement("br", null), "4. Tocá esos números → ", /*#__PURE__*/React.createElement("b", null, "Copiar"), /*#__PURE__*/React.createElement("br", null), "5. Volvé acá y pegá abajo")), cliente.maps && /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btnPrimary,
      background: "#1a7a3a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8
    },
    onClick: () => window.open(cliente.maps, "_blank")
  }, "🗺 Abrir en Google Maps"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...s.card,
      margin: 0
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      ...s.label,
      fontSize: 12,
      fontWeight: 600
    }
  }, "Pegá las coordenadas (ej: -26.86590, -65.21780)"), /*#__PURE__*/React.createElement("input", {
    style: {
      ...s.input,
      marginTop: 4
    },
    placeholder: "-26.86590, -65.21780",
    value: latVal && lngVal ? `${latVal}, ${lngVal}` : latVal,
    onChange: e => {
      const raw = e.target.value;
      const m = raw.match(/(-?\d+(?:\.\d+)?)[,;\s]+(-?\d+(?:\.\d+)?)/);
      if (m) {
        setLatVal(m[1]);
        setLngVal(m[2]);
      } else setLatVal(raw);
    }
  }), latOk ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#4dd9a0",
      marginTop: 4
    }
  }, "✓ ", latVal, ", ", lngVal) : /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--color-text-tertiary)",
      marginTop: 4
    }
  }, "Pegá los dos números separados por coma")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btn,
      flex: 1,
      padding: "12px",
      fontSize: 13
    },
    onClick: () => guardarYSiguiente(true)
  }, "Omitir →"), /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btnPrimary,
      flex: 2,
      opacity: latOk || coordsDelLink ? 1 : 0.4
    },
    disabled: !latOk && !coordsDelLink,
    onClick: () => guardarYSiguiente(false)
  }, "Guardar y siguiente →")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--color-text-tertiary)",
      textAlign: "center"
    }
  }, guardados, " guardados · ", sinGPS.length - idx - 1, " restantes · Se sincroniza cada 5")));
}

// ── Algoritmo ruta óptima (vecino más cercano) ────────────────────────────────
function calcularRutaOptima(clientes) {
  if (clientes.length <= 1) return clientes;
  const dist = (a, b) => Math.hypot(a.lat - b.lat, a.lng - b.lng);
  const restantes = [...clientes];
  const ruta = [restantes.shift()];
  while (restantes.length > 0) {
    const ultimo = ruta[ruta.length - 1];
    let minDist = Infinity,
      minIdx = 0;
    restantes.forEach((c, i) => {
      const d = dist(ultimo, c);
      if (d < minDist) {
        minDist = d;
        minIdx = i;
      }
    });
    ruta.push(restantes.splice(minIdx, 1)[0]);
  }
  return ruta;
}

// ── PreviaRuta ────────────────────────────────────────────────────────────────
function PreviaRuta({
  rutaOptima,
  ventasHoy,
  noVisHoy,
  onAplicar,
  onVolver
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...s.screen,
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement(HeaderApp, {
    titulo: "Ruta óptima sugerida",
    onVolver: onVolver
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px 14px",
      background: "var(--color-background-info)",
      borderBottom: "0.5px solid var(--color-border-tertiary)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--color-text-info)",
      lineHeight: 1.6
    }
  }, "Orden que minimiza la distancia total del recorrido. Podés aplicarlo o volver sin cambios.")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      paddingBottom: 80
    }
  }, rutaOptima.map((c, i) => {
    const entregado = ventasHoy.some(v => v.clienteId === c.id);
    const noVis = noVisHoy.some(v => v.clienteId === c.id);
    const dir = c.calle ? c.calle + " " + (c.nro || "") : c.manzana ? "Mz " + c.manzana + " L " + (c.lote || "") : c.barrio || "";
    return /*#__PURE__*/React.createElement("div", {
      key: c.id,
      style: {
        ...s.card,
        margin: "6px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "#185FA5",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 700,
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 500,
        color: "var(--color-text-primary)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, c.nombre), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "var(--color-text-secondary)"
      }
    }, c.dia, " · ", dir)), entregado && /*#__PURE__*/React.createElement("span", {
      style: s.badge("success")
    }, "✓"), noVis && /*#__PURE__*/React.createElement("span", {
      style: s.badge("danger")
    }, "✗"), c.orden && c.orden !== i + 1 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        color: "var(--color-text-tertiary)"
      }
    }, "antes:", c.orden));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      maxWidth: 480,
      padding: "12px 16px",
      background: "var(--color-background-secondary)",
      borderTop: "0.5px solid var(--color-border-tertiary)",
      display: "flex",
      gap: 8,
      zIndex: 20
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btn,
      flex: 1,
      padding: "12px"
    },
    onClick: onVolver
  }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btnPrimary,
      flex: 2
    },
    onClick: onAplicar
  }, "✓ Aplicar este orden")));
}

// ── MapaClientes ──────────────────────────────────────────────────────────────
function MapaClientes({
  clientes,
  dia,
  fecha,
  ventas,
  noVisitas,
  onSeleccionar,
  onVolver,
  onActualizar
}) {
  const mapRef = React.useRef(null);
  const mapInstRef = React.useRef(null);
  const [leafletOk, setLeafletOk] = React.useState(!!window.L);
  const [filtroDia, setFiltroDia] = React.useState(dia || "todos");
  const [modoCarga, setModoCarga] = React.useState(false);
  const [modoRuta, setModoRuta] = React.useState(false);
  const [mostrarRuta, setMostrarRuta] = React.useState(false);
  const ventasHoy = (ventas || []).filter(v => v.fechaKey === fecha);
  const noVisHoy = (noVisitas || []).filter(v => v.fecha === fecha);
  const clientesFiltrados = (clientes || []).filter(c => {
    if (filtroDia !== "todos" && c.dia !== filtroDia) return false;
    return c.lat && c.lng;
  });
  const sinCoordenadas = (clientes || []).filter(c => (filtroDia === "todos" || c.dia === filtroDia) && (!c.lat || !c.lng)).length;
  const entregadosCount = clientesFiltrados.filter(c => ventasHoy.some(v => v.clienteId === c.id)).length;
  const pendientesCount = clientesFiltrados.filter(c => !ventasHoy.some(v => v.clienteId === c.id) && !noVisHoy.some(v => v.clienteId === c.id)).length;
  const rutaOptima = React.useMemo(() => calcularRutaOptima([...clientesFiltrados]), [clientesFiltrados.length, filtroDia]);
  React.useEffect(() => {
    if (window.L) {
      setLeafletOk(true);
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => setLeafletOk(true);
    document.head.appendChild(script);
  }, []);
  React.useEffect(() => {
    if (modoCarga || modoRuta) return;
    if (!leafletOk || !mapRef.current) return;
    if (mapInstRef.current) {
      mapInstRef.current.remove();
      mapInstRef.current = null;
    }
    const L = window.L;
    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19
    }).addTo(map);
    mapInstRef.current = map;
    const bounds = [];
    const lista = mostrarRuta ? rutaOptima : clientesFiltrados;
    lista.forEach((c, rutaIdx) => {
      const entregado = ventasHoy.some(v => v.clienteId === c.id);
      const noVis = noVisHoy.some(v => v.clienteId === c.id);
      const color = entregado ? "#4dd9a0" : noVis ? "#f07070" : "#5daaff";
      const num = mostrarRuta ? rutaIdx + 1 : c.orden || "·";
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:30px;height:30px;border-radius:50%;background:${color};border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;box-shadow:0 2px 6px rgba(0,0,0,.4)">${num}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -16]
      });
      const marker = L.marker([c.lat, c.lng], {
        icon
      }).addTo(map);
      const dir = direccionCliente(c);
      const estado = entregado ? "<span style='color:#059669;font-weight:600'>✓ Entregado</span>" : noVis ? "<span style='color:#dc2626;font-weight:600'>✗ No visitado</span>" : "<span style='color:#2563eb;font-weight:600'>⏳ Pendiente</span>";
      const popupId = `popup_btn_${c.id}`;
      marker.bindPopup(`<div style="font-family:sans-serif;min-width:170px;padding:4px 0"><div style="font-size:14px;font-weight:700;margin-bottom:2px">${c.nombre}</div><div style="font-size:11px;color:#666;margin-bottom:4px">${c.dia} · ${dir}</div><div style="margin-bottom:8px">${estado}</div>${!entregado ? `<button id="${popupId}" style="background:#185FA5;color:#fff;border:none;border-radius:8px;padding:8px 14px;font-size:13px;font-weight:600;cursor:pointer;width:100%">Entregar →</button>` : ""}</div>`);
      marker.on("popupopen", () => {
        const btn = document.getElementById(popupId);
        if (btn) btn.onclick = () => {
          map.closePopup();
          onSeleccionar(c);
        };
      });
      bounds.push([c.lat, c.lng]);
    });
    if (mostrarRuta && rutaOptima.length > 1) L.polyline(rutaOptima.map(c => [c.lat, c.lng]), {
      color: "#185FA5",
      weight: 3,
      opacity: 0.7,
      dashArray: "8,6"
    }).addTo(map);
    if (bounds.length > 0) map.fitBounds(bounds, {
      padding: [30, 30]
    });else map.setView([-26.82, -65.2], 13);
    return () => {
      if (mapInstRef.current) {
        mapInstRef.current.remove();
        mapInstRef.current = null;
      }
    };
  }, [leafletOk, modoCarga, modoRuta, filtroDia, clientesFiltrados.length, mostrarRuta]);
  if (modoCarga) return /*#__PURE__*/React.createElement(CargaGPSMasiva, {
    clientes: clientes,
    onActualizar: onActualizar,
    onVolver: () => setModoCarga(false)
  });
  if (modoRuta) return /*#__PURE__*/React.createElement(PreviaRuta, {
    rutaOptima: rutaOptima,
    ventasHoy: ventasHoy,
    noVisHoy: noVisHoy,
    onAplicar: () => {
      const actualizados = [...clientes];
      rutaOptima.forEach((c, i) => {
        const idx = actualizados.findIndex(x => x.id === c.id);
        if (idx >= 0) actualizados[idx] = {
          ...actualizados[idx],
          orden: i + 1
        };
      });
      onActualizar(actualizados);
      setModoRuta(false);
      setMostrarRuta(true);
    },
    onVolver: () => setModoRuta(false)
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...s.screen,
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement(HeaderApp, {
    titulo: "Mapa de clientes",
    onVolver: onVolver
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      padding: "8px 14px",
      overflowX: "auto",
      background: "var(--color-background-secondary)",
      borderBottom: "0.5px solid var(--color-border-tertiary)",
      alignItems: "center"
    }
  }, ["todos", ...DIAS].map(d => /*#__PURE__*/React.createElement("button", {
    key: d,
    style: {
      ...s.btn,
      padding: "5px 12px",
      fontSize: 12,
      flexShrink: 0,
      background: filtroDia === d ? "#185FA5" : "var(--color-background-tertiary)",
      color: filtroDia === d ? "#e2eaf4" : "var(--color-text-secondary)",
      border: filtroDia === d ? "none" : "0.5px solid var(--color-border-secondary)"
    },
    onClick: () => setFiltroDia(d)
  }, d === "todos" ? "Todos" : d)), clientesFiltrados.length > 1 && /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btn,
      fontSize: 11,
      padding: "5px 10px",
      flexShrink: 0,
      background: "var(--color-background-info)",
      color: "var(--color-text-info)",
      border: "none"
    },
    onClick: () => setModoRuta(true)
  }, "🗺 Ruta óptima")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      background: "var(--color-background-secondary)",
      borderBottom: "0.5px solid var(--color-border-tertiary)"
    }
  }, [{
    val: clientesFiltrados.length,
    lbl: "Con GPS",
    color: "#5daaff"
  }, {
    val: entregadosCount,
    lbl: "Entregados",
    color: "#4dd9a0"
  }, {
    val: pendientesCount,
    lbl: "Pendientes",
    color: "#f5b942"
  }, {
    val: sinCoordenadas,
    lbl: "Sin GPS",
    color: "var(--color-text-tertiary)"
  }].map((item, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      textAlign: "center",
      padding: "8px 4px",
      borderRight: i < 3 ? "0.5px solid var(--color-border-tertiary)" : "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 600,
      color: item.color
    }
  }, item.val), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      color: "var(--color-text-secondary)"
    }
  }, item.lbl)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "6px 14px",
      background: "var(--color-background-secondary)",
      borderBottom: "0.5px solid var(--color-border-tertiary)"
    }
  }, [["#4dd9a0", "Entregado"], ["#5daaff", "Pendiente"], ["#f07070", "No visitado"]].map(([color, lbl]) => /*#__PURE__*/React.createElement("div", {
    key: lbl,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: color
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: "var(--color-text-secondary)"
    }
  }, lbl))), clientesFiltrados.length > 1 && /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btn,
      fontSize: 10,
      padding: "3px 8px",
      marginLeft: "auto",
      background: mostrarRuta ? "#185FA5" : "var(--color-background-tertiary)",
      color: mostrarRuta ? "#e2eaf4" : "var(--color-text-secondary)",
      border: "none"
    },
    onClick: () => setMostrarRuta(r => !r)
  }, mostrarRuta ? "Ocultar ruta" : "Ver ruta")), leafletOk && clientesFiltrados.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 14,
      padding: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 40
    }
  }, "📍"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 500,
      color: "var(--color-text-primary)",
      textAlign: "center"
    }
  }, "Sin clientes con GPS"), /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btnPrimary,
      maxWidth: 260
    },
    onClick: () => setModoCarga(true)
  }, "📍 Iniciar carga de GPS (", sinCoordenadas, " clientes)")), !leafletOk && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--color-text-secondary)"
    }
  }, "Cargando mapa...")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      position: "relative",
      display: leafletOk && clientesFiltrados.length > 0 ? "block" : "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: mapRef,
    style: {
      width: "100%",
      height: "100%",
      minHeight: 400
    }
  }), sinCoordenadas > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: () => setModoCarga(true),
    style: {
      position: "absolute",
      bottom: 16,
      right: 16,
      zIndex: 1000,
      background: "#185FA5",
      color: "#e2eaf4",
      border: "none",
      borderRadius: 24,
      padding: "10px 16px",
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      boxShadow: "0 3px 12px rgba(0,0,0,0.4)"
    }
  }, "📍 ", sinCoordenadas, " sin GPS")));
}