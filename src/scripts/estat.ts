// Estat de la partida. Es desa al navegador de l'alumne.
import { PROVA_FINAL, PUNTS, SALES } from '../data/joc';

export interface EstatRepte {
  errors: number;
  pistes: number;
  xp: number;
  bonus: number;
}

export interface EstatSala {
  completada: boolean;
  xp: number;
  bonus: number;
  errors: number;
  pistes: number;
  reptes: EstatRepte[];
}

export interface Estat {
  nom: string;
  alies: string;
  sales: Record<number, EstatSala>;
  vida: number;
  clauIntroduida: boolean;
  final: EstatSala;
  ratxa: number;
  millorRatxa: number;
  escuts: number;
  escutsUsats: number;
  assoliments: string[];
  checklist: boolean[];
  so: boolean;
}

const CLAU = 'servihub-kernel-panic-0490-v1';
const PREFIX_NOM = 'skp0490:';

export function salaBuida(): EstatSala {
  return { completada: false, xp: 0, bonus: 0, errors: 0, pistes: 0, reptes: [] };
}

function buit(): Estat {
  return {
    nom: '',
    alies: '',
    sales: {},
    vida: 100,
    clauIntroduida: false,
    final: salaBuida(),
    ratxa: 0,
    millorRatxa: 0,
    escuts: 0,
    escutsUsats: 0,
    assoliments: [],
    checklist: [],
    so: true,
  };
}

// La partida es desa a localStorage. Si el navegador el té bloquejat, es desa a window.name,
// que es conserva mentre no es tanqui la pestanya.
function llegeixDesat(): string | null {
  try {
    const desat = localStorage.getItem(CLAU);
    if (desat) return desat;
  } catch {
    /* emmagatzematge bloquejat */
  }
  return window.name.startsWith(PREFIX_NOM) ? window.name.slice(PREFIX_NOM.length) : null;
}

export function emmagatzematgeDisponible(): boolean {
  try {
    const prova = '__prova__';
    localStorage.setItem(prova, '1');
    localStorage.removeItem(prova);
    return true;
  } catch {
    return false;
  }
}

export function carrega(): Estat {
  try {
    const desat = llegeixDesat();
    if (!desat) return buit();
    return { ...buit(), ...(JSON.parse(desat) as Partial<Estat>) };
  } catch {
    return buit();
  }
}

export function desa(estat: Estat): void {
  const text = JSON.stringify(estat);
  window.name = PREFIX_NOM + text;
  try {
    localStorage.setItem(CLAU, text);
  } catch {
    /* sense localStorage: queda a window.name */
  }
}

export function reinicia(): Estat {
  const nou = buit();
  nou.so = carrega().so;
  desa(nou);
  return nou;
}

export function nomVisible(estat: Estat): string {
  return estat.alies || estat.nom || '—';
}

export function salaDesbloquejada(estat: Estat, id: number): boolean {
  return id === 1 || Boolean(estat.sales[id - 1]?.completada);
}

export function plantesFetes(estat: Estat): number {
  return SALES.filter((sala) => estat.sales[sala.id]?.completada).length;
}

export function totesCompletades(estat: Estat): boolean {
  return plantesFetes(estat) === SALES.length;
}

/** XP de base (sense bonus) i bonus de ratxa, de les plantes fetes i del boss. */
export function xpParts(estat: Estat): { base: number; bonus: number } {
  const parts = [...Object.values(estat.sales), estat.final].filter((s) => s.completada);
  return {
    base: parts.reduce((n, s) => n + s.xp, 0),
    bonus: parts.reduce((n, s) => n + (s.bonus ?? 0), 0),
  };
}

export function xpTotal(estat: Estat): number {
  const { base, bonus } = xpParts(estat);
  return base + bonus;
}

export function nombreReptes(): number {
  return SALES.reduce((suma, sala) => suma + sala.proves.length, 0) + 1;
}

/** Màxim de base: cada repte de cada nucli més el boss, sense comptar bonus. */
export function xpMaxim(): number {
  return nombreReptes() * PUNTS.pany;
}

export function xpPany(errors: number, pistes: number): number {
  return Math.max(PUNTS.minimPany, PUNTS.pany - errors * PUNTS.error - pistes * PUNTS.pista);
}

/** Nivell de desenvolupador segons l'XP: cada 400 XP es puja de nivell. */
export const XP_PER_NIVELL = 400;
export function nivell(xp: number): { nivell: number; dinsNivell: number } {
  return { nivell: Math.floor(xp / XP_PER_NIVELL) + 1, dinsNivell: xp % XP_PER_NIVELL };
}

/** Resultat d'un error: si hi ha escut, l'absorbeix; si no, es perd vida. */
export function rebCop(estat: Estat): 'escut' | 'vida' {
  estat.ratxa = 0;
  if (estat.escuts > 0) {
    estat.escuts -= 1;
    estat.escutsUsats += 1;
    desa(estat);
    return 'escut';
  }
  estat.vida = Math.max(0, estat.vida - PUNTS.integritatError);
  desa(estat);
  return 'vida';
}

/**
 * Tanca un repte superat: calcula l'XP, actualitza la ratxa i, si toca, dona un escut.
 * Retorna el que ha passat perquè la pàgina ho pugui celebrar.
 */
export function tancaRepte(
  estat: Estat,
  errors: number,
  pistes: number,
): { repte: EstatRepte; perfecte: boolean; ratxa: number; escutNou: boolean } {
  const xp = xpPany(errors, pistes);
  const perfecte = errors === 0 && pistes === 0;
  let bonus = 0;
  let escutNou = false;
  if (perfecte) {
    estat.ratxa += 1;
    estat.millorRatxa = Math.max(estat.millorRatxa, estat.ratxa);
    bonus = Math.min(PUNTS.bonusRatxaMaxim, PUNTS.bonusRatxa * (estat.ratxa - 1));
    if (estat.ratxa % PUNTS.escutCada === 0 && estat.escuts < PUNTS.escutsMaxims) {
      estat.escuts += 1;
      escutNou = true;
    }
  } else {
    estat.ratxa = 0;
  }
  desa(estat);
  return { repte: { errors, pistes, xp, bonus }, perfecte, ratxa: estat.ratxa, escutNou };
}

export function resumSala(reptes: EstatRepte[]): EstatSala {
  return {
    completada: true,
    xp: reptes.reduce((n, r) => n + r.xp, 0),
    bonus: reptes.reduce((n, r) => n + r.bonus, 0),
    errors: reptes.reduce((n, r) => n + r.errors, 0),
    pistes: reptes.reduce((n, r) => n + r.pistes, 0),
    reptes,
  };
}

export function preguntesBoss(): number {
  return PROVA_FINAL.preguntes.length;
}

export function url(cami: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${cami.replace(/^\//, '')}`;
}
