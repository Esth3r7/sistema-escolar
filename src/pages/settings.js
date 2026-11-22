import { db } from '../services/storage.js';
import { esc } from '../utils/dom.js';
export default function (root) {
  const i = db.get('inst', {});
  const f = (k, l, ph = '') => `<label>${l}<input name="${k}" value="${esc(i[k])}" placeholder="${ph}"></label>`;
  root.innerHTML = `<div class="card"><h3>⚙️ Datos de la institución</h3><form id="f" class="form">
    ${f('name', 'Nombre del centro', 'Mi Colegio')}${f('director', 'Director/a')}${f('email', 'Correo')}${f('phone', 'Teléfono')}
    ${f('address', 'Dirección')}${f('municipio', 'Municipio')}${f('provincia', 'Provincia')}${f('pais', 'País', 'República Dominicana')}
    ${f('year', 'Año escolar activo', '2026-2027')}
    <label>Logotipo<input type="file" id="logo" accept="image/*"></label></form>
    <img id="prev" class="logo-prev ${i.logo ? '' : 'hidden'}" src="${i.logo || ''}" alt="Logo">
    <div class="actions"><button class="btn" id="save">Guardar</button><button class="btn bad" id="reset">Restablecer demo</button></div></div>`;
  let logo = i.logo || '';
  root.querySelector('#logo').onchange = e => {
    const file = e.target.files[0]; if (!file || file.size > 500000) return alert('Imagen máx. 500 KB');
    const r = new FileReader(); r.onload = () => { logo = r.result; const p = root.querySelector('#prev'); p.src = logo; p.classList.remove('hidden'); }; r.readAsDataURL(file);
  };
  root.querySelector('#save').onclick = () => { db.set('inst', { ...Object.fromEntries(new FormData(root.querySelector('#f'))), logo }); location.reload(); };
  root.querySelector('#reset').onclick = () => { if (confirm('Se borrarán todos los datos locales. ¿Continuar?')) { db.reset(); location.reload(); } };
}
