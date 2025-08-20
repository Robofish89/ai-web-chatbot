// Minimal, reusable wrapper around @n8n/chat (loaded from CDN).
// Served by GitHub Pages: https://<your-user>.github.io/ai-web-chatbot/widget-wrapper.js

import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

// Hard defaults (adjust once here for all clients)
const DEFAULTS = {
  enableStreaming: true,
  loadPreviousSession: true,
  allowFileUploads: false,
  allowedFilesMimeTypes: 'image/*,application/pdf',
  i18n: {
    en: {
      title: 'Need a hand?',
      subtitle: 'Chat with our assistant',
      inputPlaceholder: 'Type your message...',
      getStarted: 'New Conversation',
      footer: ''
    }
  }
};

/**
 * createClientChat – your single entrypoint
 * @param {object} cfg
 *  - webhookUrl (required)
 *  - brand: { title, subtitle, inputPlaceholder, footer }
 *  - features: { streaming, memory, fileUploads, allowedFilesMimeTypes }
 *  - headers: object (sent to n8n)
 *  - metadata: object (sent with each message)
 */
export function createClientChat(cfg = {}) {
  if (!cfg.webhookUrl) {
    console.error('[client-chat] Missing webhookUrl');
    return;
  }

  // Merge brand text
  const i18n = { ...DEFAULTS.i18n };
  if (cfg.brand) {
    i18n.en.title = cfg.brand.title ?? i18n.en.title;
    i18n.en.subtitle = cfg.brand.subtitle ?? i18n.en.subtitle;
    i18n.en.inputPlaceholder = cfg.brand.inputPlaceholder ?? i18n.en.inputPlaceholder;
    i18n.en.footer = cfg.brand.footer ?? i18n.en.footer;
  }

  // Merge features
  const features = cfg.features || {};
  const enableStreaming = features.streaming ?? DEFAULTS.enableStreaming;
  const loadPreviousSession = features.memory ?? DEFAULTS.loadPreviousSession;
  const allowFileUploads = features.fileUploads ?? DEFAULTS.allowFileUploads;
  const allowedFilesMimeTypes =
    features.allowedFilesMimeTypes ?? DEFAULTS.allowedFilesMimeTypes;

  // Optional headers for per‑client auth/routing
  const webhookConfig = {
    method: 'POST',
    headers: cfg.headers || {}
  };

  // Call the official widget
  return createChat({
    webhookUrl: cfg.webhookUrl,
    enableStreaming,
    loadPreviousSession,
    allowFileUploads,
    allowedFilesMimeTypes,
    i18n,
    metadata: cfg.metadata || {},
    webhookConfig
  });
}

// Auto‑init if a global config exists on the page
if (typeof window !== 'undefined' &&
    window.ClientChatConfig &&
    !window.__CLIENT_CHAT_INITIALIZED__) {
  window.__CLIENT_CHAT_INITIALIZED__ = true;
  createClientChat(window.ClientChatConfig);
}
