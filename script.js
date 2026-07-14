/* =====================================================================
   A SPECIAL GIFT FOR AYANA — behaviour
   Sections:
     1. Ambient background (stars / petals / particles / cursor glow)
     2. Music controller (fade in/out, autoplay-safe)
     3. Screen router (fade + zoom transitions, seal progress)
     4. Screen 1  — gift box opening
     5. Screen 2  — envelope + typewriter letter
     6. Screen 3  — promise checklist
     7. Screen 4  — question + mini hearts
     8. Screen 5A — forgiven / reunite / confetti
     9. Screen 5B — not yet
    10. Screen 6  — closing reveal
   ===================================================================== */

(() => {
  'use strict';

  /* ---------------------------------------------------------------
     0. Small helpers
  ----------------------------------------------------------------*/
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const rand = (min, max) => Math.random() * (max - min) + min;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =================================================================
     1. AMBIENT BACKGROUND
  ==================================================================*/
  const petalsLayer = $('#petals-layer');
  const particlesLayer = $('#particles-layer');
  const starsLayer = $('#stars-layer');

  function spawnStars(count = 60) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const star = document.createElement('span');
      star.className = 'star';
      star.style.left = rand(0, 100) + 'vw';
      star.style.top = rand(0, 100) + 'vh';
      star.style.animationDelay = rand(0, 4) + 's';
      frag.appendChild(star);
    }
    starsLayer.appendChild(frag);
  }

  function spawnPetal() {
    if (prefersReducedMotion) return;
    const petal = document.createElement('span');
    petal.className = 'petal';
    const size = rand(8, 18);
    petal.style.width = size + 'px';
    petal.style.height = size * 0.8 + 'px';
    petal.style.left = rand(-2, 100) + 'vw';
    petal.style.setProperty('--drift', rand(-10, 10) + 'vw');
    const duration = rand(9, 17);
    petal.style.animationDuration = duration + 's';
    petalsLayer.appendChild(petal);
    setTimeout(() => petal.remove(), duration * 1000 + 200);
  }

  function spawnParticle() {
    if (prefersReducedMotion) return;
    const particle = document.createElement('span');
    particle.className = 'particle';
    const size = rand(2, 5);
    particle.style.setProperty('--size', size + 'px');
    particle.style.left = rand(0, 100) + 'vw';
    particle.style.setProperty('--drift', rand(-6, 6) + 'vw');
    const duration = rand(7, 13);
    particle.style.animationDuration = duration + 's';
    particlesLayer.appendChild(particle);
    setTimeout(() => particle.remove(), duration * 1000 + 200);
  }

  spawnStars();
  let petalIntervalMs = 900;
  let ambientTimers = [];

  function startAmbientLoops() {
    ambientTimers.forEach(clearInterval);
    ambientTimers = [];
    if (prefersReducedMotion) return;
    ambientTimers.push(setInterval(spawnPetal, petalIntervalMs));
    ambientTimers.push(setInterval(spawnParticle, 650));
  }
  startAmbientLoops();

  // seed a few petals immediately so the page doesn't feel empty on load
  for (let i = 0; i < 6; i++) setTimeout(spawnPetal, i * 220);

  // cursor glow — desktop only
  const cursorGlow = $('#cursor-glow');
  let cursorRAF = null;
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    document.body.classList.add('has-pointer');
    if (cursorRAF) cancelAnimationFrame(cursorRAF);
    cursorRAF = requestAnimationFrame(() => {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
    });
  }, { passive: true });

  /* =================================================================
     2. MUSIC CONTROLLER
  ==================================================================*/
  const music = $('#bg-music');
  const musicToggle = $('#music-toggle');
  const musicIcon = $('#music-icon');
  const TARGET_VOLUME = 0.25;
  music.volume = 0;
  let musicFadeTimer = null;

  function fadeAudio(to, duration = 900) {
    clearInterval(musicFadeTimer);
    const start = music.volume;
    const steps = 24;
    let step = 0;
    musicFadeTimer = setInterval(() => {
      step++;
      const progress = step / steps;
      music.volume = Math.max(0, Math.min(1, start + (to - start) * progress));
      if (step >= steps) {
        clearInterval(musicFadeTimer);
        if (to === 0) music.pause();
      }
    }, duration / steps);
  }

  function playMusic() {
    music.play().then(() => {
      fadeAudio(TARGET_VOLUME);
      musicToggle.classList.add('playing');
      musicToggle.classList.remove('paused');
      musicToggle.setAttribute('aria-pressed', 'true');
      musicIcon.textContent = '🎵';
    }).catch(() => {
      // autoplay was blocked — the toggle button lets the user retry manually
      musicToggle.classList.remove('playing');
    });
  }

  function pauseMusic() {
    fadeAudio(0);
    musicToggle.classList.remove('playing');
    musicToggle.classList.add('paused');
    musicToggle.setAttribute('aria-pressed', 'false');
  }

  musicToggle.addEventListener('click', () => {
    if (music.paused) playMusic();
    else pauseMusic();
  });

  /* =================================================================
     3. SCREEN ROUTER
  ==================================================================*/
  const screens = $$('.screen');
  const sealRing = $('.seal-ring');
  const screenOrder = ['1', '2', '3', '4', '5a', '6'];   // 5b substitutes 5a on that branch

  function progressFor(key) {
    const idx = screenOrder.indexOf(key);
    const denom = screenOrder.length - 1;
    return idx === -1 ? 0.14 : (idx / denom) * 0.86 + 0.14;
  }

  function goToScreen(key) {
    const next = $(`#screen-${key}`);
    const current = $('.screen.active');
    if (!next || next === current) return;

    if (current) {
      current.classList.add('leaving');
      current.classList.remove('active');
      setTimeout(() => current.classList.remove('leaving'), 900);
    }
    next.classList.add('active');
    sealRing.style.setProperty('--progress', progressFor(key));

    // trigger per-screen entrance logic
    const onEnter = screenEnterHandlers[key];
    if (onEnter) onEnter();
  }

  /* =================================================================
     4. SCREEN 1 — GIFT BOX
  ==================================================================*/
  const giftBox = $('#gift-box');
  const btnOpenGift = $('#btn-open-gift');
  let giftOpened = false;

  function openGift() {
    if (giftOpened) return;
    giftOpened = true;
    giftBox.classList.add('opened');
    playMusic();

    // a small burst of extra petals for the cinematic moment
    petalIntervalMs = 220;
    startAmbientLoops();
    for (let i = 0; i < 18; i++) setTimeout(spawnPetal, i * 60);

    setTimeout(() => {
      petalIntervalMs = 900;
      startAmbientLoops();
      goToScreen('2');
    }, 1300);
  }

  giftBox.addEventListener('click', openGift);
  btnOpenGift.addEventListener('click', openGift);

  /* =================================================================
     5. SCREEN 2 — ENVELOPE + TYPEWRITER LETTER
  ==================================================================*/
  const envelope = $('#envelope');
  const letterText = `Aku benar-benar minta maaf atas semua candaan berlebihan yang sudah membuat hati kamu terluka.

Niatku tidak pernah ingin menyakiti kamu.

Aku hanya terlalu nyaman sampai lupa kalau setiap candaan juga punya batas.

Aku benar-benar menyesal.

Percayalah...

Aku sayang sama kamu.

Aku tidak mungkin dengan sengaja menyakiti orang yang aku sayang.

Aku hanya berharap...

Setelah membaca surat ini...

Kamu bisa merasakan kalau permintaan maafku benar-benar tulus.

Terima kasih sudah meluangkan waktu untuk membacanya.`;

  const typewriterEl = $('#typewriter-text');
  const letterSignoff = $('.letter-signoff');
  const btnContinue2 = $('#btn-continue-2');
  let envelopeStarted = false;

  function typewrite(el, text, speed = 26) {
    return new Promise((resolve) => {
      let i = 0;
      const caret = document.createElement('span');
      caret.className = 'caret';
      el.textContent = '';
      el.appendChild(caret);

      function tick() {
        if (i < text.length) {
          caret.insertAdjacentText('beforebegin', text[i]);
          i++;
          const char = text[i - 1];
          const pause = (char === '.' || char === '\n') ? speed * 6 : speed;
          setTimeout(tick, pause);
        } else {
          caret.remove();
          resolve();
        }
      }
      tick();
    });
  }

  function runEnvelopeSequence() {
    if (envelopeStarted) return;
    envelopeStarted = true;

    setTimeout(() => envelope.classList.add('opened'), 500);

    setTimeout(async () => {
      envelope.classList.add('expanded');
      await typewrite(typewriterEl, letterText, prefersReducedMotion ? 0 : 22);
      letterSignoff.classList.add('shown');
      btnContinue2.classList.add('shown');
    }, 1500);
  }

  btnContinue2.addEventListener('click', () => goToScreen('3'));

  /* =================================================================
     6. SCREEN 3 — PROMISE CHECKLIST
  ==================================================================*/
  const promiseItems = $$('.promise-item');
  const btnContinue3 = $('#btn-continue-3');
  let promisesStarted = false;

  function runPromiseSequence() {
    if (promisesStarted) return;
    promisesStarted = true;
    promiseItems.forEach((item, i) => {
      setTimeout(() => item.classList.add('shown'), 400 + i * 550);
    });
    setTimeout(() => btnContinue3.classList.add('shown'), 400 + promiseItems.length * 550 + 300);
  }

  btnContinue3.addEventListener('click', () => goToScreen('4'));

  /* =================================================================
     7. SCREEN 4 — QUESTION + MINI HEARTS
  ==================================================================*/
  const heartField = $('#heart-particles-4');
  let heartsSeeded = false;
  const HEART_GLYPHS = ['🤍', '❤', '💗'];

  function seedMiniHearts() {
    if (heartsSeeded || prefersReducedMotion) return;
    heartsSeeded = true;
    for (let i = 0; i < 16; i++) {
      const h = document.createElement('span');
      h.className = 'mini-heart';
      h.textContent = HEART_GLYPHS[Math.floor(rand(0, HEART_GLYPHS.length))];
      h.style.left = rand(0, 100) + '%';
      h.style.top = rand(0, 100) + '%';
      h.style.setProperty('--hsize', rand(12, 22) + 'px');
      h.style.setProperty('--hdur', rand(4, 8) + 's');
      h.style.animationDelay = rand(0, 4) + 's';
      heartField.appendChild(h);
    }
  }

  $('#btn-forgive-yes').addEventListener('click', () => {
    goToScreen('5a');
    burstConfetti();
  });
  $('#btn-forgive-no').addEventListener('click', () => goToScreen('5b'));

  /* =================================================================
     8. SCREEN 5A — FORGIVEN / REUNITE / CONFETTI
  ==================================================================*/
  const reuniteBlock = $('#reunite-block');
  const reuniteResult = $('#reunite-result');
  let reuniteBlockTimer = null;

  function runScreen5A() {
    reuniteBlock.classList.remove('shown');
    reuniteResult.classList.remove('shown');
    clearTimeout(reuniteBlockTimer);
    reuniteBlockTimer = setTimeout(() => reuniteBlock.classList.add('shown'), 1800);
  }

  function chooseReunite() {
    reuniteResult.classList.add('shown');
    burstMiniHeartsAt(reuniteResult);
  }
  $('#btn-reunite-a').addEventListener('click', chooseReunite);
  $('#btn-reunite-b').addEventListener('click', chooseReunite);
  $('#btn-to-screen6-a').addEventListener('click', () => goToScreen('6'));

  const CONFETTI_COLORS = ['#D9A0A8', '#CDA96E', '#F6D9DE', '#AD7C82', '#FFFDFA'];
  function burstConfetti() {
    if (prefersReducedMotion) return;
    for (let i = 0; i < 46; i++) {
      setTimeout(() => {
        const piece = document.createElement('span');
        piece.className = 'confetti-piece';
        const isHeart = Math.random() < 0.4;
        const left = rand(0, 100);
        const drift = rand(-14, 14);
        const duration = rand(2.6, 4.4);
        const rotation = rand(180, 720) * (Math.random() < 0.5 ? -1 : 1);

        piece.style.left = left + 'vw';
        if (isHeart) {
          piece.textContent = '❤';
          piece.style.fontSize = rand(10, 18) + 'px';
          piece.style.color = CONFETTI_COLORS[Math.floor(rand(0, CONFETTI_COLORS.length))];
          piece.style.background = 'none';
        } else {
          piece.style.background = CONFETTI_COLORS[Math.floor(rand(0, CONFETTI_COLORS.length))];
          piece.style.borderRadius = Math.random() < 0.5 ? '50%' : '2px';
        }

        document.body.appendChild(piece);
        const anim = piece.animate([
          { transform: 'translate3d(0,0,0) rotate(0deg)', opacity: 1 },
          { transform: `translate3d(${drift}vw, 110vh, 0) rotate(${rotation}deg)`, opacity: 0.9 }
        ], { duration: duration * 1000, easing: 'cubic-bezier(0.3,0.6,0.4,1)' });
        anim.onfinish = () => piece.remove();
      }, i * 35);
    }
  }

  function burstMiniHeartsAt(container) {
    if (prefersReducedMotion) return;
    for (let i = 0; i < 12; i++) {
      const h = document.createElement('span');
      h.textContent = '🤍';
      h.style.position = 'absolute';
      h.style.left = rand(30, 70) + '%';
      h.style.bottom = '0';
      h.style.fontSize = rand(12, 20) + 'px';
      h.style.pointerEvents = 'none';
      container.style.position = 'relative';
      container.appendChild(h);
      const anim = h.animate([
        { transform: 'translateY(0)', opacity: 1 },
        { transform: `translateY(-${rand(80, 140)}px) translateX(${rand(-30, 30)}px)`, opacity: 0 }
      ], { duration: rand(1400, 2200), easing: 'ease-out' });
      anim.onfinish = () => h.remove();
    }
  }

  /* =================================================================
     9. SCREEN 5B — NOT YET
  ==================================================================*/
  $('#btn-to-screen6-b').addEventListener('click', () => goToScreen('6'));

  /* =================================================================
     10. SCREEN 6 — CLOSING
  ==================================================================*/
  const closingParas = $$('#closing-text p');
  let closingStarted = false;

  function runClosingSequence() {
    if (closingStarted) return;
    closingStarted = true;
    closingParas.forEach((p, i) => {
      setTimeout(() => p.classList.add('shown'), 500 + i * 900);
    });
  }

  /* =================================================================
     Screen enter dispatch table
  ==================================================================*/
  const screenEnterHandlers = {
    '2': runEnvelopeSequence,
    '3': runPromiseSequence,
    '4': seedMiniHearts,
    '5a': runScreen5A,
    '6': runClosingSequence,
  };

  /* =================================================================
     Init
  ==================================================================*/
  sealRing.style.setProperty('--progress', progressFor('1'));
})();
