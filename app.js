/* ===== Karate Math — Yonah's Multiplication Dojo ===== */

(function () {
  'use strict';

  // === DOM refs ===
  const startScreen = document.getElementById('start-screen');
  const nameScreen = document.getElementById('name-screen');
  const gameScreen = document.getElementById('game-screen');
  const gameoverScreen = document.getElementById('gameover-screen');
  const winScreen = document.getElementById('win-screen');
  const startBtn = document.getElementById('start-btn');
  const nameBtn = document.getElementById('name-btn');
  const enemyNameInput = document.getElementById('enemy-name-input');
  const retryBtn = document.getElementById('retry-btn');

  const questionEl = document.getElementById('question');
  const answerInput = document.getElementById('answer-input');
  const submitBtn = document.getElementById('submit-btn');
  const feedbackEl = document.getElementById('feedback');

  const hpBar = document.getElementById('hp-bar');
  const hpValue = document.getElementById('hp-value');
  const correctCountEl = document.getElementById('correct-count');
  const wrongCountEl = document.getElementById('wrong-count');

  const fighterLeft = document.getElementById('fighter-left');
  const fighterRight = document.getElementById('fighter-right');
  const impactEl = document.getElementById('impact');
  const trickHintEl = document.getElementById('trick-hint');

  const gameoverStats = document.getElementById('gameover-stats');
  const winStats = document.getElementById('win-stats');
  const fireworksCanvas = document.getElementById('fireworks-canvas');
  const bloodCanvas = document.getElementById('blood-canvas');
  const bloodCtx = bloodCanvas.getContext('2d');

  // === State ===
  let hp = 50;
  let correctCount = 0;
  let wrongCount = 0;
  let currentA = 0;
  let currentB = 0;
  let currentAnswer = 0;
  let isProcessing = false;
  let fireworksRAF = null;
  let enemyName = 'Sensei Bot';
  let correctStreak = 0;
  let decapitationActive = false;
  let flamethrowerActive = false;
  let sniperActive = false;
  let tankActive = false;
  let airstrikeActive = false;
  let electroActive = false;
  let mortarActive = false;
  let boulderActive = false;
  let coconutActive = false;
  let archeryActive = false;
  let moleActive = false;
  let yachtActive = false;
  let towerActive = false;
  let armWrestleActive = false;
  let bananaActive = false;
  let shrinkActive = false;
  let blackholeActive = false;
  let ufoActive = false;
  let jarActive = false;
  let sunLaunchActive = false;
  let secondChance = false;
  let gameRound = 1; // true when waiting for a retry after wrong answer

  // Enemy name label in the arena
  const enemyNameLabel = fighterRight.querySelector('.fighter-name');

  // === Streak bar UI ===
  const streakCountEl = document.getElementById('streak-count');
  const streakFill = document.getElementById('streak-fill');
  const streakBar = document.getElementById('streak-bar');
  const milestones = [5, 10, 20, 30, 40];

  function updateStreakBar() {
    // Update number
    streakCountEl.textContent = correctStreak;

    // Progress fill — goes from 0% to 100% over 0→40
    const pct = Math.min((correctStreak / 40) * 100, 100);
    streakFill.style.width = pct + '%';

    // Fire glow when streak >= 3
    if (correctStreak >= 3) {
      streakBar.classList.add('on-fire');
    } else {
      streakBar.classList.remove('on-fire');
    }

    // Update milestones
    let nextFound = false;
    milestones.forEach(ms => {
      const el = document.getElementById('ms-' + ms);
      if (!el) return;
      el.classList.remove('reached', 'next-up');
      if (correctStreak >= ms) {
        el.classList.add('reached');
      } else if (!nextFound) {
        el.classList.add('next-up');
        nextFound = true;
      }
    });
  }

  // === Multiplication tricks from cheat sheet (never reveal the final answer) ===
  const tricks = {
    1: (a, b) => {
      const n = a === 1 ? b : a;
      return `Any number × 1 stays the same. So what is ${n} × 1? Just say the number back!`;
    },
    2: (a, b) => {
      const n = a === 2 ? b : a;
      return `Double it! Add the number to itself: ${n} + ${n} = ?`;
    },
    3: (a, b) => {
      const n = a === 3 ? b : a;
      return `Triple it! First double ${n} to get ${n*2}. Then add ${n} one more time: ${n*2} + ${n} = ?`;
    },
    4: (a, b) => {
      const n = a === 4 ? b : a;
      return `Double-double! First double ${n} to get ${n*2}. Then double that again: ${n*2} × 2 = ?`;
    },
    5: (a, b) => {
      const n = a === 5 ? b : a;
      if (n % 2 === 0) return `5 × even number: take half of ${n}, which is ${n/2}. Now just put a 0 after it!`;
      return `5s always end in 0 or 5. Since ${n} is odd, the answer ends in 5. Subtract 1 from ${n} to get ${n-1}, take half = ${(n-1)/2}. Put that before the 5!`;
    },
    6: (a, b) => {
      const n = a === 6 ? b : a;
      if (n % 2 === 0) return `6 × even number trick: the last digit of the answer matches ${n}! And the tens digit is half of ${n}, which is ${n/2}. Put them together!`;
      return `Use your 5s! You know 5 × ${n} = ${5*n}. Now add one more ${n}: ${5*n} + ${n} = ?`;
    },
    7: (a, b) => {
      if ((a===7&&b===8)||(a===8&&b===7)) return `Think of a counting sequence: 5, 6, 7, 8. The first two digits of that sequence make a number — that's your answer!`;
      const n = a === 7 ? b : a;
      return `Flip it! 7 × ${n} is the same as ${n} × 7. Think about ${n} groups of 7, or use the ${n}s table you already know!`;
    },
    8: (a, b) => {
      const n = a === 8 ? b : a;
      return `Double-double-double! Start with ${n}. Double it: ${n*2}. Double again: ${n*4}. Double one more time: ${n*4} × 2 = ?`;
    },
    9: (a, b) => {
      const n = a === 9 ? b : a;
      if (n <= 10) return `Finger trick! Hold up 10 fingers, fold down finger #${n}. Count fingers to the left for the tens digit, fingers to the right for the ones digit. Or: 10 × ${n} = ${10*n}, now subtract ${n}: ${10*n} − ${n} = ?`;
      return `Use the 10s shortcut! 10 × ${n} = ${10*n}. Now subtract ${n} from that: ${10*n} − ${n} = ?`;
    },
    10: (a, b) => {
      const n = a === 10 ? b : a;
      return `Easiest trick ever! Just write ${n} and add a zero at the end. What do you get?`;
    },
    11: (a, b) => {
      const n = a === 11 ? b : a;
      if (n <= 9) return `Repeat the digit! 11 × a single digit — just write that digit twice. What two-digit number do you get?`;
      const d1 = Math.floor(n / 10);
      const d2 = n % 10;
      const mid = d1 + d2;
      return `Split & add trick! Split ${n} into its digits: ${d1} and ${d2}. Add those digits together to get the middle number. Then sandwich it: first digit, middle sum, last digit!`;
    },
    12: (a, b) => {
      const n = a === 12 ? b : a;
      return `Break it into easy parts! 10 × ${n} = ${10*n}. And 2 × ${n} = ${2*n}. Now add those two together: ${10*n} + ${2*n} = ?`;
    }
  };

  function getTrick(a, b) {
    // Prefer the larger factor's trick — it's more useful for harder tables
    const maxF = Math.max(a, b);
    const minF = Math.min(a, b);
    if (tricks[maxF]) return tricks[maxF](a, b);
    if (tricks[minF]) return tricks[minF](a, b);
    return `${a} × ${b} = ${a * b}`;
  }

  // === Audio (procedural SFX — mobile-safe) ===
  let audioCtx = null;
  let audioUnlocked = false;

  // Ensure AudioContext exists and is running.
  // Must be called inside a direct user-gesture handler.
  function ensureAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Unlock audio on ANY user interaction. Mobile Safari/Chrome in iframes
  // require the AudioContext to be created + resumed inside a gesture.
  // We keep the listeners until the context is confirmed running.
  function tryUnlockAudio() {
    ensureAudio();
    // Play a tiny silent buffer to fully activate the context
    try {
      const buf = audioCtx.createBuffer(1, 1, audioCtx.sampleRate);
      const src = audioCtx.createBufferSource();
      src.buffer = buf;
      src.connect(audioCtx.destination);
      src.start(0);
    } catch (e) { /* ignore */ }

    if (audioCtx.state === 'running') {
      audioUnlocked = true;
      unlockEvents.forEach(evt => document.removeEventListener(evt, tryUnlockAudio, true));
    }
  }
  const unlockEvents = ['touchstart', 'touchend', 'mousedown', 'click', 'keydown'];
  unlockEvents.forEach(evt => document.addEventListener(evt, tryUnlockAudio, true));

  // Schedule an oscillator tone at a precise time (avoids setTimeout)
  function scheduleOsc(freq, startOffset, duration, type, vol) {
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime + startOffset;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type || 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol || 0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + (duration || 0.1));
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + (duration || 0.1));
    } catch (e) { /* ignore */ }
  }

  function playCorrectSFX() {
    ensureAudio();
    scheduleOsc(523, 0, 0.08, 'square', 0.12);
    scheduleOsc(659, 0.08, 0.08, 'square', 0.12);
    scheduleOsc(784, 0.16, 0.12, 'square', 0.12);
  }

  function playWrongSFX() {
    ensureAudio();
    scheduleOsc(200, 0, 0.15, 'sawtooth', 0.1);
    scheduleOsc(150, 0.1, 0.2, 'sawtooth', 0.1);
  }

  function playPunchSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;

      // White noise burst for a fleshy smack
      const bufferSize = Math.floor(audioCtx.sampleRate * 0.12);
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = noiseBuffer;

      // Bandpass to shape the smack tone
      const bp = audioCtx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 800;
      bp.Q.value = 0.8;

      // Short gain envelope
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      noise.connect(bp).connect(gain).connect(audioCtx.destination);
      noise.start(t);
      noise.stop(t + 0.12);

      // Low thump layered in
      const thump = audioCtx.createOscillator();
      const thumpGain = audioCtx.createGain();
      thump.type = 'sine';
      thump.frequency.setValueAtTime(150, t);
      thump.frequency.exponentialRampToValueAtTime(50, t + 0.08);
      thumpGain.gain.setValueAtTime(0.25, t);
      thumpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      thump.connect(thumpGain).connect(audioCtx.destination);
      thump.start(t);
      thump.stop(t + 0.08);
    } catch (e) { /* ignore */ }
  }

  function playWinSFX() {
    ensureAudio();
    [523, 659, 784, 1047].forEach((f, i) => {
      scheduleOsc(f, i * 0.12, 0.2, 'square', 0.1);
    });
  }

  function playLoseSFX() {
    ensureAudio();
    [400, 350, 300, 200].forEach((f, i) => {
      scheduleOsc(f, i * 0.15, 0.25, 'sawtooth', 0.08);
    });
  }

  // === Text-to-Speech for trick hints ===
  function speakTrick(text) {
    if (!('speechSynthesis' in window)) return;
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  }

  // === Screen management ===
  function showScreen(screen) {
    [startScreen, nameScreen, gameScreen, gameoverScreen, winScreen].forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
  }

  // === Name screen ===
  function showNameScreen() {
    ensureAudio();
    showScreen(nameScreen);
    enemyNameInput.value = '';
    enemyNameInput.focus();
  }

  function confirmEnemyName() {
    const name = enemyNameInput.value.trim();
    if (!name) {
      enemyNameInput.focus();
      return;
    }
    enemyName = name;
    enemyNameLabel.textContent = enemyName;
    startGame();
  }

  // === Question generation ===
  const practiceFactors = [2, 3, 4, 5, 6, 7, 8, 9, 11, 12];

  function generateQuestion() {
    currentA = practiceFactors[Math.floor(Math.random() * practiceFactors.length)];
    currentB = practiceFactors[Math.floor(Math.random() * practiceFactors.length)];
    currentAnswer = currentA * currentB;
    questionEl.textContent = `${currentA} × ${currentB} = ?`;
    answerInput.value = '';
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    trickHintEl.textContent = '';
    trickHintEl.classList.remove('visible');
    // Stop any ongoing trick speech
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    answerInput.focus();
  }

  // === HP bar update ===
  function updateHP() {
    hp = Math.max(0, Math.min(100, hp));
    hpBar.style.width = hp + '%';
    hpValue.textContent = hp;

    // Color coding
    if (hp <= 20) {
      hpBar.style.background = 'var(--color-hp-low)';
    } else if (hp <= 50) {
      hpBar.style.background = 'var(--color-hp-mid)';
    } else {
      hpBar.style.background = 'var(--color-hp-high)';
    }
  }

  // === Blood particle system ===
  let bloodParticles = [];
  let bloodRAF = null;
  let bloodEmitting = false;
  let bloodEmitEnd = 0;
  let bloodOriginX = 0;
  let bloodOriginY = 0;

  function resizeBloodCanvas() {
    bloodCanvas.width = window.innerWidth;
    bloodCanvas.height = window.innerHeight;
  }
  resizeBloodCanvas();
  window.addEventListener('resize', resizeBloodCanvas);

  function startBloodSpew(defender) {
    // Find the nose position of the defender's SVG head
    const svg = defender.querySelector('.karate-svg');
    const rect = svg.getBoundingClientRect();
    // The head is roughly at 60/120 = 50% across, 44/180 ≈ 24% down the SVG
    // Nose is around y=44 in the 180-tall viewBox
    bloodOriginX = rect.left + rect.width * 0.5;
    bloodOriginY = rect.top + rect.height * 0.26;

    bloodEmitting = true;
    bloodEmitEnd = performance.now() + 2000; // 2 seconds of emission

    if (!bloodRAF) {
      bloodRAF = requestAnimationFrame(animateBlood);
    }
  }

  function animateBlood(time) {
    bloodCtx.clearRect(0, 0, bloodCanvas.width, bloodCanvas.height);

    // Emit new droplets while within the 2-second window
    if (bloodEmitting && time < bloodEmitEnd) {
      const count = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.8; // mostly downward-ish
        const speed = 1.5 + Math.random() * 3.5;
        bloodParticles.push({
          x: bloodOriginX + (Math.random() - 0.5) * 6,
          y: bloodOriginY + (Math.random() - 0.5) * 4,
          vx: Math.cos(angle) * speed * (0.8 + Math.random() * 0.6),
          vy: Math.sin(angle) * speed * -1, // flip: spray downward
          size: 1.5 + Math.random() * 3,
          life: 1,
          decay: 0.006 + Math.random() * 0.01,
          gravity: 0.08 + Math.random() * 0.04
        });
      }
    } else {
      bloodEmitting = false;
    }

    // Update and draw
    for (let i = bloodParticles.length - 1; i >= 0; i--) {
      const p = bloodParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.99;
      p.life -= p.decay;

      if (p.life <= 0 || p.y > bloodCanvas.height) {
        bloodParticles.splice(i, 1);
        continue;
      }

      // Draw blood droplet
      const alpha = Math.max(0, p.life);
      const r = p.size * (0.5 + p.life * 0.5);
      bloodCtx.beginPath();
      bloodCtx.arc(p.x, p.y, r, 0, Math.PI * 2);
      // Vary the red shade slightly
      const shade = Math.floor(160 + Math.random() * 40);
      bloodCtx.fillStyle = `rgba(${shade}, ${Math.floor(shade * 0.1)}, ${Math.floor(shade * 0.05)}, ${alpha})`;
      bloodCtx.fill();
    }

    if (bloodParticles.length > 0 || bloodEmitting) {
      bloodRAF = requestAnimationFrame(animateBlood);
    } else {
      bloodCtx.clearRect(0, 0, bloodCanvas.width, bloodCanvas.height);
      bloodRAF = null;
    }
  }

  // === Decapitation (5-streak special) ===
  function triggerDecapitation() {
    decapitationActive = true;
    const enemySvg = fighterRight.querySelector('.karate-svg');
    const headGroup = enemySvg.querySelector('.enemy-head');
    const neckStump = enemySvg.querySelector('.neck-stump');

    // Show bloody neck stump
    neckStump.classList.add('visible');

    // Fly the head off
    headGroup.classList.remove('regrowing');
    void headGroup.offsetWidth;
    headGroup.classList.add('decapitated');

    // Extra blood gush from neck area
    startNeckBloodSpew();

    // After 3 seconds, regrow the head
    setTimeout(() => {
      headGroup.classList.remove('decapitated');
      void headGroup.offsetWidth;
      headGroup.classList.add('regrowing');

      // Hide neck stump as head returns
      setTimeout(() => {
        neckStump.classList.remove('visible');
      }, 400);

      // Clean up after regrow animation finishes
      setTimeout(() => {
        headGroup.classList.remove('regrowing');
        decapitationActive = false;
      }, 800);
    }, 3000);
  }

  function startNeckBloodSpew() {
    // Blood from the neck (top of torso) for 2 seconds
    const svg = fighterRight.querySelector('.karate-svg');
    const rect = svg.getBoundingClientRect();
    // Neck is at ~50% across, ~31% down (y=55 in 180-tall viewBox)
    bloodOriginX = rect.left + rect.width * 0.5;
    bloodOriginY = rect.top + rect.height * 0.31;

    bloodEmitting = true;
    bloodEmitEnd = performance.now() + 2000;

    if (!bloodRAF) {
      bloodRAF = requestAnimationFrame(animateBlood);
    }
  }

  // === Flamethrower (10-streak special) ===
  let flameParticles = [];
  let flameRAF = null;
  let flameEmitting = false;
  let flameEmitEnd = 0;
  let flameOriginX = 0;
  let flameOriginY = 0;
  let flameTargetX = 0;
  let flameTargetY = 0;

  function playFlamethrowerSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;
      // Roaring flame: filtered noise with rising pitch
      const bufferSize = Math.floor(audioCtx.sampleRate * 2.5);
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1);
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = noiseBuffer;

      const bp = audioCtx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(300, t);
      bp.frequency.linearRampToValueAtTime(1200, t + 1.5);
      bp.frequency.linearRampToValueAtTime(400, t + 2.5);
      bp.Q.value = 0.5;

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.3);
      gain.gain.setValueAtTime(0.3, t + 1.8);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 2.5);

      noise.connect(bp).connect(gain).connect(audioCtx.destination);
      noise.start(t);
      noise.stop(t + 2.5);

      // Low rumble layer
      const rumble = audioCtx.createOscillator();
      const rumbleGain = audioCtx.createGain();
      rumble.type = 'sawtooth';
      rumble.frequency.setValueAtTime(60, t);
      rumble.frequency.linearRampToValueAtTime(100, t + 1.5);
      rumbleGain.gain.setValueAtTime(0.01, t);
      rumbleGain.gain.linearRampToValueAtTime(0.15, t + 0.3);
      rumbleGain.gain.setValueAtTime(0.15, t + 1.8);
      rumbleGain.gain.exponentialRampToValueAtTime(0.001, t + 2.5);
      rumble.connect(rumbleGain).connect(audioCtx.destination);
      rumble.start(t);
      rumble.stop(t + 2.5);
    } catch (e) { /* ignore */ }
  }

  function triggerFlamethrower() {
    flamethrowerActive = true;

    // Equip flamethrower on player
    const weapon = fighterLeft.querySelector('.flamethrower-weapon');
    if (weapon) weapon.style.display = '';

    // Get positions
    const playerSvg = fighterLeft.querySelector('.karate-svg');
    const enemySvg = fighterRight.querySelector('.karate-svg');
    const pRect = playerSvg.getBoundingClientRect();
    const eRect = enemySvg.getBoundingClientRect();

    // Flame origin: flamethrower nozzle tip (x=134/120 ≈ 112%, y=62/180 ≈ 34% of SVG)
    flameOriginX = pRect.left + pRect.width * 1.12;
    flameOriginY = pRect.top + pRect.height * 0.34;
    // Flame target: enemy center
    flameTargetX = eRect.left + eRect.width * 0.5;
    flameTargetY = eRect.top + eRect.height * 0.5;

    playFlamethrowerSFX();

    // Start flame particles
    flameEmitting = true;
    flameEmitEnd = performance.now() + 2000; // 2 seconds of flame
    if (!flameRAF) {
      flameRAF = requestAnimationFrame(animateFlame);
    }

    // After 0.5s, start burning the enemy
    setTimeout(() => {
      fighterRight.classList.add('burning');
    }, 500);

    // At 2s, enemy turns to ashes
    setTimeout(() => {
      fighterRight.classList.remove('burning');
      fighterRight.classList.add('ashes');
    }, 2000);

    // At 5s, enemy recovers
    setTimeout(() => {
      fighterRight.classList.remove('ashes');
      fighterRight.classList.add('recovering');

      // Unequip flamethrower
      if (weapon) weapon.style.display = 'none';

      setTimeout(() => {
        fighterRight.classList.remove('recovering');
        flamethrowerActive = false;
      }, 800);
    }, 5000);
  }

  function animateFlame(time) {
    // We draw flame on the blood canvas (shared)
    if (flameEmitting && time < flameEmitEnd) {
      const progress = 1 - (flameEmitEnd - time) / 2000;
      const count = 6 + Math.floor(Math.random() * 4);
      for (let i = 0; i < count; i++) {
        const dx = flameTargetX - flameOriginX;
        const dy = flameTargetY - flameOriginY;
        const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.6;
        const speed = 4 + Math.random() * 6;
        // Orange-yellow-red color
        const hue = 15 + Math.random() * 35; // 15 (red) to 50 (yellow-orange)
        flameParticles.push({
          x: flameOriginX + (Math.random() - 0.5) * 10,
          y: flameOriginY + (Math.random() - 0.5) * 10,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - Math.random() * 2,
          size: 3 + Math.random() * 6,
          life: 1,
          decay: 0.015 + Math.random() * 0.02,
          hue: hue
        });
      }
    } else {
      flameEmitting = false;
    }

    // Update and draw flame particles
    for (let i = flameParticles.length - 1; i >= 0; i--) {
      const p = flameParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy -= 0.05; // flames rise
      p.vx *= 0.99;
      p.life -= p.decay;
      p.size *= 0.98;

      if (p.life <= 0) {
        flameParticles.splice(i, 1);
        continue;
      }

      const alpha = Math.max(0, p.life);
      const r = p.size * (0.5 + p.life * 0.5);
      // Inner bright core
      bloodCtx.beginPath();
      bloodCtx.arc(p.x, p.y, r, 0, Math.PI * 2);
      const lightness = 50 + (1 - p.life) * 20;
      bloodCtx.fillStyle = `hsla(${p.hue}, 100%, ${lightness}%, ${alpha})`;
      bloodCtx.fill();
      // Outer glow
      bloodCtx.beginPath();
      bloodCtx.arc(p.x, p.y, r * 1.8, 0, Math.PI * 2);
      bloodCtx.fillStyle = `hsla(${p.hue}, 100%, 50%, ${alpha * 0.2})`;
      bloodCtx.fill();
    }

    if (flameParticles.length > 0 || flameEmitting) {
      flameRAF = requestAnimationFrame(animateFlame);
    } else {
      flameRAF = null;
    }
  }

  // === Tank crush (30-streak special) ===
  const tankOverlay = document.getElementById('tank-overlay');
  const tankVehicle = document.getElementById('tank-vehicle');
  const tankEnemy = document.getElementById('tank-enemy');
  const tankDust = document.getElementById('tank-dust');
  const tankCrushedText = document.getElementById('tank-crushed-text');

  function playTankEngineSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;

      // Low rumbling engine — filtered noise
      const bufLen = Math.floor(audioCtx.sampleRate * 4);
      const noiseBuf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) {
        d[i] = (Math.random() * 2 - 1);
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = noiseBuf;

      const lp = audioCtx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(200, t);
      lp.frequency.linearRampToValueAtTime(400, t + 1);
      lp.frequency.setValueAtTime(400, t + 2.5);
      lp.frequency.linearRampToValueAtTime(150, t + 4);
      lp.Q.value = 2;

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.5);
      gain.gain.setValueAtTime(0.25, t + 3);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 4);

      noise.connect(lp).connect(gain).connect(audioCtx.destination);
      noise.start(t);
      noise.stop(t + 4);

      // Deep pulsing throb
      const throb = audioCtx.createOscillator();
      const throbGain = audioCtx.createGain();
      throb.type = 'sawtooth';
      throb.frequency.setValueAtTime(30, t);
      throb.frequency.linearRampToValueAtTime(45, t + 1);
      throb.frequency.setValueAtTime(45, t + 3);
      throb.frequency.linearRampToValueAtTime(25, t + 4);
      throbGain.gain.setValueAtTime(0.01, t);
      throbGain.gain.linearRampToValueAtTime(0.2, t + 0.5);
      throbGain.gain.setValueAtTime(0.2, t + 3);
      throbGain.gain.exponentialRampToValueAtTime(0.001, t + 4);
      throb.connect(throbGain).connect(audioCtx.destination);
      throb.start(t);
      throb.stop(t + 4);
    } catch (e) { /* ignore */ }
  }

  function playTankCrunchSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;

      // Heavy crunch impact
      const bufLen = Math.floor(audioCtx.sampleRate * 0.3);
      const buf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 2);
      }
      const src = audioCtx.createBufferSource();
      src.buffer = buf;
      const bp = audioCtx.createBiquadFilter();
      bp.type = 'lowpass';
      bp.frequency.value = 400;
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(0.5, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      src.connect(bp).connect(g).connect(audioCtx.destination);
      src.start(t);
      src.stop(t + 0.3);

      // Bass boom
      const boom = audioCtx.createOscillator();
      const boomG = audioCtx.createGain();
      boom.type = 'sine';
      boom.frequency.setValueAtTime(60, t);
      boom.frequency.exponentialRampToValueAtTime(20, t + 0.3);
      boomG.gain.setValueAtTime(0.4, t);
      boomG.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      boom.connect(boomG).connect(audioCtx.destination);
      boom.start(t);
      boom.stop(t + 0.3);
    } catch (e) { /* ignore */ }
  }

  function triggerTankCrush() {
    tankActive = true;

    // Reset state
    tankOverlay.classList.remove('driving', 'impact-shake');
    tankEnemy.classList.remove('scared', 'flattened');
    tankDust.classList.remove('active');
    tankCrushedText.classList.remove('visible');
    tankVehicle.style.left = '-350px';

    // Show overlay
    tankOverlay.classList.add('active');

    // Phase 1: Enemy appears scared, engine starts
    setTimeout(() => {
      tankEnemy.classList.add('scared');
      playTankEngineSFX();
    }, 200);

    // Phase 2: Tank drives in from the left
    setTimeout(() => {
      tankOverlay.classList.add('driving');
    }, 500);

    // Phase 3: Tank reaches enemy — impact! (at ~45% of 3s = 1.35s + 0.5s offset = 1.85s)
    setTimeout(() => {
      tankEnemy.classList.remove('scared');
      tankEnemy.classList.add('flattened');
      tankDust.classList.add('active');
      tankOverlay.classList.add('impact-shake');
      playTankCrunchSFX();
    }, 1900);

    // Phase 4: CRUSHED! text
    setTimeout(() => {
      tankCrushedText.classList.add('visible');
    }, 2300);

    // Phase 5: Fade out
    setTimeout(() => {
      tankOverlay.style.transition = 'opacity 0.8s ease-out';
      tankOverlay.style.opacity = '0';
    }, 4500);

    // Phase 6: Clean up and return to game
    setTimeout(() => {
      tankOverlay.classList.remove('active', 'driving', 'impact-shake');
      tankOverlay.style.transition = '';
      tankOverlay.style.opacity = '';
      tankEnemy.classList.remove('scared', 'flattened');
      tankDust.classList.remove('active');
      tankCrushedText.classList.remove('visible');
      tankVehicle.style.left = '-350px';

      // Enemy collapses in the game arena
      fighterRight.classList.add('ashes');

      // Recover after 5s
      setTimeout(() => {
        fighterRight.classList.remove('ashes');
        fighterRight.classList.add('recovering');
        setTimeout(() => {
          fighterRight.classList.remove('recovering');
          tankActive = false;
        }, 800);
      }, 5000);
    }, 5300);
  }

  // === Airstrike (40-streak special) ===
  const airstrikeOverlay = document.getElementById('airstrike-overlay');
  const airstrikeCaller = document.getElementById('airstrike-caller');
  const airstrikeJet = document.getElementById('airstrike-jet');
  const airstrikeMissile = document.getElementById('airstrike-missile');
  const airstrikeExplosion = document.getElementById('airstrike-explosion');
  const airstrikeCrater = document.getElementById('airstrike-crater');
  const pitEnemy = document.getElementById('pit-enemy');
  const airstrikeText = document.getElementById('airstrike-text');
  const airstrikeFlash = document.getElementById('airstrike-flash');

  function playJetFlybySFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;

      // Jet engine roar — filtered noise rising then falling in pitch
      const bufLen = Math.floor(audioCtx.sampleRate * 4);
      const noiseBuf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) {
        d[i] = (Math.random() * 2 - 1);
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = noiseBuf;

      const bp = audioCtx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(400, t);
      bp.frequency.exponentialRampToValueAtTime(2000, t + 1.5);
      bp.frequency.exponentialRampToValueAtTime(800, t + 3);
      bp.frequency.exponentialRampToValueAtTime(300, t + 4);
      bp.Q.value = 1.5;

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 1);
      gain.gain.setValueAtTime(0.3, t + 2);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 4);

      noise.connect(bp).connect(gain).connect(audioCtx.destination);
      noise.start(t);
      noise.stop(t + 4);

      // High whine overtone
      const whine = audioCtx.createOscillator();
      const whineGain = audioCtx.createGain();
      whine.type = 'sawtooth';
      whine.frequency.setValueAtTime(600, t);
      whine.frequency.exponentialRampToValueAtTime(3000, t + 1.5);
      whine.frequency.exponentialRampToValueAtTime(1200, t + 3);
      whine.frequency.exponentialRampToValueAtTime(400, t + 4);
      whineGain.gain.setValueAtTime(0.01, t);
      whineGain.gain.linearRampToValueAtTime(0.08, t + 1);
      whineGain.gain.setValueAtTime(0.08, t + 2);
      whineGain.gain.exponentialRampToValueAtTime(0.001, t + 4);
      whine.connect(whineGain).connect(audioCtx.destination);
      whine.start(t);
      whine.stop(t + 4);
    } catch (e) { /* ignore */ }
  }

  function playMissileWhistleSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;
      // Descending whistle
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2000, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.8);
      g.gain.setValueAtTime(0.2, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      osc.connect(g).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.8);
    } catch (e) { /* ignore */ }
  }

  function playExplosionSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;

      // Massive boom — low noise burst
      const bufLen = Math.floor(audioCtx.sampleRate * 1.5);
      const buf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 1.5);
      }
      const src = audioCtx.createBufferSource();
      src.buffer = buf;
      const lp = audioCtx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(800, t);
      lp.frequency.exponentialRampToValueAtTime(100, t + 1.5);
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(0.6, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
      src.connect(lp).connect(g).connect(audioCtx.destination);
      src.start(t);
      src.stop(t + 1.5);

      // Sub bass thump
      const boom = audioCtx.createOscillator();
      const boomG = audioCtx.createGain();
      boom.type = 'sine';
      boom.frequency.setValueAtTime(80, t);
      boom.frequency.exponentialRampToValueAtTime(20, t + 1);
      boomG.gain.setValueAtTime(0.5, t);
      boomG.gain.exponentialRampToValueAtTime(0.001, t + 1);
      boom.connect(boomG).connect(audioCtx.destination);
      boom.start(t);
      boom.stop(t + 1);
    } catch (e) { /* ignore */ }
  }

  function triggerAirstrike() {
    airstrikeActive = true;

    // Reset all classes
    airstrikeOverlay.classList.remove('shaking');
    airstrikeCaller.classList.remove('visible');
    airstrikeJet.classList.remove('flying', 'exit');
    airstrikeMissile.classList.remove('launched');
    airstrikeExplosion.classList.remove('active');
    airstrikeCrater.classList.remove('visible');
    pitEnemy.classList.remove('fallen');
    airstrikeText.classList.remove('visible');
    airstrikeFlash.classList.remove('active');

    // Show overlay
    airstrikeOverlay.classList.add('active');

    // Phase 1 (0ms): Yonah appears with radio
    setTimeout(() => {
      airstrikeCaller.classList.add('visible');
    }, 200);

    // Phase 2 (1.5s): F-35 flies in from the left, jet engine sound
    setTimeout(() => {
      playJetFlybySFX();
      airstrikeJet.classList.add('flying');
    }, 1500);

    // Phase 3 (3.5s): Jet launches missile
    setTimeout(() => {
      playMissileWhistleSFX();
      airstrikeMissile.classList.add('launched');
    }, 3500);

    // Phase 4 (4.3s): EXPLOSION! Flash, shake, fireball
    setTimeout(() => {
      playExplosionSFX();
      airstrikeFlash.classList.add('active');
      airstrikeExplosion.classList.add('active');
      airstrikeOverlay.classList.add('shaking');
      airstrikeMissile.classList.remove('launched');
      airstrikeMissile.style.opacity = '0';
      // Hide caller during explosion
      airstrikeCaller.style.opacity = '0';
    }, 4300);

    // Phase 5 (5.2s): Crater appears + enemy falls in, jet exits
    setTimeout(() => {
      airstrikeCrater.classList.add('visible');
      airstrikeJet.classList.remove('flying');
      airstrikeJet.classList.add('exit');
    }, 5200);

    // Phase 5b (5.6s): Enemy tumbles into pit
    setTimeout(() => {
      pitEnemy.classList.add('fallen');
    }, 5600);

    // Phase 6 (6.2s): AIRSTRIKE! text
    setTimeout(() => {
      airstrikeText.classList.add('visible');
    }, 6200);

    // Phase 7 (8.5s): Fade out
    setTimeout(() => {
      airstrikeOverlay.style.transition = 'opacity 0.8s ease-out';
      airstrikeOverlay.style.opacity = '0';
    }, 8500);

    // Phase 8 (9.5s): Clean up and return to game
    setTimeout(() => {
      airstrikeOverlay.classList.remove('active', 'shaking');
      airstrikeOverlay.style.transition = '';
      airstrikeOverlay.style.opacity = '';
      airstrikeCaller.classList.remove('visible');
      airstrikeCaller.style.opacity = '';
      airstrikeJet.classList.remove('flying', 'exit');
      airstrikeJet.style.left = '';
      airstrikeJet.style.opacity = '';
      airstrikeMissile.classList.remove('launched');
      airstrikeMissile.style.opacity = '';
      airstrikeExplosion.classList.remove('active');
      airstrikeCrater.classList.remove('visible');
      pitEnemy.classList.remove('fallen');
      airstrikeText.classList.remove('visible');
      airstrikeFlash.classList.remove('active');

      // Enemy collapses in the game arena
      fighterRight.classList.add('ashes');

      // Recover after 5s
      setTimeout(() => {
        fighterRight.classList.remove('ashes');
        fighterRight.classList.add('recovering');
        setTimeout(() => {
          fighterRight.classList.remove('recovering');
          airstrikeActive = false;
        }, 800);
      }, 5000);
    }, 9500);
  }

  // === Sniper headshot (20-streak special) ===
  const sniperOverlay = document.getElementById('sniper-overlay');
  const sniperTarget = document.getElementById('sniper-target');
  const sniperHeadshotText = document.getElementById('sniper-headshot-text');

  function playSniperShotSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;

      // Sharp crack
      const crackBuf = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * 0.08), audioCtx.sampleRate);
      const crackData = crackBuf.getChannelData(0);
      for (let i = 0; i < crackData.length; i++) {
        crackData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / crackData.length, 1.5);
      }
      const crack = audioCtx.createBufferSource();
      crack.buffer = crackBuf;
      const crackGain = audioCtx.createGain();
      crackGain.gain.setValueAtTime(0.5, t);
      crackGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      crack.connect(crackGain).connect(audioCtx.destination);
      crack.start(t);
      crack.stop(t + 0.08);

      // Deep boom
      const boom = audioCtx.createOscillator();
      const boomGain = audioCtx.createGain();
      boom.type = 'sine';
      boom.frequency.setValueAtTime(80, t);
      boom.frequency.exponentialRampToValueAtTime(25, t + 0.4);
      boomGain.gain.setValueAtTime(0.4, t);
      boomGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      boom.connect(boomGain).connect(audioCtx.destination);
      boom.start(t);
      boom.stop(t + 0.4);

      // Echo tail
      const echoBuf = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * 0.3), audioCtx.sampleRate);
      const echoData = echoBuf.getChannelData(0);
      for (let i = 0; i < echoData.length; i++) {
        echoData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / echoData.length, 4);
      }
      const echo = audioCtx.createBufferSource();
      echo.buffer = echoBuf;
      const echoFilter = audioCtx.createBiquadFilter();
      echoFilter.type = 'lowpass';
      echoFilter.frequency.value = 600;
      const echoGain = audioCtx.createGain();
      echoGain.gain.setValueAtTime(0.15, t + 0.1);
      echoGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      echo.connect(echoFilter).connect(echoGain).connect(audioCtx.destination);
      echo.start(t + 0.1);
      echo.stop(t + 0.5);
    } catch (e) { /* ignore */ }
  }

  function triggerSniperHeadshot() {
    sniperActive = true;

    // Clone the enemy head SVG into the scope target area
    const enemySvg = fighterRight.querySelector('.karate-svg');
    const enemyHead = enemySvg.querySelector('.enemy-head');
    if (enemyHead) {
      // Create a mini SVG with just the head for the scope view
      sniperTarget.innerHTML = `
        <svg viewBox="25 5 70 65" width="260" height="230" xmlns="http://www.w3.org/2000/svg">
          ${enemyHead.innerHTML}
        </svg>
      `;
    } else {
      // Fallback: show generic head
      sniperTarget.innerHTML = `
        <svg viewBox="25 5 70 65" width="260" height="230" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="38" r="22" fill="#ffd6a0" stroke="#222" stroke-width="2"/>
          <circle cx="52" cy="36" r="3" fill="#222"/>
          <circle cx="68" cy="36" r="3" fill="#222"/>
          <path d="M55 46 Q60 42 65 46" fill="none" stroke="#222" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      `;
    }

    // Phase 1: Black screen → scope appears with zoom-in
    sniperOverlay.classList.add('active', 'zooming-in');
    sniperTarget.classList.remove('visible');
    sniperHeadshotText.classList.remove('visible');
    sniperOverlay.classList.remove('aiming', 'shot', 'blood-splatter');

    // Phase 2: Show enemy head in crosshair, start aiming sway
    setTimeout(() => {
      sniperOverlay.classList.remove('zooming-in');
      sniperOverlay.classList.add('aiming');
      sniperTarget.classList.add('visible');
    }, 1500);

    // Phase 3: Take the shot
    setTimeout(() => {
      sniperOverlay.classList.remove('aiming');
      sniperOverlay.classList.add('shot');
      playSniperShotSFX();
    }, 3000);

    // Phase 4: Blood splatter + headshot text
    setTimeout(() => {
      sniperOverlay.classList.add('blood-splatter');
      sniperTarget.classList.remove('visible');
      sniperHeadshotText.classList.add('visible');
    }, 3200);

    // Phase 5: Fade out and return to game
    setTimeout(() => {
      sniperOverlay.style.transition = 'opacity 0.8s ease-out';
      sniperOverlay.style.opacity = '0';
    }, 5000);

    // Phase 6: Clean up
    setTimeout(() => {
      sniperOverlay.classList.remove('active', 'shot', 'blood-splatter');
      sniperOverlay.style.transition = '';
      sniperOverlay.style.opacity = '';
      sniperTarget.innerHTML = '';
      sniperTarget.classList.remove('visible');
      sniperHeadshotText.classList.remove('visible');

      // Enemy collapses in the game
      fighterRight.classList.add('ashes');

      // Recover after 5s
      setTimeout(() => {
        fighterRight.classList.remove('ashes');
        fighterRight.classList.add('recovering');
        setTimeout(() => {
          fighterRight.classList.remove('recovering');
          sniperActive = false;
        }, 800);
      }, 5000);
    }, 5800);
  }

  // === Animation helpers ===
  function triggerPunch(attacker, defender) {
    // Remove any existing animation classes
    attacker.classList.remove('punching', 'hit');
    defender.classList.remove('punching', 'hit');

    // Force reflow
    void attacker.offsetWidth;
    void defender.offsetWidth;

    attacker.classList.add('punching');
    playPunchSFX();

    setTimeout(() => {
      defender.classList.add('hit');
      showImpact(defender);
      startBloodSpew(defender);
      gameScreen.classList.add('screen-shake');
    }, 120);

    setTimeout(() => {
      attacker.classList.remove('punching');
      defender.classList.remove('hit');
      gameScreen.classList.remove('screen-shake');
    }, 500);
  }

  function showImpact(nearFighter) {
    const rect = nearFighter.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height * 0.35;

    impactEl.className = 'impact';
    impactEl.style.left = (cx - 30) + 'px';
    impactEl.style.top = (cy - 30) + 'px';
    impactEl.innerHTML = createImpactSVG();

    void impactEl.offsetWidth;
    impactEl.classList.add('show');

    setTimeout(() => {
      impactEl.classList.remove('show');
    }, 400);
  }

  function createImpactSVG() {
    return `<svg viewBox="0 0 60 60" width="60" height="60" xmlns="http://www.w3.org/2000/svg">
      <polygon points="30,2 35,22 55,18 40,30 52,50 30,38 8,50 20,30 5,18 25,22" fill="#ffd700" opacity="0.9"/>
      <polygon points="30,10 33,24 47,22 37,30 45,44 30,36 15,44 23,30 13,22 27,24" fill="#fff" opacity="0.7"/>
    </svg>`;
  }

  // === Submit answer ===
  function submitAnswer() {
    if (isProcessing) return;

    const userAnswer = parseInt(answerInput.value, 10);
    if (isNaN(userAnswer)) {
      answerInput.focus();
      return;
    }

    isProcessing = true;
    ensureAudio();

    if (secondChance) {
      // === Retry attempt(s) after seeing the trick ===
      if (userAnswer === currentAnswer) {
        feedbackEl.textContent = 'Got it!';
        feedbackEl.className = 'feedback correct';
        trickHintEl.textContent = '';
        trickHintEl.classList.remove('visible');
        // Stop reading the trick aloud
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        playCorrectSFX();
        triggerPunch(fighterLeft, fighterRight);
        secondChance = false;

        // Move to next question (or check win/lose)
        setTimeout(() => {
          if (hp <= 0) {
            playLoseSFX();
            gameoverStats.textContent = `Correct: ${correctCount}  |  Wrong: ${wrongCount}`;
            showScreen(gameoverScreen);
          } else if (hp >= 100) {
            playWinSFX();
            winStats.textContent = `Correct: ${correctCount}  |  Wrong: ${wrongCount}`;
            showScreen(winScreen);
            triggerVillainCutscene();
          } else {
            generateQuestion();
          }
          isProcessing = false;
        }, 700);
      } else {
        // Still wrong — keep the trick visible, let them try again
        feedbackEl.textContent = 'Not yet — try again!';
        feedbackEl.className = 'feedback wrong';
        playWrongSFX();
        answerInput.value = '';
        setTimeout(() => {
          answerInput.focus();
          isProcessing = false;
        }, 400);
      }
      return;
    }

    // === First attempt ===
    if (userAnswer === currentAnswer) {
      // Correct
      hp += 1;
      correctCount++;
      correctStreak++;
      updateStreakBar();
      correctCountEl.textContent = correctCount;
      feedbackEl.textContent = 'Correct!';
      feedbackEl.className = 'feedback correct';
      trickHintEl.textContent = '';
      trickHintEl.classList.remove('visible');
      playCorrectSFX();
      triggerPunch(fighterLeft, fighterRight);

      // 50 in a row — archery (Round 2 only)!
      if (correctStreak === 50 && gameRound === 2 && !archeryActive) {
        setTimeout(() => triggerArchery(), 300);
      }
      // 40 in a row — airstrike (R1), coconut (R2), arm wrestle (R3), sun launch (R4)!
      else if (correctStreak === 40) {
        if (gameRound >= 4 && !sunLaunchActive) {
          setTimeout(() => triggerSunLaunch(), 300);
        } else if (gameRound === 3 && !armWrestleActive) {
          setTimeout(() => triggerArmWrestle(), 300);
        } else if (gameRound === 2 && !coconutActive) {
          setTimeout(() => triggerCoconut(), 300);
        } else if (gameRound === 1 && !airstrikeActive) {
          setTimeout(() => triggerAirstrike(), 300);
        }
      }
      // 30 in a row — tank (R1), boulder (R2), banana (R3), specimen jar (R4)!
      else if (correctStreak === 30) {
        if (gameRound >= 4 && !jarActive) {
          setTimeout(() => triggerJarTrap(), 300);
        } else if (gameRound === 3 && !bananaActive) {
          setTimeout(() => triggerBanana(), 300);
        } else if (gameRound === 2 && !boulderActive) {
          setTimeout(() => triggerBoulderCrush(), 300);
        } else if (gameRound === 1 && !tankActive) {
          setTimeout(() => triggerTankCrush(), 300);
        }
      }
      // 20 in a row — sniper (R1), mortar (R2), tower (R3), UFO crash (R4)!
      else if (correctStreak === 20) {
        if (gameRound >= 4 && !ufoActive) {
          setTimeout(() => triggerUfoCrash(), 300);
        } else if (gameRound === 3 && !towerActive) {
          setTimeout(() => triggerTowerDemolition(), 300);
        } else if (gameRound === 2 && !mortarActive) {
          setTimeout(() => triggerMortar(), 300);
        } else if (gameRound === 1 && !sniperActive) {
          setTimeout(() => triggerSniperHeadshot(), 300);
        }
      }
      // 10 in a row — flamethrower (R1), electrocution (R2), yacht shark (R3), black hole (R4)!
      else if (correctStreak === 10) {
        if (gameRound >= 4 && !blackholeActive) {
          setTimeout(() => triggerBlackHole(), 300);
        } else if (gameRound >= 3 && !yachtActive) {
          setTimeout(() => triggerYacht(), 300);
        } else if (gameRound === 2 && !electroActive) {
          setTimeout(() => triggerElectrocution(), 300);
        } else if (gameRound === 1 && !flamethrowerActive) {
          setTimeout(() => triggerFlamethrower(), 300);
        }
      }
      // 5 in a row — decapitation (R1), firework (R2), whack-a-mole (R3), shrink ray (R4)!
      else if (correctStreak === 5) {
        if (gameRound >= 4 && !shrinkActive) {
          setTimeout(() => triggerShrinkRay(), 300);
        } else if (gameRound >= 3 && !moleActive) {
          setTimeout(() => triggerMole(), 300);
        } else if (gameRound === 2 && !fireworkLaunchActive) {
          setTimeout(() => triggerFireworkLaunch(), 300);
        } else if (gameRound === 1 && !decapitationActive) {
          setTimeout(() => triggerDecapitation(), 300);
        }
      }

      // Move to next question
      setTimeout(() => {
        if (hp >= 100) {
          playWinSFX();
          winStats.textContent = `Correct: ${correctCount}  |  Wrong: ${wrongCount}`;
          showScreen(winScreen);
          triggerVillainCutscene();
        } else {
          generateQuestion();
        }
        isProcessing = false;
      }, 700);
    } else {
      // Wrong — show trick and give second chance
      hp -= 1;
      wrongCount++;
      correctStreak = 0;
      updateStreakBar();
      wrongCountEl.textContent = wrongCount;
      updateHP();

      feedbackEl.textContent = 'Not quite...';
      feedbackEl.className = 'feedback wrong';
      const trick = getTrick(currentA, currentB);
      trickHintEl.innerHTML = trick + '<span class="second-chance-label">Try again!</span>';
      trickHintEl.classList.add('visible');
      playWrongSFX();
      triggerPunch(fighterRight, fighterLeft);

      // Read the trick aloud after a short delay so punch SFX plays first
      setTimeout(() => speakTrick(trick), 600);

      // Enable second chance — don't advance
      secondChance = true;
      answerInput.value = '';

      // Check if game over from this HP loss
      if (hp <= 0) {
        setTimeout(() => {
          playLoseSFX();
          gameoverStats.textContent = `Correct: ${correctCount}  |  Wrong: ${wrongCount}`;
          showScreen(gameoverScreen);
          secondChance = false;
          isProcessing = false;
        }, 700);
        return;
      }

      setTimeout(() => {
        answerInput.focus();
        isProcessing = false;
      }, 400);
      return;
    }

    updateHP();
  }

  // === Fireworks (canvas) ===
  // === Villain Cutscene (Win) ===
  const villainCutscene = document.getElementById('villain-cutscene');
  const cutsceneEnemy = document.getElementById('cutscene-enemy');
  const cutsceneOgre = document.getElementById('cutscene-ogre');
  const cutsceneDialogue = document.getElementById('cutscene-dialogue');
  const dialogueSpeaker = document.getElementById('dialogue-speaker');
  const dialogueText = document.getElementById('dialogue-text');
  const cutsceneEnemyName = document.getElementById('cutscene-enemy-name');
  const cutsceneVillainName = document.getElementById('cutscene-villain-name');
  const cutsceneOgreBody = document.getElementById('cutscene-ogre-body');
  const cutsceneDevilBody = document.getElementById('cutscene-devil-body');
  const cutsceneAlienBody = document.getElementById('cutscene-alien-body');
  const winContent = document.getElementById('win-content');

  function typeText(el, text, speed = 35) {
    return new Promise(resolve => {
      el.textContent = '';
      el.classList.remove('done');
      let i = 0;
      const interval = setInterval(() => {
        el.textContent += text[i];
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          el.classList.add('done');
          resolve();
        }
      }, speed);
    });
  }

  function triggerVillainCutscene() {
    // Update enemy name in cutscene
    cutsceneEnemyName.textContent = enemyName || 'Enemy';
    if (gameRound > 1) {
      const defeated = fighterRight.querySelector('.karate-svg').cloneNode(true);
      defeated.setAttribute('width', '100');
      defeated.setAttribute('height', '133');
      cutsceneEnemy.querySelector('svg').replaceWith(defeated);
    }

    // Show the right villain (Ogre after Round 1, Devil after Round 2)
    if (gameRound === 1) {
      cutsceneOgreBody.style.display = '';
      cutsceneDevilBody.style.display = 'none';
      cutsceneAlienBody.style.display = 'none';
      cutsceneVillainName.textContent = 'Ogre';
    } else if (gameRound === 2) {
      cutsceneOgreBody.style.display = 'none';
      cutsceneDevilBody.style.display = '';
      cutsceneAlienBody.style.display = 'none';
      cutsceneVillainName.textContent = 'Devil';
    } else {
      cutsceneOgreBody.style.display = 'none';
      cutsceneDevilBody.style.display = 'none';
      cutsceneAlienBody.style.display = '';
      cutsceneVillainName.textContent = 'Alien Overlord';
      if (gameRound === 4) {
        cutsceneAlienBody.replaceChildren(fighterLeft.querySelector('.karate-svg').cloneNode(true));
        cutsceneVillainName.textContent = 'Yonah';
      }
    }

    // Reset state
    villainCutscene.style.display = '';
    winContent.style.display = 'none';
    cutsceneEnemy.classList.remove('visible');
    cutsceneOgre.classList.remove('visible');
    cutsceneDialogue.classList.remove('visible');
    dialogueText.textContent = '';
    dialogueText.classList.remove('done');
    dialogueSpeaker.textContent = '';

    // Phase 1 (0.5s): Enemy fades in
    setTimeout(() => {
      cutsceneEnemy.classList.add('visible');
    }, 500);

    // Phase 2 (1.2s): Ogre fades in
    setTimeout(() => {
      cutsceneOgre.classList.add('visible');
    }, 1200);

    // Phase 3 (2s): Dialogue box appears, enemy speaks
    setTimeout(async () => {
      cutsceneDialogue.classList.add('visible');
      dialogueSpeaker.textContent = enemyName || 'Enemy';
      dialogueSpeaker.style.color = '#c0392b';

      let line1, line2, responder, responderColor, response;

      if (gameRound === 1) {
        // After Round 1 (enemy defeated), Ogre is summoned
        line1 = 'Yonah has defeated me at multiplications. But our evil cause lives on.';
        line2 = 'Now it is your turn to fight against him.';
        responder = 'Ogre'; responderColor = '#4a7a3a';
        response = 'GRRRAAAHH!! I will crush him!';
      } else if (gameRound === 2) {
        // After Round 2 (Ogre defeated), Devil is summoned
        line1 = 'Yonah defeated me too... This boy is unstoppable!';
        line2 = 'Only YOU can stop him now. Go, my lord. Destroy him!';
        responder = 'Devil'; responderColor = '#8b0000';
        response = 'Heh heh heh... Fresh souls to collect. I shall enjoy this.';
      } else if (gameRound === 3) {
        // After Round 3 (Devil defeated), Alien Overlord is summoned
        line1 = 'Even I, the Devil, could not defeat this child...';
        line2 = 'We need someone from beyond this world. Alien Overlord, you are our last hope!';
        responder = 'Alien Overlord'; responderColor = '#4a8a6a';
        response = 'Interesting... A human child who defeats gods and demons? I must study this specimen.';
      } else {
        line1 = 'My scanners confirm it. One hundred points!';
        line2 = 'Yonah, the galaxy concedes this match.';
        responder = 'Yonah'; responderColor = '#f0c35b';
        response = 'Good match! Time to choose my next opponent.';
      }

      await typeText(dialogueText, line1, 35);
      await new Promise(r => setTimeout(r, 1500));
      dialogueText.classList.remove('done');
      await typeText(dialogueText, line2, 35);
      await new Promise(r => setTimeout(r, 2000));
      dialogueSpeaker.textContent = responder;
      dialogueSpeaker.style.color = responderColor;
      dialogueText.classList.remove('done');
      await typeText(dialogueText, response, 45);

      // Leave the last line on screen before resetting the arena and its timers.
      await new Promise(r => setTimeout(r, 2500));
      window.location.reload();
    }, 2000);
  }

  function startFireworks() {
    const ctx = fireworksCanvas.getContext('2d');
    fireworksCanvas.width = window.innerWidth;
    fireworksCanvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#ffd700', '#ff6b6b', '#4af0c0', '#a06fdf', '#ff9f43', '#fff', '#54a0ff'];

    function createBurst(x, y) {
      const count = 40 + Math.floor(Math.random() * 30);
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
        const speed = 2 + Math.random() * 4;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.008 + Math.random() * 0.012,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 2 + Math.random() * 3
        });
      }
    }

    let lastBurst = 0;
    function animate(time) {
      ctx.fillStyle = 'rgba(10, 10, 26, 0.15)';
      ctx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

      // New burst every ~600ms
      if (time - lastBurst > 600) {
        createBurst(
          100 + Math.random() * (fireworksCanvas.width - 200),
          80 + Math.random() * (fireworksCanvas.height * 0.5)
        );
        lastBurst = time;
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // gravity
        p.life -= p.decay;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      fireworksRAF = requestAnimationFrame(animate);
    }

    // Initial burst
    createBurst(fireworksCanvas.width / 2, fireworksCanvas.height / 3);
    lastBurst = performance.now();
    fireworksRAF = requestAnimationFrame(animate);
  }

  function stopFireworks() {
    if (fireworksRAF) {
      cancelAnimationFrame(fireworksRAF);
      fireworksRAF = null;
    }
  }

  // === Game init ===
  function startGame() {
    ensureAudio();
    stopFireworks();
    hp = 50;
    correctCount = 0;
    wrongCount = 0;
    correctStreak = 0;
    updateStreakBar();
    decapitationActive = false;
    flamethrowerActive = false;
    sniperActive = false;
    tankActive = false;
    airstrikeActive = false;
    fireworkLaunchActive = false;
    electroActive = false;
    mortarActive = false;
    boulderActive = false;
    coconutActive = false;
    archeryActive = false;
    moleActive = false;
    yachtActive = false;
    towerActive = false;
    armWrestleActive = false;
    bananaActive = false;
    shrinkActive = false;
    blackholeActive = false;
    ufoActive = false;
    jarActive = false;
    sunLaunchActive = false;
    secondChance = false;
    correctCountEl.textContent = '0';
    wrongCountEl.textContent = '0';

    // Reset enemy head state
    const headGroup = fighterRight.querySelector('.enemy-head');
    const neckStump = fighterRight.querySelector('.neck-stump');
    if (headGroup) {
      headGroup.classList.remove('decapitated', 'regrowing');
    }
    if (neckStump) {
      neckStump.classList.remove('visible');
    }
    // Reset flamethrower state
    fighterRight.classList.remove('burning', 'ashes', 'recovering');
    const ftWeapon = fighterLeft.querySelector('.flamethrower-weapon');
    if (ftWeapon) ftWeapon.style.display = 'none';
    // Reset sniper overlay
    sniperOverlay.classList.remove('active', 'zooming-in', 'aiming', 'shot', 'blood-splatter');
    sniperOverlay.style.transition = '';
    sniperOverlay.style.opacity = '';
    // Reset tank overlay
    tankOverlay.classList.remove('active', 'driving', 'impact-shake');
    tankOverlay.style.transition = '';
    tankOverlay.style.opacity = '';
    updateHP();
    showScreen(gameScreen);
    generateQuestion();
  }

  // === Firework Launch (Round 2, 5-streak) ===
  const flOverlay = document.getElementById('firework-launch-overlay');
  const flYonah = document.getElementById('fl-yonah');
  const flOgreBundle = document.getElementById('fl-ogre-bundle');
  const flWick = document.getElementById('fl-wick');
  const flSparks = document.getElementById('fl-sparks');
  const flExhaust = document.getElementById('fl-exhaust');
  const flText = document.getElementById('fl-text');
  let fireworkLaunchActive = false;

  function playFuseHissSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;
      const bufLen = Math.floor(audioCtx.sampleRate * 2);
      const buf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 0.5);
      const src = audioCtx.createBufferSource();
      src.buffer = buf;
      const hp2 = audioCtx.createBiquadFilter();
      hp2.type = 'highpass'; hp2.frequency.value = 3000;
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(0.12, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 2);
      src.connect(hp2).connect(g).connect(audioCtx.destination);
      src.start(t); src.stop(t + 2);
    } catch (e) {}
  }

  function playRocketLaunchSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;
      // Roaring rocket
      const bufLen = Math.floor(audioCtx.sampleRate * 3);
      const buf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) d[i] = (Math.random() * 2 - 1);
      const src = audioCtx.createBufferSource(); src.buffer = buf;
      const bp = audioCtx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.setValueAtTime(200, t);
      bp.frequency.exponentialRampToValueAtTime(2000, t + 1.5);
      bp.frequency.exponentialRampToValueAtTime(4000, t + 3);
      bp.Q.value = 0.8;
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(0.01, t);
      g.gain.linearRampToValueAtTime(0.35, t + 0.5);
      g.gain.setValueAtTime(0.35, t + 1.5);
      g.gain.exponentialRampToValueAtTime(0.001, t + 3);
      src.connect(bp).connect(g).connect(audioCtx.destination);
      src.start(t); src.stop(t + 3);
      // Rising whistle
      const w = audioCtx.createOscillator();
      const wg = audioCtx.createGain();
      w.type = 'sine'; w.frequency.setValueAtTime(300, t);
      w.frequency.exponentialRampToValueAtTime(3000, t + 2.5);
      wg.gain.setValueAtTime(0.08, t);
      wg.gain.exponentialRampToValueAtTime(0.001, t + 2.5);
      w.connect(wg).connect(audioCtx.destination);
      w.start(t); w.stop(t + 2.5);
    } catch (e) {}
  }

  function triggerFireworkLaunch() {
    fireworkLaunchActive = true;

    // Reset all
    flOverlay.classList.remove('shaking');
    flYonah.classList.remove('visible', 'walk-in', 'step-back');
    flYonah.style.left = ''; flYonah.style.opacity = '';
    flOgreBundle.classList.remove('visible', 'liftoff');
    flWick.classList.remove('lit');
    flSparks.classList.remove('active'); flSparks.style.opacity = '0';
    flExhaust.classList.remove('active');
    flText.classList.remove('visible');

    flOverlay.classList.add('active');

    // Phase 1 (0.3s): Ogre with rockets appears in center
    setTimeout(() => flOgreBundle.classList.add('visible'), 300);

    // Phase 2 (1s): Yonah walks in from the left toward the fuse, holding a lit match
    setTimeout(() => {
      flYonah.classList.add('visible', 'walk-in');
    }, 1000);

    // Phase 3 (2.8s): Yonah reaches the fuse — light it! Fuse starts burning (3 seconds)
    setTimeout(() => {
      playFuseHissSFX();
      flWick.classList.add('lit');
      const wickRect = flWick.getBoundingClientRect();
      flSparks.style.left = (wickRect.left + wickRect.width / 2 - 6) + 'px';
      flSparks.style.top = (wickRect.top - 6) + 'px';
      flSparks.classList.add('active');
      // Yonah steps back
      flYonah.classList.remove('walk-in');
      flYonah.classList.add('step-back');
    }, 2800);

    // Phase 4 (5.8s): Fuse burned for 3s — BLAST OFF! Rockets ignite.
    setTimeout(() => {
      playRocketLaunchSFX();
      flSparks.classList.remove('active'); flSparks.style.opacity = '0';
      flOgreBundle.classList.remove('visible');
      flOgreBundle.classList.add('liftoff');
      flExhaust.classList.add('active');
      flOverlay.classList.add('shaking');
    }, 5800);

    // Phase 5 (6.5s): BLAST OFF! text
    setTimeout(() => flText.classList.add('visible'), 6500);

    // Phase 6 (9s): Fade out
    setTimeout(() => {
      flOverlay.style.transition = 'opacity 0.8s ease-out';
      flOverlay.style.opacity = '0';
    }, 9000);

    // Phase 7 (10s): Cleanup
    setTimeout(() => {
      flOverlay.classList.remove('active', 'shaking');
      flOverlay.style.transition = ''; flOverlay.style.opacity = '';
      flYonah.classList.remove('visible', 'walk-in', 'step-back');
      flYonah.style.left = ''; flYonah.style.opacity = '';
      flOgreBundle.classList.remove('visible', 'liftoff');
      flWick.classList.remove('lit');
      flSparks.classList.remove('active'); flSparks.style.opacity = '';
      flExhaust.classList.remove('active');
      flText.classList.remove('visible');

      fighterRight.classList.add('ashes');
      setTimeout(() => {
        fighterRight.classList.remove('ashes');
        fighterRight.classList.add('recovering');
        setTimeout(() => {
          fighterRight.classList.remove('recovering');
          fireworkLaunchActive = false;
        }, 800);
      }, 5000);
    }, 10000);
  }

  // === Electrocution SFX ===
  function playElectrocutionSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;
      const dur = 2.5;
      const sr = audioCtx.sampleRate;

      // Crackling noise: filtered white noise bandpass 2000-5000Hz
      const bufLen = Math.floor(sr * dur);
      const buf = audioCtx.createBuffer(1, bufLen, sr);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) d[i] = (Math.random() * 2 - 1);
      const noise = audioCtx.createBufferSource();
      noise.buffer = buf;
      const bp = audioCtx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(2000, t);
      bp.frequency.exponentialRampToValueAtTime(5000, t + 1.5);
      bp.frequency.exponentialRampToValueAtTime(2500, t + dur);
      bp.Q.value = 1.5;
      const ng = audioCtx.createGain();
      ng.gain.setValueAtTime(0.0, t);
      ng.gain.linearRampToValueAtTime(0.3, t + 0.05);
      ng.gain.setValueAtTime(0.3, t + dur - 0.3);
      ng.gain.exponentialRampToValueAtTime(0.001, t + dur);
      noise.connect(bp).connect(ng).connect(audioCtx.destination);
      noise.start(t); noise.stop(t + dur);

      // 60Hz mains hum oscillator
      const osc = audioCtx.createOscillator();
      const og = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = 60;
      og.gain.setValueAtTime(0.0, t);
      og.gain.linearRampToValueAtTime(0.12, t + 0.08);
      og.gain.setValueAtTime(0.12, t + dur - 0.4);
      og.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(og).connect(audioCtx.destination);
      osc.start(t); osc.stop(t + dur);

      // High harmonic crackle oscillator for extra bite
      const osc2 = audioCtx.createOscillator();
      const og2 = audioCtx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(180, t);
      osc2.frequency.setValueAtTime(240, t + 0.3);
      osc2.frequency.setValueAtTime(180, t + 0.6);
      osc2.frequency.setValueAtTime(300, t + 1.0);
      osc2.frequency.setValueAtTime(180, t + 1.5);
      og2.gain.setValueAtTime(0.0, t);
      og2.gain.linearRampToValueAtTime(0.07, t + 0.05);
      og2.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc2.connect(og2).connect(audioCtx.destination);
      osc2.start(t); osc2.stop(t + dur);
    } catch (e) {}
  }

  // === Electrocution cutscene (Round 2, 10-streak) ===
  const electroOverlay   = document.getElementById('electro-overlay');
  const electroYonah     = document.getElementById('electro-yonah');
  const electroOgre      = document.getElementById('electro-ogre');
  const electroSkeleton  = document.getElementById('electro-skeleton');
  const electroBolts     = document.getElementById('electro-bolts');
  const electroText      = document.getElementById('electro-text');
  const cableBlack       = document.getElementById('cable-black');
  const cableRed         = document.getElementById('cable-red');
  const electroCables    = document.getElementById('electro-cables');

  function triggerElectrocution() {
    electroActive = true;

    // Reset state
    electroOverlay.classList.remove('shaking');
    electroYonah.classList.remove('visible', 'walk-in');
    electroOgre.classList.remove('visible', 'flash-white', 'flash-black');
    electroSkeleton.classList.remove('visible');
    electroBolts.classList.remove('active');
    electroText.classList.remove('visible');
    cableBlack.classList.remove('connected');
    cableRed.classList.remove('connected');
    cableBlack.setAttribute('d', '');
    cableRed.setAttribute('d', '');
    electroOverlay.style.transition = '';
    electroOverlay.style.opacity = '';

    electroOverlay.classList.add('active');

    // Phase 1 (0.3s): Ogre appears in center
    setTimeout(() => {
      electroOgre.classList.add('visible');
    }, 300);

    // Phase 2 (1s): Yonah walks in from left carrying battery
    setTimeout(() => {
      electroYonah.classList.add('visible', 'walk-in');
    }, 1000);

    // Phase 3 (2.5s): First cable (black/minus) connects to ogre's left arm
    setTimeout(() => {
      // Compute cable path using viewport positions
      const ogreRect   = electroOgre.getBoundingClientRect();
      const overlayRect = electroOverlay.getBoundingClientRect();
      const cablesSVG  = electroCables;

      // Battery approx position: Yonah is at left ~12%, battery is to his right
      const bx = overlayRect.width * 0.22;
      const by = overlayRect.height * 0.42;
      // Ogre left arm approx: left ~40% + a bit left of center
      const ox = ogreRect.left - overlayRect.left + 8;
      const oy = ogreRect.top  - overlayRect.top  + ogreRect.height * 0.45;

      const mx = (bx + ox) / 2;
      const my = Math.min(by, oy) - 60;
      const dBlack = `M${bx},${by} Q${mx},${my} ${ox},${oy}`;
      cableBlack.setAttribute('d', dBlack);
      // Measure path length for animation
      try {
        const len = cableBlack.getTotalLength ? cableBlack.getTotalLength() : 300;
        cableBlack.style.strokeDasharray = len;
        cableBlack.style.strokeDashoffset = len;
        cableBlack.style.transition = 'stroke-dashoffset 1s ease-in-out';
        requestAnimationFrame(() => { cableBlack.style.strokeDashoffset = 0; });
      } catch (e) {
        cableBlack.classList.add('connected');
      }
    }, 2500);

    // Phase 4 (4s): Second cable (red/plus) connects to ogre's right arm
    setTimeout(() => {
      const ogreRect    = electroOgre.getBoundingClientRect();
      const overlayRect = electroOverlay.getBoundingClientRect();

      const bx = overlayRect.width * 0.25;
      const by = overlayRect.height * 0.40;
      const ox = ogreRect.right - overlayRect.left - 8;
      const oy = ogreRect.top   - overlayRect.top  + ogreRect.height * 0.45;

      const mx = (bx + ox) / 2;
      const my = Math.min(by, oy) - 40;
      const dRed = `M${bx},${by} Q${mx},${my} ${ox},${oy}`;
      cableRed.setAttribute('d', dRed);
      try {
        const len = cableRed.getTotalLength ? cableRed.getTotalLength() : 300;
        cableRed.style.strokeDasharray = len;
        cableRed.style.strokeDashoffset = len;
        cableRed.style.transition = 'stroke-dashoffset 1s ease-in-out';
        requestAnimationFrame(() => { cableRed.style.strokeDashoffset = 0; });
      } catch (e) {
        cableRed.classList.add('connected');
      }
    }, 4000);

    // Phase 5 (4.5s): ELECTROCUTION! Start flashing ogre white/black with skeleton
    let flashInterval = null;
    let flashStep = 0;
    setTimeout(() => {
      playElectrocutionSFX();
      electroBolts.classList.add('active');
      electroOverlay.classList.add('shaking');

      flashInterval = setInterval(() => {
        flashStep++;
        electroOgre.classList.remove('flash-white', 'flash-black');
        electroSkeleton.classList.remove('visible');

        if (flashStep % 3 === 0) {
          // Normal ogre
        } else if (flashStep % 3 === 1) {
          electroOgre.classList.add('flash-white');
          electroSkeleton.classList.add('visible');
        } else {
          electroOgre.classList.add('flash-black');
        }
      }, 100);

      // Stop flashing after 2.5s (Phase 6 = 7s)
      setTimeout(() => {
        clearInterval(flashInterval);
        electroOgre.classList.remove('flash-white', 'flash-black');
        electroSkeleton.classList.remove('visible');
        electroOverlay.classList.remove('shaking');
        electroBolts.classList.remove('active');
      }, 2500);
    }, 4500);

    // Phase 6 (7s): "ZAPPED!" text
    setTimeout(() => {
      electroText.classList.add('visible');
    }, 7000);

    // Phase 7 (9s): Fade overlay
    setTimeout(() => {
      electroOverlay.style.transition = 'opacity 0.8s ease-out';
      electroOverlay.style.opacity = '0';
    }, 9000);

    // Phase 8 (10s): Cleanup + ogre turns to ashes, recovers after 5s
    setTimeout(() => {
      electroOverlay.classList.remove('active', 'shaking');
      electroOverlay.style.transition = '';
      electroOverlay.style.opacity = '';
      electroYonah.classList.remove('visible', 'walk-in');
      electroOgre.classList.remove('visible', 'flash-white', 'flash-black');
      electroSkeleton.classList.remove('visible');
      electroBolts.classList.remove('active');
      electroText.classList.remove('visible');
      cableBlack.setAttribute('d', '');
      cableRed.setAttribute('d', '');

      fighterRight.classList.add('ashes');
      setTimeout(() => {
        fighterRight.classList.remove('ashes');
        fighterRight.classList.add('recovering');
        setTimeout(() => {
          fighterRight.classList.remove('recovering');
          electroActive = false;
        }, 800);
      }, 5000);
    }, 10000);
  }


  // ============================================================
  // MORTAR CUTSCENE (Round 2, 20-streak)
  // ============================================================
  const mortarOverlay   = document.getElementById('mortar-overlay');
  const mortarYonah     = document.getElementById('mortar-yonah');
  const mortarTube      = document.getElementById('mortar-tube');
  const mortarShellEl   = document.getElementById('mortar-shell');
  const mortarOgre      = document.getElementById('mortar-ogre');
  const mortarSmoke     = document.getElementById('mortar-smoke');
  const mortarExplosion = document.getElementById('mortar-explosion');
  const mortarFlash     = document.getElementById('mortar-flash');
  const mortarText      = document.getElementById('mortar-text');

  function playMortarFireSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;

      // Deep "THOOMP" — low osc with fast attack/decay
      const osc = audioCtx.createOscillator();
      const oscG = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.5);
      oscG.gain.setValueAtTime(0, t);
      oscG.gain.linearRampToValueAtTime(0.55, t + 0.03);
      oscG.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.connect(oscG).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.5);

      // Noise burst through lowpass at 400 Hz
      const bufLen = Math.floor(audioCtx.sampleRate * 0.5);
      const buf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 2);
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buf;
      const lp = audioCtx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(400, t);
      const ng = audioCtx.createGain();
      ng.gain.setValueAtTime(0.4, t);
      ng.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      noise.connect(lp).connect(ng).connect(audioCtx.destination);
      noise.start(t);
      noise.stop(t + 0.5);
    } catch (e) { /* ignore */ }
  }

  function triggerMortar() {
    mortarActive = true;

    // Reset all state
    mortarOverlay.classList.remove('shaking');
    mortarYonah.classList.remove('visible');
    mortarTube.classList.remove('visible');
    mortarShellEl.classList.remove('flying');
    mortarOgre.classList.remove('visible', 'hit-flash');
    mortarSmoke.classList.remove('active');
    mortarExplosion.classList.remove('active');
    mortarFlash.classList.remove('active');
    mortarText.classList.remove('visible');
    mortarShellEl.style.opacity = '0';
    mortarOverlay.style.opacity = '';
    mortarOverlay.style.transition = '';

    // Phase 1 (0.3s): Show overlay, Ogre appears on right
    mortarOverlay.classList.add('active');
    setTimeout(() => {
      mortarOgre.classList.add('visible');
    }, 300);

    // Phase 2 (1s): Yonah + mortar slide in from left
    setTimeout(() => {
      mortarYonah.classList.add('visible');
      mortarTube.classList.add('visible');
    }, 1000);

    // Phase 3 (2s): Yonah "drops shell" — THOOMP + smoke puff
    setTimeout(() => {
      playMortarFireSFX();
      mortarSmoke.classList.add('active');
    }, 2000);

    // Phase 4 (2.3s): Shell begins parabolic flight
    setTimeout(() => {
      mortarShellEl.style.opacity = '1';
      mortarShellEl.classList.add('flying');
    }, 2300);

    // Phase 5 (4.3s): Shell impacts ogre — EXPLOSION!
    setTimeout(() => {
      // Hide shell at impact
      mortarShellEl.style.opacity = '0';
      mortarShellEl.classList.remove('flying');
      // Flash + fireball + shake
      mortarFlash.classList.add('active');
      mortarExplosion.classList.add('active');
      mortarOverlay.classList.add('shaking');
      mortarOgre.classList.add('hit-flash');
      playExplosionSFX();
    }, 4300);

    // Phase 6 (5.5s): BOOM! text
    setTimeout(() => {
      mortarText.classList.add('visible');
    }, 5500);

    // Phase 7 (7.5s): Fade overlay
    setTimeout(() => {
      mortarOverlay.style.transition = 'opacity 0.8s ease-out';
      mortarOverlay.style.opacity = '0';
    }, 7500);

    // Phase 8 (8.5s): Cleanup + ogre turns to ashes in arena
    setTimeout(() => {
      mortarOverlay.classList.remove('active', 'shaking');
      mortarOverlay.style.opacity = '';
      mortarOverlay.style.transition = '';
      mortarYonah.classList.remove('visible');
      mortarTube.classList.remove('visible');
      mortarOgre.classList.remove('visible', 'hit-flash');
      mortarSmoke.classList.remove('active');
      mortarExplosion.classList.remove('active');
      mortarFlash.classList.remove('active');
      mortarText.classList.remove('visible');
      mortarShellEl.style.opacity = '';
      mortarShellEl.classList.remove('flying');

      // Ogre → ashes in the arena
      fighterRight.classList.add('ashes');

      // Recover after 5s
      setTimeout(() => {
        fighterRight.classList.remove('ashes');
        fighterRight.classList.add('recovering');
        setTimeout(() => {
          fighterRight.classList.remove('recovering');
          mortarActive = false;
        }, 800);
      }, 5000);
    }, 8500);
  }


  // ============================================================
  // TOWER DEMOLITION CUTSCENE (Round 3, 20-streak)
  // ============================================================
  const towerOverlay       = document.getElementById('tower-overlay');
  const towerYonah         = document.getElementById('tower-yonah');
  const towerYonahPushed   = document.getElementById('tower-yonah-pushed');
  const towerWire          = document.getElementById('tower-wire');
  const towerStructure     = document.getElementById('tower-structure');
  const towerDevilTop      = document.getElementById('tower-devil-top');
  const towerExplosionEl   = document.getElementById('tower-explosion');
  const towerDebrisEl      = document.getElementById('tower-debris');
  const towerCollapseEl    = document.getElementById('tower-collapse-tower');
  const towerDevilFalling  = document.getElementById('tower-devil-falling');
  const towerDust          = document.getElementById('tower-dust');
  const towerFlash         = document.getElementById('tower-flash');
  const towerKaboom        = document.getElementById('tower-kaboom');

  // Create devil impact div dynamically
  let towerDevilImpact = null;

  function playDetonatorClickSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;

      // Short noise burst (mechanical click body)
      const bufLen = Math.floor(audioCtx.sampleRate * 0.05);
      const buf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 3);
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buf;
      const lp = audioCtx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(1800, t);
      const ng = audioCtx.createGain();
      ng.gain.setValueAtTime(0.25, t);
      ng.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      noise.connect(lp).connect(ng).connect(audioCtx.destination);
      noise.start(t);
      noise.stop(t + 0.05);

      // Click tone at 400Hz (30ms)
      const osc = audioCtx.createOscillator();
      const oscG = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, t);
      oscG.gain.setValueAtTime(0, t);
      oscG.gain.linearRampToValueAtTime(0.15, t + 0.004);
      oscG.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      osc.connect(oscG).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.03);
    } catch (e) { /* ignore */ }
  }

  function playTowerExplosionSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;

      // Giant noise burst through lowpass 300Hz — the deep BOOM
      const bufLen2 = Math.floor(audioCtx.sampleRate * 2.0);
      const buf2 = audioCtx.createBuffer(1, bufLen2, audioCtx.sampleRate);
      const d2 = buf2.getChannelData(0);
      for (let i = 0; i < bufLen2; i++) {
        d2[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen2, 1.4);
      }
      const boom = audioCtx.createBufferSource();
      boom.buffer = buf2;
      const lp2 = audioCtx.createBiquadFilter();
      lp2.type = 'lowpass';
      lp2.frequency.setValueAtTime(300, t);
      const bg = audioCtx.createGain();
      bg.gain.setValueAtTime(0.8, t);
      bg.gain.exponentialRampToValueAtTime(0.001, t + 2.0);
      boom.connect(lp2).connect(bg).connect(audioCtx.destination);
      boom.start(t);
      boom.stop(t + 2.0);

      // Sub bass at 50Hz — felt in the chest
      const sub = audioCtx.createOscillator();
      const subG = audioCtx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(50, t);
      sub.frequency.exponentialRampToValueAtTime(20, t + 2.0);
      subG.gain.setValueAtTime(0, t);
      subG.gain.linearRampToValueAtTime(0.7, t + 0.04);
      subG.gain.exponentialRampToValueAtTime(0.001, t + 2.0);
      sub.connect(subG).connect(audioCtx.destination);
      sub.start(t);
      sub.stop(t + 2.0);

      // Rumble at 30Hz — the aftermath
      const rumble = audioCtx.createOscillator();
      const rg = audioCtx.createGain();
      rumble.type = 'sawtooth';
      rumble.frequency.setValueAtTime(30, t + 0.3);
      rg.gain.setValueAtTime(0, t + 0.3);
      rg.gain.linearRampToValueAtTime(0.4, t + 0.5);
      rg.gain.exponentialRampToValueAtTime(0.001, t + 3.0);
      rumble.connect(rg).connect(audioCtx.destination);
      rumble.start(t + 0.3);
      rumble.stop(t + 3.0);

      // Stone crumble — highpass noise at 800Hz
      const bufLen3 = Math.floor(audioCtx.sampleRate * 1.0);
      const buf3 = audioCtx.createBuffer(1, bufLen3, audioCtx.sampleRate);
      const d3 = buf3.getChannelData(0);
      for (let i = 0; i < bufLen3; i++) {
        d3[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen3, 0.8);
      }
      const crumble = audioCtx.createBufferSource();
      crumble.buffer = buf3;
      const hp = audioCtx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(800, t + 0.5);
      const cg = audioCtx.createGain();
      cg.gain.setValueAtTime(0.35, t + 0.5);
      cg.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
      crumble.connect(hp).connect(cg).connect(audioCtx.destination);
      crumble.start(t + 0.5);
      crumble.stop(t + 1.5);
    } catch (e) { /* ignore */ }
  }

  function triggerTowerDemolition() {
    towerActive = true;

    // Reset all state
    towerOverlay.classList.remove('shaking', 'active');
    towerYonah.classList.remove('visible');
    towerYonahPushed.classList.remove('visible');
    towerDevilTop.classList.remove('visible', 'smug');
    towerExplosionEl.classList.remove('active');
    towerDebrisEl.querySelectorAll('.debris-chunk').forEach(c => c.classList.remove('flying'));
    towerCollapseEl.classList.remove('collapsing');
    towerDevilFalling.classList.remove('falling');
    towerDust.classList.remove('active');
    towerFlash.classList.remove('active');
    towerKaboom.classList.remove('visible');
    towerStructure.style.display = '';
    towerStructure.style.opacity = '';
    towerCollapseEl.style.display = 'none';
    towerDevilFalling.style.opacity = '0';
    towerOverlay.style.opacity = '';
    towerOverlay.style.transition = '';

    // Remove old impact div if any
    if (towerDevilImpact) {
      towerDevilImpact.remove();
      towerDevilImpact = null;
    }

    // Phase 1 (0.3s): Show overlay — tower + sky visible
    towerOverlay.classList.add('active');

    // Phase 2 (0.5s): Yonah slides in, devil appears on tower
    setTimeout(() => {
      towerYonah.classList.add('visible');
    }, 500);
    setTimeout(() => {
      towerDevilTop.classList.add('visible');
      setTimeout(() => towerDevilTop.classList.add('smug'), 400);
    }, 800);

    // Phase 3 (1.5s): Yonah readies detonator (small lean forward — already baked in CSS pose)
    // No extra class needed — detonator is held visibly from the start

    // Phase 4 (2.5s): Yonah PUSHES plunger
    setTimeout(() => {
      playDetonatorClickSFX();
      // Swap to pushed version
      towerYonah.classList.remove('visible');
      towerYonahPushed.classList.add('visible');
    }, 2500);

    // Phase 5 (2.8s): EXPLOSION! Flash + fireball + shake
    setTimeout(() => {
      playTowerExplosionSFX();
      towerFlash.classList.add('active');
      towerExplosionEl.classList.add('active');
      towerOverlay.classList.add('shaking');
      // Hide tower static
      towerStructure.style.opacity = '0';
      towerDevilTop.classList.remove('visible', 'smug');
      towerDevilTop.style.opacity = '0';
    }, 2800);

    // Phase 6 (3.3s): Tower collapses
    setTimeout(() => {
      towerCollapseEl.style.display = '';
      towerCollapseEl.classList.add('collapsing');
    }, 3300);

    // Phase 7 (3.5s): Devil falls tumbling from top
    setTimeout(() => {
      towerDevilFalling.style.opacity = '1';
      towerDevilFalling.classList.add('falling');
    }, 3500);

    // Phase 8 (4.5s): Debris flying
    setTimeout(() => {
      towerDebrisEl.querySelectorAll('.debris-chunk').forEach((c, i) => {
        setTimeout(() => c.classList.add('flying'), i * 60);
      });
    }, 4500);

    // Phase 9 (5.0s): Dust cloud expands
    setTimeout(() => {
      towerDust.classList.add('active');
    }, 5000);

    // Phase 10 (5.5s): Devil crashes at ground — impact flash
    setTimeout(() => {
      towerDevilFalling.classList.remove('falling');
      towerDevilFalling.style.opacity = '0';
      // Create and show impact flash
      towerDevilImpact = document.createElement('div');
      towerDevilImpact.className = 'tower-devil-impact';
      towerOverlay.appendChild(towerDevilImpact);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          towerDevilImpact.classList.add('active');
        });
      });
    }, 5500);

    // Phase 11 (6.0s): KABOOM! text
    setTimeout(() => {
      towerKaboom.classList.add('visible');
    }, 6000);

    // Phase 12 (8.5s): Fade overlay
    setTimeout(() => {
      towerOverlay.style.transition = 'opacity 0.8s ease-out';
      towerOverlay.style.opacity = '0';
    }, 8500);

    // Phase 13 (9.5s): Cleanup — devil → ashes in arena, recover 5s
    setTimeout(() => {
      towerOverlay.classList.remove('active', 'shaking');
      towerOverlay.style.opacity = '';
      towerOverlay.style.transition = '';
      towerYonah.classList.remove('visible');
      towerYonahPushed.classList.remove('visible');
      towerDevilTop.classList.remove('visible', 'smug');
      towerDevilTop.style.opacity = '';
      towerExplosionEl.classList.remove('active');
      towerDebrisEl.querySelectorAll('.debris-chunk').forEach(c => c.classList.remove('flying'));
      towerCollapseEl.classList.remove('collapsing');
      towerCollapseEl.style.display = 'none';
      towerDevilFalling.classList.remove('falling');
      towerDevilFalling.style.opacity = '0';
      towerDust.classList.remove('active');
      towerFlash.classList.remove('active');
      towerKaboom.classList.remove('visible');
      towerStructure.style.opacity = '';
      if (towerDevilImpact) {
        towerDevilImpact.remove();
        towerDevilImpact = null;
      }

      // Devil → ashes in arena
      fighterRight.classList.add('ashes');

      // Recover after 5s
      setTimeout(() => {
        fighterRight.classList.remove('ashes');
        fighterRight.classList.add('recovering');
        setTimeout(() => {
          fighterRight.classList.remove('recovering');
          towerActive = false;
        }, 800);
      }, 5000);
    }, 9500);
  }


  // BOULDER CRUSH CUTSCENE (Round 2, 30-streak)
  // ============================================================
  const boulderOverlay  = document.getElementById('boulder-overlay');
  const boulderYonah    = document.getElementById('boulder-yonah');
  const boulderRock     = document.getElementById('boulder-rock');
  const boulderOgre     = document.getElementById('boulder-ogre');
  const boulderBlood    = document.getElementById('boulder-blood');
  const boulderText     = document.getElementById('boulder-text');

  function playBoulderGruntSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;
      // Short grunt: bandpass filtered noise burst, punchy
      const bufLen = Math.floor(audioCtx.sampleRate * 0.25);
      const buf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 1.8);
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buf;
      const bp = audioCtx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(600, t);
      bp.Q.value = 2;
      const ng = audioCtx.createGain();
      ng.gain.setValueAtTime(0, t);
      ng.gain.linearRampToValueAtTime(0.35, t + 0.02);
      ng.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      noise.connect(bp).connect(ng).connect(audioCtx.destination);
      noise.start(t);
      noise.stop(t + 0.25);
    } catch (e) { /* ignore */ }
  }

  function playBoulderFallSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;
      // Descending whoosh: white noise through bandpass sweeping 800Hz → 200Hz over 1.5s
      const bufLen = Math.floor(audioCtx.sampleRate * 1.5);
      const buf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) {
        d[i] = Math.random() * 2 - 1;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buf;
      const bp = audioCtx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(800, t);
      bp.frequency.exponentialRampToValueAtTime(200, t + 1.5);
      bp.Q.value = 1.5;
      const ng = audioCtx.createGain();
      ng.gain.setValueAtTime(0, t);
      ng.gain.linearRampToValueAtTime(0.45, t + 0.2);
      ng.gain.linearRampToValueAtTime(0.5, t + 1.2);
      ng.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
      noise.connect(bp).connect(ng).connect(audioCtx.destination);
      noise.start(t);
      noise.stop(t + 1.5);
    } catch (e) { /* ignore */ }
  }

  function playBoulderImpactSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;

      // Deep thud: 60Hz sine, fast attack/decay
      const osc = audioCtx.createOscillator();
      const oscG = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, t);
      osc.frequency.exponentialRampToValueAtTime(25, t + 0.5);
      oscG.gain.setValueAtTime(0, t);
      oscG.gain.linearRampToValueAtTime(0.9, t + 0.02);
      oscG.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.connect(oscG).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.5);

      // Crunch: noise burst through lowpass at 500Hz, 0.3s
      const bufLen2 = Math.floor(audioCtx.sampleRate * 0.3);
      const buf2 = audioCtx.createBuffer(1, bufLen2, audioCtx.sampleRate);
      const d2 = buf2.getChannelData(0);
      for (let i = 0; i < bufLen2; i++) {
        d2[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen2, 1.2);
      }
      const noise2 = audioCtx.createBufferSource();
      noise2.buffer = buf2;
      const lp = audioCtx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(500, t);
      const ng2 = audioCtx.createGain();
      ng2.gain.setValueAtTime(0.75, t);
      ng2.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      noise2.connect(lp).connect(ng2).connect(audioCtx.destination);
      noise2.start(t);
      noise2.stop(t + 0.3);
    } catch (e) { /* ignore */ }
  }

  function triggerBoulderCrush() {
    boulderActive = true;

    // Reset all state
    boulderOverlay.classList.remove('shaking');
    boulderYonah.classList.remove('visible', 'pushing');
    boulderRock.classList.remove('visible', 'falling');
    boulderOgre.classList.remove('visible', 'squished');
    boulderBlood.classList.remove('spreading');
    boulderText.classList.remove('visible');
    boulderOverlay.style.opacity = '';
    boulderOverlay.style.transition = '';

    // Phase 1 (0.3s): Show overlay. Cliff, ground, Ogre all appear.
    boulderOverlay.classList.add('active');
    setTimeout(() => {
      boulderOgre.classList.add('visible');
    }, 300);

    // Phase 2 (1s): Yonah appears at cliff top next to boulder.
    setTimeout(() => {
      boulderYonah.classList.add('visible');
      boulderRock.classList.add('visible');
    }, 1000);

    // Phase 3 (2.5s): Yonah pushes boulder — grunt SFX. Boulder nudges.
    setTimeout(() => {
      playBoulderGruntSFX();
      boulderYonah.classList.add('pushing');
    }, 2500);

    // Phase 4 (2.8s): Boulder tips and falls. Whoosh SFX.
    setTimeout(() => {
      playBoulderFallSFX();
      boulderRock.classList.add('falling');
    }, 2800);

    // Phase 5 (4.3s): IMPACT! Screen shake, impact SFX, ogre squishes flat.
    setTimeout(() => {
      boulderOverlay.classList.add('shaking');
      playBoulderImpactSFX();
      boulderOgre.classList.add('squished');
    }, 4300);

    // Phase 6 (4.8s): Blood puddle spreads outward.
    setTimeout(() => {
      boulderBlood.classList.add('spreading');
    }, 4800);

    // Phase 7 (5.5s): SQUISHED! text appears.
    setTimeout(() => {
      boulderText.classList.add('visible');
    }, 5500);

    // Phase 8 (8s): Fade overlay.
    setTimeout(() => {
      boulderOverlay.style.transition = 'opacity 0.8s ease-out';
      boulderOverlay.style.opacity = '0';
    }, 8000);

    // Phase 9 (9s): Cleanup. Ogre → ashes in arena, recovers after 5s.
    setTimeout(() => {
      boulderOverlay.classList.remove('active', 'shaking');
      boulderOverlay.style.opacity = '';
      boulderOverlay.style.transition = '';
      boulderYonah.classList.remove('visible', 'pushing');
      boulderRock.classList.remove('visible', 'falling');
      boulderOgre.classList.remove('visible', 'squished');
      boulderBlood.classList.remove('spreading');
      boulderText.classList.remove('visible');

      // Ogre → ashes in the arena
      fighterRight.classList.add('ashes');

      // Recover after 5s
      setTimeout(() => {
        fighterRight.classList.remove('ashes');
        fighterRight.classList.add('recovering');
        setTimeout(() => {
          fighterRight.classList.remove('recovering');
          boulderActive = false;
        }, 800);
      }, 5000);
    }, 9000);
  }


  // ================================================================
  // COCONUT BEACH CUTSCENE — Round 2, streak 40
  // ================================================================

  function playCoconutBonkSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;

      // Cartoony sine chirp: 800Hz → 400Hz with short attack/decay
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(380, t + 0.08);
      oscGain.gain.setValueAtTime(0, t);
      oscGain.gain.linearRampToValueAtTime(0.55, t + 0.015);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(oscGain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.2);

      // Small noise burst through bandpass for the "thud" texture
      const bufLen = Math.floor(audioCtx.sampleRate * 0.08);
      const noiseBuf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
      const nd = noiseBuf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) nd[i] = Math.random() * 2 - 1;
      const noiseSrc = audioCtx.createBufferSource();
      noiseSrc.buffer = noiseBuf;
      const bp = audioCtx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 900;
      bp.Q.value = 1.5;
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.35, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      noiseSrc.connect(bp).connect(noiseGain).connect(audioCtx.destination);
      noiseSrc.start(t);
    } catch (e) { /* audio errors are non-critical */ }
  }

  function triggerCoconut() {
    coconutActive = true;

    // Grab DOM elements
    const overlay   = document.getElementById('coconut-overlay');
    const yonah     = document.getElementById('coconut-yonah');
    const palm      = document.getElementById('coconut-palm');
    const ogreEl    = document.getElementById('coconut-ogre');
    const coconut   = document.getElementById('coconut-ball');
    const stars     = document.getElementById('coconut-stars');
    const bonkText  = document.getElementById('coconut-text');

    // Reset all state
    overlay.classList.remove('active');
    yonah.classList.remove('visible');
    palm.classList.remove('visible', 'shake');
    ogreEl.classList.remove('visible', 'dizzy');
    coconut.classList.remove('falling');
    stars.classList.remove('visible');
    bonkText.classList.remove('visible');
    overlay.style.opacity = '';
    overlay.style.transition = '';
    // Reset ogre eyes
    const normalEyes = ogreEl.querySelector('.ogre-normal-eyes');
    const dizzyEyes  = ogreEl.querySelector('.ogre-dizzy-eyes');
    if (normalEyes) normalEyes.style.display = '';
    if (dizzyEyes)  dizzyEyes.style.display  = 'none';

    // Phase 1 (0.3s): Show overlay — beach scene
    setTimeout(() => {
      overlay.classList.add('active');
    }, 300);

    // Phase 2 (1s): Yonah lounges on left, palm tree visible on right
    setTimeout(() => {
      yonah.classList.add('visible');
      palm.classList.add('visible');
    }, 1000);

    // Phase 3 (1.5s): Ogre appears sitting under palm tree
    setTimeout(() => {
      ogreEl.classList.add('visible');
    }, 1500);

    // Phase 4 (3s): Peaceful pause... then coconut detaches — palm shake
    setTimeout(() => {
      palm.classList.add('shake');
      setTimeout(() => palm.classList.remove('shake'), 420);

      // Position coconut at palm tree top, above ogre
      // Palm is positioned: right: 4%, bottom: 18%, size 160x310
      // We'll use viewport-relative positioning
      const palmRect = palm.getBoundingClientRect();
      const overlayRect = overlay.getBoundingClientRect();
      // Coconut start: roughly palm top-center (near fronds, the detaching one at ~right of cluster)
      const coconutStartX = palmRect.left - overlayRect.left + palmRect.width * 0.58 - 14;
      const coconutStartY = palmRect.top  - overlayRect.top  + palmRect.height * 0.10 - 14;

      // Ogre head position (ogre is right: 6%, bottom: 17%, size 100x115)
      const ogreRect = ogreEl.getBoundingClientRect();
      const ogreHeadY = ogreRect.top - overlayRect.top + 30; // top of head
      const fallDist = ogreHeadY - coconutStartY;

      coconut.style.left  = coconutStartX + 'px';
      coconut.style.top   = coconutStartY + 'px';
      coconut.style.setProperty('--fall-dist', fallDist + 'px');
      coconut.style.setProperty('--fall-duration', '0.8s');
      coconut.style.opacity = '1';
    }, 3000);

    // Phase 5 (3.3s): Coconut falls
    setTimeout(() => {
      coconut.classList.add('falling');
    }, 3300);

    // Phase 6 (4.1s): BONK! — impact effects
    setTimeout(() => {
      playCoconutBonkSFX();

      // Switch ogre to dizzy eyes
      if (normalEyes) normalEyes.style.display = 'none';
      if (dizzyEyes)  dizzyEyes.style.display  = '';

      // Ogre wobbles
      ogreEl.classList.add('dizzy');

      // Position stars above ogre's head and show them
      const ogreRect2   = ogreEl.getBoundingClientRect();
      const overlayRect2 = overlay.getBoundingClientRect();
      const starX = ogreRect2.left - overlayRect2.left + ogreRect2.width  * 0.5;
      const starY = ogreRect2.top  - overlayRect2.top  + 18;
      stars.style.left = starX + 'px';
      stars.style.top  = starY + 'px';
      stars.classList.add('visible');
    }, 4100);

    // Phase 7 (5s): BONK! text appears
    setTimeout(() => {
      bonkText.classList.add('visible');
    }, 5000);

    // Phase 8 (7.5s): Fade overlay
    setTimeout(() => {
      overlay.style.transition = 'opacity 0.8s ease-out';
      overlay.style.opacity    = '0';
    }, 7500);

    // Phase 9 (8.5s): Cleanup — ogre ashes → recover after 5s
    setTimeout(() => {
      overlay.classList.remove('active');
      overlay.style.opacity   = '';
      overlay.style.transition = '';
      yonah.classList.remove('visible');
      palm.classList.remove('visible');
      ogreEl.classList.remove('visible', 'dizzy');
      coconut.classList.remove('falling');
      coconut.style.opacity = '';
      stars.classList.remove('visible');
      bonkText.classList.remove('visible');
      if (normalEyes) normalEyes.style.display = '';
      if (dizzyEyes)  dizzyEyes.style.display  = 'none';

      // Enemy → ashes → recover
      fighterRight.classList.add('ashes');
      setTimeout(() => {
        fighterRight.classList.remove('ashes');
        fighterRight.classList.add('recovering');
        setTimeout(() => {
          fighterRight.classList.remove('recovering');
          coconutActive = false;
        }, 800);
      }, 5000);
    }, 8500);
  }


  // ─────────────────────────────────────────────────────────────
  //  SFX: Bow Twang
  // ─────────────────────────────────────────────────────────────
  function playBowTwangSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;
      // Fundamental plucked string at 200Hz — very fast decay (80ms)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(200, t);
      osc1.frequency.exponentialRampToValueAtTime(100, t + 0.08);
      gain1.gain.setValueAtTime(0.6, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc1.connect(gain1).connect(audioCtx.destination);
      osc1.start(t);
      osc1.stop(t + 0.09);

      // Harmonic at 400Hz — even faster
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(400, t);
      osc2.frequency.exponentialRampToValueAtTime(200, t + 0.05);
      gain2.gain.setValueAtTime(0.3, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      osc2.connect(gain2).connect(audioCtx.destination);
      osc2.start(t);
      osc2.stop(t + 0.07);
    } catch (e) { /* ignore audio errors */ }
  }

  // ─────────────────────────────────────────────────────────────
  //  SFX: Arrow Hit (meaty thwack)
  // ─────────────────────────────────────────────────────────────
  function playArrowHitSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;
      // Noise burst through lowpass at 600Hz (100ms)
      const bufferSize = Math.floor(audioCtx.sampleRate * 0.10);
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);
      const noise = audioCtx.createBufferSource();
      noise.buffer = noiseBuffer;
      const lp = audioCtx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 600;
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.7, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.10);
      noise.connect(lp).connect(noiseGain).connect(audioCtx.destination);
      noise.start(t);

      // Short sine thud at 150Hz (50ms)
      const thud = audioCtx.createOscillator();
      const thudGain = audioCtx.createGain();
      thud.type = 'sine';
      thud.frequency.setValueAtTime(150, t);
      thud.frequency.exponentialRampToValueAtTime(60, t + 0.05);
      thudGain.gain.setValueAtTime(0.5, t);
      thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      thud.connect(thudGain).connect(audioCtx.destination);
      thud.start(t);
      thud.stop(t + 0.07);
    } catch (e) { /* ignore audio errors */ }
  }

  // ─────────────────────────────────────────────────────────────
  //  ARCHERY CUTSCENE — Round 2, streak 50
  // ─────────────────────────────────────────────────────────────
  function triggerArchery() {
    archeryActive = true;

    const overlay   = document.getElementById('archery-overlay');
    const yonahEl   = document.getElementById('archery-yonah');
    const ogreEl    = document.getElementById('archery-ogre');
    const arrowEl   = document.getElementById('archery-arrow');
    const bloodEl   = document.getElementById('archery-blood');
    const arrowChest= document.getElementById('archery-arrow-chest');
    const bubbleEl  = document.getElementById('archery-bubble');

    // Reset all state
    overlay.classList.remove('active');
    yonahEl.classList.remove('visible');
    ogreEl.classList.remove('visible', 'hit');
    arrowEl.classList.remove('flying');
    arrowEl.style.opacity = '0';
    bloodEl.classList.remove('spurting');
    arrowChest.classList.remove('visible');
    bubbleEl.classList.remove('visible');
    overlay.style.opacity = '';
    overlay.style.transition = '';

    // Phase 1 (0.3s): Show overlay — outdoor grassy field
    setTimeout(() => {
      overlay.classList.add('active');
    }, 300);

    // Phase 2 (1.2s): Ogre appears on right, nervous, apple on head
    setTimeout(() => {
      ogreEl.classList.add('visible');
    }, 1200);

    // Phase 3 (2.0s): Yonah appears on left with bow, aiming
    setTimeout(() => {
      yonahEl.classList.add('visible');
    }, 2000);

    // Phase 4 (2.5s): Tension pause... Yonah releases — bow twang SFX
    setTimeout(() => {
      playBowTwangSFX();

      // Position arrow at Yonah's bow level, vertically at ogre chest height
      const overlayRect = overlay.getBoundingClientRect();
      const ogreRect = ogreEl.getBoundingClientRect();
      // Ogre chest is roughly 60% down from top of ogre element
      const chestY = ogreRect.top - overlayRect.top + ogreRect.height * 0.55;
      const arrowTop = chestY - 5; // center the 10px-tall arrow on chest height
      const arrowYPct = ((arrowTop / overlayRect.height) * 100).toFixed(1) + '%';

      arrowEl.style.setProperty('--arrow-y', arrowYPct);
      arrowEl.style.top = arrowYPct;
      arrowEl.style.left = '18%';
      arrowEl.style.opacity = '0';

      // Tiny delay then start flying
      setTimeout(() => {
        arrowEl.classList.add('flying');
      }, 80);
    }, 2500);

    // Phase 5 (3.1s): Arrow hits ogre's chest — thwack SFX, recoil, blood, arrow sticks
    setTimeout(() => {
      playArrowHitSFX();

      // Hide flying arrow, show stuck arrow in chest
      arrowEl.classList.remove('flying');
      arrowEl.style.opacity = '0';

      // Ogre recoils
      ogreEl.classList.add('hit');

      // Position blood at ogre's chest
      const overlayRect2 = overlay.getBoundingClientRect();
      const ogreRect2 = ogreEl.getBoundingClientRect();
      const chestX = ogreRect2.left - overlayRect2.left + ogreRect2.width * 0.3;
      const chestY2 = ogreRect2.top - overlayRect2.top + ogreRect2.height * 0.55;
      bloodEl.style.left = chestX + 'px';
      bloodEl.style.top = chestY2 + 'px';
      bloodEl.classList.add('spurting');

      // Position arrow stuck in chest (sticking out to the left)
      arrowChest.style.left = (chestX - 30) + 'px';
      arrowChest.style.top = (chestY2 - 5) + 'px';
      arrowChest.classList.add('visible');

    }, 3100);

    // Phase 6 (4.5s): Speech bubble appears from Yonah
    setTimeout(() => {
      // Position bubble above and to the right of Yonah
      const overlayRect3 = overlay.getBoundingClientRect();
      const yonahRect = yonahEl.getBoundingClientRect();
      const bubX = yonahRect.right - overlayRect3.left + 20;
      const bubY = yonahRect.top - overlayRect3.top + yonahRect.height * 0.15;
      bubbleEl.style.left = bubX + 'px';
      bubbleEl.style.top = bubY + 'px';
      bubbleEl.classList.add('visible');
    }, 4500);

    // Phase 7 (7.5s): Fade overlay
    setTimeout(() => {
      overlay.style.transition = 'opacity 0.8s ease-out';
      overlay.style.opacity = '0';
    }, 7500);

    // Phase 8 (8.5s): Cleanup — enemy → ashes → recover after 5s
    setTimeout(() => {
      overlay.classList.remove('active');
      overlay.style.opacity = '';
      overlay.style.transition = '';
      yonahEl.classList.remove('visible');
      ogreEl.classList.remove('visible', 'hit');
      arrowEl.classList.remove('flying');
      arrowEl.style.opacity = '0';
      bloodEl.classList.remove('spurting');
      arrowChest.classList.remove('visible');
      bubbleEl.classList.remove('visible');

      // Enemy → ashes → recover
      fighterRight.classList.add('ashes');
      setTimeout(() => {
        fighterRight.classList.remove('ashes');
        fighterRight.classList.add('recovering');
        setTimeout(() => {
          fighterRight.classList.remove('recovering');
          archeryActive = false;
        }, 800);
      }, 5000);
    }, 8500);
  }

  // === Round 2: Ogre ===
  const originalEnemySVG = fighterRight.querySelector('.fighter-body').innerHTML;

  const ogreSVG = `
    <svg viewBox="0 0 120 180" width="120" height="180" xmlns="http://www.w3.org/2000/svg" class="karate-svg">
      <!-- Massive body -->
      <rect x="20" y="55" width="80" height="65" rx="10" fill="#4a7a3a" stroke="#2a5a1a" stroke-width="2"/>
      <!-- Belly -->
      <ellipse cx="60" cy="90" rx="25" ry="15" fill="#5a8a4a" opacity="0.4"/>
      <!-- Belt -->
      <rect x="20" y="110" width="80" height="8" rx="3" fill="#5a3a1a" stroke="#3a2a0a" stroke-width="1"/>
      <rect x="50" y="108" width="16" height="12" rx="3" fill="#c0a040" stroke="#8a7020" stroke-width="1"/>
      <!-- Neck stump (hidden by default, shown on decapitation) -->
      <ellipse class="neck-stump" cx="60" cy="55" rx="14" ry="5" fill="#3a6a2a" opacity="0"/>
      <!-- Head group -->
      <g class="enemy-head">
        <circle cx="60" cy="35" r="26" fill="#4a7a3a" stroke="#2a5a1a" stroke-width="2"/>
        <!-- Bumps -->
        <circle cx="44" cy="14" r="7" fill="#4a7a3a" stroke="#2a5a1a" stroke-width="1.5"/>
        <circle cx="60" cy="10" r="8" fill="#4a7a3a" stroke="#2a5a1a" stroke-width="1.5"/>
        <circle cx="76" cy="14" r="7" fill="#4a7a3a" stroke="#2a5a1a" stroke-width="1.5"/>
        <!-- Ears -->
        <ellipse cx="33" cy="38" r="8" ry="11" fill="#4a7a3a" stroke="#2a5a1a" stroke-width="1.5"/>
        <ellipse cx="33" cy="38" rx="4" ry="6" fill="#3a6a2a"/>
        <ellipse cx="87" cy="38" r="8" ry="11" fill="#4a7a3a" stroke="#2a5a1a" stroke-width="1.5"/>
        <ellipse cx="87" cy="38" rx="4" ry="6" fill="#3a6a2a"/>
        <!-- Eyes -->
        <ellipse cx="50" cy="33" rx="7" ry="5" fill="#ffffcc"/>
        <circle cx="50" cy="34" r="3.5" fill="#8b0000"/>
        <circle cx="51" cy="33" r="1.2" fill="#fff"/>
        <ellipse cx="70" cy="33" rx="7" ry="5" fill="#ffffcc"/>
        <circle cx="70" cy="34" r="3.5" fill="#8b0000"/>
        <circle cx="71" cy="33" r="1.2" fill="#fff"/>
        <!-- Heavy brow -->
        <path d="M41 27 L57 25" stroke="#2a5a1a" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M63 25 L79 27" stroke="#2a5a1a" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Nose -->
        <ellipse cx="60" cy="42" rx="5" ry="3.5" fill="#3a6a2a" stroke="#2a5a1a" stroke-width="1"/>
        <!-- Mouth + tusks -->
        <path d="M46 50 Q60 58 74 50" fill="#2a1a0a" stroke="#2a5a1a" stroke-width="1.5"/>
        <rect x="47" y="44" width="5" height="10" rx="2" fill="#ffffdd" stroke="#cccc88" stroke-width="0.8"/>
        <rect x="68" y="44" width="5" height="10" rx="2" fill="#ffffdd" stroke="#cccc88" stroke-width="0.8"/>
      </g>
      <!-- Left arm -->
      <rect class="arm-left" x="0" y="62" width="24" height="14" rx="7" fill="#4a7a3a" stroke="#2a5a1a" stroke-width="2" transform-origin="20 69"/>
      <circle class="hand-left" cx="4" cy="69" r="9" fill="#4a7a3a" stroke="#2a5a1a" stroke-width="2"/>
      <!-- Right arm -->
      <rect class="arm-right" x="96" y="62" width="24" height="14" rx="7" fill="#4a7a3a" stroke="#2a5a1a" stroke-width="2" transform-origin="100 69"/>
      <circle class="hand-right" cx="116" cy="69" r="9" fill="#4a7a3a" stroke="#2a5a1a" stroke-width="2"/>
      <!-- Legs -->
      <rect x="30" y="118" width="20" height="42" rx="8" fill="#4a7a3a" stroke="#2a5a1a" stroke-width="2"/>
      <rect x="70" y="118" width="20" height="42" rx="8" fill="#4a7a3a" stroke="#2a5a1a" stroke-width="2"/>
      <!-- Feet -->
      <ellipse cx="40" cy="162" rx="13" ry="6" fill="#3a6a2a" stroke="#2a5a1a" stroke-width="1.5"/>
      <ellipse cx="80" cy="162" rx="13" ry="6" fill="#3a6a2a" stroke="#2a5a1a" stroke-width="1.5"/>
    </svg>
  `;

  function startRound2() {
    gameRound = 2;
    enemyName = 'Ogre';
    enemyNameLabel.textContent = 'Ogre';
    fighterRight.querySelector('.fighter-body').innerHTML = ogreSVG;
    startGame();
  }

  // === Round 3: Devil ===
  const devilSVG = `
    <svg viewBox="0 0 120 185" width="120" height="185" xmlns="http://www.w3.org/2000/svg" class="karate-svg">
      <!-- Neck stump -->
      <ellipse class="neck-stump" cx="60" cy="55" rx="14" ry="5" fill="#8b0000" opacity="0"/>

      <!-- Muscular body -->
      <rect x="26" y="56" width="68" height="62" rx="10" fill="#c0392b" stroke="#7a0000" stroke-width="2.5"/>
      <!-- Chest muscles -->
      <ellipse cx="45" cy="75" rx="14" ry="10" fill="#d84040" opacity="0.5"/>
      <ellipse cx="75" cy="75" rx="14" ry="10" fill="#d84040" opacity="0.5"/>
      <!-- Abs -->
      <ellipse cx="60" cy="95" rx="8" ry="5" fill="#d84040" opacity="0.4"/>
      <!-- Shoulder muscles (bulging) -->
      <circle cx="22" cy="62" r="12" fill="#c0392b" stroke="#7a0000" stroke-width="2"/>
      <circle cx="98" cy="62" r="12" fill="#c0392b" stroke="#7a0000" stroke-width="2"/>

      <!-- Head group -->
      <g class="enemy-head">
        <!-- Head -->
        <circle cx="60" cy="36" r="24" fill="#c0392b" stroke="#7a0000" stroke-width="2.5"/>
        <!-- Horns (large, curved) -->
        <path d="M42 18 Q30 0 36 -10 Q42 2 48 14Z" fill="#4a0000" stroke="#2a0000" stroke-width="1.5"/>
        <path d="M78 18 Q90 0 84 -10 Q78 2 72 14Z" fill="#4a0000" stroke="#2a0000" stroke-width="1.5"/>
        <!-- Horn sheen -->
        <path d="M44 16 Q36 4 39 -4" fill="none" stroke="#7a0000" stroke-width="1" opacity="0.5"/>
        <path d="M76 16 Q84 4 81 -4" fill="none" stroke="#7a0000" stroke-width="1" opacity="0.5"/>
        <!-- Angry brow -->
        <path d="M40 28 L52 32" stroke="#4a0000" stroke-width="3" stroke-linecap="round"/>
        <path d="M68 32 L80 28" stroke="#4a0000" stroke-width="3" stroke-linecap="round"/>
        <!-- Evil glowing eyes -->
        <ellipse cx="50" cy="37" rx="7" ry="6" fill="#ffffcc"/>
        <circle cx="50" cy="38" r="4" fill="#ff6600"/>
        <circle cx="50" cy="37" r="1.5" fill="#fff"/>
        <ellipse cx="70" cy="37" rx="7" ry="6" fill="#ffffcc"/>
        <circle cx="70" cy="38" r="4" fill="#ff6600"/>
        <circle cx="70" cy="37" r="1.5" fill="#fff"/>
        <!-- Evil grin -->
        <path d="M46 50 Q60 58 74 50" fill="#4a0000" stroke="#2a0000" stroke-width="2"/>
        <!-- Fangs -->
        <rect x="53" y="48" width="4" height="7" rx="2" fill="#ffffee" stroke="#ccc" stroke-width="0.5"/>
        <rect x="63" y="48" width="4" height="7" rx="2" fill="#ffffee" stroke="#ccc" stroke-width="0.5"/>
        <!-- Pointed ears -->
        <path d="M36 30 L28 22 L38 26Z" fill="#c0392b" stroke="#7a0000" stroke-width="1.5"/>
        <path d="M84 30 L92 22 L82 26Z" fill="#c0392b" stroke="#7a0000" stroke-width="1.5"/>
      </g>

      <!-- Left arm (punch arm) — muscular -->
      <rect class="arm-left" x="2" y="57" width="28" height="14" rx="7" fill="#c0392b" stroke="#7a0000" stroke-width="2" transform-origin="26 64"/>
      <!-- Left fist -->
      <circle class="hand-left" cx="6" cy="64" r="9" fill="#b03020" stroke="#7a0000" stroke-width="2"/>

      <!-- Right arm holding trident -->
      <rect class="arm-right" x="90" y="57" width="28" height="14" rx="7" fill="#c0392b" stroke="#7a0000" stroke-width="2" transform-origin="94 64"/>
      <!-- Right hand -->
      <circle class="hand-right" cx="114" cy="64" r="9" fill="#b03020" stroke="#7a0000" stroke-width="2"/>

      <!-- Trident (held in right hand) -->
      <g transform="translate(104, 8)">
        <!-- Shaft -->
        <rect x="-3" y="0" width="6" height="70" rx="2" fill="#8b6914" stroke="#5a4a10" stroke-width="1.5"/>
        <!-- Trident head -->
        <rect x="-2" y="-18" width="4" height="22" rx="1" fill="#888" stroke="#555" stroke-width="1.5"/>
        <!-- Left prong -->
        <rect x="-10" y="-12" width="3" height="15" rx="1" fill="#888" stroke="#555" stroke-width="1"/>
        <path d="M-10 -12 L-8 -18 L-7 -12Z" fill="#aaa" stroke="#555" stroke-width="1"/>
        <!-- Center prong tip -->
        <path d="M-2 -18 L0 -26 L2 -18Z" fill="#aaa" stroke="#555" stroke-width="1.5"/>
        <!-- Right prong -->
        <rect x="7" y="-12" width="3" height="15" rx="1" fill="#888" stroke="#555" stroke-width="1"/>
        <path d="M10 -12 L8 -18 L7 -12Z" fill="#aaa" stroke="#555" stroke-width="1"/>
        <!-- Shaft bottom cap -->
        <rect x="-4" y="70" width="8" height="6" rx="2" fill="#666" stroke="#444" stroke-width="1"/>
      </g>

      <!-- Muscular legs -->
      <rect x="30" y="116" width="22" height="45" rx="7" fill="#c0392b" stroke="#7a0000" stroke-width="2.5"/>
      <rect x="68" y="116" width="22" height="45" rx="7" fill="#c0392b" stroke="#7a0000" stroke-width="2.5"/>

      <!-- Hooves (instead of feet) -->
      <!-- Left hoof -->
      <ellipse cx="41" cy="162" rx="13" ry="7" fill="#1a1a1a" stroke="#000" stroke-width="2"/>
      <path d="M29 162 Q35 170 41 168 Q47 170 53 162" fill="#1a1a1a" stroke="#000" stroke-width="1.5"/>
      <line x1="41" y1="162" x2="41" y2="170" stroke="#333" stroke-width="1.5"/>
      <!-- Right hoof -->
      <ellipse cx="79" cy="162" rx="13" ry="7" fill="#1a1a1a" stroke="#000" stroke-width="2"/>
      <path d="M67 162 Q73 170 79 168 Q85 170 91 162" fill="#1a1a1a" stroke="#000" stroke-width="1.5"/>
      <line x1="79" y1="162" x2="79" y2="170" stroke="#333" stroke-width="1.5"/>

      <!-- Tail (curled devil tail) -->
      <path d="M60 115 Q80 120 88 135 Q92 148 84 152 Q76 156 78 148" fill="none" stroke="#a02020" stroke-width="5" stroke-linecap="round"/>
      <!-- Tail tip (arrow) -->
      <polygon points="78,148 72,142 84,140" fill="#7a0000" stroke="#4a0000" stroke-width="1"/>
    </svg>
  `;

  function startRound3() {
    gameRound = 3;
    enemyName = 'Devil';
    enemyNameLabel.textContent = 'Devil';
    fighterRight.querySelector('.fighter-body').innerHTML = devilSVG;
    startGame();
  }

  // ============================================================
  // UFO CRASH CUTSCENE (Round 4, streak 20)
  // ============================================================


  const ufoOverlay     = document.getElementById('ufo-overlay');
  const ufoYonah       = document.getElementById('ufo-yonah');
  const ufoAlienGround = document.getElementById('ufo-alien-ground');
  const ufoBeam        = document.getElementById('ufo-beam');
  const ufoShip        = document.getElementById('ufo-ship');
  const ufoExplosion   = document.getElementById('ufo-explosion');
  const ufoDebris      = document.getElementById('ufo-debris');
  const ufoFlash       = document.getElementById('ufo-flash');
  const ufoText        = document.getElementById('ufo-text');

  function playBeamHumSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;
      // Humming sine at 440 Hz — tractor beam sound
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(440, t);
      osc1.frequency.linearRampToValueAtTime(520, t + 1);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(660, t);
      osc2.frequency.linearRampToValueAtTime(550, t + 1);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.15);
      gain.gain.setValueAtTime(0.18, t + 0.7);
      gain.gain.linearRampToValueAtTime(0, t + 1.1);
      osc1.connect(gain).connect(audioCtx.destination);
      osc2.connect(gain);
      osc1.start(t);
      osc1.stop(t + 1.1);
      osc2.start(t);
      osc2.stop(t + 1.1);
    } catch (e) { /* ignore */ }
  }

  function playRemoteClickSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;
      // Short sharp click
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1800, t);
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.06);
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
      // Satisfying second harmonic
      const osc2 = audioCtx.createOscillator();
      const g2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(3200, t);
      osc2.frequency.exponentialRampToValueAtTime(1200, t + 0.05);
      g2.gain.setValueAtTime(0.2, t);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
      osc2.connect(g2).connect(audioCtx.destination);
      osc2.start(t);
      osc2.stop(t + 0.08);
    } catch (e) { /* ignore */ }
  }

  function playUfoWhooshSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;
      // Descending whoosh: noise filtered steeply downward
      const bufLen = Math.floor(audioCtx.sampleRate * 0.9);
      const buf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 0.3);
      }
      const src = audioCtx.createBufferSource();
      src.buffer = buf;
      // Bandpass that sweeps down
      const bp = audioCtx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(2200, t);
      bp.frequency.exponentialRampToValueAtTime(180, t + 0.85);
      bp.Q.value = 3;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
      src.connect(bp).connect(gain).connect(audioCtx.destination);
      src.start(t);
      src.stop(t + 0.9);
    } catch (e) { /* ignore */ }
  }

  function triggerUfoCrash() {
    ufoActive = true;

    // Reset all state
    ufoOverlay.classList.remove('shaking');
    ufoYonah.classList.remove('visible');
    ufoAlienGround.classList.remove('visible', 'beaming');
    ufoBeam.classList.remove('active', 'off');
    ufoShip.classList.remove('visible', 'hovering', 'flying', 'crashing');
    ufoExplosion.classList.remove('active');
    ufoDebris.classList.remove('active');
    ufoFlash.classList.remove('active');
    ufoText.classList.remove('visible');
    ufoOverlay.style.opacity = '';
    ufoOverlay.style.transition = '';

    // Phase 1 (0.3s): Show overlay — night sky, mountain, UFO hovering above
    ufoOverlay.classList.add('active');
    setTimeout(() => {
      ufoShip.classList.add('visible');
      setTimeout(() => {
        ufoShip.classList.add('hovering');
      }, 600);
    }, 300);

    // Phase 2 (1s): Yonah + Alien appear on ground
    setTimeout(() => {
      ufoYonah.classList.add('visible');
      ufoAlienGround.classList.add('visible');
    }, 1000);

    // Phase 3 (2s): Tractor beam extends down. Alien floats up into UFO. Play beam SFX.
    setTimeout(() => {
      playBeamHumSFX();
      ufoBeam.classList.add('active');
    }, 2000);

    setTimeout(() => {
      // Alien begins floating up
      ufoAlienGround.classList.add('beaming');
    }, 2200);

    // Phase 4 (3.2s): Alien boarded. Beam retracts. UFO starts flying right.
    setTimeout(() => {
      ufoBeam.classList.remove('active');
      ufoBeam.classList.add('off');
      ufoShip.classList.remove('hovering');
      ufoShip.classList.add('flying');
    }, 3200);

    // Phase 5 (4.5s): Yonah pulls out remote, presses button. Play click SFX.
    // (Yonah already has remote visible in his SVG — this is a narrative beat)
    setTimeout(() => {
      playRemoteClickSFX();
      // Brief visual feedback: Yonah flashes slightly
      ufoYonah.style.filter = 'brightness(1.4)';
      setTimeout(() => { ufoYonah.style.filter = ''; }, 200);
    }, 4500);

    // Phase 6 (5s): UFO nose-dives toward mountain. Play descending whoosh SFX.
    setTimeout(() => {
      ufoShip.classList.remove('flying');
      ufoShip.classList.add('crashing');
      playUfoWhooshSFX();
    }, 5000);

    // Phase 7 (5.8s): CRASH! Explosion at mountain. Screen shake. Flash. Debris.
    setTimeout(() => {
      ufoShip.style.opacity = '0'; // hide ship on impact
      ufoExplosion.classList.add('active');
      ufoDebris.classList.add('active');
      ufoFlash.classList.add('active');
      ufoOverlay.classList.add('shaking');
      playExplosionSFX();
    }, 5800);

    // Phase 8 (6.5s): "CRASHED!" text
    setTimeout(() => {
      ufoText.classList.add('visible');
    }, 6500);

    // Phase 9 (8.5s): Fade overlay
    setTimeout(() => {
      ufoOverlay.style.transition = 'opacity 0.8s ease-out';
      ufoOverlay.style.opacity = '0';
    }, 8500);

    // Phase 10 (9.5s): Cleanup. Fighter right → ashes, recover after 5s.
    setTimeout(() => {
      ufoOverlay.classList.remove('active', 'shaking');
      ufoOverlay.style.opacity = '';
      ufoOverlay.style.transition = '';
      ufoYonah.classList.remove('visible');
      ufoAlienGround.classList.remove('visible', 'beaming');
      ufoBeam.classList.remove('active', 'off');
      ufoShip.classList.remove('visible', 'hovering', 'flying', 'crashing');
      ufoShip.style.opacity = '';
      ufoExplosion.classList.remove('active');
      ufoDebris.classList.remove('active');
      ufoFlash.classList.remove('active');
      ufoText.classList.remove('visible');

      // Alien → ashes in the arena
      fighterRight.classList.add('ashes');

      // Recover after 5s
      setTimeout(() => {
        fighterRight.classList.remove('ashes');
        fighterRight.classList.add('recovering');
        setTimeout(() => {
          fighterRight.classList.remove('recovering');
          ufoActive = false;
        }, 800);
      }, 5000);
    }, 9500);
  }


  // ============================================================
  // SPECIMEN JAR TRAP CUTSCENE (Round 4, streak 30)
  // ============================================================


  const jarOverlay   = document.getElementById('jar-overlay');
  const jarAlien     = document.getElementById('jar-alien');
  const jarYonah     = document.getElementById('jar-yonah');
  const jarTrap      = document.getElementById('jar-trap');
  const jarLabel     = document.getElementById('jar-label');
  const jarFlash     = document.getElementById('jar-flash');
  const jarText      = document.getElementById('jar-text');

  function playGlassSlamSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;
      // High-frequency ring (glass)
      const ring = audioCtx.createOscillator();
      const ringGain = audioCtx.createGain();
      ring.type = 'sine';
      ring.frequency.setValueAtTime(2100, t);
      ring.frequency.exponentialRampToValueAtTime(1800, t + 0.4);
      ringGain.gain.setValueAtTime(0.35, t);
      ringGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      ring.connect(ringGain).connect(audioCtx.destination);
      ring.start(t);
      ring.stop(t + 0.5);

      // High overtone shimmer
      const ring2 = audioCtx.createOscillator();
      const ringGain2 = audioCtx.createGain();
      ring2.type = 'sine';
      ring2.frequency.setValueAtTime(3400, t);
      ring2.frequency.exponentialRampToValueAtTime(2800, t + 0.3);
      ringGain2.gain.setValueAtTime(0.15, t);
      ringGain2.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      ring2.connect(ringGain2).connect(audioCtx.destination);
      ring2.start(t);
      ring2.stop(t + 0.4);

      // Low thud (the slam landing)
      const thudBufLen = Math.floor(audioCtx.sampleRate * 0.25);
      const thudBuf = audioCtx.createBuffer(1, thudBufLen, audioCtx.sampleRate);
      const td = thudBuf.getChannelData(0);
      for (let i = 0; i < thudBufLen; i++) {
        td[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / thudBufLen, 2);
      }
      const thudSrc = audioCtx.createBufferSource();
      thudSrc.buffer = thudBuf;
      const lp = audioCtx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(500, t);
      const thudGain = audioCtx.createGain();
      thudGain.gain.setValueAtTime(0.5, t);
      thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      thudSrc.connect(lp).connect(thudGain).connect(audioCtx.destination);
      thudSrc.start(t);
      thudSrc.stop(t + 0.3);
    } catch (e) { /* ignore */ }
  }

  function playMuffledBangingSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;
      // Repeated dull thuds (muffled banging inside jar)
      const bangTimes = [0, 0.22, 0.44, 0.70, 0.95, 1.22];
      bangTimes.forEach(delay => {
        const bufLen = Math.floor(audioCtx.sampleRate * 0.08);
        const buf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) {
          d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 1.8);
        }
        const src = audioCtx.createBufferSource();
        src.buffer = buf;
        const lp = audioCtx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(600, t + delay);
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.22, t + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.08);
        src.connect(lp).connect(gain).connect(audioCtx.destination);
        src.start(t + delay);
        src.stop(t + delay + 0.1);
      });
    } catch (e) { /* ignore */ }
  }

  function triggerJarTrap() {
    jarActive = true;

    // Reset all state
    jarOverlay.classList.remove('shaking');
    jarAlien.classList.remove('visible');
    jarYonah.classList.remove('sneaking');
    jarTrap.classList.remove('slammed', 'panicking');
    jarLabel.classList.remove('sliding');
    jarFlash.classList.remove('active');
    jarText.classList.remove('visible');
    jarTrap.style.opacity = '';
    jarOverlay.style.opacity = '';
    jarOverlay.style.transition = '';

    // Phase 1 (0.3s): Show overlay — lab background
    jarOverlay.classList.add('active');

    // Phase 2 (1s): Alien appears in center (facing right, oblivious)
    setTimeout(() => {
      jarAlien.classList.add('visible');
    }, 1000);

    // Phase 3 (1.5s): Yonah sneaks in from left (tip-toe, holding jar up high)
    setTimeout(() => {
      jarYonah.classList.add('sneaking');
    }, 1500);

    // Phase 4 (3s): JAR SLAM! Jar comes down over alien. Play glass slam SFX. Screen shake.
    setTimeout(() => {
      // Hide Yonah (jar now exists as separate element)
      jarYonah.style.opacity = '0';
      jarTrap.style.opacity = '1';
      jarTrap.classList.add('slammed');
      jarFlash.classList.add('active');
      jarOverlay.classList.add('shaking');
      playGlassSlamSFX();
    }, 3000);

    // Phase 5 (3.5s): Alien panics inside jar. Play muffled banging SFX.
    setTimeout(() => {
      jarTrap.classList.add('panicking');
      playMuffledBangingSFX();
    }, 3500);

    // Phase 6 (5s): Label slides onto jar: "Specimen #42"
    setTimeout(() => {
      jarLabel.classList.add('sliding');
    }, 5000);

    // Phase 7 (5.5s): "TRAPPED!" text
    setTimeout(() => {
      jarText.classList.add('visible');
    }, 5500);

    // Phase 8 (7.5s): Fade overlay
    setTimeout(() => {
      jarOverlay.style.transition = 'opacity 0.8s ease-out';
      jarOverlay.style.opacity = '0';
    }, 7500);

    // Phase 9 (8.5s): Cleanup. Fighter right → ashes, recover after 5s.
    setTimeout(() => {
      jarOverlay.classList.remove('active', 'shaking');
      jarOverlay.style.opacity = '';
      jarOverlay.style.transition = '';
      jarAlien.classList.remove('visible');
      jarYonah.classList.remove('sneaking');
      jarYonah.style.opacity = '';
      jarTrap.classList.remove('slammed', 'panicking');
      jarTrap.style.opacity = '';
      jarLabel.classList.remove('sliding');
      jarFlash.classList.remove('active');
      jarText.classList.remove('visible');

      // Alien → ashes in the arena
      fighterRight.classList.add('ashes');

      // Recover after 5s
      setTimeout(() => {
        fighterRight.classList.remove('ashes');
        fighterRight.classList.add('recovering');
        setTimeout(() => {
          fighterRight.classList.remove('recovering');
          jarActive = false;
        }, 800);
      }, 5000);
    }, 8500);
  }

  /* ─────────────────────────────────────────────────────────────
     STREAK TRIGGER INTEGRATION NOTE (for parent integrator):

     Insert the following BEFORE the existing
     `else if (correctStreak === 20)` block:

       // 20-streak: UFO crash (Round 4), tower (R3), mortar (R2), sniper (R1)
       else if (correctStreak === 20) {
         if (gameRound >= 4 && !ufoActive) {
           setTimeout(() => triggerUfoCrash(), 300);
         } else if (gameRound >= 3 && !towerActive) {
           setTimeout(() => triggerTowerDemolition(), 300);
         } else if (gameRound === 2 && !mortarActive) {
           setTimeout(() => triggerMortar(), 300);
         } else if (gameRound === 1 && !sniperActive) {
           setTimeout(() => triggerSniperHeadshot(), 300);
         }
       }

     And BEFORE `else if (correctStreak === 30)`:

       // 30-streak: Jar trap (Round 4), banana (R3), boulder (R2), tank (R1)
       else if (correctStreak === 30) {
         if (gameRound >= 4 && !jarActive) {
           setTimeout(() => triggerJarTrap(), 300);
         } else if (gameRound >= 3 && !bananaActive) {
           setTimeout(() => triggerBanana(), 300);
         } else if (gameRound === 2 && !boulderActive) {
           setTimeout(() => triggerBoulderCrush(), 300);
         } else if (gameRound === 1 && !tankActive) {
           setTimeout(() => triggerTankCrush(), 300);
         }
       }

       ufoActive = false;
       jarActive = false;
  ─────────────────────────────────────────────────────────────── */
// ============================================================
// SUN LAUNCH OVERLAY — Round 4, Streak 40
//
  const sunOverlay      = document.getElementById('sun-overlay');
  const sunStarObj      = document.getElementById('sun-star-obj');
  const sunLaunchpad    = document.getElementById('sun-launchpad');
  const sunRocket       = document.getElementById('sun-rocket');
  const sunExhaust      = document.getElementById('sun-exhaust');
  const sunYonah        = document.getElementById('sun-yonah');
  const sunCountdown    = document.getElementById('sun-countdown');
  const sunCount3       = document.getElementById('sun-count-3');
  const sunCount2       = document.getElementById('sun-count-2');
  const sunCount1       = document.getElementById('sun-count-1');
  const sunDisintegrate = document.getElementById('sun-disintegrate');
  const sunFlash        = document.getElementById('sun-flash');
  const sunText         = document.getElementById('sun-text');


  // --- SFX ---

  function playCountdownBeepSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, t);
      g.gain.setValueAtTime(0.22, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(g).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    } catch (e) {}
  }

  function playSunLaunchSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;
      const sr = audioCtx.sampleRate;

      // Ascending noise sweep (bandpass 200 → 4000 Hz over 3s)
      const bufLen = Math.floor(sr * 3.2);
      const buf = audioCtx.createBuffer(1, bufLen, sr);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) d[i] = (Math.random() * 2 - 1);
      const src = audioCtx.createBufferSource();
      src.buffer = buf;
      const bp = audioCtx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(200, t);
      bp.frequency.exponentialRampToValueAtTime(4000, t + 3);
      bp.Q.value = 0.7;
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(0.01, t);
      g.gain.linearRampToValueAtTime(0.4, t + 0.4);
      g.gain.setValueAtTime(0.38, t + 2);
      g.gain.exponentialRampToValueAtTime(0.001, t + 3.2);
      src.connect(bp).connect(g).connect(audioCtx.destination);
      src.start(t);
      src.stop(t + 3.2);

      // 40 Hz sub-bass rumble (3s)
      const bufRumble = audioCtx.createBuffer(1, Math.floor(sr * 3), sr);
      const dr = bufRumble.getChannelData(0);
      for (let i = 0; i < dr.length; i++) dr[i] = (Math.random() * 2 - 1);
      const srcR = audioCtx.createBufferSource();
      srcR.buffer = bufRumble;
      const lpR = audioCtx.createBiquadFilter();
      lpR.type = 'lowpass';
      lpR.frequency.value = 80;
      const gR = audioCtx.createGain();
      gR.gain.setValueAtTime(0.5, t);
      gR.gain.exponentialRampToValueAtTime(0.001, t + 3);
      srcR.connect(lpR).connect(gR).connect(audioCtx.destination);
      srcR.start(t);
      srcR.stop(t + 3);

      // Rising whistle tone
      const osc = audioCtx.createOscillator();
      const og = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, t);
      osc.frequency.exponentialRampToValueAtTime(3200, t + 2.8);
      og.gain.setValueAtTime(0.09, t);
      og.gain.exponentialRampToValueAtTime(0.001, t + 2.8);
      osc.connect(og).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 2.8);
    } catch (e) {}
  }

  function playIncinerationSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;
      const sr = audioCtx.sampleRate;

      // Descending crackling noise 4000 → 500 Hz (1s)
      const bufLen = Math.floor(sr * 1.2);
      const buf = audioCtx.createBuffer(1, bufLen, sr);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) d[i] = (Math.random() * 2 - 1);
      const src = audioCtx.createBufferSource();
      src.buffer = buf;
      const bp = audioCtx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(4000, t);
      bp.frequency.exponentialRampToValueAtTime(500, t + 1);
      bp.Q.value = 0.5;
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(0.35, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      src.connect(bp).connect(g).connect(audioCtx.destination);
      src.start(t);
      src.stop(t + 1.2);

      // Bright 3000 Hz flash sine (200ms)
      const osc = audioCtx.createOscillator();
      const og = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(3000, t);
      og.gain.setValueAtTime(0.15, t);
      og.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(og).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.22);
    } catch (e) {}
  }

  // --- Main trigger ---

  function triggerSunLaunch() {
    sunLaunchActive = true;

    // Reset all state
    sunOverlay.classList.remove('shaking');
    sunLaunchpad.classList.remove('visible');
    sunRocket.classList.remove('visible', 'shaking', 'launch');
    sunRocket.style.bottom = '';
    sunRocket.style.left = '';
    sunExhaust.classList.remove('active');
    sunYonah.classList.remove('visible');
    sunCount3.classList.remove('show');
    sunCount2.classList.remove('show');
    sunCount1.classList.remove('show');
    sunDisintegrate.classList.remove('active');
    sunFlash.classList.remove('active');
    sunText.classList.remove('visible');

    // Activate overlay
    sunOverlay.classList.add('active');

    // 0.3s: Space background, sun, stars already visible via overlay

    // 1s: Yonah at mission control + rocket on launch pad appear
    setTimeout(() => {
      sunYonah.classList.add('visible');
      sunLaunchpad.classList.add('visible');
      sunRocket.classList.add('visible');
    }, 1000);

    // 2s: Countdown "3" with beep
    setTimeout(() => {
      playCountdownBeepSFX();
      sunCount3.classList.add('show');
    }, 2000);

    // 2.7s: Countdown "2" with beep
    setTimeout(() => {
      sunCount3.classList.remove('show');
      playCountdownBeepSFX();
      sunCount2.classList.add('show');
    }, 2700);

    // 3.4s: Countdown "1" with beep
    setTimeout(() => {
      sunCount2.classList.remove('show');
      playCountdownBeepSFX();
      sunCount1.classList.add('show');
    }, 3400);

    // 4s: LAUNCH — rocket shakes, engines fire
    setTimeout(() => {
      sunCount1.classList.remove('show');
      // Rocket starts shaking (engine ignition)
      sunRocket.classList.remove('visible');
      sunRocket.classList.add('shaking');
      sunExhaust.classList.add('active');
      sunOverlay.classList.add('shaking');
      playSunLaunchSFX();
    }, 4000);

    // 4.5s: Rocket actually launches (brief shake before liftoff)
    setTimeout(() => {
      sunRocket.classList.remove('shaking');
      sunRocket.classList.add('launch');
    }, 4500);

    // 7s: Rocket reaches sun — flash + disintegration
    setTimeout(() => {
      sunRocket.classList.remove('launch');
      sunRocket.style.opacity = '0';
      sunFlash.classList.add('active');
      sunDisintegrate.classList.add('active');
      playIncinerationSFX();
      sunOverlay.classList.remove('shaking');
    }, 7000);

    // 7.5s: "INCINERATED!" text
    setTimeout(() => {
      sunText.classList.add('visible');
    }, 7500);

    // 9.5s: Fade out
    setTimeout(() => {
      sunOverlay.style.transition = 'opacity 0.8s ease-out';
      sunOverlay.style.opacity = '0';
    }, 9500);

    // 10.5s: Full cleanup
    setTimeout(() => {
      sunOverlay.classList.remove('active', 'shaking');
      sunOverlay.style.transition = '';
      sunOverlay.style.opacity = '';

      sunLaunchpad.classList.remove('visible');
      sunRocket.classList.remove('visible', 'shaking', 'launch');
      sunRocket.style.bottom = '';
      sunRocket.style.left = '';
      sunRocket.style.opacity = '';
      sunExhaust.classList.remove('active');
      sunYonah.classList.remove('visible');
      sunCount3.classList.remove('show');
      sunCount2.classList.remove('show');
      sunCount1.classList.remove('show');
      sunDisintegrate.classList.remove('active');
      sunFlash.classList.remove('active');
      sunText.classList.remove('visible');

      // Ashes / recovery sequence (same as other cutscenes)
      fighterRight.classList.add('ashes');
      setTimeout(() => {
        fighterRight.classList.remove('ashes');
        fighterRight.classList.add('recovering');
        setTimeout(() => {
          fighterRight.classList.remove('recovering');
          sunLaunchActive = false;
        }, 800);
      }, 5000);
    }, 10500);
  }

  // ===== END Sun Launch Cutscene =====
  // === Round 4: Alien Overlord ===
  const alienSVG = `
    <svg viewBox="0 0 120 180" width="120" height="180" xmlns="http://www.w3.org/2000/svg" class="karate-svg">
      <!-- Neck stump (hidden, used for decapitation effect) -->
      <ellipse class="neck-stump" cx="60" cy="88" rx="8" ry="4" fill="#6a8a6a" opacity="0"/>

      <!-- Dark space suit body -->
      <rect x="34" y="90" width="52" height="52" rx="8" fill="#1a0a2e" stroke="#2a0a4e" stroke-width="2"/>
      <!-- Suit chest panel -->
      <rect x="43" y="98" width="34" height="22" rx="4" fill="#120820" stroke="#3a1a5e" stroke-width="1.5"/>
      <!-- Suit panel lights -->
      <circle cx="50" cy="106" r="2.5" fill="#7b2fff" opacity="0.9"/>
      <circle cx="60" cy="106" r="2.5" fill="#2fff9b" opacity="0.9"/>
      <circle cx="70" cy="106" r="2.5" fill="#7b2fff" opacity="0.9"/>
      <rect x="48" y="113" width="24" height="3" rx="1.5" fill="#3a1a5e"/>

      <!-- Purple glowing amulet around neck -->
      <ellipse cx="60" cy="93" rx="7" ry="4.5" fill="none" stroke="#6a0aaa" stroke-width="1.5" opacity="0.6"/>
      <circle cx="60" cy="93" r="4" fill="#220840" stroke="#9b3fff" stroke-width="1.5"/>
      <circle cx="60" cy="93" r="2.5" fill="#7b2fff" opacity="0.85"/>
      <circle cx="59" cy="92" r="1" fill="#dbbfff" opacity="0.9"/>

      <!-- Thin elongated neck -->
      <rect x="55" y="80" width="10" height="14" rx="5" fill="#6a8a6a" stroke="#4a6a4a" stroke-width="1.5"/>

      <!-- Head group — oversized bulbous brain-head -->
      <g class="enemy-head">
        <!-- Main cranium (large, bulbous) -->
        <ellipse cx="60" cy="48" rx="34" ry="38" fill="#6a8a6a" stroke="#4a6a4a" stroke-width="2"/>
        <!-- Brain top dome (extra bulge) -->
        <ellipse cx="60" cy="22" rx="28" ry="22" fill="#7a9a7a" stroke="#4a6a4a" stroke-width="1.5"/>
        <!-- Vein-like lines on cranium -->
        <path d="M38 30 Q42 18 50 14" fill="none" stroke="#4a6a4a" stroke-width="1.2" stroke-linecap="round" opacity="0.7"/>
        <path d="M44 20 Q50 10 60 8" fill="none" stroke="#4a6a4a" stroke-width="1.2" stroke-linecap="round" opacity="0.7"/>
        <path d="M60 8 Q70 10 76 18" fill="none" stroke="#4a6a4a" stroke-width="1.2" stroke-linecap="round" opacity="0.7"/>
        <path d="M78 28 Q82 20 78 14" fill="none" stroke="#4a6a4a" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
        <path d="M50 14 Q54 8 60 6" fill="none" stroke="#5a7a5a" stroke-width="0.8" stroke-linecap="round" opacity="0.5"/>
        <path d="M36 38 Q34 28 38 20" fill="none" stroke="#4a6a4a" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
        <path d="M84 38 Q86 28 82 20" fill="none" stroke="#4a6a4a" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
        <!-- Brain groove lines (lobes) -->
        <path d="M32 50 Q40 42 50 46 Q60 50 70 46 Q80 42 88 50" fill="none" stroke="#4a6a4a" stroke-width="1.5" opacity="0.5"/>
        <path d="M34 60 Q44 54 56 57 Q64 59 76 54 Q86 58 88 64" fill="none" stroke="#4a6a4a" stroke-width="1" opacity="0.4"/>
        <!-- Large black almond-shaped eyes -->
        <ellipse cx="46" cy="60" rx="11" ry="8" fill="#0a0a0a" stroke="#1a1a1a" stroke-width="1.5"/>
        <!-- Eye shine reflections -->
        <circle cx="42" cy="56" r="2.5" fill="#ffffff" opacity="0.85"/>
        <circle cx="44" cy="58" r="1" fill="#ffffff" opacity="0.5"/>
        <ellipse cx="74" cy="60" rx="11" ry="8" fill="#0a0a0a" stroke="#1a1a1a" stroke-width="1.5"/>
        <circle cx="70" cy="56" r="2.5" fill="#ffffff" opacity="0.85"/>
        <circle cx="72" cy="58" r="1" fill="#ffffff" opacity="0.5"/>
        <!-- Small flat nose (two tiny nostrils) -->
        <ellipse cx="56" cy="73" rx="2" ry="1.5" fill="#4a6a4a"/>
        <ellipse cx="64" cy="73" rx="2" ry="1.5" fill="#4a6a4a"/>
        <!-- Thin sinister smirk -->
        <path d="M49 79 Q60 84 71 79" fill="none" stroke="#3a5a3a" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M68 79 Q71 77 73 79" fill="none" stroke="#3a5a3a" stroke-width="1.5" stroke-linecap="round"/>
      </g>

      <!-- Left arm (thin, elongated) -->
      <rect class="arm-left" x="4" y="91" width="32" height="8" rx="4" fill="#1a0a2e" stroke="#2a0a4e" stroke-width="1.5" transform-origin="34 95"/>
      <!-- Left hand (3 long fingers) -->
      <g class="hand-left">
        <ellipse cx="8" cy="95" rx="7" ry="5" fill="#6a8a6a" stroke="#4a6a4a" stroke-width="1.5"/>
        <!-- 3 long bony fingers -->
        <rect x="2" y="88" width="3" height="10" rx="1.5" fill="#5a7a5a" stroke="#4a6a4a" stroke-width="1" transform="rotate(-20, 3.5, 93)"/>
        <rect x="6" y="87" width="3" height="11" rx="1.5" fill="#5a7a5a" stroke="#4a6a4a" stroke-width="1"/>
        <rect x="10" y="88" width="3" height="10" rx="1.5" fill="#5a7a5a" stroke="#4a6a4a" stroke-width="1" transform="rotate(20, 11.5, 93)"/>
      </g>

      <!-- Right arm (thin, elongated) -->
      <rect class="arm-right" x="84" y="91" width="32" height="8" rx="4" fill="#1a0a2e" stroke="#2a0a4e" stroke-width="1.5" transform-origin="86 95"/>
      <!-- Right hand (3 long fingers) -->
      <g class="hand-right">
        <ellipse cx="112" cy="95" rx="7" ry="5" fill="#6a8a6a" stroke="#4a6a4a" stroke-width="1.5"/>
        <!-- 3 long bony fingers -->
        <rect x="106" y="88" width="3" height="10" rx="1.5" fill="#5a7a5a" stroke="#4a6a4a" stroke-width="1" transform="rotate(-20, 107.5, 93)"/>
        <rect x="110" y="87" width="3" height="11" rx="1.5" fill="#5a7a5a" stroke="#4a6a4a" stroke-width="1"/>
        <rect x="114" y="88" width="3" height="10" rx="1.5" fill="#5a7a5a" stroke="#4a6a4a" stroke-width="1" transform="rotate(20, 115.5, 93)"/>
      </g>

      <!-- Thin legs -->
      <rect x="38" y="140" width="16" height="32" rx="6" fill="#1a0a2e" stroke="#2a0a4e" stroke-width="2"/>
      <rect x="66" y="140" width="16" height="32" rx="6" fill="#1a0a2e" stroke="#2a0a4e" stroke-width="2"/>

      <!-- Boots/feet -->
      <ellipse cx="46" cy="173" rx="11" ry="5" fill="#0a0520" stroke="#2a0a4e" stroke-width="1.5"/>
      <ellipse cx="74" cy="173" rx="11" ry="5" fill="#0a0520" stroke="#2a0a4e" stroke-width="1.5"/>
    </svg>
  `;

  function startRound4() {
    gameRound = 4;
    enemyName = 'Alien Overlord';
    enemyNameLabel.textContent = 'Alien Overlord';
    fighterRight.querySelector('.fighter-body').innerHTML = alienSVG;
    startGame();
  }

  // === Event listeners ===
  function startSenseiFight() {
    gameRound = 1;
    enemyName = 'Sensei Bot';
    enemyNameLabel.textContent = enemyName;
    fighterRight.querySelector('.fighter-body').innerHTML = originalEnemySVG;
    startGame();
  }

  const opponentList = document.getElementById('opponent-list');
  if (opponentList) {
    const opponents = [
      { name: 'Sensei Bot', artwork: originalEnemySVG, fight: startSenseiFight },
      { name: 'Ogre', artwork: ogreSVG, fight: startRound2 },
      { name: 'Devil', artwork: devilSVG, fight: startRound3 },
      { name: 'Alien Overlord', artwork: alienSVG, fight: startRound4 }
    ];
    for (const opponent of opponents) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'opponent-choice';
      const portrait = document.createElement('span');
      portrait.className = 'opponent-portrait';
      portrait.setAttribute('aria-hidden', 'true');
      portrait.innerHTML = opponent.artwork;
      const svg = portrait.querySelector('svg');
      svg.setAttribute('viewBox', '0 0 120 103');
      svg.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
      const label = document.createElement('span');
      label.textContent = opponent.name;
      button.append(portrait, label);
      button.addEventListener('click', opponent.fight);
      opponentList.append(button);
    }
  }

  startBtn.addEventListener('click', showNameScreen);
  nameBtn.addEventListener('click', confirmEnemyName);
  enemyNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') confirmEnemyName();
  });
  retryBtn.addEventListener('click', startGame);

  submitBtn.addEventListener('click', submitAnswer);
  answerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitAnswer();
  });

  // Handle resize for fireworks canvas
  window.addEventListener('resize', () => {
    if (winScreen.classList.contains('active') && fireworksCanvas) {
      fireworksCanvas.width = window.innerWidth;
      fireworksCanvas.height = window.innerHeight;
    }
  });

  // === Expose for testing ===
  window.render_game_to_text = function () {
    return JSON.stringify({
      screen: startScreen.classList.contains('active') ? 'start' :
              nameScreen.classList.contains('active') ? 'name' :
              gameScreen.classList.contains('active') ? 'game' :
              gameoverScreen.classList.contains('active') ? 'gameover' :
              winScreen.classList.contains('active') ? 'win' : 'unknown',
      enemyName,
      hp,
      correctCount,
      wrongCount,
      currentQuestion: `${currentA} x ${currentB}`,
      currentAnswer,
      isProcessing
    });
  };


  // ──────────────────────────────────────────────────────────────────────────
  // WHACK-A-MOLE CUTSCENE  (Round 3, streak 5)
  // ──────────────────────────────────────────────────────────────────────────

  function playWhackSFX() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();

      // Sharp crack — bandpass noise burst (whack)
      const bufLen = ctx.sampleRate * 0.08;
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1);

      const src = ctx.createBufferSource();
      src.buffer = buf;

      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 2000;
      bp.Q.value = 1.5;

      const gainCrack = ctx.createGain();
      gainCrack.gain.setValueAtTime(1.2, ctx.currentTime);
      gainCrack.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      src.connect(bp);
      bp.connect(gainCrack);
      gainCrack.connect(ctx.destination);
      src.start();
      src.stop(ctx.currentTime + 0.08);

      // Deep thud (body impact feel)
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.06);

      const gainThud = ctx.createGain();
      gainThud.gain.setValueAtTime(0.9, ctx.currentTime);
      gainThud.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gainThud);
      gainThud.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);

      setTimeout(() => ctx.close(), 300);
    } catch(e) { /* audio not available */ }
  }

  function triggerMole() {
    moleActive = true;

    const overlay   = document.getElementById('mole-overlay');
    const devilClip = document.getElementById('mole-devil-clip');
    const devil     = document.getElementById('mole-devil');
    const hammer    = document.getElementById('mole-hammer');
    const stars     = document.getElementById('mole-stars');
    const powEl     = document.getElementById('mole-pow');
    const whacked   = document.getElementById('mole-whacked');

    // Eye/mouth element groups
    const eyesNormal    = devil.querySelector('.devil-eyes-normal');
    const eyesDazed     = devil.querySelector('.devil-eyes-dazed');
    const eyesVeryDazed = devil.querySelector('.devil-eyes-very-dazed');
    const eyesOut       = devil.querySelector('.devil-eyes-out');
    const mouthNormal   = devil.querySelector('.devil-mouth-normal');
    const mouthTongue   = devil.querySelector('.devil-mouth-tongue');

    // ── Helper: set devil expression ───────────────────────────────────
    function setExpression(expr) {
      eyesNormal.style.display    = 'none';
      eyesDazed.style.display     = 'none';
      eyesVeryDazed.style.display = 'none';
      eyesOut.style.display       = 'none';
      mouthNormal.style.display   = 'none';
      mouthTongue.style.display   = 'none';
      switch(expr) {
        case 'normal':    eyesNormal.style.display = ''; mouthNormal.style.display = ''; break;
        case 'dazed':     eyesDazed.style.display = ''; mouthNormal.style.display = ''; break;
        case 'very-dazed': eyesVeryDazed.style.display = ''; mouthNormal.style.display = ''; break;
        case 'out':       eyesOut.style.display = ''; mouthTongue.style.display = ''; break;
      }
    }

    // ── Hole positions (matching CSS) ──────────────────────────────────
    const holePositions = [
      { left: '15%', top: '30%' }, // tl
      { left: '50%', top: '28%' }, // tc (center)
      { left: '85%', top: '30%' }, // tr
      { left: '32%', top: '58%' }, // bl
      { left: '68%', top: '58%' }, // br
    ];
    // Sequence: tc → tl → br → tr (always different, never same twice)
    const holeSequence = [1, 0, 4, 2];

    // ── Helper: move devil clip to a hole ────────────────────────────────
    function moveToHole(idx) {
      const h = holePositions[idx];
      devilClip.style.left = h.left;
      devilClip.style.top  = h.top;
      // Move hammer directly above the same hole
      hammer.style.left = h.left;
      hammer.style.transform = 'translateX(-50%) rotate(-65deg)';
    }

    // ── Helper: pop-up ──────────────────────────────────────────────────
    function devilPopUp(expr, holeIdx) {
      moveToHole(holeIdx);
      setExpression(expr);
      devil.classList.remove('popping-up', 'popping-down');
      void devil.offsetWidth; // reflow
      devil.classList.add('popping-up');
    }

    // ── Helper: pop-down ────────────────────────────────────────────────
    function devilPopDown() {
      devil.classList.remove('popping-up', 'popping-down');
      void devil.offsetWidth;
      devil.classList.add('popping-down');
    }

    // ── Helper: do one whack ───────────────────────────────────────────
    function doWhack(intense, final) {
      hammer.classList.remove('swinging');
      void hammer.offsetWidth;
      hammer.classList.add('swinging');

      playWhackSFX();

      // Show stars
      // Position stars above the center of the devil-clip
      const clipRect    = devilClip.getBoundingClientRect();
      const overlayRect = overlay.getBoundingClientRect();
      const sx = clipRect.left - overlayRect.left + clipRect.width * 0.5;
      const sy = clipRect.top  - overlayRect.top  + 5;
      stars.style.left = sx + 'px';
      stars.style.top  = sy + 'px';

      stars.classList.remove('visible', 'intense');
      void stars.offsetWidth;
      if (intense) stars.classList.add('intense');
      stars.classList.add('visible');

      // Show POW burst
      powEl.classList.remove('visible');
      void powEl.offsetWidth;
      powEl.classList.add('visible');

      // If final hit: screen shake
      if (final) {
        overlay.classList.remove('shake');
        void overlay.offsetWidth;
        overlay.classList.add('shake');
        setTimeout(() => overlay.classList.remove('shake'), 360);
      }
    }

    // ── Reset all state ────────────────────────────────────────────────
    overlay.classList.remove('active', 'shake');
    devil.classList.remove('popping-up', 'popping-down');
    devil.style.transform = 'translateX(-50%) translateY(120%)';
    hammer.classList.remove('swinging');
    stars.classList.remove('visible', 'intense');
    powEl.classList.remove('visible');
    whacked.classList.remove('visible');
    overlay.style.opacity = '';
    overlay.style.transition = '';
    setExpression('normal');

    // ── TIMELINE ───────────────────────────────────────────────────────

    // 0.3s — Show board
    setTimeout(() => {
      overlay.classList.add('active');
    }, 300);

    // 1.0s — Hit 1: normal devil pops up (center-top hole)
    setTimeout(() => { devilPopUp('normal', holeSequence[0]); }, 1000);

    // 1.8s — Whack 1
    setTimeout(() => {
      doWhack(false, false);
      devilPopDown();
    }, 1800);

    // 2.6s — Hit 2: dazed devil (top-left hole)
    setTimeout(() => { devilPopUp('dazed', holeSequence[1]); }, 2600);

    // 3.4s — Whack 2
    setTimeout(() => {
      doWhack(false, false);
      devilPopDown();
    }, 3400);

    // 4.2s — Hit 3: very dazed (bottom-right hole)
    setTimeout(() => { devilPopUp('very-dazed', holeSequence[2]); }, 4200);

    // 5.0s — Whack 3 (intense stars)
    setTimeout(() => {
      doWhack(true, false);
      devilPopDown();
    }, 5000);

    // 5.8s — Hit 4: totally out of it (top-right hole)
    setTimeout(() => { devilPopUp('out', holeSequence[3]); }, 5800);

    // 6.6s — FINAL Whack (biggest, screen shake)
    setTimeout(() => {
      doWhack(true, true);
      devilPopDown();
    }, 6600);

    // 7.5s — "WHACKED!" text
    setTimeout(() => {
      whacked.classList.add('visible');
    }, 7500);

    // 9.0s — Fade overlay
    setTimeout(() => {
      overlay.style.transition = 'opacity 0.8s ease-out';
      overlay.style.opacity    = '0';
    }, 9000);

    // 10.0s — Cleanup, enemy → ashes → recover
    setTimeout(() => {
      overlay.classList.remove('active', 'shake');
      overlay.style.opacity   = '';
      overlay.style.transition = '';
      devil.classList.remove('popping-up', 'popping-down');
      devil.style.transform = 'translateX(-50%) translateY(120%)';
      hammer.classList.remove('swinging');
      stars.classList.remove('visible', 'intense');
      powEl.classList.remove('visible');
      whacked.classList.remove('visible');
      setExpression('normal');

      // Enemy → ashes → recover
      fighterRight.classList.add('ashes');
      setTimeout(() => {
        fighterRight.classList.remove('ashes');
        fighterRight.classList.add('recovering');
        setTimeout(() => {
          fighterRight.classList.remove('recovering');
          moleActive = false;
        }, 800);
      }, 5000);
    }, 10000);
  }



  // ================================================================
  // YACHT SHARK CUTSCENE — Round 3, streak 10
  // ================================================================

  function playSplashSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;
      // White noise through lowpass — water splash
      const bufLen = Math.floor(audioCtx.sampleRate * 0.15);
      const buf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) d[i] = (Math.random() * 2 - 1);
      const src = audioCtx.createBufferSource();
      src.buffer = buf;
      const lp = audioCtx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 3000;
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(0.5, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      src.connect(lp).connect(g).connect(audioCtx.destination);
      src.start(t);
      src.stop(t + 0.15);
    } catch (e) {}
  }

  function playSharkChompSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;

      // Chomping crunch: noise burst through bandpass 200-800Hz (200ms), loud
      const crunchLen = Math.floor(audioCtx.sampleRate * 0.2);
      const crunchBuf = audioCtx.createBuffer(1, crunchLen, audioCtx.sampleRate);
      const crunchData = crunchBuf.getChannelData(0);
      for (let i = 0; i < crunchLen; i++) crunchData[i] = (Math.random() * 2 - 1);
      const crunchSrc = audioCtx.createBufferSource();
      crunchSrc.buffer = crunchBuf;
      const bp = audioCtx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(200, t);
      bp.frequency.exponentialRampToValueAtTime(800, t + 0.05);
      bp.Q.value = 0.8;
      const crunchGain = audioCtx.createGain();
      crunchGain.gain.setValueAtTime(1.2, t);
      crunchGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      crunchSrc.connect(bp).connect(crunchGain).connect(audioCtx.destination);
      crunchSrc.start(t);
      crunchSrc.stop(t + 0.22);

      // Splash: white noise through lowpass 2000Hz (100ms)
      const splashLen = Math.floor(audioCtx.sampleRate * 0.1);
      const splashBuf = audioCtx.createBuffer(1, splashLen, audioCtx.sampleRate);
      const splashData = splashBuf.getChannelData(0);
      for (let i = 0; i < splashLen; i++) splashData[i] = (Math.random() * 2 - 1);
      const splashSrc = audioCtx.createBufferSource();
      splashSrc.buffer = splashBuf;
      const lp = audioCtx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 2000;
      const splashGain = audioCtx.createGain();
      splashGain.gain.setValueAtTime(0.6, t);
      splashGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      splashSrc.connect(lp).connect(splashGain).connect(audioCtx.destination);
      splashSrc.start(t + 0.02);
      splashSrc.stop(t + 0.14);

      // Bass thud at 80Hz (80ms)
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.08);
      oscGain.gain.setValueAtTime(0.9, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.connect(oscGain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    } catch (e) {}
  }


  // ─────────────────────────────────────────────────────
  // ARM WRESTLING CUTSCENE — Round 3, streak 40
  // ─────────────────────────────────────────────────────

  function playStruggleSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;
      // Short grunty noise burst through bandpass 300-800Hz
      const bufSize = Math.floor(audioCtx.sampleRate * 0.2);
      const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 2);
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buf;
      const bp = audioCtx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 500;
      bp.Q.value = 1.2;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      noise.connect(bp).connect(gain).connect(audioCtx.destination);
      noise.start(t);
      noise.stop(t + 0.2);
      // Low grunt oscillator
      const osc = audioCtx.createOscillator();
      const og = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.15);
      og.gain.setValueAtTime(0.2, t);
      og.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.connect(og).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    } catch(e) { /* ignore */ }
  }

  function playRipSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;
      // Tearing rip: loud white noise through wide bandpass
      const bufSize = Math.floor(audioCtx.sampleRate * 0.22);
      const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        const env = i < bufSize * 0.1
          ? i / (bufSize * 0.1)
          : Math.pow(1 - (i - bufSize * 0.1) / (bufSize * 0.9), 1.5);
        d[i] = (Math.random() * 2 - 1) * env;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buf;
      const bp = audioCtx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1000;
      bp.Q.value = 0.4;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(1.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      noise.connect(bp).connect(gain).connect(audioCtx.destination);
      noise.start(t);
      noise.stop(t + 0.22);
      // Shocking low thump
      const thump = audioCtx.createOscillator();
      const tg = audioCtx.createGain();
      thump.type = 'sine';
      thump.frequency.setValueAtTime(80, t);
      thump.frequency.exponentialRampToValueAtTime(30, t + 0.12);
      tg.gain.setValueAtTime(0.6, t);
      tg.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      thump.connect(tg).connect(audioCtx.destination);
      thump.start(t);
      thump.stop(t + 0.12);
    } catch(e) { /* ignore */ }
  }

  function playDevilCrySFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;
      // Whimpering sine wave that warbles — sad and pathetic
      const osc = audioCtx.createOscillator();
      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.setValueAtTime(340, t + 0.1);
      osc.frequency.setValueAtTime(400, t + 0.2);
      osc.frequency.setValueAtTime(320, t + 0.3);
      // LFO for warble
      lfo.type = 'sine';
      lfo.frequency.value = 7;
      lfoGain.gain.value = 30;
      lfo.connect(lfoGain).connect(osc.frequency);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.setValueAtTime(0.35, t + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t); osc.stop(t + 0.35);
      lfo.start(t); lfo.stop(t + 0.35);
    } catch(e) { /* ignore */ }
  }

  /* ============================================================
     BANANA MONKEY SFX & CUTSCENE
     ============================================================ */

  function playBananaHandSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;
      // Soft "pop" / hand-off: short sine at 600Hz, gentle
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(400, t + 0.06);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.06);
    } catch(e) { /* ignore */ }
  }

  function playEatingSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;
      // Crunchy eating: noise burst through bandpass 800-2000Hz
      const bufSize = Math.floor(audioCtx.sampleRate * 0.15);
      const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        const env = Math.pow(1 - i / bufSize, 1.5);
        d[i] = (Math.random() * 2 - 1) * env;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buf;
      const bp = audioCtx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1400;
      bp.Q.value = 0.8;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      noise.connect(bp).connect(gain).connect(audioCtx.destination);
      noise.start(t);
      noise.stop(t + 0.15);
    } catch(e) { /* ignore */ }
  }

  function playTransformSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;
      // Rising arpeggio: C4→E4→G4→C5 (262→330→392→523Hz), each 80ms
      const notes = [262, 330, 392, 523];
      notes.forEach((freq, i) => {
        const nt = t + i * 0.08;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.22, nt);
        gain.gain.exponentialRampToValueAtTime(0.001, nt + 0.12);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(nt);
        osc.stop(nt + 0.14);
      });
    } catch(e) { /* ignore */ }
  }

  function playMonkeySFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;
      // Monkey chirps: 800→1200→800→1200Hz, each 80ms
      const freqs = [800, 1200, 800, 1200];
      freqs.forEach((freq, i) => {
        const nt = t + i * 0.085;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, nt);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.85, nt + 0.07);
        gain.gain.setValueAtTime(0.18, nt);
        gain.gain.exponentialRampToValueAtTime(0.001, nt + 0.08);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(nt);
        osc.stop(nt + 0.09);
      });
    } catch(e) { /* ignore */ }
  }

  function triggerBanana() {
    bananaActive = true;

    const overlay       = document.getElementById('banana-overlay');
    const bnYonah       = document.getElementById('bn-yonah');
    const bnDevil       = document.getElementById('bn-devil');
    const bnDevilEating = document.getElementById('bn-devil-eating');
    const bnBanana      = document.getElementById('bn-banana');
    const bnMonkey      = document.getElementById('bn-monkey');
    const bnBubble      = document.getElementById('bn-speech-bubble');
    const bnStars       = document.getElementById('bn-stars-transform');
    const bnText        = document.getElementById('bn-monkey-text');

    // Reset all state
    overlay.style.opacity    = '';
    overlay.style.transition = '';
    overlay.style.animation  = '';
    bnDevil.style.opacity        = '1';
    bnDevil.style.animation      = 'none';
    bnDevilEating.style.opacity  = '0';
    bnDevilEating.style.animation = 'none';
    bnBanana.style.animation     = 'none';
    bnBanana.style.opacity       = '1';
    bnBanana.style.transform     = '';
    bnMonkey.style.opacity       = '0';
    bnMonkey.style.transform     = 'scale(0)';
    bnMonkey.style.animation     = 'none';
    bnBubble.style.opacity       = '0';
    bnBubble.style.transform     = 'scale(0)';
    bnBubble.style.animation     = 'none';
    bnStars.style.opacity        = '0';
    bnStars.style.animation      = 'none';
    bnText.style.opacity         = '0';
    bnText.style.animation       = 'none';
    bnText.classList.remove('visible');
    bnYonah.style.animation      = 'none';

    // Force reflow
    void overlay.offsetWidth;

    // 0.3s: Show overlay
    setTimeout(() => {
      overlay.classList.add('active');
      overlay.style.animation = 'bnOverlayFadeIn 400ms ease-out forwards';
    }, 300);

    // 1s: Banana starts floating toward devil
    setTimeout(() => {
      void bnBanana.offsetWidth;
      bnBanana.style.animation = '';
      bnBanana.style.animation = 'bnBananaFloat 1000ms ease-in-out forwards';
    }, 1000);

    // 2s: Devil receives banana — hand-off SFX
    setTimeout(() => {
      playBananaHandSFX();
      // Banana has arrived — stop at devil's hand position
      bnBanana.style.animation = 'none';
      bnBanana.style.transform = 'translateX(320px) translateY(0) rotate(-15deg)';
    }, 2000);

    // 3s: Devil eats banana — eating SFX, switch to eating state
    setTimeout(() => {
      playEatingSFX();
      // Swap devil to eating state
      bnDevil.style.opacity = '0';
      void bnDevilEating.offsetWidth;
      bnDevilEating.style.animation = '';
      bnDevilEating.style.opacity = '1';
      // Banana eating animation — disappears into mouth
      void bnBanana.offsetWidth;
      bnBanana.style.animation = '';
      bnBanana.style.animation = 'bnBananaEat 500ms ease-in forwards';
    }, 3000);

    // 4s: Banana swallowed — transform sparkles + SFX
    setTimeout(() => {
      // Hide eating devil
      bnDevilEating.style.opacity = '0';
      bnBanana.style.opacity = '0';
      bnBanana.style.animation = 'none';
      // Show sparkles
      void bnStars.offsetWidth;
      bnStars.style.animation = '';
      bnStars.style.opacity = '1';
      bnStars.style.animation = 'bnTransformSparkle 600ms ease-out forwards';
      playTransformSFX();
    }, 4000);

    // 4.5s: Monkey appears with bounce!
    setTimeout(() => {
      void bnMonkey.offsetWidth;
      bnMonkey.style.animation = '';
      bnMonkey.style.opacity = '1';
      bnMonkey.style.transform = 'scale(0)';
      bnMonkey.style.animation = 'bnMonkeyAppear 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
      playMonkeySFX();
      // After appear, start jumping loop
      setTimeout(() => {
        bnMonkey.style.animation = 'bnMonkeyJump 600ms ease-in-out infinite';
      }, 450);
    }, 4500);

    // 5s: Speech bubble appears
    setTimeout(() => {
      void bnBubble.offsetWidth;
      bnBubble.style.animation = '';
      bnBubble.style.opacity = '1';
      bnBubble.style.transform = 'scale(0)';
      bnBubble.style.animation = 'bnSpeechPop 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
    }, 5000);

    // 5.5s: MONKEY! text
    setTimeout(() => {
      void bnText.offsetWidth;
      bnText.style.animation = '';
      bnText.style.opacity = '1';
      bnText.classList.add('visible');
    }, 5500);

    // 8s: Fade overlay
    setTimeout(() => {
      overlay.style.transition = 'opacity 1.0s ease-out';
      overlay.style.opacity    = '0';
    }, 8000);

    // 9s: Cleanup — devil → ashes in arena, recover after 5s
    setTimeout(() => {
      overlay.classList.remove('active');
      overlay.style.opacity    = '';
      overlay.style.transition = '';
      overlay.style.animation  = '';

      // Reset all elements
      bnDevil.style.opacity        = '1';
      bnDevil.style.animation      = 'none';
      bnDevilEating.style.opacity  = '0';
      bnDevilEating.style.animation = 'none';
      bnBanana.style.opacity       = '1';
      bnBanana.style.animation     = 'none';
      bnBanana.style.transform     = '';
      bnMonkey.style.opacity       = '0';
      bnMonkey.style.transform     = 'scale(0)';
      bnMonkey.style.animation     = 'none';
      bnBubble.style.opacity       = '0';
      bnBubble.style.transform     = 'scale(0)';
      bnBubble.style.animation     = 'none';
      bnStars.style.opacity        = '0';
      bnStars.style.animation      = 'none';
      bnText.style.opacity         = '0';
      bnText.style.animation       = 'none';
      bnText.classList.remove('visible');
      bnYonah.style.animation      = 'none';

      // Enemy → ashes in arena, recover after 5s
      fighterRight.classList.add('ashes');
      setTimeout(() => {
        fighterRight.classList.remove('ashes');
        fighterRight.classList.add('recovering');
        setTimeout(() => {
          fighterRight.classList.remove('recovering');
          bananaActive = false;
        }, 800);
      }, 5000);
    }, 9000);
  }

  function triggerArmWrestle() {
    armWrestleActive = true;

    const overlay       = document.getElementById('armwrestle-overlay');
    const awYonah       = document.getElementById('aw-yonah');
    const awDevil       = document.getElementById('aw-devil');
    const awGrip        = document.getElementById('aw-gripped-hands');
    const awStrain      = document.getElementById('aw-strain-lines');
    const awArmFly      = document.getElementById('aw-devil-arm-detached');
    const awBlood       = document.getElementById('aw-blood-shoulder');
    const awDevilOne    = document.getElementById('aw-devil-onearm');
    const awRipped      = document.getElementById('aw-ripped-text');
    const awTable       = document.getElementById('aw-table');

    // Reset all state
    overlay.style.opacity    = '';
    overlay.style.transition = '';
    awGrip.classList.remove('visible');
    awGrip.style.opacity = '0';
    awStrain.classList.remove('visible');
    awStrain.style.opacity = '0';
    awStrain.style.animation = 'none';
    awArmFly.style.opacity = '0';
    awArmFly.style.animation = 'none';
    awBlood.style.opacity = '0';
    awBlood.style.animation = 'none';
    awDevilOne.style.opacity = '0';
    awDevilOne.style.animation = 'none';
    awRipped.style.opacity = '0';
    awRipped.style.animation = 'none';
    awRipped.classList.remove('visible');
    awYonah.style.animation = 'none';
    awDevil.style.animation = 'none';
    awTable.style.animation = 'none';

    // Force reflow
    void overlay.offsetWidth;

    // 0.3s: Show overlay
    setTimeout(() => {
      overlay.classList.add('active');
    }, 300);

    // 1.2s: Grip hands appear
    setTimeout(() => {
      void awGrip.offsetWidth;
      awGrip.style.opacity = '';
      awGrip.classList.add('visible');
    }, 1200);

    // 2.0s: STRUGGLE — strain lines, wobble, SFX
    setTimeout(() => {
      void awStrain.offsetWidth;
      awStrain.style.animation = '';
      awStrain.style.opacity = '1';
      awStrain.style.animation = 'awStrainPulse 400ms ease-in-out infinite';

      // Yonah wobbles
      void awYonah.offsetWidth;
      awYonah.style.animation = '';
      awYonah.style.animation = 'awStruggle 0.7s ease-in-out 3.5';

      // Grip wobbles too
      void awGrip.offsetWidth;
      awGrip.style.animation = 'awStruggle 0.7s ease-in-out 3.5';

      // Devil wobbles (mirror applied via CSS transform scaleX(-1))
      void awDevil.offsetWidth;
      awDevil.style.animation = '';
      awDevil.style.animation = 'awStruggle 0.7s ease-in-out 3.5 0.1s';

      // Table shakes
      void awTable.offsetWidth;
      awTable.style.animation = '';
      awTable.style.animation = 'awTableShake 0.35s ease-in-out 7';

      playStruggleSFX();
      // Repeat struggle SFX
      setTimeout(() => playStruggleSFX(), 700);
      setTimeout(() => playStruggleSFX(), 1400);
    }, 2000);

    // 4.5s: RIPPED! — Yonah pulls, arm flies, blood spurts
    setTimeout(() => {
      // Stop struggle animations
      awStrain.style.animation = 'none';
      awStrain.style.opacity = '0';
      awGrip.style.animation = 'none';
      awGrip.style.opacity = '0';
      awDevil.style.animation = 'none';

      // Yonah leans dramatically back
      void awYonah.offsetWidth;
      awYonah.style.animation = '';
      awYonah.style.animation = 'awYonahPull 400ms ease-out forwards';

      // Devil shocked shake
      void awDevil.offsetWidth;
      awDevil.style.animation = '';
      awDevil.style.animation = 'awDevilShocked 150ms ease-in-out 3';

      // Arm detaches and flies
      void awArmFly.offsetWidth;
      awArmFly.style.animation = '';
      awArmFly.style.opacity = '1';
      awArmFly.style.animation = 'awArmFly 600ms ease-in forwards';

      // Blood spurts from shoulder
      void awBlood.offsetWidth;
      awBlood.style.animation = '';
      awBlood.style.opacity = '1';
      awBlood.style.animation = 'awBloodSpurt 400ms ease-out forwards';

      // Overlay shake
      void overlay.offsetWidth;
      overlay.style.animation = 'awOverlayShake 300ms ease-out';

      playRipSFX();
    }, 4500);

    // 5.2s: Original devil → one-armed crying devil
    setTimeout(() => {
      awDevil.style.opacity = '0';
      awDevil.style.animation = 'none';

      void awDevilOne.offsetWidth;
      awDevilOne.style.animation = '';
      awDevilOne.style.opacity = '1';
      awDevilOne.style.animation = 'awDevilBounce 400ms ease-in-out 6';

      playDevilCrySFX();
      setTimeout(() => playDevilCrySFX(), 400);
      setTimeout(() => playDevilCrySFX(), 800);
    }, 5200);

    // 5.5s: RIPPED! text
    setTimeout(() => {
      void awRipped.offsetWidth;
      awRipped.style.animation = '';
      awRipped.style.opacity = '1';
      awRipped.classList.add('visible');
    }, 5500);

    // 7.5s: Fade overlay
    setTimeout(() => {
      overlay.style.transition = 'opacity 1.0s ease-out';
      overlay.style.opacity    = '0';
    }, 7500);

    // 8.5s: Cleanup — devil → ashes → recover 5s
    setTimeout(() => {
      overlay.classList.remove('active');
      overlay.style.opacity    = '';
      overlay.style.transition = '';
      overlay.style.animation  = '';

      // Reset all elements
      awGrip.classList.remove('visible');
      awGrip.style.opacity = '0';
      awGrip.style.animation = 'none';
      awStrain.style.opacity = '0';
      awStrain.style.animation = 'none';
      awArmFly.style.opacity = '0';
      awArmFly.style.animation = 'none';
      awBlood.style.opacity = '0';
      awBlood.style.animation = 'none';
      awDevilOne.style.opacity = '0';
      awDevilOne.style.animation = 'none';
      awRipped.style.opacity = '0';
      awRipped.style.animation = 'none';
      awRipped.classList.remove('visible');
      awYonah.style.animation = 'none';
      awDevil.style.opacity = '';
      awDevil.style.animation = 'none';
      awTable.style.animation = 'none';

      // Enemy → ashes in arena, recover after 5s
      fighterRight.classList.add('ashes');
      setTimeout(() => {
        fighterRight.classList.remove('ashes');
        fighterRight.classList.add('recovering');
        setTimeout(() => {
          fighterRight.classList.remove('recovering');
          armWrestleActive = false;
        }, 800);
      }, 5000);
    }, 8500);
  }

  function triggerYacht() {
    yachtActive = true;

    // Grab elements
    const overlay        = document.getElementById('yacht-overlay');
    const yonah          = document.getElementById('yacht-yonah');
    const devil          = document.getElementById('yacht-devil');
    const devilWater     = document.getElementById('yacht-devil-water');
    const sharkFin       = document.getElementById('yacht-shark-fin');
    const sharkFull      = document.getElementById('yacht-shark-full');
    const blood          = document.getElementById('yacht-blood');
    const chompText      = document.getElementById('yacht-chomp-text');

    // Reset all state
    overlay.style.opacity    = '';
    overlay.style.transition = '';
    yonah.classList.remove('watching');
    devil.classList.remove('pushed');
    devilWater.classList.remove('visible');
    sharkFin.classList.remove('approaching', 'circling');
    sharkFull.classList.remove('lunging');
    blood.classList.remove('spreading');
    chompText.classList.remove('visible');

    // Force reflow on animated elements so re-adding classes works
    devil.style.animation     = 'none';
    sharkFin.style.animation  = 'none';
    sharkFull.style.animation = 'none';
    blood.style.animation     = 'none';
    chompText.style.animation = 'none';

    // Reset positions
    sharkFin.style.right  = '-80px';
    sharkFin.style.bottom = '42%';
    devilWater.style.opacity = '0';
    sharkFull.style.opacity  = '0';
    sharkFull.style.transform = 'translateY(100px)';
    blood.style.opacity   = '0';
    blood.style.transform = 'scale(0)';
    chompText.style.opacity = '0';
    chompText.style.transform = 'translate(-50%, -50%) rotate(-5deg) scale(0)';

    // 0.3s: Show overlay
    setTimeout(() => {
      overlay.classList.add('active');
    }, 300);

    // 1.0s: Yonah and Devil appear (overlay already visible, they're in it)
    // They appear immediately since the overlay is shown

    // 2.5s: PUSH — devil gets .pushed, Yonah gets .watching, play splash SFX
    setTimeout(() => {
      void devil.offsetWidth; // reflow
      devil.style.animation = '';
      devil.classList.add('pushed');
      yonah.classList.add('watching');
      playSplashSFX();
    }, 2500);

    // 3.4s: Devil in water visible, yacht-devil hidden
    setTimeout(() => {
      devil.style.opacity = '0';
      devilWater.style.opacity = '';  // remove inline opacity
      devilWater.classList.add('visible');
    }, 3400);

    // 4.0s: Shark fin appears (slides in from right)
    setTimeout(() => {
      void sharkFin.offsetWidth; // reflow
      sharkFin.style.animation = '';
      sharkFin.style.right = '-80px';
      sharkFin.classList.add('approaching');
    }, 4000);

    // 6.0s: Shark fin circling near devil
    setTimeout(() => {
      sharkFin.classList.remove('approaching');
      sharkFin.classList.add('circling');
    }, 6000);

    // 7.0s: Shark fin disappears, full shark lunges, CHOMP SFX
    setTimeout(() => {
      sharkFin.classList.remove('approaching', 'circling');
      sharkFin.style.opacity = '0';
      void sharkFull.offsetWidth;
      sharkFull.style.animation = '';
      sharkFull.style.opacity = '1';
      sharkFull.classList.add('lunging');
      playSharkChompSFX();
    }, 7000);

    // 7.4s: Devil in water hidden, blood spreads
    setTimeout(() => {
      devilWater.classList.remove('visible');
      devilWater.style.opacity = '0';
      void blood.offsetWidth;
      blood.style.animation = '';
      blood.classList.add('spreading');
    }, 7400);

    // 8.0s: CHOMP! text appears
    setTimeout(() => {
      void chompText.offsetWidth;
      chompText.style.animation = '';
      chompText.classList.add('visible');
    }, 8000);

    // 10.0s: Fade overlay
    setTimeout(() => {
      overlay.style.transition = 'opacity 0.8s ease-out';
      overlay.style.opacity    = '0';
    }, 10000);

    // 11.0s: Cleanup + enemy → ashes → recover
    setTimeout(() => {
      overlay.classList.remove('active');
      overlay.style.opacity    = '';
      overlay.style.transition = '';
      yonah.classList.remove('watching');
      devil.classList.remove('pushed');
      devil.style.opacity   = '';
      devil.style.animation = '';
      devilWater.classList.remove('visible');
      devilWater.style.opacity = '';
      sharkFin.classList.remove('approaching', 'circling');
      sharkFin.style.opacity   = '';
      sharkFin.style.animation = '';
      sharkFin.style.right     = '-80px';
      sharkFull.classList.remove('lunging');
      sharkFull.style.opacity   = '0';
      sharkFull.style.transform = 'translateY(100px)';
      sharkFull.style.animation = '';
      blood.classList.remove('spreading');
      blood.style.opacity   = '0';
      blood.style.transform = 'scale(0)';
      blood.style.animation = '';
      chompText.classList.remove('visible');
      chompText.style.opacity   = '0';
      chompText.style.animation = '';

      // Enemy → ashes in arena, recover after 5s
      fighterRight.classList.add('ashes');
      setTimeout(() => {
        fighterRight.classList.remove('ashes');
        fighterRight.classList.add('recovering');
        setTimeout(() => {
          fighterRight.classList.remove('recovering');
          yachtActive = false;
        }, 800);
      }, 5000);
    }, 11000);
  }

  // ================================================================
  // SHRINK RAY CUTSCENE — Round 4, streak 5
  // ================================================================

  function playShrinkZapSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;
      // Ascending sine sweep 2000→8000Hz over 500ms
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2000, t);
      osc.frequency.exponentialRampToValueAtTime(8000, t + 0.5);
      oscGain.gain.setValueAtTime(0.5, t);
      oscGain.gain.setValueAtTime(0.5, t + 0.4);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.connect(oscGain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.52);

      // Crackling noise burst
      const bufLen = Math.floor(audioCtx.sampleRate * 0.5);
      const noiseBuf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
      const nd = noiseBuf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) {
        // Intermittent crackle
        nd[i] = (Math.random() > 0.3 ? (Math.random() * 2 - 1) * 0.6 : 0);
      }
      const noiseSrc = audioCtx.createBufferSource();
      noiseSrc.buffer = noiseBuf;
      const bp = audioCtx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(3000, t);
      bp.frequency.exponentialRampToValueAtTime(8000, t + 0.5);
      bp.Q.value = 0.5;
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.3, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      noiseSrc.connect(bp).connect(noiseGain).connect(audioCtx.destination);
      noiseSrc.start(t);
      noiseSrc.stop(t + 0.52);
    } catch (e) {}
  }

  function playShrinkStompSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;
      // Deep 60Hz thud (100ms)
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, t);
      osc.frequency.exponentialRampToValueAtTime(20, t + 0.1);
      oscGain.gain.setValueAtTime(1.2, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(oscGain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.12);

      // Noise burst (impact)
      const bufLen = Math.floor(audioCtx.sampleRate * 0.1);
      const noiseBuf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
      const nd = noiseBuf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) nd[i] = (Math.random() * 2 - 1);
      const noiseSrc = audioCtx.createBufferSource();
      noiseSrc.buffer = noiseBuf;
      const lp = audioCtx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 800;
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.8, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      noiseSrc.connect(lp).connect(noiseGain).connect(audioCtx.destination);
      noiseSrc.start(t);
      noiseSrc.stop(t + 0.12);
    } catch (e) {}
  }

  function triggerShrinkRay() {
    shrinkActive = true;

    const overlay    = document.getElementById('shrink-overlay');
    const yonah      = document.getElementById('shrink-yonah');
    const beam       = document.getElementById('shrink-beam');
    const alien      = document.getElementById('shrink-alien');
    const alienTiny  = document.getElementById('shrink-alien-tiny');
    const boot       = document.getElementById('shrink-boot');
    const squishText = document.getElementById('shrink-squish-text');
    const impact     = document.getElementById('shrink-impact');

    // Reset state
    overlay.style.opacity    = '';
    overlay.style.transition = '';
    overlay.style.animation  = '';
    yonah.style.opacity      = '0';
    yonah.style.animation    = 'none';
    beam.style.opacity       = '0';
    beam.style.width         = '0';
    beam.classList.remove('active');
    alien.style.opacity      = '0';
    alien.style.animation    = 'none';
    alien.style.transform    = '';
    alienTiny.style.opacity  = '0';
    boot.style.opacity       = '0';
    boot.style.animation     = 'none';
    squishText.style.opacity = '0';
    squishText.style.animation = 'none';
    squishText.classList.remove('visible');
    impact.style.opacity     = '0';
    impact.style.animation   = 'none';

    // Force reflow
    void overlay.offsetWidth;

    // 0.3s: Show overlay
    setTimeout(() => {
      overlay.classList.add('active');
      overlay.style.animation = 'shrinkOverlayFadeIn 400ms ease-out forwards';
    }, 300);

    // 1s: Yonah appears
    setTimeout(() => {
      void yonah.offsetWidth;
      yonah.style.animation = '';
      yonah.style.opacity = '1';
    }, 1000);

    // 1.5s: Alien appears
    setTimeout(() => {
      void alien.offsetWidth;
      alien.style.animation = '';
      alien.style.opacity = '1';
    }, 1500);

    // 2.5s: ZAP! Beam fires, alien starts shrinking
    setTimeout(() => {
      playShrinkZapSFX();
      // Extend beam across to alien
      beam.style.opacity = '1';
      beam.classList.add('active');
      void beam.offsetWidth;
      beam.style.transition = 'width 0.3s ease-out';
      beam.style.width = '38%';
      // Alien shrinks
      void alien.offsetWidth;
      alien.style.animation = 'shrinkAlien 1.5s ease-in forwards';
    }, 2500);

    // 4s: Alien is tiny, beam stops, tiny alien appears
    setTimeout(() => {
      alien.style.opacity = '0';
      alien.style.animation = 'none';
      beam.style.opacity = '0';
      beam.classList.remove('active');
      beam.style.transition = 'none';
      beam.style.width = '0';
      // Show tiny alien
      alienTiny.style.opacity = '1';
    }, 4000);

    // 5s: Boot descends, stomp
    setTimeout(() => {
      boot.style.opacity = '1';
      void boot.offsetWidth;
      boot.style.animation = 'shrinkBootStomp 0.6s ease-in forwards';
    }, 5000);

    // 5.2s: STOMP SFX + screen shake
    setTimeout(() => {
      playShrinkStompSFX();
      // Screen shake via overlay
      overlay.style.animation = 'shrinkScreenShake 0.4s ease-out';
      // Show impact sparks
      impact.style.opacity = '1';
      void impact.offsetWidth;
      impact.style.animation = 'shrinkImpactBurst 0.3s ease-out forwards';
    }, 5200);

    // 5.5s: SQUISH! text
    setTimeout(() => {
      void squishText.offsetWidth;
      squishText.style.animation = '';
      squishText.style.opacity = '1';
      squishText.classList.add('visible');
    }, 5500);

    // 7.5s: Fade out
    setTimeout(() => {
      overlay.style.animation = 'none';
      overlay.style.transition = 'opacity 1.0s ease-out';
      overlay.style.opacity = '0';
    }, 7500);

    // 8.5s: Cleanup, ashes, recover
    setTimeout(() => {
      overlay.classList.remove('active');
      overlay.style.opacity    = '';
      overlay.style.transition = '';
      overlay.style.animation  = '';

      yonah.style.opacity      = '0';
      yonah.style.animation    = 'none';
      beam.style.opacity       = '0';
      beam.style.width         = '0';
      beam.classList.remove('active');
      alien.style.opacity      = '0';
      alien.style.animation    = 'none';
      alien.style.transform    = '';
      alienTiny.style.opacity  = '0';
      boot.style.opacity       = '0';
      boot.style.animation     = 'none';
      squishText.style.opacity = '0';
      squishText.style.animation = 'none';
      squishText.classList.remove('visible');
      impact.style.opacity     = '0';
      impact.style.animation   = 'none';

      // Enemy → ashes, recover after 5s
      fighterRight.classList.add('ashes');
      setTimeout(() => {
        fighterRight.classList.remove('ashes');
        fighterRight.classList.add('recovering');
        setTimeout(() => {
          fighterRight.classList.remove('recovering');
          shrinkActive = false;
        }, 800);
      }, 5000);
    }, 8500);
  }

  // ================================================================
  // BLACK HOLE CUTSCENE — Round 4, streak 10
  // ================================================================

  function playBlackholeRumbleSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;
      // 30Hz sawtooth rumble, 4s, gain ramps up then down
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(30, t);
      oscGain.gain.setValueAtTime(0.001, t);
      oscGain.gain.linearRampToValueAtTime(0.4, t + 1.5);
      oscGain.gain.setValueAtTime(0.4, t + 2.5);
      oscGain.gain.linearRampToValueAtTime(0.001, t + 4.0);
      osc.connect(oscGain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 4.1);

      // Filtered noise rumble
      const bufLen = Math.floor(audioCtx.sampleRate * 4.0);
      const noiseBuf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
      const nd = noiseBuf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) nd[i] = (Math.random() * 2 - 1);
      const noiseSrc = audioCtx.createBufferSource();
      noiseSrc.buffer = noiseBuf;
      const lp = audioCtx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 120;
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.001, t);
      noiseGain.gain.linearRampToValueAtTime(0.3, t + 2.0);
      noiseGain.gain.linearRampToValueAtTime(0.001, t + 4.0);
      noiseSrc.connect(lp).connect(noiseGain).connect(audioCtx.destination);
      noiseSrc.start(t);
      noiseSrc.stop(t + 4.1);
    } catch (e) {}
  }

  function playBlackholeSuckSFX() {
    ensureAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    try {
      const t = audioCtx.currentTime;
      // Descending noise sweep 3000→100Hz, 2s
      const bufLen = Math.floor(audioCtx.sampleRate * 2.0);
      const noiseBuf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
      const nd = noiseBuf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) nd[i] = (Math.random() * 2 - 1);
      const noiseSrc = audioCtx.createBufferSource();
      noiseSrc.buffer = noiseBuf;
      const bp = audioCtx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(3000, t);
      bp.frequency.exponentialRampToValueAtTime(100, t + 2.0);
      bp.Q.value = 2.0;
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.6, t);
      noiseGain.gain.linearRampToValueAtTime(0.001, t + 2.0);
      noiseSrc.connect(bp).connect(noiseGain).connect(audioCtx.destination);
      noiseSrc.start(t);
      noiseSrc.stop(t + 2.1);
    } catch (e) {}
  }

  function triggerBlackHole() {
    blackholeActive = true;

    const overlay      = document.getElementById('blackhole-overlay');
    const yonah        = document.getElementById('bh-yonah');
    const alien        = document.getElementById('bh-alien');
    const hole         = document.getElementById('bh-hole');
    const debris       = document.getElementById('bh-debris');
    const absorbedText = document.getElementById('bh-absorbed-text');

    // Reset state
    overlay.style.opacity      = '';
    overlay.style.transition   = '';
    overlay.style.animation    = '';
    yonah.style.opacity        = '0';
    yonah.style.animation      = 'none';
    alien.style.opacity        = '0';
    alien.style.animation      = 'none';
    alien.style.transform      = '';
    hole.style.transform       = 'scale(0)';
    hole.style.animation       = 'none';
    hole.style.opacity         = '0';
    debris.style.opacity       = '0';
    absorbedText.style.opacity = '0';
    absorbedText.style.animation = 'none';
    absorbedText.classList.remove('visible');

    // Force reflow
    void overlay.offsetWidth;

    // 0.3s: Show overlay (space background)
    setTimeout(() => {
      overlay.classList.add('active');
      overlay.style.animation = 'bhOverlayFadeIn 400ms ease-out forwards';
    }, 300);

    // 1s: Yonah with portal device appears
    setTimeout(() => {
      void yonah.offsetWidth;
      yonah.style.animation = '';
      yonah.style.opacity = '1';
    }, 1000);

    // 1.5s: Alien appears (alarmed)
    setTimeout(() => {
      void alien.offsetWidth;
      alien.style.animation = '';
      alien.style.opacity = '1';
    }, 1500);

    // 2.5s: Black hole materializes
    setTimeout(() => {
      playBlackholeRumbleSFX();
      hole.style.opacity = '1';
      void hole.offsetWidth;
      hole.style.animation = 'bhHoleAppear 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
    }, 2500);

    // 3.5s: Alien spaghettification begins, debris streams active
    setTimeout(() => {
      playBlackholeSuckSFX();
      debris.style.opacity = '1';
      void alien.offsetWidth;
      alien.style.animation = 'alienSucked 2s ease-in forwards';
    }, 3500);

    // 5.5s: Alien fully absorbed — black hole pulses
    setTimeout(() => {
      alien.style.opacity = '0';
      alien.style.animation = 'none';
      debris.style.opacity = '0';
      // Hole pulses with satisfaction
      void hole.offsetWidth;
      hole.style.animation = 'bhHolePulse 0.6s ease-in-out infinite';
    }, 5500);

    // 6s: ABSORBED! text
    setTimeout(() => {
      void absorbedText.offsetWidth;
      absorbedText.style.animation = '';
      absorbedText.style.opacity = '1';
      absorbedText.classList.add('visible');
    }, 6000);

    // 8s: Fade
    setTimeout(() => {
      overlay.style.animation = 'none';
      overlay.style.transition = 'opacity 1.0s ease-out';
      overlay.style.opacity = '0';
    }, 8000);

    // 9s: Cleanup, ashes, recover
    setTimeout(() => {
      overlay.classList.remove('active');
      overlay.style.opacity      = '';
      overlay.style.transition   = '';
      overlay.style.animation    = '';

      yonah.style.opacity        = '0';
      yonah.style.animation      = 'none';
      alien.style.opacity        = '0';
      alien.style.animation      = 'none';
      alien.style.transform      = '';
      hole.style.transform       = 'scale(0)';
      hole.style.animation       = 'none';
      hole.style.opacity         = '0';
      debris.style.opacity       = '0';
      absorbedText.style.opacity = '0';
      absorbedText.style.animation = 'none';
      absorbedText.classList.remove('visible');

      // Enemy → ashes, recover after 5s
      fighterRight.classList.add('ashes');
      setTimeout(() => {
        fighterRight.classList.remove('ashes');
        fighterRight.classList.add('recovering');
        setTimeout(() => {
          fighterRight.classList.remove('recovering');
          blackholeActive = false;
        }, 800);
      }, 5000);
    }, 9000);
  }

  window.advanceTime = function (ms) {
    // no-op for this game — it's event-driven, not frame-based
  };
})();
