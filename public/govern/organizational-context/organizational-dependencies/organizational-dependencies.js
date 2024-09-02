let editIndex = -1;

async function saveDependenciesData() {
    const name = document.getElementById('resource-name').value;
    const functionField = document.getElementById('resource-function').value;
    const critical = document.getElementById('resource-critical').value;
    const contactName = document.getElementById('contact-name').value;
    const contactEmail = document.getElementById('contact-email').value;
    const contactDepartment = document.getElementById('contact-department').value;
    const contactTitle = document.getElementById('contact-title').value;
    const contactRelevance = document.getElementById('contact-relevance').value;
    const stakeholderName = document.getElementById('stakeholder-name').value;
    const stakeholderEmail = document.getElementById('stakeholder-email').value;
    const stakeholderDepartment = document.getElementById('stakeholder-department').value;
    const stakeholderTitle = document.getElementById('stakeholder-title').value;
    const stakeholderRelevance = document.getElementById('stakeholder-relevance').value;
    const reportFrequency = document.getElementById('report-frequency').value;
    const reportChannel = document.getElementById('report-channel').value;
    const reportTopics = document.getElementById('report-topics').value;
    const communicatorName = document.getElementById('report-communicator-name').value;
    const communicatorEmail = document.getElementById('report-communicator-email').value;
    const communicatorDepartment = document.getElementById('report-communicator-department').value;
    const communicatorTitle = document.getElementById('report-communicator-title').value;
    const emergencyProcedure = document.getElementById('emergency-procedure').value;

    if (name && functionField) {
        let dependencies = await fetchDependencies();
        const dependencyData = {
            name,
            function: functionField,
            critical,
            contact: {
                name: contactName,
                email: contactEmail,
                department: contactDepartment,
                title: contactTitle,
                relevance: contactRelevance
            },
            stakeholder: {
                name: stakeholderName,
                email: stakeholderEmail,
                department: stakeholderDepartment,
                title: stakeholderTitle,
                relevance: stakeholderRelevance
            },
            report: {
                frequency: reportFrequency,
                channel: reportChannel,
                topics: reportTopics,
                communicator: {
                    name: communicatorName,
                    email: communicatorEmail,
                    department: communicatorDepartment,
                    title: communicatorTitle
                }
            },
            emergencyProcedure
        };

        if (editIndex >= 0) {
            dependencies[editIndex] = dependencyData;
            editIndex = -1;
        } else {
            dependencies.push(dependencyData);
        }

        const data = { dependencies };

        fetch('/save-dependencies', {
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
            loadSavedDependencies();
            setEditingIndicator();
            hideInputFields();
            enableAddButton();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}

function addDependency() {
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
    document.getElementById('resource-name').value = '';
    document.getElementById('resource-function').value = '';
    document.getElementById('resource-critical').value = 'no';
    document.getElementById('contact-name').value = '';
    document.getElementById('contact-email').value = '';
    document.getElementById('contact-department').value = '';
    document.getElementById('contact-title').value = '';
    document.getElementById('contact-relevance').value = '';
    document.getElementById('stakeholder-name').value = '';
    document.getElementById('stakeholder-email').value = '';
    document.getElementById('stakeholder-department').value = '';
    document.getElementById('stakeholder-title').value = '';
    document.getElementById('stakeholder-relevance').value = '';
    document.getElementById('report-frequency').value = '';
    document.getElementById('report-channel').value = '';
    document.getElementById('report-topics').value = '';
    document.getElementById('report-communicator-name').value = '';
    document.getElementById('report-communicator-email').value = '';
    document.getElementById('report-communicator-department').value = '';
    document.getElementById('report-communicator-title').value = '';
    document.getElementById('emergency-procedure').value = '';
}

async function loadSavedDependencies() {
    fetch('/dependencies-data')
    .then(response => response.json())
    .then(data => {
        const listContainer = document.getElementById('saved-dependencies-list');
        listContainer.innerHTML = '';
        if (data && data.dependencies) {
            data.dependencies.forEach((dependency, index) => {
                const dependencyElement = document.createElement('div');
                dependencyElement.classList.add('dependency-item');
                dependencyElement.innerHTML = `
                    <div class="dependency-info">
                        <strong>Resource Name:</strong> ${dependency.name} <br>
                        <strong>Business Function:</strong> ${dependency.function} <br>
                        <strong>Critical Point of Failure:</strong> ${dependency.critical} <br>
                        <strong>Contact Name:</strong> ${dependency.contact.name} <br>
                        <strong>Contact Email:</strong> ${dependency.contact.email} <br>
                        <strong>Contact Department:</strong> ${dependency.contact.department} <br>
                        <strong>Contact Job Title:</strong> ${dependency.contact.title} <br>
                        <strong>Contact Relevance:</strong> ${dependency.contact.relevance} <br>
                        <strong>Stakeholder Name:</strong> ${dependency.stakeholder.name} <br>
                        <strong>Stakeholder Email:</strong> ${dependency.stakeholder.email} <br>
                        <strong>Stakeholder Department:</strong> ${dependency.stakeholder.department} <br>
                        <strong>Stakeholder Job Title:</strong> ${dependency.stakeholder.title} <br>
                        <strong>Stakeholder Relevance:</strong> ${dependency.stakeholder.relevance} <br>
                        <strong>Report Frequency:</strong> ${dependency.report.frequency} <br>
                        <strong>Report Channel:</strong> ${dependency.report.channel} <br>
                        <strong>Report Topics:</strong> ${dependency.report.topics} <br>
                        <strong>Report Communicator Name:</strong> ${dependency.report.communicator.name} <br>
                        <strong>Report Communicator Email:</strong> ${dependency.report.communicator.email} <br>
                        <strong>Report Communicator Department:</strong> ${dependency.report.communicator.department} <br>
                        <strong>Report Communicator Job Title:</strong> ${dependency.report.communicator.title} <br>
                        <strong>Emergency Procedure:</strong> ${dependency.emergencyProcedure}
                    </div>
                    <div class="dependency-buttons">
                        <button onclick="editDependency(${index})">Edit</button>
                        <button onclick="deleteDependency(${index})">Delete</button>
                    </div>
                `;
                listContainer.appendChild(dependencyElement);
            });
        } else {
            listContainer.innerText = 'No saved dependencies found.';
        }
    })
    .catch(error => {
        console.error('Error fetching saved dependencies:', error);
        document.getElementById('saved-dependencies-list').innerText = 'Failed to load saved dependencies.';
    });
}

async function fetchDependencies() {
    return fetch('/dependencies-data')
        .then(response => response.json())
        .then(data => data.dependencies || [])
        .catch(error => {
            console.error('Error fetching saved dependencies:', error);
            return [];
        });
}

async function deleteDependency(index) {
    fetch(`/delete-dependency/${index}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        loadSavedDependencies();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function editDependency(index) {
    fetch(`/dependencies-data`)
    .then(response => response.json())
    .then(data => {
        if (data && data.dependencies && data.dependencies[index]) {
            showInputFields();
            document.getElementById('resource-name').value = data.dependencies[index].name;
            document.getElementById('resource-function').value = data.dependencies[index].function;
            document.getElementById('resource-critical').value = data.dependencies[index].critical;
            document.getElementById('contact-name').value = data.dependencies[index].contact.name;
            document.getElementById('contact-email').value = data.dependencies[index].contact.email;
            document.getElementById('contact-department').value = data.dependencies[index].contact.department;
            document.getElementById('contact-title').value = data.dependencies[index].contact.title;
            document.getElementById('contact-relevance').value = data.dependencies[index].contact.relevance;
            document.getElementById('stakeholder-name').value = data.dependencies[index].stakeholder.name;
            document.getElementById('stakeholder-email').value = data.dependencies[index].stakeholder.email;
            document.getElementById('stakeholder-department').value = data.dependencies[index].stakeholder.department;
            document.getElementById('stakeholder-title').value = data.dependencies[index].stakeholder.title;
            document.getElementById('stakeholder-relevance').value = data.dependencies[index].stakeholder.relevance;
            document.getElementById('report-frequency').value = data.dependencies[index].report.frequency;
            document.getElementById('report-channel').value = data.dependencies[index].report.channel;
            document.getElementById('report-topics').value = data.dependencies[index].report.topics;
            document.getElementById('report-communicator-name').value = data.dependencies[index].report.communicator.name;
            document.getElementById('report-communicator-email').value = data.dependencies[index].report.communicator.email;
            document.getElementById('report-communicator-department').value = data.dependencies[index].report.communicator.department;
            document.getElementById('report-communicator-title').value = data.dependencies[index].report.communicator.title;
            document.getElementById('emergency-procedure').value = data.dependencies[index].emergencyProcedure;
            editIndex = index;
            setEditingIndicator(data.dependencies[index].name);
            disableAddButton();
        }
    })
    .catch(error => {
        console.error('Error fetching dependency:', error);
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

document.addEventListener('DOMContentLoaded', loadSavedDependencies);
