// ════════════════════════════════════════════════════════════════════
// ◆  11-gestion.js — GestionClientes · FormCliente
//    TABS: Lista · Fiados · Agenda · Importar Excel
// ════════════════════════════════════════════════════════════════════

// ── Tab: Fiados ──────────────────────────────────────────────────────
function FiadosTab({clientes}) {
  const conFiado = [...clientes]
    .filter(c => (c.saldo||0) < 0)
    .sort((a,b) => (a.saldo||0) - (b.saldo||0));
  const totalFiado = conFiado.reduce((a,c) => a + Math.abs(c.saldo||0), 0);

  if(conFiado.length === 0) return (
    <div style={{padding:40, textAlign:"center", color:"var(--color-text-secondary)"}}>
      <div style={{fontSize:40, marginBottom:12}}>✅</div>
      <div style={{fontSize:15, fontWeight:500, color:"var(--color-text-primary)"}}>Sin fiados pendientes</div>
      <div style={{fontSize:13, marginTop:4}}>Todos los clientes están al día</div>
    </div>
  );

  return (
    <div style={{paddingBottom:20}}>
      <div style={{...s.card, margin:"10px 14px", background:"var(--color-background-danger)", borderLeft:"3px solid var(--color-text-danger)"}}>
        <div style={{fontSize:11, color:"var(--color-text-danger)", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4}}>Total fiado pendiente</div>
        <div style={{fontSize:26, fontWeight:700, color:"var(--color-text-danger)"}}>{fmt(totalFiado)}</div>
        <div style={{fontSize:11, color:"var(--color-text-tertiary)", marginTop:2}}>{conFiado.length} cliente{conFiado.length>1?"s":""} con saldo negativo</div>
      </div>
      {conFiado.map(c => (
        <div key={c.id} style={{...s.card, margin:"6px 14px", borderLeft:"3px solid var(--color-text-danger)"}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <div style={{fontSize:15, fontWeight:500, color:"var(--color-text-primary)"}}>{c.nombre}</div>
              <div style={{fontSize:12, color:"var(--color-text-secondary)", marginTop:2}}>
                {c.dia}{c.barrio ? ` · ${c.barrio}` : c.calle ? ` · ${c.calle}` : ""}
              </div>
              {c.telefono && (
                <a href={`https://wa.me/54${c.telefono}`} target="_blank" rel="noreferrer"
                  style={{fontSize:12, color:"#4dd9a0", marginTop:3, display:"block", textDecoration:"none"}}>
                  💬 {c.telefono}
                </a>
              )}
            </div>
            <div style={{textAlign:"right", flexShrink:0}}>
              <div style={{fontSize:17, fontWeight:700, color:"var(--color-text-danger)"}}>Debe</div>
              <div style={{fontSize:20, fontWeight:700, color:"var(--color-text-danger)"}}>{fmt(Math.abs(c.saldo||0))}</div>
              {(c.sifon>0||c.bidon10>0||c.bidon20>0) && (
                <div style={{fontSize:10, color:"var(--color-text-tertiary)", marginTop:2}}>
                  {c.sifon>0?`Sifón×${c.sifon} `:""}
                  {c.bidon10>0?`10L×${c.bidon10} `:""}
                  {c.bidon20>0?`20L×${c.bidon20}`:""}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Tab: Agenda ──────────────────────────────────────────────────────
function AgendaTab({recordatorios, onConfirmarRecordatorio}) {
  const activos = [...(recordatorios||[])]
    .filter(r => !r.confirmado)
    .sort((a,b) => (a.fecha||"").localeCompare(b.fecha||""));
  const confirmados = [...(recordatorios||[])]
    .filter(r => r.confirmado)
    .sort((a,b) => (b.fecha||"").localeCompare(a.fecha||""))
    .slice(0, 10);

  if(activos.length === 0 && confirmados.length === 0) return (
    <div style={{padding:40, textAlign:"center", color:"var(--color-text-secondary)"}}>
      <div style={{fontSize:40, marginBottom:12}}>📅</div>
      <div style={{fontSize:15, fontWeight:500, color:"var(--color-text-primary)"}}>Sin recordatorios</div>
      <div style={{fontSize:13, marginTop:4, lineHeight:1.6}}>Los recordatorios se crean desde el detalle de cada cliente</div>
    </div>
  );

  return (
    <div style={{paddingBottom:20}}>
      {activos.length > 0 && (
        <>
          <span style={s.sectionTitle}>🔔 Pendientes · {activos.length}</span>
          {activos.map(r => (
            <div key={r.id} style={{...s.card, margin:"6px 14px", background:"var(--color-background-info)", border:"0.5px solid #5daaff", display:"flex", gap:8, alignItems:"flex-start"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13, fontWeight:600, color:"var(--color-text-info)"}}>{r.clienteNombre}</div>
                <div style={{fontSize:11, color:"var(--color-text-tertiary)", marginTop:2}}>{r.dia} · {r.fecha}{r.hora ? ` · ${r.hora}` : ""}</div>
                <div style={{fontSize:13, color:"var(--color-text-primary)", marginTop:4}}>
                  {r.tipo==="cobro" ? "💰" : "🏠"} {r.motivo}
                </div>
              </div>
              <button style={{background:"#4dd9a0", color:"#0a2e1f", border:"none", borderRadius:8, padding:"8px 14px", fontSize:12, fontWeight:700, cursor:"pointer", flexShrink:0, marginTop:2}}
                onClick={()=>onConfirmarRecordatorio&&onConfirmarRecordatorio(r.id)}>
                ✓ Listo
              </button>
            </div>
          ))}
        </>
      )}
      {confirmados.length > 0 && (
        <>
          <span style={{...s.sectionTitle, marginTop:8}}>✅ Completados recientes</span>
          {confirmados.map(r => (
            <div key={r.id} style={{...s.card, margin:"4px 14px", opacity:0.55}}>
              <div style={{fontSize:13, color:"var(--color-text-secondary)"}}>{r.clienteNombre} <span style={{fontSize:11, color:"var(--color-text-tertiary)"}}>· {r.dia}</span></div>
              <div style={{fontSize:12, color:"var(--color-text-tertiary)", marginTop:2}}>{r.motivo}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ── Tab: Importar Excel ──────────────────────────────────────────────
// SIMPLE: seleccionar → auto-detectar → preview → confirmar
// Sin mapeo manual · Sin async/await (incompatible con Babel in-browser)
function ImportarExcelTab({clientes, prospectos, onImportar, modoSoloProspectos}) {
  const [paso, setPaso]     = React.useState(1); // 1=subir 2=preview 3=listo
  const [preview, setPreview] = React.useState([]);
  const [errores, setErrores] = React.useState([]);
  const [cargando, setCargando] = React.useState(false);
  const [importados, setImportados] = React.useState({cl:0,pr:0});

  const resetear = () => { setPreview([]); setErrores([]); setPaso(1); setImportados({cl:0,pr:0}); };

  const procesarBuffer = (buffer) => {
    try {
      const MAPDIA = {lunes:"Lunes",martes:"Martes",miercoles:"Miércoles",jueves:"Jueves",viernes:"Viernes",sabado:"Sábado"};
      const norm = (s) => String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[°\s_\-\.\/]/g,"").trim();

      const wb  = window.XLSX.read(new Uint8Array(buffer), {type:"array"});
      const ws  = wb.Sheets[wb.SheetNames[0]];
      const json = window.XLSX.utils.sheet_to_json(ws, {header:1, defval:""});

      if(!json || json.length < 2) { alert("El archivo está vacío."); setCargando(false); return; }

      // Detectar fila de encabezados (saltar títulos)
      let headerIdx = 0;
      for(let i = 0; i < Math.min(json.length, 6); i++) {
        const r = json[i].map(norm);
        if(r.some(c => c==="nombre" || c==="dia" || c==="barrio" || c==="calle")) { headerIdx = i; break; }
      }
      const headers = json[headerIdx].map(h => String(h).trim());
      const filas   = json.slice(headerIdx+1).filter(r => r.some(c => String(c).trim() !== ""));

      // Auto-mapeo silencioso
      const col = {};
      headers.forEach((h, i) => {
        const hn = norm(h);
        if(hn==="nombre" || (hn.includes("nombre") && !hn.includes("apellido"))) col.nombre=i;
        if(hn.includes("apellido"))                    col.apellido=i;
        if(hn==="dia")                                 col.dia=i;
        if(hn==="barrio")                              col.barrio=i;
        if(hn.includes("manzana")||hn==="mz"||hn==="mza") col.manzana=i;
        if(hn==="lote"||hn==="lt")                     col.lote=i;
        if(hn==="calle"||hn.includes("direcc"))        col.calle=i;
        if(hn==="n"||hn==="nro"||hn==="numero")        col.nro=i;
        if(hn.includes("aclar")||hn.includes("depto")) col.aclaracion=i;
        if(hn.includes("telef")||hn.includes("cel")||hn==="telefono") col.telefono=i;
        if(hn.includes("maps")||hn.includes("ubic")||hn.includes("gps")) col.maps=i;
        if(hn.includes("sifon")||(hn.includes("soda")&&!hn.includes("bidon"))) col.sifon=i;
        if(hn.includes("10")&&(hn.includes("bidon")||hn.includes("agua")||hn.includes("bid"))) col.bidon10=i;
        if(hn.includes("20")&&(hn.includes("bidon")||hn.includes("agua")||hn.includes("bid"))) col.bidon20=i;
        if(hn.includes("dispen"))                      col.dispenser=i;
        if(hn==="orden"||hn==="ord"||hn==="order")     col.orden=i;
        if(hn==="tipo"||hn.includes("tipocliente"))    col.tipo=i;
      });

      const getV = (row, campo) => col[campo]!==undefined ? String(row[col[campo]]||"").trim() : "";

      const errs = [];
      const resultado = filas.map((row, i) => {
        const nombre = getV(row,"nombre");
        if(!nombre){ errs.push(`Fila ${i+headerIdx+2}: sin nombre`); return null; }
        const apellido = getV(row,"apellido");
        const nombreC  = apellido ? `${nombre} ${apellido}` : nombre;
        const rawDia   = getV(row,"dia");
        const diaKey   = norm(rawDia);
        const dia      = MAPDIA[diaKey] || (DIAS||[]).find(d=>norm(d)===diaKey) || rawDia || "Lunes";
        const rawTipo  = modoSoloProspectos ? "prospecto" : norm(getV(row,"tipo"));
        const tipo     = rawTipo.includes("prosp") ? "prospecto" : "cliente";
        return {
          nombre:nombreC, calle:getV(row,"calle"), nro:getV(row,"nro"),
          barrio:getV(row,"barrio"), manzana:getV(row,"manzana"),
          lote:getV(row,"lote"), aclaracion:getV(row,"aclaracion"),
          telefono:getV(row,"telefono"), maps:getV(row,"maps"),
          dia, tipo,
          sifon:    Math.max(0,Number(getV(row,"sifon"))||0),
          bidon10:  Math.max(0,Number(getV(row,"bidon10"))||0),
          bidon20:  Math.max(0,Number(getV(row,"bidon20"))||0),
          dispenser:Math.max(0,Number(getV(row,"dispenser"))||0),
          orden:    Number(getV(row,"orden"))||9999,
        };
      }).filter(Boolean);

      setPreview(resultado);
      setErrores(errs);
      setPaso(2);
    } catch(err) {
      console.error("Excel error:", err);
      alert("Error al leer el archivo. Verificá que sea un .xlsx válido.");
    }
    setCargando(false);
  };

  const leerExcel = (file) => {
    setCargando(true);
    const leer = () => {
      const reader = new FileReader();
      reader.onload  = (e) => procesarBuffer(e.target.result);
      reader.onerror = ()  => { alert("Error al abrir el archivo."); setCargando(false); };
      reader.readAsArrayBuffer(file);
    };
    if(window.XLSX) { leer(); return; }
    const sc = document.createElement("script");
    sc.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    sc.onload = leer;
    sc.onerror = () => { setCargando(false); alert("Sin conexión para cargar la librería Excel. Intentá de nuevo."); };
    document.head.appendChild(sc);
  };

  const confirmarImport = () => {
    const maxId = Math.max(0, ...(clientes||[]).map(c=>c.id||0), ...(prospectos||[]).map(p=>p.id||0));
    let nextId = maxId + 1;
    const hoy = new Date().toISOString().slice(0,10);
    const nuevosClientes = [], nuevosProspectos = [];
    preview.forEach(p => {
      const base = {
        id:nextId++, nombre:p.nombre, calle:p.calle, nro:p.nro,
        barrio:p.barrio, manzana:p.manzana, lote:p.lote, aclaracion:p.aclaracion,
        telefono:p.telefono, maps:p.maps, dia:p.dia,
        sifon:p.sifon, bidon10:p.bidon10, bidon20:p.bidon20,
        dispenser:p.dispenser, saldo:0, orden:p.orden,
      };
      if(p.tipo==="prospecto") nuevosProspectos.push({...base, estado:"activo", fechaInicio:hoy, visitas:[], listoConvertir:false});
      else nuevosClientes.push(base);
    });
    onImportar(nuevosClientes, nuevosProspectos);
    setImportados({cl:nuevosClientes.length, pr:nuevosProspectos.length});
    setPaso(3);
  };

  // ── Paso 3: Listo ──
  if(paso===3) return (
    <div style={{padding:40,textAlign:"center"}}>
      <div style={{fontSize:48,marginBottom:12}}>✅</div>
      <div style={{fontSize:18,fontWeight:600,color:"var(--color-text-primary)",marginBottom:8}}>¡Importación completada!</div>
      <div style={{fontSize:14,color:"var(--color-text-secondary)",lineHeight:2}}>
        {importados.cl>0&&<div>👥 {importados.cl} cliente{importados.cl!==1?"s":""} importado{importados.cl!==1?"s":""}</div>}
        {importados.pr>0&&<div>🚀 {importados.pr} prospecto{importados.pr!==1?"s":""} importado{importados.pr!==1?"s":""}</div>}
      </div>
      <button style={{...s.btnPrimary,width:200,marginTop:20}} onClick={resetear}>📂 Importar otro</button>
    </div>
  );

  // ── Paso 1: Seleccionar archivo ──
  if(paso===1) return (
    <div style={{padding:"16px 14px"}}>
      <div style={{...s.card,margin:"0 0 14px",background:"var(--color-background-info)",border:"0.5px solid #5daaff"}}>
        <div style={{fontSize:13,fontWeight:600,color:"var(--color-text-info)",marginBottom:8}}>
          {modoSoloProspectos?"📥 Importar prospectos desde Excel":"📥 Importar clientes desde Excel"}
        </div>
        <div style={{fontSize:12,color:"var(--color-text-secondary)",lineHeight:1.9}}>
          El archivo puede tener columnas:<br/>
          <b>Nombre · Día · Barrio · Manzana · Lote · Calle · N° · Teléfono · Sifón 1.5L · Bidón 10L · Bidón 20L · Dispenser · Orden{!modoSoloProspectos?" · Tipo":""}</b>
        </div>
        <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginTop:6}}>
          Las columnas se detectan automáticamente. No necesitás hacer nada más.
        </div>
      </div>
      <label style={{
        ...s.btnPrimary, display:"flex", alignItems:"center", justifyContent:"center",
        gap:8, cursor:cargando?"wait":"pointer", opacity:cargando?0.7:1,
        padding:"16px", borderRadius:12, fontSize:15,
      }}>
        {cargando?"⏳ Leyendo archivo...":"📂 Seleccionar archivo Excel (.xlsx)"}
        <input type="file" accept=".xlsx,.xls" style={{display:"none"}} disabled={cargando}
          onChange={e=>{ if(e.target.files[0]) leerExcel(e.target.files[0]); }} />
      </label>
    </div>
  );

  // ── Paso 2: Preview simple + confirmar ──
  if(paso===2) {
    const clPrev = preview.filter(p=>p.tipo==="cliente");
    const prPrev = preview.filter(p=>p.tipo==="prospecto");
    return (
      <div style={{padding:"12px 14px",paddingBottom:40}}>
        <div style={{...s.card,margin:"0 0 10px",background:"var(--color-background-success)",borderLeft:"3px solid var(--color-text-success)"}}>
          <div style={{fontSize:14,fontWeight:600,color:"var(--color-text-success)"}}>
            {modoSoloProspectos
              ?`🚀 ${prPrev.length} prospecto${prPrev.length!==1?"s":""} listos para importar`
              :`👥 ${clPrev.length} cliente${clPrev.length!==1?"s":""}${prPrev.length>0?` · 🚀 ${prPrev.length} prospectos`:""}`
            }
          </div>
        </div>
        {errores.length>0&&(
          <div style={{...s.card,margin:"0 0 10px",background:"var(--color-background-warning)",borderLeft:"3px solid var(--color-text-warning)"}}>
            <div style={{fontSize:12,color:"var(--color-text-warning)"}}>⚠ {errores.length} fila{errores.length!==1?"s":""} sin nombre (omitidas)</div>
          </div>
        )}
        <div style={{maxHeight:380,overflow:"auto",marginBottom:14}}>
          {preview.length===0&&<div style={{textAlign:"center",padding:24,color:"var(--color-text-tertiary)",fontSize:13}}>No se encontraron registros válidos.</div>}
          {preview.slice(0,80).map((p,i)=>(
            <div key={i} style={{...s.card,margin:"4px 0",padding:"8px 12px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                    <span style={{fontSize:13,fontWeight:600,color:"var(--color-text-primary)"}}>{p.nombre}</span>
                    {!modoSoloProspectos&&p.tipo==="prospecto"&&(
                      <span style={{fontSize:10,padding:"1px 7px",borderRadius:10,fontWeight:600,background:"var(--color-background-warning)",color:"var(--color-text-warning)"}}>prospecto</span>
                    )}
                  </div>
                  <div style={{fontSize:11,color:"var(--color-text-secondary)",marginTop:2}}>
                    {[p.calle,p.nro,p.manzana?`Mz ${p.manzana}`:"",p.lote?`L ${p.lote}`:"",p.barrio].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <div style={{textAlign:"right",flexShrink:0,marginLeft:8}}>
                  <div style={{fontSize:11,color:"var(--color-text-info)",fontWeight:500}}>{p.dia}</div>
                  <div style={{fontSize:10,color:"var(--color-text-tertiary)",marginTop:2}}>
                    {[p.sifon>0?`Sif×${p.sifon}`:"",p.bidon10>0?`10L×${p.bidon10}`:"",p.bidon20>0?`20L×${p.bidon20}`:"",p.dispenser>0?`Disp×${p.dispenser}`:""].filter(Boolean).join(" ")}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {preview.length>80&&<div style={{textAlign:"center",fontSize:12,color:"var(--color-text-tertiary)",padding:10}}>... y {preview.length-80} más</div>}
        </div>
        <div style={{display:"flex",gap:8}}>
          <button style={{...s.btn,flex:1}} onClick={resetear}>← Volver</button>
          <button
            style={{...s.btnPrimary,flex:2,background:preview.length>0?"#1a5e35":"#555",opacity:preview.length===0?0.5:1}}
            disabled={preview.length===0}
            onClick={confirmarImport}>
            ✅ Confirmar e importar {preview.length} registros
          </button>
        </div>
      </div>
    );
  }
  return null;
}


// ── GestionClientes (con tabs) ───────────────────────────────────────
function GestionClientes({clientes, onEditar, onEliminar, onNuevo, onVolver, onReordenarTodo, onRegistrarVenta, onVerDetalle, ventas, prospectos, recordatorios, onConfirmarRecordatorio, onImportar}) {
  const [tab, setTab] = React.useState("lista"); // lista | fiados | agenda | importar
  const [fotoClienteId, setFotoClienteId] = React.useState(null);
  const fotoCliente = fotoClienteId ? clientes.find(c=>c.id===fotoClienteId) : null;
  const [busqueda, setBusqueda] = useState("");
  const [filtroDia, setFiltroDia] = useState("todos");
  const [modoNuevo, setModoNuevo] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const extraEnvases = React.useMemo(()=>{
    const m={};
    (ventas||[]).forEach(v=>{
      if(!m[v.clienteId]) m[v.clienteId]={sifon:0,bidon10:0,bidon20:0};
      (v.envPrest||[]).forEach(e=>{const k=e.prod==="Sifón 1.5L"?"sifon":e.prod==="Bidón 10L"?"bidon10":e.prod==="Bidón 20L"?"bidon20":null;if(k)m[v.clienteId][k]+=Number(e.cant)||0;});
      (v.envDev||[]).forEach(e=>{const k=e.prod==="Sifón 1.5L"?"sifon":e.prod==="Bidón 10L"?"bidon10":e.prod==="Bidón 20L"?"bidon20":null;if(k)m[v.clienteId][k]-=Number(e.cant)||0;});
    });
    return m;
  },[ventas]);

  const filtrados = clientes
    .filter(c=>filtroDia==="todos"||c.dia===filtroDia)
    .filter(c=>c.nombre.toLowerCase().includes(busqueda.toLowerCase())||
               (c.barrio||"").toLowerCase().includes(busqueda.toLowerCase())||
               (c.telefono||"").includes(busqueda))
    .sort((a,b)=>{
      if(a.dia!==b.dia) return DIAS.indexOf(a.dia)-DIAS.indexOf(b.dia);
      return (a.orden||9999)-(b.orden||9999);
    });

  // Contadores para badges en tabs
  const cantFiados = clientes.filter(c=>(c.saldo||0)<0).length;
  const cantAgenda = (recordatorios||[]).filter(r=>!r.confirmado).length;

  return (
    <>
    <div style={s.screen}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={onVolver}>← Volver</button>
        <span style={s.headerTitle}>Clientes</span>
        {tab === "lista" && (
          <button style={{...s.btn,padding:"6px 12px",fontSize:12,background:"#185FA5",color:"#e2eaf4",border:"none"}}
            onClick={()=>{setModoNuevo(true);setEditandoId(null);}}>
            + Nuevo
          </button>
        )}
      </div>

      {/* ── Barra de tabs ── */}
      <div style={{display:"flex", borderBottom:"0.5px solid var(--color-border-tertiary)", background:"var(--color-background-secondary)", overflowX:"auto"}}>
        {[
          {id:"lista",    ico:"👥", lbl:"Lista"},
          {id:"fiados",   ico:"💰", lbl:"Fiados",  badge:cantFiados},
          {id:"agenda",   ico:"📅", lbl:"Agenda",  badge:cantAgenda},
          {id:"importar", ico:"📥", lbl:"Excel"},
        ].map(({id,ico,lbl,badge})=>(
          <button key={id}
            style={{
              flex:1, padding:"10px 6px", border:"none", cursor:"pointer",
              background:"none", display:"flex", flexDirection:"column", alignItems:"center", gap:2,
              borderBottom:tab===id?"2px solid #5daaff":"2px solid transparent",
              color:tab===id?"var(--color-text-info)":"var(--color-text-tertiary)",
              position:"relative",
            }}
            onClick={()=>setTab(id)}>
            <span style={{fontSize:18}}>{ico}</span>
            <span style={{fontSize:10, fontWeight:tab===id?600:400}}>{lbl}</span>
            {badge>0&&<span style={{position:"absolute",top:6,right:8,background:"var(--color-text-danger)",color:"#fff",borderRadius:10,fontSize:9,fontWeight:700,padding:"1px 5px",minWidth:16,textAlign:"center"}}>{badge}</span>}
          </button>
        ))}
      </div>

      {/* ── Tab: Lista ── */}
      {tab === "lista" && (
        <>
          <div style={{padding:"10px 14px 6px"}}>
            <input style={s.input} placeholder="Buscar por nombre, barrio o teléfono..." value={busqueda} onChange={e=>setBusqueda(e.target.value)} />
            <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap",alignItems:"center"}}>
              {["todos",...DIAS].map(d=>(
                <button key={d} style={{...s.btn,fontSize:11,padding:"3px 10px",
                  background:filtroDia===d?"#185FA5":"var(--color-background-tertiary)",
                  color:filtroDia===d?"#e2eaf4":"var(--color-text-secondary)",
                  border:filtroDia===d?"none":"0.5px solid var(--color-border-secondary)"}}
                  onClick={()=>setFiltroDia(d)}>
                  {d==="todos"?"Todos":d}
                </button>
              ))}
              <button style={{...s.btn,fontSize:11,padding:"3px 10px",marginLeft:"auto"}}
                onClick={()=>{
                  const porDia = {};
                  DIAS.forEach(d=>{porDia[d]=[...clientes].filter(c=>c.dia===d).sort((a,b)=>(a.orden||9999)-(b.orden||9999));});
                  const compactados = clientes.map(c=>{const lista=porDia[c.dia];const idx=lista.findIndex(x=>x.id===c.id);return idx>=0?{...c,orden:idx+1}:c;});
                  if(window.confirm("¿Reordenar todos los clientes eliminando los huecos?")) onReordenarTodo(compactados);
                }}>
                ↺ Reordenar
              </button>
            </div>
            <p style={{fontSize:11,color:"var(--color-text-tertiary)",marginTop:6}}>
              {filtrados.length} clientes{filtroDia!=="todos"?` · ${filtroDia}`:""}
            </p>
          </div>

          {modoNuevo && (
            <div style={{...s.card,margin:"6px 14px",borderLeft:"3px solid #185FA5"}}>
              <div style={{...s.row,justifyContent:"space-between",marginBottom:10}}>
                <span style={{fontSize:14,fontWeight:500,color:"var(--color-text-primary)"}}>Nuevo cliente</span>
                <button style={{...s.btn,fontSize:11,padding:"3px 10px"}} onClick={()=>setModoNuevo(false)}>Cancelar</button>
              </div>
              <FormCliente
                inicial={{nombre:"",dia:"Martes",barrio:"",manzana:"",lote:"",sector:"",calle:"",nro:"",aclaracion:"",telefono:"",maps:"",notas:"",sifon:0,bidon10:0,bidon20:0,orden:""}}
                onGuardar={(datos)=>{onNuevo(datos);setModoNuevo(false);}}
              />
            </div>
          )}

          {filtrados.map(c=>(
            <div key={c.id} style={{...s.card,borderLeft:editandoId===c.id?"3px solid #5daaff":"0.5px solid var(--color-border-tertiary)"}}>
              {editandoId===c.id ? (
                <>
                  <div style={{...s.row,justifyContent:"space-between",marginBottom:10}}>
                    <span style={{fontSize:14,fontWeight:500,color:"var(--color-text-primary)"}}>Editando</span>
                    <button style={{...s.btn,fontSize:11,padding:"3px 10px"}} onClick={()=>setEditandoId(null)}>Cancelar</button>
                  </div>
                  <FormCliente
                    inicial={c}
                    onGuardar={(datos)=>{onEditar(c.id,datos);setEditandoId(null);}}
                  />
                  {(()=>{
                    const ex = extraEnvases[c.id]||{sifon:0,bidon10:0,bidon20:0};
                    const aj = c.envAjuste||{sifon:0,bidon10:0,bidon20:0};
                    const total = {sifon:ex.sifon+(aj.sifon||0),bidon10:ex.bidon10+(aj.bidon10||0),bidon20:ex.bidon20+(aj.bidon20||0)};
                    const setTotal=(k,val)=>{const n=Number(val)||0;onEditar(c.id,{envAjuste:{...aj,[k]:n-(ex[k]||0)}});};
                    return (
                      <div style={{...s.card,margin:"4px 0",background:"var(--color-background-tertiary)",padding:"10px 12px",borderLeft:"3px solid var(--color-border-warning)"}}>
                        <div style={{fontSize:12,fontWeight:500,color:"var(--color-text-warning)",marginBottom:4}}>📦 Envases extra prestados al cliente</div>
                        <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginBottom:8}}>Editá directamente la cantidad que tiene en su poder.</div>
                        <div style={{display:"flex",gap:8}}>
                          {[["sifon","Sifón"],["bidon10","10L"],["bidon20","20L"]].map(([k,l])=>(
                            <div key={k} style={{flex:1,textAlign:"center"}}>
                              <label style={{...s.label,textAlign:"center",fontSize:11}}>{l}</label>
                              <input style={{...s.inputNum,textAlign:"center",fontSize:18,fontWeight:700,color:total[k]>0?"var(--color-text-warning)":total[k]<0?"var(--color-text-success)":"var(--color-text-tertiary)"}}
                                type="number" value={total[k]} onChange={e=>setTotal(k,e.target.value)} />
                              <div style={{fontSize:9,color:"var(--color-text-tertiary)",marginTop:3}}>{total[k]>0?"prestado":total[k]<0?"devuelto de más":"ok"}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </>
              ) : (
                <>
                  <div style={{display:"flex",alignItems:"flex-start",gap:10,cursor:onVerDetalle?"pointer":"default"}} onClick={()=>onVerDetalle&&onVerDetalle(c)}>
                    <div style={{width:32,height:32,borderRadius:8,background:"var(--color-background-tertiary)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:600,color:"var(--color-text-tertiary)",flexShrink:0}}>
                      {c.orden||"#"}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                        <div style={{fontWeight:700,fontSize:18,color:"#ffffff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.nombre}</div>
                        <span style={{background:"#1D9E75",color:"#fff",fontSize:10,padding:"1px 7px",borderRadius:20,fontWeight:700,flexShrink:0}}>{c.dia}</span>
                      </div>
                      <div style={{fontSize:17,color:"#c8d8e8",fontWeight:500,marginTop:2,marginBottom:4}}>
                        {c.calle?`${c.calle} ${c.nro||""}`:c.manzana?`Mz ${c.manzana} L ${c.lote}`:""}{c.barrio?` · ${c.barrio}`:""}
                      </div>
                      {c.notas&&<div style={{fontSize:12,color:"var(--color-text-warning)",marginBottom:4}}>📝 {c.notas}</div>}
                      <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:4}}>
                        <TagsCliente cliente={c} ventas={ventas}/>
                      </div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0,alignItems:"center"}}>
                      {c.maps&&<a href={c.maps} target="_blank" rel="noreferrer" style={{fontSize:18,textDecoration:"none"}} onClick={e=>e.stopPropagation()}>📍</a>}
                      {c.telefono&&<a href={`https://wa.me/54${c.telefono}`} target="_blank" rel="noreferrer" style={{fontSize:18,textDecoration:"none"}} onClick={e=>e.stopPropagation()}>💬</a>}
                      <span style={{fontSize:18,cursor:"pointer",lineHeight:1}} onClick={e=>{e.stopPropagation();setFotoClienteId(fotoClienteId===c.id?null:c.id);}}>📷</span>
                    </div>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8,borderTop:"0.5px solid var(--color-border-tertiary)",paddingTop:8}}>
                    <button style={{background:"rgba(226,75,74,0.2)",color:"#ffffff",border:"1px solid rgba(226,75,74,0.5)",borderRadius:6,padding:"2px 9px",fontSize:11,fontWeight:700,cursor:"pointer"}} onClick={e=>{e.stopPropagation();onEliminar(c.id);}}>🗑 Eliminar</button>
                    <div style={{display:"flex",gap:6}}>
                      {onRegistrarVenta&&<button style={{...s.btn,fontSize:11,padding:"4px 12px",background:"#185FA5",color:"#e2eaf4",border:"none"}} onClick={e=>{e.stopPropagation();onRegistrarVenta(c);}}>📦 Venta</button>}
                      <button style={{...s.btn,fontSize:11,padding:"4px 12px"}} onClick={e=>{e.stopPropagation();setEditandoId(c.id);}}>Editar</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
          {filtrados.length===0&&!modoNuevo&&(
            <div style={{textAlign:"center",padding:"40px 20px",color:"var(--color-text-tertiary)",fontSize:14}}>
              No hay clientes{filtroDia!=="todos"?` en ${filtroDia}`:""}.
            </div>
          )}
        </>
      )}

      {tab === "fiados" && <FiadosTab clientes={clientes} />}
      {tab === "agenda" && <AgendaTab recordatorios={recordatorios} onConfirmarRecordatorio={onConfirmarRecordatorio} />}
      {tab === "importar" && <ImportarExcelTab clientes={clientes} prospectos={prospectos||[]} onImportar={onImportar} />}
    </div>

    {/* Modal foto domicilio */}
    {fotoClienteId&&(
      <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.92)",zIndex:2000,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setFotoClienteId(null)}>
        {fotoCliente&&fotoCliente.foto
          ? <img src={fotoCliente.foto} alt="Domicilio" style={{maxWidth:"100%",maxHeight:"60vh",borderRadius:10,objectFit:"contain",marginBottom:16}} />
          : <div style={{color:"#aaa",fontSize:14,marginBottom:20}}>Sin foto aún · {fotoCliente&&fotoCliente.nombre}</div>
        }
        <div style={{display:"flex",gap:12}} onClick={e=>e.stopPropagation()}>
          <label style={{background:"#185FA5",color:"#e2eaf4",padding:"12px 20px",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",textAlign:"center"}}>
            📷 Cámara
            <input type="file" accept="image/*" capture="environment" style={{display:"none"}}
              onChange={async e=>{const f=e.target.files[0];if(!f)return;const b64=await comprimirFoto(f);onEditar(fotoClienteId,{foto:b64});setFotoClienteId(null);}} />
          </label>
          <label style={{background:"#2a3a4a",color:"#e2eaf4",padding:"12px 20px",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",textAlign:"center"}}>
            🖼 Galería
            <input type="file" accept="image/*" style={{display:"none"}}
              onChange={async e=>{const f=e.target.files[0];if(!f)return;const b64=await comprimirFoto(f);onEditar(fotoClienteId,{foto:b64});setFotoClienteId(null);}} />
          </label>
          {fotoCliente&&fotoCliente.foto&&<button style={{background:"#3a2020",color:"#e05c5c",padding:"12px 14px",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",border:"none"}} onClick={()=>{onEditar(fotoClienteId,{foto:""});setFotoClienteId(null);}}>🗑</button>}
        </div>
        <span style={{color:"#aaa",fontSize:11,marginTop:14}}>Tocá fuera para cerrar</span>
      </div>
    )}
    </>
  );
}

function FormCliente({inicial,onGuardar}) {
  const [datos,setDatos] = useState({...inicial});
  const set = (k,v) => setDatos(d=>({...d,[k]:v}));
  return (
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      <div style={s.grid2}>
        <div>
          <label style={s.label}>Día de reparto</label>
          <select style={s.select} value={datos.dia||"Martes"} onChange={e=>set("dia",e.target.value)}>
            {DIAS.map(d=><option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label style={s.label}>Número de orden</label>
          <input style={s.input} type="number" min={1} placeholder="ej: 5" value={datos.orden||""} onChange={e=>set("orden",Number(e.target.value)||"")} />
        </div>
      </div>
      <div>
        <label style={s.label}>Nombre y apellido *</label>
        <input style={s.input} placeholder="Nombre completo" value={datos.nombre||""} onChange={e=>set("nombre",e.target.value)} />
      </div>
      <div style={s.grid2}>
        <div><label style={s.label}>Barrio</label><input style={s.input} placeholder="Barrio" value={datos.barrio||""} onChange={e=>set("barrio",e.target.value)} /></div>
        <div><label style={s.label}>Sector</label><input style={s.input} placeholder="Sector" value={datos.sector||""} onChange={e=>set("sector",e.target.value)} /></div>
      </div>
      <div style={s.grid3}>
        <div><label style={s.label}>Manzana</label><input style={s.input} placeholder="Mz" value={datos.manzana||""} onChange={e=>set("manzana",e.target.value)} /></div>
        <div><label style={s.label}>Lote</label><input style={s.input} placeholder="Lote" value={datos.lote||""} onChange={e=>set("lote",e.target.value)} /></div>
        <div><label style={s.label}>Casa</label><input style={s.input} placeholder="Casa" value={datos.aclaracion||""} onChange={e=>set("aclaracion",e.target.value)} /></div>
      </div>
      <div style={s.grid2}>
        <div><label style={s.label}>Calle</label><input style={s.input} placeholder="Calle" value={datos.calle||""} onChange={e=>set("calle",e.target.value)} /></div>
        <div><label style={s.label}>Número</label><input style={s.input} placeholder="Nro" value={datos.nro||""} onChange={e=>set("nro",e.target.value)} /></div>
      </div>
      <div>
        <label style={s.label}>Teléfono (sin 0 ni 15)</label>
        <input style={s.input} placeholder="3816559000" value={datos.telefono||""} onChange={e=>set("telefono",e.target.value)} />
      </div>
      <div>
        <label style={s.label}>Link Google Maps</label>
        <input style={s.input} placeholder="https://maps.app.goo.gl/..." value={datos.maps||""} onChange={e=>set("maps",e.target.value)} />
      </div>
      <div>
        <label style={s.label}>Notas rápidas</label>
        <input style={s.input} placeholder="timbre roto, perro, cobrar deuda..." value={datos.notas||""} onChange={e=>set("notas",e.target.value)} />
      </div>
      <label style={{...s.label,marginTop:4}}>Envases habituales asignados</label>
      <div style={s.grid3}>
        {[["sifon","Sifón"],["bidon10","Bidón 10L"],["bidon20","Bidón 20L"]].map(([k,l])=>(
          <div key={k}>
            <label style={{...s.label,textAlign:"center"}}>{l}</label>
            <input style={{...s.input,textAlign:"center"}} type="number" min={0} value={datos[k]||0} onChange={e=>set(k,Number(e.target.value))} />
          </div>
        ))}
      </div>
      <div>
        <label style={s.label}>Dispenser en comodato</label>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button style={{...s.btn,padding:"5px 14px",fontSize:18,lineHeight:1}} onClick={()=>set("dispenser",Math.max(0,(datos.dispenser||0)-1))}>−</button>
          <span style={{fontSize:18,fontWeight:500,minWidth:28,textAlign:"center",color:"var(--color-text-primary)"}}>{datos.dispenser||0}</span>
          <button style={{...s.btn,padding:"5px 14px",fontSize:18,lineHeight:1}} onClick={()=>set("dispenser",(datos.dispenser||0)+1)}>+</button>
          <span style={{fontSize:12,color:"var(--color-text-secondary)"}}>unidades</span>
        </div>
      </div>
      <div style={{...s.card,margin:"4px 0",background:"var(--color-background-tertiary)",padding:"10px 12px"}}>
        <div style={{fontSize:12,fontWeight:500,color:"var(--color-text-secondary)",marginBottom:8}}>Saldo del cliente</div>
        <div style={{display:"flex",gap:8,marginBottom:6}}>
          {[["favor","A favor"],["deuda","Debe"],["cero","Sin saldo"]].map(([v,l])=>(
            <button key={v} style={{flex:1,fontSize:11,padding:"6px 4px",borderRadius:8,border:"0.5px solid var(--color-border-secondary)",cursor:"pointer",
              background:datos._tipoSaldo===v?"#185FA5":"var(--color-background-secondary)",
              color:datos._tipoSaldo===v?"#e2eaf4":"var(--color-text-secondary)"}}
              onClick={()=>set("_tipoSaldo",v)}>
              {l}
            </button>
          ))}
        </div>
        {datos._tipoSaldo&&datos._tipoSaldo!=="cero"&&(
          <div>
            <label style={s.label}>{datos._tipoSaldo==="favor"?"Monto a favor ($)":"Monto que debe ($)"}</label>
            <input style={s.input} type="number" min={0} placeholder="0" value={datos._montoSaldo||""} onChange={e=>set("_montoSaldo",e.target.value)} />
          </div>
        )}
        {datos.saldo!==0&&<div style={{fontSize:11,color:datos.saldo<0?"var(--color-text-danger)":"var(--color-text-success)",marginTop:4}}>
          Saldo actual: {fmt(datos.saldo)} · {datos.saldo<0?"Debe":"A favor"}
        </div>}
        <div style={{marginTop:6}}>
          <label style={s.label}>O ingresá el saldo directamente (−negativo = debe · +positivo = a favor)</label>
          <input style={s.input} type="number" placeholder="ej: -2500 o 1800"
            value={datos._saldoDirecto??""} onChange={e=>set("_saldoDirecto",e.target.value)} />
        </div>
      </div>
      <button style={{...s.btnPrimary,marginTop:4,opacity:!datos.nombre?0.45:1}} disabled={!datos.nombre}
        onClick={()=>{
          let saldo = datos.saldo||0;
          if(datos._tipoSaldo==="favor")  saldo =  Math.abs(Number(datos._montoSaldo)||0);
          if(datos._tipoSaldo==="deuda")  saldo = -Math.abs(Number(datos._montoSaldo)||0);
          if(datos._tipoSaldo==="cero")   saldo = 0;
          if(datos._saldoDirecto!==undefined&&datos._saldoDirecto!=="") saldo=Number(datos._saldoDirecto);
          onGuardar({...datos, saldo});
        }}>
        Guardar cliente
      </button>
    </div>
  );
}
