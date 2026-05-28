/* ============================================================
   MODO FEIRA ABF 2026 — Controlador único
   Ativação: ?feira=true na URL
   ============================================================ */

(function() {
  const isFeiraMode = location.search.includes('feira=true') ||
                     location.hash.includes('#feira') ||
                     document.documentElement.classList.contains('feira-mode');

  if (!isFeiraMode) return;

  document.documentElement.classList.add('feira-mode');

  // Configurações do evento
  const CONFIG = {
    evento: "Feira ABF 2026",
    maxMinutos: 10,
    consultores: [
      { id: "giovanni", nome: "Giovanni Rinaldi" },
      { id: "consultor2", nome: "Consultor 2" },
      { id: "consultor3", nome: "Consultor 3" }
    ],
    whatsappFallback: "5517996003377",
    telemetryEndpoint: "https://script.google.com/macros/s/AKfycbwdC4YKekPo6qliAs1QtbLwBm4zuwh2PPIBOFJC5MTDOSwRgViQFMPbvjZlCnSwUKsB/exec"
  };

  let consultorAtivo = null;
  let atendimentoStart = null;
  let timerInterval = null;

  // ========== INICIALIZAÇÃO ==========
  document.addEventListener('DOMContentLoaded', function() {
    // Desativar live-pulse
    if (window.LIVE_PULSE) window.LIVE_PULSE.stop && window.LIVE_PULSE.stop();
    const pulseEl = document.querySelector('.live-pulse');
    if (pulseEl) pulseEl.style.display = 'none';

    // Desativar tour automático
    try { localStorage.setItem('avend-tour-done', '1'); } catch(e) {}

    // Esconder splash original e mostrar tela de seleção de consultor
    const splash = document.getElementById('feira-splash');
    if (splash) splash.style.display = 'none';

    // Esconder apresentação antiga
    const oldPresentation = document.getElementById('feira-presentation');
    if (oldPresentation) oldPresentation.style.display = 'none';

    // Injetar fluxo feira
    injectFeiraFlow();
  });

  // ========== FLUXO FEIRA (6 TELAS) ==========
  function injectFeiraFlow() {
    const overlay = document.createElement('div');
    overlay.id = 'feira-overlay';
    overlay.className = 'feira-overlay';
    overlay.innerHTML = buildConsultorScreen();
    document.body.appendChild(overlay);
  }

  // --- TELA 1: Seleção de Consultor ---
  function buildConsultorScreen() {
    const btns = CONFIG.consultores.map(c =>
      `<button class="feira-consultor-btn" data-id="${c.id}" data-nome="${c.nome}">${c.nome}</button>`
    ).join('');

    return `
      <div class="feira-screen feira-screen-consultor">
        <img class="feira-logo" src="assets/logo-full.png" alt="AVEND" />
        <h2 class="feira-screen-title">Quem está atendendo?</h2>
        <p class="feira-screen-sub">Selecione seu nome para iniciar</p>
        <div class="feira-consultor-list">${btns}</div>
      </div>
    `;
  }

  // --- TELA 2: Splash rápido ---
  function showSplash() {
    const overlay = document.getElementById('feira-overlay');
    overlay.innerHTML = `
      <div class="feira-screen feira-screen-splash">
        <img class="feira-logo" src="assets/logo-full.png" alt="AVEND" />
        <h1 class="feira-splash-h1">${CONFIG.evento}</h1>
        <p class="feira-splash-p">Varejo Automatizado · Franquia de Vending Machines</p>
        <button class="feira-btn-primary" id="feira-start">
          Iniciar Apresentação <span aria-hidden="true">→</span>
        </button>
        <p class="feira-consultor-tag">Atendente: <strong>${consultorAtivo.nome}</strong></p>
      </div>
    `;
    document.getElementById('feira-start').addEventListener('click', showApresentacao);
  }

  // --- TELA 3: Apresentação rápida ---
  function showApresentacao() {
    atendimentoStart = Date.now();
    startTimer();

    const overlay = document.getElementById('feira-overlay');
    overlay.innerHTML = `
      <div class="feira-screen feira-screen-apresentacao">
        <div class="feira-timer" id="feira-timer">⏱ 10:00</div>
        <h2 class="feira-apres-title">Seu potencial como franqueado AVEND</h2>

        <div class="feira-kpis">
          <div class="feira-kpi">
            <div class="feira-kpi-val">12-18</div>
            <div class="feira-kpi-lbl">meses payback</div>
          </div>
          <div class="feira-kpi">
            <div class="feira-kpi-val">30%+</div>
            <div class="feira-kpi-lbl">margem líquida</div>
          </div>
          <div class="feira-kpi">
            <div class="feira-kpi-val">R$ 28.500</div>
            <div class="feira-kpi-lbl">patrimônio/máquina</div>
          </div>
        </div>

        <div class="feira-diffs">
          <div class="feira-diff">🏢 Sem funcionários</div>
          <div class="feira-diff">🕒 Opera 24/7</div>
          <div class="feira-diff">📈 Escalável rápido</div>
          <div class="feira-diff">💳 Pix + Cartão + NFC</div>
        </div>

        <div class="feira-investimentos">
          <div class="feira-invest-item">
            <span class="feira-invest-label">1ª máquina + franquia</span>
            <span class="feira-invest-val">R$ 55.000</span>
          </div>
          <div class="feira-invest-item">
            <span class="feira-invest-label">Máquinas adicionais</span>
            <span class="feira-invest-val">R$ 23.990</span>
          </div>
        </div>

        <div class="feira-apres-cta">
          <button class="feira-btn-primary" id="feira-go-simulador">
            Simular Investimento →
          </button>
          <button class="feira-btn-secondary" id="feira-go-quiz">
            Diagnóstico Rápido (3 perguntas)
          </button>
        </div>
      </div>
    `;

    document.getElementById('feira-go-simulador').addEventListener('click', goToSimulador);
    document.getElementById('feira-go-quiz').addEventListener('click', showQuizRapido);
  }

  // --- TELA 4: Quiz Rápido (3 perguntas) ---
  function showQuizRapido() {
    const overlay = document.getElementById('feira-overlay');
    overlay.innerHTML = `
      <div class="feira-screen feira-screen-quiz">
        <div class="feira-timer" id="feira-timer">⏱ --:--</div>
        <h2 class="feira-quiz-title">Diagnóstico Express</h2>
        <p class="feira-quiz-sub">3 perguntas para calibrar seu plano</p>

        <div class="feira-quiz-steps" id="feira-quiz-steps">
          <!-- Pergunta 1 -->
          <div class="feira-quiz-step active" data-step="1">
            <h3>Quanto pretende investir inicialmente?</h3>
            <div class="feira-quiz-opts">
              <button class="feira-quiz-opt" data-key="capital" data-value="55k">R$ 55.000 (1 máquina)</button>
              <button class="feira-quiz-opt" data-key="capital" data-value="80-130k">R$ 80-130k (2-3 máquinas)</button>
              <button class="feira-quiz-opt" data-key="capital" data-value="200k+">R$ 200k+ (4+ máquinas)</button>
            </div>
          </div>

          <!-- Pergunta 2 -->
          <div class="feira-quiz-step" data-step="2">
            <h3>Qual seu objetivo principal?</h3>
            <div class="feira-quiz-opts">
              <button class="feira-quiz-opt" data-key="objetivo" data-value="renda-extra">Renda extra complementar</button>
              <button class="feira-quiz-opt" data-key="objetivo" data-value="transicao">Transição de carreira</button>
              <button class="feira-quiz-opt" data-key="objetivo" data-value="escala">Montar operação em escala</button>
            </div>
          </div>

          <!-- Pergunta 3 -->
          <div class="feira-quiz-step" data-step="3">
            <h3>Em qual cidade pretende operar?</h3>
            <div class="feira-quiz-opts">
              <input type="text" class="feira-quiz-input" id="feira-cidade" placeholder="Digite sua cidade..." autocomplete="off" />
              <button class="feira-btn-primary feira-quiz-submit" id="feira-quiz-finalizar">
                Ver meu plano →
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    updateTimer();
    bindQuizRapido();
  }

  // --- TELA 5: Captura de Lead ---
  function showCapturaLead(quizData) {
    const overlay = document.getElementById('feira-overlay');
    overlay.innerHTML = `
      <div class="feira-screen feira-screen-lead">
        <div class="feira-timer" id="feira-timer">⏱ --:--</div>
        <h2 class="feira-lead-title">Seu plano está pronto!</h2>
        <p class="feira-lead-sub">Preencha seus dados para receber o diagnóstico completo no celular</p>

        <form class="feira-lead-form" id="feira-lead-form" autocomplete="on">
          <div class="feira-field">
            <label for="lead-nome">Nome completo</label>
            <input type="text" id="lead-nome" name="name" required autocomplete="name" placeholder="Seu nome" />
          </div>
          <div class="feira-field">
            <label for="lead-telefone">WhatsApp</label>
            <input type="tel" id="lead-telefone" name="phone" required autocomplete="tel" placeholder="(11) 99999-9999" inputmode="tel" />
          </div>
          <div class="feira-field">
            <label for="lead-email">E-mail</label>
            <input type="email" id="lead-email" name="email" autocomplete="email" placeholder="seu@email.com" />
          </div>
          <div class="feira-field">
            <label for="lead-cidade">Cidade</label>
            <input type="text" id="lead-cidade" name="city" autocomplete="address-level2" placeholder="Sua cidade" value="${quizData.cidade || ''}" />
          </div>

          <button type="submit" class="feira-btn-primary feira-btn-submit">
            Gerar meu diagnóstico →
          </button>
        </form>
      </div>
    `;

    updateTimer();

    document.getElementById('feira-lead-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const leadData = {
        nome: document.getElementById('lead-nome').value.trim(),
        telefone: document.getElementById('lead-telefone').value.trim(),
        email: document.getElementById('lead-email').value.trim(),
        cidade: document.getElementById('lead-cidade').value.trim(),
        consultor: consultorAtivo.nome,
        consultorId: consultorAtivo.id,
        capital: quizData.capital || '',
        objetivo: quizData.objetivo || '',
        evento: CONFIG.evento,
        timestamp: new Date().toISOString()
      };

      if (!leadData.nome || !leadData.telefone) {
        alert('Por favor, preencha nome e WhatsApp.');
        return;
      }

      enviarLead(leadData);
      showEncerramento(leadData);
    });
  }

  // --- TELA 6: Encerramento + QR Code ---
  function showEncerramento(leadData) {
    const overlay = document.getElementById('feira-overlay');
    const qrUrl = location.origin + location.pathname + '?ref=feiraabf&nome=' + encodeURIComponent(leadData.nome);

    overlay.innerHTML = `
      <div class="feira-screen feira-screen-fim">
        <img class="feira-logo-sm" src="assets/logo-full.png" alt="AVEND" />
        <h2 class="feira-fim-title">Obrigado, ${leadData.nome.split(' ')[0]}!</h2>
        <p class="feira-fim-sub">Escaneie o QR Code para acessar seu diagnóstico completo no celular</p>

        <div class="feira-qr-wrap" id="feira-qr-final"></div>

        <div class="feira-fim-info">
          <p>Seu consultor: <strong>${consultorAtivo.nome}</strong></p>
          <p>Entraremos em contato pelo WhatsApp informado.</p>
        </div>

        <button class="feira-btn-reset" id="feira-proximo">
          🔄 Próximo Investidor
        </button>
      </div>
    `;

    // Gerar QR Code
    try {
      if (typeof qrcode !== 'undefined') {
        const qrWrap = document.getElementById('feira-qr-final');
        const qr = qrcode(0, 'M');
        qr.addData(qrUrl);
        qr.make();
        qrWrap.innerHTML = qr.createSvgTag({ cellSize: 6, margin: 4 });
      }
    } catch(e) { console.warn('[qr]', e); }

    document.getElementById('feira-proximo').addEventListener('click', proximoInvestidor);
  }

  // ========== FUNÇÕES AUXILIARES ==========

  function goToSimulador() {
    const overlay = document.getElementById('feira-overlay');
    overlay.style.display = 'none';
    // Ativar aba simulador
    if (typeof activateTab === 'function') activateTab('simulador');
    // Adicionar botão flutuante para captura de lead
    addLeadButton();
  }

  function addLeadButton() {
    const btn = document.createElement('button');
    btn.id = 'feira-captura-float';
    btn.className = 'feira-btn-float';
    btn.innerHTML = '📋 Capturar Lead';
    btn.addEventListener('click', function() {
      const overlay = document.getElementById('feira-overlay');
      overlay.style.display = 'flex';
      showCapturaLead({});
    });
    document.body.appendChild(btn);

    // Botão reset
    const resetBtn = document.createElement('button');
    resetBtn.className = 'feira-btn-float feira-btn-float-reset';
    resetBtn.innerHTML = '🔄 Próximo';
    resetBtn.addEventListener('click', proximoInvestidor);
    document.body.appendChild(resetBtn);
  }

  function bindQuizRapido() {
    const quizData = {};
    let currentStep = 1;

    document.querySelectorAll('.feira-quiz-opt').forEach(btn => {
      btn.addEventListener('click', function() {
        const key = this.dataset.key;
        const value = this.dataset.value;
        quizData[key] = value;

        // Marcar selecionado
        this.closest('.feira-quiz-opts').querySelectorAll('.feira-quiz-opt').forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');

        // Avançar para próxima pergunta
        setTimeout(() => {
          currentStep++;
          document.querySelectorAll('.feira-quiz-step').forEach(s => s.classList.remove('active'));
          const next = document.querySelector(`[data-step="${currentStep}"]`);
          if (next) next.classList.add('active');
        }, 300);
      });
    });

    // Finalizar quiz
    document.getElementById('feira-quiz-finalizar').addEventListener('click', function() {
      quizData.cidade = document.getElementById('feira-cidade').value.trim();
      showCapturaLead(quizData);
    });
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
  }

  function updateTimer() {
    if (!atendimentoStart) return;
    const elapsed = Math.floor((Date.now() - atendimentoStart) / 1000);
    const remaining = Math.max(0, CONFIG.maxMinutos * 60 - elapsed);
    const min = Math.floor(remaining / 60);
    const sec = remaining % 60;
    const timerEl = document.getElementById('feira-timer');
    if (timerEl) {
      timerEl.textContent = `⏱ ${min}:${sec.toString().padStart(2, '0')}`;
      if (remaining <= 60) timerEl.classList.add('timer-warning');
    }
  }

  function enviarLead(data) {
    // Enviar para Google Sheets via Apps Script
    try {
      const payload = {
        type: 'feira_lead',
        sessionId: 'feira_' + Date.now().toString(36),
        ...data
      };

      if (CONFIG.telemetryEndpoint) {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon(CONFIG.telemetryEndpoint, blob);
      }
    } catch(e) {
      console.warn('[feira-lead]', e);
    }

    // Backup em localStorage
    try {
      const leads = JSON.parse(localStorage.getItem('feira-leads') || '[]');
      leads.push(data);
      localStorage.setItem('feira-leads', JSON.stringify(leads));
    } catch(e) {}
  }

  function proximoInvestidor() {
    // Limpar estado mas NÃO fazer reload loop
    if (timerInterval) clearInterval(timerInterval);
    atendimentoStart = null;

    // Limpar sessionStorage (não localStorage — mantém leads)
    try { sessionStorage.clear(); } catch(e) {}

    // Remover botões flutuantes
    const floats = document.querySelectorAll('.feira-btn-float');
    floats.forEach(f => f.remove());

    // Resetar overlay para splash
    const overlay = document.getElementById('feira-overlay');
    overlay.style.display = 'flex';
    showSplash();
  }

  // ========== EVENT DELEGATION ==========
  document.addEventListener('click', function(e) {
    // Seleção de consultor
    const consultorBtn = e.target.closest('.feira-consultor-btn');
    if (consultorBtn) {
      consultorAtivo = {
        id: consultorBtn.dataset.id,
        nome: consultorBtn.dataset.nome
      };
      showSplash();
    }
  });

  // Expor para debug
  window.FEIRA = { config: CONFIG, proximoInvestidor };
})();