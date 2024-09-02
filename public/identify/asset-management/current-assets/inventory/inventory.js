let editIndex = -1;
let bomIndex = 0;
let selectedBOMItems = [];
let bomQuantities = {};

document.addEventListener('DOMContentLoaded', () => {
    loadSavedValuationMethod();
    loadSavedInventoryData();
    loadBOMDropdown(); // Load initial BOM dropdown
});

async function saveValuationMethod() {
    const valuationMethod = document.getElementById('valuation-method').value;

    fetch('/save-valuation-method', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ valuationMethod })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Valuation Method Saved:', data);
        displaySavedValuationMethod(valuationMethod);
        showSaveConfirmation(); // Show confirmation after successful save
    })
    .catch(error => {
        console.error('Error saving valuation method:', error);
    });
}

async function loadSavedValuationMethod() {
    fetch('/valuation-method-data')
    .then(response => response.json())
    .then(data => {
        if (data && data.valuationMethod) {
            document.getElementById('valuation-method').value = data.valuationMethod;
            displaySavedValuationMethod(data.valuationMethod);
        }
    })
    .catch(error => {
        console.error('Error loading valuation method:', error);
    });
}

function displaySavedValuationMethod(valuationMethod) {
    const displayArea = document.getElementById('saved-valuation-method');
    displayArea.innerHTML = `Selected Inventory Valuation Method: <strong>${valuationMethod}</strong>`;
}

function showSaveConfirmation() {
    const confirmationMessage = document.createElement('div');
    confirmationMessage.innerText = 'Valuation Method Saved Successfully!';
    confirmationMessage.style.position = 'fixed';
    confirmationMessage.style.bottom = '20px';
    confirmationMessage.style.right = '20px';
    confirmationMessage.style.backgroundColor = '#4CAF50';
    confirmationMessage.style.color = 'white';
    confirmationMessage.style.padding = '10px';
    confirmationMessage.style.borderRadius = '5px';
    confirmationMessage.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.1)';
    confirmationMessage.style.zIndex = '1000';

    document.body.appendChild(confirmationMessage);

    setTimeout(() => {
        confirmationMessage.remove();
    }, 3000); // Remove after 3 seconds
}

async function saveInventoryData() {
    const inventoryName = document.getElementById('inventory-name').value;
    const inventoryTotalCost = document.getElementById('inventory-total-cost').value;
    const costDateChecked = document.getElementById('cost-date-checked').value;
    const inventoryNotes = document.getElementById('inventory-notes').value;
    const estimatedBOMCost = document.getElementById('estimated-bom-cost').innerText.replace('Estimated Bill of Materials Cost: $', '');

    if (inventoryName && inventoryTotalCost && costDateChecked) {
        let inventory = await fetchInventory();
        const inventoryData = {
            inventoryName,
            inventoryTotalCost,
            costDateChecked,
            inventoryNotes,
            bomItems: selectedBOMItems.map(item => ({
                name: item,
                quantity: bomQuantities[item].value
            })),
            bomCost: estimatedBOMCost
        };

        if (editIndex >= 0) {
            inventory[editIndex] = inventoryData;
            editIndex = -1;
        } else {
            inventory.push(inventoryData);
        }

        const data = { inventory };

        fetch('/save-inventory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            clearInputFields();
            loadSavedInventoryData();
            setEditingIndicator();
            hideInputFields();
            enableAddButton();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}

function addInventory() {
    showInputFields();
    clearInputFields();
    setEditingIndicator();
    disableAddButton();
}

function showInputFields() {
    const fields = document.querySelectorAll('.question-group');
    fields.forEach(field => field.style.display = 'block');
}

function hideInputFields() {
    const fields = document.querySelectorAll('.question-group');
    fields.forEach(field => field.style.display = 'none');
}

function clearInputFields() {
    document.getElementById('inventory-name').value = '';
    document.getElementById('inventory-total-cost').value = '';
    document.getElementById('cost-date-checked').value = '';
    document.getElementById('inventory-notes').value = '';
    document.getElementById('bom-dropdowns-container').innerHTML = '';
    document.getElementById('bom-quantities-container').innerHTML = '';
    selectedBOMItems = [];
    bomQuantities = {};
    bomIndex = 0;
    loadBOMDropdown();
    document.getElementById('estimated-bom-cost').innerText = 'Estimated Bill of Materials Cost: $0.00';
}

async function loadSavedInventoryData() {
    fetch('/inventory-data')
    .then(response => response.json())
    .then(data => {
        const listContainer = document.getElementById('saved-inventory-list');
        listContainer.innerHTML = '';
        if (data && data.inventory) {
            data.inventory.forEach((item, index) => {
                const inventoryElement = document.createElement('div');
                inventoryElement.classList.add('asset-item');
                inventoryElement.innerHTML = `
                    <div class="asset-info">
                        <strong>Inventory Name:</strong> ${item.inventoryName} <br>
                        <strong>Inventory Total Cost:</strong> ${item.inventoryTotalCost} <br>
                        <strong>Date Checked:</strong> ${item.costDateChecked} <br>
                        <strong>Notes:</strong> ${item.inventoryNotes} <br>
                        <strong>Bill of Materials:</strong> ${item.bomItems.map(bom => bom.name).join(', ')} <br>
                        <strong>Quantities:</strong> ${item.bomItems.map(bom => `${bom.name}: ${bom.quantity}`).join(', ')} <br>
                        <strong>Estimated Bill of Materials Cost:</strong> $${item.bomCost}
                    </div>
                    <div class="asset-buttons">
                        <button onclick="editInventory(${index})">Edit</button>
                        <button onclick="deleteInventory(${index})">Delete</button>
                    </div>
                `;
                listContainer.appendChild(inventoryElement);
            });
        } else {
            listContainer.innerText = 'No saved inventory found.';
        }
    })
    .catch(error => {
        console.error('Error fetching saved inventory:', error);
        document.getElementById('saved-inventory-list').innerText = 'Failed to load saved inventory.';
    });
}

async function fetchInventory() {
    return fetch('/inventory-data')
        .then(response => response.json())
        .then(data => data.inventory || [])
        .catch(error => {
            console.error('Error fetching saved inventory:', error);
            return [];
        });
}

async function deleteInventory(index) {
    fetch(`/delete-inventory/${index}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        loadSavedInventoryData();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function editInventory(index) {
    fetch(`/inventory-data`)
    .then(response => response.json())
    .then(data => {
        if (data && data.inventory && data.inventory[index]) {
            showInputFields();
            const inventoryItem = data.inventory[index];
            document.getElementById('inventory-name').value = inventoryItem.inventoryName;
            document.getElementById('inventory-total-cost').value = inventoryItem.inventoryTotalCost;
            document.getElementById('cost-date-checked').value = inventoryItem.costDateChecked;
            document.getElementById('inventory-notes').value = inventoryItem.inventoryNotes;
            editIndex = index;
            setEditingIndicator(inventoryItem.inventoryName);
            disableAddButton();

            // Populate BOM items and quantities
            selectedBOMItems = [];
            bomQuantities = {};
            const dropdownContainer = document.getElementById('bom-dropdowns-container');
            const quantityContainer = document.getElementById('bom-quantities-container');
            dropdownContainer.innerHTML = '';
            quantityContainer.innerHTML = '';

            // Fetch materials data to get the costPerUnit
            fetch('/materials-data')
                .then(response => response.json())
                .then(materialData => {
                    inventoryItem.bomItems.forEach((bomItem, idx) => {
                        selectedBOMItems.push(bomItem.name);
                        const material = materialData.materials.find(mat => mat.itemName === bomItem.name);
                        const costPerUnit = material ? parseFloat(material.costPerUnit) : 0;

                        const dropdown = document.createElement('select');
                        dropdown.id = `bom-dropdown-${idx}`;
                        dropdown.name = `bom-dropdown-${idx}`;
                        dropdown.onchange = () => addBOMDropdown();
                        dropdown.innerHTML = `<option value=""></option>` + materialData.materials.map(material => 
                            `<option value="${material.itemName}" ${material.itemName === bomItem.name ? 'selected' : ''}>${material.itemName}</option>`
                        ).join('');
                        dropdownContainer.appendChild(dropdown);

                        const quantityInput = document.createElement('div');
                        quantityInput.classList.add('bom-quantity-item');
                        quantityInput.innerHTML = `
                            <label>${bomItem.name}:</label>
                            <input type="number" min="1" id="quantity-${bomItem.name}" value="${bomItem.quantity}" placeholder="Quantity" onchange="calculateEstimatedBOMCost()">
                            <div class="bom-cost">Cost per Unit: $${costPerUnit.toFixed(2)}</div>
                            <button type="button" onclick="calculateItemCost('${bomItem.name}', ${costPerUnit})">Calculate Item Cost</button>
                            <div class="bom-cost-times-quantity-input" id="cost-times-quantity-${bomItem.name}">Total Line Cost: $${(bomItem.quantity * costPerUnit).toFixed(2)}</div>
                            <div id="equation-${bomItem.name}" class="bom-equation"></div>
                        `;
                        bomQuantities[bomItem.name] = quantityInput.querySelector('input');
                        quantityContainer.appendChild(quantityInput);
                    });

                    calculateEstimatedBOMCost();
                    bomIndex = inventoryItem.bomItems.length;
                    loadBOMDropdown(); // Add a new dropdown at the end
                })
                .catch(error => {
                    console.error('Error loading materials data:', error);
                });
        }
    })
    .catch(error => {
        console.error('Error fetching inventory:', error);
    });
}

function setEditingIndicator(inventoryName = '') {
    const indicator = document.getElementById('editing-indicator');
    if (inventoryName) {
        indicator.innerText = `Editing Inventory: ${inventoryName}`;
    } else {
        indicator.innerText = '';
    }
}

function disableAddButton() {
    const addButton = document.getElementById('add-button');
    addButton.disabled = true;
    addButton.style.backgroundColor = 'grey';
}

function enableAddButton() {
    const addButton = document.getElementById('add-button');
    addButton.disabled = false;
    addButton.style.backgroundColor = '';
}

function loadBOMDropdown() {
    const container = document.getElementById('bom-dropdowns-container');
    const dropdown = document.createElement('select');
    dropdown.id = `bom-dropdown-${bomIndex}`;
    dropdown.name = `bom-dropdown-${bomIndex}`;
    dropdown.innerHTML = `<option value=""></option>`; // Default blank option
    dropdown.onchange = () => addBOMDropdown();

    fetch('/materials-data')
        .then(response => response.json())
        .then(data => {
            dropdown.innerHTML += data.materials.map(material => 
                `<option value="${material.itemName}" data-cost="${material.costPerUnit}">${material.itemName} ($${material.costPerUnit})</option>`
            ).join('');
            container.appendChild(dropdown);
        })
        .catch(error => console.error('Error loading BOM dropdown:', error));

    bomIndex++;
}

function addBOMDropdown() {
    const lastDropdown = document.getElementById(`bom-dropdown-${bomIndex - 1}`);
    const selectedValue = lastDropdown.value;
    const costPerUnit = lastDropdown.selectedOptions[0].getAttribute('data-cost');

    if (selectedValue && !selectedBOMItems.includes(selectedValue)) {
        selectedBOMItems.push(selectedValue);
        loadBOMDropdown(); // Add another dropdown
        addBOMQuantityInput(selectedValue, costPerUnit); // Add corresponding quantity input with cost per unit
    }
}

function addBOMQuantityInput(bomItem, costPerUnit) {
    const container = document.getElementById('bom-quantities-container');
    const quantityInput = document.createElement('div');
    quantityInput.classList.add('bom-quantity-item');

    // Create label, input for quantity, and button to calculate cost
    quantityInput.innerHTML = `
        <label>${bomItem}:</label>
        <input type="number" min="1" id="quantity-${bomItem}" placeholder="Quantity" onchange="calculateEstimatedBOMCost()">
        <div class="bom-cost">Cost per Unit: $${costPerUnit}</div>
        <button type="button" onclick="calculateItemCost('${bomItem}', ${costPerUnit})">Calculate Item Cost</button>
        <div class="bom-cost-times-quantity-input" id="cost-times-quantity-${bomItem}"></div>
        <div id="equation-${bomItem}" class="bom-equation"></div>
    `;

    bomQuantities[bomItem] = quantityInput.querySelector('input');
    container.appendChild(quantityInput);
}

// Function to calculate and display the item cost based on quantity input
function calculateItemCost(bomItem, costPerUnit) {
    const quantity = parseFloat(document.getElementById(`quantity-${bomItem}`).value) || 0;
    const totalCost = quantity * costPerUnit;
    const costTimesQuantityDiv = document.getElementById(`cost-times-quantity-${bomItem}`);

    // Display the total line cost with two decimal places
    costTimesQuantityDiv.innerText = `Total Line Cost: $${totalCost.toFixed(2)}`;
}

// Updated function to sum the Total Line Cost for each BOM item
async function calculateEstimatedBOMCost() {
    const estimatedCostDiv = document.getElementById('estimated-bom-cost');
    let totalCost = 0;

    // Select all elements with the class 'bom-cost-times-quantity-input'
    const costElements = document.querySelectorAll('.bom-cost-times-quantity-input');

    // Loop through each element and extract the total line cost
    costElements.forEach(element => {
        // Extract the dollar amount from the text content
        const costText = element.innerText.replace('Total Line Cost: $', '');
        const lineCost = parseFloat(costText) || 0;
        totalCost += lineCost;
    });

    // Display the final total cost, formatted to two decimal places
    estimatedCostDiv.innerText = `Estimated Bill of Materials Cost: $${totalCost.toFixed(2)}`;
}
