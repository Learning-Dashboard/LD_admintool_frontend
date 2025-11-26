export class Team {
  constructor({ assignatura, teamName, taigaUrl, githubUrl, students }) {
    this.assignatura = assignatura || '';
    this.externalId = teamName || '';
    this.name = teamName || '';
    this.description = "Imported from AdminTool";
    this.logo = null;         
    this.active = true;
    this.backlogId = null;
    this.isGlobal = false;
    this.anonymized = false;

    this.identities = {
      GITHUB: { dataSource: "GITHUB", url: githubUrl, project: null },
      TAIGA: { dataSource: "TAIGA", url: taigaUrl, project: null },
    };
    this.students = students;
  }
}
