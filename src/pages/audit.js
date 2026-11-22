import { db } from '../services/storage.js';
import { esc } from '../utils/dom.js';
import { badge, table } from '../components/ui.js';
export default function (root) {
  root.innerHTML = '<div class="card"><h3>🛡️ Auditoría</h3><p style="color:var(--c-muted)">Registro de acciones realizadas en este dispositivo (crear, eliminar, aprobar).</p><div id="t"></div></div>';
  table(root.querySelector('#t'), { size: 10, rows: db.get('audit', []).slice().reverse(), cols: [{ h: '#', f: (r, i) => i }, { h: 'Fecha y hora', f: r => esc(r.fecha.replace('T', ' ').slice(0, 16)) }, { h: 'Usuario', f: r => esc(r.usuario) }, { h: 'Acción', f: r => badge(r.accion, r.accion.startsWith('Elim') || r.accion.startsWith('Rech') ? 'bad' : 'ok') }, { h: 'Módulo', f: r => esc(r.modulo) }] });
}
