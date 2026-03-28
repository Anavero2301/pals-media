/* ===================================
   Pals Media — Main JavaScript
   =================================== */

(function () {
  'use strict';

  // --- Header scroll effect ---
  const header = document.getElementById('header');

  function onScroll() {
    if (window.scrollY > 40) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // --- Mobile navigation toggle ---
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');

  navToggle.addEventListener('click', function () {
    nav.classList.toggle('nav--open');
    navToggle.classList.toggle('nav-toggle--open');
  });

  // Close mobile nav when a link is clicked
  nav.querySelectorAll('.nav__link').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('nav--open');
      navToggle.classList.remove('nav-toggle--open');
    });
  });

  // --- Scroll animations (fade-in) ---
  var fadeElements = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in--visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    fadeElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show all elements
    fadeElements.forEach(function (el) {
      el.classList.add('fade-in--visible');
    });
  }

  // --- Contact form ---
  var form = document.getElementById('contactForm');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = form.querySelector('#name').value.trim();
    var email = form.querySelector('#email').value.trim();
    var message = form.querySelector('#message').value.trim();

    if (!name || !email || !message) return;

    // Open mailto as a fallback (works without a backend)
    var subject = encodeURIComponent('Contact via Pals Media website');
    var body = encodeURIComponent(
      'Name: ' + name + '\nEmail: ' + email + '\n\n' + message
    );
    window.location.href =
      'mailto:fpalsmedia@outlook.com?subject=' + subject + '&body=' + body;
  });
})();
