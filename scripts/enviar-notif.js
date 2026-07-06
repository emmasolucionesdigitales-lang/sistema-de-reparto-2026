// enviar-notif.js — Sistema de Reparto (INDIVIDUAL)
// Recordatorios de agenda + transferencias + mantenimiento + cierres por horario.
const admin   = require('firebase-admin');
const webpush = require('web-push');

const VAPID_PUBLIC  = 'BFXBrNy6Xca3ejWylkF-sZ9_pZQzZNMjDbInqlsPzn1oF3F8EDnDOBLqt8fEZs-g_-HJCIJRZ3-dd0yiQECcHpk';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE;
const VENTANA_MIN = 15; // con cron cada 5 min alcanza y no llega tarde

if(!process.env.VAPID_PRIVATE){ console.error('❌ FALTA VAPID_PRIVATE'); process.exit(1); }
if(!process.env.FIREBASE_SA){ console.error('❌ FALTA FIREBASE_SA'); process.exit(1); }
let sa;
try { sa = JSON.parse(process.env.FIREBASE_SA); }
catch(e){ console.error('❌ FIREBASE_SA no es JSON válido'); process.exit(1); }

webpush.setVapidDetails('mailto:carabajalponce1980@gmail.com', VAPID_PUBLIC, VAPID_PRIVATE);
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const NOMBRES_DIA = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

function ahoraArg(){ return new Date(Date.now() - 3*60*60*1000); }
function fechaStr(d){ return d.toISOString().slice(0,10); }
function minutosDelDia(d){ return d.getUTCHours()*60 + d.getUTCMinutes(); }
function diaSemana(d){ return NOMBRES_DIA[d.getUTCDay()]; }

// ── Enviar a UN dispositivo, devuelve true / código de error ────────────────
async function enviarPush(sub, payload){
  try {
    await webpush.sendNotification(sub, JSON.stringify(payload));
    console.log('✅', payload.title);
    return true;
  } catch(e){
    console.log('✗ Error push:', e.statusCode || e.message);
    return e.statusCode;
  }
}
// ── Enviar el mismo aviso a TODOS los dispositivos del negocio ──────────────
// Devuelve true si se pudo entregar a al menos uno (para marcar el log como enviado).
async function enviarATodos(subsMap, datosRef, payload){
  const entries = Object.entries(subsMap || {});
  if(!entries.length) return false;
  let algunoOk = false;
  for(const [deviceId, info] of entries){
    let sub;
    try { sub = JSON.parse(info.sub); } catch { continue; }
    const st = await enviarPush(sub, payload);
    if(st === true) algunoOk = true;
    else if(st === 410 || st === 404){
      await datosRef.doc('push_subs').update({ [deviceId]: admin.firestore.FieldValue.delete() }).catch(()=>{});
      console.log(`⚠ Suscripción de ${deviceId} expirada, borrada.`);
    }
  }
  return algunoOk;
}

async function main(){
  const arg      = ahoraArg();
  const hoy      = fechaStr(arg);
  const hora     = arg.getUTCHours();
  const ahoraMin = minutosDelDia(arg);
  const diaHoy   = diaSemana(arg);
  console.log('Hora Argentina:', hoy, String(hora).padStart(2,'0')+':'+String(arg.getUTCMinutes()).padStart(2,'0'), '—', diaHoy);

  const usuarios = await db.collection('users').get();
  console.log(`Negocios encontrados: ${usuarios.docs.length}`);
  let enviados = 0;

  for (const userDoc of usuarios.docs){
    const id       = userDoc.id;
    const datosRef = db.collection('users').doc(id).collection('datos');

    const subsSnap = await datosRef.doc('push_subs').get();
    if(!subsSnap.exists){ console.log(`[${id}] sin doc push_subs`); continue; }
    const subsMap = subsSnap.data() || {};
    if(!Object.keys(subsMap).length){ console.log(`[${id}] push_subs vacío`); continue; }
    console.log(`[${id}] dispositivos suscriptos: ${Object.keys(subsMap).length}`);

    const mainSnap = await datosRef.doc('main').get();
    if(!mainSnap.exists){ console.log(`[${id}] sin doc main`); continue; }
    const data          = mainSnap.data();
    const recordatorios = data.recordatorios || [];
    const clientes       = data.clientes || [];
    const ventas         = data.ventas || [];
    const mantVeh        = data.mantVeh || [];
    const planillas       = data.planillas || {};
    console.log(`[${id}] recordatorios: ${recordatorios.length}`);
    recordatorios.forEach(r => console.log(`   - fecha=${r.fecha} hora=${r.hora} confirmado=${!!r.confirmado}`));

    const logSnap = await datosRef.doc('push_log').get();
    const log     = logSnap.exists ? (logSnap.data().enviados || {}) : {};
    let cambioLog = false;

    // ── 1) Recordatorios de agenda (en cada corrida) ──
    for (const r of recordatorios){
      if(r.confirmado || r.fecha !== hoy || !r.hora) continue;
      const [h,m] = r.hora.split(':').map(Number);
      const recMin = h*60+m;
      if(recMin > ahoraMin) continue;
      if(ahoraMin - recMin > VENTANA_MIN) continue;
      const clave = (r.id || (r.fecha+r.hora)) + '_' + r.fecha;
      if(log[clave]) continue;
      const cli = clientes.find(c => c.id === r.clienteId);
      const nombre = (cli && cli.nombre) || r.clienteNombre || '';
      const cuerpo = (nombre ? nombre+' — ' : '') + (r.motivo || 'Tenés un recordatorio');
      const ok = await enviarATodos(subsMap, datosRef, { title: r.tipo==='cobro'?'💰 Recordatorio de cobro':'🏠 Recordatorio de visita', body:cuerpo, tag:clave, requireInteraction:true });
      if(ok){ log[clave]=Date.now(); cambioLog=true; enviados++; }
    }

    // ── 2) Transferencias pendientes (13:00 y 19:00) ──
    if(hora===13 || hora===19){
      const pend = ventas.filter(v => v.fechaKey===hoy && v.pago==='transferencia' && !v.transConfirmada).length;
      const clave = 'trans_'+hoy+'_'+hora;
      if(pend>0 && !log[clave]){
        const ok = await enviarATodos(subsMap, datosRef, { title:'💳 Transferencias sin confirmar', body:`Tenés ${pend} transferencia${pend>1?'s':''} pendiente${pend>1?'s':''} de hoy.`, tag:'trans-pend', requireInteraction:true });
        if(ok){ log[clave]=Date.now(); cambioLog=true; enviados++; }
      }
    }

    // ── 3) Mantenimiento de vehículo (07:00) ──
    if(hora===7){
      const hoyD = new Date(hoy+'T12:00:00');
      for(const mv of mantVeh){
        if(!mv.proximaFechaISO) continue;
        const prox = new Date(mv.proximaFechaISO+'T12:00:00');
        const dias = Math.round((prox-hoyD)/(1000*60*60*24));
        if(dias>=0 && dias<=3){
          const clave = 'mant_'+mv.proximaFechaISO;
          if(log[clave]) continue;
          const cuando = dias===0?'HOY':`en ${dias} día${dias>1?'s':''}`;
          const ok = await enviarATodos(subsMap, datosRef, { title:'🔧 Mantenimiento de vehículo', body:`${mv.tipo||'Mantenimiento'} vence ${cuando}${mv.descripcion?' — '+mv.descripcion:''}.`, tag:clave, requireInteraction:false });
          if(ok){ log[clave]=Date.now(); cambioLog=true; enviados++; }
        }
      }
    }

    // ── 4) y 5) Avisos de cierre — SOLO si hoy es día de reparto, hubo reparto
    //     (planilla iniciada o alguna venta) y la planilla sigue sin cerrar.
    if((hora===18 || hora===20) && DIAS.includes(diaHoy)){
      const planKey = `${diaHoy}_${hoy}`;
      const plan = planillas[planKey];
      const huboReparto = (plan && plan.iniciado) || ventas.some(v => v.fechaKey===hoy && v.dia===diaHoy);
      const sinCerrar = !plan || ((!plan.efectivo || plan.efectivo==='') && (!plan.fiado || plan.fiado===''));
      if(huboReparto && sinCerrar){
        if(hora===18){
          const clave='cierre18_'+hoy;
          if(!log[clave]){
            const ok = await enviarATodos(subsMap, datosRef, { title:'🚚 Sistema de Reparto — 18:00 hs', body:`¿Ya cerraste la planilla de ${diaHoy}?`, tag:'cierre-18', requireInteraction:false });
            if(ok){ log[clave]=Date.now(); cambioLog=true; enviados++; }
          }
        }
        if(hora===20){
          const clave='cierre20_'+hoy;
          if(!log[clave]){
            const ok = await enviarATodos(subsMap, datosRef, { title:'⏰ Son las 20:00 hs', body:'Hora de cerrar la planilla. Los pendientes quedarán como no visitados.', tag:'cierre-20', requireInteraction:true });
            if(ok){ log[clave]=Date.now(); cambioLog=true; enviados++; }
          }
        }
      }
    }

    if(cambioLog) await datosRef.doc('push_log').set({ enviados: log }, { merge: true });
  }

  console.log('Listo. Notificaciones enviadas:', enviados);
}

main().catch(e => { console.error(e); process.exit(1); });
