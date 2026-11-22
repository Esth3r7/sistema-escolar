import { db } from '../services/storage.js';
import { esc } from '../utils/dom.js';
const ST = [['P', 'Presente'], ['A', 'Ausente'], ['T', 'Tardanza'], ['J', 'Justificada']];
export default function (root) {
  const grados = [...new Set(db.get('students').map(s => s.grado).filter(Boolean))];
  let g = grados[0] || '', d = new Date().toISOString().slice(0, 10);
  const draw = () => {
    const list = db.get('students').filter(s => s.grado === g);
    const marks = db.get('attendance').find(a => a.date === d && a.grado === g)?.marks || {};
    const hist = db.get('attendance').slice().reverse().slice(0, 10);
    const cnt = (h, c) => Object.values(h.marks).filter(x => x === c).length;
    root.innerHTML = `<div class="card"><h3>✅ Registro de asistencia</h3><div class="form">
      <label>Grado<select id="g">${grados.map(x => `<option ${x === g ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></label>
      <label>Fecha<input id="d" type="date" value="${d}"></label></div>
      <div class="tablewrap"><table><thead><tr><th>#</th><th>Alumno</th><th>Estado</th></tr></thead><tbody>
      ${list.map((s, i) => `<tr><td>${i + 1}</td><td>${esc(s.apellidos)}, ${esc(s.nombres)}</td><td><select data-s="${s.id}">${ST.map(t => `<option value="${t[0]}" ${(marks[s.id] || 'P') === t[0] ? 'selected' : ''}>${t[1]}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table></div>
      ${list.length ? '<div class="actions"><button class="btn" id="reg">Registrar</button></div>' : '<div class="empty">Registra alumnos con su grado en el módulo Alumnos.</div>'}</div>
      <div class="card"><h3>Registros anteriores</h3>${hist.map(h => `<div class="rank">${esc(h.date)} · ${esc(h.grado)}<span class="pts">P ${cnt(h, 'P')} · A ${cnt(h, 'A')} · T ${cnt(h, 'T')} · J ${cnt(h, 'J')}</span></div>`).join('') || '<div class="empty">Aún no hay registros.</div>'}</div>`;
    root.querySelector('#g').onchange = e => { g = e.target.value; draw(); };
    root.querySelector('#d').onchange = e => { d = e.target.value; draw(); };
    root.querySelector('#reg')?.addEventListener('click', () => {
      const m = {}; root.querySelectorAll('[data-s]').forEach(s => m[s.dataset.s] = s.value);
      db.set('attendance', db.get('attendance').filter(a => !(a.date === d && a.grado === g)).concat({ date: d, grado: g, marks: m })); draw();
    });
  };
  draw();
}
