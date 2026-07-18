// ════════════════════════════════════════════════════════════════════
// ◆  05-portada.js — Portada · fechas · SelectorFecha · SetupScreen · SyncBar · SetupNube
// ════════════════════════════════════════════════════════════════════

function Portada({
  onIngresar
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 20,
      padding: 32,
      minHeight: "100vh"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 80,
      height: 80,
      borderRadius: "50%",
      background: "var(--color-background-info)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 38
    }
  }, "💧"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 24,
      fontWeight: 500,
      color: "var(--color-text-primary)",
      marginBottom: 6
    }
  }, "Sistema de Reparto"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      color: "var(--color-text-secondary)"
    }
  }, "Soda y Agua Tratada · Reparto")), /*#__PURE__*/React.createElement("button", {
    style: {
      ...s.btnPrimary,
      width: 200,
      marginTop: 8
    },
    onClick: onIngresar
  }, "Ingresar"), typeof window !== "undefined" && window.matchMedia && !window.matchMedia("(display-mode: standalone)").matches && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--color-text-tertiary)",
      textAlign: "center",
      lineHeight: 1.6,
      marginTop: 4,
      maxWidth: 240
    }
  }, "💡 Instalá la app: menú del navegador → \"Agregar a pantalla de inicio\""));
}

// ── Generador de fechas por día de semana ────────────────────────────────────
function getFechasDelAnio(diaNombre) {
  const diasSemana = {
    "Lunes": 1,
    "Martes": 2,
    "Miércoles": 3,
    "Jueves": 4,
    "Viernes": 5,
    "Sábado": 6,
    "Domingo": 0
  };
  const target = diasSemana[diaNombre];
  if (target === undefined) return [];
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const fechas = [];
  const d = new Date(anio, 0, 1);
  while (d.getDay() !== target) d.setDate(d.getDate() + 1);
  while (d.getFullYear() === anio) {
    fechas.push(new Date(d));
    d.setDate(d.getDate() + 7);
  }
  return fechas;
}
function formatFecha(d) {
  return d.toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short"
  });
}
function fechaKey(d) {
  return d.toLocaleDateString("en-CA");
}
function hoyKey() {
  return new Date().toLocaleDateString("en-CA");
}
function SelectorFecha({
  dia,
  planillas,
  ventas,
  noVisitas,
  onSeleccionar,
  onVolver
}) {
  const fechas = getFechasDelAnio(dia);
  const hoy = hoyKey();
  const [mostrarTodas, setMostrarTodas] = useState(false);

  // Agrupar por mes
  const porMes = {};
  fechas.forEach(f => {
    const mes = f.toLocaleDateString("es-AR", {
      month: "long",
      year: "numeric"
    });
    if (!porMes[mes]) porMes[mes] = [];
    porMes[mes].push(f);
  });
  const meses = Object.keys(porMes);
  const mesActual = new Date().toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric"
  });
  const [mesAbierto, setMesAbierto] = useState(mesActual);
  const ventasPorFecha = {};
  ventas.filter(v => v.dia === dia).forEach(v => {
    const fk = v.fechaKey || v.fecha?.slice(0, 10) || "";
    ventasPorFecha[fk] = (ventasPorFecha[fk] || 0) + 1;
  });
  const visitasPorFecha = {};
  (noVisitas || []).filter(v => v.dia === dia).forEach(v => {
    visitasPorFecha[v.fecha] = (visitasPorFecha[v.fecha] || 0) + 1;
  });
  return /*#__PURE__*/React.createElement("div", {
    style: s.screen
  }, /*#__PURE__*/React.createElement(HeaderApp, {
    titulo: `Fechas de visita · ${dia}`,
    onVolver: onVolver
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "8px 16px"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: "var(--color-text-secondary)",
      marginBottom: 8
    }
  }, "Seleccioná la fecha de reparto para comenzar o continuar la jornada."), meses.map(mes => {
    const abierto = mes === mesAbierto;
    return /*#__PURE__*/React.createElement("div", {
      key: mes,
      style: {
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("button", {
      style: {
        ...s.card,
        margin: 0,
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 14px",
        background: abierto ? "var(--color-background-info)" : "var(--color-background-secondary)"
      },
      onClick: () => setMesAbierto(abierto ? null : mes)
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        fontWeight: 500,
        color: abierto ? "var(--color-text-info)" : "var(--color-text-primary)",
        textTransform: "capitalize"
      }
    }, mes), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--color-text-tertiary)"
      }
    }, abierto ? "▲" : "▼")), abierto && /*#__PURE__*/React.createElement("div", {
      style: {
        border: "0.5px solid var(--color-border-tertiary)",
        borderTop: "none",
        borderRadius: "0 0 12px 12px",
        overflow: "hidden"
      }
    }, porMes[mes].map(f => {
      const fk = fechaKey(f);
      const planKey = `${dia}_${fk}`;
      const tienePlanilla = !!planillas[planKey];
      const nVentas = ventasPorFecha[fk] || 0;
      const nVisitas = visitasPorFecha[fk] || 0;
      const esHoy = fk === hoy;
      return /*#__PURE__*/React.createElement("button", {
        key: fk,
        style: {
          width: "100%",
          textAlign: "left",
          padding: "12px 16px",
          cursor: "pointer",
          border: "none",
          borderBottom: "0.5px solid var(--color-border-tertiary)",
          background: esHoy ? "var(--color-background-success)" : "var(--color-background-primary)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        },
        onClick: () => onSeleccionar(fk, f)
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 14,
          fontWeight: esHoy ? 500 : 400,
          color: esHoy ? "var(--color-text-success)" : "var(--color-text-primary)",
          textTransform: "capitalize"
        }
      }, formatFecha(f), esHoy ? " · Hoy" : ""), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          gap: 6,
          marginTop: 4
        }
      }, nVentas > 0 && /*#__PURE__*/React.createElement("span", {
        style: s.badge("success")
      }, nVentas, " entregas"), nVisitas > 0 && /*#__PURE__*/React.createElement("span", {
        style: s.badge("warning")
      }, nVisitas, " visitas s/venta"), tienePlanilla && /*#__PURE__*/React.createElement("span", {
        style: s.badge("info")
      }, "planilla ✓"))), /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--color-text-tertiary)"
        }
      }, "→"));
    })));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      ...s.card,
      margin: "12px 0 0",
      background: "var(--color-background-tertiary)"
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: s.label
  }, "📅 Fecha especial (feriado o reparto extra)"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    style: {
      ...s.input,
      fontSize: 14,
      marginTop: 4
    },
    onChange: e => {
      if (e.target.value) {
        const d = new Date(e.target.value + 'T12:00:00');
        onSeleccionar(e.target.value, d);
      }
    }
  }))));
}
function SetupScreen({
  onSetup
}) {
  React.useEffect(() => {
    onSetup("firebase", "firebase");
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 40,
      textAlign: "center",
      color: "var(--color-text-secondary)"
    }
  }, "Conectando con Firebase...");
}
function SyncBar({
  status,
  isOnline
}) {
  if (status === "idle") {
    if (!isOnline) return /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#3d2e1e",
        color: "#f59e0b",
        textAlign: "center",
        fontSize: 11,
        padding: "4px",
        fontWeight: 500
      }
    }, "📵 Sin conexión · Los cambios se sincronizan al reconectar");
    return null;
  }
  if (status === "saved") return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--color-background-success)",
      color: "var(--color-text-success)",
      textAlign: "center",
      fontSize: 12,
      padding: "5px",
      fontWeight: 500
    }
  }, "✓ Guardado");
  const cfg = {
    loading: {
      bg: "#1e3a5f",
      color: "#5daaff",
      txt: "⏳ Cargando datos de la nube..."
    },
    saving: {
      bg: "var(--color-background-warning)",
      color: "var(--color-text-warning)",
      txt: "☁ Guardando..."
    },
    error: {
      bg: "var(--color-background-danger)",
      color: "var(--color-text-danger)",
      txt: "⚠ Error al guardar en la nube"
    },
    offline: {
      bg: "#3d2e1e",
      color: "#f59e0b",
      txt: "📵 Sin conexión — los cambios se guardan localmente"
    },
    offline_pending: {
      bg: "#3d2e1e",
      color: "#f59e0b",
      txt: "📵 Sin conexión — cambios pendientes de sincronizar"
    }
  };
  const c = cfg[status] || cfg.saving;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: c.bg,
      color: c.color,
      textAlign: "center",
      fontSize: 12,
      padding: "6px",
      fontWeight: 500
    }
  }, c.txt);
}
function SetupNube({
  onSetup
}) {
  const [paso, setPaso] = useState(1);
  // No API config needed with Firebase
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const conectar = async () => {
    if (!apiKey.trim()) {
      setError("Pegá tu API Key primero");
      return;
    }
    setCargando(true);
    setError("");
    try {
      const binId = await cloudCreate(apiKey.trim());
      localStorage.setItem("cat_apikey", JSON.stringify(apiKey.trim()));
      localStorage.setItem("cat_binid", JSON.stringify(binId));
      onSetup(apiKey.trim(), binId);
    } catch (e) {
      setError("API Key incorrecta o sin conexión. Revisá la clave e intentá de nuevo.");
    }
    setCargando(false);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 480,
      margin: "0 auto",
      minHeight: "100vh",
      background: "var(--color-background-primary)",
      padding: 24,
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      paddingTop: 32,
      paddingBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 40,
      marginBottom: 12
    }
  }, "☁️"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 20,
      fontWeight: 500,
      color: "var(--color-text-primary)",
      marginBottom: 6
    }
  }, "Configurar guardado en la nube"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: "var(--color-text-secondary)",
      lineHeight: 1.6
    }
  }, "Necesitás hacer esto una sola vez. Después todo se guarda automáticamente.")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--color-background-secondary)",
      borderRadius: 12,
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 24,
      height: 24,
      borderRadius: "50%",
      background: "#185FA5",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 13,
      fontWeight: 600,
      flexShrink: 0
    }
  }, "1"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: "var(--color-text-primary)"
    }
  }, "Entrá a jsonbin.io"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--color-text-secondary)",
      marginTop: 2
    }
  }, "Abrí una nueva pestaña y andá a jsonbin.io"), /*#__PURE__*/React.createElement("a", {
    href: "https://jsonbin.io",
    target: "_blank",
    rel: "noreferrer",
    style: {
      fontSize: 13,
      color: "#185FA5",
      fontWeight: 500
    }
  }, "Abrir jsonbin.io →"))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "0.5px solid var(--color-border-tertiary)",
      paddingTop: 10,
      display: "flex",
      alignItems: "flex-start",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 24,
      height: 24,
      borderRadius: "50%",
      background: "#185FA5",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 13,
      fontWeight: 600,
      flexShrink: 0
    }
  }, "2"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: "var(--color-text-primary)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500
    }
  }, "Registrate gratis"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--color-text-secondary)",
      marginTop: 2,
      lineHeight: 1.6
    }
  }, "Tocá ", /*#__PURE__*/React.createElement("b", null, "Sign Up"), " · Usá tu email · Confirmá el email si te pide"))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "0.5px solid var(--color-border-tertiary)",
      paddingTop: 10,
      display: "flex",
      alignItems: "flex-start",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 24,
      height: 24,
      borderRadius: "50%",
      background: "#185FA5",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 13,
      fontWeight: 600,
      flexShrink: 0
    }
  }, "3"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: "var(--color-text-primary)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500
    }
  }, "Copiá tu API Key"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--color-text-secondary)",
      marginTop: 2,
      lineHeight: 1.6
    }
  }, "Una vez adentro andá a ", /*#__PURE__*/React.createElement("b", null, "API Keys"), " en el menú → ", /*#__PURE__*/React.createElement("b", null, "+ Create Access Key"), " → nombrarla ", /*#__PURE__*/React.createElement("b", null, "reparto-app"), " → copiá la clave larga que aparece")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 13,
      color: "var(--color-text-secondary)",
      marginBottom: 6,
      display: "block"
    }
  }, "Pegá tu API Key acá"), /*#__PURE__*/React.createElement("textarea", {
    style: {
      width: "100%",
      padding: "10px",
      border: "0.5px solid var(--color-border-secondary)",
      borderRadius: 8,
      fontSize: 13,
      background: "var(--color-background-secondary)",
      color: "var(--color-text-primary)",
      outline: "none",
      minHeight: 70,
      resize: "none",
      boxSizing: "border-box",
      lineHeight: 1.5
    },
    placeholder: "$2b$10$xxxxxxxxxxxxxxxxxx...",
    value: apiKey,
    onChange: e => setApiKey(e.target.value)
  }), error && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--color-text-danger)",
      marginTop: 6
    }
  }, error)), /*#__PURE__*/React.createElement("button", {
    style: {
      background: "#185FA5",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      padding: "14px",
      fontSize: 15,
      fontWeight: 500,
      cursor: "pointer",
      opacity: cargando ? 0.7 : 1
    },
    onClick: conectar,
    disabled: cargando
  }, cargando ? "Conectando..." : "Conectar y comenzar"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: "var(--color-text-tertiary)",
      textAlign: "center",
      lineHeight: 1.6
    }
  }, "Tus datos se guardan en tu cuenta privada de JSONBin. Es gratis y seguro. Solo vos tenés acceso."));
}

// ── Pantalla de código de acceso (primera vez) ────────────────────
function PantallaCodigoAcceso({
  onCodigo
}) {
  const [codigo, setCodigo] = React.useState("");
  const [estado, setEstado] = React.useState("idle"); // idle | verificando | error | ok
  const [mensaje, setMensaje] = React.useState("");
  const verificar = async () => {
    const cod = codigo.trim().toUpperCase();
    if (!cod) {
      setMensaje("Ingresá tu código de acceso");
      return;
    }
    setEstado("verificando");
    setMensaje("");
    try {
      const lic = await window.verificarLicencia(cod);
      if (!lic) {
        setEstado("error");
        setMensaje("Código inválido o inactivo. Verificá con tu administrador.");
        return;
      }
      // Guardar todos los datos del dueño en localStorage
      localStorage.setItem("sr_licencia", JSON.stringify({
        codigo: cod,
        pin: String(lic.pin || ""),
        email: lic.email || "",
        negocio: lic.negocio || lic.nombre || "Sistema de Reparto",
        nombre: lic.nombre || lic.negocio || "",
        celular: lic.celular || ""
      }));
      setEstado("ok");
      setTimeout(() => onCodigo(cod), 600);
    } catch (e) {
      setEstado("error");
      setMensaje("Error de conexión. Verificá tu internet e intentá de nuevo.");
    }
  };
  const btnColor = estado === "ok" ? "#4dd9a0" : estado === "verificando" ? "#4a6a85" : "#7b3fc9";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--color-background-primary,#0f1923)",
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: 340
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginBottom: 32
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "icono-192.png",
    alt: "",
    onError: e => e.target.remove(),
    style: {
      width: 72,
      height: 72,
      borderRadius: 18,
      marginBottom: 14
    }
  }), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 22,
      fontWeight: 700,
      color: "var(--color-text-primary,#e2eaf4)",
      margin: 0
    }
  }, "Sistema de Reparto"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: "var(--color-text-secondary,#7a9ab8)",
      marginTop: 6
    }
  }, "Ingresá tu código de activación")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--color-background-secondary,#1a2b3c)",
      borderRadius: 16,
      padding: 24,
      border: "0.5px solid rgba(255,255,255,0.08)"
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 11,
      color: "var(--color-text-secondary,#7a9ab8)",
      display: "block",
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: "0.06em"
    }
  }, "Código de activación"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Ej: SR2026-Q4IS",
    value: codigo,
    onChange: e => {
      setCodigo(e.target.value.toUpperCase());
      setEstado("idle");
      setMensaje("");
    },
    onKeyDown: e => {
      if (e.key === "Enter") verificar();
    },
    style: {
      width: "100%",
      padding: "14px 16px",
      border: estado === "error" ? "1.5px solid #f07070" : "1.5px solid rgba(255,255,255,0.12)",
      borderRadius: 10,
      fontSize: 18,
      fontWeight: 700,
      background: "rgba(255,255,255,0.05)",
      color: "var(--color-text-primary,#e2eaf4)",
      outline: "none",
      boxSizing: "border-box",
      letterSpacing: "0.1em",
      textAlign: "center",
      textTransform: "uppercase"
    },
    autoFocus: true
  }), mensaje && /*#__PURE__*/React.createElement("p", {
    style: {
      color: estado === "error" ? "#f07070" : "#4dd9a0",
      fontSize: 13,
      marginTop: 8,
      textAlign: "center"
    }
  }, estado === "error" ? "⚠️ " : estado === "ok" ? "✅ " : "", mensaje), /*#__PURE__*/React.createElement("button", {
    onClick: verificar,
    disabled: estado === "verificando" || estado === "ok",
    style: {
      width: "100%",
      marginTop: 16,
      padding: "14px",
      borderRadius: 10,
      border: "none",
      background: btnColor,
      color: "#fff",
      fontSize: 15,
      fontWeight: 600,
      cursor: estado === "verificando" ? "wait" : "pointer",
      opacity: estado === "verificando" ? 0.7 : 1,
      transition: "all 0.2s"
    }
  }, estado === "verificando" ? "Verificando..." : estado === "ok" ? "✓ Activado" : "Verificar código →")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: "var(--color-text-tertiary,#4a6a85)",
      textAlign: "center",
      marginTop: 20,
      lineHeight: 1.6
    }
  }, "El código lo encontrás en tu panel de Emma Control")));
}

// ── Pantalla de Activación (primera vez, después del código) ─────────
function PantallaActivacion({
  onActivado
}) {
  const lic = (() => {
    try {
      return JSON.parse(localStorage.getItem("sr_licencia") || "{}");
    } catch {
      return {};
    }
  })();
  const [negocio, setNegocio] = React.useState(lic.negocio || "");
  const [email, setEmail] = React.useState(lic.email || "");
  const pinAsignado = String(lic.pin || "");
  const [tyc, setTyc] = React.useState(false);
  const [estado, setEstado] = React.useState("idle"); // idle | verificando | error | ok
  const [error, setError] = React.useState("");
  const activar = async () => {
    setError("");
    // Validaciones
    if (!negocio.trim()) {
      setError("Ingresá el nombre de tu empresa.");
      return;
    }
    if (!email.trim()) {
      setError("Ingresá tu email.");
      return;
    }
    if (!tyc) {
      setError("Debés aceptar los Términos y Condiciones.");
      return;
    }

    // Verificar que el email coincida con la licencia
    const emailNorm = email.trim().toLowerCase();
    const licEmail = (lic.email || "").trim().toLowerCase();
    if (licEmail && emailNorm !== licEmail) {
      setError("El email no coincide con el registrado en tu licencia.");
      return;
    }
    // El PIN lo asigna el administrador (viene en la licencia)
    if (!pinAsignado) {
      setError("Tu licencia no tiene un PIN asignado. Contactá al administrador.");
      return;
    }
    setEstado("verificando");
    try {
      // ── Control de dispositivo: que el código no se use en varios equipos ──
      const cod = (lic.codigo || "").trim().toUpperCase();
      let deviceId = localStorage.getItem("sr_device_id");
      if (!deviceId) {
        deviceId = "dev_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem("sr_device_id", deviceId);
      }
      if (cod && window.dbLicencias) {
        try {
          const snap = await window.dbLicencias.collection("licencias").doc(cod).get();
          if (snap.exists) {
            const d = snap.data();
            const miTipo = window.tipoDispositivoRM ? window.tipoDispositivoRM() : "pc";
            const dispositivos = window.slotsLicenciaRM ? window.slotsLicenciaRM(d, deviceId, miTipo) : {
              pc: deviceId,
              movil: deviceId
            };
            const slotOcupado = dispositivos[miTipo];
            // Si ese TIPO de aparato (PC o móvil) ya está ocupado por otro dispositivo, bloquear
            if (slotOcupado && slotOcupado !== deviceId) {
              setEstado("error");
              setError(`Este código ya está en uso en ${miTipo === "pc" ? "otra computadora" : "otro celular"}. Contactá al administrador.`);
              return;
            }
            // Validar email/celular contra lo registrado (si el admin los cargó)
            if (d.celular && lic.celular && String(d.celular).trim() !== String(lic.celular).trim()) {
              setEstado("error");
              setError("El celular no coincide con el registrado. Contactá al administrador.");
              return;
            }
            // Marcar como usado + reservar el casillero de este tipo de aparato
            dispositivos[miTipo] = deviceId;
            const licUid = window.dbLicenciasReady ? await window.dbLicenciasReady : null;
            await window.dbLicencias.collection("licencias").doc(cod).update({
              estado: "usado",
              dispositivos,
              deviceId,
              // se mantiene por compatibilidad con pantallas que todavía lo lean
              email: email.trim(),
              negocio: negocio.trim(),
              aceptoTerminos: true,
              activadoEn: new Date().toISOString(),
              activadoPorUid: licUid
            });
          }
        } catch (e) {/* sin conexión: la activación local sigue, se reintenta luego */}
      }
      // Vínculo de seguridad: este negocio (cod) queda atado a la sesión
      // real de Firebase de este dispositivo — así nadie más, aunque
      // consiga el código de licencia, puede leer o escribir estos datos.
      if (cod && window.db && window.auth && window.auth.currentUser) {
        try {
          await window.db.collection("users").doc(cod).set({
            ownerAuthUid: window.auth.currentUser.uid
          }, {
            merge: true
          });
        } catch (e) {/* sin conexión: se reclama solo más tarde, al abrir la app */}
      }
      // Marcar como activado en localStorage
      const licActualizada = {
        ...lic,
        negocio: negocio.trim(),
        email: email.trim(),
        pin: pinAsignado,
        deviceId,
        activado: true,
        fechaActivacion: new Date().toISOString()
      };
      localStorage.setItem("sr_licencia", JSON.stringify(licActualizada));
      // ── Email de bienvenida con el PIN (vía proxy Apps Script) ──
      if (window.enviarEmailBrevoRM) {
        window.enviarEmailBrevoRM({
          to: email.trim(),
          toName: negocio.trim(),
          subject: "✅ Sistema de Reparto activado correctamente",
          htmlContent: `<div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:24px"><div style="background:#185FA5;border-radius:12px;padding:20px;text-align:center;margin-bottom:20px"><h2 style="color:#fff;margin:0">¡Bienvenido!</h2><p style="color:rgba(255,255,255,.8);margin:8px 0 0">${negocio.trim()}</p></div><p style="color:#333">Tu app <b>Sistema de Reparto</b> fue activada correctamente.</p><div style="background:#f0f7ff;border-radius:10px;padding:16px;text-align:center;margin:16px 0"><div style="font-size:13px;color:#666;margin-bottom:4px">Tu PIN de acceso</div><div style="font-size:32px;font-weight:800;color:#185FA5;letter-spacing:8px">${pinAsignado}</div><div style="font-size:12px;color:#999;margin-top:4px">Guardalo en un lugar seguro</div></div><p style="color:#555;font-size:13px">Lo vas a necesitar cada vez que abras la app.</p><p style="color:#999;font-size:12px;margin-top:20px">¿Ayuda? WhatsApp: <b>+54 9 381 339-9962</b></p><p style="color:#bbb;font-size:11px">Emma Soluciones Digitales</p></div>`
        }).catch(() => {}); // si el mail falla, la activación NO se interrumpe
      }
      setEstado("ok");
      setTimeout(() => onActivado(), 700);
    } catch (e) {
      setEstado("error");
      setError("Error al guardar. Intentá de nuevo.");
    }
  };
  const inp = {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    fontSize: 14,
    background: "rgba(255,255,255,0.05)",
    color: "var(--color-text-primary,#e2eaf4)",
    outline: "none",
    boxSizing: "border-box"
  };
  const lbl = {
    fontSize: 11,
    color: "var(--color-text-secondary,#7a9ab8)",
    display: "block",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: "0.06em"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--color-background-primary,#0f1923)",
      padding: 24,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: 360
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginBottom: 28
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "icono-192.png",
    alt: "",
    onError: e => e.target.remove(),
    style: {
      width: 64,
      height: 64,
      borderRadius: 16,
      marginBottom: 12
    }
  }), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 20,
      fontWeight: 700,
      color: "var(--color-text-primary,#e2eaf4)",
      margin: 0
    }
  }, "Activación de cuenta"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: "var(--color-text-secondary,#7a9ab8)",
      marginTop: 6,
      lineHeight: 1.5
    }
  }, "Completá tus datos para activar el sistema.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#5daaff",
      fontWeight: 500
    }
  }, "Código: ", lic.codigo || ""))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--color-background-secondary,#1a2b3c)",
      borderRadius: 16,
      padding: 24,
      border: "0.5px solid rgba(255,255,255,0.08)",
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Nombre de tu empresa *"), /*#__PURE__*/React.createElement("input", {
    style: inp,
    placeholder: "Ej: Distribuidora La Catalina",
    value: negocio,
    onChange: e => setNegocio(e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Email registrado *"), /*#__PURE__*/React.createElement("input", {
    style: inp,
    type: "email",
    placeholder: "tumail@ejemplo.com",
    value: email,
    onChange: e => setEmail(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--color-text-tertiary,#4a6a85)",
      marginTop: 4
    }
  }, "Debe coincidir con el email que registraste al contratar.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Tu PIN asignado"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...inp,
      letterSpacing: "0.3em",
      fontSize: 22,
      textAlign: "center",
      fontWeight: 700,
      color: "#5daaff",
      background: "rgba(24,95,165,0.12)",
      borderColor: "#185FA5"
    }
  }, pinAsignado || "—"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--color-text-tertiary,#4a6a85)",
      marginTop: 4
    }
  }, "Este PIN te lo asignó el administrador. Anotalo: lo vas a usar cada vez que abras la app.")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "rgba(255,255,255,0.03)",
      borderRadius: 10,
      padding: 12,
      border: "0.5px solid rgba(255,255,255,0.08)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--color-text-secondary,#7a9ab8)",
      marginBottom: 10,
      lineHeight: 1.6,
      maxHeight: 100,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: "var(--color-text-primary,#e2eaf4)"
    }
  }, "Términos y Condiciones de uso"), /*#__PURE__*/React.createElement("br", null), "Al activar esta cuenta aceptás que: (1) El sistema es de uso exclusivo para gestión de reparto. (2) Los datos ingresados son responsabilidad del usuario. (3) La suscripción es mensual y se renueva automáticamente. (4) Emma Soluciones Digitales no se responsabiliza por pérdida de datos por falta de conectividad. (5) El PIN es personal e intransferible."), /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: tyc,
    onChange: e => setTyc(e.target.checked),
    style: {
      width: 18,
      height: 18,
      cursor: "pointer",
      accentColor: "#185FA5",
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--color-text-primary,#e2eaf4)"
    }
  }, "Acepto los Términos y Condiciones"))), error && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "rgba(240,112,112,0.1)",
      border: "0.5px solid #f07070",
      borderRadius: 8,
      padding: "10px 12px",
      fontSize: 13,
      color: "#f07070"
    }
  }, "⚠️ ", error), /*#__PURE__*/React.createElement("button", {
    onClick: activar,
    disabled: estado === "verificando" || estado === "ok",
    style: {
      width: "100%",
      padding: "14px",
      borderRadius: 10,
      border: "none",
      background: estado === "ok" ? "#4dd9a0" : estado === "verificando" ? "#4a6a85" : "#185FA5",
      color: estado === "ok" ? "#0a2e1f" : "#fff",
      fontSize: 15,
      fontWeight: 600,
      cursor: estado === "verificando" ? "wait" : "pointer",
      opacity: estado === "verificando" ? 0.7 : 1,
      transition: "all 0.2s"
    }
  }, estado === "verificando" ? "Verificando..." : estado === "ok" ? "✓ ¡Cuenta activada!" : "Activar cuenta →")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 11,
      color: "var(--color-text-tertiary,#4a6a85)",
      textAlign: "center",
      marginTop: 16,
      lineHeight: 1.6
    }
  }, "Sistema de Reparto · Emma Soluciones Digitales")));
}

// ── Pantalla PIN (se muestra cada vez que se abre la app) ─────────
// ── Acceso biométrico (huella / Face ID) con WebAuthn ──────────────────────────
const SR_BIO_KEY = "sr_bio_cred";
function bioSoportado() {
  return !!(window.PublicKeyCredential && navigator.credentials && navigator.credentials.create);
}
function bioEnrolado() {
  try {
    return !!localStorage.getItem(SR_BIO_KEY);
  } catch {
    return false;
  }
}
function bioRechazado() {
  try {
    return localStorage.getItem("sr_bio_no") === "1";
  } catch {
    return false;
  }
}
function _srB64ToBuf(b64) {
  const s = atob(b64);
  const u = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
  return u.buffer;
}
function _srBufToB64(buf) {
  const u = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]);
  return btoa(s);
}
async function bioRegistrar() {
  if (!bioSoportado()) throw new Error("no_soportado");
  const cred = await navigator.credentials.create({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: {
        name: "Sistema de Reparto"
      },
      user: {
        id: crypto.getRandomValues(new Uint8Array(16)),
        name: "usuario",
        displayName: "Usuario"
      },
      pubKeyCredParams: [{
        type: "public-key",
        alg: -7
      }, {
        type: "public-key",
        alg: -257
      }],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required"
      },
      timeout: 60000,
      attestation: "none"
    }
  });
  if (!cred) throw new Error("cancelado");
  localStorage.setItem(SR_BIO_KEY, _srBufToB64(cred.rawId));
  localStorage.removeItem("sr_bio_no");
  return true;
}
async function bioVerificar() {
  if (!bioSoportado() || !bioEnrolado()) throw new Error("no_disponible");
  const r = await navigator.credentials.get({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      allowCredentials: [{
        type: "public-key",
        id: _srB64ToBuf(localStorage.getItem(SR_BIO_KEY))
      }],
      userVerification: "required",
      timeout: 60000
    }
  });
  return !!r;
}
function PantallaPINIndividual({
  onOk
}) {
  const [pin, setPin] = React.useState("");
  const [error, setError] = React.useState("");
  const [intentos, setIntentos] = React.useState(0);
  const [faseEnrolar, setFaseEnrolar] = React.useState(false);
  const [bioMsg, setBioMsg] = React.useState("");
  const puedeBio = bioSoportado();
  const bioOn = bioEnrolado();
  const pinGuardado = (() => {
    try {
      const p = JSON.parse(localStorage.getItem("sr_licencia") || "{}").pin;
      return p ? String(p) : "";
    } catch {
      return "";
    }
  })();
  const negocio = (() => {
    try {
      return JSON.parse(localStorage.getItem("sr_licencia") || "{}").negocio || "";
    } catch {
      return "";
    }
  })();
  const verificar = valor => {
    if (valor.length < 4) return;
    if (valor === pinGuardado) {
      setError("");
      if (puedeBio && !bioEnrolado() && !bioRechazado()) {
        setPin("");
        setFaseEnrolar(true);
      } else onOk();
    } else {
      const nuevosIntentos = intentos + 1;
      setIntentos(nuevosIntentos);
      setError(nuevosIntentos >= 3 ? "PIN incorrecto — ¿Lo olvidaste? Borrá los datos del browser." : "PIN incorrecto");
      setPin("");
      // Vibrar si está disponible
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
  };
  const presionar = d => {
    if (pin.length >= 4) return;
    const nuevo = pin + d;
    setPin(nuevo);
    setError("");
    if (nuevo.length === 4) verificar(nuevo);
  };
  const borrar = () => {
    setPin(p => p.slice(0, -1));
    setError("");
  };
  const entrarConHuella = async () => {
    setBioMsg("");
    try {
      if (await bioVerificar()) onOk();
    } catch (e) {
      setBioMsg("No se pudo leer la huella. Usá tu PIN.");
    }
  };
  const activarHuella = async () => {
    setBioMsg("");
    try {
      await bioRegistrar();
      onOk();
    } catch (e) {
      setBioMsg("No se pudo activar. Entrás con tu PIN.");
      setTimeout(onOk, 1200);
    }
  };
  const saltarHuella = () => {
    try {
      localStorage.setItem("sr_bio_no", "1");
    } catch (e) {}
    onOk();
  };
  const btnStyle = color => ({
    width: 72,
    height: 72,
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    fontSize: 24,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: color || "var(--color-background-secondary,#1a2b3c)",
    color: "var(--color-text-primary,#e2eaf4)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    transition: "transform 0.1s"
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--color-background-primary,#0f1923)",
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginBottom: 32
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "icono-192.png",
    alt: "Logo",
    style: {
      width: 64,
      height: 64,
      borderRadius: 16,
      marginBottom: 12
    },
    onError: e => {
      e.target.style.display = "none";
    }
  }), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 20,
      fontWeight: 700,
      color: "var(--color-text-primary,#e2eaf4)",
      margin: 0
    }
  }, negocio || "Sistema de Reparto"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: "var(--color-text-secondary,#7a9ab8)",
      marginTop: 4
    }
  }, "Ingresá tu PIN")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 16,
      marginBottom: 32
    }
  }, [0, 1, 2, 3].map(i => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      width: 16,
      height: 16,
      borderRadius: "50%",
      background: i < pin.length ? "#185FA5" : "rgba(255,255,255,0.15)",
      transition: "background 0.15s",
      boxShadow: i < pin.length ? "0 0 8px rgba(24,95,165,0.6)" : "none"
    }
  }))), error && /*#__PURE__*/React.createElement("p", {
    style: {
      color: "#f07070",
      fontSize: 13,
      marginBottom: 20,
      textAlign: "center"
    }
  }, error), bioMsg && /*#__PURE__*/React.createElement("p", {
    style: {
      color: "#f5b942",
      fontSize: 13,
      marginBottom: 16,
      textAlign: "center"
    }
  }, bioMsg), faseEnrolar ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 14,
      maxWidth: 280
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 46
    }
  }, "👆"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 16,
      color: "var(--color-text-primary,#e2eaf4)",
      textAlign: "center",
      margin: 0,
      fontWeight: 600
    }
  }, "¿Entrar con tu huella la próxima vez?"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: "var(--color-text-secondary,#7a9ab8)",
      textAlign: "center",
      margin: 0,
      lineHeight: 1.5
    }
  }, "Más rápido. Tu PIN sigue funcionando igual por si lo necesitás."), /*#__PURE__*/React.createElement("button", {
    style: {
      background: "#185FA5",
      color: "#fff",
      border: "none",
      borderRadius: 10,
      padding: "12px 20px",
      fontSize: 15,
      fontWeight: 600,
      cursor: "pointer",
      width: 210
    },
    onClick: activarHuella
  }, "Activar huella"), /*#__PURE__*/React.createElement("button", {
    style: {
      background: "none",
      border: "none",
      color: "var(--color-text-secondary,#7a9ab8)",
      fontSize: 13,
      cursor: "pointer"
    },
    onClick: saltarHuella
  }, "Ahora no")) :
  /*#__PURE__*/
  /* Teclado numérico */
  React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,72px)",
      gap: 12
    }
  }, [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => /*#__PURE__*/React.createElement("button", {
    key: n,
    style: btnStyle(),
    onClick: () => presionar(String(n))
  }, n)), /*#__PURE__*/React.createElement("div", null), " ", /*#__PURE__*/React.createElement("button", {
    style: btnStyle(),
    onClick: () => presionar("0")
  }, "0"), /*#__PURE__*/React.createElement("button", {
    style: {
      ...btnStyle("rgba(240,112,112,0.15)"),
      color: "#f07070"
    },
    onClick: borrar
  }, "⌫")), !faseEnrolar && bioOn && /*#__PURE__*/React.createElement("button", {
    style: {
      marginTop: 22,
      background: "var(--color-background-secondary,#1a2b3c)",
      border: "0.5px solid var(--color-border-secondary,rgba(255,255,255,0.13))",
      borderRadius: 10,
      padding: "11px 20px",
      fontSize: 14,
      fontWeight: 600,
      color: "var(--color-text-primary,#e2eaf4)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 8
    },
    onClick: entrarConHuella
  }, "👆 Entrar con huella"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 11,
      color: "var(--color-text-tertiary,#4a6a85)",
      marginTop: 24,
      textAlign: "center"
    }
  }, "Sistema de Reparto · Emma Soluciones Digitales"));
}
