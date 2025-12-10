// v2/valdevie-widget.js
(function () {
  const WEBHOOK_URL =
    "https://n8n.recoverykings.co/webhook/87852d90-ca02-41d7-ad01-75561ed3560d";

  const VDV_LOGO_URL =
    "https://cdn.jsdelivr.net/gh/Robofish89/ai-web-chatbot@main/assets/val-de-vie/Instagram.jpeg";

  const VDV_LAUNCHER_VIDEO_URL =
    "https://cdn.jsdelivr.net/gh/Robofish89/ai-web-chatbot@main/assets/val-de-vie/home.mp4";

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
        --vdv-charcoal: #000000;
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
        overflow: hidden;
        background: #000;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(255,255,255,0.2);
        box-shadow: 0 10px 25px rgba(0,0,0,0.25);
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
        overflow: hidden;
        display: flex;
        flex-direction: column;
        z-index: 9999;
        border: 1px solid var(--vdv-border);
      }

      .vdv-hidden {
        display: none !important;
      }

      /* ---------- Header ---------- */

      .vdv-chat-header {
        background: #000000;
        padding: 10px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(255,255,255,0.15);
      }

      .vdv-chat-header-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      /* Left circle "V" */
      .vdv-chat-logo {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        border: 1px solid var(--vdv-gold);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        font-weight: 600;
        color: var(--vdv-gold);
        background: #000;
      }

      /* MAIN LOGO – now full height */
      .vdv-chat-title-logo {
        height: 42px;
        max-height: 42px;
        object-fit: contain;
        display: block;
      }

      .vdv-chat-close {
        border: none;
        background: transparent;
        color: rgba(255,255,255,0.85);
        font-size: 20px;
        cursor: pointer;
      }

      /* ---------- Prechat ---------- */

      .vdv-prechat-overlay {
        padding: 16px;
      }

      .vdv-prechat-card {
        border-radius: 16px;
        border: 1px solid var(--vdv-border);
        background: #fff;
        padding: 14px;
      }

      .vdv-prechat-title {
        font-size: 15px;
        font-weight: 600;
        margin-bottom: 4px;
      }

      .vdv-prechat-sub {
        font-size: 12px;
        margin-bottom: 10px;
        color: #666;
      }

      /* Inputs */
      .vdv-prechat-input {
        width: 100%;
        border-radius: 999px;
        border: 1px solid #d2c7b4;
        padding: 7px 10px;
        font-size: 13px;
      }

      .vdv-prechat-submit {
        margin-top: 8px;
        padding: 7px 14px;
        border-radius: 999px;
        background: var(--vdv-gold);
        border: none;
        font-weight: 600;
        cursor: pointer;
      }

      /* ---------- Chat Body ---------- */

      .vdv-chat-messages {
        padding: 12px;
        overflow-y: auto;
        flex: 1;
      }

      .vdv-msg {
        display: flex;
        margin-bottom: 8px;
      }

      .vdv-from-bot .vdv-bubble {
        background: #fff;
        border: 1px solid var(--vdv-border);
        padding: 10px 12px;
        border-radius: 14px;
      }

      .vdv-from-user .vdv-bubble {
        background: #000;
        color: #fff;
        padding: 10px 12px;
        border-radius: 14px;
      }

      .vdv-chat-quick-actions {
        padding: 8px;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .vdv-quick-btn {
        border-radius: 999px;
        padding: 6px 12px;
        border: 1px solid var(--vdv-gold);
        cursor: pointer;
        background: #fff;
        font-size: 11px;
      }

      .vdv-chat-input-area {
        display: flex;
        padding: 6px 8px;
        border-top: 1px solid var(--vdv-border);
      }

      .vdv-chat-input {
        flex: 1;
        padding: 8px 12px;
        border-radius: 999px;
        border: 1px solid #ccc;
      }

      .vdv-chat-send {
        padding: 0 14px;
        margin-left: 6px;
        background: var(--vdv-gold);
        border: none;
        border-radius: 999px;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  };

  const createUI = () => {
    injectStyles();

    const launcher = document.createElement("div");
    launcher.className = "vdv-chat-launcher";
    launcher.innerHTML = `
      <div class="vdv-launcher-main">
        <video class="vdv-launcher-video" autoplay muted loop playsinline>
          <source src="${VDV_LAUNCHER_VIDEO_URL}" type="video/mp4" />
        </video>
      </div>
    `;

    const win = document.createElement("div");
    win.className = "vdv-chat-window vdv-hidden";
    win.innerHTML = `
      <div class="vdv-chat-header">
        <div class="vdv-chat-header-left">
          <div class="vdv-chat-logo">V</div>
          <img src="${VDV_LOGO_URL}" class="vdv-chat-title-logo" />
        </div>
        <button class="vdv-chat-close">×</button>
      </div>

      <div class="vdv-prechat-overlay">
        <div class="vdv-prechat-card">
          <div class="vdv-prechat-title">Let’s get acquainted</div>
          <div class="vdv-prechat-sub">Please share your details with us to start the chat.</div>
          <form class="vdv-prechat-form">
            <input class="vdv-prechat-input vdv-prechat-name" type="text" placeholder="Full name" required />
            <input class="vdv-prechat-input vdv-prechat-email" type="email" placeholder="Email address" required />
            <button class="vdv-prechat-submit" type="submit">Start chat</button>
          </form>
        </div>
      </div>

      <div class="vdv-chat-body vdv-hidden">
        <div class="vdv-chat-messages"></div>
        <div class="vdv-chat-quick-actions"></div>
        <form class="vdv-chat-input-area">
          <input class="vdv-chat-input" type="text" placeholder="Ask anything…" />
          <button class="vdv-chat-send">Send</button>
        </form>
      </div>
    `;

    document.body.appendChild(launcher);
    document.body.appendChild(win);

    const prechatOverlay = win.querySelector(".vdv-prechat-overlay");
    const chatBody = win.querySelector(".vdv-chat-body");
    const prechatForm = win.querySelector(".vdv-prechat-form");
    const inputName = win.querySelector(".vdv-prechat-name");
    const inputEmail = win.querySelector(".vdv-prechat-email");

    launcher.addEventListener("click", () => {
      win.classList.remove("vdv-hidden");
      prechatOverlay.classList.remove("vdv-hidden");
      chatBody.classList.add("vdv-hidden");
      inputName.focus();
    });

    win.querySelector(".vdv-chat-close").addEventListener("click", () => {
      win.classList.add("vdv-hidden");
    });

    prechatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      userName = inputName.value.trim();
      userEmail = inputEmail.value.trim();
      prechatOverlay.classList.add("vdv-hidden");
      chatBody.classList.remove("vdv-hidden");
    });
  };

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", createUI)
    : createUI();
})();
