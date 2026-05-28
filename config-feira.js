// =============================================
// CONFIGURAÇÃO RÁPIDA - MODO FEIRA ABF 2026
// =============================================

// Informações do evento
const EVENTO_INFO = {
  nome: "Feira ABF 2026",
  local: "São Paulo Expo",
  datas: "15-18 de novembro de 2026",
  estande: "A-123",
  contato: "atendimento@avend.com.br"
};

// Informações do atendente (para cada atendente)
const ATENDENTES = {
  // Adicione um objeto para cada atendente
  "joao": {
    nome: "João Silva",
    whatsapp: "5511999998888",
    email: "joao.silva@avend.com.br",
    foto: "atendentes/joao.jpg"
  },
  "maria": {
    nome: "Maria Santos",
    whatsapp: "5511999999999",
    email: "maria.santos@avend.com.br",
    foto: "atendentes/maria.jpg"
  }
};

// Configuração do modo feira
const FEIRA_CONFIG = {
  // Tempo máximo por atendimento (em minutos)
  maxAtendimentoTime: 10,

  // Número do WhatsApp principal (para backup)
  backupWhatsApp: "5517996003377",

  // Habilitar modo demonstração automático
  demoMode: true,

  // URL do vídeo de apresentação (opcional)
  presentationVideo: "",

  // Cor personalizada do evento
  eventColor: "#667eea",

  // Logo personalizada para o evento
  eventLogo: "assets/logo-full.png",

  // Mensagens personalizadas
  messages: {
    welcome: "Bem-vindo à Feira ABF 2026!",
    quickDemo: "Demonstração Rápida",
    generateReport: "Gerar Relatório",
    resetUser: "Resetar para Próximo",
    timeWarning: "⏰ Tempo esgotado!"
  },

  // Dados de demonstração (para casos sem internet)
  demoData: {
    frotaFinal: 8,
    lucroMensalFinal: 45000,
    paybackMeses: 14,
    patrimonioFinal: 228000,
    investimentoTotal: 195000
  },

  // Pré-configurações de diagnóstico
  quickPresets: {
    conservador: {
      capital: "100-300",
      meta: "ate-15k",
      perfil: "conservador"
    },
    moderado: {
      capital: "300+",
      meta: "15-50k",
      perfil: "moderado"
    },
    agressivo: {
      capital: "500+",
      meta: "50-150k",
      perfil: "agressivo"
    }
  }
};

// Funções de inicialização
function initFeiraMode() {
  console.log('🎯 Modo Feira ABF 2026 iniciado');

  // Aplicar configurações personalizadas
  applyCustomSettings();

  // Iniciar timers e controles
  startAtendimentoControls();

  // Configurar interface personalizada
  customizeInterface();

  // Setup de eventos
  setupEventHandlers();
}

// Aplicar configurações personalizadas
function applyCustomSettings() {
  // Aplicar cores do evento
  document.documentElement.style.setProperty('--event-color', FEIRA_CONFIG.eventColor);

  // Substituir mensagens padrão
  if (FEIRA_CONFIG.messages) {
    Object.keys(FEIRA_CONFIG.messages).forEach(key => {
      const elements = document.querySelectorAll(`[data-message="${key}"]`);
      elements.forEach(el => el.textContent = FEIRA_CONFIG.messages[key]);
    });
  }
}

// Iniciar controles de atendimento
function startAtendimentoControls() {
  // Criar elemento de timer
  const timer = document.createElement('div');
  timer.id = 'atendimento-timer';
  timer.className = 'atendimento-timer';
  timer.innerHTML = `
    <div class="timer-icon">⏱</div>
    <div class="timer-text">10:00</div>
  `;
  document.body.appendChild(timer);

  // Iniciar contador regressivo
  let timeLeft = FEIRA_CONFIG.maxAtendimentoTime * 60;
  const timerInterval = setInterval(() => {
    timeLeft--;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    timer.querySelector('.timer-text').textContent =
      `${minutes}:${seconds.toString().padStart(2, '0')}`;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timer.classList.add('timer-warning');
      timer.querySelector('.timer-text').textContent = FEIRA_CONFIG.messages.timeWarning;
    }
  }, 1000);
}

// Personalizar interface
function customizeInterface() {
  // Adicionar logo do evento
  const logo = document.querySelector('.brand-logo');
  if (logo && FEIRA_CONFIG.eventLogo) {
    logo.src = FEIRA_CONFIG.eventLogo;
  }

  // Adicionar informações do evento
  const eventInfo = document.createElement('div');
  eventInfo.className = 'event-info';
  eventInfo.innerHTML = `
    <div class="event-details">
      <span class="event-name">${EVENTO_INFO.nome}</span>
      <span class="event-location">${EVENTO_INFO.local} · Stand ${EVENTO_INFO.estande}</span>
    </div>
  `;
  document.querySelector('.topbar').appendChild(eventInfo);

  // Configurar botões rápidos
  setupQuickButtons();
}

// Configurar botões rápidos
function setupQuickButtons() {
  const quickButtons = document.createElement('div');
  quickButtons.className = 'quick-buttons';
  quickButtons.innerHTML = `
    <button class="quick-btn demo-btn" onclick="runQuickDemo()">
      <span class="btn-icon">🎯</span>
      <span class="btn-text">${FEIRA_CONFIG.messages.quickDemo}</span>
    </button>
    <button class="quick-btn report-btn" onclick="generateReport()">
      <span class="btn-icon">📋</span>
      <span class="btn-text">${FEIRA_CONFIG.messages.generateReport}</span>
    </button>
    <button class="quick-btn reset-btn" onclick="resetForNextUser()">
      <span class="btn-icon">🔄</span>
      <span class="btn-text">${FEIRA_CONFIG.messages.resetUser}</span>
    </button>
  `;
  document.body.appendChild(quickButtons);
}

// Setup de eventos
function setupEventHandlers() {
  // Detectar touch para dispositivos móveis
  if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
  }

  // Keyboard shortcuts para atendentes
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch(e.key) {
        case 'd':
          e.preventDefault();
          runQuickDemo();
          break;
        case 'r':
          e.preventDefault();
          generateReport();
          break;
        case 'n':
          e.preventDefault();
          resetForNextUser();
          break;
      }
    }
  });
}

// Funções de controle
function runQuickDemo() {
  console.log('🚀 Iniciando demonstração rápida');

  // Usar preset configurado
  const preset = FEIRA_CONFIG.quickPresets.moderado;

  // Simular respostas rápidas
  Object.keys(preset).forEach(key => {
    const element = document.querySelector(`[data-value="${preset[key]}"]`);
    if (element) {
      element.click();
    }
  });

  // Avançar para o próximo passo
  setTimeout(() => {
    const nextBtn = document.querySelector('#quiz-next');
    if (nextBtn) nextBtn.click();
  }, 1000);
}

function generateReport() {
  console.log('📋 Gerando relatório do atendimento');

  const reportData = {
    evento: EVENTO_INFO,
    data: new Date().toLocaleString('pt-BR'),
    tempoAtendimento: `${FEIRA_CONFIG.maxAtendimentoTime} minutos`,
    contato: `WhatsApp: ${FEIRA_CONFIG.backupWhatsApp}`,
    proximosPassos: [
      'Agendamento de reunião',
      'Envio de proposta comercial',
      'Visita técnica ao ponto'
    ]
  };

  // Abrir relatório em nova aba
  const reportWindow = window.open('', '_blank');
  reportWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Relatório Atendimento - ${EVENTO_INFO.nome}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
        .header { background: ${FEIRA_CONFIG.eventColor}; color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
        .info { margin-bottom: 15px; }
        .next-steps { background: #f5f5f5; padding: 15px; border-radius: 10px; }
        button { background: ${FEIRA_CONFIG.eventColor}; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Relatório de Atendimento</h1>
        <p>${EVENTO_INFO.nome} · Stand ${EVENTO_INFO.estande}</p>
      </div>

      <div class="info">
        <p><strong>Data:</strong> ${reportData.data}</p>
        <p><strong>Tempo de atendimento:</strong> ${reportData.tempoAtendimento}</p>
        <p><strong>Contato:</strong> ${reportData.contato}</p>
      </div>

      <div class="next-steps">
        <h3>Próximos Passos:</h3>
        <ul>
          ${reportData.proximosPassos.map(step => `<li>${step}</li>`).join('')}
        </ul>
      </div>

      <button onclick="window.print()">Imprimir Relatório</button>
    </body>
    </html>
  `);
  reportWindow.document.close();
}

function resetForNextUser() {
  console.log('🔄 Resetando para próximo usuário');

  // Limpar dados
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (e) {
    console.warn('Erro ao limpar dados:', e);
  }

  // Recarregar página
  location.reload();
}

// Inicialização automática
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFeiraMode);
} else {
  initFeiraMode();
}

// Exportar funções globais
window.FEIRA_ABF = {
  config: FEIRA_CONFIG,
  evento: EVENTO_INFO,
  init: initFeiraMode,
  demo: runQuickDemo,
  report: generateReport,
  reset: resetForNextUser
};