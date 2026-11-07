
(() => {
  "use strict";

  if (window.__ssnLolReactionsInstalled) return;
  window.__ssnLolReactionsInstalled = true;

  const MIN_REACTIONS = 10;
  const MAX_REACTIONS = 20;
  const REACTION_DELAY_MS = 700;

  // Detect funny messages in the actual message content
  // across Twitch, YouTube, and Kick.
  const TRIGGER_REGEX =
    /\b(?:lol+|lo+|lmao+|lmfao+|rofl+|haha+|hehe+|xd+|kekw|kek|lulw?|omegalul|lolwut|pogs|im dead|i'm dead|im weak|i'm weak|dead af|crying|dying|im crying|i'm crying|no way|bro what|thats funny|that's funny|too funny|im wheezing|i'm wheezing|bruh|nahhh+|lmaooo+)\b|😂|🤣|💀|😭|😹|😆|😜|🤡/i;

  const adjectives = [
    "Sleepy", "Cosmic", "Turbo", "Sneaky", "Goofy",
    "Chaotic", "Lucky", "Tiny", "Funky", "Spicy",
    "Frosty", "Golden", "Bouncy", "Cursed", "Happy",
    "Wobbly", "Neon", "Crispy", "Wild", "Fluffy",
    "Silly", "Mighty", "Nervous", "Electric", "Mystic",
    "Pixel", "Chunky", "Speedy", "Cheeky", "Dizzy",
    "Chill", "Wacky", "Hyper", "Cloudy", "Sleepy",
    "Savage", "Crazy", "Random", "Goated", "Icy",
    "Shiny", "Sneaky", "Broke", "Lucky", "Dusty"
  ];

  const nouns = [
    "Panda", "Potato", "Wizard", "Koala", "Penguin",
    "Noodle", "Pickle", "Goblin", "Turtle", "Banana",
    "Fox", "Mango", "Dinosaur", "Waffle", "Monkey",
    "Dragon", "Toast", "Duck", "Bunny", "Muffin",
    "Cactus", "Raccoon", "Shark", "Goose", "Cookie",
    "Robot", "Donut", "Frog", "Kitten", "Llama",
    "Chicken", "Nugget", "Blob", "Coconut", "Gremlin",
    "Potato", "Crab", "Wizard", "Squirrel", "Burrito",
    "Hamster", "Mushroom", "Clown", "Lobster", "Melon"
  ];

  const emojis = [
    "😂", "😭", "💀", "🤣", "😹", "😆",
    "🤡", "🔥", "💀💀", "😭😭", "LMAOOO",
    "NAHHH", "BROOO", "💀😭", "HELP", "💀💀💀",
    "😭💀", "😂😂", "🤣🤣", "LMAO", "AIN'T NO WAY"
  ];

  // Large phrase pools create many possible combinations.
  const openings = [
    "BRO", "NAHH", "YO", "WAIT", "DUDE",
    "AIN'T NO WAY", "HELPPP", "IM SORRY",
    "BROOO", "WHAT", "NO SHOT", "PLEASE",
    "IM DONE", "STOP", "LMAOOO", "YOOO",
    "NOT AGAIN", "I CANT", "OH MY GOD",
    "WHAT DID I JUST WATCH", "BRO PLEASE"
  ];

  const reactions = [
    "IM CRYING",
    "IM ACTUALLY DEAD",
    "THAT WAS CRAZY",
    "I CANT BREATHE",
    "IM WHEEZING",
    "THATS INSANE",
    "THIS IS TOO FUNNY",
    "IM DONE BRO",
    "WHY IS THIS SO FUNNY",
    "I WAS NOT READY",
    "IM LOSING IT",
    "THAT CAUGHT ME OFF GUARD",
    "BRO WHAT WAS THAT",
    "IM WEAK",
    "THIS CANNOT BE REAL",
    "I CANT WITH THIS",
    "NAH THAT WAS WILD",
    "IM GONE",
    "THAT TOOK ME OUT",
    "BRO IS TOO FUNNY",
    "IM ACTUALLY LAUGHING",
    "WHAT IS HAPPENING",
    "NO WAY THAT JUST HAPPENED",
    "THAT WAS PERSONAL",
    "IM IN TEARS",
    "I DID NOT EXPECT THAT",
    "THAT WAS SO RANDOM",
    "BRO COOKED",
    "THIS STREAM IS CRAZY",
    "I'M NEVER RECOVERING"
  ];

  const endings = [
    "💀", "😭", "😂", "🤣", "💀😭",
    "😭😭", "LMAOOO", "HELP", "BROOO 💀",
    "NAHHH 😭", "I CANT 💀", "😂😂😂",
    "IM DONE 😭", "NO WAY 💀", "LOL",
    "LMAO 😭", "💀💀💀", "BRO 😭",
    "AIN'T NO WAY 😂", "HELP ME 💀"
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

  // Twitch and YouTube are more common than Kick.
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
  const recentMessages = [];

  const MAX_RECENT_MESSAGES = 150;

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function generateUsername() {
    let username;

    do {
      const adjective = randomItem(adjectives);
      const noun = randomItem(nouns);

      const number = Math.random() < 0.85
        ? Math.floor(10 + Math.random() * 989)
        : "";

      username = adjective + noun + number;
    } while (usedNames.has(username));

    usedNames.add(username);

    if (usedNames.size > 3000) {
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
        element: img.cloneNode(true)
      });
    });
  }

  function addRealEmotes(content, platform) {
    const cache = emoteCache.get(platform) || [];

    if (cache.length === 0) return;
    if (Math.random() > 0.5) return;

    const amount = Math.random() < 0.75 ? 1 : 2;

    for (let i = 0; i < amount; i++) {
      const selected = randomItem(cache);

      if (!selected || !selected.element) continue;

      const clone = selected.element.cloneNode(true);

      clone.removeAttribute("id");
      clone.removeAttribute("onerror");

      content.appendChild(document.createTextNode(" "));
      content.appendChild(clone);
    }
  }

  function rememberMessage(message) {
    recentMessages.push(message);

    if (recentMessages.length > MAX_RECENT_MESSAGES) {
      recentMessages.shift();
    }
  }

  function generateReaction() {
    const styles = [
      () => `${randomItem(openings)} ${randomItem(reactions)} ${randomItem(endings)}`,
      () => `${randomItem(reactions)} ${randomItem(emojis)}`,
      () => `${randomItem(openings)} ${randomItem(endings)}`,
      () => `${randomItem(["LMAOOO", "LMFAOOO", "HAHAHAHA", "HEHEHE", "LOOOOOOL"])} ${randomItem(endings)}`,
      () => `${randomItem(["BRO", "NAH", "WAIT", "YO", "DUDE"])} ${randomItem(["IM DEAD", "IM CRYING", "IM WEAK", "I CANT", "HELP ME"])} ${randomItem(emojis)}`,
      () => `${randomItem(["THIS", "BRO THIS", "NAH THIS", "WHY IS THIS"])} ${randomItem(["SO FUNNY", "ACTUALLY CRAZY", "WILD", "UNREAL", "TOO MUCH"])} ${randomItem(endings)}`,
      () => `${randomItem(["💀", "😭", "😂", "🤣"])} ${randomItem(["💀", "😭", "😂", "🤣"])} ${randomItem(["BRO", "HELP", "NAHHH", "LMAOOO"])}`,
      () => `${randomItem(["IM", "BRO IM", "NAH IM", "ACTUALLY IM"])} ${randomItem(["DONE", "GONE", "CRYING", "WHEEZING", "DEAD"])} ${randomItem(emojis)}`,
      () => `${randomItem(["NO WAY", "AIN'T NO WAY", "WHAT THE", "BRO WHAT", "HOW"])} ${randomItem(["😭", "💀", "😂", "🤣"])} ${randomItem(["LMAOOO", "HELP", "IM DONE", "NAHHH"])}`,
      () => `${randomItem(["LUL", "LOL", "KEKW", "OMEGALUL", "HAHA", "LMAO"])} ${randomItem(emojis)}`
    ];

    let message = "";
    let attempts = 0;

    // Avoid repeating messages, especially in the same burst.
    do {
      message = randomItem(styles)();
      attempts++;
    } while (
      recentMessages.includes(message) &&
      attempts < 30
    );

    rememberMessage(message);

    return message;
  }

  function makeFakeMessage() {
    const username = generateUsername();
    const platform = getRandomPlatform();

    const row = document.createElement("div");
    row.className = "highlight-chat";
    row.dataset.ssnFakeReaction = "1";
    row.dataset.sourceType = platform;
    row.dataset.username = username;
    row.dataset.chatname = username;

    const message = document.createElement("div");
    message.className = "hl-message";

    const icon = document.createElement("img");
    icon.src = iconPaths[platform];
    icon.className = "icon hl-source-type";
    icon.dataset.iconName = platform;
    icon.alt = platform;

    icon.onerror = function () {
      this.style.display = "none";
    };

    const name = document.createElement("div");
    name.className = "hl-name";
    name.dir = "auto";
    name.textContent = username + ":";
    name.style.color = getRandomColor(platform);

    const content = document.createElement("span");
    content.className = "hl-content";
    content.dir = "auto";

    content.appendChild(
      document.createTextNode(generateReaction())
    );

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

    // Only inspect the message content, never the username.
    const content = sourceRow.querySelector(".hl-content");
    if (!content) return;

    collectEmotes(sourceRow);

    const messageText = getMessageText(content);

    if (!TRIGGER_REGEX.test(messageText)) return;

    sourceRow.dataset.ssnLolProcessed = "1";

    // Each funny message gets its own random reaction count.
    const reactionCount =
      Math.floor(
        Math.random() * (MAX_REACTIONS - MIN_REACTIONS + 1)
      ) + MIN_REACTIONS;

    let previousRow = sourceRow;

    for (let i = 0; i < reactionCount; i++) {
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
