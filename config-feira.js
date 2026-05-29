/* ============================================================
   MODO FEIRA ABF 2026 — Controlador único (v3)
   Ativação: ?feira=true na URL

   Fluxo: 4 telas
   1. Consultor (1x por turno, com opção de trocar)
   2. Apresentação + KPIs (impacto visual)
   3. Captura rápida (nome + WhatsApp)
   4. QR + Obrigado + Próximo
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
      { id: "consultor2", nome: "Consultor 2" },
      { id: "consultor3", nome: "Consultor 3" },
      { id: "consultor4", nome: "Consultor 4" }
    ],
    // Endpoint do Apps Script (mesmo do telemetry)
    endpoint: "https://script.google.com/macros/s/AKfycbwdC4YKekPo6qliAs1QtbLwBm4zuwh2PPIBOFJC5MTDOSwRgViQFMPbvjZlCnSwUKsB/exec"
  };

  var consultorAtivo = null;
  var atendimentoStart = null;
  var timerInterval = null;

  // ========== INICIALIZAÇÃO ==========
  document.addEventListener('DOMContentLoaded', function() {
    // Desativar live-pulse (nome correto do objeto global)
    if (window.AvendLivePulse && window.AvendLivePulse.pause) {
      window.AvendLivePulse.pause();
    }
    // Fallback: esconder elemento
    var pulseEl = document.querySelector('.live-pulse');
    if (pulseEl) pulseEl.style.display = 'none';

    // Desativar tour automático
    try { localStorage.setItem('avend-tour-done', '1'); } catch(e) {}

    // Esconder splash original do app.js
    var splash = document.getElementById('feira-splash');
    if (splash) splash.style.display = 'none';
    document.body.style.overflow = '';

    // Verificar se consultor já foi selecionado neste turno
    try {
      var saved = sessionStorage.getItem('feira-consultor');
      if (saved) {
        consultorAtivo = JSON.parse(saved);
        injectOverlay();
        showApresentacao();
        return;
      }
    } catch(e) {}

    // Primeira vez: mostrar seleção de consultor
    injectOverlay();
    showConsultor();
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

  // ========== TELA 1: CONSULTOR (1x por turno) ==========
  function showConsultor() {
    var overlay = getOverlay();
    var btns = CONFIG.consultores.map(function(c) {
      return '<button class="feira-consultor-btn" data-id="' + c.id + '" data-nome="' + c.nome + '">' + c.nome + '</button>';
    }).join('');

    overlay.innerHTML = '<div class="feira-screen feira-screen-consultor">' +
      '<img class="feira-logo" src="assets/logo-full.png" alt="AVEND" />' +
      '<h2 class="feira-screen-title">Quem está atendendo?</h2>' +
      '<p class="feira-screen-sub">Selecione seu nome para iniciar o turno</p>' +
      '<div class="feira-consultor-list">' + btns + '</div>' +
      '</div>';

    overlay.style.display = 'flex';

    // Bind botões
    overlay.querySelectorAll('.feira-consultor-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        consultorAtivo = { id: btn.dataset.id, nome: btn.dataset.nome };
        try { sessionStorage.setItem('feira-consultor', JSON.stringify(consultorAtivo)); } catch(e) {}
        showApresentacao();
      });
    });
  }

  // ========== TELA 2: APRESENTAÇÃO + KPIs ==========
  function showApresentacao() {
    atendimentoStart = Date.now();
    startTimer();

    var overlay = getOverlay();
    overlay.style.display = 'flex';
    overlay.innerHTML = '<div class="feira-screen feira-screen-apresentacao">' +
      '<div class="feira-timer" id="feira-timer">⏱ ' + CONFIG.maxMinutos + ':00</div>' +
      '<div class="feira-header-row">' +
        '<img class="feira-logo-sm" src="assets/logo-full.png" alt="AVEND" />' +
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
        '<button class="feira-btn-primary" id="feira-go-lead">Quero saber mais →</button>' +
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

  // ========== TELA 3: CAPTURA RÁPIDA (nome + WhatsApp) ==========
  function showCapturaLead() {
    var overlay = getOverlay();
    overlay.innerHTML = '<div class="feira-screen feira-screen-lead">' +
      '<div class="feira-timer" id="feira-timer">⏱ --:--</div>' +
      '<img class="feira-logo-sm" src="assets/logo-full.png" alt="AVEND" />' +
      '<h2 class="feira-lead-title">Receba seu diagnóstico</h2>' +
      '<p class="feira-lead-sub">Preencha para receber a simulação personalizada no seu WhatsApp</p>' +

      '<form class="feira-lead-form" id="feira-lead-form" autocomplete="on">' +
        '<div class="feira-field">' +
          '<label for="lead-nome">Nome</label>' +
          '<input type="text" id="lead-nome" name="name" required autocomplete="name" placeholder="Seu nome completo" />' +
        '</div>' +
        '<div class="feira-field">' +
          '<label for="lead-telefone">WhatsApp</label>' +
          '<input type="tel" id="lead-telefone" name="phone" required autocomplete="tel" placeholder="(11) 99999-9999" inputmode="tel" />' +
        '</div>' +
        '<div class="feira-field feira-field-optional">' +
          '<label for="lead-cidade">Cidade <span class="feira-optional">(opcional)</span></label>' +
          '<input type="text" id="lead-cidade" name="city" autocomplete="address-level2" placeholder="Onde pretende operar?" />' +
        '</div>' +
        '<button type="submit" class="feira-btn-primary feira-btn-submit">Enviar →</button>' +
      '</form>' +
    '</div>';

    updateTimer();

    document.getElementById('feira-lead-form').addEventListener('submit', function(e) {
      e.preventDefault();
      var nome = document.getElementById('lead-nome').value.trim();
      var telefone = document.getElementById('lead-telefone').value.trim();
      var cidade = document.getElementById('lead-cidade').value.trim();

      if (!nome || !telefone) {
        document.getElementById('lead-nome').focus();
        return;
      }

      // Validação básica de telefone BR
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
        consultor: consultorAtivo.nome,
        consultorId: consultorAtivo.id,
        evento: CONFIG.evento,
        timestamp: new Date().toISOString()
      };

      enviarLead(leadData);
      showEncerramento(leadData);
    });
  }

  // ========== TELA 4: ENCERRAMENTO + QR CODE ==========
  function showEncerramento(leadData) {
    if (timerInterval) clearInterval(timerInterval);

    // URL útil: simulador com dados do investidor para revisão em casa
    var qrUrl = location.origin + location.pathname +
      '?ref=feira-followup' +
      '&name=' + encodeURIComponent(leadData.nome) +
      '&phone=' + encodeURIComponent(leadData.telefone) +
      (leadData.cidade ? '&city=' + encodeURIComponent(leadData.cidade) : '');

    var overlay = getOverlay();
    overlay.innerHTML = '<div class="feira-screen feira-screen-fim">' +
      '<div class="feira-fim-check">✓</div>' +
      '<h2 class="feira-fim-title">Obrigado, ' + leadData.nome.split(' ')[0] + '!</h2>' +
      '<p class="feira-fim-sub">Escaneie para acessar o simulador completo no celular</p>' +
      '<div class="feira-qr-wrap" id="feira-qr-final"></div>' +
      '<div class="feira-fim-info">' +
        '<p>Entraremos em contato pelo WhatsApp <strong>' + leadData.telefone + '</strong></p>' +
        '<p class="feira-fim-consultor">Atendido por: ' + consultorAtivo.nome + '</p>' +
      '</div>' +
      '<button class="feira-btn-proximo" id="feira-proximo">Próximo Investidor →</button>' +
    '</div>';

    // Gerar QR Code
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

  // ========== SIMULADOR (overlay escondido) ==========
  function goToSimulador() {
    var overlay = getOverlay();
    overlay.style.display = 'none';

    // Ativar aba simulador
    if (typeof activateTab === 'function') activateTab('simulador');

    // Botões flutuantes
    addFloatButtons();
  }

  function addFloatButtons() {
    // Remover existentes
    document.querySelectorAll('.feira-btn-float').forEach(function(el) { el.remove(); });

    // Botão captura
    var capturaBtn = document.createElement('button');
    capturaBtn.className = 'feira-btn-float feira-btn-float-lead';
    capturaBtn.innerHTML = '📋 Capturar Lead';
    capturaBtn.addEventListener('click', function() {
      getOverlay().style.display = 'flex';
      showCapturaLead();
    });
    document.body.appendChild(capturaBtn);

    // Botão próximo
    var nextBtn = document.createElement('button');
    nextBtn.className = 'feira-btn-float feira-btn-float-next';
    nextBtn.innerHTML = '→ Próximo';
    nextBtn.addEventListener('click', proximoInvestidor);
    document.body.appendChild(nextBtn);
  }

  // ========== FUNÇÕES AUXILIARES ==========

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
    // Formato compatível com o Apps Script existente (Code.gs aceita type: "event")
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

    // Enviar via sendBeacon com text/plain (evita CORS preflight no Apps Script)
    try {
      if (CONFIG.endpoint) {
        var blob = new Blob([JSON.stringify(payload)], { type: 'text/plain' });
        navigator.sendBeacon(CONFIG.endpoint, blob);
      }
    } catch(e) {
      console.warn('[feira-send]', e);
    }

    // Backup local (preservado entre reloads)
    try {
      var leads = JSON.parse(localStorage.getItem('feira-leads') || '[]');
      leads.push(data);
      localStorage.setItem('feira-leads', JSON.stringify(leads));
    } catch(e) {}
  }

  function proximoInvestidor() {
    if (timerInterval) clearInterval(timerInterval);
    atendimentoStart = null;

    // Remover botões flutuantes
    document.querySelectorAll('.feira-btn-float').forEach(function(el) { el.remove(); });

    // Mostrar overlay e ir para apresentação (consultor já selecionado)
    showApresentacao();
  }

  // Expor para debug/export
  window.FEIRA = {
    config: CONFIG,
    proximoInvestidor: proximoInvestidor,
    exportLeads: function() {
      var leads = JSON.parse(localStorage.getItem('feira-leads') || '[]');
      console.table(leads);
      // Copiar para clipboard
      try {
        var csv = 'Nome,Telefone,Cidade,Consultor,Timestamp\n' +
          leads.map(function(l) {
            return [l.nome, l.telefone, l.cidade, l.consultor, l.timestamp].join(',');
          }).join('\n');
        navigator.clipboard.writeText(csv);
        alert('✓ ' + leads.length + ' leads copiados para clipboard (CSV)');
      } catch(e) {
        alert(JSON.stringify(leads, null, 2));
      }
      return leads;
    }
  };
})();