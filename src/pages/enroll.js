import { db } from '../services/storage.js';
import { esc } from '../utils/dom.js';
import { badge, modal, table, gradeList } from '../components/ui.js';
export default function (root) {
  const draw = () => {
    root.innerHTML = '<div class="card"><h3>📋 Matrícula</h3><div id="t"></div></div>';
    const st = db.get('students'), name = id => { const x = st.find(y => y.id === id); return x ? x.apellidos + ', ' + x.nombres : '(eliminado)'; };
    table(root.querySelector('#t'), { rows: db.get('matriculas'), tools: '<button class="btn" id="new">+ Matricular alumno</button>',
      cols: [{ h: '#', f: (r, i) => i }, { h: 'Alumno', f: r => esc(name(r.sid)) }, { h: 'Año', f: r => esc(r.anio) }, { h: 'Grado', f: r => esc(r.grado) }, { h: 'Sección', f: r => esc(r.seccion) }, { h: 'Turno', f: r => esc(r.turno) }, { h: 'Tipo', f: r => badge(r.tipo, 'info') }, { h: '', f: r => `<button class="btn bad sm" data-x="${r.id}">Cancelar</button>` }] });
    root.querySelector('#new').onclick = () => {
      if (!st.length) return alert('Primero registra alumnos en Expedientes.');
      modal('Nueva matrícula', `<div class="form"><label>Alumno<select name="sid">${st.map(x => `<option value="${x.id}">${esc(x.apellidos)}, ${esc(x.nombres)}</option>`).join('')}</select></label><label>Año escolar<input name="anio" value="${esc(db.get('inst', {}).year || '2026-2027')}"></label>
      <label>Grado<input name="grado" list="gl" required></label><datalist id="gl">${gradeList().map(g => `<option>${esc(g)}</option>`).join('')}</datalist><label>Sección<input name="seccion" placeholder="A"></label>
      <label>Turno<select name="turno"><option>Matutino</option><option>Vespertino</option></select></label><label>Tipo<select name="tipo"><option>Nuevo ingreso</option><option>Reinscripción</option></select></label></div>`, m => {
        const d = Object.fromEntries([...m.querySelectorAll('[name]')].map(i => [i.name, i.value])); if (!d.grado.trim()) { alert('Indica el grado.'); return false; }
        db.add('matriculas', d); db.set('students', db.get('students').map(x => x.id === d.sid ? { ...x, grado: d.grado } : x)); draw();
      });
    };
  };
  root.addEventListener('click', e => { const b = e.target.closest('[data-x]'); if (b && confirm('¿Cancelar matrícula?')) { db.remove('matriculas', b.dataset.x); draw(); } });
  draw();
}
