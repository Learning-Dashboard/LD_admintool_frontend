import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WizardImportCategories from '../../../components/Wizard/WizardImportCategories';
import * as CategoryService from '../../../services/CategoryService';
import React from 'react';

// Mock del servicio
vi.mock('../../../services/CategoryService', () => ({
    importarCategoriesMetriques: vi.fn(),
    importarCategoriesFactors: vi.fn(),
    importarCategoriesStrategicIndicators: vi.fn()
}));

// Mocks de JSONs para evitar problemas de importación si no existen en el entorno de test
vi.mock('../../../assets/MetricsCategories.json', () => ({ default: [] }));
vi.mock('../../../assets/FactorsCategories.json', () => ({ default: [] }));
vi.mock('../../../assets/StrategicIndicatorsCategories.json', () => ({ default: [] }));

describe('WizardImportCategories', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe renderizar el contenido correctamente', () => {
        render(<WizardImportCategories />);
        expect(screen.getByText('Step 3: Import Categories')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Import Categories/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument();
    });

    it('debe llamar a las funciones de importación al hacer clic y mostrar éxito', async () => {
        const onRefreshStatusMock = vi.fn();
        const onCompletedMock = vi.fn();

        CategoryService.importarCategoriesMetriques.mockResolvedValue({});
        CategoryService.importarCategoriesFactors.mockResolvedValue({});
        CategoryService.importarCategoriesStrategicIndicators.mockResolvedValue({});

        render(<WizardImportCategories 
            onRefreshStatus={onRefreshStatusMock} 
            onCompleted={onCompletedMock} 
        />);

        fireEvent.click(screen.getByRole('button', { name: /Import Categories/i }));

        expect(screen.getByText(/Importing.../i)).toBeInTheDocument();

        await waitFor(() => {
            expect(CategoryService.importarCategoriesMetriques).toHaveBeenCalled();
            expect(CategoryService.importarCategoriesFactors).toHaveBeenCalled();
            expect(CategoryService.importarCategoriesStrategicIndicators).toHaveBeenCalled();
        });

        expect(screen.getByText(/Categories imported successfully/i)).toBeInTheDocument();
        expect(onRefreshStatusMock).toHaveBeenCalled();
        expect(onCompletedMock).toHaveBeenCalled();
        
        // Verifica que aparece el botón Next Step
        expect(screen.getByRole('button', { name: /Next Step/i })).toBeInTheDocument();
    });

    it('debe manejar errores durante la importación', async () => {
        CategoryService.importarCategoriesMetriques.mockRejectedValue(new Error('Network Error'));

        render(<WizardImportCategories />);

        fireEvent.click(screen.getByRole('button', { name: /Import Categories/i }));

        await waitFor(() => {
            expect(screen.getByText(/Error importing: Network Error/i)).toBeInTheDocument();
        });
        
        // No debería aparecer el botón next
        expect(screen.queryByRole('button', { name: /Next Step/i })).not.toBeInTheDocument();
    });

    it('debe llamar a onNext al hacer clic en Next Step', async () => {
        const onNextMock = vi.fn();
        CategoryService.importarCategoriesMetriques.mockResolvedValue({});
        CategoryService.importarCategoriesFactors.mockResolvedValue({});
        CategoryService.importarCategoriesStrategicIndicators.mockResolvedValue({});

        render(<WizardImportCategories onNext={onNextMock} />);

        // Importar primero para que aparezca Next
        fireEvent.click(screen.getByRole('button', { name: /Import Categories/i }));
        await waitFor(() => screen.getByRole('button', { name: /Next Step/i }));

        fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));
        expect(onNextMock).toHaveBeenCalled();
    });

    it('debe llamar a onBack al hacer clic en Back', () => {
        const onBackMock = vi.fn();
        render(<WizardImportCategories onBack={onBackMock} />);

        fireEvent.click(screen.getByRole('button', { name: /Back/i }));
        expect(onBackMock).toHaveBeenCalled();
    });
});
