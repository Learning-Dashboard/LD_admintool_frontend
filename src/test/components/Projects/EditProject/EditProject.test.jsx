import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EditProject from '../../../../components/Projects/EditProject/EditProject';
import React from 'react';

// Mock del formulario
vi.mock('../../../../components/Projects/EditProject/EditProjectForm', () => ({
    default: ({ project, onDone, onBack }) => (
        <div data-testid="edit-project-form">
            Form for {project.name}
            <button onClick={onDone}>Save</button>
            <button onClick={onBack}>Cancel</button>
        </div>
    )
}));

describe('EditProject', () => {
    const mockProject = { id: 1, name: 'Project A' };

    it('debe mostrar mensaje si no hay proyecto seleccionado', () => {
        const onBackMock = vi.fn();
        render(<EditProject initialProject={null} onBack={onBackMock} />);
        
        expect(screen.getByText('No project selected.')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Back'));
        expect(onBackMock).toHaveBeenCalled();
    });

    it('debe renderizar EditProjectForm si hay proyecto', () => {
        render(<EditProject initialProject={mockProject} />);
        expect(screen.getByTestId('edit-project-form')).toBeInTheDocument();
        expect(screen.getByText('Form for Project A')).toBeInTheDocument();
    });

    it('debe llamar a onUpdate y onBack cuando termina el formulario', () => {
        const onUpdateMock = vi.fn();
        const onBackMock = vi.fn();

        render(<EditProject initialProject={mockProject} onUpdate={onUpdateMock} onBack={onBackMock} />);
        
        fireEvent.click(screen.getByText('Save'));

        expect(onUpdateMock).toHaveBeenCalled();
        expect(onBackMock).toHaveBeenCalled();
    });

    it('debe llamar a onBack cuando se cancela el formulario', () => {
        const onUpdateMock = vi.fn();
        const onBackMock = vi.fn();

        render(<EditProject initialProject={mockProject} onUpdate={onUpdateMock} onBack={onBackMock} />);
        
        fireEvent.click(screen.getByText('Cancel'));
        expect(onBackMock).toHaveBeenCalled();
    });
});
