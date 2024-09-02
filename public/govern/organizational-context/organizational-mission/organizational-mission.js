async function saveMissionData() {
    const missionText = document.getElementById('organizational-mission').value;

    const data = {
        mission: missionText
    };

    fetch('/save-mission', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        loadSavedMissionData();
        document.getElementById('saved-mission-text').innerText = missionText;
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

async function loadSavedMissionData() {
    fetch('/mission-data')
    .then(response => response.json())
    .then(data => {
        if (data && data.mission) {
            document.getElementById('saved-mission-text').innerText = data.mission;
        } else {
            document.getElementById('saved-mission-text').innerText = 'No saved mission found.';
        }
    })
    .catch(error => {
        console.error('Error fetching saved mission:', error);
        document.getElementById('saved-mission-text').innerText = 'Failed to load saved mission.';
    });
}

document.addEventListener('DOMContentLoaded', loadSavedMissionData);
