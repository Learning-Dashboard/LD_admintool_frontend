import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CategorySelect, { useCategorySelectOptions } from '../../components/Categories/CategorySelect';
import { renderHook } from '@testing-library/react';

describe('CategorySelect Component', () => {
  const mockOptions = [
    { displayName: 'Category 1', value: JSON.stringify({ name: 'Category 1' }) },
    { displayName: 'Category 2', value: JSON.stringify({ name: 'Category 2' }) }
  ];

  it('debería renderizar el select con placeholder', () => {
    const mockOnChange = vi.fn();
    render(<CategorySelect value="" onChange={mockOnChange} options={mockOptions} />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeTruthy();
    expect(screen.getByText('-- Selecciona --')).toBeTruthy();
  });

  it('debería renderizar todas las opciones', () => {
    const mockOnChange = vi.fn();
    render(<CategorySelect value="" onChange={mockOnChange} options={mockOptions} />);
    
    expect(screen.getByText('Category 1')).toBeTruthy();
    expect(screen.getByText('Category 2')).toBeTruthy();
  });

  it('debería tener el valor seleccionado correcto', () => {
    const mockOnChange = vi.fn();
    const selectedValue = JSON.stringify({ name: 'Category 1' });
    
    render(<CategorySelect value={selectedValue} onChange={mockOnChange} options={mockOptions} />);
    
    const select = screen.getByRole('combobox');
    expect(select.value).toBe(selectedValue);
  });

  it('debería pasar props adicionales al select', () => {
    const mockOnChange = vi.fn();
    render(
      <CategorySelect 
        value="" 
        onChange={mockOnChange} 
        options={mockOptions}
        className="custom-class"
        data-testid="category-select"
      />
    );
    
    const select = screen.getByTestId('category-select');
    expect(select.className).toBe('custom-class');
  });
});

describe('useCategorySelectOptions Hook', () => {
  it('debería retornar opciones únicas por nombre', () => {
    const categories = [
      { name: 'Security', patternGroup: null },
      { name: 'Performance', patternGroup: null },
      { name: 'Security', patternGroup: null } // Duplicado
    ];

    const { result } = renderHook(() => useCategorySelectOptions(categories));
    
    expect(result.current).toHaveLength(2);
    expect(result.current[0].displayName).toBe('Security');
    expect(result.current[1].displayName).toBe('Performance');
  });

  it('debería agrupar categorías por patternGroup', () => {
    const categories = [
      { name: '1 Testing', patternGroup: 'testing-group' },
      { name: '2 Testing', patternGroup: 'testing-group' },
      { name: '1 Quality', patternGroup: 'quality-group' }
    ];

    const { result } = renderHook(() => useCategorySelectOptions(categories));
    
    expect(result.current).toHaveLength(2);
    expect(result.current[0].displayName).toBe('n Testing');
    expect(result.current[1].displayName).toBe('n Quality');
  });

  it('debería manejar categorías con y sin patternGroup', () => {
    const categories = [
      { name: 'Simple Category', patternGroup: null },
      { name: '1 Grouped', patternGroup: 'group-1' }
    ];

    const { result } = renderHook(() => useCategorySelectOptions(categories));
    
    expect(result.current).toHaveLength(2);
  });

  it('debería retornar array vacío para entrada vacía', () => {
    const { result } = renderHook(() => useCategorySelectOptions([]));
    
    expect(result.current).toHaveLength(0);
  });

  it('debería serializar correctamente los valores', () => {
    const categories = [
      { name: 'Test Category', patternGroup: null }
    ];

    const { result } = renderHook(() => useCategorySelectOptions(categories));
    
    const value = JSON.parse(result.current[0].value);
    expect(value).toEqual({ name: 'Test Category' });
  });
});
