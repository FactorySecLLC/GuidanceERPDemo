let editIndex = -1;

async function saveStrategicDirectionData() {
    const data = {
        dataTypes: document.getElementById('data-types').value,
        riskDecisions: document.getElementById('risk-decisions').value,
        riskComfort: document.getElementById('risk-comfort').value,
        protectData: document.getElementById('protect-data').value,
        insuranceNeed: document.getElementById('insurance-need').value,
        insuranceUse: document.getElementById('insurance-use').value,
        policyLook: document.getElementById('policy-look').value,
        policyConcerns: document.getElementById('policy-concerns').value,
        responsibilities: document.getElementById('responsibilities').value,
        decideOkay: document.getElementById('decide-okay').value,
        rolesUnderstand: document.getElementById('roles-understand').value,
        sharedExamples: document.getElementById('shared-examples').value,
        followingStandards: document.getElementById('following-standards').value,
        checks: document.getElementById('checks').value
    };

    let directions = await fetchDirections();
    if (editIndex >= 0) {
        directions[editIndex] = data;
        editIndex = -1;
    } else {
        directions.push(data);
    }

    const response = await fetch('/save-strategic-direction', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ directions })
    }).then(res => res.json());

    if (response.error) {
        console.error('Error:', response.error);
    } else {
        console.log('Success:', response);
        clearInputFields();
        loadSavedDirections();
        setEditingIndicator();
        enableAddButton();
        hideInputFields();
    }
}

function addDirection() {
    clearInputFields();
    setEditingIndicator();
    disableAddButton();
    showInputFields();
}

async function loadSavedDirections() {
    const directions = await fetchDirections();
    const listContainer = document.getElementById('saved-directions-list');
    listContainer.innerHTML = '';
    if (directions.length > 0) {
        directions.forEach((direction, index) => {
            const directionElement = document.createElement('div');
            directionElement.className = 'direction-item';
            directionElement.innerHTML = `
                <div class="direction-info">
                    <strong>Main Types of Data:</strong> ${direction.dataTypes} <br>
                    <strong>Risk Decisions:</strong> ${direction.riskDecisions} <br>
                    <strong>Risk Comfort:</strong> ${direction.riskComfort} <br>
                    <strong>Always Protect:</strong> ${direction.protectData} <br>
                    <strong>Insurance Need:</strong> ${direction.insuranceNeed} <br>
                    <strong>Insurance Use:</strong> ${direction.insuranceUse} <br>
                    <strong>Policy Look:</strong> ${direction.policyLook} <br>
                    <strong>Policy Concerns:</strong> ${direction.policyConcerns} <br>
                    <strong>Responsibilities:</strong> ${direction.responsibilities} <br>
                    <strong>Decide Okay:</strong> ${direction.decideOkay} <br>
                    <strong>Roles Understand:</strong> ${direction.rolesUnderstand} <br>
                    <strong>Shared Examples:</strong> ${direction.sharedExamples} <br>
                    <strong>Following Standards:</strong> ${direction.followingStandards} <br>
                    <strong>Checks:</strong> ${direction.checks}
                </div>
                <div class="direction-buttons">
                    <button onclick="editDirection(${index})">Edit</button>
                    <button onclick="deleteDirection(${index})">Delete</button>
                </div>
            `;
            listContainer.appendChild(directionElement);
        });
    } else {
        listContainer.innerText = 'No saved directions found.';
    }
}

async function fetchDirections() {
    const response = await fetch('/strategic-direction-data').then(res => res.json());
    return response.directions || [];
}

function editDirection(index) {
    fetchDirections().then(directions => {
        const direction = directions[index];
        if (direction) {
            document.getElementById('data-types').value = direction.dataTypes;
            document.getElementById('risk-decisions').value = direction.riskDecisions;
            document.getElementById('risk-comfort').value = direction.riskComfort;
            document.getElementById('protect-data').value = direction.protectData;
            document.getElementById('insurance-need').value = direction.insuranceNeed;
            document.getElementById('insurance-use').value = direction.insuranceUse;
            document.getElementById('policy-look').value = direction.policyLook;
            document.getElementById('policy-concerns').value = direction.policyConcerns;
            document.getElementById('responsibilities').value = direction.responsibilities;
            document.getElementById('decide-okay').value = direction.decideOkay;
            document.getElementById('roles-understand').value = direction.rolesUnderstand;
            document.getElementById('shared-examples').value = direction.sharedExamples;
            document.getElementById('following-standards').value = direction.followingStandards;
            document.getElementById('checks').value = direction.checks;

            editIndex = index;
            setEditingIndicator(direction.dataTypes);
            disableAddButton();
            showInputFields();
        }
    });
}

async function deleteDirection(index) {
    fetch('/delete-strategic-direction/' + index, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            loadSavedDirections();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function clearInputFields() {
    document.getElementById('data-types').value = '';
    document.getElementById('risk-decisions').value = '';
    document.getElementById('risk-comfort').value = '';
    document.getElementById('protect-data').value = '';
    document.getElementById('insurance-need').value = '';
    document.getElementById('insurance-use').value = '';
    document.getElementById('policy-look').value = '';
    document.getElementById('policy-concerns').value = '';
    document.getElementById('responsibilities').value = '';
    document.getElementById('decide-okay').value = '';
    document.getElementById('roles-understand').value = '';
    document.getElementById('shared-examples').value = '';
    document.getElementById('following-standards').value = '';
    document.getElementById('checks').value = '';
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

function showInputFields() {
    const fields = document.querySelectorAll('.question-group');
    fields.forEach(field => field.style.display = 'block');
}

function hideInputFields() {
    const fields = document.querySelectorAll('.question-group');
    fields.forEach(field => field.style.display = 'none');
}

document.addEventListener('DOMContentLoaded', loadSavedDirections);
