import re

path = "08-menu.js"
src = open(path, encoding="utf-8").read()

# Safety helper: anchor-extract a span and sanity-check its size before
# allowing it to be used as an "old" string for replacement. This guards
# against a previous bug where an end-anchor search starting too far from
# its start-anchor silently consumed hundreds of unrelated lines.
def extract(label, start_idx, end_marker, max_len):
    end_idx = src.index(end_marker, start_idx) + len(end_marker)
    span = src[start_idx:end_idx]
    assert len(span) <= max_len, f"{label}: extracted span too long ({len(span)} chars, max {max_len}) -- aborting, likely wrong anchor"
    return span, end_idx

# Locate InicioReparto's function body specifically (there is only one
# "function InicioReparto(" in the file), and do both edits scoped to
# AFTER that point and BEFORE the next top-level "function " declaration,
# so neither edit can possibly spill into PlanillaDelDia or AtajoPlanillaSemana.
fn_start = src.index("function InicioReparto(")
fn_next = src.index("\nfunction ", fn_start + 10)
body = src[fn_start:fn_next]
assert "Stock actual" in body and "Envases llenos al salir" in body, "InicioReparto body slice looks wrong"

# ---- Edit 1: prodKeys fixed map -> dynamic ----
start1 = "const prodKeys = {"
idx1S = body.index(start1)
old1, idx1E = extract("edit1 prodKeys", idx1S, "};", 200)
assert '"Sifón 1.5L"' in old1 and '"Bidón 10L"' in old1 and '"Bidón 20L"' in old1, "edit1 content mismatch"
new1 = "const prodKeys = Object.fromEntries(productosDeCarga(productos).map(p => [p.nombre, claveCargaDeProducto(p)]));"
assert body.count(old1) == 1, f"edit1 expected 1 occurrence within InicioReparto, found {body.count(old1)}"
body = body.replace(old1, new1)

# ---- Edit 2: "Stock actual - Sodería" fixed 3-tuple array -> dynamic ----
start2 = '}, [["Sif'
idx2S = body.index(start2)
old2, idx2E = extract("edit2 stock actual array", idx2S, "].map(([l, v]) =>", 400)
assert "stock?.soderia?.sifon" in old2 and "stock?.soderia?.bidon10" in old2 and "stock?.soderia?.bidon20" in old2, "edit2 content mismatch"
assert body.count(old2) == 1, f"edit2 expected 1 occurrence within InicioReparto, found {body.count(old2)}"
new2 = (
    '}, productosDeCarga(productos).map(p => { '
    'const sk = claveStockDeProducto(p); '
    'return [p.nombre.replace(" 1.5L", ""), stock?.soderia?.[sk] || 0]; '
    '}).map(([l, v]) =>'
)
body = body.replace(old2, new2)

# Re-assemble and write only at the very end.
src = src[:fn_start] + body + src[fn_next:]
open(path, "w", encoding="utf-8").write(src)
print("edit1 prodKeys dynamic OK (1)")
print("edit2 stock actual sodería display OK (1)")
print("08-menu.js phaseG2 (InicioReparto, scoped+bounded) ALL EDITS OK")
