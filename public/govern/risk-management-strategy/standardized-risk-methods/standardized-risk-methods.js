async function saveStandardizedRiskMethods() {
    const methodsText = document.getElementById('standardized-risk-methods').value;

    const data = {
        'methods': methodsText
    };

    fetch('/save-standardized-risk-methods', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        loadSavedStandardizedRiskMethods();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

async function loadSavedStandardizedRiskMethods() {
    fetch('/standardized-risk-methods-data')
    .then(response => response.json())
    .then(data => {
        if (data && data.methods) {
            document.getElementById('saved-standardized-risk-methods-text').innerText = data.methods;
        } else {
            document.getElementById('saved-standardized-risk-methods-text').innerText = 'No saved methods found.';
        }
    })
    .catch(error => {
        console.error('Error fetching saved methods:', error);
        document.getElementById('saved-standardized-risk-methods-text').innerText = 'Failed to load saved methods.';
    });
}

document.addEventListener('DOMContentLoaded', loadSavedStandardizedRiskMethods);
