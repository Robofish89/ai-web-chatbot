// widget-wrapper.js
// Minimal, reusable wrapper around @n8n/chat
// Do NOT use window.ChatWidgetConfig or auto-init UMD script anywhere.

export async function createClientChat({ target = "#chat-root", config }) {
  // Load the widget once
  if (!window.__n8nChatLoaded) {
    await import("https://cdn.jsdelivr.net/npm/@n8n/chat/dist/index.umd.js");
    window.__n8nChatLoaded = true;
  }

  const starter = config?.branding?.welcomeText;

  // Create widget
  const widget = window.N8NChat.createChat({
    webhookUrl: config.webhook.url,
    target,
    position: config?.ui?.position || "bottom-right",
    placeholder: config?.branding?.inputPlaceholder || "Type your message…",
    initialMessages: starter ? [{ role: "assistant", text: starter }] : [],
    header: config?.ui?.showHeader === false ? null : { title: config?.branding?.name || "" },
    openOnLoad: !!config?.ui?.openOnLoad,
  });

  // Small API for manual control
  const api = {
    open: () => widget.open(),
    close: () => widget.close(),
    toggle: () => widget.toggle(),
  };

  return api;
}
