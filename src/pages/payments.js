import { db } from '../services/storage.js';
import { esc } from '../utils/dom.js';
import { badge, money, stateColor, field, readForm, modal, table, initials } from '../components/ui.js';
export default function (root, s) {
  const admin = s.role === 'admin';
  let sid = admin ? db.get('students')[0]?.id : s.sid;
  const draw = () => {
    const st = db.get('students'), me = st.find(x => x.id === sid);
    if (!me) { root.innerHTML = '<div class="card empty">No hay estudiantes registrados todavía.</div>'; return; }
    const rows = db.get('pagos').filter(p => p.sid === sid).sort((a, b) => a.fecha.localeCompare(b.fecha));
    const last = rows.filter(r => r.estado === 'Pagado').pop(), nx = rows.find(r => r.estado !== 'Pagado');
    root.innerHTML = `<h2 class="pt">💳 Pagos</h2>
    <div class="card profile"><div class="avatar lg">${initials(me.nombres, me.apellidos)}</div><div class="grow"><b style="font-size:1.2rem">${esc(me.apellidos)}, ${esc(me.nombres)}</b><br><small>${esc(me.grado)} · Último pago: ${last ? esc(last.fecha) : '—'}</small><br><small>Próximo pago: ${nx ? esc(nx.desc) + ' (' + esc(nx.fecha) + ')' : 'Sin pendientes'}</small></div>
      ${nx ? badge(nx.estado === 'Vencido' ? 'PAGO VENCIDO' : 'PAGO PENDIENTE', stateColor[nx.estado]) : badge('AL DÍA', 'ok')}
      ${admin ? `<select id="st" style="max-width:240px">${st.map(x => `<option value="${x.id}" ${x.id === sid ? 'selected' : ''}>${esc(x.apellidos)}, ${esc(x.nombres)}</option>`).join('')}</select>` : ''}</div>
    <div class="card"><h3>Lista de pagos realizados y pendientes</h3><div id="t"></div></div>`;
    table(root.querySelector('#t'), { rows, tools: admin ? '<button class="btn" id="new">+ Registrar cargo</button>' : '',
      cols: [{ h: 'N°', f: (r, i) => i }, { h: 'Descripción', f: r => esc(r.desc) }, { h: 'Fecha', f: r => esc(r.fecha) }, { h: 'Estado', f: r => badge(r.estado, stateColor[r.estado]) }, { h: 'Monto', f: r => money(r.monto) },
        { h: admin ? 'Acción' : '', f: r => admin && r.estado !== 'Pagado' ? `<button class="btn ok sm" data-c="${r.id}">Cobrar</button>` : '' }] });
    root.querySelector('#st')?.addEventListener('change', e => { sid = e.target.value; draw(); });
    root.querySelector('#new')?.addEventListener('click', () => modal('Registrar cargo', `<div class="form">${[['desc', 'Descripción', 'req'], ['fecha', 'Fecha', 'date'], ['monto', 'Monto (RD$)', 'number'], ['estado', 'Estado', 'select:Pendiente,Pagado,Parcial,Vencido']].map(f => field(f)).join('')}</div>`, m => { db.add('pagos', { ...readForm(m), sid }); draw(); }));
  };
  root.addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (b) { db.set('pagos', db.get('pagos').map(p => p.id === b.dataset.c ? { ...p, estado: 'Pagado' } : p)); draw(); } });
  draw();
}
