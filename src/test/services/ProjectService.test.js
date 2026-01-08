import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  llistarProjectes,
  obtenirProjectePerId,
  importarProjectes,
  modificarProjecte,
  esborrarProjecte,
  syncProjectCategories,
  validarNouEstudiant
} from '../../services/ProjectService';

// Mock axios
vi.mock('axios');

describe('ProjectService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('llistarProjectes', () => {
    it('debería retornar lista de proyectos', async () => {
      const mockProjects = [
        { id: 1, name: 'Project 1' },
        { id: 2, name: 'Project 2' }
      ];
      axios.get.mockResolvedValue({ data: mockProjects });

      const result = await llistarProjectes();

      expect(axios.get).toHaveBeenCalledWith('/api/projects');
      expect(result).toEqual(mockProjects);
    });

    it('debería manejar errores al listar proyectos', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));

      await expect(llistarProjectes()).rejects.toThrow('Network error');
    });
  });

  describe('obtenirProjectePerId', () => {
    it('debería retornar un proyecto por ID', async () => {
      const mockProject = { id: 1, name: 'Test Project' };
      axios.get.mockResolvedValue({ data: mockProject });

      const result = await obtenirProjectePerId(1);

      expect(axios.get).toHaveBeenCalledWith('/api/projects/1');
      expect(result).toEqual(mockProject);
    });

    it('debería manejar proyecto no encontrado', async () => {
      axios.get.mockRejectedValue(new Error('Not found'));

      await expect(obtenirProjectePerId(999)).rejects.toThrow('Not found');
    });
  });

  describe('importarProjectes', () => {
    it('debería importar proyectos correctamente', async () => {
      const projectsData = [{ name: 'New Project' }];
      const mockResponse = { data: { success: true } };
      axios.post.mockResolvedValue(mockResponse);

      const result = await importarProjectes(projectsData);

      expect(axios.post).toHaveBeenCalledWith(
        '/api/projects',
        projectsData,
        { headers: { 'Content-Type': 'application/json' } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('debería manejar errores al importar', async () => {
      axios.post.mockRejectedValue(new Error('Import failed'));

      await expect(importarProjectes([])).rejects.toThrow('Import failed');
    });
  });

  describe('modificarProjecte', () => {
    it('debería modificar un proyecto', async () => {
      const project = { id: 1, name: 'Updated Project' };
      const mockResponse = { data: project };
      axios.put.mockResolvedValue(mockResponse);

      const result = await modificarProjecte(project);

      expect(axios.put).toHaveBeenCalledWith(
        '/api/projects/1',
        project,
        { headers: { 'Content-Type': 'application/json' } }
      );
      expect(result).toEqual(project);
    });

    it('debería manejar errores al modificar', async () => {
      const project = { id: 1, name: 'Test' };
      axios.put.mockRejectedValue(new Error('Update failed'));

      await expect(modificarProjecte(project)).rejects.toThrow('Update failed');
    });
  });

  describe('esborrarProjecte', () => {
    it('debería eliminar un proyecto', async () => {
      axios.delete.mockResolvedValue({ data: { success: true } });

      await esborrarProjecte(1);

      expect(axios.delete).toHaveBeenCalledWith('/api/projects/1');
    });

    it('debería manejar errores al eliminar', async () => {
      axios.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(esborrarProjecte(1)).rejects.toThrow('Delete failed');
    });
  });

  describe('syncProjectCategories', () => {
    it('debería sincronizar categorías de proyectos', async () => {
      const mockResponse = { data: { synced: true } };
      axios.post.mockResolvedValue(mockResponse);

      const result = await syncProjectCategories();

      expect(axios.post).toHaveBeenCalledWith('/api/projects/sync-categories');
      expect(result).toEqual(mockResponse);
    });

    it('debería manejar errores al sincronizar', async () => {
      axios.post.mockRejectedValue(new Error('Sync failed'));

      await expect(syncProjectCategories()).rejects.toThrow('Sync failed');
    });
  });

  describe('validarNouEstudiant', () => {
    it('debería validar un nuevo estudiante', async () => {
      const studentData = { name: 'John Doe', email: 'john@test.com' };
      const mockResponse = { data: { valid: true } };
      axios.post.mockResolvedValue(mockResponse);

      const result = await validarNouEstudiant(studentData);

      expect(axios.post).toHaveBeenCalledWith(
        '/api/projects/validate-student',
        studentData,
        { headers: { 'Content-Type': 'application/json' } }
      );
      expect(result).toEqual({ valid: true });
    });

    it('debería manejar validación fallida', async () => {
      axios.post.mockRejectedValue(new Error('Validation error'));

      await expect(validarNouEstudiant({})).rejects.toThrow('Validation error');
    });
  });
});
