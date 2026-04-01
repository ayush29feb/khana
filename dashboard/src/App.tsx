import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import HomeView from './views/HomeView.js';
import MealsView from './views/MealsView.js';
import PantryView from './views/PantryView.js';
import TrendsView from './views/TrendsView.js';

const navStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
  marginRight: 16,
  fontWeight: isActive ? 'bold' : 'normal',
  textDecoration: 'none',
  color: isActive ? '#000' : '#555',
});

export default function App() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 900, margin: '0 auto', padding: '16px' }}>
      <nav style={{ borderBottom: '1px solid #ddd', paddingBottom: 8, marginBottom: 24 }}>
        <NavLink to="/home" style={navStyle}>Home</NavLink>
        <NavLink to="/meals" style={navStyle}>Meals</NavLink>
        <NavLink to="/pantry" style={navStyle}>Pantry</NavLink>
        <NavLink to="/trends" style={navStyle}>Trends</NavLink>
      </nav>
      <Suspense fallback={<div>Loading…</div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomeView />} />
          <Route path="/meals" element={<MealsView />} />
          <Route path="/pantry" element={<PantryView />} />
          <Route path="/trends" element={<TrendsView />} />
        </Routes>
      </Suspense>
    </div>
  );
}
