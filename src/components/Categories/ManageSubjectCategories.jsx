import React, { useEffect, useState } from "react";
import { getAllMetricsCategories, getMetricsByProject, editMetric } from "../../services/MetricsService";
import { getAllFactorsCategories, getFactorsByProject } from "../../services/FactorsService";
import { llistarProjectes } from "../../services/ProjectService";
import MetricsTable from "./MetricsTable";
import FactorsTable from "./FactorsTable";
import "../../styles.css";

function getStudentPattern(externalId) {
  const idx = externalId.indexOf("_");
  return idx > 0 ? externalId.substring(0, idx) + "_student" : externalId;
}

function groupByScopeAndPattern(items) {
  const team = {};
  const individual = {};
  items.forEach(item => {
    if (item.scope === "team") {
      team[item.externalId] = item;
    } else if (item.scope === "individual") {
      const pattern = getStudentPattern(item.externalId);
      if (!individual[pattern]) individual[pattern] = [];
      individual[pattern].push(item);
    }
  });
  return { team: Object.values(team), individual };
}

function ManageSubjectCategories({ subject, onBack }) {
  const [metrics, setMetrics] = useState([]);
  const [factors, setFactors] = useState([]);
  const [metricCategories, setMetricCategories] = useState([]);
  const [factorCategories, setFactorCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("metrics");
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);

      // 1. Cargar lista de nombres de equipos desde localStorage
      const teamNamesMapping = JSON.parse(localStorage.getItem('assignatura_teams_mapping')) || {};
      const teamNames = teamNamesMapping[subject] || [];

      // 2. Cargar todos los proyectos y filtrar por nombres de esta asignatura
      const allProjects = await llistarProjectes();
      const teamsObjects = allProjects.filter(p => teamNames.includes(p.name || p.externalId));
      setTeams(teamsObjects);

      // 3. Cargar métricas y factores por cada equipo
      const metricsPromises = teamsObjects.map(async (t) => {
        const response = await getMetricsByProject(t.externalId || t.name);
        // Enriquecer cada métrica con la info del proyecto
        return response.data.map(metric => ({
          ...metric,
          project: { externalId: t.externalId, name: t.name, id: t.id }
        }));
      });
      
      const factorsPromises = teamsObjects.map(async (t) => {
        const response = await getFactorsByProject(t.externalId || t.name);
        // Enriquecer cada factor con la info del proyecto
        return response.data.map(factor => ({
          ...factor,
          project: { externalId: t.externalId, name: t.name, id: t.id }
        }));
      });

      const results = await Promise.all([
        ...metricsPromises,
        ...factorsPromises,
        getAllMetricsCategories().then(r => r.data),
        getAllFactorsCategories().then(r => r.data)
      ]);

      const metricArrays = results.slice(0, teamsObjects.length);
      const factorArrays = results.slice(teamsObjects.length, 2 * teamsObjects.length);
      const allMetrics = metricArrays.flat();
      const allFactors = factorArrays.flat();

      setMetrics(allMetrics);
      setFactors(allFactors);
      setMetricCategories(results[2 * teamsObjects.length] || []);
      setFactorCategories(results[2 * teamsObjects.length + 1] || []);
      setLoading(false);
    }

    fetchAll();
  }, [subject]);

  console.log("Teams for subject:", teams);

  if (loading) return <div>Cargando...</div>;

  const groupedMetrics = groupByScopeAndPattern(metrics);
  const dedupedFactors = Object.values(
    factors.reduce((acc, factor) => {
      acc[factor.externalId] = factor;
      return acc;
    }, {})
  );

  return (
    <div>
      <h3>Manage Categories for {subject}</h3>
      <div style={{display: "flex", justifyContent: "center", alignItems: "center", gap: "2em", marginBottom: "2em" }}>
        <button
          className={`custom-button${activeTab === "metrics" ? " active" : ""}`}
          onClick={() => setActiveTab("metrics")}
          style={{ minWidth: "120px", fontWeight: 700 }}
        >
          Metrics
        </button>
        <button
          className={`custom-button${activeTab === "factors" ? " active" : ""}`}
          onClick={() => setActiveTab("factors")}
          style={{ minWidth: "120px", fontWeight: 700 }}
        >
          Factors
        </button>
      </div>

      {activeTab === "metrics" && (
        <div>
          <h4>Mètriques d'equip</h4>
          <MetricsTable 
            metrics={groupedMetrics.team} 
            allMetrics={metrics}
            allCategories={metricCategories} 
            project={subject} 
            teams={teams} 
          />

          <h4>Mètriques individuals</h4>
          {Object.entries(groupedMetrics.individual).map(([pattern, metricsArr]) => (
            <MetricsTable
              key={pattern}
              metrics={metricsArr}
              allMetrics={metrics}
              allCategories={metricCategories}
              project={subject}
              teams={teams}
              isPattern={true}
            />
          ))}
        </div>
      )}

      {activeTab === "factors" && (
        <div>
          <h4>Factors</h4>
          <FactorsTable 
            factors={dedupedFactors} 
            allFactors={factors}
            allCategories={factorCategories} 
            project={subject} 
            teams={teams} 
          />
        </div>
      )}

      <button className="back-button" onClick={onBack}>Back</button>
    </div>
  );
}

export default ManageSubjectCategories;