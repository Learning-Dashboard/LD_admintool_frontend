import React, { useState } from 'react';
import ImportProject from '../Projects/ImportProject/ImportProject';
import ImportData from './ImportData';
import AdministrateCategories from '../Categories/AdministrateCategories';
import ManageSubjectCategories from '../Categories/ManageSubjectCategories';
import WizardImportCategories from './WizardImportCategories';
import './Wizard.css';

const Wizard = () => {
    const [currentStep, setCurrentStep] = useState(1);

    const steps = [
        { title: 'Import Projects', component: <ImportProject onBack={() => { }} /> },
        { title: 'Import Data', component: <ImportData onNext={() => setCurrentStep(prev => prev + 1)} onBack={() => setCurrentStep(prev => prev - 1)} /> },
        { title: 'Import Categories', component: <WizardImportCategories onNext={() => setCurrentStep(prev => prev + 1)} onBack={() => setCurrentStep(prev => prev - 1)} /> },
        { title: 'Assign Categories', component: <AdministrateCategories onBack={() => setCurrentStep(prev => prev - 1)} /> }
    ];

    return (
        <div className="wizard-container">
            <div className="wizard-stepper">
                {steps.map((step, index) => (
                    <div key={index} className={`step-indicator ${currentStep === index + 1 ? 'active' : ''} ${currentStep > index + 1 ? 'completed' : ''}`}>
                        {index + 1}. {step.title}
                    </div>
                ))}
            </div>

            <div className="wizard-content">
                {currentStep === 1 && (
                    <div className="wizard-step">
                        <ImportProject onBack={() => { }} onNextStep={() => setCurrentStep(2)} />
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
