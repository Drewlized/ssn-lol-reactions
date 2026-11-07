
(() => {
  "use strict";

  if (window.__ssnLolReactionsInstalled) return;
  window.__ssnLolReactionsInstalled = true;

  const REACTION_COUNT = 5;
  const REACTION_DELAY_MS = 700;

  // Triggers from message CONTENT across Twitch, YouTube, and Kick.
  const TRIGGER_REGEX =
    /\b(?:lol+|lo+|lmao+|lmfao+|rofl+|haha+|hehe+|xd+|kekw|kek|lulw?|omegalul|lolwut|pogs|im dead|i'm dead|im weak|i'm weak|dead af|crying|dying|im crying|i'm crying|no way|bro what|thats funny|that's funny|too funny|im wheezing|i'm wheezing|bruh|nahhh+|lmaooo+)\b|😂|🤣|💀|😭|😹|😆|😜|🤡/i;

  const adjectives = [
    "Sleepy", "Cosmic", "Turbo", "Sneaky", "Goofy",
    "Chaotic", "Lucky", "Tiny", "Funky", "Spicy",
    "Frosty", "Golden", "Bouncy", "Cursed", "Happy",
    "Wobbly", "Neon", "Crispy", "Wild", "Fluffy",
    "Silly", "Mighty", "Nervous", "Electric", "Mystic",
    "Pixel", "Chunky", "Speedy", "Cheeky", "Dizzy",
    "Chill", "Wacky", "Hyper", "Cloudy"
  ];

  const nouns = [
    "Panda", "Potato", "Wizard", "Koala", "Penguin",
    "Noodle", "Pickle", "Goblin", "Turtle", "Banana",
    "Fox", "Mango", "Dinosaur", "Waffle", "Monkey",
    "Dragon", "Toast", "Duck", "Bunny", "Muffin",
    "Cactus", "Raccoon", "Shark", "Goose", "Cookie",
    "Robot", "Donut", "Frog", "Kitten", "Llama",
    "Chicken", "Nugget", "Blob", "Coconut"
  ];

  const emojis = [
    "😂", "😭", "💀", "🤣", "😹", "😆",
    "🤡", "🔥", "💀💀", "😭😭", "LMAOOO",
    "NAHHH", "BROOO", "💀😭", "HELP"
  ];

  const reactions = [
    () => `BRO ${randomItem(["WHAT", "PLEASE", "STOP", "IM DONE", "NO WAY"])} ${randomItem(emojis)}`,
    () => `${randomItem(["LMAOOO", "LMFAOOO", "HAHAHAHA", "IM CRYING", "NAHHH"])} ${randomItem(emojis)}`,
    () => `${randomItem(["AIN'T NO WAY", "NO SHOT", "NOT ME", "WHAT DID I JUST SEE", "IM WEAK"])} ${randomItem(emojis)}`,
    () => `${randomItem(["BROOOO", "DUDEEE", "HELP ME", "I CANT", "STOPPPP"])} ${randomItem(emojis)}`,
    () => `${randomItem(["THIS IS CRAZY", "THAT WAS WILD", "IM ACTUALLY DEAD", "TOO FUNNY", "W CHAT"])} ${randomItem(emojis)}`,
    () => `${randomItem(["LUL", "LOL", "KEKW", "OMEGALUL", "HAHA"])} ${randomItem(emojis)}`,
    () => `${randomItem(["im", "bro im", "nah im", "actually im"])} ${randomItem(["dead", "crying", "wheezing", "weak", "done"])} ${randomItem(emojis)}`,
    () => `${randomItem(["LOOOOOOL", "LMAOOOO", "HAHAHAHAHA", "HEHEHE", "LMFAOOOO"])}`,
    () => `${randomItem(["WHAT", "BRO", "NAH", "YO", "WAIT"])} ${randomItem(["😭", "💀", "😂", "🤣"])} ${randomItem(["😭", "💀", "😂", "🤣"])}`
  ];

  const platformColors = {
    twitch: [
      "#0000FF", "#8A2BE2", "#5F9EA0", "#D2691E",
      "#FF7F50", "#1E90FF", "#B22222", "#DAA520",
      "#008000", "#FF69B4", "#FF4500", "#FF0000",
      "#2E8B57", "#00FF7F", "#9ACD32"
    ],
    youtube: [
      "#4285F4", "#EA4335", "#34A853", "#FBBC05",
      "#AB47BC", "#00ACC1", "#FF7043", "#7E57C2",
      "#26A69A", "#EC407A", "#5C6BC0", "#9CCC65"
    ],
    kick: [
      "#53FC18", "#8CEB52", "#38BDF8", "#A78BFA",
      "#F472B6", "#FBBF24", "#FB7185", "#2DD4BF"
    ]
  };

  // Weighted platform selection:
  // Twitch 45%, YouTube 45%, Kick 10%.
  const platformChoices = [
    "twitch", "twitch", "twitch", "twitch", "twitch",
    "twitch", "twitch", "twitch", "twitch",
    "youtube", "youtube", "youtube", "youtube", "youtube",
    "youtube", "youtube", "youtube", "youtube",
    "kick", "kick"
  ];

  const iconPaths = {
    twitch: "./sources/images/twitch.png",
    youtube: "./sources/images/youtube.png",
    kick: "./sources/images/kick.png"
  };

  const emoteCache = new Map();
  const lastColor = {};
  const usedNames = new Set();

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function generateUsername() {
    let username;

    do {
      const adjective = randomItem(adjectives);
      const noun = randomItem(nouns);
      const number = Math.random() < 0.8
        ? Math.floor(10 + Math.random() * 989)
        : "";

      username = adjective + noun + number;
    } while (usedNames.has(username));

    usedNames.add(username);

    if (usedNames.size > 500) {
      usedNames.clear();
      usedNames.add(username);
    }

    return username;
  }

  function getOriginalPlatform(row) {
    const icon = row.querySelector("img.hl-source-type");

    return (
      row.dataset.sourceType ||
      row.getAttribute("data-source-type") ||
      icon?.dataset.iconName ||
      ""
    ).toLowerCase();
  }

  function getRandomPlatform() {
    return randomItem(platformChoices);
  }

  function getPlatformColors(platform) {
    const colors = new Set();

    document.querySelectorAll(
      '.highlight-chat:not([data-ssn-fake-reaction="1"])'
    ).forEach((row) => {
      if (getOriginalPlatform(row) !== platform) return;

      const username = row.querySelector(".hl-name");
      if (!username) return;

      const color =
        username.style.color ||
        window.getComputedStyle(username).color;

      if (color && color !== "rgba(0, 0, 0, 0)") {
        colors.add(color);
      }
    });

    if (colors.size === 0) {
      return platformColors[platform] || platformColors.twitch;
    }

    return [...colors];
  }

  function getRandomColor(platform) {
    const colors = getPlatformColors(platform);

    let available = colors.filter(
      color => color !== lastColor[platform]
    );

    if (available.length === 0) available = colors;

    const color = randomItem(available);
    lastColor[platform] = color;

    return color;
  }

  // Collect real emote images separately for each platform.
  function collectEmotes(row) {
    if (!row || row.dataset.ssnFakeReaction === "1") return;

    const platform = getOriginalPlatform(row);
    const content = row.querySelector(".hl-content");

    if (!content || !platform) return;

    if (!emoteCache.has(platform)) {
      emoteCache.set(platform, []);
    }

    const cache = emoteCache.get(platform);

    const images = content.querySelectorAll(
      "img.emote, img.regular-emote, img[class*='emote'], .emote img, .regular-emote img"
    );

    images.forEach((img) => {
      const src = img.currentSrc || img.src;

      if (!src || cache.some(item => item.src === src)) return;

      cache.push({
        src,
        element: img
      });
    });
  }

  function addRealEmotes(content, platform) {
    const cache = emoteCache.get(platform) || [];

    if (cache.length === 0) return;
    if (Math.random() > 0.55) return;

    const amount = Math.random() < 0.7 ? 1 : 2;

    for (let i = 0; i < amount; i++) {
      const selected = randomItem(cache);
      const original = selected.element;

      if (!original) continue;

      const clone = original.cloneNode(true);

      clone.removeAttribute("id");
      clone.removeAttribute("onerror");

      content.appendChild(document.createTextNode(" "));
      content.appendChild(clone);
    }
  }

  function generateReaction() {
    return randomItem(reactions)();
  }

  function makeFakeMessage() {
    const username = generateUsername();

    // Every fake message independently gets a random platform.
    const platform = getRandomPlatform();

    const row = document.createElement("div");
    row.className = "highlight-chat";
    row.dataset.ssnFakeReaction = "1";
    row.dataset.sourceType = platform;
    row.dataset.username = username;
    row.dataset.chatname = username;

    const message = document.createElement("div");
    message.className = "hl-message";

    // Use the selected platform's actual SSN icon asset.
    const icon = document.createElement("img");
    icon.src = iconPaths[platform];
    icon.className = "icon hl-source-type";
    icon.dataset.iconName = platform;
    icon.alt = platform;
    icon.onerror = function () {
      this.style.display = "none";
    };

    // Random username and matching platform color.
    const name = document.createElement("div");
    name.className = "hl-name";
    name.dir = "auto";
    name.textContent = username + ":";
    name.style.color = getRandomColor(platform);

    // Fresh randomly generated message.
    const content = document.createElement("span");
    content.className = "hl-content";
    content.dir = "auto";
    content.appendChild(document.createTextNode(generateReaction()));

    // Only use real emotes collected from that selected platform.
    addRealEmotes(content, platform);

    message.append(icon, name, content);
    row.appendChild(message);

    return row;
  }

  function getMessageText(content) {
    const text = content.textContent || "";

    const imageNames = [...content.querySelectorAll("img")].map(img =>
      [
        img.alt,
        img.title,
        img.dataset.emoteName,
        img.dataset.name
      ].filter(Boolean).join(" ")
    ).join(" ");

    return `${text} ${imageNames}`;
  }

  function addReactions(sourceRow) {
    if (!sourceRow || sourceRow.dataset.ssnFakeReaction === "1") return;
    if (sourceRow.dataset.ssnLolProcessed === "1") return;

    // The trigger checks ONLY message content on every platform.
    const content = sourceRow.querySelector(".hl-content");
    if (!content) return;

    collectEmotes(sourceRow);

    const messageText = getMessageText(content);

    if (!TRIGGER_REGEX.test(messageText)) return;

    sourceRow.dataset.ssnLolProcessed = "1";

    let previousRow = sourceRow;

    for (let i = 0; i < REACTION_COUNT; i++) {
      window.setTimeout(() => {
        if (!sourceRow.isConnected) return;

        if (!previousRow.isConnected) {
          previousRow = sourceRow;
        }

        const fakeRow = makeFakeMessage();

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
      collectEmotes(node);
      addReactions(node);
    }

    node.querySelectorAll(".highlight-chat").forEach((row) => {
      collectEmotes(row);
      addReactions(row);
    });

    const parentRow = node.closest(".highlight-chat");

    if (parentRow) {
      collectEmotes(parentRow);
      addReactions(parentRow);
    }
  }

  // Inspect and collect emotes from all existing platform messages.
  document.querySelectorAll(
    '.highlight-chat:not([data-ssn-fake-reaction="1"])'
  ).forEach((row) => {
    collectEmotes(row);
    addReactions(row);
  });

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "characterData") {
        const row = mutation.target.parentElement?.closest(
          ".highlight-chat"
        );

        if (row) {
          collectEmotes(row);
          addReactions(row);
        }

        continue;
      }

      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          inspect(node);
        } else if (node.nodeType === Node.TEXT_NODE) {
          const row = node.parentElement?.closest(".highlight-chat");

          if (row) {
            collectEmotes(row);
            addReactions(row);
          }
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
