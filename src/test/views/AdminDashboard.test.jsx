import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminDashboard from '../../views/AdminDashboard';
import React from 'react';

// Mocks para los componentes hijos
vi.mock('../../components/Wizard/Wizard', () => ({
    default: () => <div data-testid="wizard-component">Wizard Component</div>
}));

vi.mock('../../components/Projects/PageProjects', () => ({
    default: () => <div data-testid="projects-component">Projects Management Component</div>
}));

describe('AdminDashboard', () => {
    it('debe renderizar el título y los botones de navegación', () => {
        render(<AdminDashboard />);
        expect(screen.getByText('Admin Tool')).toBeInTheDocument();
        expect(screen.getByText('Configuration')).toBeInTheDocument();
        expect(screen.getByText('Management (Edit/Delete)')).toBeInTheDocument();
    });

    it('debe mostrar el componente Wizard por defecto (pestaña Configuration)', () => {
        render(<AdminDashboard />);
        expect(screen.getByTestId('wizard-component')).toBeInTheDocument();
        expect(screen.queryByTestId('projects-component')).not.toBeInTheDocument();
        expect(screen.getByText('Configuration')).toHaveClass('active');
    });

    it('debe cambiar a Management al hacer clic en el botón correspondiente', () => {
        render(<AdminDashboard />);

        const managementBtn = screen.getByText('Management (Edit/Delete)');
        fireEvent.click(managementBtn);

        expect(screen.queryByTestId('wizard-component')).not.toBeInTheDocument();
        expect(screen.getByTestId('projects-component')).toBeInTheDocument();
        expect(managementBtn).toHaveClass('active');
    });

    it('debe volver a Configuration al hacer clic en el botón correspondiente', () => {
        render(<AdminDashboard />);

        // Primero ir a Management
        fireEvent.click(screen.getByText('Management (Edit/Delete)'));
        expect(screen.getByTestId('projects-component')).toBeInTheDocument();

        // Volver a Configuration
        const configBtn = screen.getByText('Configuration');
        fireEvent.click(configBtn);

        expect(screen.getByTestId('wizard-component')).toBeInTheDocument();
        expect(screen.queryByTestId('projects-component')).not.toBeInTheDocument();
        expect(configBtn).toHaveClass('active');
    });
});
