let criticalityItems = [];
let editcriticalityIndex = -1;

// Load suppliers
async function loadSuppliers() {
    const suppliers = await fetchSuppliers();
    const savedDiagram = await fetchSavedcriticalityDiagram();
    const savedReasons = await fetchSavedcriticalityReasons();
    populatecriticalityDiagram(suppliers, savedDiagram);
    populateSavedcriticalityItemsList(savedDiagram, savedReasons);
}

// Function to populate the criticality diagram with suppliers
function populatecriticalityDiagram(suppliers, savedDiagram) {
    const highcriticalitySection = document.querySelector('.criticality-section.high-criticality');
    const mediumcriticalitySection = document.querySelector('.criticality-section.medium-criticality');
    const lowcriticalitySection = document.querySelector('.criticality-section.low-criticality');

    // Clear existing content
    highcriticalitySection.innerHTML = '<div class="criticality-section-label">High Criticality</div>';
    mediumcriticalitySection.innerHTML = '<div class="criticality-section-label">Medium Criticality</div>';
    lowcriticalitySection.innerHTML = '<div class="criticality-section-label">Low Criticality</div>';

    // Populate suppliers
    suppliers.forEach(supplier => {
        const supplierDiv = createDraggableItem(supplier.name, 'supplier');
        const savedPosition = savedDiagram[supplier.name] || 'medium'; // Default to medium criticality
        appendToSection(supplierDiv, savedPosition, highcriticalitySection, mediumcriticalitySection, lowcriticalitySection);
    });
}

// Helper function to append item to the correct criticality section
function appendToSection(itemDiv, savedPosition, highcriticalitySection, mediumcriticalitySection, lowcriticalitySection) {
    if (savedPosition === 'high') {
        highcriticalitySection.appendChild(itemDiv);
    } else if (savedPosition === 'medium') {
        mediumcriticalitySection.appendChild(itemDiv);
    } else {
        lowcriticalitySection.appendChild(itemDiv);
    }
}

// Helper function to create draggable items
function createDraggableItem(name, type) {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('draggable-item', 'vendor-item');
    itemDiv.style.border = '1px solid black'; // Add a solid border to each item
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
        const criticalitySection = e.currentTarget;
        criticalitySection.appendChild(item);

        // Save the position immediately after dropping
        saveVendorPosition(name, criticalitySection.dataset.criticality);
    }
}

// Function to save the vendor's position in the criticality diagram
async function saveVendorPosition(name, criticalityLevel) {
    let criticalityDiagram = await fetchSavedcriticalityDiagram();
    criticalityDiagram[name] = criticalityLevel;

    await fetch('/save-vendors-criticality-diagram', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ criticalityDiagram })
    });

    alert(`Vendor ${name} saved as ${capitalize(criticalityLevel)} Criticality.`);

    // Update the Saved Vendor criticality Items list immediately
    const savedReasons = await fetchSavedcriticalityReasons();
    populateSavedcriticalityItemsList(criticalityDiagram, savedReasons);
}

// Function to save the entire criticality diagram (if necessary)
async function saveVendorcriticalityDiagram() {
    const criticalityDiagram = {};

    document.querySelectorAll('.criticality-section').forEach(section => {
        const criticalityLevel = section.dataset.criticality;
        section.querySelectorAll('.draggable-item').forEach(item => {
            criticalityDiagram[item.dataset.name] = criticalityLevel;
        });
    });

    await fetch('/save-vendors-criticality-diagram', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ criticalityDiagram })
    });

    alert('criticality diagram saved successfully!');

    const savedReasons = await fetchSavedcriticalityReasons();
    populateSavedcriticalityItemsList(criticalityDiagram, savedReasons);
}

// Function to populate the saved criticality items list
function populateSavedcriticalityItemsList(savedDiagram, savedReasons) {
    const savedcriticalityItemsList = document.getElementById('saved-vendor-criticality-items-list');
    savedcriticalityItemsList.innerHTML = ''; // Clear existing list

    // Get all suppliers currently displayed in the criticality diagram
    const suppliersInDiagram = document.querySelectorAll('.draggable-item');

    suppliersInDiagram.forEach(supplier => {
        const itemName = supplier.dataset.name;
        const criticalityLevel = savedDiagram[itemName] || 'medium'; // Default to medium criticality

        const itemDiv = document.createElement('div');
        itemDiv.classList.add('saved-criticality-item');
        itemDiv.innerHTML = `
            <div class="item-header">
                ${itemName} - ${capitalize(criticalityLevel)} Criticality
                <button onclick="editcriticalityReason('${itemName}')">Edit</button>
                <input type="text" id="reason-${itemName}" placeholder="Enter reason here..." style="display: none;" />
                <button id="save-reason-${itemName}" onclick="savecriticalityReason('${itemName}')" style="display: none;">Save</button>
            </div>
            <div class="item-reasoning" id="reason-text-${itemName}">
                <strong>Criticality Category Reasoning:</strong> ${savedReasons[itemName] || 'No reason provided'}
            </div>
        `;
        savedcriticalityItemsList.appendChild(itemDiv);
    });
}

// Function to edit the criticality reason
function editcriticalityReason(itemName) {
    document.getElementById(`reason-${itemName}`).style.display = 'inline';
    document.getElementById(`save-reason-${itemName}`).style.display = 'inline';
}

// Function to save the criticality reason
async function savecriticalityReason(itemName) {
    const reasonInput = document.getElementById(`reason-${itemName}`);
    const reason = reasonInput.value;

    await fetch('/save-criticality-reason', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ itemName, reason })
    });

    document.getElementById(`reason-text-${itemName}`).innerHTML = `<strong>criticality Category Reasoning:</strong> ${reason}`;

    alert(`Reason for ${itemName} saved successfully!`);

    reasonInput.style.display = 'none';
    document.getElementById(`save-reason-${itemName}`).style.display = 'none';
}

// Helper function to capitalize text
function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

// Fetch suppliers data
async function fetchSuppliers() {
    const response = await fetch('/suppliers-data');
    const data = await response.json();
    return data.suppliers || [];
}

// Fetch saved criticality diagram
async function fetchSavedcriticalityDiagram() {
    const response = await fetch('/vendors-criticality-diagram-data'); 
    const data = await response.json();
    return data.criticalityDiagram || {};
}

// Fetch saved criticality reasons
async function fetchSavedcriticalityReasons() {
    const response = await fetch('/criticality-reasons-data');
    const data = await response.json();
    return data.reasons || {};
}

// Fetching suppliers and saved data
loadSuppliers();

// Event listeners for drag and drop
document.querySelectorAll('.criticality-section').forEach(section => {
    section.addEventListener('dragover', allowDrop);
    section.addEventListener('drop', drop);
});
