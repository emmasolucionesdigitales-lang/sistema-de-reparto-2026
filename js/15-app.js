// ════════════════════════════════════════════════════════════════════
// ◆  usarInformes — Envío de resúmenes por email
// ════════════════════════════════════════════════════════════════════
function usarInformes({ventas, clientes, planillas, noVisitas, productos}) {
  const getLic = () => { try{ return JSON.parse(localStorage.getItem("sr_licencia")||"{}"); }catch{ return {}; } };
  const fmtP = (n) => "$" + Math.round(Number(n)||0).toLocaleString("es-AR");
  const enviarDiario = async (fecha, dia) => {
    const lic = getLic();
    // Diagnóstico claro de por qué falla
    if(!window.enviarEmailBrevoRM) {
      alert("⚠️ Función de email no disponible. Actualizá el archivo index.html.");
      return false;
    }
    // Buscar email: primero en config, luego en la licencia (activación)
    const emailConfig = (()=>{ try{ return localStorage.getItem("lc_email_informes")||""; }catch{ return ""; } })();
    const emailLic = lic.email || "";
    const emailFinal = emailConfig || emailLic;
    if(!emailFinal) {
      alert("⚠️ No hay email configurado.\n\nAndá a Config → tab Datos → Email para informes → guardá tu email.");
      return false;
    }
    // Usar el email encontrado
    Object.assign(lic, {email: emailFinal});
    console.log("📧 Enviando informe a:", lic.email);
    try {
      const ventasDia=(ventas||[]).filter(v=>v.fechaKey===fecha&&v.dia===dia&&!v._esCobro&&!v._esAjuste);
      const ef=ventasDia.filter(v=>v.pago==="contado").reduce((a,v)=>a+(v.pagadoNum||v.neto||0),0);
      const tr=ventasDia.filter(v=>v.pago==="transferencia").reduce((a,v)=>a+(v.pagadoNum||v.neto||0),0);
      const fi=ventasDia.filter(v=>v.pago==="fiado").reduce((a,v)=>a+(v.neto||0),0);
      const ret=Math.round(tr*0.025); const trN=tr-ret;
      const cS=(productos||[]).find(p=>p.nombre==="Sifón 1.5L")?.costo||133.33;
      const cB10=(productos||[]).find(p=>p.nombre==="Bidón 10L")?.costo||800;
      const cB20=(productos||[]).find(p=>p.nombre==="Bidón 20L")?.costo||1100;
      let costo=0; ventasDia.forEach(v=>(v.detalle||[]).forEach(d=>{if(d.nombre==="Sifón 1.5L")costo+=(d.cantidad||0)*cS;if(d.nombre==="Bidón 10L")costo+=(d.cantidad||0)*cB10;if(d.nombre==="Bidón 20L")costo+=(d.cantidad||0)*cB20;}));
      const plan=(planillas||{})[`${dia}_${fecha}`]||{};
      const gastos=(plan.gastos||[]).filter(g=>g.confirmado&&g.monto);
      const tg=gastos.reduce((a,g)=>a+Math.round(Number(g.monto)||0),0);
      const mano=ef-costo-tg; const gan=(ef+trN)-costo-tg;
      const neg=lic.negocio||lic.nombre||"Sistema de Reparto";
      const fila=(l,v,col="")=>`<tr><td style="padding:7px 0;color:#555;border-bottom:1px solid #eee">${l}</td><td style="text-align:right;font-weight:600;border-bottom:1px solid #eee;color:${col||"#222"}">${v}</td></tr>`;
      const sep=(t)=>`<tr><td colspan="2" style="padding:10px 0 4px;font-size:11px;font-weight:700;color:#999;text-transform:uppercase">${t}</td></tr>`;
      const html=`<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#f9fafb"><div style="background:#185FA5;border-radius:12px 12px 0 0;padding:20px 24px"><h2 style="color:#fff;margin:0;font-size:18px">📋 Cierre del día · ${dia} ${fecha}</h2><p style="color:#c8dcf0;margin:4px 0 0;font-size:13px">${neg}</p></div><div style="background:#fff;border-radius:0 0 12px 12px;padding:20px 24px"><div style="background:#f0f7ff;border-radius:10px;padding:16px;margin-bottom:20px;text-align:center"><div style="font-size:32px;font-weight:800;color:#185FA5">${fmtP(ef+tr+fi)}</div><div style="color:#666;font-size:13px">${ventasDia.length} entregas</div></div><table style="width:100%;border-collapse:collapse;font-size:14px">${sep("💵 Cobranza")}${fila("Efectivo",fmtP(ef))}${fila("Transferencias (neto)",fmtP(trN),"#185FA5")}${fi>0?fila("Fiado",fmtP(fi),"#f5a623"):""}${sep("📦 Costos")}${fila("Llenado","−"+fmtP(costo),"#e05c5c")}${gastos.length>0?sep("💸 Gastos extras"):""}${gastos.map(g=>fila(g.cat+(g.desc?` · ${g.desc}`:""),"−"+fmtP(g.monto),"#e05c5c")).join("")}${sep("💰 Resultado")}${fila("<b>Plata en mano</b>","<b>"+fmtP(mano)+"</b>",mano>=0?"#0a7c3e":"#e05c5c")}${fila("<b>Ganancia neta</b>","<b>"+fmtP(gan)+"</b>",gan>=0?"#0a7c3e":"#e05c5c")}</table></div><p style="color:#aaa;font-size:11px;text-align:center;margin-top:16px">Sistema de Reparto · Emma Soluciones Digitales</p></div>`;
      await window.enviarEmailBrevoRM({to:lic.email,toName:neg,subject:`📋 Cierre ${dia} ${fecha} · ${fmtP(ef+tr+fi)} · Mano ${fmtP(mano)}`,htmlContent:html});
      return true;
    } catch(e){ console.error("enviarDiario:",e); alert("❌ Error Brevo: " + (e.message||e)); return false; }
  };
  const enviarSemanal = async (fecha) => {
    const lic=getLic(); if(!lic.email||!window.enviarEmailBrevoRM) return false;
    try{const d=new Date(fecha+"T12:00:00");const lp=new Date(d);lp.setDate(d.getDate()-6);const desde=lp.toISOString().slice(0,10);const vs=(ventas||[]).filter(v=>v.fechaKey>=desde&&v.fechaKey<=fecha&&!v._esCobro&&!v._esAjuste);const t=vs.reduce((a,v)=>a+(v.neto||0),0);await window.enviarEmailBrevoRM({to:lic.email,toName:lic.negocio||"",subject:`📊 Semana ${desde}→${fecha} · ${fmtP(t)}`,htmlContent:`<div style="font-family:sans-serif;padding:20px"><h2 style="color:#7b3fc9">📊 Resumen semanal</h2><p>${desde} al ${fecha}</p><div style="font-size:28px;font-weight:700;color:#7b3fc9">${fmtP(t)}</div><p>${vs.length} entregas</p></div>`});return true;}catch(e){return false;}
  };
  const enviarMensual = async (mes, anio) => {
    const lic=getLic(); if(!lic.email||!window.enviarEmailBrevoRM) return false;
    try{const p=`${anio}-${String(mes).padStart(2,"0")}`;const vs=(ventas||[]).filter(v=>(v.fechaKey||"").startsWith(p)&&!v._esCobro&&!v._esAjuste);const t=vs.reduce((a,v)=>a+(v.neto||0),0);const mn=["","Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];await window.enviarEmailBrevoRM({to:lic.email,toName:lic.negocio||"",subject:`📅 ${mn[mes]} ${anio} · ${fmtP(t)}`,htmlContent:`<div style="font-family:sans-serif;padding:20px"><h2 style="color:#1a7a5e">📅 ${mn[mes]} ${anio}</h2><div style="font-size:28px;font-weight:700;color:#1a7a5e">${fmtP(t)}</div><p>${vs.length} entregas</p></div>`});return true;}catch(e){return false;}
  };
  return { enviarDiario, enviarSemanal, enviarMensual };
}

// ════════════════════════════════════════════════════════════════════
// ◆  15-app.js — Componente App principal
// ════════════════════════════════════════════════════════════════════

function App() {
  // ── negocioId desde licencia (con fallback a device ID permanente) ──
  const negocioId = React.useMemo(()=>{
    try {
      const lic = JSON.parse(localStorage.getItem("sr_licencia")||"{}");
      const cod = lic.codigo || localStorage.getItem("sm_codigo") || "";
      if(cod) { window._negocioId = cod; return cod; }
      // Sin código: usar device ID permanente (individual app)
      let devId = localStorage.getItem("sr_device_id");
      if(!devId) {
        devId = "ind_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2,7);
        localStorage.setItem("sr_device_id", devId);
      }
      window._negocioId = devId;
      return devId;
    } catch { return "ind_fallback"; }
  }, []);

  // ── PIN: se pide cada vez que se abre la app ────────────────────
  const [pinOk, setPinOk] = useState(false);
  const [cargandoNube, setCargandoNube] = useState(true);

  const [pantalla, setPantalla]   = useState(()=>{
    const h = window.location.hash.slice(1)||"portada";
    const needsDia = ["diaPrincipal","selectorFechaClientes","selectorFechaPlanilla","inicioReparto","clientes","detalleCliente","venta","planilla"]; // historial does NOT need dia
    const savedDia = (() => { try { return JSON.parse(localStorage.getItem("cat_dia_actual")||'""'); } catch{ return ""; } })();
    if(needsDia.includes(h) && !savedDia) return "portada";
    return h;
  });
  const [diaActual, setDiaActual]   = useLS("cat_dia_actual", "");
  // Reset diaActual when it's invalid
  React.useEffect(()=>{
    if(diaActual && !DIAS.includes(diaActual)) setDiaActual("");
  },[]);
  const [fechaActual, setFechaActual] = useLS("cat_fecha_actual", ""); // ISO date key YYYY-MM-DD
  const [fechaObj, setFechaObj]   = useState(null);
  const [clienteId, setClienteId] = useState(null);
  const [prospectoId, setProspectoId] = useState(null);
  const [initCierre, setInitCierre] = useState(false);
  const [noVisitas, setNoVisitas] = useLS("cat_novisitas_v1", []);
  const [prospectos, setProspectos] = useLS("cat_prospectos_v1", []);
  const [recordatorios, setRecordatorios] = useLS("cat_recordatorios_v1", []);
  // recordatorio: {id, clienteId, clienteNombre, fecha, hora, motivo, dia, confirmado}
  const saveRecordatorios = (r) => { setRecordatorios(r); syncData({recordatorios:r}); };
  const recordatoriosActivos = (recordatorios||[]).filter(r=>!r.confirmado); // [{clienteId,dia,fecha,motivo}]
  const [clientes, setClientes]   = useLS("cat_clientes_v3", CLIENTES_INICIALES);
  const [ventasRaw, setVentasRaw] = useLS("cat_ventas_v3", []);
  const normalizarFechaKey = (v) => {
    if(v.fechaKey) return v;
    const fk = v.fecha ? (()=>{
      const parts = v.fecha.split('/');
      if(parts.length>=3){
        const d=parts[0].trim(),m=parts[1].trim(),y=parts[2].split(',')[0].trim();
        if(y.length===4) return y+'-'+m.padStart(2,'0')+'-'+d.padStart(2,'0');
      }
      return '';
    })() : '';
    return {...v, fechaKey:fk};
  };
  const ventas = React.useMemo(()=>(ventasRaw||[]).map(normalizarFechaKey),[ventasRaw]);
  const setVentas = (arg) => setVentasRaw(typeof arg==='function' ? prev=>arg(prev) : arg);
  const [productos, setProductos] = useLS("cat_productos_v3", PRODUCTOS_INICIALES);
  const normStock = (s) => {
    const empty = {sifon:0,bidon10:0,bidon20:0};
    const base = {soderia:{...empty},soderia_vacios:{...empty},casa:{...empty},camion:{...empty}};
    if(!s||typeof s!=="object") return base;
    if(s.soderia&&typeof s.soderia==="object") {
      return {
        soderia:        {sifon:s.soderia?.sifon||0,bidon10:s.soderia?.bidon10||0,bidon20:s.soderia?.bidon20||0},
        soderia_vacios: {sifon:s.soderia_vacios?.sifon||0,bidon10:s.soderia_vacios?.bidon10||0,bidon20:s.soderia_vacios?.bidon20||0},
        casa:           {sifon:s.casa?.sifon||0,bidon10:s.casa?.bidon10||0,bidon20:s.casa?.bidon20||0},
        camion:         {sifon:s.camion?.sifon||0,bidon10:s.camion?.bidon10||0,bidon20:s.camion?.bidon20||0},
      };
    }
    // old format
    return {soderia:{sifon:s.sifon||0,bidon10:s.bidon10||0,bidon20:s.bidon20||0},soderia_vacios:{...empty},casa:{...empty},camion:{...empty}};
  };
  const [stockRaw, setStockRaw] = useLS("cat_stock_v4", {soderia:{sifon:0,bidon10:0,bidon20:0},casa:{sifon:0,bidon10:0,bidon20:0},camion:{sifon:0,bidon10:0,bidon20:0}});
  const stockNorm = React.useMemo(()=>normStock(stockRaw), [JSON.stringify(stockRaw)]);
  const setStock = (sOrFn) => {
    if(typeof sOrFn === "function") {
      setStockRaw(prev => normStock(sOrFn(normStock(prev))));
    } else {
      setStockRaw(normStock(sOrFn));
    }
  };
  // Auto-migrate old stock format on first load
  React.useEffect(()=>{
    // Force normalize stock on every mount
    const normalized = normStock(stockRaw);
    if(JSON.stringify(normalized) !== JSON.stringify(stockRaw)) setStockRaw(normalized);
  },[]);
  // Helper: transferir del camión a sodería al cerrar el día
  const cerrarCamion = (sobrLlenos, vacios) => {
    setStock(prev=>{
      const s = JSON.parse(JSON.stringify(normStock(prev)));
      ["sifon","bidon10","bidon20"].forEach(k=>{
        s.soderia[k] = (s.soderia[k]||0) + (sobrLlenos[k]||0) + (vacios[k]||0);
        s.camion[k]  = Math.max(0, (s.camion[k]||0) - (sobrLlenos[k]||0) - (vacios[k]||0));
      });
      syncData({stock:s});
      return s;
    });
  };
  const [planillas, setPlanillas] = useLS("cat_planillas_v1", {});
  // Firebase — credentials embedded in SDK config above
  const [apiKey, setApiKey] = useLS("cat_apikey", "");
  const [binId,  setBinId]  = useLS("cat_binid",  "");
  const [syncStatus, setSyncStatus] = useState("idle");
  const [ecToken, setEcToken] = useState(()=>localStorage.getItem('lc_ec_token')||'');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingOfflineSync, setPendingOfflineSync] = useState(
    ()=>!!localStorage.getItem("sr_offline_pending")
  );
  const [cloudSetup, setCloudSetup] = useState(false);
  const [darkMode, setDarkMode]   = useLS("cat_darkmode", false);
  
  const [modalResumenDia, setModalResumenDia] = useState(null);
  const [tabConfig, setTabConfig] = useState("stock");
  const [zonasReparto, setZonasReparto] = useLS("cat_zonas_v1", {});
  const [scaleIdx, setScaleIdx]   = useLS("cat_scale_v1", 1); // 0=S 1=M 2=L 3=XL
  const SCALES = [0.82, 1.0, 1.18, 1.36];
  const SCALE_LABELS = ["S","M","L","XL"];

  // Apply dark/light mode toggle over base dark theme
  React.useEffect(()=>{
    if(!darkMode){
      document.body.style.background = "#f0f4f8";
      document.documentElement.style.setProperty("--color-background-primary","#ffffff");
      document.documentElement.style.setProperty("--color-background-secondary","#f4f4f5");
      document.documentElement.style.setProperty("--color-background-tertiary","#e8ecf0");
      document.documentElement.style.setProperty("--color-text-primary","#18181b");
      document.documentElement.style.setProperty("--color-text-secondary","#71717a");
      document.documentElement.style.setProperty("--color-text-tertiary","#a1a1aa");
      document.documentElement.style.setProperty("--color-text-info","#1d4ed8");
      document.documentElement.style.setProperty("--color-text-success","#15803d");
      document.documentElement.style.setProperty("--color-text-warning","#a16207");
      document.documentElement.style.setProperty("--color-text-danger","#b91c1c");
      document.documentElement.style.setProperty("--color-background-info","#dbeafe");
      document.documentElement.style.setProperty("--color-background-success","#dcfce7");
      document.documentElement.style.setProperty("--color-background-warning","#fef9c3");
      document.documentElement.style.setProperty("--color-background-danger","#fee2e2");
      document.documentElement.style.setProperty("--color-border-tertiary","rgba(0,0,0,0.10)");
      document.documentElement.style.setProperty("--color-border-secondary","rgba(0,0,0,0.18)");
    } else {
      document.body.style.background = "#080f17";
      document.documentElement.style.setProperty("--color-background-primary","#0f1923");
      document.documentElement.style.setProperty("--color-background-secondary","#1a2b3c");
      document.documentElement.style.setProperty("--color-background-tertiary","#253647");
      document.documentElement.style.setProperty("--color-text-primary","#e2eaf4");
      document.documentElement.style.setProperty("--color-text-secondary","#7a9ab8");
      document.documentElement.style.setProperty("--color-text-tertiary","#4a6a85");
      document.documentElement.style.setProperty("--color-text-info","#5daaff");
      document.documentElement.style.setProperty("--color-text-success","#4dd9a0");
      document.documentElement.style.setProperty("--color-text-warning","#f5b942");
      document.documentElement.style.setProperty("--color-text-danger","#f07070");
      document.documentElement.style.setProperty("--color-background-info","#1e3a5f");
      document.documentElement.style.setProperty("--color-background-success","#0a2e1f");
      document.documentElement.style.setProperty("--color-background-warning","#2e1f06");
      document.documentElement.style.setProperty("--color-background-danger","#2e0a0a");
      document.documentElement.style.setProperty("--color-border-tertiary","rgba(255,255,255,0.07)");
      document.documentElement.style.setProperty("--color-border-secondary","rgba(255,255,255,0.13)");
    }
  },[darkMode]);

  // Al iniciar, si hay credenciales guardadas, cargar datos de la nube
  const { useEffect } = React;
  useEffect(() => {
    if (!apiKey || !binId) { setCargandoNube(false); return; }
    setSyncStatus("loading");
    cloudLoad(negocioId).then(function(data) {
      if(!data) { setSyncStatus("idle"); setCargandoNube(false); return; }
      if (data.clientes?.length)   { setClientes(data.clientes);    try{localStorage.setItem("cat_clientes_v3",JSON.stringify(data.clientes));}catch{} }
      if (data.ventas?.length)     { setVentasRaw(data.ventas);     try{localStorage.setItem("cat_ventas_v3",JSON.stringify(data.ventas));}catch{} }
      if (data.planillas)          { setPlanillas(data.planillas);  try{localStorage.setItem("cat_planillas_v1",JSON.stringify(data.planillas));}catch{} }
      if (data.stock) {
        const ds = data.stock;
        const normStock = ds.soderia ? ds : {
          soderia:{sifon:ds.sifon||0,bidon10:ds.bidon10||0,bidon20:ds.bidon20||0},
          casa:   {sifon:0,bidon10:0,bidon20:0},
          camion: {sifon:0,bidon10:0,bidon20:0},
        };
        setStock(normStock);
        try { localStorage.setItem("cat_stock_v4", JSON.stringify(normStock)); } catch {}
      }
      if (data.productos?.length)     { setProductos(data.productos);    try{localStorage.setItem("cat_productos_v3",JSON.stringify(data.productos));}catch{} }
      if (data.noVisitas?.length)     { setNoVisitas(data.noVisitas);    try{localStorage.setItem("cat_novisitas_v1",JSON.stringify(data.noVisitas));}catch{} }
      if (data.prospectos?.length)    { setProspectos(data.prospectos);  try{localStorage.setItem("cat_prospectos_v1",JSON.stringify(data.prospectos));}catch{} }
      if (data.recordatorios?.length) { setRecordatorios(data.recordatorios); try{localStorage.setItem("cat_recordatorios_v1",JSON.stringify(data.recordatorios));}catch{} }
      if (data.mantVeh?.length)    localStorage.setItem("cat_mant_vehiculo_v1", JSON.stringify(data.mantVeh));
      if (data.histPrecios?.length) localStorage.setItem("lc_hist_precios", JSON.stringify(data.histPrecios));
      if (data.zonasReparto && Object.keys(data.zonasReparto).length) setZonasReparto(data.zonasReparto);
      setSyncStatus("saved");
      setTimeout(()=>setSyncStatus("idle"), 2000);
      setCargandoNube(false);
    }).catch(()=>{ setSyncStatus("idle"); setCargandoNube(false); });
  }, []);

  // Ref siempre actualizado — evita datos viejos en el debounce
  const estadoRef = React.useRef({clientes,ventas,planillas,stock:stockNorm,productos,noVisitas,recordatorios,prospectos});
  React.useEffect(()=>{ estadoRef.current={clientes,ventas,planillas,stock:stockNorm,productos,noVisitas,recordatorios,prospectos,zonasReparto}; });

  // Hooks globales: respaldo COMPLETO descargable + restaurar
  React.useEffect(()=>{
    window._descargarRespaldo = () => {
      const mantVeh = (()=>{ try { return JSON.parse(localStorage.getItem("cat_mant_vehiculo_v1")||"[]"); } catch { return []; } })();
      const histPrecios = (()=>{ try { return JSON.parse(localStorage.getItem("lc_hist_precios")||"[]"); } catch { return []; } })();
      const data = { ...estadoRef.current, mantVeh, histPrecios,
        _respaldo:true, _app:"sistema-de-reparto", _fecha:new Date().toISOString() };
      const blob = new Blob([JSON.stringify(data,null,2)], {type:"application/json"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const f = new Date().toLocaleDateString("es-AR").replace(/\//g,"-");
      a.href = url; a.download = `respaldo-completo_reparto_${f}.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(()=>URL.revokeObjectURL(url), 1000);
    };
    window._restaurarRespaldo = (data) => {
      if(!data || typeof data!=="object") { alert("El archivo no es un respaldo válido."); return false; }
      try {
        if(data.clientes!==undefined){ setClientes(data.clientes||[]); try{localStorage.setItem("cat_clientes_v3",JSON.stringify(data.clientes||[]));}catch{} }
        if(data.ventas!==undefined){ setVentasRaw(data.ventas||[]); try{localStorage.setItem("cat_ventas_v3",JSON.stringify(data.ventas||[]));}catch{} }
        if(data.planillas!==undefined){ setPlanillas(data.planillas||{}); try{localStorage.setItem("cat_planillas_v1",JSON.stringify(data.planillas||{}));}catch{} }
        if(data.stock){
          const ds=data.stock;
          const ns = ds.soderia ? ds : {soderia:{sifon:ds.sifon||0,bidon10:ds.bidon10||0,bidon20:ds.bidon20||0},casa:{sifon:0,bidon10:0,bidon20:0},camion:{sifon:0,bidon10:0,bidon20:0}};
          setStock(ns); try{localStorage.setItem("cat_stock_v4",JSON.stringify(ns));}catch{}
        }
        if(data.productos!==undefined){ setProductos(data.productos||[]); try{localStorage.setItem("cat_productos_v3",JSON.stringify(data.productos||[]));}catch{} }
        if(data.noVisitas!==undefined){ setNoVisitas(data.noVisitas||[]); try{localStorage.setItem("cat_novisitas_v1",JSON.stringify(data.noVisitas||[]));}catch{} }
        if(data.prospectos!==undefined){ setProspectos(data.prospectos||[]); try{localStorage.setItem("cat_prospectos_v1",JSON.stringify(data.prospectos||[]));}catch{} }
        if(data.recordatorios!==undefined){ setRecordatorios(data.recordatorios||[]); try{localStorage.setItem("cat_recordatorios_v1",JSON.stringify(data.recordatorios||[]));}catch{} }
        if(data.mantVeh!==undefined) localStorage.setItem("cat_mant_vehiculo_v1", JSON.stringify(data.mantVeh||[]));
        if(data.histPrecios!==undefined) localStorage.setItem("lc_hist_precios", JSON.stringify(data.histPrecios||[]));
        if(data.zonasReparto!==undefined) setZonasReparto(data.zonasReparto||{});
        try { cloudSave({ ...estadoRef.current, ...data }, window._negocioId); } catch {}
        return true;
      } catch(e){ alert("Error al restaurar: "+e.message); return false; }
    };
    return ()=>{ delete window._descargarRespaldo; delete window._restaurarRespaldo; };
  }, []);

  // Auto backup DIARIO a localStorage
  React.useEffect(()=>{
    const ultimoBackup = localStorage.getItem("lc_ultimo_backup");
    const hoy = new Date().toISOString().slice(0,10);
    if(ultimoBackup===hoy) return; // ya se hizo hoy
    try {
      localStorage.setItem("lc_backup_"+hoy, JSON.stringify({clientes,ventas,planillas}));
      localStorage.setItem("lc_ultimo_backup", hoy);
      // Mantener solo el último backup (el de ayer)
      const keys = Object.keys(localStorage).filter(k=>k.startsWith("lc_backup_")).sort().reverse();
      keys.slice(1).forEach(k=>localStorage.removeItem(k));
      console.log("Auto-backup diario guardado:", hoy);
    } catch(e){ console.warn("Auto-backup falló:", e); }
  },[]);

  const syncData = (overrides={}) => {
    if(!window.db) return;
    setSyncStatus("saving");
    const mantVehActual = (() => { try { return JSON.parse(localStorage.getItem("cat_mant_vehiculo_v1")||"[]"); } catch { return []; } })();
    const histPreciosActual = (() => { try { return JSON.parse(localStorage.getItem("lc_hist_precios")||"[]"); } catch { return []; } })();
    const data = { ...estadoRef.current, ...overrides, noVisitas: estadoRef.current.noVisitas||[], prospectos: overrides.prospectos!==undefined ? overrides.prospectos : (estadoRef.current.prospectos||[]), recordatorios: estadoRef.current.recordatorios||[], mantVeh: overrides.mantVeh||mantVehActual, histPrecios: overrides.histPrecios||histPreciosActual, zonasReparto: overrides.zonasReparto||estadoRef.current.zonasReparto||{} };
    estadoRef.current = data;
    debounceSave(() => {
      if(!navigator.onLine) {
        try { localStorage.setItem("sr_offline_pending", JSON.stringify(data)); } catch {}
        setPendingOfflineSync(true);
        setSyncStatus("offline_pending");
        return;
      }
      cloudSave(data, negocioId).then(function(ok){
        if(ok){
          localStorage.removeItem("sr_offline_pending");
          setPendingOfflineSync(false);
          setSyncStatus("saved");
        } else {
          try { localStorage.setItem("sr_offline_pending", JSON.stringify(data)); } catch {}
          setPendingOfflineSync(true);
          setSyncStatus("offline_pending");
        }
      }).catch(function(){
        try { localStorage.setItem("sr_offline_pending", JSON.stringify(data)); } catch {}
        setPendingOfflineSync(true);
        setSyncStatus("offline_pending");
      });
    });
  };

  // ── MODO OFFLINE ──────────────────────────────────────────────────
  React.useEffect(()=>{
    const goOnline = () => {
      setIsOnline(true);
      const pending = localStorage.getItem("sr_offline_pending");
      if(pending) {
        setSyncStatus("saving");
        try {
          const data = JSON.parse(pending);
          cloudSave(data, negocioId).then(ok=>{
            if(ok){ localStorage.removeItem("sr_offline_pending"); setPendingOfflineSync(false); setSyncStatus("saved"); setTimeout(()=>setSyncStatus("idle"),2500); }
            else { setSyncStatus("error"); setTimeout(()=>setSyncStatus("offline_pending"),3000); }
          }).catch(()=>{ setSyncStatus("error"); setTimeout(()=>setSyncStatus("offline_pending"),3000); });
        } catch { localStorage.removeItem("sr_offline_pending"); setPendingOfflineSync(false); }
      }
    };
    const goOffline = () => { setIsOnline(false); setSyncStatus("offline"); };
    window.addEventListener("online",  goOnline);
    window.addEventListener("offline", goOffline);
    return ()=>{ window.removeEventListener("online",goOnline); window.removeEventListener("offline",goOffline); };
  },[]);

  // ── NOTIFICACIONES ────────────────────────────────────────────────
  React.useEffect(()=>{
    if(!("Notification" in window)) return;
    const pedirPermiso = async () => { if(Notification.permission==="default") await Notification.requestPermission(); };
    pedirPermiso();
    const programar18hs = () => {
      const ahora = new Date();
      const hoy18 = new Date(ahora.getFullYear(),ahora.getMonth(),ahora.getDate(),18,0,0);
      let ms = hoy18 - ahora; if(ms<0) ms += 24*60*60*1000;
      return setTimeout(()=>{
        if(Notification.permission==="granted"){
          const hoyKey = new Date().toISOString().slice(0,10);
          if(!localStorage.getItem(`notif_cierre_${hoyKey}`)){
            new Notification("🚚 Sistema de Reparto",{body:"Son las 18:00 — ¿Ya cerraste el día?",icon:"/icon-192.png",tag:"cierre-dia"});
            localStorage.setItem(`notif_cierre_${hoyKey}`,"1");
          }
        }
        programar18hs();
      }, ms);
    };
    const t18 = programar18hs();
    const chequearMantenimiento = () => {
      if(Notification.permission!=="granted") return;
      const mantList = (()=>{ try{ return JSON.parse(localStorage.getItem("cat_mant_vehiculo_v1")||"[]"); }catch{ return []; } })();
      const hoy = new Date(); hoy.setHours(0,0,0,0);
      mantList.forEach(m=>{
        if(!m.proximaFechaISO) return;
        const proxFecha = new Date(m.proximaFechaISO+"T12:00:00"); proxFecha.setHours(0,0,0,0);
        const diffDias = Math.round((proxFecha-hoy)/(1000*60*60*24));
        if(diffDias===3||diffDias===2||diffDias===1){
          const nk = `notif_mant_${m.proximaFechaISO}_${m.tipo}`;
          const hoyKey = new Date().toISOString().slice(0,10);
          if(!localStorage.getItem(`${nk}_${hoyKey}`)){
            const tipoLabel={aceite:"Cambio de aceite",preventivo:"Mantenimiento preventivo",embrague:"Cambio de embrague",reparacion:"Reparación",otro:"Mantenimiento"}[m.tipo]||m.tipo;
            new Notification("🔧 Vencimiento de mantenimiento",{body:`${tipoLabel} vence en ${diffDias} día${diffDias>1?"s":""}${m.descripcion?" — "+m.descripcion:""}`,icon:"/icon-192.png",tag:nk});
            localStorage.setItem(`${nk}_${hoyKey}`,"1");
          }
        }
      });
    };
    chequearMantenimiento();
    const tMant = setInterval(chequearMantenimiento, 60*60*1000);
    return ()=>{ clearTimeout(t18); clearInterval(tMant); };
  },[]);

  const saveClientes = (v) => { setClientes(v); syncData({clientes:v}); };
  const saveVentas   = (v) => { setVentasRaw(v);   syncData({ventas:v}); };
  const savePlanillasCloud = (v) => { setPlanillas(v); syncData({planillas:v}); };

  // ── INFORMES EMAIL ──────────────────────────────────────────────
  const {enviarDiario, enviarSemanal, enviarMensual} = usarInformes({ventas,clientes,planillas,noVisitas:noVisitas||[],productos});
  const cerrarDia = async (fecha, dia) => {
    const key = `sr_informe_${fecha}_${dia}`;
    if(localStorage.getItem(key)) return true;
    // Mostrar a qué email va a mandar
    const licPreview = (()=>{ try{return JSON.parse(localStorage.getItem("sr_licencia")||"{}").email||"";}catch{return "";} })();
    if(licPreview) console.log("Enviando informe a:", licPreview);
    setSyncStatus("saving");
    const ok = await enviarDiario(fecha, dia);
    if(ok) {
      localStorage.setItem(key, "1");
      const d = new Date(fecha+"T12:00:00");
      if(d.getDay()===6) {
        const okSem = await enviarSemanal(fecha);
        if(okSem) localStorage.setItem(`sr_informe_sem_${fecha}`,"1");
      }
      const manana = new Date(d); manana.setDate(d.getDate()+1);
      if(manana.getMonth()!==d.getMonth()) {
        const okMes = await enviarMensual(d.getMonth()+1, d.getFullYear());
        if(okMes) localStorage.setItem(`sr_informe_mes_${d.getFullYear()}_${d.getMonth()+1}`,"1");
      }
    }
    setSyncStatus(ok?"saved":"error");
    setTimeout(()=>setSyncStatus("idle"),3000);
    return ok;
  };

  // ── Helper: siguiente pendiente (clientes + prospectos del día) ──
  const getSiguienteDelDia = (nvActual, excludeId) => {
    const clientesDia = clientes.filter(cc=>cc.dia===diaActual).sort((a,b)=>(a.orden||9999)-(b.orden||9999));
    const prospDelDia  = (prospectos||[]).filter(p=>p.dia===diaActual&&p.estado==="activo");
    const visitadosIds = new Set([
      ...ventas.filter(v=>v.fechaKey===fechaActual&&v.dia===diaActual&&!v._esCobro&&!v._esAjuste).map(v=>v.clienteId),
      ...(nvActual||noVisitas||[]).filter(v=>v.dia===diaActual&&v.fecha===fechaActual).map(v=>v.clienteId)
    ]);
    if(excludeId) visitadosIds.add(excludeId);
    // Primero clientes regulares
    const sigCl = clientesDia.find(cc=>!visitadosIds.has(cc.id)&&!cc._esProspecto);
    if(sigCl) return {item:sigCl, esProspecto:false};
    // Luego prospectos
    const sigPr = prospDelDia.find(p=>!visitadosIds.has(p.id));
    if(sigPr) return {item:sigPr, esProspecto:true};
    return null;
  };
  const irAlSiguiente = (sig) => {
    if(!sig) { irA("clientes"); return; }
    if(sig.esProspecto) {
      // Agregar prospecto como cliente temporal si no existe todavía
      if(!clientes.find(cc=>cc.id===sig.item.id)) {
        saveClientes([...clientes,{...sig.item,saldo:0,_esProspecto:true}]);
      }
      setProspectoId(sig.item.id);
      setClienteId(sig.item.id);
      irA("venta"); // directo a registrar entrega, sin pasar por detalleProspecto
    } else {
      setClienteId(sig.item.id);
      irA("venta");
    }
  };
  const saveStock    = (v) => { setStock(v);    syncData({stock:v}); };
  const saveProductos= (v) => {
    // Registrar cambio de precio en historial
    const hoy = new Date().toISOString().slice(0,16);
    const histPrecios = JSON.parse(localStorage.getItem("lc_hist_precios")||"[]");
    histPrecios.push({fecha:hoy, productos:v.map(p=>({nombre:p.nombre,precio:p.precio,costo:p.costo}))});
    localStorage.setItem("lc_hist_precios", JSON.stringify(histPrecios.slice(-50)));
    setProductos(v); syncData({productos:v});
  };
  const [cargasDia, setCargasDia] = useLS("cat_cargas_dia_v1", CARGA_DIA_DEFAULT);
  const saveCargasDia = (v) => { setCargasDia(v); try{localStorage.setItem("cat_cargas_dia_v1",JSON.stringify(v));}catch{} };
  const saveNoVisitas= (v) => { setNoVisitas(v); try{localStorage.setItem("cat_novisitas_v1",JSON.stringify(v));}catch{} };
  const saveProspectos=(v)=>{ setProspectos(v); try{localStorage.setItem("cat_prospectos_v1",JSON.stringify(v));}catch{} syncData({prospectos:v}); };

  const cliente = clientes.find(c=>c.id===clienteId)||null;
  const prospecto = (prospectos||[]).find(p=>p.id===prospectoId)||null;
  const irA = (p) => {
    const needsDia = ["diaPrincipal","selectorFechaClientes","selectorFechaPlanilla","inicioReparto","clientes","detalleCliente","venta","planilla"]; // historial does NOT need dia
    if(needsDia.includes(p) && !diaActual) { setPantalla("menu"); window.history.pushState({pantalla:"menu"},'','#menu'); window.scrollTo(0,0); return; }
    setPantalla(p);
    window.scrollTo(0,0);
    window.history.pushState({pantalla:p},'',`#${p}`);
  };

  // Handle back button
  React.useEffect(()=>{
    const handler = (e)=>{
      const p = e.state?.pantalla || "portada";
      const needsDia = ["diaPrincipal","selectorFechaClientes","selectorFechaPlanilla","inicioReparto","clientes","detalleCliente","venta","planilla"]; // historial does NOT need dia
      if(needsDia.includes(p) && !diaActual) { setPantalla("menu"); return; }
      setPantalla(p);
      window.scrollTo(0,0);
    };
    window.addEventListener('popstate', handler);
    return ()=>window.removeEventListener('popstate', handler);
  },[]);

  const updateCliente = (id, cambios) => {
    const nueva = clientes.map(c=>c.id===id?{...c,...cambios}:c);
    saveClientes(nueva);
  };
  const savePlanilla = (dia, datos) => {
    const nueva = {...planillas,[dia]:datos};
    savePlanillasCloud(nueva);
  };
  const getPlanilla = (dia) => planillas[dia]||planillaDiaVacia();

  // Auto-guardado de planilla cuando todos los clientes del día tienen estado
  React.useEffect(()=>{
    if(!diaActual||!fechaActual) return;
    const clientesDia = clientes.filter(c=>c.dia===diaActual);
    if(clientesDia.length===0) return;
    const ventasDia   = ventas.filter(v=>v.dia===diaActual&&v.fechaKey===fechaActual);
    const noVisitasDia= (noVisitas||[]).filter(v=>v.dia===diaActual&&v.fecha===fechaActual);
    const atendidos   = new Set(ventasDia.map(v=>v.clienteId));
    const conEstado   = new Set([...atendidos,...noVisitasDia.map(v=>v.clienteId)]);
    const todosVisitados = clientesDia.every(c=>conEstado.has(c.id));
    if(!todosVisitados) return;
    // Calcular valores automáticos para la planilla
    const CAJON_SODA=6;
    const getProdCosto=(nombre)=>{const p=(productos||[]).find(x=>x.nombre===nombre);return p?(p.costo||0):0;};
    const costSifon=getProdCosto("Sifón 1.5L")||133.33;
    const costB10=getProdCosto("Bidón 10L")||800;
    const costB20=getProdCosto("Bidón 20L")||1100;
    const tots={b10:{vacios:0},b20:{vacios:0},soda:{vacios:0}};
    const prodKey={"Bidón 10L":"b10","Bidón 20L":"b20","Sifón 1.5L":"soda"};
    ventasDia.forEach(v=>v.detalle.forEach(d=>{const k=prodKey[d.nombre];if(k)tots[k].vacios+=d.cantidad;}));
    const sodaCajones=Math.floor(tots.soda.vacios/CAJON_SODA)||0;
    const cobEfectivo=ventasDia.filter(v=>v.pago==="contado").reduce((a,v)=>a+(v.pagadoNum||v.neto||0),0);
    const cobFiado=ventasDia.filter(v=>v.pago==="fiado").reduce((a,v)=>a+(v.neto||0),0);
    const cobTransBruto=ventasDia.filter(v=>v.pago==="transferencia").reduce((a,v)=>a+(v.pagadoNum||v.neto||0),0);
    const cobTransDesc=Math.round(cobTransBruto*0.025);
    const planillaKey=`${diaActual}_${fechaActual}`;
    const planillaActual=planillas[planillaKey]||planillaDiaVacia();
    // Solo auto-completar campos vacíos, nunca pisar lo que el usuario editó
    const nueva={
      ...planillaActual,
      fecha:planillaActual.fecha||fechaActual,
      efectivo:planillaActual.efectivo||(cobEfectivo>0?String(Math.round(cobEfectivo)):""),
      fiado:planillaActual.fiado||(cobFiado>0?String(Math.round(cobFiado)):""),
      retenciones:planillaActual.retenciones||(cobTransDesc>0?String(cobTransDesc):""),
      _autoGuardado:true,
    };
    // Solo guardar si cambió algo
    if(JSON.stringify(nueva)!==JSON.stringify(planillaActual)){
      savePlanilla(planillaKey, nueva);
    }
    // CIERRE AUTOMÁTICO DEL STOCK — se ejecuta una sola vez por día
    const camionCerradoKey = `lc_cam_${planillaKey}`;
    // Solo cerrar si hubo reparto real (al menos 1 venta O la planilla tiene productos cargados)
    const huboReparto = ventasDia.length > 0 || 
      (planillaActual.productos?.b10?.llenos > 0) || 
      (planillaActual.productos?.b20?.llenos > 0) || 
      (planillaActual.productos?.soda?.llenos > 0);
    if(planillaActual.iniciado && huboReparto && !localStorage.getItem(camionCerradoKey)) {
      localStorage.setItem(camionCerradoKey, "1");
      const prodMap = {"Bidón 10L":"b10","Bidón 20L":"b20","Sifón 1.5L":"soda"};
      // Cuánto salió en el camión (según planilla de inicio de reparto)
      const llenos = {
        b10: Number(planillaActual.productos?.b10?.llenos||0),
        b20: Number(planillaActual.productos?.b20?.llenos||0),
        soda: Number(planillaActual.productos?.soda?.llenos||0),
      };
      // Cuánto se vendió (cada venta = 1 vacío que vuelve en el intercambio)
      const vendidos = {b10:0,b20:0,soda:0};
      ventasDia.forEach(v=>v.detalle.forEach(d=>{const k=prodMap[d.nombre];if(k)vendidos[k]+=d.cantidad;}));
      // Préstamos (sin recibir vacío) y devoluciones de deudas anteriores
      const prestados = {b10:0,b20:0,soda:0};
      const devueltos = {b10:0,b20:0,soda:0};
      ventasDia.forEach(v=>{
        (v.envPrest||[]).forEach(e=>{const k=prodMap[e.prod];if(k)prestados[k]+=Number(e.cant)||0;});
        (v.envDev||[]).forEach(e=>{const k=prodMap[e.prod];if(k)devueltos[k]+=Number(e.cant)||0;});
      });
      setStock(prev=>{
        const s=JSON.parse(JSON.stringify(normStock(prev)));
        ["b10","b20","soda"].forEach(pk=>{
          const sk=pk==="b10"?"bidon10":pk==="b20"?"bidon20":"sifon";
          const sorb=Math.max(0, llenos[pk]-vendidos[pk]-prestados[pk]); // sobrantes llenos en camión
          const vacios=vendidos[pk]+devueltos[pk]; // vacíos que vuelven (vendidos + devoluciones)
          s.soderia[sk]=(s.soderia[sk]||0)+sorb+vacios; // todo vuelve a sodería
          s.camion[sk]=Math.max(0,(s.camion[sk]||0)-sorb-vacios); // camión queda en 0
          s.casa[sk]=Math.max(0,(s.casa[sk]||0)-Math.max(0,prestados[pk])); // préstamos salen del depósito
        });
        syncData({stock:normStock(s)});
        return normStock(s);
      });

      // ── Enviar datos del día a Emma Control ──
      if(ecToken && window.enviarAEmmaControl){
        const cobEf=ventasDia.filter(v=>v.pago==="contado").reduce((a,v)=>a+(v.pagadoNum||v.neto||0),0);
        const cobTr=ventasDia.filter(v=>v.pago==="transferencia").reduce((a,v)=>a+(v.pagadoNum||v.neto||0),0);
        const totalCob=Math.round(cobEf+cobTr);
        const gastosData=(planillaActual.gastos||[]).filter(g=>g.monto&&Number(g.monto)>0).map(g=>({
          desc:g.desc||'Gasto reparto',
          monto:Number(g.monto),
          cat:g.cat||'Otros',
          metodo:g.metodo||'efectivo',
        }));
        window.enviarAEmmaControl(ecToken, fechaActual, {total:totalCob,efectivo:Math.round(cobEf),transferencia:Math.round(cobTr)}, gastosData);
      }
    }
  }, [ventas, noVisitas, clientes, diaActual, fechaActual, planillas, ecToken]);

  // Leer estado de licencia
  const pinGuardado = (()=>{ try{const p=JSON.parse(localStorage.getItem("sr_licencia")||"{}").pin;return p?String(p):"";} catch{return "";} })();
  const licActivada = (()=>{ try{return JSON.parse(localStorage.getItem("sr_licencia")||"{}").activado===true;}catch{return false;} })();

  // 0. Cargando datos desde Firebase
  if (cargandoNube && (apiKey || binId)) {
    return (
      <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"var(--color-background-primary,#0f1923)",gap:16}}>
        <img src="icono-192.png" alt="" onError={e=>e.target.style.display="none"} style={{width:56,height:56,borderRadius:14,opacity:0.8}} />
        <div style={{fontSize:14,color:"var(--color-text-secondary,#7a9ab8)"}}>Cargando datos…</div>
        <div style={{width:180,height:4,borderRadius:2,background:"rgba(255,255,255,0.08)",overflow:"hidden",position:"relative"}}>
          <div style={{position:"absolute",height:"100%",background:"#185FA5",borderRadius:2,width:"50%",animation:"lc_slide 1.2s ease-in-out infinite alternate"}} />
        </div>
        <style>{`@keyframes lc_slide{from{left:-50%}to{left:100%}}`}</style>
      </div>
    );
  }

  // 1. Sin código → pedir código
  if (!apiKey || !binId) {
    return <PantallaCodigoAcceso onCodigo={(cod)=>{
      setApiKey(cod);
      setBinId(cod);
      try {
        const lic = JSON.parse(localStorage.getItem("sr_licencia")||"{}");
        localStorage.setItem("sr_licencia", JSON.stringify({...lic, codigo:cod}));
      } catch {}
    }} />;
  }

  // 2. Tiene código pero no activó → pantalla de activación
  if (!licActivada) {
    return <PantallaActivacion onActivado={()=>{
      window.location.hash = "portada";
      window.location.reload();
    }} />;
  }

  // 3. Activado pero no pasó el PIN → pedir PIN y resetear pantalla
  if (pinGuardado && !pinOk) {
    if(window.location.hash && window.location.hash !== "#portada") {
      window.history.replaceState(null,"","#portada");
    }
    return <PantallaPINIndividual onOk={()=>{ setPantalla("portada"); setPinOk(true); }} />;
  }

  const registrarVenta = (detalle, pago, montoPagado, saldoAplicado, envPrest, envDev, obs, opcionSaldo, montoTrans2, saldoDeltaMixto) => {
    const c = cliente;
    // Auto-detectar envases prestados (solo si no es cobro de deuda)
    const envAutoDetect = [];
    if(opcionSaldo!=="cobro_deuda") {
      detalle.forEach(d=>{
        const asignado = d.nombre==="Sifón 1.5L"?(c.sifon||0):d.nombre==="Bidón 10L"?(c.bidon10||0):d.nombre==="Bidón 20L"?(c.bidon20||0):0;
        const extra = d.cantidad - asignado;
        if(extra>0) envAutoDetect.push({prod:d.nombre, cant:String(extra)});
      });
    }
    const envPrestFinal = [...(envPrest||[]).filter(e=>e.prod&&e.cant), ...envAutoDetect.filter(e=>!(envPrest||[]).some(ep=>ep.prod===e.prod))];

    // Pago mixto: UNA sola venta con ambos montos guardados
    const esMixto = opcionSaldo==="mixto_ef" || opcionSaldo==="mixto_tr";
    let montoEfec = 0, montoTrans = 0, pagoReal = pago;

    if(esMixto) {
      if(opcionSaldo==="mixto_ef") {
        montoEfec = Number(montoPagado)||0;
        montoTrans = Number(montoTrans2)||0;
      } else {
        montoTrans = Number(montoPagado)||0;
        montoEfec = Number(montoTrans2)||0;
      }
      pagoReal = "mixto";
    }

    const montoTotal = esMixto ? montoEfec + montoTrans : undefined;
    const obsExtra = esMixto ? ` [Mixto: ef $${montoEfec} + tr $${montoTrans}]` : "";
    const calc = calcVenta(detalle, esMixto?"contado":pago, esMixto?String(montoTotal):montoPagado, saldoAplicado, productos);

    const nuevaVenta = {
      id:Date.now(), clienteId:c.id, cliente:c.nombre,
      dia:diaActual, fechaKey:fechaActual, fecha:new Date().toLocaleString("es-AR"),
      detalle, pago:pagoReal,
      obs:(obs||"")+obsExtra,
      saldoAplicado:saldoAplicado||0,
      envPrest:envPrestFinal,
      envDev:(envDev||[]).filter(e=>e.prod&&e.cant),
      ...calc,
      // Campos extras del mixto — para mostrar confirmación de transferencia
      montoEfec: esMixto ? montoEfec : 0,
      montoTrans: esMixto ? montoTrans : 0,
    };

    saveVentas([...ventas, nuevaVenta]);
    saveClientes(clientes.map(c2=>c2.id===c.id?{...c2,saldo:c.saldo+calc.saldoDelta}:c2));
  };


  const renumerarTrasEliminar = (lista, clienteEliminado) => {
    const { dia, orden } = clienteEliminado;
    if(!orden) return lista;
    return lista.map(c =>
      c.dia === dia && (c.orden||0) > orden
        ? {...c, orden: c.orden - 1}
        : c
    );
  };
  const eliminarCliente = (clienteId) => {
    const eliminado = clientes.find(c=>c.id===clienteId);
    let nc = clientes.filter(c=>c.id!==clienteId);
    if(eliminado) nc = renumerarTrasEliminar(nc, eliminado);
    saveClientes(nc);
    const nv = ventas.filter(v=>v.clienteId!==clienteId);
    saveVentas(nv);
    irA("clientes");
  };

  const eliminarVenta = (ventaId) => {
    const v = ventas.find(x=>x.id===ventaId); if(!v) return;
    const nv = ventas.filter(x=>x.id!==ventaId);
    saveVentas(nv);
    const c = clientes.find(x=>x.id===v.clienteId);
    if(c){ const nc=clientes.map(x=>x.id===c.id?{...x,saldo:c.saldo-v.saldoDelta}:x); saveClientes(nc); }
  };

  const editarVenta = (ventaId, detalle, pago, montoPagado, saldoAplicado, obs, montoTrans2) => {
    const vV = ventas.find(v=>v.id===ventaId); if(!vV) return;
    const c  = clientes.find(x=>x.id===vV.clienteId);
    const esMixto = pago==="mixto";
    const pagoReal = esMixto ? "mixto" : pago;
    const montoParaCalc = esMixto
      ? String((Number(montoPagado)||0)+(Number(montoTrans2)||0))
      : montoPagado;
    const calc = calcVenta(detalle, esMixto?"contado":pago, montoParaCalc, saldoAplicado, productos);
    // Eliminar la vieja venta separada de transferencia si existía (versión anterior)
    let nev = ventas.filter(v=>!(v.obs==="[Parte transfer. de pago mixto]"&&v.clienteId===vV.clienteId&&v.fechaKey===vV.fechaKey));
    nev = nev.map(v=>v.id===ventaId?{
      ...vV, detalle, pago:pagoReal, obs, saldoAplicado:saldoAplicado||0, ...calc,
      montoEfec: esMixto ? Number(montoPagado)||0 : 0,
      montoTrans: esMixto ? Number(montoTrans2)||0 : 0,
    }:v);
    const saldoExtra = c ? (c.saldo - vV.saldoDelta + calc.saldoDelta) : 0;
    saveVentas(nev);
    if(c){ const nc=clientes.map(x=>x.id===c.id?{...x,saldo:saldoExtra}:x); saveClientes(nc); }
  };

  return (
    <div style={{position:"relative"}}>
    <div style={{...s.app, zoom: SCALES[scaleIdx]}}>
      <SyncBar status={syncStatus} isOnline={isOnline} />
      {pantalla==="portada"        && <Portada onIngresar={()=>irA("menu")} />}
      {pantalla==="menu"           && <MenuDias dias={DIAS} onDia={d=>{setDiaActual(d);irA("diaPrincipal");}} onResumen={()=>irA("resumen")} onConfig={(tab)=>{setTabConfig(tab||"precios");irA("config");}} onGestionClientes={()=>irA("gestionClientes")} onPromocion={()=>irA("promocion")} onStock={()=>irA("stock")} onAgenda={()=>irA("agenda")} onVolver={()=>irA("portada")} darkMode={darkMode} onToggleDark={()=>setDarkMode(!darkMode)} clientes={clientes} ventas={ventas} stock={stockNorm}
          recordatoriosActivos={recordatoriosActivos}
          onConfirmarRecordatorio={(id)=>saveRecordatorios((recordatorios||[]).map(r=>r.id===id?{...r,confirmado:true}:r))}
          onVerConfirmaciones={(dia)=>{setDiaActual(dia);irA("confirmacionesDia");}}
          transferenciasPendientes={DIAS.map(dia=>{
            const vts = ventas.filter(v=>v.dia===dia&&v.pago==="transferencia"&&!v.transConfirmada);
            if(!vts.length) return null;
            const fechas = [...new Set(vts.map(v=>v.fechaKey))].sort().reverse();
            return {dia, fecha:fechas[0]||"", count:vts.length, monto:vts.reduce((a,v)=>a+(v.pagadoNum||v.neto||0),0), ventas:vts};
          }).filter(Boolean)} zonasReparto={zonasReparto} onSetZona={(dia,zona)=>{const nz={...zonasReparto,[dia]:zona};setZonasReparto(nz);syncData({zonasReparto:nz});}}
          onDiaHoy={(dia,fechaKey)=>{setDiaActual(dia);setFechaActual(fechaKey);setFechaObj(new Date(fechaKey+"T12:00:00"));irA("inicioReparto");}}
          onDiaResumen={(dia,fechaKey)=>{
  setDiaActual(dia);setFechaActual(fechaKey);setFechaObj(new Date(fechaKey+"T12:00:00"));
  const plan=planillas[`${dia}_${fechaKey}`];
  const yaConfirmado=!!plan?._diaCerrado||!!localStorage.getItem(`cierre_${dia}_${fechaKey}`);
  setInitCierre(!yaConfirmado);
  irA("planilla");
}}
          noVisitas={noVisitas||[]}
          prospectos={prospectos||[]}
          onFiados={()=>irA("fiadosPendientes")}
          onDormidos={()=>irA("clientesDormidos")} />}
      {pantalla==="confirmacionesDia" && <ConfirmacionesDia
          dia={diaActual}
          ventas={ventas.filter(v=>v.dia===diaActual&&v.pago==="transferencia")}
          clientes={clientes}
          onConfirmar={(ventaId)=>{const nv=ventas.map(v=>v.id===ventaId?{...v,transConfirmada:!v.transConfirmada}:v);saveVentas(nv);}}
          onVolver={()=>irA("menu")} />}
      {pantalla==="diaPrincipal"   && <DiaPrincipal dia={diaActual} onIrClientes={()=>irA("selectorFechaClientes")} onIrPlanilla={()=>irA("selectorFechaPlanilla")} onVolver={()=>irA("menu")} onVerConfirmaciones={()=>irA("confirmacionesDia")} ventasPendientesTransfer={ventas.filter(v=>v.dia===diaActual&&v.pago==="transferencia"&&!v.transConfirmada).length} />}
      {pantalla==="selectorFechaPlanilla" && <SelectorFecha dia={diaActual} planillas={planillas} ventas={ventas} noVisitas={noVisitas} onSeleccionar={(fk,fo)=>{setFechaActual(fk);setFechaObj(fo);irA("planilla");}} onVolver={()=>irA("diaPrincipal")} />}
      {pantalla==="planilla"       && <PlanillaDelDia dia={diaActual} fecha={fechaActual} ventas={ventas.filter(v=>v.fechaKey===fechaActual)} clientes={clientes} prospectos={prospectos||[]} planilla={planillas[`${diaActual}_${fechaActual}`]||planillaDiaVacia()} productos={productos} stock={stockNorm} setStock={setStock} syncData={syncData} onGuardar={d=>{savePlanilla(`${diaActual}_${fechaActual}`,d);}} onVolver={()=>irA("menu")} onCerrarDia={()=>cerrarDia(fechaActual,diaActual)} initCierre={initCierre} />}
      {pantalla==="selectorFechaClientes" && <SelectorFecha dia={diaActual} planillas={planillas} ventas={ventas} noVisitas={noVisitas} onSeleccionar={(fk,fo)=>{setFechaActual(fk);setFechaObj(fo);irA("inicioReparto");}} onVolver={()=>irA("diaPrincipal")} />}
      {pantalla==="inicioReparto"  && <InicioReparto dia={diaActual} fecha={fechaActual} planilla={planillas[`${diaActual}_${fechaActual}`]||planillaDiaVacia()} productos={productos} cargasDia={cargasDia} stock={stockNorm}
        onGuardar={(p,descontar)=>{
          savePlanilla(`${diaActual}_${fechaActual}`,p);
          if(descontar){
            const s=JSON.parse(JSON.stringify(normStock(stockNorm)));
            const soda=Number(p.productos?.soda?.llenos||0);
            const b10=Number(p.productos?.b10?.llenos||0);
            const b20=Number(p.productos?.b20?.llenos||0);
            s.soderia.sifon  =Math.max(0,(s.soderia.sifon||0)-soda);
            s.soderia.bidon10=Math.max(0,(s.soderia.bidon10||0)-b10);
            s.soderia.bidon20=Math.max(0,(s.soderia.bidon20||0)-b20);
            s.camion.sifon   =(s.camion.sifon||0)+soda;
            s.camion.bidon10 =(s.camion.bidon10||0)+b10;
            s.camion.bidon20 =(s.camion.bidon20||0)+b20;
            setStock(normStock(s));
            syncData({stock:normStock(s)});
          }
          irA("clientes");
        }} onVolver={()=>irA("selectorFechaClientes")} />}
      {pantalla==="clientes"       && <ListaClientes clientes={clientes.filter(c=>c.dia===diaActual)} dia={diaActual} fecha={fechaActual} ventas={ventas.filter(v=>v.fechaKey===fechaActual&&v.dia===diaActual)} ventasTodas={ventas} noVisitas={(noVisitas||[]).filter(v=>v.dia===diaActual&&v.fecha===fechaActual)} onSeleccionar={c=>{setClienteId(c.id);irA("detalleCliente");}} onNuevoCliente={()=>irA("nuevoCliente")} onVolver={()=>irA("selectorFechaClientes")} onReordenar={lista=>{
          const otros=clientes.filter(c=>c.dia!==diaActual);
          saveClientes([...otros,...lista]);
        }} onRegistrarNoVisita={(clienteId,motivo)=>{const nv=[...(noVisitas||[]).filter(v=>!(v.clienteId===clienteId&&v.dia===diaActual&&v.fecha===fechaActual)),{clienteId,dia:diaActual,fecha:fechaActual,motivo}];saveNoVisitas(nv);}} onQuitarNoVisita={(clienteId)=>{const nv=(noVisitas||[]).filter(v=>!(v.clienteId===clienteId&&v.dia===diaActual&&v.fecha===fechaActual));saveNoVisitas(nv);}}
        onConfirmarTransfer={(clienteId,ventaId)=>{
          const nv=ventas.map(v=>v.id===ventaId?{...v,transConfirmada:!v.transConfirmada}:v);
          saveVentas(nv);
        }}
        prospectos={(prospectos||[]).filter(p=>p.dia===diaActual&&p.estado==="activo")}
        recordatorios={recordatorios}
        onVentaProspecto={(p)=>{
          const yaExiste = clientes.find(c=>c.id===p.id);
          if(!yaExiste){
            const nuevo = {...p, saldo:0, _esProspecto:true};
            const nuevosClientes = [...clientes, nuevo];
            setClientes(nuevosClientes);
            try { localStorage.setItem("cat_clientes_v3", JSON.stringify(nuevosClientes)); } catch{}
          }
          setClienteId(p.id);
          irA("venta");
        }}
        onNoEstaProspecto={(id)=>{
          const nv=[...(noVisitas||[]).filter(v=>!(v.clienteId===id&&v.dia===diaActual&&v.fecha===fechaActual)),{clienteId:id,dia:diaActual,fecha:fechaActual,motivo:"noesta"}];
          saveNoVisitas(nv);
        }}
        onNoQuiereProspecto={(id)=>{
          const nv=[...(noVisitas||[]).filter(v=>!(v.clienteId===id&&v.dia===diaActual&&v.fecha===fechaActual)),{clienteId:id,dia:diaActual,fecha:fechaActual,motivo:"noquiso"}];
          saveNoVisitas(nv);
        }}
        onVerProspecto={(p)=>{setProspectoId(p.id);irA("detalleProspecto");}}
        onEliminarProspecto={(id)=>{if(window.confirm("¿Eliminar este prospecto?"))saveProspectos((prospectos||[]).filter(x=>x.id!==id));}}
        onAbrirMapa={()=>irA("mapaClientes")}
        onPlanilla={()=>{ setInitCierre(true); irA("planilla"); }}
        />}
      {pantalla==="clientesDormidos" && <ClientesDormidos clientes={clientes} ventas={ventas} onVolver={()=>irA("menu")} onSeleccionar={c=>{setClienteId(c.id);setDiaActual(c.dia);irA("detalleCliente");}} />}
      {pantalla==="detalleCliente" && cliente && <DetalleCliente cliente={cliente} ventas={ventas.filter(v=>v.clienteId===cliente.id)} noVisitas={(noVisitas||[]).filter(v=>v.clienteId===cliente.id)} dia={diaActual} fecha={fechaActual} productos={productos} onVenta={()=>irA("venta")} onVolver={()=>irA("clientes")} onEditar={cambios=>updateCliente(cliente.id,cambios)} onEliminarVenta={eliminarVenta} onEditarVenta={editarVenta} onEliminarCliente={()=>eliminarCliente(cliente.id)}
          onNoEstaCliente={()=>{
            const nv=[...(noVisitas||[]).filter(v=>!(v.clienteId===cliente.id&&v.dia===diaActual&&v.fecha===fechaActual)),{clienteId:cliente.id,dia:diaActual,fecha:fechaActual,motivo:"noesta"}];
            saveNoVisitas(nv);
            const clientesDia=clientes.filter(c=>c.dia===diaActual).sort((a,b)=>(a.orden||9999)-(b.orden||9999));
            const ventasIds=new Set(ventas.filter(v=>v.fechaKey===fechaActual&&v.dia===diaActual&&!v._esCobro&&!v._esAjuste).map(v=>v.clienteId));
            const noVMap={};nv.filter(v=>v.dia===diaActual&&v.fecha===fechaActual).forEach(v=>{noVMap[v.clienteId]=v.motivo;});
            const terminados=new Set(clientesDia.filter(c=>ventasIds.has(c.id)||noVMap[c.id]==="noquiso"||noVMap[c.id]==="noesta2").map(c=>c.id));
            const normalPend=clientesDia.filter(c=>!terminados.has(c.id)&&noVMap[c.id]!=="noesta"&&c.id!==cliente.id);
            const noestaPend=clientesDia.filter(c=>noVMap[c.id]==="noesta"&&!terminados.has(c.id)&&c.id!==cliente.id);
            const sig=normalPend[0]||noestaPend[0];
            if(sig){setClienteId(sig.id);irA("detalleCliente");}else irA("clientes");
          }}
          onNoQuiereCliente={()=>{
            const nv=[...(noVisitas||[]).filter(v=>!(v.clienteId===cliente.id&&v.dia===diaActual&&v.fecha===fechaActual)),{clienteId:cliente.id,dia:diaActual,fecha:fechaActual,motivo:"noquiso"}];
            saveNoVisitas(nv);
            const clientesDia=clientes.filter(c=>c.dia===diaActual).sort((a,b)=>(a.orden||9999)-(b.orden||9999));
            const ventasIds=new Set(ventas.filter(v=>v.fechaKey===fechaActual&&v.dia===diaActual&&!v._esCobro&&!v._esAjuste).map(v=>v.clienteId));
            const noVMap={};nv.filter(v=>v.dia===diaActual&&v.fecha===fechaActual).forEach(v=>{noVMap[v.clienteId]=v.motivo;});
            const terminados=new Set(clientesDia.filter(c=>ventasIds.has(c.id)||noVMap[c.id]==="noquiso"||noVMap[c.id]==="noesta2").map(c=>c.id));
            const normalPend=clientesDia.filter(c=>!terminados.has(c.id)&&noVMap[c.id]!=="noesta"&&c.id!==cliente.id);
            const noestaPend=clientesDia.filter(c=>noVMap[c.id]==="noesta"&&!terminados.has(c.id)&&c.id!==cliente.id);
            const sig=normalPend[0]||noestaPend[0];
            if(sig){setClienteId(sig.id);irA("detalleCliente");}else irA("clientes");
          }}
          recordatorios={recordatorios}
          onGuardarRecordatorio={(r)=>saveRecordatorios([...(recordatorios||[]),r])}
          onConfirmarRecordatorio={(id)=>saveRecordatorios((recordatorios||[]).map(r=>r.id===id?{...r,confirmado:true}:r))}
          onCobrarSaldo={(monto,pago)=>{
            const cl=cliente;
            const saldoAntes=cl.saldo||0;
            const saldoDespues=saldoAntes+monto;
            const det=[{nombre:"Cobro de deuda",cantidad:1,precio:0,total:0}];
            const vt={id:Date.now(),clienteId:cl.id,cliente:cl.nombre,dia:diaActual,fechaKey:fechaActual,fecha:new Date().toLocaleString("es-AR"),
              detalle:det,pago,obs:`Cobro de deuda $${monto.toLocaleString("es-AR")} (${pago})`,saldoAplicado:0,
              neto:monto,bruto:monto,desc:0,costo:monto,ganancia:0,pagadoNum:monto,saldoDelta:monto,envPrest:[],envDev:[],
              saldoAntes,saldoDespues,_esCobro:true};
            saveVentas([...ventas,vt]);
            saveClientes(clientes.map(x=>x.id===cl.id?{...x,saldo:saldoDespues}:x));
          }}
          onGuardarAjuste={(vt)=>{saveVentas([...ventas,vt]);}} />}
      {pantalla==="venta"          && cliente && <NuevaVenta key={clienteId} cliente={cliente} productos={productos} fecha={fechaActual}
        progressData={(()=>{
          const clientesDia  = clientes.filter(c=>c.dia===diaActual&&!c._esProspecto);
          const prospDelDia  = [
            ...(prospectos||[]).filter(p=>p.dia===diaActual&&p.estado==="activo"),
            ...clientes.filter(c=>c.dia===diaActual&&c._esProspecto)
          ];
          // IDs de todos los del día
          const idsClientes  = new Set(clientesDia.map(c=>c.id));
          const idsProsp     = new Set(prospDelDia.map(p=>p.id));
          const idsTodos     = new Set([...idsClientes,...idsProsp]);
          const totalDia     = idsClientes.size + idsProsp.size;
          const ventasHoy    = ventas.filter(v=>v.fechaKey===fechaActual&&!v._esCobro&&!v._esAjuste&&idsTodos.has(v.clienteId));
          const noVHoy       = (noVisitas||[]).filter(v=>v.fecha===fechaActual&&idsTodos.has(v.clienteId));
          const visitadosIds = new Set([...ventasHoy.map(v=>v.clienteId),...noVHoy.map(v=>v.clienteId)]);
          const montoHoy     = ventasHoy.reduce((a,v)=>a+(v.neto||0),0);
          const sifs = ventasHoy.reduce((a,v)=>a+(v.detalle||[]).filter(d=>d.nombre==="Sifón 1.5L").reduce((b,d)=>b+d.cantidad,0),0);
          const b10  = ventasHoy.reduce((a,v)=>a+(v.detalle||[]).filter(d=>d.nombre==="Bidón 10L").reduce((b,d)=>b+d.cantidad,0),0);
          const b20  = ventasHoy.reduce((a,v)=>a+(v.detalle||[]).filter(d=>d.nombre==="Bidón 20L").reduce((b,d)=>b+d.cantidad,0),0);
          const planillaHoy  = planillas[`${diaActual}_${fechaActual}`]||{};
          return {visitados:visitadosIds.size, total:totalDia, montoHoy,
            stock:{"Sif":Math.max(0,(Number(planillaHoy.productos?.soda?.llenos)||0)-sifs),
                   "10L":Math.max(0,(Number(planillaHoy.productos?.b10?.llenos)||0)-b10),
                   "20L":Math.max(0,(Number(planillaHoy.productos?.b20?.llenos)||0)-b20)}};
        })()}
        onNoEsta={()=>{
          const prev=(noVisitas||[]).find(v=>v.clienteId===clienteId&&v.dia===diaActual&&v.fecha===fechaActual);
          const motivo=prev?.motivo==="noesta"?"noesta2":"noesta";
          const nv=[...(noVisitas||[]).filter(v=>!(v.clienteId===clienteId&&v.dia===diaActual&&v.fecha===fechaActual)),
            {clienteId,dia:diaActual,fecha:fechaActual,motivo}];
          saveNoVisitas(nv);
          irAlSiguiente(getSiguienteDelDia(nv, clienteId));
        }}
        onNoQuiere={()=>{
          const nv=[...(noVisitas||[]).filter(v=>!(v.clienteId===clienteId&&v.dia===diaActual&&v.fecha===fechaActual)),
            {clienteId,dia:diaActual,fecha:fechaActual,motivo:"noquiso"}];
          saveNoVisitas(nv);
          irAlSiguiente(getSiguienteDelDia(nv, clienteId));
        }}
        onGuardar={(d,p,m,sa,ep,ed,obs,op,mt2,sd)=>{
          registrarVenta(d,p,m,sa,ep,ed,obs,op,mt2,sd);
          // Usar noVisitas actual (sin cambios) — la venta ya marca al cliente como visitado
          irAlSiguiente(getSiguienteDelDia(noVisitas, clienteId));
        }}
        onSaltar={()=>{
          const nv=[...(noVisitas||[]).filter(v=>!(v.clienteId===clienteId&&v.dia===diaActual&&v.fecha===fechaActual)),
            {clienteId,dia:diaActual,fecha:fechaActual,motivo:"salteado"}];
          saveNoVisitas(nv);
          irAlSiguiente(getSiguienteDelDia(nv, clienteId));
        }}
        onVolver={()=>{
          const esProsp = (prospectos||[]).some(p=>p.id===clienteId);
          if(esProsp){ setProspectoId(clienteId); irA("detalleProspecto"); }
          else irA("detalleCliente");
        }} />}
      {pantalla==="nuevoCliente"   && <NuevoCliente diaActual={diaActual} onGuardar={(datos)=>{
          const orden=datos.orden;
          let base=clientes;
          if(orden&&clientes.some(c=>c.dia===datos.dia&&(c.orden||0)===Number(orden))){
            base=clientes.map(c=>c.dia===datos.dia&&(c.orden||0)>=Number(orden)?{...c,orden:(c.orden||0)+1}:c);
          }
          const nc=[...base,{...datos,id:Date.now(),saldo:0,dispenser:datos.dispenser||0}]
            .sort((a,b)=>DIAS.indexOf(a.dia)-DIAS.indexOf(b.dia)||(a.orden||9999)-(b.orden||9999));
          saveClientes(nc);irA("clientes");
        }} onVolver={()=>irA("clientes")} />}
      {pantalla==="promocion"       && <Promocion prospectos={prospectos} clientes={clientes} onSave={saveProspectos} onConvertir={(p)=>{
        const nuevo={...p,id:Date.now(),saldo:0,sifon:0,bidon10:1,bidon20:0};
        saveClientes([...clientes,nuevo]);
        saveProspectos(prospectos.map(x=>x.id===p.id?{...x,estado:"convertido"}:x));
        irA("promocion");
      }} onVolver={()=>irA("menu")} />}
      {pantalla==="detalleProspecto" && prospecto && (()=>{
        const vProsp=ventas.filter(v=>v.clienteId===prospecto.id);
        const noVProsp=(noVisitas||[]).filter(v=>v.clienteId===prospecto.id);
        const ventaHoyProsp=vProsp.find(v=>v.fechaKey===fechaActual&&!v._esCobro&&!v._esAjuste);
        const visitadoHoy=!!(noVProsp.find(v=>v.fecha===fechaActual)||ventaHoyProsp);
        // comprasCount = ventas reales registradas (no cobros ni ajustes)
        const comprasCount=vProsp.filter(v=>!v._esCobro&&!v._esAjuste).length;
        // semanasCount = días únicos con algún registro
        const fechasVisita=[...new Set([
          ...vProsp.map(x=>x.fechaKey).filter(Boolean),
          ...noVProsp.map(x=>x.fecha).filter(Boolean),
          ...(prospecto.visitas||[]).map(x=>x.fecha).filter(Boolean)
        ])];
        const semanasCount=fechasVisita.length;
        // listo = 4 o más compras reales
        const listo=comprasCount>=4;
        return <PromoDetalle
          prospecto={prospecto}
          ventas={vProsp}
          noVisitas={noVProsp}
          productos={productos}
          listo={listo}
          comprasCount={comprasCount}
          semanasCount={semanasCount}
          visitadoHoy={visitadoHoy}
          ventaHoy={ventaHoyProsp}
          fecha={fechaActual}
          onRegistrar={()=>{
            // Agregar prospecto como cliente temporal si no existe
            if(!clientes.find(cc=>cc.id===prospecto.id)){
              saveClientes([...clientes,{...prospecto,saldo:0,_esProspecto:true}]);
            }
            setClienteId(prospecto.id);
            irA("venta");
          }}
          onNoEsta={()=>{
            const nv=[...(noVisitas||[]).filter(v=>!(v.clienteId===prospecto.id&&v.dia===diaActual&&v.fecha===fechaActual)),
              {clienteId:prospecto.id,dia:diaActual,fecha:fechaActual,motivo:"noesta"}];
            saveNoVisitas(nv);
          }}
          onNoQuiere={()=>{
            const nv=[...(noVisitas||[]).filter(v=>!(v.clienteId===prospecto.id&&v.dia===diaActual&&v.fecha===fechaActual)),
              {clienteId:prospecto.id,dia:diaActual,fecha:fechaActual,motivo:"noquiso"}];
            saveNoVisitas(nv);
          }}
          onEliminarVenta={(ventaId)=>{
            const v=ventas.find(x=>x.id===ventaId); if(!v) return;
            saveVentas(ventas.filter(x=>x.id!==ventaId));
          }}
          onComodato={()=>{}}
          onConvertir={(p)=>{
            const base=p||prospecto;
            const nuevo={...base,id:Date.now(),saldo:0,_esProspecto:undefined};
            saveClientes([...clientes.filter(c=>c.id!==prospecto.id),nuevo]);
            saveProspectos(prospectos.map(x=>x.id===base.id?{...x,estado:"convertido"}:x));
            irA("clientes");
          }}
          onEliminar={()=>{
            if(window.confirm("¿Eliminar prospecto?")){
              saveProspectos(prospectos.filter(x=>x.id!==prospecto.id));
              saveClientes(clientes.filter(c=>c.id!==prospecto.id));
              setProspectoId(null);
              irA("clientes");
            }
          }}
          onEditar={(cambios)=>{ saveProspectos(prospectos.map(x=>x.id===prospecto.id?{...x,...cambios}:x)); }}
          onActualizarEnvases={(pid,cambios)=>{ saveProspectos(prospectos.map(x=>x.id===pid?{...x,...cambios}:x)); }}
          onVolver={()=>{setProspectoId(null);irA("clientes");}}
        />;
      })()}
      {pantalla==="gestionClientes" && <GestionClientes clientes={clientes} onReordenarTodo={(lista)=>saveClientes(lista)} onEditar={(id,cambios)=>{saveClientes(clientes.map(c=>c.id===id?{...c,...cambios}:c));}} onEliminar={(id)=>{
        if(window.confirm("¿Eliminar cliente?")){
          const eliminado=clientes.find(c=>c.id===id);
          let nc=clientes.filter(c=>c.id!==id);
          if(eliminado) nc=renumerarTrasEliminar(nc,eliminado);
          saveClientes(nc);
        }}} onNuevo={(datos)=>{
        const orden = datos.orden;
        let nuevos;
        if(orden&&clientes.some(c=>c.dia===datos.dia&&c.orden===orden)){
          nuevos = clientes.map(c=>c.dia===datos.dia&&(c.orden||0)>=orden?{...c,orden:(c.orden||0)+1}:c);
        } else { nuevos = [...clientes]; }
        saveClientes([...nuevos,{...datos,id:Date.now(),saldo:0,dispenser:datos.dispenser||0}].sort((a,b)=>DIAS.indexOf(a.dia)-DIAS.indexOf(b.dia)||(a.orden||9999)-(b.orden||9999)));
      }} onVolver={()=>irA("menu")} onRegistrarVenta={(c)=>{
          setClienteId(c.id);
          const hoyKey = new Date().toISOString().slice(0,10);
          if(!fechaActual) setFechaActual(hoyKey);
          if(!diaActual) setDiaActual(c.dia);
          irA("venta");
        }} onVerDetalle={(c)=>{setClienteId(c.id);irA("detalleDesdeGestion");}}
        onHistorial={undefined}
        onBackup={undefined}
        ventas={ventas}
        prospectos={prospectos||[]}
        recordatorios={recordatorios||[]}
        onConfirmarRecordatorio={(id)=>saveRecordatorios((recordatorios||[]).map(r=>r.id===id?{...r,confirmado:true}:r))}
        onImportar={(nuevosClientes, nuevosProspectos)=>{
          if(nuevosClientes.length){
            const merged = [...clientes];
            let actualizados=0, agregados=0;
            nuevosClientes.forEach(nc=>{
              const idx = merged.findIndex(c=>c.nombre.toLowerCase()===nc.nombre.toLowerCase());
              if(idx>=0){ merged[idx]={...merged[idx],...nc,id:merged[idx].id}; actualizados++; }
              else{ merged.push(nc); agregados++; }
            });
            saveClientes(merged);
          }
          if(nuevosProspectos.length){
            const mergedP = [...(prospectos||[])];
            nuevosProspectos.forEach(np=>{
              const idx = mergedP.findIndex(p=>p.nombre.toLowerCase()===np.nombre.toLowerCase());
              if(idx>=0) mergedP[idx]={...mergedP[idx],...np,id:mergedP[idx].id};
              else mergedP.push(np);
            });
            saveProspectos(mergedP);
          }
        }} />}
      {pantalla==="mapaClientes" && <MapaClientes
        clientes={clientes}
        dia={diaActual}
        fecha={fechaActual}
        ventas={ventas}
        noVisitas={noVisitas}
        onSeleccionar={(c)=>{setClienteId(c.id);setDiaActual(c.dia);const hoy=new Date().toISOString().slice(0,10);if(!fechaActual)setFechaActual(hoy);irA("detalleDesdeGestion");}}
        onActualizar={(nuevosClientes)=>saveClientes(nuevosClientes)}
        onVolver={()=>irA("menu")}
      />}
      {pantalla==="detalleDesdeGestion" && cliente && <DetalleCliente cliente={cliente} ventas={ventas.filter(v=>v.clienteId===cliente.id)} noVisitas={(noVisitas||[]).filter(v=>v.clienteId===cliente.id)} dia={diaActual||cliente.dia} fecha={fechaActual} productos={productos} onVenta={()=>{setDiaActual(cliente.dia);const hoy=new Date().toISOString().slice(0,10);if(!fechaActual)setFechaActual(hoy);irA("venta");}} onVolver={()=>irA("gestionClientes")} onEditar={cambios=>updateCliente(cliente.id,cambios)} onEliminarVenta={eliminarVenta} onEditarVenta={editarVenta} onEliminarCliente={()=>{eliminarCliente(cliente.id);irA("gestionClientes");}}
          onNoEstaCliente={()=>{}} onNoQuiereCliente={()=>{}}
          recordatorios={recordatorios} onGuardarRecordatorio={(r)=>saveRecordatorios([...(recordatorios||[]),r])} onConfirmarRecordatorio={(id)=>saveRecordatorios((recordatorios||[]).map(r=>r.id===id?{...r,confirmado:true}:r))}
          onCobrarSaldo={(monto,pago)=>{
            if(cliente){
              const saldoAntes=cliente.saldo||0;
              const saldoDespues=saldoAntes+monto;
              const det=[{nombre:"Cobro de deuda",cantidad:1,precio:0,total:0}];
              const fk=fechaActual||new Date().toISOString().slice(0,10);
              const vt={id:Date.now(),clienteId:cliente.id,cliente:cliente.nombre,
                dia:diaActual||cliente.dia,fechaKey:fk,fecha:new Date().toLocaleString("es-AR"),
                detalle:det,pago,obs:`Cobro de deuda $${monto.toLocaleString("es-AR")} (${pago})`,saldoAplicado:0,
                neto:monto,bruto:monto,desc:0,costo:monto,ganancia:0,pagadoNum:monto,saldoDelta:monto,envPrest:[],envDev:[],
                saldoAntes,saldoDespues,_esCobro:true};
              saveVentas([...ventas,vt]);
              saveClientes(clientes.map(x=>x.id===cliente.id?{...x,saldo:saldoDespues}:x));
            }
          }} />}
      {pantalla==="agenda" && <AgendaScreen
        recordatorios={recordatorios||[]}
        clientes={clientes}
        onConfirmar={(id)=>saveRecordatorios((recordatorios||[]).map(r=>r.id===id?{...r,confirmado:true}:r))}
        onEliminar={(id)=>saveRecordatorios((recordatorios||[]).filter(r=>r.id!==id))}
        onNuevo={(datos)=>{
          const c=clientes.find(x=>x.id===datos.clienteId);
          if(!c){alert("Seleccioná un cliente");return;}
          saveRecordatorios([...(recordatorios||[]),{...datos,id:Date.now(),clienteId:c.id,clienteNombre:c.nombre,dia:c.dia,confirmado:false}]);
        }}
        onVolver={()=>irA("menu")}
      />}
      {pantalla==="stock"          && <StockGeneral stock={stockNorm} setStock={(ns)=>{setStock(ns);syncData({stock:ns});}} clientes={clientes} ventas={ventas} productos={productos} planillas={planillas} onVolver={()=>irA("menu")} onAjustarEnvases={(vt)=>{const nv=[...ventas,vt];saveVentas(nv);alert("✅ Envases corregidos correctamente");}} />}
      {pantalla==="resumen"        && <Resumen ventas={ventas} clientes={clientes} productos={productos} planillas={planillas} noVisitas={noVisitas||[]} onVolver={()=>irA("menu")} />}
      {pantalla==="config"         && <Config productos={productos} setProductos={saveProductos} clientes={clientes} setClientes={saveClientes} ventas={ventas} setVentas={saveVentas} planillas={planillas} setPlanillas={savePlanillasCloud} stock={stockNorm} setStock={(s)=>{const ns=normStock(s);setStockRaw(ns);syncData({stock:ns});}} cargasDia={cargasDia} setCargasDia={saveCargasDia} syncData={syncData} onVolver={()=>irA("menu")} ecToken={ecToken} setEcToken={setEcToken} tabInicial={tabConfig} />}
    </div>
    {/* Botón flotante de escala — fuera del zoom para que no se afecte */}
    <button
      onClick={()=>setScaleIdx(i=>(i+1)%4)}
      title={`Tamaño: ${SCALE_LABELS[scaleIdx]} — tocá para cambiar`}
      style={{
        position:"fixed", bottom:18, right:18, zIndex:9999,
        width:38, height:38, borderRadius:"50%",
        background:"#185FA5", color:"#e2eaf4",
        border:"none", cursor:"pointer",
        fontSize:12, fontWeight:700,
        boxShadow:"0 2px 10px rgba(0,0,0,0.4)",
        display:"flex", alignItems:"center", justifyContent:"center",
        letterSpacing:"0.02em",
      }}>
      {SCALE_LABELS[scaleIdx]}
    </button>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = {error:null}; }
  static getDerivedStateFromError(e) { return {error:e}; }
  componentDidCatch(e,info) { console.error("App error:", e, info); }
  render() {
    if(this.state.error) return (
      <div style={{padding:40,textAlign:"center",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#0f1923"}}>
        <div style={{fontSize:40,marginBottom:16}}>⚠️</div>
        <div style={{fontSize:18,fontWeight:500,color:"#f07070",marginBottom:8}}>Algo salió mal</div>
        <div style={{fontSize:13,color:"#7a9ab8",marginBottom:20,maxWidth:300}}>{String(this.state.error.message||"Error desconocido")}</div>
        <button style={{background:"#185FA5",color:"#fff",border:"none",borderRadius:8,padding:"10px 24px",fontSize:14,cursor:"pointer"}}
          onClick={()=>{this.setState({error:null});window.location.hash="portada";}}>
          Reiniciar app
        </button>
      </div>
    );
    return this.props.children;
  }
}

