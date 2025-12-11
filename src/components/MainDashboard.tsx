import { useState, useEffect } from "react";
import type { NFTRecord } from "../types";
import "./MainDashboard.css";

interface MainDashboardProps {
  agents: NFTRecord[];
  onOpenAgent: (id: string) => void;
  onSearchByEmail: (email: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  isLoading: boolean;
}

const MainDashboard = ({
  agents,
  onOpenAgent,
  onSearchByEmail,
  searchValue,
  onSearchChange,
  isLoading,
}: MainDashboardProps) => {
  const [metricsData, setMetricsData] = useState({
    agentsSecured: 0,
    totalInteractions: 0,
    intrusions: 0,
  });

  console.log("Agents passed to MainDashboard:", agents);

  // Fetch each NFT chain
  async function fetchChain(id: string) {
    try {
      const res = await fetch(
        `https://chain-connector-1.rubix.net/api/get-nft-token-chain-data?nft=${id}`
      );
      const data = await res.json();
      return data.NFTDataReply || [];
    } catch (err) {
      console.error("Chain error:", err);
      return [];
    }
  }

  // Compute metrics (interactions + malicious blocks)
  async function computeMetrics() {
    if (!agents.length) return;

    let totalInteractions = 0;
    let intrusions = 0;

    const chains = await Promise.all(agents.map((a) => fetchChain(a.id)));

    chains.forEach((chain) => {
      const validBlocks = chain.filter((b: any) => b.BlockNo !== 0);
      totalInteractions += validBlocks.length;

      validBlocks.forEach((block: any) => {
        try {
          const parsed = JSON.parse(block.NFTData);
          const bad =
            parsed?.verification?.status === "failed" ||
            (parsed?.verification?.trust_issues?.length ?? 0) > 0 ||
            (parsed?.responses?.[0]?.envelope?.host_trust_issues?.length ?? 0) > 0;

          if (bad) intrusions++;
        } catch {}
      });
    });

    setMetricsData({
      agentsSecured: agents.length,
      totalInteractions,
      intrusions,
    });
  }

  useEffect(() => {
    computeMetrics();
  }, [agents]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) onSearchByEmail(searchValue.trim());
  };

  return (
    <div className="main-dashboard">
      {/* SEARCH BAR */}
      <form className="main-search-form" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search agents by email"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="main-search-input"
        />
      </form>

      {/* METRICS */}
      <div className="main-metrics-grid">
        <MetricCard label="Agents Secured" value={metricsData.agentsSecured} />
        <MetricCard label="Total Interactions" value={metricsData.totalInteractions} />
        <MetricCard label="Intrusions Detected" value={metricsData.intrusions} color="#ff6c89" />
      </div>

      {/* AGENT LIST */}
      <div className="agents-list-section">
        <h2 className="agents-list-title">Secured Agents</h2>

        <div className="agents-table-container">
          {isLoading ? (
            <div className="loading-text">Loading agents…</div>
          ) : agents.length === 0 ? (
            <div className="empty-text">No agents found</div>
          ) : (
            <div className="agents-list-wrapper">
              {agents.map((agent, index) => (
                <AgentListItem
                  key={agent.id}
                  agent={agent}
                  index={index}
                  onClick={() => {
                    console.log("CLICKED:", agent.id);
                    onOpenAgent(agent.id);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------------------- METRIC CARD ---------------------- */

const MetricCard = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) => (
  <div className="main-metric-card">
    <div className="main-metric-label">{label}</div>
    <div className="main-metric-value" style={{ color }}>
      {value.toLocaleString()}
    </div>
  </div>
);

/* ---------------------- AGENT LIST ITEM ---------------------- */

interface AgentListItemProps {
  agent: NFTRecord;
  index: number;
  onClick: () => void;
}

const AgentListItem = ({ agent, index, onClick }: AgentListItemProps) => {
  // Show nft_name if available, otherwise show id
  let displayName = agent.nft_name?.trim() || agent.id;

  return (
    <div
      className="agent-list-item"
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.background =
          "linear-gradient(135deg, rgba(5, 15, 30, 0.9), rgba(10, 25, 45, 0.8))";
        e.currentTarget.style.borderColor = "rgba(69, 255, 232, 0.6)";
        e.currentTarget.style.transform = "translateY(-4px) translateX(4px)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(69, 255, 232, 0.25)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background =
          "linear-gradient(135deg, rgba(5, 15, 30, 0.6), rgba(10, 25, 45, 0.5))";
        e.currentTarget.style.borderColor = "rgba(69, 255, 232, 0.25)";
        e.currentTarget.style.transform = "translateY(0) translateX(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div className="agent-item-number">{index + 1}</div>

      <div className="agent-item-info">
        <div className="agent-item-label">Agent Name</div>
        <div className="agent-item-id">{displayName}</div>
      </div>


    </div>
  );
};

export default MainDashboard;
