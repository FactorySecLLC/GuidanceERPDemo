let editIndex = -1;

async function saveMaterialData() {
    const data = {
        material: {
            itemName: document.getElementById('item-name').value,
            quantity: document.getElementById('quantity').value,
            costPerUnit: document.getElementById('cost-per-unit').value,
            materialIdentification: document.getElementById('material-identification').value,
            supplier: document.getElementById('supplier').value,
            notes: document.getElementById('notes').value,
            dateLastChecked: document.getElementById('date-last-checked').value
        },
        editIndex: editIndex // Include edit index in the request body
    };

    const response = await fetch('/save-materials', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(res => res.json());

    if (response.error) {
        console.error('Error:', response.error);
    } else {
        console.log('Success:', response);
        clearInputFields();
        loadSavedMaterialsData();
        setEditingIndicator();
        hideInputFields();
        enableAddButton();
    }
}

function addMaterial() {
    showInputFields();
    clearInputFields();
    setEditingIndicator();
    disableAddButton();
}

function showInputFields() {
    const fields = document.querySelectorAll('.question-group, .add-buttons');
    fields.forEach((field) => (field.style.display = 'block'));
}

function hideInputFields() {
    const fields = document.querySelectorAll('.question-group, .add-buttons');
    fields.forEach((field) => (field.style.display = 'none'));
}

function clearInputFields() {
    document.getElementById('item-name').value = '';
    document.getElementById('quantity').value = '';
    document.getElementById('cost-per-unit').value = '';
    document.getElementById('material-identification').value = '';
    document.getElementById('supplier').value = '';
    document.getElementById('notes').value = '';
    document.getElementById('date-last-checked').value = '';
}

async function loadSavedMaterialsData() {
    try {
        const materials = await fetchMaterials();
        const listContainer = document.getElementById('saved-material-list');
        listContainer.innerHTML = '';
        if (materials.length > 0) {
            materials.forEach((material, index) => {
                const materialElement = document.createElement('div');
                materialElement.className = 'material-item';
                materialElement.innerHTML = `
                    <div class="material-info">
                        <strong>Item Name:</strong> ${material.itemName} <br>
                        <strong>Quantity:</strong> ${material.quantity} <br>
                        <strong>Cost per Unit:</strong> ${material.costPerUnit} <br>
                        <strong>Material Identification:</strong> ${material.materialIdentification} <br>
                        <strong>Supplier:</strong> ${material.supplier} <br>
                        <strong>Notes:</strong> ${material.notes} <br>
                        <strong>Date Last Checked:</strong> ${material.dateLastChecked}
                    </div>
                    <div class="material-buttons">
                        <button onclick="editMaterial(${index})">Edit</button>
                        <button onclick="deleteMaterial(${index})">Delete</button>
                    </div>
                `;
                listContainer.appendChild(materialElement);
            });
        } else {
            listContainer.innerText = 'No saved materials found.';
        }
    } catch (error) {
        console.error('Error fetching saved materials:', error);
        document.getElementById('saved-material-list').innerText = 'Failed to load saved materials.';
    }
}

async function fetchMaterials() {
    try {
        const response = await fetch('/materials-data');
        const data = await response.json();
        return data.materials || [];
    } catch (error) {
        console.error('Error fetching materials:', error);
        return [];
    }
}

async function loadSuppliers() {
    try {
        const response = await fetch('/suppliers-data');
        const data = await response.json();
        const supplierSelect = document.getElementById('supplier');
        supplierSelect.innerHTML = data.suppliers.map(supplier => 
            `<option value="${supplier.name}">${supplier.name}</option>`).join('');
    } catch (error) {
        console.error('Error fetching suppliers:', error);
    }
}

function editMaterial(index) {
    fetchMaterials().then(materials => {
        const material = materials[index];
        if (material) {
            showInputFields();
            document.getElementById('item-name').value = material.itemName;
            document.getElementById('quantity').value = material.quantity;
            document.getElementById('cost-per-unit').value = material.costPerUnit;
            document.getElementById('material-identification').value = material.materialIdentification;
            document.getElementById('supplier').value = material.supplier;
            document.getElementById('notes').value = material.notes;
            document.getElementById('date-last-checked').value = material.dateLastChecked;

            editIndex = index;
            setEditingIndicator(material.itemName);
            disableAddButton();
        }
    });
}

function deleteMaterial(index) {
    fetch('/delete-material/' + index, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            loadSavedMaterialsData();
        })
        .catch(error => {
            console.error('Error:', error);
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

document.addEventListener('DOMContentLoaded', () => {
    loadSuppliers();
    loadSavedMaterialsData();
});
