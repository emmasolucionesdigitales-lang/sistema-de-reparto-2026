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
