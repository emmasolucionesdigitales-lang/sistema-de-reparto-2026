import re

path_const = "02-constantes.js"
path_utils = "04-utils.js"

with open(path_const, "r", encoding="utf-8") as f:
    src_const = f.read()

old_prod = '''const CLIENTES_INICIALES = [];
const PRODUCTOS_INICIALES = [
  { id:1, nombre:"Sifón 1.5L", precio:800,  costo:133.33 },
  { id:2, nombre:"Bidón 10L",  precio:2500, costo:800 },
  { id:3, nombre:"Bidón 20L",  precio:5000, costo:800 },
  { id:4, nombre:"Dispenser",  precio:0,    costo:15000, esDispenser:true },
];'''
assert src_const.count(old_prod) == 1, "old_prod not found or not unique: %d" % src_const.count(old_prod)

new_prod = '''const CLIENTES_INICIALES = [];
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
};'''
src_const = src_const.replace(old_prod, new_prod)

with open(path_const, "w", encoding="utf-8") as f:
    f.write(src_const)
print("02-constantes.js OK")

with open(path_utils, "r", encoding="utf-8") as f:
    src_utils = f.read()

old_keyenv = '''const KEY_PROD_ENV = {
  "Sifón 1.5L": "sifon",
  "Bidón 10L": "bidon10",
  "Bidón 20L": "bidon20",
  "Dispenser": "dispenser"
};'''
assert src_utils.count(old_keyenv) == 1, "old_keyenv not found or not unique: %d" % src_utils.count(old_keyenv)

new_keyenv = '''let KEY_PROD_ENV = {
  "Sifón 1.5L": "sifon",
  "Bidón 10L": "bidon10",
  "Bidón 20L": "bidon20",
  "Dispenser": "dispenser"
};
// ── Pedido de Guillermo (19/11/2026, portado de La Catalina): poder agregar
//    un producto nuevo y que el stock y los envases prestados lo manejen
//    solos, sin tocar código. claveStockDeProducto(p): la clave de stock/
//    comodato de un producto — para los 4 de siempre, la MISMA clave de
//    toda la vida; para uno nuevo, se genera sola ("prod_<id>").
function claveStockDeProducto(p) {
  if (!p) return null;
  if (typeof CLAVE_LEGACY_POR_NOMBRE !== "undefined" && CLAVE_LEGACY_POR_NOMBRE[p.nombre]) {
    return CLAVE_LEGACY_POR_NOMBRE[p.nombre];
  }
  return "prod_" + p.id;
}
// Reconstruye KEY_PROD_ENV (nombre de producto -> clave de stock) para
// TODOS los productos actuales. Se llama cada vez que cambia la lista de
// productos (ver 16-app.js). Como KEY_PROD_ENV se reasigna (no se muta),
// cualquier función que lo lea en el momento ve siempre la versión más
// nueva.
function actualizarKeyProdEnv(productos) {
  const nuevo = {};
  (productos || []).forEach(p => {
    if (p.trackStock === false) return;
    nuevo[p.nombre] = claveStockDeProducto(p);
  });
  KEY_PROD_ENV = nuevo;
}
// ── Lo mismo para el cierre del día / carga por día (08-menu.js,
//    07-stock.js, 14-config.js), que usa sus propias 3 claves fijas
//    (soda/b10/b20). productosDeCarga: productos que van al camión y
//    entran al cierre del día (todos los que tienen stock propio, MENOS
//    el dispenser). claveCargaDeProducto: clave corta de siempre para los
//    3 de siempre; para un producto nuevo, usa directamente su clave de
//    stock (ya única).
function productosDeCarga(productos) {
  return (productos || []).filter(p => p.trackStock !== false && !p.esDispenser);
}
function claveCargaDeProducto(p) {
  if (!p) return null;
  if (typeof PL_LEGACY_POR_NOMBRE !== "undefined" && PL_LEGACY_POR_NOMBRE[p.nombre]) {
    return PL_LEGACY_POR_NOMBRE[p.nombre];
  }
  return claveStockDeProducto(p);
}'''
src_utils = src_utils.replace(old_keyenv, new_keyenv)

with open(path_utils, "w", encoding="utf-8") as f:
    f.write(src_utils)
print("04-utils.js OK")
