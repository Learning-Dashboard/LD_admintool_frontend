import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PageCategories from '../../../components/Categories/PageCategories';
import * as CategoryService from '../../../services/CategoryService';
import React from 'react';

// Mocks
vi.mock('../../../services/CategoryService', () => ({
    importarCategoriesMetriques: vi.fn(),
    importarCategoriesFactors: vi.fn(),
    importarCategoriesStrategicIndicators: vi.fn()
}));
vi.mock('../../../assets/MetricsCategories.json', () => ({ default: [] }));
vi.mock('../../../assets/FactorsCategories.json', () => ({ default: [] }));
vi.mock('../../../assets/StrategicIndicatorsCategories.json', () => ({ default: [] }));

// Mock del componente hijo AdministrateCategories
vi.mock('../../../components/Categories/AdministrateCategories', () => ({
    default: ({ onBack }) => (
        <div data-testid="administrate-categories">
            Administrate View
            <button onClick={onBack}>Back from Admin</button>
        </div>
    )
}));

describe('PageCategories', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe renderizar los botones principales', () => {
        render(<PageCategories />);
        expect(screen.getByText('Categories')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Import Categories/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Manage Categories/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument();
    });

    it('debe llamar a los servicios de importación al hacer clic', async () => {
        CategoryService.importarCategoriesMetriques.mockResolvedValue({});
        CategoryService.importarCategoriesFactors.mockResolvedValue({});
        CategoryService.importarCategoriesStrategicIndicators.mockResolvedValue({});

        render(<PageCategories />);
        fireEvent.click(screen.getByRole('button', { name: /Import Categories/i }));

        await waitFor(() => {
            expect(CategoryService.importarCategoriesMetriques).toHaveBeenCalled();
        });
        expect(screen.getByText(/Categories correctly imported!/i)).toBeInTheDocument();
    });

    it('debe mostrar error si falla la importación', async () => {
        CategoryService.importarCategoriesMetriques.mockRejectedValue(new Error('Import Failed'));

        render(<PageCategories />);
        fireEvent.click(screen.getByRole('button', { name: /Import Categories/i }));

        await waitFor(() => {
            expect(screen.getByText(/Error importing: Import Failed/i)).toBeInTheDocument();
        });
    });

    it('debe navegar a AdministrateCategories y volver', () => {
        render(<PageCategories />);

        // Click Manage Categories
        fireEvent.click(screen.getByRole('button', { name: /Manage Categories/i }));
        
        expect(screen.getByTestId('administrate-categories')).toBeInTheDocument();
        expect(screen.queryByText(/Manage Categories/i)).not.toBeInTheDocument();

        // Volver atrás desde el hijo
        fireEvent.click(screen.getByText('Back from Admin'));
        
        expect(screen.getByRole('button', { name: /Manage Categories/i })).toBeInTheDocument();
    });

    it('debe llamar a onBack prop al hacer clic en Back principal', () => {
        const onBackMock = vi.fn();
        render(<PageCategories onBack={onBackMock} />);
        
        fireEvent.click(screen.getByRole('button', { name: /Back/i }));
        expect(onBackMock).toHaveBeenCalled();
    });
});
