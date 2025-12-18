import React, { useState, useEffect } from 'react';
import ImportProject from '../Projects/ImportProject/ImportProject';
import ImportData from './ImportData';
import AdministrateCategories from '../Categories/AdministrateCategories';
import WizardImportCategories from './WizardImportCategories';
import { getWizardStatus } from '../../services/WizardService';
import './Wizard.css';

const Wizard = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [hasProjects, setHasProjects] = useState(false);
    const [hasData, setHasData] = useState(false);
    const [hasCategories, setHasCategories] = useState(false);

    // Initial check on mount
    useEffect(() => {
        checkPrerequisites();
    }, []);

    const checkPrerequisites = async () => {
        try {
            const status = await getWizardStatus();

            setHasProjects(status.hasProjects);
            setHasData(status.hasData);

            // All three types of categories must exist for Step 3 to be "completed"
            const categoriesExist = status.hasMetricsCategories &&
                status.hasFactorsCategories &&
                status.hasStrategicIndicatorCategories;
            setHasCategories(categoriesExist);

            return {
                projectsExist: status.hasProjects,
                dataExists: status.hasData,
                categoriesExist
            };
        } catch (error) {
            console.error("Error checking prerequisites:", error);
            return { projectsExist: hasProjects, dataExists: hasData, categoriesExist: hasCategories };
        }
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
        // Validation with potential fallback check
        if (stepNumber === 1) {
            setCurrentStep(1);
        } else if (stepNumber === 2) {
            if (hasProjects) setCurrentStep(2);
            else {
                const { projectsExist } = await checkPrerequisites();
                if (projectsExist) setCurrentStep(2);
                else alert('Please import projects first.');
            }
        } else if (stepNumber === 3) {
            setCurrentStep(3);
        } else if (stepNumber === 4) {
            if (hasProjects && hasData) {
                setCurrentStep(4);
            } else {
                // Fallback: maybe the data was just imported and state isn't updated yet
                const { projectsExist, dataExists } = await checkPrerequisites();
                if (projectsExist && dataExists) setCurrentStep(4);
                else if (!projectsExist) alert('Please import projects first.');
                else alert('Please import data (Step 2) first.');
            }
        }

        // Always trigger a background refresh for titles
        checkPrerequisites();
    };

    return (
        <div className="wizard-container">
            <div className="wizard-stepper">
                {steps.map((step, index) => {
                    const stepNum = index + 1;
                    const isAccessible = canNavigateToStep(stepNum);

                    // Determine completion based on actual data
                    let isCompleted = false;
                    if (stepNum === 1) isCompleted = hasProjects;
                    if (stepNum === 2) isCompleted = hasData;
                    if (stepNum === 3) isCompleted = hasCategories;
                    // Step 4 is the final step, no "completed" state needed beyond being on it? 
                    // Or maybe if some assignments exist? For now, we'll stick to 1, 2, 3.

                    return (
                        <div
                            key={index}
                            className={`step-indicator 
                                ${currentStep === stepNum ? 'active' : (isCompleted ? 'completed' : '')} 
                                ${isAccessible ? 'clickable' : 'disabled'}`}
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
                        <ImportProject
                            onNextStep={() => {
                                if (hasData && hasCategories) handleStepClick(4);
                                else if (hasData) handleStepClick(3);
                                else handleStepClick(2);
                            }}
                            onRefreshStatus={checkPrerequisites}
                        />
                    </div>
                )}

                {currentStep === 2 && (
                    <ImportData
                        onNext={() => {
                            if (hasCategories) handleStepClick(4);
                            else handleStepClick(3);
                        }}
                        onBack={() => handleStepClick(1)}
                        onRefreshStatus={checkPrerequisites}
                    />
                )}

                {currentStep === 3 && (
                    <WizardImportCategories
                        onNext={() => handleStepClick(4)}
                        onBack={() => {
                            if (hasProjects) handleStepClick(2);
                            else handleStepClick(1);
                        }}
                        onRefreshStatus={checkPrerequisites}
                    />
                )}

                {currentStep === 4 && (
                    <div className="wizard-step">
                        <AdministrateCategories
                            onBack={() => {
                                if (hasCategories) handleStepClick(3);
                                else handleStepClick(2);
                            }}
                            onRefreshStatus={checkPrerequisites}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wizard;
