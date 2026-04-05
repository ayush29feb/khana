import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Suspense, useState } from 'react';
import GoalsView from './views/GoalsView.js';
import MealsView from './views/MealsView.js';
import PantryView from './views/PantryView.js';
import CatalogView from './views/CatalogView.js';
import { DateRangeProvider, useDateRange } from './DateRangeContext.js';

function localDate(d: Date): string {
  return d.toLocaleDateString('en-CA');
}

type PresetKey = 'today' | 'yesterday' | 'last_7' | 'this_week' | 'last_week' | 'last_30' | 'this_month' | 'last_month' | 'custom';

function getPresetRange(key: PresetKey): { from: string; to: string } | null {
  const today = new Date();
  switch (key) {
    case 'today': { const s = localDate(today); return { from: s, to: s }; }
    case 'yesterday': { const d = new Date(today); d.setDate(d.getDate() - 1); const s = localDate(d); return { from: s, to: s }; }
    case 'last_7': { const d = new Date(today); d.setDate(d.getDate() - 6); return { from: localDate(d), to: localDate(today) }; }
    case 'this_week': {
      const day = today.getDay();
      const mon = new Date(today); mon.setDate(today.getDate() + (day === 0 ? -6 : 1 - day));
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
      return { from: localDate(mon), to: localDate(sun) };
    }
    case 'last_week': {
      const day = today.getDay();
      const thisMon = new Date(today); thisMon.setDate(today.getDate() + (day === 0 ? -6 : 1 - day));
      const lastMon = new Date(thisMon); lastMon.setDate(thisMon.getDate() - 7);
      const lastSun = new Date(lastMon); lastSun.setDate(lastMon.getDate() + 6);
      return { from: localDate(lastMon), to: localDate(lastSun) };
    }
    case 'last_30': { const d = new Date(today); d.setDate(d.getDate() - 29); return { from: localDate(d), to: localDate(today) }; }
    case 'this_month': {
      const first = new Date(today.getFullYear(), today.getMonth(), 1);
      const last  = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { from: localDate(first), to: localDate(last) };
    }
    case 'last_month': {
      const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const last  = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from: localDate(first), to: localDate(last) };
    }
    default: return null;
  }
}

function detectPreset(from: string, to: string): PresetKey {
  const keys: PresetKey[] = ['today', 'yesterday', 'this_week', 'this_month'];
  for (const k of keys) {
    const r = getPresetRange(k);
    if (r && r.from === from && r.to === to) return k;
  }
  return 'custom';
}

function DateRangePicker() {
  const { dateFrom, dateTo, setDateFrom, setDateTo } = useDateRange();
  const [preset, setPreset] = useState<PresetKey>(() => detectPreset(dateFrom, dateTo));
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [tmpFrom, setTmpFrom] = useState(dateFrom);
  const [tmpTo, setTmpTo] = useState(dateTo);

  function handlePreset(key: PresetKey) {
    setPreset(key);
    if (key !== 'custom') {
      const r = getPresetRange(key)!;
      setDateFrom(r.from);
      setDateTo(r.to);
      setPopoverOpen(false);
    } else {
      setTmpFrom(dateFrom);
      setTmpTo(dateTo);
      setPopoverOpen(true);
    }
  }

  function applyCustom() {
    setDateFrom(tmpFrom);
    setDateTo(tmpTo);
    setPopoverOpen(false);
  }

  const LABELS: Record<PresetKey, string> = {
    today: 'Today', yesterday: 'Yesterday',
    last_7: 'Last 7 days',
    this_week: 'This week', last_week: 'Last week',
    last_30: 'Last 30 days',
    this_month: 'This month', last_month: 'Last month',
    custom: 'Custom range',
  };

  return (
    <div style={{ position: 'relative' }}>
      <select
        value={preset}
        onChange={e => handlePreset(e.target.value as PresetKey)}
        style={{
          fontSize: 13, fontWeight: 500, padding: '5px 10px',
          borderRadius: 'var(--radius)', border: '1.5px solid var(--border)',
          background: 'var(--card)', color: 'var(--text-1)', cursor: 'pointer',
        }}
      >
        {(Object.keys(LABELS) as PresetKey[]).map(k => (
          <option key={k} value={k}>{LABELS[k]}</option>
        ))}
      </select>

      {popoverOpen && (
        <>
          <div
            onClick={() => setPopoverOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
          />
          <div style={{
            position: 'fixed', top: 58, right: 16, zIndex: 100,
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: 16,
            boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: 12,
            minWidth: 240,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>Custom range</div>
            <div className="date-picker-row" style={{ justifyContent: 'space-between' }}>
              <input type="date" value={tmpFrom} onChange={e => setTmpFrom(e.target.value)} style={{ flex: 1 }} />
              <span style={{ color: 'var(--text-3)' }}>–</span>
              <input type="date" value={tmpTo} onChange={e => setTmpTo(e.target.value)} style={{ flex: 1 }} />
            </div>
            <button
              onClick={applyCustom}
              style={{
                background: 'var(--accent)', color: '#fff', border: 'none',
                borderRadius: 'var(--radius-sm)', padding: '8px 0',
                fontWeight: 600, fontSize: 13, cursor: 'pointer',
              }}
            >
              Apply
            </button>
          </div>
        </>
      )}
    </div>
  );
}


const NAV = [
  { to: '/goals',   icon: '🎯',  label: 'Goals'   },
  { to: '/meals',   icon: '🍽',  label: 'Meals'   },
  { to: '/pantry',  icon: '🥫',  label: 'Pantry'  },
  { to: '/catalog', icon: '📋',  label: 'Catalog' },
];

function AppShell() {
  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <span className="topbar-brand">🥗 tracker</span>
          <DateRangePicker />
        </div>
      </header>

      <main className="shell">
        <Suspense fallback={<p style={{ color: 'var(--text-3)', marginTop: 32, textAlign: 'center' }}>Loading…</p>}>
          <Routes>
            <Route path="/" element={<Navigate to="/goals" replace />} />
            <Route path="/goals"   element={<GoalsView />} />
            <Route path="/meals"   element={<MealsView />} />
            <Route path="/pantry"  element={<PantryView />} />
            <Route path="/catalog" element={<CatalogView />} />
          </Routes>
        </Suspense>
      </main>

      <nav className="bottom-nav">
        {NAV.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="nav-icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}

export default function App() {
  return (
    <DateRangeProvider>
      <AppShell />
    </DateRangeProvider>
  );
}
