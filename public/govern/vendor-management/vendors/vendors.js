let editIndex = -1;

async function saveSupplierData() {
    const data = {
        supplier: {
            name: document.getElementById('supplier-name').value,
            contacts: Array.from(document.querySelectorAll('.supplier-contact')).map(contactDiv => ({
                name: contactDiv.querySelector('.contact-name').value,
                role: contactDiv.querySelector('.contact-role').value,
                email: contactDiv.querySelector('.contact-email').value,
                phone: contactDiv.querySelector('.contact-phone').value,
            })),
            productsServices: document.getElementById('products-services').value,
            additionalNotes: document.getElementById('additional-notes').value
        },
        editIndex: editIndex // Include edit index in the request body
    };

    const response = await fetch('/save-suppliers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(res => res.json());

    if (response.error) {
        console.error('Error:', response.error);
    } else {
        console.log('Success:', response);
        clearInputFields();
        loadSavedSuppliersData();
        setEditingIndicator();
        hideInputFields();
        enableAddButton();
    }
}

function addSupplier() {
    showInputFields();
    clearInputFields();
    setEditingIndicator();
    disableAddButton();
}

function showInputFields() {
    const fields = document.querySelectorAll('.question-group, .add-buttons');
    fields.forEach((field) => (field.style.display = 'block'));
}

function hideInputFields() {
    const fields = document.querySelectorAll('.question-group, .add-buttons');
    fields.forEach((field) => (field.style.display = 'none'));
}

function clearInputFields() {
    document.getElementById('supplier-name').value = '';
    document.getElementById('products-services').value = '';
    document.getElementById('additional-notes').value = '';

    const contactsContainer = document.getElementById('supplier-contacts-container');
    while (contactsContainer.firstChild) {
        contactsContainer.removeChild(contactsContainer.firstChild);
    }
}

async function loadSavedSuppliersData() {
    try {
        const suppliers = await fetchSuppliers();
        const listContainer = document.getElementById('saved-supplier-list');
        listContainer.innerHTML = '';
        if (suppliers.length > 0) {
            suppliers.forEach((supplier, index) => {
                const supplierElement = document.createElement('div');
                supplierElement.className = 'supplier-item';
                supplierElement.innerHTML = `
                    <div class="supplier-info">
                        <strong>Name:</strong> ${supplier.name} <br>
                        <strong>Contacts:</strong> ${supplier.contacts.map(contact => `
                            Name: ${contact.name}, Role: ${contact.role}, 
                            Email: ${contact.email}, Phone: ${contact.phone}`).join('<br>')} <br>
                        <strong>Products/Services:</strong> ${supplier.productsServices} <br>
                        <strong>Additional Notes:</strong> ${supplier.additionalNotes}
                    </div>
                    <div class="supplier-buttons">
                        <button onclick="editSupplier(${index})">Edit</button>
                        <button onclick="deleteSupplier(${index})">Delete</button>
                    </div>
                `;
                listContainer.appendChild(supplierElement);
            });
        } else {
            listContainer.innerText = 'No saved suppliers found.';
        }
    } catch (error) {
        console.error('Error fetching saved suppliers:', error);
        document.getElementById('saved-supplier-list').innerText = 'Failed to load saved suppliers.';
    }
}

async function fetchSuppliers() {
    try {
        const response = await fetch('/suppliers-data');
        const data = await response.json();
        return data.suppliers || [];
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        return [];
    }
}

function editSupplier(index) {
    fetchSuppliers().then(suppliers => {
        const supplier = suppliers[index];
        if (supplier) {
            showInputFields();
            document.getElementById('supplier-name').value = supplier.name;
            supplier.contacts.forEach(contact => addSupplierContact(contact.name, contact.role, contact.email, contact.phone));
            document.getElementById('products-services').value = supplier.productsServices;
            document.getElementById('additional-notes').value = supplier.additionalNotes;

            editIndex = index;
            setEditingIndicator(supplier.name);
            disableAddButton();
        }
    });
}

function deleteSupplier(index) {
    fetch('/delete-supplier/' + index, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            loadSavedSuppliersData();
        })
        .catch(error => {
            console.error('Error:', error);
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

function addSupplierContact(name = '', role = '', email = '', phone = '') {
    const container = document.getElementById('supplier-contacts-container');
    const contactDiv = document.createElement('div');
    contactDiv.classList.add('supplier-contact');
    contactDiv.innerHTML = `
        <input type="text" class="contact-name" placeholder="Name" value="${name}">
        <input type="text" class="contact-role" placeholder="Role" value="${role}">
        <input type="email" class="contact-email" placeholder="Email" value="${email}">
        <input type="text" class="contact-phone" placeholder="Phone" value="${phone}">
        <button type="button" onclick="removeSupplierContact(this)">Remove</button>
    `;
    container.appendChild(contactDiv);
}

function removeSupplierContact(button) {
    const contactDiv = button.parentElement;
    contactDiv.remove();
}

document.addEventListener('DOMContentLoaded', function () {
    loadSavedSuppliersData();
    hideInputFields();
});

