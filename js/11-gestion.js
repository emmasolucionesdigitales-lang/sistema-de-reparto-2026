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
      for(let i = 0; i < Math.min(json.length, 8); i++) {
        const r = json[i].map(norm);
        const esHeader = r.some(c =>
          c==="nombre" || c==="dia" || c==="barrio" || c==="calle" ||
          c.includes("nombreyapellido") || c.includes("diadereparto") ||
          c.includes("diareparto") || c.includes("norden")
        );
        if(esHeader) { headerIdx = i; break; }
      }
      const headers = json[headerIdx].map(h => String(h).trim());
      const filas   = json.slice(headerIdx+1).filter(r => {
        const primera = String(r[0]||"").trim();
        // Saltar filas de instrucciones, vacías, o sin nombre en col 0
        if(!primera) return false;
        if(primera.startsWith("▼")||primera.startsWith("→")||primera.startsWith("//")) return false;
        return true;
      });

      // Auto-mapeo silencioso
      const col = {};
      headers.forEach((h, i) => {
        const hn = norm(h);
        // Nombre — "Nombre y Apellido *", "nombre", "nombre y apellido"
        if(hn==="nombre"||(hn.includes("nombre")&&!hn.includes("apellido"))||(hn.includes("nombre")&&hn.includes("apellido"))) col.nombre=i;
        // Día — "Día de Reparto *", "dia"
        if(hn==="dia"||hn.includes("diadereparto")||hn.includes("diareparto")) col.dia=i;
        if(hn==="barrio")                              col.barrio=i;
        if(hn.includes("manzana")||hn==="mz"||hn==="mza") col.manzana=i;
        if(hn==="lote"||hn==="lt")                     col.lote=i;
        if(hn==="sector"&&!hn.includes("mapa"))        col.sector=i;
        if(hn==="calle"||hn.includes("direcc"))        col.calle=i;
        if(hn==="n"||hn==="nro"||hn==="numero")        col.nro=i;
        if(hn.includes("aclar")||hn.includes("depto")||hn.includes("aclaracion")) col.aclaracion=i;
        if(hn.includes("telef")||hn.includes("cel")||hn==="telefono") col.telefono=i;
        if(hn.includes("maps")||hn.includes("ubic")||hn.includes("gps")||hn.includes("google")) col.maps=i;
        if(hn.includes("sifon")||(hn.includes("soda")&&!hn.includes("bidon"))) col.sifon=i;
        if(hn.includes("10")&&(hn.includes("bidon")||hn.includes("agua")||hn.includes("bid"))) col.bidon10=i;
        if(hn.includes("20")&&(hn.includes("bidon")||hn.includes("agua")||hn.includes("bid"))) col.bidon20=i;
        if(hn.includes("dispen"))                      col.dispenser=i;
        // Orden — "N° Orden *", "Orden en ruta (num.)", "orden"
        if(hn==="orden"||hn==="ord"||hn==="order"||hn.includes("norden")||hn.includes("ordenenruta")||hn.includes("ordenruta")) col.orden=i;
        // Saldo — "Saldo Inicial ($) + a favor / - debe"
        if(hn.includes("saldo"))                       col.saldo=i;
        // Notas — "Notas rápidas"
        if(hn.includes("nota")||hn.includes("observ")) col.notas=i;
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
          lote:getV(row,"lote"), sector:getV(row,"sector"),
          aclaracion:getV(row,"aclaracion"),
          notas:getV(row,"notas"),
          telefono:getV(row,"telefono"), maps:getV(row,"maps"),
          dia, tipo,
          sifon:    Math.max(0,Number(getV(row,"sifon"))||0),
          bidon10:  Math.max(0,Number(getV(row,"bidon10"))||0),
          bidon20:  Math.max(0,Number(getV(row,"bidon20"))||0),
          dispenser:Math.max(0,Number(getV(row,"dispenser"))||0),
          saldo:    Number(getV(row,"saldo"))||0,
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
        barrio:p.barrio, manzana:p.manzana, lote:p.lote,
        sector:p.sector, aclaracion:p.aclaracion,
        notas:p.notas,
        telefono:p.telefono, maps:p.maps, dia:p.dia,
        sifon:p.sifon, bidon10:p.bidon10, bidon20:p.bidon20,
        dispenser:p.dispenser, saldo:p.saldo||0, orden:p.orden,
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
function GestionClientes({clientes, onEditar, onEliminar, onNuevo, onVolver, onReordenarTodo, onRegistrarVenta, onVerDetalle, ventas, prospectos, recordatorios, onConfirmarRecordatorio, onImportar, onIr}) {
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
          {id:"prospectos",ico:"🚀",lbl:"Prospectos", nav:"promocion"},
          {id:"fiados",   ico:"💰", lbl:"Fiados",  badge:cantFiados},
          {id:"dormidos", ico:"😴", lbl:"Dormidos", nav:"clientesDormidos"},
          {id:"agenda",   ico:"📅", lbl:"Agenda",  badge:cantAgenda},
          {id:"mapa",     ico:"🗺", lbl:"Mapa"},

        ].map(({id,ico,lbl,badge,nav})=>(
          <button key={id}
            style={{
              flex:1, padding:"10px 6px", border:"none", cursor:"pointer",
              background:"none", display:"flex", flexDirection:"column", alignItems:"center", gap:2,
              borderBottom:tab===id?"2px solid #5daaff":"2px solid transparent",
              color:tab===id?"var(--color-text-info)":"var(--color-text-tertiary)",
              position:"relative",
            }}
            onClick={()=>nav?(onIr&&onIr(nav)):setTab(id)}>
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
      {tab === "mapa" && (
        <MapaClientes
          clientes={clientes}
          dia="todos"
          fecha=""
          ventas={[]}
          noVisitas={[]}
          onSeleccionar={(c)=>{ onVerDetalle&&onVerDetalle(c); }}
          onActualizar={(lista)=>{ onReordenarTodo&&onReordenarTodo(lista); }}
          onVolver={()=>setTab("lista")}
        />
      )}

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

// ════════════════════════════════════════════════════════════════════
// ◆  GPS / Mapa de Clientes — agregado desde conversación
// ════════════════════════════════════════════════════════════════════

// ── Helpers GPS ──────────────────────────────────────────────────────────────
function extraerCoordsDeURL(url) {
  if(!url) return null;
  let m = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if(m) return {lat:parseFloat(m[1]),lng:parseFloat(m[2])};
  m = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if(m) return {lat:parseFloat(m[1]),lng:parseFloat(m[2])};
  m = url.match(/ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if(m) return {lat:parseFloat(m[1]),lng:parseFloat(m[2])};
  m = url.match(/\/dir\/[^/]*\/(-?\d+\.\d+),(-?\d+\.\d+)/);
  if(m) return {lat:parseFloat(m[1]),lng:parseFloat(m[2])};
  m = url.match(/\/(-2[0-9]\.\d{4,}),(-6[0-9]\.\d{4,})/);
  if(m) return {lat:parseFloat(m[1]),lng:parseFloat(m[2])};
  return null;
}
function esLinkCorto(url) {
  return url && (url.includes("maps.app.goo.gl") || url.includes("goo.gl/maps"));
}

// ── CargaGPSMasiva ────────────────────────────────────────────────────────────
function CargaGPSMasiva({clientes, onActualizar, onVolver}) {
  const sinGPS = React.useMemo(()=>(clientes||[]).filter(c=>!c.lat||!c.lng),[]);
  const [idx, setIdx] = React.useState(0);
  const [latVal, setLatVal] = React.useState("");
  const [lngVal, setLngVal] = React.useState("");
  const [guardados, setGuardados] = React.useState(0);
  const [listo, setListo] = React.useState(false);
  const actualizados = React.useRef([...clientes]);

  const cliente = sinGPS[idx] || null;
  const coordsDelLink = cliente?.maps ? extraerCoordsDeURL(cliente.maps) : null;

  React.useEffect(()=>{
    if(!cliente) return;
    if(coordsDelLink){ setLatVal(String(coordsDelLink.lat)); setLngVal(String(coordsDelLink.lng)); }
    else { setLatVal(""); setLngVal(""); }
  },[idx]);

  const guardarYSiguiente = (omitir=false) => {
    if(!omitir && cliente) {
      const lat=parseFloat(latVal), lng=parseFloat(lngVal);
      if(!isNaN(lat)&&!isNaN(lng)) {
        const i=actualizados.current.findIndex(c=>c.id===cliente.id);
        if(i>=0) actualizados.current[i]={...actualizados.current[i],lat,lng};
        const nuevosGuardados = guardados + 1;
        setGuardados(nuevosGuardados);
        const esUltimo = idx+1 >= sinGPS.length;
        if(nuevosGuardados % 5 === 0 || esUltimo) onActualizar([...actualizados.current]);
      }
    }
    setLatVal(""); setLngVal("");
    if(idx+1>=sinGPS.length) setListo(true);
    else setIdx(i=>i+1);
  };

  if(sinGPS.length===0 || listo || !cliente) return (
    <div style={{...s.screen,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,padding:32}}>
      <div style={{fontSize:48}}>✅</div>
      <div style={{fontSize:17,fontWeight:600,color:"var(--color-text-primary)",textAlign:"center"}}>¡GPS cargado!</div>
      <div style={{fontSize:13,color:"var(--color-text-secondary)",textAlign:"center"}}>{guardados} cliente{guardados!==1?"s":""} con GPS guardado.</div>
      <button style={s.btnPrimary} onClick={onVolver}>Ver mapa →</button>
    </div>
  );

  const progreso = Math.round((idx/sinGPS.length)*100);
  const dir = cliente.calle ? `${cliente.calle} ${cliente.nro||""}`.trim()
    : cliente.manzana ? `Mz ${cliente.manzana} L ${cliente.lote||""} · ${cliente.barrio||""}`
    : cliente.barrio||"";
  const latOk = latVal&&lngVal&&!isNaN(parseFloat(latVal))&&!isNaN(parseFloat(lngVal));

  return (
    <div style={{...s.screen,display:"flex",flexDirection:"column"}}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={onVolver}>← Volver</button>
        <span style={s.headerTitle}>Cargar GPS · {idx+1}/{sinGPS.length}</span>
      </div>
      <div style={{height:4,background:"var(--color-background-tertiary)"}}>
        <div style={{height:"100%",background:"#185FA5",width:`${progreso}%`,transition:"width 0.3s"}}/>
      </div>
      <div style={{padding:16,display:"flex",flexDirection:"column",gap:12}}>
        <div style={{...s.card,margin:0}}>
          <div style={{fontSize:16,fontWeight:600,color:"var(--color-text-primary)",marginBottom:2}}>{cliente.nombre}</div>
          <div style={{fontSize:12,color:"var(--color-text-secondary)"}}>{cliente.dia} · {dir}</div>
          {cliente.maps&&<div style={{fontSize:10,color:"var(--color-text-tertiary)",marginTop:2,wordBreak:"break-all"}}>{cliente.maps}</div>}
        </div>
        {coordsDelLink&&(
          <div style={{background:"var(--color-background-success)",borderRadius:10,padding:"10px 14px"}}>
            <div style={{fontSize:13,color:"var(--color-text-success)",fontWeight:600}}>✓ Coordenadas extraídas del link</div>
            <div style={{fontSize:12,color:"var(--color-text-success)"}}>{coordsDelLink.lat.toFixed(5)}, {coordsDelLink.lng.toFixed(5)}</div>
          </div>
        )}
        <div style={{background:"var(--color-background-info)",borderRadius:10,padding:"10px 14px"}}>
          <div style={{fontSize:12,color:"var(--color-text-info)",fontWeight:600,marginBottom:4}}>📋 Cómo obtener las coordenadas:</div>
          <div style={{fontSize:11,color:"var(--color-text-secondary)",lineHeight:1.8}}>
            1. Tocá <b>"Abrir en Maps"</b> abajo<br/>
            2. <b>Mantené presionado</b> el punto del cliente<br/>
            3. Aparecen los números arriba: <b>-26.865, -65.217</b><br/>
            4. Tocá esos números → <b>Copiar</b><br/>
            5. Volvé acá y pegá abajo
          </div>
        </div>
        {cliente.maps&&(
          <button style={{...s.btnPrimary,background:"#1a7a3a",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}
            onClick={()=>window.open(cliente.maps,"_blank")}>
            🗺 Abrir en Google Maps
          </button>
        )}
        <div style={{...s.card,margin:0}}>
          <label style={{...s.label,fontSize:12,fontWeight:600}}>Pegá las coordenadas (ej: -26.86590, -65.21780)</label>
          <input style={{...s.input,marginTop:4}} placeholder="-26.86590, -65.21780"
            value={latVal&&lngVal?`${latVal}, ${lngVal}`:latVal}
            onChange={e=>{
              const raw=e.target.value;
              const m=raw.match(/(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/);
              if(m){setLatVal(m[1]);setLngVal(m[2]);}
              else setLatVal(raw);
            }}
          />
          {latOk
            ?<div style={{fontSize:11,color:"#4dd9a0",marginTop:4}}>✓ {latVal}, {lngVal}</div>
            :<div style={{fontSize:11,color:"var(--color-text-tertiary)",marginTop:4}}>Pegá los dos números separados por coma</div>
          }
        </div>
        <div style={{display:"flex",gap:8}}>
          <button style={{...s.btn,flex:1,padding:"12px",fontSize:13}} onClick={()=>guardarYSiguiente(true)}>Omitir →</button>
          <button style={{...s.btnPrimary,flex:2,opacity:latOk||coordsDelLink?1:0.4}}
            disabled={!latOk&&!coordsDelLink}
            onClick={()=>guardarYSiguiente(false)}>
            Guardar y siguiente →
          </button>
        </div>
        <div style={{fontSize:11,color:"var(--color-text-tertiary)",textAlign:"center"}}>
          {guardados} guardados · {sinGPS.length-idx-1} restantes · Se sincroniza cada 5
        </div>
      </div>
    </div>
  );
}

// ── Algoritmo ruta óptima (vecino más cercano) ────────────────────────────────
function calcularRutaOptima(clientes) {
  if(clientes.length <= 1) return clientes;
  const dist = (a,b) => Math.hypot(a.lat-b.lat, a.lng-b.lng);
  const restantes = [...clientes];
  const ruta = [restantes.shift()];
  while(restantes.length > 0) {
    const ultimo = ruta[ruta.length-1];
    let minDist = Infinity, minIdx = 0;
    restantes.forEach((c,i)=>{ const d=dist(ultimo,c); if(d<minDist){minDist=d;minIdx=i;} });
    ruta.push(restantes.splice(minIdx,1)[0]);
  }
  return ruta;
}

// ── PreviaRuta ────────────────────────────────────────────────────────────────
function PreviaRuta({rutaOptima, ventasHoy, noVisHoy, onAplicar, onVolver}) {
  return (
    <div style={{...s.screen,display:"flex",flexDirection:"column"}}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={onVolver}>← Volver</button>
        <span style={s.headerTitle}>Ruta óptima sugerida</span>
      </div>
      <div style={{padding:"10px 14px",background:"var(--color-background-info)",borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
        <div style={{fontSize:13,color:"var(--color-text-info)",lineHeight:1.6}}>
          Orden que minimiza la distancia total del recorrido. Podés aplicarlo o volver sin cambios.
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",paddingBottom:80}}>
        {rutaOptima.map((c,i)=>{
          const entregado = ventasHoy.some(v=>v.clienteId===c.id);
          const noVis = noVisHoy.some(v=>v.clienteId===c.id);
          const dir = c.calle ? c.calle+" "+(c.nro||"") : c.manzana ? "Mz "+c.manzana+" L "+(c.lote||"") : c.barrio||"";
          return (
            <div key={c.id} style={{...s.card,margin:"6px 14px",display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:"#185FA5",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,flexShrink:0}}>{i+1}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:500,color:"var(--color-text-primary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.nombre}</div>
                <div style={{fontSize:11,color:"var(--color-text-secondary)"}}>{c.dia} · {dir}</div>
              </div>
              {entregado&&<span style={s.badge("success")}>✓</span>}
              {noVis&&<span style={s.badge("danger")}>✗</span>}
              {c.orden&&c.orden!==i+1&&<span style={{fontSize:10,color:"var(--color-text-tertiary)"}}>antes:{c.orden}</span>}
            </div>
          );
        })}
      </div>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,padding:"12px 16px",background:"var(--color-background-secondary)",borderTop:"0.5px solid var(--color-border-tertiary)",display:"flex",gap:8,zIndex:20}}>
        <button style={{...s.btn,flex:1,padding:"12px"}} onClick={onVolver}>Cancelar</button>
        <button style={{...s.btnPrimary,flex:2}} onClick={onAplicar}>✓ Aplicar este orden</button>
      </div>
    </div>
  );
}

// ── MapaClientes ──────────────────────────────────────────────────────────────
function MapaClientes({clientes, dia, fecha, ventas, noVisitas, onSeleccionar, onVolver, onActualizar}) {
  const mapRef = React.useRef(null);
  const mapInstRef = React.useRef(null);
  const [leafletOk, setLeafletOk] = React.useState(!!window.L);
  const [filtroDia, setFiltroDia] = React.useState(dia||"todos");
  const [modoCarga, setModoCarga] = React.useState(false);
  const [modoRuta, setModoRuta] = React.useState(false);
  const [mostrarRuta, setMostrarRuta] = React.useState(false);

  const ventasHoy = (ventas||[]).filter(v=>v.fechaKey===fecha);
  const noVisHoy  = (noVisitas||[]).filter(v=>v.fecha===fecha);
  const clientesFiltrados = (clientes||[]).filter(c=>{
    if(filtroDia!=="todos" && c.dia!==filtroDia) return false;
    return c.lat && c.lng;
  });
  const sinCoordenadas = (clientes||[]).filter(c=>(filtroDia==="todos"||c.dia===filtroDia)&&(!c.lat||!c.lng)).length;
  const entregadosCount = clientesFiltrados.filter(c=>ventasHoy.some(v=>v.clienteId===c.id)).length;
  const pendientesCount = clientesFiltrados.filter(c=>!ventasHoy.some(v=>v.clienteId===c.id)&&!noVisHoy.some(v=>v.clienteId===c.id)).length;
  const rutaOptima = React.useMemo(()=>calcularRutaOptima([...clientesFiltrados]),[clientesFiltrados.length, filtroDia]);

  React.useEffect(()=>{
    if(window.L){ setLeafletOk(true); return; }
    const link=document.createElement("link"); link.rel="stylesheet"; link.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; document.head.appendChild(link);
    const script=document.createElement("script"); script.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"; script.onload=()=>setLeafletOk(true); document.head.appendChild(script);
  },[]);

  React.useEffect(()=>{
    if(modoCarga||modoRuta) return;
    if(!leafletOk || !mapRef.current) return;
    if(mapInstRef.current){ mapInstRef.current.remove(); mapInstRef.current=null; }
    const L=window.L;
    const map=L.map(mapRef.current,{zoomControl:true,scrollWheelZoom:true});
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap",maxZoom:19}).addTo(map);
    mapInstRef.current=map;
    const bounds=[];
    const lista=mostrarRuta?rutaOptima:clientesFiltrados;
    lista.forEach((c,rutaIdx)=>{
      const entregado=ventasHoy.some(v=>v.clienteId===c.id);
      const noVis=noVisHoy.some(v=>v.clienteId===c.id);
      const color=entregado?"#4dd9a0":noVis?"#f07070":"#5daaff";
      const num=mostrarRuta?rutaIdx+1:(c.orden||"·");
      const icon=L.divIcon({className:"",html:`<div style="width:30px;height:30px;border-radius:50%;background:${color};border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;box-shadow:0 2px 6px rgba(0,0,0,.4)">${num}</div>`,iconSize:[30,30],iconAnchor:[15,15],popupAnchor:[0,-16]});
      const marker=L.marker([c.lat,c.lng],{icon}).addTo(map);
      const dir=c.calle?c.calle+" "+(c.nro||""):c.manzana?"Mz "+c.manzana+" L "+(c.lote||""):c.barrio||"";
      const estado=entregado?"<span style='color:#059669;font-weight:600'>✓ Entregado</span>":noVis?"<span style='color:#dc2626;font-weight:600'>✗ No visitado</span>":"<span style='color:#2563eb;font-weight:600'>⏳ Pendiente</span>";
      const popupId=`popup_btn_${c.id}`;
      marker.bindPopup(`<div style="font-family:sans-serif;min-width:170px;padding:4px 0"><div style="font-size:14px;font-weight:700;margin-bottom:2px">${c.nombre}</div><div style="font-size:11px;color:#666;margin-bottom:4px">${c.dia} · ${dir}</div><div style="margin-bottom:8px">${estado}</div>${!entregado?`<button id="${popupId}" style="background:#185FA5;color:#fff;border:none;border-radius:8px;padding:8px 14px;font-size:13px;font-weight:600;cursor:pointer;width:100%">Entregar →</button>`:""}</div>`);
      marker.on("popupopen",()=>{ const btn=document.getElementById(popupId); if(btn) btn.onclick=()=>{ map.closePopup(); onSeleccionar(c); }; });
      bounds.push([c.lat,c.lng]);
    });
    if(mostrarRuta&&rutaOptima.length>1) L.polyline(rutaOptima.map(c=>[c.lat,c.lng]),{color:"#185FA5",weight:3,opacity:0.7,dashArray:"8,6"}).addTo(map);
    if(bounds.length>0) map.fitBounds(bounds,{padding:[30,30]});
    else map.setView([-26.82,-65.2],13);
    return ()=>{ if(mapInstRef.current){ mapInstRef.current.remove(); mapInstRef.current=null; } };
  },[leafletOk,modoCarga,modoRuta,filtroDia,clientesFiltrados.length,mostrarRuta]);

  if(modoCarga) return <CargaGPSMasiva clientes={clientes} onActualizar={onActualizar} onVolver={()=>setModoCarga(false)} />;
  if(modoRuta) return <PreviaRuta rutaOptima={rutaOptima} ventasHoy={ventasHoy} noVisHoy={noVisHoy}
    onAplicar={()=>{
      const actualizados=[...clientes];
      rutaOptima.forEach((c,i)=>{ const idx=actualizados.findIndex(x=>x.id===c.id); if(idx>=0) actualizados[idx]={...actualizados[idx],orden:i+1}; });
      onActualizar(actualizados); setModoRuta(false); setMostrarRuta(true);
    }}
    onVolver={()=>setModoRuta(false)} />;

  return (
    <div style={{...s.screen,display:"flex",flexDirection:"column"}}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={onVolver}>← Volver</button>
        <span style={s.headerTitle}>Mapa de clientes</span>
        {clientesFiltrados.length>1&&<button style={{...s.btn,fontSize:11,padding:"5px 10px",background:"var(--color-background-info)",color:"var(--color-text-info)",border:"none"}} onClick={()=>setModoRuta(true)}>🗺 Ruta óptima</button>}
      </div>
      <div style={{display:"flex",gap:6,padding:"8px 14px",overflowX:"auto",background:"var(--color-background-secondary)",borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
        {["todos",...DIAS].map(d=>(
          <button key={d} style={{...s.btn,padding:"5px 12px",fontSize:12,flexShrink:0,background:filtroDia===d?"#185FA5":"var(--color-background-tertiary)",color:filtroDia===d?"#e2eaf4":"var(--color-text-secondary)",border:filtroDia===d?"none":"0.5px solid var(--color-border-secondary)"}} onClick={()=>setFiltroDia(d)}>
            {d==="todos"?"Todos":d}
          </button>
        ))}
      </div>
      <div style={{display:"flex",background:"var(--color-background-secondary)",borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
        {[{val:clientesFiltrados.length,lbl:"Con GPS",color:"#5daaff"},{val:entregadosCount,lbl:"Entregados",color:"#4dd9a0"},{val:pendientesCount,lbl:"Pendientes",color:"#f5b942"},{val:sinCoordenadas,lbl:"Sin GPS",color:"var(--color-text-tertiary)"}].map((item,i)=>(
          <div key={i} style={{flex:1,textAlign:"center",padding:"8px 4px",borderRight:i<3?"0.5px solid var(--color-border-tertiary)":"none"}}>
            <div style={{fontSize:16,fontWeight:600,color:item.color}}>{item.val}</div>
            <div style={{fontSize:9,color:"var(--color-text-secondary)"}}>{item.lbl}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:14,padding:"6px 14px",background:"var(--color-background-secondary)",borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
        {[["#4dd9a0","Entregado"],["#5daaff","Pendiente"],["#f07070","No visitado"]].map(([color,lbl])=>(
          <div key={lbl} style={{display:"flex",alignItems:"center",gap:4}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:color}}/><span style={{fontSize:10,color:"var(--color-text-secondary)"}}>{lbl}</span>
          </div>
        ))}
        {clientesFiltrados.length>1&&<button style={{...s.btn,fontSize:10,padding:"3px 8px",marginLeft:"auto",background:mostrarRuta?"#185FA5":"var(--color-background-tertiary)",color:mostrarRuta?"#e2eaf4":"var(--color-text-secondary)",border:"none"}} onClick={()=>setMostrarRuta(r=>!r)}>{mostrarRuta?"Ocultar ruta":"Ver ruta"}</button>}
      </div>
      {leafletOk&&clientesFiltrados.length===0&&(
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14,padding:32}}>
          <div style={{fontSize:40}}>📍</div>
          <div style={{fontSize:15,fontWeight:500,color:"var(--color-text-primary)",textAlign:"center"}}>Sin clientes con GPS</div>
          <button style={{...s.btnPrimary,maxWidth:260}} onClick={()=>setModoCarga(true)}>📍 Iniciar carga de GPS ({sinCoordenadas} clientes)</button>
        </div>
      )}
      {!leafletOk&&<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:13,color:"var(--color-text-secondary)"}}>Cargando mapa...</div></div>}
      <div style={{flex:1,position:"relative",display:leafletOk&&clientesFiltrados.length>0?"block":"none"}}>
        <div ref={mapRef} style={{width:"100%",height:"100%",minHeight:400}}/>
        {sinCoordenadas>0&&<button onClick={()=>setModoCarga(true)} style={{position:"absolute",bottom:16,right:16,zIndex:1000,background:"#185FA5",color:"#e2eaf4",border:"none",borderRadius:24,padding:"10px 16px",fontSize:13,fontWeight:600,cursor:"pointer",boxShadow:"0 3px 12px rgba(0,0,0,0.4)"}}>📍 {sinCoordenadas} sin GPS</button>}
      </div>
    </div>
  );
}
