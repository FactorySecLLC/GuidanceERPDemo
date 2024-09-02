let editIndex = -1;

function clearInputFields() {
    document.getElementById('overview').value = '';
    document.getElementById('business-areas').value = '';
    document.getElementById('finding-risks').value = '';
    document.getElementById('key-people').value = '';
    document.getElementById('handling-risks').value = '';
    document.getElementById('compliance').value = '';
    document.getElementById('documenting').value = '';
    document.getElementById('resources').value = '';
}

function saveEntries() {
    const overview = document.getElementById('overview').value;
    const businessAreas = document.getElementById('business-areas').value;
    const findingRisks = document.getElementById('finding-risks').value;
    const keyPeople = document.getElementById('key-people').value;
    const handlingRisks = document.getElementById('handling-risks').value;
    const compliance = document.getElementById('compliance').value;
    const documenting = document.getElementById('documenting').value;
    const resources = document.getElementById('resources').value;

    if (overview && businessAreas) {
        fetch('/cybersecurity-risk-management-data')
            .then(response => response.json())
            .then(data => {
                let entries = data.entries || [];
                const entryData = {
                    overview,
                    businessAreas,
                    findingRisks,
                    keyPeople,
                    handlingRisks,
                    compliance,
                    documenting,
                    resources
                };

                if (editIndex >= 0) {
                    entries[editIndex] = entryData;
                    editIndex = -1;
                } else {
                    entries.push(entryData);
                }

                fetch('/save-cybersecurity-risk-management', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ entries })
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Success:', data);
                        clearInputFields();
                        loadSavedEntries();
                        setEditingIndicator('');
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
}

function loadSavedEntries() {
    fetch('/cybersecurity-risk-management-data')
        .then(response => response.json())
        .then(data => {
            const listContainer = document.getElementById('saved-entries-list');
            listContainer.innerHTML = '';
            if (data && data.entries) {
                data.entries.forEach((entry, index) => {
                    const item = document.createElement('div');
                    item.classList.add('item');
                    item.innerHTML = `
                        <div class="item-info">
                            <strong>Overview of Cybersecurity Efforts:</strong> ${entry.overview}<br>
                            <strong>Areas of Business Affected by Cybersecurity:</strong> ${entry.businessAreas}<br>
                            <strong>How We Find Cyber Risks:</strong> ${entry.findingRisks}<br>
                            <strong>Key People Involved in Security:</strong> ${entry.keyPeople}<br>
                            <strong>How We Handle and Report Cyber Risks:</strong> ${entry.handlingRisks}<br>
                            <strong>Meeting Legal and Industry Standards:</strong> ${entry.compliance}<br>
                            <strong>Keeping Records of Security Practices:</strong> ${entry.documenting}<br>
                            <strong>Where to Get Help with Security:</strong> ${entry.resources}
                        </div>
                        <div class="item-buttons">
                            <button onclick="editEntry(${index})">Edit</button>
                            <button onclick="deleteEntry(${index})">Delete</button>
                        </div>
                    `;
                    listContainer.appendChild(item);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching entries:', error);
            document.getElementById('saved-entries-list').innerText = 'Failed to load entries.';
        });
}

function deleteEntry(index) {
    fetch(`/delete-cybersecurity-risk-management/${index}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            loadSavedEntries();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function editEntry(index) {
    fetch('/cybersecurity-risk-management-data')
        .then(response => response.json())
        .then(data => {
            if (data && data.entries && data.entries[index]) {
                const entry = data.entries[index];
                document.getElementById('overview').value = entry.overview;
                document.getElementById('business-areas').value = entry.businessAreas;
                document.getElementById('finding-risks').value = entry.findingRisks;
                document.getElementById('key-people').value = entry.keyPeople;
                document.getElementById('handling-risks').value = entry.handlingRisks;
                document.getElementById('compliance').value = entry.compliance;
                document.getElementById('documenting').value = entry.documenting;
                document.getElementById('resources').value = entry.resources;
                editIndex = index;
                setEditingIndicator(`Editing ${entry.overview}`);
            }
        })
        .catch(error => {
            console.error('Error fetching entry:', error);
        });
}

function setEditingIndicator(text) {
    const indicator = document.getElementById('editing-indicator');
    indicator.innerText = text;
}

document.addEventListener('DOMContentLoaded', function() {
    loadSavedEntries();
});
