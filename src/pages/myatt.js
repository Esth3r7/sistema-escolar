import { db } from '../services/storage.js';
import { esc } from '../utils/dom.js';
import { badge, studentStats, table } from '../components/ui.js';
const ATT_LABEL = { P: ['Presente', 'ok'], A: ['Ausente', 'bad'], T: ['Tardanza', 'warn'], J: ['Justificada', 'info'] };
export default function (root, s) {
  const me = db.get('students').find(x => x.id === s.sid);
  if (!me) { root.innerHTML = '<div class="card empty">No hay estudiante vinculado todavía.</div>'; return; }
  const rows = db.get('attendance').filter(r => r.marks[me.id]).sort((a, b) => b.date.localeCompare(a.date)).map(r => ({ date: r.date, st: r.marks[me.id] }));
  const k = studentStats(me.id);
  root.innerHTML = `<h2 class="pt">✅ Asistencia · ${esc(me.nombres)} ${esc(me.apellidos)}</h2>
    <div class="grid"><div class="stat s5"><div class="ic">✅</div><div class="t"><small>Asistencia general</small><b>${k.att === null ? '—' : k.att + '%'}</b></div></div><div class="stat s1"><div class="ic">📅</div><div class="t"><small>Días registrados</small><b>${rows.length}</b></div></div></div>
    <div class="card"><h3>Historial</h3><div id="t"></div></div>`;
  table(root.querySelector('#t'), { rows, cols: [{ h: '#', f: (r, i) => i }, { h: 'Fecha', f: r => esc(r.date) }, { h: 'Estado', f: r => badge(ATT_LABEL[r.st][0], ATT_LABEL[r.st][1]) }] });
}
