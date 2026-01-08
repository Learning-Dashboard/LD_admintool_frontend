import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as CategoryService from '../../services/CategoryService.jsx';
import axios from 'axios';

vi.mock('axios');

describe('CategoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('importarCategoriesMetriques', () => {
    it('debe importar categorías de métricas exitosamente', async () => {
      const mockCategories = [
        { category: 'Category 1', patternGroup: 'group1' },
        { category: 'Category 2', patternGroup: 'group2' }
      ];

      axios.post.mockResolvedValue({ data: {}, status: 200 });

      await CategoryService.importarCategoriesMetriques(mockCategories);

      expect(axios.post).toHaveBeenCalledWith(
        '/api/categories/metrics',
        mockCategories,
        { headers: { 'Content-Type': 'application/json' } }
      );
    });

    it('debe manejar error al importar categorías de métricas', async () => {
      const mockCategories = [{ category: 'Category 1' }];
      axios.post.mockRejectedValue(new Error('Network error'));

      await expect(
        CategoryService.importarCategoriesMetriques(mockCategories)
      ).rejects.toThrow('Network error');
    });

    it('debe enviar array vacío correctamente', async () => {
      axios.post.mockResolvedValue({ data: {}, status: 200 });

      await CategoryService.importarCategoriesMetriques([]);

      expect(axios.post).toHaveBeenCalledWith('/api/categories/metrics', [], {
        headers: { 'Content-Type': 'application/json' }
      });
    });
  });

  describe('importarCategoriesFactors', () => {
    it('debe importar categorías de factores exitosamente', async () => {
      const mockCategories = [
        { category: 'Factor 1', patternGroup: 'group1' }
      ];

      axios.post.mockResolvedValue({ data: {}, status: 200 });

      await CategoryService.importarCategoriesFactors(mockCategories);

      expect(axios.post).toHaveBeenCalledWith(
        '/api/categories/factors',
        mockCategories,
        { headers: { 'Content-Type': 'application/json' } }
      );
    });

    it('debe manejar error al importar categorías de factores', async () => {
      const mockCategories = [{ category: 'Factor 1' }];
      axios.post.mockRejectedValue(new Error('Server error'));

      await expect(
        CategoryService.importarCategoriesFactors(mockCategories)
      ).rejects.toThrow('Server error');
    });
  });

  describe('importarCategoriesStrategicIndicators', () => {
    it('debe importar categorías de indicadores estratégicos exitosamente', async () => {
      const mockIntervals = [
        { name: 'Good', color: '#00FF00', min: 0.75, max: 1.0 },
        { name: 'Medium', color: '#FFFF00', min: 0.5, max: 0.75 }
      ];

      axios.post.mockResolvedValue({ data: {}, status: 200 });

      await CategoryService.importarCategoriesStrategicIndicators(mockIntervals);

      expect(axios.post).toHaveBeenCalledWith(
        '/api/categories/strategicIndicators',
        mockIntervals,
        { headers: { 'Content-Type': 'application/json' } }
      );
    });

    it('debe manejar error al importar categorías de SI', async () => {
      const mockIntervals = [{ name: 'Good', color: '#00FF00' }];
      axios.post.mockRejectedValue(new Error('Validation error'));

      await expect(
        CategoryService.importarCategoriesStrategicIndicators(mockIntervals)
      ).rejects.toThrow('Validation error');
    });

    it('debe enviar datos con estructura correcta', async () => {
      const mockIntervals = [
        { name: 'Good', color: '#00FF00', min: 0, max: 1 }
      ];

      axios.post.mockResolvedValue({ data: {}, status: 200 });

      await CategoryService.importarCategoriesStrategicIndicators(mockIntervals);

      expect(axios.post).toHaveBeenCalledWith(
        '/api/categories/strategicIndicators',
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Good',
            color: '#00FF00'
          })
        ]),
        { headers: { 'Content-Type': 'application/json' } }
      );
    });
  });
});
