import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PageProjects from '../../../components/Projects/PageProjects';
import * as ProjectService from '../../../services/ProjectService';
import React from 'react';

// Mock EditProject
vi.mock('../../../components/Projects/EditProject/EditProject', () => ({
    default: ({ initialProject, onBack }) => (
        <div data-testid="edit-project">
            Editing {initialProject.name}
            <button onClick={onBack}>Back</button>
        </div>
    )
}));

describe('PageProjects', () => {
    const mockProjects = [
        { id: '1', name: 'Project A', subject: 'Subject 1', students: [] },
        { id: '2', name: 'Project B', subject: 'Subject 2', students: [] }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(ProjectService, 'llistarProjectes').mockResolvedValue(mockProjects);
        vi.spyOn(ProjectService, 'esborrarProjecte').mockResolvedValue({});
        // Mock global alert and confirm
        global.alert = vi.fn();
        global.confirm = vi.fn(() => true);
    });

    it('debe cargar y mostrar los botones de edición y borrado', async () => {
        render(<PageProjects />);

        await waitFor(() => {
            expect(screen.getByText('Project Management')).toBeInTheDocument();
        });

        expect(screen.getByText('✏️ Edit Teams')).toBeInTheDocument();
        expect(screen.getByText('🗑️ Delete Teams')).toBeInTheDocument();
    });

    it('debe mostrar los proyectos agrupados al seleccionar el modo de edición', async () => {
        render(<PageProjects />);

        await waitFor(() => {
            expect(screen.queryByText('Subject 1')).not.toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('✏️ Edit Teams'));

        expect(screen.getByText('Subject 1')).toBeInTheDocument();
        expect(screen.getByText('Subject 2')).toBeInTheDocument();
        expect(screen.getByText('Project A')).toBeInTheDocument();
    });

    it('debe navegar al editor al hacer clic en un proyecto en modo editar', async () => {
        render(<PageProjects />);
        
        // Activar modo edición
        fireEvent.click(screen.getByText('✏️ Edit Teams'));
        await waitFor(() => screen.getByText('Project A'));

        // Clic en el proyecto
        fireEvent.click(screen.getByText('Project A'));

        expect(screen.getByTestId('edit-project')).toBeInTheDocument();
        expect(screen.getByText('Editing Project A')).toBeInTheDocument();
    });

    it('debe llamar a borrar proyecto al hacer clic en borrar (en modo borrar)', async () => {
        render(<PageProjects />);
        
        // Activar modo borrado
        fireEvent.click(screen.getByText('🗑️ Delete Teams'));
        await waitFor(() => screen.getByText('Project A'));

        // Clic en el proyecto para borrar
        fireEvent.click(screen.getByText('Project A'));

        expect(global.confirm).toHaveBeenCalled();
        expect(ProjectService.esborrarProjecte).toHaveBeenCalledWith('1');
        await waitFor(() => {
             expect(global.alert).toHaveBeenCalledWith("Project deleted successfully");
        });
    });

    it('no debe borrar si el usuario cancela la confirmación', async () => {
        global.confirm.mockReturnValue(false);
        render(<PageProjects />);
        
        fireEvent.click(screen.getByText('🗑️ Delete Teams'));
        await waitFor(() => screen.getByText('Project A'));

        fireEvent.click(screen.getByText('Project A'));

        expect(ProjectService.esborrarProjecte).not.toHaveBeenCalled();
    });
});
