// ════════════════════════════════════════════════════════════════════
// ◆  03-tags.js — TagsCliente
// ════════════════════════════════════════════════════════════════════

function TagsCliente({cliente,ventas,style}) {
  const cl=cliente;
  const TH={background:"rgba(56,138,221,0.28)",color:"#ffffff",border:"1px solid rgba(56,138,221,0.5)",borderRadius:6,padding:"3px 9px",fontSize:13,fontWeight:700,display:"inline-block"};
  const TP={background:"rgba(245,158,11,0.28)",color:"#ffffff",border:"1px solid rgba(245,158,11,0.55)",borderRadius:6,padding:"3px 9px",fontSize:13,fontWeight:700,display:"inline-block"};
  const TD={background:"rgba(226,75,74,0.25)",color:"#ffffff",border:"1px solid rgba(226,75,74,0.5)",borderRadius:6,padding:"3px 9px",fontSize:13,fontWeight:700,display:"inline-block"};
  const TF={background:"rgba(29,158,117,0.25)",color:"#ffffff",border:"1px solid rgba(29,158,117,0.5)",borderRadius:6,padding:"3px 9px",fontSize:13,fontWeight:700,display:"inline-block"};
  const ex={sifon:0,b10:0,b20:0};
  (ventas||[]).filter(v=>v.clienteId===cl.id).forEach(v=>{
    (v.envPrest||[]).forEach(e=>{if(e.prod==="Sifón 1.5L")ex.sifon+=Number(e.cant)||0;if(e.prod==="Bidón 10L")ex.b10+=Number(e.cant)||0;if(e.prod==="Bidón 20L")ex.b20+=Number(e.cant)||0;});
    (v.envDev||[]).forEach(e=>{if(e.prod==="Sifón 1.5L")ex.sifon-=Number(e.cant)||0;if(e.prod==="Bidón 10L")ex.b10-=Number(e.cant)||0;if(e.prod==="Bidón 20L")ex.b20-=Number(e.cant)||0;});
  });
  // Sumar el ajuste manual (editor rápido ♻️ Envases) para que la etiqueta refleje el total real
  const aj=cl.envAjuste||{};
  ex.sifon+=Number(aj.sifon)||0; ex.b10+=Number(aj.bidon10)||0; ex.b20+=Number(aj.bidon20)||0;
  return(
    <div style={{display:"flex",flexWrap:"wrap",gap:5,...(style||{})}}>
      {(()=>{
        const real={sifon:Math.max(0,(Number(cl.sifon)||0)+ex.sifon),b10:Math.max(0,(Number(cl.bidon10)||0)+ex.b10),b20:Math.max(0,(Number(cl.bidon20)||0)+ex.b20)};
        return (<>
          {real.sifon>0&&<span style={TH}>Sif ×{real.sifon}</span>}
          {real.b10>0&&<span style={TH}>10L ×{real.b10}</span>}
          {real.b20>0&&<span style={TH}>20L ×{real.b20}</span>}
          {cl.dispenser>0&&<span style={TH}>Disp ×{cl.dispenser}</span>}
        </>);
      })()}
      {(cl.saldo||0)<0&&<span style={TD}>Debe {fmt(Math.abs(cl.saldo))}</span>}
      {(cl.saldo||0)>0&&<span style={TF}>A favor {fmt(cl.saldo)}</span>}
    </div>
  );
}


const num = (v) => Number(v)||0;

// ─── Cloud Storage (Firebase Firestore) ─────────────────────────────────────
