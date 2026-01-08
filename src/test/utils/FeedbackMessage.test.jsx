import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FeedbackMessage from '../../utils/FeedbackMessage';

/**
 * Tests de componente para FeedbackMessage
 * Valida el renderizado y comportamiento del componente de feedback
 */
describe('FeedbackMessage', () => {
  it('debe renderizar mensaje de éxito correctamente', () => {
    const message = { type: 'success', text: 'Operación exitosa' };
    const onClose = () => {};

    render(<FeedbackMessage message={message} onClose={onClose} />);

    expect(screen.getByText('Operación exitosa')).toBeInTheDocument();
    expect(screen.getByText('✅')).toBeInTheDocument();
  });

  it('debe renderizar mensaje de error correctamente', () => {
    const message = { type: 'error', text: 'Ha ocurrido un error' };
    const onClose = () => {};

    render(<FeedbackMessage message={message} onClose={onClose} />);

    expect(screen.getByText('Ha ocurrido un error')).toBeInTheDocument();
    expect(screen.getByText('⚠')).toBeInTheDocument();
  });

  it('debe llamar a onClose cuando se hace clic en el botón cerrar', async () => {
    const user = userEvent.setup();
    let closeCalled = false;
    const onClose = () => { closeCalled = true; };
    const message = { type: 'success', text: 'Test message' };

    render(<FeedbackMessage message={message} onClose={onClose} />);

    const closeButton = screen.getByText('×');
    await user.click(closeButton);

    expect(closeCalled).toBe(true);
  });

  it('no debe renderizar nada cuando message es null', () => {
    const onClose = () => {};
    const { container } = render(<FeedbackMessage message={null} onClose={onClose} />);

    expect(container.firstChild).toBeNull();
  });

  it('no debe renderizar nada cuando message es undefined', () => {
    const onClose = () => {};
    const { container } = render(<FeedbackMessage message={undefined} onClose={onClose} />);

    expect(container.firstChild).toBeNull();
  });

  it('debe tener estilos correctos para mensaje de éxito', () => {
    const message = { type: 'success', text: 'Success' };
    const onClose = () => {};

    render(<FeedbackMessage message={message} onClose={onClose} />);

    const icon = screen.getByText('✅');
    expect(icon).toHaveStyle({ color: '#25971d' });
  });

  it('debe tener estilos correctos para mensaje de error', () => {
    const message = { type: 'error', text: 'Error' };
    const onClose = () => {};

    render(<FeedbackMessage message={message} onClose={onClose} />);

    const icon = screen.getByText('⚠');
    expect(icon).toHaveStyle({ color: '#bb0c00' });
  });

  it('debe mostrar overlay con estilos de posición fija', () => {
    const message = { type: 'success', text: 'Test' };
    const onClose = () => {};

    const { container } = render(<FeedbackMessage message={message} onClose={onClose} />);

    const overlay = container.firstChild;
    expect(overlay).toHaveStyle({
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
    });
  });
});
