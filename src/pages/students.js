import { db } from '../services/storage.js';
import { esc } from '../utils/dom.js';
import { badge, stateColor, field, readForm, modal, table, initials } from '../components/ui.js';
const TABS = {
  Alumno: [['apellidos', 'Apellidos', 'req'], ['nombres', 'Nombres', 'req'], ['cedula', 'Cédula / ID'], ['codigo', 'Código'], ['usuario', 'Usuario de acceso'], ['correo', 'Correo', 'email'], ['telefono', 'Teléfono', 'tel'], ['sexo', 'Sexo', 'select:Masculino,Femenino'], ['grado', 'Grado y sección', 'req'], ['nacimiento', 'Fecha de nacimiento', 'date'], ['direccion', 'Dirección'], ['estado', 'Estado', 'select:Activo,Inactivo']],
  Apoderados: [['padre', 'Nombre del padre'], ['padre_tel', 'Teléfono del padre', 'tel'], ['madre', 'Nombre de la madre'], ['madre_tel', 'Teléfono de la madre', 'tel'], ['tutor', 'Tutor / contacto de emergencia'], ['familia', 'Usuario del tutor (acceso)']],
  Procedencia: [['colegio', 'Colegio de procedencia'], ['ubicacion', 'Ubicación']]
};
export default function (root, { role }) {
  const admin = role === 'admin';
  const draw = () => {
    root.innerHTML = '<div class="card"><h3>🎓 Alumnos registrados</h3><div id="t"></div></div>';
    table(root.querySelector('#t'), {
      rows: db.get('students'), tools: admin ? '<button class="btn" id="new">+ Nuevo alumno</button>' : '',
      cols: [{ h: '#', f: (r, i) => i }, { h: 'Alumno', f: r => `<div class="profile"><span class="avatar" style="width:34px;height:34px;font-size:.8rem">${initials(r.nombres, r.apellidos)}</span>${esc(r.apellidos)}, ${esc(r.nombres)}</div>` },
        { h: 'Cédula', f: r => esc(r.cedula) }, { h: 'Código', f: r => esc(r.codigo) }, { h: 'Grado', f: r => esc(r.grado) }, { h: 'Teléfono', f: r => esc(r.telefono) },
        { h: 'Estado', f: r => badge(r.estado || 'Activo', stateColor[r.estado || 'Activo']) },
        { h: 'Acciones', f: r => `<button class="btn ghost sm" data-v="${r.id}">👁️</button> ${admin ? `<button class="btn sm" data-e="${r.id}">✏️</button> <button class="btn bad sm" data-x="${r.id}">🗑️</button>` : ''}` }]
    });
    root.querySelector('#new')?.addEventListener('click', () => form());
    root.addEventListener('click', onClick);
  };
  const onClick = e => {
    const b = e.target.closest('[data-v],[data-e],[data-x]'); if (!b) return;
    const id = b.dataset.v || b.dataset.e || b.dataset.x, r = db.get('students').find(x => x.id === id);
    if (b.dataset.x && confirm('¿Eliminar este alumno?')) { db.remove('students', id); root.removeEventListener('click', onClick); draw(); }
    else if (b.dataset.e) form(r);
    else if (b.dataset.v) modal('Expediente', `<div class="profile"><div class="avatar lg">${initials(r.nombres, r.apellidos)}</div><div><b>${esc(r.nombres)} ${esc(r.apellidos)}</b><br><small>${esc(r.grado)}</small></div></div><hr>` + Object.values(TABS).flat().map(f => r[f[0]] ? `<p><small>${f[1]}</small><br>${esc(r[f[0]])}</p>` : '').join(''));
  };
  const form = (r = {}) => {
    const body = `<div class="tabsb">${Object.keys(TABS).map((k, i) => `<button type="button" data-t="${k}" class="${i ? '' : 'on'}">${k}</button>`).join('')}</div>` + Object.entries(TABS).map(([k, fs], i) => `<div class="form" data-p="${k}" ${i ? 'style="display:none"' : ''}>${fs.map(f => field(f, r[f[0]] ?? '')).join('')}</div>`).join('');
    const m = modal(r.id ? 'Editar alumno' : 'Nuevo alumno', body, mm => {
      const d = readForm(mm); if (r.id) db.set('students', db.get('students').map(x => x.id === r.id ? { ...x, ...d } : x)); else db.add('students', d);
      root.removeEventListener('click', onClick); draw();
    }, true);
    m.querySelectorAll('[data-t]').forEach(t => t.onclick = () => { m.querySelectorAll('[data-t]').forEach(x => x.classList.toggle('on', x === t)); m.querySelectorAll('[data-p]').forEach(p => p.style.display = p.dataset.p === t.dataset.t ? '' : 'none'); });
  };
  draw();
}
