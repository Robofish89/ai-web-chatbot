// widget-wrapper.js
// Loads @n8n/chat (ESM bundle) and mounts the chat with your config.
// IMPORTANT: Do NOT include window.ChatWidgetConfig anywhere. No auto-init.

export async function createClientChat({ target = "#chat-root", config }) {
  // Load the ES module bundle exactly once (the UMD URL 404'd on your page)
  if (!window.__n8nChatLoaded) {
    // Try to import the ESM bundle
    const mod = await import("https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js");
    // Prefer the export; fall back to global if the bundle attaches one
    window.__n8nCreateChat = mod?.createChat || (window.N8NChat && window.N8NChat.createChat);
    window.__n8nChatLoaded = true;
  }

  if (typeof window.__n8nCreateChat !== "function") {
    throw new Error("Failed to load @n8n/chat. createChat not found.");
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

  // Small API
  return {
    open: () => widget.open(),
    close: () => widget.close(),
    toggle: () => widget.toggle(),
  };
}
