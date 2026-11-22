import { crud } from '../components/crud.js';
const DEFS = {
  niveles: { key: 'niveles', title: '🎚️ Niveles', fields: [['nombre', 'Nivel', 'required placeholder="Ej. Primaria"'], ['descripcion', 'Descripción']] },
  grados: { key: 'grados', title: '🏫 Grados', fields: [['nombre', 'Grado', 'required placeholder="Ej. 3ro A"'], ['nivel', 'Nivel']] },
  secciones: { key: 'secciones', title: '🔤 Secciones y aulas', fields: [['grado', 'Grado', 'required'], ['seccion', 'Sección', 'required placeholder="A"'], ['aula', 'Aula'], ['turno', 'Turno', 'placeholder="Matutino"']] },
  materias: { key: 'materias', title: '📚 Asignaturas', fields: [['nombre', 'Asignatura', 'required'], ['docente', 'Docente']] }
};
export default function (root, s) {
  const keys = DEFS[s.sub] ? [s.sub] : Object.keys(DEFS);
  root.innerHTML = keys.map(k => `<div id="a-${k}"></div>`).join('');
  keys.forEach(k => crud(root.querySelector('#a-' + k), DEFS[k]));
}
