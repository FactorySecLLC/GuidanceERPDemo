let editIndex = -1;

async function saveCybersecurityHRData() {
    const data = {
        checkCybersecurityKnowledge: document.getElementById('check-cybersecurity-knowledge').value,
        onboardingTraining: document.getElementById('onboarding-training').value,
        notifyChanges: document.getElementById('notify-changes').value,
        revokeAccess: document.getElementById('revoke-access').value,
        preferCybersecurityKnowledge: document.getElementById('prefer-cybersecurity-knowledge').value,
        ongoingTraining: document.getElementById('ongoing-training').value,
        considerKnowledge: document.getElementById('consider-knowledge').value,
        backgroundChecks: document.getElementById('background-checks').value,
        repeatChecks: document.getElementById('repeat-checks').value,
        awarePolicies: document.getElementById('aware-policies').value,
        enforcePolicies: document.getElementById('enforce-policies').value
    };

    let hrPractices = await fetchHRPractices();
    if (editIndex >= 0) {
        hrPractices[editIndex] = data;
        editIndex = -1;
    } else {
        hrPractices.push(data);
    }

    const response = await fetch('/save-cybersecurity-hr', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ hrPractices })
    }).then(res => res.json());

    if (response.error) {
        console.error('Error:', response.error);
    } else {
        console.log('Success:', response);
        clearInputFields();
        loadSavedHRPractices();
        setEditingIndicator();
    }
}

function addCybersecurityHRPractice() {
    clearInputFields();
    setEditingIndicator();
}

async function loadSavedHRPractices() {
    const hrPractices = await fetchHRPractices();
    const listContainer = document.getElementById('saved-hr-list');
    listContainer.innerHTML = '';
    if (hrPractices.length > 0) {
        hrPractices.forEach((practice, index) => {
            const practiceElement = document.createElement('div');
            practiceElement.className = 'practice-item';
            practiceElement.innerHTML = `
                <div class="practice-info">
                    <strong>Check Cybersecurity Knowledge:</strong> ${practice.checkCybersecurityKnowledge} <br>
                    <strong>Onboarding Training:</strong> ${practice.onboardingTraining} <br>
                    <strong>Notify Changes:</strong> ${practice.notifyChanges} <br>
                    <strong>Revoke Access:</strong> ${practice.revokeAccess} <br>
                    <strong>Prefer Cybersecurity Knowledge:</strong> ${practice.preferCybersecurityKnowledge} <br>
                    <strong>Ongoing Training:</strong> ${practice.ongoingTraining} <br>
                    <strong>Consider Knowledge:</strong> ${practice.considerKnowledge} <br>
                    <strong>Background Checks:</strong> ${practice.backgroundChecks} <br>
                    <strong>Repeat Checks:</strong> ${practice.repeatChecks} <br>
                    <strong>Aware Policies:</strong> ${practice.awarePolicies} <br>
                    <strong>Enforce Policies:</strong> ${practice.enforcePolicies}
                </div>
                <div class="practice-buttons">
                    <button onclick="editHRPractice(${index})">Edit</button>
                    <button onclick="deleteHRPractice(${index})">Delete</button>
                </div>
            `;
            listContainer.appendChild(practiceElement);
        });
    } else {
        listContainer.innerText = 'No saved practices found.';
    }
}

async function fetchHRPractices() {
    const response = await fetch('/cybersecurity-hr-data').then(res => res.json());
    return response.hrPractices || [];
}

function editHRPractice(index) {
    fetchHRPractices().then(hrPractices => {
        const practice = hrPractices[index];
        if (practice) {
            document.getElementById('check-cybersecurity-knowledge').value = practice.checkCybersecurityKnowledge;
            document.getElementById('onboarding-training').value = practice.onboardingTraining;
            document.getElementById('notify-changes').value = practice.notifyChanges;
            document.getElementById('revoke-access').value = practice.revokeAccess;
            document.getElementById('prefer-cybersecurity-knowledge').value = practice.preferCybersecurityKnowledge;
            document.getElementById('ongoing-training').value = practice.ongoingTraining;
            document.getElementById('consider-knowledge').value = practice.considerKnowledge;
            document.getElementById('background-checks').value = practice.backgroundChecks;
            document.getElementById('repeat-checks').value = practice.repeatChecks;
            document.getElementById('aware-policies').value = practice.awarePolicies;
            document.getElementById('enforce-policies').value = practice.enforcePolicies;

            editIndex = index;
            setEditingIndicator(practice.checkCybersecurityKnowledge);
        }
    });
}

function deleteHRPractice(index) {
    fetch('/delete-cybersecurity-hr/' + index, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            loadSavedHRPractices();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function clearInputFields() {
    document.getElementById('check-cybersecurity-knowledge').value = '';
    document.getElementById('onboarding-training').value = '';
    document.getElementById('notify-changes').value = '';
    document.getElementById('revoke-access').value = '';
    document.getElementById('prefer-cybersecurity-knowledge').value = '';
    document.getElementById('ongoing-training').value = '';
    document.getElementById('consider-knowledge').value = '';
    document.getElementById('background-checks').value = '';
    document.getElementById('repeat-checks').value = '';
    document.getElementById('aware-policies').value = '';
    document.getElementById('enforce-policies').value = '';
}

function setEditingIndicator(name = '') {
    const indicator = document.getElementById('editing-indicator');
    if (name) {
        indicator.innerText = `Editing ${name}`;
    } else {
        indicator.innerText = '';
    }
}

document.addEventListener('DOMContentLoaded', loadSavedHRPractices);
