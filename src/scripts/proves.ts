// Motor de les proves (panys). Cada tipus de prova es pinta i es comprova aquí.
import type {
  Prova,
  ProvaAparellar,
  ProvaClassificar,
  ProvaCompletar,
  ProvaQuiz,
  ProvaSeleccionar,
  ProvaSequencia,
} from '../data/joc';
import { ressalta } from './ressalta';
import { PUNTS } from '../data/joc';
import { so } from './so';

export interface Callbacks {
  /** S'ha comprovat i hi havia errors. */
  onError: () => void;
  /** S'ha demanat la pista. */
  onPista: () => void;
  /** El pany s'ha obert. */
  onResolta: () => void;
  /** (Només quiz) S'ha encertat una pregunta. */
  onEncert?: (index: number) => void;
}

// ---------------------------------------------------------------- utilitats
function barreja<T>(llista: T[]): T[] {
  const copia = [...llista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function el<K extends keyof HTMLElementTagNameMap>(
  etiqueta: K,
  classe = '',
  text = '',
): HTMLElementTagNameMap[K] {
  const node = document.createElement(etiqueta);
  if (classe) node.className = classe;
  if (text) node.textContent = text;
  return node;
}

/** Marc comú de tots els panys: títol, enunciat, cos, pista i botó de comprovar. */
function marc(contenidor: HTMLElement, prova: Prova, cb: Callbacks, etiquetaComprova = 'Comprova') {
  contenidor.innerHTML = '';
  const panell = el('section', `pany pany-${prova.tipus}`);
  const cap = el('header', 'pany-cap');
  cap.append(el('span', 'pany-icona', '🔒'), el('h3', '', prova.titol));
  const enunciat = el('p', 'pany-enunciat', prova.enunciat);
  const cos = el('div', 'pany-cos');
  const missatge = el('p', 'pany-missatge');
  missatge.setAttribute('role', 'status');
  const peu = el('footer', 'pany-peu');
  const pista = el('button', 'boto boto-fantasma', `Demana una pista (−${PUNTS.pista} XP)`);
  pista.type = 'button';
  const caixaPista = el('p', 'pany-pista');
  caixaPista.hidden = true;
  pista.addEventListener('click', () => {
    so('clic');
    caixaPista.textContent = `PISTA · ${prova.pista}`;
    caixaPista.hidden = false;
    pista.disabled = true;
    cb.onPista();
  });
  const comprova = el('button', 'boto boto-principal', etiquetaComprova);
  comprova.type = 'button';
  peu.append(pista, comprova);
  panell.append(cap, enunciat, cos, caixaPista, missatge, peu);
  contenidor.append(panell);

  const avisa = (text: string, tipus: 'ok' | 'error' | 'info') => {
    missatge.textContent = text;
    missatge.dataset.tipus = tipus;
  };
  const obre = () => {
    panell.classList.add('obert');
    cap.querySelector('.pany-icona')!.textContent = '🔓';
    comprova.disabled = true;
    pista.disabled = true;
    panell.querySelectorAll<HTMLButtonElement | HTMLSelectElement>('.pany-cos button, .pany-cos select').forEach((b) => (b.disabled = true));
    so('desbloqueig');
    setTimeout(cb.onResolta, 900);
  };
  const falla = (text: string) => {
    avisa(text, 'error');
    panell.classList.remove('sacseja');
    void panell.offsetWidth;
    panell.classList.add('sacseja');
    so('error');
    cb.onError();
  };
  return { panell, cos, comprova, avisa, obre, falla };
}

// ---------------------------------------------------------------- classificar
function classificar(contenidor: HTMLElement, prova: ProvaClassificar, cb: Callbacks) {
  const m = marc(contenidor, prova, cb);
  const tria = new Map<number, string>();
  let intents = 0;

  const files = barreja(prova.elements.map((e, i) => ({ ...e, i }))).map((element) => {
    const fila = el('div', 'fila-classificar');
    const text = el('div', 'fila-text');
    if (prova.codi) {
      const c = el('span', 'codi-inline');
      c.innerHTML = ressalta(element.text);
      text.append(c);
    } else {
      text.append(el('span', '', element.text));
    }
    const perque = el('small', 'perque');
    perque.hidden = true;
    text.append(perque);
    const botons = el('div', 'segmentat');
    botons.setAttribute('role', 'group');
    prova.categories.forEach((categoria) => {
      const b = el('button', 'segment', categoria);
      b.type = 'button';
      b.dataset.cat = categoria;
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => {
        so('clic');
        tria.set(element.i, categoria);
        fila.classList.remove('be', 'malament');
        perque.hidden = true;
        botons.querySelectorAll<HTMLButtonElement>('button').forEach((x) =>
          x.setAttribute('aria-pressed', String(x === b)),
        );
      });
      botons.append(b);
    });
    fila.append(text, botons);
    m.cos.append(fila);
    return { fila, perque, element };
  });

  m.comprova.addEventListener('click', () => {
    const falten = prova.elements.length - tria.size;
    if (falten > 0) return m.avisa(`Encara et falten ${falten} elements per classificar.`, 'info');
    intents += 1;
    let errors = 0;
    files.forEach(({ fila, perque, element }) => {
      const be = tria.get(element.i) === element.correcta;
      fila.classList.toggle('be', be);
      fila.classList.toggle('malament', !be);
      if (!be) errors += 1;
      if (!be && intents >= 2) {
        perque.textContent = element.perque;
        perque.hidden = false;
      }
    });
    if (errors === 0) {
      m.avisa('Correcte! Tots els elements són al seu lloc.', 'ok');
      files.forEach(({ perque, element }) => {
        perque.textContent = element.perque;
        perque.hidden = false;
      });
      m.obre();
    } else {
      m.falla(
        `${errors} ${errors === 1 ? 'element no és' : 'elements no són'} al seu lloc. Torna-ho a mirar.` +
          (intents >= 2 ? ' Llegeix l\'explicació dels que estan en vermell.' : ''),
      );
    }
  });
}

// ---------------------------------------------------------------- seleccionar
function seleccionar(contenidor: HTMLElement, prova: ProvaSeleccionar, cb: Callbacks) {
  const m = marc(contenidor, prova, cb);
  let intents = 0;
  const graella = el('div', prova.codi ? 'graella-escaneig llista-codi' : 'graella-escaneig');
  m.cos.append(graella);
  // Si són línies d'un programa, l'ordre importa: no es barregen.
  const targetes = (prova.codi ? prova.elements : barreja(prova.elements)).map((element) => {
    const t = el('button', 'targeta-escaneig');
    t.dataset.etiqueta = prova.etiqueta;
    t.type = 'button';
    t.setAttribute('aria-pressed', 'false');
    if (prova.codi) {
      const nom = el('span', 'nom');
      nom.innerHTML = ressalta(element.text);
      t.append(el('span', 'sector', element.sector), nom);
    } else {
      t.append(el('span', 'sector', element.sector), el('span', 'nom', element.text));
    }
    const perque = el('small', 'perque');
    perque.hidden = true;
    t.append(perque);
    t.addEventListener('click', () => {
      so('clic');
      const ara = t.getAttribute('aria-pressed') !== 'true';
      t.setAttribute('aria-pressed', String(ara));
      t.classList.remove('be', 'malament', 'oblidat');
      perque.hidden = true;
    });
    graella.append(t);
    return { t, perque, element };
  });

  m.comprova.addEventListener('click', () => {
    intents += 1;
    let sobren = 0;
    let falten = 0;
    targetes.forEach(({ t, perque, element }) => {
      const marcada = t.getAttribute('aria-pressed') === 'true';
      t.classList.remove('be', 'malament', 'oblidat');
      if (marcada && !element.correcta) {
        sobren += 1;
        t.classList.add('malament');
        if (intents >= 2) {
          perque.textContent = element.perque;
          perque.hidden = false;
        }
      } else if (!marcada && element.correcta) {
        falten += 1;
        if (intents >= 3) t.classList.add('oblidat');
      } else if (marcada) {
        t.classList.add('be');
      }
    });
    if (sobren === 0 && falten === 0) {
      m.avisa(prova.missatgeOk, 'ok');
      m.obre();
      return;
    }
    const parts: string[] = [];
    if (sobren) parts.push(`${sobren} ${sobren === 1 ? 'dels marcats no hi va' : 'dels marcats no hi van'}`);
    if (falten) parts.push(falten === 1 ? 'en falta 1 per trobar' : `en falten ${falten} per trobar`);
    m.falla(`Encara no: ${parts.join(' i ')}.` + (intents >= 3 && falten ? ' Els que falten parpellegen.' : ''));
  });
}

// ---------------------------------------------------------------- aparellar
function aparellar(contenidor: HTMLElement, prova: ProvaAparellar, cb: Callbacks) {
  const m = marc(contenidor, prova, cb);
  let intents = 0;
  const taula = el('div', 'taula-aparellar');
  taula.style.setProperty('--columnes', String(prova.columnes.length));
  const capcalera = el('div', 'fila-aparellar capcalera');
  capcalera.append(el('span', '', 'Element'));
  prova.columnes.forEach((c) => capcalera.append(el('span', '', c.nom)));
  taula.append(capcalera);

  const opcionsBarrejades = prova.columnes.map((c) => barreja(c.opcions));
  const files = barreja(prova.files).map((fila) => {
    const f = el('div', 'fila-aparellar');
    const text = el('div', 'fila-text');
    text.append(el('span', prova.codi ? 'codi-inline' : '', fila.text));
    const perque = el('small', 'perque');
    perque.hidden = true;
    text.append(perque);
    f.append(text);
    const selects = prova.columnes.map((columna, ci) => {
      const s = el('select', 'desplegable');
      s.setAttribute('aria-label', `${columna.nom} per a: ${fila.text}`);
      s.append(new Option(`— ${columna.nom.toLowerCase()} —`, ''));
      opcionsBarrejades[ci].forEach((o) => s.append(new Option(o, o)));
      s.addEventListener('change', () => {
        so('clic');
        s.classList.remove('be', 'malament');
        perque.hidden = true;
      });
      f.append(s);
      return s;
    });
    taula.append(f);
    return { f, selects, perque, fila };
  });
  m.cos.append(taula);

  m.comprova.addEventListener('click', () => {
    const buits = files.reduce((n, { selects }) => n + selects.filter((s) => !s.value).length, 0);
    if (buits > 0) return m.avisa(`Encara hi ha ${buits} ${buits === 1 ? 'desplegable' : 'desplegables'} sense triar.`, 'info');
    intents += 1;
    let errors = 0;
    files.forEach(({ selects, perque, fila }) => {
      let filaBe = true;
      selects.forEach((s, ci) => {
        const be = s.value === fila.correctes[ci];
        s.classList.toggle('be', be);
        s.classList.toggle('malament', !be);
        if (!be) {
          errors += 1;
          filaBe = false;
        }
      });
      if (!filaBe && intents >= 2) {
        perque.textContent = fila.perque;
        perque.hidden = false;
      }
    });
    if (errors === 0) {
      m.avisa('Correcte! Tot està ben assignat.', 'ok');
      files.forEach(({ perque, fila }) => {
        perque.textContent = fila.perque;
        perque.hidden = false;
      });
      m.obre();
    } else {
      m.falla(`${errors} ${errors === 1 ? 'tria no és correcta' : 'tries no són correctes'}.` + (intents >= 2 ? ' Mira l\'explicació de les files marcades.' : ''));
    }
  });
}

// ---------------------------------------------------------------- seqüència
function sequencia(contenidor: HTMLElement, prova: ProvaSequencia, cb: Callbacks) {
  const m = marc(contenidor, prova, cb);
  const cadena: string[] = [];
  const zonaCadena = el('ol', 'cadena');
  const zonaBlocs = el('div', 'blocs');
  const nota = el('p', 'nota-seq');
  const perqueIntrus = new Map(prova.intrusos.map((x) => [x.text, x.perque]));
  const tots = barreja([...prova.ordre, ...prova.intrusos.map((x) => x.text)]);

  const extrem = (text: string) => {
    const e = el('div', 'extrem', text);
    return e;
  };

  const pinta = () => {
    zonaCadena.innerHTML = '';
    cadena.forEach((text, i) => {
      const li = el('li');
      const b = el('button', prova.codi ? 'bloc a-la-cadena bloc-codi' : 'bloc a-la-cadena', text);
      if (prova.codi) b.innerHTML = ressalta(text);
      b.type = 'button';
      b.title = 'Treu-lo de la cadena';
      b.dataset.pos = String(i);
      b.addEventListener('click', () => {
        so('clic');
        cadena.splice(i, 1);
        nota.textContent = '';
        pinta();
      });
      li.append(b);
      zonaCadena.append(li);
    });
    for (let i = cadena.length; i < prova.ordre.length; i++) {
      const li = el('li', 'buit');
      li.append(el('span', 'forat', `Posició ${i + 1}`));
      zonaCadena.append(li);
    }
    zonaBlocs.innerHTML = '';
    tots
      .filter((t) => !cadena.includes(t))
      .forEach((text) => {
        const b = el('button', prova.codi ? 'bloc bloc-codi' : 'bloc', text);
        if (prova.codi) b.innerHTML = ressalta(text);
        b.type = 'button';
        b.addEventListener('click', () => {
          if (cadena.length >= prova.ordre.length) return m.avisa('La cadena ja és plena: treu-ne un bloc per canviar-lo.', 'info');
          so('clic');
          cadena.push(text);
          pinta();
        });
        zonaBlocs.append(b);
      });
  };

  const muntatge = el('div', 'muntatge');
  const esquerra = el('div', 'columna-cadena');
  esquerra.append(extrem(prova.inici), zonaCadena, extrem(prova.final));
  const dreta = el('div', 'columna-blocs');
  dreta.append(el('p', 'rotol', 'Blocs disponibles'), zonaBlocs);
  muntatge.append(esquerra, dreta);
  m.cos.append(muntatge, nota);
  pinta();

  m.comprova.addEventListener('click', () => {
    if (cadena.length < prova.ordre.length) return m.avisa(`Et falten ${prova.ordre.length - cadena.length} peces per completar la cadena.`, 'info');
    let errors = 0;
    const explicacions: string[] = [];
    zonaCadena.querySelectorAll<HTMLButtonElement>('.a-la-cadena').forEach((b, i) => {
      const be = cadena[i] === prova.ordre[i];
      b.classList.toggle('be', be);
      b.classList.toggle('malament', !be);
      if (!be) errors += 1;
      const intrus = perqueIntrus.get(cadena[i]);
      if (intrus) explicacions.push(`«${cadena[i]}»: ${intrus}`);
    });
    nota.textContent = explicacions.join(' ');
    if (errors === 0) {
      m.avisa(prova.missatgeOk, 'ok');
      m.obre();
    } else {
      m.falla(`${errors} ${errors === 1 ? 'peça està mal col·locada' : 'peces estan mal col·locades'}. Clica un bloc de la cadena per treure'l.`);
    }
  });
}

// ---------------------------------------------------------------- quiz
function quiz(contenidor: HTMLElement, prova: ProvaQuiz, cb: Callbacks) {
  const m = marc(contenidor, prova, cb, 'Següent pregunta');
  m.comprova.hidden = true;
  let actual = 0;
  const comptador = el('p', 'comptador-quiz');
  const pregunta = el('p', 'pregunta-quiz');
  const codiPregunta = el('pre', 'codi');
  const opcions = el('div', 'opcions-quiz');
  const perque = el('p', 'perque-quiz');
  m.cos.append(comptador, pregunta, codiPregunta, opcions, perque);

  const pinta = () => {
    const p = prova.preguntes[actual];
    comptador.innerHTML = '';
    prova.preguntes.forEach((_, i) => {
      comptador.append(el('span', i < actual ? 'punt fet' : i === actual ? 'punt actual' : 'punt'));
    });
    comptador.append(el('span', 'text', `Pregunta ${actual + 1} de ${prova.preguntes.length}`));
    pregunta.textContent = p.pregunta;
    codiPregunta.hidden = !p.codi;
    codiPregunta.innerHTML = p.codi ? `<code>${ressalta(p.codi)}</code>` : '';
    opcions.classList.toggle('opcions-codi', Boolean(p.codi));
    perque.textContent = '';
    opcions.innerHTML = '';
    m.comprova.hidden = true;
    m.avisa('', 'info');
    barreja(p.opcions.map((text, i) => ({ text, i }))).forEach(({ text, i }) => {
      const b = el('button', 'opcio', text);
      b.type = 'button';
      b.addEventListener('click', () => {
        if (i === p.correcta) {
          b.classList.add('be');
          opcions.querySelectorAll<HTMLButtonElement>('button').forEach((x) => (x.disabled = true));
          perque.textContent = p.perque;
          so('ok');
          cb.onEncert?.(actual);
          if (actual === prova.preguntes.length - 1) {
            m.avisa('Totes les respostes són correctes.', 'ok');
            m.obre();
          } else {
            m.comprova.hidden = false;
            m.comprova.focus();
          }
        } else {
          b.classList.add('malament');
          b.disabled = true;
          m.falla('Resposta incorrecta. Torna-ho a provar.');
        }
      });
      opcions.append(b);
    });
  };

  m.comprova.addEventListener('click', () => {
    so('clic');
    actual += 1;
    pinta();
  });
  pinta();
}

// ---------------------------------------------------------------- completar codi
function completar(contenidor: HTMLElement, prova: ProvaCompletar, cb: Callbacks) {
  const m = marc(contenidor, prova, cb);
  let intents = 0;
  const finestra = el('div', 'editor');
  const barra = el('div', 'editor-barra');
  barra.append(el('span', 'editor-punts'), el('span', 'editor-fitxer', prova.fitxer));
  const pre = el('pre', 'codi editor-codi');
  const code = el('code');
  pre.append(code);
  finestra.append(barra, pre);
  const explicacions = el('ol', 'explicacions-buits');
  explicacions.hidden = true;

  // Talla el codi pels forats [[n]]: el text es ressalta i cada forat és un desplegable.
  const selects: HTMLSelectElement[] = [];
  const trossos = prova.codi.split(/\[\[(\d+)\]\]/);
  trossos.forEach((tros, i) => {
    if (i % 2 === 0) {
      const span = el('span');
      span.innerHTML = ressalta(tros);
      code.append(span);
      return;
    }
    const n = Number(tros);
    const buit = prova.buits[n];
    const s = el('select', 'forat-codi');
    s.setAttribute('aria-label', `Forat ${n + 1}`);
    s.dataset.n = String(n);
    s.append(new Option(`▢ ${n + 1}`, ''));
    barreja(buit.opcions).forEach((o) => s.append(new Option(o, o)));
    s.addEventListener('change', () => {
      so('clic');
      s.classList.remove('be', 'malament');
      s.style.width = `${Math.max(7, (s.value || '').length + 4)}ch`;
    });
    s.style.width = '7ch';
    selects.push(s);
    code.append(s);
  });
  m.cos.append(finestra, explicacions);

  m.comprova.addEventListener('click', () => {
    const buits = selects.filter((s) => !s.value).length;
    if (buits > 0) return m.avisa(`Encara hi ha ${buits} ${buits === 1 ? 'forat buit' : 'forats buits'}.`, 'info');
    intents += 1;
    let errors = 0;
    explicacions.innerHTML = '';
    selects.forEach((s) => {
      const buit = prova.buits[Number(s.dataset.n)];
      const be = s.value === buit.correcta;
      s.classList.toggle('be', be);
      s.classList.toggle('malament', !be);
      if (!be) {
        errors += 1;
        if (intents >= 2) {
          const li = el('li', '', `Forat ${Number(s.dataset.n) + 1}: ${buit.perque}`);
          explicacions.append(li);
        }
      }
    });
    explicacions.hidden = explicacions.childElementCount === 0;
    if (errors === 0) {
      m.avisa('Compila! Totes les peces són al seu lloc.', 'ok');
      explicacions.innerHTML = '';
      prova.buits.forEach((b, i) => explicacions.append(el('li', '', `Forat ${i + 1} · ${b.correcta}: ${b.perque}`)));
      explicacions.hidden = false;
      m.obre();
    } else {
      m.falla(`Error de compilació: ${errors} ${errors === 1 ? 'forat no és correcte' : 'forats no són correctes'}.`);
    }
  });
}

// ---------------------------------------------------------------- entrada
export function montaProva(contenidor: HTMLElement, prova: Prova, cb: Callbacks): void {
  switch (prova.tipus) {
    case 'classificar':
      return classificar(contenidor, prova, cb);
    case 'seleccionar':
      return seleccionar(contenidor, prova, cb);
    case 'aparellar':
      return aparellar(contenidor, prova, cb);
    case 'sequencia':
      return sequencia(contenidor, prova, cb);
    case 'quiz':
      return quiz(contenidor, prova, cb);
    case 'completar':
      return completar(contenidor, prova, cb);
  }
}
