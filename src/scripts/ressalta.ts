// Ressaltat senzill per a Java i ordres de terminal.
// Retorna HTML segur: tot el text s'escapa abans de pintar-lo.

const CLAU = new Set([
  'import', 'from', 'export', 'default', 'function', 'return', 'const', 'let', 'var', 'type', 'interface',
  'if', 'else', 'for', 'while', 'new', 'true', 'false', 'null', 'undefined', 'try', 'catch', 'typeof',
  'keyof', 'as', 'async', 'await', 'npm', 'node', 'cd', 'npx',
  'public', 'private', 'protected', 'static', 'final', 'void', 'class', 'package', 'throws', 'throw',
  'int', 'long', 'boolean', 'double', 'char', 'this', 'super', 'extends', 'implements', 'finally',
  'java', 'javac', 'jps', 'jcmd',
]);

function escapa(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Ordre dels grups: comentaris, cadenes, etiquetes JSX, variables CSS, at-rules, selectors/pseudoclasses CSS,
// números (amb unitats), paraules.
const PATRO = new RegExp(
  [
    String.raw`(\/\/[^\n]*|\/\*[\s\S]*?\*\/)`, // 1 comentari
    String.raw`('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|` + '`(?:\\\\.|[^`\\\\])*`)', // 2 cadena
    String.raw`((?!))`, // 3 (sense etiquetes: el codi és Java)
    String.raw`((?!))`, // 4 (sense variables CSS)
    String.raw`(@[a-z-]+)`, // 5 at-rule
    String.raw`((?!))`, // 6 (sense selectors CSS)
    String.raw`(\b\d+(?:\.\d+)?(?:px|rem|em|fr|vw|vh|dvh|ms|s|%|ch)?)`, // 7 número
    String.raw`(\b[A-Za-z_$][\w$]*\b)`, // 8 paraula
  ].join('|'),
  'g',
);

export function ressalta(codi: string): string {
  let sortida = '';
  let ultim = 0;
  for (const m of codi.matchAll(PATRO)) {
    const i = m.index ?? 0;
    sortida += escapa(codi.slice(ultim, i));
    const [tot, comentari, cadena, etiqueta, variable, atRule, selector, numero, paraula] = m;
    if (comentari) sortida += `<span class="tk-com">${escapa(comentari)}</span>`;
    else if (cadena) sortida += `<span class="tk-str">${escapa(cadena)}</span>`;
    else if (etiqueta) sortida += `<span class="tk-tag">${escapa(etiqueta)}</span>`;
    else if (variable) sortida += `<span class="tk-var">${escapa(variable)}</span>`;
    else if (atRule) sortida += `<span class="tk-kw">${escapa(atRule)}</span>`;
    else if (selector) sortida += `<span class="tk-sel">${escapa(selector)}</span>`;
    else if (numero) sortida += `<span class="tk-num">${escapa(numero)}</span>`;
    else if (paraula && CLAU.has(paraula)) sortida += `<span class="tk-kw">${paraula}</span>`;
    else if (paraula && /^use[A-Z]/.test(paraula)) sortida += `<span class="tk-hook">${paraula}</span>`;
    else if (paraula && /^[A-Z]/.test(paraula)) sortida += `<span class="tk-tipus">${paraula}</span>`;
    else sortida += escapa(tot);
    ultim = i + tot.length;
  }
  return sortida + escapa(codi.slice(ultim));
}
