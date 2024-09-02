let editIndex = -1;

async function saveStrategicRiskManagementData() {
    const data = {
        q1: document.getElementById('q1').value,
        q2: document.getElementById('q2').value,
        q3: document.getElementById('q3').value,
        q4: document.getElementById('q4').value
    };

    let reviews = await fetchStrategicRiskManagementReviews();
    if (editIndex >= 0) {
        reviews[editIndex] = data;
        editIndex = -1;
    } else {
        reviews.push(data);
    }

    const response = await fetch('/save-strategic-risk-management', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reviews })
    }).then(res => res.json());

    if (response.error) {
        console.error('Error:', response.error);
    } else {
        console.log('Success:', response);
        clearInputFields();
        loadSavedStrategicRiskManagementReviews();
        setEditingIndicator();
    }
}

function addStrategicRiskManagementReview() {
    clearInputFields();
    setEditingIndicator();
}

async function loadSavedStrategicRiskManagementReviews() {
    const reviews = await fetchStrategicRiskManagementReviews();
    const listContainer = document.getElementById('saved-review-list');
    listContainer.innerHTML = '';
    if (reviews.length > 0) {
        reviews.forEach((review, index) => {
            const reviewElement = document.createElement('div');
            reviewElement.className = 'review-item';
            reviewElement.innerHTML = `
                <div class="review-info">
                    <strong>Have recent audits identified any gaps in the current cybersecurity strategy?</strong> ${review.q1} <br>
                    <strong>Has the performance of cybersecurity roles been adequate in implementing the strategy?</strong> ${review.q2} <br>
                    <strong>Were there any significant cybersecurity incidents that revealed weaknesses in the current strategy?</strong> ${review.q3} <br>
                    <strong>What specific changes are recommended based on these reviews?</strong> ${review.q4}
                </div>
                <div class="review-buttons">
                    <button onclick="editStrategicRiskManagementReview(${index})">Edit</button>
                    <button onclick="deleteStrategicRiskManagementReview(${index})">Delete</button>
                </div>
            `;
            listContainer.appendChild(reviewElement);
        });
    } else {
        listContainer.innerText = 'No saved reviews found.';
    }
}

async function fetchStrategicRiskManagementReviews() {
    const response = await fetch('/strategic-risk-management-data').then(res => res.json());
    return response.reviews || [];
}

function editStrategicRiskManagementReview(index) {
    fetchStrategicRiskManagementReviews().then(reviews => {
        const review = reviews[index];
        document.getElementById('q1').value = review.q1;
        document.getElementById('q2').value = review.q2;
        document.getElementById('q3').value = review.q3;
        document.getElementById('q4').value = review.q4;
        editIndex = index;
        setEditingIndicator(review.q1);
    });
}

function deleteStrategicRiskManagementReview(index) {
    fetchStrategicRiskManagementReviews().then(async reviews => {
        reviews.splice(index, 1);
        const response = await fetch('/save-strategic-risk-management', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reviews })
        }).then(res => res.json());

        if (response.error) {
            console.error('Error:', response.error);
        } else {
            console.log('Success:', response);
            loadSavedStrategicRiskManagementReviews();
        }
    });
}

function clearInputFields() {
    document.getElementById('q1').value = '';
    document.getElementById('q2').value = '';
    document.getElementById('q3').value = '';
    document.getElementById('q4').value = '';
}

function setEditingIndicator(editingText = '') {
    const indicator = document.getElementById('editing-indicator');
    if (editIndex >= 0) {
        indicator.innerText = `Editing: ${editingText}`;
    } else {
        indicator.innerText = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadSavedStrategicRiskManagementReviews();
});
