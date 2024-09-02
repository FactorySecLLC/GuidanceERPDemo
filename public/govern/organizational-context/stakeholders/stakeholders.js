let editIndex = -1;

async function saveStakeholdersData() {
    const type = document.getElementById('stakeholder-type').value;
    const internalExternal = document.getElementById('stakeholder-internal-external').value;
    const name = document.getElementById('stakeholder-name').value;
    const email = document.getElementById('stakeholder-email').value;
    const phone = document.getElementById('stakeholder-phone').value;
    const department = document.getElementById('stakeholder-department').value;
    const title = document.getElementById('stakeholder-title').value;
    const notes = document.getElementById('stakeholder-notes').value;
    const objectives = document.getElementById('stakeholder-objectives').value;
    const capabilities = document.getElementById('stakeholder-capabilities').value;
    const services = document.getElementById('stakeholder-services').value;
    const expectations = document.getElementById('stakeholder-expectations').value;
    const concerns = document.getElementById('stakeholder-concerns').value;
    const support = document.getElementById('stakeholder-support').value;

    if (name && email) {
        let stakeholders = await fetchStakeholders();
        const stakeholderData = {
            type,
            internalExternal,
            name,
            email,
            phone,
            notes,
            expectations,
            objectives,
            capabilities,
            services,
            concerns,
            support
        };

        if (type === 'individual') {
            stakeholderData.department = department;
            stakeholderData.title = title;
        }

        if (editIndex >= 0) {
            stakeholders[editIndex] = stakeholderData;
            editIndex = -1;
        } else {
            stakeholders.push(stakeholderData);
        }

        const data = { stakeholders };

        fetch('/save-stakeholders', {
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
            loadSavedStakeholdersData();
            setEditingIndicator();
            hideInputFields();
            enableAddButton();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}

function addStakeholder() {
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
    document.getElementById('stakeholder-type').value = 'individual';
    document.getElementById('stakeholder-internal-external').value = 'internal';
    document.getElementById('stakeholder-name').value = '';
    document.getElementById('stakeholder-email').value = '';
    document.getElementById('stakeholder-phone').value = '';
    document.getElementById('stakeholder-department').value = '';
    document.getElementById('stakeholder-title').value = '';
    document.getElementById('stakeholder-notes').value = '';
    document.getElementById('stakeholder-objectives').value = '';
    document.getElementById('stakeholder-capabilities').value = '';
    document.getElementById('stakeholder-services').value = '';
    document.getElementById('stakeholder-expectations').value = '';
    document.getElementById('stakeholder-concerns').value = '';
    document.getElementById('stakeholder-support').value = '';
    toggleStakeholderFields();
}

async function loadSavedStakeholdersData() {
    fetch('/stakeholders-data')
    .then(response => response.json())
    .then(data => {
        const listContainer = document.getElementById('saved-stakeholders-list');
        listContainer.innerHTML = '';
        if (data && data.stakeholders) {
            data.stakeholders.forEach((stakeholder, index) => {
                const stakeholderElement = document.createElement('div');
                stakeholderElement.classList.add('stakeholder-item');
                stakeholderElement.innerHTML = `
                    <div class="stakeholder-info">
                        <strong>Type:</strong> ${stakeholder.type} <br>
                        <strong>Internal/External:</strong> ${stakeholder.internalExternal} <br>
                        <strong>Stakeholder Name:</strong> ${stakeholder.name} <br>
                        <strong>Stakeholder Email:</strong> ${stakeholder.email} <br>
                        <strong>Phone Number:</strong> ${stakeholder.phone} <br>
                        ${stakeholder.type === 'individual' ? `<strong>Department:</strong> ${stakeholder.department} <br>` : ''}
                        ${stakeholder.type === 'individual' ? `<strong>Job Title:</strong> ${stakeholder.title} <br>` : ''}
                        <strong>Additional Notes:</strong> ${stakeholder.notes} <br>
                        <strong>Critical Objectives:</strong> ${stakeholder.objectives} <br>
                        <strong>Key Capabilities:</strong> ${stakeholder.capabilities} <br>
                        <strong>Specific Services:</strong> ${stakeholder.services} <br>
                        <strong>Stakeholder Cybersecurity Concerns:</strong> ${stakeholder.concerns} <br>
                        <strong>Expectations:</strong> ${stakeholder.expectations}
                    </div>
                    <div class="stakeholder-buttons">
                        <button onclick="editStakeholder(${index})">Edit</button>
                        <button onclick="deleteStakeholder(${index})">Delete</button>
                    </div>
                `;
                listContainer.appendChild(stakeholderElement);
            });
        } else {
            listContainer.innerText = 'No saved stakeholders found.';
        }
    })
    .catch(error => {
        console.error('Error fetching saved stakeholders:', error);
        document.getElementById('saved-stakeholders-list').innerText = 'Failed to load saved stakeholders.';
    });
}

async function fetchStakeholders() {
    return fetch('/stakeholders-data')
        .then(response => response.json())
        .then(data => data.stakeholders || [])
        .catch(error => {
            console.error('Error fetching saved stakeholders:', error);
            return [];
        });
}

async function deleteStakeholder(index) {
    fetch(`/delete-stakeholder/${index}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        loadSavedStakeholdersData();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function editStakeholder(index) {
    fetch(`/stakeholders-data`)
    .then(response => response.json())
    .then(data => {
        if (data && data.stakeholders && data.stakeholders[index]) {
            showInputFields();
            document.getElementById('stakeholder-type').value = data.stakeholders[index].type;
            document.getElementById('stakeholder-internal-external').value = data.stakeholders[index].internalExternal;
            document.getElementById('stakeholder-name').value = data.stakeholders[index].name;
            document.getElementById('stakeholder-email').value = data.stakeholders[index].email;
            document.getElementById('stakeholder-phone').value = data.stakeholders[index].phone;
            document.getElementById('stakeholder-department').value = data.stakeholders[index].department || '';
            document.getElementById('stakeholder-title').value = data.stakeholders[index].title || '';
            document.getElementById('stakeholder-notes').value = data.stakeholders[index].notes;
            document.getElementById('stakeholder-objectives').value = data.stakeholders[index].objectives;
            document.getElementById('stakeholder-capabilities').value = data.stakeholders[index].capabilities;
            document.getElementById('stakeholder-services').value = data.stakeholders[index].services;
            document.getElementById('stakeholder-expectations').value = data.stakeholders[index].expectations;
            document.getElementById('stakeholder-concerns').value = data.stakeholders[index].concerns;
            document.getElementById('stakeholder-support').value = data.stakeholders[index].support;
            editIndex = index;
            setEditingIndicator(data.stakeholders[index].name);
            disableAddButton();
            toggleStakeholderFields();
        }
    })
    .catch(error => {
        console.error('Error fetching stakeholder:', error);
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

function toggleStakeholderFields() {
    const type = document.getElementById('stakeholder-type').value;
    const individualOnlyFields = document.querySelectorAll('.individual-only');
    if (type === 'individual') {
        individualOnlyFields.forEach(field => field.style.display = 'block');
    } else {
        individualOnlyFields.forEach(field => field.style.display = 'none');
    }
}

document.addEventListener('DOMContentLoaded', loadSavedStakeholdersData);
