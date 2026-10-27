/* Ameritex – comportamento do site (vanilla JS, progressivo: tudo funciona sem JS). */
(function () {
  'use strict';

  // ---------------------------------------------------------------- menu mobile
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('[data-nav-toggle]');
  if (header && toggle) {
    var setOpen = function (open) {
      header.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('no-scroll', open);
    };
    toggle.addEventListener('click', function () {
      setOpen(!header.classList.contains('nav-open'));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('nav-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1000 && header.classList.contains('nav-open')) setOpen(false);
    });
  }

  // submenu (produtos) – botão para telas de toque
  var subToggles = document.querySelectorAll('[data-submenu-toggle]');
  for (var i = 0; i < subToggles.length; i += 1) {
    subToggles[i].addEventListener('click', function (e) {
      var li = e.currentTarget.closest('.has-submenu');
      var open = li.classList.toggle('submenu-open');
      e.currentTarget.setAttribute('aria-expanded', String(open));
    });
  }
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.has-submenu')) {
      var opened = document.querySelectorAll('.has-submenu.submenu-open');
      for (var j = 0; j < opened.length; j += 1) {
        opened[j].classList.remove('submenu-open');
        var btn = opened[j].querySelector('[data-submenu-toggle]');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // ---------------------------------------------------------------- filtro de variantes
  var groups = document.querySelectorAll('[data-variants]');
  for (var g = 0; g < groups.length; g += 1) {
    (function (wrap) {
      var buttons = wrap.querySelectorAll('[data-filter]');
      var items = wrap.querySelectorAll('[data-group]');
      if (!buttons.length) return;
      for (var b = 0; b < buttons.length; b += 1) {
        buttons[b].addEventListener('click', function (e) {
          var filter = e.currentTarget.getAttribute('data-filter');
          for (var x = 0; x < buttons.length; x += 1) {
            var on = buttons[x] === e.currentTarget;
            buttons[x].classList.toggle('is-active', on);
            buttons[x].setAttribute('aria-pressed', String(on));
          }
          for (var y = 0; y < items.length; y += 1) {
            items[y].hidden = filter !== '*' && items[y].getAttribute('data-group') !== filter;
          }
        });
      }
    })(groups[g]);
  }

  // ---------------------------------------------------------------- lightbox
  var dlg = document.querySelector('[data-lightbox]');
  if (dlg && typeof dlg.showModal === 'function') {
    var img = dlg.querySelector('[data-lightbox-img]');
    var cap = dlg.querySelector('[data-lightbox-caption]');
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-lightbox-src]');
      if (!btn) return;
      e.preventDefault();
      img.src = btn.getAttribute('data-lightbox-src');
      img.alt = btn.getAttribute('data-lightbox-caption') || '';
      cap.textContent = btn.getAttribute('data-lightbox-caption') || '';
      dlg.showModal();
    });
    var close = dlg.querySelector('[data-lightbox-close]');
    if (close) close.addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg) dlg.close();
    });
  }

  // ---------------------------------------------------------------- formulário → WhatsApp
  var form = document.querySelector('[data-contact-form]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var data = new FormData(form);
      var get = function (k) { return (data.get(k) || '').toString().trim(); };
      var lines = [
        'Olá! Vim pelo site da Ameritex e gostaria de um orçamento.',
        '',
        '*Nome:* ' + get('nome'),
        get('empresa') ? '*Empresa:* ' + get('empresa') : null,
        '*Cidade/UF:* ' + get('cidade'),
        '*Telefone:* ' + get('telefone'),
        get('tipo') ? '*Tipo de negócio:* ' + get('tipo') : null,
        get('produto') ? '*Produto de interesse:* ' + get('produto') : null,
        '',
        '*Mensagem:*',
        get('mensagem'),
      ].filter(function (l) { return l !== null; });
      var url = 'https://wa.me/' + form.getAttribute('data-wa') + '?text=' + encodeURIComponent(lines.join('\n'));
      window.open(url, '_blank', 'noopener');
    });
  }
})();
