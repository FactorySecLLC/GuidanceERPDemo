// Load and display the suppliers in the criticality diagram without allowing drag-and-drop
async function loadSuppliersForDisplay() {
    const suppliers = await fetchSuppliers();
    const savedDiagram = await fetchSavedCriticalityDiagram();
    populateCriticalityDiagramForDisplay(suppliers, savedDiagram);
}

// Function to populate the criticality diagram with suppliers (display only)
function populateCriticalityDiagramForDisplay(suppliers, savedDiagram) {
    const highCriticalitySection = document.querySelector('.criticality-section.high-criticality');
    const mediumCriticalitySection = document.querySelector('.criticality-section.medium-criticality');
    const lowCriticalitySection = document.querySelector('.criticality-section.low-criticality');

    // Clear existing content
    highCriticalitySection.innerHTML = '<div class="criticality-section-label">High Criticality</div>';
    mediumCriticalitySection.innerHTML = '<div class="criticality-section-label">Medium Criticality</div>';
    lowCriticalitySection.innerHTML = '<div class="criticality-section-label">Low Criticality</div>';

    // Populate suppliers
    suppliers.forEach(supplier => {
        const supplierDiv = createDisplayItem(supplier.name);
        const savedPosition = savedDiagram[supplier.name] || 'medium'; // Default to medium criticality
        appendToSectionForDisplay(supplierDiv, savedPosition, highCriticalitySection, mediumCriticalitySection, lowCriticalitySection);
    });
}

// Helper function to append item to the correct criticality section (display only)
function appendToSectionForDisplay(itemDiv, savedPosition, highCriticalitySection, mediumCriticalitySection, lowCriticalitySection) {
    if (savedPosition === 'high') {
        highCriticalitySection.appendChild(itemDiv);
    } else if (savedPosition === 'medium') {
        mediumCriticalitySection.appendChild(itemDiv);
    } else {
        lowCriticalitySection.appendChild(itemDiv);
    }
}

// Helper function to create display-only items (no dragging)
function createDisplayItem(name) {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('draggable-item', 'vendor-item');
    itemDiv.style.border = '1px solid black'; // Add a solid border to each item
    itemDiv.innerText = name;
    return itemDiv;
}

// Fetch suppliers data
async function fetchSuppliers() {
    const response = await fetch('/suppliers-data');
    const data = await response.json();
    return data.suppliers || [];
}

// Fetch saved criticality diagram
async function fetchSavedCriticalityDiagram() {
    const response = await fetch('/vendors-criticality-diagram-data'); 
    const data = await response.json();
    return data.criticalityDiagram || {};
}

// Load suppliers for display when the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadSuppliersForDisplay();
});
