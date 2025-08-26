// file: client-embed.js
(function () {
  // Grab attributes from the current <script> tag
  var s = document.currentScript || (function(){
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  function parseArray(json) {
    try { return JSON.parse(json); } catch { return []; }
  }

  // Build ChatWidgetConfig for chat-widget.js to consume
  window.ChatWidgetConfig = {
    webhook: {
      url: s.getAttribute('data-webhook') || '',
      route: s.getAttribute('data-route') || ''
    },
    branding: {
      logo: s.getAttribute('data-logo') || '',
      name: s.getAttribute('data-brand-name') || 'Assistant',
      welcomeText: s.getAttribute('data-welcome') || 'Hi! How can I help?',
      responseTimeText: s.getAttribute('data-responsetime') || '',
      poweredBy: {
        text: s.getAttribute('data-powered-text') || 'Powered by',
        link: s.getAttribute('data-powered-link') || '#'
      }
    },
    style: {
      position: (s.getAttribute('data-position') || 'right'),
      backgroundColor: s.getAttribute('data-bg') || '#ffffff',
      fontColor: s.getAttribute('data-font') || '#0b1220',
      primaryColor: s.getAttribute('data-primary') || '#000000',   // black
      secondaryColor: s.getAttribute('data-secondary') || '#a3863b' // gold
    },
    suggestedQuestions: parseArray(s.getAttribute('data-suggested') || '[]')
  };

  // Load your widget file
  var w = document.createElement('script');
  w.src = (s.getAttribute('data-src') || 'https://robofish89.github.io/ai-web-chatbot/chat-widget.js') + '?v=embed1';
  w.defer = true;
  document.head.appendChild(w);
})();
