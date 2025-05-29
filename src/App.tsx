import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import './App.css';

// Import all example components
import ProfilingExample from './examples/ProfilingExample';
import MemoizationExamples from './examples/MemoizationExamples';
import UseEffectAntiPatterns from './examples/UseEffectAntiPatterns';
import VirtualizationExample from './examples/VirtualizationExample';
import HeavyTableExample from './examples/HeavyTableExample';
import WebWorkersExample from './examples/WebWorkersExample';

const Home: React.FC = () => {
  return (
    <div className="home">
      <h2>🚀 React Performance Optimization Examples</h2>
      <p>
        Welcome to the React Performance Optimization showcase! This application demonstrates 
        various techniques and best practices for building high-performance React applications.
      </p>
      
      <div className="examples-grid">
        <div className="example-card">
          <h3>📊 Profiling & Debugging</h3>
          <p>Learn how to identify performance bottlenecks using React DevTools Profiler and performance measurement techniques.</p>
          <Link to="/profiling" className="btn">View Example</Link>
        </div>
        
        <div className="example-card">
          <h3>🧠 Memoization Techniques</h3>
          <p>Explore React.memo, useMemo, and useCallback to prevent unnecessary re-renders and expensive calculations.</p>
          <Link to="/memoization" className="btn">View Example</Link>
        </div>
        
        <div className="example-card">
          <h3>⚠️ useEffect Anti-patterns</h3>
          <p>Common mistakes with useEffect and how to avoid them, including dependency arrays and infinite loops.</p>
          <Link to="/useeffect-antipatterns" className="btn">View Example</Link>
        </div>
        
        <div className="example-card">
          <h3>📜 Virtualization</h3>
          <p>Handle large lists efficiently with react-window to render only visible items and improve performance.</p>
          <Link to="/virtualization" className="btn">View Example</Link>
        </div>
        
        <div className="example-card">
          <h3>📊 Heavy Tables</h3>
          <p>Optimize complex data tables with thousands of rows and computationally intensive operations.</p>
          <Link to="/heavy-tables" className="btn">View Example</Link>
        </div>
        
        <div className="example-card">
          <h3>⚡ Web Workers</h3>
          <p>Offload heavy computations to background threads to keep the UI responsive during intensive tasks.</p>
          <Link to="/web-workers" className="btn">View Example</Link>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <nav className="nav-container">
            <Link to="/" className="logo">
              <span className="logo-icon">⚡</span>
              <span className="logo-text">React Performance</span>
            </Link>
            <div className="nav-links">
              <NavLink to="/profiling" className="nav-link">
                <span className="nav-icon">📊</span>
                <span className="nav-text">Profiling</span>
              </NavLink>
              <NavLink to="/memoization" className="nav-link">
                <span className="nav-icon">🧠</span>
                <span className="nav-text">Memoization</span>
              </NavLink>
              <NavLink to="/useeffect-antipatterns" className="nav-link">
                <span className="nav-icon">⚠️</span>
                <span className="nav-text">useEffect</span>
              </NavLink>
              <NavLink to="/virtualization" className="nav-link">
                <span className="nav-icon">📜</span>
                <span className="nav-text">Virtualization</span>
              </NavLink>
              <NavLink to="/heavy-tables" className="nav-link">
                <span className="nav-icon">📊</span>
                <span className="nav-text">Tables</span>
              </NavLink>
              <NavLink to="/web-workers" className="nav-link">
                <span className="nav-icon">⚡</span>
                <span className="nav-text">Workers</span>
              </NavLink>
            </div>
          </nav>
        </header>
        
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profiling" element={<ProfilingExample />} />
            <Route path="/memoization" element={<MemoizationExamples />} />
            <Route path="/useeffect-antipatterns" element={<UseEffectAntiPatterns />} />
            <Route path="/virtualization" element={<VirtualizationExample />} />
            <Route path="/heavy-tables" element={<HeavyTableExample />} />
            <Route path="/web-workers" element={<WebWorkersExample />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 