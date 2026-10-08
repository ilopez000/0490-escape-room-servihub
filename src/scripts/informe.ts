// L'informe final: dades, text per al correu, fitxer descarregable i segell de verificació.
import { CHECKLIST, CORREU_DOCENT, PROVA_FINAL, RANGS, SALES } from '../data/joc';
import { ASSOLIMENTS } from './assoliments';
import { type Estat, xpMaxim, xpParts } from './estat';

export interface DadesInforme {
  nom: string;
  alies: string;
  data: string;
  xp: number;
  base: number;
  bonus: number;
  maxim: number;
  percent: number;
  rang: string;
  vida: number;
  errors: number;
  pistes: number;
  millorRatxa: number;
  escutsUsats: number;
  plantes: { id: number; nom: string; xp: number; bonus: number; errors: number; pistes: number }[];
  boss: { xp: number; errors: number; pistes: number };
  fluixos: { planta: string; repte: string; errors: number; pistes: number }[];
  assoliments: string[];
  checklist: number[];
}

export function calculaInforme(e: Estat): DadesInforme {
  const { base, bonus } = xpParts(e);
  const maxim = xpMaxim();
  const percent = Math.min(100, Math.round((base / maxim) * 100));
  const rang = RANGS.find((r) => percent >= r.minim) ?? RANGS[RANGS.length - 1];
  const plantes = SALES.map((s) => {
    const d = e.sales[s.id];
    return { id: s.id, nom: s.nom, xp: (d?.xp ?? 0) + (d?.bonus ?? 0), bonus: d?.bonus ?? 0, errors: d?.errors ?? 0, pistes: d?.pistes ?? 0 };
  });
  const fluixos = SALES.flatMap((s) =>
    (e.sales[s.id]?.reptes ?? []).map((r, i) => ({
      planta: s.codi,
      repte: s.proves[i]?.titol ?? `Repte ${i + 1}`,
      errors: r.errors,
      pistes: r.pistes,
    })),
  )
    .concat(e.final.completada ? [{ planta: 'KERNEL', repte: PROVA_FINAL.titol, errors: e.final.errors, pistes: e.final.pistes }] : [])
    .filter((f) => f.errors > 0 || f.pistes > 0)
    .sort((a, b) => b.errors + b.pistes * 2 - (a.errors + a.pistes * 2))
    .slice(0, 5);
  return {
    nom: e.nom,
    alies: e.alies,
    data: new Date().toISOString().slice(0, 10),
    xp: base + bonus,
    base,
    bonus,
    maxim,
    percent,
    rang: rang.nom,
    vida: e.vida,
    errors: plantes.reduce((n, p) => n + p.errors, 0) + e.final.errors,
    pistes: plantes.reduce((n, p) => n + p.pistes, 0) + e.final.pistes,
    millorRatxa: e.millorRatxa,
    escutsUsats: e.escutsUsats,
    plantes,
    boss: { xp: e.final.xp + (e.final.bonus ?? 0), errors: e.final.errors, pistes: e.final.pistes },
    fluixos,
    assoliments: e.assoliments.filter((id) => ASSOLIMENTS.some((a) => a.id === id)),
    checklist: e.checklist.map((v, i) => (v ? i : -1)).filter((i) => i >= 0),
  };
}

export function dataLlegible(iso: string): string {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d).toLocaleDateString('ca-ES', { dateStyle: 'long' });
}

// ---------------------------------------------------------------- segell
// Un resum xifrat de les dades amb una suma de control. No és criptografia forta (tot passa al
// navegador de l'alumne), però detecta si algú ha retocat les xifres del correu a mà.
const SAL = 'PratFP·0490·KernelPanic·2026';

function fnv(text: string, llavor: number): number {
  let h = llavor >>> 0;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function suma(text: string): string {
  const a = fnv(SAL + text, 0x811c9dc5).toString(16).padStart(8, '0');
  const b = fnv(text + SAL, 0x01000193).toString(16).padStart(8, '0');
  return (a + b).slice(0, 12).toUpperCase();
}

function aBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function deBase64(text: string): string {
  const net = text.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(net + '='.repeat((4 - (net.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

/** Dades compactes que viatgen dins del segell. */
type Compacte = [string, string, string, number, number, number, number, number, number, number, number[][], number[], string[], number[]];

export function segell(d: DadesInforme): string {
  const c: Compacte = [
    d.nom, d.alies, d.data, d.base, d.bonus, d.percent, d.vida, d.errors, d.pistes, d.millorRatxa,
    d.plantes.map((p) => [p.xp, p.errors, p.pistes]),
    [d.boss.xp, d.boss.errors, d.boss.pistes],
    d.assoliments,
    d.checklist,
  ];
  const json = JSON.stringify(c);
  return `${aBase64(json)}.${suma(json)}`;
}

export function codiVerificacio(s: string): string {
  const control = s.split('.').pop() ?? '';
  return `${control.slice(0, 4)}-${control.slice(4, 8)}-${control.slice(8, 12)}`;
}

export interface Verificacio {
  valid: boolean;
  dades?: {
    nom: string; alies: string; data: string; base: number; bonus: number; percent: number; vida: number;
    errors: number; pistes: number; millorRatxa: number; plantes: number[][]; boss: number[]; assoliments: string[]; checklist: number[];
  };
  error?: string;
}

export function verifica(text: string): Verificacio {
  const trobat = text.match(/([A-Za-z0-9_-]{20,})\.([0-9A-F]{12})/);
  if (!trobat) return { valid: false, error: 'No s\'ha trobat cap segell al text enganxat.' };
  try {
    const json = deBase64(trobat[1]);
    const c = JSON.parse(json) as Compacte;
    const valid = suma(json) === trobat[2];
    const [nom, alies, data, base, bonus, percent, vida, errors, pistes, millorRatxa, plantes, boss, assoliments, checklist] = c;
    return { valid, dades: { nom, alies, data, base, bonus, percent, vida, errors, pistes, millorRatxa, plantes, boss, assoliments, checklist } };
  } catch {
    return { valid: false, error: 'El segell està incomplet o malmès.' };
  }
}

// ---------------------------------------------------------------- text del correu
export function assumpte(d: DadesInforme): string {
  return `[0490] Escape room ServiHub Kernel Panic · ${d.nom}`;
}

export function textInforme(d: DadesInforme, curt = false): string {
  const s = segell(d);
  const nomAssoliment = (id: string) => ASSOLIMENTS.find((a) => a.id === id)?.nom ?? id;
  const noMarcats = CHECKLIST.map((t, i) => (d.checklist.includes(i) ? null : `  - ${t}`)).filter(Boolean);
  const linies: (string | null)[] = [
    'INFORME · ESCAPE ROOM «SERVIHUB · KERNEL PANIC»',
    'MP 0490 Programació de serveis i processos · DAM2 · Repàs de les sessions 1 i 2',
    '',
    `Alumne/a: ${d.nom}`,
    d.alies && d.alies !== d.nom ? `Àlies de joc: ${d.alies}` : null,
    `Data: ${dataLlegible(d.data)}`,
    '',
    `Rang: ${d.rang}`,
    `Rendiment: ${d.percent}% (${d.base} de ${d.maxim} XP de base)`,
    `XP total: ${d.xp} (inclou ${d.bonus} XP de bonus per ratxes)`,
    `Vida final: ${d.vida}%`,
    `Errors: ${d.errors} · Pistes: ${d.pistes} · Millor ratxa: ${d.millorRatxa} · Escuts gastats: ${d.escutsUsats}`,
    '',
    'NUCLIS',
    ...d.plantes.map((p) => `  ${p.id}. ${p.nom}: ${p.xp} XP · ${p.errors} errors · ${p.pistes} pistes`),
    `  Kernel. El Rei Zombi: ${d.boss.xp} XP · ${d.boss.errors} errors · ${d.boss.pistes} pistes`,
    '',
    'REPTES ON M\'HE ENTREBANCAT MÉS',
    ...(d.fluixos.length
      ? d.fluixos.map((f) => `  - ${f.planta} · ${f.repte}: ${f.errors} errors, ${f.pistes} pistes`)
      : ['  - Cap: tots els reptes superats al primer intent i sense pistes.']),
    '',
    `ASSOLIMENTS (${d.assoliments.length} de ${ASSOLIMENTS.length}): ${d.assoliments.map(nomAssoliment).join(', ') || '—'}`,
    '',
    `AUTOAVALUACIÓ: ${d.checklist.length} de ${CHECKLIST.length} punts marcats com a apresos.`,
    ...(noMarcats.length && !curt ? ['Encara he de repassar:', ...(noMarcats as string[])] : []),
    '',
    `Codi de verificació: ${codiVerificacio(s)}`,
    `Segell: ${s}`,
  ];
  return linies.filter((l): l is string => l !== null).join('\n');
}

export function enllacMailto(d: DadesInforme): string {
  // Alguns programes de correu tallen els enllaços mailto llargs: aquí va la versió curta.
  return `mailto:${CORREU_DOCENT}?subject=${encodeURIComponent(assumpte(d))}&body=${encodeURIComponent(textInforme(d, true))}`;
}

export function enllacGmail(d: DadesInforme): string {
  const p = new URLSearchParams({ view: 'cm', fs: '1', to: CORREU_DOCENT, su: assumpte(d), body: textInforme(d) });
  return `https://mail.google.com/mail/?${p.toString()}`;
}

// ---------------------------------------------------------------- fitxer HTML descarregable
function esc(t: string): string {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function htmlInforme(d: DadesInforme): string {
  const s = segell(d);
  const files = d.plantes
    .map((p) => `<tr><td>${p.id}. ${esc(p.nom)}</td><td>${p.xp}</td><td>${p.errors}</td><td>${p.pistes}</td></tr>`)
    .join('');
  const assoliments = ASSOLIMENTS.map(
    (a) => `<li class="${d.assoliments.includes(a.id) ? 'si' : 'no'}">${d.assoliments.includes(a.id) ? '★' : '☆'} ${esc(a.nom)} <small>${esc(a.desc)}</small></li>`,
  ).join('');
  const checklist = CHECKLIST.map((t, i) => `<li>${d.checklist.includes(i) ? '☑' : '☐'} ${esc(t)}</li>`).join('');
  const fluixos = d.fluixos.length
    ? d.fluixos.map((f) => `<li>${esc(f.planta)} · ${esc(f.repte)}: ${f.errors} errors, ${f.pistes} pistes</li>`).join('')
    : '<li>Cap: tots els reptes superats al primer intent i sense pistes.</li>';
  return `<!doctype html>
<html lang="ca"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Informe ServiHub Kernel Panic · ${esc(d.nom)}</title>
<style>
body{font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:760px;margin:32px auto;padding:0 16px;color:#14181f;line-height:1.5}
h1{font-size:1.6rem;margin:0 0 4px}h2{font-size:1.05rem;margin:28px 0 8px;border-bottom:2px solid #e02018;padding-bottom:4px}
.sub{color:#5b6472;margin:0 0 20px}.rang{font-size:1.4rem;font-weight:700;color:#e02018;margin:8px 0}
.xifres{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px}
.xifres div{border:1px solid #d6dbe2;border-radius:8px;padding:8px 12px}.xifres b{display:block;font-size:1.3rem}
.xifres span{font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;color:#5b6472}
table{width:100%;border-collapse:collapse}th,td{padding:6px 8px;border-bottom:1px solid #e3e6ea;text-align:left}
td:not(:first-child),th:not(:first-child){text-align:center}ul{padding-left:18px}li.no{color:#9aa1ab}
small{color:#5b6472}.segell{font-family:ui-monospace,Consolas,monospace;font-size:.75rem;word-break:break-all;background:#f3f5f7;padding:10px;border-radius:6px}
</style></head><body>
<p class="sub">MP 0490 Programació de serveis i processos · DAM2 · Prat FP</p>
<h1>Informe · Escape room «ServiHub · Kernel Panic»</h1>
<p class="sub">Repàs de les sessions 1 i 2 · ${esc(dataLlegible(d.data))}</p>
<p><b>Alumne/a:</b> ${esc(d.nom)}${d.alies && d.alies !== d.nom ? ` · <b>Àlies:</b> ${esc(d.alies)}` : ''}</p>
<p class="rang">${esc(d.rang)}</p>
<div class="xifres">
<div><span>Rendiment</span><b>${d.percent}%</b></div><div><span>XP total</span><b>${d.xp}</b></div>
<div><span>Vida</span><b>${d.vida}%</b></div><div><span>Errors</span><b>${d.errors}</b></div>
<div><span>Pistes</span><b>${d.pistes}</b></div><div><span>Millor ratxa</span><b>${d.millorRatxa}</b></div>
</div>
<p><small>XP de base ${d.base} de ${d.maxim} · bonus per ratxes ${d.bonus} · escuts gastats ${d.escutsUsats}</small></p>
<h2>Nuclis</h2>
<table><thead><tr><th>Nucli</th><th>XP</th><th>Errors</th><th>Pistes</th></tr></thead><tbody>${files}
<tr><td>Kernel · El Rei Zombi</td><td>${d.boss.xp}</td><td>${d.boss.errors}</td><td>${d.boss.pistes}</td></tr></tbody></table>
<h2>Reptes on m'he entrebancat més</h2><ul>${fluixos}</ul>
<h2>Assoliments (${d.assoliments.length} de ${ASSOLIMENTS.length})</h2><ul>${assoliments}</ul>
<h2>Autoavaluació</h2><ul style="list-style:none;padding:0">${checklist}</ul>
<h2>Verificació</h2>
<p>Codi: <b>${codiVerificacio(s)}</b></p>
<p class="segell">${s}</p>
</body></html>`;
}

export function descarregaInforme(d: DadesInforme): void {
  const blob = new Blob([htmlInforme(d)], { type: 'text/html;charset=utf-8' });
  const a = document.createElement('a');
  const nomFitxer = d.nom
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  a.href = URL.createObjectURL(blob);
  a.download = `Informe_0490_ServiHubKernelPanic_${nomFitxer || 'alumne'}.html`;
  document.body.append(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 1000);
}
