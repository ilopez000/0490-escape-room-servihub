// Efectes de so sintetitzats amb Web Audio (no cal cap fitxer d'àudio).
import { carrega } from './estat';

let context: AudioContext | null = null;

function to(freq: number, inici: number, durada: number, tipus: OscillatorType, volum = 0.06) {
  if (!context) return;
  const osc = context.createOscillator();
  const guany = context.createGain();
  osc.type = tipus;
  osc.frequency.value = freq;
  guany.gain.setValueAtTime(volum, context.currentTime + inici);
  guany.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + inici + durada);
  osc.connect(guany).connect(context.destination);
  osc.start(context.currentTime + inici);
  osc.stop(context.currentTime + inici + durada);
}

export type Efecte = 'clic' | 'ok' | 'error' | 'desbloqueig' | 'victoria' | 'assoliment' | 'escut' | 'cop' | 'ratxa';

export function so(efecte: Efecte): void {
  if (!carrega().so) return;
  try {
    context ??= new AudioContext();
  } catch {
    return;
  }
  switch (efecte) {
    case 'clic':
      to(880, 0, 0.05, 'square', 0.025);
      break;
    case 'ok':
      to(660, 0, 0.12, 'triangle');
      to(990, 0.1, 0.18, 'triangle');
      break;
    case 'error':
      to(180, 0, 0.25, 'sawtooth', 0.05);
      to(120, 0.12, 0.3, 'sawtooth', 0.05);
      break;
    case 'desbloqueig':
      [523, 659, 784, 1047].forEach((f, i) => to(f, i * 0.09, 0.2, 'triangle'));
      break;
    case 'assoliment':
      [784, 988, 1175, 1568].forEach((f, i) => to(f, i * 0.07, 0.22, 'square', 0.03));
      break;
    case 'escut':
      to(440, 0, 0.3, 'sine', 0.08);
      to(880, 0.05, 0.4, 'sine', 0.05);
      break;
    case 'cop':
      to(90, 0, 0.18, 'square', 0.07);
      to(60, 0.08, 0.25, 'sawtooth', 0.05);
      break;
    case 'ratxa':
      [660, 880, 1320].forEach((f, i) => to(f, i * 0.06, 0.15, 'triangle', 0.05));
      break;
    case 'victoria':
      [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => to(f, i * 0.12, 0.3, 'triangle', 0.07));
      break;
  }
}
