/* ═══════════════════════════════════════════════════════════
   RightClick:AI — Discovery Modal + Form Submission
   Loaded on every non-homepage page. Wires up:
   - Any element with [data-modal-open="discovery"] opens #discovery-modal
   - ESC, backdrop click, or [data-modal-close] closes it
   - Focus trap + restore
   - Formspree AJAX submission with success/error states
═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var modal = document.getElementById('discovery-modal');
  if (!modal) return;

  var panel = modal.querySelector('.modal-panel');
  var lastFocused = null;

  function focusable() {
    return modal.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
  }

  function openModal() {
    lastFocused = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    // Focus first input after transition starts
    setTimeout(function () {
      var first = modal.querySelector('input, textarea, button:not(.modal-close)');
      if (first) first.focus();
    }, 60);
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  }

  // Open triggers
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-modal-open="discovery"]');
    if (trigger) {
      e.preventDefault();
      openModal();
    }
  });

  // Close triggers
  modal.addEventListener('click', function (e) {
    if (e.target.closest('[data-modal-close]')) {
      e.preventDefault();
      closeModal();
    }
  });

  // ESC + focus trap
  document.addEventListener('keydown', function (e) {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape' || e.keyCode === 27) {
      e.preventDefault();
      closeModal();
      return;
    }
    if (e.key === 'Tab') {
      var nodes = focusable();
      if (!nodes.length) return;
      var first = nodes[0];
      var last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Form submission
  var form = document.getElementById('modal-discovery-form');
  var success = document.getElementById('modal-form-success');
  var error = document.getElementById('modal-form-error');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (error) error.classList.remove('visible');
      var btn = form.querySelector('button[type="submit"]');
      var label = btn.innerHTML;
      btn.disabled = true;
      btn.textContent = 'Sending…';
      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (res) {
        if (res.ok) {
          form.style.display = 'none';
          if (success) success.classList.add('visible');
        } else {
          throw new Error('submit failed');
        }
      }).catch(function () {
        btn.disabled = false;
        btn.innerHTML = label;
        if (error) error.classList.add('visible');
      });
    });
  }
})();
