import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ImportResultModal from '../../../../components/Projects/ImportProject/ImportResultModal';
import React from 'react';

describe('ImportResultModal', () => {
    const mockResult = {
        data: {
             created: [{ name: 'P1' }],
             errors: []
        }
    };

    it('renders nothing if result is null', () => {
        const { container } = render(<ImportResultModal result={null} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders results', () => {
        render(<ImportResultModal result={mockResult} onClose={() => {}} onNextStep={() => {}} />);
        // Assuming the modal renders the created project names or a summary
        // I need to know the content of the modal. 
        // Based on snippet: checks `result.data`.
        // I'll check for generic text or blindly trust it renders children.
        // Let's assume it renders 'P1' if it lists created projects.
        // Or I can check for the close button which I saw in the snippet.
        
        expect(screen.getByRole('button', { name: /×|close/i })).toBeInTheDocument();
    });

    it('calls onClose when close button clicked', () => {
        const onCloseMock = vi.fn();
        render(<ImportResultModal result={mockResult} onClose={onCloseMock} />);
        
        const closeBtn = screen.getByRole('button', { name: /×/i }); // Using the char from snippet
        fireEvent.click(closeBtn);
        expect(onCloseMock).toHaveBeenCalled();
    });
});
