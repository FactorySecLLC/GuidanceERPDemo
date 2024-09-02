let toolEditIndex = -1;

function addTool() {
    showToolFields();
    clearToolInputFields();
    setEditingIndicator('tools-editing-indicator');
    disableAddButton('add-tools-button');
}

function showToolFields() {
    const fields = document.querySelectorAll('#tools-container .question-group');
    fields.forEach(field => field.style.display = 'block');
}

function clearToolInputFields() {
    document.getElementById('internal-tools').value = '';
    document.getElementById('tool-details').value = '';
}

async function saveTools() {
    const internalTools = document.getElementById('internal-tools').value;
    const toolDetails = document.getElementById('tool-details').value;

    if (internalTools) {
        let tools = await fetchTools();
        const toolData = { internalTools, toolDetails };

        if (toolEditIndex >= 0) {
            tools[toolEditIndex] = toolData;
            toolEditIndex = -1;
        } else {
            tools.push(toolData);
        }

        fetch('/save-communication-tools', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tools })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            clearToolInputFields();
            loadSavedTools();
            setEditingIndicator('tools-editing-indicator');
            hideToolFields();
            enableAddButton('add-tools-button');
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}

async function loadSavedTools() {
    fetch('/communication-tools-data')
        .then(response => response.json())
        .then(data => {
            const listContainer = document.getElementById('saved-tools-list');
            listContainer.innerHTML = '';
            if (data && data.tools && data.tools.length > 0) {  // Accessing the tools array
                data.tools.forEach((tool, index) => {
                    const item = document.createElement('div');
                    item.classList.add('item');
                    item.innerHTML = `
                        <div class="item-info">
                            <strong>Communication Tool Name:</strong> ${tool.internalTools}<br>
                            <strong>Communication Tool Details:</strong> ${tool.toolDetails}<br>
                        </div>
                        <div class="item-buttons">
                            <button onclick="editTool(${index})">Edit</button>
                            <button onclick="deleteTool(${index})">Delete</button>
                        </div>
                    `;
                    listContainer.appendChild(item);
                });
            } else {
                listContainer.innerHTML = 'No tools found.';
            }
        })
        .catch(error => {
            console.error('Error fetching tools:', error);
            document.getElementById('saved-tools-list').innerText = 'Failed to load tools.';
        });
}

async function fetchTools() {
    return fetch('/communication-tools-data')
        .then(response => response.json())
        .then(data => data.tools || [])
        .catch(error => {
            console.error('Error fetching tools:', error);
            return [];
        });
}

function deleteTool(index) {
    fetch(`/delete-communication-tool/${index}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        loadSavedTools();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function editTool(index) {
    fetch('/communication-tools-data')
        .then(response => response.json())
        .then(data => {
            console.log(data); // Add this to see the structure of the data
            if (data && data.tools && data.tools[index]) {
                showToolFields();
                const tool = data.tools[index];
                document.getElementById('internal-tools').value = tool.internalTools;
                document.getElementById('tool-details').value = tool.toolDetails;
                toolEditIndex = index;
                setEditingIndicator('tools-editing-indicator', tool.internalTools);
                disableAddButton('add-tools-button');
            }
        })
        .catch(error => {
            console.error('Error fetching tool:', error);
        });
}


function hideToolFields() {
    const fields = document.querySelectorAll('#tools-container .question-group');
    fields.forEach(field => field.style.display = 'none');
}

function setEditingIndicator(indicatorId, name = '') {
    const indicator = document.getElementById(indicatorId);
    if (name) {
        indicator.innerText = `Editing ${name}`;
    } else {
        indicator.innerText = '';
    }
}

function disableAddButton(buttonId) {
    const addButton = document.getElementById(buttonId);
    addButton.disabled = true;
    addButton.style.backgroundColor = 'grey';
}

function enableAddButton(buttonId) {
    const addButton = document.getElementById(buttonId);
    addButton.disabled = false;
    addButton.style.backgroundColor = '';
}

document.addEventListener('DOMContentLoaded', function() {
    loadSavedTools();
});
