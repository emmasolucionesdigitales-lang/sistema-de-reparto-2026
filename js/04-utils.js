// ════════════════════════════════════════════════════════════════════
// ◆  04-utils.js — funciones puras / helpers de datos (SIN JSX):
//    direccionCliente, KEY_PROD_ENV, prestadoClienteDe, debounceSave, useLS,
//    s (estilos), calcVenta, comprimirFoto, buscarCliente, helpers de merge
//    para sync en la nube, extraerCoordsDeURL.
//    Los componentes de UI compartidos (PieEnvases, FormCliente, HeaderApp,
//    CambioEnvasePanel, FotoClienteModal, etc.) están en 05-componentes.js.
// ════════════════════════════════════════════════════════════════════

// cloudSave and cloudLoad are defined in the <script> tag above via Firebase SDK

// ── Arma la dirección completa de un cliente, combinando TODOS los campos
//    que tenga cargados — sector, manzana, lote, casa/dpto, calle, número,
//    barrio. No todos los clientes usan los mismos campos — esta función
//    junta lo que haya, sin dejar afuera nada de lo cargado. Usarla en
//    TODOS lados en vez de armar la dirección a mano cada vez.
function direccionCliente(c) {
  if (!c) return "";
  const partes = [];
  if (c.calle) {
    partes.push(`${c.calle} ${c.nro || ""}`.trim());
  } else if (c.manzana || c.lote || c.sector) {
    let base = "";
    if (c.sector) base += `S${c.sector} `;
    if (c.manzana) base += `Mz ${c.manzana} `;
    if (c.lote) base += `L ${c.lote}`;
    if (base.trim()) partes.push(base.trim());
  }
  if (c.aclaracion) partes.push(c.aclaracion);
  if (c.barrio) partes.push(c.barrio);
  return partes.join(" · ");
}

const KEY_PROD_ENV = {
  "Sifón 1.5L": "sifon",
  "Bidón 10L": "bidon10",
  "Bidón 20L": "bidon20",
  "Dispenser": "dispenser"
};
// ── Cuánto tiene PRESTADO un cliente de un producto ("sifon"|"bidon10"|
//    "bidon20"|"dispenser"). Se lee directo de c.prestado (campo que se
//    mantiene solo, sumando/restando en cada venta — ver
//    aplicarMovimientoEnvases en 16-app.js). Si el cliente todavía no tiene
//    ese campo (no tuvo ventas con envases desde que se agregó este modelo),
//    se calcula del historial de ventas de ese cliente + el ajuste manual
//    (c.envAjuste) como referencia inicial. Usar SIEMPRE esta función en vez
//    de recalcular a mano — así todas las pantallas muestran el mismo número.
function prestadoClienteDe(c, k, ventasHistoricas) {
  if (c.prestado && c.prestado[k] !== undefined) return c.prestado[k];
  let n = 0;
  (ventasHistoricas || []).forEach(v => {
    if (v.clienteId !== c.id) return;
    (v.envPrest || []).forEach(e => {
      if (KEY_PROD_ENV[e.prod] === k) n += Number(e.cant) || 0;
    });
    (v.envDev || []).forEach(e => {
      if (KEY_PROD_ENV[e.prod] === k) n -= Number(e.cant) || 0;
    });
  });
  return Math.max(0, n + (Number(c.envAjuste?.[k]) || 0));
}

// Debounce save — espera 1.5s después del último cambio antes de guardar
// (_saveTimer/_saveQueue ya están declarados en 02-constantes.js, que carga
// antes; declararlos de nuevo acá duplica el identificador y rompe el load).
function debounceSave(fn) {
  _saveQueue = fn;
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => {
    const f = _saveQueue;
    _saveQueue = null;
    _saveTimer = null;
    if (f) f();
  }, 1200);
}
window.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden" && _saveQueue) {
    const f = _saveQueue;
    _saveQueue = null;
    if (_saveTimer) {
      clearTimeout(_saveTimer);
      _saveTimer = null;
    }
    f();
  }
});
function useLS(key, fallback) {
  const [val, setVal] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : fallback;
    } catch {
      return fallback;
    }
  });
  // Acepta un valor directo O una función (prev => nuevoValor).
  // La forma función es la segura: React siempre le pasa el estado MÁS
  // reciente, incluso si hay varias llamadas seguidas antes de re-renderizar
  // (evita perder cambios cuando dos acciones se disparan rápido).
  const save = v => {
    setVal(prev => {
      const next = typeof v === "function" ? v(prev) : v;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {}
      return next;
    });
  };
  return [val, save];
}
const s = {
  app: {
    maxWidth: 480,
    margin: "0 auto",
    background: "var(--color-background-primary)",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column"
  },
  header: {
    background: "var(--color-background-secondary)",
    borderBottom: "0.5px solid var(--color-border-tertiary)",
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    position: "sticky",
    top: 0,
    zIndex: 10
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 500,
    color: "var(--color-text-primary)",
    flex: 1
  },
  backBtn: {
    background: "var(--color-background-tertiary)",
    border: "none",
    cursor: "pointer",
    padding: "6px 12px",
    color: "var(--color-text-secondary)",
    fontSize: 13,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontWeight: 500
  },
  screen: {
    flex: 1,
    paddingBottom: 40
  },
  card: {
    background: "var(--color-background-secondary)",
    border: "0.5px solid var(--color-border-tertiary)",
    borderRadius: 12,
    padding: "10px 14px",
    margin: "6px 14px"
  },
  label: {
    fontSize: 11,
    color: "var(--color-text-secondary)",
    marginBottom: 3,
    display: "block"
  },
  input: {
    width: "100%",
    padding: "8px 10px",
    border: "0.5px solid var(--color-border-secondary)",
    borderRadius: 8,
    fontSize: 14,
    background: "var(--color-background-tertiary)",
    color: "var(--color-text-primary)",
    outline: "none",
    boxSizing: "border-box"
  },
  inputNum: {
    padding: "7px 8px",
    border: "0.5px solid var(--color-border-secondary)",
    borderRadius: 8,
    fontSize: 14,
    background: "var(--color-background-tertiary)",
    color: "var(--color-text-primary)",
    outline: "none",
    textAlign: "right",
    width: "100%",
    boxSizing: "border-box"
  },
  btn: {
    border: "0.5px solid var(--color-border-secondary)",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 12,
    cursor: "pointer",
    background: "var(--color-background-tertiary)",
    color: "var(--color-text-secondary)"
  },
  btnPrimary: {
    background: "#185FA5",
    color: "#e2eaf4",
    border: "none",
    borderRadius: 8,
    padding: "12px 20px",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    width: "100%"
  },
  btnDanger: {
    background: "var(--color-background-danger)",
    color: "var(--color-text-danger)",
    border: "0.5px solid var(--color-border-danger)",
    borderRadius: 8,
    padding: "5px 10px",
    fontSize: 12,
    cursor: "pointer"
  },
  row: {
    display: "flex",
    gap: 8,
    alignItems: "center"
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 6
  },
  metricCard: {
    background: "var(--color-background-tertiary)",
    borderRadius: 8,
    padding: "10px 12px"
  },
  metricLabel: {
    fontSize: 11,
    color: "var(--color-text-secondary)",
    marginBottom: 3
  },
  metricVal: {
    fontSize: 17,
    fontWeight: 500,
    color: "var(--color-text-primary)"
  },
  badge: c => ({
    fontSize: 10,
    fontWeight: 500,
    padding: "2px 7px",
    borderRadius: 6,
    background: `var(--color-background-${c})`,
    color: `var(--color-text-${c})`
  }),
  tag: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-secondary)",
    background: "var(--color-background-tertiary)",
    borderRadius: 8,
    padding: "3px 9px"
  },
  divider: {
    borderTop: "0.5px solid var(--color-border-tertiary)",
    margin: "10px 0"
  },
  sectionTitle: {
    fontSize: 10,
    color: "var(--color-text-tertiary)",
    padding: "12px 14px 4px",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    display: "block"
  },
  select: {
    width: "100%",
    padding: "8px 10px",
    border: "0.5px solid var(--color-border-secondary)",
    borderRadius: 8,
    fontSize: 14,
    background: "var(--color-background-tertiary)",
    color: "var(--color-text-primary)",
    outline: "none",
    boxSizing: "border-box"
  },
  tabBar: {
    display: "flex",
    borderBottom: "0.5px solid var(--color-border-tertiary)",
    padding: "0 14px",
    gap: 4,
    background: "var(--color-background-secondary)"
  },
  tab: a => ({
    padding: "9px 12px",
    fontSize: 13,
    cursor: "pointer",
    border: "none",
    background: "none",
    color: a ? "var(--color-text-primary)" : "var(--color-text-tertiary)",
    fontWeight: a ? 500 : 400,
    borderBottom: a ? "2px solid #5daaff" : "2px solid transparent"
  })
};
function calcVenta(detalle, pago, montoPagado, saldoAplicado, productos) {
  const bruto = detalle.reduce((a, d) => a + d.total, 0);
  const desc = 0; // retención solo en planilla, no afecta el monto de la venta
  const neto = bruto - desc;
  const aPagar = neto - (saldoAplicado || 0);
  const pagadoNum = pago === "fiado" ? 0 : montoPagado !== "" && !isNaN(Number(montoPagado)) ? Number(montoPagado) : aPagar;
  const saldoDelta = pagadoNum - neto;
  const costo = detalle.reduce((a, d) => {
    const p = productos.find(x => x.nombre === d.nombre);
    return a + (p ? p.costo * d.cantidad : 0);
  }, 0);
  return {
    bruto,
    desc,
    neto,
    aPagar,
    pagadoNum,
    saldoDelta,
    costo,
    ganancia: neto - costo
  };
}

// Comprime imagen a max 800px y calidad 0.75 antes de guardar
function comprimirFoto(file, maxW = 800, quality = 0.75) {
  return new Promise(resolve => {
    const r = new FileReader();
    r.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(1, maxW / img.width);
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = ev.target.result;
    };
    r.readAsDataURL(file);
  });
}
// ════════════════════════════════════════════════════════════════════
// ◆  buscarCliente — búsqueda UNIFICADA priorizando el DOMICILIO
//    2 = coincide el domicilio · 1 = nombre/tel/notas · 0 = no coincide
//    Ignora tildes/ñ tanto en lo buscado como en lo guardado: antes
//    buscar "maria" NO encontraba a "María" — muy común al tipear rápido
//    desde el celular, sin tildes.
// ════════════════════════════════════════════════════════════════════
function _normalizarBusqueda(s) {
  return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}
function buscarCliente(c, q) {
  const t = _normalizarBusqueda(q).trim();
  if (!t) return 1;
  const domicilio = _normalizarBusqueda([c.calle, c.nro, c.calle && c.nro ? `${c.calle} ${c.nro}` : "", c.barrio, c.sector, c.aclaracion, c.manzana, c.lote, c.manzana ? `mz ${c.manzana}` : "", c.lote ? `l ${c.lote}` : "", c.manzana && c.lote ? `mz ${c.manzana} l ${c.lote}` : "", c.manzana && c.lote ? `manzana ${c.manzana} lote ${c.lote}` : ""].filter(Boolean).join(" · "));
  if (domicilio.includes(t)) return 2;
  if (_normalizarBusqueda(c.nombre).includes(t)) return 1;
  if (String(c.telefono || "").includes(t)) return 1;
  if (_normalizarBusqueda(c.notas).includes(t)) return 1;
  return 0;
}
// ════════════════════════════════════════════════════════════════════
// ◆  Helpers de guardado seguro — evitan que un guardado pise cambios
//    que llegaron de otro dispositivo (PC/móvil) segundos antes.
//    Mismo patrón usado en Sistema de Reparto Multi.
// ════════════════════════════════════════════════════════════════════

// Arrays con "id" (ventas, recordatorios, noVisitas...): conserva altas,
// ediciones Y borrados hechos en ESTE guardado; para lo que no se tocó,
// respeta lo que ya estaba en la nube (por si otro dispositivo lo cambió).
// Antes esta versión, para un id presente en los dos lados, siempre se
// quedaba con "nuevoLocal" sin mirar cuál es más nuevo — si este
// dispositivo tenía una copia vieja de una venta (sin haberla vuelto a
// cargar) y guardaba por CUALQUIER otro motivo, esa copia vieja pisaba en
// silencio una edición más reciente hecha desde otro aparato. Ahora
// compara _upd igual que mergeClientesPorUpd, y gana el más nuevo.
function mergeArrayPorClave(prevLocal, nuevoLocal, cloudArr, claveFn) {
  const prevMap = {};
  (prevLocal || []).forEach(x => {
    try {
      prevMap[claveFn(x)] = x;
    } catch {}
  });
  const localMap = {};
  (nuevoLocal || []).forEach(x => {
    try {
      localMap[claveFn(x)] = x;
    } catch {}
  });
  const freshMap = {};
  (cloudArr || []).forEach(x => {
    try {
      freshMap[claveFn(x)] = x;
    } catch {}
  });
  const keys = new Set([...Object.keys(prevMap), ...Object.keys(localMap), ...Object.keys(freshMap)]);
  const out = [];
  keys.forEach(k => {
    const inLocal = Object.prototype.hasOwnProperty.call(localMap, k);
    const inFresh = Object.prototype.hasOwnProperty.call(freshMap, k);
    const inPrev = Object.prototype.hasOwnProperty.call(prevMap, k);
    if (inLocal && inFresh) {
      const uL = Number(localMap[k]._upd) || 0,
        uF = Number(freshMap[k]._upd) || 0;
      out.push(uF > uL ? freshMap[k] : localMap[k]);
    } else if (inLocal && !inFresh) {
      out.push(localMap[k]);
    } else if (!inLocal && inFresh) {
      if (!inPrev) out.push(freshMap[k]); // lo agregó otro dispositivo -> conservar
      // si estaba en prev y ya no en local -> se borró acá a propósito, no se restaura
    }
  });
  return out;
}

// Clientes: merge por id + _upd (gana el más nuevo, nunca se pisa un
// cambio ajeno más reciente con uno local viejo).
function mergeClientesPorUpd(prevLocal, nuevoLocal, cloudArr) {
  // Mismo criterio de borrado que mergeArrayPorClave: si un id estaba
  // ANTES de este guardado puntual (prevLocal) y ya no está en lo que se
  // está guardando ahora (nuevoLocal), es que se borró a propósito acá —
  // no revivirlo solo porque la nube todavía lo tenga.
  const prevIds = new Set((prevLocal || []).map(c => c.id));
  const nuevoIds = new Set((nuevoLocal || []).map(c => c.id));
  const borrados = new Set([...prevIds].filter(id => !nuevoIds.has(id)));
  const porId = {};
  (cloudArr || []).forEach(c => {
    if (!borrados.has(c.id)) porId[c.id] = c;
  });
  (nuevoLocal || []).forEach(c => {
    const enNube = porId[c.id];
    if (!enNube) {
      porId[c.id] = c;
      return;
    }
    const uL = Number(c._upd) || 0,
      uN = Number(enNube._upd) || 0;
    if (uL >= uN) porId[c.id] = c;
  });
  return Object.values(porId);
}

// Objetos numéricos simples (stock, cargasDia): aplica el DELTA que hizo
// este guardado sobre la copia local anterior, en vez de reemplazar todo
// el objeto — así una carga de stock hecha en otro dispositivo no se pierde.
function mergeNumericoConDeltas(prevLocal, nuevoLocal, cloudObj) {
  const flat = (obj, prefix = "") => {
    let out = {};
    Object.keys(obj || {}).forEach(k => {
      const v = obj[k];
      const key = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === "object" && !Array.isArray(v)) out = {
        ...out,
        ...flat(v, key)
      };else out[key] = v;
    });
    return out;
  };
  const unflat = flatObj => {
    const out = {};
    Object.keys(flatObj).forEach(key => {
      const parts = key.split(".");
      let cur = out;
      parts.forEach((p, i) => {
        if (i === parts.length - 1) cur[p] = flatObj[key];else {
          cur[p] = cur[p] || {};
          cur = cur[p];
        }
      });
    });
    return out;
  };
  const fPrev = flat(prevLocal || {}),
    fNuevo = flat(nuevoLocal || {}),
    fCloud = flat(cloudObj || {});
  const resultado = {
    ...fCloud
  };
  new Set([...Object.keys(fPrev), ...Object.keys(fNuevo)]).forEach(key => {
    const antes = Number(fPrev[key]) || 0,
      ahora = Number(fNuevo[key]) || 0;
    if (antes !== ahora) resultado[key] = (Number(fCloud[key]) || 0) + (ahora - antes);
  });
  return unflat(resultado);
}

// Objetos por clave (planillas por día): conserva las claves cambiadas en
// este guardado, respeta el resto tal cual está en la nube.
function mergePorClavesCambiadas(prevLocal, nuevoLocal, cloudObj) {
  const resultado = {
    ...(cloudObj || {})
  };
  const claves = new Set([...Object.keys(prevLocal || {}), ...Object.keys(nuevoLocal || {})]);
  claves.forEach(k => {
    const antes = JSON.stringify((prevLocal || {})[k]);
    const ahora = JSON.stringify((nuevoLocal || {})[k]);
    if (antes !== ahora) resultado[k] = (nuevoLocal || {})[k];
  });
  return resultado;
}
// ── Extrae coordenadas {lat,lng} de un link de Google Maps (varios formatos
//    posibles: @lat,lng · !3dlat!4dlng · ?q=/?ll=/?destination= · lat,lng
//    sueltos). Usar SIEMPRE esta función en vez de parsear el link a mano.
function extraerCoordsDeURL(url) {
  if (!url || typeof url !== "string") return null;
  let m;
  m = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (m) return {
    lat: +m[1],
    lng: +m[2]
  };
  m = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (m) return {
    lat: +m[1],
    lng: +m[2]
  };
  m = url.match(/[?&](?:q|ll|destination)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (m) return {
    lat: +m[1],
    lng: +m[2]
  };
  m = url.match(/(-?\d{1,2}\.\d{4,}),\s*(-?\d{1,3}\.\d{4,})/);
  if (m) return {
    lat: +m[1],
    lng: +m[2]
  };
  return null;
}

