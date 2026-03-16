/* ============================================
   sitarik.cz — Terminálový engine (overlay)
   Závislost: commands.js musí být načten první.
   ============================================ */

(function () {
  'use strict';

  var termOverlay   = document.getElementById('terminal-overlay');
  var termOutput    = document.getElementById('terminal-output');
  var termBody      = document.getElementById('terminal-body');
  var termInputLine = document.getElementById('terminal-input-line');
  var termInputText = document.getElementById('terminal-input-text');
  var termHidden    = document.getElementById('terminal-hidden-input');
  var termHudEl     = document.getElementById('terminal-hud');

  var cmdHistory = [], histIdx = -1;
  var currentInput = '';
  var emptyEnterCount = 0;

  // ── Game state ──

  var currentGameFile = null;
  var gameActive = false, gameData = null, gameScene = null;
  var gameInventory = [], gameStats = {};
  var usedOnce = [];

  // ── Helpers ──

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // ── Print ──

  function tPrint(text, cls) {
    var d = document.createElement('div');
    d.className = cls ? 'tl-' + cls : '';
    d.textContent = text || '';
    termOutput.appendChild(d);
    termBody.scrollTop = termBody.scrollHeight;
  }

  function tPrintLines(lines, callback) {
    var hasDelay = lines.some(function (l) { return l.d; });
    if (!hasDelay) {
      lines.forEach(function (l) {
        var d = document.createElement('div');
        d.className = l.c ? 'tl-' + l.c : '';
        if (l.h) { d.innerHTML = l.h; } else { d.textContent = l.t || ''; }
        if (l.cmd) {
          d.classList.add('tl-clickable');
          d.dataset.cmd = l.cmd;
        }
        termOutput.appendChild(d);
      });
      termBody.scrollTop = termBody.scrollHeight;
      if (callback) callback();
      return;
    }
    var i = 0;
    function next() {
      if (i >= lines.length) { if (callback) callback(); return; }
      var l = lines[i++];
      var d = document.createElement('div');
      d.className = l.c ? 'tl-' + l.c : '';
      if (l.h) { d.innerHTML = l.h; } else { d.textContent = l.t || ''; }
      if (l.cmd) { d.classList.add('tl-clickable'); d.dataset.cmd = l.cmd; }
      termOutput.appendChild(d);
      termBody.scrollTop = termBody.scrollHeight;
      setTimeout(next, l.d || 50);
    }
    next();
  }

  // ── HUD ──

  function updateHud() {
    if (!gameActive) { termHudEl.style.display = 'none'; return; }
    termHudEl.style.display = 'block';
    var hearts = '';
    for (var i = 0; i < gameStats.lives; i++) hearts += '❤ ';
    var inv = gameInventory.length ? '   │   ' + gameInventory.join(', ') : '';
    termHudEl.textContent = (hearts || '').trim() + (hearts ? '   ' : '') + 'XP: ' + gameStats.xp + inv;
  }

  // ── Terminal open/close ──

  function termOpen() {
    termOverlay.classList.add('open');
    termInputLine.style.display = 'flex';
    termHidden.focus();
    if (!termOutput.hasChildNodes()) {
      tPrintLines(MOTD);
    }
    termBody.scrollTop = termBody.scrollHeight;
  }

  function termClose() {
    termOverlay.classList.remove('open');
  }

  // ── Game engine ──

  function getChoices(scene) {
    return (scene.choices || []).filter(function (c) {
      return !(c.once && usedOnce.indexOf(gameScene + ':' + c.cmd) !== -1);
    });
  }

  function loadScene(sceneId) {
    gameScene = sceneId;
    var scene = gameData.scenes[sceneId];
    if (!scene) { tPrint('⚠ Scéna nenalezena: ' + sceneId, 'error'); return; }
    tPrint('');
    scene.text.split('\n').forEach(function (l) { tPrint(l, 'dim'); });
    if (scene.end) {
      tPrint('');
      tPrint('── KONEC HRY ──', 'success');
      tPrint('Celkem XP: ' + gameStats.xp, 'accent');
      tPrint('restart   nová hra   │   exit   zavřít terminál', 'dim');
      gameActive = false; updateHud(); return;
    }
    if (scene.dead) {
      tPrint('');
      tPrint('── GAME OVER ──', 'error');
      tPrint('restart   nová hra   │   exit   zavřít terminál', 'dim');
      gameActive = false; updateHud(); return;
    }
    var choices = getChoices(scene);
    if (choices.length) {
      tPrint('');
      tPrint('▸  ' + choices.map(function (c) { return c.cmd; }).join('   ▸  '), 'accent');
    }
  }

  function handleGameCmd(cmd) {
    var scene = gameData.scenes[gameScene];
    var choices = scene.choices || [];
    for (var i = 0; i < choices.length; i++) {
      var c = choices[i];
      if (c.cmd.toLowerCase() !== cmd) continue;
      var onceKey = gameScene + ':' + c.cmd;
      if (c.once && usedOnce.indexOf(onceKey) !== -1) continue;
      if (c.requires && gameInventory.indexOf(c.requires) === -1) {
        tPrint(c.missing || 'Nemůžeš to udělat.', 'error'); return;
      }
      if (c.requires_xp && gameStats.xp < c.requires_xp) {
        tPrint(c.missing || 'Nedostatek zkušeností.', 'error'); return;
      }
      if (c.gives) gameInventory.push(c.gives);
      if (c.xp)   gameStats.xp += c.xp;
      if (c.once) usedOnce.push(onceKey);
      if (c.lives) { gameStats.lives = Math.max(0, gameStats.lives + c.lives); }
      if (c.reply) tPrint(c.reply, 'dim');
      updateHud();
      loadScene(c.next);
      return;
    }
    var valid = getChoices(scene);
    tPrint('Neznámý příkaz.   ▸  ' + valid.map(function (c) { return c.cmd; }).join('   ▸  '), 'error');
  }

  function startGame(file) {
    tPrint('Načítám hru…', 'dim');
    fetch('games/' + file)
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (data) {
        currentGameFile = file;
        gameData = data;
        gameScene = data.start;
        gameInventory = [];
        gameStats = { xp: data.stats.xp, lives: data.stats.lives };
        usedOnce = [];
        gameActive = true;
        updateHud();
        tPrint('');
        tPrint('── ' + data.title.toUpperCase() + ' ──', 'accent');
        tPrint('inventar   seznam předmětů   │   exit   ukončit hru', 'dim');
        loadScene(data.start);
      })
      .catch(function () { tPrint('Chyba při načítání hry.', 'error'); });
  }

  // ── cat log/ ──

  function handleCatLog(slug) {
    var post = null;
    for (var i = 0; i < LOG_POSTS.length; i++) {
      var f = LOG_POSTS[i].file.replace('.md', '');
      if (f === slug || LOG_POSTS[i].file === slug) { post = LOG_POSTS[i]; break; }
    }
    if (!post) {
      tPrint('');
      tPrint('cat: log/' + slug + ': Soubor nenalezen', 'error');
      tPrint('  Zkus ls log/ pro seznam záznamů.', 'dim');
      tPrint('');
      return;
    }
    tPrint('');
    tPrint('── ' + post.title + ' ──', 'accent');
    tPrint('   ' + post.date, 'dim');
    tPrint('');
    fetch('log/' + post.file, { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw 0; return r.text(); })
      .then(function (md) {
        md.split('\n').forEach(function (line) {
          var cls = '';
          if      (line.startsWith('# '))   { line = line.slice(2);  cls = 'accent'; }
          else if (line.startsWith('## '))  { line = line.slice(3);  cls = 'accent'; }
          else if (line.startsWith('### ')) { line = line.slice(4);  cls = 'yellow'; }
          else if (line.startsWith('---'))  { line = '────────────────────────────────'; cls = 'dim'; }
          else if (line.startsWith('> ') || line.startsWith('- ')) { cls = 'dim'; }
          tPrint('  ' + line, cls);
        });
        tPrint('');
        termBody.scrollTop = termBody.scrollHeight;
      })
      .catch(function () { tPrint('  Chyba při načítání souboru.', 'error'); tPrint(''); });
  }

  // ── Command handler ──

  function handleCommand(raw) {
    var cmd = raw.trim();

    if (!cmd) {
      tPrint('sitarik@cz:~$', 'prompt-line');
      emptyEnterCount++;
      if (emptyEnterCount >= 5) {
        emptyEnterCount = 0;
        tPrint('');
        tPrint(pick(EMPTY_ENTER_RESPONSES), 'yellow');
        tPrint('');
      }
      return;
    }

    emptyEnterCount = 0;
    tPrint('sitarik@cz:~$ ' + cmd, 'prompt-line');
    cmdHistory.push(cmd);
    histIdx = -1;
    var low = cmd.toLowerCase();

    // restart (po konci hry)
    if (low === 'restart' && currentGameFile) { startGame(currentGameFile); return; }

    // herní příkazy
    if (gameActive) {
      if (low === 'exit') { gameActive = false; updateHud(); tPrint('Hra ukončena.', 'dim'); return; }
      if (low === 'inventar') {
        tPrint(gameInventory.length ? 'Inventář: ' + gameInventory.join(', ') : 'Inventář je prázdný.', 'dim');
        return;
      }
      handleGameCmd(low);
      return;
    }

    // built-in
    if (low === 'clear' || low === 'cls') { termOutput.innerHTML = ''; return; }
    if (low === 'exit' || low === 'quit') { termClose(); return; }

    // cat log/
    if (low.startsWith('cat log/')) { handleCatLog(cmd.slice(8).trim().replace('.md', '')); return; }

    // games
    if (low === 'games') {
      fetch('games/index.json')
        .then(function (r) { return r.json(); })
        .then(function (list) {
          tPrint('');
          tPrint('  Dostupné hry:', 'accent');
          list.forEach(function (g, i) {
            tPrint('  ' + (i + 1) + '   ' + g.title + '   — ' + g.desc, 'dim');
          });
          tPrint('');
          tPrint('  Spusť: play <číslo>', 'dim');
          tPrint('');
        })
        .catch(function () { tPrint('Chyba načítání her.', 'error'); });
      return;
    }

    var pm = low.match(/^play\s+(\d+)$/);
    if (pm) {
      var num = parseInt(pm[1]);
      fetch('games/index.json')
        .then(function (r) { return r.json(); })
        .then(function (list) {
          var g = list[num - 1];
          if (!g) { tPrint('Hra č. ' + num + ' neexistuje.', 'error'); return; }
          startGame(g.file);
        })
        .catch(function () { tPrint('Chyba načítání her.', 'error'); });
      return;
    }

    // COMMANDS objekt
    if (COMMANDS[low]) { tPrintLines(COMMANDS[low]()); return; }

    // speciální případy
    if (low.startsWith('sudo')) {
      tPrint(''); tPrint(pick(SUDO_RESPONSES), 'error'); tPrint(''); return;
    }
    if (low.indexOf('rm -rf') !== -1 || low.indexOf('rm -r /') !== -1) {
      tPrint(''); tPrint(pick(RM_RF_RESPONSES), 'error'); tPrint(''); return;
    }
    if (low === 'vim' || low === 'nano' || low === 'vi') {
      tPrint('');
      tPrint('Jak se ukončí vim? To je otázka za milion.', 'yellow');
      tPrint('  Tip: :q! a předstírej, že se nic nestalo.', 'dim');
      tPrint('');
      return;
    }
    if (low.startsWith('cd ')) {
      tPrint(''); tPrint('Nikam nejdeš. Tady je všechno, co potřebuješ.', 'dim'); tPrint(''); return;
    }
    if (low.startsWith('echo ')) {
      var msg = cmd.slice(5).replace(/['"]/g, '');
      tPrint(''); tPrint(msg || '...ticho.'); tPrint(''); return;
    }
    if (low === 'reboot' || low === 'shutdown' || low === 'poweroff') {
      tPrint(''); tPrint('Tohle si nedovoluj. Poslední restart trval 3 hodiny.', 'error'); tPrint(''); return;
    }
    if (low === 'man' || low.startsWith('man ')) {
      tPrint('');
      tPrint('Žádný manuál nenalezen.', 'yellow');
      tPrint('  Jako vždy. Kdo čte manuály?', 'dim');
      tPrint('');
      return;
    }
    if (low === 'ssh' || low.startsWith('ssh ')) {
      tPrint(''); tPrint('Připojení odmítnuto. Nejsem tvůj jump host.', 'error'); tPrint(''); return;
    }

    tPrint(''); tPrint(pick(UNKNOWN_RESPONSES), 'yellow'); tPrint('');
  }

  // ── Vstup ──

  function updateInput(val) {
    currentInput = val;
    termHidden.value = val;
    termInputText.textContent = val;
  }

  termHidden.addEventListener('input', function () {
    currentInput = termHidden.value;
    termInputText.textContent = currentInput;
  });

  termHidden.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      var val = currentInput;
      updateInput('');
      handleCommand(val);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        var newIdx = histIdx < cmdHistory.length - 1 ? histIdx + 1 : histIdx;
        histIdx = newIdx;
        updateInput(cmdHistory[cmdHistory.length - 1 - newIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx > 0) {
        histIdx--;
        updateInput(cmdHistory[cmdHistory.length - 1 - histIdx]);
      } else {
        histIdx = -1;
        updateInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      var val2 = currentInput.toLowerCase();
      for (var i = 0; i < TAB_COMPLETIONS.length; i++) {
        if (TAB_COMPLETIONS[i].startsWith(val2) && TAB_COMPLETIONS[i] !== val2) {
          updateInput(TAB_COMPLETIONS[i]);
          break;
        }
      }
    } else if (e.key === 'Escape') {
      termClose();
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      termOutput.innerHTML = '';
    }
  });

  // klik na output — klikatelné řádky (cmd) nebo focus inputu
  termOutput.addEventListener('click', function (e) {
    var el = e.target;
    if (el.classList.contains('tl-clickable') && el.dataset.cmd) {
      handleCommand(el.dataset.cmd);
    } else {
      termHidden.focus();
    }
  });

  termBody.addEventListener('click', function (e) {
    if (e.target === termBody) termHidden.focus();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === '`' && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault(); termOpen();
    }
    if (termOverlay.classList.contains('open') &&
        !e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1 &&
        document.activeElement !== termHidden) {
      termHidden.focus();
    }
  });

  termOverlay.addEventListener('click', function (e) {
    if (e.target === termOverlay) termClose();
  });

  document.getElementById('terminal-close-btn').addEventListener('click', termClose);
  document.getElementById('fake-prompt').addEventListener('click', termOpen);

})();
