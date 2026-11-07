
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

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  // Generate a completely new random color every time.
  function getRandomColor() {
    const red = Math.floor(Math.random() * 256);
    const green = Math.floor(Math.random() * 256);
    const blue = Math.floor(Math.random() * 256);

    return `rgb(${red}, ${green}, ${blue})`;
  }

  function makeFakeMessage(sourceRow) {
    const username =
      randomItem(names) + Math.floor(10 + Math.random() * 89);

    const row = document.createElement("div");
    row.className = sourceRow.className || "highlight-chat";
    row.classList.remove("odd", "even");
    row.dataset.ssnFakeReaction = "1";

    row.dataset.sourceType =
      sourceRow.dataset.sourceType ||
      sourceRow.getAttribute("data-source-type") ||
      "";

    row.dataset.username = username;
    row.dataset.chatname = username;

    const message = document.createElement("div");
    message.className = "hl-message";

    // Preserve the original social-media icon.
    const originalIcon = sourceRow.querySelector("img.hl-source-type");

    if (originalIcon) {
      const icon = originalIcon.cloneNode(true);
      icon.removeAttribute("onerror");
      message.appendChild(icon);
    }

    // Generate a fresh random color for this username.
    const name = document.createElement("div");
    name.className = "hl-name";
    name.dir = "auto";
    name.textContent = username + ":";
    name.style.color = getRandomColor();

    const content = document.createElement("span");
    content.className = "hl-content";
    content.dir = "auto";
    content.textContent = randomItem(reactions);

    message.append(name, content);
    row.appendChild(message);

    return row;
  }

  function addReactions(sourceRow) {
    if (!sourceRow || sourceRow.dataset.ssnFakeReaction === "1") return;
    if (sourceRow.dataset.ssnLolProcessed === "1") return;

    const content = sourceRow.querySelector(".hl-content");
    if (!content) return;

    if (!TRIGGER_REGEX.test(content.textContent || "")) return;

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
          previousRow.parentNode.insertBefore(
            fakeRow,
            previousRow.nextSibling
          );

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
        const row = mutation.target.parentElement?.closest(
          ".highlight-chat"
        );

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
