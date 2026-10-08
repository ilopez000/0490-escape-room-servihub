// Assoliments (logros) i efectes de celebració: avisos emergents, XP flotant i confeti.
import { SALES } from '../data/joc';
import { carrega, desa, plantesFetes, type Estat } from './estat';
import { so } from './so';

export interface Assoliment {
  id: string;
  nom: string;
  desc: string;
  icona: string;
}

export const ASSOLIMENTS: Assoliment[] = [
  { id: 'primer-repte', nom: 'Hola, món', desc: 'Supera el primer repte', icona: '👋' },
  { id: 'ratxa-3', nom: 'En ratxa', desc: '3 reptes perfectes seguits', icona: '🔥' },
  { id: 'ratxa-5', nom: 'Imparable', desc: '5 reptes perfectes seguits', icona: '⚡' },
  { id: 'ratxa-8', nom: 'Mode turbo', desc: '8 reptes perfectes seguits', icona: '🚀' },
  { id: 'escut', nom: 'Escut actiu', desc: 'Guanya el primer escut', icona: '🛡' },
  { id: 'planta-perfecta', nom: 'Nucli impecable', desc: 'Un nucli sense errors ni pistes', icona: '💎' },
  { id: 'estils', nom: 'Multinucli', desc: 'Nucli 2 sense cap error', icona: '🧩' },
  { id: 'rutes', nom: 'Pare responsable', desc: 'Nucli 3 sense cap error', icona: '👪' },
  { id: 'estat', nom: 'Fontaner/a de fluxos', desc: 'Nucli 5 sense cap error', icona: '🔧' },
  { id: 'verd', nom: 'Tot alhora', desc: 'Nucli 6 sense cap error', icona: '⚡' },
  { id: 'mitat', nom: 'Mig servidor', desc: '3 nuclis en marxa', icona: '🖥' },
  { id: 'llums', nom: 'Tots els nuclis', desc: 'Els 6 nuclis en marxa', icona: '💡' },
  { id: 'boss', nom: 'Zombi recollit', desc: 'Venç el Rei Zombi', icona: '🏆' },
  { id: 'boss-net', nom: 'K.O. perfecte', desc: 'Venç el boss sense cap error', icona: '🥊' },
  { id: 'supervivent', nom: 'Supervivent', desc: 'Acaba amb un 80% de vida o més', icona: '❤' },
  { id: 'autodidacte', nom: 'Sense xuleta', desc: 'Acaba tota la partida sense pistes', icona: '🧠' },
];

const PER_ID = new Map(ASSOLIMENTS.map((a) => [a.id, a]));

/** Desbloqueja un assoliment (si no el tenia) i n'ensenya l'avís. */
export function desbloqueja(estat: Estat, id: string): boolean {
  if (estat.assoliments.includes(id)) return false;
  const a = PER_ID.get(id);
  if (!a) return false;
  estat.assoliments.push(id);
  desa(estat);
  avis(`${a.icona}  Assoliment desbloquejat`, `${a.nom} · ${a.desc}`, 'assoliment');
  so('assoliment');
  return true;
}

/** Revisa els assoliments que depenen de l'estat general (ratxes, plantes, final). */
export function revisaAssoliments(estat: Estat = carrega()): void {
  if (estat.ratxa >= 3) desbloqueja(estat, 'ratxa-3');
  if (estat.ratxa >= 5) desbloqueja(estat, 'ratxa-5');
  if (estat.ratxa >= 8) desbloqueja(estat, 'ratxa-8');
  if (estat.escuts > 0 || estat.escutsUsats > 0) desbloqueja(estat, 'escut');
  const fetes = plantesFetes(estat);
  if (fetes >= 3) desbloqueja(estat, 'mitat');
  if (fetes >= SALES.length) desbloqueja(estat, 'llums');
  const neta = (id: number) => estat.sales[id]?.completada && estat.sales[id].errors === 0;
  if (neta(2)) desbloqueja(estat, 'estils');
  if (neta(3)) desbloqueja(estat, 'rutes');
  if (neta(5)) desbloqueja(estat, 'estat');
  if (neta(6)) desbloqueja(estat, 'verd');
  if (Object.values(estat.sales).some((s) => s.completada && s.errors === 0 && s.pistes === 0)) {
    desbloqueja(estat, 'planta-perfecta');
  }
  if (estat.final.completada) {
    desbloqueja(estat, 'boss');
    if (estat.final.errors === 0) desbloqueja(estat, 'boss-net');
    if (estat.vida >= 80) desbloqueja(estat, 'supervivent');
    const pistes = Object.values(estat.sales).reduce((n, s) => n + s.pistes, 0) + estat.final.pistes;
    if (pistes === 0) desbloqueja(estat, 'autodidacte');
  }
}

// ---------------------------------------------------------------- avisos emergents
function capsaAvisos(): HTMLElement {
  let capsa = document.getElementById('avisos');
  if (!capsa) {
    capsa = document.createElement('div');
    capsa.id = 'avisos';
    capsa.className = 'avisos';
    capsa.setAttribute('aria-live', 'polite');
    document.body.append(capsa);
  }
  return capsa;
}

export function avis(titol: string, text: string, tipus: 'assoliment' | 'escut' | 'ratxa' | 'cop' = 'assoliment'): void {
  const capsa = capsaAvisos();
  const el = document.createElement('div');
  el.className = `avis-emergent ${tipus}`;
  const b = document.createElement('b');
  b.textContent = titol;
  const s = document.createElement('span');
  s.textContent = text;
  el.append(b, s);
  capsa.append(el);
  setTimeout(() => el.classList.add('surt'), 3600);
  setTimeout(() => el.remove(), 4200);
}

/** Un text que puja i s'esvaeix al centre de la pantalla (+100 XP, combo…). */
export function flotant(text: string, tipus: 'xp' | 'cop' | 'escut' = 'xp'): void {
  const el = document.createElement('div');
  el.className = `flotant ${tipus}`;
  el.textContent = text;
  document.body.append(el);
  setTimeout(() => el.remove(), 1600);
}

/** Confeti de celebració amb canvas (sense llibreries). */
export function confeti(durada = 3500): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'confeti';
  document.body.append(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const ajusta = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  ajusta();
  const colors = ['#61dafb', '#ff3b5c', '#ffd23f', '#7cff6b', '#c38bff', '#ffffff'];
  const peces = Array.from({ length: 160 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * 0.5,
    vx: (Math.random() - 0.5) * 3,
    vy: 2 + Math.random() * 4,
    r: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
    mida: 6 + Math.random() * 8,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
  const inici = performance.now();
  const pas = (ara: number) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    peces.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.mida / 2, -p.mida / 4, p.mida, p.mida / 2);
      ctx.restore();
    });
    if (ara - inici < durada) requestAnimationFrame(pas);
    else canvas.remove();
  };
  requestAnimationFrame(pas);
}
