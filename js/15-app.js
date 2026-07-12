// ════════════════════════════════════════════════════════════════════
// ◆  usarInformes — Envío de resúmenes por email
// ════════════════════════════════════════════════════════════════════
function usarInformes({ventas, clientes, planillas, noVisitas, productos}) {
  const getLic = () => { try{ return JSON.parse(localStorage.getItem("sr_licencia")||"{}"); }catch{ return {}; } };
  const fmtP = (n) => "$" + Math.round(Number(n)||0).toLocaleString("es-AR");
  const enviarDiario = async (fecha, dia, imgData) => {
    const lic = getLic();
    if(!window.enviarEmailBrevoRM) { alert("⚠️ Función de email no disponible. Actualizá el archivo index.html."); return false; }
    const emailFinal = (()=>{ try{ return localStorage.getItem("sr_lc_email_informes")||lic.email||""; }catch{ return lic.email||""; } })();
    if(!emailFinal) { alert("⚠️ No hay email configurado.\n\nAndá a Config → tab Datos → Email para informes."); return false; }
    Object.assign(lic, {email: emailFinal});
    try {
      const CAJON_SODA = 6;
      const calcCajones = (s) => { const f=Math.floor(s/CAJON_SODA); return (s%CAJON_SODA)>=4?f+1:f; };
      const plan = (planillas||{})[`${dia}_${fecha}`]||{};
      const planEf  = plan.efectivo   !== "" && plan.efectivo   !== undefined ? Number(plan.efectivo  ||0) : null;
      const planRet = plan.retenciones!== "" && plan.retenciones!== undefined ? Number(plan.retenciones||0) : null;
      const planFi  = plan.fiado      !== "" && plan.fiado      !== undefined ? Number(plan.fiado     ||0) : null;
      const todasFecha = (ventas||[]).filter(v=>v.fechaKey===fecha);
      const clientesDia = new Set((clientes||[]).filter(c=>c.dia===dia).map(c=>c.id));
      const todasVentasDia = [...todasFecha.filter(v=>clientesDia.has(v.clienteId)),...todasFecha.filter(v=>!clientesDia.has(v.clienteId))];
      const calcEf = todasVentasDia.filter(v=>v.pago==="contado"||v.pago==="mixto").reduce((a,v)=>a+(v.pago==="mixto"?(Number(v.montoEfec)||0):(v.pagadoNum||v.neto||0)),0);
      const calcTr = todasVentasDia.filter(v=>v.pago==="transferencia"||v.pago==="mixto").reduce((a,v)=>a+(v.pago==="mixto"?(Number(v.montoTrans)||0):(v.pagadoNum||v.neto||0)),0);
      const calcFi = todasVentasDia.filter(v=>v.pago==="fiado").reduce((a,v)=>a+(v.neto||0),0);
      const ef  = planEf  !== null ? planEf  : Math.round(calcEf);
      const ret = planRet !== null ? planRet : Math.round(calcTr*0.025);
      const tr  = planRet !== null ? Math.round(planRet/0.025) : Math.round(calcTr);
      const trN = tr - ret;
      const fi  = planFi  !== null ? planFi  : Math.round(calcFi);
      const vendSoda=todasVentasDia.reduce((a,v)=>a+((v.detalle||[]).find(d=>d.nombre==="Sifón 1.5L")?.cantidad||0),0);
      const vendB10 =todasVentasDia.reduce((a,v)=>a+((v.detalle||[]).find(d=>d.nombre==="Bidón 10L" )?.cantidad||0),0);
      const vendB20 =todasVentasDia.reduce((a,v)=>a+((v.detalle||[]).find(d=>d.nombre==="Bidón 20L" )?.cantidad||0),0);
      const cajVend = calcCajones(vendSoda);
      const salSoda = Number(plan.productos?.soda?.llenos||0); const cajSal = calcCajones(salSoda);
      const salB10  = Number(plan.productos?.b10?.llenos||0);
      const salB20  = Number(plan.productos?.b20?.llenos||0);
      const cS=(productos||[]).find(p=>p.nombre==="Sifón 1.5L")?.costo||133.33;
      const cB10=(productos||[]).find(p=>p.nombre==="Bidón 10L")?.costo||800;
      const cB20=(productos||[]).find(p=>p.nombre==="Bidón 20L")?.costo||1100;
      const costo = cajVend*(cS*CAJON_SODA) + vendB10*cB10 + vendB20*cB20;
      const gastosList = (plan.gastos||[]).filter(g=>g.confirmado&&g.monto);
      const gastos = gastosList.reduce((a,g)=>a+Math.round(Number(g.monto)||0),0);
      const mano = ef - costo - gastos; const gan = (ef+trN) - costo - gastos;
      const entregas = todasVentasDia.filter(v=>!v._esCobro&&!v._esAjuste).length;
      const noVis = (noVisitas||[]).filter(v=>v.fecha===fecha&&v.dia===dia).length;
      const neg=lic.negocio||lic.nombre||"Sistema de Reparto";
      const fila=(l,v,col="")=>`<tr><td style="padding:7px 0;color:#555;border-bottom:1px solid #eee">${l}</td><td style="text-align:right;font-weight:600;border-bottom:1px solid #eee;color:${col||"#222"}">${v}</td></tr>`;
      const sep=(t)=>`<tr><td colspan="2" style="padding:10px 0 4px;font-size:11px;font-weight:700;color:#999;text-transform:uppercase">${t}</td></tr>`;
      const envRow=(prod,sal,vend,volv)=>sal>0||vend>0?`<tr><td style="padding:5px 4px;border-bottom:1px solid #eee">${prod}</td><td style="text-align:center;padding:5px 4px;border-bottom:1px solid #eee">${sal}</td><td style="text-align:center;padding:5px 4px;border-bottom:1px solid #eee;color:#185FA5;font-weight:700">${vend}</td><td style="text-align:center;padding:5px 4px;border-bottom:1px solid #eee">${volv}</td></tr>`:"";
      const html= imgData
        ? `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:16px;background:#f9fafb"><div style="background:#185FA5;border-radius:12px 12px 0 0;padding:16px 20px"><h2 style="color:#fff;margin:0;font-size:17px">📋 Cierre del día · ${dia} ${fecha}</h2><p style="color:#c8dcf0;margin:4px 0 0;font-size:12px">${neg}</p></div><div style="background:#fff;border-radius:0 0 12px 12px;padding:12px"><img src="${imgData}" style="width:100%;border-radius:8px;display:block;" alt="Planilla del día"/></div><p style="color:#aaa;font-size:11px;text-align:center;margin-top:12px">Sistema de Reparto · Emma Soluciones Digitales</p></div>`
        : `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#f9fafb"><div style="background:#185FA5;border-radius:12px 12px 0 0;padding:20px 24px"><h2 style="color:#fff;margin:0;font-size:18px">📋 Cierre del día · ${dia} ${fecha}</h2><p style="color:#c8dcf0;margin:4px 0 0;font-size:13px">${neg}</p></div><div style="background:#fff;border-radius:0 0 12px 12px;padding:20px 24px"><div style="background:#f0f7ff;border-radius:10px;padding:16px;margin-bottom:20px;text-align:center"><div style="font-size:32px;font-weight:800;color:#185FA5">${fmtP(ef+tr+fi)}</div><div style="color:#666;font-size:13px">${entregas} entregas · ${noVis} sin visita</div></div><table style="width:100%;border-collapse:collapse;font-size:14px">${cajSal>0||cajVend>0?`${sep("📦 Envases")}<tr style="background:#f5f5f5"><td style="padding:4px;font-size:11px;color:#888">Prod.</td><td style="text-align:center;padding:4px;font-size:11px;color:#888">Sal.</td><td style="text-align:center;padding:4px;font-size:11px;color:#888">Vend.</td><td style="text-align:center;padding:4px;font-size:11px;color:#888">Vuelve</td></tr>${envRow("Soda (caj)",cajSal,cajVend,cajSal-cajVend)}${envRow("Bidón 10L",salB10,vendB10,salB10-vendB10)}${envRow("Bidón 20L",salB20,vendB20,salB20-vendB20)}`:""}${sep("💵 Cobranza")}${fila("Efectivo",fmtP(ef))}${tr>0?fila("Transferencias (bruto)",fmtP(tr)):""}${ret>0?fila("Retención 2.5%","−"+fmtP(ret),"#e05c5c"):""}${tr>0?fila("Transferencias (neto)",fmtP(trN),"#185FA5"):""}${fi>0?fila("Fiado",fmtP(fi),"#f5a623"):""}${sep("📦 Costos")}${fila("Llenado","−"+fmtP(costo),"#e05c5c")}${gastos>0?`${sep("💸 Gastos")}${gastosList.map(g=>fila(g.cat+(g.desc?` · ${g.desc}`:""),"−"+fmtP(Math.round(Number(g.monto)||0)),"#e05c5c")).join("")}${fila("<b>Total</b>","−"+fmtP(gastos),"#e05c5c")}`:""}${sep("💰 Resultado")}${fila("<b>Plata en mano</b>","<b>"+fmtP(mano)+"</b>",mano>=0?"#0a7c3e":"#e05c5c")}${fila("<b>Ganancia neta</b>","<b>"+fmtP(gan)+"</b>",gan>=0?"#0a7c3e":"#e05c5c")}</table></div><p style="color:#aaa;font-size:11px;text-align:center;margin-top:16px">Sistema de Reparto · Emma Soluciones Digitales</p></div>`;
      await window.enviarEmailBrevoRM({to:lic.email,toName:neg,subject:`📋 Cierre ${dia} ${fecha} · ${fmtP(ef+tr+fi)} · Mano ${fmtP(mano)}`,htmlContent:html});
      return true;
    } catch(e){ console.error("enviarDiario:",e); alert("❌ Error: "+(e.message||e)); return false; }
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
    const savedDia = (() => { try { return JSON.parse(localStorage.getItem("sr_dia_actual")||'""'); } catch{ return ""; } })();
    if(needsDia.includes(h) && !savedDia) return "portada";
    return h;
  });
  const [diaActual, setDiaActual]   = useLS("sr_dia_actual", "");
  // Reset diaActual when it's invalid
  React.useEffect(()=>{
    if(diaActual && !DIAS.includes(diaActual)) setDiaActual("");
  },[]);
  const [fechaActual, setFechaActual] = useLS("sr_fecha_actual", ""); // ISO date key YYYY-MM-DD
  const [fechaObj, setFechaObj]   = useState(null);
  const [clienteId, setClienteId] = useState(null);
  const [prospectoId, setProspectoId] = useState(null);
  const [initCierre, setInitCierre] = useState(false);
  const [noVisitas, setNoVisitas] = useLS("sr_novisitas_v1", []);
  const [prospectos, setProspectos] = useLS("sr_prospectos_v1", []);
  const [recordatorios, setRecordatorios] = useLS("sr_recordatorios_v1", []);
  // recordatorio: {id, clienteId, clienteNombre, fecha, hora, motivo, dia, confirmado}
  const saveRecordatorios = (r) => { setRecordatorios(prev => { const next=(typeof r==="function")?r(prev):r; syncData({recordatorios:next}); return next; }); };
  const recordatoriosActivos = (recordatorios||[]).filter(r=>!r.confirmado); // [{clienteId,dia,fecha,motivo}]
  const [clientes, setClientes]   = useLS("sr_clientes_v3", CLIENTES_INICIALES);
  const [ventasRaw, setVentasRaw] = useLS("sr_ventas_v3", []);
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
  const [productos, setProductos] = useLS("sr_productos_v3", PRODUCTOS_INICIALES);
  const normStock = (s) => {
    const e = () => ({sifon:0,bidon10:0,bidon20:0,dispenser:0});
    const pick = (o) => { const r={sifon:0,bidon10:0,bidon20:0,dispenser:0}; if(o&&typeof o==="object"){ for(const k in o){ r[k]=Math.max(0,Math.round(Number(o[k])||0)); } } return r; };
    const base = {soderia:e(),soderia_vacios:e(),casa:e(),camion:e()};
    if(!s||typeof s!=="object") return base;
    if(s.soderia&&typeof s.soderia==="object") {
      return {
        soderia:    pick(s.soderia),
        soderia_vacios: pick(s.soderia_vacios),
        casa:       pick(s.casa),
        camion:     pick(s.camion),
      };
    }
    return {soderia:pick(s), soderia_vacios:e(), casa:e(), camion:e()};
  };
  const [stockRaw, setStockRaw] = useLS("sr_stock_v4", {soderia:{sifon:0,bidon10:0,bidon20:0,dispenser:0},soderia_vacios:{sifon:0,bidon10:0,bidon20:0,dispenser:0},casa:{sifon:0,bidon10:0,bidon20:0,dispenser:0},camion:{sifon:0,bidon10:0,bidon20:0,dispenser:0}});
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
      ["sifon","bidon10","bidon20","dispenser"].forEach(k=>{
        s.soderia[k]    = (s.soderia[k]||0) + (sobrLlenos[k]||0);
        s.soderia_vacios[k] = (s.soderia_vacios[k]||0) + (vacios[k]||0);
        s.camion[k]  = Math.max(0, (s.camion[k]||0) - (sobrLlenos[k]||0) - (vacios[k]||0));
      });
      syncData({stock:s});
      return s;
    });
  };
  const [planillas, setPlanillas] = useLS("sr_planillas_v1", {});
  // Cargas de salida por día — declarado acá arriba para que estadoRef pueda incluirlo y viaje a Firebase
  const [cargasDia, setCargasDia] = useLS("sr_cargas_dia_v1", CARGA_DIA_DEFAULT);
  // Firebase — credentials embedded in SDK config above
  const [apiKey, setApiKey] = useLS("sr_apikey", "");
  const [binId,  setBinId]  = useLS("sr_binid",  "");
  const [syncStatus, setSyncStatus] = useState("idle");
  const [ecToken, setEcToken] = useState(()=>localStorage.getItem('lc_ec_token')||'');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingOfflineSync, setPendingOfflineSync] = useState(
    ()=>!!localStorage.getItem("sr_offline_pending")
  );
  const [cloudSetup, setCloudSetup] = useState(false);
  const [darkMode, setDarkMode]   = useLS("sr_darkmode", false);
  
  const [modalResumenDia, setModalResumenDia] = useState(null);
  const [tabConfig, setTabConfig] = useState("stock");
  const [zonasReparto, setZonasReparto] = useLS("sr_zonas_v1", {});
  const [scaleIdx, setScaleIdx]   = useLS("sr_scale_v1", 1); // 0=S 1=M 2=L 3=XL
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
      if (data.clientes?.length)   {
        // ── Clientes: MERGEAR por id en vez de sobreescribir ──────────────
        // (mismo motivo que ventas: no perder un saldo recién actualizado
        // localmente si esta carga inicial llega con datos más viejos)
        const clientesLocales = (()=>{ try{ return JSON.parse(localStorage.getItem("sr_clientes_v3")||"[]"); }catch{ return []; } })();
        const porIdCli = {}; (data.clientes||[]).forEach(c=>{ porIdCli[c.id] = c; });
        let cambiosLocalesCli = 0;
        clientesLocales.forEach(c=>{
          const enNube = porIdCli[c.id];
          if(!enNube){ porIdCli[c.id] = c; cambiosLocalesCli++; return; }
          const uL = Number(c._upd)||0, uN = Number(enNube._upd)||0;
          if(uL > uN){ porIdCli[c.id] = c; cambiosLocalesCli++; }
        });
        const mergedCli = Object.values(porIdCli);
        setClientes(mergedCli);
        try{localStorage.setItem("sr_clientes_v3",JSON.stringify(mergedCli));}catch{}
        if(cambiosLocalesCli>0){ console.log("Merge: "+cambiosLocalesCli+" clientes locales más nuevos, sincronizando"); setTimeout(()=>syncData({clientes:mergedCli}),2000); }
      }
      if (data.ventas?.length)     {
        // Merge: no pisar ventas locales más nuevas que Firebase
        // ── MERGE INTELIGENTE: por cada venta, quedarse con la versión MÁS NUEVA ──
        // Compara el sello _upd. En empate (o datos viejos sin sello) prioriza la transferencia confirmada.
        const ventasLocales=(()=>{try{return JSON.parse(localStorage.getItem("sr_ventas_v3")||"[]");}catch{return[];}})();
        const porId={}; (data.ventas||[]).forEach(v=>{porId[v.id]=v;});
        let cambiosLocales=0;
        ventasLocales.forEach(v=>{
          const enNube=porId[v.id];
          if(!enNube){porId[v.id]=v;cambiosLocales++;return;}
          const uL=Number(v._upd)||0, uN=Number(enNube._upd)||0;
          const ganaLocal=(uL!==uN)?uL>uN:(!!v.transConfirmada&&!enNube.transConfirmada);
          if(ganaLocal){porId[v.id]=v;cambiosLocales++;}
        });
        const merged=Object.values(porId);
        setVentasRaw(merged);
        try{localStorage.setItem("sr_ventas_v3",JSON.stringify(merged));}catch{}
        if(cambiosLocales>0){console.log("Merge: "+cambiosLocales+" ventas locales más nuevas, sincronizando");setTimeout(()=>syncData({ventas:merged}),2000);}
      }
      if (data.planillas)          {
        // ── Planillas: MERGEAR por día en vez de sobreescribir ────────────
        const planillasLocales = (()=>{ try{ return JSON.parse(localStorage.getItem("sr_planillas_v1")||"{}"); }catch{ return {}; } })();
        const mergedPla = {...data.planillas};
        let cambiosLocalesPla = 0;
        Object.keys(planillasLocales).forEach(dia=>{
          const loc = planillasLocales[dia]; const nub = mergedPla[dia];
          if(!nub){ mergedPla[dia] = loc; cambiosLocalesPla++; return; }
          const uL = Number(loc?._upd)||0, uN = Number(nub?._upd)||0;
          if(uL > uN){ mergedPla[dia] = loc; cambiosLocalesPla++; }
        });
        setPlanillas(mergedPla);
        try{localStorage.setItem("sr_planillas_v1",JSON.stringify(mergedPla));}catch{}
        if(cambiosLocalesPla>0){ console.log("Merge: "+cambiosLocalesPla+" planillas locales más nuevas, sincronizando"); setTimeout(()=>syncData({planillas:mergedPla}),2000); }
      }
      if (data.stock) {
        const ds = data.stock;
        const normStock = ds.soderia ? ds : {
          soderia:{sifon:ds.sifon||0,bidon10:ds.bidon10||0,bidon20:ds.bidon20||0},
          casa:   {sifon:0,bidon10:0,bidon20:0},
          camion: {sifon:0,bidon10:0,bidon20:0},
        };
        setStock(normStock);
        try { localStorage.setItem("sr_stock_v4", JSON.stringify(normStock)); } catch {}
      }
      if (data.productos?.length)     { setProductos(data.productos);    try{localStorage.setItem("sr_productos_v3",JSON.stringify(data.productos));}catch{} }
      if (data.noVisitas?.length)     {
        // ── noVisitas: MERGEAR por clave (cliente+día+fecha) ──────────────
        const noVisitasLocales = (()=>{ try{ return JSON.parse(localStorage.getItem("sr_novisitas_v1")||"[]"); }catch{ return []; } })();
        const clave = v => `${v.clienteId}|${v.dia}|${v.fecha}`;
        const porClaveNV = {}; (data.noVisitas||[]).forEach(v=>{ porClaveNV[clave(v)] = v; });
        let cambiosLocalesNV = 0;
        noVisitasLocales.forEach(v=>{
          const k = clave(v); const enNube = porClaveNV[k];
          if(!enNube){ porClaveNV[k] = v; cambiosLocalesNV++; return; }
          const uL = Number(v._upd)||0, uN = Number(enNube._upd)||0;
          if(uL > uN){ porClaveNV[k] = v; cambiosLocalesNV++; }
        });
        const mergedNV = Object.values(porClaveNV);
        setNoVisitas(mergedNV);
        try{localStorage.setItem("sr_novisitas_v1",JSON.stringify(mergedNV));}catch{}
        if(cambiosLocalesNV>0){ console.log("Merge: "+cambiosLocalesNV+" marcas de visita locales más nuevas, sincronizando"); setTimeout(()=>syncData({noVisitas:mergedNV}),2000); }
      }
      if (data.prospectos?.length)    { setProspectos(data.prospectos);  try{localStorage.setItem("sr_prospectos_v1",JSON.stringify(data.prospectos));}catch{} }
      if (data.recordatorios?.length) { setRecordatorios(data.recordatorios); try{localStorage.setItem("sr_recordatorios_v1",JSON.stringify(data.recordatorios));}catch{} }
      if (data.mantVeh?.length)    localStorage.setItem("sr_mant_vehiculo_v1", JSON.stringify(data.mantVeh));
      if (data.histPrecios?.length) localStorage.setItem("sr_lc_hist_precios", JSON.stringify(data.histPrecios));
      if (data.horaAvisoCierre)    localStorage.setItem("sr_hora_notif_cierre", data.horaAvisoCierre);
      if (data.horasAvisoTrans)    localStorage.setItem("sr_horas_notif_trans", JSON.stringify(data.horasAvisoTrans));
      if (data.diasAvisoMant)      localStorage.setItem("sr_dias_notif_mant", data.diasAvisoMant.join(','));
      if (data.zonasReparto && Object.keys(data.zonasReparto).length) setZonasReparto(data.zonasReparto);
      if (data.cargasDia && Object.keys(data.cargasDia).length) { setCargasDia(data.cargasDia); try{localStorage.setItem("sr_cargas_dia_v1",JSON.stringify(data.cargasDia));}catch{} }
      setSyncStatus("saved");
      setTimeout(()=>setSyncStatus("idle"), 2000);
      setCargandoNube(false);
    }).catch(()=>{ setSyncStatus("idle"); setCargandoNube(false); });
  }, []);

  // Ref siempre actualizado — evita datos viejos en el debounce
  const estadoRef = React.useRef({clientes,ventas,planillas,stock:stockNorm,productos,noVisitas,recordatorios,prospectos,cargasDia});
  // Guards anti doble-tap: evitan sumar/restar el saldo dos veces si el
  // cartel de confirmación tarda en desaparecer y se vuelve a tocar el botón.
  const ultimoRegistroRef = React.useRef({firma:null, ts:0});
  const ultimoBorradoRef = React.useRef({id:null, ts:0});
  const ultimoEditadoRef = React.useRef({firma:null, ts:0});
  React.useEffect(()=>{ estadoRef.current={clientes,ventas,planillas,stock:stockNorm,productos,noVisitas,recordatorios,prospectos,zonasReparto,cargasDia}; });

  // Descarga un archivo JSON al PC — usado por la limpieza automática de
  // abajo, para que quede un registro a mano además del que se guarda en
  // Firebase (por si algún día hace falta mirarlo sin entrar a la nube).
  const _descargarArchivoLC = (nombre, contenido) => {
    try {
      const blob = new Blob([JSON.stringify(contenido, null, 2)], {type:"application/json"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = nombre;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(()=>URL.revokeObjectURL(url), 1500);
    } catch(e) { console.warn("No se pudo descargar el archivo de respaldo:", e); }
  };

  // ── LIMPIEZA AUTOMÁTICA de ventas y marcas "no está/no quiere" antiguas ──
  // Esta app todavía no tenía ninguna de las dos — con el tiempo, sin este
  // límite, terminan acumulándose miles de registros que hacen falta cada
  // vez más lenta la carga (esto ya pasó en La Catalina). Archiva a
  // Firebase y borra localmente lo de más de 3 meses.
  React.useEffect(()=>{
    if(!window.db || !negocioId) return;
    const hoy = new Date();
    const limite = new Date(hoy.getFullYear(), hoy.getMonth()-3, hoy.getDate());
    const limiteKey = limite.toLocaleDateString("en-CA");
    const col = window.db.collection("users").doc(negocioId).collection("datos");
    if(ventas && ventas.length){
      const yaHasta = localStorage.getItem("sr_archivado_ventas_hasta") || "";
      if(yaHasta < limiteKey){
      const viejas = ventas.filter(v=>v.fechaKey && v.fechaKey < limiteKey);
      if(!viejas.length){ localStorage.setItem("sr_archivado_ventas_hasta", limiteKey); }
      if(viejas.length){
        col.doc("archivo_ventas_"+limiteKey).set({d: viejas, archivadasEl: hoy.toISOString()})
          .then(()=>{
            const recientes = ventas.filter(v=>!v.fechaKey || v.fechaKey >= limiteKey);
            if(recientes.length < ventas.length){
              console.log("Limpieza automática: archivadas "+viejas.length+" ventas antiguas en Firebase");
              setVentasRaw(recientes);
              syncData({ventas: recientes});
              _descargarArchivoLC(`ventas-archivadas_${limiteKey}.json`, viejas);
              // Avisar por email: de los clientes con ventas en este archivado,
              // ¿cuáles tienen deuda (saldo negativo) ahora mismo? El saldo total
              // sigue siendo correcto — lo que se va del panel principal es el
              // DETALLE de esas ventas puntuales (queda en el archivo descargado).
              const idsAfectados = new Set(viejas.map(v=>v.clienteId));
              const deudores = clientes.filter(c=>idsAfectados.has(c.id) && (Number(c.saldo)||0)<0);
              if(deudores.length && window.enviarEmailBrevoRM){
                const lic = getLic();
                if(lic.email){
                  const filas = deudores.map(c=>`<tr><td style="padding:6px 10px;border-bottom:1px solid #eee">${c.nombre}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right;color:#c93030">$${Math.abs(Number(c.saldo)||0).toLocaleString("es-AR")}</td></tr>`).join("");
                  window.enviarEmailBrevoRM({
                    to: lic.email, toName: lic.negocio||"",
                    subject: `⚠️ ${deudores.length} cliente(s) con deuda — historial archivado`,
                    htmlContent: `<div style="font-family:sans-serif;padding:20px;max-width:500px">
                      <h2 style="color:#c93030">⚠️ Ojo con estos clientes</h2>
                      <p>Se acaba de archivar el historial de ventas de más de 3 meses. Los siguientes clientes tienen ventas en ese archivado y <b>siguen debiendo</b> a día de hoy:</p>
                      <table style="width:100%;border-collapse:collapse;margin:12px 0">${filas}</table>
                      <p style="font-size:13px;color:#666">El saldo de cada uno sigue siendo el correcto — lo que ya no vas a ver en la app es el DETALLE de esas ventas puntuales. Quedaron guardadas en el archivo <b>ventas-archivadas_${limiteKey}.json</b> que se descargó en la PC, y también en Firebase por las dudas.</p>
                    </div>`
                  }).catch(()=>{});
                }
              }
            }
            localStorage.setItem("sr_archivado_ventas_hasta", limiteKey);
          })
          .catch(e=>console.warn("No se pudieron archivar ventas antiguas:", e));
      }
      }
    }
    if(noVisitas && noVisitas.length){
      const yaHastaNV = localStorage.getItem("sr_archivado_novisitas_hasta") || "";
      if(yaHastaNV < limiteKey){
      const viejasNV = noVisitas.filter(v=>v.fecha && v.fecha < limiteKey);
      if(!viejasNV.length){ localStorage.setItem("sr_archivado_novisitas_hasta", limiteKey); }
      if(viejasNV.length){
        col.doc("archivo_novisitas_"+limiteKey).set({d: viejasNV, archivadasEl: hoy.toISOString()})
          .then(()=>{
            const recientesNV = noVisitas.filter(v=>!v.fecha || v.fecha >= limiteKey);
            if(recientesNV.length < noVisitas.length){
              console.log("Limpieza automática: archivadas "+viejasNV.length+" marcas de visita antiguas en Firebase");
              setNoVisitas(recientesNV);
              syncData({noVisitas: recientesNV});
              _descargarArchivoLC(`visitas-archivadas_${limiteKey}.json`, viejasNV);
            }
            localStorage.setItem("sr_archivado_novisitas_hasta", limiteKey);
          })
          .catch(e=>console.warn("No se pudieron archivar marcas de visita antiguas:", e));
      }
      }
    }
  },[]); // solo al arrancar

  // Hooks globales: respaldo COMPLETO descargable + restaurar
  React.useEffect(()=>{
    window._descargarRespaldo = () => {
      const mantVeh = (()=>{ try { return JSON.parse(localStorage.getItem("sr_mant_vehiculo_v1")||"[]"); } catch { return []; } })();
      const histPrecios = (()=>{ try { return JSON.parse(localStorage.getItem("sr_lc_hist_precios")||"[]"); } catch { return []; } })();
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
        if(data.clientes!==undefined){ setClientes(data.clientes||[]); try{localStorage.setItem("sr_clientes_v3",JSON.stringify(data.clientes||[]));}catch{} }
        if(data.ventas!==undefined){ setVentasRaw(data.ventas||[]); try{localStorage.setItem("sr_ventas_v3",JSON.stringify(data.ventas||[]));}catch{} }
        if(data.planillas!==undefined){ setPlanillas(data.planillas||{}); try{localStorage.setItem("sr_planillas_v1",JSON.stringify(data.planillas||{}));}catch{} }
        if(data.stock){
          const ds=data.stock;
          const ns = ds.soderia ? ds : {soderia:{sifon:ds.sifon||0,bidon10:ds.bidon10||0,bidon20:ds.bidon20||0},casa:{sifon:0,bidon10:0,bidon20:0},camion:{sifon:0,bidon10:0,bidon20:0}};
          setStock(ns); try{localStorage.setItem("sr_stock_v4",JSON.stringify(ns));}catch{}
        }
        if(data.productos!==undefined){ setProductos(data.productos||[]); try{localStorage.setItem("sr_productos_v3",JSON.stringify(data.productos||[]));}catch{} }
        if(data.noVisitas!==undefined){ setNoVisitas(data.noVisitas||[]); try{localStorage.setItem("sr_novisitas_v1",JSON.stringify(data.noVisitas||[]));}catch{} }
        if(data.prospectos!==undefined){ setProspectos(data.prospectos||[]); try{localStorage.setItem("sr_prospectos_v1",JSON.stringify(data.prospectos||[]));}catch{} }
        if(data.recordatorios!==undefined){ setRecordatorios(data.recordatorios||[]); try{localStorage.setItem("sr_recordatorios_v1",JSON.stringify(data.recordatorios||[]));}catch{} }
        if(data.mantVeh!==undefined) localStorage.setItem("sr_mant_vehiculo_v1", JSON.stringify(data.mantVeh||[]));
        if(data.histPrecios!==undefined) localStorage.setItem("sr_lc_hist_precios", JSON.stringify(data.histPrecios||[]));
        if(data.zonasReparto!==undefined) setZonasReparto(data.zonasReparto||{});
        if(data.cargasDia && Object.keys(data.cargasDia).length) { setCargasDia(data.cargasDia); try{localStorage.setItem("sr_cargas_dia_v1",JSON.stringify(data.cargasDia));}catch{} }
        try { cloudSave({ ...estadoRef.current, ...data }, window._negocioId); } catch {}
        return true;
      } catch(e){ alert("Error al restaurar: "+e.message); return false; }
    };
    return ()=>{ delete window._descargarRespaldo; delete window._restaurarRespaldo; };
  }, []);

  // Auto backup DIARIO a localStorage
  React.useEffect(()=>{
    const ultimoBackup = localStorage.getItem("sr_lc_ultimo_backup");
    const hoy = new Date().toLocaleDateString("en-CA");
    if(ultimoBackup===hoy) return; // ya se hizo hoy
    try {
      localStorage.setItem("sr_lc_backup_"+hoy, JSON.stringify({clientes,ventas,planillas}));
      localStorage.setItem("sr_lc_ultimo_backup", hoy);
      // Mantener solo el último backup (el de ayer)
      const keys = Object.keys(localStorage).filter(k=>k.startsWith("sr_lc_backup_")).sort().reverse();
      keys.slice(1).forEach(k=>localStorage.removeItem(k));
      console.log("Auto-backup diario guardado:", hoy);
    } catch(e){ console.warn("Auto-backup falló:", e); }
  },[]);

  const syncData = (overrides={}) => {
    if(!window.db) return;
    setSyncStatus("saving");
    const mantVehActual = (() => { try { return JSON.parse(localStorage.getItem("sr_mant_vehiculo_v1")||"[]"); } catch { return []; } })();
    const histPreciosActual = (() => { try { return JSON.parse(localStorage.getItem("sr_lc_hist_precios")||"[]"); } catch { return []; } })();
    const data = { ...estadoRef.current, ...overrides, noVisitas: overrides.noVisitas!==undefined ? overrides.noVisitas : (estadoRef.current.noVisitas||[]), prospectos: overrides.prospectos!==undefined ? overrides.prospectos : (estadoRef.current.prospectos||[]), recordatorios: overrides.recordatorios!==undefined ? overrides.recordatorios : (estadoRef.current.recordatorios||[]), mantVeh: overrides.mantVeh||mantVehActual, histPrecios: overrides.histPrecios||histPreciosActual, zonasReparto: overrides.zonasReparto||estadoRef.current.zonasReparto||{}, horaAvisoCierre: overrides.horaAvisoCierre || localStorage.getItem('sr_hora_notif_cierre') || '18:00', horasAvisoTrans: overrides.horasAvisoTrans || (()=>{try{return JSON.parse(localStorage.getItem('sr_horas_notif_trans')||'["13:00","19:00"]');}catch{return ['13:00','19:00'];}})(), diasAvisoMant: overrides.diasAvisoMant || (localStorage.getItem('sr_dias_notif_mant')||'3,2,1,0').split(',').map(n=>parseInt(n.trim(),10)).filter(n=>!isNaN(n)) };
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
  // Los avisos (cierre, mantenimiento, transferencias, agenda) los manda el
  // servidor (GitHub Actions) por push real — funciona con la app cerrada.
  // Acá solo pedimos permiso; la suscripción vive en index.html.
  React.useEffect(()=>{
    if(!("Notification" in window)) return;
    if(Notification.permission==="default") Notification.requestPermission();
  },[]);

  // Todas aceptan un valor directo O una función (prev => nuevoValor). Usar
  // la forma función en cualquier lugar que calcule el nuevo valor a partir
  // del estado actual — así no se pierden cambios si dos acciones se
  // disparan casi juntas.
  const saveClientes = (v) => {
    setClientes(prev => {
      const base = (typeof v === "function") ? v(prev) : v;
      const _t = Date.now();
      const vv = base.map(c=>({...c,_upd:_t}));
      syncData({clientes:vv});
      return vv;
    });
  };
  const saveVentas = (v) => {
    setVentasRaw(prev => {
      const nv = (typeof v === "function") ? v(prev) : v;
      syncData({ventas:nv});
      return nv;
    });
  };
  const savePlanillasCloud = (v) => {
    setPlanillas(prev => {
      const next = (typeof v === "function") ? v(prev) : v;
      syncData({planillas:next});
      return next;
    });
  };

  // Limpieza automática: partes-transferencia de pago mixto cuya venta principal ya no existe
  React.useEffect(()=>{
    const huerfanas = ventasRaw.filter(v=>v._esMixtoTrans && v._mixtoDe!==undefined && !ventasRaw.some(x=>x.id===v._mixtoDe));
    if(huerfanas.length>0){ const ids=new Set(huerfanas.map(v=>v.id)); setVentasRaw(prev=>prev.filter(v=>!ids.has(v.id))); }
  }, [ventasRaw]);

  // ── INFORMES EMAIL ──────────────────────────────────────────────
  const {enviarDiario, enviarSemanal, enviarMensual} = usarInformes({ventas,clientes,planillas,noVisitas:noVisitas||[],productos});
  const cerrarDia = async (fecha, dia, imgData) => {
    const key = `sr_informe_${fecha}_${dia}`;
    const envios = Number(localStorage.getItem(key)||0);
    if(envios>=3) return false; // máximo 3 envíos por día
    // Mostrar a qué email va a mandar
    const licPreview = (()=>{ try{return JSON.parse(localStorage.getItem("sr_licencia")||"{}").email||"";}catch{return "";} })();
    if(licPreview) console.log("Enviando informe a:", licPreview);
    setSyncStatus("saving");
    const ok = await enviarDiario(fecha, dia, imgData);
    if(ok) {
      localStorage.setItem(key, String(envios+1));
      const d = new Date(fecha+"T12:00:00");
      if(d.getDay()===6 && !localStorage.getItem(`sr_informe_sem_${fecha}`)) {
        const okSem = await enviarSemanal(fecha);
        if(okSem) localStorage.setItem(`sr_informe_sem_${fecha}`,"1");
      }
      const manana = new Date(d); manana.setDate(d.getDate()+1);
      if(manana.getMonth()!==d.getMonth() && !localStorage.getItem(`sr_informe_mes_${d.getFullYear()}_${d.getMonth()+1}`)) {
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
      saveClientes(prev => prev.find(cc=>cc.id===sig.item.id) ? prev : [...prev,{...sig.item,saldo:0,_esProspecto:true}]);
      setProspectoId(sig.item.id);
      setClienteId(sig.item.id);
      irA("venta"); // directo a registrar entrega, sin pasar por detalleProspecto
    } else {
      setClienteId(sig.item.id);
      irA("venta");
    }
  };
  const saveStock    = (v) => { setStock(prev => { const next=(typeof v==="function")?v(prev):v; syncData({stock:next}); return next; }); };
  const saveProductos= (v) => {
    setProductos(prev => {
      const next = (typeof v === "function") ? v(prev) : v;
      // Registrar cambio de precio en historial
      const hoy = new Date().toISOString().slice(0,16);
      const histPrecios = JSON.parse(localStorage.getItem("sr_lc_hist_precios")||"[]");
      histPrecios.push({fecha:hoy, productos:next.map(p=>({nombre:p.nombre,precio:p.precio,costo:p.costo}))});
      localStorage.setItem("sr_lc_hist_precios", JSON.stringify(histPrecios.slice(-50)));
      syncData({productos:next});
      return next;
    });
  };
  const saveCargasDia = (v) => { setCargasDia(prev => { const next=(typeof v==="function")?v(prev):v; syncData({cargasDia:next}); return next; }); };
  const saveNoVisitas= (v) => { setNoVisitas(prev => { const next=(typeof v==="function")?v(prev):v; syncData({noVisitas:next}); return next; }); };
  const saveProspectos=(v)=>{ setProspectos(prev => { const next=(typeof v==="function")?v(prev):v; syncData({prospectos:next}); return next; }); };

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
    saveClientes(prev => prev.map(c=>c.id===id?{...c,...cambios}:c));
  };
  const savePlanilla = (dia, datos) => {
    savePlanillasCloud(prev => ({...prev, [dia]: {...datos, _upd:Date.now()}}));
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
    // Pago mixto: guardado como pago="mixto" con montoEfec y montoTrans
    const cobEfectivo=ventasDia.filter(v=>v.pago==="contado"&&!v._esMixtoTrans).reduce((a,v)=>a+(v.pagadoNum||v.neto||0),0)
      + ventasDia.filter(v=>v.pago==="mixto").reduce((a,v)=>a+(Number(v.montoEfec)||0),0);
    const cobFiado=ventasDia.filter(v=>v.pago==="fiado").reduce((a,v)=>a+(v.neto||0),0);
    const cobTransBruto=ventasDia.filter(v=>v.pago==="transferencia"&&!v._esMixtoTrans).reduce((a,v)=>a+(v.pagadoNum||v.neto||0),0)
      + ventasDia.filter(v=>v.pago==="mixto").reduce((a,v)=>a+(Number(v.montoTrans)||0),0);
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
    if(planillaActual.iniciado && huboReparto && !planillaActual._stockCerrado && !localStorage.getItem(camionCerradoKey)) {
      localStorage.setItem(camionCerradoKey, "1");
      // Marca sincronizada en la planilla (viaja por Firebase) — evita que otro dispositivo repita el cierre y duplique el stock
      savePlanilla(planillaKey, {...nueva, _stockCerrado:true});
      const prodMap = {"Bidón 10L":"b10","Bidón 20L":"b20","Sifón 1.5L":"soda","Dispenser":"disp"};
      // Cuánto salió en el camión (según planilla de inicio de reparto)
      const llenos = {
        b10: Number(planillaActual.productos?.b10?.llenos||0),
        b20: Number(planillaActual.productos?.b20?.llenos||0),
        soda: Number(planillaActual.productos?.soda?.llenos||0),
        disp: 0,
      };
      // Cuánto se vendió (cada venta = 1 vacío que vuelve en el intercambio)
      const vendidos = {b10:0,b20:0,soda:0,disp:0};
      ventasDia.forEach(v=>v.detalle.forEach(d=>{const k=prodMap[d.nombre];if(k)vendidos[k]+=d.cantidad;}));
      // Préstamos (sin recibir vacío) y devoluciones de deudas anteriores
      const prestados = {b10:0,b20:0,soda:0,disp:0};
      const devueltos = {b10:0,b20:0,soda:0,disp:0};
      ventasDia.forEach(v=>{
        (v.envPrest||[]).forEach(e=>{const k=prodMap[e.prod];if(k)prestados[k]+=Number(e.cant)||0;});
        (v.envDev||[]).forEach(e=>{const k=prodMap[e.prod];if(k)devueltos[k]+=Number(e.cant)||0;});
      });
      setStock(prev=>{
        const s=JSON.parse(JSON.stringify(normStock(prev)));
        ["b10","b20","soda","disp"].forEach(pk=>{
          const sk=pk==="b10"?"bidon10":pk==="b20"?"bidon20":pk==="disp"?"dispenser":"sifon";
          const sorb=Math.max(0, llenos[pk]-vendidos[pk]-prestados[pk]); // sobrantes llenos en camión
          const vacios=vendidos[pk]+devueltos[pk]; // vacíos que vuelven (vendidos + devoluciones)
          s.soderia[sk]=(s.soderia[sk]||0)+sorb;            // sobrantes llenos → sodería (llenos)
          s.soderia_vacios[sk]=(s.soderia_vacios[sk]||0)+vacios; // vacíos que vuelven → sodería (vacíos)
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

  const registrarVenta = (detalle, pago, montoPagado, saldoAplicado, envPrest, envDev, obs, opcionSaldo, montoTrans2, saldoDeltaMixto, transConfirmadaInicial) => {
    montoTrans2 = Number(montoTrans2)||0; // defensa: el desglose mixto depende de esto
    const c = cliente;
    // Guard anti doble-tap: ignora una llamada idéntica al mismo cliente
    // dentro de 1.5s (botón sin lock + toque duplicado en el celular)
    const firmaReg = JSON.stringify({cid:c.id, detalle, pago, montoPagado, opcionSaldo});
    const ahoraReg = Date.now();
    if(ultimoRegistroRef.current.firma===firmaReg && (ahoraReg-ultimoRegistroRef.current.ts)<1500){
      console.warn("⚠️ Venta duplicada bloqueada (doble tap):", c.nombre);
      return;
    }
    ultimoRegistroRef.current = {firma:firmaReg, ts:ahoraReg};
    // Auto-detectar envases prestados (solo si no es cobro de deuda)
    const envAutoDetect = [];
    if(opcionSaldo!=="cobro_deuda" && opcionSaldo!=="cambio_envase") {
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
      transConfirmada: !!transConfirmadaInicial,
      _upd:Date.now(),
      ...(opcionSaldo==="cambio_envase"?{_esCambio:true,neto:0,bruto:0,costo:0,ganancia:0}:{}),
    };

    saveVentas(prev => [...prev, nuevaVenta]);
    saveClientes(prev => prev.map(c2=>c2.id===c.id?{...c2,saldo:(Number(c2.saldo)||0)+calc.saldoDelta}:c2));
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
    saveClientes(prev => {
      const eliminado = prev.find(c=>c.id===clienteId);
      let nc = prev.filter(c=>c.id!==clienteId);
      if(eliminado) nc = renumerarTrasEliminar(nc, eliminado);
      return nc;
    });
    saveVentas(prev => prev.filter(v=>v.clienteId!==clienteId));
    irA("clientes");
  };

  const eliminarVenta = (ventaId) => {
    // Guard anti doble-tap: ignora un segundo borrado del MISMO id dentro
    // de 2s (el cartel de confirmación puede tardar en cerrarse).
    const ahoraDel = Date.now();
    if(ultimoBorradoRef.current.id===ventaId && (ahoraDel-ultimoBorradoRef.current.ts)<2000){
      console.warn("⚠️ Borrado duplicado bloqueado (doble tap):", ventaId);
      return;
    }
    ultimoBorradoRef.current = {id:ventaId, ts:ahoraDel};
    const v = ventas.find(x=>x.id===ventaId); if(!v) return;
    const eraMixta = (Number(v.montoTrans)||0)>0;
    // Calculamos qué se borra y el ajuste de saldo AHORA MISMO, de forma
    // sincrónica — no depende de cuándo React decida correr el actualizador
    // de saveVentas.
    let ajusteSaldoExtra = 0;
    const idsABorrar = new Set([ventaId]);
    ventas.forEach(x=>{
      const ligada = x._esMixtoTrans && (
        x._mixtoDe===ventaId ||
        (x._mixtoDe===undefined && eraMixta && x.clienteId===v.clienteId && x.fechaKey===v.fechaKey)
      );
      if(ligada){
        idsABorrar.add(x.id);
        if((Number(x.saldoDelta)||0)!==0) ajusteSaldoExtra += Number(x.saldoDelta);
      }
    });
    saveVentas(prev => {
      let nv = prev.filter(x=>!idsABorrar.has(x.id));
      nv = nv.filter(x=>!(x._esMixtoTrans && x._mixtoDe!==undefined && !nv.some(y=>y.id===x._mixtoDe)));
      return nv;
    });
    saveClientes(prev => prev.map(x=>x.id===v.clienteId?{...x,saldo:(Number(x.saldo)||0)-v.saldoDelta-ajusteSaldoExtra}:x));
  };

  const editarVenta = (ventaId, detalle, pago, montoPagado, saldoAplicado, obs, montoTrans2) => {
    // Guard anti doble-tap: ignora una segunda edición IDÉNTICA de la
    // MISMA venta dentro de 2s.
    const firmaEdit = JSON.stringify({ventaId, detalle, pago, montoPagado, saldoAplicado, montoTrans2});
    const ahoraEdit = Date.now();
    if(ultimoEditadoRef.current.firma===firmaEdit && (ahoraEdit-ultimoEditadoRef.current.ts)<2000){
      console.warn("⚠️ Edición duplicada bloqueada (doble tap):", ventaId);
      return;
    }
    ultimoEditadoRef.current = {firma:firmaEdit, ts:ahoraEdit};
    const vV = ventas.find(v=>v.id===ventaId); if(!vV) return;
    const esMixto = pago==="mixto";
    const ef = esMixto?(Number(montoPagado)||0):0;
    const tr = esMixto?(Number(montoTrans2)||0):0;
    // MIXTO (diseño comercial): UNA sola venta con pago "mixto" y desglose; el cálculo usa el total
    const calc = calcVenta(detalle, esMixto?"contado":pago, esMixto?String(ef+tr):montoPagado, saldoAplicado, productos);
    const obsLimpia = (obs||"").replace(/\s*\[Mixto:[^\]]*\]/g,"");
    const obsFinal  = esMixto ? obsLimpia+` [Mixto: ef $${ef} + tr $${tr}]` : obsLimpia;
    // netDeltaCambio: cuánto CAMBIA el saldo por esta edición — es un delta
    // puro, no depende del saldo actual del cliente (seguro de aplicar
    // después sobre el saldo más reciente, en vez del que había al abrir).
    const netDeltaCambio = calc.saldoDelta - vV.saldoDelta;
    // Limpiar restos de versiones viejas que creaban una venta-transferencia aparte
    saveVentas(prev => {
      let nev = prev.filter(v=>!(v._esMixtoTrans && v._mixtoDe===ventaId));
      nev = nev.map(v=>v.id===ventaId?{...vV,detalle,pago:esMixto?"mixto":pago,obs:obsFinal,saldoAplicado:saldoAplicado||0,...calc,montoEfec:esMixto?ef:0,montoTrans:esMixto?tr:0,transConfirmada:esMixto?(vV.transConfirmada||false):vV.transConfirmada,_upd:Date.now()}:v);
      return nev;
    });
    saveClientes(prev => prev.map(x=>x.id===vV.clienteId?{...x,saldo:(Number(x.saldo)||0)+netDeltaCambio}:x));
  };

  window._setDarkModeLC = setDarkMode;
  window._setScaleIdxLC = setScaleIdx;

  const VAPID_PUBLIC_RM = 'BFuTmJkcfVwxPMmCX7T749Mfx4ebmmiyz3ozxEZSA15H3KbvXJQsBgzBA53Z0itfMKJb5ky82OmPA0qrR-ZZUDY';
  function getDeviceIdRM() {
    let id = localStorage.getItem('sr_device_id_push');
    if (!id) { id = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10); localStorage.setItem('sr_device_id_push', id); }
    return id;
  }
  window.activarNotif = async () => {
    if (!window.messagingLC) return false;
    try {
      const sw = await navigator.serviceWorker.ready;
      const token = await window.messagingLC.getToken({ vapidKey: VAPID_PUBLIC_RM, serviceWorkerRegistration: sw });
      if (!window.db || !negocioId) return false;
      const deviceId = getDeviceIdRM();
      // Se guarda ADENTRO del mismo documento "main" que ya usa toda la app
      // (users/{negocio}/datos/main) — ese camino ya tiene permiso de
      // escritura. Una colección nueva (push_subs) las reglas de Firestore
      // todavía no la conocen y la rechazan.
      const ref = window.db.collection('users').doc(negocioId).collection('datos').doc('main');
      await ref.set({ pushSubs: { [deviceId]: { token, ts: Date.now() } } }, { merge: true });
      return true;
    } catch (e) { console.warn('Error al activar notificaciones:', e); return false; }
  };

  return (
    <div style={{position:"relative"}}>
    <div style={{...s.app, zoom: SCALES[scaleIdx]}}>
      <SyncBar status={syncStatus} isOnline={isOnline} />
      {pantalla==="portada"        && <Portada onIngresar={()=>irA("menu")} />}
      {pantalla==="menu"           && <MenuDias dias={DIAS} onDia={d=>{setDiaActual(d);irA("diaPrincipal");}} onResumen={()=>irA("resumen")} onConfig={(tab)=>{setTabConfig(tab||"precios");irA("config");}} onGestionClientes={()=>irA("gestionClientes")} onPromocion={()=>irA("promocion")} onStock={()=>irA("stock")} onAgenda={()=>irA("agenda")} onVolver={()=>irA("portada")} darkMode={darkMode} onToggleDark={()=>setDarkMode(!darkMode)} scaleIdx={scaleIdx} onToggleScale={()=>setScaleIdx(i=>(i+1)%4)} scaleLabel={SCALE_LABELS[scaleIdx]} clientes={clientes} ventas={ventas} stock={stockNorm}
          recordatoriosActivos={recordatoriosActivos}
          onConfirmarRecordatorio={(id)=>saveRecordatorios(prev=>(prev||[]).map(r=>r.id===id?{...r,confirmado:true}:r))}
          onVerConfirmaciones={(dia)=>{if(dia)setDiaActual(dia);irA("confirmacionesDia");}}
          transferenciasPendientes={DIAS.map(dia=>{
            const vts = ventas.filter(v=>v.dia===dia&&v.pago==="transferencia"&&!v.transConfirmada);
            if(!vts.length) return null;
            const fechas = [...new Set(vts.map(v=>v.fechaKey))].sort().reverse();
            return {dia, fecha:fechas[0]||"", count:vts.length, monto:vts.reduce((a,v)=>a+(v.pagadoNum||v.neto||0),0), ventas:vts};
          }).filter(Boolean)} zonasReparto={zonasReparto} onSetZona={(dia,zona)=>{const nz={...zonasReparto,[dia]:zona};setZonasReparto(nz);syncData({zonasReparto:nz});}}
          onDiaHoy={(dia,fechaKey)=>{
            setDiaActual(dia);setFechaActual(fechaKey);setFechaObj(new Date(fechaKey+"T12:00:00"));
            const yaIniciado = planillas[`${dia}_${fechaKey}`]?.iniciado;
            irA(yaIniciado ? "clientes" : "inicioReparto");
          }}
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
          dia={diaActual||"todos los días"}
          ventas={ventas.filter(v=>v.pago==="transferencia"&&(!diaActual||v.dia===diaActual))}
          clientes={clientes}
          onConfirmar={(ventaId)=>{saveVentas(prev=>prev.map(v=>v.id===ventaId?{...v,transConfirmada:!v.transConfirmada,_upd:Date.now()}:v));}}
          onVolver={()=>irA("menu")} />}
      {pantalla==="diaPrincipal"   && <DiaPrincipal dia={diaActual} onIrClientes={()=>irA("selectorFechaClientes")} onIrPlanilla={()=>irA("selectorFechaPlanilla")} onVolver={()=>irA("menu")} onVerConfirmaciones={()=>irA("confirmacionesDia")} ventasPendientesTransfer={ventas.filter(v=>v.dia===diaActual&&v.pago==="transferencia"&&!v.transConfirmada).length} />}
      {pantalla==="selectorFechaPlanilla" && <SelectorFecha dia={diaActual} planillas={planillas} ventas={ventas} noVisitas={noVisitas} onSeleccionar={(fk,fo)=>{setFechaActual(fk);setFechaObj(fo);irA("planilla");}} onVolver={()=>irA("diaPrincipal")} />}
      {pantalla==="planilla"       && <PlanillaDelDia dia={diaActual} fecha={fechaActual} ventas={ventas.filter(v=>v.fechaKey===fechaActual)} clientes={clientes} prospectos={prospectos||[]} planilla={planillas[`${diaActual}_${fechaActual}`]||planillaDiaVacia()} productos={productos} stock={stockNorm} setStock={setStock} syncData={syncData} onGuardar={d=>{savePlanilla(`${diaActual}_${fechaActual}`,d);}} onVolver={()=>irA("menu")} onCerrarDia={(img)=>cerrarDia(fechaActual,diaActual,img)} initCierre={initCierre} noVisitas={noVisitas} cargasDia={cargasDia} />}
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
            // La carga real de hoy queda como sugerencia para la próxima vez que
            // toque este día — así no depende de un número fijo cargado una vez.
            saveCargasDia(prev=>({...prev,[diaActual]:{soda,b10,b20}}));
          }
          irA("clientes");
        }} onVolver={()=>irA("selectorFechaClientes")} />}
      {pantalla==="clientes"       && <ListaClientes clientes={clientes.filter(c=>c.dia===diaActual)} dia={diaActual} fecha={fechaActual} ventas={ventas.filter(v=>v.fechaKey===fechaActual&&v.dia===diaActual)} todasVentas={ventas} noVisitas={(noVisitas||[]).filter(v=>v.dia===diaActual&&v.fecha===fechaActual)} onEditarCliente={(id,cambios)=>{saveClientes(prev=>prev.map(c=>c.id===id?{...c,...cambios}:c));}} onSeleccionar={c=>{setClienteId(c.id);irA("detalleCliente");}} onEntregar={c=>{setClienteId(c.id);irA("venta");}} onNuevoCliente={()=>irA("nuevoCliente")} onVolver={()=>irA("selectorFechaClientes")} onReordenar={lista=>{
          saveClientes(prev => [...prev.filter(c=>c.dia!==diaActual), ...lista]);
        }} onRegistrarNoVisita={(clienteId,motivo)=>{saveNoVisitas(prev=>[...(prev||[]).filter(v=>!(v.clienteId===clienteId&&v.dia===diaActual&&v.fecha===fechaActual)),{clienteId,dia:diaActual,fecha:fechaActual,motivo,_upd:Date.now()}]);}} onQuitarNoVisita={(clienteId)=>{saveNoVisitas(prev=>(prev||[]).filter(v=>!(v.clienteId===clienteId&&v.dia===diaActual&&v.fecha===fechaActual)));}}
        onConfirmarTransfer={(clienteId,ventaId)=>{
          saveVentas(prev => prev.map(v=>v.id===ventaId?{...v,transConfirmada:!v.transConfirmada,_upd:Date.now()}:v));
        }}
        prospectos={(prospectos||[]).filter(p=>p.dia===diaActual&&p.estado==="activo")}
        recordatorios={recordatorios}
        onVentaProspecto={(p)=>{
          saveClientes(prev => prev.find(c=>c.id===p.id) ? prev : [...prev, {...p, saldo:0, _esProspecto:true}]);
          setClienteId(p.id);
          irA("venta");
        }}
        onNoEstaProspecto={(id)=>{
          saveNoVisitas(prev=>[...(prev||[]).filter(v=>!(v.clienteId===id&&v.dia===diaActual&&v.fecha===fechaActual)),{clienteId:id,dia:diaActual,fecha:fechaActual,motivo:"noesta",_upd:Date.now()}]);
        }}
        onNoQuiereProspecto={(id)=>{
          saveNoVisitas(prev=>[...(prev||[]).filter(v=>!(v.clienteId===id&&v.dia===diaActual&&v.fecha===fechaActual)),{clienteId:id,dia:diaActual,fecha:fechaActual,motivo:"noquiso",_upd:Date.now()}]);
        }}
        onVerProspecto={(p)=>{setProspectoId(p.id);irA("detalleProspecto");}}
        onEliminarProspecto={(id)=>{if(window.confirm("¿Eliminar este prospecto?"))saveProspectos(prev=>(prev||[]).filter(x=>x.id!==id));}}
        onAbrirMapa={()=>irA("mapaClientes")}
        onPlanilla={()=>{ setInitCierre(true); irA("planilla"); }}
        />}
      {pantalla==="clientesDormidos" && <ClientesDormidos clientes={clientes} ventas={ventas} onVolver={()=>irA("gestionClientes")} onSeleccionar={c=>{setClienteId(c.id);setDiaActual(c.dia);irA("detalleCliente");}} onEditarCliente={(id,cambios)=>{saveClientes(prev=>prev.map(c=>c.id===id?{...c,...cambios}:c));}} />}
      {pantalla==="detalleCliente" && cliente && <DetalleCliente cliente={cliente} ventas={ventas.filter(v=>v.clienteId===cliente.id)} noVisitas={(noVisitas||[]).filter(v=>v.clienteId===cliente.id)} dia={diaActual} fecha={fechaActual} productos={productos} onVenta={()=>irA("venta")} onVolver={()=>irA("clientes")} onEditar={cambios=>updateCliente(cliente.id,cambios)} onEliminarVenta={eliminarVenta} onEditarVenta={editarVenta} onEliminarCliente={()=>eliminarCliente(cliente.id)}
          onNoEstaCliente={()=>{
            const nv=[...(noVisitas||[]).filter(v=>!(v.clienteId===cliente.id&&v.dia===diaActual&&v.fecha===fechaActual)),{clienteId:cliente.id,dia:diaActual,fecha:fechaActual,motivo:"noesta",_upd:Date.now()}];
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
            const nv=[...(noVisitas||[]).filter(v=>!(v.clienteId===cliente.id&&v.dia===diaActual&&v.fecha===fechaActual)),{clienteId:cliente.id,dia:diaActual,fecha:fechaActual,motivo:"noquiso",_upd:Date.now()}];
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
          onGuardarRecordatorio={(r)=>saveRecordatorios(prev=>[...(prev||[]),r])}
          onConfirmarRecordatorio={(id)=>saveRecordatorios(prev=>(prev||[]).map(r=>r.id===id?{...r,confirmado:true}:r))}
          onCobrarSaldo={(monto,pago)=>{
            const cl=cliente;
            const det=[{nombre:"Cobro de deuda",cantidad:1,precio:0,total:0}];
            const vt={id:Date.now(),clienteId:cl.id,cliente:cl.nombre,dia:diaActual,fechaKey:fechaActual,fecha:new Date().toLocaleString("es-AR"),
              detalle:det,pago,obs:`Cobro de deuda $${monto.toLocaleString("es-AR")} (${pago})`,saldoAplicado:0,
              neto:0,bruto:0,desc:0,costo:0,ganancia:0,pagadoNum:monto,saldoDelta:monto,envPrest:[],envDev:[],
              saldoAntes:cl.saldo||0, saldoDespues:(cl.saldo||0)+monto, _esCobro:true,_upd:Date.now()};
            saveVentas(prev=>[...prev,vt]);
            saveClientes(prev=>prev.map(x=>x.id===cl.id?{...x,saldo:(Number(x.saldo)||0)+monto}:x));
          }}
          onGuardarAjuste={(vt)=>{saveVentas(prev=>[...prev,vt]);}} onGuardarCambio={(vt)=>{saveVentas(prev=>[...prev,vt]);}} />}
      {pantalla==="venta"          && cliente && <NuevaVenta key={clienteId} cliente={cliente} productos={productos} fecha={fechaActual} ventasCliente={ventas.filter(v=>v.clienteId===cliente.id)}
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
          const base=noVisitas||[];
          const anterior=base.find(v=>v.clienteId===clienteId&&v.dia===diaActual&&v.fecha===fechaActual);
          const motivo=anterior?.motivo==="noesta"?"noesta2":"noesta";
          const nv=[...base.filter(v=>!(v.clienteId===clienteId&&v.dia===diaActual&&v.fecha===fechaActual)),{clienteId,dia:diaActual,fecha:fechaActual,motivo,_upd:Date.now()}];
          saveNoVisitas(nv);
          irAlSiguiente(getSiguienteDelDia(nv, clienteId));
        }}
        onNoQuiere={()=>{
          const nv=[...(noVisitas||[]).filter(v=>!(v.clienteId===clienteId&&v.dia===diaActual&&v.fecha===fechaActual)),{clienteId,dia:diaActual,fecha:fechaActual,motivo:"noquiso",_upd:Date.now()}];
          saveNoVisitas(nv);
          irAlSiguiente(getSiguienteDelDia(nv, clienteId));
        }}
        onGuardar={(d,p,m,sa,ep,ed,obs,op,mt2,sd,tc)=>{
          registrarVenta(d,p,m,sa,ep,ed,obs,op,mt2,sd,tc);
          // Usar noVisitas actual (sin cambios) — la venta ya marca al cliente como visitado
          irAlSiguiente(getSiguienteDelDia(noVisitas, clienteId));
        }}
        onSaltar={()=>{
          const nv=[...(noVisitas||[]).filter(v=>!(v.clienteId===clienteId&&v.dia===diaActual&&v.fecha===fechaActual)),{clienteId,dia:diaActual,fecha:fechaActual,motivo:"salteado",_upd:Date.now()}];
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
          saveClientes(prevC => {
            let base=prevC;
            if(orden&&prevC.some(c=>c.dia===datos.dia&&(c.orden||0)===Number(orden))){
              base=prevC.map(c=>c.dia===datos.dia&&(c.orden||0)>=Number(orden)?{...c,orden:(c.orden||0)+1}:c);
            }
            return [...base,{...datos,id:Date.now(),saldo:0,dispenser:datos.dispenser||0}]
              .sort((a,b)=>DIAS.indexOf(a.dia)-DIAS.indexOf(b.dia)||(a.orden||9999)-(b.orden||9999));
          });
          irA("clientes");
        }} onVolver={()=>irA("clientes")} />}
      {pantalla==="promocion"       && <Promocion prospectos={prospectos} clientes={clientes} onSave={saveProspectos} onConvertir={(p)=>{
        const nuevo={...p,id:Date.now(),saldo:0,sifon:0,bidon10:1,bidon20:0};
        saveClientes(prev=>[...prev,nuevo]);
        saveProspectos(prev=>(prev||[]).map(x=>x.id===p.id?{...x,estado:"convertido"}:x));
        irA("promocion");
      }} onVolver={()=>irA("gestionClientes")} />}
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
            saveClientes(prev => prev.find(cc=>cc.id===prospecto.id) ? prev : [...prev,{...prospecto,saldo:0,_esProspecto:true}]);
            setClienteId(prospecto.id);
            irA("venta");
          }}
          onNoEsta={()=>{
            saveNoVisitas(prev=>[...(prev||[]).filter(v=>!(v.clienteId===prospecto.id&&v.dia===diaActual&&v.fecha===fechaActual)),{clienteId:prospecto.id,dia:diaActual,fecha:fechaActual,motivo:"noesta",_upd:Date.now()}]);
          }}
          onNoQuiere={()=>{
            saveNoVisitas(prev=>[...(prev||[]).filter(v=>!(v.clienteId===prospecto.id&&v.dia===diaActual&&v.fecha===fechaActual)),{clienteId:prospecto.id,dia:diaActual,fecha:fechaActual,motivo:"noquiso",_upd:Date.now()}]);
          }}
          onEliminarVenta={(ventaId)=>{
            saveVentas(prev=>prev.filter(x=>x.id!==ventaId));
          }}
          onComodato={()=>{}}
          onConvertir={(p)=>{
            const base=p||prospecto;
            const nuevo={...base,id:Date.now(),saldo:0,_esProspecto:undefined};
            saveClientes(prev=>[...prev.filter(c=>c.id!==prospecto.id),nuevo]);
            saveProspectos(prev=>(prev||[]).map(x=>x.id===base.id?{...x,estado:"convertido"}:x));
            irA("clientes");
          }}
          onEliminar={()=>{
            if(window.confirm("¿Eliminar prospecto?")){
              saveProspectos(prev=>(prev||[]).filter(x=>x.id!==prospecto.id));
              saveClientes(prev=>prev.filter(c=>c.id!==prospecto.id));
              setProspectoId(null);
              irA("clientes");
            }
          }}
          onEditar={(cambios)=>{ saveProspectos(prev=>(prev||[]).map(x=>x.id===prospecto.id?{...x,...cambios}:x)); }}
          onActualizarEnvases={(pid,cambios)=>{ saveProspectos(prev=>(prev||[]).map(x=>x.id===pid?{...x,...cambios}:x)); }}
          onVolver={()=>{setProspectoId(null);irA("clientes");}}
        />;
      })()}
      {pantalla==="gestionClientes" && <GestionClientes clientes={clientes} onReordenarTodo={(lista)=>saveClientes(lista)} onEditar={(id,cambios)=>{saveClientes(prev=>prev.map(c=>c.id===id?{...c,...cambios}:c));}} onEliminar={(id)=>{
        if(window.confirm("¿Eliminar cliente?")){
          saveClientes(prev => {
            const eliminado=prev.find(c=>c.id===id);
            let nc=prev.filter(c=>c.id!==id);
            if(eliminado) nc=renumerarTrasEliminar(nc,eliminado);
            return nc;
          });
        }}} onNuevo={(datos)=>{
        const orden = datos.orden;
        saveClientes(prevC => {
          let nuevos;
          if(orden&&prevC.some(c=>c.dia===datos.dia&&c.orden===orden)){
            nuevos = prevC.map(c=>c.dia===datos.dia&&(c.orden||0)>=orden?{...c,orden:(c.orden||0)+1}:c);
          } else { nuevos = [...prevC]; }
          return [...nuevos,{...datos,id:Date.now(),saldo:0,dispenser:datos.dispenser||0}].sort((a,b)=>DIAS.indexOf(a.dia)-DIAS.indexOf(b.dia)||(a.orden||9999)-(b.orden||9999));
        });
      }} onVolver={()=>irA("menu")} onRegistrarVenta={(c)=>{
          setClienteId(c.id);
          const hoyKey = new Date().toLocaleDateString("en-CA");
          setFechaActual(hoyKey); setFechaObj(new Date(hoyKey+"T12:00:00"));
          if(!diaActual) setDiaActual(c.dia);
          irA("venta");
        }} onVerDetalle={(c)=>{setClienteId(c.id);irA("detalleDesdeGestion");}}
        onHistorial={undefined}
        onBackup={undefined}
        ventas={ventas}
        prospectos={prospectos||[]}
        recordatorios={recordatorios||[]}
        onConfirmarRecordatorio={(id)=>saveRecordatorios(prev=>(prev||[]).map(r=>r.id===id?{...r,confirmado:true}:r))}
        onImportar={(nuevosClientes, nuevosProspectos)=>{
          if(nuevosClientes.length){
            saveClientes(prev => {
              const merged = [...prev];
              nuevosClientes.forEach(nc=>{
                const idx = merged.findIndex(c=>c.nombre.toLowerCase()===nc.nombre.toLowerCase());
                if(idx>=0){ merged[idx]={...merged[idx],...nc,id:merged[idx].id}; }
                else{ merged.push(nc); }
              });
              return merged;
            });
          }
          if(nuevosProspectos.length){
            saveProspectos(prev => {
              const mergedP = [...(prev||[])];
              nuevosProspectos.forEach(np=>{
                const idx = mergedP.findIndex(p=>p.nombre.toLowerCase()===np.nombre.toLowerCase());
                if(idx>=0) mergedP[idx]={...mergedP[idx],...np,id:mergedP[idx].id};
                else mergedP.push(np);
              });
              return mergedP;
            });
          }
        }} onIr={irA} productos={productos} onGuardarCambio={(vt)=>{saveVentas(prev=>[...prev,vt]);}} />}
      {pantalla==="mapaClientes" && <MapaClientes
        clientes={clientes}
        dia={diaActual}
        fecha={fechaActual}
        ventas={ventas}
        noVisitas={noVisitas}
        onSeleccionar={(c)=>{setClienteId(c.id);setDiaActual(c.dia);const hoy=new Date().toLocaleDateString("en-CA");setFechaActual(hoy);setFechaObj(new Date(hoy+"T12:00:00"));irA("detalleDesdeGestion");}}
        onActualizar={(nuevosClientes)=>saveClientes(nuevosClientes)}
        onVolver={()=>irA("menu")}
      />}
      {pantalla==="detalleDesdeGestion" && cliente && <DetalleCliente cliente={cliente} ventas={ventas.filter(v=>v.clienteId===cliente.id)} noVisitas={(noVisitas||[]).filter(v=>v.clienteId===cliente.id)} dia={diaActual||cliente.dia} fecha={fechaActual} productos={productos} onVenta={()=>{setDiaActual(cliente.dia);const hoy=new Date().toLocaleDateString("en-CA");setFechaActual(hoy);setFechaObj(new Date(hoy+"T12:00:00"));irA("venta");}} onVolver={()=>irA("gestionClientes")} onEditar={cambios=>updateCliente(cliente.id,cambios)} onEliminarVenta={eliminarVenta} onEditarVenta={editarVenta} onEliminarCliente={()=>{eliminarCliente(cliente.id);irA("gestionClientes");}}
          onNoEstaCliente={()=>{}} onNoQuiereCliente={()=>{}}
          recordatorios={recordatorios} onGuardarRecordatorio={(r)=>saveRecordatorios(prev=>[...(prev||[]),r])} onConfirmarRecordatorio={(id)=>saveRecordatorios(prev=>(prev||[]).map(r=>r.id===id?{...r,confirmado:true}:r))}
          onCobrarSaldo={(monto,pago)=>{
            if(cliente){
              const det=[{nombre:"Cobro de deuda",cantidad:1,precio:0,total:0}];
              const fk=fechaActual||new Date().toLocaleDateString("en-CA");
              const vt={id:Date.now(),clienteId:cliente.id,cliente:cliente.nombre,
                dia:diaActual||cliente.dia,fechaKey:fk,fecha:new Date().toLocaleString("es-AR"),
                detalle:det,pago,obs:`Cobro de deuda $${monto.toLocaleString("es-AR")} (${pago})`,saldoAplicado:0,
                neto:0,bruto:0,desc:0,costo:0,ganancia:0,pagadoNum:monto,saldoDelta:monto,envPrest:[],envDev:[],
                saldoAntes:cliente.saldo||0, saldoDespues:(cliente.saldo||0)+monto, _esCobro:true,_upd:Date.now()};
              saveVentas(prev=>[...prev,vt]);
              saveClientes(prev=>prev.map(x=>x.id===cliente.id?{...x,saldo:(Number(x.saldo)||0)+monto}:x));
            }
          }}
          onGuardarCambio={(vt)=>{saveVentas(prev=>[...prev,vt]);}} />}
      {pantalla==="agenda" && <AgendaScreen
        recordatorios={recordatorios||[]}
        clientes={clientes}
        onConfirmar={(id)=>saveRecordatorios(prev=>(prev||[]).map(r=>r.id===id?{...r,confirmado:true}:r))}
        onEliminar={(id)=>saveRecordatorios(prev=>(prev||[]).filter(r=>r.id!==id))}
        onNuevo={(datos)=>{
          const c=clientes.find(x=>x.id===datos.clienteId);
          if(!c){alert("Seleccioná un cliente");return;}
          saveRecordatorios(prev=>[...(prev||[]),{...datos,id:Date.now(),clienteId:c.id,clienteNombre:c.nombre,dia:c.dia,confirmado:false}]);
        }}
        onIrCliente={(clienteId)=>{
          const c=clientes.find(x=>x.id===clienteId);
          if(c){setClienteId(clienteId);setDiaActual(c.dia);irA("detalleCliente");}
        }}
        onVolver={()=>irA("menu")}
      />}
      {pantalla==="fiadosPendientes" && <FiadosPendientes clientes={clientes} ventas={ventas} onEditarCliente={(id,cambios)=>{saveClientes(prev=>prev.map(c=>c.id===id?{...c,...cambios}:c));}} onVolver={()=>irA("menu")} onCobrar={(clienteId,monto,pago)=>{
          const c=clientes.find(x=>x.id===clienteId); if(!c) return;
          const fk=fechaActual||new Date().toLocaleDateString("en-CA");
          const vt={id:Date.now(),clienteId:c.id,cliente:c.nombre,dia:c.dia,fechaKey:fk,fecha:new Date().toLocaleString("es-AR"),
            detalle:[{nombre:"Cobro de deuda",cantidad:1,precio:0,total:0}],pago,obs:`Cobro de deuda $${monto.toLocaleString("es-AR")} (${pago})`,saldoAplicado:0,
            neto:0,bruto:0,desc:0,costo:0,ganancia:0,pagadoNum:monto,saldoDelta:monto,envPrest:[],envDev:[],saldoAntes:c.saldo||0,saldoDespues:(c.saldo||0)+monto,_esCobro:true,_upd:Date.now()};
          saveVentas(prev=>[...prev,vt]);
          saveClientes(prev=>prev.map(x=>x.id===c.id?{...x,saldo:(Number(x.saldo)||0)+monto}:x));
        }} />}
      {pantalla==="stock"          && <StockGeneral stock={stockNorm} setStock={(ns)=>{setStock(ns);syncData({stock:ns});}} clientes={clientes} setClientes={saveClientes} ventas={ventas} productos={productos} setProductos={saveProductos} cargasDia={cargasDia} setCargasDia={saveCargasDia} planillas={planillas} onVolver={()=>irA("menu")} onResumen={()=>irA("resumen")} />}
      {pantalla==="resumen"        && <Resumen ventas={ventas} clientes={clientes} productos={productos} planillas={planillas} noVisitas={noVisitas||[]} onVolver={()=>irA("menu")} />}
      {pantalla==="config"         && <Config productos={productos} setProductos={saveProductos} clientes={clientes} setClientes={saveClientes} ventas={ventas} setVentas={saveVentas} planillas={planillas} setPlanillas={savePlanillasCloud} stock={stockNorm} setStock={(s)=>{const ns=normStock(s);setStockRaw(ns);syncData({stock:ns});}} cargasDia={cargasDia} setCargasDia={saveCargasDia} syncData={syncData} onVolver={()=>irA("menu")} ecToken={ecToken} setEcToken={setEcToken} tabInicial={tabConfig} />}
    </div>
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

