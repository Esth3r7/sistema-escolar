import { db } from '../services/storage.js';
import { esc } from '../utils/dom.js';
import { badge, table } from '../components/ui.js';
import { notifCfg, scanPayments } from '../services/notifications.js';
export default function (root) {
  const draw = () => {
    const cfg = notifCfg(), st = db.get('students'), unpaid = new Set(db.get('pagos').filter(p => p.estado !== 'Pagado').map(p => p.id));
    const rows = db.get('notifs').slice().reverse().map(n => { const s = st.find(x => x.id === n.sid) || {}, tel = String(s.madre_tel || s.padre_tel || '').replace(/\D/g, ''); return { ...n, alumno: s.nombres ? s.nombres + ' ' + s.apellidos : '(eliminado)', wa: tel ? 'https://wa.me/' + (tel.length === 10 ? '1' + tel : tel) + '?text=' + encodeURIComponent(n.mensaje) : '', resuelta: !unpaid.has(n.clave.split('|')[0]) }; });
    root.innerHTML = `<h2 class="pt">🔔 Notificaciones automáticas a las familias</h2>
    <div class="card"><h3>Reglas</h3><div class="hint" style="margin:0 0 1rem">El sistema revisa los pagos cada vez que alguien abre la plataforma y deja el recordatorio listo. Las familias lo ven en la campana 🔔. El envío automático real por correo o WhatsApp se activa al conectar el servidor; mientras tanto puedes enviarlo con el botón WhatsApp.</div>
    <div class="form"><label>Días de anticipación<input id="dias" type="number" min="0" max="30" value="${cfg.dias}"></label><label>Avisar pagos vencidos<select id="venc"><option value="1" ${cfg.vencidos ? 'selected' : ''}>Sí</option><option value="0" ${cfg.vencidos ? '' : 'selected'}>No</option></select></label>
    <div><small style="color:var(--c-muted)">Canales</small><div style="display:flex;gap:1rem;flex-wrap:wrap;padding-top:.6rem">${['App', 'Correo', 'WhatsApp'].map(c => `<label style="flex-direction:row;gap:.3rem;align-items:center;color:var(--c-text)"><input type="checkbox" data-c="${c}" ${cfg.canales.includes(c) ? 'checked' : ''} style="width:auto;min-height:0"> ${c}</label>`).join('')}</div></div>
    <label style="grid-column:1/-1">Mensaje · pago próximo<textarea id="pl1" rows="2">${esc(cfg.plantilla)}</textarea></label><label style="grid-column:1/-1">Mensaje · pago vencido<textarea id="pl2" rows="2">${esc(cfg.plantillaVencido)}</textarea></label></div>
    <small style="color:var(--c-muted)">Variables: {tutor} {alumno} {concepto} {fecha} {monto}</small><div class="actions"><button class="btn" id="save">Guardar reglas</button><button class="btn ghost" id="scan">Revisar vencimientos ahora</button></div></div>
    <div class="card"><h3>Cola de mensajes</h3><div id="t"></div></div>`;
    table(root.querySelector('#t'), { rows, size: 6, cols: [{ h: 'Fecha', f: r => esc(r.creada) }, { h: 'Alumno', f: r => esc(r.alumno) }, { h: 'Tipo', f: r => badge(r.tipo, r.tipo === 'Pago vencido' ? 'bad' : 'warn') }, { h: 'Mensaje', f: r => `<small>${esc(r.mensaje)}</small>` }, { h: 'Canales', f: r => esc((r.canales || []).join(', ')) },
      { h: 'Estado', f: r => r.resuelta ? badge('Resuelta (pagado)', 'ok') : badge(r.estado, r.estado === 'Enviada' ? 'ok' : 'info') },
      { h: 'Acción', f: r => `${r.wa ? `<a class="btn ok sm" target="_blank" rel="noopener" href="${esc(r.wa)}">WhatsApp</a> ` : ''}${r.estado !== 'Enviada' ? `<button class="btn ghost sm" data-s="${r.id}">Marcar enviada</button> ` : ''}<button class="btn bad sm" data-x="${r.id}">🗑️</button>` }] });
    root.querySelector('#save').onclick = () => { db.set('notifcfg', { dias: Number(root.querySelector('#dias').value) || 0, vencidos: root.querySelector('#venc').value === '1', canales: [...root.querySelectorAll('[data-c]')].filter(c => c.checked).map(c => c.dataset.c), plantilla: root.querySelector('#pl1').value, plantillaVencido: root.querySelector('#pl2').value }); alert('Reglas guardadas.'); draw(); };
    root.querySelector('#scan').onclick = () => { const n = scanPayments(); alert(n ? n + ' recordatorio(s) nuevo(s) en la cola.' : 'No hay recordatorios nuevos.'); draw(); };
  };
  root.addEventListener('click', e => { const b = e.target.closest('[data-s],[data-x]'); if (!b) return; if (b.dataset.s) db.set('notifs', db.get('notifs').map(n => n.id === b.dataset.s ? { ...n, estado: 'Enviada' } : n)); else db.remove('notifs', b.dataset.x); draw(); });
  draw();
}
