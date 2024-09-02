let editIndex = -1;

async function saveCashData() {
    const cashAmount = document.getElementById('cash-amount').value;
    const dateOfEntry = document.getElementById('date-of-entry').value;

    if (cashAmount && dateOfEntry) {
        let cashAssets = await fetchCashAssets();
        const cashData = {
            cashAmount,
            dateOfEntry
        };

        if (editIndex >= 0) {
            cashAssets[editIndex] = cashData;
            editIndex = -1;
        } else {
            cashAssets.push(cashData);
        }

        const data = { cashAssets };

        fetch('/save-cash-assets', {
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
            loadSavedCashData();
            setEditingIndicator();
            hideInputFields();
            enableAddButton();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}

function addCash() {
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
    document.getElementById('cash-amount').value = '';
    document.getElementById('date-of-entry').value = '';
}

async function loadSavedCashData() {
    fetch('/cash-assets-data')
    .then(response => response.json())
    .then(data => {
        const listContainer = document.getElementById('saved-cash-list');
        listContainer.innerHTML = '';
        if (data && data.cashAssets) {
            data.cashAssets.forEach((cash, index) => {
                const cashElement = document.createElement('div');
                cashElement.classList.add('asset-item');
                cashElement.innerHTML = `
                    <div class="asset-info">
                        <strong>Cash Amount:</strong> ${cash.cashAmount} <br>
                        <strong>Date of Entry:</strong> ${cash.dateOfEntry}
                    </div>
                    <div class="asset-buttons">
                        <button onclick="editCash(${index})">Edit</button>
                        <button onclick="deleteCash(${index})">Delete</button>
                    </div>
                `;
                listContainer.appendChild(cashElement);
            });
        } else {
            listContainer.innerText = 'No saved cash assets found.';
        }
    })
    .catch(error => {
        console.error('Error fetching saved cash assets:', error);
        document.getElementById('saved-cash-list').innerText = 'Failed to load saved cash assets.';
    });
}

async function fetchCashAssets() {
    return fetch('/cash-assets-data')
        .then(response => response.json())
        .then(data => data.cashAssets || [])
        .catch(error => {
            console.error('Error fetching saved cash assets:', error);
            return [];
        });
}

async function deleteCash(index) {
    fetch(`/delete-cash-asset/${index}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        loadSavedCashData();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function editCash(index) {
    fetch(`/cash-assets-data`)
    .then(response => response.json())
    .then(data => {
        if (data && data.cashAssets && data.cashAssets[index]) {
            showInputFields();
            document.getElementById('cash-amount').value = data.cashAssets[index].cashAmount;
            document.getElementById('date-of-entry').value = data.cashAssets[index].dateOfEntry;
            editIndex = index;
            setEditingIndicator(data.cashAssets[index].cashAmount);
            disableAddButton();
        }
    })
    .catch(error => {
        console.error('Error fetching cash asset:', error);
    });
}

function setEditingIndicator(cashAmount = '') {
    const indicator = document.getElementById('editing-indicator');
    if (cashAmount) {
        indicator.innerText = `Editing Cash Amount: ${cashAmount}`;
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

document.addEventListener('DOMContentLoaded', loadSavedCashData);
