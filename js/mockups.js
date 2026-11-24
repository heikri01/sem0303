// ==========================================================
// MOCKUPS.JS · Marcus' tre mockups på content-kit.html
// Bygget på scripterne i Interaktive_SoMe_mockups. Hver mockup
// arbejder kun inde i sin egen boks (.mockup-yt, .mockup-fb,
// .mockup-ka), så de ikke forstyrrer hinanden eller resten af siden.
// ==========================================================

// Knapperne Begge / Mobil / Desktop. »rod« er mockuppens boks, »k« er dens forkortelse
function skiftVisning(rod, k, efterSkift) {
  const knapper = rod.querySelectorAll('.switch button');
  knapper.forEach(function (b) {
    b.addEventListener('click', function () {
      knapper.forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      const v = b.dataset.v;
      document.getElementById(k + '-mobil').hidden = v === 'desktop';
      document.getElementById(k + '-desktop').hidden = v === 'mobile';
      if (efterSkift) { efterSkift(); }
    });
  });
}

// Facebook-mockupperne: opslaget står ét sted (<template>) og kopieres ind i både mobil og desktop
function fyldOpslag(rod, k) {
  const tpl = document.getElementById(k + '-post').innerHTML;
  rod.querySelectorAll('.feed, .center').forEach(function (el) { el.innerHTML = tpl; });
}

// ---------- 1 · YouTube ----------
(function () {
  const rod = document.querySelector('.mockup-yt');
  if (!rod) { return; }
  const vd = document.getElementById('yt-vd');
  const vm = document.getElementById('yt-vm');
  // Tidsstemplerne i beskrivelsen springer i filmen
  rod.querySelectorAll('[data-t]').forEach(function (a) {
    a.style.cursor = 'pointer';
    a.addEventListener('click', function () { vd.currentTime = +a.dataset.t; vd.play(); });
  });
  rod.querySelectorAll('.sub').forEach(function (b) {
    b.addEventListener('click', function () {
      const on = b.classList.toggle('on');
      b.textContent = on ? 'Abonnerer' : 'Abonner';
    });
  });
  skiftVisning(rod, 'yt', function () { vd.pause(); vm.pause(); });
})();

// ---------- 2 · Facebook: videoannonce og reel ----------
(function () {
  const rod = document.querySelector('.mockup-fb');
  if (!rod) { return; }
  fyldOpslag(rod, 'fb');
  // Den lange film hører kun til YouTube – på Facebook vises reelen (3:4) både på mobil og desktop
  const vids = Array.from(rod.querySelectorAll('video'));
  // Videoen starter (uden lyd), når den er synlig – som i feedet
  const io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      const v = e.target;
      if (e.isIntersecting && !v.closest('[hidden]')) { v.play().catch(function () {}); } else { v.pause(); }
    });
  }, { threshold: 0.5 });
  vids.forEach(function (v) { io.observe(v); });
  rod.querySelectorAll('.sound').forEach(function (b) {
    b.addEventListener('click', function () {
      const v = b.parentElement.querySelector('video');
      const slaaTil = v.muted;
      vids.forEach(function (o) { o.muted = true; o.parentElement.querySelector('.sound').textContent = '🔇 Lyd til'; });
      if (slaaTil) { v.muted = false; v.currentTime = 0; v.play(); b.textContent = '🔊 Lyd fra'; }
    });
  });
  vids.forEach(function (v) { v.addEventListener('click', function () { if (v.paused) { v.play(); } else { v.pause(); } }); });
  skiftVisning(rod, 'fb', function () {
    vids.forEach(function (x) { if (x.closest('[hidden]')) { x.pause(); } });
  });
})();

// ---------- 3 · Facebook: karrusel ----------
(function () {
  const rod = document.querySelector('.mockup-ka');
  if (!rod) { return; }
  fyldOpslag(rod, 'ka');
  rod.querySelectorAll('.post').forEach(function (post) {
    const tr = post.querySelector('.track');
    const n = tr.children.length;
    const cnt = post.querySelector('.cnt');
    const dots = Array.from(post.querySelectorAll('.dots i'));
    const L = post.querySelector('.arr.l');
    const R = post.querySelector('.arr.r');
    const idx = function () { return Math.round(tr.scrollLeft / tr.clientWidth); };
    const go = function (i) { tr.scrollTo({ left: Math.max(0, Math.min(n - 1, i)) * tr.clientWidth, behavior: 'smooth' }); };
    const upd = function () {
      const i = idx();
      cnt.textContent = (i + 1) + '/' + n;
      dots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
      L.disabled = i === 0;
      R.disabled = i === n - 1;
    };
    tr.addEventListener('scroll', function () { requestAnimationFrame(upd); }, { passive: true });
    L.onclick = function () { go(idx() - 1); };
    R.onclick = function () { go(idx() + 1); };
    tr.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { go(idx() + 1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { go(idx() - 1); e.preventDefault(); }
    });
    // Træk med musen (på mobil swiper man bare)
    let x0 = null, s0 = 0, i0 = 0;
    tr.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') { return; }
      x0 = e.clientX; s0 = tr.scrollLeft; i0 = idx();
      tr.classList.add('drag'); tr.setPointerCapture(e.pointerId);
    });
    tr.addEventListener('pointermove', function (e) { if (x0 !== null) { tr.scrollLeft = s0 - (e.clientX - x0); } });
    const slut = function (e) {
      if (x0 === null) { return; }
      const dx = e.clientX - x0; x0 = null; tr.classList.remove('drag');
      go(Math.abs(dx) > tr.clientWidth * 0.15 ? i0 + (dx < 0 ? 1 : -1) : i0);
    };
    tr.addEventListener('pointerup', slut);
    tr.addEventListener('pointercancel', slut);
    // »Se mere« viser hele opslagsteksten
    const sm = post.querySelector('.seemore');
    const full = post.querySelector('.full');
    if (sm && full) { sm.onclick = function () { full.hidden = false; sm.remove(); }; }
  });
  skiftVisning(rod, 'ka');
})();
