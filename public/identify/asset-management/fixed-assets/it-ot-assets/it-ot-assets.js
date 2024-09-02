let editIndex = -1;

async function saveAssetsData() {
    const modelName = document.getElementById('model-name').value;
    const assetTag = document.getElementById('asset-tag').value;
    const serialId = document.getElementById('serial-id').value;
    const location = document.getElementById('location').value;
    const purchaseCost = document.getElementById('purchase-cost').value;
    const purchaseDate = document.getElementById('purchase-date').value;
    const depreciatedValue = document.getElementById('depreciated-value').value;
    const depreciatedValueDate = document.getElementById('depreciated-value-date').value;
    const assetOwner = document.getElementById('asset-owner').value;
    const macAddress = document.getElementById('mac-address').value;
    const warranty = document.getElementById('warranty').value;
    const operatingSystem = document.getElementById('operating-system').value;
    const dataSensitivityLevel = document.getElementById('data-sensitivity-level').value;
    const accessControlDetails = document.getElementById('access-control-details').value;
    const backupStatus = document.getElementById('backup-status').value;
    const incidentHistory = document.getElementById('incident-history').value;
    const softwareInstalled = document.getElementById('software-installed').value;
    const updateInformation = document.getElementById('update-information').value;
    const firmwareVersion = document.getElementById('firmware-version').value;
    const encryptionTransit = document.getElementById('encryption-transit').value;
    const encryptionRest = document.getElementById('encryption-rest').value;
    const eolStatus = document.getElementById('eol-status').value;
    const knownVulnerabilities = document.getElementById('known-vulnerabilities').value; // New field
    const vulnerabilitiesLastChecked = document.getElementById('vulnerabilities-last-checked').value; // New field
    const notes = document.getElementById('notes').value;

    if (modelName && assetTag) {
        let assets = await fetchAssets();
        const assetData = {
            modelName,
            assetTag,
            serialId,
            location,
            purchaseCost,
            purchaseDate,
            depreciatedValue,
            depreciatedValueDate,
            assetOwner,
            macAddress,
            warranty,
            operatingSystem,
            dataSensitivityLevel,
            accessControlDetails,
            backupStatus,
            incidentHistory,
            softwareInstalled,
            updateInformation,
            firmwareVersion,
            encryptionTransit,
            encryptionRest,
            eolStatus,
            knownVulnerabilities, // New field
            vulnerabilitiesLastChecked, // New field
            notes
        };

        if (editIndex >= 0) {
            assets[editIndex] = assetData;
            editIndex = -1;
        } else {
            assets.push(assetData);
        }

        const data = { assets };

        fetch('/save-it-ot-assets', {
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
    document.getElementById('model-name').value = '';
    document.getElementById('asset-tag').value = '';
    document.getElementById('serial-id').value = '';
    document.getElementById('location').value = '';
    document.getElementById('purchase-cost').value = ''; // New field
    document.getElementById('purchase-date').value = '';
    document.getElementById('depreciated-value').value = '';
    document.getElementById('depreciated-value-date').value = '';
    document.getElementById('asset-owner').value = '';
    document.getElementById('mac-address').value = '';
    document.getElementById('warranty').value = '';
    document.getElementById('operating-system').value = '';
    document.getElementById('data-sensitivity-level').value = '';
    document.getElementById('access-control-details').value = '';
    document.getElementById('backup-status').value = '';
    document.getElementById('incident-history').value = '';
    document.getElementById('software-installed').value = '';
    document.getElementById('update-information').value = '';
    document.getElementById('firmware-version').value = '';
    document.getElementById('encryption-transit').value = '';
    document.getElementById('encryption-rest').value = '';
    document.getElementById('eol-status').value = '';
    document.getElementById('known-vulnerabilities').value = ''; // New field
    document.getElementById('vulnerabilities-last-checked').value = ''; // New field
    document.getElementById('notes').value = '';
}

async function loadSavedAssetsData() {
    fetch('/it-ot-assets-data')
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
                        <strong>Model Name:</strong> ${asset.modelName} <br>
                        <strong>Asset Tag:</strong> ${asset.assetTag} <br>
                        <strong>Serial ID:</strong> ${asset.serialId} <br>
                        <strong>Location:</strong> ${asset.location} <br>
                        <strong>Purchase Cost:</strong> ${asset.purchaseCost} <br> <!-- New field -->
                        <strong>Purchase Date:</strong> ${asset.purchaseDate} <br>
                        <strong>Estimated Depreciated Value:</strong> ${asset.depreciatedValue} <br>
                        <strong>Depreciated Value Date:</strong> ${asset.depreciatedValueDate} <br>
                        <strong>Asset Owner:</strong> ${asset.assetOwner} <br>
                        <strong>MAC Address:</strong> ${asset.macAddress} <br>
                        <strong>Warranty:</strong> ${asset.warranty} <br>
                        <strong>Operating System:</strong> ${asset.operatingSystem} <br>
                        <strong>Data Sensitivity Level:</strong> ${asset.dataSensitivityLevel} <br>
                        <strong>Access Control Details:</strong> ${asset.accessControlDetails} <br>
                        <strong>Backup Status:</strong> ${asset.backupStatus} <br>
                        <strong>Information Security Incident History:</strong> ${asset.incidentHistory} <br>
                        <strong>Software Installed:</strong> ${asset.softwareInstalled} <br>
                        <strong>Update Information:</strong> ${asset.updateInformation} <br>
                        <strong>Firmware Version:</strong> ${asset.firmwareVersion} <br>
                        <strong>Encryption in Transit Information:</strong> ${asset.encryptionTransit} <br>
                        <strong>Encryption at Rest Information:</strong> ${asset.encryptionRest} <br>
                        <strong>End of Life Status:</strong> ${asset.eolStatus} <br>
                        <strong>Known Vulnerabilities:</strong> ${asset.knownVulnerabilities} <br> <!-- New field -->
                        <strong>Known Vulnerabilities Last Date Checked:</strong> ${asset.vulnerabilitiesLastChecked} <br> <!-- New field -->
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
            listContainer.innerText = 'No saved assets found.';
        }
    })
    .catch(error => {
        console.error('Error fetching saved assets:', error);
        document.getElementById('saved-assets-list').innerText = 'Failed to load saved assets.';
    });
}

async function fetchAssets() {
    return fetch('/it-ot-assets-data')
        .then(response => response.json())
        .then(data => data.assets || [])
        .catch(error => {
            console.error('Error fetching saved assets:', error);
            return [];
        });
}

async function deleteAsset(index) {
    fetch(`/delete-it-ot-asset/${index}`, {
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
    fetch(`/it-ot-assets-data`)
    .then(response => response.json())
    .then(data => {
        if (data && data.assets && data.assets[index]) {
            showInputFields();
            document.getElementById('model-name').value = data.assets[index].modelName;
            document.getElementById('asset-tag').value = data.assets[index].assetTag;
            document.getElementById('serial-id').value = data.assets[index].serialId;
            document.getElementById('location').value = data.assets[index].location;
            document.getElementById('purchase-cost').value = data.assets[index].purchaseCost; // New field
            document.getElementById('purchase-date').value = data.assets[index].purchaseDate;
            document.getElementById('depreciated-value').value = data.assets[index].depreciatedValue;
            document.getElementById('depreciated-value-date').value = data.assets[index].depreciatedValueDate;
            document.getElementById('asset-owner').value = data.assets[index].assetOwner;
            document.getElementById('mac-address').value = data.assets[index].macAddress;
            document.getElementById('warranty').value = data.assets[index].warranty;
            document.getElementById('operating-system').value = data.assets[index].operatingSystem;
            document.getElementById('data-sensitivity-level').value = data.assets[index].dataSensitivityLevel;
            document.getElementById('access-control-details').value = data.assets[index].accessControlDetails;
            document.getElementById('backup-status').value = data.assets[index].backupStatus;
            document.getElementById('incident-history').value = data.assets[index].incidentHistory;
            document.getElementById('software-installed').value = data.assets[index].softwareInstalled;
            document.getElementById('update-information').value = data.assets[index].updateInformation;
            document.getElementById('firmware-version').value = data.assets[index].firmwareVersion;
            document.getElementById('encryption-transit').value = data.assets[index].encryptionTransit;
            document.getElementById('encryption-rest').value = data.assets[index].encryptionRest;
            document.getElementById('eol-status').value = data.assets[index].eolStatus;
            document.getElementById('known-vulnerabilities').value = data.assets[index].knownVulnerabilities; // New field
            document.getElementById('vulnerabilities-last-checked').value = data.assets[index].vulnerabilitiesLastChecked; // New field
            document.getElementById('notes').value = data.assets[index].notes;

            editIndex = index;
            setEditingIndicator(data.assets[index].modelName);
            disableAddButton();
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
