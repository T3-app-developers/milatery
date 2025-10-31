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

function engageBattle() {
  battleLog.innerHTML = "";

  if (!state.inventory.length) {
    battleLog.appendChild(document.createElement("p")).textContent =
      "You have no weapons equipped. Build something before engaging.";
    return;
  }

  const totalFirepower = state.inventory.reduce((sum, weapon) => sum + weapon.damage, 0);
  const armorBreach = totalFirepower - state.enemy.armor;
  const outcomeParagraph = document.createElement("p");
  const detailParagraph = document.createElement("p");

  if (armorBreach >= 20) {
    outcomeParagraph.textContent = `Victory! The ${state.enemy.name} are overwhelmed.`;
    detailParagraph.textContent =
      "Your combined firepower punched straight through their defenses, scattering hostile forces.";
  } else if (armorBreach >= -10) {
    outcomeParagraph.textContent = `Stalemate against ${state.enemy.name}.`;
    detailParagraph.textContent =
      "The enemy holds position, but they cannot advance while your weapons keep them in check.";
  } else {
    outcomeParagraph.textContent = `Defeat. ${state.enemy.name} repel the assault.`;
    detailParagraph.textContent =
      "Insufficient firepower. Upgrade your arsenal and try again.";
  }

  const strengthComment = document.createElement("p");
  strengthComment.textContent = `Enemy counter strength: ${state.enemy.strength}.`;

  battleLog.append(outcomeParagraph, detailParagraph, strengthComment);

  // Rotate in a new enemy for the next encounter.
  state.enemy = enemies[Math.floor(Math.random() * enemies.length)];
  renderEnemy();
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
