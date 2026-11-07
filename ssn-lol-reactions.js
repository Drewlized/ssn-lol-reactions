
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

  // Twitch's standard chat color palette.
  const twitchFallback = [
    "#0000FF", "#8A2BE2", "#5F9EA0", "#D2691E",
    "#FF7F50", "#1E90FF", "#B22222", "#DAA520",
    "#008000", "#FF69B4", "#FF4500", "#FF0000",
    "#2E8B57", "#00FF7F", "#9ACD32"
  ];

  // Readable fallback colors for YouTube and Kick.
  const youtubeFallback = [
    "#4285F4", "#EA4335", "#34A853", "#FBBC05",
    "#AB47BC", "#00ACC1", "#FF7043", "#7E57C2",
    "#26A69A", "#EC407A", "#5C6BC0", "#9CCC65"
  ];

  const kickFallback = [
    "#53FC18", "#8CEB52", "#38BDF8", "#A78BFA",
    "#F472B6", "#FBBF24", "#FB7185", "#2DD4BF"
  ];

  const lastColor = {};

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function getPlatform(row) {
    const icon = row.querySelector("img.hl-source-type");

    return (
      row.dataset.sourceType ||
      row.getAttribute("data-source-type") ||
      icon?.dataset.iconName ||
      ""
    ).toLowerCase();
  }

  function getFallbackColors(platform) {
    if (platform.includes("twitch")) return twitchFallback;
    if (platform.includes("youtube")) return youtubeFallback;
    if (platform.includes("kick")) return kickFallback;

    return twitchFallback;
  }

  // Collect actual username colors from real messages on the same platform.
  function getPlatformColors(platform) {
    const colors = new Set();

    document.querySelectorAll(
      '.highlight-chat:not([data-ssn-fake-reaction="1"])'
    ).forEach((row) => {
      if (getPlatform(row) !== platform) return;

      const username = row.querySelector(".hl-name");
      if (!username) return;

      const color =
        username.style.color ||
        window.getComputedStyle(username).color;

      if (color && color !== "rgba(0, 0, 0, 0)") {
        colors.add(color);
      }
    });

    return [...colors];
  }

  function getRandomUsernameColor(platform) {
    let colors = getPlatformColors(platform);

    // Use platform fallback colors if real chat colors aren't available.
    if (colors.length === 0) {
      colors = getFallbackColors(platform);
    }

    // Avoid repeating the immediately previous color when possible.
    let availableColors = colors.filter(
      color => color !== lastColor[platform]
    );

    if (availableColors.length === 0) {
      availableColors = colors;
    }

    const selectedColor = randomItem(availableColors);
    lastColor[platform] = selectedColor;

    return selectedColor;
  }

  function makeFakeMessage(sourceRow) {
    const username =
      randomItem(names) + Math.floor(10 + Math.random() * 89);

    const row = document.createElement("div");
    row.className = sourceRow.className || "highlight-chat";
    row.classList.remove("odd", "even");
    row.dataset.ssnFakeReaction = "1";

    const platform = getPlatform(sourceRow);

    row.dataset.sourceType = platform;
    row.dataset.username = username;
    row.dataset.chatname = username;

    const message = document.createElement("div");
    message.className = "hl-message";

    // Preserve the exact original platform icon.
    const originalIcon = sourceRow.querySelector("img.hl-source-type");

    if (originalIcon) {
      const icon = originalIcon.cloneNode(true);
      icon.removeAttribute("onerror");
      message.appendChild(icon);
    }

    // Give every fake username a randomized platform color.
    const name = document.createElement("div");
    name.className = "hl-name";
    name.dir = "auto";
    name.textContent = username + ":";
    name.style.color = getRandomUsernameColor(platform);

    // Keep reaction messages unchanged.
    const content = document.createElement("span");
    content.className = "hl-content";
    content.dir = "auto";
    content.textContent = randomItem(reactions);

    // No badges.
    message.append(name, content);
    row.appendChild(message);

    return row;
  }

  function addReactions(sourceRow) {
    if (!sourceRow || sourceRow.dataset.ssnFakeReaction === "1") return;
    if (sourceRow.dataset.ssnLolProcessed === "1") return;

    // Only inspect actual message content, never usernames.
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
