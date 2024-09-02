let editIndex = -1;

document.addEventListener('DOMContentLoaded', loadSavedOtherAssetsData);

async function saveOtherAssetsData() {
    const otherAssetName = document.getElementById('other-asset-name').value;
    const otherAssetValue = document.getElementById('other-asset-value').value;
    const otherAssetNotes = document.getElementById('other-asset-notes').value;

    if (otherAssetName && otherAssetValue) {
        let otherAssets = await fetchOtherAssets();
        const otherAssetData = {
            otherAssetName,
            otherAssetValue,
            otherAssetNotes
        };

        if (editIndex >= 0) {
            otherAssets[editIndex] = otherAssetData;
            editIndex = -1;
        } else {
            otherAssets.push(otherAssetData);
        }

        const data = { otherAssets };

        fetch('/save-other-assets', {
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
            loadSavedOtherAssetsData();
            setEditingIndicator();
            hideInputFields();
            enableAddButton();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}

function addOtherAsset() {
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
    document.getElementById('other-asset-name').value = '';
    document.getElementById('other-asset-value').value = '';
    document.getElementById('other-asset-notes').value = '';
}

async function loadSavedOtherAssetsData() {
    fetch('/other-assets-data')
    .then(response => response.json())
    .then(data => {
        const listContainer = document.getElementById('saved-other-assets-list');
        listContainer.innerHTML = '';
        if (data && data.otherAssets) {
            data.otherAssets.forEach((asset, index) => {
                const assetElement = document.createElement('div');
                assetElement.classList.add('asset-item');
                assetElement.innerHTML = `
                    <div class="asset-info">
                        <strong>Asset Name:</strong> ${asset.otherAssetName} <br>
                        <strong>Asset Value:</strong> ${asset.otherAssetValue} <br>
                        <strong>Notes:</strong> ${asset.otherAssetNotes}
                    </div>
                    <div class="asset-buttons">
                        <button onclick="editOtherAsset(${index})">Edit</button>
                        <button onclick="deleteOtherAsset(${index})">Delete</button>
                    </div>
                `;
                listContainer.appendChild(assetElement);
            });
        } else {
            listContainer.innerText = 'No saved other assets found.';
        }
    })
    .catch(error => {
        console.error('Error fetching saved other assets:', error);
        document.getElementById('saved-other-assets-list').innerText = 'Failed to load saved other assets.';
    });
}

async function fetchOtherAssets() {
    return fetch('/other-assets-data')
        .then(response => response.json())
        .then(data => data.otherAssets || [])
        .catch(error => {
            console.error('Error fetching saved other assets:', error);
            return [];
        });
}

async function deleteOtherAsset(index) {
    fetch(`/delete-other-asset/${index}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        loadSavedOtherAssetsData();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function editOtherAsset(index) {
    fetch(`/other-assets-data`)
    .then(response => response.json())
    .then(data => {
        if (data && data.otherAssets && data.otherAssets[index]) {
            showInputFields();
            document.getElementById('other-asset-name').value = data.otherAssets[index].otherAssetName;
            document.getElementById('other-asset-value').value = data.otherAssets[index].otherAssetValue;
            document.getElementById('other-asset-notes').value = data.otherAssets[index].otherAssetNotes;
            editIndex = index;
            setEditingIndicator(data.otherAssets[index].otherAssetName);
            disableAddButton();
        }
    })
    .catch(error => {
        console.error('Error fetching other asset:', error);
    });
}

function setEditingIndicator(otherAssetName = '') {
    const indicator = document.getElementById('editing-indicator');
    if (otherAssetName) {
        indicator.innerText = `Editing Asset: ${otherAssetName}`;
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
