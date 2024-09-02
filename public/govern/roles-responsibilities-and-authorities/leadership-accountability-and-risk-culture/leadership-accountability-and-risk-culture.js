let editIndex = -1;

async function saveLeadershipAccountabilityData() {
    const data = {
        rolesResponsibilitiesAgreement: document.getElementById('roles-responsibilities-agreement').value,
        rolesResponsibilitiesReviewFrequency: document.getElementById('roles-responsibilities-review-frequency').value,
        secureEthicalCultureCommunication: document.getElementById('secure-ethical-culture-communication').value,
        cybersecurityRiskExamples: document.getElementById('cybersecurity-risk-examples').value,
        riskStrategyManagement: document.getElementById('risk-strategy-management').value,
        riskStrategyReviewProcess: document.getElementById('risk-strategy-review-process').value,
        reviewCoordinationProcess: document.getElementById('review-coordination-process').value,
        reviewFrequencyCriteria: document.getElementById('review-frequency-criteria').value
    };

    let leadership = await fetchLeadership();
    if (editIndex >= 0) {
        leadership[editIndex] = data;
        editIndex = -1;
    } else {
        leadership.push(data);
    }

    const response = await fetch('/save-leadership-accountability-and-risk-culture', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ leadership })
    }).then(res => res.json());

    if (response.error) {
        console.error('Error:', response.error);
    } else {
        console.log('Success:', response);
        clearInputFields();
        loadSavedLeadership();
        setEditingIndicator();
    }
}

async function loadSavedLeadership() {
    const leadership = await fetchLeadership();
    const listContainer = document.getElementById('saved-leadership-list');
    listContainer.innerHTML = '';
    if (leadership.length > 0) {
        leadership.forEach((leader, index) => {
            const leaderElement = document.createElement('div');
            leaderElement.className = 'leader-item';
            leaderElement.innerHTML = `
                <div class="leader-info">
                    <strong>Roles and Responsibilities Agreement:</strong> ${leader.rolesResponsibilitiesAgreement} <br>
                    <strong>Roles and Responsibilities Review Frequency:</strong> ${leader.rolesResponsibilitiesReviewFrequency} <br>
                    <strong>Secure Ethical Culture Communication:</strong> ${leader.secureEthicalCultureCommunication} <br>
                    <strong>Cybersecurity Risk Examples:</strong> ${leader.cybersecurityRiskExamples} <br>
                    <strong>Risk Strategy Management:</strong> ${leader.riskStrategyManagement} <br>
                    <strong>Risk Strategy Review Process:</strong> ${leader.riskStrategyReviewProcess} <br>
                    <strong>Review Coordination Process:</strong> ${leader.reviewCoordinationProcess} <br>
                    <strong>Review Frequency Criteria:</strong> ${leader.reviewFrequencyCriteria}
                </div>
                <div class="leader-buttons">
                    <button onclick="editLeader(${index})">Edit</button>
                    <button onclick="deleteLeader(${index})">Delete</button>
                </div>
            `;
            listContainer.appendChild(leaderElement);
        });
    } else {
        listContainer.innerText = 'No saved leadership data found.';
    }
}

async function fetchLeadership() {
    const response = await fetch('/leadership-accountability-and-risk-culture-data').then(res => res.json());
    return response.leadership || [];
}

function editLeader(index) {
    fetchLeadership().then(leadership => {
        const leader = leadership[index];
        if (leader) {
            document.getElementById('roles-responsibilities-agreement').value = leader.rolesResponsibilitiesAgreement;
            document.getElementById('roles-responsibilities-review-frequency').value = leader.rolesResponsibilitiesReviewFrequency;
            document.getElementById('secure-ethical-culture-communication').value = leader.secureEthicalCultureCommunication;
            document.getElementById('cybersecurity-risk-examples').value = leader.cybersecurityRiskExamples;
            document.getElementById('risk-strategy-management').value = leader.riskStrategyManagement;
            document.getElementById('risk-strategy-review-process').value = leader.riskStrategyReviewProcess;
            document.getElementById('review-coordination-process').value = leader.reviewCoordinationProcess;
            document.getElementById('review-frequency-criteria').value = leader.reviewFrequencyCriteria;

            editIndex = index;
            setEditingIndicator(leader.rolesResponsibilitiesAgreement);
        }
    });
}

function deleteLeader(index) {
    fetch(`/delete-leadership-accountability-and-risk-culture/${index}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            loadSavedLeadership();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function clearInputFields() {
    document.getElementById('roles-responsibilities-agreement').value = '';
    document.getElementById('roles-responsibilities-review-frequency').value = '';
    document.getElementById('secure-ethical-culture-communication').value = '';
    document.getElementById('cybersecurity-risk-examples').value = '';
    document.getElementById('risk-strategy-management').value = '';
    document.getElementById('risk-strategy-review-process').value = '';
    document.getElementById('review-coordination-process').value = '';
    document.getElementById('review-frequency-criteria').value = '';
}

function setEditingIndicator(name = '') {
    const indicator = document.getElementById('editing-indicator');
    if (name) {
        indicator.innerText = `Editing ${name}`;
    } else {
        indicator.innerText = '';
    }
}

document.addEventListener('DOMContentLoaded', loadSavedLeadership);
