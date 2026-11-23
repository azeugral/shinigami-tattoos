(function () {
  var d = document;
  var IG = 'https://ig.me/m/shinigami.tattoos';
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- hero: o álbum da Pokédex dele. Os cromos já tatuados colam-se nos espaços e,
     no centro, um cartão troca as peças grandes a cada 5 s ---------- */
  var hero = d.querySelector('.hero'), album = d.getElementById('album');
  var CROMOS = 18;
  function montaAlbum() {
    var W = album.clientWidth, H = album.clientHeight;
    var cs = getComputedStyle(album), c = parseFloat(cs.getPropertyValue('--c')), g = parseFloat(cs.getPropertyValue('--gap'));
    var cols = Math.ceil((W + g) / (c + g)) + 1, rows = Math.ceil((H + g) / (c + g)) + 1;
    if (cols % 2 === 0) cols++;
    album.style.setProperty('--cols', cols);
    album.innerHTML = '';
    var total = cols * rows, cx = (cols - 1) / 2, cy = (rows - 1) / 2, livres = [];
    for (var k = 0; k < total; k++) {
      var x = k % cols, y = Math.floor(k / cols);
      var dx = Math.abs(x - cx) / cx, dy = Math.abs(y - cy) / cy;
      // espaços fora do cartão central, espelhados à esquerda e à direita
      if (dx > .34 && dy < .92 && x < cx) livres.push(k);
      album.appendChild(d.createElement('i'));
    }
    // escolhe metade dos cromos no lado esquerdo e espelha no direito (composição simétrica)
    var sem = 7, esc = [];
    while (esc.length < Math.min(CROMOS / 2, livres.length)) {
      sem = (sem * 9301 + 49297) % 233280;
      var p = livres[Math.floor(sem / 233280 * livres.length)];
      if (esc.indexOf(p) < 0) esc.push(p);
    }
    var pares = [];
    esc.forEach(function (k) { var x = k % cols, y = Math.floor(k / cols); pares.push(k, y * cols + (cols - 1 - x)); });
    pares.forEach(function (k, n) {
      var b = d.createElement('b'), im = new Image();
      im.src = 'img/c/' + String(n % CROMOS).padStart(2, '0') + '.webp'; im.alt = ''; im.draggable = false;
      b.appendChild(im);
      b.style.setProperty('--r', ((n % 3) - 1) * 1.5 + 'deg');
      album.replaceChild(b, album.children[k]);
      if (reduz) b.classList.add('on');
      else setTimeout(function () { b.classList.add('on'); }, 250 + n * 75);
    });
  }
  if (hero) {
    montaAlbum();
    var tr; addEventListener('resize', function () { clearTimeout(tr); tr = setTimeout(montaAlbum, 250); });
    requestAnimationFrame(function () { hero.classList.add('pronto'); });
    var fotos = [].slice.call(d.querySelectorAll('.cartao-in img')), at = 0, vis = true;
    new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(hero);
    if (!reduz) setInterval(function () {
      if (!vis || d.hidden) return;
      fotos[at].classList.remove('on'); at = (at + 1) % fotos.length; fotos[at].classList.add('on');
    }, 5000);
  }

  /* ---------- topo e gaveta ---------- */
  var topo = d.getElementById('topo'), gav = d.getElementById('gaveta'), burger = d.getElementById('burger');
  function rolar() { topo.classList.toggle('solido', scrollY > 30 || !gav.hidden); }
  addEventListener('scroll', rolar, { passive: true }); rolar();
  function gaveta(a) { gav.hidden = !a; burger.setAttribute('aria-expanded', a); d.body.style.overflow = a ? 'hidden' : ''; rolar(); }
  burger.addEventListener('click', function () { gaveta(gav.hidden); });
  gav.addEventListener('click', function (e) { if (e.target.closest('a')) gaveta(false); });

  /* ---------- entrada ao rolar ---------- */
  var io = new IntersectionObserver(function (es) {
    var meio = innerWidth / 2;
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var r = e.boundingClientRect, dist = Math.abs(r.left + r.width / 2 - meio) / meio;
      e.target.style.transitionDelay = Math.round(Math.min(1, dist) * 240) + 'ms';
      e.target.classList.add('vis'); io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -6% 0px' });
  function observar() { d.querySelectorAll('.rev:not(.vis),.item:not(.vis):not(.sai)').forEach(function (el) { io.observe(el); }); }

  /* ---------- formulário: ajudas ---------- */
  function marca(nome, valor) { var r = d.querySelector('input[name="' + nome + '"][value="' + valor + '"]'); if (r) r.checked = true; }
  function irForm() { d.getElementById('form').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  var ideia = d.getElementById('ideia');

  /* ---------- trabalhos ---------- */
  var grade = d.getElementById('grade'), mais = d.getElementById('mais'), filtro = 'todos';
  var passoN = 24, limite = passoN;
  PECAS.forEach(function (p, i) {
    var f = d.createElement('figure'); f.className = 'item'; f.tabIndex = 0; f.dataset.i = i;
    f.setAttribute('role', 'button'); f.setAttribute('aria-label', 'Ampliar: ' + p.l);
    f.innerHTML = '<div class="fr"><img src="img/p/' + p.c + '.webp" alt="' + p.l + ', tatuagem de Shinigami Tattoos" width="720" height="900" draggable="false"></div>';
    grade.appendChild(f);
  });
  var itens = [].slice.call(grade.children);
  function visiveis() { return itens.filter(function (el) { return filtro === 'todos' || PECAS[el.dataset.i].t === filtro; }); }
  function aplicar() {
    var v = visiveis();
    itens.forEach(function (el) { el.classList.add('sai'); });
    v.forEach(function (el, k) { if (k < limite) el.classList.remove('sai'); });
    mais.hidden = v.length <= limite;
    observar();
  }
  aplicar(); observar();
  d.querySelectorAll('.filtros button').forEach(function (b) {
    b.addEventListener('click', function () {
      d.querySelectorAll('.filtros button').forEach(function (x) { x.classList.toggle('on', x === b); });
      filtro = b.dataset.f; limite = passoN; aplicar();
      itens.forEach(function (el) { if (!el.classList.contains('sai')) el.classList.add('vis'); });
      grade.animate && grade.animate([{ opacity: .2, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: 'cubic-bezier(.16,.84,.32,1)' });
    });
  });
  mais.addEventListener('click', function () { limite += passoN; aplicar(); });

  /* lightbox */
  var lb = d.getElementById('lb'), lbImg = d.getElementById('lbImg'), atualLb = 0, lista = [];
  function abrirLb(i) { lista = visiveis().map(function (el) { return +el.dataset.i; }); atualLb = Math.max(0, lista.indexOf(i)); mostrar(); lb.hidden = false; d.body.style.overflow = 'hidden'; }
  function mostrar() { var p = PECAS[lista[atualLb]]; lbImg.src = 'img/g/' + p.c + '.webp'; lbImg.alt = p.l + ', tatuagem de Shinigami Tattoos'; }
  function passo(n) { atualLb = (atualLb + n + lista.length) % lista.length; mostrar(); }
  function fechar() { lb.hidden = true; d.body.style.overflow = ''; }
  grade.addEventListener('click', function (e) { var f = e.target.closest('.item'); if (f) abrirLb(+f.dataset.i); });
  grade.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { var f = e.target.closest('.item'); if (f) { e.preventDefault(); abrirLb(+f.dataset.i); } } });
  d.getElementById('lbX').onclick = fechar;
  d.getElementById('lbP').onclick = function () { passo(-1); };
  d.getElementById('lbS').onclick = function () { passo(1); };
  d.getElementById('lbQuero').onclick = function () {
    var p = PECAS[lista[atualLb]];
    ideia.value = 'Quero um projeto na linha desta peça do site: ' + p.l + '.';
    marca('tipo', 'Projeto único');
    if (p.t === 'poke') marca('anime', 'Pokémon ou Digimon');
    if (p.t === 'pequena') d.querySelector('select[name="tamanho"]').value = 'Até 10 cm';
    if (p.t === 'grande') d.querySelector('select[name="tamanho"]').value = 'Grande (mais de 20 cm)';
    fechar(); irForm();
  };
  lb.addEventListener('click', function (e) { if (e.target === lb) fechar(); });
  addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') fechar(); if (e.key === 'ArrowLeft') passo(-1); if (e.key === 'ArrowRight') passo(1);
  });
  var tx = null;
  lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) { if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 45) passo(dx < 0 ? 1 : -1); tx = null; });

  /* ---------- desenhos disponíveis ---------- */
  var fl = d.getElementById('flash');
  FLASH.forEach(function (p) {
    var f = d.createElement('figure'); f.className = 'rev';
    f.innerHTML = '<div class="fr"><img src="img/flash/' + p.c + '.webp" alt="Desenho disponível: ' + p.l + '" width="720" height="900" draggable="false"></div>' +
      '<figcaption><b>' + p.l + '</b><button class="bt bt-linha" type="button">Quero este</button></figcaption>';
    f.querySelector('button').onclick = function () {
      ideia.value = 'Quero o desenho disponível do site: ' + p.l + '. Ainda está livre?';
      marca('tipo', 'Desenho disponível');
      irForm();
    };
    fl.appendChild(f);
  });
  observar();

  /* ---------- Pokédex ---------- */
  d.getElementById('querPoke').onclick = function () {
    ideia.value = 'Quero entrar na Pokédex. O meu Pokémon é: ';
    marca('tipo', 'Pokédex 151'); marca('anime', 'Pokémon ou Digimon');
    irForm();
  };

  /* ---------- pedido pelo Direct do Instagram: copia a mensagem e abre a conversa ---------- */
  var form = d.getElementById('form'), erro = d.getElementById('erro'), ok = d.getElementById('copiado');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = new FormData(form), nomeC = (f.get('nome') || '').trim();
    if (!nomeC) { erro.hidden = false; form.nome.focus(); return; }
    erro.hidden = true;
    var l = ['Olá! Sou o/a ' + nomeC + ' e quero um orçamento.', '',
      'Pedido: ' + f.get('tipo'), 'Anime: ' + f.get('anime'),
      'Zona do corpo: ' + ((f.get('zona') || '').trim() || 'a definir'),
      'Tamanho: ' + f.get('tamanho'), 'Disponibilidade: ' + f.get('quando')];
    var id = (f.get('ideia') || '').trim();
    if (id) l.push('', 'Ideia: ' + id);
    l.push('', 'Envio as referências aqui na conversa.', '(pedido enviado pelo site)');
    var txt = l.join('\n');
    try { navigator.clipboard.writeText(txt).catch(function () {}); } catch (x) {}
    ok.hidden = false;
    window.open(IG, '_blank', 'noopener');
    window.__ultimoPedido = txt;
  });
})();
