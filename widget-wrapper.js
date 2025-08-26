// widget-wrapper.js
// Programmatic initializer (ESM route) you can reuse on other pages/clients.

export async function createClientChat({ target = "#chat-root", config }) {
  if (!window.__n8nChatLoaded) {
    const mod = await import("https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js");
    window.__n8nCreateChat = mod?.createChat || (window.N8NChat && window.N8NChat.createChat);
    window.__n8nChatLoaded = true;
  }
  if (typeof window.__n8nCreateChat !== "function") {
    throw new Error("Failed to load @n8n/chat (createChat not found).");
  }
  const starter = config?.branding?.welcomeText;
  const widget = window.__n8nCreateChat({
    webhookUrl: config.webhook.url,
    target,
    position: config?.ui?.position || "bottom-right",
    placeholder: config?.branding?.inputPlaceholder || "Type your message…",
    initialMessages: starter ? [{ role: "assistant", text: starter }] : [],
    header: config?.ui?.showHeader === false ? null : { title: config?.branding?.name || "" },
    openOnLoad: !!config?.ui?.openOnLoad,
  });
  return { open: () => widget.open(), close: () => widget.close(), toggle: () => widget.toggle() };
}
