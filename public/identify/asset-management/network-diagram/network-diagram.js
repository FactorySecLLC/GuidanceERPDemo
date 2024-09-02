let editConnectorIndex = -1;
let connectors = [];
let offsetX, offsetY; // Variables to store the offset between the mouse and the square's top-left corner
const gridSize = 10; // Size of the grid for snapping

// Function to save connectors
async function saveConnectors() {
    const connectorName = document.getElementById('connector-name').value;
    const assetA = document.getElementById('connector-asset-a').value;
    const assetB = document.getElementById('connector-asset-b').value;
    const serialId = document.getElementById('connector-serial-id').value;
    const location = document.getElementById('connector-location').value;
    const compliance = document.getElementById('connector-compliance').value;
    const lifecycle = document.getElementById('connector-lifecycle').value;
    const warranty = document.getElementById('connector-warranty').value;
    const value = document.getElementById('connector-value').value;
    const purchaseDate = document.getElementById('connector-purchase-date').value;
    const depreciatedValue = document.getElementById('connector-depreciated-value').value;
    const depreciatedValueDate = document.getElementById('connector-depreciated-value-date').value;
    const notes = document.getElementById('connector-notes').value;
    const orientation = document.getElementById('connector-orientation').value || 'horizontal'; // New field

    if (connectorName && assetA && assetB) {
        const connectorData = {
            connectorName,
            assetA,
            assetB,
            serialId,
            location,
            compliance,
            lifecycle,
            warranty,
            value,
            purchaseDate,
            depreciatedValue,
            depreciatedValueDate,
            notes,
            orientation
        };

        if (editConnectorIndex >= 0) {
            const oldName = connectors[editConnectorIndex].connectorName;

            // Remove the old connector square from the diagram
            const oldSquare = document.querySelector(`[data-index="${editConnectorIndex}"][data-type="connector"]`);
            if (oldSquare) {
                oldSquare.remove();
            }

            // Update the connector data in the connectors array
            connectors[editConnectorIndex] = connectorData;

            // Update the position if the name has changed
            const positions = await fetchSavedPositions();
            if (oldName !== connectorName) {
                positions[connectorName] = positions[oldName]; // Move the position to the new name
                delete positions[oldName]; // Remove the old name from positions

                await fetch('/save-network-diagram', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ positions })
                });
            }

            editConnectorIndex = -1;
        } else {
            connectors.push(connectorData);
        }

        const data = { connectors };

        fetch('/save-network-connectors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            clearConnectorFields();
            loadSavedConnectors();
            loadNetworkDiagram(); // Re-render diagram to include new connector
            setConnectorEditingIndicator();
            hideConnectorFields();
            enableAddConnectorButton(); // Enable the Add button after saving
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}

// Function to fetch connectors
async function fetchConnectors() {
    const response = await fetch('/network-connectors-data');
    const data = await response.json();
    return data.connectors || [];
}

// Function to fetch IT/OT assets
async function fetchAssets() {
    const response = await fetch('/it-ot-assets-data');
    const data = await response.json();
    populateAssetDropdowns(data.assets || []);
    return data.assets || [];
}

// Function to add a connector
function addConnector() {
    showConnectorFields();
    clearConnectorFields();
    setConnectorEditingIndicator();
    disableAddConnectorButton();
}

// Function to edit a connector
function editConnector(index) {
    editConnectorIndex = index;
    const connector = connectors[index];
    document.getElementById('connector-name').value = connector.connectorName;
    document.getElementById('connector-asset-a').value = connector.assetA;
    document.getElementById('connector-asset-b').value = connector.assetB;
    document.getElementById('connector-serial-id').value = connector.serialId;
    document.getElementById('connector-location').value = connector.location;
    document.getElementById('connector-compliance').value = connector.compliance;
    document.getElementById('connector-lifecycle').value = connector.lifecycle;
    document.getElementById('connector-warranty').value = connector.warranty;
    document.getElementById('connector-value').value = connector.value;
    document.getElementById('connector-purchase-date').value = connector.purchaseDate;
    document.getElementById('connector-depreciated-value').value = connector.depreciatedValue;
    document.getElementById('connector-depreciated-value-date').value = connector.depreciatedValueDate;
    document.getElementById('connector-notes').value = connector.notes;
    document.getElementById('connector-orientation').value = connector.orientation; // Set orientation field

    // Update the square in the diagram with the new name and orientation
    const square = document.querySelector(`[data-index="${index}"][data-type="connector"]`);
    if (square) {
        square.innerText = `-----${connector.connectorName}-----`;
        square.setAttribute('data-old-name', connector.connectorName); // Save the old name for position update
        square.className = `connector-square ${connector.orientation}`; // Update orientation class
    }

    showConnectorFields();
    disableAddConnectorButton();
    setConnectorEditingIndicator(`Editing ${connector.connectorName}`);
}

// Function to delete a connector
function deleteConnector(index) {
    connectors.splice(index, 1);

    const data = { connectors };

    fetch('/save-network-connectors', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        loadSavedConnectors();
        loadNetworkDiagram(); // Refresh the diagram after deletion
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Function to load saved connectors
async function loadSavedConnectors() {
    try {
        connectors = await fetchConnectors();
        const listContainer = document.getElementById('saved-connectors-list');
        listContainer.innerHTML = ''; // Clear existing content

        if (connectors.length) {
            connectors.forEach((connector, index) => {
                const connectorElement = document.createElement('div');
                connectorElement.classList.add('connector-item');
                connectorElement.innerHTML = `
                    <div class="connector-info">
                        <strong>Name:</strong> ${connector.connectorName} <br>
                        <strong>Connecting Asset A:</strong> ${connector.assetA} <br>
                        <strong>Connecting Asset B:</strong> ${connector.assetB} <br>
                        <strong>Serial ID:</strong> ${connector.serialId} <br>
                        <strong>Location:</strong> ${connector.location} <br>
                        <strong>Compliance:</strong> ${connector.compliance} <br>
                        <strong>Lifecycle:</strong> ${connector.lifecycle} <br>
                        <strong>Warranty:</strong> ${connector.warranty} <br>
                        <strong>Value:</strong> ${connector.value} <br>
                        <strong>Purchase Date:</strong> ${connector.purchaseDate} <br>
                        <strong>Depreciated Value:</strong> ${connector.depreciatedValue} <br>
                        <strong>Depreciated Value Date:</strong> ${connector.depreciatedValueDate} <br>
                        <strong>Notes:</strong> ${connector.notes} <br>
                        <strong>Orientation:</strong> ${connector.orientation}
                    </div>
                    <div class="connector-buttons">
                        <button onclick="editConnector(${index})">Edit</button>
                        <button onclick="deleteConnector(${index})">Delete</button>
                    </div>
                `;
                listContainer.appendChild(connectorElement);
            });
        } else {
            listContainer.innerText = 'No saved connectors found.';
        }
    } catch (error) {
        console.error('Error fetching saved connectors:', error);
        document.getElementById('saved-connectors-list').innerText = 'Failed to load saved connectors.';
    }
}

// Function to load and render the network diagram
async function loadNetworkDiagram() {
    const container = document.getElementById('diagram-container');

    // Fetch assets and positions from the server
    const assets = await fetchAssets();
    const positions = await fetchSavedPositions();
    const connectors = await fetchConnectors(); // Fetch connectors as well

    // Clear existing elements before re-rendering
    container.innerHTML = '';

    // Render assets in the diagram
    assets.forEach((asset, index) => {
        const square = document.createElement('div');
        square.classList.add('asset-square');
        square.innerText = asset.modelName;
        square.setAttribute('data-type', 'asset');
        square.setAttribute('data-index', index);

        // Set initial position
        const position = positions[asset.modelName];
        if (position) {
            square.style.left = `${position.x}px`;
            square.style.top = `${position.y}px`;
        } else {
            square.style.left = '10px';
            square.style.top = '10px';
        }

        square.draggable = true;
        square.addEventListener('dragstart', dragStart);
        square.addEventListener('dragend', dragEnd);
        container.appendChild(square);
    });

    // Render connectors in the diagram
    connectors.forEach((connector, index) => {
        const connectorSquare = document.createElement('div');
        connectorSquare.classList.add('connector-square');
        connectorSquare.classList.add(connector.orientation); // Add orientation class
        connectorSquare.innerText = `-----${connector.connectorName}-----`;
        connectorSquare.setAttribute('data-type', 'connector');
        connectorSquare.setAttribute('data-index', index);

        // Set initial position
        const position = positions[connector.connectorName];
        if (position) {
            connectorSquare.style.left = `${position.x}px`;
            connectorSquare.style.top = `${position.y}px`;
        } else {
            connectorSquare.style.left = '10px';
            connectorSquare.style.top = '50px';
        }

        connectorSquare.draggable = true;
        connectorSquare.addEventListener('dragstart', dragStart);
        connectorSquare.addEventListener('dragend', dragEnd);
        container.appendChild(connectorSquare);
    });

    container.addEventListener('dragover', dragOver);
    container.addEventListener('drop', drop);
}

// Helper functions for drag-and-drop functionality
function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.getAttribute('data-index'));
    e.dataTransfer.setData('type', e.target.getAttribute('data-type'));

    const rect = e.target.getBoundingClientRect();

    // Adjust the offset differently for vertical squares
    if (e.target.classList.contains('vertical')) {
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
    } else {
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
    }

    setTimeout(() => {
        e.target.style.display = 'none';
    }, 0);
}

function dragEnd(e) {
    setTimeout(() => {
        e.target.style.display = 'block';
    }, 0);
}

function dragOver(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    const index = e.dataTransfer.getData('text/plain');
    const type = e.dataTransfer.getData('type');
    const square = document.querySelector(`[data-index="${index}"][data-type="${type}"]`);

    const container = document.getElementById('diagram-container');
    const rect = container.getBoundingClientRect();

    let x = e.clientX - rect.left - offsetX;
    let y = e.clientY - rect.top - offsetY;

    if (square.classList.contains('vertical')) {
        // Account for the rotation by shifting the x and y positions
        x += square.offsetHeight / 2 - square.offsetWidth / 2;
        y -= square.offsetWidth / 2;
    }

    // Apply grid snapping
    x = Math.round(x / gridSize) * gridSize;
    y = Math.round(y / gridSize) * gridSize;

    // Ensure the square stays within the container bounds
    x = Math.max(0, Math.min(x, container.offsetWidth - square.offsetWidth));
    y = Math.max(0, Math.min(y, container.offsetHeight - square.offsetHeight));

    square.style.left = `${x}px`;
    square.style.top = `${y}px`;

    // Reset transformation origin to the top-left corner
    square.style.transformOrigin = "0 0";

    container.appendChild(square);
}


// Function to save the network diagram
async function saveDiagram() {
    const container = document.getElementById('diagram-container');
    const assetSquares = container.getElementsByClassName('asset-square');
    const connectorSquares = container.getElementsByClassName('connector-square');
    const positions = {};

    // Save positions of asset squares
    Array.from(assetSquares).forEach((square) => {
        const name = square.innerText;
        positions[name] = {
            x: parseInt(square.style.left, 10),
            y: parseInt(square.style.top, 10)
        };
    });

    // Save positions of connector squares
    Array.from(connectorSquares).forEach((square) => {
        const name = square.innerText.replace(/-----/g, ''); // Remove dashes for saving
        positions[name] = {
            x: parseInt(square.style.left, 10),
            y: parseInt(square.style.top, 10)
        };
    });

    await fetch('/save-network-diagram', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ positions })
    });

    alert('Network diagram saved successfully!');
}

// Function to fetch saved positions for the network diagram
async function fetchSavedPositions() {
    const response = await fetch('/network-diagram-positions');
    const data = await response.json();
    return data.positions || {};
}

// Function to populate asset dropdowns with IT/OT assets
function populateAssetDropdowns(assets) {
    const assetADropdown = document.getElementById('connector-asset-a');
    const assetBDropdown = document.getElementById('connector-asset-b');
    assetADropdown.innerHTML = ''; // Clear existing options
    assetBDropdown.innerHTML = ''; // Clear existing options
    assets.forEach(asset => {
        const optionA = document.createElement('option');
        const optionB = document.createElement('option');
        optionA.value = asset.modelName;
        optionA.textContent = asset.modelName;
        optionB.value = asset.modelName;
        optionB.textContent = asset.modelName;
        assetADropdown.appendChild(optionA);
        assetBDropdown.appendChild(optionB);
    });
}

// Function to show connector fields
function showConnectorFields() {
    const fields = document.querySelectorAll('.question-group');
    fields.forEach(field => field.style.display = 'block');
}

// Function to hide connector fields
function hideConnectorFields() {
    const fields = document.querySelectorAll('.question-group');
    fields.forEach(field => field.style.display = 'none');
}

// Function to clear connector input fields
function clearConnectorFields() {
    document.getElementById('connector-name').value = '';
    document.getElementById('connector-asset-a').value = '';
    document.getElementById('connector-asset-b').value = '';
    document.getElementById('connector-serial-id').value = '';
    document.getElementById('connector-location').value = '';
    document.getElementById('connector-compliance').value = '';
    document.getElementById('connector-lifecycle').value = '';
    document.getElementById('connector-warranty').value = '';
    document.getElementById('connector-value').value = '';
    document.getElementById('connector-purchase-date').value = '';
    document.getElementById('connector-depreciated-value').value = '';
    document.getElementById('connector-depreciated-value-date').value = '';
    document.getElementById('connector-notes').value = '';
    document.getElementById('connector-orientation').value = 'horizontal'; // Reset orientation field
}

// Function to disable the Add Connector button
function disableAddConnectorButton() {
    const addButton = document.getElementById('add-connector-button');
    addButton.disabled = true;
    addButton.style.backgroundColor = 'grey';
}

// Function to enable the Add Connector button
function enableAddConnectorButton() {
    const addButton = document.getElementById('add-connector-button');
    addButton.disabled = false;
    addButton.style.backgroundColor = ''; // Resets the background color to default
}

// Function to set editing indicator
function setConnectorEditingIndicator(message = '') {
    const indicator = document.getElementById('editing-indicator');
    indicator.innerText = message;
}

// Initialize the network diagram on page load
document.addEventListener('DOMContentLoaded', () => {
    loadNetworkDiagram();
    loadSavedConnectors(); // Ensure connectors are loaded and displayed
});
