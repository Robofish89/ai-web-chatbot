// v2/valdevie-widget.js
(function () {
  const WEBHOOK_URL =
    "https://n8n.recoverykings.co/webhook/87852d90-ca02-41d7-ad01-75561ed3560d";

  // Rectangle logo
  const VDV_LOGO_URL =
    "https://cdn.jsdelivr.net/gh/Robofish89/ai-web-chatbot@main/assets/val-de-vie/rectanglelogo.png";

  // Launcher video
  const VDV_LAUNCHER_VIDEO_URL =
    "https://cdn.jsdelivr.net/gh/Robofish89/ai-web-chatbot@main/assets/val-de-vie/Home2.mp4";

  const createSessionId = () => {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "vdv-" + Math.random().toString(36).substring(2) + Date.now();
  };

  const sessionId = createSessionId();
  let userName = "";
  let userEmail = "";

  const injectStyles = () => {
    if (document.getElementById("vdv-chat-styles")) return;
    const style = document.createElement("style");
    style.id = "vdv-chat-styles";
    style.textContent = `
      :root {
        --vdv-gold: #d8b26b;
        --vdv-charcoal: #1f2022;
        --vdv-bg: #f5f3ed;
        --vdv-border: #ded6c4;
      }

      /* ---------- Launcher ---------- */
      .vdv-chat-launcher {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        cursor: pointer;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .vdv-launcher-main {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: #000;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,0.25);
        box-shadow: 0 10px 25px rgba(0,0,0,0.25);
        transition: transform 0.18s ease, box-shadow 0.18s ease;
      }

      .vdv-launcher-main:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 32px rgba(0,0,0,0.35);
      }

      .vdv-launcher-video {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
      }

      /* ---------- Chat Window ---------- */
      .vdv-chat-window {
        position: fixed;
        bottom: 100px;
        right: 24px;
        width: 360px;
        max-height: 560px;
        background: var(--vdv-bg);
        border-radius: 18px;
        border: 1px solid var(--vdv-border);
        box-shadow: 0 22px 44px rgba(0,0,0,0.28);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 9999;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .vdv-hidden {
        display: none !important;
      }

      /* ---------- Header (NO GLOW) ---------- */
      .vdv-chat-header {
        position: relative;
        background: #000;
        padding: 14px 16px;
        height: 90px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        border-bottom: 1px solid rgba(255,255,255,0.15);
      }

      .vdv-chat-header-center {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 2;
      }

      .vdv-chat-title-logo {
        height: 84px;      /* doubled from 42px */
        width: auto;
        display: block;
        object-fit: contain;
      }

      .vdv-chat-close {
        position: relative;
        z-index: 3;
        background: transparent;
        border: none;
        color: rgba(255,255,255,0.9);
        font-size: 20px;
        cursor: pointer;
      }

      /* ---------- Pre-chat ---------- */
      .vdv-prechat-overlay {
        padding: 16px;
        background: var(--vdv-bg);
      }

      .vdv-prechat-card {
        background: #fff;
        border-radius: 16px;
        padding: 18px;
        border: 1px solid var(--vdv-border);
      }

      .vdv-prechat-title {
        font-size: 15px;
        font-weight: 600;
        margin-bottom: 6px;
      }

      .vdv-prechat-sub {
        font-size: 12px;
        margin-bottom: 10px;
        color: #555;
      }

      .vdv-prechat-field label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #666;
      }

      .vdv-prechat-input {
        width: 100%;
        padding: 8px 12px;
        border-radius: 999px;
        border: 1px solid #d2c7b4;
        background: #fff;
        font-size: 13px;
      }

      .vdv-prechat-submit {
        margin-top: 10px;
        background: var(--vdv-gold);
        border: none;
        padding: 8px 20px;
        border-radius: 999px;
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
        align-self: flex-end;
      }

      /* ---------- Chat Body ---------- */
      .vdv-chat-body {
        display: flex;
        flex-direction: column;
      }

      .vdv-chat-messages {
        padding: 12px;
        flex: 1;
        overflow-y: auto;
      }

      .vdv-msg {
        margin-bottom: 8px;
        display: flex;
      }

      .vdv-from-bot .vdv-bubble {
        background: #fff;
        border: 1px solid var(--vdv-border);
        padding: 9px 11px;
        border-radius: 14px;
        max-width: 80%;
      }

      .vdv-from-user .vdv-bubble {
        background: var(--vdv-charcoal);
        color: #fff;
        padding: 9px 11px;
        border-radius: 14px;
        max-width: 80%;
      }

      .vdv-chat-input-area {
        padding: 8px;
        border-top: 1px solid var(--vdv-border);
        display: flex;
        gap: 6px;
      }

      .vdv-chat-input {
        flex: 1;
        padding: 8px 12px;
        border-radius: 999px;
        border: 1px solid #d2c7b4;
      }

      .vdv-chat-send {
        background: var(--vdv-gold);
        border-radius: 999px;
        border: none;
        padding: 0 14px;
        font-weight: 600;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  };

  const createUI = () => {
    injectStyles();

    /* ---------- Launcher ---------- */
    const launcher = document.createElement("div");
    launcher.className = "vdv-chat-launcher";
    launcher.innerHTML = `
      <div class="vdv-launcher-main">
        <video class="vdv-launcher-video" autoplay muted loop playsinline>
          <source src="${VDV_LAUNCHER_VIDEO_URL}" type="video/mp4" />
        </video>
      </div>
    `;

    /* ---------- Chat Window ---------- */
    const win = document.createElement("div");
    win.className = "vdv-chat-window vdv-hidden";
    win.innerHTML = `
      <div class="vdv-chat-header">
        <div class="vdv-chat-header-center">
          <img src="${VDV_LOGO_URL}" class="vdv-chat-title-logo" alt="Val de Vie Properties" />
        </div>
        <button class="vdv-chat-close">×</button>
      </div>

      <div class="vdv-prechat-overlay">
        <div class="vdv-prechat-card">
          <div class="vdv-prechat-title">Let’s get acquainted</div>
          <div class="vdv-prechat-sub">Please share your details with us to start the chat.</div>
          <form class="vdv-prechat-form">
            <div class="vdv-prechat-field">
              <label>Full name</label>
              <input type="text" class="vdv-prechat-input vdv-prechat-name" required />
            </div>
            <div class="vdv-prechat-field">
              <label>Email address</label>
              <input type="email" class="vdv-prechat-input vdv-prechat-email" required />
            </div>
            <button type="submit" class="vdv-prechat-submit">Start chat</button>
          </form>
        </div>
      </div>

      <div class="vdv-chat-body vdv-hidden">
        <div class="vdv-chat-messages"></div>
        <form class="vdv-chat-input-area">
          <input class="vdv-chat-input" placeholder="Ask about Val de Vie properties…" />
          <button class="vdv-chat-send">Send</button>
        </form>
      </div>
    `;

    document.body.appendChild(launcher);
    document.body.appendChild(win);

    /* ---------- Elements ---------- */
    const closeBtn = win.querySelector(".vdv-chat-close");
    const prechatOverlay = win.querySelector(".vdv-prechat-overlay");
    const chatBody = win.querySelector(".vdv-chat-body");
    const nameInput = win.querySelector(".vdv-prechat-name");
    const emailInput = win.querySelector(".vdv-prechat-email");
    const messagesEl = win.querySelector(".vdv-chat-messages");
    const inputEl = win.querySelector(".vdv-chat-input");

    /* ---------- Helpers ---------- */
    const scrollToBottom = () => {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    };

    const addMessage = (text, from = "bot") => {
      const msg = document.createElement("div");
      msg.className = `vdv-msg vdv-from-${from}`;
      msg.innerHTML = `<div class="vdv-bubble">${text}</div>`;
      messagesEl.appendChild(msg);
      scrollToBottom();
    };

    /* ---------- Chat Backend ---------- */
    const sendToBackend = async (text) => {
      addMessage(text, "user");
      try {
        const res = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            sessionId,
            clientId: "val-de-vie",
            name: userName,
            email: userEmail
          })
        });

        const data = await res.json();
        addMessage(data.reply || "I'm here to assist.", "bot");
      } catch {
        addMessage("Connection issue. Please try again shortly.", "bot");
      }
    };

    /* ---------- UI Logic ---------- */
    launcher.addEventListener("click", () => {
      win.classList.remove("vdv-hidden");
      prechatOverlay.classList.remove("vdv-hidden");
      chatBody.classList.add("vdv-hidden");
      nameInput.focus();
    });

    closeBtn.addEventListener("click", () => {
      win.classList.add("vdv-hidden");
    });

    win.querySelector(".vdv-prechat-form").addEventListener("submit", (e) => {
      e.preventDefault();
      userName = nameInput.value.trim();
      userEmail = emailInput.value.trim();
      prechatOverlay.classList.add("vdv-hidden");
      chatBody.classList.remove("vdv-hidden");
      addMessage("Welcome to Val de Vie. How can I assist you today?", "bot");
      inputEl.focus();
    });

    win.querySelector(".vdv-chat-input-area").addEventListener("submit", (e) => {
      e.preventDefault();
      const text = inputEl.value.trim();
      if (!text) return;
      inputEl.value = "";
      sendToBackend(text);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createUI);
  } else {
    createUI();
  }
})();
