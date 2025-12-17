import React, { useState, useEffect } from 'react';
import ImportProject from '../Projects/ImportProject/ImportProject';
import ImportData from './ImportData';
import AdministrateCategories from '../Categories/AdministrateCategories';
import WizardImportCategories from './WizardImportCategories';
import { llistarProjectes } from '../../services/ProjectService';
import { getMetricsByProject } from '../../services/MetricsService';
import './Wizard.css';

const Wizard = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [hasProjects, setHasProjects] = useState(false);
    const [hasData, setHasData] = useState(false);

    // Initial check and check when entering steps
    useEffect(() => {
        checkPrerequisites();
    }, [currentStep]);

    const checkPrerequisites = async () => {
        let projectsExist = false;
        let dataExists = false;
        try {
            // 1. Check Projects
            const projects = await llistarProjectes();
            projectsExist = projects && projects.length > 0;
            setHasProjects(projectsExist);

            // 2. Check Data (Metrics) if projects exist
            if (projectsExist) {
                // Check the first project as a proxy
                const firstProject = projects[0];
                const projectId = firstProject.externalId;
                if (projectId) {
                    const metricsResponse = await getMetricsByProject(projectId);
                    // Axios response.data contains the list
                    if (metricsResponse.data && metricsResponse.data.length > 0) {
                        dataExists = true;
                    }
                }
            }
            setHasData(dataExists);

        } catch (error) {
            console.error("Error checking prerequisites:", error);
            setHasProjects(false);
            setHasData(false);
        }
        return { projectsExist, dataExists };
    };

    const steps = [
        { title: 'Import Projects' },
        { title: 'Import Data' },
        { title: 'Import Categories' },
        { title: 'Assign Categories' }
    ];

    // Check if we can navigate to a specific step
    const canNavigateToStep = (stepNumber) => {
        // Step 1 is always accessible
        if (stepNumber === 1) return true;

        // Step 2 (Import Data) requires teams in BD
        if (stepNumber === 2) {
            return hasProjects;
        }

        // Steps 3 (Import Categories) is always accessible (categories can be imported anytime)
        if (stepNumber === 3) return true;

        // Step 4 (Assign Categories) requires projects AND data (metrics)
        if (stepNumber === 4) {
            return hasProjects && hasData;
        }

        return true;
    };

    const handleStepClick = async (stepNumber) => {
        // Re-check before navigation to be sure
        const { projectsExist, dataExists } = await checkPrerequisites();

        // Step 1 is always accessible
        if (stepNumber === 1) {
            setCurrentStep(1);
            return;
        }

        if (stepNumber === 2) {
            if (projectsExist) {
                setCurrentStep(stepNumber);
            } else {
                alert('Please import projects first before accessing Import Data.');
            }
        } else if (stepNumber === 3) {
            setCurrentStep(3);
        } else if (stepNumber === 4) {
            if (projectsExist && dataExists) {
                setCurrentStep(stepNumber);
            } else {
                if (!projectsExist) alert('Please import projects first before accessing Assign Categories.');
                else alert('Please import data (Step 2) before accessing Assign Categories.');
            }
        }
    };

    return (
        <div className="wizard-container">
            <div className="wizard-stepper">
                {steps.map((step, index) => {
                    const stepNum = index + 1;
                    const isAccessible = canNavigateToStep(stepNum);
                    return (
                        <div
                            key={index}
                            className={`step-indicator ${currentStep === stepNum ? 'active' : ''} ${currentStep > stepNum ? 'completed' : ''} ${isAccessible ? 'clickable' : 'disabled'}`}
                            onClick={() => handleStepClick(stepNum)}
                            style={{ cursor: isAccessible ? 'pointer' : 'not-allowed', opacity: isAccessible ? 1 : 0.5 }}
                        >
                            {stepNum}. {step.title}
                        </div>
                    );
                })}
            </div>

            <div className="wizard-content">
                {currentStep === 1 && (
                    <div className="wizard-step">
                        <ImportProject onNextStep={() => handleStepClick(2)} />
                    </div>
                )}

                {currentStep === 2 && (
                    <ImportData onNext={() => handleStepClick(3)} onBack={() => handleStepClick(1)} />
                )}

                {currentStep === 3 && (
                    <WizardImportCategories onNext={() => handleStepClick(4)} onBack={() => handleStepClick(2)} />
                )}

                {currentStep === 4 && (
                    <div className="wizard-step">
                        <AdministrateCategories onBack={() => handleStepClick(3)} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wizard;
