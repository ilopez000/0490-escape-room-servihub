# ServiHub · Kernel Panic · escape room de repàs del MP 0490

Escape room en línia i gamificat per repassar les **sessions 1 i 2** del mòdul **0490 Programació de serveis i
processos** (DAM2): processos, fils i serveis, concurrència i paral·lelisme, i subprocessos amb `ProcessBuilder`.
Fet amb **Astro**. Tot el joc funciona al navegador de l'alumne.

## La història

El servidor de ServiHub ha entrat en pànic. El **Rei Zombi** (PID 666), un procés que ha acabat però que el seu pare
no ha esperat mai, ha omplert la taula de processos i ha aturat els **sis nuclis**. L'equip d'operacions els torna a
engegar un per un: a cada nucli llegeix el manual (la teoria, amb el codi explicat fragment a fragment) i supera els
reptes. Cada nucli dona una lletra; amb les sis es compon l'ordre de reinici (**KERNEL**) i es baixa al kernel a
recollir el codi de retorn del Rei Zombi.

## Els nuclis

| Nucli | Què es repassa | Reptes |
|---|---|---|
| 1 · La taula de processos | Programa, procés, fil i servei; estats; planificador; `jps` | Classificar · estat de cada procés · 5 preguntes |
| 2 · Multinucli | Concurrent, paral·lel i distribuït | Classificar casos · avantatges i inconvenients · 4 preguntes |
| 3 · ServiHub v0 | L'entorn i `App.java` de la sessió 1 | Completar App · ordenar els passos (amb intrusos) · 5 preguntes |
| 4 · El llançador | `ProcessHandle`, `start()`, `waitFor()`, codis de retorn i `IOException` | Mètode → què fa · endevina el final · completar `executa` |
| 5 · Els fluxos | Sortida, error, memòria intermèdia, temps màxim i `destroy` | Quin flux · caça 4 sabotatges · completar l'exemple 4 · endevina la sortida |
| 6 · La granja de tasques | Directori, entorn, redireccions, `Jvm.ordre` i tasques en paral·lel | Completar l'exemple 5 · on va cada cosa · ordenar la versió paral·lela · prova de rendiment |
| Kernel · El Rei Zombi | Repàs | Ordre KERNEL + combat de 9 preguntes amb barra de vida del boss |

20 reptes i el combat final. El codi dels reptes surt dels exemples del repositori
[`0490-serveis-i-processos`](https://github.com/ilopez000/0490-serveis-i-processos) (paquets `sessio1` i `sessio2`), i
les sortides que es pregunten són les reals.

## Gamificació

- **XP**: 100 per repte; cada error en treu 10 i cada pista 30 (mínim 30). Nivell cada 400 XP.
- **Vida**: cada error en treu un 4% (no hi ha «game over»).
- **Ratxes**: reptes perfectes seguits donen XP extra i, cada 3, un **escut** que absorbeix un error.
- **16 assoliments**, estrelles per nucli, un servidor que s'engega, boss amb vida i frases, sons i confeti.
- Sense cap compte enrere ni referència a temps.

## L'informe per al professor

Al final surt un informe amb rang, rendiment, nuclis, reptes on més s'ha fallat, assoliments i una autoavaluació.
L'alumne l'envia a **ilopez@pratfp.com** amb Gmail o amb el seu programa de correu (text ja preparat), o el copia,
el descarrega en `.html` o el desa en PDF.

Cada informe porta un **codi de verificació** i un **segell**. A **`/verifica/`** el professor hi enganxa el text del
correu i comprova que les xifres no s'han tocat a mà. (Tot passa al navegador: dissuadeix retocs casuals, no és una
garantia criptogràfica.)

## Com s'executa al teu ordinador

Cal **Node.js 22 o superior**. Doble clic a `executa-escape-room.bat` (o `npm install` i `npm run dev`). S'obre a
`http://localhost:4325`.

## Com canviar el contingut

Tot el text, el codi i les respostes són a **`src/data/joc.ts`**. Als reptes de completar, cada `[[n]]` del codi és un
forat i `buits[n]` en diu les opcions i la resposta correcta. El correu del docent és `CORREU_DOCENT`.

## Publicació

Preparat per a **Cloudflare Pages**: `npm run build`, carpeta `dist`, Node 22 (fitxer `.node-version`).

---

Ignasi López Aylagas · Prat FP · MP 0490 Programació de serveis i processos · curs 2026-27
