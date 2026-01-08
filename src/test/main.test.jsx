import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import App from '../App';

// Mocks simples para que main no pete
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({ render: vi.fn() }))
}));

describe('main.jsx', () => {
  it('renders without crashing (smoke test)', async () => {
    // Como main.jsx se ejecuta al importarse, simplemente importarlo debería disparar el render
    // Pero es difícil testear efectos secundarios de importación.
    // Una alternativa es comprobar que se llama a createRoot.
    
    // Dynamic import to trigger execution
    await import('../main.jsx');
    
    const { createRoot } = await import('react-dom/client');
    expect(createRoot).toHaveBeenCalledWith(document.getElementById('root'));
  });
});
