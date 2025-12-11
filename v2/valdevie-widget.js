// v2/valdevie-widget.js
(function () {
  const WEBHOOK_URL =
    "https://n8n.recoverykings.co/webhook/87852d90-ca02-41d7-ad01-75561ed3560d";

  // Rectangle logo (large)
  const VDV_LOGO_URL =
    "https://cdn.jsdelivr.net/gh/Robofish89/ai-web-chatbot@main/assets/val-de-vie/rectanglelogo.png";

  // Home button video
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
      }

      .vdv-launcher-main {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: #000;
        box-shadow: 0 10px 25px rgba(0,0,0,0.25);
        border: 1px solid rgba(255,255,255,0.2);
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.18s ease, box-shadow 0.18s ease;
      }

      .vdv-launcher-main:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 30px rgba(0,0,0,0.32);
      }

      .vdv-launcher-video {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
      }

      /* ---------- CHAT WINDOW ---------- */

      .vdv-chat-window {
        position: fixed;
        bottom: 110px;
        right: 24px;
        width: 360px;
        max-height: 560px;
        background: var(--vdv-bg);
        border-radius: 18px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.25);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 9999;
        border: 1px solid var(--vdv-border);
      }

      .vdv-hidden {
        display: none !important;
      }

      /* ---------- HEADER (reduced height) ---------- */

      .vdv-chat-header {
        position: relative;
        background: #000;
        padding: 8px 16px;
        height: 70px;   /* REDUCED TO FIX SPACING */
        display: flex;
        align-items: center;
        justify-content: flex-end;
        border-bottom: 1px solid rgba(255,255,255,0.15);
        box-sizing: border-box;
      }

      /* Centered logo group */
      .vdv-chat-header-center {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 2;
      }

      /* Large rectangle Val de Vie logo */
      .vdv-chat-title-logo {
        height: 84px;   /* PERFECT SIZE YOU APPROVED */
        width: auto;
        display: block;
        object-fit: contain;
      }

      .vdv-chat-close {
        background: transparent;
        border: none;
        color: rgba(255,255,255,0.9);
        cursor: pointer;
        font-size: 20px;
      }

      /* ---------- PRE-CHAT ---------- */

      .vdv-prechat-overlay {
        padding: 16px;
        background: var(--vdv-bg);
      }

      .vdv-prechat-card {
        background: #fff;
        border-radius: 16px;
        border: 1px solid var(--vdv-border);
        padding: 18px 18px 20px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.05);
      }

      .vdv-prechat-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 6px;
        color: #222;
      }

      .vdv-prechat-sub {
        font-size: 13px;
        color: #555;
        margin-bottom: 12px;
      }

      .vdv-prechat-form {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .vdv-prechat-field label {
        font-size: 11px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #666;
        margin-bottom: 2px;
        display: block;
      }

      .vdv-prechat-input {
        width: 100%;
        border-radius: 999px;
        border: 1px solid #d2c7b4;
        padding: 8px 12px;
        font-size: 14px;
      }

      .vdv-prechat-submit {
        background: var(--vdv-gold);
        border: none;
        color: #111;
        border-radius: 999px;
        padding: 8px 20px;
        font-size: 14px;
        font-weight: 600;
        align-self: flex-end;
      }

      /* ---------- CHAT BODY ---------- */

      .vdv-chat-body {
        display: flex;
        flex-direction: column;
        min-height: 260px;
      }

      .vdv-chat-messages {
        flex: 1;
        padding: 12px;
        overflow-y: auto;
        font-size: 13px;
      }

      .vdv-msg {
        margin-bottom: 8px;
        display: flex;
      }

      .vdv-from-bot .vdv-bubble {
        background: #fff;
        border: 1px solid var(--vdv-border);
        color: #222;
        border-radius: 14px;
        padding: 9px 11px;
      }

      .vdv-from-user .vdv-bubble {
        background: var(--vdv-charcoal);
        color: #fff;
        border-radius: 14px;
        padding: 9px 11px;
      }

      .vdv-chat-input-area {
        border-top: 1px solid var(--vdv-border);
        padding: 8px;
        display: flex;
        gap: 6px;
      }

      .vdv-chat-input {
        flex: 1;
        border-radius: 999px;
        border: 1px solid #d2c7b4;
        padding: 8px 12px;
        font-size: 13px;
      }

      .vdv-chat-send {
        background: var(--vdv-gold);
        color: #111;
        border: none;
        border-radius: 999px;
        padding: 0 16px;
        font-size: 13px;
        font-weight: 600;
      }

      @media (max-width: 480px) {
        .vdv-chat-window {
          left: 12px;
          right: 12px;
          width: auto;
          max-height: 75vh;
        }
      }
    `;
    document.head.appendChild(style);
  };

  const createUI = () => {
    injectStyles();

    /* ---------- Launcher Button ---------- */
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
          <img src="${VDV_LOGO_URL}" class="vdv-chat-title-logo" />
        </div>

        <button class="vdv-chat-close">×</button>
      </div>

      <div class="vdv-prechat-overlay">
        <div class="vdv-prechat-card">
          <div class="vdv-prechat-title">Let’s get acquainted</div>
          <div class="vdv-prechat-sub">Please share your details with us to start the chat.</div>

          <form class="vdv-prechat-form">
            <div class="vdv-prechat-field">
              <label>Full Name</label>
              <input class="vdv-prechat-input vdv-prechat-name" type="text" required />
            </div>

            <div class="vdv-prechat-field">
              <label>Email Address</label>
              <input class="vdv-prechat-input vdv-prechat-email" type="email" required />
            </div>

            <button type="submit" class="vdv-prechat-submit">Start chat</button>
          </form>
        </div>
      </div>

      <div class="vdv-chat-body vdv-hidden">
        <div class="vdv-chat-messages"></div>
        <div class="vdv-chat-status"></div>

        <form class="vdv-chat-input-area">
          <input class="vdv-chat-input" type="text" placeholder="Ask about Val de Vie properties…" />
          <button class="vdv-chat-send" type="submit">Send</button>
        </form>
      </div>
    `;

    document.body.appendChild(launcher);
    document.body.appendChild(win);

    // Reference elements
    const prechatOverlay = win.querySelector(".vdv-prechat-overlay");
    const prechatForm = win.querySelector(".vdv-prechat-form");
    const prechatNameInput = win.querySelector(".vdv-prechat-name");
    const prechatEmailInput = win.querySelector(".vdv-prechat-email");
    const chatBodyEl = win.querySelector(".vdv-chat-body");
    const messagesEl = win.querySelector(".vdv-chat-messages");
    const statusEl = win.querySelector(".vdv-chat-status");
    const inputEl = win.querySelector(".vdv-chat-input");
    const formEl = win.querySelector(".vdv-chat-input-area");
    const closeBtn = win.querySelector(".vdv-chat-close");

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

    /* ---------- AI Communication ---------- */

    const sendToBackend = async (text) => {
      statusEl.textContent = "Connecting…";

      try {
        const res = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            sessionId,
            clientId: "val-de-vie",
            name: userName || null,
            email: userEmail || null
          })
        });

        if (!res.ok) throw new Error("Network error");

        const data = await res.json();
        addMessage(data.reply || "I'm here but couldn't parse the response.");
        statusEl.textContent = "";
      } catch (err) {
        addMessage("I’m having trouble connecting. Please try again shortly.");
        statusEl.textContent = "Connection issue";
      }
    };

    const handleUserMessage = (text) => {
      if (!text.trim()) return;
      addMessage(text, "user");
      inputEl.value = "";
      sendToBackend(text);
    };

    /* ---------- Init Chat ---------- */

    const initConversation = () => {
      messagesEl.innerHTML = "";
      addMessage("Welcome to Val de Vie Properties. How may I assist you today?");
    };

    /* ---------- Launcher Click ---------- */

    launcher.addEventListener("click", () => {
      win.classList.remove("vdv-hidden");
      prechatOverlay.classList.remove("vdv-hidden");
      chatBodyEl.classList.add("vdv-hidden");
      prechatNameInput.focus();
    });

    /* ---------- Close Chat ---------- */

    closeBtn.addEventListener("click", () => win.classList.add("vdv-hidden"));

    /* ---------- Prechat Submit ---------- */

    prechatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameVal = prechatNameInput.value.trim();
      const emailVal = prechatEmailInput.value.trim();
      if (!nameVal || !emailVal) return;

      userName = nameVal;
      userEmail = emailVal;

      prechatOverlay.classList.add("vdv-hidden");
      chatBodyEl.classList.remove("vdv-hidden");

      initConversation();
      inputEl.focus();
    });

    /* ---------- Chat Submit ---------- */

    formEl.addEventListener("submit", (e) => {
      e.preventDefault();
      handleUserMessage(inputEl.value);
    });
  };

  /* ---------- Load UI ---------- */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createUI);
  } else {
    createUI();
  }
})();
