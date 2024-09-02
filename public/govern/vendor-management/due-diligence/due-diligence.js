document.addEventListener('DOMContentLoaded', loadDueDiligenceData);

async function loadDueDiligenceData() {
    const vendors = await fetchVendors();
    const dueDiligenceData = await fetchDueDiligenceData();
    const criticalityData = await fetchCriticalityData();

    const container = document.getElementById('due-diligence-container');
    container.innerHTML = '';

    vendors.forEach((vendor, index) => {
        const vendorDiv = document.createElement('div');
        vendorDiv.classList.add('vendor-item');

        const vendorCriticality = criticalityData[vendor] || 'medium';
        const isHighCriticality = vendorCriticality === 'high';

        vendorDiv.innerHTML = `
            <h3>${vendor}</h3>
            <button onclick="toggleVendorInfo(${index})" id="toggle-button-${index}">Show Vendor Due Diligence Information</button>
            <div class="vendor-info" id="vendor-info-${index}" style="display: none;">
                <div class="question-group">
                    <label for="risk-reduction-${vendor}">What has been done to reduce risks before entering into this vendor relationship?</label>
                    <textarea id="risk-reduction-${vendor}">${dueDiligenceData[vendor]?.riskReduction || ''}</textarea>
                </div>
                <div class="question-group">
                    <label for="risks-posed-${vendor}">What risks are posed by this vendor, including from products or services offered by this vendor?</label>
                    <textarea id="risks-posed-${vendor}">${dueDiligenceData[vendor]?.risksPosed || ''}</textarea>
                </div>
                <div class="question-group">
                    <label for="evidence-of-compliance-${vendor}">What evidence of compliance is there for this vendor?</label>
                    <textarea id="evidence-of-compliance-${vendor}">${dueDiligenceData[vendor]?.evidenceOfCompliance || ''}</textarea>
                </div>
                <div class="question-group">
                    <label for="contingency-plan-${vendor}">What's your plan if this vendor unexpectedly has issues delivering agreed goods or services?</label>
                    <textarea id="contingency-plan-${vendor}">${dueDiligenceData[vendor]?.contingencyPlan || ''}</textarea>
                </div>
                <div class="question-group">
                    <label for="other-due-diligence-${vendor}">Other Due Diligence Information</label>
                    <textarea id="other-due-diligence-${vendor}">${dueDiligenceData[vendor]?.otherDueDiligence || ''}</textarea>
                </div>

                <div class="high-criticality-group" id="high-criticality-${vendor}" style="${isHighCriticality ? 'display: block;' : 'display: none;'}">
                    <h4>High Criticality Vendor Questions</h4>
                    <div class="question-group">
                        <label for="monitoring-frequency-${vendor}">How often do you plan to ensure that this critical vendor is fulfilling contractual obligations?</label>
                        <textarea id="monitoring-frequency-${vendor}">${dueDiligenceData[vendor]?.monitoringFrequency || ''}</textarea>
                    </div>
                    <div class="question-group">
                        <label for="monitoring-process-${vendor}">Describe the process you plan to take to monitor this vendor.</label>
                        <textarea id="monitoring-process-${vendor}">${dueDiligenceData[vendor]?.monitoringProcess || ''}</textarea>
                    </div>
                    <div class="question-group">
                        <label for="review-frequency-${vendor}">How often do you plan to review if this vendor is critical to your company or not?</label>
                        <textarea id="review-frequency-${vendor}">${dueDiligenceData[vendor]?.reviewFrequency || ''}</textarea>
                    </div>
                </div>

                <div class="vendor-buttons">
                    <button onclick="saveDueDiligence('${vendor}')">Save</button>
                </div>
            </div>
        `;

        container.appendChild(vendorDiv);
    });
}

function toggleVendorInfo(index) {
    const infoDiv = document.getElementById(`vendor-info-${index}`);
    const toggleButton = document.getElementById(`toggle-button-${index}`);

    if (infoDiv.style.display === 'none' || !infoDiv.style.display) {
        infoDiv.style.display = 'block';
        toggleButton.innerText = 'Hide Vendor Due Diligence Information';
    } else {
        infoDiv.style.display = 'none';
        toggleButton.innerText = 'Show Vendor Due Diligence Information';
    }
}

async function fetchVendors() {
    const response = await fetch('/vendors-criticality-diagram-data');
    const data = await response.json();
    return Object.keys(data.criticalityDiagram);
}

async function fetchDueDiligenceData() {
    const response = await fetch('/due-diligence-data');
    const data = await response.json();
    return data.dueDiligence || {};
}

async function fetchCriticalityData() {
    const response = await fetch('/vendors-criticality-diagram-data');
    const data = await response.json();
    return data.criticalityDiagram || {};
}

async function saveDueDiligence(vendor) {
    const dueDiligenceData = {
        riskReduction: document.getElementById(`risk-reduction-${vendor}`).value,
        risksPosed: document.getElementById(`risks-posed-${vendor}`).value,
        evidenceOfCompliance: document.getElementById(`evidence-of-compliance-${vendor}`).value,
        contingencyPlan: document.getElementById(`contingency-plan-${vendor}`).value,
        otherDueDiligence: document.getElementById(`other-due-diligence-${vendor}`).value,
        monitoringFrequency: document.getElementById(`monitoring-frequency-${vendor}`)?.value || '',
        monitoringProcess: document.getElementById(`monitoring-process-${vendor}`)?.value || '',
        reviewFrequency: document.getElementById(`review-frequency-${vendor}`)?.value || '',
    };

    const response = await fetch('/save-due-diligence', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vendor, dueDiligence: dueDiligenceData })
    });

    if (response.ok) {
        alert('Due Diligence information saved successfully!');
    } else {
        alert('Failed to save Due Diligence information.');
    }
}
