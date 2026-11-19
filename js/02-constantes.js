// ════════════════════════════════════════════════════════════════════
// ◆  02-constantes.js — Constantes globales
// ════════════════════════════════════════════════════════════════════

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

// Cargas de salida precargadas por día (soda en unidades: 1 cajón = 6 sifones)
const CARGA_DIA_DEFAULT = {
  "Lunes":     { soda: 0,   b10: 0,  b20: 0  },
  "Martes":    { soda: 90,  b10: 45, b20: 7  },
  "Miércoles": { soda: 60,  b10: 30, b20: 9  },
  "Jueves":    { soda: 120, b10: 45, b20: 14 },
  "Viernes":   { soda: 90,  b10: 30, b20: 7  },
  "Sábado":    { soda: 0,   b10: 0,  b20: 0  },
};
const PRODUCTOS_CONFIG = [
  { id: "b10",  nombre: "Bidón 10L",       costoUnit: 800 },
  { id: "b20",  nombre: "Bidón 20L",       costoUnit: 1100 },
  { id: "soda", nombre: "Soda 1.5L (caj)", costoUnit: 880 },
];
const GASTOS_CATEGORIAS = ["propina","mercado","gnc","gaseosa","uber","inflado","frutas","otro"];

const CLIENTES_INICIALES = [];
// Pedido de Guillermo (19/11/2026): portado de La Catalina — el stock/
// comodato estaba atado a 4 nombres fijos (sifon/bidon10/bidon20/
// dispenser) en vez de a esta lista de productos. trackStock: tiene su
// propia fila en Stock. retornable: tiene comodato (envases prestados).
// capacidadBase: base por defecto de sodería para ese producto (antes
// hardcodeada en BASE_DEFAULT_FIJA, ver 16-app.js).
const PRODUCTOS_INICIALES = [
  { id:1, nombre:"Sifón 1.5L", precio:800,  costo:133.33, trackStock:true, retornable:true, capacidadBase:150 },
  { id:2, nombre:"Bidón 10L",  precio:2500, costo:800, trackStock:true, retornable:true, capacidadBase:70 },
  { id:3, nombre:"Bidón 20L",  precio:5000, costo:800, trackStock:true, retornable:true, capacidadBase:21 },
  { id:4, nombre:"Dispenser",  precio:0,    costo:15000, esDispenser:true, trackStock:true, retornable:true, capacidadBase:0 },
];
// Mapa de migración: nombre del producto clásico -> clave vieja fija con la
// que estaba guardado su stock/comodato antes de esta lista (portado de
// La Catalina, ver claveStockDeProducto en 04-utils.js).
const CLAVE_LEGACY_POR_NOMBRE = {
  "Sifón 1.5L": "sifon",
  "Bidón 10L": "bidon10",
  "Bidón 20L": "bidon20",
  "Dispenser": "dispenser",
};
// Lo mismo que CLAVE_LEGACY_POR_NOMBRE pero para el "cierre del día" /
// "carga por día" (08-menu.js) — ese subsistema usa sus propias claves
// cortas de siempre (soda/b10/b20), distintas de sifon/bidon10/bidon20.
// Un producto nuevo no tiene clave corta: usa directamente su propia clave
// de stock (prod_<id>) — ver claveCargaDeProducto en 04-utils.js.
const PL_LEGACY_POR_NOMBRE = {
  "Sifón 1.5L": "soda",
  "Bidón 10L": "b10",
  "Bidón 20L": "b20",
};

const planillaDiaVacia = () => ({
  fecha:"", peso:"", bultos:"",
  productos:{ b10:{llenos:"",vacios:"",plata:"",llenar:""}, b20:{llenos:"",vacios:"",plata:"",llenar:""}, soda:{llenos:"",vacios:"",plata:"",llenar:""} },
  gastos:[], efectivo:"", fiado:"", retenciones:"", obs:"",
});

const fmt = (n) => "$" + Math.round(Number(n)||0).toLocaleString("es-AR");
const num = (v) => Number(v)||0;

// ─── Cloud Storage (Firebase Firestore) ─────────────────────────────────────
// cloudSave and cloudLoad are defined in the <script> tag above via Firebase SDK

// Debounce save — espera 1.5s después del último cambio antes de guardar
let _saveTimer = null;
let _saveQueue = null;
