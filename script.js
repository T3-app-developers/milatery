const weapons = [
  {
    name: "Railstorm Cannon",
    category: "Artillery",
    damage: 85,
    buildTime: 6,
    description: "Electromagnetic siege cannon that launches hyper-velocity slugs capable of tearing through fortress walls.",
  },
  {
    name: "Specter Drone",
    category: "Air Support",
    damage: 40,
    buildTime: 3,
    description: "Stealth micro-drone equipped with adaptive optics and guided micro-missiles.",
  },
  {
    name: "Aegis Shield",
    category: "Defense",
    damage: 10,
    buildTime: 2,
    description: "Deployable barrier generator that projects a semi-solid energy wall against incoming fire.",
  },
  {
    name: "Tempest Lance",
    category: "Infantry",
    damage: 55,
    buildTime: 4,
    description: "High-frequency plasma lance ideal for close-quarters breaching operations.",
  },
  {
    name: "Thunderhowl MLRS",
    category: "Artillery",
    damage: 70,
    buildTime: 5,
    description: "Multi-launch rocket system firing cascades of smart missiles that adjust trajectories mid-flight.",
  },
  {
    name: "Glacier Rail",
    category: "Support",
    damage: 30,
    buildTime: 2,
    description: "Cryogenic beam emitter that slows enemy movement and weakens armor plating.",
  },
  {
    name: "Nova Repeater",
    category: "Infantry",
    damage: 45,
    buildTime: 3,
    description: "Pulse rifle with reactor-backed capacitors for rapid bursts of plasma fire.",
  },
  {
    name: "Skyhammer Drone",
    category: "Air Support",
    damage: 60,
    buildTime: 4,
    description: "Heavy airframe drone with twin railguns and autonomous target selection.",
  },
];

const enemies = [
  {
    name: "Ironclad Legion",
    armor: 90,
    strength: 75,
    description: "Mechanized infantry with layered plating and coordinated assault tactics.",
  },
  {
    name: "Nebula Corsairs",
    armor: 55,
    strength: 65,
    description: "Pirate fleet specializing in hit-and-run aerial raids.",
  },
  {
    name: "Sable Warden",
    armor: 70,
    strength: 80,
    description: "Experimental AI-controlled war machine with adaptive shielding.",
  },
];

const state = {
  inventory: [],
  selectedWeapon: null,
  enemy: enemies[Math.floor(Math.random() * enemies.length)],
};

const searchInput = document.querySelector("#weapon-search");
const buildButton = document.querySelector("#build-button");
const searchResults = document.querySelector("#search-results");
const factoryOutput = document.querySelector("#factory-output");
const inventoryList = document.querySelector("#inventory-list");
const totalDamage = document.querySelector("#total-damage");
const engageButton = document.querySelector("#engage-button");
const battleLog = document.querySelector("#battle-log");
const enemyName = document.querySelector("#enemy-name");
const enemyDescription = document.querySelector("#enemy-description");
const enemyArmor = document.querySelector("#enemy-armor");
const enemyStrength = document.querySelector("#enemy-strength");
const battleArena = document.querySelector("#battle-arena");
const arenaCanvas = document.querySelector("#arena-canvas");
const playerHealthDisplay = document.querySelector("#player-health");
const enemyHealthDisplay = document.querySelector("#enemy-health");

let battleInProgress = false;
let defeatSoundContext = null;

function totalInventoryDamage() {
  return state.inventory.reduce((sum, weapon) => sum + weapon.damage, 0);
}

function formatWeapon(weapon) {
  const container = document.createElement("article");
  container.className = "weapon-card";
  container.innerHTML = `
    <h3>${weapon.name}</h3>
    <p>${weapon.description}</p>
    <div class="weapon-stats">
      <span><strong>Category:</strong> ${weapon.category}</span>
      <span><strong>Damage:</strong> ${weapon.damage}</span>
      <span><strong>Build Time:</strong> ${weapon.buildTime} hrs</span>
    </div>
  `;
  return container;
}

function renderSearchResults(query) {
  searchResults.innerHTML = "";
  if (!query) {
    return;
  }
  const matches = weapons.filter((weapon) => weapon.name.toLowerCase().includes(query.toLowerCase()));

  if (!matches.length) {
    const noMatch = document.createElement("div");
    noMatch.className = "search-result";
    noMatch.textContent = "No schematics located. Try another designation.";
    searchResults.appendChild(noMatch);
    state.selectedWeapon = null;
    return;
  }

  matches.forEach((weapon) => {
    const option = document.createElement("button");
    option.className = "search-result";
    option.type = "button";
    option.textContent = `${weapon.name} · ${weapon.category}`;
    option.addEventListener("click", () => {
      state.selectedWeapon = weapon;
      searchInput.value = weapon.name;
      renderFactory(weapon);
      searchResults.innerHTML = "";
    });
    searchResults.appendChild(option);
  });

  if (matches.length === 1) {
    state.selectedWeapon = matches[0];
  }
}

function renderFactory(weapon) {
  factoryOutput.innerHTML = "";
  if (!weapon) {
    return;
  }
  factoryOutput.appendChild(formatWeapon(weapon));
}

function renderInventory() {
  inventoryList.innerHTML = "";
  if (!state.inventory.length) {
    const empty = document.createElement("li");
    empty.className = "inventory-item";
    empty.textContent = "Inventory empty. Build a weapon to deploy.";
    inventoryList.appendChild(empty);
  } else {
    state.inventory.forEach((weapon) => {
      const item = document.createElement("li");
      item.className = "inventory-item";
      item.innerHTML = `
        <span>${weapon.name}</span>
        <span>Damage ${weapon.damage}</span>
      `;
      inventoryList.appendChild(item);
    });
  }

  const total = totalInventoryDamage();
  totalDamage.textContent = total;
}

function buildWeapon() {
  let weapon = state.selectedWeapon;
  const query = searchInput.value.trim().toLowerCase();

  if (!weapon && query) {
    weapon = weapons.find((w) => w.name.toLowerCase() === query);
  }

  if (!weapon) {
    battleLog.innerHTML = "";
    battleLog.appendChild(document.createElement("p")).textContent =
      "Fabrication failed: schematic not recognized.";
    return;
  }

  factoryOutput.innerHTML = "";
  const card = formatWeapon(weapon);
  factoryOutput.appendChild(card);

  card.animate(
    [
      { transform: "perspective(700px) rotateX(15deg) translateY(-20px)", opacity: 0 },
      { transform: "perspective(700px) rotateX(6deg) translateY(0)", opacity: 1 },
    ],
    { duration: 450, easing: "cubic-bezier(.18,.89,.32,1.28)" }
  );

  setTimeout(() => {
    state.inventory.push(weapon);
    state.selectedWeapon = null;
    searchInput.value = "";
    renderInventory();
    battleLog.innerHTML = "";
    battleLog.appendChild(document.createElement("p")).textContent = `${weapon.name} added to inventory.`;
  }, 500);
}

function renderEnemy() {
  const { enemy } = state;
  enemyName.textContent = enemy.name;
  enemyDescription.textContent = enemy.description;
  enemyArmor.textContent = enemy.armor;
  enemyStrength.textContent = enemy.strength;
}

function engageBattle() {
  battleLog.innerHTML = "";

  if (battleInProgress) {
    battleLog.appendChild(document.createElement("p")).textContent =
      "Battle already in progress. Finish the encounter before launching another.";
    return;
  }

  if (!state.inventory.length) {
    battleLog.appendChild(document.createElement("p")).textContent =
      "You have no weapons equipped. Build something before engaging.";
    return;
  }

  if (!arenaCanvas || !arenaCanvas.getContext) {
    battleLog.appendChild(document.createElement("p")).textContent =
      "Battle arena offline: your browser does not support the necessary visuals.";
    return;
  }

  const ctx = arenaCanvas.getContext("2d");
  if (!ctx) {
    battleLog.appendChild(document.createElement("p")).textContent =
      "Battle arena systems failed to initialize.";
    return;
  }

  startBattleSimulation(ctx);
}

function playDefeatSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      return;
    }

    if (!defeatSoundContext) {
      defeatSoundContext = new AudioCtx();
    }

    if (typeof defeatSoundContext.resume === "function" && defeatSoundContext.state === "suspended") {
      const resumeAttempt = defeatSoundContext.resume();
      if (resumeAttempt && typeof resumeAttempt.catch === "function") {
        resumeAttempt.catch(() => {});
      }
    }

    const now = defeatSoundContext.currentTime;
    const oscillator = defeatSoundContext.createOscillator();
    const gain = defeatSoundContext.createGain();
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(280, now);
    oscillator.frequency.exponentialRampToValueAtTime(60, now + 1.2);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
    oscillator.connect(gain).connect(defeatSoundContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 1.35);
  } catch (error) {
    // Audio feedback is optional; ignore failures silently.
  }
}

function startBattleSimulation(ctx) {
  battleInProgress = true;
  const enemySnapshot = { ...state.enemy };
  const totalFirepower = totalInventoryDamage();

  const groundY = arenaCanvas.height - 110;
  const gravity = 2200;

  const player = {
    width: 60,
    height: 92,
    x: 140,
    y: groundY - 92,
    vx: 0,
    vy: 0,
    speed: 340,
    jumpVelocity: 880,
    health: 120 + Math.min(140, totalFirepower * 0.45),
    attackPower: Math.max(12, Math.round(totalFirepower * 0.45)),
    attackCooldown: 420,
    lastAttack: 0,
    attackTimer: 0,
  };

  const enemy = {
    width: 70,
    height: 100,
    x: arenaCanvas.width - 220,
    y: groundY - 100,
    vx: 0,
    vy: 0,
    speed: 260,
    jumpVelocity: 780,
    health: Math.round(enemySnapshot.armor * 1.25 + enemySnapshot.strength * 1.1),
    attackPower: Math.max(10, Math.round(enemySnapshot.strength * 0.35)),
    attackCooldown: 920,
    lastAttack: 0,
    attackTimer: 0,
  };

  const playerMaxHealth = player.health;
  const enemyMaxHealth = enemy.health;

  if (playerHealthDisplay) {
    playerHealthDisplay.textContent = Math.round(player.health);
  }
  if (enemyHealthDisplay) {
    enemyHealthDisplay.textContent = Math.round(enemy.health);
  }

  const controls = {
    left: false,
    right: false,
    jump: false,
    attack: false,
  };

  let requestId;
  let lastTimestamp;
  let outcome = null;
  let slowMotionFactor = 1;
  let explosionRadius = 0;
  let glowPulse = 0;

  function handleKeyDown(event) {
    const key = event.key;
    if (["ArrowLeft", "a", "A"].includes(key)) {
      controls.left = true;
      event.preventDefault();
    }
    if (["ArrowRight", "d", "D"].includes(key)) {
      controls.right = true;
      event.preventDefault();
    }
    if (["ArrowUp", "w", "W"].includes(key)) {
      controls.jump = true;
      event.preventDefault();
    }
    if (key === " " || event.code === "Space") {
      if (!event.repeat) {
        controls.attack = true;
      }
      event.preventDefault();
    }
  }

  function handleKeyUp(event) {
    const key = event.key;
    if (["ArrowLeft", "a", "A"].includes(key)) {
      controls.left = false;
    }
    if (["ArrowRight", "d", "D"].includes(key)) {
      controls.right = false;
    }
    if (["ArrowUp", "w", "W"].includes(key)) {
      controls.jump = false;
    }
    if (key === " " || event.code === "Space") {
      controls.attack = false;
    }
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function update(delta, now) {
    if (!outcome) {
      player.vx = 0;
      if (controls.left) {
        player.vx -= player.speed;
      }
      if (controls.right) {
        player.vx += player.speed;
      }

      if (controls.jump && player.y + player.height >= groundY - 1) {
        player.vy = -player.jumpVelocity;
        controls.jump = false;
      }

      player.vy += gravity * delta;
      player.x += player.vx * delta;
      player.y += player.vy * delta;

      if (player.y + player.height >= groundY) {
        player.y = groundY - player.height;
        player.vy = 0;
      }

      player.x = clamp(player.x, 60, arenaCanvas.width - player.width - 60);

      if (controls.attack && now - player.lastAttack > player.attackCooldown) {
        player.lastAttack = now;
        player.attackTimer = 0.25;
        const distance = Math.abs(player.x + player.width / 2 - (enemy.x + enemy.width / 2));
        if (distance < 110 && Math.abs(player.y - enemy.y) < 120) {
          enemy.health -= player.attackPower;
          enemy.attackTimer = 0.15;
          if (enemyHealthDisplay) {
            enemyHealthDisplay.textContent = Math.max(0, Math.round(enemy.health));
          }
        }
      }

      const distanceToPlayer = player.x + player.width / 2 - (enemy.x + enemy.width / 2);
      if (Math.abs(distanceToPlayer) > 90) {
        enemy.vx = enemy.speed * (distanceToPlayer > 0 ? 1 : -1);
      } else {
        enemy.vx = 0;
      }

      enemy.vy += gravity * delta;
      enemy.x += enemy.vx * delta;
      enemy.y += enemy.vy * delta;

      if (enemy.y + enemy.height >= groundY) {
        enemy.y = groundY - enemy.height;
        enemy.vy = 0;
      }

      enemy.x = clamp(enemy.x, 60, arenaCanvas.width - enemy.width - 60);

      if (Math.abs(distanceToPlayer) < 110 && now - enemy.lastAttack > enemy.attackCooldown) {
        enemy.lastAttack = now;
        enemy.attackTimer = 0.35;
        player.health -= enemy.attackPower;
        if (playerHealthDisplay) {
          playerHealthDisplay.textContent = Math.max(0, Math.round(player.health));
        }
      }

      if (!outcome && enemy.health <= 0) {
        outcome = "victory";
        controls.left = false;
        controls.right = false;
        controls.jump = false;
        setTimeout(() => finalizeBattle(true), 700);
      }

      if (!outcome && player.health <= 0) {
        outcome = "defeat";
        controls.left = false;
        controls.right = false;
        controls.jump = false;
        triggerDefeatSequence();
      }
    }

    controls.attack = false;

    if (player.attackTimer > 0) {
      player.attackTimer = Math.max(0, player.attackTimer - delta * 2.8);
    }

    if (enemy.attackTimer > 0) {
      enemy.attackTimer = Math.max(0, enemy.attackTimer - delta * 2.2);
    }
  }

  function render(delta) {
    glowPulse += delta * 1.2;
    const gradient = ctx.createLinearGradient(0, 0, arenaCanvas.width, arenaCanvas.height);
    gradient.addColorStop(0, "#061223");
    gradient.addColorStop(1, "#0a1c33");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, arenaCanvas.width, arenaCanvas.height);

    ctx.fillStyle = "rgba(20, 40, 60, 0.9)";
    ctx.fillRect(0, groundY, arenaCanvas.width, arenaCanvas.height - groundY);
    ctx.fillStyle = "rgba(63, 224, 197, 0.25)";
    ctx.fillRect(0, groundY - 8, arenaCanvas.width, 8);

    ctx.save();
    ctx.shadowColor = "rgba(63, 224, 197, 0.55)";
    ctx.shadowBlur = 25 + Math.sin(glowPulse) * 10;
    ctx.fillStyle = "#1adfbd";
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.restore();

    if (player.attackTimer > 0) {
      ctx.fillStyle = "rgba(63, 224, 197, 0.6)";
      const swingWidth = 70 + Math.sin(player.attackTimer * 12) * 10;
      ctx.fillRect(player.x + player.width, player.y + 20, swingWidth, 12);
    }

    ctx.save();
    ctx.shadowColor = "rgba(255, 95, 125, 0.65)";
    ctx.shadowBlur = 30 + Math.cos(glowPulse) * 12;
    ctx.fillStyle = "#ff5f7d";
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    ctx.restore();

    if (enemy.attackTimer > 0) {
      ctx.fillStyle = "rgba(255, 95, 125, 0.4)";
      const punchOffset = 60 + Math.sin(enemy.attackTimer * 18) * 12;
      ctx.fillRect(enemy.x - punchOffset, enemy.y + 30, punchOffset, 14);
    }

    const hudMargin = 40;
    ctx.fillStyle = "rgba(6, 12, 25, 0.7)";
    ctx.fillRect(hudMargin, hudMargin, 260, 12);
    ctx.fillRect(arenaCanvas.width - hudMargin - 260, hudMargin, 260, 12);

    ctx.fillStyle = "rgba(63, 224, 197, 0.85)";
    ctx.fillRect(hudMargin, hudMargin, 260 * clamp(player.health / playerMaxHealth, 0, 1), 12);
    ctx.fillStyle = "rgba(255, 95, 125, 0.85)";
    ctx.fillRect(
      arenaCanvas.width - hudMargin - 260 + (260 - 260 * clamp(enemy.health / enemyMaxHealth, 0, 1)),
      hudMargin,
      260 * clamp(enemy.health / enemyMaxHealth, 0, 1),
      12
    );

    if (outcome === "victory") {
      ctx.fillStyle = "rgba(63, 224, 197, 0.25)";
      const pulse = 50 + Math.sin(glowPulse * 2) * 20;
      ctx.beginPath();
      ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, pulse, 0, Math.PI * 2);
      ctx.fill();
    }

    if (outcome === "defeat") {
      explosionRadius += delta * 420;
      ctx.fillStyle = "rgba(255, 120, 140, 0.35)";
      ctx.beginPath();
      ctx.arc(player.x + player.width / 2, player.y + player.height / 2, explosionRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255, 200, 140, 0.25)";
      ctx.beginPath();
      ctx.arc(player.x + player.width / 2, player.y + player.height / 2, explosionRadius * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop(timestamp) {
    if (!lastTimestamp) {
      lastTimestamp = timestamp;
    }
    let delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (outcome === "defeat") {
      delta *= slowMotionFactor;
    }

    update(delta, timestamp);
    render(delta);

    if (battleInProgress) {
      requestId = requestAnimationFrame(loop);
    }
  }

  function cleanupAfterBattle() {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
    if (requestId) {
      cancelAnimationFrame(requestId);
      requestId = null;
    }
    battleInProgress = false;
  }

  function finalizeBattle(playerWon) {
    cleanupAfterBattle();

    setTimeout(() => {
      if (battleArena) {
        battleArena.classList.remove("active", "defeat", "shake");
        battleArena.setAttribute("aria-hidden", "true");
      }
    }, playerWon ? 200 : 0);

    battleLog.innerHTML = "";
    const outcomeParagraph = document.createElement("p");
    const detailParagraph = document.createElement("p");
    const strengthParagraph = document.createElement("p");

    if (playerWon) {
      outcomeParagraph.textContent = `Victory! ${enemySnapshot.name} collapse under your assault.`;
      detailParagraph.textContent = `Your arsenal delivered ${totalFirepower} damage, overwhelming their ${enemySnapshot.armor} armor rating.`;
    } else {
      outcomeParagraph.textContent = `Defeat. ${enemySnapshot.name} counterattack succeeds.`;
      detailParagraph.textContent = `Your ${totalFirepower} damage output couldn't shatter their ${enemySnapshot.armor} armor. Recalibrate your loadout and try again.`;
    }

    strengthParagraph.textContent = `Enemy counter strength measured at ${enemySnapshot.strength}.`;
    battleLog.append(outcomeParagraph, detailParagraph, strengthParagraph);

    state.enemy = enemies[Math.floor(Math.random() * enemies.length)];
    renderEnemy();
  }

  function triggerDefeatSequence() {
    slowMotionFactor = 0.35;
    if (battleArena) {
      battleArena.classList.add("defeat", "shake");
    }
    playDefeatSound();
    setTimeout(() => {
      if (battleArena) {
        battleArena.classList.remove("shake");
      }
    }, 900);
    setTimeout(() => finalizeBattle(false), 1700);
  }

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  if (battleArena) {
    battleArena.classList.remove("defeat", "shake");
    battleArena.classList.add("active");
    battleArena.setAttribute("aria-hidden", "false");
  }

  requestId = requestAnimationFrame(loop);
}

searchInput.addEventListener("input", (event) => {
  renderSearchResults(event.target.value);
});

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    buildWeapon();
  }
});

buildButton.addEventListener("click", buildWeapon);
engageButton.addEventListener("click", engageBattle);

renderInventory();
renderEnemy();
