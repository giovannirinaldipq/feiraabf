# 🎯 Modo Feira ABF - Instruções de Uso

## Visão Geral
O site foi otimizado para atendimento presencial em feiras de franquias, especialmente a ABF 2026. O modo feira oferece recursos específicos para atendentes usarem em tablets durante o evento.

## 🚀 Como Acessar o Modo Feira

### Método 1: Via Parâmetro de URL
```
https://giovannirinaldipq.github.io/feiraabf/?feira=true
```

### Método 2: Via Hash
```
https://giovannirinaldipq.github.io/feiraabf/#feira
```

### Método 3: Via User Agent
Configurar o tablet com user agent contendo "FeiraABF".

## 🎨 Recursos Disponíveis no Modo Feira

### 1. Tela de Apresentação Rápida
- **Design moderno e atraente**
- **Estatísticas rápidas** (100+ franqueados, 14 estados, payback 12-18 meses)
- **Diferenciais** (sem funcionários, 24/7, escalável)
- **CTAs claros** (Começar Diagnóstico, Ver Simulador)
- **Contato com atendente** (WhatsApp direto)

### 2. Interface Otimizada para Touch
- **Botões maiores** (44px mínimo)
- **Sliders fáceis de usar** (32px de toque)
- **Navegação simplificada**
- **Sem elementos complexos**

### 3. Controle de Tempo de Atendimento
- **Timer visível** (10 minutos máximo)
- **Alerta quando tempo esgotar**
- **Reset automático entre usuários**

### 4. Botões de Acesso Rápido
- **🔄 Resetar**: Limpa dados para próximo usuário
- **🎯 Demo Rápida**: Simula diagnóstico automático
- **📋 Gerar Relatório**: Cria relatório do atendimento

## 📱 Funcionalidades por Dispositivo

### Tablets (Recomendado)
- Interface touch-otimizada
- Tela de apresentação em modo paisagem
- Botões fáceis de tocar

### Smartphones
- Interface responsiva
- Tela de apresentação em modo retrato
- Navegação simplificada

### Desktop (Para preparação)
- Modo de administração
- Acesso completo a todas as funcionalidades

## 🔧 Configurações Personalizáveis

### Arquivo: `feira-mode.js`

```javascript
const FEIRA_CONFIG = {
  maxAtendimentoTime: 10,           // Tempo máximo em minutos
  consultorWhatsApp: "5517996003377", // Número do atendente
  demoMode: true,                  // Habilitar demonstração
  presentationVideo: ""            // URL do vídeo de apresentação
};
```

### Personalização de Cores
Editar arquivo `feira-mode.css`:
```css
.feira-mode {
  --accent-cyan: #00E5D0;         /* Cor principal */
  --text: #1a1a1a;               /* Cor do texto */
  /* ... outras variáveis */
}
```

## 📊 Relatórios e Dados

### Gerar Relatório do Atendimento
1. Clique em "📋 Gerar Relatório"
2. Nova aba com relatório formatado
3. Inclui: tempo de atendimento, contato, próximos passos
4. Opção de imprimir

### Dados de Demonstração
O modo feira inclui dados simulados para demonstrações rápidas:
- Frota final: 8 máquinas
- Lucro mensal: R$ 45.000
- Payback: 14 meses
- Patrimônio: R$ 228.000

## 🎮 Como Usar na Prática

### Passo a Passo do Atendente

1. **Iniciar Atendimento**
   ```
   Acesse: ?feira=true
   ```

2. **Apresentação Rápida**
   - Mostre a tela inicial (30 segundos)
   - Destaque estatísticas principais
   - Explique diferenciais

3. **Diagnóstico Personalizado**
   - Clique em "Começar Diagnóstico"
   - Auxilie o investidor a responder
   - Use "Demo Rápida" para demonstração

4. **Resultado**
   - Mostre o plano sugerido
   - Explic os números-chave
   - Ofereça contato via WhatsApp

5. **Fechar Atendimento**
   - Clique em "Resetar" para próximo usuário
   - Gere relatório se necessário

## 🚨 Dicas Importantes

### Performance
- **Internet**: Conexão estável recomendada
- **Hardware**: Tablets modernos (iOS/Android)
- **Bateria**: Carregar completamente antes do evento

### Segurança
- **Dados**: Nenhum dado sensível é armazenado
- **Privacidade**: GDPR compliant
- **Backup**: Sem necessidade de conexão constante

### Atendimento
- **Tempo**: Máximo 10 minutos por atendimento
- **Foco** Qualidade > Quantidade
- **Follow-up**: Usar WhatsApp para continuidade

## 📱 Recomendações por Dispositivo

### iPad (Ideal)
- Usar iPad Pro 11" ou 12.9"
- Safari navegador nativo
- Modo paisagem para apresentação

### Android Tablet
- Chrome navegador
- Modo desktop se disponível
- Ajustar tamanho de texto

### Surface/Tablet Windows
- Edge navegador
- Modo touch otimizado
- Suporte a stylus (opcional)

## 🎯 Métricas de Sucesso

### Indicadores de Performance
- **Tempo médio por atendimento**: 5-8 minutos
- **Taxa de conversão**: Meta 15-20%
- **Satisfação**: Feedback verbal do investidor
- **Follow-up**: Meta 70% via WhatsApp

### Relatórios Disponíveis
- Tempo total de atendimento
- Número de diagnósticos realizados
- Conversões geradas
- Feedback coletado

## 🚀 Próximos Passos

1. **Testar** o modo feira antes do evento
2. **Treinar** os atendentes nas funcionalidades
3. **Preparar** tablets com carregadores
4. **Configurar** WhatsApp do atendente local
5. **Preparar** material de apoio físico

---

**Última atualização**: Novembro/2024  
**Versão**: 1.0  
**Suporte**: suporte@grupoavend.com.br