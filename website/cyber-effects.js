/**
 * CYBER-EFFECTS.JS
 * Futuristic cyberpunk interactive engine:
 * 1. Interactive Neural/Particle Canvas
 * 2. 3D Holographic Card Tilt with Specular Glare
 * 3. Cyber Text Scramble / Decoder Glitch Effect
 * 4. Sci-Fi UI Audio Synthesizer (Web Audio API)
 */

(function () {
  'use strict';

  // ==========================================
  // 1. SCI-FI SOUND SYNTHESIZER (Web Audio API)
  // ==========================================
  class CyberAudio {
    constructor() {
      this.ctx = null;
      this.enabled = localStorage.getItem('cyber-sfx-enabled') === 'true';
    }

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('cyber-sfx-enabled', this.enabled);
      if (this.enabled) {
        this.init();
        this.playBeep(880, 'sine', 0.08, 0.05);
      }
      return this.enabled;
    }

    playBeep(freq = 600, type = 'sine', duration = 0.05, vol = 0.03) {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        // audio disabled or unsupported
      }
    }

    playHover() {
      this.playBeep(1200, 'triangle', 0.04, 0.015);
    }

    playClick() {
      this.playBeep(520, 'square', 0.08, 0.03);
    }
  }

  const sfx = new CyberAudio();
  window.cyberSFX = sfx;

  // ==========================================
  // 2. INTERACTIVE CYBER BACKGROUND CANVAS
  // ==========================================
  function initCyberCanvas() {
    if (window._cyberCanvasInitialized) return;
    window._cyberCanvasInitialized = true;

    let canvas = document.getElementById('cyber-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'cyber-canvas';
      canvas.className = 'cyber-canvas-bg';
      document.body.prepend(canvas);
    }

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouse = { x: null, y: null, radius: 140 };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      createParticles();
    });

    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 35 : 75;
    let particles = [];

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = (Math.random() - 0.5) * 0.7;
        this.radius = Math.random() * 2 + 1;
        this.baseColor = Math.random() > 0.4 ? 'rgba(0, 240, 255,' : 'rgba(255, 0, 85,';
        this.alpha = Math.random() * 0.5 + 0.3;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse interaction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= (dx / dist) * force * 3;
            this.y -= (dy / dist) * force * 3;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${this.baseColor}${this.alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.baseColor.includes('0, 240') ? '#00f0ff' : '#ff0055';
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    function createParticles() {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    createParticles();

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Connect particles
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < 120) {
            const opacity = (1 - dist / 120) * 0.22;
            ctx.strokeStyle = `rgba(0, 240, 255, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }

        // Connect to mouse
        if (mouse.x !== null && mouse.y !== null) {
          const dx = particles[i].x - mouse.x;
          const dy = particles[i].y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 140) {
            const opacity = (1 - dist / 140) * 0.35;
            ctx.strokeStyle = `rgba(255, 0, 85, ${opacity})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    }

    animate();
  }

  // ==========================================
  // 3. 3D HOLOGRAPHIC CARD TILT & SHEEN
  // ==========================================
  function initCyberTilt() {
    const cards = document.querySelectorAll('.cyber-tilt');

    cards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        sfx.playHover();
      });

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`;

        // Specular glare position
        const pX = (x / rect.width) * 100;
        const pY = (y / rect.height) * 100;
        card.style.setProperty('--sheen-x', `${pX}%`);
        card.style.setProperty('--sheen-y', `${pY}%`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }

  // ==========================================
  // 4. CYBER TEXT SCRAMBLE / GLITCH EFFECT
  // ==========================================
  class TextScramble {
    constructor(el) {
      this.el = el;
      this.chars = '!<>-_\\/[]{}—=+*^?#________0101';
      this.update = this.update.bind(this);
    }

    setText(newText) {
      const oldText = this.el.innerText;
      const length = Math.max(oldText.length, newText.length);
      const promise = new Promise((resolve) => (this.resolve = resolve));
      this.queue = [];
      for (let i = 0; i < length; i++) {
        const from = oldText[i] || '';
        const to = newText[i] || '';
        const start = Math.floor(Math.random() * 20);
        const end = start + Math.floor(Math.random() * 20);
        this.queue.push({ from, to, start, end });
      }
      cancelAnimationFrame(this.frameRequest);
      this.frame = 0;
      this.update();
      return promise;
    }

    update() {
      let output = '';
      let complete = 0;
      for (let i = 0, n = this.queue.length; i < n; i++) {
        let { from, to, start, end, char } = this.queue[i];
        if (this.frame >= end) {
          complete++;
          output += to;
        } else if (this.frame >= start) {
          if (!char || Math.random() < 0.28) {
            char = this.randomChar();
            this.queue[i].char = char;
          }
          output += `<span class="scramble-glitch">${char}</span>`;
        } else {
          output += from;
        }
      }
      this.el.innerHTML = output;
      if (complete === this.queue.length) {
        this.resolve();
      } else {
        this.frameRequest = requestAnimationFrame(this.update);
        this.frame++;
      }
    }

    randomChar() {
      return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
  }

  function initCyberGlitch() {
    const scrambleElements = document.querySelectorAll('.cyber-glitch-text');
    scrambleElements.forEach((el) => {
      const original = el.getAttribute('data-original-text') || el.innerText.trim();
      el.setAttribute('data-original-text', original);
      const fx = new TextScramble(el);

      // Trigger immediately on load
      setTimeout(() => {
        fx.setText(original);
      }, 200);

      // Trigger on mouseover
      el.addEventListener('mouseenter', () => {
        sfx.playHover();
        fx.setText(original);
      });
    });
  }

  // ==========================================
  // 5. INTERACTIVE BUTTON SOUNDS & COPY FEEDBACK
  // ==========================================
  function initCyberInteractions() {
    document.querySelectorAll('a, button, .interactive-click').forEach((item) => {
      item.addEventListener('mouseenter', () => {
        sfx.playHover();
      });
      item.addEventListener('click', () => {
        sfx.playClick();
      });
    });

    // Copy to clipboard helper
    document.querySelectorAll('[data-copy]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-copy');
        if (text) {
          navigator.clipboard.writeText(text).then(() => {
            const original = btn.innerHTML;
            btn.innerHTML = '<span>COPIED!</span>';
            btn.classList.add('copied');
            setTimeout(() => {
              btn.innerHTML = original;
              btn.classList.remove('copied');
            }, 1800);
          });
        }
      });
    });
  }

  // Setup audio toggle button in DOM if present or attach
  function setupAudioToggle() {
    const toggleBtn = document.getElementById('cyber-audio-toggle');
    if (toggleBtn) {
      const updateLabel = () => {
        toggleBtn.innerHTML = sfx.enabled
          ? '<i class="bi bi-volume-up-fill"></i> SFX: ON'
          : '<i class="bi bi-volume-mute-fill"></i> SFX: OFF';
        toggleBtn.classList.toggle('active', sfx.enabled);
      };
      updateLabel();
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sfx.toggle();
        updateLabel();
      });
    }
  }

  // Global initializer
  window.initCyberpunkEngine = function () {
    initCyberCanvas();
    initCyberTilt();
    initCyberGlitch();
    initCyberInteractions();
    setupAudioToggle();
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.initCyberpunkEngine();
  });
})();
