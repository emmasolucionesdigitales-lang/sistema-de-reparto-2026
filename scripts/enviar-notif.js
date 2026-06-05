// enviar-notificaciones.js  —  Sistema de Reparto (INDIVIDUAL)
// Recorre los recordatorios de cada usuario y envía un push cuando llega la hora.
// Se ejecuta solo, desde GitHub Actions, cada pocos minutos.

const admin   = require('firebase-admin');
const webpush = require('web-push');

// ── Claves VAPID (la pública es la misma que está en el index.html) ──
const VAPID_PUBLIC  = 'BFXBrNy6Xca3ejWylkF-sZ9_pZQzZNMjDbInqlsPzn1oF3F8EDnDOBLqt8fEZs-g_-HJCIJRZ3-dd0yiQECcHpk';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE;            // viene del secreto de GitHub

// Ventana de tolerancia hacia atrás (por si GitHub Actions se demora unos minutos)
const VENTANA_MIN = 20;

// ── Chequeos claros de configuración ──
if(!process.env.VAPID_PRIVATE){
  console.error('❌ FALTA el secreto VAPID_PRIVATE en GitHub (Settings → Secrets → Actions).');
  process.exit(1);
}
if(!process.env.FIREBASE_SA){
  console.error('❌ FALTA el secreto FIREBASE_SA en GitHub (Settings → Secrets → Actions).');
  process.exit(1);
}
let sa;
try { sa = JSON.parse(process.env.FIREBASE_SA); }
catch(e){
  console.error('❌ FIREBASE_SA no es un JSON válido. Pegá el CONTENIDO COMPLETO del archivo .json de la cuenta de servicio (desde la primera { hasta la última }).');
  process.exit(1);
}
if(!sa.project_id || !sa.private_key || !sa.client_email){
  console.error('❌ El JSON de FIREBASE_SA no parece una cuenta de servicio (le faltan project_id / private_key / client_email).');
  process.exit(1);
}
console.log('Config OK. Proyecto:', sa.project_id);

webpush.setVapidDetails('mailto:carabajalponce1980@gmail.com', VAPID_PUBLIC, VAPID_PRIVATE);

// ── Conexión a Firebase con la cuenta de servicio (secreto de GitHub) ──
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

// "Ahora" en horario de Argentina (UTC-3)
function ahoraArg(){
  const now = new Date();
  return new Date(now.getTime() - 3 * 60 * 60 * 1000);
}
function fechaStr(d){ return d.toISOString().slice(0, 10); }      // YYYY-MM-DD
function minutosDelDia(d){ return d.getUTCHours() * 60 + d.getUTCMinutes(); }

async function main(){
  const arg      = ahoraArg();
  const hoy      = fechaStr(arg);
  const ahoraMin = minutosDelDia(arg);
  console.log('Hora Argentina:', hoy, String(Math.floor(ahoraMin/60)).padStart(2,'0') + ':' + String(ahoraMin%60).padStart(2,'0'));

  const usuarios = await db.collection('users').get();
  let enviados = 0;

  for (const userDoc of usuarios.docs){
    const id       = userDoc.id;
    const datosRef = db.collection('users').doc(id).collection('datos');

    // 1) suscripción del dispositivo
    const subSnap = await datosRef.doc('push_sub').get();
    if(!subSnap.exists) continue;
    let sub;
    try { sub = JSON.parse(subSnap.data().sub); } catch { continue; }

    // 2) datos (recordatorios + clientes)
    const mainSnap = await datosRef.doc('main').get();
    if(!mainSnap.exists) continue;
    const data          = mainSnap.data();
    const recordatorios = data.recordatorios || [];
    const clientes      = data.clientes || [];
    if(!recordatorios.length) continue;

    // 3) log de lo ya enviado (para no repetir)
    const logSnap = await datosRef.doc('push_log').get();
    const log     = logSnap.exists ? (logSnap.data().enviados || {}) : {};
    let cambioLog = false;

    for (const r of recordatorios){
      if(r.confirmado) continue;
      if(r.fecha !== hoy) continue;
      if(!r.hora) continue;

      const [h, m]  = r.hora.split(':').map(Number);
      const recMin  = h * 60 + m;
      if(recMin > ahoraMin) continue;                 // todavía no es la hora
      if(ahoraMin - recMin > VENTANA_MIN) continue;   // ya pasó hace rato

      const clave = r.id + '_' + r.fecha;
      if(log[clave]) continue;                        // ya enviado

      const cli    = clientes.find(c => c.id === r.clienteId);
      const nombre = (cli && cli.nombre) || r.clienteNombre || '';
      const cuerpo = (nombre ? nombre + ' — ' : '') + (r.motivo || 'Tenés un recordatorio');

      try {
        await webpush.sendNotification(sub, JSON.stringify({
          title: '🔔 Recordatorio', body: cuerpo, tag: clave, requireInteraction: true
        }));
        log[clave] = Date.now();
        cambioLog  = true;
        enviados++;
        console.log('✓ Enviado a', id, '-', cuerpo);
      } catch(e){
        console.log('✗ Error enviando a', id, ':', e.statusCode || e.message);
        // suscripción vencida → borrarla
        if(e.statusCode === 410 || e.statusCode === 404){
          await datosRef.doc('push_sub').delete().catch(()=>{});
        }
      }
    }

    if(cambioLog) await datosRef.doc('push_log').set({ enviados: log }, { merge: true });
  }

  console.log('Listo. Notificaciones enviadas:', enviados);
}

main().catch(e => { console.error(e); process.exit(1); });
