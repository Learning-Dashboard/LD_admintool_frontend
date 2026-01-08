import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Wizard from '../../../components/Wizard/Wizard';
import * as WizardService from '../../../services/WizardService';
import React from 'react';

// Enhanced Mocks to trigger callbacks
vi.mock('../../../components/Projects/ImportProject/ImportProject', () => ({
    default: ({ onNextStep, onCompleted, onRefreshStatus }) => (
        <div data-testid="import-project">
            Import Project Step
            <button onClick={onNextStep}>Next</button>
            <button onClick={onCompleted}>Complete</button>
            <button onClick={onRefreshStatus}>Refresh</button>
        </div>
    )
}));

vi.mock('../../../components/Wizard/ImportData', () => ({
    default: ({ onNext, onBack, onCompleted }) => (
        <div data-testid="import-data">
            Import Data Step
            <button onClick={onNext}>Next</button>
            <button onClick={onBack}>Back</button>
            <button onClick={onCompleted}>Complete</button>
        </div>
    )
}));

vi.mock('../../../components/Wizard/WizardImportCategories', () => ({
    default: ({ onNext, onBack, onCompleted }) => (
        <div data-testid="import-categories">
            Import Categories Step
            <button onClick={onNext}>Next</button>
            <button onClick={onBack}>Back</button>
            <button onClick={onCompleted}>Complete</button>
        </div>
    )
}));

vi.mock('../../../components/Categories/AdministrateCategories', () => ({
    default: ({ onBack, onCompleted, onMissingData }) => (
        <div data-testid="assign-categories">
            Assign Categories Step
            <button onClick={onBack}>Back</button>
            <button onClick={onCompleted}>Complete</button>
            <button onClick={onMissingData}>MissingData</button>
        </div>
    )
}));

describe('Wizard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.alert = vi.fn();
        vi.spyOn(WizardService, 'getWizardStatus').mockResolvedValue({
            hasProjects: false,
            hasData: false,
            hasMetricsCategories: false,
            hasFactorsCategories: false,
            hasStrategicIndicatorCategories: false
        });
        // Mock console.error to avoid polluting output during error test
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('navigates through steps using internal buttons and marks completion', async () => {
        // Setup state so we can navigate
        WizardService.getWizardStatus.mockResolvedValue({
            hasProjects: true,
            hasData: true,
            hasMetricsCategories: true,
            hasFactorsCategories: true,
            hasStrategicIndicatorCategories: true
        });

        const { container } = render(<Wizard />);
        
        // --- Step 1 ---
        // Verify we start at step 1
        await waitFor(() => expect(screen.getByTestId('import-project')).toBeInTheDocument());
        
        // Mark step 1 as completed
        fireEvent.click(screen.getByText('Complete'));
        
        // Check if logic for completion works (visual check via class)
        // Note: The logic in Wizard.jsx says `${currentStep === stepNum ? 'active' : (isCompleted ? 'completed' : '')}`. 
        // If it's active (current step), it does NOT get the 'completed' class, even if it is in the set.
        // So we must move to next step to see the 'completed' class on step 1.
        
        // This assertion was failing because we are still on Step 1, so it has 'active' but not 'completed'.
        // Let's verify we are still on Step 1 first.
        expect(screen.getByTestId('import-project')).toBeInTheDocument();

        // Click Next in Step 1 -> Should go to Step 2
        fireEvent.click(screen.getByText('Next'));
        await waitFor(() => expect(screen.getByTestId('import-data')).toBeInTheDocument());

        // NOW step 1 should appear completed
        await waitFor(() => {
            const step1Indicator = screen.getByText(/1\s*\.\s*Import Projects/i);
            expect(step1Indicator.className).toContain('completed');
        });

        // --- Step 2 ---
        // Mark step 2 as completed
        fireEvent.click(screen.getByText('Complete'));
        
        // Navigate away to check completion status (e.g., go back to step 1 or next to step 3)
        // Let's go Next to step 3
        fireEvent.click(screen.getByText('Next'));
        await waitFor(() => expect(screen.getByTestId('import-categories')).toBeInTheDocument());

        await waitFor(() => {
            const step2Indicator = screen.getByText(/2\s*\.\s*Import Data/i);
            expect(step2Indicator.className).toContain('completed');
        });

         // --- Step 3 ---
        // Mark step 3 as completed
        fireEvent.click(screen.getByText('Complete'));
        
        // Click Next (to Step 4)
        fireEvent.click(screen.getByText('Next'));
        await waitFor(() => expect(screen.getByTestId('assign-categories')).toBeInTheDocument());

        // --- Step 4 ---
        // Mark step 4 as completed
        fireEvent.click(screen.getByText('Complete'));
    });

    it('handles Step 4 specific navigation logic (Back/MissingData)', async () => {
         // Case 1: hasCategories = true. Back should go to Step 3.
         WizardService.getWizardStatus.mockResolvedValue({
            hasProjects: true,
            hasData: true,
            hasMetricsCategories: true,
            hasFactorsCategories: true,
            hasStrategicIndicatorCategories: true // -> hasCategories set to true
        });

        render(<Wizard />);
        // Navigate directly to step 4 via stepper click (since enabled by mock)
        // Wait for steps to render
        await waitFor(() => screen.getByText(/4\s*\.\s*Assign Categories/i));
        const step4 = screen.getByText(/4\s*\.\s*Assign Categories/i);
        fireEvent.click(step4);
        
        await waitFor(() => expect(screen.getByTestId('assign-categories')).toBeInTheDocument());

        // Click Back -> Should go to Step 3 (WizardImportCategories)
        fireEvent.click(screen.getByText('Back'));
        await waitFor(() => expect(screen.getByTestId('import-categories')).toBeInTheDocument());

        // Go back to step 4
        fireEvent.click(step4);
        await waitFor(() => expect(screen.getByTestId('assign-categories')).toBeInTheDocument());

        // Click MissingData -> Should go to Step 2 (ImportData)
        fireEvent.click(screen.getByText('MissingData'));
        await waitFor(() => expect(screen.getByTestId('import-data')).toBeInTheDocument());
    });

    it('handles Step 4 Back navigation when categories are missing', async () => {
        // Case 2: hasCategories = false. Back should go to Step 2.
        WizardService.getWizardStatus.mockResolvedValue({
           hasProjects: true,
           hasData: true,
           hasMetricsCategories: false // -> hasCategories set to false
       });

       render(<Wizard />);
       await waitFor(() => screen.getByText(/4\s*\.\s*Assign Categories/i));
       const step4 = screen.getByText(/4\s*\.\s*Assign Categories/i);
       fireEvent.click(step4);
       
       await waitFor(() => expect(screen.getByTestId('assign-categories')).toBeInTheDocument());

       // Click Back -> Should go to Step 2 (ImportData)
       fireEvent.click(screen.getByText('Back'));
       await waitFor(() => expect(screen.getByTestId('import-data')).toBeInTheDocument());
   });

    it('handles error during prerequisites check', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error');
        WizardService.getWizardStatus.mockRejectedValue(new Error('API Failure'));
        
        render(<Wizard />);
        
        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error checking prerequisites:', expect.any(Error));
        });
    });

    it('alerts user when navigating to locked steps', async () => {
        WizardService.getWizardStatus.mockResolvedValue({
            hasProjects: false,
            hasData: false
        });

        render(<Wizard />);
        
        // Wait for intial load
        await waitFor(() => screen.getByTestId('import-project'));

        // Try to click Step 2 (Import Data) -> Needs Projects
        // Note: The UI sets 'disabled' class and maybe style, but logic is inside handleStepClick
        fireEvent.click(screen.getByText(/2\s*\.\s*Import Data/i));
        
        await waitFor(() => {
             // Expect logic re-fetch status then alert
             expect(global.alert).toHaveBeenCalledWith('Please import projects first.');
        });
        
        // Try to click Step 4 -> Needs Projects & Data
        // Case: No projects
        fireEvent.click(screen.getByText(/4\s*\.\s*Assign Categories/i));
        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith('Please import projects first.');
        });
    });

    it('alerts user when navigating to step 4 without data', async () => {
        WizardService.getWizardStatus.mockResolvedValue({
            hasProjects: true,
            hasData: false
        });

        render(<Wizard />);
        await waitFor(() => screen.getByTestId('import-project'));

        fireEvent.click(screen.getByText(/4\s*\.\s*Assign Categories/i));
        await waitFor(() => {
             expect(global.alert).toHaveBeenCalledWith('Please import data (Step 2) first.');
        });
    });
});
