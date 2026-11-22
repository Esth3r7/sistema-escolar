// Roles, menús por rol y páginas. Para añadir un módulo: crea src/pages/x.js, regístralo en PAGES y en MENUS.
export const ROLES = {
  admin:   { label: 'Dirección / Administración' },
  teacher: { label: 'Docente' },
  student: { label: 'Estudiante' },
  parent:  { label: 'Padre / Tutor' }
};
export const PAGES = {
  dashboard: 'Inicio', students: 'Expedientes', enroll: 'Matrícula', teachers: 'Docentes y cargas', schedule: 'Horarios', academic: 'Estructura académica',
  requests: 'Inscripciones', payments: 'Pagos', finance: 'Contabilidad', avisos: 'Avisos', reports: 'Reportes', settings: 'Configuración',
  audit: 'Auditoría', classrooms: 'Aulas virtuales', notifs: 'Notificaciones', attendance: 'Asistencia', grades: 'Registro de calificaciones', classroom: 'Aula virtual', courses: 'Mis materias', mynotes: 'Calificaciones', myatt: 'Asistencia'
};
// Menú por rol. Un grupo tiene hijos `c: [[página, etiqueta, subpágina?]]` y se despliega al pulsarlo.
export const MENUS = {
  admin: [
    { k: 'dashboard', l: 'Dashboard', i: '▦' },
    { l: 'Estudiantes', i: '👥', c: [['students', 'Expedientes'], ['enroll', 'Matrícula']] },
    { l: 'Docentes', i: '👩‍🏫', c: [['teachers', 'Asignación'], ['schedule', 'Horarios']] },
    { l: 'Académico', i: '🎓', c: [['academic', 'Niveles', 'niveles'], ['academic', 'Grados', 'grados'], ['academic', 'Secciones', 'secciones'], ['academic', 'Asignaturas', 'materias'], ['classrooms', 'Aulas virtuales']] },
    { l: 'Inscripciones', i: '📝', c: [['requests', 'Aprobación', 'aprobacion'], ['requests', 'Solicitudes', 'solicitudes']] },
    { l: 'Finanzas', i: '💳', c: [['payments', 'Pagos']] },
    { l: 'Contabilidad', i: '💰', c: [['finance', 'Ingresos', 'ingresos'], ['finance', 'Egresos', 'egresos'], ['finance', 'Resumen financiero', 'todo']] },
    { l: 'Comunicación', i: '📢', c: [['avisos', 'Avisos'], ['notifs', 'Notificaciones automáticas']] },
    { k: 'reports', l: 'Reportes', i: '📈' },
    { k: 'settings', l: 'Configuración', i: '⚙️' },
    { k: 'audit', l: 'Auditoría', i: '🛡️' }
  ],
  teacher: [
    { k: 'dashboard', l: 'Panel docente', i: '▦' },
    { l: 'Mi enseñanza', i: '📚', c: [['classroom', 'Mis aulas y tareas'], ['attendance', 'Control de asistencia'], ['grades', 'Registro de calificaciones']] },
    { k: 'schedule', l: 'Mi horario', i: '🗓️' },
    { k: 'students', l: 'Mis estudiantes', i: '🎓' },
    { k: 'avisos', l: 'Avisos', i: '📢' }
  ],
  student: [
    { k: 'dashboard', l: 'Inicio', i: '▦' },
    { k: 'courses', l: 'Mis materias', i: '📖' },
    { k: 'classroom', l: 'Mis actividades', i: '📝' },
    { k: 'schedule', l: 'Calendario y horario', i: '🗓️' },
    { l: 'Mi progreso', i: '📈', c: [['mynotes', 'Calificaciones'], ['myatt', 'Asistencia']] },
    { k: 'avisos', l: 'Avisos', i: '📢' }
  ],
  parent: [
    { k: 'dashboard', l: 'Panel familiar', i: '▦' },
    { k: 'mynotes', l: 'Calificaciones', i: '📊' },
    { k: 'myatt', l: 'Asistencia', i: '✅' },
    { k: 'schedule', l: 'Horario', i: '🗓️' },
    { k: 'payments', l: 'Pagos', i: '💳' },
    { k: 'avisos', l: 'Avisos', i: '📢' }
  ]
};
// Accesos de DEMOSTRACIÓN configurados (no son seguridad real; al conectar un servidor se reemplazan)
export const DEMO_USERS = [
  { u: 'admin', p: 'admin1234', role: 'admin', name: 'Director General' },
  { u: 'docente', p: 'docente1234', role: 'teacher', name: 'Docente' },
  { u: 'estudiante', p: 'estudiante1234', role: 'student', name: 'Estudiante' },
  { u: 'padre', p: 'padre1234', role: 'parent', name: 'Madre / Tutor' }
];
export const EVAL_DEFAULT = [['Examen', 20], ['Práctica', 20], ['Trabajo', 20], ['Parcial', 20], ['Examen 2', 20]];
export const CURRENCY = 'RD$';
