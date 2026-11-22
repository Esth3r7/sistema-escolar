// Datos de demostración. Se cargan con un botón y se borran con "Restablecer demo".
import { db } from '../services/storage.js';
const uid = () => crypto.randomUUID();
export function seedDemo() {
  const S = [['González Pérez', 'Juan', '1ro A', 'Masculino'], ['Hernández Ramírez', 'María', '1ro A', 'Femenino'], ['López García', 'Carlos', '1ro A', 'Masculino'],
    ['Martínez Ferrer', 'Laura', '2do B', 'Femenino'], ['Toro Jiménez', 'Andrés', '2do B', 'Masculino'], ['Pulido Martínez', 'Isabel', '2do B', 'Femenino']]
    .map((x, i) => ({ id: uid(), apellidos: x[0], nombres: x[1], grado: x[2], sexo: x[3], ...(i === 0 ? { usuario: 'estudiante' } : {}), ...(i < 2 ? { familia: 'padre' } : {}), cedula: '001-' + (1000000 + i * 137) + '-' + i, codigo: 'A' + (100 + i), telefono: '809-555-01' + i + i, estado: 'Activo', padre: 'Pedro ' + x[0].split(' ')[0], madre: 'Ana ' + x[0].split(' ')[0] }));
  db.set('students', S);
  const T = [['Ochoa Dalton', 'Dante', 'Primaria', 'Titular'], ['González Mejía', 'Ana Melva', 'Primaria', 'Titular'], ['Idrogo Mariño', 'César', 'Primaria', 'Especialista']]
    .map((x, i) => ({ id: uid(), apellidos: x[0], nombres: x[1], nivel: x[2], tipo: x[3], ...(i === 0 ? { usuario: 'docente' } : {}), cedula: '002-' + (2000000 + i * 211) + '-' + i, telefono: '829-555-02' + i + i }));
  db.set('teachers', T);
  const tn = i => T[i].nombres + ' ' + T[i].apellidos;
  db.set('grados', [{ id: uid(), nombre: '1ro A', nivel: 'Primaria' }, { id: uid(), nombre: '2do B', nivel: 'Primaria' }]);
  db.set('secciones', [{ id: uid(), grado: '1ro A', seccion: 'A', aula: 'Aula 101', turno: 'Matutino' }, { id: uid(), grado: '2do B', seccion: 'B', aula: 'Aula 102', turno: 'Matutino' }]);
  const M = [['Matemática', 0], ['Lengua Española', 1], ['Ciencias Naturales', 2], ['Ciencias Sociales', 1], ['Educación Artística', 2]];
  db.set('materias', M.map(m => ({ id: uid(), nombre: m[0], docente: tn(m[1]) })));
  db.set('asignaciones', [[0, '1ro A', 'Matemática'], [0, '2do B', 'Matemática'], [1, '1ro A', 'Lengua Española'], [1, '2do B', 'Ciencias Sociales'], [2, '1ro A', 'Ciencias Naturales']].map(a => ({ id: uid(), tid: T[a[0]].id, grado: a[1], materia: a[2] })));
  const H = ['08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00'], hor = [];
  ['1ro A', '2do B'].forEach((g, gi) => [1, 2, 3, 4, 5].forEach(d => H.forEach((h, hi) => { const m = M[(d + hi + gi) % 5]; hor.push({ id: uid(), dia: d, hora: h, materia: m[0], docente: tn(m[1]), aula: 'Aula 10' + (gi + 1), grado: g }); })));
  db.set('horario', hor);
  const pg = [];
  S.forEach((s, i) => { pg.push({ id: uid(), sid: s.id, desc: 'Matrícula 2026-2027', fecha: '2026-08-15', estado: 'Pagado', monto: 3000 });
    [['Septiembre', '2026-09-05', 'Pagado'], ['Octubre', '2026-10-05', i % 3 === 2 ? 'Vencido' : 'Pagado'], ['Noviembre', '2026-11-05', 'Pendiente'], ['Diciembre', '2026-12-05', 'Pendiente']]
      .forEach(m => pg.push({ id: uid(), sid: s.id, desc: 'Mensualidad ' + m[0], fecha: m[1], estado: m[2], monto: 2500 })); });
  db.set('pagos', pg);
  db.set('movs', [['Ingreso', 'Matrícula', 'Inscripciones', 18000, '2026-08-15'], ['Ingreso', 'Mensualidades', 'Septiembre', 15000, '2026-09-06'], ['Ingreso', 'Mensualidades', 'Octubre', 10000, '2026-10-06'], 
    ['Egreso', 'Nómina', 'Docentes', 24000, '2026-09-30'], ['Egreso', 'Servicios', 'Energía e internet', 6200, '2026-10-10'], ['Egreso', 'Mantenimiento', 'Pintura de aulas', 3500, '2026-10-18'], ['Egreso', 'Papelería', 'Material de oficina', 850, '2026-10-20']]
    .map(x => ({ id: uid(), tipo: x[0], categoria: x[1], sub: x[2], monto: x[3], fecha: x[4] })));
  const nv = { '1ro A': [[85, 90, 78, 88, 80], [92, 95, 88, 90, 94], [70, 65, 80, 72, 75]] }; const n1 = {}; S.slice(0, 3).forEach((s, i) => n1[s.id] = nv['1ro A'][i]);
  db.set('notes', { '1ro A|Matemática|1': n1, '1ro A|Lengua Española|1': Object.fromEntries(S.slice(0, 3).map((s, i) => [s.id, [88 - i * 5, 80, 90 - i * 3, 85, 82]])) });
  db.set('evalvis', { '1ro A|Matemática|1': true, '1ro A|Lengua Española|1': true });
  db.set('attendance', ['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05'].map((d, k) => ({ date: d, grado: '1ro A', marks: Object.fromEntries(S.slice(0, 3).map((s, i) => [s.id, (k + i) % 4 === 3 ? 'A' : 'P'])) })));
  db.set('posts', [{ id: uid(), tipo: 'tarea', titulo: 'Ejercicios de fracciones', fecha: '2026-11-12', texto: 'Resolver la página 45 del libro.', aula: '1ro A|Matemática', autor: tn(0) }, { id: uid(), tipo: 'anuncio', titulo: 'Reunión de padres', texto: 'Viernes 13 a las 4:00 p. m. en el salón de actos.', autor: 'Dirección' }]);
  db.set('points', [{ id: uid(), studentId: S[0].id, delta: 3, reason: '👏 Participación', date: '2026-11-03' }, { id: uid(), studentId: S[1].id, delta: 5, reason: '📚 Tarea completa', date: '2026-11-04' }]);
  db.set('niveles', [{ id: uid(), nombre: 'Primaria', descripcion: '1ro a 6to' }, { id: uid(), nombre: 'Secundaria', descripcion: '1ro a 6to' }]);
  db.set('aulas', ['1ro A', '2do B'].flatMap(g => M.map(m => ({ id: uid(), grado: g, materia: m[0], docente: tn(m[1]) }))));
  db.set('requests', [['Sofía', 'Reyes Peña', '1ro A', '2026-10-28', 'Pendiente'], ['Luis', 'Castillo Mena', '2do B', '2026-10-30', 'Pendiente'], ['Ana', 'Brito Gómez', '1ro A', '2026-11-02', 'Pendiente']].map(r => ({ id: uid(), nombres: r[0], apellidos: r[1], grado: r[2], fecha: r[3], estado: r[4] })));
  db.set('inst', { name: 'Colegio Nuevo Horizonte', director: 'Lic. Rosa Martínez', pais: 'República Dominicana', municipio: 'Santo Domingo Este', year: '2026-2027', phone: '809-555-0100', email: 'info@colegio.edu.do', address: 'Av. Principal #123' });
}
