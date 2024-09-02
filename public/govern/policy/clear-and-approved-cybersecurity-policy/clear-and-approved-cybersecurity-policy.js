let editIndex = -1;

async function saveCybersecurityPolicyData() {
    const data = {
        simpleUnderstanding: document.getElementById('simple-understanding').value,
        sharePolicy: document.getElementById('share-policy').value,
        reviewProcess: document.getElementById('review-process').value,
        ensureRelevance: document.getElementById('ensure-relevance').value,
        managementApproval: document.getElementById('management-approval').value,
        approvalDocumentation: document.getElementById('approval-documentation').value,
        informMethods: document.getElementById('inform-methods').value,
        ensureUnderstanding: document.getElementById('ensure-understanding').value,
        newEmployees: document.getElementById('new-employees').value,
        annualAcknowledgment: document.getElementById('annual-acknowledgment').value
    };

    let policies = await fetchPolicies();
    if (editIndex >= 0) {
        policies[editIndex] = data;
        editIndex = -1;
    } else {
        policies.push(data);
    }

    const response = await fetch('/save-cybersecurity-policy', {
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
    const policies = await fetchPolicies();
    const listContainer = document.getElementById('saved-policy-list');
    listContainer.innerHTML = '';
    if (policies.length > 0) {
        policies.forEach((policy, index) => {
            const policyElement = document.createElement('div');
            policyElement.className = 'policy-item';
            policyElement.innerHTML = `
                <div class="policy-info">
                    <strong>Simple Understanding:</strong> ${policy.simpleUnderstanding} <br>
                    <strong>Share Policy:</strong> ${policy.sharePolicy} <br>
                    <strong>Review Process:</strong> ${policy.reviewProcess} <br>
                    <strong>Ensure Relevance:</strong> ${policy.ensureRelevance} <br>
                    <strong>Management Approval:</strong> ${policy.managementApproval} <br>
                    <strong>Approval Documentation:</strong> ${policy.approvalDocumentation} <br>
                    <strong>Inform Methods:</strong> ${policy.informMethods} <br>
                    <strong>Ensure Understanding:</strong> ${policy.ensureUnderstanding} <br>
                    <strong>New Employees:</strong> ${policy.newEmployees} <br>
                    <strong>Annual Acknowledgment:</strong> ${policy.annualAcknowledgment}
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
    const response = await fetch('/cybersecurity-policy-data').then(res => res.json());
    return response.policies || [];
}

function editPolicy(index) {
    fetchPolicies().then(policies => {
        const policy = policies[index];
        if (policy) {
            document.getElementById('simple-understanding').value = policy.simpleUnderstanding;
            document.getElementById('share-policy').value = policy.sharePolicy;
            document.getElementById('review-process').value = policy.reviewProcess;
            document.getElementById('ensure-relevance').value = policy.ensureRelevance;
            document.getElementById('management-approval').value = policy.managementApproval;
            document.getElementById('approval-documentation').value = policy.approvalDocumentation;
            document.getElementById('inform-methods').value = policy.informMethods;
            document.getElementById('ensure-understanding').value = policy.ensureUnderstanding;
            document.getElementById('new-employees').value = policy.newEmployees;
            document.getElementById('annual-acknowledgment').value = policy.annualAcknowledgment;

            editIndex = index;
            setEditingIndicator(policy.simpleUnderstanding);
        }
    });
}

function deletePolicy(index) {
    fetch('/delete-cybersecurity-policy/' + index, { method: 'DELETE' })
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
    document.getElementById('simple-understanding').value = '';
    document.getElementById('share-policy').value = '';
    document.getElementById('review-process').value = '';
    document.getElementById('ensure-relevance').value = '';
    document.getElementById('management-approval').value = '';
    document.getElementById('approval-documentation').value = '';
    document.getElementById('inform-methods').value = '';
    document.getElementById('ensure-understanding').value = '';
    document.getElementById('new-employees').value = '';
    document.getElementById('annual-acknowledgment').value = '';
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
