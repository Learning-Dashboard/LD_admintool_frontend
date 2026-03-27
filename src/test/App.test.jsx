import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';
import React from 'react';

// Mock de AdminDashboard para aislar App
vi.mock('../views/AdminDashboard', () => ({
    default: () => <div data-testid="admin-dashboard">Admin Dashboard Mock</div>
}));

describe('App', () => {
    it('debe renderizar la aplicación con el AdminDashboard', () => {
        render(<App />);
        expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
        expect(screen.getByText('Admin Dashboard Mock')).toBeInTheDocument();
    });
});
