import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ManageSubjectCategories from '../../../components/Categories/ManageSubjectCategories';
import * as MetricsService from '../../../services/MetricsService';
import * as FactorsService from '../../../services/FactorsService';
import * as ProjectService from '../../../services/ProjectService';
import React from 'react';

// Mocks para los componentes hijos
vi.mock('../../../components/Categories/MetricsTable', () => ({
    // Ajustar mock para aceptar las props que realmente se pasan
    default: ({ metrics, allCategories }) => <div data-testid="metrics-table">Metrics Table: {metrics?.length || 0} items</div>
}));

vi.mock('../../../components/Categories/FactorsTable', () => ({
    // Ajustar mock para aceptar las props que realmente se pasan
    default: ({ factors, allCategories }) => <div data-testid="factors-table">Factors Table: {factors?.length || 0} items</div>
}));

describe('ManageSubjectCategories', () => {
    const mockSubject = 'Subject A';
    const mockProjects = [
        { id: '1', name: 'Project 1', externalId: 'prj1', subject: 'Subject A' }
    ];
    const mockMetricCategories = [{ id: '1', name: 'Cat1' }];
    const mockFactorCategories = [{ id: '1', name: 'FactCat1' }];
    const mockMetrics = [{ id: 'm1', externalId: 'metric1', scope: 'team' }];
    const mockFactors = [{ id: 'f1', externalId: 'factor1', scope: 'team' }];

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(ProjectService, 'llistarProjectes').mockResolvedValue(mockProjects);
        vi.spyOn(MetricsService, 'getAllMetricsCategories').mockResolvedValue(mockMetricCategories);
        vi.spyOn(FactorsService, 'getAllFactorsCategories').mockResolvedValue(mockFactorCategories);
        vi.spyOn(MetricsService, 'getMetricsByProject').mockResolvedValue({ data: mockMetrics });
        vi.spyOn(FactorsService, 'getFactorsByProject').mockResolvedValue({ data: mockFactors });
    });

    it('debe cargar los datos iniciales y mostrar el tab de métricas por defecto', async () => {
        render(<ManageSubjectCategories subject={mockSubject} />);

        await waitFor(() => {
             expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
        });

        // Verificar título correcto
        expect(screen.getByText(/Assign Categories for/i)).toBeInTheDocument();
        expect(screen.getByText(/Subject A/i)).toBeInTheDocument();
        
        // Verificar tabla de métricas (mockeada)
        expect(screen.getAllByTestId('metrics-table').length).toBeGreaterThan(0);
        
        expect(screen.getByRole('button', { name: 'Metrics' })).toHaveClass('active');
        expect(screen.getByRole('button', { name: 'Factors' })).toBeInTheDocument();
    });

    it('debe cambiar al tab de factores', async () => {
        render(<ManageSubjectCategories subject={mockSubject} />);

        await waitFor(() => {
             expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
        });

        const factorsTabButton = screen.getByRole('button', { name: 'Factors' });
        fireEvent.click(factorsTabButton);

        await waitFor(() => {
             expect(screen.getAllByTestId('factors-table').length).toBeGreaterThan(0);
        });
        expect(factorsTabButton).toHaveClass('active');
    });

    it('debe llamar a onBack cuando se hace clic en el botón Back', async () => {
        const onBackMock = vi.fn();
        render(<ManageSubjectCategories subject={mockSubject} onBack={onBackMock} />);

        await waitFor(() => {
             expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
        });
        
        // Buscar el botón Back de forma más robusta
        const backButton = screen.getByRole('button', { name: /Back/i });
        fireEvent.click(backButton);
        expect(onBackMock).toHaveBeenCalled();
    });
});
