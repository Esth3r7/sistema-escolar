import { db } from '../services/storage.js';
import { esc } from '../utils/dom.js';
import { EVAL_DEFAULT } from '../data/config.js';
export const badge = (t, c = 'info') => `<span class="bd ${c}">${esc(t)}</span>`;
export const money = n => 'RD$ ' + Number(n || 0).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const stateColor = { Pagado: 'ok', Pendiente: 'warn', Vencido: 'bad', Parcial: 'info', Activo: 'ok', Inactivo: 'gray' };
export const initials = (a = '', b = '') => ((a[0] || '') + (b[0] || '')).toUpperCase() || '?';
export function gradeList() { return [...new Set([...db.get('grados').map(g => g.nombre), ...db.get('students').map(s => s.grado)].filter(Boolean))]; }
export function field(f, v = '') {
  const [n, l, t = ''] = f;
  const inp = t.startsWith('select:') ? `<select name="${n}">${t.slice(7).split(',').map(o => `<option ${o === v ? 'selected' : ''}>${o}</option>`).join('')}</select>`
    : `<input name="${n}" ${t === 'req' ? 'required' : t ? `type="${t}"` : ''} value="${esc(v)}">`;
  return `<label>${l}${inp}</label>`;
}
export const readForm = m => Object.fromEntries([...m.querySelectorAll('[name]')].map(i => [i.name, i.value]));
export function modal(title, body, onSave, wide) {
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="mbox ${wide ? 'wide' : ''}"><div class="mh"><b>${title}</b><button class="x">✕</button></div><div class="mb">${body}</div>${onSave ? '<div class="mf"><button class="btn ghost c">Cancelar</button><button class="btn s">Guardar</button></div>' : ''}</div>`;
  document.body.appendChild(m);
  const close = () => m.remove();
  m.querySelector('.x').onclick = close;
  if (onSave) {
    m.querySelector('.c').onclick = close;
    m.querySelector('.s').onclick = () => { if ([...m.querySelectorAll('[required]')].some(i => !i.value.trim())) return alert('Completa los campos obligatorios.'); if (onSave(m) !== false) close(); };
  }
  return m;
}
// Tabla con buscador y paginación
export function table(host, { cols, rows, size = 8, tools = '' }) {
  let q = '', p = 1;
  host.innerHTML = `<div class="tools"><input class="q" placeholder="🔍 Buscar...">${tools}</div><div class="tablewrap"><table><thead><tr>${cols.map(c => `<th>${c.h}</th>`).join('')}</tr></thead><tbody></tbody></table></div><div class="pager"></div>`;
  const paint = () => {
    const all = rows.filter(r => !q || JSON.stringify(Object.values(r)).toLowerCase().includes(q));
    const pages = Math.max(1, Math.ceil(all.length / size)); p = Math.min(p, pages);
    const sl = all.slice((p - 1) * size, p * size);
    host.querySelector('tbody').innerHTML = sl.map((r, i) => `<tr>${cols.map(c => `<td>${c.f(r, (p - 1) * size + i + 1)}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${cols.length}" class="empty">Sin registros todavía</td></tr>`;
    host.querySelector('.pager').innerHTML = `<span>Registros ${all.length ? (p - 1) * size + 1 : 0} al ${Math.min(p * size, all.length)} de ${all.length}</span><span><button class="btn ghost sm" data-p="-1" ${p <= 1 ? 'disabled' : ''}>Anterior</button> <b>${p}/${pages}</b> <button class="btn ghost sm" data-p="1" ${p >= pages ? 'disabled' : ''}>Siguiente</button></span>`;
  };
  host.querySelector('.q').oninput = e => { q = e.target.value.toLowerCase(); p = 1; paint(); };
  host.addEventListener('click', e => { const b = e.target.closest('[data-p]'); if (b) { p += Number(b.dataset.p); paint(); } });
  paint();
}
export function exportCSV(name, head, rows) {
  const csv = [head, ...rows].map(r => r.map(c => '"' + String(c ?? '').replace(/"/g, '""') + '"').join(',')).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv' })); a.download = name + '.csv'; a.click();
}
export const cfgFor = (g, m) => db.get('evalmap', {})[g + '|' + m] || db.get('evalcfg', EVAL_DEFAULT);
export const isVisible = (g, m, p) => !!db.get('evalvis', {})[g + '|' + m + '|' + p];
export const totalOf = (v, cfg) => v.reduce((a, x, i) => a + (Number(x) || 0) * (cfg[i] ? Number(cfg[i][1]) : 0) / 100, 0);
// onlyVisible: estudiantes y familias solo ven lo que el docente decidió mostrar
export function studentStats(sid, onlyVisible) {
  const notes = db.get('notes', {}), tots = [];
  Object.entries(notes).forEach(([key, g]) => { const [gr, ma, pe] = key.split('|'), v = g[sid]; if (v && v.some(x => x !== '') && (!onlyVisible || isVisible(gr, ma, pe))) tots.push(totalOf(v, cfgFor(gr, ma))); });
  let pr = 0, tot = 0; db.get('attendance').forEach(r => { const m = r.marks[sid]; if (m) { tot++; if (m === 'P' || m === 'T') pr++; } });
  return { avg: tots.length ? tots.reduce((a, b) => a + b, 0) / tots.length : null, att: tot ? Math.round(pr * 100 / tot) : null };
}

export const spark = (c = '#1d4ed8') => `<svg viewBox="0 0 100 26" preserveAspectRatio="none" class="spark"><path d="M0 20 Q12 16 25 12 T50 8 T75 14 T100 6" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/><path d="M0 20 Q12 16 25 12 T50 8 T75 14 T100 6 V26 H0 Z" fill="${c}" opacity=".12"/></svg>`;
export const ring = (pct, c = '#1d4ed8') => `<span class="ring" style="--p:${pct};--c:${c}"><b>${pct}%</b></span>`;
export function donut(parts, center) {
  const sum = parts.reduce((a, p) => a + p[0], 0); let acc = 0;
  const st = sum ? parts.map(p => { const a = acc * 100 / sum; acc += p[0]; return `${p[1]} ${a}% ${acc * 100 / sum}%`; }).join(',') : '#e2e8f0 0 100%';
  return `<div class="donut" style="background:conic-gradient(${st})"><span>${center}</span></div>`;
}
const ICONS = ['💻', '🔧', '📐', '🔬', '📖', '🎨', '🧮', '🌎'];
const hsh = t => [...String(t)].reduce((a, c) => a + c.charCodeAt(0) * 7, 0);
export const courseColor = t => `linear-gradient(135deg,hsl(${200 + hsh(t) % 60},70%,38%),hsl(${215 + hsh(t) % 50},75%,55%))`;
export const courseIcon = t => ICONS[hsh(t) % ICONS.length];
export function myCourses(grado) {
  const a = db.get('aulas').filter(x => x.grado === grado);
  return a.length ? a.map(x => ({ materia: x.materia, docente: x.docente })) : db.get('materias').map(m => ({ materia: m.nombre, docente: m.docente || '' }));
}
export function courseProgress(sid, grado, materia) {
  const cfg = cfgFor(grado, materia), notes = db.get('notes', {}); let f = 0;
  for (let p = 1; p <= 4; p++) { const d = (notes[`${grado}|${materia}|${p}`] || {})[sid]; if (d) f += d.filter(x => x !== '').length; }
  return Math.min(100, Math.round(f * 100 / (cfg.length * 4)));
}
