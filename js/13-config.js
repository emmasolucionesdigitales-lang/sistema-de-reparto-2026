// ════════════════════════════════════════════════════════════════════
// ◆  13-config.js — Config · EnviarResumenEC
// ════════════════════════════════════════════════════════════════════

function Config({productos,setProductos,clientes,setClientes,ventas,setVentas,planillas,setPlanillas,stock,setStock,cargasDia,setCargasDia,syncData,onVolver,ecToken,setEcToken,tabInicial}) {
  const [tab,setTab]=useState(tabInicial||"stock");
  const [editandoId,setEditandoId]=useState(null);
  const [importando,setImportando]=useState(false);
  const [importandoClientes,setImportandoClientes]=useState(false);
  const [mantVeh,setMantVeh] = React.useState(()=>{try{return JSON.parse(localStorage.getItem("cat_mant_vehiculo_v1")||"[]");}catch{return [];}});
  const [mostrarNuevoMant,setMostrarNuevoMant] = React.useState(false);
  const saveMantVeh = (lista) => {setMantVeh(lista);localStorage.setItem("cat_mant_vehiculo_v1",JSON.stringify(lista));if(syncData)syncData({mantVeh:lista});};
  const prestados={sifon:clientes.reduce((a,c)=>a+(c.sifon||0),0),bidon10:clientes.reduce((a,c)=>a+(c.bidon10||0),0),bidon20:clientes.reduce((a,c)=>a+(c.bidon20||0),0)};
  const stockKeys={"Sifón 1.5L":"sifon","Bidón 10L":"bidon10","Bidón 20L":"bidon20","Dispenser":"dispenser"};
  return (
    <div style={s.screen}>
      <div style={s.header}><button style={s.backBtn} onClick={onVolver}>← Volver</button><span style={s.headerTitle}>Configuración</span></div>
      <div style={{padding:"14px 14px 6px",background:"var(--color-background-secondary)"}}>
        {[
          [["stock","📦","Stock"],["cargas","🚚","Cargas"],["datos","📋","Datos"],["vehiculo","🚐","Vehículo"]],
          [["apariencia","🎨","Estilo"],["emma","🔗","Vincular"],["x","",""],["x","",""]],
        ].map((fila,fi)=>(
          <div key={fi} style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:8}}>
            {fila.map(([id,ico,lbl])=>id==="x"?<div key="x"/>:(
              <button key={id} onClick={()=>setTab(id)} style={{
                display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,
                padding:"12px 6px",borderRadius:12,cursor:"pointer",
                border:`2px solid ${tab===id?"var(--color-accent)":"transparent"}`,
                background:tab===id?"var(--color-background-secondary)":"var(--color-background-tertiary)",
                boxShadow:tab===id
                  ?"0 0 0 1px var(--color-accent), 0 4px 12px rgba(24,95,165,0.3)"
                  :"0 3px 6px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.06) inset",
                color:tab===id?"var(--color-accent)":"var(--color-text-secondary)",
                transition:"all 0.15s",
              }}>
                <span style={{fontSize:20}}>{ico}</span>
                <span style={{fontSize:10,fontWeight:tab===id?500:400,letterSpacing:"0.02em"}}>{lbl}</span>
              </button>
            ))}
          </div>
        ))}
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
      </div>}
      {tab==="cargas"&&(
          <div style={{padding:16}}>
            <p style={{fontSize:13,color:"var(--color-text-secondary)",marginBottom:16,lineHeight:1.6}}>
              Cantidades con las que salís cada día. Se usan como valores por defecto al iniciar el reparto.
              Los sifones se ingresan en cajones (1 cajón = 6 sifones).
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
                        value={cajones||""}
                        placeholder="0"
                        onChange={e=>{
                          var caj=Number(e.target.value)||0;
                          var nuevo=Object.assign({},cargasDia||CARGA_DIA_DEFAULT);
                          nuevo[dia]=Object.assign({},c,{soda:caj*6});
                          setCargasDia(nuevo);
                        }} />
                      <div style={{fontSize:10,color:"var(--color-text-tertiary)",textAlign:"center",marginTop:2}}>{c.soda||0} unidades</div>
                    </div>
                    <div>
                      <label style={{...s.label,textAlign:"center"}}>Bidón 10L</label>
                      <input style={{...s.inputNum,textAlign:"center"}} type="number" min={0}
                        value={c.b10||""}
                        placeholder="0"
                        onChange={e=>{
                          var nuevo=Object.assign({},cargasDia||CARGA_DIA_DEFAULT);
                          nuevo[dia]=Object.assign({},c,{b10:Number(e.target.value)||0});
                          setCargasDia(nuevo);
                        }} />
                    </div>
                    <div>
                      <label style={{...s.label,textAlign:"center"}}>Bidón 20L</label>
                      <input style={{...s.inputNum,textAlign:"center"}} type="number" min={0}
                        value={c.b20||""}
                        placeholder="0"
                        onChange={e=>{
                          var nuevo=Object.assign({},cargasDia||CARGA_DIA_DEFAULT);
                          nuevo[dia]=Object.assign({},c,{b20:Number(e.target.value)||0});
                          setCargasDia(nuevo);
                        }} />
                    </div>
                  </div>
                </div>
              );
            })}
            <button style={s.btnPrimary} onClick={()=>{ setCargasDia(Object.assign({},cargasDia)); alert("Cargas guardadas"); }}>Guardar cargas</button>
          </div>
        )}
        {tab==="datos"&&(
          <div style={{padding:16,display:"flex",flexDirection:"column",gap:0}}>
            {/* ── Historial ── */}
            <CargaHistorica
              clientes={clientes}
              productos={productos}
              onGuardar={(vts)=>{const nv=[...(ventas||[]),...vts];setVentas(nv);if(syncData)syncData({ventas:nv});}}
              onVolver={null}
              enConfig={true}
            />
            {/* ── Backup ── */}
            <div style={{borderTop:"1px solid var(--color-border-secondary)",marginTop:8,paddingTop:16,display:"flex",flexDirection:"column",gap:10}}>
              <div style={{fontSize:13,fontWeight:600,color:"var(--color-text-primary)",marginBottom:4}}>💾 Backup</div>
              {/* Exportar */}
              <button style={s.btnPrimary} onClick={()=>exportarExcel(clientes,ventas,productos,planillas)}>
                📥 Exportar backup · {clientes.length} clientes · {ventas.length} ventas
              </button>
              {/* Forzar sync */}
              <button style={{...s.btn,width:"100%",padding:"11px",background:"#EF9F27",color:"#fff",border:"none",borderRadius:10,fontSize:13,fontWeight:600,cursor:"pointer"}}
                onClick={()=>{if(window.confirm("¿Subir todos los datos a la nube?")){
                  cloudSave({clientes,ventas,planillas,stock,productos,noVisitas:(noVisitas||[]),prospectos:(prospectos||[])})
                    .then(()=>alert("✅ Datos sincronizados."))
                    .catch(()=>alert("❌ Error. Verificá tu conexión."));
                }}}>
                🔄 Forzar sincronización
              </button>
              {/* Zona peligrosa */}
              <div style={{borderTop:"1px solid var(--color-border-secondary)",paddingTop:12,marginTop:4}}>
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
            </div>
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
            <div key={i} style={{...s.card,margin:"0 0 10px",borderLeft:`3px solid ${m.tipo==="aceite"?"#f5b942":m.tipo==="preventivo"?"#4dd9a0":m.tipo==="embrague"?"#e05c5c":m.tipo==="reparacion"?"#5daaff":"#a0aec0"}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:600,color:"var(--color-text-primary)"}}>
                    {m.tipo==="aceite"?"🛢 Cambio de aceite":m.tipo==="preventivo"?"🔩 Mantenimiento preventivo":m.tipo==="embrague"?"⚙️ Cambio de embrague":m.tipo==="reparacion"?"🛠 Reparación":"📋 "+m.tipo}
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

      {tab==="emma"&&(
        <div style={{padding:16}}>
          <div style={{background:"var(--color-background-secondary)",borderRadius:12,padding:14,border:"0.5px solid var(--color-border-tertiary)",marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--color-text-secondary)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>
              🔗 Vincular con Emma Control
            </div>
            <div style={{fontSize:13,color:"var(--color-text-secondary)",lineHeight:1.6,marginBottom:14}}>
              Pegá el código que aparece en Emma Control → Configuración → "Código de integración". Los ingresos y gastos del día se van a enviar automáticamente al cerrar el reparto.
            </div>
            <div style={{fontSize:11,fontWeight:700,color:"var(--color-text-secondary)",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:6}}>Código Emma Control</div>
            <input
              value={ecToken}
              onChange={e=>{
                const v=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,10);
                setEcToken(v);
                localStorage.setItem('lc_ec_token',v);
              }}
              placeholder="Ej: EC4A8F2D"
              style={{
                width:'100%',background:"var(--color-background-tertiary)",
                border:`2px solid ${ecToken?"var(--color-accent)":"var(--color-border-secondary)"}`,
                borderRadius:10,padding:'12px 14px',fontSize:18,color:"var(--color-text-primary)",
                fontFamily:'monospace',letterSpacing:'0.15em',fontWeight:700,outline:'none',
                textTransform:'uppercase',marginBottom:12,
              }}
            />
            {ecToken&&ecToken.length>=8?(
              <div style={{display:'flex',alignItems:'center',gap:8,background:"rgba(16,158,100,0.12)",border:"0.5px solid rgba(16,158,100,0.3)",borderRadius:10,padding:'10px 14px',marginBottom:12}}>
                <span style={{fontSize:18}}>✅</span>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:"#10d07a"}}>Vinculado con Emma Control</div>
                  <div style={{fontSize:11,color:"var(--color-text-secondary)"}}>Los datos se enviarán al cerrar el día</div>
                </div>
              </div>
            ):(
              <div style={{display:'flex',alignItems:'center',gap:8,background:"var(--color-background-tertiary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:10,padding:'10px 14px',marginBottom:12}}>
                <span style={{fontSize:18}}>⚪</span>
                <div style={{fontSize:12,color:"var(--color-text-secondary)"}}>Sin vincular — ingresá el código para activar</div>
              </div>
            )}
            {ecToken&&(
              <button
                onClick={()=>{if(window.confirm('¿Desvincular Emma Control?')){setEcToken('');localStorage.removeItem('lc_ec_token');}}}
                style={{background:'none',border:'0.5px solid rgba(240,82,82,0.4)',borderRadius:8,padding:'8px 14px',color:'#f05252',fontSize:12,cursor:'pointer',width:'100%'}}>
                🗑️ Desvincular
              </button>
            )}
          </div>

          <div style={{background:"var(--color-background-secondary)",borderRadius:12,padding:14,border:"0.5px solid var(--color-border-tertiary)"}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--color-text-secondary)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>
              ¿Qué se envía automáticamente?
            </div>
            {[
              ['💰','Ingresos del día','Efectivo + transferencias cobradas'],
              ['💸','Gastos adicionales','Combustible, gastos del reparto'],
              ['📅','Fecha del reparto','Se registra en el día correspondiente'],
              ['🔗','Identificador','Aparece como movimiento en Emma Control'],
            ].map(([ico,t,d])=>(
              <div key={t} style={{display:'flex',gap:10,alignItems:'flex-start',padding:'7px 0',borderBottom:'0.5px solid var(--color-border-tertiary)'}}>
                <span style={{fontSize:18,flexShrink:0}}>{ico}</span>
                <div>
                  <div style={{fontSize:13,fontWeight:500,color:"var(--color-text-primary)"}}>{t}</div>
                  <div style={{fontSize:11,color:"var(--color-text-secondary)"}}>{d}</div>
                </div>
              </div>
            ))}
          </div>

          <EnviarResumenEC ventas={ventas} />

          {/* Soporte técnico */}
          <div style={{background:"var(--color-background-secondary)",borderRadius:12,padding:14,border:"0.5px solid var(--color-border-tertiary)"}}>
            <div style={{fontSize:13,fontWeight:600,color:"var(--color-text-primary)",marginBottom:4}}>💬 Soporte técnico</div>
            <div style={{fontSize:12,color:"var(--color-text-secondary)",marginBottom:12,lineHeight:1.6}}>
              ¿Tenés algún problema o consulta? Escribinos por WhatsApp.
            </div>
            <a href="https://wa.me/5493813399962?text=Hola%2C+necesito+ayuda+con+Sistema+de+Reparto"
              target="_blank" rel="noopener"
              style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                padding:"13px",borderRadius:10,background:"#0a2e1f",
                border:"1px solid #4dd9a0",color:"#4dd9a0",
                fontSize:14,fontWeight:600,textDecoration:"none"}}>
              💬 Abrir WhatsApp
            </a>
            <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginTop:8,textAlign:"center"}}>
              Emma Soluciones Digitales · +54 9 381 339-9962
            </div>
          </div>
        </div>
      )}
          </div>
  );
}

function EnviarResumenEC({ventas}) {
  const [enviando, setEnviando] = React.useState(false);
  const [ultimaSync, setUltimaSync] = React.useState(()=>localStorage.getItem('sm_resumen_ultima')||'');
  const db = window.db;

  const enviarResumen = async () => {
    if(!db){ alert('Error: sin conexión a la base de datos'); return; }
    setEnviando(true);
    try {
      const hoy = new Date().toLocaleDateString('es-AR');
      const fechaId = new Date().toISOString().slice(0,10); // YYYY-MM-DD como ID del doc
      const ventasHoy = (ventas||[]).filter(v=>v.fecha===hoy);
      const gastos = JSON.parse(localStorage.getItem('lc_gastos')||'[]');
      const gastosHoy = gastos.filter(g=>g.fecha===hoy);
      const totalVentas = ventasHoy.reduce((s,v)=>s+(v.total||0),0);
      const totalGastos = gastosHoy.reduce((s,g)=>s+(g.monto||0),0);
      const movs = [
        ...ventasHoy.map(v=>({id:'venta_'+v.id,tipo:'ingreso',monto:v.total||0,descripcion:'Venta reparto: '+(v.cliente||''),fecha:hoy,origen:'reparto'})),
        ...gastosHoy.map(g=>({id:'gasto_'+g.id,tipo:'egreso',monto:g.monto||0,descripcion:'Gasto reparto: '+(g.concepto||''),fecha:hoy,origen:'reparto'}))
      ];
      if(!movs.length){ alert('No hay movimientos para guardar hoy'); setEnviando(false); return; }
      const batch = db.batch();
      movs.forEach(m=>{
        const ref = db.collection('resumenes_dia').doc(fechaId).collection('movimientos').doc(m.id);
        batch.set(ref, m);
      });
      // También guardar el totalizador del día en el documento raíz
      batch.set(db.collection('resumenes_dia').doc(fechaId), {
        fecha: hoy,
        fechaId,
        totalVentas,
        totalGastos,
        cantVentas: ventasHoy.length,
        cantGastos: gastosHoy.length,
        guardadoEn: new Date().toISOString()
      }, {merge: true});
      await batch.commit();
      const ahora = new Date().toLocaleString('es-AR');
      setUltimaSync(ahora);
      localStorage.setItem('sm_resumen_ultima', ahora);
      alert('✅ Resumen guardado!\nVentas: $'+totalVentas.toLocaleString('es-AR')+'\nGastos: $'+totalGastos.toLocaleString('es-AR'));
    } catch(e){ alert('Error al guardar: '+e.message); }
    setEnviando(false);
  };

  return (
    <div style={{background:'var(--color-background-secondary)',borderRadius:12,padding:14,border:'0.5px solid var(--color-border-tertiary)',marginTop:12}}>
      <div style={{fontSize:11,fontWeight:700,color:'var(--color-text-secondary)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:10}}>📤 Resumen del día</div>
      <button
        onClick={enviarResumen}
        disabled={enviando}
        style={{width:'100%',padding:'12px',borderRadius:10,border:'none',background:'var(--color-accent)',color:'white',fontSize:14,fontWeight:700,cursor:'pointer',marginBottom:8}}>
        {enviando?'⏳ Guardando...':'💾 Guardar resumen del día'}
      </button>
      {ultimaSync&&<div style={{fontSize:11,color:'var(--color-text-secondary)',textAlign:'center'}}>Último guardado: {ultimaSync}</div>}
    </div>
  );
}

