let executiveEditIndex = -1;

function addExecutiveUpdate() {
    showExecutiveFields();
    clearExecutiveInputFields();
    setEditingIndicator('executive-editing-indicator');
    disableAddButton('add-executive-button');
}

function showExecutiveFields() {
    const fields = document.querySelectorAll('#executive-container .question-group');
    fields.forEach(field => field.style.display = 'block');
}

function clearExecutiveInputFields() {
    document.getElementById('frequency-updates').value = '';
    document.getElementById('responsible-person').value = '';
    document.getElementById('content-updates').value = '';
    document.getElementById('distribution-method').value = '';
    document.getElementById('email-addresses').value = '';
    document.getElementById('meeting-details').value = '';
    document.getElementById('report-delivery').value = '';
    hideAdditionalInfo();
}

async function saveExecutiveUpdates() {
    const frequencyUpdates = document.getElementById('frequency-updates').value;
    const responsiblePerson = document.getElementById('responsible-person').value;
    const contentUpdates = document.getElementById('content-updates').value;
    const distributionMethod = document.getElementById('distribution-method').value;
    const emailAddresses = document.getElementById('email-addresses').value;
    const meetingDetails = document.getElementById('meeting-details').value;
    const reportDelivery = document.getElementById('report-delivery').value;

    if (frequencyUpdates && responsiblePerson && contentUpdates && distributionMethod) {
        let executiveUpdates = await fetchExecutiveUpdates();
        const updateData = {
            frequency: frequencyUpdates,
            responsible: responsiblePerson,
            content: contentUpdates,
            distribution: distributionMethod,
            emailAddresses,
            meetingDetails,
            reportDelivery
        };

        if (executiveEditIndex >= 0) {
            executiveUpdates[executiveEditIndex] = updateData;
            executiveEditIndex = -1;
        } else {
            executiveUpdates.push(updateData);
        }

        const data = { executiveUpdates };

        fetch('/save-executive-updates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            clearExecutiveInputFields();
            loadSavedExecutiveUpdates();
            setEditingIndicator('executive-editing-indicator');
            hideExecutiveFields();
            enableAddButton('add-executive-button');
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}

async function loadSavedExecutiveUpdates() {
    fetch('/executive-updates-data')
    .then(response => response.json())
    .then(data => {
        const listContainer = document.getElementById('saved-executive-updates-list');
        listContainer.innerHTML = '';
        if (data && data.executiveUpdates) {
            data.executiveUpdates.forEach((update, index) => {
                const item = document.createElement('div');
                item.classList.add('item');
                item.innerHTML = `
                    <div class="item-info">
                        <strong>Frequency of Updates:</strong> ${update.frequency}<br>
                        <strong>Responsible Person/Role:</strong> ${update.responsible}<br>
                        <strong>Content of Updates:</strong> ${update.content}<br>
                        <strong>Distribution Method:</strong> ${update.distribution}<br>
                        ${update.distribution === 'email' ? `<strong>Email addresses:</strong> ${update.emailAddresses}<br>` : ''}
                        ${update.distribution === 'meetings' ? `<strong>Meeting Details:</strong> ${update.meetingDetails}<br>` : ''}
                        ${update.distribution === 'printed report' ? `<strong>Physical Report Delivery Details:</strong> ${update.reportDelivery}<br>` : ''}
                    </div>
                    <div class="item-buttons">
                        <button onclick="editExecutiveUpdate(${index})">Edit</button>
                        <button onclick="deleteExecutiveUpdate(${index})">Delete</button>
                    </div>
                `;
                listContainer.appendChild(item);
            });
        }
    })
    .catch(error => {
        console.error('Error fetching executive updates:', error);
        document.getElementById('saved-executive-updates-list').innerText = 'Failed to load executive updates.';
    });
}

async function fetchExecutiveUpdates() {
    return fetch('/executive-updates-data')
        .then(response => response.json())
        .then(data => data.executiveUpdates || [])
        .catch(error => {
            console.error('Error fetching saved executive updates:', error);
            return [];
        });
}

async function deleteExecutiveUpdate(index) {
    fetch(`/delete-executive-update/${index}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        loadSavedExecutiveUpdates();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function editExecutiveUpdate(index) {
    fetch('/executive-updates-data')
    .then(response => response.json())
    .then(data => {
        if (data && data.executiveUpdates && data.executiveUpdates[index]) {
            showExecutiveFields();
            const update = data.executiveUpdates[index];
            document.getElementById('frequency-updates').value = update.frequency;
            document.getElementById('responsible-person').value = update.responsible;
            document.getElementById('content-updates').value = update.content;
            document.getElementById('distribution-method').value = update.distribution;
            document.getElementById('email-addresses').value = update.emailAddresses || '';
            document.getElementById('meeting-details').value = update.meetingDetails || '';
            document.getElementById('report-delivery').value = update.reportDelivery || '';
            executiveEditIndex = index;
            setEditingIndicator('executive-editing-indicator', update.responsible);
            disableAddButton('add-executive-button');
            showAdditionalInfo();
        }
    })
    .catch(error => {
        console.error('Error fetching executive update:', error);
    });
}

function hideExecutiveFields() {
    const fields = document.querySelectorAll('#executive-container .question-group');
    fields.forEach(field => field.style.display = 'none');
}

function setEditingIndicator(indicatorId, name = '') {
    const indicator = document.getElementById(indicatorId);
    if (name) {
        indicator.innerText = `Editing ${name}`;
    } else {
        indicator.innerText = '';
    }
}

function disableAddButton(buttonId) {
    const addButton = document.getElementById(buttonId);
    addButton.disabled = true;
    addButton.style.backgroundColor = 'grey';
}

function enableAddButton(buttonId) {
    const addButton = document.getElementById(buttonId);
    addButton.disabled = false;
    addButton.style.backgroundColor = '';
}

function showAdditionalInfo() {
    const distributionMethod = document.getElementById('distribution-method').value;
    document.getElementById('email-addresses-group').style.display = distributionMethod === 'email' ? 'block' : 'none';
    document.getElementById('meeting-details-group').style.display = distributionMethod === 'meetings' ? 'block' : 'none';
    document.getElementById('report-delivery-group').style.display = distributionMethod === 'printed report' ? 'block' : 'none';
}

function hideAdditionalInfo() {
    document.getElementById('email-addresses-group').style.display = 'none';
    document.getElementById('meeting-details-group').style.display = 'none';
    document.getElementById('report-delivery-group').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
    loadSavedExecutiveUpdates();
});
