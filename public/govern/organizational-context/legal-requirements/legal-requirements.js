let editIndex = -1;

document.addEventListener('DOMContentLoaded', function() {
    loadSavedRequirements();
});

async function saveLegalRequirementsData() {
    const lawName = document.getElementById('law-name').value;
    const description = document.getElementById('description').value;
    const notes = document.getElementById('notes').value;
    const department = document.getElementById('department').value;

    const links = [];
    document.querySelectorAll('.link-div').forEach(linkDiv => {
        const linkName = linkDiv.querySelector('input[name="link-name[]"]').value;
        const linkURL = linkDiv.querySelector('input[name="link-url[]"]').value;
        if (linkName && linkURL) {
            links.push({ name: linkName, url: linkURL });
        }
    });

    const contacts = [];
    document.querySelectorAll('.contact-div').forEach(contactDiv => {
        const contactName = contactDiv.querySelector('input[name="contact-name[]"]').value;
        const contactEmail = contactDiv.querySelector('input[name="contact-email[]"]').value;
        const contactPhone = contactDiv.querySelector('input[name="contact-phone[]"]').value;
        const contactDepartment = contactDiv.querySelector('input[name="contact-department[]"]').value;
        const contactJobTitle = contactDiv.querySelector('input[name="contact-job-title[]"]').value;
        if (contactName && contactEmail && contactPhone && contactDepartment && contactJobTitle) {
            contacts.push({
                name: contactName,
                email: contactEmail,
                phone: contactPhone,
                department: contactDepartment,
                jobTitle: contactJobTitle
            });
        }
    });

    if (lawName && description) {
        let requirements = await fetchRequirements();
        if (editIndex >= 0) {
            requirements[editIndex] = { name: lawName, description, notes, department, links, contacts };
            editIndex = -1;
        } else {
            requirements.push({ name: lawName, description, notes, department, links, contacts });
        }

        const data = { requirements };

        fetch('/save-legal-requirements', {
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
            loadSavedRequirements();
            setEditingIndicator();
            hideInputFields();
            enableAddButton();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}

function addRequirement() {
    showInputFields();
    clearInputFields();
    setEditingIndicator();
    disableAddButton();
}

function addLink() {
    const container = document.getElementById('links-container');
    const linkDiv = document.createElement('div');
    linkDiv.className = 'link-div';

    const linkName = document.createElement('input');
    linkName.type = 'text';
    linkName.placeholder = 'Link Name';
    linkName.name = 'link-name[]';

    const linkURL = document.createElement('input');
    linkURL.type = 'url';
    linkURL.placeholder = 'URL';
    linkURL.name = 'link-url[]';

    linkDiv.appendChild(linkName);
    linkDiv.appendChild(linkURL);
    container.appendChild(linkDiv);
}

function addContact() {
    const container = document.getElementById('contacts-container');
    const contactDiv = document.createElement('div');
    contactDiv.className = 'contact-div';

    const contactName = document.createElement('input');
    contactName.type = 'text';
    contactName.placeholder = 'Name';
    contactName.name = 'contact-name[]';

    const contactEmail = document.createElement('input');
    contactEmail.type = 'email';
    contactEmail.placeholder = 'Email';
    contactEmail.name = 'contact-email[]';

    const contactPhone = document.createElement('input');
    contactPhone.type = 'tel';
    contactPhone.placeholder = 'Phone Number';
    contactPhone.name = 'contact-phone[]';

    const contactDepartment = document.createElement('input');
    contactDepartment.type = 'text';
    contactDepartment.placeholder = 'Department';
    contactDepartment.name = 'contact-department[]';

    const contactJobTitle = document.createElement('input');
    contactJobTitle.type = 'text';
    contactJobTitle.placeholder = 'Job Title';
    contactJobTitle.name = 'contact-job-title[]';

    contactDiv.appendChild(contactName);
    contactDiv.appendChild(contactEmail);
    contactDiv.appendChild(contactPhone);
    contactDiv.appendChild(contactDepartment);
    contactDiv.appendChild(contactJobTitle);
    container.appendChild(contactDiv);
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
    document.getElementById('law-name').value = '';
    document.getElementById('description').value = '';
    document.getElementById('notes').value = '';
    document.getElementById('department').value = '';
    document.getElementById('links-container').innerHTML = '<button type="button" id="add-link-button" onclick="addLink()">Add Link</button>';
    document.getElementById('contacts-container').innerHTML = '<button type="button" id="add-contact-button" onclick="addContact()">Add Contact</button>';
}

async function loadSavedRequirements() {
    fetch('/legal-requirements-data')
    .then(response => response.json())
    .then(data => {
        const listContainer = document.getElementById('saved-requirements-list');
        listContainer.innerHTML = '';
        if (data && data.requirements) {
            data.requirements.forEach((requirement, index) => {
                const requirementElement = document.createElement('div');
                requirementElement.classList.add('requirement-item');
                requirementElement.innerHTML = `
                    <div class="requirement-info">
                        <strong>Law/Regulation/Contract:</strong> ${requirement.name} <br>
                        <strong>Description:</strong> ${requirement.description} <br>
                        <strong>Notes:</strong> ${requirement.notes} <br>
                        <strong>Responsible Department:</strong> ${requirement.department} <br>
                        <strong>Links:</strong> <ul>${requirement.links.map(link => `<li><a href="${link.url}" target="_blank">${link.name}</a></li>`).join('')}</ul>
                        <strong>Related Contacts:</strong> <ul>${requirement.contacts.map(contact => `<li>${contact.name} - ${contact.email} - ${contact.phone} - ${contact.department} - ${contact.jobTitle}</li>`).join('')}</ul>
                    </div>
                    <div class="requirement-buttons">
                        <button onclick="editRequirement(${index})">Edit</button>
                        <button onclick="deleteRequirement(${index})">Delete</button>
                    </div>
                `;
                listContainer.appendChild(requirementElement);
            });
        } else {
            listContainer.innerText = 'No saved requirements found.';
        }
    })
    .catch(error => {
        console.error('Error fetching saved requirements:', error);
        document.getElementById('saved-requirements-list').innerText = 'Failed to load saved requirements.';
    });
}

async function fetchRequirements() {
    return fetch('/legal-requirements-data')
        .then(response => response.json())
        .then(data => data.requirements || [])
        .catch(error => {
            console.error('Error fetching saved requirements:', error);
            return [];
        });
}

async function deleteRequirement(index) {
    fetch(`/delete-legal-requirement/${index}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        loadSavedRequirements();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function editRequirement(index) {
    fetch(`/legal-requirements-data`)
    .then(response => response.json())
    .then(data => {
        if (data && data.requirements && data.requirements[index]) {
            showInputFields();
            document.getElementById('law-name').value = data.requirements[index].name;
            document.getElementById('description').value = data.requirements[index].description;
            document.getElementById('notes').value = data.requirements[index].notes;
            document.getElementById('department').value = data.requirements[index].department;

            const linksContainer = document.getElementById('links-container');
            linksContainer.innerHTML = '<button type="button" id="add-link-button" onclick="addLink()">Add Link</button>';
            data.requirements[index].links.forEach(link => {
                const linkDiv = document.createElement('div');
                linkDiv.className = 'link-div';
                
                const linkName = document.createElement('input');
                linkName.type = 'text';
                linkName.placeholder = 'Link Name';
                linkName.name = 'link-name[]';
                linkName.value = link.name;
                
                const linkURL = document.createElement('input');
                linkURL.type = 'url';
                linkURL.placeholder = 'URL';
                linkURL.name = 'link-url[]';
                linkURL.value = link.url;
                
                linkDiv.appendChild(linkName);
                linkDiv.appendChild(linkURL);
                linksContainer.appendChild(linkDiv);
            });

            const contactsContainer = document.getElementById('contacts-container');
            contactsContainer.innerHTML = '<button type="button" id="add-contact-button" onclick="addContact()">Add Contact</button>';
            data.requirements[index].contacts.forEach(contact => {
                const contactDiv = document.createElement('div');
                contactDiv.className = 'contact-div';

                const contactName = document.createElement('input');
                contactName.type = 'text';
                contactName.placeholder = 'Name';
                contactName.name = 'contact-name[]';
                contactName.value = contact.name;

                const contactEmail = document.createElement('input');
                contactEmail.type = 'email';
                contactEmail.placeholder = 'Email';
                contactEmail.name = 'contact-email[]';
                contactEmail.value = contact.email;

                const contactPhone = document.createElement('input');
                contactPhone.type = 'tel';
                contactPhone.placeholder = 'Phone Number';
                contactPhone.name = 'contact-phone[]';
                contactPhone.value = contact.phone;

                const contactDepartment = document.createElement('input');
                contactDepartment.type = 'text';
                contactDepartment.placeholder = 'Department';
                contactDepartment.name = 'contact-department[]';
                contactDepartment.value = contact.department;

                const contactJobTitle = document.createElement('input');
                contactJobTitle.type = 'text';
                contactJobTitle.placeholder = 'Job Title';
                contactJobTitle.name = 'contact-job-title[]';
                contactJobTitle.value = contact.jobTitle;

                contactDiv.appendChild(contactName);
                contactDiv.appendChild(contactEmail);
                contactDiv.appendChild(contactPhone);
                contactDiv.appendChild(contactDepartment);
                contactDiv.appendChild(contactJobTitle);
                contactsContainer.appendChild(contactDiv);
            });

            editIndex = index;
            setEditingIndicator(data.requirements[index].name);
            disableAddButton();
        }
    })
    .catch(error => {
        console.error('Error fetching requirement:', error);
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
