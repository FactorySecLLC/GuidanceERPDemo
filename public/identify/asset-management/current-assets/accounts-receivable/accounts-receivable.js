let editIndex = -1;

async function saveReceivablesData() {
    const amountOwed = document.getElementById('amount-owed').value;
    const expectedPaymentDate = document.getElementById('expected-payment-date').value;
    const payeeName = document.getElementById('payee-name').value;
    const payeeEmail = document.getElementById('payee-email').value;
    const payeePhone = document.getElementById('payee-phone').value;
    const contractDetails = document.getElementById('contract-details').value;

    if (amountOwed && expectedPaymentDate && payeeName && payeeEmail && payeePhone && contractDetails) {
        let receivables = await fetchReceivables();
        const receivableData = {
            amountOwed,
            expectedPaymentDate,
            payeeName,
            payeeEmail,
            payeePhone,
            contractDetails
        };

        if (editIndex >= 0) {
            receivables[editIndex] = receivableData;
            editIndex = -1;
        } else {
            receivables.push(receivableData);
        }

        const data = { receivables };

        fetch('/save-receivables', {
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
            loadSavedReceivablesData();
            setEditingIndicator();
            hideInputFields();
            enableAddButton();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}

function addReceivable() {
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
    document.getElementById('amount-owed').value = '';
    document.getElementById('expected-payment-date').value = '';
    document.getElementById('payee-name').value = '';
    document.getElementById('payee-email').value = '';
    document.getElementById('payee-phone').value = '';
    document.getElementById('contract-details').value = '';
}

async function loadSavedReceivablesData() {
    fetch('/receivables-data')
    .then(response => response.json())
    .then(data => {
        const listContainer = document.getElementById('saved-receivables-list');
        listContainer.innerHTML = '';
        if (data && data.receivables) {
            data.receivables.forEach((receivable, index) => {
                const receivableElement = document.createElement('div');
                receivableElement.classList.add('asset-item');
                receivableElement.innerHTML = `
                    <div class="asset-info">
                        <strong>Amount Owed:</strong> ${receivable.amountOwed} <br>
                        <strong>Date of Expected Payment:</strong> ${receivable.expectedPaymentDate} <br>
                        <strong>Payee Contact Name:</strong> ${receivable.payeeName} <br>
                        <strong>Payee Email Address:</strong> ${receivable.payeeEmail} <br>
                        <strong>Payee Phone Number:</strong> ${receivable.payeePhone} <br>
                        <strong>Contract Details:</strong> ${receivable.contractDetails}
                    </div>
                    <div class="asset-buttons">
                        <button onclick="editReceivable(${index})">Edit</button>
                        <button onclick="deleteReceivable(${index})">Delete</button>
                    </div>
                `;
                listContainer.appendChild(receivableElement);
            });
        } else {
            listContainer.innerText = 'No saved receivables found.';
        }
    })
    .catch(error => {
        console.error('Error fetching saved receivables:', error);
        document.getElementById('saved-receivables-list').innerText = 'Failed to load saved receivables.';
    });
}

async function fetchReceivables() {
    return fetch('/receivables-data')
        .then(response => response.json())
        .then(data => data.receivables || [])
        .catch(error => {
            console.error('Error fetching saved receivables:', error);
            return [];
        });
}

async function deleteReceivable(index) {
    fetch(`/delete-receivable/${index}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        loadSavedReceivablesData();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function editReceivable(index) {
    fetch(`/receivables-data`)
    .then(response => response.json())
    .then(data => {
        if (data && data.receivables && data.receivables[index]) {
            showInputFields();
            document.getElementById('amount-owed').value = data.receivables[index].amountOwed;
            document.getElementById('expected-payment-date').value = data.receivables[index].expectedPaymentDate;
            document.getElementById('payee-name').value = data.receivables[index].payeeName;
            document.getElementById('payee-email').value = data.receivables[index].payeeEmail;
            document.getElementById('payee-phone').value = data.receivables[index].payeePhone;
            document.getElementById('contract-details').value = data.receivables[index].contractDetails;
            editIndex = index;
            setEditingIndicator(data.receivables[index].amountOwed);
            disableAddButton();
        }
    })
    .catch(error => {
        console.error('Error fetching receivable:', error);
    });
}

function setEditingIndicator(amountOwed = '') {
    const indicator = document.getElementById('editing-indicator');
    if (amountOwed) {
        indicator.innerText = `Editing Receivable: ${amountOwed}`;
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

document.addEventListener('DOMContentLoaded', loadSavedReceivablesData);
