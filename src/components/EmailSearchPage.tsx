import "./EmailSearchPage.css";
import type { NFTRecord } from "../types";

interface EmailSearchPageProps {
  email: string;
  results: NFTRecord[];
  loading: boolean;
  onBack: () => void;
  onOpenNFT: (id: string) => void;
}

const EmailSearchPage = ({ email, results, loading, onBack, onOpenNFT }: EmailSearchPageProps) => {
  return (
    <div className="email-search-container">
      {/* RESULTS SECTION */}
      <div className="agents-list-section">
        {loading ? (
          <div className="loading-text">Loading Agents....</div>
        ) : results.length === 0 ? (
          <div className="empty-text">No Agents found for this email</div>
        ) : (
          <div className="agents-list-wrapper">
            {results.map((agent, index) => (
              <div
                key={index}
                className="agent-list-item"
                onClick={() => onOpenNFT(agent.id)}
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
                  <div className="agent-item-id">
                    {agent.nft_name?.trim() || agent.id}
                  </div>
                </div>

               
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailSearchPage;
