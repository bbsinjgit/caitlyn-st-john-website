/* Murmuration background
 * A flock of starlings that rolls and folds across a section, drawn on a
 * canvas behind its content. Adapted from the "Murmuration Wordmark" React
 * component as plain JavaScript.
 *
 * Usage: <div data-murmuration data-ink="#626033" data-word="walk & talk"> ... </div>
 * An optional child with [data-murmuration-band] marks the strip of "sky" the
 * flock lives in and where the word forms; without it the whole element is used.
 * The element gets a canvas behind its children. The pointer acts as a hawk
 * the flock parts around. Pauses off-screen; static for reduced motion.
 */
(function () {
  "use strict";

  function rng(seed) {
    var a = (seed >>> 0) || 1;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Divergence-free current: folds the flock without bunching or tearing it.
  function curl(x, y, t) {
    var a = 1.7 * x + t, b = 1.3 * y - 0.6 * t, c = 2.9 * y + 1.1 * x - 0.8 * t, d = 4.3 * x - 3.7 * y + 1.3 * t;
    var dpdx = 1.7 * Math.cos(a) * Math.cos(b) + 0.66 * Math.cos(c) - 1.505 * Math.sin(d);
    var dpdy = -1.3 * Math.sin(a) * Math.sin(b) + 1.74 * Math.cos(c) + 1.295 * Math.sin(d);
    return [dpdy, -dpdx];
  }

  // The flock's wandering centre, in unit space.
  function centre(t) {
    return [0.42 * Math.sin(t * 0.21) + 0.12 * Math.sin(t * 0.53 + 1), 0.16 * Math.sin(t * 0.33 + 2) - 0.08];
  }

  function start(root) {
    var ink = root.getAttribute("data-ink") || "#626033";
    var density = parseFloat(root.getAttribute("data-birds") || "1400");
    var showReeds = root.getAttribute("data-reeds") !== "false";
    var word = root.getAttribute("data-word") || "";
    var bandEl = root.querySelector("[data-murmuration-band]");
    var flyFor = 5, formFor = 2.4, holdFor = 3, releaseFor = 0.8;
    // Whole-flock speed: 1 is the original pace, 0.5 is half speed.
    var speed = parseFloat(root.getAttribute("data-speed") || "0.5");
    var font = '700 100px "Hanken Grotesk", "Segoe UI", system-ui, sans-serif';

    var canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;z-index:0";
    root.style.position = "relative";
    root.style.overflow = "hidden";
    root.style.isolation = "isolate";
    root.insertBefore(canvas, root.firstChild);
    for (var k = 0; k < root.children.length; k++) {
      var ch = root.children[k];
      if (ch !== canvas) { ch.style.position = "relative"; ch.style.zIndex = "1"; }
    }

    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var w = 1, h = 1, dpr = 1, n = 0, visible = true, reedLayer = null;
    var bandTop = 0, bandH = 1, tx = new Float32Array(0), ty = new Float32Array(0), target = new Int32Array(0);
    var px, py, vx, vy, depth, phase;
    var hx = -1e5, hy = -1e5, last = performance.now(), clock = 0;
    var rand = rng(11);

    function layout() {
      var r = root.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      if (bandEl) {
        var br = bandEl.getBoundingClientRect();
        bandTop = Math.max(0, br.top - r.top);
        bandH = Math.max(80, br.height);
      } else { bandTop = 0; bandH = h; }

      reedLayer = null;
      if (showReeds) {
        reedLayer = document.createElement("canvas");
        reedLayer.width = canvas.width;
        reedLayer.height = canvas.height;
        var s = reedLayer.getContext("2d");
        var g = rng(5);
        s.setTransform(dpr, 0, 0, dpr, 0, 0);
        s.strokeStyle = ink;
        s.fillStyle = ink;
        var base = h - 2;
        for (var x = -10; x < w + 10; x += 3 + g() * 10) {
          if (g() < 0.2) x += g() * 40;
          var tall = Math.pow(g(), 1.6) * Math.min(90, Math.max(34, h * 0.08)) + 8;
          var lean = (g() - 0.3) * 10;
          s.lineWidth = 0.6 + g() * 1.1;
          s.beginPath();
          s.moveTo(x, base + 2);
          s.quadraticCurveTo(x + lean * 0.3, base - tall * 0.6, x + lean, base - tall);
          s.stroke();
          if (g() < 0.06) {
            s.beginPath();
            s.ellipse(x + lean, base - tall - 4, 1.8, 6, lean * 0.04, 0, Math.PI * 2);
            s.fill();
          }
        }
      }

      var want = Math.round(Math.max(400, density * Math.min(1.2, (w * h) / (1440 * 860))));
      if (want !== n) {
        n = want;
        px = new Float32Array(n); py = new Float32Array(n);
        vx = new Float32Array(n); vy = new Float32Array(n);
        depth = new Float32Array(n); phase = new Float32Array(n);
        for (var i = 0; i < n; i++) {
          var a = rand() * Math.PI * 2, rr = Math.sqrt(rand());
          px[i] = w * 0.5 + Math.cos(a) * rr * w * 0.22;
          py[i] = bandTop + bandH * 0.5 + Math.sin(a) * rr * bandH * 0.35;
          depth[i] = 0.55 + rand() * 0.45;
          phase[i] = rand() * Math.PI * 2;
        }
      }

      // Sample the word into target points inside the band.
      var pts = [];
      if (word) {
        var m = document.createElement("canvas");
        m.width = w; m.height = Math.ceil(bandTop + bandH);
        var mc = m.getContext("2d", { willReadFrequently: true });
        mc.font = font;
        var ww = mc.measureText(word).width || 1;
        var size = Math.min(((w * 0.78) / ww) * 100, bandH * 0.62);
        mc.font = font.replace("100px", size + "px");
        mc.textAlign = "center";
        mc.textBaseline = "middle";
        mc.fillText(word, w / 2, bandTop + bandH * 0.52);
        var img = mc.getImageData(0, 0, m.width, m.height).data;
        var area = 0;
        for (var q = 3; q < img.length; q += 4) if (img[q] > 128) area++;
        var stepPx = Math.max(2, Math.round(Math.sqrt(area / (n * 0.9))));
        for (var yy = 0; yy < m.height; yy += stepPx)
          for (var xx = 0; xx < w; xx += stepPx)
            if (img[(yy * w + xx) * 4 + 3] > 128) pts.push(xx + (rand() - 0.5) * stepPx, yy + (rand() - 0.5) * stepPx);
      }
      tx = new Float32Array(pts.length / 2); ty = new Float32Array(pts.length / 2);
      for (var k2 = 0; k2 < tx.length; k2++) { tx[k2] = pts[k2 * 2]; ty[k2] = pts[k2 * 2 + 1]; }
      target = new Int32Array(n);
      if (tx.length) {
        var order = new Int32Array(tx.length), rr2 = rng(23);
        for (var o = 0; o < order.length; o++) order[o] = o;
        for (var o2 = order.length - 1; o2 > 0; o2--) { var j = Math.floor(rr2() * (o2 + 1)), tmp = order[o2]; order[o2] = order[j]; order[j] = tmp; }
        for (var b2 = 0; b2 < n; b2++) target[b2] = order[b2 % order.length];
      } else target.fill(-1);
    }

    function ease(k) { var x = k < 0 ? 0 : k > 1 ? 1 : k; return x * x * (3 - 2 * x); }
    function pullAt(c) {
      if (!tx.length) return 0;
      var cyc = flyFor + formFor + holdFor + releaseFor, tc = c % cyc;
      if (tc <= flyFor) return 0;
      if (tc <= flyFor + formFor) return ease((tc - flyFor) / formFor);
      if (tc <= flyFor + formFor + holdFor) return 1;
      return 1 - ease((tc - flyFor - formFor - holdFor) / releaseFor);
    }
    var pull = 0;

    function step(dt) {
      var u = Math.min(w, 900);
      var cen = centre(clock);
      pull = pullAt(clock);
      var free = 1 - pull;
      var cxp = w / 2 + cen[0] * w * 0.5;
      var cyp = bandTop + bandH * 0.5 + cen[1] * bandH * 0.9;
      var t = clock * 0.35;
      var hawk = hx > -1e4, hawkR = Math.min(w, h) * 0.16;
      for (var i = 0; i < n; i++) {
        var x = px[i], y = py[i];
        var cv = curl(((x - w / 2) / u) * 2.2 + depth[i] * 0.25, ((y - h / 2) / u) * 2.2, t);
        var ax = cv[0] * 420 * free, ay = cv[1] * 420 * free;
        var dxC = cxp - x, dyC = (cyp - y) * 1.6;
        var dC = Math.sqrt(dxC * dxC + dyC * dyC) / u;
        var hold = dC < 0.14 ? 0.15 : 0.15 + (dC - 0.14) * 6;
        ax += dxC * hold * 2.2 * free;
        ay += dyC * hold * 1.6 * free;
        var ti = target[i];
        if (pull > 0 && ti >= 0) {
          ax += (tx[ti] - x) * 9 * pull - vx[i] * 3.2 * pull;
          ay += (ty[ti] - y) * 9 * pull - vy[i] * 3.2 * pull;
        }
        if (hawk) {
          var dx = x - hx, dy = y - hy, d2 = dx * dx + dy * dy;
          if (d2 < hawkR * hawkR) {
            var d = Math.sqrt(d2) + 0.01, f = (1 - d / hawkR) * 5200;
            ax += (dx / d) * f;
            ay += (dy / d) * f;
          }
        }
        var nvx = (vx[i] + ax * dt) * (1 - 1.1 * dt);
        var nvy = (vy[i] + ay * dt) * (1 - 1.1 * dt);
        var sp = Math.sqrt(nvx * nvx + nvy * nvy);
        var cap = 520 + 380 * pull;
        if (sp > cap) { nvx = (nvx / sp) * cap; nvy = (nvy / sp) * cap; }
        vx[i] = nvx; vy[i] = nvy;
        px[i] = x + nvx * dt; py[i] = y + nvy * dt;
        phase[i] += dt * (9 + sp * 0.02);
      }
    }

    function draw() {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (reedLayer) { ctx.globalAlpha = 0.22; ctx.drawImage(reedLayer, 0, 0); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (var pass = 0; pass < 2; pass++) {
        ctx.beginPath();
        for (var i = 0; i < n; i++) {
          if ((pass === 1) !== (depth[i] > 0.78)) continue;
          var s = (1.6 + depth[i] * 2.2) * (1 - 0.35 * pull);
          var sp = Math.sqrt(vx[i] * vx[i] + vy[i] * vy[i]) + 0.001;
          var dx = vx[i] / sp, dy = vy[i] / sp;
          var flap = 0.55 + 0.45 * Math.sin(phase[i]);
          var wx = -dx * s, wy = -dy * s, nx = -dy * s * flap, ny = dx * s * flap;
          ctx.moveTo(px[i] + wx + nx, py[i] + wy + ny);
          ctx.lineTo(px[i], py[i]);
          ctx.lineTo(px[i] + wx - nx, py[i] + wy - ny);
        }
        ctx.strokeStyle = ink;
        ctx.globalAlpha = (pass === 0 ? 0.22 : 0.36) + pull * (pass === 0 ? 0.33 : 0.42);
        ctx.lineWidth = pass === 0 ? 0.9 : 1.2;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    function frame(now) {
      requestAnimationFrame(frame);
      if (!visible) { last = now; return; }
      var dt = Math.min(0.05, (now - last) / 1000) * speed;
      last = now;
      clock += dt;
      step(dt);
      draw();
    }

    layout();
    if (reduced) {
      // Settle the flock into a natural shape once, then draw it still.
      clock = flyFor + formFor + 0.1;
      for (var s = 0; s < 240; s++) { step(1 / 60); }
      draw();
      new ResizeObserver(function () { layout(); for (var s2 = 0; s2 < 240; s2++) step(1 / 60); draw(); }).observe(root);
      return;
    }
    root.addEventListener("pointermove", function (e) {
      var b = canvas.getBoundingClientRect();
      hx = e.clientX - b.left; hy = e.clientY - b.top;
    });
    root.addEventListener("pointerleave", function () { hx = -1e5; hy = -1e5; });
    new ResizeObserver(function () { layout(); }).observe(root);
    new IntersectionObserver(function (es) { visible = es[0] ? es[0].isIntersecting : true; }).observe(root);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
    requestAnimationFrame(frame);
  }

  function init() {
    var els = document.querySelectorAll("[data-murmuration]");
    for (var i = 0; i < els.length; i++) start(els[i]);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
