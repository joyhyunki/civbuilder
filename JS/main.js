// I love this new way of organizing, really

// types of resources
const resources = {
    aminoAcid: { name: "Amino Acid", count: 0, limit: 100, rate: 0, icon: "Images/aminoacid.png", age: 0 },
    protein: { name: "Protein", count: 0, limit: 100, rate: 0, icon: "Images/protein.png", age: 0 },
    rna: { name: "RNA", count: 0, limit: 50, rate: 0, icon: "Images/rna.png", age: 0 },
    dna: { name: "DNA", count: 0, limit: 25, rate: 0, icon: "Images/dna.png", age: 0 },
    alpha: { name: "Alpha", count: 0, limit: 25, rate: 0, icon: "", age: 0 },
};

// types of actions
const actions = [
    { id: "collectAmino", name: "Collect Amino Acid", cost: {}, produces: { aminoAcid: 1 }, unlocked: true, age : 0 },
    { id: "createProtein", name: "Create Protein", cost: { aminoAcid: 3 }, produces: { protein: 1 }, unlocked: true, age : 0 },
    { id: "createRNA", name: "Create RNA", cost: { protein: 5 }, produces: { rna: 1 }, unlocked: false, age : 0 },
    { id: "createDNA", name: "Create DNA", cost: { rna: 2 }, produces: { dna: 1 }, unlocked: false, age : 0 },
    { id: "createAlpha", name: "Create Alpha", cost: { aminoAcid: 10 }, produces: { alpha: 1 }, unlocked: true, age : 0 },
];

// ages
const ages = ["Prehistoric", "Ancient", "Medieval", "Industrial", "Modern", "Space"];
let currentAge = 0;

// update resources
function updateResources() {
    const resourceBar = document.getElementById("resourcebar");
    resourceBar.innerHTML = "";

    for (const [key, resource] of Object.entries(resources)) {
        if (currentAge === resource.age) {
            const div = document.createElement("div");
            div.className = "resource";
            div.innerHTML = `
                <img src="${resource.icon}" alt="${resource.name}">
                <span>${resource.name}: ${resource.count} / ${resource.limit}</span>
            `;
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
            button.onclick = () => performAction(action);
            button.disabled = !canPerformAction(action);
            buttonsDiv.appendChild(button);
        }
    }
}

// 시대에 맞는 액션인지 확인
function checkActionUnlockByAge(action) {
    for (const [resource, amount] of Object.entries(action.cost)) {
        if (resources[resource].age != currentAge) {
            return false;
        }
    }
    return true;
}

// 버튼 활성화 여부 확인
function canPerformAction(action) {
    for (const [resource, amount] of Object.entries(action.cost)) {
        if (resources[resource].count < amount) {
            return false;
        }
    }
    return true;
}

// 액션 수행
function performAction(action) {
    for (const [resource, amount] of Object.entries(action.cost)) {
        resources[resource].count -= amount;
    }
    for (const [resource, amount] of Object.entries(action.produces)) {
        resources[resource].count = Math.min(resources[resource].count + amount, resources[resource].limit);
    }
    checkUnlocks();
    updateUI();
}

// 잠금 해제 조건 확인
function checkUnlocks() {
    if (resources.protein.count >= 10 && !actions.find(a => a.id === "createRNA").unlocked) {
        actions.find(a => a.id === "createRNA").unlocked = true;
        logEvent("Unlocked: Create RNA");
    }
    if (resources.rna.count >= 5 && !actions.find(a => a.id === "createDNA").unlocked) {
        actions.find(a => a.id === "createDNA").unlocked = true;
        logEvent("Unlocked: Create DNA");
    }
    if (resources.dna.count >= 10 && currentAge === 0) {
        currentAge++;
        document.getElementById("age").textContent = ages[currentAge];
        logEvent(`Advanced to ${ages[currentAge]} Age!`);

        // Species
        window.alert("CHOOSE")
    }
}

// 로그 이벤트
function logEvent(message) {
    const chat = document.getElementById("chat");
    const p = document.createElement("p");
    p.textContent = message;
    chat.appendChild(p);
    chat.scrollTop = chat.scrollHeight;
}

// UI 업데이트
function updateUI() {
    updateResources();
    updateButtons();
}

// 게임 루프
function gameLoop() {
    for (const resource of Object.values(resources)) {
        resource.count = Math.min(resource.count + resource.rate, resource.limit);
    }
    updateUI();
}

// 초기화
setInterval(gameLoop, 1000);
updateUI();
logEvent("Welcome to CivBuilder! Start by collecting Amino Acids.");
