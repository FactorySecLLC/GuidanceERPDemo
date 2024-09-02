document.addEventListener('DOMContentLoaded', function() {
    // Fetch and display the mission statement from the server
    fetch('/mission-data')
        .then(response => response.json())
        .then(data => {
            const missionOutput = document.getElementById('organizational-mission-output');
            if (missionOutput) {
                missionOutput.textContent = data.mission || 'No mission statement found.';
            }
        })
        .catch(error => {
            console.error('Error fetching the mission:', error);
        });

    // Fetch and display the stakeholder information for GV.OC-02 and GV.OC-04
    fetch('/stakeholders-data')
        .then(response => response.json())
        .then(data => {
            const internalExternalOutput = document.getElementById('internal-external-stakeholders-output');
            const criticalObjectivesOutput = document.getElementById('critical-objectives-output');

            if (internalExternalOutput) {
                const internalExternalHtml = data.stakeholders.map(stakeholder => `
                    <p>
                        <strong>Stakeholder Name:</strong> ${stakeholder.name}<br>
                        <strong>Email:</strong> ${stakeholder.email}<br>
                        <strong>Phone:</strong> ${stakeholder.phone}<br>
                        <strong>Type:</strong> ${stakeholder.type}<br>
                        <strong>Internal/External:</strong> ${stakeholder.internalExternal}<br>
                        <strong>Department:</strong> ${stakeholder.type === 'individual' ? stakeholder.department : 'N/A'}<br>
                        <strong>Title:</strong> ${stakeholder.type === 'individual' ? stakeholder.title : 'N/A'}<br>
                        <strong>Notes:</strong> ${stakeholder.notes}<br>
                        <strong>Expectations:</strong> ${stakeholder.expectations}<br>
                        <strong>Concerns:</strong> ${stakeholder.concerns}<br>
                        <strong>Support:</strong> ${stakeholder.support}
                    </p>
                `).join('');
                internalExternalOutput.innerHTML = internalExternalHtml || 'No stakeholders information found.';
            }

            if (criticalObjectivesOutput) {
                const criticalObjectivesHtml = data.stakeholders.map(stakeholder => `
                    <p>
                        <strong>Stakeholder Name:</strong> ${stakeholder.name}<br>
                        <strong>Objectives:</strong> ${stakeholder.objectives}<br>
                        <strong>Capabilities:</strong> ${stakeholder.capabilities}<br>
                        <strong>Services:</strong> ${stakeholder.services}
                    </p>
                `).join('');
                criticalObjectivesOutput.innerHTML = criticalObjectivesHtml || 'No critical objectives information found.';
            }
        })
        .catch(error => {
            console.error('Error fetching the stakeholders:', error);
        });

    // Fetch and display the legal requirements for GV.OC-03
    fetch('/legal-requirements-data')
        .then(response => response.json())
        .then(data => {
            const legalRequirementsOutput = document.getElementById('legal-requirements-output');

            if (legalRequirementsOutput) {
                const legalRequirementsHtml = data.requirements.map(requirement => `
                    <p>
                        <strong>Law/Regulation/Contract:</strong> ${requirement.name}<br>
                        <strong>Description:</strong> ${requirement.description}<br>
                        <strong>Notes:</strong> ${requirement.notes}<br>
                        <strong>Responsible Department:</strong> ${requirement.department}<br>
                        <strong>Links:</strong> ${requirement.links.map(link => `<a href="${link.url}" target="_blank">${link.url}</a>`).join(', ')}<br>
                        <strong>Related Contacts:</strong> ${requirement.contacts.map(contact => `${contact.name} - ${contact.email}`).join(', ')}
                    </p>
                `).join('');
                legalRequirementsOutput.innerHTML = legalRequirementsHtml || 'No legal requirements found.';
            }
        })
        .catch(error => {
            console.error('Error fetching the legal requirements:', error);
        });

    // Fetch and display the organizational dependencies data for GV.OC-05
    fetch('/dependencies-data')
        .then(response => response.json())
        .then(data => {
            const dependenciesOutput = document.getElementById('dependencies-output');
            if (dependenciesOutput) {
                const dependenciesHtml = data.dependencies.map(dependency => `
                    <p>
                        <strong>Resource Name:</strong> ${dependency.name}<br>
                        <strong>Business Function:</strong> ${dependency.function}<br>
                        <strong>Critical Point of Failure:</strong> ${dependency.critical}<br>
                        <strong>Contact Name:</strong> ${dependency.contact.name}<br>
                        <strong>Contact Email:</strong> ${dependency.contact.email}<br>
                        <strong>Contact Department:</strong> ${dependency.contact.department}<br>
                        <strong>Contact Title:</strong> ${dependency.contact.title}<br>
                        <strong>Contact Relevance:</strong> ${dependency.contact.relevance}<br>
                        <strong>Stakeholder Name:</strong> ${dependency.stakeholder.name}<br>
                        <strong>Stakeholder Email:</strong> ${dependency.stakeholder.email}<br>
                        <strong>Stakeholder Department:</strong> ${dependency.stakeholder.department}<br>
                        <strong>Stakeholder Title:</strong> ${dependency.stakeholder.title}<br>
                        <strong>Stakeholder Relevance:</strong> ${dependency.stakeholder.relevance}<br>
                        <strong>Report Frequency:</strong> ${dependency.report.frequency}<br>
                        <strong>Report Channel:</strong> ${dependency.report.channel}<br>
                        <strong>Report Topics:</strong> ${dependency.report.topics}<br>
                        <strong>Communicator Name:</strong> ${dependency.report.communicator.name}<br>
                        <strong>Communicator Email:</strong> ${dependency.report.communicator.email}<br>
                        <strong>Communicator Department:</strong> ${dependency.report.communicator.department}<br>
                        <strong>Communicator Title:</strong> ${dependency.report.communicator.title}<br>
                        <strong>Emergency Procedure:</strong> ${dependency.emergencyProcedure}
                    </p>
                `).join('');
                dependenciesOutput.innerHTML = dependenciesHtml || 'No dependencies information found.';
            }
        })
        .catch(error => {
            console.error('Error fetching the dependencies:', error);
        });

    // Fetch and display the risk management objectives for GV.RM-01
    fetch('/objectives-data')
        .then(response => response.json())
        .then(data => {
            const riskManagementObjectivesOutput = document.getElementById('risk-management-objectives-output');
            if (riskManagementObjectivesOutput) {
                const objectivesHtml = data.objectives.map(objective => `
                    <p>
                        <strong>Objective Description:</strong> ${objective.objectiveDescription}<br>
                        <strong>Objective Type:</strong> ${objective.objectiveType}<br>
                        <strong>Stakeholders:</strong> ${objective.stakeholders}<br>
                        <strong>Review Frequency:</strong> ${objective.reviewFrequency}<br>
                        <strong>Integration with Planning:</strong> ${objective.integrationPlanning}<br>
                        <strong>Performance Measures:</strong> ${objective.performanceMeasures}<br>
                        <strong>Current Status:</strong> ${objective.currentStatus}<br>
                        <strong>Status Date:</strong> ${objective.statusDate}<br>
                        <strong>Responsible Person:</strong> ${objective.responsiblePerson}<br>
                        <strong>Related Policies and Procedures:</strong> ${objective.relatedPolicies}<br>
                        <strong>Relevant Standards and Guidelines:</strong> ${objective.relevantStandards}<br>
                        <strong>Leadership Review and Approval:</strong> ${objective.leadershipReview}<br>
                        <strong>Additional Notes and Comments:</strong> ${objective.additionalNotes}
                    </p>
                `).join('');
                riskManagementObjectivesOutput.innerHTML = objectivesHtml || 'No risk management objectives found.';
            }
        })
        .catch(error => {
            console.error('Error fetching the risk management objectives:', error);
        });

    // Fetch and display the risk appetite data for GV.RM-02
    fetch('/risks-data')
        .then(response => response.json())
        .then(data => {
            const riskAppetiteOutput = document.getElementById('risk-appetite-output');
            if (riskAppetiteOutput) {
                const riskAppetiteHtml = data.risks.map(risk => `
                    <p>
                        <strong>Overall Risk Appetite:</strong> ${risk.overallRiskAppetite}<br>
                        <strong>Financial Impact:</strong> $${risk.financialImpact}<br>
                        <strong>Financial Rationale:</strong> ${risk.financialRationale}<br>
                        <strong>Operational Impact:</strong> ${risk.operationalImpact}<br>
                        <strong>Operational Rationale:</strong> ${risk.operationalRationale}<br>
                        <strong>Reputational Impact:</strong> ${risk.reputationalImpact}<br>
                        <strong>Reputational Rationale:</strong> ${risk.reputationalRationale}<br>
                        <strong>Regulatory Impact:</strong> $${risk.regulatoryImpact}<br>
                        <strong>Regulatory Rationale:</strong> ${risk.regulatoryRationale}
                    </p>
                `).join('');
                riskAppetiteOutput.innerHTML = riskAppetiteHtml || 'No risk appetite information found.';
            }
        })
        .catch(error => {
            console.error('Error fetching the risk appetite data:', error);
        });

    // Fetch and display the strategic direction data for GV.RM-03
    fetch('/strategic-direction-data')
        .then(response => response.json())
        .then(data => {
            const strategicDirectionOutput = document.getElementById('strategic-direction-output');
            if (strategicDirectionOutput) {
                const strategicDirectionHtml = data.directions.map(direction => `
                    <p>
                        <strong>Main Types of Data:</strong> ${direction.dataTypes} <br>
                        <strong>Risk Decisions:</strong> ${direction.riskDecisions} <br>
                        <strong>Risk Comfort:</strong> ${direction.riskComfort} <br>
                        <strong>Always Protect:</strong> ${direction.protectData} <br>
                        <strong>Insurance Need:</strong> ${direction.insuranceNeed} <br>
                        <strong>Insurance Use:</strong> ${direction.insuranceUse} <br>
                        <strong>Policy Look:</strong> ${direction.policyLook} <br>
                        <strong>Policy Concerns:</strong> ${direction.policyConcerns} <br>
                        <strong>Responsibilities:</strong> ${direction.responsibilities} <br>
                        <strong>Decide Okay:</strong> ${direction.decideOkay} <br>
                        <strong>Roles Understand:</strong> ${direction.rolesUnderstand} <br>
                        <strong>Shared Examples:</strong> ${direction.sharedExamples} <br>
                        <strong>Following Standards:</strong> ${direction.followingStandards} <br>
                        <strong>Checks:</strong> ${direction.checks}
                    </p>
                `).join('');
                strategicDirectionOutput.innerHTML = strategicDirectionHtml || 'No strategic direction information found.';
            }
        })
        .catch(error => {
            console.error('Error fetching the strategic direction data:', error);
        });

    // Fetch and display the cybersecurity risk management data for GV.RM-04
    fetch('/cybersecurity-risk-management-data')
        .then(response => response.json())
        .then(data => {
            const outputElement = document.getElementById('cybersecurity-risk-management-output');
            outputElement.innerHTML = '';

            if (data && data.entries) {
                data.entries.forEach(entry => {
                    const entryElement = document.createElement('div');
                    entryElement.classList.add('entry');

                    entryElement.innerHTML = `
                        <p>
                        <strong>Overview:</strong> ${entry.overview}<br>
                        <strong>Areas of Business Affected:</strong> ${entry.businessAreas}<br>
                        <strong>Finding Risks:</strong> ${entry.findingRisks}<br>
                        <strong>Key People:</strong> ${entry.keyPeople}<br>
                        <strong>Handling Risks:</strong> ${entry.handlingRisks}<br>
                        <strong>Compliance:</strong> ${entry.compliance}<br>
                        <strong>Documenting:</strong> ${entry.documenting}<br>
                        <strong>Resources:</strong> ${entry.resources}
                        </p>
                    `;

                    outputElement.appendChild(entryElement);
                });
            } else {
                outputElement.innerText = 'No cybersecurity risk management data found.';
            }
        })
        .catch(error => {
            console.error('Error fetching cybersecurity risk management data:', error);
            const outputElement = document.getElementById('cybersecurity-risk-management-output');
            outputElement.innerText = 'Failed to load cybersecurity risk management data.';
        });

    // Fetch and display the leadership accountability and risk culture data for GV.RR-01
    fetch('/leadership-accountability-and-risk-culture-data')
        .then(response => response.json())
        .then(data => {
            const leadershipData = data.leadership || [];
            const gvRR01Output = document.getElementById('gv-rr-01-output');

            if (leadershipData.length > 0) {
                const leadershipHtml = leadershipData.map(leader => `
                    <p>
                        <strong>Roles and Responsibilities Agreement:</strong> ${leader.rolesResponsibilitiesAgreement}<br>
                        <strong>Roles and Responsibilities Review Frequency:</strong> ${leader.rolesResponsibilitiesReviewFrequency}<br>
                        <strong>Secure Ethical Culture Communication:</strong> ${leader.secureEthicalCultureCommunication}<br>
                        <strong>Cybersecurity Risk Examples:</strong> ${leader.cybersecurityRiskExamples}<br>
                        <strong>Risk Strategy Management:</strong> ${leader.riskStrategyManagement}<br>
                        <strong>Risk Strategy Review Process:</strong> ${leader.riskStrategyReviewProcess}<br>
                        <strong>Review Coordination Process:</strong> ${leader.reviewCoordinationProcess}<br>
                        <strong>Review Frequency Criteria:</strong> ${leader.reviewFrequencyCriteria}
                    </p>
                `).join('');
                gvRR01Output.innerHTML = leadershipHtml;
            } else {
                gvRR01Output.innerText = 'No leadership accountability and risk culture data found.';
            }
        })
        .catch(error => {
            console.error('Error fetching leadership accountability and risk culture data:', error);
        });

    // Fetch and display the defined cybersecurity roles data for GV.RR-02
    fetch('/defined-cybersecurity-roles-data')
        .then(response => response.json())
        .then(data => {
            const gvRR02Output = document.getElementById('gv-rr-02-output');
            if (gvRR02Output) {
                const rolesHtml = data.roles.map(role => `
                    <p>
                        <strong>Roles and Responsibilities Agreement:</strong> ${role.rolesResponsibilitiesAgreement}<br>
                        <strong>Roles and Responsibilities Review Frequency:</strong> ${role.rolesResponsibilitiesReviewFrequency}<br>
                        <strong>Secure Ethical Culture Communication:</strong> ${role.secureEthicalCultureCommunication}<br>
                        <strong>Cybersecurity Risk Examples:</strong> ${role.cybersecurityRiskExamples}<br>
                        <strong>Risk Strategy Management:</strong> ${role.riskStrategyManagement}<br>
                        <strong>Risk Strategy Review Process:</strong> ${role.riskStrategyReviewProcess}<br>
                        <strong>Review Coordination Process:</strong> ${role.reviewCoordinationProcess}<br>
                        <strong>Review Frequency Criteria:</strong> ${role.reviewFrequencyCriteria}
                    </p>
                `).join('');
                gvRR02Output.innerHTML = rolesHtml || 'No roles, responsibilities, and authorities data found.';
            }
        })
        .catch(error => {
            console.error('Error fetching the defined cybersecurity roles:', error);
            const gvRR02Output = document.getElementById('gv-rr-02-output');
            gvRR02Output.innerText = 'Failed to load roles, responsibilities, and authorities data.';
        });

    // Fetch and display the resource allocation data for GV.RR-03
    fetch('/resource-allocation-data')
        .then(response => response.json())
        .then(data => {
            const resourceAllocationOutput = document.getElementById('resource-allocation-output');
            if (resourceAllocationOutput) {
                const allocationHtml = data.allocations.map(allocation => `
                    <p>
                        <strong>Review Meetings:</strong> ${allocation.reviewMeetings}<br>
                        <strong>Authority Checks:</strong> ${allocation.authorityChecks}<br>
                        <strong>Risk Resources:</strong> ${allocation.riskResources}<br>
                        <strong>Budget Allocation:</strong> ${allocation.budgetAllocation}<br>
                        <strong>Support People:</strong> ${allocation.supportPeople}<br>
                        <strong>Technical Investments:</strong> ${allocation.technicalInvestments}
                    </p>
                `).join('');
                resourceAllocationOutput.innerHTML = allocationHtml || 'No resource allocation information found.';
            }
        })
        .catch(error => {
            console.error('Error fetching the resource allocation data:', error);
            const resourceAllocationOutput = document.getElementById('resource-allocation-output');
            resourceAllocationOutput.textContent = 'Failed to load resource allocation data.';
        });

    // Fetch and display the cybersecurity HR practices for GV.RR-04
    fetch('/cybersecurity-hr-data')
        .then(response => response.json())
        .then(data => {
            const cybersecurityHROutput = document.getElementById('cybersecurity-hr-output');
            if (cybersecurityHROutput) {
                const hrPracticesHtml = data.hrPractices.map(practice => `
                    <p>
                        <strong>Check Cybersecurity Knowledge:</strong> ${practice.checkCybersecurityKnowledge}<br>
                        <strong>Onboarding Training:</strong> ${practice.onboardingTraining}<br>
                        <strong>Notify Changes:</strong> ${practice.notifyChanges}<br>
                        <strong>Revoke Access:</strong> ${practice.revokeAccess}<br>
                        <strong>Prefer Cybersecurity Knowledge:</strong> ${practice.preferCybersecurityKnowledge}<br>
                        <strong>Ongoing Training:</strong> ${practice.ongoingTraining}<br>
                        <strong>Consider Knowledge:</strong> ${practice.considerKnowledge}<br>
                        <strong>Background Checks:</strong> ${practice.backgroundChecks}<br>
                        <strong>Repeat Checks:</strong> ${practice.repeatChecks}<br>
                        <strong>Aware Policies:</strong> ${practice.awarePolicies}<br>
                        <strong>Enforce Policies:</strong> ${practice.enforcePolicies}
                    </p>
                `).join('');
                cybersecurityHROutput.innerHTML = hrPracticesHtml || 'No cybersecurity HR practices data found.';
            }
        })
        .catch(error => {
            console.error('Error fetching the cybersecurity HR practices:', error);
        });
});

function savePage() {
    const reportContainer = document.querySelector('.report-container').cloneNode(true);
    const actionButtons = reportContainer.querySelector('.action-buttons');
    if (actionButtons) {
        reportContainer.removeChild(actionButtons);
    }
    const pageContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Govern Report</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    background-color: #ffffff !important;
                }
                .report-container {
                    width: 80%;
                    margin: auto;
                    padding: 20px;
                    border: 1px solid #ccc;
                    background-color: #f9f9f9;
                }
                .report-header {
                    text-align: center;
                    margin-bottom: 40px;
                }
                .report-section {
                    margin-bottom: 30px;
                }
                .report-section h2 {
                    background-color: #333;
                    color: #fff;
                    padding: 10px;
                }
                .report-subsection {
                    margin-bottom: 20px;
                }
                .report-subsection h3 {
                    background-color: #555;
                    color: #fff;
                    padding: 8px;
                }
                .report-subsection p {
                    padding: 5px 10px;
                    background-color: #f1f1f1;
                    border-left: 4px solid #333;
                    margin: 0 0 10px 0;
                }
                .action-buttons {
                    display: none;
                }
                @media print {
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        background-color: #ffffff !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .report-container {
                        width: 100%;
                        margin: 0;
                        padding: 20px;
                        border: none;
                        background-color: #f9f9f9 !important;
                    }
                    .report-header {
                        text-align: center;
                        margin-bottom: 40px;
                    }
                    .report-section {
                        margin-bottom: 30px;
                    }
                    .report-section h2 {
                        background-color: #333 !important;
                        color: #fff !important;
                        padding: 10px !important;
                    }
                    .report-subsection {
                        margin-bottom: 20px;
                    }
                    .report-subsection h3 {
                        background-color: #555 !important;
                        color: #fff !important;
                        padding: 8px !important;
                    }
                    .report-subsection p {
                        padding: 5px 10px !important;
                        background-color: #f1f1f1 !important;
                        border-left: 4px solid #333 !important;
                        margin: 0 0 10px 0 !important;
                    }
                    .action-buttons {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="report-container">
                ${reportContainer.innerHTML}
            </div>
        </body>
        </html>
    `;
    const blob = new Blob([pageContent], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Govern_Report.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Function to load GV.RM-05 data
function loadGVRM05Data() {
    // Load Executive Updates
    fetch('/executive-updates-data')
        .then(response => response.json())
        .then(data => {
            const listContainer = document.getElementById('saved-executive-updates-list');
            if (data && data.executiveUpdates) {
                listContainer.innerHTML = `
                    <h4>Executive Updates</h4>
                    <ol>
                        ${data.executiveUpdates.map((update, index) => `
                            <li class="item">
                                <div>
                                    <strong>Update ${index + 1}:</strong><br>
                                    <strong>Frequency of Updates:</strong> ${update.frequency}<br>
                                    <strong>Responsible Person/Role:</strong> ${update.responsible}<br>
                                    <strong>Content of Updates:</strong> ${update.content}<br>
                                    <strong>Distribution Method:</strong> ${update.distribution}<br>
                                    ${update.distribution === 'email' ? `<strong>Email addresses:</strong> ${update.emailAddresses}<br>` : ''}
                                    ${update.distribution === 'meetings' ? `<strong>Meeting Details:</strong> ${update.meetingDetails}<br>` : ''}
                                    ${update.distribution === 'printed report' ? `<strong>Physical Report Delivery Details:</strong> ${update.reportDelivery}<br>` : ''}
                                </div>
                            </li>
                        `).join('')}
                    </ol>
                `;
            } else {
                listContainer.innerHTML = '<h4>Executive Updates</h4><p>No executive updates found.</p>';
            }
        })
        .catch(error => console.error('Error fetching executive updates:', error));

    // Load Departmental Communication
    fetch('/departmental-communication-data')
    .then(response => response.json())
    .then(data => {
        const listContainer = document.getElementById('saved-departments-list');
        if (data && data.updates && data.updates.length > 0) {
            listContainer.innerHTML = `
                <h4>Departments</h4>
                <ol>
                    ${data.updates.map((department, index) => `
                        <li class="item">
                            <div>
                                <strong>Department ${index + 1}:</strong><br>
                                <strong>Department Name:</strong> ${department.name}<br>
                                <strong>Primary Contact Person:</strong> ${department.primaryContact}<br>
                                <strong>Contact Email:</strong> ${department.email}<br>
                                <strong>Contact Phone:</strong> ${department.phone}<br>
                                <strong>Communication Frequency:</strong> ${department.communicationFrequency}<br>
                                <strong>Responsible Role/Person:</strong> ${department.responsible}<br>
                                <strong>Communication Methods:</strong> ${department.communicationMethods}<br>
                                <strong>Content of Communication:</strong> ${department.content}<br>
                                <strong>Documentation Location:</strong> ${department.documentationLocation}<br>
                                <strong>Inter-departmental Frequency:</strong> ${department.interDepartmentalFrequency}<br>
                                <strong>Departments Communicated With:</strong> ${department.departmentsCommunicatedWith}<br>
                                <strong>Responsible Role/Person for Inter-departmental Communication:</strong> ${department.responsibleInterDepartment}<br>
                                <strong>Inter-departmental Communication Methods:</strong> ${department.communicationMethodsInterDepartment}<br>
                                <strong>Content of Inter-departmental Communication:</strong> ${department.contentInterDepartment}<br>
                                <strong>Inter-departmental Documentation Location:</strong> ${department.documentationLocationInterDepartment}
                            </div>
                        </li>
                    `).join('')}
                </ol>
            `;
        } else {
            listContainer.innerHTML = '<h4>Departments</h4><p>No departments found.</p>';
        }
    })
    .catch(error => console.error('Error fetching departments:', error));


    // Load Communication Tools
    fetch('/communication-tools-data')
        .then(response => response.json())
        .then(data => {
            const listContainer = document.getElementById('saved-tools-list');
            if (data && data.tools && data.tools.length > 0) {
                listContainer.innerHTML = `
                    <h4>Communication Tools</h4>
                    <ol>
                        ${data.tools.map((tool, index) => `
                            <li class="item">
                                <div>
                                    <strong>Tool ${index + 1}:</strong><br>
                                    <strong>Communication Tool Name:</strong> ${tool.internalTools}<br>
                                    <strong>Communication Tool Details:</strong> ${tool.toolDetails}<br>
                                </div>
                            </li>
                        `).join('')}
                    </ol>
                `;
            } else {
                listContainer.innerHTML = '<h4>Communication Tools</h4><p>No tools found.</p>';
            }
        })
        .catch(error => console.error('Error fetching tools:', error));
}

// Load GV.RM-05 data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadGVRM05Data();
});

document.addEventListener('DOMContentLoaded', function() {
    // Fetch and display the standardized risk methods for GV.RM-06
    fetch('/standardized-risk-methods-data')
        .then(response => response.json())
        .then(data => {
            const standardizedRiskMethodsOutput = document.getElementById('standardized-risk-methods-output');
            if (standardizedRiskMethodsOutput) {
                standardizedRiskMethodsOutput.textContent = data.methods || 'No standardized methods found.';
            }
        })
        .catch(error => {
            console.error('Error fetching the standardized risk methods:', error);
            const standardizedRiskMethodsOutput = document.getElementById('standardized-risk-methods-output');
            standardizedRiskMethodsOutput.textContent = 'Failed to load standardized methods.';
        });
});

document.addEventListener('DOMContentLoaded', function() {
    // Fetch and display the strategic opportunities for GV.RM-07
    fetch('/strategic-opportunities-data')
        .then(response => response.json())
        .then(data => {
            const strategicOpportunitiesOutput = document.getElementById('strategic-opportunities-output');
            if (strategicOpportunitiesOutput) {
                const opportunitiesHtml = data.opportunities.map(opportunity => `
                    <p>
                        <strong>Methods and Frameworks:</strong> ${opportunity.methodsFrameworks}<br>
                        <strong>Examples of Opportunities:</strong> ${opportunity.examplesOpportunities}<br>
                        <strong>Guidance Communication:</strong> ${opportunity.guidanceCommunication}<br>
                        <strong>Responsible Guidance:</strong> ${opportunity.responsibleGuidance}<br>
                        <strong>Stretch Goals:</strong> ${opportunity.stretchGoals}<br>
                        <strong>Risk Prioritization:</strong> ${opportunity.riskPrioritization}<br>
                        <strong>Examples of Positive Risks:</strong> ${opportunity.examplesPositiveRisks}<br>
                        <strong>Documentation and Review:</strong> ${opportunity.documentationReview}
                    </p>
                `).join('');
                strategicOpportunitiesOutput.innerHTML = opportunitiesHtml || 'No strategic opportunities information found.';
            }
        })
        .catch(error => {
            console.error('Error fetching the strategic opportunities:', error);
            const strategicOpportunitiesOutput = document.getElementById('strategic-opportunities-output');
            strategicOpportunitiesOutput.textContent = 'Failed to load strategic opportunities.';
        });
});

document.addEventListener('DOMContentLoaded', function() {
    // Fetch and display the compliance oversight data for GV.OV-01
    fetch('/compliance-oversight-data')
        .then(response => response.json())
        .then(data => {
            const outputElement = document.getElementById('gv-ov-01-output');
            if (outputElement) {
                const oversightHtml = data.complianceOversightData.map(item => `
                    <p>
                        <strong>Effectiveness of Strategy for Decision-Making:</strong> ${item.q1}<br>
                        <strong>Strategy Outcomes Supporting Objectives:</strong> ${item.q2}<br>
                        <strong>Strategy Impediments:</strong> ${item.q3}<br>
                        <strong>Metrics for Measuring Effectiveness:</strong> ${item.q4}
                    </p>
                `).join('');
                outputElement.innerHTML = oversightHtml || 'No compliance and oversight data found.';
            }
        })
        .catch(error => {
            console.error('Error fetching compliance oversight data:', error);
            const outputElement = document.getElementById('gv-ov-01-output');
            outputElement.innerText = 'Failed to load compliance oversight data.';
        });

// Fetch and display the strategic risk management data for GV.OV-02
fetch('/strategic-risk-management-data')
    .then(response => response.json())
    .then(data => {
        const outputElement = document.getElementById('gv-ov-02-output');
        if (outputElement) {
            const riskHtml = data.reviews.map(review => `
                <p>
                    <strong>Audit-Identified Gaps:</strong> ${review.q1}<br>
                    <strong>Performance of Cybersecurity Roles:</strong> ${review.q2}<br>
                    <strong>Incidents Revealing Weaknesses:</strong> ${review.q3}<br>
                    <strong>Recommended Changes:</strong> ${review.q4}
                </p>
            `).join('');
            outputElement.innerHTML = riskHtml || 'No strategic risk management data found.';
        }
    })
    .catch(error => {
        console.error('Error fetching strategic risk management data:', error);
        const outputElement = document.getElementById('gv-ov-02-output');
        outputElement.innerText = 'Failed to load strategic risk management data.';
    });



    // Fetch and display the performance and metrics data for GV.OV-03
    fetch('/performance-metrics-data')
        .then(response => response.json())
        .then(data => {
            const outputElement = document.getElementById('gv-ov-03-output');
            if (outputElement) {
                const metricsHtml = data.performanceMetricsData.map(item => `
                    <p>
                        <strong>KPIs for Cybersecurity Risk Management:</strong> ${item.q1}<br>
                        <strong>Critical KRIs:</strong> ${item.q2}<br>
                        <strong>Evolution of KPIs and KRIs:</strong> ${item.q3}<br>
                        <strong>Communication of Performance Data:</strong> ${item.q4}
                    </p>
                `).join('');
                outputElement.innerHTML = metricsHtml || 'No performance metrics data found.';
            }
        })
        .catch(error => {
            console.error('Error fetching performance metrics data:', error);
            const outputElement = document.getElementById('gv-ov-03-output');
            outputElement.innerText = 'Failed to load performance metrics data.';
        });
});
// Fetch and display the cybersecurity policy data for GV.PO-01
fetch('/cybersecurity-policy-data')
    .then(response => response.json())
    .then(data => {
        const policyOutput = document.getElementById('cybersecurity-policy-output');
        if (policyOutput) {
            const policyHtml = data.policies.map(policy => `
                <p>
                    <strong>Understanding and Communication of Cybersecurity Policy</strong><br><br>
                    <strong>Simple Understanding:</strong> ${policy.simpleUnderstanding}<br>
                    <strong>Share Policy:</strong> ${policy.sharePolicy}<br><br>
                    <strong>Regular Review of Cybersecurity Policies</strong><br><br>
                    <strong>Review Process:</strong> ${policy.reviewProcess}<br>
                    <strong>Ensure Relevance:</strong> ${policy.ensureRelevance}<br><br>
                    <strong>Senior Management Approval</strong><br><br>
                    <strong>Management Approval:</strong> ${policy.managementApproval}<br>
                    <strong>Approval Documentation:</strong> ${policy.approvalDocumentation}<br><br>
                    <strong>Company-wide Communication</strong><br><br>
                    <strong>Inform Methods:</strong> ${policy.informMethods}<br>
                    <strong>Ensure Understanding:</strong> ${policy.ensureUnderstanding}<br><br>
                    <strong>Acknowledgment of Policy</strong><br><br>
                    <strong>New Employees:</strong> ${policy.newEmployees}<br>
                    <strong>Annual Acknowledgment:</strong> ${policy.annualAcknowledgment}
                </p>
            `).join('');
            policyOutput.innerHTML = policyHtml || 'No cybersecurity policy information found.';
        }
    })
    .catch(error => {
        console.error('Error fetching the cybersecurity policy data:', error);
        const policyOutput = document.getElementById('cybersecurity-policy-output');
        policyOutput.innerText = 'Failed to load cybersecurity policy data.';
    });
// Fetch and display the data for GV.PO-02 (Regularly Updated Cybersecurity Policy)
fetch('/regularly-updated-cybersecurity-policy-data')
    .then(response => response.json())
    .then(data => {
        const gvPO02Output = document.getElementById('gv-po-02-output');
        if (gvPO02Output) {
            const policiesHtml = data.policies.map(policy => `
                <p>
                    <strong>Periodic Policy Reviews</strong><br><br>
                    <strong>Check Update Frequency:</strong> ${policy.checkUpdateFrequency}<br>
                    <strong>Review Process Description:</strong> ${policy.reviewProcessDescription}<br><br>
                    <strong>Review Timeline and Communication</strong><br><br>
                    <strong>Review Schedule:</strong> ${policy.reviewSchedule}<br>
                    <strong>Communication Changes:</strong> ${policy.communicationChanges}<br><br>
                    <strong>Legal and Regulatory Updates</strong><br><br>
                    <strong>Legal Updates:</strong> ${policy.legalUpdates}<br>
                    <strong>Update Process for Legal Requirements:</strong> ${policy.updateProcessLegal}<br><br>
                    <strong>Technology and Business Changes</strong><br><br>
                    <strong>Technology and Business Updates:</strong> ${policy.techBusinessUpdates}<br>
                    <strong>Process Changes Due to Technological or Business Updates:</strong> ${policy.processChanges}
                </p>
            `).join('');
            gvPO02Output.innerHTML = policiesHtml || 'No policies found.';
        }
    })
    .catch(error => {
        console.error('Error fetching the regularly updated cybersecurity policy data:', error);
        const gvPO02Output = document.getElementById('gv-po-02-output');
        gvPO02Output.innerText = 'Failed to load regularly updated cybersecurity policy data.';
    });
