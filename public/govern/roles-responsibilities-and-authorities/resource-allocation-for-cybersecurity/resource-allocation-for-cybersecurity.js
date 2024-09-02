let editIndex = -1;

async function saveResourceAllocationData() {
    const data = {
        reviewMeetings: document.getElementById('review-meetings').value,
        authorityChecks: document.getElementById('authority-checks').value,
        riskResources: document.getElementById('risk-resources').value,
        budgetAllocation: document.getElementById('budget-allocation').value,
        supportPeople: document.getElementById('support-people').value,
        technicalInvestments: document.getElementById('technical-investments').value
    };

    let allocations = await fetchAllocations();
    if (editIndex >= 0) {
        allocations[editIndex] = data;
        editIndex = -1;
    } else {
        allocations.push(data);
    }

    const response = await fetch('/save-resource-allocation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ allocations })
    }).then(res => res.json());

    if (response.error) {
        console.error('Error:', response.error);
    } else {
        console.log('Success:', response);
        clearInputFields();
        loadSavedAllocations();
        setEditingIndicator();
    }
}

function addResourceAllocation() {
    clearInputFields();
    setEditingIndicator();
}

async function loadSavedAllocations() {
    const allocations = await fetchAllocations();
    const listContainer = document.getElementById('saved-allocations-list');
    listContainer.innerHTML = '';

    if (allocations.length > 0) {
        allocations.forEach((allocation, index) => {
            const allocationElement = document.createElement('div');
            allocationElement.className = 'allocation-item';
            allocationElement.innerHTML = `
                <div class="allocation-info">
                    <strong>Review Meetings:</strong> ${allocation.reviewMeetings} <br>
                    <strong>Authority Checks:</strong> ${allocation.authorityChecks} <br>
                    <strong>Risk Resources:</strong> ${allocation.riskResources} <br>
                    <strong>Budget Allocation:</strong> ${allocation.budgetAllocation} <br>
                    <strong>Support People:</strong> ${allocation.supportPeople} <br>
                    <strong>Technical Investments:</strong> ${allocation.technicalInvestments}
                </div>
                <div class="allocation-buttons">
                    <button onclick="editAllocation(${index})">Edit</button>
                    <button onclick="deleteAllocation(${index})">Delete</button>
                </div>
            `;
            listContainer.appendChild(allocationElement);
        });
    } else {
        listContainer.innerText = 'No saved allocations found.';
    }
}

async function fetchAllocations() {
    const response = await fetch('/resource-allocation-data');
    const data = await response.json();
    return data.allocations || [];
}

function editAllocation(index) {
    fetchAllocations().then(allocations => {
        const allocation = allocations[index];
        if (allocation) {
            document.getElementById('review-meetings').value = allocation.reviewMeetings;
            document.getElementById('authority-checks').value = allocation.authorityChecks;
            document.getElementById('risk-resources').value = allocation.riskResources;
            document.getElementById('budget-allocation').value = allocation.budgetAllocation;
            document.getElementById('support-people').value = allocation.supportPeople;
            document.getElementById('technical-investments').value = allocation.technicalInvestments;

            editIndex = index;
            setEditingIndicator(allocation.reviewMeetings);
        }
    });
}

function deleteAllocation(index) {
    fetch('/delete-resource-allocation/' + index, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            loadSavedAllocations();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function clearInputFields() {
    document.getElementById('review-meetings').value = '';
    document.getElementById('authority-checks').value = '';
    document.getElementById('risk-resources').value = '';
    document.getElementById('budget-allocation').value = '';
    document.getElementById('support-people').value = '';
    document.getElementById('technical-investments').value = '';
}

function setEditingIndicator(name = '') {
    const indicator = document.getElementById('editing-indicator');
    if (name) {
        indicator.innerText = `Editing ${name}`;
    } else {
        indicator.innerText = '';
    }
}

document.addEventListener('DOMContentLoaded', loadSavedAllocations);
