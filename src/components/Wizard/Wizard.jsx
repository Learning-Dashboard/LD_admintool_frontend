import React, { useState, useEffect, useCallback } from 'react';
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
    const [sessionCompletedSteps, setSessionCompletedSteps] = useState(new Set());

    const markStepAsCompleted = (stepNum) => {
        setSessionCompletedSteps(prev => new Set([...prev, stepNum]));
    };

    const checkPrerequisites = useCallback(async () => {
        try {
            const status = await getWizardStatus();
            setHasProjects(status.hasProjects);
            setHasData(status.hasData);
            setHasCategories(
                status.hasMetricsCategories &&
                status.hasFactorsCategories &&
                status.hasStrategicIndicatorCategories
            );
        } catch (error) {
            console.error('Error checking prerequisites:', error);
        }
    }, []);

    useEffect(() => {
        checkPrerequisites();
    }, [checkPrerequisites]);

    const steps = [
        { title: 'Import Projects' },
        { title: 'Import Data' },
        { title: 'Import Categories' },
        { title: 'Assign Categories' }
    ];

    const canNavigateToStep = (stepNum) => {
        if (stepNum === 1) return true;
        if (stepNum === 2) return hasProjects;
        if (stepNum === 3) return hasProjects;
        if (stepNum === 4) return hasProjects && hasData && hasCategories;
        return false;
    };

    const handleStepClick = async (stepNum) => {
        if (canNavigateToStep(stepNum)) {
            setCurrentStep(stepNum);
        } else {
            const status = await getWizardStatus();
            const projectsExist = status.hasProjects;
            const dataExists = status.hasData;
            const catsExist = status.hasMetricsCategories && status.hasFactorsCategories && status.hasStrategicIndicatorCategories;

            if (stepNum === 2 || stepNum === 3) {
                if (!projectsExist) alert('Please import projects first.');
            } else if (stepNum === 4) {
                if (!catsExist) alert('Please import categories (Step 3) first.');
                else if (!projectsExist) alert('Please import projects first.');
                else alert('Please import data (Step 2) first.');
            }
        }
        checkPrerequisites();
    };

    return (
        <div className="wizard-container">
            <div className="wizard-stepper">
                {steps.map((step, index) => {
                    const stepNum = index + 1;
                    const isAccessible = canNavigateToStep(stepNum);
                    const isCompleted = sessionCompletedSteps.has(stepNum);

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
                            onNextStep={() => handleStepClick(2)}
                            onRefreshStatus={checkPrerequisites}
                            onCompleted={() => markStepAsCompleted(1)}
                        />
                    </div>
                )}
                {currentStep === 2 && (
                    <div className="wizard-step">
                        <ImportData
                            onNextStep={() => handleStepClick(3)}
                            onRefreshStatus={checkPrerequisites}
                            onCompleted={() => markStepAsCompleted(2)}
                        />
                    </div>
                )}
                {currentStep === 3 && (
                    <div className="wizard-step">
                        <WizardImportCategories
                            onNext={() => handleStepClick(4)}
                            onRefreshStatus={checkPrerequisites}
                            onCompleted={() => markStepAsCompleted(3)}
                        />
                    </div>
                )}
                {currentStep === 4 && (
                    <div className="wizard-step">
                        <AdministrateCategories
                            onBack={() => {
                                if (hasCategories) handleStepClick(3);
                                else handleStepClick(2);
                            }}
                            onRefreshStatus={checkPrerequisites}
                            onCompleted={() => markStepAsCompleted(4)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wizard;
