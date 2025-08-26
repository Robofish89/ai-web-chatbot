// widget-wrapper.js
// Loads @n8n/chat (ESM bundle) and mounts it with per-client config.
// IMPORTANT: Do NOT use window.ChatWidgetConfig anywhere and do NOT include
// the UMD auto-init <script src="...index.umd.js"> on the page.

export async function createClientChat({ target = "#chat-root", config }) {
  // Load the ES module bundle exactly once
  if (!window.__n8nChatLoaded) {
    const mod = await import("https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js");
    // Prefer a named export; fall back to global if the bundle attaches one
    window.__n8nCreateChat = mod?.createChat || (window.N8NChat && window.N8NChat.createChat);
    window.__n8nChatLoaded = true;
  }
  if (typeof window.__n8nCreateChat !== "function") {
    throw new Error("Failed to load @n8n/chat (createChat not found).");
  }

  const starter = config?.branding?.welcomeText;

  // Create the widget
  const widget = window.__n8nCreateChat({
    webhookUrl: config.webhook.url,
    target,
    position: config?.ui?.position || "bottom-right",
    placeholder: config?.branding?.inputPlaceholder || "Type your message…",
    initialMessages: starter ? [{ role: "assistant", text: starter }] : [],
    header: config?.ui?.showHeader === false ? null : { title: config?.branding?.name || "" },
    openOnLoad: !!config?.ui?.openOnLoad,
  });

  // THEME: set CSS vars directly on the <n8n-chat> host so they cross Shadow DOM
  const host = document.querySelector(`${target} n8n-chat`);
  if (host && config?.theme) {
    Object.entries(config.theme).forEach(([name, value]) => {
      host.style.setProperty(name, value);
    });
  }

  // “Hard” overrides that are tricky via variables (logo swap, header bg, composer min-height)
  const styleId = "vdev-hard-overrides";
  if (!document.getElementById(styleId)) {
    const s = document.createElement("style");
    s.id = styleId;
    s.textContent = `
      #chat-root { position: fixed; right: 16px; bottom: 16px; z-index: 2147483600; }
      #chat-root n8n-chat .header, #chat-root n8n-chat [data-part="header"] {
        background:#000 !important; color:#fff !important; border-bottom:1px solid #000;
      }
      #chat-root n8n-chat .header-title, #chat-root n8n-chat [data-part="header-title"] {
        font-size:0 !important; height:28px;
        background:url("https://www.valdevie.co.za/wp-content/uploads/2023/05/vdv-crest-gold.svg") center/contain no-repeat;
      }
      #chat-root n8n-chat .send-button, #chat-root n8n-chat [data-part="send-button"] {
        background:#a3863b !important; color:#fff !important;
      }
      #chat-root n8n-chat .message--user, #chat-root n8n-chat [data-role="message-user"] {
        background:#000 !important; color:#fff !important;
      }
      #chat-root n8n-chat .composer, #chat-root n8n-chat [data-part="composer"] {
        min-height:56px !important; display:flex; align-items:center;
      }
      #chat-root n8n-chat .composer textarea, #chat-root n8n-chat [data-part="composer-textarea"] {
        min-height:40px !important; flex:1 1 auto; resize:vertical;
      }
    `;
    document.head.appendChild(s);
  }

  // public API
  return {
    open: () => widget.open(),
    close: () => widget.close(),
    toggle: () => widget.toggle(),
  };
}
