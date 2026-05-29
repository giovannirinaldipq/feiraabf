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

  // ========== TELA 2: APRESENTAÇÃO ==========
  function showApresentacao() {
    atendimentoStart = Date.now();
    startTimer();

    var overlay = getOverlay();
    overlay.style.display = 'flex';
    overlay.innerHTML = '<div class="feira-screen feira-screen-apresentacao">' +
      '<div class="feira-timer" id="feira-timer">⏱ ' + CONFIG.maxMinutos + ':00</div>' +
      '<div class="feira-header-row">' +
        '<img class="feira-logo-sm" src="assets/icone-avend.png" alt="AVEND" />' +
        '<span class="feira-badge">' + CONFIG.evento + '</span>' +
      '</div>' +

      '<h1 class="feira-apres-title">Franquia de<br><span class="feira-grad">Vending Machines</span></h1>' +

      '<div class="feira-kpis">' +
        '<div class="feira-kpi"><div class="feira-kpi-val">12-18</div><div class="feira-kpi-lbl">meses payback</div></div>' +
        '<div class="feira-kpi"><div class="feira-kpi-val">30%+</div><div class="feira-kpi-lbl">margem líquida</div></div>' +
        '<div class="feira-kpi"><div class="feira-kpi-val">R$ 28.500</div><div class="feira-kpi-lbl">patrimônio/máq</div></div>' +
      '</div>' +

      '<div class="feira-diffs">' +
        '<div class="feira-diff">🏢 Sem funcionários</div>' +
        '<div class="feira-diff">🕒 Opera 24/7</div>' +
        '<div class="feira-diff">📈 Escalável</div>' +
        '<div class="feira-diff">💳 Pix + Cartão</div>' +
      '</div>' +

      '<div class="feira-investimentos">' +
        '<div class="feira-invest-item"><span class="feira-invest-label">1ª máquina + franquia</span><span class="feira-invest-val">R$ 55.000</span></div>' +
        '<div class="feira-invest-item"><span class="feira-invest-label">Máquinas adicionais</span><span class="feira-invest-val">R$ 23.990</span></div>' +
      '</div>' +

      '<div class="feira-apres-cta">' +
        '<button class="feira-btn-primary" id="feira-go-lead">Cadastrar Lead →</button>' +
        '<button class="feira-btn-secondary" id="feira-go-simulador">Ver Simulador</button>' +
      '</div>' +

      '<button class="feira-btn-trocar" id="feira-trocar-consultor">👤 ' + consultorAtivo.nome + '</button>' +
    '</div>';

    document.getElementById('feira-go-lead').addEventListener('click', showCapturaLead);
    document.getElementById('feira-go-simulador').addEventListener('click', goToSimulador);
    document.getElementById('feira-trocar-consultor').addEventListener('click', function() {
      sessionStorage.removeItem('feira-consultor');
      showConsultor();
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
          '<input type="tel" id="lead-telefone" name="phone" required autocomplete="tel" placeholder="(11) 99999-9999" inputmode="tel" />' +
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