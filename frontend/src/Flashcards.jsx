import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Flashcards() {
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
  const [flashcards, setFlashcards] = useState([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // Generate flashcards
  const generateFlashcards = async () => {
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: projectData }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate flashcards");
      }

      const data = await response.json();
      setResult(data.result);
      setFlashcards(data.result.flashcards || []);
      setCurrentCard(0);
      setShowAnswer(false);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to generate flashcards. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(currentCard + 1);
      setShowAnswer(false);
    }
  };

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setShowAnswer(false);
    }
  };

  const resetStudy = () => {
    setCurrentCard(0);
    setShowAnswer(false);
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

        <h1>Flashcards</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Interactive flashcards for "{projectData.title}" to help you memorize key concepts and facts.
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
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          color: 'var(--text-primary)',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          Study Material
        </h2>

        <div className="study-material">
          <p>{projectData.studyMaterial}</p>
        </div>

        {!flashcards.length && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button 
              onClick={generateFlashcards}
              disabled={loading}
              className="study-button focus-ring"
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Generating Flashcards...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                  Generate Flashcards
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {flashcards.length > 0 && (
        <div style={{ 
          maxWidth: '600px',
          margin: '2rem auto',
          perspective: '1000px'
        }}>
          <style>{`
            @keyframes flipIn {
              from { transform: rotateY(180deg); opacity: 0; }
              to { transform: rotateY(0deg); opacity: 1; }
            }
            @keyframes flipOut {
              from { transform: rotateY(0deg); opacity: 1; }
              to { transform: rotateY(180deg); opacity: 0; }
            }
            .flashcard-wrapper {
              position: relative;
              width: 100%;
              height: 400px;
              transition: transform 0.6s;
              transform-style: preserve-3d;
              cursor: pointer;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
              border-radius: var(--border-radius-lg);
            }
            .flashcard-wrapper.flipped {
              transform: rotateY(180deg);
            }
            .flashcard-face {
              position: absolute;
              width: 100%;
              height: 100%;
              backface-visibility: hidden;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              padding: 2rem;
              text-align: center;
              border-radius: var(--border-radius-lg);
            }
            .front {
              background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
              color: white;
            }
            .back {
              background: linear-gradient(135deg, var(--success) 0%, var(--accent) 100%);
              color: white;
              transform: rotateY(180deg);
            }
            .flashcard-label {
              font-size: 1rem;
              font-weight: 600;
              margin-bottom: 1.5rem;
              padding: 0.5rem 1.5rem;
              background: rgba(255,255,255,0.2);
              border-radius: 20px;
            }
            .flashcard-content {
              font-size: 1.2rem;
              line-height: 1.6;
              max-height: 80%;
              overflow-y: auto;
            }
            .progress-bar {
              height: 4px;
              background: var(--bg-secondary);
              margin: 1rem 0;
            }
            .progress-fill {
              height: 100%;
              background: linear-gradient(90deg, var(--primary), var(--secondary));
              transition: width 0.3s ease;
            }
            .nav-button {
              padding: 0.75rem 1.5rem;
              border-radius: var(--border-radius-md);
              font-weight: 600;
              transition: all var(--transition-fast);
              display: flex;
              align-items: center;
              gap: 0.5rem;
              border: none;
              cursor: pointer;
            }
            .nav-button:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
            .hint-text {
              position: absolute;
              bottom: 1rem;
              color: rgba(255,255,255,0.7);
              font-size: 0.9rem;
            }
          `}</style>

          {/* Progress Bar */}
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentCard + 1) / flashcards.length) * 100}%` }}
            />
          </div>

          {/* Card Count */}
          <div style={{
            textAlign: 'center',
            margin: '1rem 0',
            color: 'var(--text-secondary)',
            fontWeight: '500'
          }}>
            Card {currentCard + 1} of {flashcards.length}
          </div>

          {/* Flashcard */}
          <div 
            className={`flashcard-wrapper ${showAnswer ? 'flipped' : ''}`}
            onClick={() => setShowAnswer(!showAnswer)}
          >
            <div className="flashcard-face front">
              <div className="flashcard-label">Question</div>
              <div className="flashcard-content">{flashcards[currentCard]?.question}</div>
              <div className="hint-text">Click to flip</div>
            </div>
            <div className="flashcard-face back">
              <div className="flashcard-label">Answer</div>
              <div className="flashcard-content">{flashcards[currentCard]?.answer}</div>
              <div className="hint-text">Click to flip back</div>
            </div>
          </div>

          {/* Navigation */}
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '2rem'
          }}>
            <button
              onClick={prevCard}
              disabled={currentCard === 0}
              className="nav-button"
              style={{
                background: currentCard === 0 ? 'var(--bg-secondary)' : 'var(--primary)',
                color: currentCard === 0 ? 'var(--text-tertiary)' : 'white',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              Previous
            </button>

            <button
              onClick={resetStudy}
              className="nav-button"
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)'
              }}
            >
              Reset Deck
            </button>

            <button
              onClick={nextCard}
              disabled={currentCard === flashcards.length - 1}
              className="nav-button"
              style={{
                background: currentCard === flashcards.length - 1 ? 'var(--bg-secondary)' : 'var(--primary)',
                color: currentCard === flashcards.length - 1 ? 'var(--text-tertiary)' : 'white',
              }}
            >
              Next
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}