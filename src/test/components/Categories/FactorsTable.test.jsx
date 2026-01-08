import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FactorsTable from '../../../components/Categories/FactorsTable';
import React from 'react';
import * as FactorsService from '../../../services/FactorsService.jsx';

// Mock Services
vi.mock('../../../services/FactorsService.jsx', () => ({
    editFactorCategory: vi.fn().mockResolvedValue({})
}));

// Mock CategorySelect para simplificar pruebas
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

describe('FactorsTable', () => {
    const mockCategories = [{ id: '1', name: 'Cat1' }, { id: '2', name: 'Cat2' }];
    const mockTeamFactors = [
        // Added id 'f1'
        { id: 'f1', externalId: 'f1', name: 'Factor 1', description: 'Desc 1', categoryName: 'Cat1', project: { externalId: 'p1' } }
    ];
    // Mock prop 'teams' needed for logic in handleSave?
    // handleSave: "const factorsToUpdate = allFactors.filter..."
    // "teams.some..."
    const mockTeams = [{ externalId: 'p1', name: 'Project 1' }];

    const mockData = { team: mockTeamFactors };
    
    // We need allFactors for handleSave logic
    const mockAllFactors = [...mockTeamFactors];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe renderizar la tabla de factores de equipo', () => {
        render(<FactorsTable 
            factors={mockData.team} 
            allFactors={mockAllFactors}
            allCategories={mockCategories} 
            teams={mockTeams}
        />);
        
        expect(screen.getByText('Factor 1')).toBeInTheDocument();
        expect(screen.getByText('Desc 1')).toBeInTheDocument();
    });

    it('debe renderizar correctamente con lista vacía', () => {
         render(<FactorsTable factors={[]} allFactors={[]} allCategories={mockCategories} />);
         expect(screen.queryByText('Factor 1')).not.toBeInTheDocument();
    });

    it('debe llamar a editFactorCategory al cambiar una categoría y guardar', async () => {
        render(<FactorsTable 
            factors={mockData.team} 
            allFactors={mockAllFactors}
            allCategories={mockCategories} 
            teams={mockTeams}
        />);

        // Change value
        const selects = screen.getAllByTestId('category-select');
        const cat2Value = JSON.stringify({ name: 'Cat2' });
        fireEvent.change(selects[0], { target: { value: cat2Value } });

        // Click Save
        const saveButton = screen.getByText('Save');
        fireEvent.click(saveButton);

        await waitFor(() => {
             expect(FactorsService.editFactorCategory).toHaveBeenCalled();
             // Check arguments if possible: id, categoryName, projectId
             expect(FactorsService.editFactorCategory).toHaveBeenCalledWith('f1', 'Cat2', 'p1');
        });
    });
});

