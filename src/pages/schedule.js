import { db } from '../services/storage.js';
import { esc } from '../utils/dom.js';
import { field, readForm, modal, gradeList } from '../components/ui.js';
const WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'], SLOTS = ['08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '13:00 - 14:00', '14:00 - 15:00'];
const color = t => `hsl(${[...t].reduce((a, c) => a + c.charCodeAt(0) * 7, 0) % 360},55%,42%)`;
export default function (root, s) {
  const admin = s.role === 'admin', me = db.get('students').find(x => x.id === s.sid);
  let g = (s.role === 'student' || s.role === 'parent') && me ? me.grado : 'Todos';
  const draw = () => {
    const H = db.get('horario').filter(h => (g === 'Todos' || h.grado === g) && (s.role !== 'teacher' || h.docente === s.name || g !== 'Todos'));
    root.innerHTML = `<div class="card"><h3>🗓️ Horario de clases</h3><div class="tools">${s.role === 'student' || s.role === 'parent' ? `<span class="chip">${esc(g)}</span>` : `<select id="g" style="max-width:200px"><option>Todos</option>${gradeList().map(x => `<option ${x === g ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select>`}${admin ? '<button class="btn" id="new">+ Agregar clase</button>' : ''}</div>
    <div class="tablewrap"><table class="sch"><thead><tr><th>Hora</th>${WEEK.map(d => `<th>${d}</th>`).join('')}</tr></thead><tbody>${SLOTS.map(sl => `<tr><td><b>${sl}</b></td>${WEEK.map((d, i) => `<td>${H.filter(h => h.dia === i + 1 && h.hora === sl).map(h => `<div class="blk" style="background:${color(h.materia)}" ${admin ? `data-x="${h.id}" title="Clic para quitar"` : ''}>${esc(h.materia)}<small>${esc(h.docente)} · ${esc(h.aula)}${g === 'Todos' ? ' · ' + esc(h.grado) : ''}</small></div>`).join('')}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;
    root.querySelector('#g')?.addEventListener('change', e => { g = e.target.value; draw(); });
    root.querySelector('#new')?.addEventListener('click', () => modal('Nueva clase', `<div class="form"><label>Día<select name="dia">${WEEK.map((d, i) => `<option value="${i + 1}">${d}</option>`).join('')}</select></label><label>Hora<select name="hora">${SLOTS.map(x => `<option>${x}</option>`).join('')}</select></label>
      <label>Materia<select name="materia">${db.get('materias').map(m => `<option>${esc(m.nombre)}</option>`).join('')}</select></label><label>Docente<select name="docente">${db.get('teachers').map(t => `<option>${esc(t.nombres)} ${esc(t.apellidos)}</option>`).join('')}</select></label>
      ${field(['aula', 'Aula'])}<label>Grado<select name="grado">${gradeList().map(x => `<option>${esc(x)}</option>`).join('')}</select></label></div>`, m => { const d = readForm(m); db.add('horario', { ...d, dia: Number(d.dia) }); draw(); }));
  };
  root.addEventListener('click', e => { const b = e.target.closest('[data-x]'); if (b && confirm('¿Quitar esta clase?')) { db.remove('horario', b.dataset.x); draw(); } });
  draw();
}
