// App.jsx
import React, { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./Home.jsx";
import Flashcards from "./Flashcards.jsx";
import Blurt from "./Blurt.jsx";
import Mnemonics from "./Mnemonics.jsx";
import "./App.css";

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [collapsed, setCollapsed] = useState(false); // for desktop
  const [mobileOpen, setMobileOpen] = useState(false); // for mobile
  const location = useLocation();

  const toggleTheme = () => setDarkMode(!darkMode);
  const toggleCollapse = () => setCollapsed(!collapsed);
  const toggleMobile = () => setMobileOpen(!mobileOpen);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="app">
        {/* Mobile top bar */}
        <div className="mobile-top-bar">
          <button className="menu-toggle" onClick={toggleMobile}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="nav-logo">Study<span>Pro</span></div>
          <button className="theme-toggle" onClick={toggleTheme}>
            {darkMode ? "🌞" : "🌙"}
          </button>
        </div>

        {/* Sidebar */}
        <aside
          className={`sidebar 
            ${collapsed ? "collapsed" : ""} 
            ${mobileOpen ? "open" : ""}`}
        >
          <div className="sidebar-header">
           <div className="nav-logo">
  {collapsed ? "📘" : <>Study<span>Pro</span></>}
</div>

            <button className={`toggle-sidebar ${collapsed ? "collapsed" : ""}`} onClick={toggleCollapse}>
  <span className="arrow"></span>
</button>


          </div>

          <nav className="nav-links">
            <Link
  className={`nav-item ${location.pathname === "/" ? "active" : ""}`}
  to="/"
  onClick={() => setMobileOpen(false)}
>
  {collapsed ? "🏠" : <span>🏠 Home</span>}
</Link>

<Link
  className={`nav-item ${location.pathname === "/blurt" ? "active" : ""}`}
  to="/blurt"
  onClick={() => setMobileOpen(false)}
>
  {collapsed ? "📝" : <span>📝 Blurt</span>}
</Link>

<Link
  className={`nav-item ${location.pathname === "/flashcards" ? "active" : ""}`}
  to="/flashcards"
  onClick={() => setMobileOpen(false)}
>
  {collapsed ? "🃏" : <span>🃏 Flashcards</span>}
</Link>

<Link
  className={`nav-item ${location.pathname === "/mnemonics" ? "active" : ""}`}
  to="/mnemonics"
  onClick={() => setMobileOpen(false)}
>
  {collapsed ? "🧠" : <span>🧠 Mnemonics</span>}
</Link>

          </nav>

          <div className="sidebar-footer">
  <button className="theme-toggle" onClick={toggleTheme}>
    {collapsed ? (
      darkMode ? "🌞" : "🌙"
    ) : (
      <>
        {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
      </>
    )}
  </button>
</div>


        </aside>

        {/* Overlay for mobile */}
        {mobileOpen && (
          <div className="sidebar-overlay" onClick={toggleMobile}></div>
        )}

        {/* Main content */}
        <main className={`main ${collapsed ? "sidebar-collapsed" : ""}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blurt" element={<Blurt />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/mnemonics" element={<Mnemonics />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
