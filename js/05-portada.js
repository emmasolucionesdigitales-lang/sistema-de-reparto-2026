// ════════════════════════════════════════════════════════════════════
// ◆  05-portada.js — Portada · fechas · SelectorFecha · SetupScreen · SyncBar · SetupNube
// ════════════════════════════════════════════════════════════════════

function Portada({onIngresar}) {
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20,padding:32,minHeight:"100vh"}}>
      <div style={{width:80,height:80,borderRadius:"50%",background:"var(--color-background-info)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:38}}>💧</div>
      <div style={{textAlign:"center"}}>
        <h1 style={{fontSize:24,fontWeight:500,color:"var(--color-text-primary)",marginBottom:6}}>Sistema de Reparto</h1>
        <p style={{fontSize:15,color:"var(--color-text-secondary)"}}>Soda y Agua Tratada · Reparto</p>
      </div>
      <button style={{...s.btnPrimary,width:200,marginTop:8}} onClick={onIngresar}>Ingresar</button>
      {typeof window!=="undefined"&&window.matchMedia&&!window.matchMedia("(display-mode: standalone)").matches&&(
        <div style={{fontSize:12,color:"var(--color-text-tertiary)",textAlign:"center",lineHeight:1.6,marginTop:4,maxWidth:240}}>
          💡 Instalá la app: menú del navegador → "Agregar a pantalla de inicio"
        </div>
      )}
    </div>
  );
}

// ── Generador de fechas por día de semana ────────────────────────────────────
function getFechasDelAnio(diaNombre) {
  const diasSemana = {"Lunes":1,"Martes":2,"Miércoles":3,"Jueves":4,"Viernes":5,"Sábado":6,"Domingo":0};
  const target = diasSemana[diaNombre];
  if(target===undefined) return [];
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const fechas = [];
  const d = new Date(anio,0,1);
  while(d.getDay()!==target) d.setDate(d.getDate()+1);
  while(d.getFullYear()===anio) {
    fechas.push(new Date(d));
    d.setDate(d.getDate()+7);
  }
  return fechas;
}

function formatFecha(d) {
  return d.toLocaleDateString("es-AR",{weekday:"short",day:"numeric",month:"short"});
}

function fechaKey(d) {
  return d.toISOString().slice(0,10);
}

function hoyKey() { return new Date().toISOString().slice(0,10); }

function SelectorFecha({dia,planillas,ventas,noVisitas,onSeleccionar,onVolver}) {
  const fechas = getFechasDelAnio(dia);
  const hoy = hoyKey();
  const [mostrarTodas,setMostrarTodas] = useState(false);

  // Agrupar por mes
  const porMes = {};
  fechas.forEach(f=>{
    const mes = f.toLocaleDateString("es-AR",{month:"long",year:"numeric"});
    if(!porMes[mes]) porMes[mes]=[];
    porMes[mes].push(f);
  });

  const meses = Object.keys(porMes);
  const mesActual = new Date().toLocaleDateString("es-AR",{month:"long",year:"numeric"});
  const [mesAbierto,setMesAbierto] = useState(mesActual);

  const ventasPorFecha = {};
  ventas.filter(v=>v.dia===dia).forEach(v=>{
    const fk = v.fechaKey || v.fecha?.slice(0,10) || "";
    ventasPorFecha[fk] = (ventasPorFecha[fk]||0) + 1;
  });

  const visitasPorFecha = {};
  (noVisitas||[]).filter(v=>v.dia===dia).forEach(v=>{
    visitasPorFecha[v.fecha] = (visitasPorFecha[v.fecha]||0) + 1;
  });

  return (
    <div style={s.screen}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={onVolver}>← Volver</button>
        <span style={s.headerTitle}>Fechas de visita · {dia}</span>
      </div>
      <div style={{padding:"8px 16px"}}>
        <p style={{fontSize:13,color:"var(--color-text-secondary)",marginBottom:8}}>Seleccioná la fecha de reparto para comenzar o continuar la jornada.</p>
        {meses.map(mes=>{
          const abierto = mes===mesAbierto;
          return (
            <div key={mes} style={{marginBottom:8}}>
              <button style={{...s.card,margin:0,width:"100%",textAlign:"left",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:abierto?"var(--color-background-info)":"var(--color-background-secondary)"}}
                onClick={()=>setMesAbierto(abierto?null:mes)}>
                <span style={{fontSize:14,fontWeight:500,color:abierto?"var(--color-text-info)":"var(--color-text-primary)",textTransform:"capitalize"}}>{mes}</span>
                <span style={{color:"var(--color-text-tertiary)"}}>{abierto?"▲":"▼"}</span>
              </button>
              {abierto&&(
                <div style={{border:"0.5px solid var(--color-border-tertiary)",borderTop:"none",borderRadius:"0 0 12px 12px",overflow:"hidden"}}>
                  {porMes[mes].map(f=>{
                    const fk = fechaKey(f);
                    const planKey = `${dia}_${fk}`;
                    const tienePlanilla = !!planillas[planKey];
                    const nVentas = ventasPorFecha[fk]||0;
                    const nVisitas = visitasPorFecha[fk]||0;
                    const esHoy = fk===hoy;
                    return (
                      <button key={fk} style={{width:"100%",textAlign:"left",padding:"12px 16px",cursor:"pointer",border:"none",borderBottom:"0.5px solid var(--color-border-tertiary)",background:esHoy?"var(--color-background-success)":"var(--color-background-primary)",display:"flex",justifyContent:"space-between",alignItems:"center"}}
                        onClick={()=>onSeleccionar(fk,f)}>
                        <div>
                          <span style={{fontSize:14,fontWeight:esHoy?500:400,color:esHoy?"var(--color-text-success)":"var(--color-text-primary)",textTransform:"capitalize"}}>
                            {formatFecha(f)}{esHoy?" · Hoy":""}
                          </span>
                          <div style={{display:"flex",gap:6,marginTop:4}}>
                            {nVentas>0&&<span style={s.badge("success")}>{nVentas} entregas</span>}
                            {nVisitas>0&&<span style={s.badge("warning")}>{nVisitas} visitas s/venta</span>}
                            {tienePlanilla&&<span style={s.badge("info")}>planilla ✓</span>}
                          </div>
                        </div>
                        <span style={{color:"var(--color-text-tertiary)"}}>→</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        {/* Fecha especial al final */}
        <div style={{...s.card,margin:"12px 0 0",background:"var(--color-background-tertiary)"}}>
          <label style={s.label}>📅 Fecha especial (feriado o reparto extra)</label>
          <input type="date" style={{...s.input,fontSize:14,marginTop:4}}
            onChange={e=>{
              if(e.target.value){
                const d=new Date(e.target.value+'T12:00:00');
                onSeleccionar(e.target.value,d);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

function SetupScreen({onSetup}) {
  React.useEffect(()=>{ onSetup("firebase","firebase"); },[]);
  return <div style={{padding:40,textAlign:"center",color:"var(--color-text-secondary)"}}>Conectando con Firebase...</div>;
}

function SyncBar({status, isOnline}) {
  if(status==="idle") {
    if(!isOnline) return (
      <div style={{background:"#3d2e1e",color:"#f59e0b",textAlign:"center",fontSize:11,padding:"4px",fontWeight:500}}>
        📵 Sin conexión · Los cambios se sincronizan al reconectar
      </div>
    );
    return null;
  }
  if(status==="saved") return (
    <div style={{background:"var(--color-background-success)",color:"var(--color-text-success)",textAlign:"center",fontSize:12,padding:"5px",fontWeight:500}}>
      ✓ Guardado
    </div>
  );
  const cfg = {
    loading:        {bg:"#1e3a5f",                         color:"#5daaff",    txt:"⏳ Cargando datos de la nube..."},
    saving:         {bg:"var(--color-background-warning)",  color:"var(--color-text-warning)", txt:"☁ Guardando..."},
    error:          {bg:"var(--color-background-danger)",   color:"var(--color-text-danger)",  txt:"⚠ Error al guardar en la nube"},
    offline:        {bg:"#3d2e1e", color:"#f59e0b", txt:"📵 Sin conexión — los cambios se guardan localmente"},
    offline_pending:{bg:"#3d2e1e", color:"#f59e0b", txt:"📵 Sin conexión — cambios pendientes de sincronizar"},
  };
  const c = cfg[status]||cfg.saving;
  return (
    <div style={{background:c.bg,color:c.color,textAlign:"center",fontSize:12,padding:"6px",fontWeight:500}}>
      {c.txt}
    </div>
  );
}

function SetupNube({onSetup}) {
  const [paso, setPaso] = useState(1);
  // No API config needed with Firebase
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const conectar = async () => {
    if (!apiKey.trim()) { setError("Pegá tu API Key primero"); return; }
    setCargando(true); setError("");
    try {
      const binId = await cloudCreate(apiKey.trim());
      localStorage.setItem("cat_apikey", JSON.stringify(apiKey.trim()));
      localStorage.setItem("cat_binid",  JSON.stringify(binId));
      onSetup(apiKey.trim(), binId);
    } catch(e) {
      setError("API Key incorrecta o sin conexión. Revisá la clave e intentá de nuevo.");
    }
    setCargando(false);
  };

  return (
    <div style={{maxWidth:480,margin:"0 auto",minHeight:"100vh",background:"var(--color-background-primary)",padding:24,display:"flex",flexDirection:"column",gap:16}}>
      <div style={{textAlign:"center",paddingTop:32,paddingBottom:8}}>
        <div style={{fontSize:40,marginBottom:12}}>☁️</div>
        <h1 style={{fontSize:20,fontWeight:500,color:"var(--color-text-primary)",marginBottom:6}}>Configurar guardado en la nube</h1>
        <p style={{fontSize:14,color:"var(--color-text-secondary)",lineHeight:1.6}}>Necesitás hacer esto una sola vez. Después todo se guarda automáticamente.</p>
      </div>

      <div style={{background:"var(--color-background-secondary)",borderRadius:12,padding:16,display:"flex",flexDirection:"column",gap:10}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
          <div style={{width:24,height:24,borderRadius:"50%",background:"#185FA5",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:600,flexShrink:0}}>1</div>
          <div>
            <div style={{fontSize:14,fontWeight:500,color:"var(--color-text-primary)"}}>Entrá a jsonbin.io</div>
            <div style={{fontSize:12,color:"var(--color-text-secondary)",marginTop:2}}>Abrí una nueva pestaña y andá a jsonbin.io</div>
            <a href="https://jsonbin.io" target="_blank" rel="noreferrer" style={{fontSize:13,color:"#185FA5",fontWeight:500}}>Abrir jsonbin.io →</a>
          </div>
        </div>
        <div style={{borderTop:"0.5px solid var(--color-border-tertiary)",paddingTop:10,display:"flex",alignItems:"flex-start",gap:10}}>
          <div style={{width:24,height:24,borderRadius:"50%",background:"#185FA5",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:600,flexShrink:0}}>2</div>
          <div style={{fontSize:14,color:"var(--color-text-primary)"}}>
            <span style={{fontWeight:500}}>Registrate gratis</span>
            <div style={{fontSize:12,color:"var(--color-text-secondary)",marginTop:2,lineHeight:1.6}}>
              Tocá <b>Sign Up</b> · Usá tu email · Confirmá el email si te pide
            </div>
          </div>
        </div>
        <div style={{borderTop:"0.5px solid var(--color-border-tertiary)",paddingTop:10,display:"flex",alignItems:"flex-start",gap:10}}>
          <div style={{width:24,height:24,borderRadius:"50%",background:"#185FA5",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:600,flexShrink:0}}>3</div>
          <div style={{fontSize:14,color:"var(--color-text-primary)"}}>
            <span style={{fontWeight:500}}>Copiá tu API Key</span>
            <div style={{fontSize:12,color:"var(--color-text-secondary)",marginTop:2,lineHeight:1.6}}>
              Una vez adentro andá a <b>API Keys</b> en el menú → <b>+ Create Access Key</b> → nombrarla <b>reparto-app</b> → copiá la clave larga que aparece
            </div>
          </div>
        </div>
      </div>

      <div>
        <label style={{fontSize:13,color:"var(--color-text-secondary)",marginBottom:6,display:"block"}}>Pegá tu API Key acá</label>
        <textarea
          style={{width:"100%",padding:"10px",border:"0.5px solid var(--color-border-secondary)",borderRadius:8,fontSize:13,background:"var(--color-background-secondary)",color:"var(--color-text-primary)",outline:"none",minHeight:70,resize:"none",boxSizing:"border-box",lineHeight:1.5}}
          placeholder="$2b$10$xxxxxxxxxxxxxxxxxx..."
          value={apiKey}
          onChange={e=>setApiKey(e.target.value)}
        />
        {error && <div style={{fontSize:13,color:"var(--color-text-danger)",marginTop:6}}>{error}</div>}
      </div>

      <button
        style={{background:"#185FA5",color:"#fff",border:"none",borderRadius:8,padding:"14px",fontSize:15,fontWeight:500,cursor:"pointer",opacity:cargando?0.7:1}}
        onClick={conectar}
        disabled={cargando}
      >
        {cargando ? "Conectando..." : "Conectar y comenzar"}
      </button>

      <p style={{fontSize:12,color:"var(--color-text-tertiary)",textAlign:"center",lineHeight:1.6}}>
        Tus datos se guardan en tu cuenta privada de JSONBin. Es gratis y seguro. Solo vos tenés acceso.
      </p>
    </div>
  );
}

// ── Pantalla de código de acceso (primera vez) ────────────────────
function PantallaCodigoAcceso({onCodigo}) {
  const [codigo,  setCodigo]  = React.useState("");
  const [email,   setEmail]   = React.useState("");
  const [negocio, setNegocio] = React.useState("");
  const [error,   setError]   = React.useState("");
  const [cargando, setCargando] = React.useState(false);

  const confirmar = () => {
    const cod = codigo.trim().toUpperCase();
    if(!cod) { setError("Ingresá tu código de acceso"); return; }
    if(cod.length < 4) { setError("El código debe tener al menos 4 caracteres"); return; }
    if(!email.trim() || !email.includes("@")) { setError("Ingresá un email válido para recibir los informes"); return; }
    setCargando(true);
    setError("");
    try {
      localStorage.setItem("sr_licencia", JSON.stringify({
        codigo: cod,
        email: email.trim(),
        negocio: negocio.trim() || "Sistema de Reparto",
        nombre: negocio.trim() || "Sistema de Reparto",
      }));
    } catch {}
    setTimeout(() => { onCodigo(cod); setCargando(false); }, 600);
  };

  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"var(--color-background-primary,#0f1923)", padding:24,
    }}>
      <div style={{width:"100%", maxWidth:340}}>
        {/* Logo */}
        <div style={{textAlign:"center", marginBottom:32}}>
          <div style={{
            width:72, height:72, borderRadius:"50%",
            background:"#185FA5", display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:32, margin:"0 auto 16px"
          }}>💧</div>
          <h1 style={{fontSize:22, fontWeight:700, color:"var(--color-text-primary,#e2eaf4)", margin:0}}>
            Sistema de Reparto
          </h1>
          <p style={{fontSize:14, color:"var(--color-text-secondary,#7a9ab8)", marginTop:6}}>
            Ingresá tu código de acceso
          </p>
        </div>

        {/* Card */}
        <div style={{
          background:"var(--color-background-secondary,#1a2b3c)",
          borderRadius:16, padding:24,
          border:"0.5px solid rgba(255,255,255,0.08)",
        }}>
          <label style={{fontSize:12, color:"var(--color-text-secondary,#7a9ab8)", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em"}}>
            Nombre del negocio
          </label>
          <input type="text" placeholder="La Catalina" value={negocio}
            onChange={e=>{ setNegocio(e.target.value); setError(""); }}
            style={{width:"100%",padding:"11px 14px",border:"1.5px solid rgba(255,255,255,0.12)",borderRadius:10,fontSize:15,background:"rgba(255,255,255,0.05)",color:"var(--color-text-primary,#e2eaf4)",outline:"none",boxSizing:"border-box",marginBottom:12}} />

          <label style={{fontSize:12, color:"var(--color-text-secondary,#7a9ab8)", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em"}}>
            Email para recibir informes *
          </label>
          <input type="email" placeholder="tucorreo@gmail.com" value={email}
            onChange={e=>{ setEmail(e.target.value); setError(""); }}
            style={{width:"100%",padding:"11px 14px",border:"1.5px solid rgba(255,255,255,0.12)",borderRadius:10,fontSize:15,background:"rgba(255,255,255,0.05)",color:"var(--color-text-primary,#e2eaf4)",outline:"none",boxSizing:"border-box",marginBottom:12}} />

          <label style={{fontSize:12, color:"var(--color-text-secondary,#7a9ab8)", display:"block", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.06em"}}>
            Código de acceso *
          </label>
          <input type="text" placeholder="Ej: AB12CD34" value={codigo}
            onChange={e=>{ setCodigo(e.target.value.toUpperCase()); setError(""); }}
            onKeyDown={e=>{ if(e.key==="Enter") confirmar(); }}
            style={{width:"100%",padding:"14px 16px",border:error?"1.5px solid #f07070":"1.5px solid rgba(255,255,255,0.12)",borderRadius:10,fontSize:18,fontWeight:700,background:"rgba(255,255,255,0.05)",color:"var(--color-text-primary,#e2eaf4)",outline:"none",boxSizing:"border-box",letterSpacing:"0.15em",textAlign:"center",textTransform:"uppercase"}}
            autoFocus
          />
          {error && (
            <p style={{color:"#f07070", fontSize:13, marginTop:8, textAlign:"center"}}>{error}</p>
          )}

          <button
            style={{
              width:"100%", marginTop:16, padding:"14px",
              borderRadius:10, border:"none",
              background: cargando ? "#0d3d70" : "#185FA5",
              color:"#e2eaf4", fontSize:15, fontWeight:600,
              cursor: cargando ? "wait" : "pointer",
              opacity: cargando ? 0.8 : 1,
              transition:"all 0.2s",
            }}
            onClick={confirmar}
            disabled={cargando}
          >
            {cargando ? "Verificando..." : "Ingresar →"}
          </button>
        </div>

        <p style={{
          fontSize:12, color:"var(--color-text-tertiary,#4a6a85)",
          textAlign:"center", marginTop:20, lineHeight:1.6
        }}>
          El código lo encontrás en la app Emma Control<br/>
          Config → Vincular con App de Reparto
        </p>
      </div>
    </div>
  );
}

