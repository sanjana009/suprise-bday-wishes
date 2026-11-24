(function () {
  var A = window.ALBUM || {}, $ = function (id) { return document.getElementById(id); };
  var photos = A.photos || [];
  var wishes = (A.wishes || []).map(function (w) { return typeof w === "string" ? w : (w.text || ""); });
  var nameEn = A.name || "Tatayya", nameTe = A.nameTe || "", age = Number(A.age) || 79;
  var greet = A.greetingTe == null ? "పుట్టినరోజు శుభాకాంక్షలు" : A.greetingTe;
  var RM = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  document.title = nameEn + " turns " + age;
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var S = [{ t: "title" }, { t: "count" }], wi = 0;
  photos.forEach(function (p, i) {
    S.push({ t: "photo", p: p, i: i });
    if (wi < wishes.length && Math.floor((i + 1) * wishes.length / photos.length) > Math.floor(i * wishes.length / photos.length)) S.push({ t: "wish", w: wishes[wi++] });
  });
  while (wi < wishes.length) S.push({ t: "wish", w: wishes[wi++] });
  S.push({ t: "end" });
  var N = S.length, LAST = N - 1;
  photos.forEach(function (p) { var i = new Image(); i.src = p.src; });

  var AC = null, master = null, hg = null, og = null, snd = true, unlocked = false;
  function ac() {
    if (!unlocked || !snd) return null;
    if (!AC) { var C = window.AudioContext || window.webkitAudioContext; if (!C) return null; AC = new C(); master = AC.createGain(); master.gain.value = 0.55; master.connect(AC.destination); hum(); }
    if (AC.state === "suspended") AC.resume();
    return AC;
  }
  function nz() { var b = AC.createBuffer(1, AC.sampleRate, AC.sampleRate), d = b.getChannelData(0), i; for (i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; }
  function hum() { // projector motor: gated noise at the film speed plus a low hum
    var n = AC.createBufferSource(); n.buffer = nz(); n.loop = true;
    var f = AC.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 1100; f.Q.value = 0.8;
    hg = AC.createGain(); hg.gain.value = 0;
    var lf = AC.createOscillator(); lf.frequency.value = 18; var lg = AC.createGain(); lg.gain.value = 0.02; lf.connect(lg); lg.connect(hg.gain);
    n.connect(f); f.connect(hg); hg.connect(master);
    var o = AC.createOscillator(); o.type = "sawtooth"; o.frequency.value = 50;
    var of = AC.createBiquadFilter(); of.type = "lowpass"; of.frequency.value = 180; og = AC.createGain(); og.gain.value = 0;
    o.connect(of); of.connect(og); og.connect(master); n.start(); lf.start(); o.start(); setHum(playing);
  }
  function setHum(on) { if (!AC || !hg) return; var t = AC.currentTime; hg.gain.setTargetAtTime(on ? 0.03 : 0, t, 0.25); og.gain.setTargetAtTime(on ? 0.02 : 0, t, 0.25); }
  function tone(f, d, type, v) {
    var a = ac(); if (!a) return; var o = a.createOscillator(), g = a.createGain(), t = a.currentTime;
    o.type = type || "sine"; o.frequency.value = f; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + d + 0.02);
  }
  function click(v, hp) {
    var a = ac(); if (!a) return; var s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(), t = a.currentTime;
    s.buffer = nz(); f.type = "highpass"; f.frequency.value = hp || 1500; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * 0.5, 0.06);
  }
  function thunk() { tone(70, 0.18, "sine", 0.5); click(0.35, 800); }
  function key() { click(0.25, 2500); tone(180, 0.03, "square", 0.03); }
  function tick() { tone(1000, 0.07, "square", 0.06); click(0.15, 3000); }
  function bell() { tone(1568, 0.9, "sine", 0.12); tone(2093, 0.7, "sine", 0.06); }
  function sndIcon() {
    $("snd").innerHTML = '<svg viewBox="0 0 24 24" width="12" height="12"><path d="M3 9v6h4l5 4V5L7 9z"/>' + (snd
      ? '<path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" stroke="#f1e4c8" fill="none" stroke-width="2" stroke-linecap="round"/>'
      : '<path d="M16 9l5 6M21 9l-5 6" stroke="#f1e4c8" fill="none" stroke-width="2" stroke-linecap="round"/>') + '</svg>';
  }

  var view = $("view"), prev = $("prev"), next = $("next"), playBtn = $("play"), ruler = $("ruler"), cp = $("cp"), cn = $("cn");

  var d = "", q;
  for (q = 0; q < 36; q++) d += '<i style="--x:' + (Math.random() * 100).toFixed(1) + '%;--s:' + (2 + Math.random() * 3).toFixed(1) + 'px;--o:' + (0.3 + Math.random() * 0.6).toFixed(2) + ';--dx:' + (Math.random() * 40 - 20).toFixed(0) + 'px;--t:' + (9 + Math.random() * 9).toFixed(1) + 's;--dl:-' + (Math.random() * 12).toFixed(1) + 's"></i>';
  if (!RM) $("fx").innerHTML = d;

  var ticks, rh = "", k;
  for (k = 0; k <= age; k++) rh += '<i' + (k % 10 === 0 ? ' class="t"' : '') + '></i>';
  ruler.innerHTML = rh; ticks = ruler.children;
  function mark(n) {
    var pos = Math.round(n / Math.max(1, LAST) * age), j;
    for (j = 0; j < ticks.length; j++) ticks[j].className = (j % 10 === 0 ? "t " : "") + (j === pos ? "now" : j < pos ? "on" : "");
  }

  var tm = [], timer = null, cur = -1, playing = true;
  function T(fn, ms) { tm.push(setTimeout(fn, ms)); }
  function clearT() { tm.forEach(clearTimeout); tm = []; }


  // little birthday touches in the same old-film palette
  var PAL = ["#dcb96c", "#c46a45", "#e8d9b8", "#8fa07a"], bi = 0;
  function bunting() {
    var p = "", i, t, x, y;
    for (i = 0; i < 10; i++) {
      t = (i + 0.5) / 10; x = t * 400; y = 4 + 48 * t * (1 - t);
      p += '<polygon points="' + (x - 11).toFixed(1) + "," + y.toFixed(1) + " " + (x + 11).toFixed(1) + "," + y.toFixed(1) + " " + x.toFixed(1) + "," + (y + 24).toFixed(1) + '" fill="' + PAL[i % 4] + '"/>';
    }
    return '<svg class="bunt" viewBox="0 0 400 44" preserveAspectRatio="none" aria-hidden="true"><path d="M0 4Q200 52 400 4" fill="none" stroke="#a89883" stroke-width="1.5"/>' + p + '</svg>';
  }
  function cake() {
    var c = "";
    [38, 50, 62].forEach(function (x, i) {
      c += '<path d="M' + x + ' 34V23" stroke="#1d1612" stroke-width="2.5" stroke-linecap="round"/><ellipse class="fl fl' + i + '" cx="' + x + '" cy="18" rx="3" ry="5" fill="#c8300f"/>';
    });
    return '<svg class="cake" viewBox="0 0 100 62" aria-hidden="true">' + c + '<rect x="16" y="34" width="68" height="22" rx="3" fill="none" stroke="#1d1612" stroke-width="2.5"/><path d="M16 42q6 6 11 0t11 0 11 0 11 0 11 0 11 0" fill="none" stroke="#1d1612" stroke-width="2"/></svg>';
  }
  function balloon(n) {
    var side = n % 2 ? "right:5%" : "left:5%", col = PAL[(n + 1) % 4];
    return '<svg class="bl" style="' + side + ';animation-delay:' + (0.3 + (n % 3) * 0.4).toFixed(1) + 's" viewBox="0 0 30 64" aria-hidden="true"><ellipse cx="15" cy="17" rx="12" ry="15" fill="' + col + '"/><path d="M12 31l3 4 3-4z" fill="' + col + '"/><path d="M15 35q-5 9 0 14t0 14" fill="none" stroke="#a89883" stroke-width="1.2"/></svg>';
  }
  function confetti() {
    var h = "", i;
    for (i = 0; i < 28; i++) h += '<i class="cf" style="left:' + (Math.random() * 100).toFixed(1) + '%;--w:' + (5 + Math.random() * 5).toFixed(0) + 'px;--c:' + PAL[i % 4] + ';--t:' + (5 + Math.random() * 4).toFixed(1) + 's;--d:' + (1.5 + Math.random() * 5).toFixed(1) + 's"></i>';
    return '<div class="confetti" aria-hidden="true">' + h + '</div>';
  }

  function build(s) {
    var el = document.createElement("div"); el.className = "slide " + s.t + (s.t === "wish" && /[\u0C00-\u0C7F]/.test(s.w) ? " te" : "");
    if (s.t === "title") {
      el.innerHTML = (greet ? '<p class="g">' + esc(greet) + '</p>' : '') + '<p class="' + (nameTe ? "nte" : "name") + '">' + esc(nameTe || nameEn) + '</p><p class="turns">turns ' + age + '</p><p class="line">' + esc(A.line) + '</p>';
      el.insertAdjacentHTML("beforeend", bunting());
    } else if (s.t === "count") {
      el.innerHTML = '<div class="oval"><b class="num">5</b></div><p class="lab"></p>' + cake();
    } else if (s.t === "photo") {
      var cap = s.p.caption || "";
      el.innerHTML = '<div class="ph f' + (s.i % 3) + '"><img alt=""></div>';
      var img = el.querySelector("img"), ph = el.querySelector(".ph");
      img.alt = cap;
      img.onerror = function () { ph.innerHTML = '<p class="miss">' + esc(s.p.src) + ' was not found.<br>Add the file to the photos folder and refresh.</p>'; };
      img.src = s.p.src;
    } else if (s.t === "wish") {
      var words = s.w.split(/\s+/), step = Math.min(0.28, 1.8 / Math.max(1, words.length));
      el.innerHTML = '<p class="wt' + (/[\u0C00-\u0C7F]/.test(s.w) ? ' te' : '') + '">' + words.map(function (w, i) {
        return '<span class="wd" style="animation-delay:' + (0.5 + i * step).toFixed(2) + 's">' + esc(w) + '</span> ';
      }).join("") + '</p>';
      el.insertAdjacentHTML("afterbegin", balloon(bi++));
    } else {
      var L = [[1, A.endFor || ""], [3, nameTe || nameEn], [5, greet || "Happy Birthday"], [6, A.closing || ""]];
      el.innerHTML = L.filter(function (x) { return x[1]; }).map(function (x, i) { return '<p class="c' + x[0] + (/[\u0C00-\u0C7F]/.test(x[1]) ? ' te' : '') + '" style="animation-delay:' + (0.4 + i * 1).toFixed(1) + 's">' + esc(x[1]) + '</p>'; }).join("");
      el.insertAdjacentHTML("beforeend", bunting() + confetti());
    }
    return el;
  }

  function countdown(el) {
    var num = el.querySelector(".num"), lab = el.querySelector(".lab"), i;
    function fin() {
      bell(); num.textContent = age; lab.textContent = A.countLabel || "years of love and blessings"; el.classList.add("done"); }
    if (RM) return fin();
    for (i = 5; i >= 1; i--) (function (n) { T(function () { num.textContent = n; tick(); }, 400 + (5 - n) * 900); })(i);
    T(fin, 400 + 5 * 900);
  }
  function caption(n) {
    var s = S[n];
    cp.textContent = s.t === "title" ? "Tap to see the next one" : s.t === "count" ? "Count with us" : s.t === "photo" ? (s.p.caption || "") : s.t === "wish" ? "With love" : "The End";
    cn.textContent = (n + 1) + " of " + N;
  }
  var TR = ["iris", "wipe", "roll", "burn", "zoom"], tc = 0;
  function show(n) {
    var scn = $("screen"), tr = (n === 0 || S[n].t === "wish") ? "" : TR[tc++ % TR.length];
    scn.classList.toggle("burn", tr === "burn"); scn.classList.remove("cut"); void scn.offsetWidth; scn.classList.add("cut");
    Array.prototype.slice.call(view.children).forEach(function (x) {
      x.className = "slide " + (x.dataset.t || "") + " out" + (tr === "roll" ? " out-roll" : ""); setTimeout(function () { x.remove(); }, 1100);
    });
    var el = build(S[n]); el.dataset.t = S[n].t; if (tr) el.classList.add("tr-" + tr);
    view.appendChild(el); void el.offsetWidth; el.classList.add("in");
    if (n > 0) thunk();
    var t = S[n].t;
    if (t === "count") countdown(el);
    if (t === "wish") {
      var wc = el.querySelectorAll(".wd");
      Array.prototype.forEach.call(wc, function (c) { T(key, parseFloat(c.style.animationDelay) * 1000); });
      T(bell, 800 + wc.length * 280);
      T(function () { el.classList.add("full"); }, 1100 + wc.length * 280);
    }
    if (t === "end") T(bell, 3600);
  }
  function dur(n) {
    var s = S[n];
    return s.t === "title" ? 6000 : s.t === "count" ? 8800 : s.t === "wish" ? 6500 + s.w.length * 60 : 6800;
  }
  function schedule(delay) {
    clearTimeout(timer);
    if (playing && cur < LAST) timer = setTimeout(function () { go(cur + 1); }, delay == null ? dur(cur) : delay);
  }
  function icon() {
    $("proj").classList.toggle("off", !playing); setHum(playing);
    playBtn.innerHTML = playing
      ? '<svg viewBox="0 0 24 24" width="11" height="11"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>'
      : '<svg viewBox="0 0 24 24" width="11" height="11"><path d="M7 4l13 8-13 8z"/></svg>';
  }
  function go(n) {
    if (n < 0 || n > LAST || n === cur) return;
    clearT(); cur = n; show(n); caption(n); mark(n);
    prev.disabled = n <= 0; next.disabled = n >= LAST;
    if (n === LAST) { playing = false; icon(); }
    schedule();
  }

  var scr = $("scr");
  function speck() {
    var e = document.createElement("i"), hair = Math.random() < 0.35, z = 1 + Math.random() * 3;
    e.className = "sp"; e.style.cssText = "left:" + (Math.random() * 100).toFixed(1) + "%;top:" + (Math.random() * 100).toFixed(1) + "%;width:" + (hair ? z * 6 : z) + "px;height:" + (hair ? 1 : z) + "px;border-radius:" + (hair ? "2px" : "50%") +
      ";transform:rotate(" + (Math.random() * 180).toFixed(0) + "deg);background:" + (Math.random() < 0.5 ? "rgba(255,255,255,.6)" : "rgba(0,0,0,.65)");
    scr.appendChild(e); setTimeout(function () { e.remove(); }, 60 + Math.random() * 200);
  }
  if (!RM) setInterval(function () { if (Math.random() < 0.7) speck(); }, 260);
  function unlock() { if (unlocked) return; unlocked = true; ac(); setHum(playing); }
  ["click", "touchend", "keydown"].forEach(function (e) { document.addEventListener(e, unlock); });
  $("snd").addEventListener("click", function () {
    snd = !snd; sndIcon();
    if (master) master.gain.setTargetAtTime(snd ? 0.55 : 0, AC.currentTime, 0.05);
    if (snd) { unlocked = true; ac(); setHum(playing); }
  });
  sndIcon(); icon(); go(0);
  prev.addEventListener("click", function () { go(cur - 1); });
  next.addEventListener("click", function () { go(cur + 1); });
  playBtn.addEventListener("click", function () {
    if (cur === LAST) return;
    playing = !playing; icon(); schedule(playing ? 1200 : null);
  });
  var swiped = false, x0 = null, y0 = 0;
  $("screen").addEventListener("click", function (e) {
    if (swiped) return;
    go(e.clientX < innerWidth * 0.33 ? cur - 1 : cur + 1);
  });
  document.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  document.addEventListener("touchend", function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      swiped = true; setTimeout(function () { swiped = false; }, 400);
      go(dx < 0 ? cur + 1 : cur - 1);
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") go(cur + 1);
    else if (e.key === "ArrowLeft") go(cur - 1);
    else if (e.key === " ") { e.preventDefault(); playBtn.click(); }
  });
})();