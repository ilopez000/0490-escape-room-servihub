// =====================================================================
//  SERVIHUB · KERNEL PANIC · Escape room de repàs de les sessions 1 i 2 del MP 0490
//  Tot el contingut del joc és aquí: narrativa, teoria, reptes i punts.
//  Per canviar una pregunta o afegir-ne una, només cal tocar aquest fitxer.
// =====================================================================

export type Categoria = string;

/** Classificar cada element en una de les categories. */
export interface ProvaClassificar {
  tipus: 'classificar';
  titol: string;
  enunciat: string;
  categories: Categoria[];
  elements: { text: string; correcta: Categoria; perque: string }[];
  /** Els elements són fragments de codi (es pinten en lletra monoespaiada). */
  codi?: boolean;
  pista: string;
}

/** Marcar totes les targetes que compleixen una condició (o les línies amb error d'un programa). */
export interface ProvaSeleccionar {
  tipus: 'seleccionar';
  titol: string;
  enunciat: string;
  /** Text que surt a la targeta quan està marcada. */
  etiqueta: string;
  missatgeOk: string;
  /** Les targetes són línies d'un mateix programa (caça d'errors): no es barregen. */
  codi?: boolean;
  elements: { text: string; sector: string; correcta: boolean; perque: string }[];
  pista: string;
}

/** Relacionar cada fila amb una opció de cada columna (desplegables). */
export interface ProvaAparellar {
  tipus: 'aparellar';
  titol: string;
  enunciat: string;
  columnes: { nom: string; opcions: string[] }[];
  files: { text: string; correctes: string[]; perque: string }[];
  /** El text de cada fila és codi (lletra monoespaiada). */
  codi?: boolean;
  pista: string;
}

/** Construir una cadena en l'ordre correcte triant blocs (pot tenir blocs intrusos). */
export interface ProvaSequencia {
  tipus: 'sequencia';
  titol: string;
  enunciat: string;
  inici: string;
  final: string;
  missatgeOk: string;
  codi?: boolean;
  ordre: string[];
  intrusos: { text: string; perque: string }[];
  pista: string;
}

/** Preguntes de resposta única, una darrere l'altra. */
export interface ProvaQuiz {
  tipus: 'quiz';
  titol: string;
  enunciat: string;
  preguntes: { pregunta: string; codi?: string; opcions: string[]; correcta: number; perque: string }[];
  pista: string;
}

/** Completar un fragment de codi: cada [[n]] del codi és un desplegable. */
export interface ProvaCompletar {
  tipus: 'completar';
  titol: string;
  enunciat: string;
  fitxer: string;
  codi: string;
  buits: { opcions: string[]; correcta: string; perque: string }[];
  pista: string;
}

export type Prova = ProvaClassificar | ProvaSeleccionar | ProvaAparellar | ProvaSequencia | ProvaQuiz | ProvaCompletar;

export interface Sala {
  id: number;
  /** Rètol curt: «NUCLI 1». */
  codi: string;
  nom: string;
  /** Sessió que es repassa. */
  lloc: string;
  /** Sistema del servidor que es restaura en superar el nucli. */
  sistema: string;
  icona: string;
  transmissio: string[];
  /** Fitxes de teoria. «codi» es pinta ressaltat; «linies» fa una taula fragment → explicació. */
  teoria: { titol: string; html: string; codi?: string; linies?: { codi: string; explica: string }[] }[];
  ideaClau: string;
  proves: Prova[];
  fragment: { posicio: number; lletra: string };
  missatgeFinal: string;
}


export const CLAU_MESTRA = 'KERNEL';

export const INTRO = {
  titol: 'SERVIHUB · KERNEL PANIC',
  subtitol: 'Escape room de repàs · MP 0490 · sessions 1 i 2',
  transmissio: [
    'ALERTA · El servidor de ServiHub ha entrat en pànic. La taula de processos és plena i el planificador no respon.',
    'El culpable és el REI ZOMBI, PID 666: un procés que ha acabat però que el seu pare no ha esperat mai. Ningú n\'ha recollit el codi de retorn, i cada zombi que deixa ocupa un lloc a la taula.',
    'Formes part de l\'equip d\'operacions. El servidor té sis nuclis i el Rei Zombi els ha aturat tots. A cada nucli repassaràs una part del que hem vist i recuperaràs una lletra.',
    'Amb les sis lletres reiniciaràs el sistema i baixaràs al kernel a fer el que cap pare no ha fet: esperar-lo, recollir-ne el codi i treure\'l de la taula.',
    'Engega els nuclis.',
  ],
};

export const SALES: Sala[] = [
  // ------------------------------------------------------------------ NUCLI 1
  {
    id: 1,
    codi: 'NUCLI 1',
    nom: 'La taula de processos',
    lloc: 'Sessió 1 · Programa, procés, fil i servei',
    sistema: 'Taula de processos i planificador',
    icona: '▤',
    transmissio: [
      'Nucli 1. La taula de processos està corrompuda: el sistema ja no distingeix un programa d\'un procés.',
      'Repassa què és cada cosa, per quins estats passa un procés i qui decideix qui entra a la CPU.',
    ],
    teoria: [
      {
        titol: 'Programa, procés, fil i servei',
        html: `<ul>
<li><strong>Programa</strong>: el fitxer executable desat al disc. Està quiet: no consumeix CPU.</li>
<li><strong>Procés</strong>: el programa <strong>en execució</strong>. Té el seu espai de memòria, els seus recursos i un identificador, el <strong>PID</strong>.</li>
<li><strong>Fil</strong> (<em>thread</em>): una línia d'execució <strong>dins</strong> d'un procés. Tots els fils d'un procés <strong>comparteixen la memòria</strong>. Tot procés té, com a mínim, un fil.</li>
<li><strong>Servei</strong> (<em>daemon</em>): un procés que corre en <strong>segon pla</strong>, sense interacció directa amb l'usuari, i que sol arrencar amb el sistema.</li>
</ul>
<p>Un mateix programa pot donar molts processos: si obres dues vegades el bloc de notes, hi ha un sol fitxer al disc i dos processos, cadascun amb el seu PID.</p>`,
      },
      {
        titol: 'Els estats d\'un procés i el planificador',
        html: `<p>Un procés passa per cinc estats:</p>
<ul>
<li><strong>Nou</strong>: s'està creant (el sistema li reserva memòria i li dona PID).</li>
<li><strong>Preparat</strong>: té tot el que necessita i espera torn de CPU.</li>
<li><strong>En execució</strong>: les seves instruccions s'executen en un nucli.</li>
<li><strong>Bloquejat</strong>: espera alguna cosa que no és la CPU (que acabi una lectura, que l'usuari escrigui, que passi un temps…).</li>
<li><strong>Acabat</strong>: ha finalitzat i ha deixat un <strong>codi de retorn</strong>.</li>
</ul>
<p>El <strong>planificador</strong> del sistema operatiu decideix quin procés preparat entra a la CPU i durant quant de temps. Quan el treu i n'hi posa un altre fa un <strong>canvi de context</strong>: guardar l'estat d'un i restaurar el de l'altre. Això <strong>té un cost</strong>, i per això milers de processos són cars i milers de fils, molt menys.</p>`,
      },
      {
        titol: 'Veure els processos de la màquina',
        html: `<p>A l'AA1 vam mirar què passa de debò al sistema:</p>
<ul>
<li><strong>Windows</strong>: l'Administrador de tasques (pestanya Detalls, amb la columna PID) o <code>tasklist</code> a la consola.</li>
<li><strong>Linux</strong>: <code>ps</code> i <code>top</code>.</li>
<li><strong>Eines del JDK</strong>: <code>jps</code> llista els processos Java (la JVM) amb el seu PID, i <code>jcmd</code> hi envia ordres de diagnòstic, per exemple per veure'n els fils.</li>
</ul>`,
        codi: `jps -l
jcmd 8124 Thread.print`,
        linies: [
          { codi: 'jps -l', explica: 'Llista les JVM que s\'estan executant: PID i classe principal o fitxer .jar (-l en mostra el nom complet).' },
          { codi: 'jcmd 8124 Thread.print', explica: 'Demana a la JVM amb PID 8124 que imprimeixi tots els seus fils i què està fent cadascun.' },
        ],
      },
    ],
    ideaClau: 'Programa = fitxer quiet. Procés = programa en marxa amb PID i memòria pròpia. Fil = línia d\'execució que comparteix la memòria del procés. Servei = procés en segon pla. El planificador reparteix la CPU, i cada canvi de context costa.',
    proves: [
      {
        tipus: 'classificar',
        titol: 'Repte 1A · Reconstrueix la taula',
        enunciat: 'El Rei Zombi ha barrejat les entrades de la taula de processos. Classifica cada element.',
        categories: ['Programa', 'Procés', 'Fil', 'Servei'],
        elements: [
          { text: 'El fitxer java.exe desat a la carpeta del JDK', correcta: 'Programa', perque: 'És un executable al disc: mentre ningú no l\'executa, no consumeix CPU.' },
          { text: 'servihub-0.1.jar a la carpeta target/', correcta: 'Programa', perque: 'Un .jar compilat és un programa: fins que no fas java -jar, no hi ha cap procés.' },
          { text: 'IntelliJ IDEA obert, amb el PID 8124', correcta: 'Procés', perque: 'Programa en execució amb el seu identificador.' },
          { text: 'La JVM que executa el teu App.java quan prems ▶', correcta: 'Procés', perque: 'Cada execució crea un procés nou, amb un PID diferent cada cop.' },
          { text: 'Les dues finestres del bloc de notes que tens obertes', correcta: 'Procés', perque: 'Un sol programa, dos processos, dos PID.' },
          { text: 'El fil main del teu programa Java', correcta: 'Fil', perque: 'És la línia d\'execució principal dins del procés de la JVM.' },
          { text: 'El fil lector que llegeix la sortida d\'error del fill a l\'exemple 3', correcta: 'Fil', perque: 'Una segona línia d\'execució dins del mateix procés, que en comparteix la memòria.' },
          { text: 'El servidor de MariaDB que arrenca amb el sistema i espera connexions', correcta: 'Servei', perque: 'Corre en segon pla, sense finestra, i arrenca amb el sistema.' },
          { text: 'La cua d\'impressió de Windows (Spooler)', correcta: 'Servei', perque: 'Un servei del sistema: ningú no hi interactua directament.' },
        ],
        pista: 'Pregunta\'t: és al disc i quiet (programa), està en marxa amb PID (procés), és una línia dins d\'un procés (fil) o corre sol en segon pla (servei)?',
      },
      {
        tipus: 'aparellar',
        titol: 'Repte 1B · En quin estat és?',
        enunciat: 'El planificador ha perdut el compte. Digues en quin estat és cada procés.',
        columnes: [{ nom: 'Estat', opcions: ['Nou', 'Preparat', 'En execució', 'Bloquejat', 'Acabat'] }],
        files: [
          { text: 'Acabes de cridar start(): el sistema li està reservant memòria i li assigna PID.', correctes: ['Nou'], perque: 'S\'està creant: encara no pot competir per la CPU.' },
          { text: 'Ho té tot llest i espera que el planificador li doni un nucli.', correctes: ['Preparat'], perque: 'Només li falta CPU.' },
          { text: 'Ara mateix les seves instruccions s\'executen en un nucli.', correctes: ['En execució'], perque: 'És qui té la CPU en aquest instant.' },
          { text: 'Ha fet Thread.sleep(1000) i espera que passi el segon.', correctes: ['Bloquejat'], perque: 'Espera una cosa que no és la CPU: el temps.' },
          { text: 'Espera que l\'usuari escrigui alguna cosa pel teclat.', correctes: ['Bloquejat'], perque: 'Espera una entrada: encara que li donessis CPU, no podria avançar.' },
          { text: 'Se li ha acabat el seu torn i el planificador n\'ha posat un altre.', correctes: ['Preparat'], perque: 'Torna a la cua: podria continuar, però espera torn.' },
          { text: 'Ha executat System.exit(2).', correctes: ['Acabat'], perque: 'Ha finalitzat i ha deixat el codi de retorn 2.' },
        ],
        pista: 'Bloquejat = espera una cosa que no és la CPU. Preparat = només li falta la CPU.',
      },
      {
        tipus: 'quiz',
        titol: 'Repte 1C · Interrogatori al planificador',
        enunciat: 'Cinc preguntes per tornar a engegar el planificador.',
        preguntes: [
          {
            pregunta: 'Què comparteixen els fils d\'un mateix procés?',
            opcions: ['La memòria del procés', 'Res: cada fil té la seva memòria', 'Només el PID del pare', 'El disc dur, però no la memòria'],
            correcta: 0,
            perque: 'Per això són lleugers… i per això caldrà sincronitzar-los quan arribem a l\'AEA2.',
          },
          {
            pregunta: 'Per què milers de processos costen més que milers de fils?',
            opcions: [
              'Cada procés té la seva memòria i canviar de procés és un canvi de context més car',
              'Perquè els processos no poden fer servir la CPU',
              'Perquè Java no permet més de 100 processos',
              'No és cert: costen el mateix',
            ],
            correcta: 0,
            perque: 'Guardar i restaurar l\'estat d\'un procés sencer no és gratuït.',
          },
          {
            pregunta: 'Què és el PID?',
            opcions: ['L\'identificador numèric d\'un procés', 'El nom del fitxer executable', 'La prioritat del procés', 'El nombre de fils del procés'],
            correcta: 0,
            perque: 'Cada procés en té un, i és diferent cada cop que l\'executes.',
          },
          {
            pregunta: 'Quina eina del JDK llista els processos Java que s\'estan executant?',
            opcions: ['jps', 'javac', 'jar', 'javadoc'],
            correcta: 0,
            perque: 'jps (Java Process Status) mostra el PID i la classe principal de cada JVM.',
          },
          {
            pregunta: 'Quina d\'aquestes frases descriu un servei?',
            opcions: [
              'Un procés en segon pla, sense interacció directa, que sol arrencar amb el sistema',
              'Un fil que pinta la finestra d\'una aplicació',
              'Un programa que encara no s\'ha executat',
              'Un procés que l\'usuari obre i tanca quan vol',
            ],
            correcta: 0,
            perque: 'En Linux se\'n diu daemon; en Windows, servei.',
          },
        ],
        pista: 'Repassa la primera i la segona pàgina del manual: fils, canvi de context i PID.',
      },
    ],
    fragment: { posicio: 1, lletra: 'K' },
    missatgeFinal: 'Taula de processos reconstruïda. El planificador torna a saber qui és qui.',
  },

  // ------------------------------------------------------------------ NUCLI 2
  {
    id: 2,
    codi: 'NUCLI 2',
    nom: 'Multinucli',
    lloc: 'Sessió 1 · Concurrent, paral·lel i distribuït',
    sistema: 'Repartidor de càrrega entre nuclis',
    icona: '◫',
    transmissio: [
      'Nucli 2. El repartidor de càrrega s\'ha bloquejat: ja no sap si ha d\'alternar tasques, executar-les alhora o enviar-les a una altra màquina.',
      'Recorda la diferència entre concurrent, paral·lel i distribuït, i què guanyes i què pagues amb cadascun.',
    ],
    teoria: [
      {
        titol: 'Tres maneres de fer moltes coses',
        html: `<ul>
<li><strong>Concurrent</strong>: diverses tasques <strong>progressen en el mateix període de temps</strong>, encara que sigui alternant-se en un sol nucli. És la il·lusió de simultaneïtat que fa el planificador.</li>
<li><strong>Paral·lel</strong>: diverses tasques s'executen <strong>realment al mateix instant</strong>, en nuclis o processadors diferents de la mateixa màquina.</li>
<li><strong>Distribuït</strong>: les tasques s'executen en <strong>màquines diferents</strong> connectades per xarxa.</li>
</ul>
<p>Tot programa paral·lel és concurrent, però no tot programa concurrent és paral·lel: amb un sol nucli pots tenir concurrència però no paral·lelisme.</p>`,
      },
      {
        titol: 'Què guanyes i què pagues',
        html: `<ul>
<li><strong>Guanys</strong>: més rendiment (acabar abans) i aprofitar millor els recursos (els nuclis que tens, o moltes màquines).</li>
<li><strong>Costos del paral·lel</strong>: cal <strong>sincronitzar</strong> les tasques que comparteixen dades, i apareixen errors que només passen de tant en tant i costen molt de reproduir.</li>
<li><strong>Costos del distribuït</strong>, a més: la <strong>latència</strong> de la xarxa (enviar dades no és gratuït) i les <strong>fallades parcials</strong>: una màquina pot caure mentre les altres continuen.</li>
</ul>
<p>Ho vam veure a l'exemple 6 de la sessió 2: tres tasques de 2 segons van trigar uns 6 segons una darrere l'altra i uns 2 segons en paral·lel.</p>`,
      },
    ],
    ideaClau: 'Concurrent = progressen alhora, encara que s\'alternin. Paral·lel = s\'executen alhora en nuclis diferents. Distribuït = en màquines diferents per xarxa. Guanyes rendiment; pagues sincronització, errors difícils i, en distribuït, latència i fallades parcials.',
    proves: [
      {
        tipus: 'classificar',
        titol: 'Repte 2A · Reparteix la càrrega',
        enunciat: 'Cada cas fa servir un model. Classifica\'l pel model que el descriu millor.',
        categories: ['Concurrent', 'Paral·lel', 'Distribuït'],
        elements: [
          { text: 'Un ordinador d\'un sol nucli on escoltes música mentre escrius', correcta: 'Concurrent', perque: 'Un sol nucli: les tasques s\'alternen tan de pressa que semblen simultànies.' },
          { text: 'Un servidor amb una CPU d\'un nucli que atén diversos clients alternant-los', correcta: 'Concurrent', perque: 'Molts clients progressen alhora, però mai dos al mateix instant.' },
          { text: 'L\'exemple 6: tres processos fills de 2 s que acaben en uns 2 s en una CPU de 8 nuclis', correcta: 'Paral·lel', perque: 'Cada fill va en un nucli i s\'executen realment al mateix temps.' },
          { text: 'Comprimir un vídeo fent servir els 8 nuclis del portàtil', correcta: 'Paral·lel', perque: 'Una sola màquina, diversos nuclis treballant a l\'instant.' },
          { text: 'Una màquina amb 4 nuclis que recalcula quatre fulls de càlcul alhora', correcta: 'Paral·lel', perque: 'Quatre tasques, quatre nuclis, al mateix instant.' },
          { text: 'Una botiga en línia amb el web a un servidor i la base de dades a un altre', correcta: 'Distribuït', perque: 'Màquines diferents que es parlen per xarxa.' },
          { text: 'Un projecte de càlcul científic que reparteix feina a milers d\'ordinadors voluntaris', correcta: 'Distribuït', perque: 'El cas extrem: moltes màquines connectades per Internet.' },
          { text: 'Un videojoc multijugador on cada jugador té el seu ordinador i hi ha un servidor central', correcta: 'Distribuït', perque: 'Processos en màquines diferents coordinats per xarxa.' },
        ],
        pista: 'Una màquina i un nucli: concurrent. Una màquina i diversos nuclis treballant alhora: paral·lel. Diverses màquines: distribuït.',
      },
      {
        tipus: 'aparellar',
        titol: 'Repte 2B · El balanç',
        enunciat: 'Per a cada frase, digues si és un avantatge o un inconvenient i de quin model.',
        columnes: [
          { nom: 'Tipus', opcions: ['Avantatge', 'Inconvenient'] },
          { nom: 'Model', opcions: ['Paral·lel', 'Distribuït', 'Tots dos'] },
        ],
        files: [
          { text: 'Acabar abans aprofitant tots els nuclis de la màquina', correctes: ['Avantatge', 'Paral·lel'], perque: 'És el que vam mesurar a l\'exemple 6: de 6 s a 2 s.' },
          { text: 'Si una de les màquines cau, les altres poden continuar treballant', correctes: ['Avantatge', 'Distribuït'], perque: 'Repartir en màquines permet tolerar que una falli.' },
          { text: 'Créixer afegint més ordinadors quan una sola màquina ja no dona l\'abast', correctes: ['Avantatge', 'Distribuït'], perque: 'Escalar en horitzontal.' },
          { text: 'Enviar les dades per la xarxa afegeix latència', correctes: ['Inconvenient', 'Distribuït'], perque: 'Comunicar-se entre màquines sempre és més lent que dins d\'una.' },
          { text: 'Una màquina pot fallar a mitja feina i deixar el sistema a mitges', correctes: ['Inconvenient', 'Distribuït'], perque: 'Les fallades parcials: la cara fosca del distribuït.' },
          { text: 'Cal sincronitzar les tasques quan comparteixen dades', correctes: ['Inconvenient', 'Tots dos'], perque: 'Tant si són al mateix ordinador com si no, si comparteixen dades s\'han de coordinar.' },
          { text: 'Apareixen errors que només passen de tant en tant i costen de reproduir', correctes: ['Inconvenient', 'Tots dos'], perque: 'L\'ordre d\'execució canvia cada vegada: el mateix programa pot fallar un cop de cada cent.' },
        ],
        pista: 'Latència i fallades parcials només existeixen quan hi ha xarxa pel mig.',
      },
      {
        tipus: 'quiz',
        titol: 'Repte 2C · Prova de càrrega',
        enunciat: 'Quatre preguntes per tornar a repartir la feina entre nuclis.',
        preguntes: [
          {
            pregunta: 'Amb un ordinador d\'un sol nucli, què pots tenir?',
            opcions: ['Concurrència, però no paral·lelisme', 'Paral·lelisme, però no concurrència', 'Totes dues coses', 'Cap de les dues'],
            correcta: 0,
            perque: 'Les tasques s\'alternen, però mai n\'hi ha dues al mateix instant.',
          },
          {
            pregunta: 'Quina frase és certa?',
            opcions: [
              'Tot programa paral·lel és concurrent, però no al revés',
              'Tot programa concurrent és paral·lel',
              'Concurrent i paral·lel són sinònims',
              'Un programa distribuït no pot ser concurrent',
            ],
            correcta: 0,
            perque: 'El paral·lelisme és un cas particular de concurrència: la que passa de debò al mateix instant.',
          },
          {
            pregunta: 'A l\'exemple 6, tres tasques de 2 s llançades en paral·lel triguen uns 2 s i no 6. Per què no exactament 2,0 s?',
            opcions: [
              'Perquè crear cada procés i arrencar-ne la JVM també té un cost',
              'Perquè el paral·lelisme sempre duplica el temps',
              'Perquè el planificador espera que acabi la primera',
              'Perquè Java només fa servir un nucli',
            ],
            correcta: 0,
            perque: 'Vam mesurar 2,15 s: el que hi ha per sobre de 2 és el cost de crear i arrencar els processos.',
          },
          {
            pregunta: 'Quin d\'aquests problemes és propi del distribuït i no del paral·lel en una sola màquina?',
            opcions: ['La latència de la xarxa', 'La necessitat de sincronitzar', 'Els errors difícils de reproduir', 'El canvi de context'],
            correcta: 0,
            perque: 'Sense xarxa no hi ha latència de xarxa.',
          },
        ],
        pista: 'Concurrent és el concepte ampli; paral·lel és el cas en què passa de debò al mateix temps.',
      },
    ],
    fragment: { posicio: 2, lletra: 'E' },
    missatgeFinal: 'Repartidor de càrrega en marxa: els nuclis tornen a treballar alhora.',
  },

  // ------------------------------------------------------------------ NUCLI 3
  {
    id: 3,
    codi: 'NUCLI 3',
    nom: 'ServiHub v0',
    lloc: 'Sessió 1 · L\'entorn i el primer procés fill',
    sistema: 'Llançador de processos fills',
    icona: '❯_',
    transmissio: [
      'Nucli 3. El Rei Zombi ha esborrat ServiHub v0, el primer programa que llançava un procés fill.',
      'Recorda com estava muntat el projecte i torna a escriure App.java peça a peça.',
    ],
    teoria: [
      {
        titol: 'L\'entorn del mòdul',
        html: `<ul>
<li><strong>Java 21</strong> (JDK LTS): el llenguatge de tot el mòdul.</li>
<li><strong>IntelliJ IDEA</strong>: l'editor. Executes una classe amb el triangle verd ▶ al costat del <code>main</code>.</li>
<li><strong>Maven</strong>: organitza el projecte i les dependències. El projecte és <code>cat.pratfp:servihub</code>, amb el fitxer <code>pom.xml</code> a l'arrel i el codi a <code>src/main/java</code>.</li>
<li><strong>Git</strong> i el repositori del mòdul a GitHub, amb <strong>un paquet per sessió</strong>: <code>cat.pratfp.servihub.sessio1</code>, <code>sessio2</code>…</li>
</ul>
<p><strong>ServiHub</strong> és el fil conductor: una plataforma de serveis que creix versió a versió. La v0 llança un procés; la v1 (PR1) en llançarà molts.</p>`,
      },
      {
        titol: 'App.java, tros a tros',
        html: `<p>El primer programa del mòdul: un procés Java que en llança un altre (<code>java -version</code>), en llegeix el que escriu i n'obté el codi de retorn.</p>`,
        codi: `public static void main(String[] args) throws IOException, InterruptedException {
    System.out.println("Sóc el procés " + ProcessHandle.current().pid());

    ProcessBuilder pb = new ProcessBuilder("java", "-version");
    pb.redirectErrorStream(true);

    Process p = pb.start();
    System.out.println("He llançat el procés " + p.pid());

    try (BufferedReader lector = new BufferedReader(new InputStreamReader(p.getInputStream()))) {
        String linia;
        while ((linia = lector.readLine()) != null) {
            System.out.println("  fill> " + linia);
        }
    }

    int codi = p.waitFor();
    System.out.println("Codi de retorn: " + codi);
}`,
        linies: [
          { codi: 'throws IOException, InterruptedException', explica: 'start() pot fallar si el programa no existeix (IOException) i waitFor() es pot interrompre mentre espera (InterruptedException).' },
          { codi: 'ProcessHandle.current().pid()', explica: 'El PID del nostre propi procés, el pare.' },
          { codi: 'new ProcessBuilder("java", "-version")', explica: 'Prepara l\'ordre. L\'executable i cada argument van separats, mai en una sola cadena.' },
          { codi: 'pb.redirectErrorStream(true)', explica: 'java -version escriu per la sortida d\'error. Així la fusionem amb l\'estàndard i la llegim per un sol flux.' },
          { codi: 'Process p = pb.start()', explica: 'Ara sí que es crea el fill. A partir d\'aquí hi ha dos processos vius.' },
          { codi: 'p.getInputStream()', explica: 'Des del pare, és el flux per LLEGIR el que el fill escriu.' },
          { codi: 'while ((linia = lector.readLine()) != null)', explica: 'Llegeix fins que el fill tanca la sortida (readLine torna null).' },
          { codi: 'int codi = p.waitFor()', explica: 'Espera que el fill acabi i en retorna el codi. Va DESPRÉS de llegir: si el fill omple la memòria intermèdia i ningú no la buida, es bloqueja.' },
        ],
      },
    ],
    ideaClau: 'ProcessBuilder prepara (ordre i arguments separats), start() crea el fill, getInputStream() llegeix el que escriu, i waitFor() espera i dona el codi de retorn: 0 és èxit. Primer llegir, després esperar.',
    proves: [
      {
        tipus: 'completar',
        titol: 'Repte 3A · Reescriu ServiHub v0',
        enunciat: 'El Rei Zombi ha fet forats a App.java. Torna-hi a posar el que falta perquè llanci java -version i n\'obtingui el codi.',
        fitxer: 'src/main/java/cat/pratfp/servihub/sessio1/App.java',
        codi: `public static void main(String[] args) throws IOException, InterruptedException {
    System.out.println("Sóc el procés " + [[0]]);

    ProcessBuilder pb = new ProcessBuilder([[1]]);
    pb.[[2]](true);

    Process p = pb.[[3]]();

    try (BufferedReader lector = new BufferedReader(new InputStreamReader(p.[[4]]()))) {
        String linia;
        while ((linia = lector.readLine()) != null) {
            System.out.println("  fill> " + linia);
        }
    }

    int codi = p.[[5]]();
    System.out.println("Codi de retorn: " + codi);
}`,
        buits: [
          { opcions: ['ProcessHandle.current().pid()', 'Process.pid()', 'Thread.currentThread().pid()', 'System.getPid()'], correcta: 'ProcessHandle.current().pid()', perque: 'ProcessHandle.current() és el nostre procés; pid() en dona l\'identificador.' },
          { opcions: ['"java", "-version"', '"java -version"', '"java" + "-version"', 'new String[]{"java -version"}'], correcta: '"java", "-version"', perque: 'Cada argument per separat. Amb "java -version" junt, el sistema buscaria un programa que es digués així.' },
          { opcions: ['redirectErrorStream', 'inheritIO', 'redirectOutput', 'environment'], correcta: 'redirectErrorStream', perque: 'redirectErrorStream(true) fusiona la sortida d\'error amb l\'estàndard. java -version escriu per error.' },
          { opcions: ['start', 'run', 'exec', 'waitFor'], correcta: 'start', perque: 'start() crea el procés fill i retorna un Process.' },
          { opcions: ['getInputStream', 'getOutputStream', 'getErrorStream', 'inputReader'], correcta: 'getInputStream', perque: 'Per llegir el que ESCRIU el fill, el pare fa servir getInputStream(). (Amb redirectErrorStream, l\'error també hi arriba.)' },
          { opcions: ['waitFor', 'exitValue', 'join', 'destroy'], correcta: 'waitFor', perque: 'waitFor() bloqueja fins que el fill acaba i retorna el codi. exitValue() fallaria si encara no ha acabat.' },
        ],
        pista: 'El PID és de ProcessHandle; els arguments van separats; el flux per llegir el fill és el d\'entrada del pare.',
      },
      {
        tipus: 'sequencia',
        titol: 'Repte 3B · L\'ordre d\'arrencada',
        enunciat: 'Ordena els passos que fa ServiHub v0. Compte: n\'hi ha dos que no hi han de ser.',
        inici: 'MAIN COMENÇA',
        final: 'MAIN ACABA',
        missatgeOk: 'Seqüència restaurada. ServiHub v0 torna a llançar el seu fill.',
        codi: true,
        ordre: [
          'Mostrar el PID propi amb ProcessHandle.current().pid()',
          'Crear el ProcessBuilder amb "java", "-version"',
          'Fusionar la sortida d\'error amb redirectErrorStream(true)',
          'Llançar el fill amb start()',
          'Llegir línia a línia el getInputStream()',
          'Esperar el final amb waitFor()',
          'Mostrar el codi de retorn',
        ],
        intrusos: [
          { text: 'Cridar waitFor() just després de start(), abans de llegir', perque: 'Si el fill escriu molt i ningú no buida la memòria intermèdia, el fill es bloqueja i waitFor() no torna mai.' },
          { text: 'Cridar exitValue() abans de start()', perque: 'Abans de start() no hi ha cap procés: ni tan sols tens un Process.' },
        ],
        pista: 'Primer preparar, després llançar, després llegir i, només al final, esperar.',
      },
      {
        tipus: 'quiz',
        titol: 'Repte 3C · Revisió de codi',
        enunciat: 'Cinc preguntes sobre per què ServiHub v0 està escrit així.',
        preguntes: [
          {
            pregunta: 'Què retorna aquest codi si el fill acaba bé?',
            codi: 'int codi = p.waitFor();',
            opcions: ['0', '1', '-1', 'true'],
            correcta: 0,
            perque: 'Per conveni, 0 vol dir èxit i qualsevol altre valor, error.',
          },
          {
            pregunta: 'Per què fem redirectErrorStream(true) amb java -version?',
            opcions: [
              'Perquè java -version escriu la versió per la sortida d\'error',
              'Perquè sense això el procés no arrenca',
              'Perquè així el fill acaba abans',
              'Perquè waitFor() només funciona amb la sortida fusionada',
            ],
            correcta: 0,
            perque: 'Si només llegíssim getInputStream() sense fusionar, no veuríem res.',
          },
          {
            pregunta: 'Per què el main declara throws InterruptedException?',
            opcions: [
              'Perquè waitFor() pot ser interromput mentre espera',
              'Perquè start() sempre llança aquesta excepció',
              'Perquè el procés fill pot acabar amb error',
              'Perquè readLine() la llança en arribar al final',
            ],
            correcta: 0,
            perque: 'Qualsevol mètode que bloqueja esperant (waitFor, sleep, join) la pot llançar.',
          },
          {
            pregunta: 'On és el pom.xml del projecte Maven ServiHub?',
            opcions: ['A l\'arrel del projecte', 'Dins de src/main/java', 'Dins del paquet sessio1', 'A la carpeta target/'],
            correcta: 0,
            perque: 'El pom.xml descriu el projecte i va a l\'arrel; el codi va a src/main/java.',
          },
          {
            pregunta: 'Quin d\'aquests és el PID del fill?',
            codi: 'Process p = pb.start();',
            opcions: ['p.pid()', 'ProcessHandle.current().pid()', 'pb.pid()', 'Thread.currentThread().getId()'],
            correcta: 0,
            perque: 'ProcessHandle.current() és el pare; el Process que torna start() és el fill. ProcessBuilder no té PID: només és la recepta.',
          },
        ],
        pista: 'Torna a mirar la taula «tros a tros» del manual.',
      },
    ],
    fragment: { posicio: 3, lletra: 'R' },
    missatgeFinal: 'ServiHub v0 restaurat: el pare torna a llançar el seu fill i en recull el codi.',
  },

  // ------------------------------------------------------------------ NUCLI 4
  {
    id: 4,
    codi: 'NUCLI 4',
    nom: 'El llançador',
    lloc: 'Sessió 2 · ProcessHandle, start() i waitFor()',
    sistema: 'Monitor de processos i codis de retorn',
    icona: '⇪',
    transmissio: [
      'Nucli 4. El monitor de processos està cec: no veu el sistema i no sap si els fills han acabat bé o malament.',
      'Recorda com es mira el sistema amb ProcessHandle i quins tres finals pot tenir un llançament.',
    ],
    teoria: [
      {
        titol: 'Mirar el sistema amb ProcessHandle',
        html: `<p><code>ProcessHandle</code> dona informació i control dels processos del sistema, també dels que no hem llançat nosaltres. Moltes dades tornen dins d'un <code>Optional</code>, perquè el sistema no sempre les deixa veure.</p>`,
        codi: `ProcessHandle jo = ProcessHandle.current();
System.out.println("PID: " + jo.pid());
System.out.println("Ordre: " + jo.info().command().orElse("?"));
System.out.println("Pare: " + jo.parent().map(p -> p.pid()).orElse(-1L));

long total = ProcessHandle.allProcesses().count();`,
        linies: [
          { codi: 'ProcessHandle.current()', explica: 'El nostre propi procés.' },
          { codi: 'jo.info().command()', explica: 'La ruta de l\'executable. És un Optional<String>: orElse("?") posa un valor si no se sap.' },
          { codi: 'jo.parent()', explica: 'El procés pare, també dins d\'un Optional (pot no existir o no ser visible).' },
          { codi: 'ProcessHandle.allProcesses()', explica: 'Un Stream amb tots els processos visibles: es pot filtrar, ordenar i comptar.' },
        ],
      },
      {
        titol: 'Tres finals possibles d\'un llançament',
        html: `<p>A l'exemple 2 vam llançar tres ordres amb el mateix mètode <code>executa</code>:</p>
<ul>
<li><code>java -version</code>: arrenca, va bé i retorna <strong>0</strong>.</li>
<li><code>java -opcio-inventada</code>: arrenca, però falla i retorna un codi <strong>diferent de 0</strong> (va donar 1).</li>
<li><code>programa-que-no-existeix</code>: <strong>ni tan sols arrenca</strong>. No hi ha codi de retorn: <code>start()</code> llança una <code>IOException</code>.</li>
</ul>
<p>Són dos errors diferents: un codi ≠ 0 vol dir «el fill ha funcionat i ha dit que ha fallat»; una <code>IOException</code> vol dir «no hi ha hagut fill».</p>`,
        codi: `static int executa(String... ordre) throws IOException, InterruptedException {
    ProcessBuilder pb = new ProcessBuilder(ordre);
    pb.inheritIO();
    Process p = pb.start();
    int codi = p.waitFor();
    if (codi != 0) {
        System.out.println("[avís] el procés ha acabat amb error (" + codi + ")");
    }
    return codi;
}`,
        linies: [
          { codi: 'String... ordre', explica: 'Paràmetre variable: es pot cridar amb tants textos com calgui (executable i arguments).' },
          { codi: 'pb.inheritIO()', explica: 'El fill fa servir la mateixa consola que el pare: el que escriu surt directament a pantalla, i no cal llegir-ne els fluxos.' },
          { codi: 'p.waitFor()', explica: 'Bloqueja fins que el fill acaba i en retorna el codi.' },
          { codi: 'if (codi != 0)', explica: 'Qualsevol codi diferent de 0 és un error del fill.' },
        ],
      },
    ],
    ideaClau: 'ProcessHandle mira el sistema (PID, ordre, pare, tots els processos), sovint amb Optional. Un llançament pot acabar amb codi 0 (bé), amb codi ≠ 0 (el fill ha fallat) o amb IOException (no hi ha hagut fill).',
    proves: [
      {
        tipus: 'aparellar',
        titol: 'Repte 4A · El manual del monitor',
        enunciat: 'Relaciona cada crida amb el que fa o el que retorna.',
        codi: true,
        columnes: [
          {
            nom: 'Què fa o què retorna',
            opcions: [
              'El PID d\'un procés',
              'La ruta de l\'executable, dins d\'un Optional',
              'El procés pare, dins d\'un Optional',
              'Un Stream amb tots els processos visibles',
              'Crea el procés fill i retorna un Process',
              'Espera el final i retorna el codi',
              'El codi de retorn, només si ja ha acabat',
              'true si el procés encara s\'està executant',
              'El fill escriu directament a la consola del pare',
            ],
          },
        ],
        files: [
          { text: 'p.pid()', correctes: ['El PID d\'un procés'], perque: 'Tant ProcessHandle com Process tenen pid().' },
          { text: 'jo.info().command()', correctes: ['La ruta de l\'executable, dins d\'un Optional'], perque: 'info() agrupa dades com l\'ordre, l\'usuari o l\'hora d\'inici, totes opcionals.' },
          { text: 'jo.parent()', correctes: ['El procés pare, dins d\'un Optional'], perque: 'Pot ser que el pare ja no existeixi o no sigui visible.' },
          { text: 'ProcessHandle.allProcesses()', correctes: ['Un Stream amb tots els processos visibles'], perque: 'A l\'exemple 1 en comptàvem el total i en tràiem els cinc més antics.' },
          { text: 'pb.start()', correctes: ['Crea el procés fill i retorna un Process'], perque: 'ProcessBuilder és la recepta; start() la cuina.' },
          { text: 'p.waitFor()', correctes: ['Espera el final i retorna el codi'], perque: 'Bloqueja el fil que la crida fins que el fill acaba.' },
          { text: 'p.exitValue()', correctes: ['El codi de retorn, només si ja ha acabat'], perque: 'Si encara és viu, llança IllegalThreadStateException.' },
          { text: 'p.isAlive()', correctes: ['true si el procés encara s\'està executant'], perque: 'No bloqueja: només pregunta.' },
          { text: 'pb.inheritIO()', correctes: ['El fill escriu directament a la consola del pare'], perque: 'Hereta l\'entrada, la sortida i l\'error del pare.' },
        ],
        pista: 'waitFor espera; exitValue no espera i falla si és d\'hora; isAlive només pregunta.',
      },
      {
        tipus: 'quiz',
        titol: 'Repte 4B · Endevina el final',
        enunciat: 'Mirant el mètode executa del manual, què passa en cada cas?',
        preguntes: [
          {
            pregunta: 'Què retorna aquesta crida?',
            codi: 'int codi = executa(Jvm.executable(), "-version");',
            opcions: ['0', '1', 'Llança IOException', 'null'],
            correcta: 0,
            perque: 'java -version arrenca i acaba bé.',
          },
          {
            pregunta: 'I aquesta?',
            codi: 'int codi = executa(Jvm.executable(), "-opcio-inventada");',
            opcions: [
              'Un codi diferent de 0 i el missatge «[avís] el procés ha acabat amb error»',
              '0, perquè la JVM ha arrencat',
              'Una IOException, perquè l\'opció no existeix',
              'Es queda penjat per sempre',
            ],
            correcta: 0,
            perque: 'La JVM arrenca, no reconeix l\'opció i acaba amb codi 1. Hi ha procés, per tant no hi ha IOException.',
          },
          {
            pregunta: 'I aquesta?',
            codi: 'executa("programa-que-no-existeix");',
            opcions: [
              'start() llança una IOException: no s\'arriba a crear cap fill',
              'Retorna 1',
              'Retorna 0 però no mostra res',
              'waitFor() llança InterruptedException',
            ],
            correcta: 0,
            perque: 'El sistema no troba l\'executable: no hi ha procés ni, per tant, codi de retorn.',
          },
          {
            pregunta: 'Què passa en aquest fragment, si el fill triga 5 segons?',
            codi: `Process p = pb.start();
int codi = p.exitValue();`,
            opcions: [
              'Llança IllegalThreadStateException, perquè el fill encara no ha acabat',
              'Espera els 5 segons i retorna el codi',
              'Retorna 0',
              'Retorna -1',
            ],
            correcta: 0,
            perque: 'exitValue() no espera: només dona el codi si ja hi és. Per esperar, waitFor().',
          },
          {
            pregunta: 'Per què info().command() retorna un Optional?',
            opcions: [
              'Perquè el sistema no sempre deixa veure l\'ordre d\'un procés',
              'Perquè un procés pot tenir diverses ordres',
              'Perquè així és més ràpid',
              'Perquè Java no pot llegir rutes de Windows',
            ],
            correcta: 0,
            perque: 'Per exemple, processos d\'un altre usuari o del sistema: per això fem orElse("?").',
          },
        ],
        pista: 'Codi ≠ 0: el fill ha existit i ha fallat. IOException: no hi ha hagut fill.',
      },
      {
        tipus: 'completar',
        titol: 'Repte 4C · Repara el mètode executa',
        enunciat: 'El Rei Zombi ha sabotejat el mètode que fan servir tots els llançaments. Repara\'l.',
        fitxer: 'sessio2/Ex2LlancaIEspera.java',
        codi: `static int executa(String... ordre) throws [[0]], InterruptedException {
    ProcessBuilder pb = new ProcessBuilder(ordre);
    pb.[[1]]();
    Process p = pb.start();
    System.out.println("[llançat PID " + [[2]] + "] " + String.join(" ", ordre));
    int codi = p.[[3]]();
    if (codi [[4]] 0) {
        System.out.println("[avís] el procés ha acabat amb error (" + codi + ")");
    }
    return codi;
}`,
        buits: [
          { opcions: ['IOException', 'FileNotFoundException', 'ProcessException', 'RuntimeException'], correcta: 'IOException', perque: 'start() llança IOException si no pot crear el procés. És el cas del programa que no existeix.' },
          { opcions: ['inheritIO', 'redirectErrorStream', 'directory', 'start'], correcta: 'inheritIO', perque: 'Amb inheritIO() el fill escriu a la nostra consola i no cal llegir-ne els fluxos.' },
          { opcions: ['p.pid()', 'pb.pid()', 'ProcessHandle.current().pid()', 'ordre.length'], correcta: 'p.pid()', perque: 'El PID del fill és el del Process que ha retornat start().' },
          { opcions: ['waitFor', 'exitValue', 'isAlive', 'destroy'], correcta: 'waitFor', perque: 'Cal esperar el final; exitValue() fallaria si el fill encara és viu.' },
          { opcions: ['!=', '==', '<', '>'], correcta: '!=', perque: 'Qualsevol codi diferent de 0 és error (pot ser 1, 2, 143…).' },
        ],
        pista: 'El PID és del fill, l\'espera és bloquejant i l\'error és «diferent de zero».',
      },
    ],
    fragment: { posicio: 4, lletra: 'N' },
    missatgeFinal: 'Monitor en línia: torna a veure el sistema i a llegir els codis de retorn.',
  },

  // ------------------------------------------------------------------ NUCLI 5
  {
    id: 5,
    codi: 'NUCLI 5',
    nom: 'Els fluxos',
    lloc: 'Sessió 2 · Sortida, error i temps màxim',
    sistema: 'Canals d\'entrada i sortida dels fills',
    icona: '⇄',
    transmissio: [
      'Nucli 5. Els canals entre pares i fills estan embussats: hi ha fills bloquejats esperant que algú els llegeixi i pares esperant per sempre.',
      'Repassa els tres fluxos d\'un procés, per què un fill es pot bloquejar i com no esperar mai indefinidament.',
    ],
    teoria: [
      {
        titol: 'Els tres fluxos, vistos des del pare',
        html: `<p>Els noms enganyen: estan pensats <strong>des del punt de vista del pare</strong>.</p>
<ul>
<li><code>p.getInputStream()</code>: el pare hi <strong>llegeix</strong> el que el fill escriu amb <code>System.out</code>.</li>
<li><code>p.getErrorStream()</code>: el pare hi <strong>llegeix</strong> el que el fill escriu amb <code>System.err</code>.</li>
<li><code>p.getOutputStream()</code>: el pare hi <strong>escriu</strong> i al fill li arriba per <code>System.in</code>.</li>
</ul>
<p>Entre pare i fill hi ha una <strong>memòria intermèdia</strong> (<em>buffer</em>) petita. Si el fill escriu molt i el pare no la buida, s'omple i el fill <strong>es bloqueja</strong> esperant lloc. Si a més el pare està fent <code>waitFor()</code>, s'esperen l'un a l'altre per sempre: un <strong>interbloqueig</strong>.</p>
<p>Solucions: llegir la sortida <strong>abans</strong> de <code>waitFor()</code>, llegir cada flux en un <strong>fil</strong> a part, fusionar-los amb <code>redirectErrorStream(true)</code>, enviar-los a un fitxer o fer <code>inheritIO()</code>.</p>`,
      },
      {
        titol: 'Exemple 3: un fil lector per a cada flux',
        html: `<p>Si vols la sortida i l'error per separat, no els pots llegir un darrere l'altre: mentre llegeixes el primer, el segon es pot omplir. L'exemple 3 posa un fil a llegir cadascun.</p>`,
        codi: `Process p = new ProcessBuilder(Jvm.ordre(Tasca.class, nom, "1")).start();

Thread fout = llegeixEnSegonPla(p.getInputStream(), "  [out] ");
Thread ferr = llegeixEnSegonPla(p.getErrorStream(), "  [ERR] ");

int codi = p.waitFor();
fout.join();
ferr.join();`,
        linies: [
          { codi: 'Jvm.ordre(Tasca.class, nom, "1")', explica: 'Construeix l\'ordre per executar la classe Tasca del mateix projecte com a procés fill.' },
          { codi: 'llegeixEnSegonPla(p.getInputStream(), …)', explica: 'Engega un fil que copia la sortida estàndard del fill a la consola.' },
          { codi: 'llegeixEnSegonPla(p.getErrorStream(), …)', explica: 'Un altre fil per a la sortida d\'error: tots dos es buiden alhora.' },
          { codi: 'p.waitFor()', explica: 'Ara sí que es pot esperar el fill: ningú no es quedarà bloquejat.' },
          { codi: 'fout.join(); ferr.join();', explica: 'Espera que els fils lectors hagin acabat de buidar els fluxos abans de continuar.' },
        ],
      },
      {
        titol: 'Exemple 4: no esperar mai per sempre',
        html: `<p><code>waitFor(temps, unitat)</code> espera com a molt aquell temps i retorna un <strong>booleà</strong>: <code>true</code> si el fill ha acabat a temps, <code>false</code> si no. Si no ha acabat, el matem en dos passos.</p>`,
        codi: `boolean haAcabat = p.waitFor(3, TimeUnit.SECONDS);

if (haAcabat) {
    System.out.println("Ha acabat amb codi " + p.exitValue());
} else {
    p.destroy();
    if (!p.waitFor(2, TimeUnit.SECONDS)) {
        p.destroyForcibly();
    }
    System.out.println("Viu? " + p.isAlive() + " · codi " + p.exitValue());
}`,
        linies: [
          { codi: 'p.waitFor(3, TimeUnit.SECONDS)', explica: 'Espera un màxim de 3 segons. No retorna el codi: retorna si ha acabat o no.' },
          { codi: 'p.exitValue()', explica: 'Aquí és segur: només hi arribem si el fill ja ha acabat.' },
          { codi: 'p.destroy()', explica: 'Petició educada d\'acabar: el fill pot tancar les seves coses.' },
          { codi: 'p.destroyForcibly()', explica: 'Si en 2 segons no ha fet cas, el matem a la força.' },
          { codi: 'p.isAlive()', explica: 'Comprovació final: ha de ser false.' },
        ],
      },
    ],
    ideaClau: 'Des del pare: getInputStream llegeix el System.out del fill, getErrorStream el System.err i getOutputStream escriu al seu System.in. Si ningú no buida els fluxos, el fill es bloqueja. waitFor(temps, unitat) retorna un booleà; si és false, destroy() i, si cal, destroyForcibly().',
    proves: [
      {
        tipus: 'classificar',
        titol: 'Repte 5A · Desembussa els canals',
        enunciat: 'Per a cada necessitat del pare, quin flux del Process ha de fer servir?',
        categories: ['getInputStream()', 'getErrorStream()', 'getOutputStream()'],
        elements: [
          { text: 'Llegir el que el fill escriu amb System.out.println', correcta: 'getInputStream()', perque: 'La sortida del fill és l\'entrada del pare.' },
          { text: 'Llegir les línies que ServiHub v0 mostra amb el prefix «fill>»', correcta: 'getInputStream()', perque: 'App.java llegeix getInputStream() (amb l\'error fusionat).' },
          { text: 'Llegir «malament: alguna cosa ha anat malament», que la Tasca escriu amb System.err', correcta: 'getErrorStream()', perque: 'És la sortida d\'error del fill.' },
          { text: 'Mostrar els missatges amb el prefix [ERR] a l\'exemple 3', correcta: 'getErrorStream()', perque: 'El segon fil lector llegeix aquest flux.' },
          { text: 'Enviar al fill una línia de text que llegirà amb un Scanner(System.in)', correcta: 'getOutputStream()', perque: 'El pare hi escriu; al fill li arriba per l\'entrada estàndard.' },
          { text: 'Passar dades al fill mentre s\'executa, sense fer servir arguments ni fitxers', correcta: 'getOutputStream()', perque: 'És el canal de pare a fill mentre el fill viu.' },
        ],
        pista: 'El nom és des del pare: input = el que entra al pare (surt del fill); output = el que surt del pare (entra al fill).',
      },
      {
        tipus: 'seleccionar',
        titol: 'Repte 5B · Els quatre sabotatges',
        enunciat: 'El Rei Zombi ha deixat aquest llançador ple de trampes: no compila, es pot penjar i pot petar. Marca les quatre línies amb error.',
        etiqueta: 'SABOTATGE',
        missatgeOk: 'Sabotatges neutralitzats! El llançador ja no deixa zombis.',
        codi: true,
        elements: [
          { sector: '1', text: 'ProcessBuilder pb = new ProcessBuilder("java -cp out Tasca lenta 10");', correcta: true, perque: 'Tota l\'ordre en una sola cadena: el sistema buscaria un programa amb aquest nom sencer. Cada argument va separat.' },
          { sector: '2', text: 'Process p = pb.start();', correcta: false, perque: 'Correcte.' },
          { sector: '3', text: 'BufferedReader r = new BufferedReader(new InputStreamReader(p.getOutputStream()));', correcta: true, perque: 'Per llegir el fill cal getInputStream(). getOutputStream() és per escriure-li (i ni tan sols compila: és un OutputStream).' },
          { sector: '4', text: 'String linia;', correcta: false, perque: 'Correcte.' },
          { sector: '5', text: 'while ((linia = r.readLine()) != null) System.out.println(linia);', correcta: false, perque: 'Correcte: llegeix fins que el fill tanca la sortida.' },
          { sector: '6', text: 'p.waitFor(3, TimeUnit.SECONDS);', correcta: true, perque: 'Ignora el booleà que retorna: no sabrem si ha acabat a temps o no.' },
          { sector: '7', text: 'System.out.println("Codi: " + p.exitValue());', correcta: true, perque: 'Si el fill no ha acabat en 3 s (la tasca en dura 10), exitValue() llança IllegalThreadStateException.' },
          { sector: '8', text: 'System.out.println("Viu? " + p.isAlive());', correcta: false, perque: 'Correcte: isAlive() no bloqueja ni falla.' },
        ],
        pista: 'Mira com es construeix l\'ordre, quin flux es llegeix i què fas amb el que retorna waitFor(3, …).',
      },
      {
        tipus: 'completar',
        titol: 'Repte 5C · El tallafoc del temps',
        enunciat: 'Completa l\'exemple 4 perquè cap fill no pugui segrestar el pare.',
        fitxer: 'sessio2/Ex4TempsMaxim.java',
        codi: `ProcessBuilder pb = new ProcessBuilder(Jvm.ordre(Tasca.class, "lenta", "10"));
pb.inheritIO();
Process p = pb.start();

[[0]] haAcabat = p.waitFor(3, [[1]]);

if (haAcabat) {
    System.out.println("Ha acabat amb codi " + p.exitValue());
} else {
    System.out.println("Temps esgotat: la mato");
    p.[[2]]();
    if (!p.waitFor(2, TimeUnit.SECONDS)) {
        p.[[3]]();
    }
    System.out.println("Viu? " + p.[[4]]() + " · codi " + p.exitValue());
}`,
        buits: [
          { opcions: ['boolean', 'int', 'Integer', 'void'], correcta: 'boolean', perque: 'waitFor amb temps no retorna el codi: retorna si ha acabat a temps.' },
          { opcions: ['TimeUnit.SECONDS', '3000', 'Duration.ofSeconds(3)', 'Thread.SECONDS'], correcta: 'TimeUnit.SECONDS', perque: 'La unitat del temps és un TimeUnit (de java.util.concurrent).' },
          { opcions: ['destroy', 'destroyForcibly', 'exit', 'interrupt'], correcta: 'destroy', perque: 'Primer la petició educada.' },
          { opcions: ['destroyForcibly', 'destroy', 'kill', 'stop'], correcta: 'destroyForcibly', perque: 'Si no fa cas, a la força.' },
          { opcions: ['isAlive', 'isRunning', 'waitFor', 'exitValue'], correcta: 'isAlive', perque: 'isAlive() diu si encara s\'executa sense bloquejar.' },
        ],
        pista: 'Booleà, TimeUnit, primer educat i després a la força.',
      },
      {
        tipus: 'quiz',
        titol: 'Repte 5D · Endevina la sortida',
        enunciat: 'Aquestes són sortides reals dels exemples 3 i 4. Raona què ha passat.',
        preguntes: [
          {
            pregunta: 'A l\'exemple 3, la Tasca «malament» escriu un missatge i fa System.exit(2). Què mostra el pare al final?',
            codi: 'System.out.println(nom + " -> codi " + codi + (codi == 0 ? " (correcte)" : " (ERROR)"));',
            opcions: ['malament -> codi 2 (ERROR)', 'malament -> codi 0 (correcte)', 'malament -> codi 1 (ERROR)', 'No mostra res: llança una excepció'],
            correcta: 0,
            perque: 'El codi que passa System.exit és el que rep waitFor().',
          },
          {
            pregunta: 'A l\'exemple 3, per què la línia «alguna cosa ha anat malament» surt amb el prefix [ERR]?',
            opcions: [
              'Perquè la Tasca l\'escriu amb System.err i la llegeix el fil de getErrorStream()',
              'Perquè conté la paraula «malament»',
              'Perquè el codi de retorn és 2',
              'Perquè redirectErrorStream(true) hi afegeix el prefix',
            ],
            correcta: 0,
            perque: 'Cada fil lector posa el seu prefix: [out] per a la sortida estàndard i [ERR] per a la d\'error.',
          },
          {
            pregunta: 'A l\'exemple 4, la tasca dura 10 segons però el pare només n\'espera 3. Quant triga el programa en total?',
            opcions: ['Uns 3 segons', 'Uns 10 segons', 'Uns 13 segons', 'No acaba mai'],
            correcta: 0,
            perque: 'Al cap de 3 s waitFor torna false, el pare fa destroy() i el fill mor de seguida. Vam mesurar «Temps total: 3 s».',
          },
          {
            pregunta: 'Després de destroy(), el codi de retorn del fill és diferent de 0 (a Linux, 143; a Windows, 1). Què vol dir?',
            opcions: [
              'Que el fill no ha acabat bé: l\'han aturat des de fora',
              'Que el fill ha acabat la feina correctament',
              'Que encara és viu',
              'Que destroyForcibly() ha fallat',
            ],
            correcta: 0,
            perque: 'Qualsevol codi ≠ 0 és un final anòmal. El número exacte depèn del sistema operatiu.',
          },
          {
            pregunta: 'Per què no n\'hi ha prou de llegir primer tota la sortida estàndard i després tota la d\'error, al mateix fil?',
            opcions: [
              'Perquè mentre llegeixes la primera, la memòria intermèdia de la segona es pot omplir i bloquejar el fill',
              'Perquè Java no permet llegir dos fluxos',
              'Perquè la sortida d\'error sempre arriba abans',
              'Perquè readLine() no funciona amb getErrorStream()',
            ],
            correcta: 0,
            perque: 'Per això l\'exemple 3 llegeix cada flux en el seu fil.',
          },
        ],
        pista: 'El codi de System.exit arriba a waitFor; cada fil posa el seu prefix; waitFor(3, …) talla als 3 s.',
      },
    ],
    fragment: { posicio: 5, lletra: 'E' },
    missatgeFinal: 'Canals desembussats: cap fill no espera ningú i cap pare no espera per sempre.',
  },

  // ------------------------------------------------------------------ NUCLI 6
  {
    id: 6,
    codi: 'NUCLI 6',
    nom: 'La granja de tasques',
    lloc: 'Sessió 2 · Entorn, fitxers i tasques en paral·lel',
    sistema: 'Planificador de tasques en paral·lel',
    icona: '⋮⋮',
    transmissio: [
      'Nucli 6, l\'últim. La granja de tasques treballa d\'una en una: el Rei Zombi l\'ha tornat seqüencial i ha barrejat els directoris i les variables d\'entorn.',
      'Recorda com es configura l\'entorn d\'un fill, on van les seves sortides i com es llancen moltes tasques alhora: l\'avantsala de ServiHub v1.',
    ],
    teoria: [
      {
        titol: 'Exemple 5: directori, entorn i fitxers',
        html: `<p>Un <code>ProcessBuilder</code> permet decidir <strong>on viu</strong> el fill, <strong>què veu</strong> de l'entorn i <strong>on van</strong> les seves sortides.</p>`,
        codi: `ProcessBuilder pb = new ProcessBuilder(Jvm.ordre(Mostrador.class));
pb.directory(carpeta.toFile());
pb.environment().put("SERVIHUB_MODE", "proves");
pb.redirectOutput(new File("sortida/mostrador.log"));
pb.redirectError(ProcessBuilder.Redirect.INHERIT);

int codi = pb.start().waitFor();`,
        linies: [
          { codi: 'pb.directory(carpeta.toFile())', explica: 'El directori de treball del fill: les rutes relatives que faci servir partiran d\'aquí.' },
          { codi: 'pb.environment().put(…)', explica: 'Afegeix una variable d\'entorn. És una còpia: només la veu el fill, no el pare ni el sistema.' },
          { codi: 'pb.redirectOutput(new File(…))', explica: 'La sortida estàndard del fill va a un fitxer, no a la consola. Ja no cal llegir-la.' },
          { codi: 'pb.redirectError(Redirect.INHERIT)', explica: 'La sortida d\'error, en canvi, surt a la consola del pare.' },
          { codi: 'pb.start().waitFor()', explica: 'Llança i espera en una sola línia.' },
        ],
      },
      {
        titol: 'Jvm.ordre: llançar classes del mateix projecte',
        html: `<p>Els fills dels exemples són classes del projecte (<code>Tasca</code>, <code>Mostrador</code>). <code>Jvm.ordre</code> construeix l'ordre amb el <strong>mateix executable java</strong> que fa servir el pare i el <strong>classpath absolut</strong>. Així funciona igual a Windows i a Linux, i el fill troba les classes encara que li canviem el directori de treball (amb un classpath relatiu, en canviar de directori, no les trobaria).</p>`,
        codi: `String cp = Path.of(System.getProperty("java.class.path")).toAbsolutePath().toString();
String[] base = {executable(), "-cp", cp, classe.getName()};`,
        linies: [
          { codi: 'System.getProperty("java.class.path")', explica: 'El classpath amb què s\'executa el pare.' },
          { codi: '.toAbsolutePath()', explica: 'El converteix en ruta absoluta: no depèn del directori de treball.' },
          { codi: '{executable(), "-cp", cp, classe.getName()}', explica: 'java -cp <ruta> cat.pratfp.servihub.sessio2.Tasca, amb cada peça separada.' },
        ],
      },
      {
        titol: 'Exemple 6: d\'una en una o totes alhora',
        html: `<p>La clau és <strong>on poses el <code>waitFor()</code></strong>.</p>`,
        codi: `// SEQÜENCIAL: llançar i esperar, tres vegades
for (String nom : new String[]{"A", "B", "C"}) {
    Process p = new ProcessBuilder(Jvm.ordre(Tasca.class, nom, "2")).inheritIO().start();
    p.waitFor();
}

// PARAL·LEL: primer llançar-les totes, després esperar-les totes
List<Process> fills = new ArrayList<>();
for (String nom : new String[]{"D", "E", "F"}) {
    fills.add(new ProcessBuilder(Jvm.ordre(Tasca.class, nom, "2")).inheritIO().start());
}
int errors = 0;
for (Process p : fills) {
    if (p.waitFor() != 0) errors++;
}`,
        linies: [
          { codi: 'p.waitFor() dins del primer for', explica: 'No es llança la següent fins que acaba l\'anterior: 3 × 2 s ≈ 6 s.' },
          { codi: 'fills.add(… .start())', explica: 'Es llancen les tres seguides i es guarden a una llista, sense esperar.' },
          { codi: 'for (Process p : fills) p.waitFor()', explica: 'Ara s\'esperen totes. Mentre esperes la primera, les altres ja treballen: ≈ 2 s.' },
          { codi: 'if (p.waitFor() != 0) errors++', explica: 'De passada, es compten les que han acabat amb error.' },
        ],
      },
    ],
    ideaClau: 'directory() fixa on viu el fill, environment() li dona variables només a ell i redirectOutput/redirectError decideixen on van les sortides. Per fer tasques en paral·lel: primer start() de totes, després waitFor() de totes.',
    proves: [
      {
        tipus: 'completar',
        titol: 'Repte 6A · Prepara el Mostrador',
        enunciat: 'Configura el fill de l\'exemple 5: que visqui a sortida/, que vegi SERVIHUB_MODE i que la seva sortida vagi a un fitxer.',
        fitxer: 'sessio2/Ex5EntornIFitxers.java',
        codi: `Path carpeta = Path.of("sortida");
Files.createDirectories(carpeta);

ProcessBuilder pb = new ProcessBuilder(Jvm.ordre(Mostrador.class));
pb.[[0]](carpeta.toFile());
pb.[[1]]().put("SERVIHUB_MODE", "proves");
pb.[[2]](new File("sortida/mostrador.log"));
pb.redirectError(ProcessBuilder.Redirect.[[3]]);

int codi = pb.start().waitFor();`,
        buits: [
          { opcions: ['directory', 'environment', 'path', 'cd'], correcta: 'directory', perque: 'directory(File) és el directori de treball del fill.' },
          { opcions: ['environment', 'getenv', 'properties', 'variables'], correcta: 'environment', perque: 'environment() retorna un Map amb les variables d\'entorn que tindrà el fill.' },
          { opcions: ['redirectOutput', 'redirectInput', 'redirectError', 'inheritIO'], correcta: 'redirectOutput', perque: 'La sortida ESTÀNDARD del fill cap al fitxer.' },
          { opcions: ['INHERIT', 'PIPE', 'DISCARD', 'FILE'], correcta: 'INHERIT', perque: 'INHERIT fa que l\'error surti a la consola del pare. PIPE el deixaria per llegir-lo, i DISCARD el llençaria.' },
        ],
        pista: 'On viu, què veu, on escriu… i l\'error, a la consola del pare.',
      },
      {
        tipus: 'aparellar',
        titol: 'Repte 6B · On va cada cosa?',
        enunciat: 'Relaciona cada necessitat amb la crida del ProcessBuilder que la resol.',
        columnes: [
          {
            nom: 'Crida',
            opcions: [
              'pb.directory(new File("dades"))',
              'pb.environment().put("MODE", "proves")',
              'pb.redirectOutput(new File("sortida.log"))',
              'pb.redirectOutput(ProcessBuilder.Redirect.appendTo(f))',
              'pb.redirectError(ProcessBuilder.Redirect.DISCARD)',
              'pb.redirectErrorStream(true)',
              'pb.inheritIO()',
            ],
          },
        ],
        files: [
          { text: 'Que el fill busqui els seus fitxers relatius a la carpeta dades/', correctes: ['pb.directory(new File("dades"))'], perque: 'El directori de treball del fill.' },
          { text: 'Que el fill sàpiga que s\'executa en mode de proves, sense tocar l\'entorn del pare', correctes: ['pb.environment().put("MODE", "proves")'], perque: 'Les variables d\'environment() són una còpia només per al fill.' },
          { text: 'Guardar la sortida del fill en un fitxer nou cada vegada', correctes: ['pb.redirectOutput(new File("sortida.log"))'], perque: 'Amb un File, el fitxer se sobreescriu.' },
          { text: 'Afegir la sortida al final d\'un registre que ja existeix', correctes: ['pb.redirectOutput(ProcessBuilder.Redirect.appendTo(f))'], perque: 'appendTo escriu al final sense esborrar el que hi havia.' },
          { text: 'Llençar els missatges d\'error del fill, que no ens interessen', correctes: ['pb.redirectError(ProcessBuilder.Redirect.DISCARD)'], perque: 'DISCARD els descarta: tampoc no omplen cap memòria intermèdia.' },
          { text: 'Llegir sortida i error barrejats per un sol flux', correctes: ['pb.redirectErrorStream(true)'], perque: 'És el que fa ServiHub v0 amb java -version.' },
          { text: 'Que tot el que escrigui el fill surti directament a la consola del pare', correctes: ['pb.inheritIO()'], perque: 'Hereta entrada, sortida i error.' },
        ],
        pista: 'Redirect.appendTo afegeix; un File sobreescriu; DISCARD llença; INHERIT/inheritIO van a la consola del pare.',
      },
      {
        tipus: 'sequencia',
        titol: 'Repte 6C · Torna a fer la granja paral·lela',
        enunciat: 'Ordena els passos per llançar tres tasques en paral·lel i comptar-ne els errors. Compte amb els dos intrusos.',
        inici: 'INICI',
        final: 'ESTADÍSTIQUES',
        missatgeOk: 'Granja paral·lela restaurada: tres tasques en uns 2 segons.',
        codi: true,
        ordre: [
          'Guardar l\'hora d\'inici: t0 = System.currentTimeMillis()',
          'Crear una llista buida: List<Process> fills = new ArrayList<>()',
          'Per a cada tasca: start() i afegir el Process a la llista',
          'Per a cada Process de la llista: waitFor() i comptar si el codi ≠ 0',
          'Calcular el temps total i mostrar-lo amb els errors',
        ],
        intrusos: [
          { text: 'Fer waitFor() just després de cada start(), dins del primer for', perque: 'Això és la versió seqüencial: no llançaries la següent fins que acabés l\'anterior.' },
          { text: 'Fer Thread.sleep(2000) en lloc d\'esperar els fills', perque: 'Dormir no és esperar: no saps si han acabat ni amb quin codi, i si una tasca triga més, la perds.' },
        ],
        pista: 'Primer llançar-les totes, després esperar-les totes.',
      },
      {
        tipus: 'quiz',
        titol: 'Repte 6D · La prova de rendiment',
        enunciat: 'Sortides reals dels exemples 5 i 6. Què ha passat?',
        preguntes: [
          {
            pregunta: 'L\'exemple 6 mostra això. Què vol dir?',
            codi: 'Seqüencial: 6.277 s · Paral·lel: 2.151 s · errors: 0',
            opcions: [
              'Que les tres tasques de 2 s, llançades alhora, han trigat el que en triga una',
              'Que el paral·lel ha fallat i per això és més curt',
              'Que la versió seqüencial té un error',
              'Que cada tasca dura 6 segons',
            ],
            correcta: 0,
            perque: '3 × 2 s ≈ 6 s una darrere l\'altra; en paral·lel ≈ 2 s més el cost d\'arrencar-les.',
          },
          {
            pregunta: 'A la part paral·lela, les línies de D, E i F surten barrejades i, si ho tornes a executar, en un altre ordre. Per què?',
            opcions: [
              'Perquè els tres processos s\'executen alhora i el planificador decideix qui escriu primer',
              'Perquè la llista fills les desordena',
              'Perquè inheritIO() barreja les línies a propòsit',
              'Perquè hi ha un error al codi',
            ],
            correcta: 0,
            perque: 'És normal en paral·lel: l\'ordre d\'execució no està garantit. Per això costen tant de depurar els errors concurrents.',
          },
          {
            pregunta: 'El Mostrador fa System.getenv("SERVIHUB_MODE"). Què escriu al fitxer?',
            opcions: ['SERVIHUB_MODE = proves', 'SERVIHUB_MODE = null', 'Res: getenv només funciona al pare', 'Llança una excepció'],
            correcta: 0,
            perque: 'La variable s\'ha posat a l\'environment() del fill abans de start().',
          },
          {
            pregunta: 'I si el pare, després de l\'exemple 5, fa System.getenv("SERVIHUB_MODE")?',
            opcions: ['null', 'proves', 'Una cadena buida', 'Depèn del fill'],
            correcta: 0,
            perque: 'environment() és una còpia per al fill: el pare no la veu.',
          },
          {
            pregunta: 'On surt la línia que el Mostrador escriu amb System.err?',
            codi: `pb.redirectOutput(new File("sortida/mostrador.log"));
pb.redirectError(ProcessBuilder.Redirect.INHERIT);`,
            opcions: ['A la consola del pare', 'Al fitxer mostrador.log', 'Enlloc', 'A un fitxer mostrador.err'],
            correcta: 0,
            perque: 'Només la sortida estàndard va al fitxer; l\'error s\'hereta.',
          },
        ],
        pista: 'En paral·lel l\'ordre no està garantit; environment() és només del fill; només l\'error s\'hereta.',
      },
    ],
    fragment: { posicio: 6, lletra: 'L' },
    missatgeFinal: 'Granja de tasques en paral·lel. Els sis nuclis tornen a funcionar: el kernel t\'espera.',
  },
];

export const PROVA_FINAL: ProvaQuiz = {
  tipus: 'quiz',
  titol: 'El Rei Zombi · combat final',
  enunciat: 'Cada resposta correcta és un pas per recollir-ne el codi de retorn. Cada error, un zombi nou a la taula.',
  preguntes: [
    {
      pregunta: 'El Rei Zombi és un procés que ha acabat però el seu pare no l\'ha esperat mai. Quina crida del pare n\'hauria recollit el codi?',
      opcions: ['p.waitFor()', 'p.isAlive()', 'pb.start()', 'ProcessHandle.current()'],
      correcta: 0,
      perque: 'waitFor() espera el final i recull el codi de retorn del fill.',
    },
    {
      pregunta: 'Quina diferència hi ha entre un programa i un procés?',
      opcions: [
        'El programa és el fitxer al disc; el procés és aquest programa en execució, amb PID i memòria pròpia',
        'Cap: són sinònims',
        'El procés és el fitxer i el programa és el que s\'executa',
        'Un programa sempre té diversos fils i un procés només un',
      ],
      correcta: 0,
      perque: 'Un sol programa pot donar molts processos.',
    },
    {
      pregunta: 'Una CPU d\'un sol nucli que alterna dues tasques tan de pressa que semblen simultànies fa…',
      opcions: ['Programació concurrent', 'Programació paral·lela', 'Programació distribuïda', 'Res: un nucli només pot fer una tasca'],
      correcta: 0,
      perque: 'Progressen alhora, però mai al mateix instant.',
    },
    {
      pregunta: 'Què falla aquí?',
      codi: 'new ProcessBuilder("java -version").start();',
      opcions: [
        'L\'ordre i l\'argument van junts: el sistema busca un programa que es digui «java -version»',
        'Falta cridar waitFor() abans de start()',
        'start() no existeix',
        'Res: és correcte',
      ],
      correcta: 0,
      perque: 'new ProcessBuilder("java", "-version").',
    },
    {
      pregunta: 'Un fill escriu molt i el pare fa waitFor() sense llegir-ne mai la sortida. Què pot passar?',
      opcions: [
        'La memòria intermèdia s\'omple, el fill es bloqueja i el pare espera per sempre',
        'El fill acaba més ràpid',
        'Java descarta la sortida automàticament',
        'waitFor() llegeix la sortida per tu',
      ],
      correcta: 0,
      perque: 'Interbloqueig: per això es llegeix abans, en fils a part, o es redirigeix.',
    },
    {
      pregunta: 'start() llança una IOException. Què ha passat?',
      opcions: [
        'No s\'ha pogut crear el procés: per exemple, l\'executable no existeix',
        'El fill ha acabat amb un codi diferent de 0',
        'El fill ha trigat massa',
        'El fill ha escrit per la sortida d\'error',
      ],
      correcta: 0,
      perque: 'IOException = no hi ha fill. Codi ≠ 0 = hi ha hagut fill i ha fallat.',
    },
    {
      pregunta: 'Què retorna aquesta crida?',
      codi: 'p.waitFor(3, TimeUnit.SECONDS)',
      opcions: [
        'true si el fill ha acabat dins dels 3 segons; false si no',
        'El codi de retorn del fill',
        'Els segons que ha trigat el fill',
        'Res: és void',
      ],
      correcta: 0,
      perque: 'Si és false, toca destroy() i, si cal, destroyForcibly().',
    },
    {
      pregunta: 'Des del pare, quin flux fas servir per llegir el que el fill escriu amb System.out?',
      opcions: ['p.getInputStream()', 'p.getOutputStream()', 'p.getErrorStream()', 'System.in'],
      correcta: 0,
      perque: 'Els noms van des del pare: el que surt del fill entra al pare.',
    },
    {
      pregunta: 'Últim pas. Per llançar deu tasques en paral·lel i saber quantes han fallat, on va el waitFor()?',
      opcions: [
        'En un segon bucle, després d\'haver-les llançat totes amb start()',
        'Just després de cada start(), dins del mateix bucle',
        'Enlloc: n\'hi ha prou amb un Thread.sleep()',
        'Abans de cada start()',
      ],
      correcta: 0,
      perque: 'Primer llançar-les totes, després esperar-les totes. És el cor de ServiHub v1.',
    },
  ],
  pista: 'Repassa la idea clau de cada nucli: waitFor, programa/procés, concurrent, arguments separats, buffer, IOException, waitFor amb temps, getInputStream i paral·lel.',
};

export const RANGS = [
  { minim: 90, nom: 'Administrador/a del kernel', text: 'Has engegat els sis nuclis i has tret el Rei Zombi de la taula. El RA1 és a les teves mans.' },
  { minim: 75, nom: 'Enginyer/a de sistemes', text: 'Partida molt sòlida: domines processos, fluxos i paral·lelisme.' },
  { minim: 55, nom: 'Operador/a del servidor', text: 'Servidor reiniciat. Repassa els nuclis on has perdut més vida.' },
  { minim: 35, nom: 'Procés en pràctiques', text: 'Ho has aconseguit, però amb esforç. Torna als recursos de les sessions 1 i 2.' },
  { minim: 0, nom: 'Procés orfe', text: 'Has guanyat amb molt poca vida. Torna a jugar i revisa el guió de la sessió 2 i els exemples del repositori.' },
];

export const CHECKLIST = [
  'Sé distingir programa, procés, fil i servei amb exemples reals.',
  'Sé dir en quin estat és un procés (nou, preparat, en execució, bloquejat, acabat) i què fa el planificador.',
  'Sé explicar la diferència entre concurrent, paral·lel i distribuït, i un avantatge i un inconvenient de cada model.',
  'Sé consultar els processos del sistema amb les eines del SO, amb jps i amb ProcessHandle.',
  'Sé llançar un procés amb ProcessBuilder, amb l\'ordre i els arguments separats.',
  'Sé distingir un codi de retorn diferent de 0 d\'una IOException en llançar.',
  'Sé llegir la sortida i l\'error d\'un fill sense que es bloquegi.',
  'Sé posar un temps màxim amb waitFor(temps, unitat) i aturar el fill amb destroy() i destroyForcibly().',
  'Sé configurar el directori, les variables d\'entorn i les redireccions d\'un fill.',
  'Sé llançar diverses tasques en paral·lel i esperar-les totes.',
];

/** Punts: cada repte dona 100 XP; cada error en treu i cada pista també. Les ratxes donen bonus. */
export const PUNTS = {
  pany: 100,
  error: 10,
  pista: 30,
  minimPany: 30,
  integritatError: 4,
  /** XP extra per repte superat en ratxa (es multiplica per la ratxa - 1, amb màxim). */
  bonusRatxa: 10,
  bonusRatxaMaxim: 50,
  /** Cada quants reptes perfectes seguits es guanya un escut. */
  escutCada: 3,
  escutsMaxims: 2,
};

/** Correu del docent al qual s'envia l'informe. */
export const CORREU_DOCENT = 'ilopez@pratfp.com';
