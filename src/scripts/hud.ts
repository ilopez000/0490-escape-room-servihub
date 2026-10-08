// Barra superior: jugador, nivell i XP, vida, ratxa, escuts i mòduls de la clau.
import { PUNTS, SALES } from '../data/joc';
import { carrega, desa, emmagatzematgeDisponible, nivell, nomVisible, xpTotal, XP_PER_NIVELL, type Estat } from './estat';

export function pintaHud(estat: Estat = carrega()): void {
  const hud = document.getElementById('hud');
  if (!hud) return;
  const $ = (camp: string) => hud.querySelector<HTMLElement>(`[data-hud="${camp}"]`)!;

  $('agent').textContent = nomVisible(estat);
  const xp = xpTotal(estat);
  const { nivell: lv, dinsNivell } = nivell(xp);
  $('xp').textContent = String(xp);
  $('nivell').textContent = `LV ${lv}`;
  $('barra-xp').style.width = `${(dinsNivell / XP_PER_NIVELL) * 100}%`;
  $('bloc-xp').title = `${XP_PER_NIVELL - dinsNivell} XP per pujar al nivell ${lv + 1}`;

  const barra = $('barra');
  barra.style.width = `${estat.vida}%`;
  barra.dataset.nivell = estat.vida > 60 ? 'alt' : estat.vida > 30 ? 'mig' : 'baix';
  $('integritat').textContent = `${estat.vida}%`;

  const ratxa = $('ratxa');
  ratxa.textContent = estat.ratxa > 1 ? `×${estat.ratxa}` : '—';
  ratxa.closest('.hud-bloc')!.classList.toggle('encesa', estat.ratxa >= 2);

  const escuts = $('escuts');
  escuts.innerHTML = '';
  for (let i = 0; i < PUNTS.escutsMaxims; i++) {
    const e = document.createElement('span');
    e.className = i < estat.escuts ? 'escut ple' : 'escut';
    e.textContent = '⛨';
    escuts.append(e);
  }
  escuts.title = `${estat.escuts} ${estat.escuts === 1 ? 'escut' : 'escuts'}: cada escut absorbeix un error sense perdre vida. Es guanya un escut cada ${PUNTS.escutCada} reptes perfectes seguits.`;

  const slots = $('fragments');
  slots.innerHTML = '';
  SALES.forEach((sala) => {
    const slot = document.createElement('span');
    const tinc = estat.sales[sala.id]?.completada;
    slot.className = tinc ? 'slot ple' : 'slot';
    slot.textContent = tinc ? sala.fragment.lletra : '?';
    slot.title = tinc ? `Mòdul de la ${sala.codi.toLowerCase()}` : `${sala.codi} pendent`;
    slots.append(slot);
  });

  const boto = $('so') as HTMLButtonElement;
  boto.textContent = estat.so ? '♪ So' : '♪ Mut';
  boto.setAttribute('aria-pressed', String(estat.so));
}

export function iniciaHud(): void {
  pintaHud();
  if (!emmagatzematgeDisponible()) {
    const avis = document.createElement('p');
    avis.className = 'avis-emmagatzematge';
    avis.textContent =
      'El teu navegador no deixa desar dades d\'aquesta web. Pots jugar igualment, però no tanquis aquesta pestanya o perdràs el progrés.';
    document.querySelector('.contingut')?.prepend(avis);
  }
  document.querySelector<HTMLButtonElement>('[data-hud="so"]')?.addEventListener('click', () => {
    const estat = carrega();
    estat.so = !estat.so;
    desa(estat);
    pintaHud(estat);
  });
}

/** Petita animació quan canvia un valor del HUD. */
export function destacaHud(camp: 'xp' | 'integritat' | 'ratxa' | 'escuts'): void {
  const el = document.querySelector<HTMLElement>(`[data-hud="${camp}"]`)?.closest<HTMLElement>('.hud-bloc');
  if (!el) return;
  el.classList.remove('pols');
  void el.offsetWidth;
  el.classList.add('pols');
}
