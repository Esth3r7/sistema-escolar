import { db } from '../services/storage.js';
import { esc } from '../utils/dom.js';
import { modal, badge, money, studentStats, initials, spark, ring, donut, gradeList, courseColor, courseIcon, myCourses, courseProgress } from '../components/ui.js';
import { seedDemo } from '../data/demo.js';
const WK = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const todayN = () => { const d = new Date().getDay(); return d >= 1 && d <= 5 ? d : 1; };
const kpi = (t, v, extra = '', cls = '') => `<div class="kpi ${cls}"><small>${t}</small><b>${v}</b>${extra}</div>`;
const classesOf = list => { const d = todayN(), l = list.filter(h => h.dia === d).sort((a, b) => a.hora.localeCompare(b.hora)); return `<div class="card"><h3>Clases de ${WK[d]}</h3>${l.map(h => `<div class="rank"><b>${esc(h.hora)}</b> ${esc(h.materia)}<span class="pts" style="font-weight:400;font-size:.85rem">${esc(h.aula)}</span></div>`).join('') || '<div class="empty">Sin clases programadas.</div>'}</div>`; };
const posts = tipo => db.get('posts').filter(p => p.tipo === tipo).slice().reverse();
const tareas = () => posts('tarea').filter(p => p.fecha).sort((a, b) => a.fecha.localeCompare(b.fecha));
const avisosCard = () => `<div class="card"><h3>📢 Avisos y novedades</h3>${posts('anuncio').slice(0, 3).map(a => `<div class="post"><b>${esc(a.titulo)}</b><p style="margin:.2rem 0">${esc(a.texto)}</p></div>`).join('') || '<div class="empty">Sin avisos.</div>'}</div>`;
const entregasCard = () => `<div class="card"><h3>📅 Próximas entregas</h3>${tareas().slice(0, 4).map(t => `<div class="rank" data-t="${t.id}" style="cursor:pointer" title="Ver detalle"><span>📝</span><div><b>${esc(t.titulo)}</b><br><small>${esc(t.texto)}</small></div><span class="pts">${badge(t.fecha, 'warn')}</span></div>`).join('') || '<div class="empty">Nada pendiente.</div>'}<div class="actions"><a class="btn sm" href="#classroom">Ver actividades</a></div></div>`;
function monthly(mv) {
  const by = {}; mv.forEach(m => { const k = m.fecha.slice(0, 7); by[k] = by[k] || [0, 0]; by[k][m.tipo === 'Ingreso' ? 0 : 1] += Number(m.monto); });
  const ks = Object.keys(by).sort().slice(-6), mx = Math.max(1, ...ks.flatMap(k => by[k]));
  return `<div class="bars">${ks.map(k => `<div><span><em style="height:${by[k][0] * 100 / mx}%;background:#1d4ed8" title="Ingresos"></em><em style="height:${by[k][1] * 100 / mx}%;background:#93c5fd" title="Egresos"></em></span><small>${k.slice(5)}/${k.slice(2, 4)}</small></div>`).join('') || '<div class="empty" style="width:100%">Sin movimientos aún.</div>'}</div><small style="color:var(--c-muted)">■ Ingresos &nbsp; <span style="color:#93c5fd">■</span> Egresos</small>`;
}
function admin(root, s, again) {
  const st = db.get('students'), T = db.get('teachers'), rq = db.get('requests'), mv = db.get('movs'), pend = rq.filter(r => r.estado === 'Pendiente').length;
  const paid = db.get('pagos').filter(p => p.estado === 'Pagado').reduce((a, p) => a + Number(p.monto), 0);
  let pr = 0, tot = 0; db.get('attendance').forEach(r => Object.values(r.marks).forEach(m => { tot++; if (m === 'P' || m === 'T') pr++; }));
  const ing = mv.filter(m => m.tipo === 'Ingreso').reduce((a, m) => a + Number(m.monto), 0), egr = mv.filter(m => m.tipo === 'Egreso').reduce((a, m) => a + Number(m.monto), 0);
  const aulas = db.get('aulas');
  root.innerHTML = `<h2 class="pt">Resumen principal de administración</h2>
  ${st.length ? '' : '<div class="card"><h3>👋 Bienvenido</h3><p>El sistema está vacío y listo para usarse. Registra tus datos o carga datos de demostración para explorarlo.</p><button class="btn" id="seed">Cargar datos de demostración</button></div>'}
  <div class="kpis">${kpi('Estudiantes matriculados', st.length, spark() + '<small>Estado: <b style="color:var(--c-ok);font-size:inherit;display:inline">● Al día</b></small>')}${kpi('Docentes activos', T.length)}${kpi('Secciones habilitadas', db.get('secciones').length)}
  ${kpi('Solicitudes de inscripción pendientes', pend, pend ? '<span class="bd warn">⚠ Requiere atención</span>' : '', pend ? 'al' : '')}${kpi('Pagos realizados', money(paid))}${kpi('Asistencia general', tot ? Math.round(pr * 100 / tot) + '%' : '—')}</div>
  <div class="cols"><div>
   <div class="card"><h3>Gestión de aulas virtuales</h3><div class="form"><label>Curso / grado<select id="ag">${gradeList().map(g => `<option>${esc(g)}</option>`).join('')}</select></label><label>Asignatura<select id="am">${db.get('materias').map(m => `<option>${esc(m.nombre)}</option>`).join('')}</select></label><label>Docente<select id="ad">${T.map(t => `<option>${esc(t.nombres)} ${esc(t.apellidos)}</option>`).join('')}</select></label></div>
   <div class="actions"><button class="btn" id="addAula">+ Añadir nueva aula virtual</button><a class="btn ghost" href="#classrooms">Supervisar aulas</a></div>
   ${aulas.map(a => `<div class="rank">${courseIcon(a.materia)} <b>${esc(a.materia)}</b> · ${esc(a.grado)}<small style="color:var(--c-muted)">${esc(a.docente)} · ${st.filter(x => x.grado === a.grado).length} alumnos vinculados automáticamente</small><button class="btn bad sm pts" data-xa="${a.id}">Quitar</button></div>`).join('') || '<div class="empty">Aún no hay aulas virtuales.</div>'}</div>
   <div class="card"><h3>Inscripciones recientes</h3><div class="tablewrap"><table><thead><tr><th>Nombre</th><th>Fecha</th><th>Grado</th><th>Estado</th></tr></thead><tbody>${rq.slice(-5).reverse().map(r => `<tr><td>${esc(r.nombres)} ${esc(r.apellidos)}</td><td>${esc(r.fecha)}</td><td>${esc(r.grado)}</td><td>${badge(r.estado, r.estado === 'Aprobado' ? 'ok' : r.estado === 'Rechazado' ? 'bad' : 'warn')}</td></tr>`).join('') || '<tr><td colspan="4" class="empty">Sin solicitudes</td></tr>'}</tbody></table></div><div class="actions"><a class="btn sm" href="#requests/aprobacion">Gestionar inscripciones</a></div></div></div>
   <div><div class="card"><h3>Balances mensuales RD$</h3><p style="margin:0"><b>${money(ing - egr)}</b> <small style="color:var(--c-muted)">balance acumulado</small></p>${monthly(mv)}</div></div></div>`;
  root.querySelector('#seed')?.addEventListener('click', () => { seedDemo(); location.reload(); });
  root.querySelector('#addAula')?.addEventListener('click', () => { const g = root.querySelector('#ag').value, m = root.querySelector('#am').value; if (!g || !m) return alert('Primero crea grados y asignaturas (Académico).'); db.add('aulas', { grado: g, materia: m, docente: root.querySelector('#ad').value }); again(); });
  root.querySelectorAll('[data-xa]').forEach(b => b.onclick = () => { db.remove('aulas', b.dataset.xa); again(); });
}
function teacher(root, s) {
  const st = db.get('students'), as = db.get('asignaciones').filter(a => a.tid === s.tid), gr = [...new Set(as.map(a => a.grado))], hoy = new Date().toISOString().slice(0, 10);
  const sin = gr.filter(g => !db.get('attendance').some(r => r.grado === g && r.date === hoy));
  root.innerHTML = `<div class="welcome"><div class="avatar lg">${initials(s.name.split(' ')[0], s.name.split(' ')[1])}</div><div><h2>Bienvenido/a, ${esc(s.name)}</h2><small style="color:var(--c-muted)">Panel docente</small></div></div>
  <div class="kpis">${kpi('Mis cursos', as.length)}${kpi('Alumnos a cargo', st.filter(x => gr.includes(x.grado)).length)}${kpi('Tareas publicadas', posts('tarea').length)}${kpi('Asistencia pendiente hoy', sin.length, sin.length ? '<span class="bd warn">⚠ ' + sin.map(esc).join(', ') + '</span>' : '<span class="bd ok">Al día</span>', sin.length ? 'al' : 'good')}</div>
  <div class="cols"><div>${classesOf(db.get('horario').filter(h => h.docente === s.name))}
  <div class="card"><h3>Mis cursos</h3>${as.map(a => `<div class="rank">${courseIcon(a.materia)} <b>${esc(a.materia)}</b><span class="pts">${esc(a.grado)}</span></div>`).join('') || '<div class="empty">Aún no tienes cursos asignados. Dirección los asigna en Docentes → Asignación.</div>'}<div class="actions"><a class="btn" href="#attendance">✅ Tomar asistencia</a><a class="btn" href="#grades">📝 Registrar calificaciones</a><a class="btn ghost" href="#classroom">Publicar tarea</a></div></div></div>
  <div>${entregasCard()}${avisosCard()}</div></div>`;
}
function student(root, s) {
  const me = db.get('students').find(x => x.id === s.sid);
  if (!me) { root.innerHTML = '<div class="card empty">Aún no hay estudiante vinculado. Dirección debe registrarlo en Estudiantes → Expedientes.</div>'; return; }
  const k = studentStats(me.id, true), cs = myCourses(me.grado);
  root.innerHTML = `<div class="welcome"><div class="avatar lg">${initials(me.nombres, me.apellidos)}</div><div><h2>¡Bienvenido/a, ${esc(me.nombres)}!</h2><small style="color:var(--c-muted)">● En línea · ${esc(me.grado)}</small></div></div>
  <div class="kpis">${kpi('Promedio', k.avg === null ? '—' : k.avg.toFixed(1), '', 'good')}${kpi('Asistencia', k.att === null ? '—' : k.att + '%')}${kpi('Tareas por entregar', tareas().length)}${kpi('Materias', cs.length)}</div>
  <div class="cols"><div class="card"><h3>Mis materias</h3><div class="ccards">${cs.map(c => `<div class="cc"><div class="bn" style="background:${courseColor(c.materia)}">${courseIcon(c.materia)}</div><div class="bd2"><b>${esc(c.materia)}</b><small>${esc(c.docente)}</small><div class="row"><a class="btn sm" href="#courses">Continuar</a>${ring(courseProgress(me.id, me.grado, c.materia))}</div></div></div>`).join('') || '<div class="empty">Aún no tienes materias.</div>'}</div></div>
  <div>${entregasCard()}${avisosCard()}${classesOf(db.get('horario').filter(h => h.grado === me.grado))}</div></div>`;
}
function parent(root, s) {
  const me = db.get('students').find(x => x.id === s.sid);
  if (!me) { root.innerHTML = '<div class="card empty">Aún no hay hijos vinculados a esta cuenta.</div>'; return; }
  const k = studentStats(me.id), pg = db.get('pagos').filter(p => p.sid === me.id).sort((a, b) => a.fecha.localeCompare(b.fecha)), nx = pg.find(p => p.estado !== 'Pagado');
  const c = { P: 0, A: 0, T: 0, J: 0 }; db.get('attendance').forEach(r => { const m = r.marks[me.id]; if (m) c[m]++; });
  const rec = db.get('attendance').filter(r => r.marks[me.id]).sort((a, b) => b.date.localeCompare(a.date))[0];
  const act = [...posts('tarea').slice(0, 2).map(p => ['📝', 'Nueva tarea', p.titulo + (p.fecha ? ' · entrega ' + p.fecha : '')]), ...posts('anuncio').slice(0, 2).map(p => ['📢', 'Aviso', p.titulo]), ...(rec ? [['✅', 'Asistencia', (rec.marks[me.id] === 'A' ? 'Ausente' : 'Presente') + ' el ' + rec.date]] : [])];
  const unpaid = new Set(pg.filter(p => p.estado !== 'Pagado').map(p => p.id)), alerts = db.get('notifs').filter(n => n.sid === me.id && unpaid.has(n.clave.split('|')[0])).slice(-2).map(n => `<div class="post tarea"><b>🔔 ${esc(n.asunto)}</b><p style="margin:.2rem 0 0">${esc(n.mensaje)}</p></div>`).join('');
  root.innerHTML = `<h2 class="pt">Panel familiar · Resumen <span class="sel">Estudiante seleccionado: ${esc(me.nombres)} ${esc(me.apellidos)} (${esc(me.grado)})</span></h2>
  ${alerts}<div class="kpis">${kpi('Promedio académico', k.avg === null ? '—' : k.avg.toFixed(1), '', 'good')}${kpi('Asistencia actual', k.att === null ? '—' : k.att + '%')}${kpi('Estado de colegiatura', nx ? (nx.estado === 'Vencido' ? 'Vencido' : 'Pendiente') : 'Al día', nx ? '<small>Próximo: ' + esc(nx.desc) + '</small>' : '', nx ? (nx.estado === 'Vencido' ? 'al' : '') : 'good')}${kpi('Novedades', tareas().length + posts('anuncio').length, '<small>Tareas y avisos</small>')}</div>
  <div class="cols3"><div><div class="card"><h3>Asistencia del período</h3>${donut([[c.P + c.T, '#16a34a'], [c.J, '#f59e0b'], [c.A, '#dc2626']], k.att === null ? '—' : k.att + '%')}<div class="legend"><span><i style="background:#16a34a"></i>Presente ${c.P + c.T}</span><span><i style="background:#f59e0b"></i>Justificada ${c.J}</span><span><i style="background:#dc2626"></i>Ausente ${c.A}</span></div></div>
  ${entregasCard()}<div class="card"><h3>Boletín</h3><a class="btn" style="background:#f97316" href="#mynotes">Ver boletín de calificaciones</a></div></div>
  <div class="card"><h3>Actividad reciente de ${esc(me.nombres)}</h3><div class="tl">${act.map(a => `<div><b>${a[0]} ${a[1]}</b><br>${esc(a[2])}</div>`).join('') || '<div class="empty">Sin actividad reciente.</div>'}</div></div>
  <div>${classesOf(db.get('horario').filter(h => h.grado === me.grado))}${avisosCard()}</div></div>`;
}
export default function (root, s) {
  root.addEventListener('click', e => {
    const r = e.target.closest('[data-t]'); if (!r) return; const p = db.get('posts').find(x => x.id === r.dataset.t); if (!p) return;
    modal('📝 ' + esc(p.titulo), `${p.aula ? '<span class="chip">' + esc(p.aula.replace('|', ' · ')) + '</span> ' : ''}${p.fecha ? badge('Entrega ' + p.fecha, 'warn') : ''}<p style="white-space:pre-wrap">${esc(p.texto)}</p><small style="color:var(--c-muted)">Publicado por ${esc(p.autor)}</small>${s.role === 'student' ? '<div class="actions"><a class="btn" href="#classroom" onclick="document.querySelector(\'.modal\').remove()">Ir a mis actividades</a></div>' : ''}`);
  });
  const again = () => render();
  const render = () => ({ admin, teacher, student, parent })[s.role](root, s, again);
  render();
}
