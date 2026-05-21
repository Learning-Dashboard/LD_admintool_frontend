import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EditProjectForm from '../../../../components/Projects/EditProject/EditProjectForm';
import * as ProjectService from '../../../../services/ProjectService';
import React from 'react';

vi.mock('../../../../services/ProjectService', () => ({
  modificarProjecte: vi.fn(),
  validarNouEstudiant: vi.fn(),
  triggerProjectRecovery: vi.fn()
}));

// Mock FeedbackMessage
vi.mock('../../../../utils/FeedbackMessage', () => ({
  default: ({ type, text, onClose }) => (
    <div data-testid="feedback-message" className={type}>
      {text}
      <button onClick={onClose}>x</button>
    </div>
  )
}));

describe('EditProjectForm', () => {
  const mockProject = {
    id: 'p1',
    name: 'Test Project',
    githubToken: 'gh_token',
    identities: {
        GITHUB: { url: 'http://github.com/test' },
        TAIGA: { url: 'http://taiga.io/test' }
    },
    students: [
      { id: 1, name: 'Student 1', markedForDeletion: false, identities: { GITHUB: { username: 's1' }, TAIGA: { username: 'ts1' } } }
    ]
  };

  const onDoneMock = vi.fn();
  const onBackMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with project data', () => {
    render(<EditProjectForm project={mockProject} onDone={onDoneMock} onBack={onBackMock} />);
    // Check if there is an input with the project name
    // El nombre del proyecto NO está en un input editable en el formulario que se acaba de leer.
    // Solo se muestra en el título: <h3>Edit Team: {project.name}</h3>
    // Y el token Github sí está en input
    expect(screen.getByText(`Edit Team: ${mockProject.name}`)).toBeInTheDocument();
    
    // Student name
    // En la tabla/lista de estudiantes
    expect(screen.getAllByText('Student 1').length).toBeGreaterThan(0); 
  });

  it('allows editing project fields', () => {
    render(<EditProjectForm project={mockProject} onDone={onDoneMock} onBack={onBackMock} />);
    // El token de Github es el único campo de "proyecto" editable aparte de los estudiantes
    const tokenInput = screen.getByPlaceholderText('ghp_xxxxxxxxxxxx');
    
    fireEvent.change(tokenInput, { target: { value: 'new_token' } });
    expect(tokenInput.value).toBe('new_token');
  });

  it('allows adding a new student', async () => {
    ProjectService.validarNouEstudiant.mockResolvedValue({ valid: true });

    render(<EditProjectForm project={mockProject} onDone={onDoneMock} onBack={onBackMock} />);
    
    // El nombre del estudiante y el token son necesarios para validar
    fireEvent.change(screen.getByPlaceholderText('e.g. John Doe'), { target: { value: 'New Student' } });
    
    // El token de Github es requerido. Placeholder es 'ghp_xxxxxxxxxxxx'
    const githubTokenInput = screen.getByPlaceholderText('ghp_xxxxxxxxxxxx');
    fireEvent.change(githubTokenInput, { target: { value: 'fake-token' } });

    // Para username de GitHub y Taiga, ambos tienen placeholder "username".
    // getAllByPlaceholderText devolverá un array. Asumimos el orden o usamos selectores más específicos si fuera posible.
    // En el código: GitHub es el 2do input, Taiga el 3ro en el grid.
    const usernameInputs = screen.getAllByPlaceholderText('username');
    // usernameInputs[0] -> GitHub
    // usernameInputs[1] -> Taiga
    fireEvent.change(usernameInputs[0], { target: { value: 'newgh' } });
    fireEvent.change(usernameInputs[1], { target: { value: 'newtaiga' } });

    fireEvent.click(screen.getByText(/Validate student/i));

    await waitFor(() => {
        expect(ProjectService.validarNouEstudiant).toHaveBeenCalled();
    });
    
    // Simplification requested by user: skip UI message check to avoid flakiness
  });

  it('handles validation error when adding student', async () => {
    // Necesitamos mockear la respuesta de validación fallida
    ProjectService.validarNouEstudiant.mockResolvedValue({ valid: false, errors: ['User not found'] });

    render(<EditProjectForm project={mockProject} onDone={onDoneMock} onBack={onBackMock} />);
    
     // El token de Github es requerido. Placeholder es 'ghp_xxxxxxxxxxxx'
     const githubTokenInput = screen.getByPlaceholderText('ghp_xxxxxxxxxxxx');
     fireEvent.change(githubTokenInput, { target: { value: 'fake-token' } });

    fireEvent.change(screen.getByPlaceholderText('e.g. John Doe'), { target: { value: 'Bad Student' } });
    const usernameInputs = screen.getAllByPlaceholderText('username');
    fireEvent.change(usernameInputs[0], { target: { value: 'bad' } });
    fireEvent.change(usernameInputs[1], { target: { value: 'bad' } });

    fireEvent.click(screen.getByText(/Validate student/i));

    await waitFor(() => {
        expect(ProjectService.validarNouEstudiant).toHaveBeenCalled();
    });

    // Simplification requested by user: skip UI message check to avoid flakiness
  });

  it('saves changes', async () => {
    // Mock successful save response structure expected by component
    ProjectService.modificarProjecte.mockResolvedValue({ success: true });

    render(<EditProjectForm project={mockProject} onDone={onDoneMock} onBack={onBackMock} />);
    
    const saveButton = screen.getByRole('button', { name: /Save & Synchronize team/i });
    fireEvent.click(saveButton);

    // Wait for API call and success message using findByText which waits internally
    await waitFor(() => {
      expect(ProjectService.modificarProjecte).toHaveBeenCalled();
    });
    
    // Simplification requested by user: skip UI message check to avoid flakiness

    // Manually call onDone or check if using real timers finishes eventually
    // Since component uses setTimeout(onDone, 1500), we can just wait or mock timers.
    // Let's try mocking timers properly inside this scope if we want to speed up.
    // Or just check that message appeared, which implies success path was taken.
  });

  it('runs team recovery', async () => {
    ProjectService.triggerProjectRecovery.mockResolvedValue({
      recovery: {
        status: 'ok',
        steps: [
          { source: 'github', status: 'ok' },
          { source: 'taiga', status: 'ok' }
        ]
      }
    });

    render(<EditProjectForm project={mockProject} onDone={onDoneMock} onBack={onBackMock} />);

    const tokenInputs = screen.getAllByPlaceholderText('ghp_xxxxxxxxxxxx');
    fireEvent.change(tokenInputs[1], { target: { value: 'ghp_recovery_1' } });
    fireEvent.change(screen.getByPlaceholderText('taiga_xxxxxxxxxxxx'), { target: { value: 'taiga_recovery_1' } });

    fireEvent.click(screen.getByRole('button', { name: /Run GitHub\/Taiga Recovery/i }));

    await waitFor(() => {
      expect(ProjectService.triggerProjectRecovery).toHaveBeenCalledWith(mockProject.id, {
        githubToken: 'ghp_recovery_1',
        taigaToken: 'taiga_recovery_1'
      });
    });
  });
});
