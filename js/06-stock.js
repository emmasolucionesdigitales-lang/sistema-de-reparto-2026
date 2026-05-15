// ════════════════════════════════════════════════════════════════════
// ◆  06-stock.js — StockGeneral · ConfirmacionesDia
// ════════════════════════════════════════════════════════════════════

function StockGeneral({stock,setStock,clientes,ventas,productos,planillas,onVolver,onAjustarEnvases}) {
  const CAJON = 6;
  const [tab, setTab] = React.useState("inv");
  const [guardado, setGuardado] = React.useState(false);
  const DIAS = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
  const prodKey = {"Sifón 1.5L":"sifon","Bidón 10L":"bidon10","Bidón 20L":"bidon20"};

  // Stock base editable (sodería y depósito)
  const [base, setBase] = React.useState(()=>({
    soderia:        {...(stock?.soderia        ||{sifon:0,bidon10:0,bidon20:0})},
    soderia_vacios: {...(stock?.soderia_vacios ||{sifon:0,bidon10:0,bidon20:0})},
    casa:           {...(stock?.casa           ||{sifon:0,bidon10:0,bidon20:0})},
  }));
  const setB = (lugar,key,val) => setBase(b=>({...b,[lugar]:{...b[lugar],[key]:Number(val)||0}}));

  // Hoy
  const hoy = new Date().toISOString().slice(0,10);

  // ¿El día ya fue cerrado?
  const diaCerradoHoy = DIAS.some(d=>!!planillas[`${d}_${hoy}`]?._diaCerrado);

  // Lo cargado hoy en el camión (desde planillas)
  const cargadoHoy = {sifon:0,bidon10:0,bidon20:0};
  DIAS.forEach(d=>{
    const p = planillas[`${d}_${hoy}`];
    if(p?.productos){
      cargadoHoy.sifon   += Number(p.productos.soda?.llenos||0);
      cargadoHoy.bidon10 += Number(p.productos.b10?.llenos||0);
      cargadoHoy.bidon20 += Number(p.productos.b20?.llenos||0);
    }
  });
  const hayRepartHoy = cargadoHoy.sifon>0||cargadoHoy.bidon10>0||cargadoHoy.bidon20>0;

  // Lo vendido hoy
  const ventasHoy = ventas.filter(v=>v.fechaKey===hoy);
  const vendidoHoy = {sifon:0,bidon10:0,bidon20:0};
  ventasHoy.forEach(v=>v.detalle.forEach(d=>{
    const k=prodKey[d.nombre]; if(k) vendidoHoy[k]+=d.cantidad;
  }));

  // Devuelto hoy (vacíos recibidos)
  const devueltoHoy = {sifon:0,bidon10:0,bidon20:0};
  ventasHoy.forEach(v=>{
    (v.envDev||[]).forEach(e=>{
      const k = e.prod==="Sifón 1.5L"?"sifon":e.prod==="Bidón 10L"?"bidon10":e.prod==="Bidón 20L"?"bidon20":null;
      if(k) devueltoHoy[k]+=Number(e.cant)||0;
    });
  });

  // En camión: valor real de Firebase (actualizado por InicioReparto/cerrarCamion)
  const enCamion = diaCerradoHoy ? {sifon:0,bidon10:0,bidon20:0} : {
    sifon:   stock?.camion?.sifon   || 0,
    bidon10: stock?.camion?.bidon10 || 0,
    bidon20: stock?.camion?.bidon20 || 0,
  };

  // Calcular envases prestados EXTRA por cliente (suma histórica de préstamos - devoluciones)
  const calcPrestados = (clienteId) => {
    const ex = {sifon:0,bidon10:0,bidon20:0};
    ventas.filter(v=>v.clienteId===clienteId).forEach(v=>{
      (v.envPrest||[]).forEach(e=>{
        const k=e.prod==="Sifón 1.5L"?"sifon":e.prod==="Bidón 10L"?"bidon10":e.prod==="Bidón 20L"?"bidon20":null;
        if(k) ex[k]+=Number(e.cant)||0;
      });
      (v.envDev||[]).forEach(e=>{
        const k=e.prod==="Sifón 1.5L"?"sifon":e.prod==="Bidón 10L"?"bidon10":e.prod==="Bidón 20L"?"bidon20":null;
        if(k) ex[k]-=Number(e.cant)||0;
      });
    });
    return {sifon:Math.max(0,ex.sifon),bidon10:Math.max(0,ex.bidon10),bidon20:Math.max(0,ex.bidon20)};
  };

  // Total prestados extra en todos los clientes
  const totalPrestados = {sifon:0,bidon10:0,bidon20:0};
  const clientesConPrestados = clientes.filter(c=>{
    const ex=calcPrestados(c.id);
    if(ex.sifon>0||ex.bidon10>0||ex.bidon20>0) {
      totalPrestados.sifon+=ex.sifon;
      totalPrestados.bidon10+=ex.bidon10;
      totalPrestados.bidon20+=ex.bidon20;
      return true;
    }
    return false;
  });

  const guardar = () => {
    setStock({soderia:base.soderia,soderia_vacios:base.soderia_vacios,casa:base.casa,camion:stock?.camion||{sifon:0,bidon10:0,bidon20:0}});
    setGuardado(true);
    setTimeout(()=>setGuardado(false),2000);
  };

  const StatBox = ({label,val,sub,color}) => (
    <div style={{flex:1,background:"var(--color-background-tertiary)",borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
      <div style={{fontSize:22,fontWeight:700,color:color||"var(--color-text-primary)"}}>{val}</div>
      {sub&&<div style={{fontSize:10,color:"var(--color-text-tertiary)"}}>{sub}</div>}
      <div style={{fontSize:11,color:"var(--color-text-secondary)",marginTop:2}}>{label}</div>
    </div>
  );

  const InputStock = ({lugar,label,field,isCajon}) => {
    const val = isCajon ? Math.floor((base[lugar]?.[field]||0)/CAJON) : (base[lugar]?.[field]||0);
    return (
      <div>
        <label style={{...s.label,textAlign:"center",fontSize:11}}>{label}</label>
        <input style={{...s.inputNum,textAlign:"center"}} type="number" min={0} value={val}
          onChange={e=>{
            const v=Number(e.target.value)||0;
            if(isCajon){const sueltos=(base[lugar]?.[field]||0)%CAJON;setB(lugar,field,v*CAJON+sueltos);}
            else setB(lugar,field,v);
          }}/>
        {isCajon&&<div style={{fontSize:10,color:"var(--color-text-tertiary)",textAlign:"center",marginTop:2}}>{base[lugar]?.[field]||0} sifones</div>}
      </div>
    );
  };

  return (
    <div style={s.screen}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={onVolver}>← Volver</button>
        <span style={s.headerTitle}>📦 Stock</span>
      </div>

      {/* TABS */}
      <div style={{display:"flex",gap:6,padding:"10px 14px 0",borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
        {[["inv","📦 Inventario"],["clientes","👥 Clientes"]].map(([t,l])=>(
          <button key={t} style={{...s.btn,flex:1,padding:"8px 4px",fontSize:13,fontWeight:tab===t?600:400,
            background:tab===t?"var(--color-background-secondary)":"transparent",
            borderBottom:tab===t?"2px solid #185FA5":"none",borderRadius:tab===t?"8px 8px 0 0":"8px",
            color:tab===t?"var(--color-text-primary)":"var(--color-text-secondary)"}}
            onClick={()=>setTab(t)}>{l}</button>
        ))}
      </div>

      <div style={{padding:14,overflowY:"auto"}}>

      {/* ══ TAB INVENTARIO ══ */}
      {tab==="inv"&&(<>

        {/* SECCIÓN 1 — Sodería */}
        <div style={{...s.card,margin:"0 0 12px",borderLeft:"3px solid #1D9E75"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#1D9E75",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>🏭 Sodería — Stock disponible</div>
          <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginBottom:6}}>Llenos listos para salir</div>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <StatBox label="Cajones soda" val={Math.floor((base.soderia.sifon||0)/CAJON)} sub={`${base.soderia.sifon||0} sif`} color="#e2ecff"/>
            <StatBox label="Bidón 10L" val={base.soderia.bidon10||0} color="#e2ecff"/>
            <StatBox label="Bidón 20L" val={base.soderia.bidon20||0} color="#e2ecff"/>
          </div>
          <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginBottom:6}}>Vacíos en sodería</div>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <StatBox label="Cajones soda" val={Math.floor((base.soderia_vacios.sifon||0)/CAJON)} sub={`${base.soderia_vacios.sifon||0} sif`} color="#f5b942"/>
            <StatBox label="Bidón 10L" val={base.soderia_vacios.bidon10||0} color="#f5b942"/>
            <StatBox label="Bidón 20L" val={base.soderia_vacios.bidon20||0} color="#f5b942"/>
          </div>
          <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginBottom:8}}>Ajustar llenos:</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
            <InputStock lugar="soderia" label="Cajones soda" field="sifon" isCajon={true}/>
            <InputStock lugar="soderia" label="Bidón 10L" field="bidon10"/>
            <InputStock lugar="soderia" label="Bidón 20L" field="bidon20"/>
          </div>
          <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginBottom:8}}>Ajustar vacíos:</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            <InputStock lugar="soderia_vacios" label="Caj. soda vacíos" field="sifon" isCajon={true}/>
            <InputStock lugar="soderia_vacios" label="Bidón 10L vacíos" field="bidon10"/>
            <InputStock lugar="soderia_vacios" label="Bidón 20L vacíos" field="bidon20"/>
          </div>
        </div>

        {/* SECCIÓN 2 — Camión (solo si hay reparto hoy) */}
        {hayRepartHoy ? (
          <div style={{...s.card,margin:"0 0 12px",borderLeft:`3px solid ${diaCerradoHoy?"#1D9E75":"#185FA5"}`}}>
            <div style={{fontSize:12,fontWeight:700,color:diaCerradoHoy?"#1D9E75":"#185FA5",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>
              🚚 Camión — {diaCerradoHoy?"Día cerrado ✅":"En reparto ahora"}
            </div>
            {diaCerradoHoy ? (
              <div style={{fontSize:13,color:"#4dd9a0",textAlign:"center",padding:"8px 0"}}>
                ✅ El camión fue descargado — stock actualizado
              </div>
            ) : (
              <>
                <div style={{display:"flex",gap:8,marginBottom:8}}>
                  <StatBox label="Cajones" val={Math.floor(enCamion.sifon/CAJON)} color="#7ecfff"/>
                  <StatBox label="10L" val={enCamion.bidon10} color="#7ecfff"/>
                  <StatBox label="20L" val={enCamion.bidon20} color="#7ecfff"/>
                </div>
                <div style={{fontSize:11,color:"var(--color-text-tertiary)",borderTop:"0.5px solid var(--color-border-tertiary)",paddingTop:8}}>
                  Cargado: {Math.floor(cargadoHoy.sifon/CAJON)} caj · {cargadoHoy.bidon10} 10L · {cargadoHoy.bidon20} 20L
                  {"  |  "}Vendido: {Math.floor(vendidoHoy.sifon/CAJON)} caj · {vendidoHoy.bidon10} 10L · {vendidoHoy.bidon20} 20L
                </div>
              </>
            )}
          </div>
        ) : (
          <div style={{...s.card,margin:"0 0 12px",background:"rgba(24,95,165,0.05)",border:"0.5px dashed rgba(24,95,165,0.3)"}}>
            <div style={{fontSize:13,color:"var(--color-text-tertiary)",textAlign:"center",padding:"8px 0"}}>🚚 Sin reparto activo hoy</div>
            {(stock?.camion?.sifon>0||stock?.camion?.bidon10>0||stock?.camion?.bidon20>0)&&(
              <button style={{...s.btn,width:"100%",fontSize:12,padding:"6px",marginTop:6,color:"var(--color-text-danger)",border:"1px solid var(--color-text-danger)"}}
                onClick={()=>{if(window.confirm("¿Limpiar camión? Solo si no hay reparto activo.")){setStock(prev=>({...prev,camion:{sifon:0,bidon10:0,bidon20:0}}));}}}>
                🔄 Limpiar camión (datos acumulados)
              </button>
            )}
          </div>
        )}

        {/* SECCIÓN 3 — Clientes prestados */}
        <div style={{...s.card,margin:"0 0 12px",borderLeft:"3px solid rgba(245,158,11,0.7)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#f59e0b",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>👤 En clientes — Prestados extra</div>
          <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginBottom:10}}>Envases que están en la calle sin devolver (además del consumo habitual)</div>
          {(totalPrestados.sifon+totalPrestados.bidon10+totalPrestados.bidon20)===0 ? (
            <div style={{fontSize:13,color:"var(--color-text-tertiary)",textAlign:"center",padding:"8px 0"}}>✅ Sin envases prestados extra</div>
          ) : (
            <>
              <div style={{display:"flex",gap:8,marginBottom:8}}>
                {totalPrestados.sifon>0&&<StatBox label="Sifones" val={totalPrestados.sifon} color="#f59e0b"/>}
                {totalPrestados.bidon10>0&&<StatBox label="10L" val={totalPrestados.bidon10} color="#f59e0b"/>}
                {totalPrestados.bidon20>0&&<StatBox label="20L" val={totalPrestados.bidon20} color="#f59e0b"/>}
              </div>
              <button style={{...s.btn,width:"100%",fontSize:13,padding:"8px"}} onClick={()=>setTab("clientes")}>
                Ver detalle por cliente →
              </button>
            </>
          )}
        </div>

        {/* SECCIÓN 4 — Depósito */}
        <div style={{...s.card,margin:"0 0 12px",borderLeft:"3px solid rgba(99,102,241,0.7)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#818cf8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>🏠 Depósito — Stock de reserva</div>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <StatBox label="Cajones" val={Math.floor((base.casa.sifon||0)/CAJON)} sub={`${base.casa.sifon||0} sif`} color="#e2ecff"/>
            <StatBox label="10L" val={base.casa.bidon10||0} color="#e2ecff"/>
            <StatBox label="20L" val={base.casa.bidon20||0} color="#e2ecff"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            <InputStock lugar="casa" label="Cajones soda" field="sifon" isCajon={true}/>
            <InputStock lugar="casa" label="Bidón 10L" field="bidon10"/>
            <InputStock lugar="casa" label="Bidón 20L" field="bidon20"/>
          </div>
        </div>

        <button style={{...s.btnPrimary,background:guardado?"#0F6E56":undefined}} onClick={guardar}>
          {guardado?"✓ Guardado":"Guardar stock"}
        </button>
      </>)}

      {/* ══ TAB CLIENTES ══ */}
      {tab==="clientes"&&(<>
        <div style={{...s.card,margin:"0 0 12px",background:"var(--color-background-secondary)"}}>
          <div style={{fontSize:11,fontWeight:700,color:"var(--color-text-secondary)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>📊 Total envases prestados extra</div>
          <div style={{display:"flex",gap:8}}>
            <StatBox label="Sifones" val={totalPrestados.sifon} color={totalPrestados.sifon>0?"#f59e0b":"var(--color-text-tertiary)"}/>
            <StatBox label="10L" val={totalPrestados.bidon10} color={totalPrestados.bidon10>0?"#f59e0b":"var(--color-text-tertiary)"}/>
            <StatBox label="20L" val={totalPrestados.bidon20} color={totalPrestados.bidon20>0?"#f59e0b":"var(--color-text-tertiary)"}/>
          </div>
        </div>

        {clientesConPrestados.length===0 && (
          <p style={{textAlign:"center",color:"var(--color-text-tertiary)",padding:"30px 0",fontSize:14}}>✅ Ningún cliente tiene envases prestados extra</p>
        )}

        {clientesConPrestados.sort((a,b)=>{
          const dA=DIAS.indexOf(a.dia),dB=DIAS.indexOf(b.dia);
          return dA!==dB?dA-dB:(a.orden||9999)-(b.orden||9999);
        }).map(c=>{
          const ex=calcPrestados(c.id);
          const dir=c.calle?`${c.calle} ${c.nro||""}`:c.manzana?`Mz ${c.manzana} L ${c.lote}`:"";
          return(
            <div key={c.id} style={{...s.card,margin:"0 0 8px",borderLeft:"3px solid rgba(245,158,11,0.5)"}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                <div style={{fontWeight:700,fontSize:17,color:"#ffffff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.nombre}</div>
                <span style={{background:"#1D9E75",color:"#fff",fontSize:10,padding:"1px 7px",borderRadius:20,fontWeight:700,flexShrink:0}}>{c.dia}</span>
              </div>
              {dir&&<div style={{fontSize:17,color:"#c8d8e8",fontWeight:500,marginBottom:8}}>{dir}{c.barrio?` · ${c.barrio}`:""}</div>}
              <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center",marginBottom:8}}>
                {/* Habituales */}
                {c.sifon>0&&<span style={{background:"rgba(56,138,221,0.28)",color:"#fff",border:"1px solid rgba(56,138,221,0.5)",borderRadius:6,padding:"3px 9px",fontSize:12,fontWeight:700}}>Sif ×{c.sifon} (hab.)</span>}
                {c.bidon10>0&&<span style={{background:"rgba(56,138,221,0.28)",color:"#fff",border:"1px solid rgba(56,138,221,0.5)",borderRadius:6,padding:"3px 9px",fontSize:12,fontWeight:700}}>10L ×{c.bidon10} (hab.)</span>}
                {c.bidon20>0&&<span style={{background:"rgba(56,138,221,0.28)",color:"#fff",border:"1px solid rgba(56,138,221,0.5)",borderRadius:6,padding:"3px 9px",fontSize:12,fontWeight:700}}>20L ×{c.bidon20} (hab.)</span>}
                {/* Prestados extra */}
                {ex.sifon>0&&<span style={{background:"rgba(245,158,11,0.28)",color:"#fff",border:"1px solid rgba(245,158,11,0.55)",borderRadius:6,padding:"3px 9px",fontSize:12,fontWeight:700}}>+{ex.sifon} sif extra</span>}
                {ex.bidon10>0&&<span style={{background:"rgba(245,158,11,0.28)",color:"#fff",border:"1px solid rgba(245,158,11,0.55)",borderRadius:6,padding:"3px 9px",fontSize:12,fontWeight:700}}>+{ex.bidon10} 10L extra</span>}
                {ex.bidon20>0&&<span style={{background:"rgba(245,158,11,0.28)",color:"#fff",border:"1px solid rgba(245,158,11,0.55)",borderRadius:6,padding:"3px 9px",fontSize:12,fontWeight:700}}>+{ex.bidon20} 20L extra</span>}
              </div>
              {/* Total en su casa */}
              <div style={{background:"var(--color-background-tertiary)",borderRadius:8,padding:"6px 10px",fontSize:12,color:"var(--color-text-secondary)",marginBottom:8}}>
                📦 Total en su casa: {c.sifon+ex.sifon>0?`${c.sifon+ex.sifon} sif`:""} {c.bidon10+ex.bidon10>0?`${c.bidon10+ex.bidon10} bid 10L`:""} {c.bidon20+ex.bidon20>0?`${c.bidon20+ex.bidon20} bid 20L`:""}
              </div>
              <button onClick={()=>{
                const sif=Number(prompt(`Sifones prestados EXTRA de ${c.nombre} (0 si ya devolvió todos):`,ex.sifon));
                const b10=Number(prompt("Bidones 10L prestados extra:",ex.bidon10));
                const b20=Number(prompt("Bidones 20L prestados extra:",ex.bidon20));
                if(isNaN(sif)||isNaN(b10)||isNaN(b20)){alert("Cancelado");return;}
                const devs=[];
                if(ex.sifon-sif>0)devs.push({prod:"Sifón 1.5L",cant:ex.sifon-sif});
                if(ex.bidon10-b10>0)devs.push({prod:"Bidón 10L",cant:ex.bidon10-b10});
                if(ex.bidon20-b20>0)devs.push({prod:"Bidón 20L",cant:ex.bidon20-b20});
                if(devs.length===0){alert("Sin cambios");return;}
                const vt={id:Date.now(),clienteId:c.id,cliente:c.nombre,dia:"",fechaKey:new Date().toISOString().slice(0,10),
                  fecha:new Date().toLocaleString("es-AR"),detalle:[{nombre:"Ajuste envases",cantidad:1,precio:0,total:0}],
                  pago:"ajuste",obs:"Corrección manual de envases prestados",neto:0,bruto:0,desc:0,costo:0,ganancia:0,
                  pagadoNum:0,saldoDelta:0,_esAjuste:true,saldoAntes:c.saldo||0,saldoDespues:c.saldo||0,
                  envPrest:[],envDev:devs};
                onAjustarEnvases&&onAjustarEnvases(vt);
              }} style={{background:"rgba(226,75,74,0.2)",color:"#ffffff",border:"1px solid rgba(226,75,74,0.4)",borderRadius:6,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                ✏️ Corregir envases
              </button>
            </div>
          );
        })}
      </>)}

      </div>
    </div>
  );
}

function ConfirmacionesDia({dia,ventas,clientes,onConfirmar,onVolver}) {
  const [abiertos, setAbiertos] = React.useState({});
  const toggleFecha = (fk) => setAbiertos(o=>({...o,[fk]:!o[fk]}));
  const pendientes = ventas.filter(v=>!v.transConfirmada);
  const confirmadas = ventas.filter(v=>v.transConfirmada);
  const porCliente = {};
  pendientes.forEach(v=>{
    if(!porCliente[v.clienteId]) porCliente[v.clienteId]={cliente:clientes.find(c=>c.id===v.clienteId),ventas:[]};
    porCliente[v.clienteId].ventas.push(v);
  });
  const grupos = Object.values(porCliente);
  const totalPendiente = pendientes.reduce((a,v)=>a+(v.pagadoNum||v.neto||0),0);
  const totalConfirmado = confirmadas.reduce((a,v)=>a+(v.pagadoNum||v.neto||0),0);
  const confirmadasPorFecha = {};
  confirmadas.forEach(v=>{ const fk=v.fechaKey||"sin fecha"; if(!confirmadasPorFecha[fk])confirmadasPorFecha[fk]=[]; confirmadasPorFecha[fk].push(v); });
  const fechasConf = Object.keys(confirmadasPorFecha).sort().reverse();
  return (
    <div style={s.screen}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={onVolver}>← Volver</button>
        <span style={s.headerTitle}>Transferencias · {dia}</span>
      </div>
      <div style={{padding:"10px 14px 4px"}}>
        <div style={{display:"flex",gap:8,marginBottom:8}}>
          <div style={{...s.card,flex:1,margin:0,background:"#1e3a5f",border:"1px solid #f5b942",padding:"10px 12px"}}>
            <div style={{fontSize:10,color:"#f5b942",fontWeight:500,textTransform:"uppercase",marginBottom:4}}>🔴 Pendientes</div>
            <div style={{fontSize:18,fontWeight:700,color:"#f5b942"}}>{fmt(totalPendiente)}</div>
            <div style={{fontSize:11,color:"var(--color-text-tertiary)"}}>{pendientes.length} transfer.</div>
          </div>
          <div style={{...s.card,flex:1,margin:0,background:"#0a2e1f",border:"1px solid #4dd9a0",padding:"10px 12px"}}>
            <div style={{fontSize:10,color:"#4dd9a0",fontWeight:500,textTransform:"uppercase",marginBottom:4}}>✓ Confirmadas</div>
            <div style={{fontSize:18,fontWeight:700,color:"#4dd9a0"}}>{fmt(totalConfirmado)}</div>
            <div style={{fontSize:11,color:"var(--color-text-tertiary)"}}>{confirmadas.length} transfer.</div>
          </div>
        </div>
        {grupos.length===0&&<p style={{textAlign:"center",padding:"20px 0",color:"var(--color-text-tertiary)",fontSize:14}}>✓ No hay transferencias pendientes para {dia}</p>}
        {grupos.map(({cliente:c,ventas:vts})=>(
          <div key={c?.id||Math.random()} style={{...s.card,marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div>
                <div style={{fontSize:14,fontWeight:500,color:"var(--color-text-primary)"}}>{c?.nombre||"Cliente desconocido"}</div>
                <div style={{fontSize:14,color:"var(--color-text-secondary)",marginTop:2}}>{c?.calle?`${c.calle} ${c.nro||""}`:c?.manzana?`Mz ${c.manzana} L ${c.lote}`:""}{c?.barrio?` · ${c.barrio}`:""}</div>
              </div>
              {c?.telefono&&<a href={`https://wa.me/54${c.telefono}`} target="_blank" rel="noreferrer" style={{fontSize:20,textDecoration:"none"}}>💬</a>}
            </div>
            {vts.map(v=>(
              <div key={v.id} style={{...s.card,margin:"0 0 6px",background:"var(--color-background-tertiary)",padding:"10px 12px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div>
                    <div style={{fontSize:12,color:"var(--color-text-tertiary)"}}>{v.fechaKey} · {v.fecha?.slice(-8)||""}</div>
                    <div style={{fontSize:12,color:"var(--color-text-secondary)",marginTop:2}}>{(v.detalle||[]).map(d=>`${d.nombre}×${d.cantidad}`).join(" · ")}</div>
                  </div>
                  <span style={{fontSize:16,fontWeight:500,color:"#f5b942"}}>{fmt(v.pagadoNum||v.neto||0)}</span>
                </div>
                <button style={{width:"100%",padding:"9px",borderRadius:8,border:"none",background:"#185FA5",color:"#e2eaf4",fontSize:13,fontWeight:500,cursor:"pointer"}}
                  onClick={()=>onConfirmar(v.id)}>✓ Confirmar transferencia</button>
              </div>
            ))}
          </div>
        ))}
        {fechasConf.length>0&&(
          <div style={{marginTop:8}}>
            <div style={{fontSize:10,color:"var(--color-text-tertiary)",fontWeight:500,textTransform:"uppercase",letterSpacing:"0.05em",margin:"8px 0 6px"}}>✓ Ya confirmadas</div>
            {fechasConf.map(fk=>{
              const vtsFecha=confirmadasPorFecha[fk];
              const totalFecha=vtsFecha.reduce((a,v)=>a+(v.pagadoNum||v.neto||0),0);
              const open=!!abiertos[fk];
              return (
                <div key={fk} style={{...s.card,margin:"0 0 6px",background:"#0a2e1f",border:"0.5px solid #4dd9a0"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}} onClick={()=>toggleFecha(fk)}>
                    <div>
                      <div style={{fontSize:13,fontWeight:500,color:"#4dd9a0"}}>📅 {fk}</div>
                      <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginTop:2}}>{vtsFecha.length} transferencia{vtsFecha.length!==1?"s":""}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:15,fontWeight:600,color:"#4dd9a0"}}>{fmt(totalFecha)}</div>
                      <div style={{fontSize:12,color:"var(--color-text-tertiary)",marginTop:2}}>{open?"▲":"▼"}</div>
                    </div>
                  </div>
                  {open&&<div style={{marginTop:10,borderTop:"0.5px solid rgba(77,217,160,0.2)",paddingTop:8}}>
                    {vtsFecha.map(v=>{
                      const c=clientes.find(x=>x.id===v.clienteId);
                      return (
                        <div key={v.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"0.5px solid rgba(77,217,160,0.15)"}}>
                          <div>
                            <div style={{fontWeight:700,fontSize:18,color:"#ffffff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c?.nombre||"Cliente"}</div>
                            <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginTop:1}}>{(v.detalle||[]).map(d=>`${d.nombre}×${d.cantidad}`).join(" · ")}</div>
                          </div>
                          <div style={{textAlign:"right",flexShrink:0,marginLeft:8}}>
                            <div style={{fontSize:13,fontWeight:500,color:"#4dd9a0"}}>{fmt(v.pagadoNum||v.neto||0)}</div>
                            <button style={{fontSize:10,color:"var(--color-text-tertiary)",background:"none",border:"none",cursor:"pointer",padding:"2px 0",textDecoration:"underline"}} onClick={()=>onConfirmar(v.id)}>desmarcar</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

