import { Routes, Route } from "react-router-dom";
import "./App.css";

import DashboardPage from "./pages/DashboardPage";
import AgentProfilePage from "./pages/AgentProfilePage";
import EmailSearchPage from "./pages/EmailSearchPage";

function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/agent/:id" element={<AgentProfilePage />} />
        <Route path="/search/:email" element={<EmailSearchPage />} />
      </Routes>
    </div>
  );
}

export default App;
