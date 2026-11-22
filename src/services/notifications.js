// Recordatorios automáticos a familias. Hoy se generan dentro del sistema (campana + cola);
// al conectar un servidor, un proceso programado leerá la cola 'notifs' y enviará por correo/WhatsApp.
import { db } from './storage.js';
export const NOTIF_DEFAULT = {
  dias: 5, vencidos: true, canales: ['App'],
  plantilla: 'Estimado/a {tutor}: la cuota "{concepto}" de {alumno} vence el {fecha} por {monto}.',
  plantillaVencido: 'Estimado/a {tutor}: la cuota "{concepto}" de {alumno} venció el {fecha} y está pendiente por {monto}. Por favor regularice su pago.'
};
export const notifCfg = () => ({ ...NOTIF_DEFAULT, ...db.get('notifcfg', {}) });
const fill = (t, v) => t.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');
export function scanPayments() {
  const cfg = notifCfg(), st = db.get('students'), list = db.get('notifs'), have = new Set(list.map(n => n.clave)), today = new Date().toISOString().slice(0, 10); let made = 0;
  db.get('pagos').filter(p => p.estado !== 'Pagado').forEach(p => {
    const days = Math.round((new Date(p.fecha) - new Date(today)) / 86400000);
    const kind = days < 0 ? (cfg.vencidos ? 'Pago vencido' : null) : days <= cfg.dias ? 'Pago próximo' : null;
    if (!kind || have.has(p.id + '|' + kind)) return;
    const s = st.find(x => x.id === p.sid); if (!s) return;
    const v = { tutor: s.madre || s.padre || s.tutor || 'padre/madre/tutor', alumno: s.nombres + ' ' + s.apellidos, concepto: p.desc, fecha: p.fecha, monto: 'RD$ ' + Number(p.monto).toLocaleString('es-DO') };
    list.push({ id: crypto.randomUUID(), clave: p.id + '|' + kind, sid: p.sid, tipo: kind, asunto: kind + ': ' + p.desc, mensaje: fill(kind === 'Pago vencido' ? cfg.plantillaVencido : cfg.plantilla, v), creada: today, canales: cfg.canales, estado: 'En cola' }); made++;
  });
  if (made) db.set('notifs', list);
  return made;
}
