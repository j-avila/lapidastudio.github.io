/* Lapida Studio — interações do site */
(function () {
  var d = document;

  /* Menu mobile */
  var toggle = d.querySelector('.nav-toggle');
  var nav = d.getElementById('site-nav');
  function setNav(open) {
    if (!toggle) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    d.body.classList.toggle('nav-open', open);
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setNav(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setNav(false); });
    });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') setNav(false); });
  }

  /* FAQ (accordion) */
  d.querySelectorAll('.faq-q').forEach(function (q) {
    q.addEventListener('click', function () {
      var open = q.getAttribute('aria-expanded') === 'true';
      q.setAttribute('aria-expanded', String(!open));
      q.closest('.faq-item').classList.toggle('open', !open);
    });
  });

  /* Fade-in ao rolar: só para elementos que começam fora da tela */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px' });
    d.querySelectorAll('[data-reveal]').forEach(function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add('reveal');
        io.observe(el);
      }
    });
  }

  /* Índice do plano de marketing: destaca a seção visível */
  var tocLinks = d.querySelectorAll('.toc a[href^="#"]');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    tocLinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && map[e.target.id]) {
          tocLinks.forEach(function (a) { a.classList.remove('active'); });
          map[e.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    Object.keys(map).forEach(function (id) { var s = d.getElementById(id); if (s) spy.observe(s); });
  }

  /* Linha do tempo: status calculado pela data de hoje */
  var items = d.querySelectorAll('.tl[data-start]');
  if (items.length) {
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    function parse(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]).getTime(); }
    items.forEach(function (li) {
      var start = parse(li.getAttribute('data-start'));
      var end = parse(li.getAttribute('data-end') || li.getAttribute('data-start'));
      var st = li.querySelector('.status');
      li.classList.remove('done', 'now');
      if (today > end) { li.classList.add('done'); if (st) st.textContent = 'Concluído'; }
      else if (today >= start) { li.classList.add('now'); if (st) st.textContent = 'Em andamento'; }
      else if (st) { st.textContent = 'Previsto'; }
    });
  }

  /* Formulário de contato (somente front-end) */
  var form = d.getElementById('contact-form');
  if (form) {
    var success = d.getElementById('contact-success');
    var rules = {
      nome: function (v) { return v.trim().length >= 3 ? '' : 'Informe seu nome completo.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Informe um e-mail válido, como nome@empresa.com.br.'; },
      tipo: function (v) { return v ? '' : 'Escolha o tipo de projeto.'; },
      mensagem: function (v) { return v.trim().length >= 15 ? '' : 'Conte um pouco mais sobre a ideia (mínimo de 15 caracteres).'; }
    };
    function check(name) {
      var input = form.elements[name];
      var msg = rules[name](input.value);
      var err = d.getElementById('err-' + name);
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) err.textContent = msg;
      return !msg;
    }
    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      input.addEventListener('blur', function () { if (input.value) check(name); });
      input.addEventListener('input', function () { if (input.getAttribute('aria-invalid') === 'true') check(name); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      Object.keys(rules).forEach(function (name) { if (!check(name) && !firstBad) firstBad = form.elements[name]; });
      if (firstBad) { firstBad.focus(); return; }
      var first = form.elements.nome.value.trim().split(/\s+/)[0];
      d.getElementById('success-name').textContent = first;
      form.hidden = true;
      success.hidden = false;
      success.querySelector('h2').focus();
    });
    d.getElementById('contact-again').addEventListener('click', function () {
      form.reset();
      Object.keys(rules).forEach(function (name) { form.elements[name].removeAttribute('aria-invalid'); d.getElementById('err-' + name).textContent = ''; });
      success.hidden = true;
      form.hidden = false;
      form.elements.nome.focus();
    });
  }
})();
