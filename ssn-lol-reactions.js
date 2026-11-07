
(() => {
  "use strict";

  if (window.__ssnLolReactionsInstalled) return;
  window.__ssnLolReactionsInstalled = true;

  // ==========================================
  // SETTINGS
  // ==========================================

  const MIN_REACTIONS = 10;
  const MAX_REACTIONS = 20;

  const MIN_MESSAGE_DELAY = 500;
  const MAX_MESSAGE_DELAY = 1300;

  const MIN_GROUP_DELAY = 5000;
  const MAX_GROUP_DELAY = 11000;

  const MAX_RECENT_MESSAGES = 250;

  // ==========================================
  // REALISTIC NAMES
  // ==========================================

  const firstNames = [
    "Liana", "Alex", "Sophie", "Jordan", "Mason",
    "Kai", "Olivia", "Ethan", "Lily", "Noah",
    "Ava", "Lucas", "Mia", "Logan", "Chloe",
    "Ryan", "Ella", "Leo", "Amelia", "Jayden",
    "Isabella", "Daniel", "Zoe", "Caleb", "Emily",
    "Nathan", "Grace", "Dylan", "Hannah", "Aiden",
    "Luca", "Layla", "Owen", "Aria", "Eli",
    "Maya", "Jack", "Nina", "Evan", "Ruby",
    "Theo", "Leah", "Sam", "Ellie", "Max",
    "Avery", "Tyler", "Ivy", "Jules", "Jamie",
    "Harper", "Carter", "Mila", "Adrian", "Riley",
    "Lena", "Blake", "Lola", "Miles", "Ellis",
    "Emery", "Finn", "Sadie", "Asher", "Alexis",
    "Jade", "Cameron", "Skye", "Jaxon", "Tessa",
    "Morgan", "Elliot", "Violet", "Parker", "Daisy"
  ];

  const nicknames = [
    "liana", "alex", "sophie", "kai", "mason",
    "lily", "noah", "ava", "lucas", "mia",
    "logan", "chloe", "ryan", "ella", "leo",
    "zoe", "dylan", "emily", "nina", "ruby",
    "theo", "max", "ivy", "jamie", "harper",
    "mila", "riley", "lena", "blake", "miles",
    "finn", "sadie", "jade", "skye", "tessa"
  ];

  const usernamePrefixes = [
    "its", "hey", "just", "real", "little",
    "only", "that", "the", "im", "probably",
    "simply", "not", "actually", "your"
  ];

  const usernameSuffixes = [
    "plays", "online", "live", "here", "gaming",
    "world", "vibes", "streams", "lol", "island"
  ];

  const usedNames = new Set();
  const usernameColors = new Map();

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function generateUsername() {
    let username;
    let attempts = 0;

    do {
      const style = randomNumber(1, 5);
      const first = randomItem(firstNames);
      const nickname = randomItem(nicknames);

      if (style === 1) {
        username = first;
      } else if (style === 2) {
        username = nickname + randomItem(["", "_", "."]) +
          randomItem(firstNames);
      } else if (style === 3) {
        username = randomItem(usernamePrefixes) +
          first;
      } else if (style === 4) {
        username = first.toLowerCase() +
          randomItem(usernameSuffixes);
      } else {
        username = first + randomItem(["", "_", "."]) +
          randomItem(["xo", "hey", "plays", "vibes"]);
      }

      attempts++;
    } while (
      usedNames.has(username.toLowerCase()) &&
      attempts < 100
    );

    if (usedNames.has(username.toLowerCase())) {
      username = randomItem(firstNames) +
        randomItem(["", "_", "xo"]);
    }

    usedNames.add(username.toLowerCase());

    return username;
  }

  // ==========================================
  // PERMANENT USER COLORS
  // ==========================================

  const platformColors = {
    twitch: [
      "#9147FF", "#00B5AD", "#FF69B4", "#FFD166",
      "#1E90FF", "#FF7F50", "#32CD32", "#DA70D6",
      "#00CED1", "#FF4500", "#9370DB", "#20B2AA",
      "#E6A23C", "#6495ED", "#DC69A0"
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

  function getUsernameColor(username, platform) {
    const key = username.toLowerCase();

    if (usernameColors.has(key)) {
      return usernameColors.get(key);
    }

    const colors = platformColors[platform] ||
      platformColors.twitch;

    const color = randomItem(colors);

    usernameColors.set(key, color);

    return color;
  }

  // ==========================================
  // RANDOM PLATFORM SELECTION
  // ==========================================

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

  function getRandomPlatform() {
    return randomItem(platformChoices);
  }

  // ==========================================
  // REAL EMOTE COLLECTION
  // ==========================================

  const emoteCache = new Map();

  function getOriginalPlatform(row) {
    const icon = row.querySelector("img.hl-source-type");

    return (
      row.dataset.sourceType ||
      row.getAttribute("data-source-type") ||
      icon?.dataset.iconName ||
      ""
    ).toLowerCase();
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

    if (!cache.length || Math.random() > 0.45) return;

    const amount = Math.random() < 0.8 ? 1 : 2;

    for (let i = 0; i < amount; i++) {
      const selected = randomItem(cache);

      if (!selected?.element) continue;

      const clone = selected.element.cloneNode(true);

      clone.removeAttribute("id");
      clone.removeAttribute("onerror");

      content.appendChild(document.createTextNode(" "));
      content.appendChild(clone);
    }
  }

  // ==========================================
  // REACTION CATEGORIES
  // ==========================================

  const reactions = {

    greeting: [
      () => `HI DREWKU ${randomItem(["👋", "❤️", "😭", "😂"])}`,
      () => `HEY DREW ${randomItem(["!!", "!! ❤️", " 😂", " 👋"])}`,
      () => `YO DREWKU`,
      () => `HELLOOO DREW`,
      () => `HIII DREWKU`,
      () => `WASSUP DREW`,
      () => `HEY EVERYONE`,
      () => `HI CHAT`,
      () => `GOOD TO SEE YOU DREW`,
      () => `DREW IS LIVE LETS GOOO`
    ],

    win: [
      () => `W`,
      () => `W DREWKU`,
      () => `COMMON DREW W`,
      () => `BIG W`,
      () => `W CHAT`,
      () => `DREW IS COOKING`,
      () => `THATS A W`,
      () => `ABSOLUTE W`,
      () => `WWW`,
      () => `W STREAM`,
      () => `DREW NEVER MISSES`,
      () => `W MOMENT ${randomItem(["🔥", "💯", "😭"])}`
    ],

    funny: [
      () => `${randomItem(["BRO", "NAHH", "YO", "WAIT", "DUDE"])} ${randomItem(["WHAT", "PLEASE", "STOP", "IM DONE"])} ${randomItem(["💀", "😭", "😂"])}`,
      () => `${randomItem(["LMAOOO", "LMFAOOO", "HAHAHAHA", "IM CRYING", "NAHHH"])} ${randomItem(["💀", "😭", "😂"])}`,
      () => `${randomItem(["IM", "BRO IM", "NAH IM"])} ${randomItem(["DEAD", "WEAK", "CRYING", "WHEEZING"])} ${randomItem(["😭", "💀"])}`,
      () => `${randomItem(["THAT WAS", "THIS IS", "BRO THAT WAS"])} ${randomItem(["CRAZY", "SO FUNNY", "WILD", "UNREAL"])} ${randomItem(["💀", "😭"])}`,
      () => `I CANT BREATHE ${randomItem(["😭", "💀", "😂"])}`,
      () => `WHAT DID I JUST WATCH 💀`,
      () => `BRO IS TOO FUNNY 😭`,
      () => `IM ACTUALLY LOSING IT`,
      () => `THAT CAUGHT ME OFF GUARD`,
      () => `NAH THIS STREAM IS CRAZY`,
      () => `HELP ME LMAOOO`,
      () => `I WAS NOT READY FOR THAT`,
      () => `WHY IS THIS SO FUNNY 😭`,
      () => `BRO PLEASEEE 💀`,
      () => `THAT TOOK ME OUT`
    ],

    horror: [
      () => `WHAT WAS THAT 😭`,
      () => `IM SCARED`,
      () => `BRO RUNNN`,
      () => `NOPE NOPE NOPE`,
      () => `TURN AROUND`,
      () => `DONT GO IN THERE`,
      () => `IM ACTUALLY SCARED 💀`,
      () => `WHAT IS THAT THING`,
      () => `BEHIND YOU`,
      () => `BRO LOOK BEHIND YOU`,
      () => `NAHHH IM LEAVING`,
      () => `MY HEART JUST DROPPED`,
      () => `THAT JUMPSCARE 😭`,
      () => `I JUMPED SO HARD`,
      () => `WHY WOULD YOU GO THERE`,
      () => `IM NOT WATCHING THIS ALONE`,
      () => `THAT WAS TERRIFYING`,
      () => `RUN DREW RUN`,
      () => `OH MY GOD`,
      () => `I WAS NOT READY FOR THAT`
    ],

    angry: [
      () => `BRO NO`,
      () => `THATS SO ANNOYING`,
      () => `IM ACTUALLY MAD`,
      () => `NAH THATS NOT FAIR`,
      () => `WHY WOULD THAT HAPPEN`,
      () => `BRO WHAT ARE YOU DOING`,
      () => `THIS GAME IS RIGGED`,
      () => `I WOULD BE SO MAD`,
      () => `NO WAY THAT JUST HAPPENED`,
      () => `THATS CRAZY UNFAIR`,
      () => `IM LOSING MY MIND`,
      () => `BROOOOO`,
      () => `I CANT WITH THIS GAME`,
      () => `THAT WAS SO BAD`,
      () => `NAH I WOULD QUIT`
    ],

    support: [
      () => `JUST SUBBED ❤️`,
      () => `I SUBBED DREWKU`,
      () => `SUBSCRIBED!`,
      () => `JUST LIKED THE STREAM`,
      () => `LEFT A LIKE ❤️`,
      () => `LIKED AND SUBBED`,
      () => `SHOWING SOME SUPPORT`,
      () => `KEEP IT UP DREW`,
      () => `LOVE THE STREAM`,
      () => `ANOTHER LIKE FROM ME`,
      () => `SUBBED LETS GOOO`,
      () => `HIT THAT LIKE BUTTON`,
      () => `YOU DESERVE MORE SUPPORT`,
      () => `LOVE YOUR CONTENT`
    ],

    general: [
      () => `HOW IS EVERYONE`,
      () => `THIS STREAM IS FUN`,
      () => `CHAT IS CRAZY`,
      () => `WHAT GAME IS THIS`,
      () => `IM HAVING A GOOD TIME`,
      () => `LETS GOOOO`,
      () => `W STREAM`,
      () => `CHAT LOL`,
      () => `BROOO`,
      () => `YOOO`,
      () => `THIS IS GREAT`,
      () => `DREWKU 🔥`,
      () => `LOL`,
      () => `NO WAY`,
      () => `WHAT`,
      () => `HELPPP`
    ]
  };

  // ==========================================
  // CATEGORY DETECTION
  // ==========================================

  const categoryPatterns = {
    greeting:
      /\b(?:hi|hey|hello|yo|sup|wassup|what'?s up)\s+(?:drewku|drew)\b|\b(?:hi|hey|hello)\s+chat\b/i,

    win:
      /\b(?:w|ww|w+|common w|big w|w drewku|w drew|w chat|lets go|let's go|goated|nice shot|clutch|well played)\b/i,

    support:
      /\b(?:i subbed|just subbed|subscribed|i subscribed|i just subscribed|liked the stream|left a like|i liked|liked and subbed|hit the like|sub and like)\b/i,

    horror:
      /\b(?:scary|scared|jumpscare|jump scare|monster|ghost|horror|behind you|run|dont go|don't go|what was that|terrifying|scream|screaming|creepy|nope)\b/i,

    angry:
      /\b(?:mad|angry|annoying|unfair|rigged|this sucks|bruh no|not fair|i hate this|why game|so bad|frustrating|rage|raging)\b/i,

    funny:
      /\b(?:lol+|lo+|lmao+|lmfao+|rofl+|haha+|hehe+|xd+|kekw|kek|lulw?|omegalul|pogs|im dead|i'm dead|im weak|i'm weak|dead af|crying|dying|im crying|i'm crying|thats funny|that's funny|too funny|im wheezing|i'm wheezing|bruh|nahhh+)\b|😂|🤣|💀|😭|😹|😆|🤡/i
  };

  function detectCategory(message) {
    // Prioritize specific categories over general laughter.
    const priority = [
      "support",
      "greeting",
      "horror",
      "angry",
      "win",
      "funny"
    ];

    for (const category of priority) {
      if (categoryPatterns[category].test(message)) {
        return category;
      }
    }

    return null;
  }

  // ==========================================
  // MESSAGE VARIETY
  // ==========================================

  const recentMessages = [];

  function generateReaction(category, burstMessages) {
    const pool = reactions[category] || reactions.general;

    let message;
    let attempts = 0;

    do {
      message = randomItem(pool)();
      attempts++;
    } while (
      (recentMessages.includes(message) ||
        burstMessages.has(message)) &&
      attempts < 40
    );

    burstMessages.add(message);
    recentMessages.push(message);

    if (recentMessages.length > MAX_RECENT_MESSAGES) {
      recentMessages.shift();
    }

    return message;
  }

  // ==========================================
  // CREATE DEMO CHAT MESSAGE
  // ==========================================

  function makeFakeMessage(category, burstMessages) {
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
    name.textContent = username + " [DEMO]:";
    name.style.color = getUsernameColor(username, platform);

    const content = document.createElement("span");

    content.className = "hl-content";
    content.dir = "auto";

    content.appendChild(
      document.createTextNode(
        generateReaction(category, burstMessages)
      )
    );

    addRealEmotes(content, platform);

    message.append(icon, name, content);
    row.appendChild(message);

    return row;
  }

  // ==========================================
  // RANDOMIZED REACTION TIMING
  // ==========================================

  function scheduleBurst(sourceRow, category) {
    const total = randomNumber(
      MIN_REACTIONS,
      MAX_REACTIONS
    );

    const burstMessages = new Set();

    let previousRow = sourceRow;
    let elapsed = 0;
    let scheduled = 0;

    // Support-style messages appear in small groups.
    const isSupport = category === "support";

    while (scheduled < total) {
      const groupSize = isSupport
        ? Math.min(randomNumber(3, 4), total - scheduled)
        : total - scheduled;

      for (let i = 0; i < groupSize; i++) {
        elapsed += randomNumber(
          MIN_MESSAGE_DELAY,
          MAX_MESSAGE_DELAY
        );

        const delay = elapsed;

        window.setTimeout(() => {
          if (!sourceRow.isConnected) return;

          if (!previousRow.isConnected) {
            previousRow = sourceRow;
          }

          const fakeRow = makeFakeMessage(
            category,
            burstMessages
          );

          if (previousRow.parentNode) {
            previousRow.parentNode.insertBefore(
              fakeRow,
              previousRow.nextSibling
            );

            previousRow = fakeRow;
          }
        }, delay);

        scheduled++;
      }

      if (isSupport && scheduled < total) {
        elapsed += randomNumber(
          MIN_GROUP_DELAY,
          MAX_GROUP_DELAY
        );
      }
    }
  }

  // ==========================================
  // MESSAGE TRIGGER
  // ==========================================

  function getMessageText(content) {
    const text = content.textContent || "";

    const imageNames = [
      ...content.querySelectorAll("img")
    ].map(img =>
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
    if (!sourceRow) return;

    if (sourceRow.dataset.ssnFakeReaction === "1") return;
    if (sourceRow.dataset.ssnLolProcessed === "1") return;

    // Only inspect the message content, never the username.
    const content = sourceRow.querySelector(".hl-content");

    if (!content) return;

    collectEmotes(sourceRow);

    const messageText = getMessageText(content);
    const category = detectCategory(messageText);

    if (!category) return;

    sourceRow.dataset.ssnLolProcessed = "1";

    scheduleBurst(sourceRow, category);
  }

  // ==========================================
  // DOM OBSERVER
  // ==========================================

  function inspect(node) {
    if (!(node instanceof Element)) return;

    if (node.matches(".highlight-chat")) {
      collectEmotes(node);
      addReactions(node);
    }

    node.querySelectorAll(".highlight-chat").forEach(row => {
      collectEmotes(row);
      addReactions(row);
    });

    const parentRow = node.closest(".highlight-chat");

    if (parentRow) {
      collectEmotes(parentRow);
      addReactions(parentRow);
    }
  }

  // Process messages already present.
  document.querySelectorAll(
    '.highlight-chat:not([data-ssn-fake-reaction="1"])'
  ).forEach(row => {
    collectEmotes(row);
    addReactions(row);
  });

  const observer = new MutationObserver(mutations => {
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

      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          inspect(node);
        } else if (node.nodeType === Node.TEXT_NODE) {
          const row = node.parentElement?.closest(
            ".highlight-chat"
          );

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

  console.info(
    "[SSN Demo Reactions] Loaded successfully."
  );
})();
