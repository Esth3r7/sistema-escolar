import { db } from '../services/storage.js';
import { esc } from '../utils/dom.js';
// Lista reutilizable: formulario + tabla + eliminar. fields = [[campo, etiqueta, atributos]]
export function crud(root, { key, title, fields }) {
  const draw = () => {
    const list = db.get(key);
    root.innerHTML = `<div class="card"><h3>${title}</h3><form class="form">${fields.map(f => `<label>${f[1]}<input name="${f[0]}" ${f[2] || ''}></label>`).join('')}</form>
      <div class="actions"><button class="btn" data-s>Guardar</button></div>
      <div class="tablewrap"><table><thead><tr>${fields.map(f => `<th>${f[1]}</th>`).join('')}<th></th></tr></thead><tbody>
      ${list.map(r => `<tr>${fields.map(f => `<td>${esc(r[f[0]])}</td>`).join('')}<td><button class="btn bad sm" data-d="${r.id}">Eliminar</button></td></tr>`).join('')}</tbody></table></div>
      ${list.length ? '' : '<div class="empty">Sin registros todavía.</div>'}</div>`;
    root.querySelector('[data-s]').onclick = () => { const f = root.querySelector('form'); if (!f.reportValidity()) return; db.add(key, Object.fromEntries(new FormData(f))); draw(); };
    root.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { if (confirm('¿Eliminar?')) { db.remove(key, b.dataset.d); draw(); } });
  };
  draw();
}
