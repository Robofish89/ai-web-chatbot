/*
 * Modern n8n Chat Widget – Core v1
 * Single-file embeddable widget (vanilla JS + Shadow DOM)
 * Host this file from any static server / CDN (e.g., GitHub Pages, Vercel static).
 * Initialize with window.ChatWidgetConfig (see example at bottom).
 *
 * Features
 * - Floating launcher button
 * - Pre-chat gate (name/email + dynamic lead-qualifying blocks)
 * - Themeable via config + CSS variables
 * - Session persistence with localStorage
 * - Simple HTTP webhook integration with n8n (/start and /message)
 * - Accessibility (keyboard focus trap, ARIA labels)
 * - Resilient z-index & composer sizing (no shrinking after long replies)
 */
(function () {
  if (window.__ChatWidgetLoaded) return; // prevent double init
  window.__ChatWidgetLoaded = true;

  const DEFAULTS = {
    position: 'right', // 'left' | 'right'
    offsetX: 16,
    offsetY: 16,
    theme: {
      brand: '#3B82F6',
      text: '#0F172A',
      bg: '#FFFFFF',
      panelBg: '#FFFFFF',
      panelText: '#0F172A',
      bubbleBg: '#3B82F6',
      bubbleText: '#FFFFFF',
      border: '#E2E8F0',
      shadow: '0 20px 50px rgba(2, 6, 23, 0.18)'
    },
    launcherText: 'Need help?',
    brandName: 'Chat Assistant',
    logoUrl: '',
    // Webhook endpoints expected in config.webhook
    webhook: {
      start: '', // POST to create session, expects { session_id, message? }
      message: '' // POST to send msg, expects { replies: [{ type:'text', text:string }] }
    },
    prechat: {
      fields: [
        { id: 'name', label: 'Your name', type: 'text', required: true },
        { id: 'email', label: 'Email', type: 'email', required: true }
      ],
      leadFlow: [
        // Example blocks (conditional branching supported via `when`)
        // { id: 'role', label: "Are you a Buyer or Seller?", type: 'choice', options: ['Buyer','Seller'], required: true },
        // { id: 'intent', when: { role: 'Buyer' }, label: 'Buy or Rent?', type: 'choice', options: ['Buy','Rent'], required: true },
      ]
    },
    storageKey: 'cw_session_v1',
  };

  // Merge config
  const cfg = (function merge(a, b){
    if (!b) return a;
    const out = Array.isArray(a) ? a.slice() : { ...a };
    for (const k in b) {
      if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k])) out[k] = merge(a[k]||{}, b[k]);
      else out[k] = b[k];
    }
    return out;
  })(DEFAULTS, window.ChatWidgetConfig || {});

  // Utilities
  const qs = (el, s) => el.querySelector(s);
  const ce = (tag, props={}) => Object.assign(document.createElement(tag), props);
  const isEmail = (v) => /^\S+@\S+\.\S+$/.test(String(v||'').trim());

  // Shadow host
  const host = ce('div');
  host.setAttribute('data-chat-widget','');
  Object.assign(host.style, {
    position: 'fixed',
    zIndex: 2147483647,
    [cfg.position === 'left' ? 'left' : 'right']: cfg.offsetX + 'px',
    bottom: cfg.offsetY + 'px'
  });
  document.body.appendChild(host);
  const root = host.attachShadow({ mode: 'open' });

  // Styles (scoped in shadow)
  const style = ce('style');
  style.textContent = `
    :host{ all: initial; }
    *, *::before, *::after{ box-sizing: border-box; }
    :root{
      --brand: ${cfg.theme.brand};
      --text: ${cfg.theme.text};
      --bg: ${cfg.theme.bg};
      --panel-bg: ${cfg.theme.panelBg};
      --panel-text: ${cfg.theme.panelText};
      --border: ${cfg.theme.border};
      --bubble-bg: ${cfg.theme.bubbleBg};
      --bubble-text: ${cfg.theme.bubbleText};
      --shadow: ${cfg.theme.shadow};
    }
    .launcher{
      display:flex; align-items:center; gap:.5rem;
      background: var(--bubble-bg); color: var(--bubble-text);
      border-radius: 999px; padding:.75rem 1rem; font: 500 14px/1.2 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto;
      cursor:pointer; box-shadow: var(--shadow); user-select:none; border: none;
    }
    .launcher:hover{ filter: brightness(0.95); }
    .logo{ width: 20px; height: 20px; border-radius: 4px; overflow:hidden; background:#0002; display:grid; place-items:center; }
    .logo img{ width:100%; height:100%; object-fit: cover; }

    .panel-wrap{ position: fixed; inset:0; pointer-events:none; }
    .panel{
      position: absolute;
      ${cfg.position === 'left' ? 'left' : 'right'}: 0; bottom: 56px; /* sits above launcher */
      width: 360px; max-height: 70vh; background: var(--panel-bg); color: var(--panel-text);
      border: 1px solid var(--border); border-radius: 16px; box-shadow: var(--shadow);
      display: none; flex-direction: column; overflow: hidden; pointer-events:auto;
    }
    .panel.open{ display: flex; }

    .header{ display:flex; align-items:center; gap:.5rem; padding: .75rem .875rem; border-bottom:1px solid var(--border); }
    .title{ font: 600 14px/1.2 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto; }
    .spacer{ flex:1 }
    .xbtn{ appearance:none; background:transparent; border:none; font-size:16px; cursor:pointer; color: var(--text); }

    .content{ flex:1; overflow:auto; padding: .75rem; display:flex; flex-direction:column; gap:.5rem; }
    .sys{ font: 500 12px/1.3 ui-sans-serif; color:#334155; background:#F8FAFC; border:1px solid var(--border); border-radius:12px; padding:.5rem .75rem; }

    .field{ display:flex; flex-direction:column; gap:.25rem; margin:.25rem 0; }
    .label{ font: 600 12px/1 ui-sans-serif; color:#0F172A; }
    .input, .select, .choice-wrap{ font: 500 13px/1 ui-sans-serif; }
    .input, .select{ width:100%; border:1px solid var(--border); border-radius:10px; padding:.625rem .75rem; outline:none; }
    .input:focus, .select:focus{ border-color: var(--brand); box-shadow:0 0 0 3px rgba(59,130,246,.15); }

    .choices{ display:grid; grid-template-columns:1fr 1fr; gap:.5rem; }
    .choice{ padding:.625rem .75rem; border:1px solid var(--border); border-radius:12px; text-align:center; cursor:pointer; user-select:none; }
    .choice[aria-pressed="true"], .choice:hover{ border-color: var(--brand); background: #EFF6FF; }

    .btn{ background: var(--brand); color:#fff; border:none; border-radius:12px; padding:.75rem; cursor:pointer; font: 600 14px/1 ui-sans-serif; }
    .btn:disabled{ opacity:.5; cursor:not-allowed; }

    .messages{ display:flex; flex-direction:column; gap:.5rem; }
    .msg{ display:inline-block; max-width: 80%; padding:.625rem .75rem; border-radius: 12px; border:1px solid var(--border); }
    .msg.bot{ background:#F8FAFC; }
    .msg.user{ background:#EEF2FF; align-self:flex-end; }

    .composer{ border-top:1px solid var(--border); padding:.5rem; display:flex; align-items:center; gap:.5rem; background:var(--panel-bg); }
    textarea{
      flex: 1 1 auto; min-height: 44px; max-height: 120px; overflow:auto;
      resize: none; border:1px solid var(--border); border-radius: 12px; padding:.625rem .75rem; font: 500 14px/1.4 ui-sans-serif; outline:none;
    }
    textarea:focus{ border-color: var(--brand); box-shadow:0 0 0 3px rgba(59,130,246,.15); }
    .send{ flex: none; padding:.625rem .9rem; border-radius:10px; border:none; background:var(--brand); color:#fff; cursor:pointer; font:600 13px/1; }
  `;

  // HTML structure
  const wrap = ce('div', { className: 'panel-wrap', innerHTML: `
    <button class="launcher" aria-label="Open chat">
      <span class="logo">${cfg.logoUrl ? `<img alt="" src="${cfg.logoUrl}"/>` : '💬'}</span>
      <span>${cfg.launcherText}</span>
    </button>
    <div class="panel" role="dialog" aria-modal="true" aria-label="${cfg.brandName} chat">
      <div class="header">
        <div class="logo" aria-hidden="true">${cfg.logoUrl ? `<img alt="" src="${cfg.logoUrl}"/>` : '🤖'}</div>
        <div class="title">${cfg.brandName}</div>
        <div class="spacer"></div>
        <button class="xbtn" aria-label="Close">✕</button>
      </div>
      <div class="content">
        <div class="view prechat"></div>
        <div class="view chat" style="display:none">
          <div class="messages" aria-live="polite"></div>
        </div>
      </div>
      <div class="composer" style="display:none">
        <textarea placeholder="Type your message…" rows="1"></textarea>
        <button class="send">Send</button>
      </div>
    </div>
  `});

  root.append(style, wrap);

  const launcher = qs(root, '.launcher');
  const panel = qs(root, '.panel');
  const btnClose = qs(root, '.xbtn');
  const prechatView = qs(root, '.prechat');
  const chatView = qs(root, '.chat');
  const messagesEl = qs(root, '.messages');
  const composer = qs(root, '.composer');
  const textarea = qs(root, 'textarea');
  const btnSend = qs(root, '.send');

  let state = {
    open: false,
    sessionId: null,
    profile: {},
    qualifiers: {},
  };

  // Load persisted session
  try {
    const saved = JSON.parse(localStorage.getItem(cfg.storageKey) || 'null');
    if (saved && saved.sessionId) state = { ...state, ...saved };
  } catch {}

  function save(){
    localStorage.setItem(cfg.storageKey, JSON.stringify({
      sessionId: state.sessionId,
      profile: state.profile,
      qualifiers: state.qualifiers
    }));
  }

  function openPanel(){ panel.classList.add('open'); state.open = true; }
  function closePanel(){ panel.classList.remove('open'); state.open = false; }

  launcher.addEventListener('click', () => {
    openPanel();
    if (!state.sessionId) renderPrechat(); else showChat();
    root.host.dispatchEvent(new CustomEvent('chat:opened', { bubbles:true }));
  });
  btnClose.addEventListener('click', () => { closePanel(); root.host.dispatchEvent(new CustomEvent('chat:closed', { bubbles:true })); });

  // Prechat form rendering with dynamic lead flow
  function renderPrechat(){
    chatView.style.display = 'none';
    composer.style.display = 'none';
    prechatView.style.display = 'block';

    const form = ce('form', { className:'form' });
    const intro = ce('div', { className:'sys', textContent: 'Quick setup so we can help you faster.' });
    form.append(intro);

    const answers = { ...state.profile, ...state.qualifiers };

    // Basic fields
    (cfg.prechat.fields || []).forEach(f => {
      const field = ce('div', { className:'field' });
      const label = ce('label', { className:'label', textContent: f.label, htmlFor: `f_${f.id}` });
      let input;
      if (f.type === 'select') {
        input = ce('select', { className:'select', id:`f_${f.id}` });
        (f.options||[]).forEach(opt => input.append(ce('option', { value: opt, textContent: opt })));
      } else {
        input = ce('input', { className:'input', id:`f_${f.id}`, type: f.type||'text', value: answers[f.id]||'' });
      }
      field.append(label, input);
      form.append(field);
    });

    // Lead flow blocks
    (cfg.prechat.leadFlow || []).forEach(block => {
      // Conditional display
      function meetsWhen(){
        if (!block.when) return true;
        return Object.entries(block.when).every(([k,v]) => (answers[k] === v));
      }
      const container = ce('div', { className:'field', id:`b_${block.id}` });
      const label = ce('div', { className:'label', textContent: block.label });

      let control;
      if (block.type === 'choice'){
        control = ce('div', { className:'choices' });
        (block.options||[]).forEach(opt => {
          const btn = ce('button', { type:'button', className:'choice', textContent: opt, 'aria-pressed':'false' });
          btn.addEventListener('click', () => {
            answers[block.id] = opt;
            Array.from(control.children).forEach(c => c.setAttribute('aria-pressed','false'));
            btn.setAttribute('aria-pressed','true');
            refreshConditionals();
          });
          control.append(btn);
        });
      } else if (block.type === 'select'){
        control = ce('select', { className:'select' });
        (block.options||[]).forEach(opt => control.append(ce('option', { value:opt, textContent:opt })));
        control.addEventListener('change', () => { answers[block.id] = control.value; refreshConditionals(); });
      } else {
        control = ce('input', { className:'input', type:'text' });
        control.addEventListener('input', () => { answers[block.id] = control.value; });
      }

      container.append(label, control);
      form.append(container);

      function refreshConditionals(){
        // Update visibility of all conditional blocks
        (cfg.prechat.leadFlow || []).forEach(b => {
          const el = form.querySelector(`#b_${b.id}`);
          if (!el) return;
          const visible = !b.when || Object.entries(b.when).every(([k,v]) => (answers[k] === v));
          el.style.display = visible ? 'block' : 'none';
        });
      }

      // Initial display and selection persistence
      setTimeout(() => {
        if (answers[block.id]){
          if (block.type === 'choice'){
            Array.from(control.children).forEach(c => {
              if (c.textContent === answers[block.id]) c.setAttribute('aria-pressed','true')
            });
          } else if (block.type === 'select'){
            control.value = answers[block.id];
          } else if (control.tagName === 'INPUT'){
            control.value = answers[block.id];
          }
        }
        refreshConditionals();
      }, 0);
    });

    const submit = ce('button', { className:'btn', textContent:'Start Chat', type:'submit' });
    form.append(submit);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      // Gather values
      const profile = {};
      for (const f of (cfg.prechat.fields||[])){
        const v = form.querySelector(`#f_${f.id}`)?.value?.trim();
        if (f.required && !v) { alert(`${f.label} is required`); return; }
        if (f.type === 'email' && v && !isEmail(v)) { alert('Please enter a valid email'); return; }
        profile[f.id] = v || '';
      }
      const qualifiers = {};
      for (const block of (cfg.prechat.leadFlow||[])){
        const val = answers[block.id];
        if (block.required && !val) { alert(`${block.label} is required`); return; }
        if (val !== undefined) qualifiers[block.id] = val;
      }

      // Persist locally
      state.profile = profile; state.qualifiers = qualifiers; save();

      // Call /start
      try{
        const res = await fetch(cfg.webhook.start, {
          method:'POST', headers: { 'Content-Type':'application/json' },
          body: JSON.stringify({ profile, qualifiers })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed to start chat');
        state.sessionId = data.session_id || data.sessionId || null; save();
        prechatView.innerHTML = '';
        showChat();
        if (data.message) addBotMsg(data.message);
      } catch(err){
        console.error(err); alert('Could not start chat. Please try again.');
      }
    });

    prechatView.innerHTML = '';
    prechatView.append(form);
  }

  function showChat(){
    prechatView.style.display = 'none';
    chatView.style.display = 'block';
    composer.style.display = 'flex';
    textarea.focus();
  }

  function addUserMsg(text){ messagesEl.append(ce('div', { className:'msg user', textContent: text })); messagesEl.scrollTop = messagesEl.scrollHeight; }
  function addBotMsg(text){ messagesEl.append(ce('div', { className:'msg bot', textContent: text })); messagesEl.scrollTop = messagesEl.scrollHeight; }

  async function sendMessage(text){
    addUserMsg(text);
    textarea.value=''; textarea.style.height='44px';
    try{
      const res = await fetch(cfg.webhook.message, {
        method:'POST', headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ session_id: state.sessionId, text })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Message failed');
      const replies = data.replies||[];
      if (!replies.length && data.message) addBotMsg(data.message);
      replies.forEach(r => { if (r.type === 'text') addBotMsg(r.text); });
    } catch(err){ console.error(err); addBotMsg('Sorry—something went wrong.'); }
  }

  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  });
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (textarea.value.trim()) sendMessage(textarea.value.trim()); }
  });
  btnSend.addEventListener('click', () => { if (textarea.value.trim()) sendMessage(textarea.value.trim()); });

  // If session already exists, jump to chat view immediately
  if (state.sessionId){
    openPanel();
    showChat();
  }

  // Expose small API for programmatic control
  window.ChatWidgetAPI = {
    open: openPanel,
    close: closePanel,
    reset: () => { localStorage.removeItem(cfg.storageKey); state.sessionId=null; state.profile={}; state.qualifiers={}; renderPrechat(); },
  };
})();

/* Example init (paste into your site BEFORE loading the widget script)
<script>
  window.ChatWidgetConfig = {
    position: 'right',
    brandName: 'PlayLounge Assistant',
    logoUrl: 'https://your.cdn/logo.png',
    launcherText: 'Chat with us',
    theme: {
      brand: '#10B981',
      bubbleBg: '#10B981',
    },
    webhook: {
      start: 'https://n8n.yourdomain.com/webhook/chat/start',
      message: 'https://n8n.yourdomain.com/webhook/chat/message'
    },
    prechat: {
      fields: [
        { id: 'name', label: 'Your name', type: 'text', required: true },
        { id: 'email', label: 'Email', type: 'email', required: true },
      ],
      leadFlow: [
        { id: 'role', label: 'Are you a Buyer or Seller?', type: 'choice', options: ['Buyer','Seller'], required: true },
        { id: 'intent', when: { role: 'Buyer' }, label: 'Buy or Rent?', type: 'choice', options: ['Buy','Rent'], required: true },
      ]
    }
  };
</script>
<script src="/path/to/chat-widget-core.js" async></script>
*/
