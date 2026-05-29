/* ============================================================
   MODO FEIRA ABF 2026 — Controlador único (v4)
   Fluxo: Consultor > Apresentação > Captura (com termômetro) > QR
   ============================================================ */

(function() {
  'use strict';

  // Modo feira SEMPRE ativo (site exclusivo para feira)
  var isFeiraMode = true;

  // ========== CONFIGURAÇÃO ==========
  var CONFIG = {
    evento: "Feira ABF 2026",
    maxMinutos: 8,
    consultores: [
      { id: "giovanni", nome: "Giovanni Rinaldi" },
      { id: "tayrone", nome: "Tayrone Gomes" },
      { id: "thiago", nome: "Thiago Artibale" },
      { id: "guilherme-n", nome: "Guilherme Nogueira" },
      { id: "guilherme-o", nome: "Guilherme Oliveira" },
      { id: "gabriel", nome: "Gabriel Stuqui" },
      { id: "jonathan", nome: "Jonathan Xavier" },
      { id: "isadora", nome: "Isadora Roque" }
    ],
    endpoint: "https://script.google.com/macros/s/AKfycbwdC4YKekPo6qliAs1QtbLwBm4zuwh2PPIBOFJC5MTDOSwRgViQFMPbvjZlCnSwUKsB/exec"
  };

  var consultorAtivo = null;
  var atendimentoStart = null;
  var timerInterval = null;

  // ========== INICIALIZAÇÃO ==========
  document.addEventListener('DOMContentLoaded', function() {
    // Desativar live-pulse
    if (window.AvendLivePulse && window.AvendLivePulse.pause) {
      window.AvendLivePulse.pause();
    }
    var pulseEl = document.querySelector('.live-pulse');
    if (pulseEl) pulseEl.style.display = 'none';

    // Desativar tour
    try { localStorage.setItem('avend-tour-done', '1'); } catch(e) {}

    // Esconder splash original
    var splash = document.getElementById('feira-splash');
    if (splash) splash.style.display = 'none';
    document.body.style.overflow = '';

    // Verificar consultor salvo neste turno
    try {
      var saved = sessionStorage.getItem('feira-consultor');
      if (saved) {
        consultorAtivo = JSON.parse(saved);
        injectOverlay();
        showApresentacao();
        return;
      }
    } catch(e) {}

    injectOverlay();
    showVitrine();
  });

  // ========== OVERLAY ==========
  function injectOverlay() {
    var overlay = document.createElement('div');
    overlay.id = 'feira-overlay';
    overlay.className = 'feira-overlay';
    document.body.appendChild(overlay);
  }

  function getOverlay() {
    return document.getElementById('feira-overlay');
  }

  // ========== TELA VITRINE (idle — atrai investidor) ==========
  function showVitrine() {
    var overlay = getOverlay();
    overlay.style.display = 'flex';
    overlay.innerHTML = '<div class="feira-screen feira-screen-vitrine">' +
      '<div class="feira-vitrine-bg"></div>' +
      '<div class="feira-vitrine-content">' +
        '<img class="feira-vitrine-logo" src="assets/icone-avend.png" alt="AVEND" />' +
        '<h1 class="feira-vitrine-title">Franquia de<br><span class="feira-grad">Vending Machines</span></h1>' +
        '<p class="feira-vitrine-sub">Varejo automatizado · Sem funcionários · Opera 24/7</p>' +

        '<div class="feira-vitrine-kpis">' +
          '<div class="feira-vitrine-kpi">' +
            '<div class="feira-vitrine-kpi-val">100+</div>' +
            '<div class="feira-vitrine-kpi-lbl">Franqueados</div>' +
          '</div>' +
          '<div class="feira-vitrine-kpi">' +
            '<div class="feira-vitrine-kpi-val">14</div>' +
            '<div class="feira-vitrine-kpi-lbl">Estados</div>' +
          '</div>' +
          '<div class="feira-vitrine-kpi">' +
            '<div class="feira-vitrine-kpi-val">30%+</div>' +
            '<div class="feira-vitrine-kpi-lbl">Margem líquida</div>' +
          '</div>' +
        '</div>' +

        '<div class="feira-vitrine-invest">' +
          '<span>A partir de <strong>R$ 55.000</strong></span>' +
        '</div>' +

        '<button class="feira-vitrine-start" id="feira-vitrine-start">' +
          '<span class="feira-vitrine-start-text">Iniciar Atendimento</span>' +
          '<span class="feira-vitrine-start-arrow">→</span>' +
        '</button>' +
      '</div>' +
    '</div>';

    document.getElementById('feira-vitrine-start').addEventListener('click', showConsultor);
  }

  // ========== TELA 1: CONSULTOR ==========
  function showConsultor() {
    var overlay = getOverlay();
    var btns = CONFIG.consultores.map(function(c) {
      return '<button class="feira-consultor-btn" data-id="' + c.id + '" data-nome="' + c.nome + '">' + c.nome + '</button>';
    }).join('');

    overlay.innerHTML = '<div class="feira-screen feira-screen-consultor">' +
      '<img class="feira-logo" src="assets/icone-avend.png" alt="AVEND" />' +
      '<h2 class="feira-screen-title">Quem está atendendo?</h2>' +
      '<p class="feira-screen-sub">Selecione seu nome para iniciar o turno</p>' +
      '<div class="feira-consultor-list">' + btns + '</div>' +
      '</div>';

    overlay.style.display = 'flex';

    overlay.querySelectorAll('.feira-consultor-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        consultorAtivo = { id: btn.dataset.id, nome: btn.dataset.nome };
        try { sessionStorage.setItem('feira-consultor', JSON.stringify(consultorAtivo)); } catch(e) {}
        showApresentacao();
      });
    });
  }

  // ========== TELA 2: PITCH DECK INTERATIVO ==========
  var currentSlide = 0;
  var totalSlides = 5;

  function getSlides() {
    return [
      // Slide 1 — Hook
      '<div class="pitch-slide pitch-slide-hook">' +
        '<div class="pitch-particles"></div>' +
        '<img class="pitch-logo" src="assets/icone-avend.png" alt="AVEND" />' +
        '<h1 class="pitch-hook-text">E se você tivesse um negócio que<br><span class="feira-grad">funciona enquanto você dorme?</span></h1>' +
        '<p class="pitch-hook-sub">Varejo automatizado. Sem funcionários. Receita recorrente.</p>' +
        '<span class="pitch-badge">' + CONFIG.evento + '</span>' +
      '</div>',

      // Slide 2 — Prova Social
      '<div class="pitch-slide pitch-slide-social">' +
        '<h2 class="pitch-section-title">Nossa Rede</h2>' +
        '<div class="pitch-counters">' +
          '<div class="pitch-counter"><span class="pitch-counter-val" data-target="100">0</span><span class="pitch-counter-plus">+</span><span class="pitch-counter-lbl">Franqueados ativos</span></div>' +
          '<div class="pitch-counter"><span class="pitch-counter-val" data-target="150">0</span><span class="pitch-counter-plus">+</span><span class="pitch-counter-lbl">Máquinas operando</span></div>' +
          '<div class="pitch-counter"><span class="pitch-counter-val" data-target="14">0</span><span class="pitch-counter-plus">+</span><span class="pitch-counter-lbl">Estados</span></div>' +
          '<div class="pitch-counter"><span class="pitch-counter-val" data-target="10">0</span><span class="pitch-counter-plus">+</span><span class="pitch-counter-lbl">Anos de operação</span></div>' +
        '</div>' +
        '<p class="pitch-social-proof">Rede em expansão acelerada — maior operação de vending por franquia do Brasil</p>' +
      '</div>',

      // Slide 3 — Diferenciais
      '<div class="pitch-slide pitch-slide-modelo">' +
        '<h2 class="pitch-section-title">Por que funciona?</h2>' +
        '<div class="pitch-diffs-grid">' +
          '<div class="pitch-diff-card pitch-diff-1"><span class="pitch-diff-icon">🏢</span><span class="pitch-diff-title">Zero funcionários</span><span class="pitch-diff-desc">Sem CLT, sem gestão de equipe</span></div>' +
          '<div class="pitch-diff-card pitch-diff-2"><span class="pitch-diff-icon">🕒</span><span class="pitch-diff-title">Opera 24/7</span><span class="pitch-diff-desc">Faturando enquanto você dorme</span></div>' +
          '<div class="pitch-diff-card pitch-diff-3"><span class="pitch-diff-icon">📈</span><span class="pitch-diff-title">Escalável</span><span class="pitch-diff-desc">Adicione máquinas conforme cresce</span></div>' +
          '<div class="pitch-diff-card pitch-diff-4"><span class="pitch-diff-icon">💳</span><span class="pitch-diff-title">Pix + Cartão</span><span class="pitch-diff-desc">Pagamento digital integrado</span></div>' +
        '</div>' +
      '</div>',

      // Slide 4 — ROI
      '<div class="pitch-slide pitch-slide-roi">' +
        '<h2 class="pitch-section-title">Retorno do Investimento</h2>' +
        '<div class="pitch-roi-kpis">' +
          '<div class="pitch-roi-kpi"><div class="pitch-roi-val">12-18</div><div class="pitch-roi-lbl">meses<br>payback</div></div>' +
          '<div class="pitch-roi-kpi pitch-roi-kpi-hl"><div class="pitch-roi-val">30%+</div><div class="pitch-roi-lbl">margem<br>líquida</div></div>' +
          '<div class="pitch-roi-kpi"><div class="pitch-roi-val">R$ 28.500</div><div class="pitch-roi-lbl">patrimônio<br>por máquina</div></div>' +
        '</div>' +
        '<div class="pitch-compare">' +
          '<div class="pitch-compare-title">Comparativo com franquias tradicionais</div>' +
          '<div class="pitch-compare-row"><span class="pitch-compare-lbl">Franquia alimentação</span><span class="pitch-compare-bar" style="width:85%">R$ 250k+</span></div>' +
          '<div class="pitch-compare-row"><span class="pitch-compare-lbl">Franquia serviços</span><span class="pitch-compare-bar" style="width:60%">R$ 150k+</span></div>' +
          '<div class="pitch-compare-row pitch-compare-avend"><span class="pitch-compare-lbl">AVEND</span><span class="pitch-compare-bar pitch-compare-bar-hl" style="width:25%">R$ 55k</span></div>' +
        '</div>' +
      '</div>',

      // Slide 5 — Investimento + CTA
      '<div class="pitch-slide pitch-slide-cta">' +
        '<h2 class="pitch-section-title">Investimento</h2>' +
        '<div class="pitch-invest-cards">' +
          '<div class="pitch-invest-card">' +
            '<div class="pitch-invest-tag">Entrada na rede</div>' +
            '<div class="pitch-invest-price">R$ 55.000</div>' +
            '<div class="pitch-invest-desc">1ª máquina + franquia + treinamento</div>' +
          '</div>' +
          '<div class="pitch-invest-card pitch-invest-card-exp">' +
            '<div class="pitch-invest-tag">Expansão</div>' +
            '<div class="pitch-invest-price">R$ 23.990</div>' +
            '<div class="pitch-invest-desc">Cada máquina adicional (Bom Franqueado)</div>' +
          '</div>' +
        '</div>' +
        '<div class="pitch-urgencia">⚡ Condição especial feira — fale com o consultor</div>' +
      '</div>'
    ];
  }

  function showApresentacao() {
    atendimentoStart = Date.now();
    startTimer();
    currentSlide = 0;

    var overlay = getOverlay();
    overlay.style.display = 'flex';

    var slides = getSlides();
    var dotsHtml = '';
    for (var i = 0; i < totalSlides; i++) {
      dotsHtml += '<span class="pitch-dot' + (i === 0 ? ' active' : '') + '" data-idx="' + i + '"></span>';
    }

    overlay.innerHTML = '<div class="feira-screen feira-screen-apresentacao pitch-deck">' +
      '<div class="feira-timer" id="feira-timer">⏱ ' + CONFIG.maxMinutos + ':00</div>' +

      '<div class="pitch-track" id="pitch-track">' +
        slides.join('') +
      '</div>' +

      '<button class="pitch-arrow pitch-arrow-left" id="pitch-prev">‹</button>' +
      '<button class="pitch-arrow pitch-arrow-right" id="pitch-next">›</button>' +

      '<div class="pitch-dots" id="pitch-dots">' + dotsHtml + '</div>' +

      '<button class="pitch-lead-btn" id="pitch-go-lead">Cadastrar Lead →</button>' +
      '<button class="pitch-sim-btn" id="pitch-go-sim">Ver Simulador</button>' +

      '<button class="feira-btn-trocar" id="feira-trocar-consultor">👤 ' + consultorAtivo.nome + '</button>' +
    '</div>';

    // Navegação
    document.getElementById('pitch-prev').addEventListener('click', function() { goSlide(currentSlide - 1); });
    document.getElementById('pitch-next').addEventListener('click', function() { goSlide(currentSlide + 1); });

    // Dots
    document.querySelectorAll('.pitch-dot').forEach(function(dot) {
      dot.addEventListener('click', function() { goSlide(parseInt(dot.dataset.idx)); });
    });

    // Swipe touch
    var track = document.getElementById('pitch-track');
    var touchStartX = 0;
    track.addEventListener('touchstart', function(e) { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function(e) {
      var diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        goSlide(currentSlide + (diff > 0 ? 1 : -1));
      }
    }, { passive: true });

    // CTAs
    document.getElementById('pitch-go-lead').addEventListener('click', showCapturaLead);
    document.getElementById('pitch-go-sim').addEventListener('click', goToSimulador);
    document.getElementById('feira-trocar-consultor').addEventListener('click', function() {
      sessionStorage.removeItem('feira-consultor');
      showConsultor();
    });

    goSlide(0);
  }

  function goSlide(idx) {
    if (idx < 0) idx = 0;
    if (idx >= totalSlides) idx = totalSlides - 1;
    currentSlide = idx;

    var track = document.getElementById('pitch-track');
    track.style.transform = 'translateX(-' + (idx * 100) + '%)';

    // Dots
    document.querySelectorAll('.pitch-dot').forEach(function(dot, i) {
      dot.classList.toggle('active', i === idx);
    });

    // Arrows
    document.getElementById('pitch-prev').style.opacity = idx === 0 ? '0.2' : '1';
    document.getElementById('pitch-next').style.opacity = idx === totalSlides - 1 ? '0.2' : '1';

    // Counter animation no slide 2
    if (idx === 1) animateCounters();

    // Diff cards animation no slide 3
    if (idx === 2) animateDiffs();
  }

  function animateCounters() {
    document.querySelectorAll('.pitch-counter-val').forEach(function(el) {
      var target = parseInt(el.dataset.target);
      var duration = 1200;
      var start = performance.now();
      el.textContent = '0';

      function tick(now) {
        var progress = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  function animateDiffs() {
    document.querySelectorAll('.pitch-diff-card').forEach(function(card, i) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      setTimeout(function() {
        card.style.transition = 'all 0.4s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, i * 150);
    });
  }

  // ========== TELA 3: CAPTURA DE LEAD + TERMÔMETRO ==========
  function showCapturaLead() {
    var overlay = getOverlay();
    overlay.innerHTML = '<div class="feira-screen feira-screen-lead">' +
      '<div class="feira-timer" id="feira-timer">⏱ --:--</div>' +
      '<img class="feira-logo-sm" src="assets/icone-avend.png" alt="AVEND" />' +
      '<h2 class="feira-lead-title">Cadastrar Lead</h2>' +

      '<form class="feira-lead-form" id="feira-lead-form" autocomplete="on">' +
        '<div class="feira-field">' +
          '<label for="lead-nome">Nome</label>' +
          '<input type="text" id="lead-nome" name="name" required autocomplete="name" placeholder="Nome completo" />' +
        '</div>' +
        '<div class="feira-field">' +
          '<label for="lead-telefone">WhatsApp</label>' +
          '<input type="tel" id="lead-telefone" name="phone" required autocomplete="tel" placeholder="(00) 0 0000-0000" inputmode="tel" maxlength="16" />' +
        '</div>' +
        '<div class="feira-field">' +
          '<label for="lead-cidade">Cidade <span class="feira-optional">(opcional)</span></label>' +
          '<input type="text" id="lead-cidade" name="city" autocomplete="address-level2" placeholder="Onde pretende operar?" />' +
        '</div>' +

        '<!-- Termômetro de qualificação -->' +
        '<div class="feira-termometro">' +
          '<label class="feira-termo-label">Qualificação do Lead</label>' +
          '<div class="feira-termo-wrap">' +
            '<input type="range" id="lead-temp" min="1" max="4" value="2" step="1" class="feira-termo-slider" />' +
            '<div class="feira-termo-labels">' +
              '<span data-val="1">❄️ Frio</span>' +
              '<span data-val="2">🌤 Morno</span>' +
              '<span data-val="3">🔥 Quente</span>' +
              '<span data-val="4">🚀 Muito Quente</span>' +
            '</div>' +
          '</div>' +
          '<div class="feira-termo-indicator" id="feira-termo-indicator">🌤 Morno</div>' +
        '</div>' +

        '<button type="submit" class="feira-btn-primary feira-btn-submit">Salvar Lead ✓</button>' +
        '<button type="button" class="feira-btn-voltar" id="feira-voltar-lead">← Voltar</button>' +
      '</form>' +
    '</div>';

    updateTimer();

    // Máscara de telefone: (00) 0 0000-0000
    var telInput = document.getElementById('lead-telefone');
    telInput.addEventListener('input', function(e) {
      var v = e.target.value.replace(/\D/g, '');
      if (v.length > 11) v = v.slice(0, 11);
      var masked = '';
      if (v.length > 0) masked = '(' + v.slice(0, 2);
      if (v.length >= 2) masked += ') ';
      if (v.length >= 3) masked += v.slice(2, 3) + ' ';
      if (v.length >= 4) masked += v.slice(3, 7);
      if (v.length >= 7) masked += '-' + v.slice(7, 11);
      e.target.value = masked;
    });

    // Termômetro interativo
    var slider = document.getElementById('lead-temp');
    var indicator = document.getElementById('feira-termo-indicator');
    var labels = ['', '❄️ Frio', '🌤 Morno', '🔥 Quente', '🚀 Muito Quente'];

    slider.addEventListener('input', function() {
      var val = parseInt(this.value);
      indicator.textContent = labels[val];
      indicator.className = 'feira-termo-indicator feira-termo-' + val;
    });

    // Botão voltar
    document.getElementById('feira-voltar-lead').addEventListener('click', function() {
      showApresentacao();
    });

    // Submit
    document.getElementById('feira-lead-form').addEventListener('submit', function(e) {
      e.preventDefault();
      var nome = document.getElementById('lead-nome').value.trim();
      var telefone = document.getElementById('lead-telefone').value.trim();
      var cidade = document.getElementById('lead-cidade').value.trim();
      var temperatura = parseInt(document.getElementById('lead-temp').value);
      var tempLabels = ['', 'frio', 'morno', 'quente', 'muito_quente'];

      if (!nome || !telefone) {
        if (!nome) document.getElementById('lead-nome').focus();
        else document.getElementById('lead-telefone').focus();
        return;
      }

      // Validação telefone BR
      var telLimpo = telefone.replace(/\D/g, '');
      if (telLimpo.length < 10 || telLimpo.length > 13) {
        alert('Telefone inválido. Use formato: (11) 99999-9999');
        document.getElementById('lead-telefone').focus();
        return;
      }

      var leadData = {
        nome: nome,
        telefone: telefone,
        cidade: cidade,
        temperatura: tempLabels[temperatura],
        temperaturaNum: temperatura,
        consultor: consultorAtivo.nome,
        consultorId: consultorAtivo.id,
        evento: CONFIG.evento,
        timestamp: new Date().toISOString()
      };

      enviarLead(leadData);
      showEncerramento(leadData);
    });
  }

  // ========== TELA 4: ENCERRAMENTO ==========
  function showEncerramento(leadData) {
    if (timerInterval) clearInterval(timerInterval);

    var qrUrl = location.origin + location.pathname +
      '?ref=feira-followup' +
      '&name=' + encodeURIComponent(leadData.nome) +
      '&phone=' + encodeURIComponent(leadData.telefone) +
      (leadData.cidade ? '&city=' + encodeURIComponent(leadData.cidade) : '');

    var tempEmoji = {'frio':'❄️','morno':'🌤','quente':'🔥','muito_quente':'🚀'}[leadData.temperatura] || '';

    var overlay = getOverlay();
    overlay.innerHTML = '<div class="feira-screen feira-screen-fim">' +
      '<div class="feira-fim-check">✓</div>' +
      '<h2 class="feira-fim-title">Lead salvo!</h2>' +
      '<p class="feira-fim-nome">' + leadData.nome + '</p>' +
      '<p class="feira-fim-temp">' + tempEmoji + ' ' + leadData.temperatura.replace('_', ' ') + '</p>' +
      '<p class="feira-fim-sub">QR Code para o investidor acessar o simulador</p>' +
      '<div class="feira-qr-wrap" id="feira-qr-final"></div>' +
      '<div class="feira-fim-info">' +
        '<p>WhatsApp: <strong>' + leadData.telefone + '</strong></p>' +
        '<p class="feira-fim-consultor">Atendido por: ' + consultorAtivo.nome + '</p>' +
      '</div>' +
      '<button class="feira-btn-proximo" id="feira-proximo">Próximo Investidor →</button>' +
    '</div>';

    // QR Code
    try {
      if (typeof qrcode !== 'undefined') {
        var qrWrap = document.getElementById('feira-qr-final');
        var qr = qrcode(0, 'M');
        qr.addData(qrUrl);
        qr.make();
        qrWrap.innerHTML = qr.createSvgTag({ cellSize: 5, margin: 4 });
      }
    } catch(e) { console.warn('[feira-qr]', e); }

    document.getElementById('feira-proximo').addEventListener('click', proximoInvestidor);
  }

  // ========== SIMULADOR ==========
  function goToSimulador() {
    var overlay = getOverlay();
    overlay.style.display = 'none';
    if (typeof activateTab === 'function') activateTab('simulador');
    addFloatButtons();
  }

  function addFloatButtons() {
    document.querySelectorAll('.feira-btn-float').forEach(function(el) { el.remove(); });

    var capturaBtn = document.createElement('button');
    capturaBtn.className = 'feira-btn-float feira-btn-float-lead';
    capturaBtn.innerHTML = '📋 Cadastrar Lead';
    capturaBtn.addEventListener('click', function() {
      getOverlay().style.display = 'flex';
      showCapturaLead();
    });
    document.body.appendChild(capturaBtn);

    var nextBtn = document.createElement('button');
    nextBtn.className = 'feira-btn-float feira-btn-float-next';
    nextBtn.innerHTML = '→ Próximo';
    nextBtn.addEventListener('click', proximoInvestidor);
    document.body.appendChild(nextBtn);
  }

  // ========== AUXILIARES ==========
  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
  }

  function updateTimer() {
    if (!atendimentoStart) return;
    var elapsed = Math.floor((Date.now() - atendimentoStart) / 1000);
    var remaining = Math.max(0, CONFIG.maxMinutos * 60 - elapsed);
    var min = Math.floor(remaining / 60);
    var sec = remaining % 60;
    var timerEl = document.getElementById('feira-timer');
    if (timerEl) {
      timerEl.textContent = '⏱ ' + min + ':' + (sec < 10 ? '0' : '') + sec;
      if (remaining <= 60) timerEl.classList.add('timer-warning');
      if (remaining <= 0) timerEl.textContent = '⏱ Tempo!';
    }
  }

  function enviarLead(data) {
    var payload = {
      type: 'event',
      session_id: 'feira_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7),
      event: {
        type: 'feira_lead_captured',
        t: Date.now(),
        data: {
          nome: data.nome,
          telefone: data.telefone,
          cidade: data.cidade || '',
          temperatura: data.temperatura,
          temperaturaNum: data.temperaturaNum,
          consultor: data.consultor,
          consultorId: data.consultorId,
          evento: data.evento,
          timestamp: data.timestamp
        }
      },
      visitor: {
        name: data.nome,
        phone: data.telefone,
        city: data.cidade || ''
      }
    };

    try {
      if (CONFIG.endpoint) {
        var blob = new Blob([JSON.stringify(payload)], { type: 'text/plain' });
        navigator.sendBeacon(CONFIG.endpoint, blob);
      }
    } catch(e) { console.warn('[feira-send]', e); }

    // Backup local
    try {
      var leads = JSON.parse(localStorage.getItem('feira-leads') || '[]');
      leads.push(data);
      localStorage.setItem('feira-leads', JSON.stringify(leads));
    } catch(e) {}
  }

  function proximoInvestidor() {
    if (timerInterval) clearInterval(timerInterval);
    atendimentoStart = null;
    document.querySelectorAll('.feira-btn-float').forEach(function(el) { el.remove(); });
    showVitrine();
  }

  // Expor para debug/export
  window.FEIRA = {
    config: CONFIG,
    proximoInvestidor: proximoInvestidor,
    exportLeads: function() {
      var leads = JSON.parse(localStorage.getItem('feira-leads') || '[]');
      console.table(leads);
      try {
        var csv = 'Nome,Telefone,Cidade,Temperatura,Consultor,Timestamp\n' +
          leads.map(function(l) {
            return [l.nome, l.telefone, l.cidade, l.temperatura, l.consultor, l.timestamp].join(',');
          }).join('\n');
        navigator.clipboard.writeText(csv);
        alert('✓ ' + leads.length + ' leads copiados (CSV)');
      } catch(e) {
        alert(JSON.stringify(leads, null, 2));
      }
      return leads;
    }
  };
})();