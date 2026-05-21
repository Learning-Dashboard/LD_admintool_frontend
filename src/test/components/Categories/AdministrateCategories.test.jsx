import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdministrateCategories from '../../../components/Categories/AdministrateCategories';
import * as ProjectService from '../../../services/ProjectService';
import React from 'react';

// Mock de ManageSubjectCategories
vi.mock('../../../components/Categories/ManageSubjectCategories', () => ({
    default: ({ subject, onBack }) => (
        <div data-testid="manage-subject-categories">
            Managing: {subject}
            <button onClick={onBack}>Back to List</button>
        </div>
    )
}));

describe('AdministrateCategories', () => {
    const mockProjects = [
        { id: '1', name: 'Project A', subject: 'Subject A' },
        { id: '2', name: 'Project B', subject: 'Subject B' },
        { id: '3', name: 'Project C', subject: 'Subject A' } // Duplicate subject
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock llistarProjectes
        vi.spyOn(ProjectService, 'llistarProjectes').mockResolvedValue(mockProjects);
    });

    it('debe cargar y mostrar los botones de las asignaturas', async () => {
        render(<AdministrateCategories />);

        expect(screen.getByText('Loading projects...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument();
        });

        // Subject A and Subject B should be present (duplicated Subject A should be grouped)
        expect(screen.getByText('Subject A')).toBeInTheDocument();
        expect(screen.getByText('Subject B')).toBeInTheDocument();
    });

    it('debe manejar error al cargar proyectos', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        ProjectService.llistarProjectes.mockRejectedValue(new Error('Load failed'));

        render(<AdministrateCategories />);

        await waitFor(() => {
            expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument();
        });

        // Should show "No projects with subjects found" or empty state if error occurs and map is empty
        expect(screen.getByText('No projects with subjects found.')).toBeInTheDocument();

        consoleSpy.mockRestore();
    });

    it('debe mostrar mensaje si no hay proyectos', async () => {
         ProjectService.llistarProjectes.mockResolvedValue([]);

         render(<AdministrateCategories />);

         await waitFor(() => {
             expect(screen.getByText('No projects with subjects found.')).toBeInTheDocument();
         });
    });

    it('debe navegar a la vista de detalle al seleccionar una asignatura', async () => {
        render(<AdministrateCategories />);

        await waitFor(() => {
            expect(screen.getByText('Subject A')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Subject A'));

        expect(screen.getByTestId('manage-subject-categories')).toBeInTheDocument();
        expect(screen.getByText('Managing: Subject A')).toBeInTheDocument();
    });

    it('debe volver a la lista al hacer clic en back desde el detalle', async () => {
        render(<AdministrateCategories />);

        await waitFor(() => {
            expect(screen.getByText('Subject A')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Subject A'));
        expect(screen.getByTestId('manage-subject-categories')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Back to List'));

        expect(screen.queryByTestId('manage-subject-categories')).not.toBeInTheDocument();
        expect(screen.getByText('Manage Categories')).toBeInTheDocument();
    });
});
