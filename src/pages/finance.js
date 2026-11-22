import { db } from '../services/storage.js';
import { esc } from '../utils/dom.js';
import { badge, money, field, readForm, modal, table, exportCSV } from '../components/ui.js';
import { showPrint, financeHTML } from '../components/print.js';
export default function (root, s) {
  const sub = s.sub, TITLE = { ingresos: 'Ingresos', egresos: 'Egresos' }[sub] || 'Resumen financiero';
  let from = '', to = '';
  const draw = () => {
    const all = db.get('movs').slice().sort((a, b) => b.fecha.localeCompare(a.fecha)).filter(m => (!from || m.fecha >= from) && (!to || m.fecha <= to)).filter(m => sub === 'ingresos' ? m.tipo === 'Ingreso' : sub === 'egresos' ? m.tipo === 'Egreso' : true);
    const sum = (t, f = () => true) => all.filter(m => m.tipo === t && f(m)).reduce((a, m) => a + Number(m.monto), 0);
    const ing = sum('Ingreso'), egr = sum('Egreso'), porCobrar = db.get('pagos').filter(p => p.estado !== 'Pagado').reduce((a, p) => a + Number(p.monto), 0);
    const st = (ic, t, v, c) => `<div class="stat s${c}"><div class="ic">${ic}</div><div class="t"><small>${t}</small><b>${v}</b></div></div>`;
    root.innerHTML = `<h2 class="pt">💰 ${TITLE}</h2><div class="grid">${st('⬇️', 'Ingresos', money(ing), 1)}${st('⬆️', 'Egresos', money(egr), 2)}${st('💲', 'Balance', money(ing - egr), 3)}${st('🧾', 'Por cobrar', money(porCobrar), 4)}</div>
    <div class="card"><h3>Movimientos</h3><div class="tools"><label>Desde <input type="date" id="f" value="${from}"></label><label>Hasta <input type="date" id="t2" value="${to}"></label>
    <button class="btn ghost sm" id="csv">Excel</button><button class="btn ghost sm" id="csv2">CSV</button><button class="btn ghost sm" id="pr">PDF</button><button class="btn ghost sm" id="pr2">Imprimir</button></div><div id="t"></div></div>`;
    table(root.querySelector('#t'), { rows: all, tools: '<button class="btn" id="new">+ Nuevo movimiento</button>',
      cols: [{ h: 'N°', f: (r, i) => i }, { h: 'Categoría', f: r => esc(r.categoria) }, { h: 'Subcategoría', f: r => esc(r.sub) }, { h: 'Monto', f: r => money(r.monto) }, { h: 'Tipo', f: r => badge(r.tipo, r.tipo === 'Ingreso' ? 'ok' : 'bad') }, { h: 'Fecha', f: r => esc(r.fecha) }, { h: '', f: r => `<button class="btn bad sm" data-x="${r.id}">🗑️</button>` }] });
    const ex = () => exportCSV('movimientos', ['N°', 'Categoría', 'Subcategoría', 'Monto', 'Tipo', 'Fecha'], all.map((m, i) => [i + 1, m.categoria, m.sub, m.monto, m.tipo, m.fecha]));
    root.querySelector('#csv').onclick = ex; root.querySelector('#csv2').onclick = ex;
    root.querySelector('#pr').onclick = () => showPrint(financeHTML(all, from, to)); root.querySelector('#pr2').onclick = () => showPrint(financeHTML(all, from, to));
    root.querySelector('#f').onchange = e => { from = e.target.value; draw(); };
    root.querySelector('#t2').onchange = e => { to = e.target.value; draw(); };
    root.querySelector('#new').onclick = () => modal('Nuevo movimiento', `<div class="form">${[['tipo', 'Tipo', 'select:Ingreso,Egreso'], ['categoria', 'Categoría', 'req'], ['sub', 'Subcategoría'], ['monto', 'Monto (RD$)', 'number'], ['fecha', 'Fecha', 'date']].map(f => field(f)).join('')}</div>`, m => { const d = readForm(m); if (!d.monto || !d.fecha) { alert('Indica monto y fecha.'); return false; } db.add('movs', d); draw(); });
  };
  root.addEventListener('click', e => { const b = e.target.closest('[data-x]'); if (b && confirm('¿Eliminar movimiento?')) { db.remove('movs', b.dataset.x); draw(); } });
  draw();
}
