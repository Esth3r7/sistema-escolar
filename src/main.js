import './styles/variables.css';
import './styles/global.css';
import { db } from './services/storage.js';
import { MENUS, DEMO_USERS } from './data/config.js';
import { esc } from './utils/dom.js';
import { modal, initials } from './components/ui.js';
import { scanPayments } from './services/notifications.js';
import dashboard from './pages/dashboard.js';
import students from './pages/students.js';
import enroll from './pages/enroll.js';
import teachers from './pages/teachers.js';
import schedule from './pages/schedule.js';
import academic from './pages/academic.js';
import requests from './pages/requests.js';
import payments from './pages/payments.js';
import finance from './pages/finance.js';
import avisos from './pages/avisos.js';
import reports from './pages/reports.js';
import settings from './pages/settings.js';
import audit from './pages/audit.js';
import attendance from './pages/attendance.js';
import grades from './pages/grades.js';
import classroom from './pages/classroom.js';
import courses from './pages/courses.js';
import mynotes from './pages/mynotes.js';
import myatt from './pages/myatt.js';
import classrooms from './pages/classrooms.js';
import notifs from './pages/notifs.js';

const pages = { dashboard, students, enroll, teachers, schedule, academic, requests, payments, finance, avisos, reports, settings, audit, attendance, grades, classroom, courses, mynotes, myatt, classrooms, notifs };
const app = document.getElementById('app'), KEY = 'eduplat:session';
const session = () => { try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch { return null; } };
const keysOf = r => MENUS[r].flatMap(it => it.c ? it.c.map(c => c[0]) : [it.k]);

function login() {
  const last = (() => { try { return localStorage.getItem('eduplat:lastuser') || ''; } catch { return ''; } })();
  app.innerHTML = `<div class="lg2"><div class="brandp"><div class="mark">S$</div><h1>Sistema de Gestión Escolar</h1><p>Un solo lugar para dirección, docentes, estudiantes y familias.</p>
    <ul><li>✔ Matrícula, expedientes y aulas virtuales</li><li>✔ Asistencia y calificaciones en línea</li><li>✔ Pagos y contabilidad</li><li>✔ Una vista distinta para cada rol</li></ul></div>
    <div class="fp"><div class="fb"><h2>Iniciar sesión</h2><p>Ingresa con tu usuario y contraseña.</p>
    <form id="lf" class="form" style="grid-template-columns:1fr" autocomplete="off"><label>Usuario<input name="u" value="${esc(last)}" placeholder="Ej. admin" autofocus></label>
    <label>Contraseña<div class="pw"><input name="p" id="p" type="password" placeholder="••••••••"><button type="button" id="eye" title="Mostrar contraseña">👁️</button></div></label>
    <label class="ck"><input type="checkbox" name="rem" ${last ? 'checked' : ''}> Recordarme</label><div class="err" id="err"></div><button class="btn" style="min-height:46px">Ingresar</button></form>
    <details><summary>Usuarios de demostración</summary><p style="margin:.5rem 0 0">admin / admin1234<br>docente / docente1234<br>estudiante / estudiante1234<br>padre / padre1234</p></details></div></div></div>`;
  app.querySelector('#eye').onclick = () => { const p = app.querySelector('#p'); p.type = p.type === 'password' ? 'text' : 'password'; };
  app.querySelector('#lf').onsubmit = e => {
    e.preventDefault(); const d = new FormData(e.target), u = String(d.get('u')).trim().toLowerCase(), f = DEMO_USERS.find(x => x.u === u && x.p === d.get('p'));
    if (!u || !d.get('p')) return app.querySelector('#err').textContent = 'Escribe tu usuario y contraseña.';
    if (!f) return app.querySelector('#err').textContent = 'Usuario o contraseña incorrectos.';
    try { d.get('rem') ? localStorage.setItem('eduplat:lastuser', u) : localStorage.removeItem('eduplat:lastuser'); } catch { /* sin almacenamiento */ }
    sessionStorage.setItem(KEY, JSON.stringify({ role: f.role, name: f.name, user: f.u })); location.hash = ''; route();
  };
}

// Vincula la sesión con los registros guardados (alumno, hijos, docente)
function refresh(s) {
  const st = db.get('students'), t = db.get('teachers');
  if (s.role === 'parent') { s.kids = st.filter(x => x.familia === s.user).map(x => x.id); if (!s.kids.length && st[0]) s.kids = [st[0].id]; if (!s.kids.includes(s.sid)) s.sid = s.kids[0]; }
  else if (s.role === 'student') { const m = st.find(x => x.usuario === s.user) || st[0]; s.sid = m?.id; if (m) s.name = m.nombres + ' ' + m.apellidos; }
  else if (s.role === 'teacher') { const m = t.find(x => x.usuario === s.user) || t[0]; s.tid = m?.id; if (m) s.name = m.nombres + ' ' + m.apellidos; }
  db.user = s.name; sessionStorage.setItem(KEY, JSON.stringify(s));
}

function nav(role) {
  return MENUS[role].map(it => it.c
    ? `<div class="grp"><button class="gh" type="button"><span>${it.i}</span><span>${it.l}</span><i>▾</i></button><div class="gc">${it.c.map(c => `<a href="#${c[0]}${c[2] ? '/' + c[2] : ''}" data-k="${c[0]}" data-s="${c[2] || ''}">${c[1]}</a>`).join('')}</div></div>`
    : `<a class="top1" href="#${it.k}" data-k="${it.k}" data-s=""><span>${it.i}</span><span>${it.l}</span></a>`).join('');
}

function shell(s) {
  const inst = db.get('inst', {}), nm = esc(inst.name || 'Education Platform');
  app.innerHTML = `<aside class="side"><div class="brand">${inst.logo ? `<img src="${inst.logo}" alt="">` : '<span class="avatar" style="width:34px;height:34px;font-size:.85rem">S$</span>'} <span>${nm}</span></div>
    <div class="user"><div class="avatar" id="av"></div><div><b id="un"></b><small>● Online</small></div></div>
    <input class="sq" id="sq" placeholder="🔍 Buscar en el menú..."><nav>${nav(s.role)}</nav></aside><div class="ov" id="ov"></div>
    <div class="main"><header class="top"><button class="iconbtn" id="burger">☰</button><strong>${nm}</strong><span class="chip">${esc(inst.year || '2026-2027')}</span><span class="grow"></span>
    ${s.role === 'parent' ? '<select id="kidsel" title="Hijo/a"></select>' : ''}<button class="iconbtn" id="bell" title="Notificaciones">🔔</button><span class="chip hide" id="rc"></span><button class="btn ghost sm" id="out">Cerrar sesión</button></header><main id="view"></main></div>`;
  const q = app.querySelector('#sq');
  q.oninput = () => { const t = q.value.toLowerCase(); app.querySelectorAll('nav a').forEach(a => a.style.display = !t || a.textContent.toLowerCase().includes(t) ? '' : 'none');
    app.querySelectorAll('.grp').forEach(g => { const any = [...g.querySelectorAll('a')].some(a => a.style.display !== 'none'); g.style.display = any ? '' : 'none'; if (t && any) g.classList.add('open'); }); };
  app.querySelectorAll('.gh').forEach(b => b.onclick = () => b.parentElement.classList.toggle('open'));
  app.querySelector('#burger').onclick = () => document.body.classList.toggle('nav');
  app.querySelector('#ov').onclick = () => document.body.classList.remove('nav');
  app.querySelector('#bell').onclick = () => { const x = session() || s, unpaid = new Set(db.get('pagos').filter(p => p.estado !== 'Pagado').map(p => p.id));
    const nt = x.role === 'parent' ? db.get('notifs').filter(n => (x.kids || []).includes(n.sid) && unpaid.has(n.clave.split('|')[0])).reverse().map(n => `<div class="post tarea"><b>🔔 ${esc(n.asunto)}</b><p style="margin:.2rem 0 0">${esc(n.mensaje)}</p></div>`).join('') : '';
    modal('Notificaciones', nt + db.get('posts').slice(-6).reverse().map(p => `<div class="post ${esc(p.tipo)}"><b>${esc(p.titulo)}</b><p style="margin:.2rem 0 0">${esc(p.texto)}</p></div>`).join('') || '<div class="empty">No hay notificaciones.</div>'); };
  app.querySelector('#out').onclick = () => { sessionStorage.removeItem(KEY); document.body.classList.remove('nav'); route(); };
  app.querySelector('#kidsel')?.addEventListener('change', e => { const x = session(); x.sid = e.target.value; sessionStorage.setItem(KEY, JSON.stringify(x)); route(); });
}

const ROLE_LABEL = { admin: 'Dirección', teacher: 'Docente', student: 'Estudiante', parent: 'Madre / Tutor' };
function route() {
  const s = session(); if (!s || !MENUS[s.role]) return login();
  refresh(s);
  try { scanPayments(); } catch { /* sin datos */ }
  if (!document.getElementById('view')) shell(s);
  document.body.classList.remove('nav');
  app.querySelector('#un').textContent = s.name; app.querySelector('#av').textContent = initials(s.name.split(' ')[0], s.name.split(' ')[1]); app.querySelector('#rc').textContent = ROLE_LABEL[s.role];
  const ks = app.querySelector('#kidsel'); if (ks) { const st = db.get('students'); ks.innerHTML = (s.kids || []).map(id => { const x = st.find(y => y.id === id); return x ? `<option value="${id}" ${id === s.sid ? 'selected' : ''}>${esc(x.nombres)} ${esc(x.apellidos)} · ${esc(x.grado)}</option>` : ''; }).join('') || '<option>Sin hijos vinculados</option>'; }
  const [k, sub = ''] = location.hash.slice(1).split('/'), key = keysOf(s.role).includes(k) ? k : 'dashboard';
  document.querySelectorAll('.side a').forEach(a => { const on = a.dataset.k === key && a.dataset.s === sub; a.classList.toggle('on', on); if (on) a.closest('.grp')?.classList.add('open'); });
  const v = document.getElementById('view'), fresh = v.cloneNode(false); v.replaceWith(fresh); // limpia eventos de la pantalla anterior
  try { pages[key](fresh, { ...s, sub }); } catch (e) { fresh.innerHTML = `<div class="card"><h3>⚠️ Ocurrió un error en esta pantalla</h3><p>${esc(e.message)}</p><button class="btn" onclick="location.hash='';location.reload()">Volver al inicio</button></div>`; }
}
addEventListener('hashchange', route);
try { route(); } catch (e) { app.innerHTML = `<div style="padding:2rem"><h3>⚠️ Error al iniciar</h3><p>${esc(e.message)}</p><button onclick="sessionStorage.clear();location.reload()">Reiniciar sesión</button></div>`; }
