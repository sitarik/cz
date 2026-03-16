/* ============================================
   sitarik.cz — Definice příkazů terminálu
   Edituj tento soubor pro změnu obsahu a textů.
   ============================================ */

// ── MOTD — uvítání při otevření terminálu ──

var MOTD = [
  { t: '' },
  { t: '  ─────────────────────────────────────', c: 'dim' },
  { t: '  Vítej v terminálu Síťaříka.', c: 'accent' },
  { t: '  Napiš help — nebo to zkus po svém.', c: '' },
  { t: '  ─────────────────────────────────────', c: 'dim' },
  { t: '' },
];

// ── Data (načítají se asynchronně) ──

var LOG_POSTS = [];

// ── Příkazy ──

var COMMANDS = {};

COMMANDS['help'] = function () {
  function hl(cmd, desc, click) {
    var pad = Math.max(1, 16 - cmd.length);
    var sp  = '                '.slice(0, pad);
    return { t: '  ' + cmd + sp + desc, cmd: click || cmd };
  }
  return [
    { t: '' },
    { t: 'Dostupné příkazy:', c: 'accent' },
    { t: '' },
    hl('ping',          'ověř, jestli žiju',                   'ping'),
    hl('traceroute',    'kudy vedla moje cesta',               'traceroute'),
    hl('uptime',        'jak dlouho jsem u toho',              'uptime'),
    hl('neofetch',      'přehled v kostce',                    'neofetch'),
    hl('ifconfig',      'kde mě najdeš',                       'ifconfig'),
    hl('history',       'co jsem dělal, když se nikdo nedíval','history'),
    hl('top',           'co právě běží v hlavě',               'top'),
    hl('ls log/',       'záznamy ze síťařského terénu',        'ls log/'),
    hl('cat log/NÁZEV', 'přečti si záznam',                    'ls log/'),
    hl('games',         'seznam dostupných her',               'games'),
    hl('play <číslo>',  'spustit hru',                         'games'),
    hl('clear',         'vyčisti terminál',                    'clear'),
    hl('exit',          'zavřít terminál',                     'exit'),
    { t: '' },
    { t: 'Tip: zkus i příkazy, které tu nejsou.', c: 'dim' },
    { t: '' },
  ];
};

COMMANDS['--help'] = COMMANDS['help'];
COMMANDS['-h']     = COMMANDS['help'];

COMMANDS['ping'] = function () {
  return [
    { t: '' },
    { t: 'PING sitarik.cz (192.168.1.1): 56 bajtů', c: 'dim' },
    { t: '64 bajtů od sitarik.cz: ttl=64 čas=0.042ms', d: 300 },
    { t: '64 bajtů od sitarik.cz: ttl=64 čas=0.038ms', d: 300 },
    { t: '64 bajtů od sitarik.cz: ttl=64 čas=0.041ms', d: 300 },
    { t: '^C', c: 'error', d: 200 },
    { t: '--- sitarik.cz statistiky ---', c: 'dim' },
    { t: '3 pakety odeslány, 3 přijaty, 0% ztráta' },
    { t: '' },
    { t: 'Jo, žiju. Klidně piš dál.', c: 'success' },
    { t: '' },
  ];
};

COMMANDS['ping sitarik']    = COMMANDS['ping'];
COMMANDS['ping sitarik.cz'] = COMMANDS['ping'];

COMMANDS['traceroute'] = function () {
  return [
    { t: '' },
    { t: 'traceroute to sitarik.cz, max 30 hopů', c: 'dim' },
    { t: '' },
    { t: ' 1  prvni-pocitac.home       0.1ms   Pentium, Windows 98, a sen',             d: 400 },
    { t: ' 2  stredni-skola.lan        2.3ms   Tady to začalo — první patch kabel',      d: 400 },
    { t: ' 3  cisco-academy.edu        5.7ms   Packet Tracer otevřen, svět se změnil',   d: 400 },
    { t: ' 4  prvni-prace.corp        12.4ms   "Oprav nám síť" — "Jakou síť?"',          d: 400 },
    { t: ' 5  ccna-certified.net      18.2ms   Konečně papír na to, co už umím',         d: 400 },
    { t: ' 6  ucitel.edu              24.8ms   Plot twist: teď to učím ostatní',         d: 400 },
    { t: ' 7  servery-a-clustery.dc   31.5ms   Kde to prostě spadnout nesmí',            d: 400 },
    { t: ' 8  sitarik.cz              42.0ms   Tady jsem. Zatím.',                       d: 400 },
    { t: '' },
    { t: ' Trasa stále aktivní... TTL se zatím nesnížil.', c: 'dim' },
    { t: '' },
  ];
};

COMMANDS['traceroute career']     = COMMANDS['traceroute'];
COMMANDS['traceroute sitarik.cz'] = COMMANDS['traceroute'];

COMMANDS['neofetch'] = function () {
  return [
    { t: '' },
    { t: '   ____          sitarik@cz',           c: 'accent' },
    { t: '  / ___|         ─────────────────────', c: 'accent' },
    { t: '  \\___ \\         OS: SitarikOS 1.0 LTS' },
    { t: '   ___) |        Jádro: CCNA' },
    { t: '  |____/         Uptime: příliš dlouho' },
    { t: '                 Shell: bash (a občas PowerShell)' },
    { t: '                 Téma: tmavé (jako serverovna)' },
    { t: '                 Akcent: #8c52ff (barvy loga)' },
    { t: '                 Káva: 4.2 šálků/den' },
    { t: '                 Poslední výpadek: nechci o tom mluvit' },
    { t: '' },
  ];
};

COMMANDS['uptime'] = function () {
  var days = Math.floor((Date.now() - new Date('2005-09-01').getTime()) / (1000 * 60 * 60 * 24));
  return [
    { t: '' },
    { t: ' sitarik@cz — provozní statistiky', c: 'accent' },
    { t: ' ──────────────────────────────────' },
    { t: ' V IT:        ' + days + ' dní (a pořád mě to baví)' },
    { t: ' Káva:        neměřitelné množství' },
    { t: ' Kabely:      kilometry, možná víc' },
    { t: ' Výpadky:     byly. Nechci o tom.' },
    { t: ' Rebooty:     jen když to fakt nejde jinak' },
    { t: ' Load avg:    0.8 (pondělí) → 3.2 (pátek) → 0.1 (víkend)' },
    { t: '' },
  ];
};

COMMANDS['ifconfig'] = function () {
  return [
    { t: '' },
    { t: 'github0: flags=4163<UP,RUNNING>  mtu 1500', c: 'success' },
    { t: '    inet https://github.com/sitarik' },
    { t: '    popis: Kód, projekty a záloha rozumu' },
    { t: '' },
    { t: 'web0: flags=4163<UP,RUNNING>  mtu 1500', c: 'success' },
    { t: '    inet https://www.sitarik.cz' },
    { t: '    popis: Tady právě jsi' },
    { t: '' },
    { t: 'log0: flags=4163<UP,RUNNING>  mtu 1500', c: 'success' },
    { t: '    inet #log', cmd: 'ls log/' },
    { t: '    popis: Záznamy ze síťařského terénu' },
    { t: '' },
    { t: 'lo: flags=73<UP,LOOPBACK>  mtu 65536', c: 'dim' },
    { t: '    inet 127.0.0.1' },
    { t: '    popis: Někdy si povídám sám se sebou. A to je OK.' },
    { t: '' },
  ];
};

COMMANDS['ip a'] = COMMANDS['ifconfig'];

COMMANDS['history'] = function () {
  return [
    { t: '' },
    { t: '  1  2019-03-15 03:42  man why-is-ospf-not-converging',              c: 'dim' },
    { t: '  2  2020-01-10 08:15  apt install trpelivost',                       c: 'dim' },
    { t: '  3  2020-09-01 07:55  ssh ucebna@skola',                             c: 'dim' },
    { t: '  4  2021-06-30 16:00  echo "konečně prázdniny"',                     c: 'dim' },
    { t: '  5  2022-02-14 23:30  ping -c 1 laska.local',                        c: 'dim' },
    { t: '  6  2022-02-14 23:30  # Destination Host Unreachable',               c: 'error' },
    { t: '  7  2023-05-20 09:00  sudo apt install motivace',                    c: 'dim' },
    { t: '  8  2023-05-20 09:00  # E: Balíček "motivace" nenalezen',            c: 'error' },
    { t: '  9  2025-01-27 20:00  vim log/2025-01-27-netacad-vs-cisco-ccna.md',  c: 'dim' },
    { t: ' 10  2026-03-16 22:00  git push origin main  # nový web',             c: 'dim' },
    { t: '' },
  ];
};

// ── top — dynamický ──

var TOP_PROCESSES = [
  { name: 'vysvětlování-subnettingu',          timeOpts: ['∞', '8h/den', 'stále'] },
  { name: 'kontrola-kabeláže',                 timeOpts: ['8h/den', '4h', 'stále'] },
  { name: 'opakování-hesla-k-wifi',            timeOpts: ['stále', '∞', '24/7'] },
  { name: 'psaní-do-konzole',                  timeOpts: ['2h', '4h', 'právě teď'] },
  { name: 'pití-kávy',                         timeOpts: ['∞', 'stále', 'non-stop'],    c: 'yellow' },
  { name: 'zápis-do-logu',                     timeOpts: ['občas', 'zřídka', 'když musím'], c: 'dim' },
  { name: 'odpočinek',                         timeOpts: ['nikdy', '0ms', 'timeout'],   c: 'error' },
  { name: 'hledání-konce-kabelu',              timeOpts: ['2h', 'půl dne', '∞'] },
  { name: 'googlení-chybové-hlášky',           timeOpts: ['denně', 'stále', '4h'] },
  { name: 'vysvětlování-že-to-není-internet',  timeOpts: ['∞', 'stále', 'marně'] },
  { name: 'čekání-na-konvergenci-ospf',        timeOpts: ['40s', '5min', 'věčnost'] },
  { name: 'troubleshooting-dns',               timeOpts: ['vždy', '∞', 'je to vždy DNS'] },
  { name: 'dokumentování-sítě',                timeOpts: ['nikdy', '0ms', 'co to je?'], c: 'dim' },
  { name: 'ladění-firewallu',                  timeOpts: ['2h', '6h', 'do rána'],       c: 'yellow' },
  { name: 'resetování-hesel',                  timeOpts: ['denně', '3x/den', 'stále'] },
  { name: 'přesvědčování-vedení-o-rozpočtu',   timeOpts: ['marně', '∞', 'sisyfos'],     c: 'error' },
  { name: 'tahání-kabelů-pod-podlahou',        timeOpts: ['občas', 'nerad', '2h'] },
  { name: 'krimpování-konektorů',              timeOpts: ['1h', 'občas', 'nerad'] },
];

COMMANDS['top'] = function () {
  var shuffled = TOP_PROCESSES.slice().sort(function () { return 0.5 - Math.random(); });
  var procs = shuffled.slice(0, 7).map(function (p) {
    return {
      name: p.name,
      cpu:  parseFloat((Math.random() * 49.9 + 0.1).toFixed(1)),
      mem:  parseFloat((Math.random() * 34.8 + 0.2).toFixed(1)),
      time: p.timeOpts[Math.floor(Math.random() * p.timeOpts.length)],
      c:    p.c || '',
    };
  });
  procs.sort(function (a, b) { return b.cpu - a.cpu; });
  var running = Math.floor(Math.random() * 3) + 5;
  var output = [
    { t: '' },
    { t: '  PID  %CPU  %MEM  ČAS          PROCES', c: 'accent' },
    { t: '  ─────────────────────────────────────────────────────' },
  ];
  procs.forEach(function (p, i) {
    var pid  = ('    ' + (i + 1)).slice(-5);
    var cpu  = ('     ' + p.cpu.toFixed(1)).slice(-5);
    var mem  = ('     ' + p.mem.toFixed(1)).slice(-5);
    var time = (p.time + '            ').slice(0, 12);
    output.push({ t: pid + cpu + mem + '  ' + time + '  ' + p.name, c: p.c });
  });
  output.push({ t: '' });
  output.push({ t: '  Procesy: 7 celkem, ' + running + ' běží, ' + (7 - running) + ' spí', c: 'dim' });
  output.push({ t: '' });
  return output;
};

COMMANDS['htop'] = COMMANDS['top'];

COMMANDS['ls log/'] = function () {
  if (LOG_POSTS.length === 0) {
    return [{ t: '' }, { t: '  (načítám záznamy...)', c: 'dim' }, { t: '' }];
  }
  var lines = [{ t: '' }, { t: 'celkem ' + LOG_POSTS.length, c: 'dim' }, { t: '' }];
  LOG_POSTS.forEach(function (p) {
    var slug = p.file.replace('.md', '');
    lines.push({ t: '  ' + p.date + '   ' + p.title, c: 'accent', cmd: 'cat log/' + slug });
  });
  lines.push({ t: '' });
  lines.push({ t: '  Záznamy: ' + LOG_POSTS.length + '. Kvalita před kvantitou.', c: 'dim' });
  lines.push({ t: '' });
  return lines;
};

COMMANDS['ls log']   = COMMANDS['ls log/'];
COMMANDS['ls /log']  = COMMANDS['ls log/'];
COMMANDS['ls /log/'] = COMMANDS['ls log/'];
COMMANDS['dir log']  = COMMANDS['ls log/'];

COMMANDS['pwd'] = function () {
  return [{ t: '' }, { t: '/home/sitarik/web', c: 'accent' }, { t: '' }];
};

COMMANDS['ls'] = function () {
  return [{ t: '' }, { t: 'log/   games/   README.md   .bash_history   káva.sh', c: 'accent' }, { t: '' }];
};

COMMANDS['cat readme.md'] = function () {
  return [
    { t: '' },
    { t: '# sitarik.cz', c: 'accent' },
    { t: 'Osobní web Síťaříka. Terminál, co mluví česky.', c: 'dim' },
    { t: 'Přijímám pull requesty. A kávu.' },
    { t: '' },
  ];
};
COMMANDS['cat readme'] = COMMANDS['cat readme.md'];

COMMANDS['cat káva.sh'] = function () {
  return [
    { t: '' },
    { t: '#!/bin/bash',           c: 'dim' },
    { t: 'while true; do',        c: 'dim' },
    { t: '  echo "Vařím kávu..."',c: 'dim' },
    { t: '  sleep 3600',          c: 'dim' },
    { t: 'done',                  c: 'dim' },
    { t: '' },
    { t: '# Tento skript běží od roku 2005.', c: 'dim' },
    { t: '' },
  ];
};
COMMANDS['cat kava.sh'] = COMMANDS['cat káva.sh'];
COMMANDS['./káva.sh']   = COMMANDS['cat káva.sh'];

COMMANDS['uname']    = function () { return [{ t: '' }, { t: 'SitarikOS 1.0.0-síťařík #1 SMP Czech Republic x86_64 GNU/Linux' }, { t: '' }]; };
COMMANDS['uname -a'] = COMMANDS['uname'];

COMMANDS['date'] = function () {
  return [
    { t: '' },
    { t: '  ' + new Date().toLocaleString('cs-CZ') },
    { t: '  (Čas, kdy bys mohl dělat něco produktivního.)', c: 'dim' },
    { t: '' },
  ];
};

COMMANDS['nslookup sitarik.cz'] = function () {
  return [
    { t: '' },
    { t: ';; ANSWER SECTION:', c: 'dim' },
    { t: 'sitarik.cz.  3600  IN  A      "síťař, lektor"' },
    { t: 'sitarik.cz.  3600  IN  MX     "sitarik (zavináč) sitarik.cz"' },
    { t: 'sitarik.cz.  3600  IN  TXT    "Cisco nerd od roku 2005"' },
    { t: 'sitarik.cz.  3600  IN  AAAA   ::1 (lokální patriot)' },
    { t: '' },
  ];
};
COMMANDS['dig sitarik.cz'] = COMMANDS['nslookup sitarik.cz'];
COMMANDS['nslookup']       = COMMANDS['nslookup sitarik.cz'];

COMMANDS['cat /etc/motd'] = function () {
  return [
    { t: '' },
    { t: 'Dnešní moudro:', c: 'accent' },
    { t: '  Nikdy neměň konfiguraci v pátek odpoledne.', c: 'yellow' },
    { t: '' },
  ];
};
COMMANDS['motd'] = COMMANDS['cat /etc/motd'];

// ── Speciální odpovědi ──

var SUDO_RESPONSES = [
  'Hezký pokus. Tento incident byl nahlášen.',
  'Nejsi v souboru sudoers. Zkus to v ředitelně.',
  'Oprávnění odepřeno. Tady má root jen Síťařík.',
  'sudo: příkaz nenalezen v /usr/bin/odvaha',
  'sudo: Heslo správce? To je "cisco123". Ale seriózně — ne.',
];

var RM_RF_RESPONSES = [
  'Hezký pokus. Tenhle server má zálohy. Na rozdíl od tvého.',
  'rm: nelze odstranit — příliš tvrdohlavý souborový systém.',
  'Pěkně sis smazal /dev/null. Gratuluju, nic se nestalo.',
  'rm -rf /: klasika. Ale ne dnes.',
];

var EXIT_RESPONSES = [
  'Kam chceš jít? Venku jsou jen switche bez configu.',
  'Odejít? V tuhle hodinu? Pakety na tebe čekají.',
  'exit: Tohle není SSH. Tady jsi doma.',
];

var UNKNOWN_RESPONSES = [
  'Příkaz nenalezen. Ale oceňuji snahu. Zkus help.',
  'Tohle jsme nebrali. Ale příští hodinu můžeme.',
  'bash: netuším, co tím myslíš. A to je co říct.',
  'Neznámý příkaz. Ani Google ti nepomůže.',
  '404: Příkaz nenalezen. Jako většina mých ponožek.',
  'Příkaz nerozpoznán. Zkus to bez překlepů. Nebo s nimi.',
];

var EMPTY_ENTER_RESPONSES = [
  'Jestli stiskneš Enter ještě jednou, zavolám admina.',
  'Enter je příkaz, ne rytmus.',
  'Tohle není buben. Přestaň.',
  'Každý prázdný Enter sníží moje hodnocení.',
  'OK. Ale víš co? Zkus help.',
];

// ── Tab completion ──

var TAB_COMPLETIONS = [
  'help', 'ping', 'traceroute', 'uptime', 'neofetch', 'ifconfig',
  'history', 'top', 'clear', 'ls log/', 'cat log/', 'nslookup',
  'exit', 'date', 'uname', 'pwd', 'ls', 'motd', 'games',
];

// ── Načtení log/log.json ──

(function () {
  fetch('log/log.json')
    .then(function (r) { return r.json(); })
    .then(function (posts) {
      LOG_POSTS = posts || [];
      LOG_POSTS.forEach(function (p) {
        TAB_COMPLETIONS.push('cat log/' + p.file.replace('.md', ''));
      });
    })
    .catch(function () {});
})();
