import React, { useState } from 'react';
import ImportProject from '../Projects/ImportProject/ImportProject';
import ImportData from './ImportData';
import AdministrateCategories from '../Categories/AdministrateCategories';
import WizardImportCategories from './WizardImportCategories';
import './Wizard.css';

const Wizard = () => {
    const [currentStep, setCurrentStep] = useState(1);

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

        // Step 2 (Import Data) requires teams in localStorage
        if (stepNumber === 2) {
            const mapping = localStorage.getItem('subject_teams_mapping');
            return mapping && JSON.parse(mapping) && Object.keys(JSON.parse(mapping)).length > 0;
        }

        // Steps 3 and 4 are always accessible (categories can be imported anytime)
        return true;
    };

    const handleStepClick = (stepNumber) => {
        if (canNavigateToStep(stepNumber)) {
            setCurrentStep(stepNumber);
        } else {
            alert('Please import projects first before accessing Import Data.');
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
                        <ImportProject onNextStep={() => setCurrentStep(2)} />
                    </div>
                )}

                {currentStep === 2 && (
                    <ImportData onNext={() => setCurrentStep(3)} onBack={() => setCurrentStep(1)} />
                )}

                {currentStep === 3 && (
                    <WizardImportCategories onNext={() => setCurrentStep(4)} onBack={() => setCurrentStep(2)} />
                )}

                {currentStep === 4 && (
                    <div className="wizard-step">
                        <AdministrateCategories onBack={() => setCurrentStep(3)} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wizard;
