import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ImportData from "../../../components/Wizard/ImportData";
import * as MetricsService from "../../../services/MetricsService";
import * as FactorsService from "../../../services/FactorsService";
import * as StrategicIndicatorsService from "../../../services/StrategicIndicatorsService";
import * as ProjectService from "../../../services/ProjectService";
import React from 'react';

describe('ImportData', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(MetricsService, 'importMetrics').mockResolvedValue({});
        vi.spyOn(FactorsService, 'importQualityFactors').mockResolvedValue({});
        vi.spyOn(StrategicIndicatorsService, 'fetchStrategicIndicators').mockResolvedValue({});
        vi.spyOn(ProjectService, 'syncProjectCategories').mockResolvedValue({});
    });

    it('debe renderizar el botón de importe inicial', () => {
        render(<ImportData />);
        expect(screen.getByText('Import Data')).toBeInTheDocument();
        expect(screen.getByText(/Step 2: Import Data/)).toBeInTheDocument();
    });

    it('debe ejecutar el proceso de importe secuencialmente y mostrar logs exitosos', async () => {
        render(<ImportData onRefreshStatus={() => {}} />);

        fireEvent.click(screen.getByText('Import Data'));

        expect(screen.getByText('Importing Data...')).toBeDisabled();
        expect(screen.getByText('🚀 Starting Import Process...')).toBeInTheDocument();

        await waitFor(() => {
             expect(screen.getByText('✅ Metrics Imported Successfully.')).toBeInTheDocument();
        });
        await waitFor(() => {
             expect(screen.getByText('✅ Quality Factors Imported Successfully.')).toBeInTheDocument();
        });
        await waitFor(() => {
             expect(screen.getByText('✅ Strategic Indicators Fetched Successfully.')).toBeInTheDocument();
        });
        await waitFor(() => {
             expect(screen.getByText('🎉 All Data Imported Successfully!')).toBeInTheDocument();
        });

        expect(MetricsService.importMetrics).toHaveBeenCalled();
        expect(FactorsService.importQualityFactors).toHaveBeenCalled();
        expect(StrategicIndicatorsService.fetchStrategicIndicators).toHaveBeenCalled();
        expect(ProjectService.syncProjectCategories).toHaveBeenCalled();
    });

    it('debe detenerse y mostrar error si falla la importación de métricas', async () => {
        MetricsService.importMetrics.mockRejectedValue(new Error('Metrics Fail'));
        
        render(<ImportData />);
        fireEvent.click(screen.getByText('Import Data'));

        await waitFor(() => {
            expect(screen.getByText('❌ Error importing Metrics: Metrics Fail')).toBeInTheDocument();
        });

        expect(FactorsService.importQualityFactors).not.toHaveBeenCalled();
    });

    it('debe detenerse y mostrar error si falla la importación de factores', async () => {
        FactorsService.importQualityFactors.mockRejectedValue(new Error('Factors Fail'));

        render(<ImportData />);
        fireEvent.click(screen.getByText('Import Data'));

        await waitFor(() => {
             expect(screen.getByText('❌ Error importing Quality Factors: Factors Fail')).toBeInTheDocument();
        });

        expect(StrategicIndicatorsService.fetchStrategicIndicators).not.toHaveBeenCalled();
    });
});
