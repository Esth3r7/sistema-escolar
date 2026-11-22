// Dirección: SOLO CONSULTA. Las notas y la asistencia las registra el docente.
import { db } from '../services/storage.js';
import { esc } from '../utils/dom.js';
import { badge, table, exportCSV, gradeList, cfgFor } from '../components/ui.js';
import { showPrint, boletinHTML } from '../components/print.js';
import { EVAL_DEFAULT } from '../data/config.js';
export default function (root) {
  let tab = 'notas', g = gradeList()[0] || '', m = db.get('materias')[0]?.nombre || '', p = '1', from = '', to = '';
  const opt = (a, v) => a.map(x => `<option ${x === v ? 'selected' : ''}>${esc(x)}</option>`).join('');
  const draw = () => {
    const cfg = cfgFor(g, m), st = db.get('students').filter(x => x.grado === g);
    let rows, cols, csv;
    if (tab === 'notas') {
      const data = db.get('notes', {})[`${g}|${m}|${p}`] || {};
      rows = st.map(x => { const v = data[x.id]; const t = v && v.some(n => n !== '') ? v.reduce((a, n, i) => a + (Number(n) || 0) * (cfg[i] ? cfg[i][1] : 0) / 100, 0) : null; return { x, v, t }; });
      cols = [{ h: '#', f: (r, i) => i }, { h: 'Alumno', f: r => esc(r.x.apellidos) + ', ' + esc(r.x.nombres) }, ...cfg.map((c, i) => ({ h: esc(c[0]), f: r => r.v && r.v[i] !== '' && r.v[i] !== undefined ? r.v[i] : '—' })), { h: 'Total', f: r => r.t === null ? badge('Pendiente', 'warn') : badge(r.t.toFixed(1), r.t >= 70 ? 'ok' : 'bad') }];
      csv = () => exportCSV('reporte-notas', ['Alumno', ...cfg.map(c => c[0]), 'Total'], rows.map(r => [r.x.apellidos + ' ' + r.x.nombres, ...cfg.map((c, i) => r.v ? r.v[i] : ''), r.t === null ? '' : r.t.toFixed(1)]));
    } else {
      rows = st.map(x => { const c = { P: 0, A: 0, T: 0, J: 0 }; db.get('attendance').filter(r => r.grado === g && (!from || r.date >= from) && (!to || r.date <= to)).forEach(r => { const k = r.marks[x.id]; if (k) c[k]++; }); const tot = c.P + c.A + c.T + c.J; return { x, c, pct: tot ? Math.round((c.P + c.T) * 100 / tot) : null }; });
      cols = [{ h: '#', f: (r, i) => i }, { h: 'Alumno', f: r => esc(r.x.apellidos) + ', ' + esc(r.x.nombres) }, { h: 'Presente', f: r => r.c.P }, { h: 'Ausente', f: r => r.c.A }, { h: 'Tardanza', f: r => r.c.T }, { h: 'Justificada', f: r => r.c.J }, { h: '% asistencia', f: r => r.pct === null ? '—' : badge(r.pct + '%', r.pct >= 85 ? 'ok' : 'bad') }];
      csv = () => exportCSV('reporte-asistencia', ['Alumno', 'Presente', 'Ausente', 'Tardanza', 'Justificada', '%'], rows.map(r => [r.x.apellidos + ' ' + r.x.nombres, r.c.P, r.c.A, r.c.T, r.c.J, r.pct ?? '']));
    }
    root.innerHTML = `<h2 class="pt">📑 Reportes de notas y asistencia</h2><div class="card"><div class="hint" style="margin:0 0 1rem">Solo consulta: las calificaciones y la asistencia las registra cada docente desde su panel.</div>
      <div class="tabsb"><button data-t="notas" class="${tab === 'notas' ? 'on' : ''}">Calificaciones</button><button data-t="asist" class="${tab === 'asist' ? 'on' : ''}">Asistencia</button></div>
      <div class="form"><label>Grado<select id="g">${opt(gradeList(), g)}</select></label>
      ${tab === 'notas' ? `<label>Materia<select id="m">${opt(db.get('materias').map(x => x.nombre), m)}</select></label><label>Período<select id="p">${opt(['1', '2', '3', '4'], p)}</select></label>` : `<label>Desde<input type="date" id="f" value="${from}"></label><label>Hasta<input type="date" id="t2" value="${to}"></label>`}</div>
      <div id="t"></div></div>
      <div class="card"><h3>🖨️ Boletín individual</h3><div class="form"><label>Alumno de ${esc(g)}<select id="bs">${st.map(x => `<option value="${x.id}">${esc(x.apellidos)}, ${esc(x.nombres)}</option>`).join('')}</select></label></div><div class="actions"><button class="btn" id="bp">Ver y imprimir boletín</button></div></div>`;
    table(root.querySelector('#t'), { rows, cols, tools: '<button class="btn ghost sm" id="csv">Excel / CSV</button><button class="btn ghost sm" onclick="print()">Imprimir</button>' });
    root.querySelector('#csv').onclick = csv;
    const bind = (id, fn) => { const e = root.querySelector(id); if (e) e.onchange = ev => { fn(ev.target.value); draw(); }; };
    root.querySelector('#bp').onclick = () => { const x = st.find(y => y.id === root.querySelector('#bs').value); if (x) showPrint(boletinHTML(x, true)); else alert('No hay alumnos en este grado.'); };
    bind('#g', v => g = v); bind('#m', v => m = v); bind('#p', v => p = v); bind('#f', v => from = v); bind('#t2', v => to = v);
    root.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { tab = b.dataset.t; draw(); });
  };
  draw();
}
