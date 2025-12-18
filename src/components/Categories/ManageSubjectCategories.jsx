import React, { useEffect, useState, useRef } from "react";
import { getAllMetricsCategories, getMetricsByProject } from "../../services/MetricsService";
import { getAllFactorsCategories, getFactorsByProject } from "../../services/FactorsService";
import { llistarProjectes } from "../../services/ProjectService";
import MetricsTable from "./MetricsTable";
import FactorsTable from "./FactorsTable";
import FeedbackMessage from "../../utils/FeedbackMessage";
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

function ManageSubjectCategories({ subject, onBack, onRefreshStatus, onCompleted }) {
  const [metrics, setMetrics] = useState([]);
  const [factors, setFactors] = useState([]);
  const [metricCategories, setMetricCategories] = useState([]);
  const [factorCategories, setFactorCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("metrics");
  const [teams, setTeams] = useState([]);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [message, setMessage] = useState(null);

  const teamMetricsRef = useRef();
  const patternRefs = useRef({});
  const factorsRef = useRef();

  // Helper to mark step 4 as completed in session
  const notifyCompletion = () => {
    if (onCompleted) onCompleted();
  };

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const allProjects = await llistarProjectes();
      const teamsObjects = allProjects.filter(p => p.subject === subject);
      setTeams(teamsObjects);
      const metricsPromises = teamsObjects.map(async (t) => {
        const response = await getMetricsByProject(t.externalId || t.name);
        return response.data.map(metric => ({
          ...metric,
          project: { externalId: t.externalId, name: t.name, id: t.id }
        }));
      });

      const factorsPromises = teamsObjects.map(async (t) => {
        const response = await getFactorsByProject(t.externalId || t.name);
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

  const handleSaveAll = async () => {
    setIsSavingAll(true);
    try {
      if (activeTab === "metrics") {
        const promises = [];
        if (teamMetricsRef.current) promises.push(teamMetricsRef.current.saveAll());
        Object.values(patternRefs.current).forEach(ref => {
          if (ref) promises.push(ref.saveAll());
        });
        await Promise.all(promises);
        setMessage({
          type: "success",
          text: `All metrics for subject: "${subject}" assigned correctly`
        });
      } else {
        if (factorsRef.current) {
          await factorsRef.current.saveAll();
          setMessage({
            type: "success",
            text: `All factors for subject: "${subject}" assigned correctly`
          });
        }
      }
      notifyCompletion();
      if (onRefreshStatus) onRefreshStatus();
    } catch (err) {
      console.error("Error in Save All:", err);
      setMessage({ type: "error", text: "Error saving all categories!" });
    } finally {
      setIsSavingAll(false);
    }
  };

  const handleStatusChange = () => {
    notifyCompletion();
    if (onRefreshStatus) onRefreshStatus();
  };

  if (loading) return <div style={{ textAlign: "center", padding: "2rem" }}>Cargando...</div>;

  const groupedMetrics = groupByScopeAndPattern(metrics);
  const dedupedFactors = Object.values(
    factors.reduce((acc, factor) => {
      acc[factor.externalId] = factor;
      return acc;
    }, {})
  );

  return (
    <div>
      {message && <FeedbackMessage message={message} onClose={() => setMessage(null)} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3>Assign Categories for {subject}</h3>
        <button
          className="custom-button"
          onClick={handleSaveAll}
          disabled={isSavingAll}
          style={{ background: "#4caf50", borderColor: "#4caf50" }}
        >
          {isSavingAll ? "Saving All..." : "Save All"}
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "2em", marginBottom: "2em" }}>
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
          <h4>Team metrics</h4>
          <MetricsTable
            ref={teamMetricsRef}
            metrics={groupedMetrics.team}
            allMetrics={metrics}
            allCategories={metricCategories}
            project={subject}
            teams={teams}
            onStatusChange={handleStatusChange}
          />

          <h4>Individual metrics</h4>
          {Object.entries(groupedMetrics.individual).map(([pattern, metricsArr]) => (
            <MetricsTable
              key={pattern}
              ref={el => patternRefs.current[pattern] = el}
              metrics={metricsArr}
              allMetrics={metrics}
              allCategories={metricCategories}
              project={subject}
              teams={teams}
              isPattern={true}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {activeTab === "factors" && (
        <div>
          <h4>Factors</h4>
          <FactorsTable
            ref={factorsRef}
            factors={dedupedFactors}
            allFactors={factors}
            allCategories={factorCategories}
            project={subject}
            teams={teams}
            onStatusChange={handleStatusChange}
          />
        </div>
      )}

      <button className="back-button" onClick={onBack}>Back</button>
    </div>
  );
}

export default ManageSubjectCategories;