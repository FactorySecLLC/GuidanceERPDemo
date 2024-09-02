let riskItems = [];
let editRiskIndex = -1;

// Load assets and connectors from network diagram
async function loadAssetsAndConnectors() {
    const assets = await fetchAssets();
    const connectors = await fetchConnectors();
    const savedDiagram = await fetchSavedRiskDiagram();
    const savedReasons = await fetchSavedRiskReasons();
    populateRiskDiagram(assets, connectors, savedDiagram);
    populateSavedRiskItemsList(savedDiagram, savedReasons);
}

// Function to populate the risk diagram with assets and connectors
function populateRiskDiagram(assets, connectors, savedDiagram) {
    const highRiskSection = document.querySelector('.risk-section.high-risk');
    const mediumRiskSection = document.querySelector('.risk-section.medium-risk');
    const lowRiskSection = document.querySelector('.risk-section.low-risk');

    // Clear existing content
    highRiskSection.innerHTML = '<div class="risk-section-label">High Risk</div>';
    mediumRiskSection.innerHTML = '<div class="risk-section-label">Medium Risk</div>';
    lowRiskSection.innerHTML = '<div class="risk-section-label">Low Risk</div>';

    // Populate assets
    assets.forEach(asset => {
        const assetDiv = createDraggableItem(asset.modelName, 'asset');
        const savedPosition = savedDiagram[asset.modelName];
        if (savedPosition === 'high') {
            highRiskSection.appendChild(assetDiv);
        } else if (savedPosition === 'medium') {
            mediumRiskSection.appendChild(assetDiv);
        } else {
            lowRiskSection.appendChild(assetDiv);
        }
    });

    // Populate connectors
    connectors.forEach(connector => {
        const connectorDiv = createDraggableItem(connector.connectorName, 'connector');
        const savedPosition = savedDiagram[connector.connectorName];
        if (savedPosition === 'high') {
            highRiskSection.appendChild(connectorDiv);
        } else if (savedPosition === 'medium') {
            mediumRiskSection.appendChild(connectorDiv);
        } else {
            lowRiskSection.appendChild(connectorDiv);
        }
    });
}

// Helper function to create draggable items
function createDraggableItem(name, type) {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('draggable-item');
    if (type === 'asset') {
        itemDiv.classList.add('asset-item');
    } else {
        itemDiv.classList.add('connector-item');
    }
    itemDiv.innerText = name;
    itemDiv.draggable = true;
    itemDiv.dataset.type = type;
    itemDiv.dataset.name = name;
    itemDiv.addEventListener('dragstart', dragStart);
    itemDiv.addEventListener('dragend', dragEnd);
    return itemDiv;
}

// Drag and drop functionality
function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.name);
    e.dataTransfer.setData('type', e.target.dataset.type);
    setTimeout(() => {
        e.target.style.display = 'none';
    }, 0);
}

function dragEnd(e) {
    setTimeout(() => {
        e.target.style.display = 'block';
    }, 0);
}

function allowDrop(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    const name = e.dataTransfer.getData('text/plain');
    const type = e.dataTransfer.getData('type');
    const item = document.querySelector(`[data-name="${name}"][data-type="${type}"]`);

    if (item) {
        const riskSection = e.currentTarget;
        riskSection.appendChild(item);
    }
}

// Function to save the risk diagram
async function saveRiskDiagram() {
    const riskDiagram = {};

    document.querySelectorAll('.risk-section').forEach(section => {
        const riskLevel = section.dataset.risk;
        section.querySelectorAll('.draggable-item').forEach(item => {
            riskDiagram[item.dataset.name] = riskLevel;
        });
    });

    await fetch('/save-risk-diagram', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ riskDiagram })
    });

    alert('Risk diagram saved successfully!');

    const savedReasons = await fetchSavedRiskReasons();
    populateSavedRiskItemsList(riskDiagram, savedReasons);
}

// Function to populate the saved risk items list
function populateSavedRiskItemsList(savedDiagram, savedReasons) {
    const savedRiskItemsList = document.getElementById('saved-risk-items-list');
    savedRiskItemsList.innerHTML = ''; // Clear existing list

    Object.keys(savedDiagram).forEach(itemName => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('saved-risk-item');
        itemDiv.innerHTML = `
            <div class="item-header">
                ${itemName} - ${capitalize(savedDiagram[itemName])} Risk
                <button onclick="editRiskReason('${itemName}')">Edit</button>
                <input type="text" id="reason-${itemName}" placeholder="Enter reason here..." style="display: none;" />
                <button id="save-reason-${itemName}" onclick="saveRiskReason('${itemName}')" style="display: none;">Save</button>
            </div>
            <div class="item-reasoning" id="reason-text-${itemName}">
                <strong>Risk Category Reasoning:</strong> ${savedReasons[itemName] || ''}
            </div>
        `;
        savedRiskItemsList.appendChild(itemDiv);
    });
}

// Function to edit the risk reason
function editRiskReason(itemName) {
    document.getElementById(`reason-${itemName}`).style.display = 'inline';
    document.getElementById(`save-reason-${itemName}`).style.display = 'inline';
}

// Function to save the risk reason
async function saveRiskReason(itemName) {
    const reasonInput = document.getElementById(`reason-${itemName}`);
    const reason = reasonInput.value;

    await fetch('/save-risk-reason', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ itemName, reason })
    });

    document.getElementById(`reason-text-${itemName}`).innerHTML = `<strong>Risk Category Reasoning:</strong> ${reason}`;

    alert(`Reason for ${itemName} saved successfully!`);

    reasonInput.style.display = 'none';
    document.getElementById(`save-reason-${itemName}`).style.display = 'none';
}

// Helper function to capitalize text
function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

// Fetching assets, connectors, and saved data
loadAssetsAndConnectors();

// Fetch assets and connectors from network diagram
async function fetchAssets() {
    const response = await fetch('/it-ot-assets-data');
    const data = await response.json();
    return data.assets || [];
}

async function fetchConnectors() {
    const response = await fetch('/network-connectors-data');
    const data = await response.json();
    return data.connectors || [];
}

// Fetch saved risk diagram
async function fetchSavedRiskDiagram() {
    const response = await fetch('/risk-diagram-data');
    const data = await response.json();
    return data.riskDiagram || {};
}

// Fetch saved risk reasons
async function fetchSavedRiskReasons() {
    const response = await fetch('/risk-reasons-data');
    const data = await response.json();
    return data.reasons || {};
}

// Event listeners for drag and drop
document.querySelectorAll('.risk-section').forEach(section => {
    section.addEventListener('dragover', allowDrop);
    section.addEventListener('drop', drop);
});
