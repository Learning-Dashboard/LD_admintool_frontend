import { Team } from "../models/TeamModel";
import { Student } from "../models/StudentModel";

export function parseTeamsFromRows(rows) {
  const [, ...dataRows] = rows;
  
  return dataRows
    .filter((row) => row[1] && row[1].trim() !== "") // Ara teamName està a row[1]
    .map((row) => {
      const assignatura = row[0];      
      const teamName = row[1];          
      const taigaUrl = row[2];          
      const githubUrl = row[3];         
      const students = [];
      
      let col = 4;                      
      while (col < row.length) {
        const name = row[col];
        const taigaUser = row[col + 1];
        const githubUser = row[col + 2];
        
        const allEmpty = [name, taigaUser, githubUser].every(
          (v) => !v || String(v).trim() === ""
        );
        
        if (allEmpty) break;
        
        students.push(
          new Student({
            name,
            taigaUser,
            githubUser,
          })
        );
        
        col += 3;
      }
      
      return new Team({
        assignatura,           
        teamName,
        taigaUrl,
        githubUrl,
        students,
      });
    });
}
