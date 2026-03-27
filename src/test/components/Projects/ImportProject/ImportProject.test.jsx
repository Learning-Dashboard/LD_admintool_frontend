import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ImportProject from '../../../../components/Projects/ImportProject/ImportProject';
import * as ProjectService from '../../../../services/ProjectService';
import * as ExcelParser from '../../../../utils/excelParser';
import React from 'react';

// Mocks de componentes hijos
vi.mock('../../../../components/Projects/ImportProject/ImportProjectForm', () => ({
    default: ({ onDataParsed }) => (
        <div data-testid="import-form">
            <button onClick={() => onDataParsed([{ name: 'row1' }])}>Simulate Parse</button>
        </div>
    )
}));

vi.mock('../../../../components/Projects/ImportProject/ImportProjectPreview', () => ({
    default: ({ data, onConfirm, onCancel }) => (
        <div data-testid="import-preview">
            Preview {data.length} items
            <button onClick={() => onConfirm(data)}>Confirm Import</button>
            <button onClick={onCancel}>Cancel Import</button>
        </div>
    )
}));

vi.mock('../../../../components/Projects/ImportProject/ImportResultModal', () => ({
    default: ({ result, onClose, onNextStep }) => (
        <div data-testid="result-modal">
            {result.type === 'success' ? 'Success Modal' : 'Error Modal'}
            <button onClick={onClose}>Close</button>
            {onNextStep && <button onClick={onNextStep}>Next Step</button>}
        </div>
    )
}));

describe('ImportProject', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock simple parser
        vi.spyOn(ExcelParser, 'parseTeamsFromRows').mockReturnValue([{ name: 'ProjectParsed' }]);
        vi.spyOn(ProjectService, 'importarProjectes').mockResolvedValue({ data: 'Success' });
    });

    it('debe renderizar inicialmente el formulario de importación', () => {
        render(<ImportProject />);
        expect(screen.getByTestId('import-form')).toBeInTheDocument();
        expect(screen.queryByTestId('import-preview')).not.toBeInTheDocument();
    });

    it('debe cambiar a preview cuando se parsean datos', () => {
        render(<ImportProject />);
        
        fireEvent.click(screen.getByText('Simulate Parse'));
        
        expect(ExcelParser.parseTeamsFromRows).toHaveBeenCalled();
        expect(screen.getByTestId('import-preview')).toBeInTheDocument();
        expect(screen.getByText('Preview 1 items')).toBeInTheDocument();
    });

    it('debe llamar a importarProjectes al confirmar', async () => {
        const onRefreshStatusMock = vi.fn();
        const onCompletedMock = vi.fn();

        render(<ImportProject onRefreshStatus={onRefreshStatusMock} onCompleted={onCompletedMock} />);
        
        // Ir a preview
        fireEvent.click(screen.getByText('Simulate Parse'));
        // Confirmar
        fireEvent.click(screen.getByText('Confirm Import'));

        await waitFor(() => {
            expect(ProjectService.importarProjectes).toHaveBeenCalled();
        });

        // Debe mostrar el modal de éxito
        expect(screen.getByTestId('result-modal')).toBeInTheDocument();
        expect(screen.getByText('Success Modal')).toBeInTheDocument();
        
        expect(onRefreshStatusMock).toHaveBeenCalled();
        expect(onCompletedMock).toHaveBeenCalled();
    });

    it('debe volver al formulario al cancelar la preview', () => {
        render(<ImportProject />);
        
        fireEvent.click(screen.getByText('Simulate Parse'));
        expect(screen.getByTestId('import-preview')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Cancel Import'));
        expect(screen.queryByTestId('import-preview')).not.toBeInTheDocument();
        expect(screen.getByTestId('import-form')).toBeInTheDocument();
    });

    it('debe manejar errores en la importación', async () => {
        ProjectService.importarProjectes.mockRejectedValue(new Error('API Error'));

        render(<ImportProject />);
        
        fireEvent.click(screen.getByText('Simulate Parse'));
        fireEvent.click(screen.getByText('Confirm Import'));

        await waitFor(() => {
            expect(screen.getByText(/Error:/i)).toBeInTheDocument();
            expect(screen.getByText(/API Error/i)).toBeInTheDocument();
        });

        // No debería mostrar el modal de éxito
        expect(screen.queryByTestId('result-modal')).not.toBeInTheDocument();
    });

    it('debe cerrar el modal de resultados', async () => {
        render(<ImportProject />);
        fireEvent.click(screen.getByText('Simulate Parse'));
        fireEvent.click(screen.getByText('Confirm Import'));
        
        await waitFor(() => screen.getByTestId('result-modal'));

        fireEvent.click(screen.getByText('Close'));
        expect(screen.queryByTestId('result-modal')).not.toBeInTheDocument();
    });
});
