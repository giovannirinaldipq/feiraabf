/* ============================================================
   MODO FEIRA - SCRIPTS OTIMIZADOS PARA ATENDIMENTO PRESENCIAL
   ============================================================ */

// Configuração para modo feira
const FEIRA_CONFIG = {
  // Tempo máximo por atendimento (em minutos)
  maxAtendimentoTime: 10,

  // Simular dados para demonstração rápida
  demoData: {
    frotaFinal: 8,
    lucroMensalFinal: 45000,
    paybackMeses: 14,
    patrimonioFinal: 228000
  },

  // Número do WhatsApp do atendente local
  consultorWhatsApp: "5517996003377",

  // URL do vídeo de apresentação rápida
  presentationVideo: "",

  // Habilitar modo demonstração
  demoMode: true
};

// Controle de tempo de atendimento
let atendimentoStart = Date.now();
let atendimentoTimer = null;

// Inicialização do modo feira
function initFeiraMode() {
  console.log('🎯 Modo Feira ABF ativado');

  // Resetar localStorage para novo atendimento
  resetForNextUser();

  // Remover telemetria em modo feira
  if (typeof TELEMETRY !== 'undefined') {
    TELEMETRY = undefined;
  }

  // Iniciar timer de atendimento
  startAtendimentoTimer();

  // Carregar dados de demonstração se necessário
  if (FEIRA_CONFIG.demoMode) {
    loadDemoData();
  }

  // Configurar botões de acesso rápido
  setupQuickAccess();

  // Otimizar performance
  optimizePerformance();
}

// Timer de atendimento
function startAtendimentoTimer() {
  const timerElement = document.createElement('div');
  timerElement.id = 'atendimento-timer';
  timerElement.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    background: rgba(255, 107, 107, 0.9);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    z-index: 1000;
    backdrop-filter: blur(10px);
  `;
  document.body.appendChild(timerElement);

  atendimentoTimer = setInterval(() => {
    const elapsed = Math.floor((Date.now() - atendimentoStart) / 1000 / 60);
    const remaining = Math.max(0, FEIRA_CONFIG.maxAtendimentoTime - elapsed);

    if (remaining <= 0) {
      timerElement.textContent = '⏰ Tempo esgotado!';
      timerElement.style.background = 'rgba(255, 0, 0, 0.9)';
    } else {
      timerElement.textContent = `⏱ ${remaining}min restantes`;
    }
  }, 1000);
}

// Carregar dados de demonstração
function loadDemoData() {
  console.log('📊 Carregando dados de demonstração');

  // Substituir dados do simulador
  if (typeof MODEL !== 'undefined') {
    MODEL.custoMaquinaAdicional = 23990;
    MODEL.custoPrimeiraMaquina = 55000;
  }

  // Preencher resultados rápidos
  setTimeout(() => {
    if (document.querySelector('.kpi-value')) {
      document.querySelector('.kpi-value').textContent = '14 meses';
    }
  }, 1000);
}

// Configurar botões de acesso rápido
function setupQuickAccess() {
  // Adicionar botão de demonstração
  const demoBtn = document.createElement('button');
  demoBtn.textContent = '🎯 Demo Rápida';
  demoBtn.className = 'btn-reset';
  demoBtn.style.cssText += 'left: 140px;';
  demoBtn.onclick = () => runQuickDemo();
  document.body.appendChild(demoBtn);

  // Adicionar botão de relatório
  const reportBtn = document.createElement('button');
  reportBtn.textContent = '📋 Gerar Relatório';
  reportBtn.className = 'btn-reset';
  reportBtn.style.cssText += 'left: 280px; background: #4CAF50;';
  reportBtn.onclick = generateReport;
  document.body.appendChild(reportBtn);
}

// Executar demonstração rápida
function runQuickDemo() {
  console.log('🚀 Iniciando demonstração rápida');

  // Simular navegação rápida
  document.getElementById('open-quiz-hero').click();

  // Preencher respostas do quiz automaticamente
  setTimeout(() => {
    const quizAnswers = {
      'meta': '15-50k',
      'capital': '300+',
      'atividade': 'empresario',
      'objetivo': 'viver-disso',
      'experiencia': 'sim',
      'perfil': 'conservador'
    };

    Object.keys(quizAnswers).forEach(questionId => {
      const answer = quizAnswers[questionId];
      const option = document.querySelector(`[data-value="${answer}"]`);
      if (option) {
        option.click();
      }
    });
  }, 2000);
}

// Gerar relatório do atendimento
function generateReport() {
  console.log('📋 Gerando relatório do atendimento');

  const atendimentoData = {
    tempoAtendimento: Math.floor((Date.now() - atendimentoStart) / 1000 / 60),
    data: new Date().toLocaleString('pt-BR'),
    consultor: 'Atendente AVEND',
    contato: `WhatsApp: ${FEIRA_CONFIG.consultorWhatsApp}`,
    resultado: 'Diagnóstico realizado com sucesso',
    proximosPassos: [
      'Agendamento de reunião',
      'Envio de proposta comercial',
      'Visita técnica ao ponto'
    ]
  };

  // Criar relatório em nova aba
  const reportContent = `
    <html>
      <head><title>Relatório Atendimento AVEND - Feira ABF</title></head>
      <body style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
        <h1>Relatório de Atendimento</h1>
        <p><strong>Data:</strong> ${atendimentoData.data}</p>
        <p><strong>Consultor:</strong> ${atendimentoData.consultor}</p>
        <p><strong>Tempo de atendimento:</strong> ${atendimentoData.tempoAtendimento} minutos</p>
        <p><strong>Contato:</strong> ${atendimentoData.contato}</p>
        <p><strong>Resultado:</strong> ${atendimentoData.resultado}</p>
        <h3>Próximos Passos:</h3>
        <ul>
          ${atendimentoData.proximosPassos.map(step => `<li>${step}</li>`).join('')}
        </ul>
        <button onclick="window.print()" style="background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Imprimir Relatório</button>
      </body>
    </html>
  `;

  const reportWindow = window.open('', '_blank');
  reportWindow.document.write(reportContent);
  reportWindow.document.close();
}

// Otimizar performance
function optimizePerformance() {
  console.log('⚡ Otimizando performance para feira');

  // Reduzir animações
  document.documentElement.style.setProperty('--ease-out-expo', 'cubic-bezier(0.4, 0, 0.2, 1)');

  // Pré-carregar recursos essenciais
  const essentialResources = [
    'assets/logo-full.png',
    'assets/og-image.png'
  ];

  essentialResources.forEach(resource => {
    const img = new Image();
    img.src = resource;
  });

  // Simplificar interface
  if (document.querySelector('.nav-sub')) {
    document.querySelector('.nav-sub').style.display = 'none';
  }
}

// Resetar para próximo usuário
function resetForNextUser() {
  try {
    localStorage.clear();
    sessionStorage.clear();
    console.log('🔄 Dados resetados para próximo usuário');
  } catch (e) {
    console.warn('Não foi possível resetar dados:', e);
  }
}

// Iniciar modo feira quando o documento estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFeiraMode);
} else {
  initFeiraMode();
}

// Exportar funções globais
window.FEIRA_MODE = {
  config: FEIRA_CONFIG,
  reset: resetForNextUser,
  demo: runQuickDemo,
  report: generateReport
};