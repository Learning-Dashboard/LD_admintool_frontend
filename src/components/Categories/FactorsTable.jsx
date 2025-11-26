import React, { useState, useMemo } from "react";
import { editFactor } from "../../services/FactorsService";
import FeedbackMessage from "../../utils/FeedbackMessage.jsx";
import CategorySelect, { useCategorySelectOptions } from "./CategorySelect.jsx";


function FactorsTable({ factors, allFactors, allCategories, project, teams}) {
  const [catMap, setCatMap] = useState({});
  const [saving, setSaving] = useState({});
  const [message, setMessage] = useState(null);

  const selectOptions = useCategorySelectOptions(allCategories);

  const getCatValue = id => {
    // Si ya hay un valor seleccionado en catMap, usarlo
    if (catMap[id]) return catMap[id];
    
    // Si no, buscar el factor y convertir su categoryName a formato JSON
    const factor = factors.find(f => f.id === id);
    if (!factor?.categoryName) return "";
    
    // Buscar si la categoría tiene un patternGroup
    const category = allCategories.find(c => c.name === factor.categoryName);
    if (category?.patternGroup) {
      return JSON.stringify({ patternGroup: category.patternGroup });
    } else {
      return JSON.stringify({ name: factor.categoryName });
    }
  };

  const handleChange = (id, value) => setCatMap(m => ({ ...m, [id]: value }));

  const handleSave = async factor => {
    setSaving(s => ({ ...s, [factor.id]: true }));
    try {
      const selected = catMap[factor.id] ?? "";
      if (!selected) {
        setMessage({ type: "error", text: "No category selected!" });
        setSaving(s => ({ ...s, [factor.id]: false }));
        return;
      }

      // Parse selected category
      let selectedCat;
      try {
        selectedCat = JSON.parse(selected);
      } catch (err) {
        console.error("Failed to parse selected category:", selected);
        setMessage({ type: "error", text: "Invalid category format!" });
        setSaving(s => ({ ...s, [factor.id]: false }));
        return;
      }
      
      // Buscar todos los factores con el mismo externalId que pertenezcan a equipos de esta asignatura
      const factorsToUpdate = allFactors.filter(f => 
        f.externalId === factor.externalId && 
        f.project && 
        teams && teams.some(t => (t.externalId || t.name) === f.project.externalId)
      );

      console.log(`Updating ${factorsToUpdate.length} factors with externalId ${factor.externalId}`);

      // Iterar por todos los factores (uno por cada equipo)
      for (const factorToUpdate of factorsToUpdate) {
        if (!factorToUpdate.project) continue;

        // Buscar el equipo correspondiente a este factor
        const team = teams.find(t => (t.externalId || t.name) === factorToUpdate.project.externalId);
        if (!team) continue;

        let categoryToAssign;
        if (selectedCat.patternGroup) {
          // CAS 2: factor de equip amb patró → buscar categoria real segons nombre d'estudiants
          const n = team.students?.length || 0;
          // Buscar la categoría real que tiene el mismo patternGroup y empieza con "N members"
          const found = allCategories.find(
            c => c.patternGroup === selectedCat.patternGroup && c.name.startsWith(`${n} members`)
          );
          categoryToAssign = found ? found.name : "";
          console.log(`Pattern category for team ${team.name} (${n} students): patternGroup=${selectedCat.patternGroup} → ${categoryToAssign}`);
        } else {
          // CAS 1: factor de equip sense patró → usar nombre directe
          categoryToAssign = selectedCat.name;
        }

        const body = { categoryName: categoryToAssign };
        await editFactor(factorToUpdate.id, body, factorToUpdate.project.externalId);
      }
      
      setMessage({ type: "success", text: `Factor saved to ${factorsToUpdate.length} team(s)!` });
    } catch (err) {
      console.error("Error saving factor category:", err);
      setMessage({ type: "error", text: "Error saving factor!" });
    }
    setSaving(s => ({ ...s, [factor.id]: false }));
  };

  return (
    <div style={{ width: "100%", overflowX: 'auto' }}>
      {message && <FeedbackMessage message={message} onClose={() => setMessage(null)} />}
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
        <thead>
          <tr>
            <th style={{ padding: '0.7em 1.2em', textAlign: 'left' }}>Assessment ID</th>
            <th style={{ padding: '0.7em 1.2em', textAlign: 'left' }}>Name</th>
            <th style={{ padding: '0.7em 1.2em', textAlign: 'left' }}>Description</th>
            <th style={{ padding: '0.7em 1.2em', textAlign: 'left' }}>Category</th>
            <th style={{ padding: '0.7em 1.2em', textAlign: 'left' }}></th>
          </tr>
        </thead>
        <tbody>
          {factors.map(factor => (
            <React.Fragment key={factor.id}>
              <tr>
                <td style={{ padding: '0.7em 1.2em', textAlign: 'left' }}>{factor.externalId || factor.id}</td>
                <td style={{ padding: '0.7em 1.2em', textAlign: 'left' }}>{factor.name}</td>
                <td style={{ padding: '0.7em 1.2em', textAlign: 'left' }}>{factor.description}</td>
                <td style={{ padding: '0.7em 1.2em', textAlign: 'left' }}>
                  <CategorySelect
                    value={getCatValue(factor.id)}
                    onChange={e => handleChange(factor.id, e.target.value)}
                    options={selectOptions}
                  />
                </td>
                <td style={{ padding: '0.7em 1.2em', textAlign: 'left' }}>
                  <button
                    disabled={saving[factor.id]}
                    onClick={() => handleSave(factor)}
                  >
                    {saving[factor.id] ? "Saving..." : "Save"}
                  </button>
                </td>
              </tr>
              <tr>
                <td colSpan={5}>
                  <div style={{ borderBottom: '2px solid #323546', width: '100%' }}></div>
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FactorsTable;