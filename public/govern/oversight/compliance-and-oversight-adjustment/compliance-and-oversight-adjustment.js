let editIndex = -1;

async function saveComplianceOversightData() {
    const data = {
        q1: document.getElementById('q1').value,
        q2: document.getElementById('q2').value,
        q3: document.getElementById('q3').value,
        q4: document.getElementById('q4').value
    };

    let complianceOversightData = await fetchComplianceOversightData();
    if (editIndex >= 0) {
        complianceOversightData[editIndex] = data;
        editIndex = -1;
    } else {
        complianceOversightData.push(data);
    }

    const response = await fetch('/save-compliance-oversight', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ complianceOversightData })
    }).then(res => res.json());

    if (response.error) {
        console.error('Error:', response.error);
    } else {
        console.log('Success:', response);
        clearInputFields();
        loadSavedComplianceOversightData();
        setEditingIndicator();
    }
}

async function loadSavedComplianceOversightData() {
    const complianceOversightData = await fetchComplianceOversightData();
    const listContainer = document.getElementById('saved-compliance-oversight-list');
    listContainer.innerHTML = '';
    if (complianceOversightData.length > 0) {
        complianceOversightData.forEach((data, index) => {
            const dataElement = document.createElement('div');
            dataElement.className = 'compliance-oversight-item';
            dataElement.innerHTML = `
                <div class="compliance-oversight-info">
                    <strong>
How effective has the cybersecurity risk management strategy been in helping leadership make decisions?
</strong> ${data.q1} <br>
                    <strong>Have the risk management strategy outcomes helped the organization achieve its strategic objectives?</strong> ${data.q2} <br>
                    <strong>Are there any aspects of the risk management strategy that have impeded operations or innovation?</strong> ${data.q3} <br>
                    <strong>What key metrics do you use to measure the effectiveness of the risk management strategy?</strong> ${data.q4}
                </div>
                <div class="compliance-oversight-buttons">
                    <button onclick="editComplianceOversightData(${index})">Edit</button>
                    <button onclick="deleteComplianceOversightData(${index})">Delete</button>
                </div>
            `;
            listContainer.appendChild(dataElement);
        });
    } else {
        listContainer.innerText = 'No saved data found.';
    }
}

async function fetchComplianceOversightData() {
    const response = await fetch('/compliance-oversight-data').then(res => res.json());
    return response.complianceOversightData || [];
}

function editComplianceOversightData(index) {
    fetchComplianceOversightData().then(data => {
        const complianceOversight = data[index];
        if (complianceOversight) {
            document.getElementById('q1').value = complianceOversight.q1;
            document.getElementById('q2').value = complianceOversight.q2;
            document.getElementById('q3').value = complianceOversight.q3;
            document.getElementById('q4').value = complianceOversight.q4;
            editIndex = index;
            setEditingIndicator(complianceOversight.q1);
        }
    });
}

function deleteComplianceOversightData(index) {
    fetch(`/delete-compliance-oversight/${index}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            loadSavedComplianceOversightData();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function clearInputFields() {
    document.getElementById('q1').value = '';
    document.getElementById('q2').value = '';
    document.getElementById('q3').value = '';
    document.getElementById('q4').value = '';
}

function setEditingIndicator(name = '') {
    const indicator = document.getElementById('editing-indicator');
    if (name) {
        indicator.innerText = `Editing ${name}`;
    } else {
        indicator.innerText = '';
    }
}

document.addEventListener('DOMContentLoaded', loadSavedComplianceOversightData);
