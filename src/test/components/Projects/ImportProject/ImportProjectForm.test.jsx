import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ImportProjectForm from '../../../../components/Projects/ImportProject/ImportProjectForm';
import * as XLSX from 'xlsx';
import React from 'react';

// Mock xlsx
vi.mock('xlsx', () => ({
  read: vi.fn(),
  utils: {
    sheet_to_json: vi.fn()
  }
}));

describe('ImportProjectForm', () => {
  it('renders file input', () => {
    const { container } = render(<ImportProjectForm onDataParsed={() => {}} />);
    // Check for input type=file, since getByRole('textbox') does not apply
    const input = container.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();
  });

  it('parses excel file on upload', async () => {
    const onDataParsedMock = vi.fn();
    XLSX.read.mockReturnValue({
        SheetNames: ['Sheet1'],
        Sheets: { 'Sheet1': {} }
    });
    XLSX.utils.sheet_to_json.mockReturnValue([['Header'], ['Row1']]);

    render(<ImportProjectForm onDataParsed={onDataParsedMock} />);
    
    const file = new File(['dummy content'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const input = document.querySelector('input[type="file"]');
    
    fireEvent.change(input, { target: { files: [file] } });

    // FileReader is async. Need to wait.
    // We can't easily mock FileReader global without jsdom setup or heavy mocking.
    // Vitest/Jest usually handles FileReader if using modern jsdom.
    
    // Wait for the async logic inside onload to trigger
    await waitFor(() => {
       expect(XLSX.read).toHaveBeenCalled();
    });
    
    expect(onDataParsedMock).toHaveBeenCalledWith([['Header'], ['Row1']]);
  });

  it('handles error during parsing', async () => {
    XLSX.read.mockImplementation(() => { throw new Error('Parse error'); });
    
    render(<ImportProjectForm onDataParsed={() => {}} />);
    
    const file = new File(['dummy'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const input = document.querySelector('input[type="file"]');
    
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
        expect(screen.getByText("Error al llegir l'Excel")).toBeInTheDocument();
    });
  });
});
