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
    const pct = Math.min((correctStreak / milestones[milestones.length - 1]) * 100, 100);
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
  async function submitAnswer() {
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

      if (streakBattles[gameRound]) {
        const films = streakBattles[gameRound].films;
        updateHP();
        await new Promise(resolve => setTimeout(resolve, 700));
        const won = hp >= 100;
        if (films[correctStreak]) {
          await playStreakFilm(correctStreak, won);
        }
        if (won) {
          playWinSFX();
          if (correctStreak !== 50) await playStreakFilm(50, true);
          window.location.reload();
        } else {
          generateQuestion();
          isProcessing = false;
        }
        return;
      }

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
  // Kraken arena and streak films. All scene artwork is local to the game.
  const krakenRound = 5;
  const krakenSVG = `<svg class="karate-svg" viewBox="0 0 120 180" width="120" height="180" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <g stroke="#13394b" stroke-width="12">
        <path d="M40 83 Q19 103 14 72 T5 70 M46 91 Q18 128 8 106 M52 97 Q26 155 16 132 M57 100 Q36 172 30 146 M64 99 Q64 160 51 158 M72 96 Q89 161 98 137 M80 90 Q105 131 112 111"/>
      </g>
      <path stroke="#37afa3" stroke-width="7" d="M40 83 Q19 103 14 72 T5 70 M46 91 Q18 128 8 106 M52 97 Q26 155 16 132 M57 100 Q36 172 30 146 M64 99 Q64 160 51 158 M72 96 Q89 161 98 137 M80 90 Q105 131 112 111"/>
      <g class="outer-tentacle"><path stroke="#13394b" stroke-width="12" d="M81 83 Q105 104 109 68 Q114 41 116 58"/><path stroke="#37afa3" stroke-width="7" d="M81 83 Q105 104 109 68 Q114 41 116 58"/></g>
    </g>
    <path fill="#268e91" stroke="#13394b" stroke-width="3" d="M26 72 Q21 38 45 22 L69 8 Q93 27 93 60 Q99 87 79 100 Q48 115 29 91Z"/>
    <path fill="#69c6b4" d="M33 57 Q32 34 64 19 Q49 30 44 54Z"/>
    <g fill="#efbe78"><circle cx="77" cy="36" r="3"/><circle cx="82" cy="45" r="2"/><circle cx="72" cy="30" r="2"/></g>
    <g stroke="#123948" stroke-width="2.5" fill="#ffda70"><path d="M34 62L53 67Q51 86 39 77Z"/><path d="M65 66L86 58Q85 79 71 77Z"/></g>
    <g fill="#163545"><ellipse cx="46" cy="70" rx="2" ry="5"/><ellipse cx="76" cy="68" rx="2" ry="5"/><path d="M54 87Q61 80 68 86L60 96Z"/></g>
  </svg>`;

  const krakenFilms = {
    5: ['The whaling ship', 'Yonah lands a harpoon from the bow. The Kraken dives!'],
    10: ['Trouble below', 'The Kraken swims into a sea mine. BOOM!'],
    20: ['Full steam ahead', 'With Yonah on deck, the cruise ship crashes into the Kraken.'],
    30: ['Dinner at the sushi bar', 'The chef slides a plate of octopus nigiri over to Yonah.'],
    40: ['Orca crossing', 'An orca bites off the tip of a tentacle. The Kraken slips away.'],
    50: ['A truce at sea', '']
  };

  const snakeRound = 6;
  const snakeSVG = `<svg class="karate-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 180" width="120" height="180">
    <ellipse cx="62" cy="153" rx="48" ry="8" fill="#1c3025" opacity=".18"/>
    <g stroke-linecap="round" fill="none">
      <path d="M110 121Q117 150 80 140C28 119 11 153 58 152C110 153 98 122 74 113Q55 104 64 80" stroke="#234533" stroke-width="18"/>
      <path d="M110 121Q117 150 80 140C28 119 11 153 58 152C110 153 98 122 74 113Q55 104 64 80" stroke="#60a455" stroke-width="12"/>
    </g>
    <path d="M60 110C46 105 22 80 23 58Q23 32 49 27Q73 6 92 32Q109 56 90 85L69 110Z" fill="#568e4b" stroke="#234533" stroke-width="3"/>
    <path d="M32 51Q41 31 49 41L44 68Z M82 32Q99 39 94 61L80 51Z" fill="#efbe65"/>
    <path d="M48 74Q62 63 78 72L67 110L58 107Z" fill="#e7c77c"/>
    <path d="M44 47Q52 34 70 35Q81 36 85 50L76 70Q65 82 45 67L35 63Q28 55 44 47Z" fill="#88b964" stroke="#234533" stroke-width="3"/>
    <path d="M43 48L56 50Q48 61 43 48ZM66 48L78 43Q76 56 66 55Z" fill="#ffe18a" stroke="#234533" stroke-width="2"/>
    <path d="M48 50v4m23-6v5M39 63q13 7 24 0" fill="none" stroke="#263d2c" stroke-width="2"/>
    <path d="M45 67l-14 9-10-1m10 1-6 7" fill="none" stroke="#ad3854" stroke-width="2.2"/>
  </svg>`;

  const snakeFilms = {
    5: ['Special delivery', 'Yonah sidesteps. Snake punches its own face.'],
    10: ['The pancake special', 'Yonah flips the undefeated champion of breakfast.'],
    20: ['Spare me!', 'Yonah rolls one melon. Snake knocks down every pin.'],
    30: ['Delicates only', 'Yonah runs the spin cycle. Snake comes out wearing the entire lost-and-found.'],
    40: ['The great balloon artist', 'Three twists later, the fearsome cobra is a prize-winning poodle.'],
    50: ['Terms of sssurrender', '']
  };

  function snakeFilmArt(streak) {
    const hero = fighterLeft.querySelector('.karate-svg').outerHTML;
    const pose = (x, y, scale, art) => `<g transform="translate(${x} ${y}) scale(${scale})">${art}</g>`;
    // Hold the last pose so the punch line is readable before practice resumes.
    const tween = (type, values, times, duration, art) =>
      `<g transform="${type}(${values.split(';')[0]})"><animateTransform attributeName="transform" type="${type}" values="${values}" keyTimes="${times}" dur="${duration}s" fill="freeze"/>${art}</g>`;
    const at = (time, art) => `<g opacity="0"><set attributeName="opacity" to="1" begin="${time}s" fill="freeze"/>${art}</g>`;
    const until = (time, art) => `<g>${art}<set attributeName="opacity" to="0" begin="${time}s" fill="freeze"/></g>`;
    const ink = (x,y,words,size=17) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="800" font-size="${size}" fill="#302738">${words}</text>`;
    const bubble = (x,y,words) => {
      const width = words.length * 9 + 28;
      return pose(x,y,1,`<path d="M0 0H${width}V35H31L20 46V35H0Z" fill="#fff9e6" stroke="#49384a" stroke-width="2.5"/>${ink(width/2,23,words,15)}`);
    };
    const slide = (values,times,duration,art) => tween('translate',values,times,duration,art);
    const spin = (values,times,duration,art) => tween('rotate',values,times,duration,art);
    const shake = art => slide('0 0;0 0;-10 -3;8 1;-4 0;0 0','0;.45;.49;.54;.60;1',2.4,art);
    const snake = pose(-60,-85,1,snakeSVG);
    const floor = (wall, ground) => `<rect width="600" height="300" fill="${wall}"/><path d="M0 201Q140 185 304 202T600 198V300H0Z" fill="${ground}"/><path d="M0 248H600" stroke="#463843" opacity=".15"/>`;
    let art;
    if (streak === 5) {
      const glove = '<path d="M0 0L13-2Q10-22 23-25Q29-25 29-16Q34-32 44-25Q55-21 53-6Q58 11 44 16H18L14 9H0Z" fill="#ea5357" stroke="#582e3d" stroke-width="3"/><rect x="-7" y="-6" width="16" height="18" rx="3" fill="#fff0c3" stroke="#582e3d" stroke-width="3"/>';
      art = floor('#f3d09d','#c79274') + '<path d="M0 105H600M0 148H600" stroke="#bd5d53" stroke-width="5"/>'
        + slide('0 0;0 0;-43 13;-43 13','0;.20;.36;1',2.8,pose(144,92,.8,hero))
        + shake(pose(385,78,.93,snakeSVG))
        + slide('374 150;374 150;175 144;163 110;262 73;410 134;409 142','0;.15;.38;.50;.70;.85;1',1.9,spin('180;180;360;360','0;.4;.8;1',1.8,glove))
        + until(.9,bubble(333,27,'Never misses!')) + at(1.8,bubble(320,30,'I stand corrected.'));
    } else if (streak === 10) {
      const pan = '<path d="M-96 0Q-78 16 5 19Q63 20 83 0Z" fill="#485565" stroke="#27313f" stroke-width="4"/><path d="M-95 2H-163" stroke="#634134" stroke-width="10" stroke-linecap="round"/>';
      const butter = '<path d="M0 0l19-3 9 5-20 4Z" fill="#ffe981" stroke="#ae7d3b" stroke-width="2"/>';
      art = floor('#edd9a7','#bc8058') + '<rect x="48" y="32" width="148" height="39" rx="6" fill="#fff0cd"/>' + ink(122,58,'DOJO DINER')
        + pose(92,99,.8,hero) + pose(337,225,1,spin('0;-13;8;0','0;.28;.55;1',1.8,pan))
        + slide('336 148;336 140;337 67;343 151;343 201;343 201','0;.18;.44;.67;.80;1',2.5,
          spin('0;0;345;360;360','0;.15;.66;.77;1',2.5,tween('scale','1 1;1 1;1.65 .27;1.65 .27','0;.68;.8;1',2.5,snake)))
        + at(2,slide('340 63;340 183','0;1',2.7,butter)) + at(2.2,bubble(354,43,'Hold the sssyrup.'));
    } else if (streak === 20) {
      const pin = '<path d="M-7 0Q-16-7-9-21Q-3-32-6-39Q-9-48-2-51Q8-53 7-44Q4-32 10-22Q19-2 7 0Z" fill="#fff8df" stroke="#514053" stroke-width="2.5"/><path d="M-5-32H6" stroke="#d25f5b" stroke-width="5"/>';
      const melon = '<circle r="22" fill="#72a65a" stroke="#355843" stroke-width="3"/><path d="M0-20Q-23 0 0 20M3-21Q26 0 3 21" fill="none" stroke="#426e48" stroke-width="4"/>';
      art = floor('#bfced2','#ddb07a') + '<path d="M0 242L600 183M0 282L600 207" stroke="#ac7e57" stroke-width="3"/>'
        + pose(24,92,.77,hero) + slide('114 212;114 212;310 210;354 211','0;.15;.72;1',1.5,spin('0;540','0;1',1.5,melon))
        + slide('0 0;0 0;166 -8;211 15','0;.43;.74;1',2.5,pose(321,150,.83,spin('0;0;116;100','0;.45;.8;1',2.3,snake)))
        + [0,1,2,3,4].map(i=>pose(448+i*23,211+i%2*9,1,spin('0;0;'+(63+i*6)+';83','0;.65;.88;1',2.55,pin))).join('')
        + at(2.4,bubble(317,34,'I was the ball?!'));
    } else if (streak === 30) {
      const sock = '<path d="M0 0H16V25Q13 38-8 37Q-17 33-10 26L0 21Z" fill="#f68e91" stroke="#69435b" stroke-width="3"/><path d="M1 6H15" stroke="white" stroke-width="4"/>';
      const washer = '<rect x="202" y="64" width="155" height="153" rx="13" fill="#ede6ca" stroke="#52596c" stroke-width="5"/><circle cx="279" cy="145" r="55" fill="#7795a2" stroke="#485768" stroke-width="9"/><circle cx="224" cy="80" r="6" fill="#e48763"/>';
      art = floor('#c4d8cc','#b9a295') + pose(80,99,.83,hero) + shake(washer)
        + until(2.05,pose(279,145,.54,spin('0;75;1000','0;.30;1',2.05,snake)))
        + at(2.05,slide('0 0;0 0;163 16;158 13','0;.69;.9;1',3,pose(279,145,.8,snake + pose(-14,-55,.92,sock) + pose(24,28,.75,sock))))
        + at(2.65,bubble(326,36,'These aren’t my socks.'));
    } else if (streak === 40) {
      const poodle = '<g fill="#8cc66d" stroke="#32563e" stroke-width="3"><ellipse cx="0" cy="0" rx="35" ry="14"/><ellipse cx="-23" cy="19" rx="10" ry="22"/><ellipse cx="22" cy="18" rx="10" ry="22"/><ellipse cx="26" cy="-19" rx="12" ry="21"/><ellipse cx="39" cy="-34" rx="21" ry="12"/><ellipse cx="25" cy="-48" rx="10" ry="17"/><ellipse cx="-40" cy="-15" rx="9" ry="20" transform="rotate(-34 -40 -15)"/></g><circle cx="42" cy="-37" r="2.5"/><path d="M57-31l11 2 5-4m-5 4 4 4" fill="none" stroke="#b64b5b" stroke-width="2"/>';
      art = floor('#ecd1cf','#d9b995') + '<path d="M0 26Q300 104 600 22" fill="none" stroke="#69516b" stroke-width="3"/><path d="M62 42l27 5-18 20ZM195 65h28l-14 19ZM438 57l28-5-9 22Z" fill="#d36a69"/>'
        + pose(180,85,.88,hero) + until(1.95,pose(326,155,.9,spin('0;-28;160;-90;360','0;.25;.5;.72;1',1.95,snake)))
        + at(1.95,pose(326,166,1.1,poodle)) + at(2,bubble(325,51,'Do NOT teach me fetch.'));
    } else {
      art = floor('#ebd5bf','#aeaa87') + pose(120,75,.96,hero) + pose(372,65,1.03,snakeSVG);
    }
    return '<svg viewBox="0 0 600 300" aria-hidden="true">' + art + '</svg>';
  }

  const bearRound = 7;
  const bearSVG = `<svg class="karate-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 180" width="120" height="180">
    <ellipse cx="60" cy="160" rx="48" ry="7" fill="#4a3028" opacity=".15"/>
    <g stroke="#482e27" stroke-width="3" stroke-linejoin="round">
      <path fill="#975a3a" d="M35 77Q16 79 9 109Q4 122 15 126Q24 129 32 116L27 143Q18 159 27 162H49L57 145H66L72 162H94Q104 159 94 143L88 111Q99 132 109 122Q118 111 105 91Q97 76 82 75Z"/>
      <ellipse cx="60" cy="109" rx="26" ry="30" fill="#bd8054" stroke="none"/>
      <circle cx="31" cy="30" r="15" fill="#9a5a3a"/><circle cx="87" cy="30" r="15" fill="#9a5a3a"/>
      <g fill="#633d33" stroke="none"><circle cx="31" cy="29" r="8"/><circle cx="87" cy="29" r="8"/></g>
      <path fill="#ad6b45" d="M21 50Q23 23 47 21L52 15L60 20L70 16L73 22Q95 25 98 52L102 67L96 66Q91 89 63 91Q34 92 22 72L16 73Z"/>
      <g fill="#fff4cf"><ellipse cx="43" cy="51" rx="8" ry="10"/><ellipse cx="73" cy="51" rx="8" ry="10"/></g>
      <path d="M32 40L48 45M69 44L85 38" fill="none" stroke-linecap="round"/>
      <g fill="#352a28" stroke="none"><circle cx="44" cy="53" r="3"/><circle cx="72" cy="53" r="3"/></g>
      <ellipse cx="58" cy="69" rx="22" ry="16" fill="#e5b57d"/><path d="M49 62Q59 57 68 62L60 69H56Z" fill="#352a28"/>
      <path d="M58 69V74Q53 79 49 73M58 74Q64 79 68 73" fill="none" stroke-width="2"/>
      <path d="M32 83Q60 96 87 81L77 103L61 98L44 106Z" fill="#c34539"/>
    </g></svg>`;

  const bearFilms = {
    5: ['The honey helmet', 'Yonah tips the honey jar. Bear gets every last drop. On his head.'],
    10: ['Chairlift for one', 'Yonah steps off the seesaw. Bear discovers express seating.'],
    20: ['Catch of the day', 'Yonah casts once and lands a bear in a very small fishing net.'],
    30: ['The pie judge', 'Bear demands a sample. Yonah delivers it face first.'],
    40: ['The rug audition', 'Yonah whips the picnic blanket away. Bear lands in its place.'],
    50: ['Customer service', '']
  };

  function startBearFight() {
    startStreakFight(bearRound, 'Bear', bearSVG, ['🍯', '🪑', '🎣', '🥧', '🧺', '💬']);
  }

  function bearFilmArt(streak) {
    const hero = fighterLeft.querySelector('.karate-svg').outerHTML;
    const place = (x,y,k,art) => `<g transform="translate(${x} ${y}) scale(${k})">${art}</g>`;
    const move = (path,dur,art,begin=0) => `<g>${art}<animateMotion path="${path}" begin="${begin}s" dur="${dur}s" fill="freeze"/></g>`;
    const turn = (angles,dur,art,begin=0) => `<g>${art}<animateTransform attributeName="transform" type="rotate" values="${angles}" begin="${begin}s" dur="${dur}s" fill="freeze"/></g>`;
    const reveal = (at,art) => `<g opacity="0"><set attributeName="opacity" to="1" begin="${at}s" fill="freeze"/>${art}</g>`;
    const label = (x,y,words) => `<text x="${x}" y="${y}" text-anchor="middle" fill="#492e29" stroke="#fff4d8" stroke-width="5" paint-order="stroke" font-family="system-ui,sans-serif" font-weight="800" font-size="18">${words}</text>`;
    const woods = '<rect width="600" height="300" fill="#f3d6a0"/><circle cx="507" cy="48" r="29" fill="#fff3c7"/><path fill="#a2b29a" d="M0 154L90 67L174 144L246 85L355 160L452 78L600 163V222H0Z"/><path fill="#76977b" d="M0 182Q119 137 252 171T600 158V232H0Z"/><path fill="#c5b282" d="M0 204Q141 179 303 202T600 192V300H0Z"/>';
    const bear = place(-60,-90,1,bearSVG);
    let art;
    if (streak === 5) {
      const jar = '<path d="M-25-23H25L20-13Q40 13 24 29H-24Q-40 13-20-13Z" fill="#e8a239" stroke="#744725" stroke-width="4"/><rect x="-21" y="-3" width="42" height="18" rx="4" fill="#fff3c8"/>' + label(0,12,'HONEY');
      art = place(100,80,.85,hero) + place(355,85,.9,bearSVG)
        + move('M0 0 Q124 -130 228 -9',1.55,place(180,137,.95,turn('0;180',1.55,jar)),.3)
        + reveal(1.95,label(408,63,'Who turned out the lights?'));
    } else if (streak === 10) {
      const chair = '<path d="M-32 0H31V-65M-25 0V28M25 0V28" stroke="#7e503c" stroke-width="9" fill="none"/>';
      art = '<path d="M235 231L260 191L286 231Z" fill="#886346"/>' + place(260,192,1,turn('0;0;-18;8',1.3,'<rect x="-128" y="-5" width="258" height="10" rx="4" fill="#795741"/>'))
        + move('M0 0Q-20 -35 -53 18',.7,place(117,65,.7,hero))
        + place(479,184,1,chair) + move('M0 0Q72 -170 130 -33',1.5,place(349,137,.76,turn('0;360',1.5,bear)),.7)
        + reveal(2.3,label(456,49,'I booked economy!'));
    } else if (streak === 20) {
      const net = '<path d="M-45-22Q-32 50 0 51Q33 45 44-22Z" fill="#bedfce" fill-opacity=".3" stroke="#495e54" stroke-width="3"/><path d="M-33-19L13 42M-13-22L28 28M10-21L36 13M30-20L-13 41M9-22L-26 28M-13-20L-34 10" fill="none" stroke="#677d66" stroke-width="2"/><ellipse cy="-22" rx="45" ry="9" fill="none" stroke="#495e54" stroke-width="4"/>';
      art = '<path fill="#75b7c4" d="M0 193Q144 171 300 200T600 186V300H0Z"/>' + place(76,68,.79,hero)
        + '<path d="M141 133Q217 40 268 76" fill="none" stroke="#695036" stroke-width="5"/>'
        + move('M0 0Q-29 -75 -102 -93',1.5,place(388,183,.72,bear),1)
        + move('M0 0Q100 -75 170 31Q144 -45 68 -62',2.6,place(218,164,.93,net))
        + reveal(2.75,label(345,45,'Throw me back. I’m undersized.'));
    } else if (streak === 30) {
      const pie='<ellipse rx="32" ry="14" fill="#a56949" stroke="#593e36" stroke-width="3"/><path d="M-31 0Q-37-12-23-14Q-22-25-9-19Q1-30 11-19Q27-23 29-12Q42-7 31 2Z" fill="#fff6de"/><circle cy="-21" r="5" fill="#d34748"/>';
      art = place(87,77,.82,hero) + place(361,77,.9,bearSVG)
        + '<rect x="44" y="210" width="513" height="16" rx="6" fill="#b77559"/>' + move('M0 0Q135 -69 246 -15',1.4,place(168,149,1,turn('0;360',1.4,pie)),.35)
        + reveal(1.85,label(408,51,'Ten out of ten. Needs a fork.'));
    } else if (streak === 40) {
      const cloth='<path d="M-98 0L62-8L104 9L-56 19Z" fill="#d46b59" stroke="#833d39" stroke-width="3"/><path d="M-66 3L-24 15M-26 1L15 13M15-3L56 9" stroke="#fff1c9" stroke-width="6"/>';
      art = place(74,79,.85,hero) + move('M0 0Q-80 -22-173 -55',.8,place(371,221,1,cloth),.45)
        + move('M0 0Q39 -82 15 78',1.35,place(379,141,.9,turn('0;45;90',1.35,bear)),.65)
        + reveal(2.2,label(370,68,'Nobody wipe your feet.'));
    } else {
      art = place(111,76,.88,hero) + place(358,69,.98,bearSVG);
    }
    return '<svg viewBox="0 0 600 300" aria-hidden="true">' + woods + art + '</svg>';
  }

  function startKrakenFight() {
    startStreakFight(krakenRound, 'Kraken', krakenSVG, ['⚓', '💥', '🚢', '🍣', '🐋', '💬']);
  }

  function startSnakeFight() {
    startStreakFight(snakeRound, 'Snake', snakeSVG, ['🥊', '🥞', '🎳', '🧦', '🎈', '💬']);
  }

  function startStreakFight(round, name, artwork, icons) {
    gameRound = round;
    enemyName = name;
    enemyNameLabel.textContent = name;
    fighterRight.querySelector('.fighter-body').innerHTML = artwork;
    if (!milestones.includes(50)) {
      milestones.push(50);
      const last = document.getElementById('ms-40');
      const extra = last.cloneNode(true);
      extra.id = 'ms-50';
      extra.dataset.target = '50';
      extra.querySelector('.ms-num').textContent = '50';
      last.after(extra);
    }
    milestones.forEach((n, i) => {
      document.getElementById('ms-' + n).querySelector('.ms-icon').textContent = icons[i];
    });
    startGame();
  }

  function krakenFilmArt(streak) {
    const hero = fighterLeft.querySelector('.karate-svg').outerHTML;
    const place = (x, y, scale, art) => `<g transform="translate(${x} ${y}) scale(${scale})">${art}</g>`;
    const glide = (from, to, begin, dur, art) => `<g transform="translate(${from})"><animateTransform attributeName="transform" type="translate" from="${from}" to="${to}" begin="${begin}s" dur="${dur}s" fill="freeze"/>${art}</g>`;
    const vanish = (when, art) => `<g>${art}<set attributeName="opacity" to="0" begin="${when}s" fill="freeze"/></g>`;
    const ocean = `<rect width="600" height="300" fill="#9bd7df"/><circle cx="488" cy="56" r="34" fill="#fff0c1"/>
      <path fill="#8abac3" d="M0 126L85 92L145 123L210 104L275 136H0Z"/>
      <path fill="#327e92" d="M0 137Q70 120 150 138T300 139T450 137T600 135V300H0Z"/>
      <path fill="#246278" d="M0 204Q85 177 170 204T340 206T510 205T680 203V300H0Z"/>
      <path d="M12 160q22 7 45 0m21 67q31 8 60 0m363-56q20 7 40 0m-169 55q26 6 52 0" fill="none" stroke="#a0dfdc" stroke-width="3"/>`;
    const burst = `<g transform="translate(390 174)"><g opacity="0"><set attributeName="opacity" to="1" begin="1.8s" dur=".85s"/>
      <animateTransform attributeName="transform" type="scale" from=".2" to="1.4" begin="1.8s" dur=".85s" fill="freeze"/>
      <path fill="#ffad4d" stroke="#ffe7a6" stroke-width="6" d="M-60 -8L-24 -18L-39 -56L-6 -32L9 -68L20 -26L59 -40L42 -9L75 8L35 18L40 53L9 31L-12 58L-22 24L-60 30L-41 8Z"/></g></g>`;
    const beast = place(365, 88, .9, krakenSVG);
    let scene;
    if (streak === 5) {
      const ship = `<path d="M36 155H242L209 188H69Z" fill="#804c35" stroke="#382e36" stroke-width="4"/><path d="M101 149V41" stroke="#624330" stroke-width="6"/><path d="M96 48L45 124H96Z" fill="#fff3cf"/><path d="M108 51L162 118H108Z" fill="#f0cea1"/>` + place(155, 76, .45, hero);
      const spear = '<path d="M0 0l55 0m-9 -5l10 5l-10 5" fill="none" stroke="#283e4a" stroke-width="4"/>';
      scene = ocean + ship + glide('0 0','18 38',1.75,1,beast) + glide('196 125','356 145',.65,1.1,spear);
    } else if (streak === 10) {
      const mine = '<g transform="translate(390 174)" stroke="#263743" stroke-width="6"><path d="M0-32v12m0 40v12m-32-32h12m40 0h12m-55-23l9 9m28 28l9 9m0-46l-9 9m-28 28l-9 9"/><circle r="20" fill="#47576b"/><circle cx="-5" cy="-6" r="5" fill="#c5d5dc" stroke="none"/></g>';
      scene = ocean + vanish(1.8,mine) + vanish(1.8,glide('0 0','215 0',0,1.8,place(128,105,.85,krakenSVG))) + burst;
    } else if (streak === 20) {
      const liner = '<path fill="#253952" d="M15 151H265L221 196H56Z"/><path fill="#faf3df" d="M42 150V131H63V113H91V96H197V114H217V132H238V150Z"/><path stroke="#4b8099" stroke-width="6" stroke-dasharray="10 5" d="M53 141H226M75 122H203"/><path fill="#d7694a" d="M102 96l-5-23h15l8 23Z"/>' + place(161,52,.35,hero);
      scene = ocean + glide('0 0','62 25',1.8,.65,beast) + glide('-35 0','147 0',0,1.8,liner) + burst;
    } else if (streak === 30) {
      const plate = '<ellipse cx="0" cy="0" rx="52" ry="12" fill="#f5efdd" stroke="#385967" stroke-width="3"/><rect x="-21" y="-15" width="40" height="15" rx="7" fill="#fff"/><path d="M-24-12q12-22 31-8l17 8-6 6-12-6q-13-5-26 6Z" fill="#bd655a"/><g fill="#ffcdaf"><circle cx="-11" cy="-13" r="2"/><circle cx="-3" cy="-16" r="2"/><circle cx="6" cy="-15" r="2"/></g>';
      scene = '<rect width="600" height="300" fill="#edceab"/><path fill="#893e39" d="M0 0H600V44H0Z"/><path stroke="#986849" stroke-width="5" d="M52 50v128m80-128v128m-80-92h80m-80 41h80"/><g fill="#ea795c"><ellipse cx="465" cy="64" rx="22" ry="31"/><ellipse cx="523" cy="64" rx="22" ry="31"/></g>' + place(123,83,.8,hero) + '<circle cx="406" cy="142" r="25" fill="#edba8c"/><path fill="white" d="M380 130v-20q-12-13 2-18q4-16 19-9q15-12 24 3q16-1 14 15l-8 11v18ZM365 208l9-42h50l20 42Z"/><path d="M394 142h3m13 0h3" stroke="#333" stroke-width="3"/><rect y="205" width="600" height="95" fill="#976246"/>' + glide('395 214','184 214',.4,1.8,plate);
    } else if (streak === 40) {
      const orca = '<path fill="#172d3c" d="M4 45Q43 40 66 32L81 3L90 29Q143 16 175 39Q186 49 163 57Q124 77 81 61L56 78L62 59Q34 62 15 55L0 66L6 50L0 34Z"/><path fill="#f8f5e6" d="M79 53Q111 60 166 48Q139 69 96 62Z"/><ellipse cx="144" cy="38" rx="10" ry="5" fill="white"/>';
      const cropped = krakenSVG.replace('class="outer-tentacle"', 'class="outer-tentacle" style="display:none"');
      scene = ocean + vanish(1.8,beast) + '<g opacity="0"><set attributeName="opacity" to="1" begin="1.8s" fill="freeze"/>' + place(365,88,.9,cropped) + '</g>' + glide('0 0','-70 35',1.8,1.2,glide('810 105','648 105',0,1.8,'<g transform="scale(-1 1)">'+orca+'</g>')) + glide('0 0','32 42',1.8,1.3,'<g opacity="0"><set attributeName="opacity" to="1" begin="1.8s" fill="freeze"/><path d="M461 153q7-26 12-11" stroke="#37afa3" stroke-width="8" fill="none"/></g>');
    } else {
      scene = ocean + place(103,67,.93,hero) + beast;
    }
    return '<svg viewBox="0 0 600 300" aria-hidden="true">' + scene + '</svg>';
  }

  const scorpionRound = 8;
  const scorpionSVG = "<svg class=\"karate-svg\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 150 180\" width=\"120\" height=\"180\"><g stroke=\"#412335\" stroke-width=\"4\" stroke-linejoin=\"round\" stroke-linecap=\"round\"><g fill=\"none\" stroke-width=\"14\" stroke=\"#70394b\"><path d=\"M88 112C151 88 137 16 103 27Q85 33 90 54\"/></g><g fill=\"#e39748\"><ellipse cx=\"126\" cy=\"65\" rx=\"10\" ry=\"13\"/><ellipse cx=\"126\" cy=\"43\" rx=\"9\" ry=\"11\"/><ellipse cx=\"113\" cy=\"29\" rx=\"11\" ry=\"8\"/><path d=\"M99 29Q76 32 84 55L97 65L92 47Q105 48 99 29Z\"/></g><g fill=\"none\" stroke=\"#70394b\"><path d=\"M57 108L30 110L19 124M55 116L31 123L25 141M61 124L42 136L38 153M67 128L60 145L56 159M85 108L110 111L123 124M88 115L115 124L122 139M84 121L105 137L110 151M78 128L90 147L92 158\"/></g><ellipse cx=\"74\" cy=\"112\" rx=\"27\" ry=\"31\" fill=\"#b85546\"/><path d=\"M48 110Q72 120 99 108M50 122Q75 132 97 120\" fill=\"none\"/><path d=\"M55 101L28 95L21 80M89 100L109 88L109 75\" fill=\"none\" stroke-width=\"8\"/><g fill=\"#e2794e\"><path d=\"M29 92Q0 94 6 59L18 74L25 55Q44 74 29 92Z\"/><path d=\"M107 85Q84 71 98 48L105 65L119 50Q132 74 107 85Z\"/><ellipse cx=\"70\" cy=\"95\" rx=\"24\" ry=\"19\"/></g><g fill=\"#fff6d7\"><ellipse cx=\"60\" cy=\"90\" rx=\"8\" ry=\"10\"/><ellipse cx=\"77\" cy=\"89\" rx=\"8\" ry=\"10\"/></g><g fill=\"#412335\" stroke=\"none\"><circle cx=\"57\" cy=\"92\" r=\"3\"/><circle cx=\"74\" cy=\"91\" r=\"3\"/></g><path d=\"M61 104Q69 100 75 104\" fill=\"none\"/></g></svg>";
  const scorpionFilms = {
  "5": [
    "Boop inspection",
    "Yonah fits a squeaky red nose over the stinger. Scorpion attempts a menacing boop."
  ],
  "10": [
    "The getaway",
    "Yonah rolls out a skateboard. All eight feet climb aboard before Scorpion checks for brakes."
  ],
  "20": [
    "Employee of the month",
    "Yonah slides a time card under the stinger. Scorpion accidentally clocks in for the night shift."
  ],
  "30": [
    "The claw machine",
    "Yonah tries the arcade claw. First prize has two claws of its own and would like a refund."
  ],
  "40": [
    "Make a wish",
    "Yonah wheels out a birthday cake. Scorpion lands headfirst and gets promoted to cake topper."
  ],
  "50": [
    "A pointed complaint",
    ""
  ]
};
  function startScorpionFight(){startStreakFight(scorpionRound,'Scorpion',scorpionSVG,['🔴','🛹','🕒','🕹️','🎂','💬']);}

  function scorpionFilmArt(streak) {
  const place = (x,y,k,art) => `<g transform="translate(${x} ${y}) scale(${k})">${art}</g>`;
  const move = (path,begin,dur,art) => `<g>${art}<animateMotion path="${path}" begin="${begin}s" dur="${dur}s" fill="freeze"/></g>`;
  const rotate = (values,begin,dur,art) => `<g>${art}<animateTransform attributeName="transform" type="rotate" values="${values}" begin="${begin}s" dur="${dur}s" fill="freeze"/></g>`;
  const caption = (x,y,words) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="19" font-weight="bold" fill="#422834" stroke="#fff5d6" stroke-width="5" paint-order="stroke">${words}</text>`;
  const reveal = (at,art) => `<g opacity="0">${art}<set attributeName="opacity" begin="${at}s" to="1" fill="freeze"/></g>`;
  const desert = '<rect width="600" height="300" fill="#ffdfac"/><circle cx="501" cy="54" r="31" fill="#fff4bc"/><path d="M0 164L112 73L185 142L265 95L386 169L478 122L600 161V226H0Z" fill="#db9c85"/><path d="M0 195Q118 144 265 186T600 167V300H0Z" fill="#eeb971"/><ellipse cx="285" cy="235" rx="235" ry="10" fill="#d79c60"/>';
  const hero = place(75,72,.88,fighterLeft.querySelector('.karate-svg').outerHTML);
  const bug = place(-60,-90,1,scorpionSVG);
  let action;
  if(streak===5){
    const nose='<circle r="14" fill="#e83946" stroke="#68223b" stroke-width="3"/><circle cx="-4" cy="-5" r="4" fill="#ffb9af"/>';
    action=place(390,158,1,bug)+place(145,152,1,move('M0 0 Q110 -134 257 -24',.4,1.25,nose))+reveal(1.8,caption(398,61,'BOOP. Fear me.'));
  } else if(streak===10){
    const board='<path d="M-76 0Q-67 13-48 13H50Q68 13 76 -1" fill="none" stroke="#307d79" stroke-width="10"/><g fill="#503549"><circle cx="-46" cy="22" r="9"/><circle cx="48" cy="22" r="9"/></g>';
    action=place(156,208,1,move('M0 0 H190 Q250 0 331 -2',0,2.5,board))+place(348,146,1,move('M0 0 Q70 -140 140 -2',1.3,1.2,rotate('0;22;-12;0',1.3,1.2,bug)))+reveal(2.55,caption(435,61,'Which foot is the brake?!'));
  } else if(streak===20){
    const card='<rect x="-47" y="-31" width="94" height="61" rx="5" fill="#fff7d5" stroke="#78604f" stroke-width="4"/>'+caption(0,-6,'TIME CARD')+reveal(1.75,caption(0,19,'✓ IN'));
    action=place(155,159,1,move('M0 0 H232',0,1,card))+place(390,125,1,rotate('0;-14;23;0',1,.95,bug))+reveal(2.1,caption(374,52,'Wait. I WORK here now?'));
  } else if(streak===30){
    const claw='<path d="M0 -145V-32M-28 9L-38 -7L-18 -32H18L38 -7L28 9" fill="none" stroke="#46626a" stroke-width="8"/>';
    action='<rect x="245" y="18" width="291" height="217" rx="14" fill="#b9dfdd" stroke="#96516c" stroke-width="10"/>'+place(393,155,1,move('M0 0 V-59',1.6,1,bug))+place(393,43,1,move('M0 0 V65 V6',.45,2.1,claw))+reveal(2.6,caption(379,219,'Put me back. I was winning.'));
  } else if(streak===40){
    const cake='<rect x="-72" y="-39" width="144" height="64" rx="12" fill="#ca7383" stroke="#734257" stroke-width="4"/><path d="M-72 -28Q-82 -51 -53 -49H48Q82 -51 72 -28Q63 -16 52 -30Q43 -11 33 -29Q16 -13 2 -29Q-11 -10 -26 -28Q-40 -12 -51 -29Q-66 -16 -72 -28Z" fill="#fff6df"/><ellipse cy="30" rx="92" ry="7" fill="#658f94"/>';
    action=place(360,146,1,move('M0 0 Q44 -144 76 26',.8,1.4,rotate('0;170',.8,1.4,bug)))+place(155,210,1,move('M0 0 H280',0,1.5,cake))+reveal(2.25,caption(401,62,'My wish was very specific.'));
  } else {
    action=place(395,156,1,bug)+'<circle cx="407" cy="132" r="14" fill="#e83946" stroke="#68223b" stroke-width="3"/>';
  }
  return '<svg viewBox="0 0 600 300" aria-hidden="true">'+desert+hero+action+'</svg>';
}

  const streakBattles = {
    [scorpionRound]: { films: scorpionFilms, draw: scorpionFilmArt },
    [krakenRound]: { films: krakenFilms, draw: krakenFilmArt },
    [snakeRound]: { films: snakeFilms, draw: snakeFilmArt },
    [bearRound]: { films: bearFilms, draw: bearFilmArt }
  };

  async function playStreakFilm(streak, victory = false) {
    const timeScale = 2;
    const isSnake = gameRound === snakeRound;
    const battle = streakBattles[gameRound];
    const [title, caption] = battle.films[streak];
    const art = battle.draw(streak);
    const dialog = document.createElement('dialog');
    dialog.className = 'kraken-film';
    dialog.setAttribute('aria-label', title);
    dialog.innerHTML = '<div class="film-art">' + art + '</div><h2></h2><p aria-live="polite"></p>';
    // Both films use SVG timeline offsets and durations expressed in seconds.
    for (const cue of dialog.querySelectorAll('animateTransform, animateMotion, animate, set')) {
      for (const attribute of ['begin', 'dur']) {
        if (cue.hasAttribute(attribute)) {
          const seconds = parseFloat(cue.getAttribute(attribute));
          cue.setAttribute(attribute, (seconds * timeScale) + 's');
        }
      }
    }
    dialog.querySelector('h2').textContent = title;
    const line = dialog.querySelector('p');
    document.body.append(dialog);
    dialog.addEventListener('cancel', event => event.preventDefault());
    dialog.showModal();
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms * timeScale));
    if (streak === 50 && gameRound === scorpionRound) {
      line.textContent = victory ? 'Scorpion: “I surrender. Could you at least take this red nose off my tail?”' : 'Scorpion: “Fifty in a row! Quick, take this red nose off my tail.”';
      await wait(2600);
      line.textContent = 'Yonah: “Why? Does it hurt?”';
      await wait(2600);
      line.textContent = 'Scorpion: “Worse. Every time I threaten somebody, a toddler claps.”';
      await wait(3200);
    } else if (streak === 50 && gameRound === bearRound) {
      line.textContent = victory ? 'Bear: “I surrender. But I demand to speak to the chef.”' : 'Bear: “Fifty in a row? I want a recount. And a fork.”';
      await wait(2600);
      line.textContent = victory ? 'Yonah: “Was something wrong with the pie?”' : 'Yonah: “You ate the evidence, Bear.”';
      await wait(2600);
      line.textContent = victory ? 'Bear: “Yes. I ordered it to go. It came AT me.”' : 'Bear: “Then I’ll need a second opinion. Same flavor.”';
      await wait(3200);
    } else if (streak === 50) {
      line.textContent = isSnake
        ? (victory ? 'Snake: “I surrender. But the bowling alley owes me a shoe rental.”' : 'Snake: “Fifty in a row? I thought I had you rattled!”')
        : victory ? 'Kraken: “One hundred points! I yield, Yonah.”' : 'Kraken: “Fifty answers in a row? I lost count at eight!”';
      await wait(2600);
      line.textContent = isSnake
        ? (victory ? 'Yonah: “Snake, you don’t have feet.”' : 'Yonah: “Fifty in a row. Want a break from being the bowling ball?”')
        : victory ? 'Yonah: “Good fight, Captain Eight-Arms. See you at the dojo!”' : 'Yonah: “Keep those tentacles steady. Our match isn’t over yet!”';
      await wait(3200);
      if (isSnake && victory) {
        line.textContent = 'Snake: “EXACTLY. I paid for two!”';
        await wait(2600);
      }
    } else {
      line.textContent = caption;
      await wait(3800);
    }
    dialog.close();
    dialog.remove();
  }

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
      { name: 'Alien Overlord', artwork: alienSVG, fight: startRound4 },
      { name: 'Kraken', artwork: krakenSVG, fight: startKrakenFight },
      { name: 'Snake', artwork: snakeSVG, fight: startSnakeFight },
      { name: 'Bear', artwork: bearSVG, fight: startBearFight },
      { name: 'Scorpion', artwork: scorpionSVG, fight: startScorpionFight }
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
