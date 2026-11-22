// Aula virtual: tablón de anuncios/tareas (tipo Classroom) + puntos de conducta (tipo ClassDojo)
import { db } from '../services/storage.js';
import { esc } from '../utils/dom.js';
const REASONS = [['👏 Participación', 1], ['🤝 Respeto', 1], ['📚 Tarea completa', 2], ['💤 Distracción', -1]];
export default function (root, { role, name, tid, sid }) {
  const staff = role === 'admin' || role === 'teacher';
  const draw = () => {
    const students = db.get('students'), posts = db.get('posts').slice().reverse().filter(p => (role !== 'student' && role !== 'parent') || !p.aula || p.aula.split('|')[0] === (db.get('students').find(x => x.id === sid) || {}).grado), points = db.get('points');
    const board = students.map(s => ({ s, t: points.filter(p => p.studentId === s.id).reduce((a, p) => a + p.delta, 0) })).sort((a, b) => b.t - a.t);
    const as = db.get('asignaciones').filter(a => a.tid === tid).map(a => [a.grado, a.materia]), ao = (as.length ? as : db.get('aulas').map(a => [a.grado, a.materia])).map(a => `<option value="${esc(a[0])}|${esc(a[1])}">${esc(a[1])} · ${esc(a[0])}</option>`).join('');
    root.innerHTML = `
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">
    <div><div class="card"><h3>📢 Tablón de clase</h3>
      ${staff ? `<form id="pf" class="form"><label>Tipo<select name="tipo"><option value="anuncio">Anuncio</option><option value="tarea">Tarea</option></select></label>
        <label>Título<input name="titulo" required></label>
        <label>Fecha de entrega<input name="fecha" type="date"></label>
        <label>Aula<select name="aula"><option value="">Todos mis grupos</option>${ao}</select></label>
        <label style="grid-column:1/-1">Mensaje<textarea name="texto" rows="2"></textarea></label></form>
        <div class="actions"><button class="btn" id="pub">Publicar</button></div><hr>` : ''}
      ${posts.map(p => `<div class="post ${esc(p.tipo)}"><b>${p.tipo === 'tarea' ? '📝' : '📣'} ${esc(p.titulo)}</b>${p.aula ? ' <span class="chip">' + esc(p.aula.replace('|', ' · ')) + '</span>' : ''}${p.fecha ? ` <span class="chip">Entrega: ${esc(p.fecha)}</span>` : ''}
        <p>${esc(p.texto)}</p><small>${esc(p.autor)}</small>${staff ? ` <button class="btn ghost sm" data-dp="${p.id}">Quitar</button>` : ''}</div>`).join('') || '<div class="empty">Sin publicaciones todavía.</div>'}
    </div></div>
    <div><div class="card"><h3>⭐ Puntos de clase</h3>
      ${staff && students.length ? `<select id="st">${students.map(s => `<option value="${s.id}">${esc(s.nombres)} ${esc(s.apellidos)}</option>`).join('')}</select>
        <div class="actions">${REASONS.map((r, i) => `<button class="btn sm ${r[1] < 0 ? 'bad' : 'ok'}" data-r="${i}">${r[0]} ${r[1] > 0 ? '+' : ''}${r[1]}</button>`).join('')}</div><hr>` : ''}
      ${board.map((b, i) => `<div class="rank"><span>${['🥇', '🥈', '🥉'][i] || i + 1}</span>${esc(b.s.nombres)} ${esc(b.s.apellidos)}<span class="pts">${b.t}</span></div>`).join('') || '<div class="empty">Registra alumnos para empezar a dar puntos.</div>'}
    </div></div></div>`;
    root.querySelector('#pub')?.addEventListener('click', () => {
      const f = root.querySelector('#pf'); if (!f.reportValidity()) return;
      db.add('posts', { ...Object.fromEntries(new FormData(f)), autor: name }); draw();
    });
    root.querySelectorAll('[data-dp]').forEach(b => b.onclick = () => { db.remove('posts', b.dataset.dp); draw(); });
    root.querySelectorAll('[data-r]').forEach(b => b.onclick = () => {
      const r = REASONS[b.dataset.r]; db.add('points', { studentId: root.querySelector('#st').value, delta: r[1], reason: r[0], date: new Date().toISOString() }); draw();
    });
  };
  draw();
}
