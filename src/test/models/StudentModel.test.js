import { describe, it, expect } from 'vitest';
import { Student } from '../../models/StudentModel';

/**
 * Tests unitarios para StudentModel
 * Valida la creación y estructura del modelo Student
 */
describe('StudentModel', () => {
  it('debe crear un estudiante con todas las identidades', () => {
    const student = new Student({
      name: 'John Doe',
      taigaUser: 'john_taiga',
      githubUser: 'john_github'
    });

    expect(student.name).toBe('John Doe');
    expect(student.identities.TAIGA).toEqual({
      dataSource: 'TAIGA',
      username: 'john_taiga'
    });
    expect(student.identities.GITHUB).toEqual({
      dataSource: 'GITHUB',
      username: 'john_github'
    });
    expect(student.project).toBeNull();
  });

  it('debe crear estudiante solo con identidad de Taiga', () => {
    const student = new Student({
      name: 'Jane Doe',
      taigaUser: 'jane_taiga',
      githubUser: null
    });

    expect(student.name).toBe('Jane Doe');
    expect(student.identities.TAIGA).toEqual({
      dataSource: 'TAIGA',
      username: 'jane_taiga'
    });
    expect(student.identities.GITHUB).toBeUndefined();
  });

  it('debe crear estudiante solo con identidad de GitHub', () => {
    const student = new Student({
      name: 'Bob Smith',
      taigaUser: null,
      githubUser: 'bob_github'
    });

    expect(student.name).toBe('Bob Smith');
    expect(student.identities.GITHUB).toEqual({
      dataSource: 'GITHUB',
      username: 'bob_github'
    });
    expect(student.identities.TAIGA).toBeUndefined();
  });

  it('debe crear estudiante sin identidades', () => {
    const student = new Student({
      name: 'Alice Brown',
      taigaUser: null,
      githubUser: null
    });

    expect(student.name).toBe('Alice Brown');
    expect(student.identities).toEqual({});
    expect(student.project).toBeNull();
  });

  it('debe manejar valores undefined con valores por defecto', () => {
    const student = new Student({});

    expect(student.name).toBe('');
    expect(student.identities).toEqual({});
    expect(student.project).toBeNull();
  });

  it('debe manejar strings vacíos correctamente', () => {
    const student = new Student({
      name: '',
      taigaUser: '',
      githubUser: ''
    });

    expect(student.name).toBe('');
    // Strings vacíos son falsy en JavaScript, por lo que NO se crean las identidades
    expect(student.identities.TAIGA).toBeUndefined();
    expect(student.identities.GITHUB).toBeUndefined();
    expect(student.identities).toEqual({});
  });

  it('debe tener project inicializado en null', () => {
    const student = new Student({
      name: 'Test Student',
      taigaUser: 'test_t',
      githubUser: 'test_g'
    });

    expect(student.project).toBeNull();
  });
});
