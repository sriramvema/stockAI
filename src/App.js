import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WebCrawlForm from './components/WebCrawlForm';
import SummaryPage from './components/SummaryPage';
import "./App.css"


function App() {
  useEffect(() => {
    localStorage.clear(); // Clear localStorage when the app loads
  }, []);

  return (
    <Router>
      <div
        className="App"
        style={{
          backgroundColor: "#181A1C",
          minHeight: "100vh",
          margin: 0,
          padding: 0,
          paddingLeft: "40px",
          paddingRight: "40px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.5rem",
            paddingTop: "20px",
          }}
        >
          <h1 style={{ display: "flex", alignItems: "center", fontSize: "4rem", margin: 0, color: "whitesmoke" }}>
            Stock News
          </h1>
          <button
            onClick={() => alert("About Me clicked!")}
            style={{
              background: "none",
              border: "none",
              color: "whitesmoke",
              fontSize: "1.25rem", // similar to h4
              fontWeight: "normal",
              cursor: "pointer",
              padding: 0,
              margin: 0,
              fontFamily: "inherit",
            }}
          >
            About Me
          </button>
        </div>
        <h4 style={{ textAlign: "center", color: "whitesmoke", marginTop: 0 }}>
          Powered by Claude 3
        </h4>
        <Routes>
          <Route path="/" element={<WebCrawlForm />} />
          <Route path="/summary" element={<SummaryPage />} />
        </Routes>
      </div>
    </Router>
  );
}


export default App;

