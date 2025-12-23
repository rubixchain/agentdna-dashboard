import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import AgentInfoDashboard from "../components/AgentInfoDashboard";
import type { NFTRecord, NFTChainData, NFTDataResponse } from "../types";

const AgentProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [selectedAgentName, setSelectedAgentName] = useState<string | null>(null);
  const [nftChainData, setNftChainData] = useState<NFTChainData[] | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Get agent name from localStorage or use id as fallback
  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }

    const decodedId = decodeURIComponent(id);
    let finalName = decodedId; // fallback

    try {
      const storedList = localStorage.getItem("nftList");
      if (storedList) {
        const nftList: NFTRecord[] = JSON.parse(storedList);
        const selected = nftList.find((n) => n.id === decodedId);

        if (selected?.nft_name?.trim()) {
          finalName = selected.nft_name;
        } else if (selected?.nft_file_name?.trim()) {
          finalName = selected.nft_file_name;
        } else if (selected?.nft_metadata) {
          const meta = JSON.parse(selected.nft_metadata);
          if (meta?.name?.trim()) finalName = meta.name;
        }
      }
    } catch {}

    setSelectedAgentName(finalName);
  }, [id, navigate]);

  // Fetch chain data
  useEffect(() => {
    if (!id) return;

    const fetchChainData = async () => {
      const decodedId = decodeURIComponent(id);
      setIsLoadingData(true);
      setNftChainData(null);

      try {
        const response = await fetch(
          `https://chain-connector-1.rubix.net/api/get-nft-token-chain-data?nft=${encodeURIComponent(decodedId)}`
        );

        const data: NFTDataResponse = await response.json();

        if (data.status && data.NFTDataReply) {
          setNftChainData(data.NFTDataReply);
        } else {
          setNftChainData([]);
        }
      } catch (err) {
        console.error("Chain fetch error:", err);
        setNftChainData([]);
      }

      setIsLoadingData(false);
    };

    fetchChainData();
  }, [id]);

  const handleBackToDashboard = () => {
    // Check if we came from email search page
    const state = location.state as { fromEmailSearch?: boolean; email?: string } | null;
    if (state?.fromEmailSearch && state?.email) {
      navigate(`/search/${encodeURIComponent(state.email)}`);
    } else {
      navigate("/");
    }
  };

  const handleSearchAgent = (agentId: string) => {
    navigate(`/agent/${encodeURIComponent(agentId)}`);
  };

  if (!id) {
    return null;
  }

  return (
      <>
      <section className="hero">
        <h1 className="hero-title">Agent Profile </h1>
        <h2 className="hero-title-h2">{selectedAgentName}</h2>
      </section>
    <AgentInfoDashboard
      selectedAgentName={selectedAgentName}
      onBackToDashboard={handleBackToDashboard}
      onSearchAgent={handleSearchAgent}
      searchValue={query}
      onSearchChange={setQuery}
      chainData={nftChainData}
      isLoading={isLoadingData}
    />
    </>
  );
};

export default AgentProfilePage;

