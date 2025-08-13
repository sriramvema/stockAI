import React, { useEffect, useState } from 'react';

function SummaryPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState('');
  const [company, setCompany] = useState('');
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedCompany = localStorage.getItem('company');
    const savedArticles = localStorage.getItem('articles');
    const parsedArticles = savedArticles ? JSON.parse(savedArticles) : [];

    setCompany(savedCompany || '');
    setArticles(parsedArticles);

    const fetchSummary = async () => {
      try {
        const res = await fetch('http://127.0.0.1:5000/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articles: parsedArticles }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'An error occurred during summarization.');
          return;
        }

        setSummary(data.summary || '');
        setArticles(data.articles || []);
      } catch (err) {
        setError('Failed to fetch summary.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          backgroundImage: `url('/hands-digital-universe-background.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100vh',
          display: 'flex', // enable flexbox
          flexDirection: 'column', // stack elements vertically
          alignItems: 'center',
          color: 'whitesmoke',
          textAlign: 'center', // center text itself
          padding: '20px'
        }}
      >
        <h2>Summarizing...</h2>
        <p>⏳ Please wait while we generate the summary. This will take a few minutes.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundImage: `url('/hands-digital-universe-background.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        padding: '40px',
        textAlign: 'left', // <-- forces left alignment
      }}
    >
      <h2 style={{ color: '#fff', textAlign: 'left' }}>Summary for {company}</h2>
  
      {summary ? (
        <p style={{ whiteSpace: 'pre-line', color: '#fff', textAlign: 'left' }}>
          {summary}
        </p>
      ) : (
        <p style={{ color: '#fff', textAlign: 'left' }}>No summary available.</p>
      )}
  
      <hr style={{ borderColor: '#ccc' }} />
      <h3 style={{ color: '#fff', textAlign: 'left' }}>Articles</h3>
  
      {articles.length > 0 ? (
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            marginTop: '20px',
            textAlign: 'left', // <-- ensures article content is also left-aligned
          }}
        >
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {articles.map((article, idx) => (
              <li key={idx} style={{ marginBottom: '20px' }}>
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontWeight: 'bold',
                    color: '#007bff',
                    textDecoration: 'none',
                  }}
                >
                  {article.title}
                </a>
                <p>{article.snippet}</p>
                {article.summary && (
                  <>
                    <strong>AI Generated Summary:</strong>
                    <p>{article.summary}</p>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p style={{ color: '#fff', textAlign: 'left' }}>No articles found.</p>
      )}
    </div>
  );
  
}

export default SummaryPage;
