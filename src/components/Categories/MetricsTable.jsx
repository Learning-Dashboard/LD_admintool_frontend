import React, { useState, useMemo } from "react";
import { editMetric } from "../../services/MetricsService";
import FeedbackMessage from "../../utils/FeedbackMessage";
import CategorySelect, { useCategorySelectOptions } from "./CategorySelect.jsx";

async function saveCategoryBulk(metricsArr, category, project) {
  for (const metric of metricsArr) {
    await editMetric(metric.id, { categoryName: category }, project);
  }
}

function MetricRow({ metric, catValue, onChange, onSave, isSaving, selectOptions }) {
  return (
    <>
      <tr>
        <td style={{ padding: '0.7em 1.2em', textAlign: 'left' }}>{metric.externalId || metric.id}</td>
        <td style={{ padding: '0.7em 1.2em', textAlign: 'left' }}>{metric.name}</td>
        <td style={{ padding: '0.7em 1.2em', textAlign: 'left' }}>{metric.description}</td>
        <td style={{ padding: '0.7em 1.2em' }}>
          <CategorySelect value={catValue} onChange={onChange} options={selectOptions} />
        </td>
        <td style={{ padding: '0.7em 1.2em' }}>
          <button disabled={isSaving} onClick={onSave}>
            {isSaving ? "Saving..." : "Save"}
          </button>
        </td>
      </tr>
      <tr>
        <td colSpan={5}>
          <div style={{ borderBottom: '2px solid #323546', width: '100%' }}></div>
        </td>
      </tr>
    </>
  );
}

function PatternRow({ metric, catValue, onChange, onSave, isSaving, selectOptions }) {
  return (
    <>
      <tr>
        <td style={{ padding: '0.7em 1.2em', textAlign: 'left' }}>{metric.externalId.replace(/_.+$/, "_student")}</td>
        <td style={{ padding: '0.7em 1.2em', textAlign: 'left' }}>{metric.description}</td>
        <td style={{ padding: '0.7em 1.2em' }}>
          <CategorySelect value={catValue} onChange={onChange} options={selectOptions} />
        </td>
        <td style={{ padding: '0.7em 1.2em' }}>
          <button disabled={isSaving} onClick={onSave}>
            {isSaving ? "Saving..." : "Save"}
          </button>
        </td>
      </tr>
      <tr>
        <td colSpan={5}>
          <div style={{ borderBottom: '2px solid #323546', width: '100%' }}></div>
        </td>
      </tr>
    </>
  );
}

function MetricsTable({ metrics, allMetrics, allCategories, project, teams, isPattern, onPatternSave }) {
  const [catMap, setCatMap] = useState({});
  const [saving, setSaving] = useState({});
  const [message, setMessage] = useState(null);

  const selectOptions = useCategorySelectOptions(allCategories);

  const getCatValue = id => {
    if (isPattern) {
      if (catMap["_pattern_"]) return catMap["_pattern_"];
      
      const firstMetric = metrics[0];
      if (!firstMetric?.categoryName) return "";
      
      const category = allCategories.find(c => c.name === firstMetric.categoryName);
      if (category?.patternGroup) return JSON.stringify({ patternGroup: category.patternGroup });
      return JSON.stringify({ name: firstMetric.categoryName });
    }
    
    if (catMap[id]) return catMap[id];
    const metric = metrics.find(m => m.id === id);
    if (!metric?.categoryName) return "";
    const category = allCategories.find(c => c.name === metric.categoryName);
    if (category?.patternGroup) {
      
      return JSON.stringify({ patternGroup: category.patternGroup });
    } else {
      return JSON.stringify({ name: metric.categoryName });
    }
  };

  const handleChange = (id, value) => {
    if (isPattern) setCatMap({ ...catMap, _pattern_: value });
    else setCatMap(c => ({ ...c, [id]: value }));
  };

  const handleSave = async metric => {
    setSaving(s => ({ ...s, [metric.id]: true }));
    const selected = getCatValue(metric.id);
    if (!selected) {
      setMessage({ type: "error", text: "No category selected!" });
      setSaving(s => ({ ...s, [metric.id]: false }));
      return;
    }
    
    let selectedCat;
    try {
      selectedCat = JSON.parse(selected);
    } catch (err) {
      setMessage({ type: "error", text: "Invalid category format!" });
      setSaving(s => ({ ...s, [metric.id]: false }));
      return;
    }

    try {
      const metricsToUpdate = allMetrics.filter(m => {
        const matchesExternalId = m.externalId === metric.externalId;
        const hasProject = !!m.project;
        const projectId = m.project?.externalId || m.project?.name;
        const matchesTeam = teams && teams.some(t => (t.externalId || t.name) === projectId);
        
        return matchesExternalId && hasProject && matchesTeam;
      });

      for (const metricToUpdate of metricsToUpdate) {
        if (!metricToUpdate.project) continue;
        const team = teams.find(t => (t.externalId || t.name) === metricToUpdate.project.externalId);
        if (!team) continue;

        let categoryToAssign;
        if (selectedCat.patternGroup) {
          const n = team.students?.length || 0;
          const found = allCategories.find(
            c => c.patternGroup === selectedCat.patternGroup && c.name.startsWith(`${n} members`)
          );
          
          if (found) {
            categoryToAssign = found.name;
            console.log(`Pattern category for team ${team.name} (${n} students): ${categoryToAssign}`);
          } else {
            const available = allCategories
              .filter(c => c.patternGroup === selectedCat.patternGroup)
              .map(c => c.name.match(/^\d+/)?.[0])
              .filter((v, i, a) => a.indexOf(v) === i)
              .sort((a, b) => a - b);
            console.warn(`No category found for ${n} members. Available sizes: ${available.join(', ')}`);
            throw new Error(`No hi ha categoria per ${n} membres. Disponibles: ${available.join(', ')} membres`);
          }
        } else {
          categoryToAssign = selectedCat.name;
          console.log(`Direct category assignment: ${categoryToAssign}`);
        }
        
        const body = { categoryName: categoryToAssign };
        console.log(`Sending PUT to metric ${metricToUpdate.id} with body:`, body, `project: ${metricToUpdate.project.externalId}`);
        await editMetric(metricToUpdate.id, body, metricToUpdate.project.externalId);
      }
      
      setMessage({ type: "success", text: `Category saved to ${metricsToUpdate.length} team(s)!` });
    } catch (err) {
      console.error("Error saving metric category:", err);
      setMessage({ type: "error", text: err.message || "Error saving!" });
    }
    setSaving(s => ({ ...s, [metric.id]: false }));
  };

  const handlePatternSave = async () => {
    setSaving(s => ({ ...s, _pattern_: true }));
    
    const selected = getCatValue(metrics[0]?.id);
    if (!selected) {
      setMessage({ type: "error", text: "No category selected!" });
      setSaving(s => ({ ...s, _pattern_: false }));
      return;
    }

    let selectedCat;
    try {
      selectedCat = JSON.parse(selected);
    } catch (err) {
      console.error("Failed to parse selected category:", selected);
      setMessage({ type: "error", text: "Invalid category format!" });
      setSaving(s => ({ ...s, _pattern_: false }));
      return;
    }

    try {
      for (const metricToUpdate of metrics) {
        if (!metricToUpdate.project) continue;
        
        let categoryToAssign;
        
        if (selectedCat.patternGroup) {
          const team = teams.find(t => (t.externalId || t.name) === metricToUpdate.project.externalId);
          if (!team) {
            console.warn(`Team not found for metric ${metricToUpdate.id}`);
            continue;
          }
          
          const n = team.students?.length || 0;
          console.log(`Looking for pattern: patternGroup=${selectedCat.patternGroup}, team=${team.name}, students=${n}`);
          
          const found = allCategories.find(
            c => c.patternGroup === selectedCat.patternGroup && c.name.startsWith(`${n} members`)
          );
          
          if (found) {
            categoryToAssign = found.name;
            console.log(`Pattern category for team ${team.name} (${n} students): ${categoryToAssign}`);
          } else {
            const available = allCategories
              .filter(c => c.patternGroup === selectedCat.patternGroup)
              .map(c => c.name.match(/^\d+/)?.[0])
              .filter((v, i, a) => a.indexOf(v) === i)
              .sort((a, b) => a - b);
            console.warn(`No category found for ${n} members. Available sizes: ${available.join(', ')}`);
            throw new Error(`No hi ha categoria per ${n} membres. Disponibles: ${available.join(', ')} membres`);
          }
        } else {
          categoryToAssign = selectedCat.name;
        }
        
        if (!categoryToAssign) {
          console.warn(`No category to assign for metric ${metricToUpdate.id}`);
          continue;
        }
        
        const body = { categoryName: categoryToAssign };
        console.log(`Saving metric ${metricToUpdate.id} (project: ${metricToUpdate.project.externalId}) with category: ${categoryToAssign}`);
        await editMetric(metricToUpdate.id, body, metricToUpdate.project.externalId);
      }
      
      if (onPatternSave) onPatternSave(selected);
      setMessage({ type: "success", text: "Categoria aplicada a tots els estudiants del patró!" });
    } catch (err) {
      console.error("Error saving pattern category:", err);
      setMessage({ type: "error", text: err.message || "Error al guardar per tots els estudiants!" });
    }
    setSaving(s => ({ ...s, _pattern_: false }));
  };

  return (
    <div style={{ width: "100%", overflowX: 'auto' }}>
      {message && <FeedbackMessage message={message} onClose={() => setMessage(null)} />}
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
        <thead>
          <tr>
            <th style={{ padding: '0.7em 1.2em', textAlign: 'left' }}>Assessment ID</th>
            {!isPattern && <th style={{ padding: '0.7em 1.2em', textAlign: 'left' }}>Name</th>}
            <th style={{ padding: '0.7em 1.2em', textAlign: 'left' }}>Description</th>
            <th style={{ padding: '0.7em 1.2em', textAlign: 'left' }}>Category</th>
            <th style={{ padding: '0.7em 1.2em', textAlign: 'left' }}></th>
          </tr>
        </thead>
        <tbody>
          {!isPattern && metrics.map(metric => (
            <MetricRow
              key={metric.id}
              metric={metric}
              catValue={getCatValue(metric.id)}
              onChange={e => handleChange(metric.id, e.target.value)}
              onSave={() => handleSave(metric)}
              isSaving={!!saving[metric.id]}
              selectOptions={selectOptions}
            />
          ))}
          {isPattern && metrics[0] && (
            <PatternRow
              metric={metrics[0]}
              catValue={getCatValue(metrics[0].id)}
              onChange={e => handleChange("_pattern_", e.target.value)}
              onSave={handlePatternSave}
              isSaving={!!saving._pattern_}
              selectOptions={selectOptions}
            />
          )}
        </tbody>
      </table>
    </div>
  );
}

export default MetricsTable;
