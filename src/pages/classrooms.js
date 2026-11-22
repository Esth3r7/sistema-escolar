// Dirección: supervisa TODAS las aulas virtuales (solo consulta)
import { db } from '../services/storage.js';
import { esc } from '../utils/dom.js';
import { badge, table, courseIcon, cfgFor } from '../components/ui.js';
import { EVAL_DEFAULT } from '../data/config.js';
export default function (root) {
  let sel = null;
  const stats = a => {
    const st = db.get('students').filter(x => x.grado === a.grado), cfg = cfgFor(a.grado, a.materia), notes = db.get('notes', {}), id = a.grado + '|' + a.materia;
    const avgOf = sid => { const t = []; for (let p = 1; p <= 4; p++) { const v = (notes[`${id}|${p}`] || {})[sid]; if (v && v.some(x => x !== '')) t.push(v.reduce((s, x, i) => s + (Number(x) || 0) * (cfg[i] ? cfg[i][1] : 0) / 100, 0)); } return t.length ? t.reduce((x, y) => x + y, 0) / t.length : null; };
    const av = st.map(x => avgOf(x.id)).filter(v => v !== null);
    return { st, avgOf, avg: av.length ? av.reduce((x, y) => x + y, 0) / av.length : null, posts: db.get('posts').filter(p => p.aula === id) };
  };
  const draw = () => {
    const aulas = db.get('aulas').map(a => ({ ...a, ...stats(a) })), cur = aulas.find(a => a.id === sel);
    root.innerHTML = `<h2 class="pt">🏫 Aulas virtuales · supervisión</h2><div class="card"><div class="hint" style="margin:0 0 1rem">Vista de solo consulta para Dirección. Las aulas se crean desde el Dashboard y cada docente publica en las suyas.</div><div id="t"></div></div>
    ${cur ? `<div class="cols"><div class="card"><h3>${courseIcon(cur.materia)} ${esc(cur.materia)} · ${esc(cur.grado)}</h3><p style="margin-top:0">Docente: <b>${esc(cur.docente)}</b></p>
      <div class="tablewrap"><table><thead><tr><th>Alumno</th><th>Promedio de la materia</th></tr></thead><tbody>${cur.st.map(x => { const v = cur.avgOf(x.id); return `<tr><td>${esc(x.apellidos)}, ${esc(x.nombres)}</td><td>${v === null ? badge('Pendiente', 'warn') : badge(v.toFixed(1), v >= 70 ? 'ok' : 'bad')}</td></tr>`; }).join('') || '<tr><td colspan="2" class="empty">Sin alumnos en este grado</td></tr>'}</tbody></table></div></div>
      <div class="card"><h3>Actividad del aula</h3>${cur.posts.slice().reverse().map(p => `<div class="post ${esc(p.tipo)}"><b>${p.tipo === 'tarea' ? '📝' : '📣'} ${esc(p.titulo)}</b> ${p.fecha ? badge('Entrega ' + p.fecha, 'warn') : ''}<p style="margin:.2rem 0 0">${esc(p.texto)}</p></div>`).join('') || '<div class="empty">El docente aún no ha publicado en esta aula.</div>'}</div></div>` : ''}`;
    table(root.querySelector('#t'), { rows: aulas, size: 6, cols: [{ h: 'Aula', f: r => courseIcon(r.materia) + ' <b>' + esc(r.materia) + '</b>' }, { h: 'Grado', f: r => esc(r.grado) }, { h: 'Docente', f: r => esc(r.docente) }, { h: 'Alumnos', f: r => r.st.length }, { h: 'Publicaciones', f: r => r.posts.length }, { h: 'Promedio', f: r => r.avg === null ? '—' : r.avg.toFixed(1) }, { h: '', f: r => `<button class="btn sm ${r.id === sel ? '' : 'ghost'}" data-v="${r.id}">Ver detalle</button>` }] });
  };
  root.addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (b) { sel = b.dataset.v; draw(); } });
  draw();
}
