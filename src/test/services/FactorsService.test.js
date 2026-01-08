import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as FactorsService from '../../services/FactorsService.jsx';
import axios from 'axios';

vi.mock('axios');

describe('FactorsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFactorsByProject', () => {
    it('debe obtener lista de factores de un proyecto exitosamente', async () => {
      const mockFactors = [
        { id: '1', name: 'Factor 1', description: 'Desc 1' },
        { id: '2', name: 'Factor 2', description: 'Desc 2' }
      ];

      axios.get.mockResolvedValue({ data: mockFactors });

      const prjId = 'test-prj';
      const result = await FactorsService.getFactorsByProject(prjId);

      expect(axios.get).toHaveBeenCalledWith('/api/factors', { params: { prj: prjId } });
      expect(result.data).toEqual(mockFactors);
    });

    it('debe manejar error al obtener factores', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));
      const prjId = 'test-prj';

      await expect(FactorsService.getFactorsByProject(prjId)).rejects.toThrow('Network error');
    });
  });

  describe('editFactorCategory', () => {
    it('debe actualizar la categoría de un factor exitosamente', async () => {
      const mockResponse = { success: true };
      const factorId = '1';
      const category = 'NewCategory';
      const prjId = 'test-prj';

      axios.put.mockResolvedValue({ data: mockResponse });

      await FactorsService.editFactorCategory(factorId, category, prjId);

      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining(`/api/factors/${factorId}/category`),
        expect.any(FormData),
        expect.objectContaining({
          headers: expect.objectContaining({ "Content-Type": "multipart/form-data" })
        })
      );
      // Verify query param
      const url = axios.put.mock.calls[0][0];
      expect(url).toContain(`prj=${encodeURIComponent(prjId)}`);
    });

    it('debe manejar error al actualizar factor', async () => {
      axios.put.mockRejectedValue(new Error('Update failed'));

      await expect(
        FactorsService.editFactorCategory('1', 'cat', 'prj')
      ).rejects.toThrow('Update failed');
    });
  });

  describe('importQualityFactors', () => {
    it('debe importar factores exitosamente', async () => {
      axios.get.mockResolvedValue({ data: {}, status: 200 });

      await FactorsService.importQualityFactors();

      expect(axios.get).toHaveBeenCalledWith('/api/factors/import');
    });

    it('debe manejar error al importar factores', async () => {
      axios.get.mockRejectedValue(new Error('Import failed'));

      await expect(
        FactorsService.importQualityFactors()
      ).rejects.toThrow('Import failed');
    });
  });

  describe('getFactorsCategoriesList', () => {
    it('debe obtener la lista de categorías de factores exitosamente', async () => {
      const mockCategories = ['Cat1', 'Cat2'];
      axios.get.mockResolvedValue({ data: mockCategories });

      const result = await FactorsService.getFactorsCategoriesList();

      expect(axios.get).toHaveBeenCalledWith('/api/factors/list');
      expect(result.data).toEqual(mockCategories);
    });
  });

  describe('getAllFactorsCategories', () => {
    it('debe obtener todas las categorías de factores exitosamente', async () => {
      const mockCategories = [{ id: 1, name: 'Cat1' }];
      axios.get.mockResolvedValue({ data: mockCategories });

      const result = await FactorsService.getAllFactorsCategories();

      expect(axios.get).toHaveBeenCalledWith('/api/factors/categories');
      expect(result.data).toEqual(mockCategories);
    });
  });
});
