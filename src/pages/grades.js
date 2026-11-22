// El docente define cómo califica cada materia (componentes y %), y decide cuándo mostrar las notas.
import { db } from '../services/storage.js';
import { esc } from '../utils/dom.js';
import { cfgFor, totalOf, gradeList } from '../components/ui.js';
export default function (root, { tid }) {
  const mine = db.get('asignaciones').filter(a => a.tid === tid).map(a => [a.grado, a.materia]);
  const aulas = db.get('aulas').map(a => [a.grado, a.materia]);
  const pairs = mine.length ? mine : aulas.length ? aulas : gradeList().flatMap(g => db.get('materias').map(m => [g, m.nombre]));
  let ai = 0, p = '1';
  const draw = () => {
    if (!pairs.length) { root.innerHTML = '<div class="card empty">Aún no hay aulas. Dirección debe crear grados, materias y asignarte tus cursos.</div>'; return; }
    const [g, m] = pairs[ai] || pairs[0], cfg = cfgFor(g, m), sum = cfg.reduce((a, c) => a + Number(c[1]), 0), key = `${g}|${m}|${p}`;
    const saved = db.get('notes', {})[key] || {}, list = db.get('students').filter(s => s.grado === g), vis = !!db.get('evalvis', {})[key];
    root.innerHTML = `<h2 class="pt">📝 Registro de calificaciones</h2>
    <div class="card"><div class="form"><label>Aula<select id="a">${pairs.map((x, i) => `<option value="${i}" ${i === ai ? 'selected' : ''}>${esc(x[1])} · ${esc(x[0])}</option>`).join('')}</select></label>
    <label>Período<select id="p">${['1', '2', '3', '4'].map(x => `<option ${x === p ? 'selected' : ''}>${x}</option>`).join('')}</select></label></div>
    <h3 style="margin-top:1rem">Cómo calificas ${esc(m)}</h3><div class="hint" style="margin:0 0 .6rem">Tú decides los componentes y su porcentaje (deben sumar 100). Se aplica a esta materia y grado.</div>
    ${cfg.map((c, i) => `<div class="rank"><input data-n="${i}" value="${esc(c[0])}" style="max-width:230px"><input data-w="${i}" type="number" min="0" max="100" value="${c[1]}" style="width:90px"> %<button class="btn bad sm pts" data-r="${i}" style="margin-left:auto">Quitar</button></div>`).join('')}
    <div class="actions"><button class="btn ghost sm" id="addc">+ Añadir componente</button><span class="chip" style="background:${sum === 100 ? '#dcfce7' : '#fee2e2'}">Suma: ${sum}%</span></div></div>
    <div class="card"><h3>Notas · ${p}.° período</h3>
    <label style="display:flex;flex-direction:row;gap:.5rem;align-items:center;color:var(--c-text)"><input type="checkbox" id="vis" ${vis ? 'checked' : ''} style="width:auto;min-height:0"> <b>Mostrar a estudiantes y familias</b> <small style="color:var(--c-muted)">(mientras no lo marques, ellos no ven notas ni totales)</small></label>
    <div class="tablewrap"><table><thead><tr><th>Alumno</th>${cfg.map(c => `<th>${esc(c[0])} (${c[1]}%)</th>`).join('')}<th>Total</th></tr></thead><tbody>
    ${list.map(s => `<tr data-r="${s.id}"><td>${esc(s.apellidos)}, ${esc(s.nombres)}</td>${cfg.map((c, i) => `<td><input type="number" min="0" max="100" data-i="${i}" value="${(saved[s.id] || [])[i] ?? ''}" style="width:78px"></td>`).join('')}<td><b class="t">0</b></td></tr>`).join('') || '<tr><td colspan="9" class="empty">No hay alumnos en este grado.</td></tr>'}</tbody></table></div>
    <div class="actions"><button class="btn" id="sv">Guardar</button><button class="btn ghost" id="cn">Cancelar</button><span class="chip" id="avg"></span></div></div>`;
    const calc = () => { let tot = 0, n = 0; root.querySelectorAll('tr[data-r]').forEach(r => { const t = totalOf([...r.querySelectorAll('[data-i]')].map(i => i.value), cfg); r.querySelector('.t').textContent = t.toFixed(1); tot += t; n++; }); root.querySelector('#avg').textContent = 'Promedio del grupo: ' + (n ? (tot / n).toFixed(1) : '0'); };
    calc(); root.querySelectorAll('[data-i]').forEach(i => i.oninput = calc);
    const setCfg = c => { const map = db.get('evalmap', {}); map[g + '|' + m] = c; db.set('evalmap', map); draw(); };
    root.querySelector('#a').onchange = e => { ai = Number(e.target.value); draw(); };
    root.querySelector('#p').onchange = e => { p = e.target.value; draw(); };
    root.querySelectorAll('[data-n]').forEach(x => x.onchange = () => setCfg(cfg.map((c, i) => i === Number(x.dataset.n) ? [x.value || 'Componente', c[1]] : c)));
    root.querySelectorAll('[data-w]').forEach(x => x.onchange = () => setCfg(cfg.map((c, i) => i === Number(x.dataset.w) ? [c[0], Math.max(0, Math.min(100, Number(x.value) || 0))] : c)));
    root.querySelectorAll('[data-r]:not(tr)').forEach(x => x.onclick = () => { if (cfg.length > 1 && confirm('¿Quitar este componente? Las notas ya escritas podrían desordenarse.')) setCfg(cfg.filter((c, i) => i !== Number(x.dataset.r))); });
    root.querySelector('#addc').onclick = () => setCfg([...cfg, ['Nuevo componente', 0]]);
    root.querySelector('#vis').onchange = e => { const v = db.get('evalvis', {}); v[key] = e.target.checked; db.set('evalvis', v); };
    root.querySelector('#cn').onclick = draw;
    root.querySelector('#sv').onclick = () => {
      if (sum !== 100) return alert('Los porcentajes deben sumar 100%.');
      const out = {}; let bad = false;
      root.querySelectorAll('tr[data-r]').forEach(r => out[r.dataset.r] = [...r.querySelectorAll('[data-i]')].map(i => { const v = i.value === '' ? '' : Number(i.value); if (v !== '' && (v < 0 || v > 100)) bad = true; return v; }));
      if (bad) return alert('Las notas deben estar entre 0 y 100.');
      const all = db.get('notes', {}); all[key] = out; db.set('notes', all); alert('Calificaciones guardadas ✅');
    };
  };
  draw();
}
