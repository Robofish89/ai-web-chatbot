// Minimal wrapper that mounts @n8n/chat and applies per-client branding.
// NOTE: Keeps logic generic so you only swap CSS + config per client.

export async function createClientChat({ target = "#chat-root", config }) {
  // Load the widget script once (idempotent)
  if (!window.__n8nChatLoaded) {
    await import("https://cdn.jsdelivr.net/npm/@n8n/chat/dist/index.umd.js");
    window.__n8nChatLoaded = true;
  }

  // Prepare starter system message
  const starterMessage = config?.branding?.welcomeText || "";

  // Create the widget
  const widget = window.N8NChat.createChat({
    webhookUrl: config.webhook.url,
    target,
    // N8N options
    // You can pass initialMessages if you want the assistant to start the convo
    initialMessages: starterMessage ? [{ text: starterMessage, role: "assistant" }] : [],
    // Placeholder for the input
    placeholder: config?.branding?.inputPlaceholder || "Type your message…",
    // Position
    position: config?.ui?.position || "bottom-right",
    // Header
    header: config?.ui?.showHeader !== false
      ? {
          title: config?.branding?.name || "",
          // We'll visually replace title with a logo via CSS (keeps accessibility text)
        }
      : null,
  });

  // Public API for the launcher or programmatic control
  const api = {
    open: () => widget.open(),
    close: () => widget.close(),
    toggle: (forceOpen) => (forceOpen ? widget.open() : widget.toggle()),
  };

  // Expose for debugging if needed
  window.__vdvChat = api;
  return api;
}
