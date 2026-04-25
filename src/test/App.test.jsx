import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';
import React from 'react';

// Mock de AdminDashboard para aislar App
vi.mock('../views/AdminDashboard', () => ({
    default: () => <div data-testid="admin-dashboard">Admin Dashboard Mock</div>
}));

describe('App', () => {
    it('debe mostrar login y renderizar el AdminDashboard tras autenticar', () => {
        sessionStorage.clear();
        render(<App />);

        expect(screen.getByRole('heading', { name: 'Admin Tool Login' })).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'admin' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'admin' } });
        fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

        expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
        expect(screen.getByText('Admin Dashboard Mock')).toBeInTheDocument();
    });
});
