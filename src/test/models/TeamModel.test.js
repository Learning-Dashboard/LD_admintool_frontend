import { describe, it, expect } from 'vitest';
import { Team } from '../../models/TeamModel';
import { Student } from '../../models/StudentModel';

/**
 * Tests unitarios para TeamModel
 * Valida la creación y estructura del modelo Team
 */
describe('TeamModel', () => {
  it('debe crear un equipo con todos los campos correctamente', () => {
    const students = [
      new Student({ name: 'John', taigaUser: 'john_t', githubUser: 'john_g' })
    ];

    const team = new Team({
      subject: 'Math',
      teamName: 'Team A',
      taigaUrl: 'https://taiga.io/teamA',
      githubUrl: 'https://github.com/teamA',
      students: students
    });

    expect(team.subject).toBe('Math');
    expect(team.externalId).toBe('Team A');
    expect(team.name).toBe('Team A');
    expect(team.description).toBe('Imported from AdminTool');
    expect(team.active).toBe(true);
    expect(team.isGlobal).toBe(false);
    expect(team.anonymized).toBe(false);
    expect(team.students).toEqual(students);
  });

  it('debe configurar identidades de GITHUB y TAIGA correctamente', () => {
    const team = new Team({
      subject: 'Physics',
      teamName: 'Team B',
      taigaUrl: 'https://taiga.io/teamB',
      githubUrl: 'https://github.com/teamB',
      students: []
    });

    expect(team.identities.GITHUB).toEqual({
      dataSource: 'GITHUB',
      url: 'https://github.com/teamB',
      project: null
    });

    expect(team.identities.TAIGA).toEqual({
      dataSource: 'TAIGA',
      url: 'https://taiga.io/teamB',
      project: null
    });
  });

  it('debe manejar valores undefined con valores por defecto', () => {
    const team = new Team({});

    expect(team.subject).toBe('');
    expect(team.externalId).toBe('');
    expect(team.name).toBe('');
    expect(team.logo).toBeNull();
    expect(team.backlogId).toBeNull();
  });

  it('debe aceptar estudiantes vacíos', () => {
    const team = new Team({
      subject: 'Chemistry',
      teamName: 'Team C',
      taigaUrl: 'https://taiga.io/teamC',
      githubUrl: 'https://github.com/teamC',
      students: []
    });

    expect(team.students).toEqual([]);
  });

  it('debe usar teamName para name y externalId', () => {
    const team = new Team({
      subject: 'Biology',
      teamName: 'Unique Team Name',
      taigaUrl: '',
      githubUrl: '',
      students: []
    });

    expect(team.name).toBe('Unique Team Name');
    expect(team.externalId).toBe('Unique Team Name');
  });
});
