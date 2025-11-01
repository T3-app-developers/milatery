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
const battleOverlay = document.querySelector("#battle-overlay");
const battleCanvas = document.querySelector("#battle-canvas");
const battleCtx = battleCanvas ? battleCanvas.getContext("2d") : null;
const battleStageStatus = document.querySelector("#battle-stage-status");
const exitBattleButton = document.querySelector("#exit-battle");

const platformGame = {
  active: false,
  running: false,
  status: "idle",
  keys: {
    left: false,
    right: false,
    up: false,
    down: false,
  },
  projectiles: [],
  enemyProjectiles: [],
  lastShot: 0,
  enemyLastShot: 0,
  lastTimestamp: 0,
  player: null,
  enemy: null,
  bloodPool: null,
  opponentName: "",
};

const GRAVITY = 1600;
const PLAYER_FRICTION = 0.82;

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

  const total = state.inventory.reduce((sum, weapon) => sum + weapon.damage, 0);
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

function startPlatformBattle() {
  if (platformGame.active) {
    return;
  }

  battleLog.innerHTML = "";

  if (!state.inventory.length) {
    battleLog.appendChild(document.createElement("p")).textContent =
      "You have no weapons equipped. Build something before engaging.";
    return;
  }

  if (!battleCanvas || !battleCtx) {
    battleLog.appendChild(document.createElement("p")).textContent =
      "Combat simulator unavailable: canvas rendering is not supported in this browser.";
    return;
  }

  const totalFirepower = state.inventory.reduce((sum, weapon) => sum + weapon.damage, 0);
  const averageFirepower = totalFirepower / Math.max(1, state.inventory.length);
  const playerDamage = Math.max(14, Math.min(150, Math.round(averageFirepower || totalFirepower || 20)));
  const playerHealth = 120 + Math.min(60, Math.round(totalFirepower * 0.15));
  const enemyHealth = Math.max(90, Math.round(state.enemy.armor * 0.85 + state.enemy.strength * 1.2));
  const enemyDamage = Math.max(10, Math.round(state.enemy.strength / 2));

  platformGame.active = true;
  platformGame.running = true;
  platformGame.status = "running";
  platformGame.projectiles = [];
  platformGame.enemyProjectiles = [];
  platformGame.lastShot = 0;
  platformGame.enemyLastShot = 0;
  platformGame.lastTimestamp = 0;
  platformGame.bloodPool = null;
  platformGame.opponentName = state.enemy.name;

  const ground = battleCanvas.height - 70;

  platformGame.player = {
    x: 80,
    y: ground - 72,
    width: 48,
    height: 64,
    vx: 0,
    vy: 0,
    speed: 320,
    jumpPower: 760,
    health: playerHealth,
    maxHealth: playerHealth,
    damage: playerDamage,
  };

  platformGame.enemy = {
    x: battleCanvas.width - 200,
    y: ground - 90,
    width: 78,
    height: 82,
    speed: 140,
    direction: -1,
    floatTimer: 0,
    baseY: ground - 90,
    health: enemyHealth,
    maxHealth: enemyHealth,
    damage: enemyDamage,
    strength: state.enemy.strength,
  };

  battleStageStatus.textContent = `${state.enemy.name} sighted. Weapons hot!`;
  battleOverlay.classList.remove("hidden");
  document.body.classList.add("no-scroll");

  if (exitBattleButton) {
    exitBattleButton.focus();
  }

  if (!platformGame.keys) {
    platformGame.keys = { left: false, right: false, up: false, down: false };
  } else {
    Object.keys(platformGame.keys).forEach((key) => {
      platformGame.keys[key] = false;
    });
  }

  requestAnimationFrame(updatePlatformBattle);
}

function updatePlatformBattle(timestamp) {
  if (!platformGame.active || !battleCtx || !battleCanvas) {
    return;
  }

  const delta = platformGame.lastTimestamp ? (timestamp - platformGame.lastTimestamp) / 1000 : 0;
  platformGame.lastTimestamp = timestamp;

  if (platformGame.running) {
    updatePlayer(delta);
    updateEnemy(delta, timestamp);
    updateProjectiles(delta);
  } else if (platformGame.status === "defeat" && platformGame.bloodPool) {
    platformGame.bloodPool.radius = Math.min(platformGame.bloodPool.radius + 60 * delta, platformGame.bloodPool.maxRadius);
  }

  drawPlatformBattle();

  if (platformGame.active) {
    requestAnimationFrame(updatePlatformBattle);
  }
}

function updatePlayer(delta) {
  const player = platformGame.player;
  if (!player) {
    return;
  }

  const ground = battleCanvas.height - 70;

  if (platformGame.keys.left) {
    player.vx = -player.speed;
  } else if (platformGame.keys.right) {
    player.vx = player.speed;
  } else {
    player.vx *= PLAYER_FRICTION;
    if (Math.abs(player.vx) < 2) {
      player.vx = 0;
    }
  }

  if (platformGame.keys.up && player.y + player.height >= ground - 1) {
    player.vy = -player.jumpPower;
  }

  if (platformGame.keys.down && player.y + player.height < ground) {
    player.vy += GRAVITY * delta * 0.6;
  }

  player.vy += GRAVITY * delta;
  player.x += player.vx * delta;
  player.y += player.vy * delta;

  if (player.x < 40) {
    player.x = 40;
  }

  if (player.x + player.width > battleCanvas.width - 40) {
    player.x = battleCanvas.width - 40 - player.width;
  }

  if (player.y + player.height >= ground) {
    player.y = ground - player.height;
    player.vy = 0;
  }
}

function updateEnemy(delta, timestamp) {
  const enemy = platformGame.enemy;
  if (!enemy) {
    return;
  }

  const leftBound = battleCanvas.width * 0.55;
  const rightBound = battleCanvas.width - 60 - enemy.width;

  enemy.floatTimer += delta * 1.5;
  enemy.x += enemy.direction * enemy.speed * delta;

  if (enemy.x <= leftBound || enemy.x >= rightBound) {
    enemy.direction *= -1;
    enemy.x = Math.max(leftBound, Math.min(rightBound, enemy.x));
  }

  enemy.y = enemy.baseY + Math.sin(enemy.floatTimer) * 12;

  const now = timestamp;
  const fireDelay = Math.max(650, 1600 - (enemy.strength || 60) * 8);

  if (now - platformGame.enemyLastShot > fireDelay) {
    platformGame.enemyLastShot = now;
    platformGame.enemyProjectiles.push({
      x: enemy.x - 12,
      y: enemy.y + enemy.height / 2 - 6,
      width: 18,
      height: 12,
      vx: -360,
      vy: 0,
      damage: enemy.damage,
    });
  }
}

function updateProjectiles(delta) {
  const player = platformGame.player;
  const enemy = platformGame.enemy;

  platformGame.projectiles = platformGame.projectiles.filter((projectile) => {
    projectile.x += projectile.vx * delta;
    projectile.y += projectile.vy * delta;

    if (enemy && rectsIntersect(projectile, enemy)) {
      enemy.health = Math.max(0, enemy.health - projectile.damage);
      if (enemy.health <= 0) {
        handleVictory();
      }
      return false;
    }

    return projectile.x <= battleCanvas.width + 50;
  });

  platformGame.enemyProjectiles = platformGame.enemyProjectiles.filter((projectile) => {
    projectile.x += projectile.vx * delta;
    projectile.y += projectile.vy * delta;

    if (player && rectsIntersect(projectile, player)) {
      player.health = Math.max(0, player.health - projectile.damage);
      if (player.health <= 0) {
        handleDefeat();
      }
      return false;
    }

    return projectile.x + projectile.width >= -50;
  });
}

function drawPlatformBattle() {
  if (!battleCtx || !battleCanvas) {
    return;
  }

  const ctx = battleCtx;
  const canvas = battleCanvas;
  const player = platformGame.player;
  const enemy = platformGame.enemy;
  const ground = canvas.height - 60;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#061429");
  sky.addColorStop(0.6, "#091a33");
  sky.addColorStop(1, "#040915");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(30, 52, 84, 0.9)";
  ctx.fillRect(0, ground, canvas.width, canvas.height - ground);
  ctx.fillStyle = "rgba(94, 148, 255, 0.2)";
  ctx.fillRect(0, ground - 10, canvas.width, 10);

  if (platformGame.status === "defeat" && platformGame.bloodPool) {
    const pool = platformGame.bloodPool;
    ctx.fillStyle = "rgba(200, 16, 30, 0.85)";
    ctx.beginPath();
    ctx.ellipse(pool.x, ground + 6, pool.radius * 1.4, pool.radius, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (player) {
    ctx.save();
    if (platformGame.status === "defeat") {
      ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
      ctx.rotate(Math.PI / 2.4);
      ctx.fillStyle = "#3fe0c5";
      ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
    } else {
      ctx.fillStyle = "#3fe0c5";
      ctx.fillRect(player.x, player.y, player.width, player.height);
      ctx.fillStyle = "#0f192e";
      ctx.fillRect(player.x + player.width - 12, player.y + 18, 18, 12);
    }
    ctx.restore();
  }

  if (enemy) {
    ctx.fillStyle = "#ff6f8f";
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillRect(enemy.x - 8, enemy.y + enemy.height / 2 - 24, 8, 48);
  }

  ctx.fillStyle = "#6ff6ff";
  platformGame.projectiles.forEach((projectile) => {
    ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
  });

  ctx.fillStyle = "#ffad5c";
  platformGame.enemyProjectiles.forEach((projectile) => {
    ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
  });

  drawHealthBar(30, 24, 220, 12, player ? player.health : 0, player ? player.maxHealth : 1, "#3fe0c5", "Your Mech");
  drawHealthBar(
    battleCanvas.width - 250,
    24,
    220,
    12,
    enemy ? enemy.health : 0,
    enemy ? enemy.maxHealth : 1,
    "#ff6f8f",
    platformGame.opponentName || state.enemy.name
  );

  if (platformGame.status === "victory") {
    ctx.fillStyle = "rgba(111, 246, 255, 0.25)";
    ctx.font = "28px 'Orbitron', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${platformGame.opponentName} neutralized`, canvas.width / 2, 110);
  } else if (platformGame.status === "defeat") {
    ctx.fillStyle = "rgba(255, 90, 90, 0.4)";
    ctx.font = "28px 'Orbitron', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`Critical damage sustained by ${platformGame.opponentName}`, canvas.width / 2, 110);
  }
}

function drawHealthBar(x, y, width, height, value, max, color, label) {
  const ctx = battleCtx;
  if (!ctx) {
    return;
  }

  ctx.save();
  ctx.fillStyle = "rgba(5, 12, 25, 0.7)";
  ctx.fillRect(x - 4, y - 18, width + 8, height + 32);
  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  ctx.font = "12px 'Orbitron', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(label, x, y - 6);

  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  ctx.fillStyle = "rgba(18, 28, 46, 0.9)";
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width * pct, height);
  ctx.restore();
}

function rectsIntersect(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function attemptPlayerFire(timestamp) {
  if (!platformGame.running || !platformGame.player) {
    return;
  }

  const now = timestamp || performance.now();
  const fireDelay = Math.max(140, 420 - platformGame.player.damage);

  if (now - platformGame.lastShot < fireDelay) {
    return;
  }

  platformGame.lastShot = now;
  const player = platformGame.player;

  platformGame.projectiles.push({
    x: player.x + player.width,
    y: player.y + player.height / 2 - 4,
    width: 22,
    height: 8,
    vx: 620,
    vy: 0,
    damage: player.damage,
  });
}

function handleVictory() {
  if (platformGame.status !== "running") {
    return;
  }

  platformGame.running = false;
  platformGame.status = "victory";
  const defeatedEnemy = state.enemy;
  battleStageStatus.textContent = `Victory! ${defeatedEnemy.name} neutralized.`;

  platformGame.enemyProjectiles = [];
  platformGame.projectiles = [];

  battleLog.innerHTML = "";
  const summary = document.createElement("p");
  summary.textContent = `Victory! The ${defeatedEnemy.name} are overwhelmed in a hail of fire.`;
  const detail = document.createElement("p");
  detail.textContent = `Your weapon blasts dealt ${platformGame.player.damage} damage per hit, tearing through their ${defeatedEnemy.armor}-point armor.`;
  battleLog.append(summary, detail);

  state.enemy = enemies[Math.floor(Math.random() * enemies.length)];
  renderEnemy();
}

function handleDefeat() {
  if (platformGame.status !== "running") {
    return;
  }

  platformGame.running = false;
  platformGame.status = "defeat";
  const opposingForce = state.enemy;
  battleStageStatus.textContent = `Critical damage. ${opposingForce.name} hold the line.`;

  platformGame.enemyProjectiles = [];
  platformGame.projectiles = [];

  const player = platformGame.player;
  if (player) {
    player.y = battleCanvas.height - 70 - player.height;
    player.vx = 0;
    player.vy = 0;
    platformGame.bloodPool = {
      x: player.x + player.width / 2,
      radius: 28,
      maxRadius: 120,
    };
  }

  battleLog.innerHTML = "";
  const summary = document.createElement("p");
  summary.textContent = `Defeat. ${opposingForce.name} repel the assault.`;
  const detail = document.createElement("p");
  detail.textContent = "You are torn from the cockpit and hit the ground in a dramatic crimson splash.";
  battleLog.append(summary, detail);

  state.enemy = enemies[Math.floor(Math.random() * enemies.length)];
  renderEnemy();
}

function closeBattleOverlay(aborted) {
  if (!battleOverlay.classList.contains("hidden")) {
    battleOverlay.classList.add("hidden");
  }

  if (aborted && platformGame.status === "running") {
    battleLog.innerHTML = "";
    battleLog.appendChild(document.createElement("p")).textContent =
      "Mission aborted mid-flight. Enemy forces regroup for another strike.";
  }

  platformGame.active = false;
  platformGame.running = false;
  platformGame.status = "idle";
  platformGame.projectiles = [];
  platformGame.enemyProjectiles = [];
  platformGame.player = null;
  platformGame.enemy = null;
  platformGame.bloodPool = null;
  platformGame.opponentName = "";

  battleStageStatus.textContent = "";
  document.body.classList.remove("no-scroll");
}

function handleKeyDown(event) {
  if (!platformGame.active) {
    return;
  }

  if (event.code === "Escape") {
    event.preventDefault();
    closeBattleOverlay(true);
    return;
  }

  switch (event.code) {
    case "KeyA":
    case "ArrowLeft":
      event.preventDefault();
      platformGame.keys.left = true;
      break;
    case "KeyD":
    case "ArrowRight":
      event.preventDefault();
      platformGame.keys.right = true;
      break;
    case "KeyW":
    case "ArrowUp":
      event.preventDefault();
      platformGame.keys.up = true;
      break;
    case "KeyS":
    case "ArrowDown":
      event.preventDefault();
      platformGame.keys.down = true;
      break;
    case "Space":
      event.preventDefault();
      attemptPlayerFire(event.timeStamp);
      break;
    default:
      break;
  }
}

function handleKeyUp(event) {
  if (!platformGame.active) {
    return;
  }

  switch (event.code) {
    case "KeyA":
    case "ArrowLeft":
      event.preventDefault();
      platformGame.keys.left = false;
      break;
    case "KeyD":
    case "ArrowRight":
      event.preventDefault();
      platformGame.keys.right = false;
      break;
    case "KeyW":
    case "ArrowUp":
      event.preventDefault();
      platformGame.keys.up = false;
      break;
    case "KeyS":
    case "ArrowDown":
      event.preventDefault();
      platformGame.keys.down = false;
      break;
    default:
      break;
  }
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
engageButton.addEventListener("click", startPlatformBattle);

if (exitBattleButton) {
  exitBattleButton.addEventListener("click", () => {
    closeBattleOverlay(platformGame.status === "running");
  });
}

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

renderInventory();
renderEnemy();
