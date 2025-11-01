import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import TShirtDesignerPage from './pages/TShirtDesigner';
import BackgroundRemovalPage from './pages/BackgroundRemoval';
import './App.css';

const App = () => {
  const linkClasses = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
      isActive ? 'bg-blue-500 text-white shadow' : 'text-gray-700 hover:bg-gray-100'
    }`;

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white border-b shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🐾</span>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">宠物创意工作室</p>
                <p className="text-xs text-gray-500">T恤设计 & 背景透明化工具</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NavLink to="/" className={linkClasses} end>
                T恤设计师
              </NavLink>
              <NavLink to="/background-removal" className={linkClasses}>
                背景透明工具
              </NavLink>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<TShirtDesignerPage />} />
          <Route path="/background-removal" element={<BackgroundRemovalPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
