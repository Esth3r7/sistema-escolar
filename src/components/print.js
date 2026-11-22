// Documentos imprimibles (boletín y reporte financiero). Vista previa + Imprimir / Guardar como PDF.
import { db } from '../services/storage.js';
import { esc } from '../utils/dom.js';
import { money, myCourses, cfgFor, totalOf, isVisible } from './ui.js';
export function showPrint(html) {
  const o = document.createElement('div'); o.id = 'pv';
  o.innerHTML = `<div class="pvbar"><button class="btn" id="pvp">🖨️ Imprimir / Guardar PDF</button><button class="btn ghost" id="pvx">Cerrar</button></div>${html}`;
  document.body.appendChild(o); document.body.classList.add('printing');
  o.querySelector('#pvx').onclick = () => { o.remove(); document.body.classList.remove('printing'); };
  o.querySelector('#pvp').onclick = () => print();
}
const head = inst => `<div class="bl-head"><div class="bl-logo">${inst.logo ? `<img src="${inst.logo}" alt="">` : '🎓'}</div><div class="grow"><div class="bl-school">${esc(inst.name || 'Gestión Escolar')}</div><div class="bl-sub">${esc(inst.address || '')}${inst.phone ? ' · ' + esc(inst.phone) : ''}${inst.email ? ' · ' + esc(inst.email) : ''}</div></div><div class="bl-year">Año escolar<br><b>${esc(inst.year || '2026-2027')}</b></div></div>`;
export function boletinHTML(me, all) {
  const inst = db.get('inst', {}), notes = db.get('notes', {}), g = me.grado;
  const rows = myCourses(g).map(c => { const cfg = cfgFor(g, c.materia); const t = ['1', '2', '3', '4'].map(p => { const d = (notes[`${g}|${c.materia}|${p}`] || {})[me.id]; return d && d.some(x => x !== '') && (all || isVisible(g, c.materia, p)) ? totalOf(d, cfg) : null; }); const v = t.filter(x => x !== null); return { m: c.materia, t, avg: v.length ? v.reduce((a, b) => a + b, 0) / v.length : null }; });
  const av = rows.map(r => r.avg).filter(x => x !== null), gen = av.length ? av.reduce((a, b) => a + b, 0) / av.length : null;
  const c = { P: 0, A: 0, T: 0, J: 0 }; db.get('attendance').forEach(r => { const k = r.marks[me.id]; if (k) c[k]++; });
  const tot = c.P + c.A + c.T + c.J, pct = tot ? Math.round((c.P + c.T) * 100 / tot) : null;
  const cell = n => n === null ? '<td class="c">—</td>' : `<td class="c ${n >= 70 ? '' : 'low'}">${n.toFixed(0)}</td>`;
  return `<div class="sheet bl">${head(inst)}<h1 class="bl-title">BOLETÍN DE CALIFICACIONES</h1>
  <div class="bl-data"><div><small>Estudiante</small><b>${esc(me.apellidos)}, ${esc(me.nombres)}</b></div><div><small>Grado / sección</small><b>${esc(g)}</b></div><div><small>Código</small><b>${esc(me.codigo || '—')}</b></div><div><small>Fecha de emisión</small><b>${new Date().toISOString().slice(0, 10)}</b></div></div>
  <table class="bl-t"><thead><tr><th style="text-align:left">Asignatura</th><th>P1</th><th>P2</th><th>P3</th><th>P4</th><th>Promedio</th><th>Estado</th></tr></thead><tbody>
  ${rows.map(r => `<tr><td>${esc(r.m)}</td>${r.t.map(cell).join('')}<td class="c"><b>${r.avg === null ? '—' : r.avg.toFixed(1)}</b></td><td class="c">${r.avg === null ? '—' : r.avg >= 70 ? 'Aprobada' : 'Reprobada'}</td></tr>`).join('') || '<tr><td colspan="7" class="c">Sin asignaturas registradas</td></tr>'}
  <tr class="bl-f"><td>Promedio general</td><td colspan="4"></td><td class="c"><b>${gen === null ? '—' : gen.toFixed(1)}</b></td><td></td></tr></tbody></table>
  <div class="bl-2"><div><h4>Resumen de asistencia</h4><table class="bl-t"><tbody><tr><td>Días presente</td><td class="c">${c.P}</td></tr><tr><td>Tardanzas</td><td class="c">${c.T}</td></tr><tr><td>Ausencias justificadas</td><td class="c">${c.J}</td></tr><tr><td>Ausencias sin justificar</td><td class="c">${c.A}</td></tr><tr class="bl-f"><td>% de asistencia</td><td class="c"><b>${pct === null ? '—' : pct + '%'}</b></td></tr></tbody></table></div>
  <div><h4>Escala de valoración</h4><table class="bl-t"><tbody><tr><td>90 – 100</td><td>Excelente</td></tr><tr><td>80 – 89</td><td>Muy bueno</td></tr><tr><td>70 – 79</td><td>Satisfactorio</td></tr><tr><td>Menos de 70</td><td>Necesita apoyo</td></tr></tbody></table></div></div>
  <h4>Observaciones</h4><div class="bl-obs"></div><div class="bl-sign"><div>Director/a</div><div>Docente titular</div><div>Padre, madre o tutor</div></div>
  <div class="bl-foot">Documento generado por el Sistema de Gestión Escolar · ${esc(inst.name || 'Gestión Escolar')}</div></div>`;
}
export function financeHTML(all, from, to) {
  const inst = db.get('inst', {}), sum = t => all.filter(m => m.tipo === t).reduce((a, m) => a + Number(m.monto), 0), ing = sum('Ingreso'), egr = sum('Egreso');
  const pc = db.get('pagos').filter(p => p.estado !== 'Pagado').reduce((a, p) => a + Number(p.monto), 0);
  const by = {}; all.forEach(m => { const k = m.fecha.slice(0, 7); by[k] = by[k] || [0, 0]; by[k][m.tipo === 'Ingreso' ? 0 : 1] += Number(m.monto); });
  const ks = Object.keys(by).sort(), mx = Math.max(1, ...ks.flatMap(k => by[k]));
  const cat = {}; all.filter(m => m.tipo === 'Ingreso').forEach(m => cat[m.categoria] = (cat[m.categoria] || 0) + Number(m.monto));
  const cs = Object.entries(cat).sort((a, b) => b[1] - a[1]), COL = ['#1d4ed8', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe']; let acc = 0;
  const stops = cs.map(([k, v], i) => { const a = acc * 100 / (ing || 1); acc += v; return `${COL[i % 5]} ${a}% ${acc * 100 / (ing || 1)}%`; }).join(',') || '#e2e8f0 0 100%';
  const kp = (t, v, c) => `<div class="fr-k" style="border-top-color:${c}"><small>${t}</small><b>${v}</b></div>`;
  return `<div class="sheet fr"><div class="fr-cover"><div><div class="fr-kicker">${esc(inst.name || 'Gestión Escolar')}</div><h1>REPORTE FINANCIERO</h1><div class="fr-per">${from || to ? esc(from || 'Inicio') + ' al ' + esc(to || 'hoy') : 'Todos los movimientos'} · Año escolar ${esc(inst.year || '2026-2027')}</div></div><div class="fr-mark">📊</div></div>
  <div class="fr-kpis">${kp('Ingresos', money(ing), '#1d4ed8')}${kp('Egresos', money(egr), '#60a5fa')}${kp('Balance', money(ing - egr), ing - egr >= 0 ? '#16a34a' : '#dc2626')}${kp('Por cobrar', money(pc), '#f59e0b')}</div>
  <div class="bl-2"><div><h4>Ingresos y egresos por mes</h4><div class="fr-bars">${ks.map(k => `<div><span><em style="height:${by[k][0] * 100 / mx}%;background:#1d4ed8"></em><em style="height:${by[k][1] * 100 / mx}%;background:#93c5fd"></em></span><small>${k.slice(5)}/${k.slice(2, 4)}</small></div>`).join('') || '<small>Sin datos</small>'}</div><small>■ Ingresos &nbsp; <span style="color:#93c5fd">■</span> Egresos</small></div>
  <div><h4>Ingresos por categoría</h4><div class="fr-donut" style="background:conic-gradient(${stops})"></div><div class="fr-leg">${cs.map(([k, v], i) => `<span><i style="background:${COL[i % 5]}"></i>${esc(k)} · ${money(v)}</span>`).join('') || '<small>Sin ingresos</small>'}</div></div></div>
  <h4>Detalle de movimientos</h4><table class="bl-t"><thead><tr><th style="text-align:left">Fecha</th><th style="text-align:left">Categoría</th><th style="text-align:left">Subcategoría</th><th>Tipo</th><th style="text-align:right">Monto</th></tr></thead><tbody>${all.map(m => `<tr><td>${esc(m.fecha)}</td><td>${esc(m.categoria)}</td><td>${esc(m.sub)}</td><td class="c">${esc(m.tipo)}</td><td style="text-align:right">${money(m.monto)}</td></tr>`).join('') || '<tr><td colspan="5" class="c">Sin movimientos</td></tr>'}</tbody></table>
  <div class="bl-foot">Reporte generado el ${new Date().toISOString().slice(0, 10)} · Sistema de Gestión Escolar</div></div>`;
}
