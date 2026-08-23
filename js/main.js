(function () {
  'use strict';

  // ---- Mobile Navigation ----
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');
  const navLinks = nav.querySelectorAll('.nav__link');

  navToggle.addEventListener('click', () => {
    nav.classList.toggle('nav--open');
    navToggle.classList.toggle('nav-toggle--open');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('nav--open');
    });
  });

  // ---- Header scroll effect ----
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('header--scrolled', window.scrollY > 20);
  }, { passive: true });

  // ---- FAQ Accordion ----
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-item__question');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('faq-item--open');
      faqItems.forEach(i => i.classList.remove('faq-item--open'));
      if (!isOpen) item.classList.add('faq-item--open');
    });
  });

  // ---- Date picker: min = today ----
  const dateInput = document.getElementById('data');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }

  // ---- Consultation Form ----
  const form = document.getElementById('consultForm');
  const submitBtn = document.getElementById('submitBtn');
  const formMessage = document.getElementById('formMessage');
  const successModal = document.getElementById('successModal');
  const closeModal = document.getElementById('closeModal');

  function openModal() {
    successModal.classList.add('modal--open');
    successModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModalFn() {
    successModal.classList.remove('modal--open');
    successModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  closeModal.addEventListener('click', closeModalFn);
  successModal.querySelector('.modal__backdrop').addEventListener('click', closeModalFn);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModalFn();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = 'Duke dërguar...';
    formMessage.textContent = '';
    formMessage.className = 'form-note';

    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        form.reset();
        openModal();
      } else {
        formMessage.textContent = result.message || 'Ndodhi një gabim. Provoni përsëri.';
        formMessage.className = 'form-note form-note--error';
      }
    } catch {
      // Fallback: save locally if PHP unavailable
      saveConsultationLocally(formData);
      form.reset();
      openModal();
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Dërgo Kërkesën për Konsultim';
    }
  });

  function saveConsultationLocally(formData) {
    const entries = Object.fromEntries(formData.entries());
    entries.timestamp = new Date().toISOString();
    const saved = JSON.parse(localStorage.getItem('consultations') || '[]');
    saved.push(entries);
    localStorage.setItem('consultations', JSON.stringify(saved));
  }

  // ---- Smooth active nav highlight ----
  const sections = document.querySelectorAll('section[id]');
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.style.color = link.getAttribute('href') === `#${entry.target.id}`
              ? 'var(--gold)'
              : '';
          });
        }
      });
    },
    { rootMargin: '-40% 0px -50% 0px' }
  );

  sections.forEach(section => observer.observe(section));
})();
