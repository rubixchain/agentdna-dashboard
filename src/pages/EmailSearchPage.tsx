import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EmailSearchPageComponent from "../components/EmailSearchPage";
import type { NFTRecord } from "../types";

const EmailSearchPage = () => {
  const cards = [
    {
      title: "Total Agents Interacted",
      description: "Number of agents interacted with your application",
      data: 121,
    },
    {
      title: "Intrusions Detected",
      description: "Total number of intrusion attempts detected",
      data: 15,
    },
    {
      title: "Total Interactions ",
      description: "Total number of interactions between agents",
      data: 3421,
    },
  ];

  const { email } = useParams<{ email: string }>();
  const navigate = useNavigate();
  const [emailSearchList, setEmailSearchList] = useState<NFTRecord[]>([]);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);

  // Fetch email search results
  useEffect(() => {
    if (!email) {
      navigate("/");
      return;
    }

    const fetchEmailResults = async () => {
      const decodedEmail = decodeURIComponent(email);
      setIsLoadingEmail(true);
      setEmailSearchList([]);

      try {
        const res = await fetch(
          `https://chain-connector-1.rubix.net/get-nft-by-email?email=${encodeURIComponent(
            decodedEmail
          )}`
        );

        const data = await res.json();

        if (Array.isArray(data.nfts)) {
          const filtered = data.nfts.filter(
            (n: any) => n?.nft_id && n.nft_id.trim() !== ""
          );

          const formatted = filtered.map((n: any) => ({
            id: n.nft_id.trim(),
            owner_did: "",
            nft_value: 0,
            nft_metadata: "",
            nft_file_name: "",
            nft_name: n.nft_name?.trim() || undefined,
          }));

          setEmailSearchList(formatted);
        } else {
          setEmailSearchList([]);
        }
      } catch (err) {
        console.error("Email search error:", err);
        setEmailSearchList([]);
      }

      setIsLoadingEmail(false);
    };

    fetchEmailResults();
  }, [email, navigate]);

  const handleBack = () => {
    navigate("/");
  };

  const handleOpenNFT = (id: string) => {
    // Pass state to indicate we came from email search
    navigate(`/agent/${encodeURIComponent(id)}`, {
      state: { fromEmailSearch: true, email },
    });
  };

  if (!email) {
    return null;
  }

  return (
    <>
      <section className="hero">
        <h1 className="hero-title">Agents Under</h1>
        <h2 className="hero-title-h2">{decodeURIComponent(email)}</h2>
        <p className="hero-sub">
          Monitor and manage your autonomous agents securely.
        </p>

        {/* <section className="hub">
        <div className="hub-grid">
          <a className="card center card-link">
            <div className="card-body">
              <h3>{cards[0].title}</h3>
              <p>{cards[0].description}</p>
              <h2>{cards[0].data}</h2>
            </div>
          </a>

          <a className="card center card-link">
            <div className="card-body">
              <h3>{cards[1].title}</h3>
              <p>{cards[1].description}</p>
              <h2>{cards[1].data}</h2>
            </div>
          </a>

          <a className="card center card-link">
            <div className="card-body">
              <h3>{cards[2].title}</h3>
              <p>{cards[2].description}</p>
              <h2>{cards[2].data}</h2>
            </div>
          </a>
        </div>
      </section> */}
      </section>
      <EmailSearchPageComponent
        email={decodeURIComponent(email)}
        onBack={handleBack}
        results={emailSearchList}
        loading={isLoadingEmail}
        onOpenNFT={handleOpenNFT}
      />
    </>
  );
};

export default EmailSearchPage;
