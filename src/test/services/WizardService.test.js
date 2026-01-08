import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as WizardService from '../../services/WizardService';
import axios from 'axios';

vi.mock('axios');

describe('WizardService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getWizardStatus', () => {
        it('debe obtener el estado del wizard exitosamente', async () => {
             const mockStatus = {
                hasProjects: true,
                hasData: true,
                hasMetricsCategories: true,
                hasFactorsCategories: true,
                hasStrategicIndicatorCategories: true
            };
            axios.get.mockResolvedValue({ data: mockStatus });

            const result = await WizardService.getWizardStatus();

            expect(axios.get).toHaveBeenCalledWith('/api/wizard/status');
            expect(result).toEqual(mockStatus);
        });

        it('debe manejar errores y retornar estado por defecto', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            axios.get.mockRejectedValue(new Error('Server error'));

            const expectedDefault = {
                hasProjects: false,
                hasData: false,
                hasMetricsCategories: false,
                hasFactorsCategories: false,
                hasStrategicIndicatorCategories: false
            };

            const result = await WizardService.getWizardStatus();

            expect(result).toEqual(expectedDefault);
            expect(consoleSpy).toHaveBeenCalledWith("Error fetching wizard status:", expect.any(Error));
            consoleSpy.mockRestore();
        });
    });
});
