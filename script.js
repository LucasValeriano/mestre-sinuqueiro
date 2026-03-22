/* ============================================
   MESTRE SINUQUEIRO — Quiz Engine
   Copy baseada no estudo de ICP
   Falar ao ID → Convencer o Ego → Neutralizar o Superego
   ============================================ */

(function () {
  'use strict';

  // ---- Facebook Pixel helper ----
  function track(eventName, params) {
    if (typeof fbq === 'function') {
      fbq('trackCustom', eventName, params || {});
    }
  }
  function trackStandard(eventName, params) {
    if (typeof fbq === 'function') {
      fbq('track', eventName, params || {});
    }
  }

  // ---- Quiz Data — Perguntas espelham a jornada do ICP no boteco ----
  const questions = [
    {
      id: 1,
      label: 'Etapa 2 de 8',
      trackName: 'Quiz_01_Nivel_Atual',
      title: 'Como tá seu jogo hoje na sinuca?',
      options: [
        { text: 'Fraco — erro bola fácil na cara de todo mundo', points: 1 },
        { text: 'Mais ou menos — ganho de uns, perco de outros', points: 2 },
        { text: 'Razoável, mas trava na hora que aperta', points: 2 },
        { text: 'Bom, mas quero dominar de verdade', points: 3 },
      ],
    },
    {
      id: 2,
      label: 'Etapa 3 de 8',
      trackName: 'Quiz_02_Frequencia',
      title: 'Quantas vezes por semana você joga no bar?',
      options: [
        { text: 'Raramente — de vez em quando', points: 1 },
        { text: '1 a 2 vezes por semana', points: 2 },
        { text: '3 a 4 vezes — boteco é sagrado', points: 3 },
        { text: 'Quase todo dia', points: 3 },
      ],
    },
    {
      id: 3,
      label: 'Etapa 4 de 8',
      trackName: 'Quiz_03_Maior_Dificuldade',
      title: 'O que mais te atrapalha na mesa?',
      options: [
        { text: 'Mira — erro bolas que deveria acertar de olho fechado', points: 1 },
        { text: 'A bola branca — nunca para onde eu quero', points: 1 },
        { text: 'Tento efeito e a bola vai pra qualquer lugar', points: 2 },
        { text: 'Jogo uma bola por vez — sem pensar na próxima', points: 2 },
      ],
    },
    {
      id: 4,
      label: 'Etapa 5 de 8',
      trackName: 'Quiz_04_Tentou_Melhorar',
      title: 'Você já tentou melhorar seu jogo?',
      options: [
        { text: 'Nunca — aprendi tudo na raça, jogando', points: 1 },
        { text: 'Já vi uns vídeos no YouTube, mas não adiantou', points: 2 },
        { text: 'Tentei copiar jogada de craque e passei vergonha', points: 1 },
        { text: 'Treino às vezes, mas não sei se tô no caminho certo', points: 2 },
      ],
    },
    {
      id: 5,
      label: 'Etapa 6 de 8',
      trackName: 'Quiz_05_Desejo_Principal',
      title: 'O que você mais quer conquistar na sinuca?',
      options: [
        { text: 'Parar de passar vergonha e jogar com confiança', points: 1 },
        { text: 'Ser o cara que todo mundo quer ver jogar no bar', points: 2 },
        { text: 'Ganhar as apostas que eu sempre perco', points: 2 },
        { text: 'Dominar a mesa — controle total do jogo', points: 3 },
      ],
    },
    {
      id: 6,
      label: 'Etapa 7 de 8',
      trackName: 'Quiz_06_Maior_Frustracao',
      title: 'Qual dessas situações mais te irrita?',
      options: [
        { text: 'Errar uma bola ridícula na frente da galera', points: 1 },
        { text: 'Perder aposta pro cara que você sabe que joga menos', points: 2 },
        { text: 'Ver o craque do bar fazendo jogada que você não consegue', points: 2 },
        { text: 'Jogar há anos e nunca sair do mesmo nível', points: 1 },
      ],
    },
  ];

  // ---- Perfis de diagnóstico — baseados na análise psicanalítica do ICP ----
  const results = [
    {
      min: 0,
      max: 9,
      icon: '😤',
      level: 'Jogador Travado',
      description: 'Você joga no olho, sem método nenhum. Cada partida é uma roleta — às vezes acerta, na maioria das vezes erra. E a galera percebe.',
      headline: 'Agora ficou claro por que você ainda toma goleada no bar',
      subheadline: 'Não é falta de talento. É que ninguém nunca te mostrou o jeito certo de jogar. Assista o vídeo abaixo e entenda como virar esse jogo em poucos dias.',
    },
    {
      min: 10,
      max: 15,
      icon: '🔥',
      level: 'Potencial Desperdiçado',
      description: 'Você tem jogo, mas está jogando por instinto quando deveria jogar com método. Seu potencial tá sendo desperdiçado — e no fundo, você sabe disso.',
      headline: 'Você joga por instinto quando deveria jogar com um segredo',
      subheadline: 'Os craques do bar têm algo que você não tem: método. Assista o vídeo abaixo e descubra o que eles sabem — e nunca te contaram.',
    },
    {
      min: 16,
      max: 21,
      icon: '🏆',
      level: 'Quase Craque',
      description: 'Você joga acima da média, mas faltam os detalhes que separam quem "joga bem" de quem domina a mesa. Os truques que fazem a diferença.',
      headline: 'Faltam os truques finais pra você virar o craque do bar',
      subheadline: 'Controle absoluto da branca, leitura de mesa e os efeitos que impressionam. Assista o vídeo abaixo e veja como chegar lá.',
    },
  ];

  // ---- State ----
  let currentScreen = 0;
  let totalScore = 0;
  const totalSteps = 8;

  // ---- DOM ----
  const progressBar = document.getElementById('progress-bar');
  const progressFill = document.getElementById('progress-fill');
  const progressLabel = document.getElementById('progress-label');
  const quizSection = document.getElementById('quiz-section');
  const landingPage = document.getElementById('landing-page');
  const screens = document.querySelectorAll('.screen');
  const startBtn = document.getElementById('btn-start');

  // ---- Progress ----
  function updateProgress(step) {
    const pct = (step / (totalSteps - 1)) * 100;
    progressFill.style.width = pct + '%';
    if (step === 0) {
      progressLabel.style.opacity = '0';
    } else if (step < totalSteps - 1) {
      progressLabel.style.opacity = '1';
      progressLabel.textContent = 'Etapa ' + (step + 1) + ' de ' + totalSteps;
    } else {
      progressLabel.textContent = '✓ Completo';
    }
  }

  // ---- Screen Transitions ----
  function goToScreen(nextIndex) {
    const current = screens[currentScreen];
    const next = screens[nextIndex];
    current.classList.add('slide-out');
    setTimeout(() => {
      current.classList.remove('active', 'slide-out');
      next.classList.add('slide-in', 'active');
      void next.offsetWidth;
      next.classList.remove('slide-in');
      currentScreen = nextIndex;
      updateProgress(currentScreen);
    }, 280);
  }

  // ---- Render Questions ----
  function initQuestions() {
    questions.forEach((q, i) => {
      const screenIndex = i + 1;
      const screen = screens[screenIndex];
      if (!screen) return;

      screen.querySelector('.question-number').textContent = q.label;
      screen.querySelector('.question-title').textContent = q.title;

      const grid = screen.querySelector('.options-grid');
      grid.innerHTML = '';

      q.options.forEach((opt) => {
        const card = document.createElement('button');
        card.className = 'option-card';
        card.type = 'button';
        card.innerHTML = `
          <span class="option-indicator"></span>
          <span class="option-label">${opt.text}</span>
        `;
        card.addEventListener('click', () => {
          if (grid.querySelector('.selected')) return;
          grid.querySelectorAll('.option-card').forEach((c) => c.classList.remove('selected'));
          card.classList.add('selected', 'shake');
          totalScore += opt.points;

          // Track each question answered with unique name
          track(q.trackName, {
            step: screenIndex,
            answer: opt.text
          });
          setTimeout(() => {
            card.classList.remove('shake');
            if (screenIndex < questions.length) {
              goToScreen(screenIndex + 1);
            } else {
              showLandingPage();
            }
          }, 550);
        });
        grid.appendChild(card);
      });
    });
  }

  // ---- Show Landing Page ----
  function showLandingPage() {
    const result =
      results.find((r) => totalScore >= r.min && totalScore <= r.max) ||
      results[results.length - 1];

    document.getElementById('diag-icon').textContent = result.icon;
    document.getElementById('diag-level-name').textContent = result.level;
    document.getElementById('diag-description').textContent = result.description;
    document.getElementById('fold-headline').textContent = result.headline;
    document.getElementById('fold-subheadline').textContent = result.subheadline;

    // Track quiz completion
    track('QuizCompleted', {
      result: result.level,
      score: totalScore
    });
    trackStandard('Lead');

    const lastScreen = screens[currentScreen];
    lastScreen.classList.add('slide-out');

    setTimeout(() => {
      quizSection.classList.add('hidden');
      progressBar.classList.add('hidden');
      progressLabel.classList.add('hidden');
      landingPage.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 350);
  }

  // ---- Sales Notifications — nomes e cidades do ICP ----
  const salesData = [
    { name: 'Carlos', city: 'Campinas, SP' },
    { name: 'Marcelo', city: 'Uberlândia, MG' },
    { name: 'José Roberto', city: 'Goiânia, GO' },
    { name: 'Anderson', city: 'Campo Grande, MS' },
    { name: 'Reginaldo', city: 'Londrina, PR' },
    { name: 'Cláudio', city: 'Ribeirão Preto, SP' },
    { name: 'Edson', city: 'Juiz de Fora, MG' },
    { name: 'Wagner', city: 'Curitiba, PR' },
    { name: 'Ademir', city: 'Bauru, SP' },
    { name: 'Ronaldo', city: 'Aparecida de Goiânia, GO' },
    { name: 'Sérgio', city: 'Sorocaba, SP' },
    { name: 'Marcos', city: 'Contagem, MG' },
    { name: 'Gilberto', city: 'São José do Rio Preto, SP' },
    { name: 'Valdir', city: 'Dourados, MS' },
    { name: 'Luiz', city: 'Maringá, PR' },
    { name: 'Roberto', city: 'Uberaba, MG' },
  ];

  const notifEl = document.getElementById('sales-notification');
  const notifAvatar = notifEl.querySelector('.notif-avatar');
  const notifStrong = notifEl.querySelector('.notif-text strong');
  const notifTime = notifEl.querySelector('.notif-time');

  let notifTimer;
  function showSalesNotification() {
    const person = salesData[Math.floor(Math.random() * salesData.length)];
    const minutes = Math.floor(Math.random() * 15) + 1;
    notifAvatar.textContent = person.name.charAt(0);
    notifStrong.textContent = person.name + ' — ' + person.city;
    notifTime.textContent = 'há ' + minutes + ' min';
    notifEl.classList.add('show');
    setTimeout(() => notifEl.classList.remove('show'), 4000);
    const delay = (Math.floor(Math.random() * 8) + 8) * 1000;
    notifTimer = setTimeout(showSalesNotification, delay);
  }

  // ---- CTA tracking ----
  document.addEventListener('click', (e) => {
    const cta = e.target.closest('#btn-cta, #btn-anchor-vsl');
    if (cta) {
      trackStandard('InitiateCheckout', { value: 47, currency: 'BRL' });
    }
  });

  // ---- FAQ accordion ----
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.faq-question');
    if (!btn) return;
    const item = btn.closest('.faq-item');
    const wasOpen = item.classList.contains('open');
    // close all
    document.querySelectorAll('.faq-item.open').forEach((el) => el.classList.remove('open'));
    // toggle clicked
    if (!wasOpen) item.classList.add('open');
  });

  // ---- Init ----
  function init() {
    initQuestions();
    updateProgress(0);
    startBtn.addEventListener('click', () => {
      track('QuizStarted');
      goToScreen(1);
      setTimeout(showSalesNotification, 12000);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
