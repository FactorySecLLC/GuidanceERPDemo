let dataTypes = [];
let editIndex = -1;
let classification = {};

document.addEventListener('DOMContentLoaded', loadDataTypes);

async function loadDataTypes() {
    classification = await fetchSavedClassification();
    dataTypes = await fetchSavedDataTypes();

    if (classification) populateClassificationDiagram(classification);
    if (dataTypes.length > 0) loadSavedDataTypes();
}

function populateClassificationDiagram(savedClassification) {
    const confidentialSection = document.querySelector('.classification-section.confidential');
    const internalSection = document.querySelector('.classification-section.internal');
    const externalSection = document.querySelector('.classification-section.external');

    // Clear existing content
    confidentialSection.innerHTML = '<div class="classification-section-label">Confidential</div>';
    internalSection.innerHTML = '<div class="classification-section-label">Internal</div>';
    externalSection.innerHTML = '<div class="classification-section-label">External</div>';

    // Populate data types
    if (savedClassification) {
        Object.keys(savedClassification).forEach(name => {
            const dataDiv = createDraggableItem(name);
            const classificationLevel = savedClassification[name];
            if (classificationLevel === 'confidential') {
                confidentialSection.appendChild(dataDiv);
            } else if (classificationLevel === 'internal') {
                internalSection.appendChild(dataDiv);
            } else if (classificationLevel === 'external') {
                externalSection.appendChild(dataDiv);
            }
        });
    }
}

// Helper function to create draggable items
function createDraggableItem(name) {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('draggable-item', 'data-type-item');
    itemDiv.innerText = name;
    itemDiv.draggable = true;
    itemDiv.dataset.name = name;
    itemDiv.addEventListener('dragstart', dragStart);
    itemDiv.addEventListener('dragend', dragEnd);
    return itemDiv;
}

// Drag and drop functionality
function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.name);
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
    const item = document.querySelector(`[data-name="${name}"]`);
    if (item) {
        e.currentTarget.appendChild(item);
        classification[name] = e.currentTarget.dataset.classification;
    }
}

// Save the data classification diagram
async function saveDataClassification() {
    document.querySelectorAll('.classification-section').forEach(section => {
        const classificationLevel = section.dataset.classification;
        section.querySelectorAll('.draggable-item').forEach(item => {
            classification[item.dataset.name] = classificationLevel;
        });
    });

    await fetch('/save-data-classification', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ classification })
    });

    alert('Data classification diagram saved successfully!');

    // Reload the saved data types to update the confidentiality status
    loadSavedDataTypes();
}


// Show the data type form
function showDataTypeForm() {
    const fields = document.querySelectorAll('.question-group');
    fields.forEach(field => field.style.display = 'block');
    disableAddButton();
}

// Function to add or edit a data type
async function saveDataType() {
    const name = document.getElementById('data-type-name').value.trim();
    const description = document.getElementById('data-type-description').value.trim();

    if (name && description) {
        const existingIndex = dataTypes.findIndex(dt => dt.name === name);
        const dataType = { name, description };
        if (editIndex >= 0) {
            dataTypes[editIndex] = dataType;
            editIndex = -1;
        } else if (existingIndex === -1) {
            dataTypes.push(dataType);
            classification[name] = 'internal'; // Default to Internal category
        } else {
            alert("Data type already exists!");
            return;
        }

        await saveDataTypes();
        await saveDataClassification();
        clearInputFields();
        loadSavedDataTypes();
        const newItem = createDraggableItem(name);
        document.querySelector('.classification-section.internal').appendChild(newItem);
        hideDataTypeForm();
        enableAddButton();
    }
}

// Function to save data types
async function saveDataTypes() {
    // Ensure that you fetch the latest data types from the server before merging
    const response = await fetch('/data-types-data');
    const existingData = await response.json();
    const mergedDataTypes = existingData.dataTypes || [];

    // Clear duplicates within dataTypes array
    dataTypes = dataTypes.filter((newType, index) => {
        const existsInMerged = mergedDataTypes.some(existingType => existingType.name === newType.name);
        return !existsInMerged || index === dataTypes.findIndex(dt => dt.name === newType.name);
    });

    // Merge and save
    dataTypes.forEach(newType => {
        const exists = mergedDataTypes.some(existingType => existingType.name === newType.name);
        if (!exists) {
            mergedDataTypes.push(newType);
        }
    });

    await fetch('/save-data-types', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dataTypes: mergedDataTypes })
    });
}

// Load saved data types
function loadSavedDataTypes() {
    const listContainer = document.getElementById('saved-data-types-list');
    listContainer.innerHTML = '';

    dataTypes.forEach((dataType, index) => {
        const dataTypeElement = document.createElement('div');
        dataTypeElement.classList.add('data-type-item');
        dataTypeElement.innerHTML = `
            <div><strong>Name:</strong> ${dataType.name}</div>
            <div><strong>Description:</strong> ${dataType.description}</div>
            <div><strong>Confidentiality:</strong> ${classification[dataType.name]}</div>
            <div>
                <button onclick="editDataType(${index})">Edit</button>
                <button onclick="deleteDataType(${index})">Delete</button>
            </div>
        `;
        listContainer.appendChild(dataTypeElement);
    });
}

// Function to edit a data type
function editDataType(index) {
    const dataType = dataTypes[index];
    document.getElementById('data-type-name').value = dataType.name;
    document.getElementById('data-type-description').value = dataType.description;
    editIndex = index;
    setEditingIndicator(dataType.name);
    showDataTypeForm();
}

// Function to delete a data type
async function deleteDataType(index) {
    const dataTypeName = dataTypes[index].name;
    delete classification[dataTypeName]; // Remove from classification
    dataTypes.splice(index, 1);
    await saveDataTypes();
    await saveDataClassification();
    loadSavedDataTypes();
    populateClassificationDiagram(classification); // Refresh the classification diagram
}

// Helper functions
function clearInputFields() {
    document.getElementById('data-type-name').value = '';
    document.getElementById('data-type-description').value = '';
    enableAddButton();
    setEditingIndicator();
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

function setEditingIndicator(name = '') {
    const indicator = document.getElementById('editing-indicator');
    if (name) {
        indicator.innerText = `Editing ${name}`;
    } else {
        indicator.innerText = '';
    }
}

// Fetch saved data classification from the server
async function fetchSavedClassification() {
    const response = await fetch('/data-classification-data');
    return response.json().then(data => {
        classification = data.classification || {};
        return classification;
    });
}

// Fetch saved data types from the server
async function fetchSavedDataTypes() {
    const response = await fetch('/data-types-data');
    return response.json().then(data => data.dataTypes || []);
}
