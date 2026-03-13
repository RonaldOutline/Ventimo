/**
 * VENTIMO – Maritime Construction Website
 * Main JavaScript
 */

(function () {
  'use strict';

  /* ── HERO CANVAS PARTICLE SYSTEM ─────────────────────────── */
  (function initCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W, H, particles = [], animId;
    const PARTICLE_COUNT = 80;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    class Particle {
      constructor() { this.reset(true); }
      reset(random) {
        this.x  = Math.random() * W;
        this.y  = random ? Math.random() * H : H + 10;
        this.r  = Math.random() * 1.5 + 0.3;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = -(Math.random() * 0.4 + 0.1);
        this.alpha = 0;
        this.targetAlpha = Math.random() * 0.5 + 0.1;
        this.fade = Math.random() * 0.003 + 0.002;
        this.life = 0;
        this.maxLife = Math.random() * 300 + 150;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life++;
        if (this.life < 60) this.alpha = Math.min(this.targetAlpha, this.alpha + this.fade * 2);
        else if (this.life > this.maxLife - 60) this.alpha = Math.max(0, this.alpha - this.fade * 2);
        if (this.life >= this.maxLife || this.y < -10) this.reset(false);
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = '#2D5F8A';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    /* Floating line connectors */
    class Wave {
      constructor(i) {
        this.i = i;
        this.offset = Math.random() * Math.PI * 2;
        this.speed  = Math.random() * 0.003 + 0.001;
        this.amp    = Math.random() * 20 + 8;
        this.y      = H * (0.3 + i * 0.15);
        this.alpha  = Math.random() * 0.06 + 0.02;
      }
      draw(t) {
        ctx.save();
        ctx.strokeStyle = `rgba(232, 68, 34, ${this.alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 4) {
          const y = this.y + Math.sin(x * 0.008 + t * this.speed + this.offset) * this.amp;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      }
    }

    let waves = [];
    let t = 0;

    function init() {
      resize();
      particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
      waves = Array.from({ length: 4 }, (_, i) => new Wave(i));
    }

    function loop() {
      ctx.clearRect(0, 0, W, H);
      t++;

      // Draw waves
      waves.forEach(w => w.draw(t));

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.save();
            ctx.globalAlpha = (1 - dist / 100) * 0.12;
            ctx.strokeStyle = '#2D5F8A';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // Draw particles
      particles.forEach(p => { p.update(); p.draw(); });

      animId = requestAnimationFrame(loop);
    }

    init();
    loop();

    window.addEventListener('resize', () => {
      resize();
      waves.forEach((w, i) => { w.y = H * (0.3 + i * 0.15); });
    });
  })();

  /* ── STICKY HEADER ──────────────────────────────────────── */
  const header = document.getElementById('site-header');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    if (current > 60) header.classList.add('scrolled');
    else              header.classList.remove('scrolled');
    lastScroll = current;
  }, { passive: true });

  /* ── MOBILE NAV ─────────────────────────────────────────── */
  const navToggle = document.getElementById('nav-toggle');
  const navMenu   = document.getElementById('nav-menu');

  navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    navToggle.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  /* ── SMOOTH SCROLL ACTIVE LINK ──────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link:not(.nav-link--cta)');

  function setActiveLink() {
    const scrollPos = window.scrollY + 120;
    sections.forEach(sec => {
      if (scrollPos >= sec.offsetTop && scrollPos < sec.offsetTop + sec.offsetHeight) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${sec.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }
  window.addEventListener('scroll', setActiveLink, { passive: true });

  /* ── REVEAL ON SCROLL (Intersection Observer) ───────────── */
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ── COUNTER ANIMATION ──────────────────────────────────── */
  function animateCounter(el, target, duration = 1800) {
    const start = performance.now();
    const update = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(ease * target);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target;
    };
    requestAnimationFrame(update);
  }

  const counterEls = document.querySelectorAll('.hero-stat__number[data-count]');
  let countersStarted = false;

  const counterObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !countersStarted) {
      countersStarted = true;
      counterEls.forEach(el => {
        animateCounter(el, parseInt(el.dataset.count, 10));
      });
    }
  }, { threshold: 0.5 });

  if (counterEls.length) counterObserver.observe(counterEls[0].closest('.hero-stats'));

  /* ── PORTFOLIO FILTER ────────────────────────────────────── */
  const filterBtns   = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      portfolioCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.classList.remove('hidden');
          card.style.animation = 'fadeIn 0.4s ease forwards';
        } else {
          card.classList.add('hidden');
        }
      });

      // Re-handle featured columns after filter
      handleFeaturedLayout(filter);
    });
  });

  function handleFeaturedLayout(filter) {
    portfolioCards.forEach(card => {
      if (card.classList.contains('portfolio-card--featured')) {
        if (filter !== 'all' && card.dataset.category !== filter) {
          // already hidden
        } else if (filter !== 'all') {
          // Remove featured span when filtering to single category
          card.style.gridColumn = '';
        } else {
          card.style.gridColumn = '';
        }
      }
    });
  }

  /* ── CONTACT FORM ────────────────────────────────────────── */
  const form        = document.getElementById('contact-form');
  const submitBtn   = document.getElementById('form-submit');
  const successMsg  = document.getElementById('form-success');
  const textarea    = document.getElementById('message');
  const charCount   = document.getElementById('char-count');

  // Character counter
  if (textarea && charCount) {
    textarea.addEventListener('input', () => {
      const len = textarea.value.length;
      charCount.textContent = len;
      charCount.style.color = len > 950 ? '#E84422' : '';
      if (len > 1000) textarea.value = textarea.value.substring(0, 1000);
    });
  }

  // Validation helpers
  const validators = {
    fname: v => v.trim().length >= 2 || 'Please enter your first name.',
    lname: v => v.trim().length >= 2 || 'Please enter your last name.',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Please enter a valid email address.',
    'project-type': v => v !== '' || 'Please select a project type.',
    message: v => v.trim().length >= 20 || 'Please provide a message of at least 20 characters.',
    privacy: (_, el) => el.checked || 'Please accept our privacy policy.',
  };

  function showError(field, msg) {
    const el = document.getElementById(`${field}-error`);
    const input = document.getElementById(field) || document.querySelector(`[name="${field}"]`);
    if (el) el.textContent = msg;
    if (input) input.classList.add('error');
  }
  function clearError(field) {
    const el = document.getElementById(`${field}-error`);
    const input = document.getElementById(field) || document.querySelector(`[name="${field}"]`);
    if (el) el.textContent = '';
    if (input) input.classList.remove('error');
  }

  // Live validation
  Object.keys(validators).forEach(field => {
    const input = document.getElementById(field) || document.querySelector(`[name="${field}"]`);
    if (!input) return;
    const evt = input.type === 'checkbox' ? 'change' : 'input';
    input.addEventListener(evt, () => {
      const result = validators[field](input.value, input);
      if (result === true) clearError(field);
    });
    input.addEventListener('blur', () => {
      if (!input.value && input.type !== 'checkbox') return;
      const result = validators[field](input.value, input);
      if (result !== true) showError(field, result);
      else clearError(field);
    });
  });

  // Submit
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let valid = true;
      Object.keys(validators).forEach(field => {
        const input = document.getElementById(field) || document.querySelector(`[name="${field}"]`);
        if (!input) return;
        const result = validators[field](input.value, input);
        if (result !== true) { showError(field, result); valid = false; }
        else clearError(field);
      });

      if (!valid) {
        // Scroll to first error
        const firstError = form.querySelector('.error, input.error, textarea.error, select.error');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // Submit to Formspree
      submitBtn.classList.add('loading');
      submitBtn.querySelector('.btn-label').textContent = 'Sending…';

      const data = new FormData(form);
      fetch('https://formspree.io/f/xkoqbekg', {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      })
      .then(res => {
        if (res.ok) {
          submitBtn.style.display = 'none';
          successMsg.classList.add('visible');
          form.querySelectorAll('input, textarea, select').forEach(el => el.disabled = true);
        } else {
          submitBtn.classList.remove('loading');
          submitBtn.querySelector('.btn-label').textContent = 'Send Message';
          alert('Something went wrong. Please try again or email us directly.');
        }
      })
      .catch(() => {
        submitBtn.classList.remove('loading');
        submitBtn.querySelector('.btn-label').textContent = 'Send Message';
        alert('Network error. Please check your connection and try again.');
      });
    });
  }

  /* ── PARALLAX SUBTLE ─────────────────────────────────────── */
  const heroContent = document.querySelector('.hero-content');

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (heroContent && y < window.innerHeight) {
      heroContent.style.transform = `translateY(${y * 0.25}px)`;
      heroContent.style.opacity = 1 - (y / (window.innerHeight * 0.7));
    }
  }, { passive: true });

  /* ── PORTFOLIO CARD MOUSE TILT ───────────────────────────── */
  document.querySelectorAll('.portfolio-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width  / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `perspective(800px) rotateX(${-dy * 3}deg) rotateY(${dx * 3}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s ease';
      setTimeout(() => { card.style.transition = ''; }, 500);
    });
  });

  /* ── SERVICE CARD HOVER LINE ─────────────────────────────── */
  // (handled via CSS, nothing extra needed)

  /* ── NAV LINK ACTIVE STYLE (handled in CSS) ──────────────── */

})();
