/* ============================================================
   Four small things. Nothing else runs on this page.
   1. Theme toggle
   2. Email reveal
   3. Fade sections in on scroll
   4. Reading progress bar
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- 1. Theme toggle ---------- */
  var btn = document.getElementById('themeToggle');

  function label () {
    if (!btn) return;
    var dark = root.getAttribute('data-theme') === 'dark';
    btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }
  label();

  if (btn) {
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      label();
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  /* ---------- 2. Email reveal ----------
     The address never appears in the HTML, so scrapers reading
     the page source find nothing. It is assembled here only
     when someone clicks.
     EDIT: change these two lines if your address changes. */
  var USER = ['nandika', 'djs'];
  var HOST = ['gmail', 'com'];

  document.querySelectorAll('[data-email]').forEach(function (el) {
    el.addEventListener('click', function () {
      var address = USER.join('') + String.fromCharCode(64) + HOST.join('.');
      var link = document.createElement('a');
      link.href = 'mailto:' + address;
      link.textContent = address;
      el.replaceWith(link);
    });
  });

  /* ---------- 3. Fade in on scroll ----------
     The intro block is above the fold and handles its own landing
     animation in CSS, so it is left out of this list. */
  var blocks = document.querySelectorAll('.section, .statement');

  if (reduced || !('IntersectionObserver' in window)) {
    blocks.forEach(function (b) { b.classList.add('shown'); });
  } else {
    blocks.forEach(function (b) { b.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('shown');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
    blocks.forEach(function (b) { io.observe(b); });
  }

  /* ---------- 4. Header state and progress bar ---------- */
  var header = document.getElementById('header');
  var bar = document.getElementById('progress');

  function onScroll () {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('stuck', y > 8);
    if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    markCurrent(y);
  }

  /* ---------- 5. Menu button, for narrow screens ---------- */
  var nav = document.getElementById('nav');
  var menuBtn = document.getElementById('menuToggle');

  function closeMenu () {
    if (!nav || !menuBtn) return;
    nav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
  }

  if (nav && menuBtn) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    // tapping a link closes the menu
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 760) closeMenu();
    });
  }

  /* ---------- 6. Highlight the section you are looking at ---------- */
  var navLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll('a')) : [];
  var targets = navLinks
    .map(function (a) {
      return { link: a, el: document.querySelector(a.getAttribute('href')) };
    })
    .filter(function (t) { return t.el; });

  function markCurrent (y) {
    if (!targets.length) return;
    var line = y + (window.innerHeight * 0.3);
    var active = null;
    for (var i = 0; i < targets.length; i++) {
      if (targets[i].el.offsetTop <= line) active = targets[i];
    }
    // nothing highlighted until the first section is reached
    if (y + window.innerHeight >= document.documentElement.scrollHeight - 4) {
      active = targets[targets.length - 1];
    }
    targets.forEach(function (t) {
      t.link.classList.toggle('current', t === active);
    });
  }

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ---------- 7. Network animation ----------
     Drifting nodes joined by short lines, with a signal that
     travels along an edge now and then. Plain canvas, no library.
     Tuning values are the four constants below. */
  var NODES     = 34;    // how many points
  var LINK_DIST = 108;   // px, how close before a line is drawn
  var SPEED     = 0.16;  // px per frame
  var PULSE_MS  = 900;   // how long a signal takes to cross an edge

  var canvas = document.getElementById('network');

  if (canvas) {
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, dpr = 1;
    var nodes = [];
    var pulse = null;
    var visible = true;
    var running = true;

    var colors = { line: '#b49bd0', dot: '#6d5385', warm: '#e2a7cf' };

    function readColors () {
      var cs = getComputedStyle(root);
      colors.line = cs.getPropertyValue('--accent-line').trim() || colors.line;
      colors.dot  = cs.getPropertyValue('--accent').trim() || colors.dot;
      colors.warm = cs.getPropertyValue('--accent-warm').trim() || colors.warm;
    }
    readColors();

    function seed () {
      nodes = [];
      for (var i = 0; i < NODES; i++) {
        var a = Math.random() * Math.PI * 2;
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: Math.cos(a) * SPEED,
          vy: Math.sin(a) * SPEED,
          r: 1.3 + Math.random() * 1.9
        });
      }
    }

    function resize () {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!nodes.length) seed();
    }
    resize();
    window.addEventListener('resize', function () { resize(); });

    // only animate while the section is on screen
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible && running && !reduced) requestAnimationFrame(frame);
      }, { threshold: 0 }).observe(canvas);
    }

    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
      if (running && visible && !reduced) requestAnimationFrame(frame);
    });

    // hex colour to rgba, so line opacity can vary with distance
    function rgba (hex, alpha) {
      var h = hex.replace('#', '');
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      var n = parseInt(h, 16);
      return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + alpha + ')';
    }

    function startPulse () {
      var pairs = [];
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          if (dx * dx + dy * dy < LINK_DIST * LINK_DIST) pairs.push([i, j]);
        }
      }
      if (!pairs.length) return;
      var pick = pairs[Math.floor(Math.random() * pairs.length)];
      pulse = { a: pick[0], b: pick[1], start: performance.now() };
    }

    function draw (now) {
      ctx.clearRect(0, 0, W, H);

      // lines
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var dx = nodes[i].x - nodes[j].x;
          var dy = nodes[i].y - nodes[j].y;
          var d2 = dx * dx + dy * dy;
          if (d2 > LINK_DIST * LINK_DIST) continue;
          var fade = 1 - Math.sqrt(d2) / LINK_DIST;
          ctx.strokeStyle = rgba(colors.line, fade * 0.5);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }

      // nodes
      for (var k = 0; k < nodes.length; k++) {
        ctx.fillStyle = rgba(colors.dot, 0.62);
        ctx.beginPath();
        ctx.arc(nodes[k].x, nodes[k].y, nodes[k].r, 0, Math.PI * 2);
        ctx.fill();
      }

      // travelling signal
      if (pulse) {
        var t = (now - pulse.start) / PULSE_MS;
        if (t >= 1) {
          pulse = null;
        } else {
          var A = nodes[pulse.a], B = nodes[pulse.b];
          var e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          var px = A.x + (B.x - A.x) * e;
          var py = A.y + (B.y - A.y) * e;
          var glow = Math.sin(t * Math.PI);
          ctx.fillStyle = rgba(colors.warm, glow);
          ctx.beginPath();
          ctx.arc(px, py, 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    function frame (now) {
      if (!running || !visible || reduced) return;

      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        n.x = Math.max(0, Math.min(W, n.x));
        n.y = Math.max(0, Math.min(H, n.y));
      }

      if (!pulse && Math.random() < 0.012) startPulse();

      draw(now);
      requestAnimationFrame(frame);
    }

    if (reduced) {
      draw(performance.now());          // one still frame, nothing moves
    } else {
      requestAnimationFrame(frame);
    }

    // keep the colours in step with the theme button
    if (btn) btn.addEventListener('click', function () {
      readColors();
      if (reduced) draw(performance.now());
    });
  }
})();