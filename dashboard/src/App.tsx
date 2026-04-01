import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import HomeView from './views/HomeView.js';
import MealsView from './views/MealsView.js';
import PantryView from './views/PantryView.js';
import TrendsView from './views/TrendsView.js';
import CatalogView from './views/CatalogView.js';
import { DateRangeProvider, useDateRange } from './DateRangeContext.js';

const navStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
  marginRight: 16,
  fontWeight: isActive ? 'bold' : 'normal',
  textDecoration: 'none',
  color: isActive ? '#000' : '#555',
});

function DateRangePicker() {
  const { dateFrom, dateTo, setDateFrom, setDateTo } = useDateRange();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
      <span style={{ color: '#777' }}>Range:</span>
      <input
        type="date"
        value={dateFrom}
        onChange={e => setDateFrom(e.target.value)}
        style={{ fontSize: 13, border: '1px solid #ddd', borderRadius: 4, padding: '2px 6px' }}
      />
      <span style={{ color: '#aaa' }}>→</span>
      <input
        type="date"
        value={dateTo}
        onChange={e => setDateTo(e.target.value)}
        style={{ fontSize: 13, border: '1px solid #ddd', borderRadius: 4, padding: '2px 6px' }}
      />
    </div>
  );
}

function AppShell() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 900, margin: '0 auto', padding: '16px' }}>
      <nav style={{ borderBottom: '1px solid #ddd', paddingBottom: 8, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <NavLink to="/home" style={navStyle}>Home</NavLink>
          <NavLink to="/meals" style={navStyle}>Meals</NavLink>
          <NavLink to="/pantry" style={navStyle}>Pantry</NavLink>
          <NavLink to="/trends" style={navStyle}>Trends</NavLink>
          <NavLink to="/catalog" style={navStyle}>Catalog</NavLink>
        </div>
        <DateRangePicker />
      </nav>
      <Suspense fallback={<div>Loading…</div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomeView />} />
          <Route path="/meals" element={<MealsView />} />
          <Route path="/pantry" element={<PantryView />} />
          <Route path="/trends" element={<TrendsView />} />
          <Route path="/catalog" element={<CatalogView />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <DateRangeProvider>
      <AppShell />
    </DateRangeProvider>
  );
}
