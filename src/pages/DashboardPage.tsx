import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainDashboard from "../components/MainDashboard";
import type { NFTRecord, NFTListResponseNew } from "../types";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [nftList, setNftList] = useState<NFTRecord[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  // -------------------------------------------------------
  // FETCH ALL NFT RECORDS FOR MAIN DASHBOARD
  // -------------------------------------------------------
  useEffect(() => {
    const fetchNFTList = async () => {
      try {
        setIsLoadingList(true);
        const response = await fetch(
          "https://chain-connector-1.rubix.net/get-nfts"
        );
        const data: NFTListResponseNew = await response.json();

        if (Array.isArray(data.nfts)) {
          // Filter out NFTs where both nft_id and nft_name are null/empty
          const filtered = data.nfts.filter(
            (item) => item.nft_id && item.nft_id.trim() !== ""
          );

          const formatted: NFTRecord[] = filtered.map((item) => ({
            id: item.nft_id,
            owner_did: "",
            nft_value: 0,
            nft_metadata: "",
            nft_file_name: "",
            nft_name: item.nft_name?.trim() || undefined,
          }));

          setNftList(formatted);
          localStorage.setItem("nftList", JSON.stringify(formatted)); // For name lookup
        } else {
          setNftList([]);
        }
      } catch (err) {
        console.error("Error fetching NFT list", err);
        setNftList([]);
      }
      setIsLoadingList(false);
    };

    fetchNFTList();
  }, []);

  // -------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------
  const handleSearchByEmail = (email: string) => {
    if (!email.trim()) return;
    navigate(`/search/${encodeURIComponent(email.trim())}`);
  };

  const handleOpenAgent = (id: string) => {
    navigate(`/agent/${encodeURIComponent(id)}`);
  };

  return (
    <>
      <header className="hero" style={{ display: "flex", justifyContent: "center" }}>
        <p className="eyebrow">AgentDNA Dashboard</p>
      </header>

      <MainDashboard
        agents={nftList}
        onOpenAgent={handleOpenAgent}
        onSearchByEmail={handleSearchByEmail}
        searchValue={query}
        onSearchChange={setQuery}
        isLoading={isLoadingList}
      />
    </>
  );
};

export default DashboardPage;

