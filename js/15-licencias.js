// ════════════════════════════════════════════════════════════════════
// ◆  15-licencias.js — Sistema de Licencias Multi · AppConLicenciaMulti · render
// ════════════════════════════════════════════════════════════════════

// ============ SISTEMA DE LICENCIAS MULTI ============
function PantallaActivacionMulti({onActivado}) {
  const [codigo, setCodigo] = React.useState(localStorage.getItem("sm_codigo")||"");
  const [paso, setPaso] = React.useState(localStorage.getItem("sm_codigo") ? "datos" : "codigo");
  const [nombre, setNombre] = React.useState("");
  const [celular, setCelular] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [pin, setPin] = React.useState("");
  const [terminos, setTerminos] = React.useState(false);
  const [error, setError] = React.useState("");
  const [cargando, setCargando] = React.useState(false);

  async function verificarCodigo() {
    if(!codigo.trim()) { setError("Ingresá el código de activación"); return; }
    setCargando(true); setError("");
    // Verificar licencia en Firebase
    try {
      const doc = await window.dbLicencias.collection("licencias").doc(codigo.trim().toUpperCase()).get();
      if(!doc.exists) { setError("Código inválido. Verificá que esté bien escrito."); setCargando(false); return; }
      const data = doc.data();
      if(data.estado === "inactivo") { setError("Esta licencia está desactivada. Contactá a Emma Soluciones."); setCargando(false); return; }
      if(data.deviceId && data.deviceId !== getDeviceIdMulti()) { setError("Este código ya fue usado en otro dispositivo."); setCargando(false); return; }
      if(data.estado === "usado" && data.deviceId === getDeviceIdMulti()) {
        // Ya activado en este dispositivo, pedir PIN
        localStorage.setItem("sm_codigo", codigo.trim().toUpperCase());
        localStorage.setItem("sm_pin", String(data.pin));
        localStorage.setItem("sr_licencia", JSON.stringify({
          email: data.email||"", negocio: data.negocio||"",
          nombre: data.negocio||"", celular: data.celular||""
        }));
        onActivado(data.pin);
        return;
      }
      localStorage.setItem("sm_codigo", codigo.trim().toUpperCase());
      setPaso("datos");
    } catch(e) { setError("Error de conexión. Verificá tu internet."); }
    setCargando(false);
  }

  async function activarApp() {
    if(!nombre||!celular||!email||!pin) { setError("Completá todos los campos"); return; }
    if(!terminos) { setError("Debés aceptar los Términos y Condiciones para continuar"); return; }
    setCargando(true); setError("");
    try {
      const cod = codigo.trim().toUpperCase();
      const snap = await window.dbLicencias.collection("licencias").doc(cod).get();
      const lic = snap.data();
      if(lic.email&&lic.email.trim().toLowerCase()!==email.trim().toLowerCase()){setError("El email no coincide con el registrado. Contactá al administrador.");setCargando(false);return;}
      if(lic.celular&&lic.celular.trim()!==celular.trim()){setError("El celular no coincide con el registrado. Contactá al administrador.");setCargando(false);return;}
      await window.dbLicencias.collection("licencias").doc(cod).update({
        negocio: nombre, celular, email,
        deviceId: getDeviceIdMulti(),
        estado: "usado",
        aceptoTerminos: true, fechaAceptoTerminos: new Date().toISOString(),
        activadoEn: new Date().toISOString()
      });
      localStorage.setItem("sm_codigo", cod);
      localStorage.setItem("sm_pin", pin);
      localStorage.setItem("sr_licencia", JSON.stringify({
        email: email.trim(),
        negocio: nombre.trim(),
        nombre: nombre.trim(),
        celular: celular.trim(),
        codigo: cod
      }));
      onActivado(Number(pin));
    } catch(e) { setError("Error al activar. Intentá de nuevo."); }
    setCargando(false);
  }

  const s = {
    wrap:{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--color-background-primary,#0f1923)",padding:20},
    card:{background:"var(--color-background-secondary,#1a2535)",borderRadius:20,padding:32,width:"100%",maxWidth:380,textAlign:"center"},
    ico:{fontSize:48,marginBottom:12},
    h1:{fontSize:20,fontWeight:800,color:"var(--color-text-primary,#e2eaf4)",marginBottom:6},
    sub:{fontSize:14,color:"var(--color-text-secondary,#7a8a9a)",marginBottom:24},
    inp:{width:"100%",padding:"12px 16px",borderRadius:10,border:"1.5px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.05)",color:"var(--color-text-primary,#e2eaf4)",fontSize:15,outline:"none",marginBottom:10,boxSizing:"border-box"},
    btn:{width:"100%",padding:14,borderRadius:50,border:"none",background:"#7c3aed",color:"white",fontSize:16,fontWeight:700,cursor:"pointer",marginTop:6},
    err:{color:"#f87171",fontSize:13,marginTop:8}
  };

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.ico}>🚚</div>
        <div style={s.h1}>Sistema de Reparto</div>
        <div style={s.sub}>{paso==="codigo" ? "Primera vez aquí. Ingresá el código de activación que recibiste." : "Completá tus datos para activar la app."}</div>
        {paso === "codigo" ? <>
          <input style={s.inp} placeholder="Código de activación" value={codigo} onChange={e=>setCodigo(e.target.value.toUpperCase())} />
          <button style={s.btn} onClick={verificarCodigo} disabled={cargando}>{cargando?"Verificando...":"Continuar →"}</button>
        </> : <>
          <input style={s.inp} placeholder="Nombre del negocio *" value={nombre} onChange={e=>setNombre(e.target.value)} />
          <input style={s.inp} placeholder="Número de celular *" value={celular} onChange={e=>setCelular(e.target.value)} type="tel" />
          <input style={s.inp} placeholder="Email *" value={email} onChange={e=>setEmail(e.target.value)} type="email" />
          <input style={s.inp} placeholder="PIN de acceso (lo recibiste con el código) *" value={pin} onChange={e=>setPin(e.target.value)} type="number" />
          <label style={{display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer",marginTop:4}}>
            <input type="checkbox" checked={terminos} onChange={e=>setTerminos(e.target.checked)}
              style={{marginTop:3,width:18,height:18,flexShrink:0}} />
            <span style={{fontSize:13,color:"rgba(255,255,255,0.6)",lineHeight:1.5}}>
              Acepto los <span style={{color:"#7c3aed",fontWeight:600}}>Términos y Condiciones</span> del servicio.
              La aplicación se contrata en modalidad mensual. El acceso se suspende si el pago no se realiza antes del día 11 de cada mes.
            </span>
          </label>
        </>}
        {error && <div style={s.err}>{error}</div>}
        {paso === "datos" && <button style={s.btn} onClick={activarApp} disabled={cargando}>{cargando?"Activando...":"Activar app →"}</button>}
        <p style={{fontSize:11,color:"#4a5568",marginTop:16}}>Emma Soluciones Digitales · 3813399962</p>
      </div>
    </div>
  );
}

function PantallaPINMulti({pinCorrecto, onOk}) {
  const [pin, setPin] = React.useState("");
  const [intentos, setIntentos] = React.useState(0);
  const [mostrarReset, setMostrarReset] = React.useState(false);

  function verificar(d) {
    const nuevo = pin + d;
    setPin(nuevo);
    if(nuevo.length === 4) {
      if(Number(nuevo) === Number(pinCorrecto)) { onOk(); }
      else {
        const nv = intentos + 1;
        setIntentos(nv);
        setPin("");
        if(nv >= 2) setMostrarReset(true);
      }
    }
  }

  function resetearApp() {
    if(window.confirm("¿Querés reingresar tu código de activación para recuperar el PIN?")) {
      localStorage.removeItem("sm_pin");
      localStorage.removeItem("sm_codigo");
      location.reload();
    }
  }
  const s = {
    wrap:{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--color-background-primary,#0f1923)",flexDirection:"column",gap:16},
    h1:{fontSize:20,fontWeight:700,color:"var(--color-text-primary,#e2eaf4)"},
    sub:{fontSize:14,color:"var(--color-text-secondary,#7a8a9a)"},
    dots:{display:"flex",gap:14,margin:"12px 0"},
    dot:{width:14,height:14,borderRadius:"50%",border:"2px solid #7c3aed"},
    dotFill:{width:14,height:14,borderRadius:"50%",background:"#7c3aed"},
    grid:{display:"grid",gridTemplateColumns:"repeat(3,72px)",gap:10},
    key:{width:72,height:72,borderRadius:16,border:"1.5px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.05)",color:"var(--color-text-primary,#e2eaf4)",fontSize:24,fontWeight:700,cursor:"pointer"},
    err:{color:"#f87171",fontSize:13}
  };
  return (
    <div style={s.wrap}>
      <div style={s.h1}>Sistema de Reparto</div>
      <div style={s.sub}>Ingresá tu PIN de acceso</div>
      <div style={s.dots}>{[0,1,2,3].map(i=><div key={i} style={pin.length>i?s.dotFill:s.dot}/>)}</div>
      {intentos > 0 && <div style={s.err}>PIN incorrecto ({intentos} intento{intentos!==1?"s":""} fallido{intentos!==1?"s":""})</div>}
      <div style={s.grid}>
        {[1,2,3,4,5,6,7,8,9].map(d=><button key={d} style={s.key} onClick={()=>verificar(String(d))}>{d}</button>)}
        <div/><button style={s.key} onClick={()=>verificar("0")}>0</button>
        <button style={{...s.key,fontSize:18}} onClick={()=>setPin(p=>p.slice(0,-1))}>⌫</button>
      </div>
      {mostrarReset&&(
        <button onClick={resetearApp} style={{marginTop:16,background:"none",border:"none",color:"#5daaff",fontSize:13,cursor:"pointer",textDecoration:"underline"}}>
          ¿Olvidaste tu PIN? Reingresar código →
        </button>
      )}
    </div>
  );
}

function getDeviceIdMulti() {
  let id = localStorage.getItem("sm_device_id");
  if(!id) { id = "dev_"+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2); localStorage.setItem("sm_device_id", id); }
  return id;
}


function AppConLicenciaMulti() {
  const [acceso, setAcceso] = React.useState(()=>{
    const lic = localStorage.getItem("sm_codigo");
    const pin = localStorage.getItem("sm_pin");
    if(!lic) return "activacion";
    if(!pin) return "activacion";
    return "pin";
  });
  const [pinActual, setPinActual] = React.useState(()=>localStorage.getItem("sm_pin"));

  if(acceso === "activacion") return (
    <PantallaActivacionMulti onActivado={(pin)=>{ setPinActual(pin); setAcceso("pin"); }} />
  );
  if(acceso === "pin") return <PantallaPINMulti pinCorrecto={pinActual} onOk={()=>setAcceso("app")}/>;
  return <ErrorBoundary><App/></ErrorBoundary>;
}
// ============ FIN SISTEMA DE LICENCIAS ============

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<AppConLicenciaMulti />);

// ════════════════════════════════════════════════════════════════════
// ◆  usarInformes — Envío de resúmenes por email via Brevo
// ════════════════════════════════════════════════════════════════════
function usarInformes({ventas, clientes, planillas, noVisitas, productos}) {

  const getLic = () => { try{ return JSON.parse(localStorage.getItem("sr_licencia")||"{}"); }catch{ return {}; } };
  const fmtPesos = (n) => "$" + Math.round(Number(n)||0).toLocaleString("es-AR");

  const enviarDiario = async (fecha, dia) => {
    const lic = getLic();
    if(!lic.email || !window.enviarEmailBrevoRM) return false;
    try {
      const ventasDia = (ventas||[]).filter(v=>v.fechaKey===fecha&&v.dia===dia&&!v._esCobro&&!v._esAjuste);
      const totalNeto      = ventasDia.reduce((a,v)=>a+(v.neto||0),0);
      const totalEfectivo  = ventasDia.filter(v=>v.pago==="contado").reduce((a,v)=>a+(v.pagadoNum||v.neto||0),0);
      const totalTransfer  = ventasDia.filter(v=>v.pago==="transferencia").reduce((a,v)=>a+(v.pagadoNum||v.neto||0),0);
      const totalFiado     = ventasDia.filter(v=>v.pago==="fiado").reduce((a,v)=>a+(v.neto||0),0);
      const noVisitasDia   = (noVisitas||[]).filter(v=>v.fecha===fecha);
      const htmlContent = `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:20px">
          <h2 style="color:#185FA5;margin-bottom:4px">📋 Cierre del día · ${dia} ${fecha}</h2>
          <p style="color:#666;font-size:13px;margin-bottom:20px">${lic.negocio||lic.nombre||"Sistema de Reparto"}</p>
          <div style="background:#f0f7ff;border-radius:10px;padding:16px;margin-bottom:16px">
            <div style="font-size:28px;font-weight:700;color:#185FA5">${fmtPesos(totalNeto)}</div>
            <div style="color:#666;font-size:13px">Total del día (${ventasDia.length} entregas)</div>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px 0;color:#555">💵 Efectivo</td><td style="text-align:right;font-weight:600">${fmtPesos(totalEfectivo)}</td></tr>
            <tr><td style="padding:8px 0;color:#555">📱 Transferencia</td><td style="text-align:right;font-weight:600">${fmtPesos(totalTransfer)}</td></tr>
            <tr><td style="padding:8px 0;color:#555">📒 Fiado</td><td style="text-align:right;font-weight:600">${fmtPesos(totalFiado)}</td></tr>
            <tr><td style="padding:8px 0;color:#555">🚫 No visitados</td><td style="text-align:right;font-weight:600">${noVisitasDia.length}</td></tr>
          </table>
          <p style="color:#999;font-size:11px;margin-top:20px;text-align:center">Sistema de Reparto · Emma Soluciones Digitales</p>
        </div>`;
      await window.enviarEmailBrevoRM({
        to: lic.email, toName: lic.negocio||lic.nombre||"",
        subject: `📋 Cierre ${dia} ${fecha} · ${fmtPesos(totalNeto)}`,
        htmlContent
      });
      return true;
    } catch(e) { console.error("enviarDiario:", e); return false; }
  };

  const enviarSemanal = async (fecha) => {
    const lic = getLic();
    if(!lic.email || !window.enviarEmailBrevoRM) return false;
    try {
      const d = new Date(fecha+"T12:00:00");
      const lunesPasado = new Date(d); lunesPasado.setDate(d.getDate()-6);
      const desde = lunesPasado.toISOString().slice(0,10);
      const ventasSem = (ventas||[]).filter(v=>v.fechaKey>=desde&&v.fechaKey<=fecha&&!v._esCobro&&!v._esAjuste);
      const totalSem = ventasSem.reduce((a,v)=>a+(v.neto||0),0);
      const htmlContent = `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:20px">
          <h2 style="color:#185FA5">📊 Resumen semanal</h2>
          <p style="color:#666;font-size:13px">${lic.negocio||""} · ${desde} al ${fecha}</p>
          <div style="background:#f0f7ff;border-radius:10px;padding:16px;margin:16px 0">
            <div style="font-size:28px;font-weight:700;color:#185FA5">${fmtPesos(totalSem)}</div>
            <div style="color:#666;font-size:13px">${ventasSem.length} entregas en la semana</div>
          </div>
          <p style="color:#999;font-size:11px;text-align:center">Sistema de Reparto · Emma Soluciones Digitales</p>
        </div>`;
      await window.enviarEmailBrevoRM({
        to: lic.email, toName: lic.negocio||lic.nombre||"",
        subject: `📊 Semana ${desde} al ${fecha} · ${fmtPesos(totalSem)}`,
        htmlContent
      });
      return true;
    } catch(e) { console.error("enviarSemanal:", e); return false; }
  };

  const enviarMensual = async (mes, anio) => {
    const lic = getLic();
    if(!lic.email || !window.enviarEmailBrevoRM) return false;
    try {
      const ventasMes = (ventas||[]).filter(v=>{
        const d=new Date((v.fechaKey||"")+"T12:00:00");
        return d.getMonth()+1===mes && d.getFullYear()===anio && !v._esCobro && !v._esAjuste;
      });
      const totalMes = ventasMes.reduce((a,v)=>a+(v.neto||0),0);
      const meses=["","Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
      const htmlContent = `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:20px">
          <h2 style="color:#185FA5">📅 Resumen mensual · ${meses[mes]} ${anio}</h2>
          <p style="color:#666;font-size:13px">${lic.negocio||""}</p>
          <div style="background:#f0f7ff;border-radius:10px;padding:16px;margin:16px 0">
            <div style="font-size:28px;font-weight:700;color:#185FA5">${fmtPesos(totalMes)}</div>
            <div style="color:#666;font-size:13px">${ventasMes.length} entregas en el mes</div>
          </div>
          <p style="color:#999;font-size:11px;text-align:center">Sistema de Reparto · Emma Soluciones Digitales</p>
        </div>`;
      await window.enviarEmailBrevoRM({
        to: lic.email, toName: lic.negocio||lic.nombre||"",
        subject: `📅 ${meses[mes]} ${anio} · ${fmtPesos(totalMes)}`,
        htmlContent
      });
      return true;
    } catch(e) { console.error("enviarMensual:", e); return false; }
  };

  return { enviarDiario, enviarSemanal, enviarMensual };
}
