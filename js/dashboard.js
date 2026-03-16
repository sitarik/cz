/* ============================================
   sitarik.cz — Dashboard (hodiny, tipy, gospel,
   markdown parser, log routing)
   ============================================ */

(function () {
  'use strict';

  // ── HODINY ──

  var CS_DAYS   = ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota'];
  var CS_MONTHS = ['ledna', 'února', 'března', 'dubna', 'května', 'června',
                   'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'];

  function updateClock() {
    var now = new Date();
    var h = ('0' + now.getHours()).slice(-2);
    var m = ('0' + now.getMinutes()).slice(-2);
    var s = ('0' + now.getSeconds()).slice(-2);
    document.getElementById('time').textContent = h + ':' + m + ':' + s;
    document.getElementById('date').textContent =
      CS_DAYS[now.getDay()] + ' ' + now.getDate() + '. ' +
      CS_MONTHS[now.getMonth()] + ' ' + now.getFullYear();
  }
  updateClock();
  setInterval(updateClock, 1000);

  // ── LAST LOGIN ──

  (function () {
    var stored = localStorage.getItem('sitarik-last-login');
    localStorage.setItem('sitarik-last-login', new Date().toLocaleString('cs-CZ'));
    document.getElementById('last-login').textContent = stored
      ? 'Last login: ' + stored
      : 'Last login: nikdy — vítej poprvé, Síťaříku.';
  })();

  // ── FOTO ──

  var fotos = [
    'assets/foto_sitarik_1.jpg',
    'assets/foto_sitarik_2.jpg',
    'assets/foto_sitarik_3.jpg',
    'assets/foto_sitarik_4.jpg',
  ];
  document.getElementById('left-photo').src =
    fotos[Math.floor(Math.random() * fotos.length)];

  // ── HELPERS ──

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function randOther(arr, current) {
    if (arr.length <= 1) return 0;
    var idx;
    do { idx = Math.floor(Math.random() * arr.length); } while (idx === current);
    return idx;
  }

  // ── TIPY ──

  var tips = [], tipIdx = 0;

  function renderTip() {
    if (!tips.length) return;
    var t = tips[tipIdx];
    document.getElementById('tip-label').textContent =
      'TIP DNE — SÍŤOVÝ FAKT #' + (tipIdx + 1) + ' Z ' + tips.length;
    document.getElementById('tip-content').innerHTML =
      '<div class="tip-cmd">' + esc(t.cmd) + '</div>' +
      '<div class="tip-desc">' + esc(t.desc) + '</div>' +
      '<div class="tip-cat">' + esc(t.cat) + '</div>';
  }

  document.getElementById('btn-tip').addEventListener('click', function () {
    tipIdx = randOther(tips, tipIdx);
    renderTip();
  });

  fetch('tips.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      tips = data;
      tipIdx = Math.floor(Math.random() * tips.length);
      renderTip();
    })
    .catch(function () {
      document.getElementById('tip-content').innerHTML =
        '<span style="color:var(--red)">Chyba načítání.</span>';
    });

  // ── GOSPEL ──

  var gospels = [], gospelIdx = 0;

  function renderGospel() {
    if (!gospels.length) return;
    var g = gospels[gospelIdx];
    var html =
      '<div class="dim-lines">' +
        g.lines.map(function (l) {
          return '<span class="gospel-line">' + esc(l) + '</span>';
        }).join('') +
      '</div>' +
      '<div class="gospel-verse">Ev. podle Síťaříka ' + g.n + '</div>';
    var label = 'NETWORK GOSPEL — VERŠ ' + g.n;
    document.getElementById('gospel-label').textContent = label;
    document.getElementById('gospel-content').innerHTML = html;
    document.getElementById('gospel-label-m').textContent = label;
    document.getElementById('gospel-content-m').innerHTML = html;
  }

  document.getElementById('btn-gospel').addEventListener('click', function () {
    gospelIdx = randOther(gospels, gospelIdx);
    renderGospel();
  });

  fetch('gospel.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      gospels = data;
      gospelIdx = Math.floor(Math.random() * gospels.length);
      renderGospel();
    })
    .catch(function () {
      document.getElementById('gospel-content').innerHTML =
        '<span style="color:var(--red)">Chyba načítání.</span>';
    });

  // ── MARKDOWN ──

  var mdImgBase = '';

  function inlineMd(text) {
    return esc(text)
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, function (_, alt, src) {
        var fullSrc = /^(https?:\/\/|\/)/.test(src) ? src : mdImgBase + src;
        if (/\.pdf$/i.test(src)) {
          return '<iframe src="' + fullSrc + '" style="width:100%;height:600px;border:1px solid var(--border);border-radius:6px;margin:12px 0 16px;display:block;"></iframe>' +
                 '<a href="' + fullSrc + '" target="_blank" style="font-size:0.82rem;color:var(--dim);">↓ stáhnout PDF</a>';
        }
        return '<img src="' + fullSrc + '" alt="' + alt + '">';
      })
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (_, label, href) {
        var fullHref = /^(https?:\/\/|\/)/.test(href) ? href : mdImgBase + href;
        return '<a href="' + fullHref + '" target="_blank">' + label + '</a>';
      })
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>');
  }

  var CALLOUT_ICONS = { INFO: 'ℹ️', TIP: '💡', WARNING: '⚠️', DANGER: '❌', PRIKAZ: '$', OTAZKA: '❓' };

  function renderMd(md) {
    var lines = md.split('\n'), html = '', inCode = false, listOpen = false, subListOpen = false, inTable = false, calloutOpen = false;

    function closeSubList() { if (subListOpen) { html += '</ul>\n'; subListOpen = false; } }
    function closeList()    { closeSubList(); if (listOpen) { html += '</ul>\n'; listOpen = false; } }
    function closeCallout() { if (calloutOpen) { html += '</span></div>\n'; calloutOpen = false; } }

    lines.forEach(function (line) {
      if (line.startsWith('```')) {
        if (inCode) { html += '</code></pre>\n'; inCode = false; }
        else { closeList(); if (inTable) { html += '</tbody></table>\n'; inTable = false; } html += '<pre><code>'; inCode = true; }
        return;
      }
      if (inCode) { html += esc(line) + '\n'; return; }

      // Tabulka
      if (line.startsWith('|')) {
        if (/^\|[\s:\-|]+\|$/.test(line)) return;
        var cells = line.split('|').slice(1, -1).map(function (c) { return c.trim(); });
        if (!inTable) {
          closeList();
          html += '<table><thead><tr>';
          cells.forEach(function (c) { html += '<th>' + inlineMd(c) + '</th>'; });
          html += '</tr></thead><tbody>\n';
          inTable = true;
        } else {
          html += '<tr>';
          cells.forEach(function (c) { html += '<td>' + inlineMd(c) + '</td>'; });
          html += '</tr>\n';
        }
        return;
      }
      if (inTable) { html += '</tbody></table>\n'; inTable = false; }

      // Odsazené odrážky (2. úroveň)
      var subItem = line.match(/^[ \t]{2,}[-*] (.*)/);
      if (subItem) {
        if (!listOpen) { html += '<ul>\n'; listOpen = true; }
        if (!subListOpen) { html += '<ul>\n'; subListOpen = true; }
        html += '<li>' + inlineMd(subItem[1]) + '</li>\n';
        return;
      }

      if (line.startsWith('- ') || line.startsWith('* ')) {
        closeSubList();
        if (!listOpen) { html += '<ul>\n'; listOpen = true; }
        html += '<li>' + inlineMd(line.slice(2)) + '</li>\n';
        return;
      }

      if (line.trim() !== '') closeList();

      if      (line.startsWith('# '))   { html += '<h1>' + inlineMd(line.slice(2)) + '</h1>\n'; }
      else if (line.startsWith('## '))  { html += '<h2>' + inlineMd(line.slice(3)) + '</h2>\n'; }
      else if (line.startsWith('### ')) { html += '<h3>' + inlineMd(line.slice(4)) + '</h3>\n'; }
      else if (line.startsWith('> ')) {
        var bContent = line.slice(2);
        var cm = bContent.match(/^\[!(INFO|TIP|WARNING|DANGER|PRIKAZ|OTAZKA)\]\s*(.*)/);
        if (cm) {
          closeCallout();
          var ctype = cm[1].toLowerCase();
          html += '<div class="callout callout-' + ctype + '"><span class="callout-icon">' + CALLOUT_ICONS[cm[1]] + '</span><span class="callout-body">';
          if (cm[2]) html += inlineMd(cm[2]);
          calloutOpen = true;
        } else if (calloutOpen) {
          if (bContent.trim()) html += '<br>' + inlineMd(bContent);
        } else {
          html += '<blockquote>' + inlineMd(bContent) + '</blockquote>\n';
        }
      }
      else if (line.startsWith('---') && line.trim().replace(/-/g,'') === '') { html += '<hr>\n'; }
      else if (line.trim() === '')      { closeCallout(); html += '<br>\n'; }
      else                              { html += '<p>' + inlineMd(line) + '</p>\n'; }
    });
    closeList();
    closeCallout();
    if (inTable) html += '</tbody></table>\n';
    if (inCode)  html += '</code></pre>\n';
    return html;
  }

  // ── LOG ROUTING ──

  var logPosts = [];

  function getRoute() {
    var hash = location.hash.slice(1);
    if (!hash || hash === '/') return 'dashboard';
    if (hash === 'log') return 'log-listing';
    if (hash.indexOf('log/') === 0) return 'log-post:' + hash.slice(4);
    return 'dashboard';
  }

  function navigate() {
    var route = getRoute();
    var dashboard = document.getElementById('view-dashboard');
    var logView   = document.getElementById('view-log');
    var listing   = document.getElementById('log-listing');
    var post      = document.getElementById('log-post');
    var scroll    = document.querySelector('.center-scroll');

    scroll.scrollTo(0, 0);

    if (route === 'dashboard') {
      dashboard.style.display = 'block';
      logView.style.display   = 'none';
    } else if (route === 'log-listing') {
      dashboard.style.display = 'none';
      logView.style.display   = 'block';
      listing.style.display   = 'block';
      post.style.display      = 'none';
      renderLogListing();
    } else if (route.indexOf('log-post:') === 0) {
      var slug = route.slice(9);
      dashboard.style.display = 'none';
      logView.style.display   = 'block';
      listing.style.display   = 'none';
      post.style.display      = 'block';
      loadLogPost(slug);
    }
  }

  function renderLogListing() {
    var el = document.getElementById('log-listing-entries');
    if (!logPosts.length) { el.innerHTML = '<span style="color:var(--dim)">žádné záznamy</span>'; return; }
    var html = '';
    logPosts.forEach(function (p) {
      var slug = p.file.replace('.md', '');
      html += '<a href="#log/' + encodeURIComponent(slug) + '" class="log-entry">';
      html += '<span class="log-entry-date">' + esc(p.date) + '</span>';
      html += '<span class="log-entry-title">' + esc(p.title) + '</span>';
      html += '<span class="log-entry-arrow">→</span>';
      html += '</a>';
    });
    html += '<div class="log-count">Záznamy: ' + logPosts.length + '. Kvalita před kvantitou.</div>';
    el.innerHTML = html;
  }

  function loadLogPost(slug) {
    var post = null;
    for (var i = 0; i < logPosts.length; i++) {
      if (logPosts[i].file.replace('.md', '') === slug) { post = logPosts[i]; break; }
    }
    var dateEl    = document.getElementById('log-post-date');
    var contentEl = document.getElementById('log-post-content');
    if (!post) {
      dateEl.textContent = '';
      contentEl.innerHTML = '<span style="color:var(--red)">Záznam nenalezen.</span>';
      return;
    }
    dateEl.textContent = post.date;
    contentEl.innerHTML = '<span style="color:var(--dim)">načítám…</span>';
    fetch('log/' + post.file, { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error(); return r.text(); })
      .then(function (md) { mdImgBase = 'log/'; contentEl.innerHTML = renderMd(md); mdImgBase = ''; })
      .catch(function ()  { contentEl.innerHTML = '<span style="color:var(--red)">Chyba při načítání článku.</span>'; });
  }

  window.addEventListener('hashchange', navigate);

  // ── LOG ──

  fetch('log/log.json')
    .then(function (r) { return r.json(); })
    .then(function (posts) {
      logPosts = posts || [];
      var el = document.getElementById('log-content');
      if (!logPosts.length) {
        el.innerHTML = '<span class="log-empty">žádné záznamy</span>';
        return;
      }
      el.innerHTML = '<ul class="ai-links">' +
        logPosts.slice(0, 3).map(function (post) {
          var slug = post.file.replace('.md', '');
          return '<li><a href="#log/' + encodeURIComponent(slug) + '">' +
                 esc(post.title) + '</a></li>';
        }).join('') +
        '</ul>';
      navigate();
    })
    .catch(function () {
      document.getElementById('log-content').innerHTML = '<span class="log-empty">—</span>';
      navigate();
    });

})();
