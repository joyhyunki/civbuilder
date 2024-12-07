// I love this new way of organizing, really
var userciv;
let hasAdvanced = false; // New flag to track age advancement

// types of resources
const resources = {
    aminoAcid: { name: "Amino Acid", count: 0, limit: 100, rate: 0, icon: "Images/aminoacid.png", age: 0, visible: true },
    protein: { name: "Protein", count: 0, limit: 100, rate: 0, icon: "Images/protein.png", age: 0, visible: false },
    ribosome: { name: "Ribosome", count: 0, productionRate: 1, age: 0, visible: false },
    dna: { name: "DNA", count: 0, limit: 25, rate: 0, icon: "Images/dna.png", age: 0, visible: false },
};

// types of actions
const actions = [
    { id: "collectAmino", name: "Collect Amino Acid", cost: {}, produces: { aminoAcid: 1 }, unlocked: true, age: 0 },
    { id: "createProtein", name: "Create Protein", cost: { aminoAcid: 3 }, produces: { protein: 1 }, unlocked: true, age: 0 },
    { id: "createRibosome", name: "Create Ribosome", cost: { protein: 5 }, produces: { ribosome: 1 }, unlocked: false, age: 0, isBuilding: true },
    { id: "createDNA", name: "Create DNA", cost: { ribosome: 2 }, produces: { dna: 1 }, unlocked: false, age: 0 },
];

// ages
const ages = ["Prehistoric", "Ancient", "Medieval", "Industrial", "Modern", "Space"];
let currentAge = 0;

// Create tooltip element
const tooltip = document.createElement("div");
tooltip.className = "tooltip";
tooltip.style.display = "none";
document.body.appendChild(tooltip);

// Show tooltip
function showTooltip(event, content) {
    tooltip.innerHTML = content;
    tooltip.style.display = "block";
    tooltip.style.left = event.pageX + 10 + "px";
    tooltip.style.top = event.pageY + 10 + "px";
}

// Hide tooltip
function hideTooltip() {
    tooltip.style.display = "none";
}

// update resources
function updateResources() {
    const resourceBar = document.getElementById("resourcebar");
    resourceBar.innerHTML = "";

    for (const [key, resource] of Object.entries(resources)) {
        if (key === 'ribosome') continue;

        if (resource.visible && currentAge === resource.age) {
            const div = document.createElement("div");
            div.className = "resource";
            div.innerHTML = `
                <img src="${resource.icon}" alt="${resource.name}">
                <span>${resource.name}: ${resource.count} / ${resource.limit}</span>
            `;

            const tooltipContent = `
                <strong>${resource.name}</strong><br>
                Current: ${resource.count}<br>
                Limit: ${resource.limit}<br>
                Generation Rate: ${resource.rate}/s
                ${key === 'protein' ? `<br>Ribosome Production: +${resources.ribosome.count * resources.ribosome.productionRate}/s` : ''}
            `;

            div.onmouseover = (e) => showTooltip(e, tooltipContent);
            div.onmouseout = hideTooltip;
            div.onmousemove = (e) => {
                tooltip.style.left = e.pageX + 10 + "px";
                tooltip.style.top = e.pageY + 10 + "px";
            };

            resourceBar.appendChild(div);
        }
    }
}

// update buttons
function updateButtons() {
    const buttonsDiv = document.getElementById("buttons");
    buttonsDiv.innerHTML = "";

    for (const action of actions) {
        if (action.unlocked && checkActionUnlockByAge(action) && currentAge === action.age) {
            const button = document.createElement("button");
            button.textContent = action.name;

            if (action.id === 'createRibosome') {
                const countSpan = document.createElement('span');
                countSpan.className = 'building-count';
                countSpan.textContent = resources.ribosome.count;
                countSpan.style.position = 'absolute';
                countSpan.style.left = '5px';
                countSpan.style.top = '5px';
                countSpan.style.fontSize = '12px';
                button.style.position = 'relative';
                button.appendChild(countSpan);
            }

            button.onclick = () => performAction(action);
            button.disabled = !canPerformAction(action);

            let tooltipContent = `<strong>${action.name}</strong><br>`;

            if (Object.keys(action.cost).length > 0) {
                tooltipContent += "Costs:<br>";
                for (const [resource, amount] of Object.entries(action.cost)) {
                    tooltipContent += `- ${amount} ${resources[resource].name}<br>`;
                }
            }

            tooltipContent += "Produces:<br>";
            for (const [resource, amount] of Object.entries(action.produces)) {
                tooltipContent += `+ ${amount} ${resources[resource].name}<br>`;
            }

            if (action.id === 'createRibosome') {
                tooltipContent += `<br>Each Ribosome produces:<br>+ ${resources.ribosome.productionRate} Protein/s`;
            }

            button.onmouseover = (e) => showTooltip(e, tooltipContent);
            button.onmouseout = hideTooltip;
            button.onmousemove = (e) => {
                tooltip.style.left = e.pageX + 10 + "px";
                tooltip.style.top = e.pageY + 10 + "px";
            };

            buttonsDiv.appendChild(button);

            for (const resource in action.produces) {
                resources[resource].visible = true;
            }
        }
    }
}

// Check if action matches current age
function checkActionUnlockByAge(action) {
    for (const [resource, amount] of Object.entries(action.cost)) {
        if (resources[resource].age != currentAge) {
            return false;
        }
    }
    return true;
}

// Check if action can be performed
function canPerformAction(action) {
    for (const [resource, amount] of Object.entries(action.cost)) {
        if (resources[resource].count < amount) {
            return false;
        }
    }
    return true;
}

// Perform action
function performAction(action) {
    for (const [resource, amount] of Object.entries(action.cost)) {
        resources[resource].count -= amount;
    }
    for (const [resource, amount] of Object.entries(action.produces)) {
        if (resources[resource].limit) {
            resources[resource].count = Math.min(resources[resource].count + amount, resources[resource].limit);
        } else {
            resources[resource].count += amount;
        }
        resources[resource].visible = true;
    }
    checkUnlocks();
    updateUI();
}

// Check unlock conditions
function checkUnlocks() {
    if (resources.protein.count >= 10 && !actions.find(a => a.id === "createRibosome").unlocked) {
        actions.find(a => a.id === "createRibosome").unlocked = true;
        logEvent("Unlocked: Create Ribosome");
        resources.ribosome.visible = true;
    }
    if (resources.ribosome.count >= 5 && !actions.find(a => a.id === "createDNA").unlocked) {
        actions.find(a => a.id === "createDNA").unlocked = true;
        logEvent("Unlocked: Create DNA");
        resources.dna.visible = true;
    }
    if (resources.dna.count >= 10 && currentAge === 0 && !hasAdvanced) {
        hasAdvanced = true;
        currentAge++;
        document.getElementById("age").textContent = ages[currentAge];
        logEvent(`Advanced to ${ages[currentAge]} Age!`);

        userciv = prompt("Type your trees (animal / plants / fungi)");
        if (userciv === "animal") {
            logEvent("animal");
        } else if (userciv === "plants") {
            logEvent("plants");
        } else if (userciv === "fungi") {
            logEvent("fungi");
        } else {
            logEvent("error");
        }
    }
}

// Log event
function logEvent(message) {
    const chat = document.getElementById("chat");
    const p = document.createElement("p");
    p.textContent = message;
    chat.appendChild(p);
    chat.scrollTop = chat.scrollHeight;
}

// Update UI
function updateUI() {
    updateResources();
    updateButtons();
}

// Game loop
function gameLoop() {
    const proteinProduction = resources.ribosome.count * resources.ribosome.productionRate;
    resources.protein.count = Math.min(
        resources.protein.count + proteinProduction,
        resources.protein.limit
    );

    for (const resource of Object.values(resources)) {
        if (resource.limit && resource.rate) {
            resource.count = Math.min(resource.count + resource.rate, resource.limit);
        }
    }
    updateUI();
}

// Initialize
setInterval(gameLoop, 1000);
updateUI();
logEvent("Welcome to CivBuilder! Start by collecting Amino Acids.");
