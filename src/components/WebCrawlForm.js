import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function WebCrawlForm() {
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [matches, setMatches] = useState([]);
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState('');
  const [company, setCompany] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMatches([]);
    setArticles([]);
    setError('');
    setCompany('');

    try {
      const res = await fetch('http://127.0.0.1:5000/webcrawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'An error occurred.');
        return;
      }

      setMatches(data.matches);
    } catch (err) {
      setError('Failed to fetch matches.');
    }
  };

  const handleSelectCompany = async (companyName) => {
    setError('');
    setArticles([]);
    setCompany(companyName);
    setLoading(true); 
    try {
      const res = await fetch('http://127.0.0.1:5000/select_company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: companyName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'An error occurred.');
        return;
      }

      setArticles(data.articles || []);
    } catch (err) {
      setError('Failed to fetch articles.');
    } finally {
      setLoading(false);
    }
  };

  // New function: call summary and navigate
  const handleSummarize = () => {
    localStorage.setItem('company', company);
    localStorage.setItem('articles', JSON.stringify(articles || []));
    navigate('/summary');
  };
  

  return (
    <div
      style={{
        backgroundImage: `url('/hands-digital-universe-background.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h2 style={{ textAlign: 'center', color:'whitesmoke', marginBottom: '100px'}}>Stay up to date with your favorite stocks.</h2>
      <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <label style={{ marginRight: '10px', color: 'white' }}>Enter keyword to search:</label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ padding: '5px' }}
          />
          <button type="submit" style={{ marginLeft: '10px', padding: '5px' }}>
            Search
          </button>
        </form>

  
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
  
        {matches.length > 0 && (
          <div style={{ marginTop: '20px', color: 'whitesmoke' }}>
            <h3>Found {matches.length} Matches:</h3>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {matches.map((match, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectCompany(match.CompanyName)}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: '5px 0',
                    padding: '8px 12px',
                    cursor: 'pointer',
                  }}
                >
                  Company Name: {match.CompanyName} <br />
                  Stock: {match.Symbol}
                </button>
              ))}
            </div>
          </div>
        )}
        {company && (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            marginTop: '20px',
          }}>
            <h3>
              Articles for: <span style={{ color: 'darkblue' }}>{company}</span>
            </h3>
            {loading ? (
              <p>Finding articles...</p>
            ) : articles.length > 0 ? (
              <>
                <ul>
                  {articles.map((article, i) => (
                    <li key={i}>
                      <a href={article.link} target="_blank" rel="noopener noreferrer">
                        {article.title}
                      </a>
                      <p>{article.snippet}</p>
                    </li>
                  ))}
                </ul>
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button
                    onClick={handleSummarize}
                    style={{
                      padding: '10px 20px',
                      cursor: 'pointer',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                    }}
                  >
                    Summarize
                  </button>
                </div>
              </>
            ) : (
              <p>No articles found.</p>
            )}
            
          </div>
        )}
      </div>
    </div>
  );
}  
export default WebCrawlForm;