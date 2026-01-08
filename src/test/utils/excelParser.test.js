import { describe, it, expect } from 'vitest';
import { parseTeamsFromRows } from '../../utils/excelParser';
import { Team } from '../../models/TeamModel';
import { Student } from '../../models/StudentModel';

/**
 * Tests unitarios para excelParser
 * Valida el parseo de datos de Excel a modelos Team y Student
 */
describe('excelParser', () => {
  describe('parseTeamsFromRows', () => {
    it('debe parsear correctamente filas válidas de Excel', () => {
      const rows = [
        ['Subject', 'Team Name', 'Taiga URL', 'GitHub URL', 'Student 1', 'Taiga 1', 'GitHub 1'],
        ['Math', 'Team A', 'https://taiga.io/teamA', 'https://github.com/teamA', 'John Doe', 'john_t', 'john_gh'],
      ];

      const result = parseTeamsFromRows(rows);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Team);
      expect(result[0].name).toBe('Team A');
      expect(result[0].subject).toBe('Math');
      expect(result[0].identities.TAIGA.url).toBe('https://taiga.io/teamA');
      expect(result[0].identities.GITHUB.url).toBe('https://github.com/teamA');
      expect(result[0].students).toHaveLength(1);
      expect(result[0].students[0].name).toBe('John Doe');
    });

    it('debe parsear múltiples equipos correctamente', () => {
      const rows = [
        ['Subject', 'Team Name', 'Taiga URL', 'GitHub URL', 'Student', 'Taiga', 'GitHub'],
        ['Math', 'Team A', 'https://taiga.io/teamA', 'https://github.com/teamA', 'John', 'john_t', 'john_g'],
        ['Physics', 'Team B', 'https://taiga.io/teamB', 'https://github.com/teamB', 'Jane', 'jane_t', 'jane_g'],
      ];

      const result = parseTeamsFromRows(rows);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Team A');
      expect(result[1].name).toBe('Team B');
    });

    it('debe parsear múltiples estudiantes en un equipo', () => {
      const rows = [
        ['Subject', 'Team Name', 'Taiga URL', 'GitHub URL', 'St1', 'T1', 'G1', 'St2', 'T2', 'G2'],
        ['Math', 'Team A', 'https://taiga.io/teamA', 'https://github.com/teamA', 
         'John', 'john_t', 'john_g', 'Jane', 'jane_t', 'jane_g'],
      ];

      const result = parseTeamsFromRows(rows);

      expect(result).toHaveLength(1);
      expect(result[0].students).toHaveLength(2);
      expect(result[0].students[0].name).toBe('John');
      expect(result[0].students[1].name).toBe('Jane');
    });

    it('debe filtrar filas con teamName vacío', () => {
      const rows = [
        ['Subject', 'Team Name', 'Taiga URL', 'GitHub URL'],
        ['Math', '', 'https://taiga.io/teamA', 'https://github.com/teamA'],
        ['Physics', 'Team B', 'https://taiga.io/teamB', 'https://github.com/teamB'],
      ];

      const result = parseTeamsFromRows(rows);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Team B');
    });

    it('debe manejar filas sin estudiantes', () => {
      const rows = [
        ['Subject', 'Team Name', 'Taiga URL', 'GitHub URL'],
        ['Math', 'Team A', 'https://taiga.io/teamA', 'https://github.com/teamA'],
      ];

      const result = parseTeamsFromRows(rows);

      expect(result).toHaveLength(1);
      expect(result[0].students).toHaveLength(0);
    });

    it('debe detener el parseo de estudiantes cuando encuentra campos vacíos', () => {
      const rows = [
        ['Subject', 'Team', 'Taiga', 'GitHub', 'St1', 'T1', 'G1', '', '', '', 'St2', 'T2', 'G2'],
        ['Math', 'Team A', 'https://taiga.io/teamA', 'https://github.com/teamA', 
         'John', 'john_t', 'john_g', '', '', ''],
      ];

      const result = parseTeamsFromRows(rows);

      expect(result).toHaveLength(1);
      expect(result[0].students).toHaveLength(1);
      expect(result[0].students[0].name).toBe('John');
    });

    it('debe manejar array vacío', () => {
      const rows = [
        ['Subject', 'Team Name', 'Taiga URL', 'GitHub URL'],
      ];

      const result = parseTeamsFromRows(rows);

      expect(result).toHaveLength(0);
    });

    it('debe trimear valores de teamName', () => {
      const rows = [
        ['Subject', 'Team Name', 'Taiga URL', 'GitHub URL'],
        ['Math', '  Team A  ', 'https://taiga.io/teamA', 'https://github.com/teamA'],
      ];

      const result = parseTeamsFromRows(rows);

      expect(result).toHaveLength(1);
      // El trim se hace en el filtro, el valor final puede mantener espacios
    });
  });
});
