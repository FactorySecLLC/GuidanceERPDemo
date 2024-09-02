let editIndex = -1;
let additionalFields = [];

async function saveAssetsData() {
    const assetName = document.getElementById('asset-name').value;
    const assetDescription = document.getElementById('asset-description').value;
    const purchaseCost = document.getElementById('purchase-cost').value;
    const purchaseDate = document.getElementById('purchase-date').value;
    const depreciatedValue = document.getElementById('depreciated-value').value;
    const depreciatedValueDate = document.getElementById('depreciated-value-date').value;
    const notes = document.getElementById('notes').value;

    const additionalFieldValues = additionalFields.map(field => field.value);

    if (assetName && purchaseCost) {
        let assets = await fetchAssets();
        const assetData = {
            assetName,
            assetDescription,
            purchaseCost,
            purchaseDate,
            depreciatedValue,
            depreciatedValueDate,
            notes,
            additionalFields: additionalFieldValues
        };

        if (editIndex >= 0) {
            assets[editIndex] = assetData;
            editIndex = -1;
        } else {
            assets.push(assetData);
        }

        const data = { assets };

        fetch('/save-other-fixed-assets', {
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
            loadSavedAssetsData();
            setEditingIndicator();
            hideInputFields();
            enableAddButton();
            hideAddFieldButton(); // Hide the Add Field button after saving
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}

function addAsset() {
    showInputFields();
    clearInputFields();
    setEditingIndicator();
    disableAddButton();
    showAddFieldButton(); // Show the Add Field button when the Add button is pressed
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
    document.getElementById('asset-name').value = '';
    document.getElementById('asset-description').value = '';
    document.getElementById('purchase-cost').value = '';
    document.getElementById('purchase-date').value = '';
    document.getElementById('depreciated-value').value = '';
    document.getElementById('depreciated-value-date').value = '';
    document.getElementById('notes').value = '';

    const additionalFieldsContainer = document.getElementById('additional-fields-container');
    additionalFieldsContainer.innerHTML = '';
    additionalFields = [];
}

function addNewField() {
    const newField = document.createElement('input');
    newField.type = 'text';
    newField.placeholder = 'Additional Field';
    document.getElementById('additional-fields-container').appendChild(newField);
    additionalFields.push(newField);
}

function showAddFieldButton() {
    const addFieldButton = document.getElementById('add-field-button');
    addFieldButton.style.display = 'inline-block';
}

function hideAddFieldButton() {
    const addFieldButton = document.getElementById('add-field-button');
    addFieldButton.style.display = 'none';
}

async function loadSavedAssetsData() {
    fetch('/other-fixed-assets-data')
    .then(response => response.json())
    .then(data => {
        const listContainer = document.getElementById('saved-assets-list');
        listContainer.innerHTML = '';
        if (data && data.assets) {
            data.assets.forEach((asset, index) => {
                const assetElement = document.createElement('div');
                assetElement.classList.add('asset-item');
                assetElement.innerHTML = `
                    <div class="asset-info">
                        <strong>Asset Name:</strong> ${asset.assetName} <br>
                        <strong>Asset Description:</strong> ${asset.assetDescription} <br>
                        <strong>Purchase Cost:</strong> ${asset.purchaseCost} <br>
                        <strong>Purchase Date:</strong> ${asset.purchaseDate} <br>
                        <strong>Estimated Depreciated Value:</strong> ${asset.depreciatedValue} <br>
                        <strong>Depreciated Value Date:</strong> ${asset.depreciatedValueDate} <br>
                        <strong>Notes:</strong> ${asset.notes} <br>
                        ${asset.additionalFields.map((field, i) => `<strong>Additional Field ${i+1}:</strong> ${field} <br>`).join('')}
                    </div>
                    <div class="asset-buttons">
                        <button onclick="editAsset(${index})">Edit</button>
                        <button onclick="deleteAsset(${index})">Delete</button>
                    </div>
                `;
                listContainer.appendChild(assetElement);
            });
        } else {
            listContainer.innerText = 'No saved assets found.';
        }
    })
    .catch(error => {
        console.error('Error fetching saved assets:', error);
        document.getElementById('saved-assets-list').innerText = 'Failed to load saved assets.';
    });
}

async function fetchAssets() {
    return fetch('/other-fixed-assets-data')
        .then(response => response.json())
        .then(data => data.assets || [])
        .catch(error => {
            console.error('Error fetching saved assets:', error);
            return [];
        });
}

async function deleteAsset(index) {
    fetch(`/delete-other-fixed-asset/${index}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        loadSavedAssetsData();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function editAsset(index) {
    fetch(`/other-fixed-assets-data`)
    .then(response => response.json())
    .then(data => {
        if (data && data.assets && data.assets[index]) {
            showInputFields();
            document.getElementById('asset-name').value = data.assets[index].assetName;
            document.getElementById('asset-description').value = data.assets[index].assetDescription;
            document.getElementById('purchase-cost').value = data.assets[index].purchaseCost;
            document.getElementById('purchase-date').value = data.assets[index].purchaseDate;
            document.getElementById('depreciated-value').value = data.assets[index].depreciatedValue;
            document.getElementById('depreciated-value-date').value = data.assets[index].depreciatedValueDate;
            document.getElementById('notes').value = data.assets[index].notes;

            const additionalFieldsContainer = document.getElementById('additional-fields-container');
            additionalFieldsContainer.innerHTML = '';
            additionalFields = data.assets[index].additionalFields.map(field => {
                const newField = document.createElement('input');
                newField.type = 'text';
                newField.value = field;
                additionalFieldsContainer.appendChild(newField);
                return newField;
            });

            editIndex = index;
            setEditingIndicator(data.assets[index].assetName);
            disableAddButton();
            showAddFieldButton(); // Show the Add Field button when editing
        }
    })
    .catch(error => {
        console.error('Error fetching asset:', error);
    });
}

function setEditingIndicator(name = '') {
    const indicator = document.getElementById('editing-indicator');
    if (name) {
        indicator.innerText = `Editing ${name}`;
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

document.addEventListener('DOMContentLoaded', loadSavedAssetsData);
