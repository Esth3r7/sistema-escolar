// CAPA DE DATOS. Hoy guarda en el dispositivo (localStorage). Para conectar un servidor/base de datos
// real, crea un adaptador con los mismos métodos (read, write, clear) y actívalo con db.use(miAdaptador).
// Ninguna pantalla habla con localStorage directamente: todas usan `db`.
const P = 'eduplat:';
const local = {
  read(k, d) { try { return JSON.parse(localStorage.getItem(P + k)) ?? d; } catch { return d; } },
  write(k, v) { localStorage.setItem(P + k, JSON.stringify(v)); },
  clear() { Object.keys(localStorage).filter(x => x.startsWith(P)).forEach(x => localStorage.removeItem(x)); }
};
let adapter = local;
export const db = {
  user: 'Sistema',
  use(a) { adapter = a; },
  get(k, d = []) { return adapter.read(k, d); },
  set(k, v) { adapter.write(k, v); },
  add(k, item) { const l = this.get(k); item.id = crypto.randomUUID(); l.push(item); this.set(k, l); this.log('Crear', k); return item; },
  remove(k, id) { this.set(k, this.get(k).filter(i => i.id !== id)); this.log('Eliminar', k); },
  reset() { adapter.clear(); },
  log(accion, modulo) { if (modulo === 'audit') return; const l = local.read('audit', []); l.push({ id: crypto.randomUUID(), fecha: new Date().toISOString(), usuario: this.user, accion, modulo }); local.write('audit', l.slice(-500)); }
};
