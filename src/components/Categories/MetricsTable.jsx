import React, { useState, useMemo, forwardRef, useImperativeHandle } from "react";
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
          <button disabled={isSaving} onClick={onSave} className="custom-button secondary" style={{ padding: '4px 12px' }}>
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
          <button disabled={isSaving} onClick={onSave} className="custom-button secondary" style={{ padding: '4px 12px' }}>
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

const MetricsTable = forwardRef(({ metrics, allMetrics, allCategories, project, teams, isPattern, onPatternSave, onStatusChange }, ref) => {
  const [catMap, setCatMap] = useState({});
  const [saving, setSaving] = useState({});
  const [message, setMessage] = useState(null);

  const selectOptions = useCategorySelectOptions(allCategories);

  useImperativeHandle(ref, () => ({
    saveAll: async () => {
      if (isPattern) {
        await handlePatternSave(true);
      } else {
        const promises = metrics.map(m => handleSave(m, true));
        await Promise.all(promises);
      }
    }
  }));

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

  const handleSave = async (metric, silent = false) => {
    setSaving(s => ({ ...s, [metric.id]: true }));
    const selected = getCatValue(metric.id);
    if (!selected) {
      if (!silent) setMessage({ type: "error", text: "No category selected!" });
      setSaving(s => ({ ...s, [metric.id]: false }));
      return;
    }

    let selectedCat;
    try {
      selectedCat = JSON.parse(selected);
    } catch (err) {
      if (!silent) setMessage({ type: "error", text: "Invalid category format!" });
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
          } else {
            throw new Error(`There is no category for ${n} members.`);
          }
        } else {
          categoryToAssign = selectedCat.name;
        }

        await editMetric(metricToUpdate.id, { categoryName: categoryToAssign }, metricToUpdate.project.externalId);
      }

      if (!silent) setMessage({ type: "success", text: `Category applied to all team metrics of the subject!` });
      if (onStatusChange) onStatusChange();
    } catch (err) {
      console.error("Error saving metric category:", err);
      if (!silent) setMessage({ type: "error", text: err.message || "Error saving!" });
    }
    setSaving(s => ({ ...s, [metric.id]: false }));
  };

  const handlePatternSave = async (silent = false) => {
    setSaving(s => ({ ...s, _pattern_: true }));

    const selected = getCatValue(metrics[0]?.id);
    if (!selected) {
      if (!silent) setMessage({ type: "error", text: "No category selected!" });
      setSaving(s => ({ ...s, _pattern_: false }));
      return;
    }

    let selectedCat;
    try {
      selectedCat = JSON.parse(selected);
    } catch (err) {
      if (!silent) setMessage({ type: "error", text: "Invalid category format!" });
      setSaving(s => ({ ...s, _pattern_: false }));
      return;
    }

    try {
      for (const metricToUpdate of metrics) {
        if (!metricToUpdate.project) continue;

        let categoryToAssign;
        if (selectedCat.patternGroup) {
          const team = teams.find(t => (t.externalId || t.name) === metricToUpdate.project.externalId);
          if (!team) continue;

          const n = team.students?.length || 0;
          const found = allCategories.find(
            c => c.patternGroup === selectedCat.patternGroup && c.name.startsWith(`${n} members`)
          );

          if (found) {
            categoryToAssign = found.name;
          } else {
            throw new Error(`There is no category for ${n} members.`);
          }
        } else {
          categoryToAssign = selectedCat.name;
        }

        if (!categoryToAssign) continue;
        await editMetric(metricToUpdate.id, { categoryName: categoryToAssign }, metricToUpdate.project.externalId);
      }

      if (onPatternSave) onPatternSave(selected);
      if (onStatusChange) onStatusChange();
      if (!silent) setMessage({ type: "success", text: "Category applied to all individual metrics of the subject!" });
    } catch (err) {
      console.error("Error saving pattern category:", err);
      if (!silent) setMessage({ type: "error", text: err.message || "Error saving!" });
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
              onSave={() => handlePatternSave()}
              isSaving={!!saving._pattern_}
              selectOptions={selectOptions}
            />
          )}
        </tbody>
      </table>
    </div>
  );
});

export default MetricsTable;
