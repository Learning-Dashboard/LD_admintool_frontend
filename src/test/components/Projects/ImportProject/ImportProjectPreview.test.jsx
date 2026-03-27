import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ImportProjectPreview from '../../../../components/Projects/ImportProject/ImportProjectPreview';
import React from 'react';

describe('ImportProjectPreview', () => {
  const mockData = [
    { 
        name: 'Team 1', 
        subject: 'Subject A', 
        identities: { GITHUB: {}, TAIGA: {} },
        students: [{ name: 'S1', identities: { GITHUB: {}, TAIGA: {} } }] 
    },
    { 
        name: 'Team 2', 
        subject: 'Subject A', 
        identities: {},
        students: [] 
    },
    { 
        name: 'Team 3', 
        subject: 'Subject B', 
        identities: {}, 
        students: [] 
    }
  ];

  it('renders nothing if no data', () => {
    const { container } = render(<ImportProjectPreview data={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('groups teams by subject', () => {
    render(<ImportProjectPreview data={mockData} />);
    expect(screen.getByText('Subject A')).toBeInTheDocument();
    expect(screen.getByText('Subject B')).toBeInTheDocument();
    expect(screen.getByText('Team 1')).toBeInTheDocument();
    expect(screen.getByText('Team 3')).toBeInTheDocument();
  });

  it('allows entering tokens', () => {
    render(<ImportProjectPreview data={mockData} />);
    
    // Find input for Subject A
    const inputs = screen.getAllByPlaceholderText(/Token for/);
    fireEvent.change(inputs[0], { target: { value: 'token_a' } });
    
    expect(inputs[0].value).toBe('token_a');
  });

  it('calls onConfirm with tokens added', () => {
    const onConfirmMock = vi.fn();
    render(<ImportProjectPreview data={mockData} onConfirm={onConfirmMock} />);
    
    // Check if Confirm button is enabled/disabled
    // Note: mockData has 3 teams, grouped into 2 subjects (Subject A, Subject B).
    // So distinct subjects = 2. We expect 2 token inputs.
    
    // Look for button with partial check for "Import 3 teams" or similar
    // We assume the button shows count of teams
    const confirmBtn = screen.getByRole('button', { name: /Import 3 teams/i });
    expect(confirmBtn).toBeDisabled();

    // Fill tokens. There should be one input per Subject.
    const inputs = screen.getAllByPlaceholderText(/Token for/);
    expect(inputs.length).toBeGreaterThan(0);

    inputs.forEach((input, idx) => {
        fireEvent.change(input, { target: { value: `token_${idx}` } });
    });
    
    expect(confirmBtn).not.toBeDisabled();
    
    fireEvent.click(confirmBtn);
    
    expect(onConfirmMock).toHaveBeenCalled();
    // Check if tokens are passed in the data
    const args = onConfirmMock.mock.calls[0][0];
    expect(args[0].githubToken).toBeDefined();
  });
});
