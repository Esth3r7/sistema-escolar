import { db } from '../services/storage.js';
import { esc } from '../utils/dom.js';
import { badge, studentStats, cfgFor, totalOf, isVisible } from '../components/ui.js';
import { showPrint, boletinHTML } from '../components/print.js';
export default function (root, s) {
  const me = db.get('students').find(x => x.id === s.sid);
  if (!me) { root.innerHTML = '<div class="card empty">No hay estudiante vinculado todavía.</div>'; return; }
  let p = '1', sel = null;
  const draw = () => {
    const notes = db.get('notes', {}), mats = db.get('materias'), k = studentStats(me.id, true);
    const raw = m => { const v = (notes[`${me.grado}|${m}|${p}`] || {})[me.id]; return v && v.some(x => x !== '') ? v : null; };
    const v = sel && raw(sel), pub = sel && isVisible(me.grado, sel, p), cfg = sel ? cfgFor(me.grado, sel) : [];
    root.innerHTML = `<h2 class="pt">📊 Calificaciones · ${esc(me.nombres)} ${esc(me.apellidos)}</h2>
    <div class="card"><div class="pills">${[1, 2, 3, 4].map(n => `<button class="pill c${n} ${String(n) === p ? 'on' : ''}" data-p="${n}">${n}.° Período</button>`).join('')}<span class="chip" style="margin-left:auto">Promedio general: ${k.avg === null ? '—' : k.avg.toFixed(1)}</span></div>
    <div class="grid">${mats.map(m => { const d = raw(m.nombre), vis = isVisible(me.grado, m.nombre, p); return `<div class="course ${sel === m.nombre ? 'on' : ''}" data-m="${esc(m.nombre)}"><b>${esc(m.nombre)}</b><br><small>${esc(m.docente || '')}</small><br>${!d ? badge('Evaluación pendiente', 'warn') : !vis ? badge('Notas aún no publicadas', 'gray') : badge('Total: ' + totalOf(d, cfgFor(me.grado, m.nombre)).toFixed(1), totalOf(d, cfgFor(me.grado, m.nombre)) >= 70 ? 'ok' : 'bad')}</div>`; }).join('') || '<div class="empty">Aún no hay materias.</div>'}</div></div>
    ${sel ? `<div class="card"><h3>${esc(sel)}</h3>${v && pub ? `<div class="tablewrap"><table><thead><tr><th>N°</th><th>Actividad</th><th>Porcentaje</th><th>Nota</th></tr></thead><tbody>${cfg.map((c, i) => `<tr><td>${i + 1}</td><td>${esc(c[0])}</td><td>${badge(c[1] + '%', 'info')}</td><td>${v[i] === '' || v[i] === undefined ? '—' : v[i]}</td></tr>`).join('')}</tbody></table></div><p><b>Total ponderado acumulado: ${totalOf(v, cfg).toFixed(1)}</b></p>` : v ? '<div class="empty">Tu docente aún no ha publicado las notas de este período.</div>' : '<div class="empty">Materia con evaluación pendiente.</div>'}</div>` : ''}
    <div class="actions"><button class="btn" id="pb">🖨️ Boletín imprimible</button></div>`;
    root.querySelector('#pb').onclick = () => showPrint(boletinHTML(me, false));
  };
  root.addEventListener('click', e => { const a = e.target.closest('[data-p]'), b = e.target.closest('[data-m]'); if (a) { p = a.dataset.p; sel = null; draw(); } else if (b) { sel = b.dataset.m; draw(); } });
  draw();
}
