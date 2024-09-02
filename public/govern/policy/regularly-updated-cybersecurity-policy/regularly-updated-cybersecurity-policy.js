let editIndex = -1;

async function saveCybersecurityPolicyData() {
    const data = {
        checkUpdateFrequency: document.getElementById('check-update-frequency').value,
        reviewProcessDescription: document.getElementById('review-process-description').value,
        reviewSchedule: document.getElementById('review-schedule').value,
        communicationChanges: document.getElementById('communication-changes').value,
        legalUpdates: document.getElementById('legal-updates').value,
        updateProcessLegal: document.getElementById('update-process-legal').value,
        techBusinessUpdates: document.getElementById('tech-business-updates').value,
        processChanges: document.getElementById('process-changes').value
    };

    let policies = await fetchPolicies();
    if (editIndex >= 0) {
        policies[editIndex] = data;
        editIndex = -1;
    } else {
        policies.push(data);
    }

    const response = await fetch('/save-regularly-updated-cybersecurity-policy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ policies })
    }).then(res => res.json());

    if (response.error) {
        console.error('Error:', response.error);
    } else {
        console.log('Success:', response);
        clearInputFields();
        loadSavedPolicies();
        setEditingIndicator();
    }
}

function addCybersecurityPolicy() {
    clearInputFields();
    setEditingIndicator();
}

async function loadSavedPolicies() {
    const policies = await fetchPolicies(); // Fetch the policies
    const listContainer = document.getElementById('saved-policy-list');
    listContainer.innerHTML = '';

    if (policies.length > 0) {
        policies.forEach((policy, index) => {
            const policyElement = document.createElement('div');
            policyElement.className = 'policy-item';
            policyElement.innerHTML = `
                <div class="policy-info">
                    <strong>Check Update Frequency:</strong> ${policy.checkUpdateFrequency} <br>
                    <strong>Review Process Description:</strong> ${policy.reviewProcessDescription} <br>
                    <strong>Review Schedule:</strong> ${policy.reviewSchedule} <br>
                    <strong>Communication Changes:</strong> ${policy.communicationChanges} <br>
                    <strong>Legal Updates:</strong> ${policy.legalUpdates} <br>
                    <strong>Update Process Legal:</strong> ${policy.updateProcessLegal} <br>
                    <strong>Tech Business Updates:</strong> ${policy.techBusinessUpdates} <br>
                    <strong>Process Changes:</strong> ${policy.processChanges}
                </div>
                <div class="policy-buttons">
                    <button onclick="editPolicy(${index})">Edit</button>
                    <button onclick="deletePolicy(${index})">Delete</button>
                </div>
            `;
            listContainer.appendChild(policyElement);
        });
    } else {
        listContainer.innerText = 'No saved policies found.';
    }
}

async function fetchPolicies() {
    const response = await fetch('/regularly-updated-cybersecurity-policy-data').then(res => res.json());
    return response.policies || [];
}

function editPolicy(index) {
    fetchPolicies().then(policies => {
        const policy = policies[index];
        if (policy) {
            document.getElementById('check-update-frequency').value = policy.checkUpdateFrequency;
            document.getElementById('review-process-description').value = policy.reviewProcessDescription;
            document.getElementById('review-schedule').value = policy.reviewSchedule;
            document.getElementById('communication-changes').value = policy.communicationChanges;
            document.getElementById('legal-updates').value = policy.legalUpdates;
            document.getElementById('update-process-legal').value = policy.updateProcessLegal;
            document.getElementById('tech-business-updates').value = policy.techBusinessUpdates;
            document.getElementById('process-changes').value = policy.processChanges;

            editIndex = index;
            setEditingIndicator(policy.checkUpdateFrequency);
        }
    });
}

function deletePolicy(index) {
    fetch('/delete-regularly-updated-cybersecurity-policy/' + index, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            loadSavedPolicies();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function clearInputFields() {
    document.getElementById('check-update-frequency').value = '';
    document.getElementById('review-process-description').value = '';
    document.getElementById('review-schedule').value = '';
    document.getElementById('communication-changes').value = '';
    document.getElementById('legal-updates').value = '';
    document.getElementById('update-process-legal').value = '';
    document.getElementById('tech-business-updates').value = '';
    document.getElementById('process-changes').value = '';
}

function setEditingIndicator(name = '') {
    const indicator = document.getElementById('editing-indicator');
    if (name) {
        indicator.innerText = `Editing ${name}`;
    } else {
        indicator.innerText = '';
    }
}

document.addEventListener('DOMContentLoaded', loadSavedPolicies);
