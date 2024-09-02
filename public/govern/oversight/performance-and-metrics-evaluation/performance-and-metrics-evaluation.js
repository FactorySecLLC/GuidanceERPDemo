let editIndex = -1;

async function savePerformanceMetricsData() {
    const data = {
        q1: document.getElementById('q1').value,
        q2: document.getElementById('q2').value,
        q3: document.getElementById('q3').value,
        q4: document.getElementById('q4').value
    };

    let performanceMetricsData = await fetchPerformanceMetricsData();
    if (editIndex >= 0) {
        performanceMetricsData[editIndex] = data;
        editIndex = -1;
    } else {
        performanceMetricsData.push(data);
    }

    const response = await fetch('/save-performance-metrics', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ performanceMetricsData })
    }).then(res => res.json());

    if (response.error) {
        console.error('Error:', response.error);
    } else {
        console.log('Success:', response);
        clearInputFields();
        loadSavedPerformanceMetricsData();
        setEditingIndicator();
    }
}

async function loadSavedPerformanceMetricsData() {
    const performanceMetricsData = await fetchPerformanceMetricsData();
    const listContainer = document.getElementById('saved-performance-metrics-list');
    listContainer.innerHTML = '';
    if (performanceMetricsData.length > 0) {
        performanceMetricsData.forEach((data, index) => {
            const dataElement = document.createElement('div');
            dataElement.className = 'performance-metrics-item';
            dataElement.innerHTML = `
                <div class="performance-metrics-info">
                    <strong>What are the key performance indicators (KPIs) you are tracking for cybersecurity risk management?</strong> ${data.q1} <br>
                    <strong>What are the key risk indicators (KRIs) that are critical for your organization?</strong> ${data.q2} <br>
                    <strong>How have the KPIs and KRIs evolved over the past reporting periods?</strong> ${data.q3} <br>
                    <strong>How is the performance data communicated to people who need to know about this in the organization?</strong> ${data.q4}
                </div>
                <div class="performance-metrics-buttons">
                    <button onclick="editPerformanceMetricsData(${index})">Edit</button>
                    <button onclick="deletePerformanceMetricsData(${index})">Delete</button>
                </div>
            `;
            listContainer.appendChild(dataElement);
        });
    } else {
        listContainer.innerText = 'No saved data found.';
    }
}

async function fetchPerformanceMetricsData() {
    const response = await fetch('/performance-metrics-data').then(res => res.json());
    return response.performanceMetricsData || [];
}

function editPerformanceMetricsData(index) {
    fetchPerformanceMetricsData().then(data => {
        const performanceMetrics = data[index];
        if (performanceMetrics) {
            document.getElementById('q1').value = performanceMetrics.q1;
            document.getElementById('q2').value = performanceMetrics.q2;
            document.getElementById('q3').value = performanceMetrics.q3;
            document.getElementById('q4').value = performanceMetrics.q4;
            editIndex = index;
            setEditingIndicator(performanceMetrics.q1);
        }
    });
}

function deletePerformanceMetricsData(index) {
    fetch(`/delete-performance-metrics/${index}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            loadSavedPerformanceMetricsData();
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

document.addEventListener('DOMContentLoaded', loadSavedPerformanceMetricsData);
