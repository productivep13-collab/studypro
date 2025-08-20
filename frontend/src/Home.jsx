import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [studyMaterial, setStudyMaterial] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Load projects from backend on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("http://localhost:8000/projects");
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects");
    }
  };

  const resetForm = () => {
    setTitle("");
    setStudyMaterial("");
    setError("");
    setSuccess("");
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const createProjectAndNavigate = async (route) => {
    if (!title.trim() || !studyMaterial.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    const newProject = {
      id: Date.now(),
      title: title.trim(),
      studyMaterial: studyMaterial.trim(),
    };

    try {
      const response = await fetch("http://localhost:8000/createPro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      const data = await response.json();
      setSuccess("Project created successfully!");
      
      // Wait a moment for user to see success message
      setTimeout(() => {
        closeModal();
        navigate(route, {
          state: {
            submittedData: {
              id: data.id,
              title: data.title,
              studyMaterial: data.studyMaterial,
            },
          },
        });
      }, 500);
    } catch (err) {
      console.error("Error creating project:", err);
      setError("Failed to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const navigateToExistingProject = (project, route) => {
    navigate(route, {
      state: {
        submittedData: project,
      },
    });
  };

  const formatDate = (id) => {
    return new Date(id).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <>
      <header className="header">
        <div>
          <h1>Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: '0.5rem' }}>
            Manage your study projects and enhance your learning
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="create-button"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Create Project
        </button>
      </header>

      {error && !showModal && (
        <div className="alert error" style={{ margin: '0 2rem' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="empty-state">
          <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
            <path d="M12 5L8 21l4-7 4 7-4-16"/>
          </svg>
          <h2>No Projects Yet</h2>
          <p>Create your first study project to get started with enhanced learning tools and techniques.</p>
          <button 
            onClick={() => setShowModal(true)} 
            className="create-button button-pulse"
            style={{ marginTop: '1rem' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <div key={project.id} className="project-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3>{project.title}</h3>
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--text-tertiary)', 
                  background: 'var(--bg-secondary)', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: 'var(--border-radius-sm)',
                  whiteSpace: 'nowrap'
                }}>
                  {formatDate(project.id)}
                </span>
              </div>
              
              <p>{truncateText(project.studyMaterial)}</p>
              
              <div className="project-card-actions">
                <button 
                  className="action-button"
                  onClick={() => navigateToExistingProject(project, '/blurt')}
                  title="Test your knowledge by writing what you remember"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.25rem' }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                  Blurt
                </button>
                
                <button 
                  className="action-button"
                  onClick={() => navigateToExistingProject(project, '/flashcards')}
                  title="Generate interactive flashcards for quick review"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.25rem' }}>
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                  Flash
                </button>
                
                <button 
                  className="action-button"
                  onClick={() => navigateToExistingProject(project, '/mnemonics')}
                  title="Create memory aids and mnemonics"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.25rem' }}>
                    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                  </svg>
                  Mnemo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-popup" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Study Project</h2>
              <p>Start your learning journey with a new study project</p>
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

            {success && (
              <div className="alert success">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                {success}
              </div>
            )}

            <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label className="form-label">Project Title</label>
                <input
                  type="text"
                  className="form-input focus-ring"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Introduction to React Hooks"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Study Material</label>
                <textarea
                  className="form-input form-textarea focus-ring"
                  value={studyMaterial}
                  onChange={(e) => setStudyMaterial(e.target.value)}
                  placeholder="Paste your study material here... This could be notes, textbook excerpts, lecture content, or any material you want to study."
                  disabled={loading}
                />
              </div>

              <div className="modal-buttons">
                <button
                  type="button"
                  onClick={() => createProjectAndNavigate('/blurt')}
                  className="modal-button primary"
                  disabled={loading || !title.trim() || !studyMaterial.trim()}
                  title="Test your knowledge by writing what you remember"
                >
                  {loading ? (
                    <span className="loading-spinner"></span>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                    </svg>
                  )}
                  Start with Blurt
                </button>

                <button
                  type="button"
                  onClick={() => createProjectAndNavigate('/flashcards')}
                  className="modal-button primary"
                  disabled={loading || !title.trim() || !studyMaterial.trim()}
                  title="Generate interactive flashcards"
                >
                  {loading ? (
                    <span className="loading-spinner"></span>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                      <line x1="8" y1="21" x2="16" y2="21"/>
                    </svg>
                  )}
                  Create Flashcards
                </button>

                <button
                  type="button"
                  onClick={() => createProjectAndNavigate('/mnemonics')}
                  className="modal-button primary"
                  disabled={loading || !title.trim() || !studyMaterial.trim()}
                  title="Generate memory aids and mnemonics"
                >
                  {loading ? (
                    <span className="loading-spinner"></span>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                    </svg>
                  )}
                  Generate Mnemonics
                </button>

                <button
                  type="button"
                  onClick={closeModal}
                  className="modal-button cancel-button"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}