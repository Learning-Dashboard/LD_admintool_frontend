import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as MetricsService from '../../services/MetricsService.jsx';
import axios from 'axios';

vi.mock('axios');

describe('MetricsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMetricsByProject', () => {
    it('debe obtener lista de métricas de un proyecto exitosamente', async () => {
      const mockMetrics = [
        { id: '1', name: 'Metric 1', description: 'Desc 1' },
        { id: '2', name: 'Metric 2', description: 'Desc 2' }
      ];

      axios.get.mockResolvedValue({ data: mockMetrics });

      const prjId = 'test-prj';
      const result = await MetricsService.getMetricsByProject(prjId);

      expect(axios.get).toHaveBeenCalledWith('/api/metrics', { params: { prj: prjId } });
      expect(result.data).toEqual(mockMetrics);
    });

    it('debe manejar error al obtener métricas', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));
      const prjId = 'test-prj';

      await expect(MetricsService.getMetricsByProject(prjId)).rejects.toThrow('Network error');
    });
  });

  describe('editMetric', () => {
    it('debe actualizar una métrica exitosamente', async () => {
      const mockResponse = { success: true };
      const metricId = '1';
      const metricData = {
        threshold: 0.5,
        url: 'http://test.com',
        categoryName: 'Cat1'
      };
      const prjId = 'test-prj';

      axios.put.mockResolvedValue({ data: mockResponse });

      await MetricsService.editMetric(metricId, metricData, prjId);

      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining(`/api/metrics/${metricId}`),
        expect.any(FormData),
        expect.objectContaining({
          headers: expect.objectContaining({ "Content-Type": "multipart/form-data" })
        })
      );
      // Verify query param
      const url = axios.put.mock.calls[0][0];
      expect(url).toContain(`prj=${encodeURIComponent(prjId)}`);
    });

    it('debe manejar error al actualizar métrica', async () => {
      axios.put.mockRejectedValue(new Error('Update failed'));

      await expect(
        MetricsService.editMetric('1', {}, 'prj')
      ).rejects.toThrow('Update failed');
    });
  });

  describe('importMetrics', () => {
    it('debe importar métricas exitosamente', async () => {
      axios.get.mockResolvedValue({ data: {}, status: 200 });

      await MetricsService.importMetrics();

      expect(axios.get).toHaveBeenCalledWith('/api/metrics/import');
    });

    it('debe manejar error al importar métricas', async () => {
      axios.get.mockRejectedValue(new Error('Import failed'));

      await expect(
        MetricsService.importMetrics()
      ).rejects.toThrow('Import failed');
    });
  });

  describe('getMetricsCategoriesList', () => {
    it('debe obtener la lista de categorías de métricas exitosamente', async () => {
      const mockCategories = ['Cat1', 'Cat2'];
      axios.get.mockResolvedValue({ data: mockCategories });

      const result = await MetricsService.getMetricsCategoriesList();

      expect(axios.get).toHaveBeenCalledWith('/api/metrics/list');
      expect(result.data).toEqual(mockCategories);
    });
  });

  describe('getAllMetricsCategories', () => {
    it('debe obtener todas las categorías de métricas exitosamente', async () => {
      const mockCategories = [{ id: 1, name: 'Cat1' }];
      axios.get.mockResolvedValue({ data: mockCategories });

      const result = await MetricsService.getAllMetricsCategories();

      expect(axios.get).toHaveBeenCalledWith('/api/metrics/categories');
      expect(result.data).toEqual(mockCategories);
    });
  });
});
