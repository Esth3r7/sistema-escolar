import { db } from '../services/storage.js';
import { esc } from '../utils/dom.js';
import { badge, field, readForm, modal, table, gradeList } from '../components/ui.js';
export default function (root, s) {
  const pending = s.sub === 'solicitudes';
  const draw = () => {
    const rows = db.get('requests').filter(r => !pending || r.estado === 'Pendiente');
    root.innerHTML = `<div class="card"><h3>${pending ? '📥 Solicitudes de inscripción' : '✅ Aprobación de inscripciones'}</h3><div id="t"></div></div>`;
    table(root.querySelector('#t'), { rows, tools: '<button class="btn" id="new">+ Nueva solicitud</button>',
      cols: [{ h: '#', f: (r, i) => i }, { h: 'Aspirante', f: r => esc(r.nombres) + ' ' + esc(r.apellidos) }, { h: 'Grado', f: r => esc(r.grado) }, { h: 'Fecha', f: r => esc(r.fecha) }, { h: 'Estado', f: r => badge(r.estado, r.estado === 'Aprobado' ? 'ok' : r.estado === 'Rechazado' ? 'bad' : 'warn') },
        { h: 'Acción', f: r => r.estado === 'Pendiente' ? `<button class="btn ok sm" data-a="${r.id}">Aprobar</button> <button class="btn bad sm" data-r="${r.id}">Rechazar</button>` : '' }] });
    root.querySelector('#new').onclick = () => modal('Nueva solicitud', `<div class="form">${field(['nombres', 'Nombres', 'req'])}${field(['apellidos', 'Apellidos', 'req'])}<label>Grado solicitado<input name="grado" list="gl" required></label><datalist id="gl">${gradeList().map(g => `<option>${esc(g)}</option>`).join('')}</datalist>${field(['fecha', 'Fecha', 'date'], new Date().toISOString().slice(0, 10))}</div>`, m => { db.add('requests', { ...readForm(m), estado: 'Pendiente' }); draw(); });
  };
  root.addEventListener('click', e => {
    const a = e.target.closest('[data-a],[data-r]'); if (!a) return; const id = a.dataset.a || a.dataset.r, all = db.get('requests'), r = all.find(x => x.id === id);
    if (a.dataset.a) { db.add('students', { nombres: r.nombres, apellidos: r.apellidos, grado: r.grado, estado: 'Activo', codigo: 'A' + (100 + db.get('students').length) }); }
    db.set('requests', all.map(x => x.id === id ? { ...x, estado: a.dataset.a ? 'Aprobado' : 'Rechazado' } : x)); db.log(a.dataset.a ? 'Aprobar inscripción' : 'Rechazar inscripción', 'requests'); draw();
  });
  draw();
}
