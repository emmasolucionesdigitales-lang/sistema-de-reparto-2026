// ════════════════════════════════════════════════════════════════════
// ◆  13-config.js — Config · EnviarResumenEC
// ════════════════════════════════════════════════════════════════════

// ── Tarjeta de seguridad: activar/desactivar acceso con huella ──
// Usa las funciones que ya viven en 05-portada.js (bioSoportado, bioRegistrar, etc.)
function SeguridadHuella() {
  const soportado = (typeof bioSoportado === "function") ? bioSoportado() : false;
  const [enrolado, setEnrolado] = React.useState((typeof bioEnrolado === "function") ? bioEnrolado() : false);
  const [trabajando, setTrabajando] = React.useState(false);
  const [msg, setMsg] = React.useState("");

  const activar = async () => {
    setMsg(""); setTrabajando(true);
    try {
      await bioRegistrar();
      setEnrolado(true);
      setMsg("✓ Listo. La próxima vez que abras la app vas a poder entrar con tu huella.");
    } catch(e) {
      setMsg("No se pudo activar. Probá de nuevo, o usá un dispositivo con lector de huella / Face ID (suele andar en el celular).");
    }
    setTrabajando(false);
  };

  const desactivar = () => {
    // "sr_bio_cred" es la misma clave que usa 05-portada.js (SR_BIO_KEY)
    try { localStorage.removeItem("sr_bio_cred"); localStorage.removeItem("sr_bio_no"); } catch(e){}
    setEnrolado(false);
    setMsg("Huella desactivada. Vas a entrar con tu PIN.");
  };

  return (
    <>
      {!soportado ? (
        <p style={{fontSize:12,color:"var(--color-text-tertiary)",margin:"4px 0 0",lineHeight:1.5}}>
          Este dispositivo no tiene lector de huella / Face ID disponible. Suele funcionar desde el celular; probá abriendo la app ahí.
        </p>
      ) : (<>
        <p style={{fontSize:12,color:"var(--color-text-tertiary)",margin:"0 0 12px",lineHeight:1.5}}>
          Entrá a la app con tu huella en lugar de escribir el PIN. El PIN sigue funcionando por si lo necesitás.
        </p>
        {enrolado ? (
          <>
            <div style={{fontSize:13,fontWeight:600,color:"var(--color-text-success)",display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
              <span>✓</span><span>Huella activada</span>
            </div>
            <button style={{...s.btn,width:"100%",padding:"11px",fontSize:13,background:"var(--color-background-danger)",color:"var(--color-text-danger)",border:"0.5px solid var(--color-border-danger)",borderRadius:10,fontWeight:600,cursor:"pointer"}}
              onClick={desactivar}>Desactivar huella</button>
          </>
        ) : (
          <button style={{...s.btnPrimary,width:"100%",opacity:trabajando?0.6:1}} disabled={trabajando}
            onClick={activar}>{trabajando?"Verificando..." : "👆 Activar huella"}</button>
        )}
        {msg && <p style={{fontSize:12,color:"var(--color-text-secondary)",margin:"8px 0 0",lineHeight:1.5}}>{msg}</p>}
      </>)}
    </>
  );
}

// ── Acordeón simple: título + resumen, se expande al tocar ─────────────────
function SeccionPlegable({icono, titulo, resumen, children}) {
  const [abierto, setAbierto] = React.useState(false);
  return (
    <div style={{marginBottom:8,border:"0.5px solid var(--color-border-tertiary)",borderRadius:8,overflow:"hidden"}}>
      <button style={{width:"100%",background:"var(--color-background-tertiary)",border:"none",padding:"8px 10px",display:"flex",alignItems:"center",gap:6,cursor:"pointer",textAlign:"left"}}
        onClick={()=>setAbierto(!abierto)}>
        <span style={{fontSize:13}}>{icono}</span>
        <span style={{fontSize:11,color:"var(--color-text-secondary)",flex:1}}>{titulo}</span>
        <span style={{fontSize:12,color:"var(--color-text-primary)",fontWeight:600}}>{resumen}</span>
        <span style={{fontSize:11,color:"var(--color-text-tertiary)",marginLeft:4}}>{abierto?"▲":"▼"}</span>
      </button>
      {abierto&&<div style={{padding:"10px"}}>{children}</div>}
    </div>
  );
}

// ── Tarjeta de notificaciones ──────────────────────────────────────────────
function NotifConfig({syncData}) {
  const pedirPermiso = async () => {
    if(!('Notification' in window)) return;
    const r = await Notification.requestPermission();
    setPermiso(r);
  };
  const [permiso,setPermiso] = React.useState('Notification' in window ? Notification.permission : 'no-soportado');
  const [probando,setProbando] = React.useState(false);
  const [resultado,setResultado] = React.useState(null);
  const probar = async () => {
    setProbando(true); setResultado(null);
    try {
      if(typeof window.activarNotif!=='function'){ setResultado({ok:false,msg:'La función todavía no cargó, esperá unos segundos y probá de nuevo.'}); }
      else {
        const ok = await window.activarNotif();
        setResultado(ok?{ok:true,msg:'Suscripción guardada. Esto confirma que el navegador quedó registrado — no confirma que un aviso vaya a llegar (eso depende del servidor).'}:{ok:false,msg:'No se pudo activar. Revisá los permisos del navegador.'});
      }
    } catch(e){ setResultado({ok:false,msg:e.message||'Error inesperado'}); }
    setProbando(false);
  };
  const estadoColor = permiso === 'granted' ? '#4dd9a0' : permiso === 'denied' ? '#f07070' : '#f5b942';
  const estadoTexto = permiso === 'granted' ? '✅ Activadas' : permiso === 'denied' ? '🚫 Bloqueadas por el sistema' : permiso === 'no-soportado' ? '⚠ No soportado' : '⏳ Sin activar';
  return (
    <>
      <p style={{fontSize:12,color:"var(--color-text-tertiary)",margin:"0 0 10px",lineHeight:1.5}}>
        Avisos de cierre, transferencias, mantenimiento y agenda — funcionan con la app cerrada.
      </p>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{fontSize:13,fontWeight:600,color:estadoColor}}>{estadoTexto}</span>
        {permiso !== 'granted' && permiso !== 'denied' && (
          <button style={{background:"#185FA5",color:"#e2eaf4",border:"none",borderRadius:8,padding:"8px 16px",fontSize:13,fontWeight:500,cursor:"pointer"}}
            onClick={pedirPermiso}>Activar</button>
        )}
        {permiso === 'denied' && (
          <span style={{fontSize:11,color:"var(--color-text-tertiary)"}}>Activalas desde el navegador</span>
        )}
      </div>
      {permiso === 'granted' && (<>
        <button style={{width:"100%",background:"var(--color-background-tertiary)",color:"var(--color-text-primary)",border:"0.5px solid var(--color-border-secondary)",borderRadius:8,padding:"9px",fontSize:13,fontWeight:500,cursor:"pointer",marginBottom:6}}
          disabled={probando} onClick={probar}>
          {probando?"Probando...":"🔄 Probar / renovar suscripción de avisos"}
        </button>
        {resultado&&(
          <div style={{fontSize:12,color:resultado.ok?"var(--color-text-success)":"var(--color-text-danger)",lineHeight:1.4}}>
            {resultado.ok?"✓ ":"✗ "}{resultado.msg}
          </div>
        )}
        <SeccionPlegable icono="💳" titulo="Transferencias — horas de aviso" resumen={(()=>{try{const a=JSON.parse(localStorage.getItem('sr_horas_notif_trans')||'["13:00","19:00"]');return a[0]+' y '+a[1];}catch{return '13:00 y 19:00';}})()}>
          <div style={{display:"flex",gap:8}}>
            <input type="time"
              style={{padding:"8px 10px",border:"0.5px solid var(--color-border-secondary)",borderRadius:8,fontSize:14,background:"var(--color-background-tertiary)",color:"var(--color-text-primary)",outline:"none",boxSizing:"border-box",flex:1}}
              defaultValue={(()=>{try{return JSON.parse(localStorage.getItem('sr_horas_notif_trans')||'["13:00","19:00"]')[0];}catch{return '13:00';}})()}
              onChange={e=>{
                let arr; try{arr=JSON.parse(localStorage.getItem('sr_horas_notif_trans')||'["13:00","19:00"]');}catch{arr=['13:00','19:00'];}
                arr[0]=e.target.value; localStorage.setItem('sr_horas_notif_trans',JSON.stringify(arr)); syncData({horasAvisoTrans:arr});
              }}
            />
            <input type="time"
              style={{padding:"8px 10px",border:"0.5px solid var(--color-border-secondary)",borderRadius:8,fontSize:14,background:"var(--color-background-tertiary)",color:"var(--color-text-primary)",outline:"none",boxSizing:"border-box",flex:1}}
              defaultValue={(()=>{try{return JSON.parse(localStorage.getItem('sr_horas_notif_trans')||'["13:00","19:00"]')[1];}catch{return '19:00';}})()}
              onChange={e=>{
                let arr; try{arr=JSON.parse(localStorage.getItem('sr_horas_notif_trans')||'["13:00","19:00"]');}catch{arr=['13:00','19:00'];}
                arr[1]=e.target.value; localStorage.setItem('sr_horas_notif_trans',JSON.stringify(arr)); syncData({horasAvisoTrans:arr});
              }}
            />
          </div>
          <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginTop:4}}>Si a esa hora hay transferencias sin confirmar, recibís un aviso.</div>
        </SeccionPlegable>
        <SeccionPlegable icono="🔧" titulo="Mantenimiento — días antes del vencimiento" resumen={localStorage.getItem('sr_dias_notif_mant') || '3,2,1,0'}>
          <input type="text" placeholder="ej: 3,2,1,0"
            style={{padding:"8px 10px",border:"0.5px solid var(--color-border-secondary)",borderRadius:8,fontSize:14,background:"var(--color-background-tertiary)",color:"var(--color-text-primary)",outline:"none",boxSizing:"border-box",width:"100%"}}
            defaultValue={localStorage.getItem('sr_dias_notif_mant') || '3,2,1,0'}
            onChange={e=>{
              localStorage.setItem('sr_dias_notif_mant', e.target.value);
              const arr = e.target.value.split(',').map(n=>parseInt(n.trim(),10)).filter(n=>!isNaN(n));
              syncData({diasAvisoMant: arr});
            }}
          />
          <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginTop:4}}>Números separados por coma. Se avisa a las 7am si faltan esos días exactos.</div>
        </SeccionPlegable>
        <SeccionPlegable icono="⏰" titulo="Cierre del día — hora de aviso" resumen={localStorage.getItem('sr_hora_notif_cierre') || '18:00'}>
          <input type="time"
            style={{padding:"8px 10px",border:"0.5px solid var(--color-border-secondary)",borderRadius:8,fontSize:14,background:"var(--color-background-tertiary)",color:"var(--color-text-primary)",outline:"none",boxSizing:"border-box"}}
            defaultValue={localStorage.getItem('sr_hora_notif_cierre') || '18:00'}
            onChange={e=>{ localStorage.setItem('sr_hora_notif_cierre', e.target.value); syncData({horaAvisoCierre: e.target.value}); }}
          />
          <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginTop:4}}>Si a esa hora la planilla está vacía (y es día de reparto), recibís un aviso.</div>
        </SeccionPlegable>
        <div style={{fontSize:12,color:"var(--color-text-tertiary)",lineHeight:1.7,marginTop:8}}>
          📅 Recordatorios de agenda → a la hora exacta
        </div>
      </>)}
    </>
  );
}

function Config({productos,setProductos,clientes,setClientes,ventas,setVentas,planillas,setPlanillas,stock,setStock,cargasDia,setCargasDia,syncData,onVolver,ecToken,setEcToken,tabInicial}) {
  const [tab,setTab]=useState(["datos","vehiculo","apariencia"].includes(tabInicial)?tabInicial:"datos");
  const [abiertoNotif,setAbiertoNotif]=useState(false);
  const [abiertoHuella,setAbiertoHuella]=useState(false);
  const [abiertoRespaldo,setAbiertoRespaldo]=useState(false);
  const [abiertoMant,setAbiertoMant]=useState(false);
  const [editandoId,setEditandoId]=useState(null);
  // Exportar ventas a CSV — para llevarle algo armado a un contador, o
  // simplemente tener el historial en una planilla aparte de la app.
  const exportarVentasCSV = () => {
    if(!ventas||!ventas.length){ alert("No hay ventas para exportar."); return; }
    const clientePorId = {}; (clientes||[]).forEach(c=>{ clientePorId[c.id]=c.nombre; });
    const esc = (v) => `"${String(v??"").replace(/"/g,'""')}"`;
    const filas = [["Fecha","Día","Cliente","Productos","Monto","Forma de pago","Observaciones"].map(esc).join(",")];
    [...ventas].sort((a,b)=>(a.fechaKey||"").localeCompare(b.fechaKey||"")).forEach(v=>{
      if(v._esCobro||v._esAjuste||v._esAjusteEnvases) return;
      const prods = (v.detalle||[]).map(d=>`${d.nombre} x${d.cantidad}`).join(" · ");
      filas.push([v.fechaKey||"", v.dia||"", clientePorId[v.clienteId]||"", prods, v.neto||v.pagadoNum||0, v.pago||"", v.obs||""].map(esc).join(","));
    });
    const csv = "\uFEFF"+filas.join("\n");
    const blob = new Blob([csv], {type:"text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ventas_${new Date().toLocaleDateString("en-CA")}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url), 1500);
  };
  const [importando,setImportando]=useState(false);
  const [importandoClientes,setImportandoClientes]=useState(false);
  const [mantVeh,setMantVeh] = React.useState(()=>{try{return JSON.parse(localStorage.getItem("cat_mant_vehiculo_v1")||"[]");}catch{return [];}});
  const [mostrarNuevoMant,setMostrarNuevoMant] = React.useState(false);
  const saveMantVeh = (lista) => {setMantVeh(lista);localStorage.setItem("cat_mant_vehiculo_v1",JSON.stringify(lista));if(syncData)syncData({mantVeh:lista});};
  const prestados={sifon:clientes.reduce((a,c)=>a+(c.sifon||0),0),bidon10:clientes.reduce((a,c)=>a+(c.bidon10||0),0),bidon20:clientes.reduce((a,c)=>a+(c.bidon20||0),0)};
  const stockKeys={"Sifón 1.5L":"sifon","Bidón 10L":"bidon10","Bidón 20L":"bidon20","Dispenser":"dispenser"};
  return (
    <div style={s.screen}>
      <HeaderApp titulo="Configuración" onVolver={onVolver}/>
      <div style={{padding:"14px 14px 6px",background:"var(--color-background-secondary)"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:8}}>
          {[["datos","📋","Datos"],["vehiculo","🚐","Vehículo"],["apariencia","🎨","Estilo"]].map(([id,ico,lbl])=>(
            <button key={id} onClick={()=>setTab(id)} style={{
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,
              padding:"14px 8px",borderRadius:14,cursor:"pointer",
              border:`2px solid ${tab===id?"var(--color-accent)":"var(--color-border-tertiary)"}`,
              background:tab===id?"var(--color-background-info)":"var(--color-background-tertiary)",
              boxShadow:tab===id
                ?"0 0 0 1px var(--color-accent), 0 4px 16px rgba(24,95,165,0.25)"
                :"0 2px 6px rgba(0,0,0,0.25)",
              color:tab===id?"var(--color-text-info)":"var(--color-text-secondary)",
              transition:"all 0.18s",
            }}>
              <span style={{fontSize:26,lineHeight:1}}>{ico}</span>
              <span style={{fontSize:11,fontWeight:tab===id?600:400,letterSpacing:"0.03em"}}>{lbl}</span>
            </button>
          ))}
        </div>
      </div>
      {tab==="stock"&&<div style={{padding:16}}>
        <div style={{...s.card,margin:"0 0 14px",background:"var(--color-background-info)",border:"0.5px solid var(--color-border-info)",padding:"10px 14px"}}>
          <span style={{fontSize:13,fontWeight:700,color:"var(--color-text-info)"}}>💲 Precios y costos</span>
        </div>
        {productos.map(p=>{
          const editing = editandoId===p.id;
          const margen = p.precio>0?Math.round(((p.precio-p.costo)/p.precio)*100):0;
          return (
            <div key={p.id} style={{...s.card,margin:"0 0 10px",borderLeft:editing?"3px solid #185FA5":"0.5px solid var(--color-border-tertiary)"}}>
              {!editing?(
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <div style={{fontSize:15,fontWeight:500,color:"var(--color-text-primary)"}}>{p.nombre}</div>
                    <div style={{fontSize:12,color:"var(--color-text-secondary)",marginTop:4}}>
                      Venta: <b>{fmt(p.precio)}</b> · Costo: {fmt(p.costo)} ·
                      <span style={{color:margen>40?"var(--color-text-success)":margen>20?"var(--color-text-warning)":"var(--color-text-danger)"}}> {margen}% margen</span>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button style={{...s.btn,fontSize:11,padding:"4px 10px"}} onClick={()=>setEditandoId(p.id)}>Editar</button>
                    <button style={s.btnDanger} onClick={()=>{if(window.confirm(`¿Eliminar "${p.nombre}"?`))setProductos(productos.filter(x=>x.id!==p.id));}}>✕</button>
                  </div>
                </div>
              ):(
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                    <span style={{fontSize:14,fontWeight:500,color:"var(--color-text-primary)"}}>Editando: {p.nombre}</span>
                    <button style={{...s.btn,fontSize:11,padding:"3px 10px"}} onClick={()=>setEditandoId(null)}>Cancelar</button>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                    <div><label style={s.label}>Nombre</label><input style={s.input} defaultValue={p.nombre} id={`nm-${p.id}`} /></div>
                    <div><label style={s.label}>Precio de venta $</label><input style={s.inputNum} type="number" defaultValue={p.precio} id={`pr-${p.id}`} /></div>
                    <div><label style={s.label}>Costo de llenado $</label><input style={s.inputNum} type="number" defaultValue={p.costo} id={`co-${p.id}`} /></div>
                    <div><label style={s.label}>Unidad (ej: 1.5L)</label><input style={s.input} defaultValue={p.unidad||""} id={`un-${p.id}`} placeholder="opcional" /></div>
                  </div>
                  <button style={s.btnPrimary} onClick={()=>{
                    const nm=document.getElementById(`nm-${p.id}`).value;
                    const pr=Number(document.getElementById(`pr-${p.id}`).value);
                    const co=Number(document.getElementById(`co-${p.id}`).value);
                    const un=document.getElementById(`un-${p.id}`).value;
                    setProductos(productos.map(x=>x.id===p.id?{...x,nombre:nm,precio:pr,costo:co,unidad:un}:x));
                    setEditandoId(null);
                  }}>Guardar</button>
                </div>
              )}
            </div>
          );
        })}
        {editandoId==="nuevo"?(
          <div style={{...s.card,margin:"0 0 12px",borderLeft:"3px solid #4dd9a0"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <span style={{fontSize:14,fontWeight:500,color:"#4dd9a0"}}>Nuevo artículo</span>
              <button style={{...s.btn,fontSize:11,padding:"3px 10px"}} onClick={()=>setEditandoId(null)}>Cancelar</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              <div><label style={s.label}>Nombre</label><input style={s.input} id="nm-nuevo" placeholder="Ej: Bidón 20L" /></div>
              <div><label style={s.label}>Precio de venta $</label><input style={s.inputNum} type="number" id="pr-nuevo" placeholder="0" /></div>
              <div><label style={s.label}>Costo de llenado $</label><input style={s.inputNum} type="number" id="co-nuevo" placeholder="0" /></div>
              <div><label style={s.label}>Unidad</label><input style={s.input} id="un-nuevo" placeholder="ej: 20L" /></div>
            </div>
            <button style={{...s.btnPrimary,background:"#0F6E56"}} onClick={()=>{
              const nm=document.getElementById("nm-nuevo").value.trim();
              if(!nm) return;
              const pr=Number(document.getElementById("pr-nuevo").value)||0;
              const co=Number(document.getElementById("co-nuevo").value)||0;
              const un=document.getElementById("un-nuevo").value;
              setProductos([...productos,{id:Date.now(),nombre:nm,precio:pr,costo:co,unidad:un}]);
              setEditandoId(null);
            }}>+ Agregar artículo</button>
          </div>
        ):(
          <button style={{...s.btn,width:"100%",padding:"10px",fontSize:13,marginBottom:16,borderStyle:"dashed"}}
            onClick={()=>setEditandoId("nuevo")}>+ Agregar nuevo artículo</button>
        )}
        <CalculadoraCostoReal productos={productos} ventas={ventas} />

        {/* ── Stock en depósito ── */}
        <div style={{...s.card,margin:"16px 0 14px",background:"var(--color-background-info)",border:"0.5px solid var(--color-border-info)",padding:"10px 14px"}}>
          <span style={{fontSize:13,fontWeight:700,color:"var(--color-text-info)"}}>📦 Stock en depósito</span>
        </div>
        {[["soderia","🏭 Sodería"],["casa","🏠 Casa"],["camion","🚚 Camión"]].map(([lugar,titulo])=>(
          <div key={lugar} style={{...s.card,margin:"0 0 12px"}}>
            <div style={{fontSize:14,fontWeight:500,color:"var(--color-text-primary)",marginBottom:10}}>{titulo}</div>
            <div style={s.grid3}>
              {[["sifon","Sifón"],["bidon10","Bidón 10L"],["bidon20","Bidón 20L"]].map(([k,l])=>(
                <div key={k}>
                  <label style={{...s.label,textAlign:"center"}}>{l}</label>
                  <input style={{...s.inputNum,textAlign:"center"}} type="number" min={0}
                    value={stock?.[lugar]?.[k]??0}
                    onChange={e=>{
                      const ns=JSON.parse(JSON.stringify(stock||{}));
                      if(!ns[lugar]) ns[lugar]={sifon:0,bidon10:0,bidon20:0};
                      ns[lugar][k]=Number(e.target.value)||0;
                      setStock(ns);
                    }}/>
                </div>
              ))}
            </div>
          </div>
        ))}
        <button style={s.btnPrimary} onClick={()=>{syncData({stock});alert("✅ Stock guardado");}}>Guardar stock</button>

        {/* ── Carga diaria del camión ── */}
        <div style={{...s.card,margin:"16px 0 14px",background:"var(--color-background-info)",border:"0.5px solid var(--color-border-info)",padding:"10px 14px"}}>
          <span style={{fontSize:13,fontWeight:700,color:"var(--color-text-info)"}}>🚚 Carga diaria del camión</span>
        </div>
        <p style={{fontSize:13,color:"var(--color-text-secondary)",marginBottom:16,lineHeight:1.6}}>
          Cantidades con las que salís cada día (cajones de soda = 6 sifones c/u).
        </p>
        {DIAS.map(function(dia){
          var c = (cargasDia||CARGA_DIA_DEFAULT)[dia]||{soda:0,b10:0,b20:0};
          var cajones = Math.floor((c.soda||0)/6);
          return (
            <div key={dia} style={{...s.card,margin:"0 0 12px"}}>
              <div style={{fontSize:14,fontWeight:500,color:"var(--color-text-primary)",marginBottom:12}}>{dia}</div>
              <div style={s.grid3}>
                <div>
                  <label style={{...s.label,textAlign:"center"}}>Cajones soda</label>
                  <input style={{...s.inputNum,textAlign:"center"}} type="number" min={0}
                    value={cajones||""} placeholder="0"
                    onChange={e=>{var caj=Number(e.target.value)||0;var nuevo=Object.assign({},cargasDia||CARGA_DIA_DEFAULT);nuevo[dia]=Object.assign({},c,{soda:caj*6});setCargasDia(nuevo);}} />
                  <div style={{fontSize:10,color:"var(--color-text-tertiary)",textAlign:"center",marginTop:2}}>{c.soda||0} unidades</div>
                </div>
                <div>
                  <label style={{...s.label,textAlign:"center"}}>Bidón 10L</label>
                  <input style={{...s.inputNum,textAlign:"center"}} type="number" min={0}
                    value={c.b10||""} placeholder="0"
                    onChange={e=>{var nuevo=Object.assign({},cargasDia||CARGA_DIA_DEFAULT);nuevo[dia]=Object.assign({},c,{b10:Number(e.target.value)||0});setCargasDia(nuevo);}} />
                </div>
                <div>
                  <label style={{...s.label,textAlign:"center"}}>Bidón 20L</label>
                  <input style={{...s.inputNum,textAlign:"center"}} type="number" min={0}
                    value={c.b20||""} placeholder="0"
                    onChange={e=>{var nuevo=Object.assign({},cargasDia||CARGA_DIA_DEFAULT);nuevo[dia]=Object.assign({},c,{b20:Number(e.target.value)||0});setCargasDia(nuevo);}} />
                </div>
              </div>
            </div>
          );
        })}
        <button style={s.btnPrimary} onClick={()=>{setCargasDia(Object.assign({},cargasDia));alert("✅ Cargas guardadas");}}>Guardar cargas</button>
      </div>}
      {tab==="datos"&&(
        <div style={{padding:16,display:"flex",flexDirection:"column",gap:12}}>

          {/* NOTIFICACIONES */}
          <div style={{...s.card,margin:0}}>
            <button style={{width:"100%",background:"var(--color-background-tertiary)",border:"none",borderRadius:10,padding:"14px 16px",display:"flex",alignItems:"center",gap:8,cursor:"pointer",textAlign:"left"}}
              onClick={()=>setAbiertoNotif(!abiertoNotif)}>
              <span style={{fontSize:18}}>🔔</span>
              <span style={{fontSize:16,fontWeight:600,color:"var(--color-text-primary)",flex:1}}>Notificaciones</span>
              <span style={{width:26,height:26,borderRadius:"50%",background:"var(--color-background-primary)",color:"var(--color-text-info)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{abiertoNotif?"▲":"▼"}</span>
            </button>
            {abiertoNotif&&<div style={{marginTop:10}}><NotifConfig syncData={syncData} /></div>}
          </div>

          {/* SEGURIDAD — acceso con huella */}
          <div style={{...s.card,margin:0}}>
            <button style={{width:"100%",background:"var(--color-background-tertiary)",border:"none",borderRadius:10,padding:"14px 16px",display:"flex",alignItems:"center",gap:8,cursor:"pointer",textAlign:"left"}}
              onClick={()=>setAbiertoHuella(!abiertoHuella)}>
              <span style={{fontSize:18}}>🔒</span>
              <span style={{fontSize:16,fontWeight:600,color:"var(--color-text-primary)",flex:1}}>Acceso con huella</span>
              <span style={{width:26,height:26,borderRadius:"50%",background:"var(--color-background-primary)",color:"var(--color-text-info)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{abiertoHuella?"▲":"▼"}</span>
            </button>
            {abiertoHuella&&<div style={{marginTop:10}}><SeguridadHuella /></div>}
          </div>

          {/* RESPALDO */}
          <div style={{...s.card,margin:0}}>
            <button style={{width:"100%",background:"var(--color-background-tertiary)",border:"none",borderRadius:10,padding:"14px 16px",display:"flex",alignItems:"center",gap:8,cursor:"pointer",textAlign:"left"}}
              onClick={()=>setAbiertoRespaldo(!abiertoRespaldo)}>
              <span style={{fontSize:18}}>💾</span>
              <span style={{fontSize:16,fontWeight:600,color:"var(--color-text-primary)",flex:1}}>Respaldo</span>
              <span style={{width:26,height:26,borderRadius:"50%",background:"var(--color-background-primary)",color:"var(--color-text-info)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{abiertoRespaldo?"▲":"▼"}</span>
            </button>
            {abiertoRespaldo&&(<div style={{marginTop:10}}>
            <p style={{fontSize:12,color:"var(--color-text-tertiary)",margin:"0 0 12px",lineHeight:1.5}}>
              Guardá todos los datos en un archivo. Descargalo seguido y guardalo en otro lado (mail, Drive). Si se pierde el celular, lo restaurás y recuperás todo.
            </p>
            <button style={{...s.btnPrimary,width:"100%",marginBottom:8}} onClick={()=>{
              if(typeof window._descargarRespaldo==="function") window._descargarRespaldo();
              else alert("No se pudo generar el respaldo. Recargá la app e intentá de nuevo.");
            }}>
              💾 Descargar respaldo (.json)
            </button>
            <button style={{...s.btn,width:"100%",marginBottom:8}} onClick={exportarVentasCSV}>
              📊 Exportar ventas (.csv, para Excel/contador)
            </button>
            <div style={{display:"flex",gap:8}}>
              <label style={{...s.btn,flex:1,padding:"10px",display:"block",textAlign:"center",cursor:"pointer",boxSizing:"border-box",fontSize:12}}>
                ♻️ Restaurar
                <input type="file" accept=".json,application/json" style={{display:"none"}} onChange={(e)=>{
                  const file=e.target.files&&e.target.files[0];
                  if(!file) return;
                  if(!window.confirm("⚠️ Restaurar va a REEMPLAZAR todos los datos actuales por los del archivo. ¿Seguro?")){ e.target.value=""; return; }
                  const reader=new FileReader();
                  reader.onload=(ev)=>{
                    try{
                      const data=JSON.parse(ev.target.result);
                      const ok=window._restaurarRespaldo&&window._restaurarRespaldo(data);
                      if(ok) alert("✅ Respaldo restaurado. Revisá que esté todo en orden.");
                    }catch(err){ alert("El archivo no es un respaldo válido (.json). "+err.message); }
                    e.target.value="";
                  };
                  reader.readAsText(file);
                }} />
              </label>
              <button style={{...s.btn,flex:1,padding:"10px",fontSize:12}} onClick={()=>exportarExcel(clientes,ventas,productos,planillas)}>
                📊 Exportar Excel
              </button>
            </div>
            </div>)}
          </div>

          {/* IMPORTAR CLIENTES */}
          <div style={{...s.card,margin:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <span style={{fontSize:18}}>📥</span>
              <span style={{fontSize:14,fontWeight:600,color:"var(--color-text-primary)"}}>Importar clientes</span>
            </div>
          {/* Importar clientes */}
          <label style={{
            display:"flex",alignItems:"center",justifyContent:"center",gap:8,
            width:"100%",padding:"11px",borderRadius:10,border:"0.5px solid var(--color-border-secondary)",
            background:importandoClientes?"var(--color-background-info)":"var(--color-background-tertiary)",
            color:importandoClientes?"var(--color-text-info)":"var(--color-text-secondary)",
            fontSize:13,cursor:importandoClientes?"wait":"pointer",boxSizing:"border-box",
          }}>
            {importandoClientes?"⏳ Leyendo archivo...":"📥 Importar clientes desde Excel"}
            <input type="file" accept=".xlsx,.xls" style={{display:"none"}} disabled={importandoClientes}
              onChange={e=>{
                const file=e.target.files[0]; if(!file) return;
                setImportandoClientes(true);
                const MAPDIA={lunes:"Lunes",martes:"Martes",miercoles:"Miércoles",jueves:"Jueves",viernes:"Viernes",sabado:"Sábado"};
                const norm=(s)=>String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[°\s_\-\.\/]/g,"").trim();
                const procesarBuffer=(buffer)=>{
                  try{
                    const wb=window.XLSX.read(new Uint8Array(buffer),{type:"array"});
                    const ws=wb.Sheets[wb.SheetNames[0]];
                    const json=window.XLSX.utils.sheet_to_json(ws,{header:1,defval:""});
                    if(!json||json.length<2){alert("El archivo está vacío.");setImportandoClientes(false);return;}
                    let hIdx=0;
                    for(let i=0;i<Math.min(json.length,8);i++){
                      const r=json[i].map(norm);
                      const esH=r.some(c=>c==="nombre"||c==="dia"||c==="barrio"||c==="calle"||c.includes("nombreyapellido")||c.includes("diadereparto")||c.includes("norden"));
                      if(esH){hIdx=i;break;}
                    }
                    const heads=json[hIdx].map(h=>String(h).trim());
                    const filas=json.slice(hIdx+1).filter(r=>{
                      const p=String(r[0]||"").trim();
                      if(!p) return false;
                      if(p.startsWith("▼")||p.startsWith("→")||p.startsWith("//")) return false;
                      return true;
                    });
                    const col={};
                    heads.forEach((h,i)=>{
                      const hn=norm(h);
                      if(hn==="nombre"||(hn.includes("nombre")&&!hn.includes("apellido"))||(hn.includes("nombre")&&hn.includes("apellido"))) col.nombre=i;
                      if(hn==="dia"||hn.includes("diadereparto")||hn.includes("diareparto")) col.dia=i;
                      if(hn==="barrio") col.barrio=i;
                      if(hn.includes("manzana")||hn==="mz"||hn==="mza") col.manzana=i;
                      if(hn==="lote"||hn==="lt") col.lote=i;
                      if(hn==="sector"&&!hn.includes("mapa")) col.sector=i;
                      if(hn==="calle"||hn.includes("direcc")) col.calle=i;
                      if(hn==="n"||hn==="nro"||hn==="numero") col.nro=i;
                      if(hn.includes("aclar")||hn.includes("depto")||hn.includes("aclaracion")) col.aclaracion=i;
                      if(hn.includes("telef")||hn.includes("cel")||hn==="telefono") col.telefono=i;
                      if(hn.includes("maps")||hn.includes("ubic")||hn.includes("gps")||hn.includes("google")) col.maps=i;
                      if(hn.includes("sifon")||(hn.includes("soda")&&!hn.includes("bidon"))) col.sifon=i;
                      if(hn.includes("10")&&(hn.includes("bidon")||hn.includes("agua")||hn.includes("bid"))) col.bidon10=i;
                      if(hn.includes("20")&&(hn.includes("bidon")||hn.includes("agua")||hn.includes("bid"))) col.bidon20=i;
                      if(hn.includes("dispen")) col.dispenser=i;
                      if(hn==="orden"||hn==="ord"||hn==="order"||hn.includes("norden")||hn.includes("ordenenruta")||hn.includes("ordenruta")) col.orden=i;
                      if(hn.includes("saldo")) col.saldo=i;
                      if(hn.includes("nota")||hn.includes("observ")) col.notas=i;
                    });
                    const getV=(row,campo)=>col[campo]!==undefined?String(row[col[campo]]||"").trim():"";
                    let maxId=Math.max(0,...clientes.map(c=>c.id||0));
                    let countNuevos=0, countActualizados=0;
                    const nuevos=[...clientes];
                    const pendientesActualizar=[];
                    filas.forEach(row=>{
                      const nombre=getV(row,"nombre"); if(!nombre) return;
                      const rawDia=getV(row,"dia");
                      const diaKey=norm(rawDia);
                      const dia=MAPDIA[diaKey]||(DIAS||[]).find(d=>norm(d)===diaKey)||rawDia||"Lunes";
                      const datos={
                        nombre, calle:getV(row,"calle"), nro:getV(row,"nro"),
                        barrio:getV(row,"barrio"), manzana:getV(row,"manzana"),
                        lote:getV(row,"lote"), sector:getV(row,"sector"),
                        aclaracion:getV(row,"aclaracion"), notas:getV(row,"notas"),
                        telefono:getV(row,"telefono"), maps:getV(row,"maps"), dia,
                        sifon:Math.max(0,Number(getV(row,"sifon"))||0),
                        bidon10:Math.max(0,Number(getV(row,"bidon10"))||0),
                        bidon20:Math.max(0,Number(getV(row,"bidon20"))||0),
                        dispenser:Math.max(0,Number(getV(row,"dispenser"))||0),
                        saldo:Number(getV(row,"saldo"))||0,
                        orden:Number(getV(row,"orden"))||9999,
                      };
                      const idx=nuevos.findIndex(c=>c.nombre.toLowerCase()===nombre.toLowerCase());
                      if(idx===-1){
                        nuevos.push({id:++maxId,...datos});
                        countNuevos++;
                      } else {
                        pendientesActualizar.push({idx,datos});
                      }
                    });
                    if(countNuevos===0 && pendientesActualizar.length===0){
                      alert("No se encontraron clientes en el archivo.");
                      setImportandoClientes(false); return;
                    }
                    // Si hay duplicados, preguntar si actualizar
                    if(pendientesActualizar.length>0){
                      const msg = countNuevos>0
                        ? `✅ ${countNuevos} cliente${countNuevos>1?"s":""} nuevo${countNuevos>1?"s":""}.\n⚠️ ${pendientesActualizar.length} ya exist${pendientesActualizar.length>1?"en":"e"}.\n\n¿Actualizar los existentes con los datos del Excel?`
                        : `⚠️ Los ${pendientesActualizar.length} cliente${pendientesActualizar.length>1?"s":""} del archivo ya existen en la app.\n\n¿Actualizar sus datos con los del Excel?`;
                      if(window.confirm(msg)){
                        pendientesActualizar.forEach(({idx,datos})=>{
                          nuevos[idx]={...nuevos[idx],...datos};
                          countActualizados++;
                        });
                      }
                    }
                    const total=countNuevos+countActualizados;
                    if(total===0){alert("No se realizaron cambios.");setImportandoClientes(false);return;}
                    setClientes(nuevos);syncData({clientes:nuevos});
                    alert(`✅ Importación completada:\n• ${countNuevos} cliente${countNuevos!==1?"s":""} nuevo${countNuevos!==1?"s":""}\n• ${countActualizados} actualizado${countActualizados!==1?"s":""}`);
                  }catch(err){console.error(err);alert("Error al leer el archivo. Verificá que sea un .xlsx válido.");}
                  setImportandoClientes(false);
                };
                const leer=()=>{const r=new FileReader();r.onload=ev=>procesarBuffer(ev.target.result);r.onerror=()=>{alert("Error al abrir el archivo.");setImportandoClientes(false);};r.readAsArrayBuffer(file);};
                if(window.XLSX){leer();return;}
                const sc=document.createElement("script");
                sc.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
                sc.onload=leer;sc.onerror=()=>{setImportandoClientes(false);alert("Sin conexión. Intentá de nuevo.");};
                document.head.appendChild(sc);
              }}
            />
          </label>
          </div>

          {/* MANTENIMIENTO DE DATOS */}
          <div style={{...s.card,margin:0}}>
            <button style={{width:"100%",background:"var(--color-background-tertiary)",border:"none",borderRadius:10,padding:"14px 16px",display:"flex",alignItems:"center",gap:8,cursor:"pointer",textAlign:"left"}}
              onClick={()=>setAbiertoMant(!abiertoMant)}>
              <span style={{fontSize:18}}>🔧</span>
              <span style={{fontSize:16,fontWeight:600,color:"var(--color-text-primary)",flex:1}}>Mantenimiento de datos</span>
              <span style={{width:26,height:26,borderRadius:"50%",background:"var(--color-background-primary)",color:"var(--color-text-info)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{abiertoMant?"▲":"▼"}</span>
            </button>
            {abiertoMant&&(<div style={{marginTop:10}}>
            <button style={{...s.btn,width:"100%",padding:"10px",fontSize:13}}
              onClick={()=>{if(window.confirm("¿Subir todos los datos a la nube?")){
                cloudSave({clientes,ventas,planillas,stock,productos,noVisitas:(noVisitas||[]),prospectos:(prospectos||[])})
                  .then(()=>alert("✅ Datos sincronizados."))
                  .catch(()=>alert("❌ Error. Verificá tu conexión."));
              }}}>
              🔄 Forzar sincronización
            </button>
            </div>)}
          </div>

          {/* ESPACIO USADO */}
          <div style={{...s.card,margin:0}}>
            {(()=>{
              let total=0;
              try{for(let k in localStorage){if(localStorage.hasOwnProperty(k)){total+=((localStorage[k]||'').length*2);}}}catch(e){}
              const kb=Math.round(total/1024);
              const pct=Math.min(100,Math.round(kb/5120*100));
              const color=pct>80?"#e05c5c":pct>50?"#f5b942":"#4dd9a0";
              return (
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <span style={{fontSize:13,fontWeight:500,color:"var(--color-text-secondary)"}}>💾 Espacio usado</span>
                    <span style={{fontSize:12,color:"var(--color-text-tertiary)"}}>{kb} KB · {pct}%</span>
                  </div>
                  <div style={{height:8,background:"var(--color-background-tertiary)",borderRadius:4,overflow:"hidden"}}>
                    <div style={{height:"100%",width:pct+"%",background:color,borderRadius:4}}/>
                  </div>
                  {pct>70&&<div style={{fontSize:12,color:"#e05c5c",marginTop:8}}>⚠️ Espacio alto. Eliminá fotos si la app falla.</div>}
                </div>
              );
            })()}
          </div>

          {/* EMMA CONTROL (plegable) */}
          <details style={{...s.card,margin:0}}>
            <summary style={{fontSize:14,fontWeight:600,color:"var(--color-text-primary)",cursor:"pointer"}}>🔗 Vincular con Emma Control</summary>
            <div style={{marginTop:10}}>
              <input value={ecToken}
                onChange={e=>{const v=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,10);setEcToken(v);localStorage.setItem('lc_ec_token',v);}}
                placeholder="Ej: EC4A8F2D"
                style={{width:'100%',background:"var(--color-background-tertiary)",
                  border:`2px solid ${ecToken?"var(--color-accent)":"var(--color-border-secondary)"}`,
                  borderRadius:10,padding:'10px 14px',fontSize:16,color:"var(--color-text-primary)",
                  fontFamily:'monospace',letterSpacing:'0.15em',fontWeight:700,outline:'none',boxSizing:'border-box',
                  textTransform:'uppercase',marginBottom:8}}
              />
              {ecToken&&ecToken.length>=8
                ?<div style={{display:'flex',alignItems:'center',gap:8,background:"rgba(16,158,100,0.12)",border:"0.5px solid rgba(16,158,100,0.3)",borderRadius:10,padding:'8px 14px',marginBottom:8}}>
                   <span>✅</span><div style={{fontSize:12,color:"#10d07a",fontWeight:600}}>Vinculado — datos se envían al cerrar el día</div>
                 </div>
                :<div style={{display:'flex',alignItems:'center',gap:8,background:"var(--color-background-tertiary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:10,padding:'8px 14px',marginBottom:8}}>
                   <span>⚪</span><div style={{fontSize:12,color:"var(--color-text-secondary)"}}>Sin vincular — ingresá el código para activar</div>
                 </div>
              }
              {ecToken&&<button onClick={()=>{if(window.confirm('¿Desvincular?')){setEcToken('');localStorage.removeItem('lc_ec_token');}}}
                style={{background:'none',border:'0.5px solid rgba(240,82,82,0.4)',borderRadius:8,padding:'6px 12px',color:'#f05252',fontSize:12,cursor:'pointer',width:'100%'}}>
                🗑️ Desvincular Emma Control
              </button>}
            </div>
          </details>

          {/* WhatsApp */}
          <a href="https://wa.me/5493813399962?text=Hola%2C+necesito+ayuda+con+Sistema+de+Reparto"
            target="_blank" rel="noopener"
            style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,
              padding:"12px",borderRadius:10,background:"#0a2e1f",
              border:"1px solid #4dd9a0",color:"#4dd9a0",fontSize:13,fontWeight:600,textDecoration:"none"}}>
            💬 Soporte por WhatsApp
          </a>

          {/* ZONA PELIGROSA (plegable) */}
          <details style={{...s.card,margin:0,border:"1px solid rgba(220,38,38,0.3)"}}>
            <summary style={{fontSize:13,fontWeight:600,color:"#e05c5c",cursor:"pointer"}}>⚠️ Zona peligrosa</summary>
            <div style={{marginTop:10}}>
            <button style={{width:"100%",padding:"12px",borderRadius:10,border:"1px solid #e05c5c",
              background:"rgba(220,38,38,0.1)",color:"#e05c5c",fontSize:13,fontWeight:600,cursor:"pointer"}}
              onClick={async ()=>{
                if(!window.confirm("⚠️ ¿Borrar TODOS los clientes, ventas y movimientos?\n\nLos productos y stock se conservan.")) return;
                if(syncData) syncData({clientes:[],ventas:[],planillas:{},noVisitas:[],prospectos:[],recordatorios:[],histPrecios:[],mantVeh:[]});
                Object.keys(localStorage).filter(k=>k.startsWith("lc_")&&!k.startsWith("lc_ec_")&&!k.startsWith("lc_dark")&&!k.startsWith("lc_tema")).forEach(k=>localStorage.removeItem(k));
                window.location.reload();
              }}>
              🗑️ Borrar clientes, ventas y movimientos
            </button>
              <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginTop:6,textAlign:"center"}}>Los productos y stock se conservan</div>
            </div>
          </details>
        </div>
      )}
      {tab==="vehiculo"&&(
        <div style={{padding:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div>
              <div style={{fontSize:15,fontWeight:600,color:"var(--color-text-primary)"}}>🔧 Mantenimiento del vehículo</div>
              <div style={{fontSize:12,color:"var(--color-text-tertiary)",marginTop:2}}>Historial de service y reparaciones</div>
            </div>
            <button style={{...s.btnPrimary,padding:"8px 14px",fontSize:13}} onClick={()=>setMostrarNuevoMant(true)}>+ Registrar</button>
          </div>
          {mantVeh.length===0&&(
            <div style={{textAlign:"center",padding:"40px 20px",color:"var(--color-text-tertiary)"}}>
              <div style={{fontSize:40,marginBottom:10}}>🚐</div>
              <div style={{fontSize:14}}>Sin registros aún</div>
              <div style={{fontSize:12,marginTop:6}}>Registrá cambios de aceite, service y reparaciones</div>
            </div>
          )}
          {[...mantVeh].reverse().map((m,i)=>(
            <div key={i} style={{...s.card,margin:"0 0 10px",borderLeft:`3px solid ${m.tipo==="aceite"?"#f5b942":m.tipo==="preventivo"?"#4dd9a0":m.tipo==="embrague"?"#e05c5c":m.tipo==="reparacion"?"#5daaff":m.tipo==="gnc"?"#22c55e":m.tipo==="vtv"?"#3b82f6":"#a0aec0"}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:600,color:"var(--color-text-primary)"}}>
                    {m.tipo==="aceite"?"🛢 Cambio de aceite":m.tipo==="preventivo"?"🔩 Mantenimiento preventivo":m.tipo==="embrague"?"⚙️ Cambio de embrague":m.tipo==="reparacion"?"🛠 Reparación":m.tipo==="gnc"?"🟢 Oblea GNC":m.tipo==="vtv"?"🔵 VTV":m.tipo==="otro"?"📋 "+(m.otroDetalle||"Otro"):"📋 "+m.tipo}
                  </div>
                  {m.descripcion&&<div style={{fontSize:12,color:"var(--color-text-secondary)",marginTop:4}}>{m.descripcion}</div>}
                  <div style={{display:"flex",gap:12,marginTop:6,flexWrap:"wrap"}}>
                    {m.km&&<span style={{fontSize:12,color:"var(--color-text-tertiary)"}}>📊 {Number(m.km).toLocaleString("es-AR")} km</span>}
                    {m.costo&&<span style={{fontSize:12,color:"var(--color-text-tertiary)"}}>💰 ${Number(m.costo).toLocaleString("es-AR")}</span>}
                  </div>
                  {m.proximo&&<div style={{fontSize:12,color:"#f5b942",marginTop:4,borderTop:"0.5px solid var(--color-border-tertiary)",paddingTop:4}}>⏰ Próximo: {m.proximo}</div>}
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,marginLeft:10,flexShrink:0}}>
                  <span style={{fontSize:11,color:"var(--color-text-tertiary)"}}>{m.fecha}</span>
                  <button style={{background:"#3a2020",color:"#e05c5c",border:"none",borderRadius:6,padding:"3px 8px",fontSize:11,cursor:"pointer"}}
                    onClick={()=>saveMantVeh(mantVeh.filter((_,j)=>mantVeh.length-1-j!==i))}>Borrar</button>
                </div>
              </div>
            </div>
          ))}
          {mostrarNuevoMant&&(
            <VehiculoMantModal
              onGuardar={(reg)=>{saveMantVeh([...mantVeh,reg]);setMostrarNuevoMant(false);}}
              onCerrar={()=>setMostrarNuevoMant(false)}
            />
          )}
        </div>
      )}
      {tab==="apariencia"&&(
        <div style={{padding:16}}>
          <ConfigAparienciaLC />
        </div>
      )}


    </div>
  );
}

