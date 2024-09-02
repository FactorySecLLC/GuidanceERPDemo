let departmentEditIndex = -1;

function addDepartment() {
    showDepartmentFields();
    clearDepartmentInputFields();
    setEditingIndicator('departmental-editing-indicator');
    disableAddButton('add-department-button');
}

function showDepartmentFields() {
    const fields = document.querySelectorAll('#departmental-container .question-group');
    fields.forEach(field => field.style.display = 'block');
}

function clearDepartmentInputFields() {
    document.getElementById('department-name').value = '';
    document.getElementById('primary-contact-person').value = '';
    document.getElementById('contact-email').value = '';
    document.getElementById('contact-phone').value = '';
    document.getElementById('communication-frequency').value = '';
    document.getElementById('responsible-role').value = '';
    document.getElementById('communication-methods').value = '';
    document.getElementById('content-communication').value = '';
    document.getElementById('documentation-location').value = '';
    document.getElementById('inter-departmental-frequency').value = '';
    document.getElementById('departments-communicated-with').value = '';
    document.getElementById('responsible-role-inter-department').value = '';
    document.getElementById('communication-methods-inter-department').value = '';
    document.getElementById('content-communication-inter-department').value = '';
    document.getElementById('documentation-location-inter-department').value = '';
}

async function saveDepartments() {
    const departmentData = {
        name: document.getElementById('department-name').value,
        primaryContact: document.getElementById('primary-contact-person').value,
        email: document.getElementById('contact-email').value,
        phone: document.getElementById('contact-phone').value,
        communicationFrequency: document.getElementById('communication-frequency').value,
        responsible: document.getElementById('responsible-role').value,
        communicationMethods: document.getElementById('communication-methods').value,
        content: document.getElementById('content-communication').value,
        documentationLocation: document.getElementById('documentation-location').value,
        interDepartmentalFrequency: document.getElementById('inter-departmental-frequency').value,
        departmentsCommunicatedWith: document.getElementById('departments-communicated-with').value,
        responsibleInterDepartment: document.getElementById('responsible-role-inter-department').value,
        communicationMethodsInterDepartment: document.getElementById('communication-methods-inter-department').value,
        contentInterDepartment: document.getElementById('content-communication-inter-department').value,
        documentationLocationInterDepartment: document.getElementById('documentation-location-inter-department').value
    };

    if (departmentData.name && departmentData.primaryContact && departmentData.email && departmentData.phone) {
        const departments = await fetchDepartments();

        if (departmentEditIndex >= 0) {
            departments.updates[departmentEditIndex] = departmentData;
            departmentEditIndex = -1;
        } else {
            departments.updates.push(departmentData);
        }

        fetch('/save-departmental-communication', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(departments)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            clearDepartmentInputFields();
            loadSavedDepartments();
            hideDepartmentFields();
            setEditingIndicator('departmental-editing-indicator');
            enableAddButton('add-department-button');
        })
        .catch(error => {
            console.error('Error:', error);
        });
    } else {
        console.error('Please fill in all required fields.');
    }
}

async function loadSavedDepartments() {
    fetch('/departmental-communication-data')
        .then(response => response.json())
        .then(data => {
            const listContainer = document.getElementById('saved-departments-list');
            listContainer.innerHTML = '';
            if (data && data.updates && data.updates.length > 0) {
                data.updates.forEach((department, index) => {
                    const item = document.createElement('div');
                    item.classList.add('item');
                    item.innerHTML = `
                        <div class="item-info">
                            <strong>Department Name:</strong> ${department.name}<br>
                            <strong>Primary Contact Person:</strong> ${department.primaryContact}<br>
                            <strong>Contact Email:</strong> ${department.email}<br>
                            <strong>Contact Phone:</strong> ${department.phone}<br>
                            <strong>Communication Frequency:</strong> ${department.communicationFrequency}<br>
                            <strong>Responsible Role/Person:</strong> ${department.responsible}<br>
                            <strong>Communication Methods:</strong> ${department.communicationMethods}<br>
                            <strong>Content of Communication:</strong> ${department.content}<br>
                            <strong>Documentation Location:</strong> ${department.documentationLocation}<br>
                            <strong>Inter-departmental Frequency:</strong> ${department.interDepartmentalFrequency}<br>
                            <strong>Departments Communicated With:</strong> ${department.departmentsCommunicatedWith}<br>
                            <strong>Responsible Role/Person for Inter-departmental Communication:</strong> ${department.responsibleInterDepartment}<br>
                            <strong>Inter-departmental Communication Methods:</strong> ${department.communicationMethodsInterDepartment}<br>
                            <strong>Content of Inter-departmental Communication:</strong> ${department.contentInterDepartment}<br>
                            <strong>Inter-departmental Documentation Location:</strong> ${department.documentationLocationInterDepartment}
                        </div>
                        <div class="item-buttons">
                            <button onclick="editDepartment(${index})">Edit</button>
                            <button onclick="deleteDepartment(${index})">Delete</button>
                        </div>
                    `;
                    listContainer.appendChild(item);
                });
            } else {
                listContainer.innerHTML = 'No departments found.';
            }
        })
        .catch(error => {
            console.error('Error fetching departments:', error);
            document.getElementById('saved-departments-list').innerText = 'Failed to load departments.';
        });
}

async function fetchDepartments() {
    return fetch('/departmental-communication-data')
        .then(response => response.json())
        .then(data => data || { updates: [] })
        .catch(error => {
            console.error('Error fetching saved departments:', error);
            return { updates: [] };
        });
}

async function deleteDepartment(index) {
    fetch(`/delete-departmental-communication/${index}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        loadSavedDepartments();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function editDepartment(index) {
    fetch('/departmental-communication-data')
        .then(response => response.json())
        .then(data => {
            if (data && data.updates && data.updates[index]) {
                showDepartmentFields();
                const department = data.updates[index];
                document.getElementById('department-name').value = department.name;
                document.getElementById('primary-contact-person').value = department.primaryContact;
                document.getElementById('contact-email').value = department.email;
                document.getElementById('contact-phone').value = department.phone;
                document.getElementById('communication-frequency').value = department.communicationFrequency;
                document.getElementById('responsible-role').value = department.responsible;
                document.getElementById('communication-methods').value = department.communicationMethods;
                document.getElementById('content-communication').value = department.content;
                document.getElementById('documentation-location').value = department.documentationLocation;
                document.getElementById('inter-departmental-frequency').value = department.interDepartmentalFrequency;
                document.getElementById('departments-communicated-with').value = department.departmentsCommunicatedWith;
                document.getElementById('responsible-role-inter-department').value = department.responsibleInterDepartment;
                document.getElementById('communication-methods-inter-department').value = department.communicationMethodsInterDepartment;
                document.getElementById('content-communication-inter-department').value = department.contentInterDepartment;
                document.getElementById('documentation-location-inter-department').value = department.documentationLocationInterDepartment;

                departmentEditIndex = index;
                setEditingIndicator('departmental-editing-indicator', department.name);
                disableAddButton('add-department-button');
            }
        })
        .catch(error => {
            console.error('Error fetching department:', error);
        });
}

function hideDepartmentFields() {
    const fields = document.querySelectorAll('#departmental-container .question-group');
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

document.addEventListener('DOMContentLoaded', function() {
    loadSavedDepartments();
});
