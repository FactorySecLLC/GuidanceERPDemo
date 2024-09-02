let editIndex = -1;

document.addEventListener('DOMContentLoaded', () => {
    loadSavedRiskData();

    // Update displayed value for financial impact slider
    document.getElementById('financial-impact').addEventListener('input', function() {
        document.getElementById('financial-impact-value').textContent = `$${this.value}`;
    });

    // Update displayed value for regulatory impact slider
    document.getElementById('regulatory-impact').addEventListener('input', function() {
        document.getElementById('regulatory-impact-value').textContent = `$${this.value}`;
    });
});

async function saveRiskData() {
    const overallRiskAppetite = document.getElementById('overall-risk-appetite').value;
    const financialImpact = document.getElementById('financial-impact').value;
    const financialRationale = document.getElementById('financial-rationale').value;
    const operationalImpact = document.getElementById('operational-impact').value;
    const operationalRationale = document.getElementById('operational-rationale').value;
    const reputationalImpact = document.getElementById('reputational-impact').value;
    const reputationalRationale = document.getElementById('reputational-rationale').value;
    const regulatoryImpact = document.getElementById('regulatory-impact').value;
    const regulatoryRationale = document.getElementById('regulatory-rationale').value;

    if (overallRiskAppetite) {
        let risks = await fetchRisks();
        const newRisk = {
            overallRiskAppetite, financialImpact, financialRationale, operationalImpact,
            operationalRationale, reputationalImpact, reputationalRationale, regulatoryImpact, regulatoryRationale
        };
        if (editIndex >= 0) {
            risks[editIndex] = newRisk;
            editIndex = -1;
        } else {
            risks.push(newRisk);
        }

        const data = { risks };

        fetch('/save-risks', {
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
            loadSavedRiskData();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}

function clearInputFields() {
    document.getElementById('overall-risk-appetite').value = 'Moderate';
    document.getElementById('financial-impact').value = '0';
    document.getElementById('financial-rationale').value = '';
    document.getElementById('operational-impact').value = '0 hours';
    document.getElementById('operational-rationale').value = '';
    document.getElementById('reputational-impact').value = 'None';
    document.getElementById('reputational-rationale').value = '';
    document.getElementById('regulatory-impact').value = '0';
    document.getElementById('regulatory-rationale').value = '';
    document.getElementById('financial-impact-value').textContent = '$0';
    document.getElementById('regulatory-impact-value').textContent = '$0';
}

async function loadSavedRiskData() {
    fetch('/risks-data')
    .then(response => response.json())
    .then(data => {
        const listContainer = document.getElementById('saved-risk-list');
        listContainer.innerHTML = '';
        if (data && data.risks) {
            data.risks.forEach((risk, index) => {
                const riskElement = document.createElement('div');
                riskElement.classList.add('risk-item');
                riskElement.innerHTML = `
                    <div class="risk-info">
                        <strong>Overall Risk Appetite:</strong> ${risk.overallRiskAppetite} <br>
                        <strong>Financial Impact:</strong> $${risk.financialImpact} <br>
                        <strong>Financial Rationale:</strong> ${risk.financialRationale} <br>
                        <strong>Operational Impact:</strong> ${risk.operationalImpact} <br>
                        <strong>Operational Rationale:</strong> ${risk.operationalRationale} <br>
                        <strong>Reputational Impact:</strong> ${risk.reputationalImpact} <br>
                        <strong>Reputational Rationale:</strong> ${risk.reputationalRationale} <br>
                        <strong>Regulatory Impact:</strong> $${risk.regulatoryImpact} <br>
                        <strong>Regulatory Rationale:</strong> ${risk.regulatoryRationale}
                    </div>
                    <div class="risk-buttons">
                        <button onclick="editRisk(${index})">Edit</button>
                        <button onclick="deleteRisk(${index})">Delete</button>
                    </div>
                `;
                listContainer.appendChild(riskElement);
            });
        } else {
            listContainer.innerText = 'No saved risks found.';
        }
    })
    .catch(error => {
        console.error('Error fetching saved risks:', error);
        document.getElementById('saved-risk-list').innerText = 'Failed to load saved risks.';
    });
}

async function fetchRisks() {
    return fetch('/risks-data')
        .then(response => response.json())
        .then(data => data.risks || [])
        .catch(error => {
            console.error('Error fetching saved risks:', error);
            return [];
        });
}

async function deleteRisk(index) {
    fetch(`/delete-risk/${index}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        loadSavedRiskData();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function editRisk(index) {
    fetch(`/risks-data`)
    .then(response => response.json())
    .then(data => {
        if (data && data.risks && data.risks[index]) {
            document.getElementById('overall-risk-appetite').value = data.risks[index].overallRiskAppetite;
            document.getElementById('financial-impact').value = data.risks[index].financialImpact;
            document.getElementById('financial-rationale').value = data.risks[index].financialRationale;
            document.getElementById('operational-impact').value = data.risks[index].operationalImpact;
            document.getElementById('operational-rationale').value = data.risks[index].operationalRationale;
            document.getElementById('reputational-impact').value = data.risks[index].reputationalImpact;
            document.getElementById('reputational-rationale').value = data.risks[index].reputationalRationale;
            document.getElementById('regulatory-impact').value = data.risks[index].regulatoryImpact;
            document.getElementById('regulatory-rationale').value = data.risks[index].regulatoryRationale;
            editIndex = index;
        }
    })
    .catch(error => {
        console.error('Error fetching risk:', error);
    });
}
