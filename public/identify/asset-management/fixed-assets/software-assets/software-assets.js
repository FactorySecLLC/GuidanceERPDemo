let editIndex = -1;

async function saveAssetsData() {
    const softwareName = document.getElementById('software-name').value;
    const softwareDescription = document.getElementById('software-description').value;
    const updateProcess = document.getElementById('update-process').value;
    const installedVersion = document.getElementById('installed-version').value;
    const softwareManager = document.getElementById('software-manager').value;
    const notes = document.getElementById('notes').value;

    if (softwareName && installedVersion) {
        let assets = await fetchAssets();
        const assetData = {
            softwareName,
            softwareDescription,
            updateProcess,
            installedVersion,
            softwareManager,
            notes
        };

        if (editIndex >= 0) {
            assets[editIndex] = assetData;
            editIndex = -1;
        } else {
            assets.push(assetData);
        }

        const data = { assets };

        fetch('/save-software-assets', {
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
    document.getElementById('software-name').value = '';
    document.getElementById('software-description').value = '';
    document.getElementById('update-process').value = '';
    document.getElementById('installed-version').value = '';
    document.getElementById('software-manager').value = '';
    document.getElementById('notes').value = '';
}

async function loadSavedAssetsData() {
    fetch('/software-assets-data')
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
                        <strong>Software Name:</strong> ${asset.softwareName} <br>
                        <strong>Software Description:</strong> ${asset.softwareDescription} <br>
                        <strong>Update Process:</strong> ${asset.updateProcess} <br>
                        <strong>Current Installed Version:</strong> ${asset.installedVersion} <br>
                        <strong>Software Manager:</strong> ${asset.softwareManager} <br>
                        <strong>Notes:</strong> ${asset.notes}
                    </div>
                    <div class="asset-buttons">
                        <button onclick="editAsset(${index})">Edit</button>
                        <button onclick="deleteAsset(${index})">Delete</button>
                    </div>
                `;
                listContainer.appendChild(assetElement);
            });
        } else {
            listContainer.innerText = 'No saved software assets found.';
        }
    })
    .catch(error => {
        console.error('Error fetching saved assets:', error);
        document.getElementById('saved-assets-list').innerText = 'Failed to load saved software assets.';
    });
}

async function fetchAssets() {
    return fetch('/software-assets-data')
        .then(response => response.json())
        .then(data => data.assets || [])
        .catch(error => {
            console.error('Error fetching saved software assets:', error);
            return [];
        });
}

async function deleteAsset(index) {
    fetch(`/delete-software-asset/${index}`, {
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
    fetch(`/software-assets-data`)
    .then(response => response.json())
    .then(data => {
        if (data && data.assets && data.assets[index]) {
            showInputFields();
            document.getElementById('software-name').value = data.assets[index].softwareName;
            document.getElementById('software-description').value = data.assets[index].softwareDescription;
            document.getElementById('update-process').value = data.assets[index].updateProcess;
            document.getElementById('installed-version').value = data.assets[index].installedVersion;
            document.getElementById('software-manager').value = data.assets[index].softwareManager;
            document.getElementById('notes').value = data.assets[index].notes;
            editIndex = index;
            setEditingIndicator(data.assets[index].softwareName);
            disableAddButton();
        }
    })
    .catch(error => {
        console.error('Error fetching software asset:', error);
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
