// v2/valdevie-widget.js
(function () {
  const WEBHOOK_URL =
    "https://n8n.recoverykings.co/webhook/87852d90-ca02-41d7-ad01-75561ed3560d";

  const VDV_LOGO_URL =
    "https://cdn.jsdelivr.net/gh/Robofish89/ai-web-chatbot@main/assets/val-de-vie/Instagram.jpeg";

  // New launcher video
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
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        cursor: pointer;
      }

      .vdv-launcher-main {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: #000;
        box-shadow: 0 10px 25px rgba(0,0,0,0.25);
        border: 1px solid rgba(255,255,255,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
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
        display: block;
      }

      /* ---------- Chat Window (ec4f7dc layout) ---------- */

      .vdv-chat-window {
        position: fixed;
        bottom: 100px;
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
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        border: 1px solid var(--vdv-border);
      }

      .vdv-hidden {
        display: none !important;
      }

      /* Header */

      .vdv-chat-header {
        background: #000000;
        color: #fff;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(255,255,255,0.1);
      }

      .vdv-chat-header-left {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
      }

      /* Circle favicon-style "V" */
      .vdv-chat-logo {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid var(--vdv-gold);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        font-weight: 600;
        color: var(--vdv-gold);
        background: rgba(0,0,0,0.6);
        flex-shrink: 0;
      }

      .vdv-chat-title {
        display: flex;
        align-items: center;
        overflow: hidden;
      }

      /* Bigger, fully visible Val de Vie logo */
      .vdv-chat-title-logo {
        height: 26px;
        max-width: 230px;
        object-fit: contain;
        display: block;
        margin-left: 4px;
      }

      .vdv-chat-close {
        border: none;
        background: transparent;
        color: rgba(255,255,255,0.9);
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
        padding: 0;
      }

      /* ---------- Pre-chat overlay (ec4f7dc spacing) ---------- */

      .vdv-prechat-overlay {
        padding: 16px;
        background: var(--vdv-bg);
      }

      .vdv-prechat-card {
        background: #fff;
        border-radius: 16px;
        border: 1px solid var(--vdv-border);
        padding: 16px 16px 18px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.05);
      }

      .vdv-prechat-title {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 6px;
        color: #222;
      }

      .vdv-prechat-sub {
        font-size: 12px;
        color: #555;
        margin-bottom: 10px;
      }

      .vdv-prechat-form {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .vdv-prechat-field label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #666;
        margin-bottom: 2px;
        display: block;
      }

      .vdv-prechat-input {
        width: 100%;
        border-radius: 999px;
        border: 1px solid #d2c7b4;
        padding: 7px 10px;
        font-size: 13px;
        outline: none;
        background: #fff;
        box-sizing: border-box;
      }

      .vdv-prechat-input:focus {
        border-color: var(--vdv-gold);
      }

      .vdv-prechat-submit {
        margin-top: 6px;
        border-radius: 999px;
        border: none;
        background: var(--vdv-gold);
        color: #111;
        font-size: 13px;
        font-weight: 600;
        padding: 7px 18px;
        cursor: pointer;
        align-self: flex-end;
      }

      /* ---------- Chat body ---------- */

      .vdv-chat-body {
        display: flex;
        flex-direction: column;
        min-height: 260px;
      }

      .vdv-chat-messages {
        flex: 1;
        padding: 12px 12px 8px;
        overflow-y: auto;
        font-size: 13px;
      }

      .vdv-msg {
        margin-bottom: 8px;
        display: flex;
      }

      .vdv-msg.vdv-from-bot {
        justify-content: flex-start;
      }

      .vdv-msg.vdv-from-user {
        justify-content: flex-end;
      }

      .vdv-bubble {
        max-width: 80%;
        padding: 9px 11px;
        border-radius: 14px;
        line-height: 1.4;
      }

      .vdv-from-bot .vdv-bubble {
        background: #ffffff;
        border: 1px solid var(--vdv-border);
        color: #222;
      }

      .vdv-from-user .vdv-bubble {
        background: var(--vdv-charcoal);
        color: #fff;
      }

      .vdv-chat-quick-actions {
        padding: 4px 12px 8px;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .vdv-quick-btn {
        border-radius: 999px;
        border: 1px solid var(--vdv-gold);
        padding: 5px 10px;
        font-size: 11px;
        background: #fff;
        color: #222;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .vdv-quick-btn:hover {
        background: var(--vdv-gold);
        color: #111;
      }

      .vdv-chat-input-area {
        border-top: 1px solid var(--vdv-border);
        padding: 6px 8px;
        display: flex;
        gap: 6px;
        background: rgba(255,255,255,0.9);
      }

      .vdv-chat-input {
        flex: 1;
        border-radius: 999px;
        border: 1px solid #d2c7b4;
        padding: 7px 10px;
        font-size: 13px;
        outline: none;
        background: #fff;
        box-sizing: border-box;
      }

      .vdv-chat-input:focus {
        border-color: var(--vdv-gold);
      }

      .vdv-chat-send {
        border-radius: 999px;
        border: none;
        background: var(--vdv-gold);
        color: #111;
        font-size: 12px;
        font-weight: 600;
        padding: 0 14px;
        cursor: pointer;
      }

      .vdv-chat-status {
        font-size: 10px;
        color: #777;
        padding: 0 12px 6px;
      }

      @media (max-width: 480px) {
        .vdv-chat-window {
          right: 12px;
          left: 12px;
          width: auto;
          max-height: 70vh;
        }
      }
    `;
    document.head.appendChild(style);
  };

  const createUI = () => {
    injectStyles();

    // Launcher
    const launcher = document.createElement("div");
    launcher.className = "vdv-chat-launcher";
    launcher.innerHTML = `
      <div class="vdv-launcher-main">
        <video
          class="vdv-launcher-video"
          autoplay
          muted
          loop
          playsinline
        >
          <source src="${VDV_LAUNCHER_VIDEO_URL}" type="video/mp4" />
        </video>
      </div>
    `;

    // Window
    const win = document.createElement("div");
    win.className = "vdv-chat-window vdv-hidden";
    win.innerHTML = `
      <div class="vdv-chat-header">
        <div class="vdv-chat-header-left">
          <div class="vdv-chat-logo">V</div>
          <div class="vdv-chat-title">
            <img src="${VDV_LOGO_URL}" alt="Val de Vie Properties" class="vdv-chat-title-logo" />
          </div>
        </div>
        <button class="vdv-chat-close" aria-label="Close chat">×</button>
      </div>

      <div class="vdv-prechat-overlay">
        <div class="vdv-prechat-card">
          <div class="vdv-prechat-title">Let’s get acquainted</div>
          <div class="vdv-prechat-sub">
            Please share your details with us to start the chat.
          </div>
          <form class="vdv-prechat-form">
            <div class="vdv-prechat-field">
              <label for="vdv-prechat-name">Full name</label>
              <input id="vdv-prechat-name" class="vdv-prechat-input vdv-prechat-name" type="text" required />
            </div>
            <div class="vdv-prechat-field">
              <label for="vdv-prechat-email">Email address</label>
              <input id="vdv-prechat-email" class="vdv-prechat-input vdv-prechat-email" type="email" required />
            </div>
            <button type="submit" class="vdv-prechat-submit">Start chat</button>
          </form>
        </div>
      </div>

      <div class="vdv-chat-body vdv-hidden">
        <div class="vdv-chat-messages"></div>
        <div class="vdv-chat-quick-actions"></div>
        <div class="vdv-chat-status"></div>
        <form class="vdv-chat-input-area">
          <input class="vdv-chat-input" type="text" placeholder="Ask about Val de Vie properties…" autocomplete="off" />
          <button class="vdv-chat-send" type="submit">Send</button>
        </form>
      </div>
    `;

    document.body.appendChild(launcher);
    document.body.appendChild(win);

    const prechatOverlay = win.querySelector(".vdv-prechat-overlay");
    const prechatForm = win.querySelector(".vdv-prechat-form");
    const prechatNameInput = win.querySelector(".vdv-prechat-name");
    const prechatEmailInput = win.querySelector(".vdv-prechat-email");
    const chatBodyEl = win.querySelector(".vdv-chat-body");

    const messagesEl = win.querySelector(".vdv-chat-messages");
    const quickActionsEl = win.querySelector(".vdv-chat-quick-actions");
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

    const setStatus = (text) => {
      statusEl.textContent = text || "";
    };

    const clearQuickActions = () => {
      quickActionsEl.innerHTML = "";
    };

    const renderInitialQuickActions = () => {
      clearQuickActions();
      const actions = [
        {
          label: "ABOUT US",
          payload:
            "Tell me about Val de Vie and its story, vision, and lifestyle."
        },
        {
          label: "HOMES",
          payload: "Show me homes currently for sale at Val de Vie."
        },
        {
          label: "APARTMENTS",
          payload: "Show me apartments currently for sale at Val de Vie."
        },
        {
          label: "RETIREMENT",
          payload: "Tell me about retirement living options at Val de Vie."
        },
        {
          label: "STANDS",
          payload: "Show me available stands or plots at Val de Vie."
        },
        {
          label: "COMMERCIAL",
          payload: "Tell me about commercial property opportunities at Val de Vie."
        },
        {
          label: "SALES MAP",
          payload: "Show me the sales map for Val de Vie."
        },
        {
          label: "MAURITIUS",
          payload: "Tell me more about Val de Vie Mauritius."
        },
        {
          label: "DEVELOPMENTS",
          payload: "Show me current and upcoming developments at Val de Vie."
        }
      ];

      actions.forEach((a) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "vdv-quick-btn";
        btn.textContent = a.label;
        btn.addEventListener("click", () => {
          handleUserMessage(a.payload, true);
        });
        quickActionsEl.appendChild(btn);
      });
    };

    const sendToBackend = async (text) => {
      setStatus("Connecting to Val de Vie AI…");
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
        const reply =
          data.reply || "I’m here, but I couldn’t understand the response format.";
        addMessage(reply, "bot");
        setStatus("");
      } catch (err) {
        console.error("VDV chat error:", err);
        addMessage(
          "I’m having trouble reaching the Val de Vie AI assistant right now. Please try again in a moment or contact the sales office directly.",
          "bot"
        );
        setStatus("Connection issue");
      }
    };

    const handleUserMessage = (text, fromQuick = false) => {
      if (!text.trim()) return;
      addMessage(text, "user");
      if (!fromQuick) clearQuickActions();
      inputEl.value = "";
      sendToBackend(text);
    };

    const initConversation = () => {
      messagesEl.innerHTML = "";
      addMessage(
        "Welcome to Val de Vie Properties. What can I help you with today? You can choose a section below or ask your own question about the estate, lifestyle, or properties.",
        "bot"
      );
      renderInitialQuickActions();
    };

    // Launcher click
    launcher.addEventListener("click", () => {
      win.classList.remove("vdv-hidden");
      prechatOverlay.classList.remove("vdv-hidden");
      chatBodyEl.classList.add("vdv-hidden");
      prechatNameInput.focus();
    });

    // Close button
    closeBtn.addEventListener("click", () => {
      win.classList.add("vdv-hidden");
    });

    // Pre-chat form submit
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

    // Chat form submit
    formEl.addEventListener("submit", (e) => {
      e.preventDefault();
      handleUserMessage(inputEl.value, false);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createUI);
  } else {
    createUI();
  }
})();
