// Efecte de text que s'escriu sol, com un missatge entrant. Es pot saltar.
export function transmet(contenidor: HTMLElement, linies: string[], alAcabar?: () => void): void {
  const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  contenidor.innerHTML = '';
  const paragrafs = linies.map((text) => {
    const p = document.createElement('p');
    p.dataset.text = text;
    contenidor.append(p);
    return p;
  });

  let acabat = false;
  const acaba = () => {
    if (acabat) return;
    acabat = true;
    paragrafs.forEach((p) => {
      p.textContent = p.dataset.text ?? '';
      p.classList.remove('escrivint');
    });
    salta?.remove();
    alAcabar?.();
  };

  const salta = contenidor.parentElement?.querySelector<HTMLButtonElement>('[data-salta]');
  salta?.addEventListener('click', acaba, { once: true });

  if (reduit) {
    acaba();
    return;
  }

  let linia = 0;
  let lletra = 0;
  const pas = () => {
    if (acabat) return;
    const p = paragrafs[linia];
    if (!p) return acaba();
    const text = p.dataset.text ?? '';
    p.classList.add('escrivint');
    lletra += 2;
    p.textContent = text.slice(0, lletra);
    if (lletra >= text.length) {
      p.classList.remove('escrivint');
      linia += 1;
      lletra = 0;
      setTimeout(pas, 260);
    } else {
      setTimeout(pas, 16);
    }
  };
  pas();
}
