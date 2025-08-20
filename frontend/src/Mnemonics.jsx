import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Mnemonics() {
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
  const [error, setError] = useState("");
  const [processedContent, setProcessedContent] = useState(null);

  // Generate mnemonics
  const generateMnemonics = async () => {
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/mnemonics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: projectData }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate mnemonics");
      }

      const data = await response.json();
      setResult(data.result);
      setProcessedContent(data.result);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to generate mnemonics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderProcessedContent = (content) => {
    if (!content) return null;

    return content.sections.map((section, sectionIndex) => (
      <div key={sectionIndex} className="mnemonic-section">
        <h1 className="section-heading">
          {section.heading} <span className="heading-emoji">{section.headingEmoji}</span>
        </h1>
        
        <div className="section-content">
          {section.points.map((point, pointIndex) => (
            <div key={pointIndex} className="content-point">
              <div className="point-arrow">→</div>
              <div className="point-text">
                {point.chunks.map((chunk, chunkIndex) => {
                  if (chunk.type === 'normal') {
                    return <span key={chunkIndex}>{chunk.text}</span>;
                  } else if (chunk.type === 'hover') {
                    return (
                      <span
                        key={chunkIndex}
                        className="hover-word tooltip"
                        data-tooltip={chunk.explanation}
                      >
                        {chunk.text}
                      </span>
                    );
                  } else if (chunk.type === 'acronym') {
                    return (
                      <span
                        key={chunkIndex}
                        className="acronym-word tooltip"
                        data-tooltip={chunk.fullForm}
                      >
                        {chunk.text}
                      </span>
                    );
                  }
                  return null;
                })}
                {point.emoji && <span className="point-emoji">{point.emoji}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div className="app">
      <div className="main" style={{ marginLeft: 0 }}>
        <div className="header" style={{ position: 'relative' }}>
          <button
            onClick={() => navigate('/')}
            className="modal-button secondary"
            style={{
              position: 'absolute',
              left: '2rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: 'auto',
              padding: '0.75rem',
              flex: 'none'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m12 19-7-7 7-7"/>
              <path d="M19 12H5"/>
            </svg>
          </button>

          <div style={{ textAlign: 'center', flex: 1 }}>
            <h1>Mnemonics Generator</h1>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '1.1rem', 
              marginTop: '0.5rem',
              fontWeight: '400'
            }}>
              Transform "{projectData.title}" into memorable, easy-to-learn content
            </p>
          </div>
        </div>

        {error && (
          <div style={{ padding: '0 2rem' }}>
            <div className="alert error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {error}
            </div>
          </div>
        )}

        <div className="study-container">
          <div className="study-content">
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: 'var(--text-primary)',
              marginBottom: '1.5rem',
              textAlign: 'center',
              letterSpacing: '-0.025em'
            }}>
              Original Study Material
            </h2>

            <div className="study-material">
              <p style={{ margin: 0 }}>{projectData.studyMaterial}</p>
            </div>

            {!processedContent && (
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button 
                  onClick={generateMnemonics}
                  disabled={loading}
                  className={`study-button ${loading ? '' : 'focus-ring'}`}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Processing Content...
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v20M2 12h20"/>
                      </svg>
                      Generate Smart Mnemonics
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {processedContent && (
            <div className="mnemonic-output">
              <h2 className="output-title">Your Enhanced Learning Content</h2>
              {renderProcessedContent(processedContent)}
              
              <div style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-light)' }}>
                <button 
                  onClick={generateMnemonics}
                  disabled={loading}
                  className="modal-button secondary focus-ring"
                  style={{ width: 'auto' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                    <path d="M3 3v5h5"/>
                  </svg>
                  Regenerate Content
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .mnemonic-output {
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          border-radius: var(--border-radius-lg);
          padding: 2.5rem;
          margin-top: 2rem;
          box-shadow: var(--shadow-sm);
          animation: slideUp 0.3s ease-out;
        }

        .output-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 2rem;
          text-align: center;
          letter-spacing: -0.025em;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .mnemonic-section {
          margin-bottom: 3rem;
          animation: fadeIn 0.5s ease-out;
          animation-fill-mode: both;
          animation-delay: calc(var(--section-index, 0) * 0.1s);
        }

        .section-heading {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid var(--border-light);
          letter-spacing: -0.025em;
        }

        .heading-emoji {
          font-size: 1.5rem;
          opacity: 0.8;
        }

        .section-content {
          margin-left: 1rem;
          margin-top: 1.5rem;
        }

        .content-point {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1.25rem;
          padding: 1.25rem;
          background: var(--bg-secondary);
          border-radius: var(--border-radius-md);
          border-left: 3px solid var(--primary);
          transition: all var(--transition-fast);
          position: relative;
        }

        .content-point::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          border-radius: 0 2px 2px 0;
          transition: width var(--transition-fast);
        }

        .content-point:hover {
          background: var(--bg-primary);
          transform: translateX(4px);
          box-shadow: var(--shadow-md);
        }

        .content-point:hover::before {
          width: 4px;
        }

        .point-arrow {
          color: var(--primary);
          font-size: 1.1rem;
          font-weight: 600;
          margin-top: 0.1rem;
          min-width: 20px;
        }

        .point-text {
          font-size: 1.05rem;
          line-height: 1.7;
          color: var(--text-primary);
          flex: 1;
          font-weight: 400;
        }

        .hover-word {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.25));
          padding: 2px 6px;
          border-radius: var(--border-radius-sm);
          cursor: help;
          border-bottom: 2px dotted var(--warning);
          transition: all var(--transition-fast);
          position: relative;
          font-weight: 500;
        }

        .hover-word:hover {
          background: var(--warning);
          color: var(--text-inverse);
          transform: scale(1.02);
          box-shadow: var(--shadow-sm);
        }

        .acronym-word {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.25));
          padding: 2px 8px;
          border-radius: var(--border-radius-sm);
          cursor: help;
          border-bottom: 2px dotted var(--primary);
          font-weight: 600;
          transition: all var(--transition-fast);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 0.95em;
        }

        .acronym-word:hover {
          background: var(--primary);
          color: var(--text-inverse);
          transform: scale(1.02);
          box-shadow: var(--shadow-sm);
        }

        .point-emoji {
          font-size: 1.2rem;
          margin-left: 0.5rem;
          opacity: 0.8;
        }

        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Enhanced tooltip styling to match UI theme */
        .tooltip::before {
          background: var(--text-primary);
          color: var(--bg-primary);
          font-size: 0.85rem;
          font-weight: 500;
          padding: 0.6rem 0.8rem;
          border-radius: var(--border-radius-sm);
          box-shadow: var(--shadow-lg);
          max-width: 200px;
          white-space: normal;
          word-wrap: break-word;
          line-height: 1.4;
          z-index: 1000;
        }

        .tooltip::after {
          border-top-color: var(--text-primary);
          z-index: 999;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .section-heading {
            font-size: 1.5rem;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          
          .content-point {
            padding: 1rem;
            margin-left: 0;
          }
          
          .section-content {
            margin-left: 0;
          }
          
          .point-text {
            font-size: 1rem;
          }
          
          .output-title {
            font-size: 1.5rem;
          }
        }

        /* Dark mode considerations */
        .dark .hover-word {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.3));
        }

        .dark .acronym-word {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.3));
        }
      `}</style>
    </div>
  );
}