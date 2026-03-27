import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MetricsTable from '../../../components/Categories/MetricsTable';
import React from 'react';
import * as MetricsService from '../../../services/MetricsService';

// Mock Services
vi.mock('../../../services/MetricsService', () => ({
    editMetric: vi.fn().mockResolvedValue({})
}));

// Mock CategorySelect
vi.mock('../../../components/Categories/CategorySelect', () => {
    const MockCategorySelect = ({ options, value, onChange, placeholder }) => (
        <select 
            data-testid="category-select" 
            value={value || ""} 
            onChange={(e) => onChange(e)}
        >
            <option value="">{placeholder}</option>
            {options.map((opt, idx) => (
                <option key={idx} value={opt.value}>{opt.displayName || opt.name}</option>
            ))}
        </select>
    );
     return {
        default: MockCategorySelect,
        useCategorySelectOptions: (categories) => {
             return categories.map(c => ({
                displayName: c.name,
                value: JSON.stringify({ name: c.name })
            }));
        }
    };
});

describe('MetricsTable', () => {
    const mockCategories = [{ id: '1', name: 'Cat1' }, { id: '2', name: 'Cat2' }];
    const mockTeamMetrics = [
        { id: '1', externalId: 'm1', name: 'Metric 1', description: 'Desc 1', categoryName: 'Cat1', threshold: 0.5, url: 'http://test', project: { externalId: 'p1' } }
    ];
    // Teams needed for handleSave validation in Component
    const mockTeams = [{ externalId: 'p1', name: 'Project 1' }];
    const mockAllMetrics = [...mockTeamMetrics];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe renderizar la tabla de métricas de equipo', () => {
         render(<MetricsTable 
            metrics={mockTeamMetrics} 
            allMetrics={mockAllMetrics}
            allCategories={mockCategories} 
            teams={mockTeams}
         />);
        
         expect(screen.getByText('Metric 1')).toBeInTheDocument();
    });

    it('debe llamar a editMetric al cambiar una categoría y guardar', async () => {
        render(<MetricsTable 
            metrics={mockTeamMetrics} 
            allMetrics={mockAllMetrics}
            allCategories={mockCategories} 
            teams={mockTeams}
        />);

        const selects = screen.getAllByTestId('category-select');
        // El componente MetricsTable usa MetricRow, que renderiza CategorySelect.
        // Change value -> 'JSON string' logic is internal to getCatValue, but handleChange just sets state.
        // But the select value passed to handleChange is 'Cat2' (string).
        const cat2Value = JSON.stringify({ name: 'Cat2' });
        fireEvent.change(selects[0], { target: { value: cat2Value } });

        const saveButton = screen.getByText('Save'); // MetricRow renders "Save" or "Saving..."
        fireEvent.click(saveButton);

        await waitFor(() => {
             // Expect Mock Service to be called
             expect(MetricsService.editMetric).toHaveBeenCalled();
             // editMetric(id, { categoryName: ... }, projectId)
             expect(MetricsService.editMetric).toHaveBeenCalledWith('1', { categoryName: 'Cat2' }, 'p1');
        });
    });
});

