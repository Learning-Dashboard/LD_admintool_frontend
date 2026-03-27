import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as StrategicIndicatorsService from '../../services/StrategicIndicatorsService.jsx';
import axios from 'axios';

vi.mock('axios');

describe('StrategicIndicatorsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStrategicIndicatorsByProject', () => {
    it('debe obtener lista de indicadores estratégicos de un proyecto exitosamente', async () => {
      const mockIndicators = [
        { id: '1', name: 'SI 1', description: 'Desc 1' },
        { id: '2', name: 'SI 2', description: 'Desc 2' }
      ];

      axios.get.mockResolvedValue({ data: mockIndicators });

      const prjId = 'test-prj';
      const result = await StrategicIndicatorsService.getStrategicIndicatorsByProject(prjId);

      expect(axios.get).toHaveBeenCalledWith('/api/strategicIndicators', { params: { prj: prjId } });
      expect(result.data).toEqual(mockIndicators);
    });

    it('debe manejar error al obtener indicadores', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));
      const prjId = 'test-prj';

      await expect(
        StrategicIndicatorsService.getStrategicIndicatorsByProject(prjId)
      ).rejects.toThrow('Network error');
    });
  });

  describe('editStrategicIndicator', () => {
    it('debe actualizar un indicador exitosamente', async () => {
      const mockResponse = { success: true };
      const siId = '1';
      const siData = {
        threshold: 0.8,
        url: 'http://test.com',
        categoryName: 'Cat1'
      };
      const prjId = 'test-prj';

      axios.put.mockResolvedValue({ data: mockResponse });

      await StrategicIndicatorsService.editStrategicIndicator(siId, siData, prjId);

      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining(`/api/strategicIndicators/${siId}`),
        expect.any(FormData),
        expect.objectContaining({
          headers: expect.objectContaining({ "Content-Type": "multipart/form-data" })
        })
      );
      // Verify query param
      const url = axios.put.mock.calls[0][0];
      expect(url).toContain(`prj=${encodeURIComponent(prjId)}`);
    });

    it('debe manejar error al actualizar indicador', async () => {
      axios.put.mockRejectedValue(new Error('Update failed'));

      await expect(
        StrategicIndicatorsService.editStrategicIndicator('1', {}, 'prj')
      ).rejects.toThrow('Update failed');
    });
  });

  describe('fetchStrategicIndicators', () => {
    it('debe importar indicadores exitosamente', async () => {
      axios.get.mockResolvedValue({ data: {}, status: 200 });

      await StrategicIndicatorsService.fetchStrategicIndicators();

      expect(axios.get).toHaveBeenCalledWith('/api/strategicIndicators/fetch');
    });

    it('debe manejar error al importar indicadores', async () => {
      axios.get.mockRejectedValue(new Error('Import failed'));

      await expect(
        StrategicIndicatorsService.fetchStrategicIndicators()
      ).rejects.toThrow('Import failed');
    });
  });

  describe('getStrategicIndicatorsCategoriesList', () => {
    it('debe obtener la lista de categorías de indicadores estratégicos exitosamente', async () => {
      const mockCategories = ['Cat1', 'Cat2'];
      axios.get.mockResolvedValue({ data: mockCategories });

      const result = await StrategicIndicatorsService.getStrategicIndicatorsCategoriesList();

      expect(axios.get).toHaveBeenCalledWith('/api/strategicIndicators/list');
      expect(result.data).toEqual(mockCategories);
    });
  });

  describe('getAllStrategicIndicatorCategories', () => {
    it('debe obtener todas las categorías de indicadores estratégicos exitosamente', async () => {
      const mockCategories = [{ id: 1, name: 'Cat1' }];
      axios.get.mockResolvedValue({ data: mockCategories });

      const result = await StrategicIndicatorsService.getAllStrategicIndicatorCategories();

      expect(axios.get).toHaveBeenCalledWith('/api/strategicIndicators/categories');
      expect(result.data).toEqual(mockCategories);
    });
  });
});
