let editIndex = -1;

async function saveObjectivesData() {
    const objectiveDescription = document.getElementById('objective-description').value;
    const objectiveType = document.getElementById('objective-type').value;
    const stakeholders = document.getElementById('stakeholders').value;
    const reviewFrequency = document.getElementById('review-frequency').value;
    const integrationPlanning = document.getElementById('integration-planning').value;
    const performanceMeasures = document.getElementById('performance-measures').value;
    const currentStatus = document.getElementById('current-status').value;
    const statusDate = document.getElementById('status-date').value;
    const responsiblePerson = document.getElementById('responsible-person').value;
    const relatedPolicies = document.getElementById('related-policies').value;
    const relevantStandards = document.getElementById('relevant-standards').value;
    const leadershipReview = document.getElementById('leadership-review').value;
    const additionalNotes = document.getElementById('additional-notes').value;

    if (objectiveDescription && objectiveType) {
        let objectives = await fetchObjectives();
        const objectiveData = {
            objectiveDescription,
            objectiveType,
            stakeholders,
            reviewFrequency,
            integrationPlanning,
            performanceMeasures,
            currentStatus,
            statusDate,
            responsiblePerson,
            relatedPolicies,
            relevantStandards,
            leadershipReview,
            additionalNotes
        };

        if (editIndex >= 0) {
            objectives[editIndex] = objectiveData;
            editIndex = -1;
        } else {
            objectives.push(objectiveData);
        }

        const data = { objectives };

        fetch('/save-objectives', {
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
            loadSavedObjectives();
            setEditingIndicator();
            hideInputFields();
            enableAddButton();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}

function addObjective() {
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
    document.getElementById('objective-description').value = '';
    document.getElementById('objective-type').value = 'short-term';
    document.getElementById('stakeholders').value = '';
    document.getElementById('review-frequency').value = 'yearly';
    document.getElementById('integration-planning').value = '';
    document.getElementById('performance-measures').value = '';
    document.getElementById('current-status').value = 'not-started';
    document.getElementById('status-date').value = '';
    document.getElementById('responsible-person').value = '';
    document.getElementById('related-policies').value = '';
    document.getElementById('relevant-standards').value = '';
    document.getElementById('leadership-review').value = '';
    document.getElementById('additional-notes').value = '';
}

async function loadSavedObjectives() {
    fetch('/objectives-data')
    .then(response => response.json())
    .then(data => {
        const listContainer = document.getElementById('saved-objectives-list');
        listContainer.innerHTML = '';
        if (data && data.objectives) {
            data.objectives.forEach((objective, index) => {
                const objectiveElement = document.createElement('div');
                objectiveElement.classList.add('objective-item');
                objectiveElement.innerHTML = `
                    <div class="objective-info">
                        <strong>Objective Description:</strong> ${objective.objectiveDescription} <br>
                        <strong>Objective Type:</strong> ${objective.objectiveType} <br>
                        <strong>Stakeholders:</strong> ${objective.stakeholders} <br>
                        <strong>Review Frequency:</strong> ${objective.reviewFrequency} <br>
                        <strong>Integration with Planning:</strong> ${objective.integrationPlanning} <br>
                        <strong>Performance Measures:</strong> ${objective.performanceMeasures} <br>
                        <strong>Current Status:</strong> ${objective.currentStatus} <br>
                        <strong>Status Date:</strong> ${objective.statusDate} <br>
                        <strong>Responsible Person:</strong> ${objective.responsiblePerson} <br>
                        <strong>Related Policies and Procedures:</strong> ${objective.relatedPolicies} <br>
                        <strong>Relevant Standards and Guidelines:</strong> ${objective.relevantStandards} <br>
                        <strong>Leadership Review and Approval:</strong> ${objective.leadershipReview} <br>
                        <strong>Additional Notes and Comments:</strong> ${objective.additionalNotes}
                    </div>
                    <div class="objective-buttons">
                        <button onclick="editObjective(${index})">Edit</button>
                        <button onclick="deleteObjective(${index})">Delete</button>
                    </div>
                `;
                listContainer.appendChild(objectiveElement);
            });
        } else {
            listContainer.innerText = 'No saved objectives found.';
        }
    })
    .catch(error => {
        console.error('Error fetching saved objectives:', error);
        document.getElementById('saved-objectives-list').innerText = 'Failed to load saved objectives.';
    });
}

async function fetchObjectives() {
    return fetch('/objectives-data')
        .then(response => response.json())
        .then(data => data.objectives || [])
        .catch(error => {
            console.error('Error fetching saved objectives:', error);
            return [];
        });
}

async function deleteObjective(index) {
    fetch(`/delete-objective/${index}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        loadSavedObjectives();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function editObjective(index) {
    fetch(`/objectives-data`)
    .then(response => response.json())
    .then(data => {
        if (data && data.objectives && data.objectives[index]) {
            showInputFields();
            document.getElementById('objective-description').value = data.objectives[index].objectiveDescription;
            document.getElementById('objective-type').value = data.objectives[index].objectiveType;
            document.getElementById('stakeholders').value = data.objectives[index].stakeholders;
            document.getElementById('review-frequency').value = data.objectives[index].reviewFrequency;
            document.getElementById('integration-planning').value = data.objectives[index].integrationPlanning;
            document.getElementById('performance-measures').value = data.objectives[index].performanceMeasures;
            document.getElementById('current-status').value = data.objectives[index].currentStatus;
            document.getElementById('status-date').value = data.objectives[index].statusDate;
            document.getElementById('responsible-person').value = data.objectives[index].responsiblePerson;
            document.getElementById('related-policies').value = data.objectives[index].relatedPolicies;
            document.getElementById('relevant-standards').value = data.objectives[index].relevantStandards;
            document.getElementById('leadership-review').value = data.objectives[index].leadershipReview;
            document.getElementById('additional-notes').value = data.objectives[index].additionalNotes;

            editIndex = index;
            setEditingIndicator(data.objectives[index].objectiveDescription);
            disableAddButton();
        }
    })
    .catch(error => {
        console.error('Error fetching objective:', error);
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

document.addEventListener('DOMContentLoaded', loadSavedObjectives);
