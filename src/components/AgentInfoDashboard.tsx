import { useEffect, useState } from "react";
import type { NFTChainData, MetricCard } from "../types";
import "./AgentInfoDashboard.css";

interface AgentInfoDashboardProps {
  selectedAgentName?: string | null;

  onBackToDashboard: () => void;
  onSearchAgent: (id: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  chainData: NFTChainData[] | null;
  isLoading: boolean;
}

/* -----------------------------------------
   Helper: Parse NFTData JSON Safely
------------------------------------------ */
function parseNFTData(nftRaw: string) {
  try {
    const json = JSON.parse(nftRaw);

    return {
      original: json?.host?.envelope?.original_message ?? "Not provided",

      received:
        json?.responses?.[0]?.envelope?.original_message ??
        "Not provided",

      response:
        json?.responses?.[0]?.envelope?.response ??
        "Not provided",

      trustIssues: [
        ...(json?.responses?.[0]?.envelope?.host_trust_issues ?? []),
        ...(json?.verification?.trust_issues ?? []),
      ],

      status: json?.verification?.status ?? "ok",
    };
  } catch {
    return {
      original: "Not provided",
      received: "Not provided",
      response: "Not provided",
      trustIssues: [],
      status: "ok",
    };
  }
}

/* ------------------------------------------------
   Helper: Returns Display Name (Metadata → fallback to ID)
--------------------------------------------------- */
// function getAgentDisplayName(id: string): string {
//   try {
//     const stored = JSON.parse(localStorage.getItem("nftList") || "[]");

//     const found = stored.find((n: any) => n.id === id);

//     if (found?.nft_metadata) {
//       const meta = JSON.parse(found.nft_metadata);
//       if (meta?.name && meta.name.trim() !== "") return meta.name;
//     }
//   } catch {}

//   return id;
// }

const AgentInfoDashboard = ({
  selectedAgentName,
  onBackToDashboard,
  // onSearchAgent,
  // searchValue,
  chainData,
  isLoading,
}: AgentInfoDashboardProps) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  /* -----------------------------------------
     Compute metrics from filtered blocks
  ------------------------------------------ */
  const filtered = (chainData ?? []).filter((b) => b.BlockNo !== 0);

  let maliciousCount = 0;
  let genuineCount = 0;

  filtered.forEach((b) => {
    const parsed = parseNFTData(b.NFTData);
    const isMalicious =
      parsed.status === "failed" ||
      parsed.trustIssues.length > 0;

    if (isMalicious) maliciousCount++;
    else genuineCount++;
  });

  const metrics: MetricCard[] = [
    { label: "Total Interactions", value: filtered.length.toString() },
    { label: "Malicious Interactions", value: maliciousCount.toString(), color: "#ff6c89" },
    { label: "Genuine Interactions", value: genuineCount.toString(), color: "#ffc557" },
  ];

  /* -----------------------------------------
     Search Submit Handler
  ------------------------------------------ */

  /* -----------------------------------------
     FINAL RENDER
  ------------------------------------------ */
  return (
    <div className="agent-info-dashboard">

      {/* ---------------- BACK BUTTON ---------------- */}
      <button className="back-btn" onClick={onBackToDashboard}>
        ← Back
      </button>

      {/* ---------------- HEADER ---------------- */}
      <header className="hero agentinfo-header">
  <h1 className="agentinfo-title">Agent Profile</h1>

  {/* Only show if name exists */}
  {selectedAgentName && (
    <p className="agentinfo-id">
      {isMobile
        ? // MOBILE → trim to 5 chars
          selectedAgentName.substring(0, 15) +
          (selectedAgentName.length > 15 ? "..." : "")
        : // DESKTOP → show full
          selectedAgentName}
    </p>
  )}
</header>


      {/* ---------------- METRICS ---------------- */}
      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div key={index} className="main-metric-card">
            <div className="main-metric-label">{metric.label}</div>
            <div className="metric-value" style={{ color: metric.color }}>
              {metric.value}
            </div>
          </div>
        ))}
      </div>

      {/* ---------------- INTERACTION LIST ---------------- */}
      <div className="transaction-list-section">
        <h2 className="transaction-list-title">Interaction History</h2>

        {isLoading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#45ffe8" }}>
            Loading transactions...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#888" }}>
            No Interactions available.
          </div>
        ) : (
          <div className="transaction-queue">
            {filtered.map((data, index) => {
              const parsed = parseNFTData(data.NFTData);

              const isMalicious =
                parsed.status === "failed" ||
                parsed.trustIssues.length > 0;

              const cardClass = isMalicious
                ? "transaction-item intrusion-card"
                : "transaction-item genuine-card";

                const badgeText = isMalicious ? (
                  <>
                    Intrusion <br /> Detected
                  </>
                ) : (
                  "Genuine"
                );
              return (
                <div key={index} className={cardClass}>
                  <div className="transaction-badge">{badgeText}</div>

                  <div className="transaction-content message-stack">

                    <div className="message-row">
                      <span className="message-label">Original Message:</span>
                      <span className="message-text">{parsed.original}</span>
                    </div>

                    <div className="message-row">
                      <span className="message-label">Received Message:</span>
                      <span className="message-text">{parsed.received}</span>
                    </div>

                    <div className="message-row">
                      <span className="message-label">Response:</span>
                      <span className="message-text">{parsed.response}</span>
                    </div>

                    <div className="message-row">
                      <span className="message-label">Reason:</span>
                      <span className="message-text">
                        {parsed.trustIssues.length > 0
                          ? parsed.trustIssues.join(", ")
                          : "None"}
                      </span>
                    </div>

                    <div className="message-row meta-row">
                      <span className="message-label">Time:</span>
                      <span className="message-text">
                        {new Intl.DateTimeFormat("en", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(data.Epoch * 1000))}
                      </span>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentInfoDashboard;
