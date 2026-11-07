
(() => {
  "use strict";

  if (window.__ssnLolReactionsInstalled) return;
  window.__ssnLolReactionsInstalled = true;

  const REACTION_COUNT = 5;
  const REACTION_DELAY_MS = 700;
  const TRIGGER_REGEX = /lol/i;

  const names = [
    "PixelPanda", "CloudyVibes", "ItsNova", "ToastWizard", "LunaPlays",
    "NeonKoala", "MangoMode", "GhostByte", "SillyGoose", "FrostyFox",
    "Banana.exe", "CosmicDrew", "WaffleKing", "LilacStorm", "TurboTurtle",
    "BobaEnjoyer", "NoScopeNina", "ChillMantis", "EchoRider", "PotatoLord"
  ];

  const reactions = [
    "LMAOOO", "IM CRYING 😭", "NAHHH 💀", "BRO WHAT", "LOL 😂",
    "I CANT", "THAT GOT ME", "HELP 😭", "AIN'T NO WAY", "💀💀💀",
    "HAHAHAHA", "W CHAT", "THIS IS TOO FUNNY", "STOPPPP", "NO WAY LOL"
  ];

  const platforms = ["twitch", "youtube", "kick"];

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function svgData(svg) {
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  }

  const icons = {
    twitch: svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#9147ff"/><path fill="#fff" d="M7 5h20v14l-6 6h-5l-4 4v-4H7V5zm4 4v12h5v3l3-3h4V9H11zm5 2h2v6h-2v-6zm5 0h2v6h-2v-6z"/></svg>`),

    youtube: svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#ff0033"/><path fill="#fff" d="M26 11.2a3.3 3.3 0 0 0-2.3-2.3C21.7 8.3 16 8.3 16 8.3s-5.7 0-7.7.6A3.3 3.3 0 0 0 6 11.2a34 34 0 0 0-.6 4.8 34 34 0 0 0 .6 4.8 3.3 3.3 0 0 0 2.3 2.3c2 .6 7.7.6 7.7.6s5.7 0 7.7-.6a3.3 3.3 0 0 0 2.3-2.3 34 34 0 0 0 .6-4.8 34 34 0 0 0-.6-4.8zM13.5 20v-8l7 4-7 4z"/></svg>`),

    kick: svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#53fc18"/><path fill="#101010" d="M7 5h7v8l6-8h8l-8 10 8 12h-8l-6-9v9H7V5z"/></svg>`)
  };

  const badgeIcon = svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#9147ff"/><path fill="#fff" d="m12 3 2.3 5.1 5.6.6-4.2 3.8 1.2 5.5-4.9-2.8-4.9 2.8 1.2-5.5-4.2-3.8 5.6-.6L12 3z"/></svg>`);

  function makeFakeMessage(sourceRow) {
    const platform = randomItem(platforms);
    const username = randomItem(names) + Math.floor(10 + Math.random() * 89);

    const row = document.createElement("div");
    row.className = sourceRow.className || "highlight-chat";
    row.classList.remove("odd", "even");
    row.dataset.ssnFakeReaction = "1";
    row.dataset.sourceType = platform;
    row.dataset.username = username;
    row.dataset.chatname = username;

    const message = document.createElement("div");
    message.className = "hl-message";

    const icon = document.createElement("img");
    icon.className = "icon hl-source-type";
    icon.src = icons[platform];
    icon.alt = platform;
    icon.title = platform;
    icon.dataset.iconName = platform;

    const badges = document.createElement("span");
    badges.className = "hl-badges";

    const badge = document.createElement("img");
    badge.className = "hl-badge";
    badge.src = badgeIcon;
    badge.alt = "badge";
    badge.title = "Community badge";
    badges.appendChild(badge);

    const name = document.createElement("div");
    name.className = "hl-name";
    name.dir = "auto";
    name.textContent = username + ":";

    const content = document.createElement("span");
    content.className = "hl-content";
    content.dir = "auto";
    content.textContent = randomItem(reactions);

    message.append(icon, badges, name, content);
    row.appendChild(message);

    return row;
  }

  function addReactions(sourceRow) {
    if (!sourceRow || sourceRow.dataset.ssnFakeReaction === "1") return;
    if (sourceRow.dataset.ssnLolProcessed === "1") return;

    // Only inspect the actual message content. Never inspect the username.
    const content = sourceRow.querySelector(".hl-content");
    if (!content || !TRIGGER_REGEX.test(content.textContent || "")) return;

    sourceRow.dataset.ssnLolProcessed = "1";

    let previousRow = sourceRow;

    for (let i = 0; i < REACTION_COUNT; i++) {
      window.setTimeout(() => {
        if (!sourceRow.isConnected) return;

        if (!previousRow.isConnected) {
          previousRow = sourceRow;
        }

        const fakeRow = makeFakeMessage(sourceRow);

        if (previousRow.parentNode) {
          previousRow.parentNode.insertBefore(fakeRow, previousRow.nextSibling);
          previousRow = fakeRow;
        }
      }, REACTION_DELAY_MS * (i + 1));
    }
  }

  function inspect(node) {
    if (!(node instanceof Element)) return;

    if (node.matches(".highlight-chat")) {
      addReactions(node);
    }

    node.querySelectorAll(".highlight-chat").forEach(addReactions);

    const parentRow = node.closest(".highlight-chat");
    if (parentRow) addReactions(parentRow);
  }

  document.querySelectorAll(".highlight-chat").forEach(addReactions);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "characterData") {
        const row = mutation.target.parentElement?.closest(".highlight-chat");
        if (row) addReactions(row);
        continue;
      }

      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          inspect(node);
        } else if (node.nodeType === Node.TEXT_NODE) {
          const row = node.parentElement?.closest(".highlight-chat");
          if (row) addReactions(row);
        }
      });
    }
  });

  function startObserver() {
    if (!document.body) {
      window.setTimeout(startObserver, 100);
      return;
    }

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  startObserver();

  console.info("[SSN LOL reactions] Loaded successfully.");
})();
