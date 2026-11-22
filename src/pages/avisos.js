import { db } from '../services/storage.js';
import { esc } from '../utils/dom.js';
import { field, readForm, modal } from '../components/ui.js';
export default function (root, s) {
  const staff = s.role === 'admin' || s.role === 'teacher';
  const draw = () => {
    const L = db.get('posts').filter(p => p.tipo === 'anuncio').slice().reverse();
    root.innerHTML = `<h2 class="pt">📢 Avisos institucionales</h2><div class="card"><div class="tools"><b class="grow">Comunicados</b>${staff ? '<button class="btn" id="new">+ Nuevo aviso</button>' : ''}</div>
      ${L.map(a => `<div class="post"><b>${esc(a.titulo)}</b><p>${esc(a.texto)}</p><small>${esc(a.autor)} · ${esc(a.fecha || '')}</small>${staff ? ` <button class="btn bad sm" data-x="${a.id}">Eliminar</button>` : ''}</div>`).join('') || '<div class="empty">No hay avisos por ahora.</div>'}</div>`;
    root.querySelector('#new')?.addEventListener('click', () => modal('Publicar aviso', `<div class="form" style="grid-template-columns:1fr">${field(['titulo', 'Título', 'req'])}<label>Contenido<textarea name="texto" rows="4"></textarea></label>${field(['fecha', 'Fecha', 'date'], new Date().toISOString().slice(0, 10))}</div>`, m => { db.add('posts', { ...readForm(m), tipo: 'anuncio', autor: s.name }); draw(); }));
  };
  root.addEventListener('click', e => { const b = e.target.closest('[data-x]'); if (b && confirm('¿Eliminar aviso?')) { db.remove('posts', b.dataset.x); draw(); } });
  draw();
}
