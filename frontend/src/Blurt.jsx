import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Blurt() {
  const location = useLocation();
  const navigate = useNavigate();

  // Receive data from navigation
  const projectData = location.state?.submittedData || {
    id: null,
    title: "No data received",
    studyMaterial: "No Material received"
  };

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [error, setError] = useState("");
  const [showMaterial, setShowMaterial] = useState(true);

  // Send data to backend
  const analyzeBlurt = async () => {
    if (!userAnswer.trim()) {
      setError("Please write your answer before analyzing");
      return;
    }

    setLoading(true);
    setResult(null);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/blurt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          value: projectData, 
          answer: userAnswer.trim() 
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze your answer");
      }

      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to analyze your answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetBlurt = () => {
    setUserAnswer("");
    setResult(null);
    setError("");
    setShowMaterial(true);
  };

  const formatAnalysis = (text) => {
    // Simple formatting for better readability
    return text.split('\n').map((line, index) => {
      if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
        return (
          <li key={index} style={{ marginLeft: '1rem', marginBottom: '0.5rem' }}>
            {line.replace(/^[-•]\s*/, '')}
          </li>
        );
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return (
        <p key={index} style={{ marginBottom: '0.5rem' }}>
          {line}
        </p>
      );
    });
  };

  return (
    <div className="study-container">
      <div className="study-header">
        <button
          onClick={() => navigate('/')}
          style={{
            position: 'absolute',
            left: '2rem',
            top: '2rem',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--border-radius-sm)',
            padding: '0.5rem',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            transition: 'all var(--transition-fast)'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'var(--bg-card)';
            e.target.style.color = 'var(--text-primary)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'var(--bg-secondary)';
            e.target.style.color = 'var(--text-secondary)';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m12 19-7-7 7-7"/>
            <path d="M19 12H5"/>
          </svg>
        </button>

        <h1>Blurt Method</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Write down everything you remember about "{projectData.title}" without looking at your notes. 
          This active recall technique helps strengthen your memory.
        </p>
      </div>

      {error && (
        <div className="alert error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {error}
        </div>
      )}

      <div className="study-content">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1.5rem' 
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            color: 'var(--text-primary)',
            margin: 0
          }}>
            Study Material
          </h2>
          <button
            onClick={() => setShowMaterial(!showMaterial)}
            style={{
              background: showMaterial ? 'var(--error)' : 'var(--success)',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--border-radius-sm)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all var(--transition-fast)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {showMaterial ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <path d="m1 1 22 22"/>
                </svg>
                Hide Material
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                Show Material
              </>
            )}
          </button>
        </div>

        {showMaterial && (
          <div className="study-material">
            <p>{projectData.studyMaterial}</p>
          </div>
        )}

        <div style={{ marginTop: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '1rem' 
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: 'var(--text-primary)',
              margin: 0
            }}>
              Your Answer
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={resetBlurt}
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-light)',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--border-radius-sm)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all var(--transition-fast)'
                }}
              >
                Reset
              </button>
            </div>
          </div>

          <textarea
            className="study-input focus-ring"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Write everything you remember about this topic without looking at your notes. Don't worry about perfect grammar or order - just get your thoughts down!"
            disabled={loading}
            style={{ minHeight: '200px' }}
          />

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button 
              onClick={analyzeBlurt}
              disabled={loading || !userAnswer.trim()}
              className="study-button focus-ring"
              style={{ opacity: (!userAnswer.trim() || loading) ? 0.6 : 1 }}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  Analyze My Answer
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div className="study-result" style={{
          marginTop: '3rem',
          background: 'var(--bg-card)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          animation: 'fadeIn 0.5s ease-in-out'
        }}>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes scaleIn {
              from { transform: scale(0.95); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
            .progress-circle {
              position: relative;
              width: 120px;
              height: 120px;
              border-radius: 50%;
              background: conic-gradient(var(--success) ${parseInt(result.accuracy)}%, var(--error) ${parseInt(result.accuracy)}%);
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 1rem;
            }
            .progress-circle::before {
              content: '';
              position: absolute;
              width: 100px;
              height: 100px;
              background: var(--bg-primary);
              border-radius: 50%;
            }
            .progress-value {
              position: relative;
              z-index: 1;
              font-size: 1.5rem;
              font-weight: 700;
              color: var(--text-primary);
            }
            .bar-chart {
              display: flex;
              justify-content: space-around;
              margin: 2rem 0;
              gap: 2rem;
            }
            .bar-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              width: 100px;
            }
            .bar {
              width: 40px;
              border-radius: 4px 4px 0 0;
              transition: height 0.5s ease-in-out;
            }
            .bar-label {
              margin-top: 0.5rem;
              font-size: 0.9rem;
              color: var(--text-secondary);
            }
            .tag-container {
              display: flex;
              flex-wrap: wrap;
              gap: 0.5rem;
              margin-top: 1rem;
            }
            .tag {
              padding: 0.4rem 0.8rem;
              border-radius: 20px;
              font-size: 0.85rem;
              font-weight: 500;
              animation: scaleIn 0.3s ease-in-out;
            }
            .tag.success {
              background: rgba(0, 200, 83, 0.1);
              color: var(--success);
              border: 1px solid var(--success);
            }
            .tag.error {
              background: rgba(255, 82, 82, 0.1);
              color: var(--error);
              border: 1px solid var(--error);
            }
            .result-card {
              background: var(--bg-secondary);
              border-radius: var(--border-radius-md);
              padding: 1.5rem;
              margin-bottom: 2rem;
              box-shadow: 0 2px 10px rgba(0,0,0,0.05);
              transition: transform 0.2s ease;
            }
            .result-card:hover {
              transform: translateY(-2px);
            }
            .bullet-list {
              list-style: none;
              padding: 0;
              margin-top: 1rem;
            }
            .bullet-list li {
              position: relative;
              padding-left: 1.5rem;
              margin-bottom: 0.75rem;
              color: var(--text-primary);
            }
            .bullet-list li::before {
              content: '•';
              position: absolute;
              left: 0;
              color: var(--accent);
              font-size: 1.2rem;
            }
            .icon {
              margin-right: 0.5rem;
              vertical-align: middle;
            }
          `}</style>

          <h3 style={{
            fontSize: '1.8rem',
            fontWeight: '700',
            color: 'var(--text-primary)',
            textAlign: 'center',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" className="icon">
              <path d="M3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0"/>
              <path d="M12 8v4m0 0v4m0-4h4"/>
            </svg>
            Analysis Dashboard
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            {/* Accuracy Circle */}
            <div className="result-card" style={{ textAlign: 'center' }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Overall Accuracy</h4>
              <div className="progress-circle">
                <span className="progress-value">{result.accuracy}</span>
              </div>
              <p style={{ marginTop: '0.5rem', color: parseInt(result.accuracy) >= 80 ? 'var(--success)' : parseInt(result.accuracy) >= 50 ? 'var(--warning)' : 'var(--error)', fontWeight: '500' }}>
                {parseInt(result.accuracy) >= 80 ? 'Excellent Recall!' : parseInt(result.accuracy) >= 50 ? 'Good Effort - Room to Improve' : 'Keep Practicing!'}
              </p>
            </div>

            {/* Word Stats Bar Chart */}
            <div className="result-card">
              <h4 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Correct vs Wrong Words</h4>
              <div className="bar-chart">
                <div className="bar-container">
                  <div 
                    className="bar" 
                    style={{ 
                      height: `${result.correct_words?.length * 10 || 0}px`, 
                      background: 'var(--success)',
                      minHeight: '10px'
                    }}
                  ></div>
                  <span className="bar-label">Correct: {result.correct_words?.length || 0}</span>
                </div>
                <div className="bar-container">
                  <div 
                    className="bar" 
                    style={{ 
                      height: `${result.wrong_words?.length * 10 || 0}px`, 
                      background: 'var(--error)',
                      minHeight: '10px'
                    }}
                  ></div>
                  <span className="bar-label">Wrong: {result.wrong_words?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Correct Words Card */}
            <div className="result-card">
              <h4 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" className="icon">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                Correct Key Words
              </h4>
              <div className="tag-container">
                {result.correct_words?.map((word, idx) => (
                  <span key={idx} className="tag success">{word}</span>
                )) || <p>No correct words identified.</p>}
              </div>
            </div>

            {/* Wrong Words Card */}
            <div className="result-card">
              <h4 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2" className="icon">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
                Incorrect Key Words
              </h4>
              <div className="tag-container">
                {result.wrong_words?.map((word, idx) => (
                  <span key={idx} className="tag error">{word}</span>
                )) || <p>No wrong words identified.</p>}
              </div>
            </div>

            {/* Missed Points Card */}
            <div className="result-card">
              <h4 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" className="icon">
                  <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Missed Key Points
              </h4>
              <ul className="bullet-list">
                {result.missed_points?.map((point, idx) => (
                  <li key={idx}>{point}</li>
                )) || <li>No missed points.</li>}
              </ul>
            </div>

            {/* Revise Again Card */}
            <div className="result-card">
              <h4 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" className="icon">
                  <path d="M4 4h16v2H4zM4 11h16v2H4zM4 18h16v2H4z"/>
                </svg>
                Areas to Revise
              </h4>
              <ul className="bullet-list">
                {result.revise_again?.map((part, idx) => (
                  <li key={idx}>{part}</li>
                )) || <li>Everything looks good!</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}