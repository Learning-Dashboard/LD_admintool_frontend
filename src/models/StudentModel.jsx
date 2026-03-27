export class Student {
  constructor({ name, taigaUser, githubUser }) {
    this.name = name || "";

    this.identities = {};
    if (taigaUser)
      this.identities["TAIGA"] = { dataSource: "TAIGA", username: taigaUser };
    if (githubUser)
      this.identities["GITHUB"] = { dataSource: "GITHUB", username: githubUser };

    this.project = null;
  }
}
