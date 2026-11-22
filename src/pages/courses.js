import { db } from '../services/storage.js';
import { esc } from '../utils/dom.js';
import { badge, ring, courseColor, courseIcon, myCourses, courseProgress, cfgFor, isVisible } from '../components/ui.js';
export default function (root, s) {
  const me = db.get('students').find(x => x.id === s.sid);
  if (!me) { root.innerHTML = '<div class="card empty">Aún no hay estudiante vinculado.</div>'; return; }
  const cs = myCourses(me.grado); let sel = cs[0]?.materia, p = '1';
  const draw = () => {
    const cfg = sel ? cfgFor(me.grado, sel) : [], d = (db.get('notes', {})[`${me.grado}|${sel}|${p}`] || {})[me.id], pub = isVisible(me.grado, sel, p);
    root.innerHTML = `<h2 class="pt">📖 Mis materias</h2><div class="cols"><div class="card"><div class="ccards">${cs.map(c => `<div class="cc ${c.materia === sel ? 'on' : ''}"><div class="bn" style="background:${courseColor(c.materia)}">${courseIcon(c.materia)}</div><div class="bd2"><b>${esc(c.materia)}</b><small>${esc(c.docente)}</small><div class="row"><button class="btn sm" data-c="${esc(c.materia)}">Continuar</button>${ring(courseProgress(me.id, me.grado, c.materia))}</div></div></div>`).join('') || '<div class="empty">Aún no tienes materias.</div>'}</div></div>
    <div class="card"><h3>${esc(sel || 'Materia')}</h3><div class="pills">${[1, 2, 3, 4].map(n => `<button class="pill c${n} ${String(n) === p ? 'on' : ''}" data-p="${n}">${n}.° período</button>`).join('')}</div>
    ${cfg.map((c, i) => { const v = d && d[i] !== undefined && d[i] !== '' ? d[i] : null; return `<div class="chk ${v !== null ? 'done' : ''}"><span class="box">${v !== null ? '✓' : ''}</span><span class="grow">${esc(c[0])} <small style="color:var(--c-muted)">(${c[1]}%)</small></span>${v === null ? badge('Pendiente', 'warn') : pub ? badge(String(v), 'ok') : badge('Registrada', 'gray')}</div>`; }).join('')}
    <div class="actions"><a class="btn sm" href="#classroom">Ver tareas</a></div></div></div>`;
  };
  root.addEventListener('click', e => { const c = e.target.closest('[data-c]'), q = e.target.closest('[data-p]'); if (c) { sel = c.dataset.c; draw(); } else if (q) { p = q.dataset.p; draw(); } });
  draw();
}
