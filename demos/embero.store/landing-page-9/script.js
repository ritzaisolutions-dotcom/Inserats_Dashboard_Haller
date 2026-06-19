/* ============================================
   EMBERO – Landing Page Scripts
   ============================================ */

(function () {
  'use strict';

  /* ---- NAV: add scrolled class ---- */
  var nav = document.getElementById('nav');
  function handleScroll() {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ---- COUNTDOWN TIMER ---- */
  // Target: 72 hours from first visit (persisted in localStorage)
  var LS_KEY = 'embero_cd_end';
  var DURATION_MS = 72 * 60 * 60 * 1000;

  function getEndTime() {
    var stored = localStorage.getItem(LS_KEY);
    if (stored) {
      var t = parseInt(stored, 10);
      if (t > Date.now()) return t;
    }
    var end = Date.now() + DURATION_MS;
    localStorage.setItem(LS_KEY, end.toString());
    return end;
  }

  var endTime = getEndTime();
  var elHours   = document.getElementById('cd-hours');
  var elMinutes = document.getElementById('cd-minutes');
  var elSeconds = document.getElementById('cd-seconds');

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function tick() {
    var diff = Math.max(0, endTime - Date.now());
    var totalSeconds = Math.floor(diff / 1000);
    var h = Math.floor(totalSeconds / 3600);
    var m = Math.floor((totalSeconds % 3600) / 60);
    var s = totalSeconds % 60;
    if (elHours)   elHours.textContent   = pad(h);
    if (elMinutes) elMinutes.textContent = pad(m);
    if (elSeconds) elSeconds.textContent = pad(s);
    if (diff > 0) {
      setTimeout(tick, 1000);
    }
  }
  tick();

  /* ---- SCROLL REVEAL ---- */
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    // Fallback: show all immediately
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---- SMOOTH SCROLL for anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var id = this.getAttribute('href').slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var offset = 70; // nav height
      var top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ---- CARD HOLDER: subtle mouse parallax on hero ---- */
  var cardScene = document.querySelector('.card-scene');
  var hero      = document.querySelector('.hero');

  if (cardScene && hero && window.matchMedia('(min-width: 769px)').matches) {
    hero.addEventListener('mousemove', function (e) {
      var rect   = hero.getBoundingClientRect();
      var cx     = rect.left + rect.width / 2;
      var cy     = rect.top  + rect.height / 2;
      var dx     = (e.clientX - cx) / rect.width;  // -0.5 … 0.5
      var dy     = (e.clientY - cy) / rect.height;
      var rotY   = dx * 10;  // ±5°
      var rotX   = -dy * 6;  // ±3°
      cardScene.style.transition = 'transform 0.15s ease';
      cardScene.style.transform  = 'rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg)';
    });

    hero.addEventListener('mouseleave', function () {
      cardScene.style.transition = 'transform 0.8s ease';
      cardScene.style.transform  = '';
    });
  }

  /* ---- ANNOUNCEMENT BAR: smooth dismiss (optional) ---- */
  // No dismiss – we want it always visible for conversion

})();
