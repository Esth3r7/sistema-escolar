import { db } from '../services/storage.js';
import { esc } from '../utils/dom.js';
import { field, readForm, modal, table, gradeList } from '../components/ui.js';
const F = [['nombres', 'Nombres', 'req'], ['apellidos', 'Apellidos', 'req'], ['cedula', 'Cédula'], ['usuario', 'Usuario de acceso'], ['correo', 'Correo', 'email'], ['telefono', 'Teléfono', 'tel'], ['nivel', 'Nivel', 'select:Inicial,Primaria,Secundaria'], ['tipo', 'Tipo de docente', 'select:Titular,Especialista,Auxiliar']];
export default function (root, { role }) {
  let sel = null;
  const draw = () => {
    const T = db.get('teachers'), cur = T.find(t => t.id === sel), as = db.get('asignaciones').filter(a => a.tid === sel);
    root.innerHTML = `<div class="two"><div class="card"><h3>👩‍🏫 Docentes disponibles</h3><div id="t"></div></div>
      <div class="card"><h3>📚 Grados asignados${cur ? ' · ' + esc(cur.nombres) + ' ' + esc(cur.apellidos) : ''}</h3>
      ${cur ? `<div class="form"><label>Grado<select id="ag">${gradeList().map(g => `<option>${esc(g)}</option>`).join('')}</select></label><label>Materia<select id="am">${db.get('materias').map(m => `<option>${esc(m.nombre)}</option>`).join('')}</select></label></div>
      <div class="actions"><button class="btn" id="add">+ Asignar</button></div>
      <div class="tablewrap"><table><thead><tr><th>Orden</th><th>Grado</th><th>Materia</th><th></th></tr></thead><tbody>${as.map((a, i) => `<tr><td>${i + 1}</td><td>${esc(a.grado)}</td><td>${esc(a.materia)}</td><td><button class="btn bad sm" data-q="${a.id}">Quitar</button></td></tr>`).join('') || '<tr><td colspan="4" class="empty">Sin asignaciones</td></tr>'}</tbody></table></div>`
      : '<div class="empty">Selecciona un docente de la lista para ver y asignar sus grados.</div>'}</div></div>`;
    table(root.querySelector('#t'), { size: 6, rows: T, tools: '<button class="btn" id="new">+ Nuevo docente</button>',
      cols: [{ h: 'Apellidos', f: r => esc(r.apellidos) }, { h: 'Nombres', f: r => esc(r.nombres) }, { h: 'Nivel', f: r => esc(r.nivel) }, { h: 'Acción', f: r => `<button class="btn ${r.id === sel ? '' : 'ghost'} sm" data-s="${r.id}">Seleccionar</button> <button class="btn bad sm" data-d="${r.id}">🗑️</button>` }] });
    root.querySelector('#new').onclick = () => modal('Nuevo docente', `<div class="form">${F.map(f => field(f)).join('')}</div>`, m => { db.add('teachers', readForm(m)); draw(); });
    root.querySelector('#add')?.addEventListener('click', () => { db.add('asignaciones', { tid: sel, grado: root.querySelector('#ag').value, materia: root.querySelector('#am').value }); draw(); });
    root.querySelectorAll('[data-q]').forEach(b => b.onclick = () => { db.remove('asignaciones', b.dataset.q); draw(); });
  };
  root.addEventListener('click', e => { const b = e.target.closest('[data-s],[data-d]'); if (!b) return;
    if (b.dataset.s) { sel = b.dataset.s; draw(); } else if (confirm('¿Eliminar docente?')) { db.remove('teachers', b.dataset.d); sel = null; draw(); } });
  draw();
}
