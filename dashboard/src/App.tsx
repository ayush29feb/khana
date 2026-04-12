import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { Suspense, useState, useEffect } from 'react';
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
    setPreset('custom');
  }

  const LABELS: Record<PresetKey, string> = {
    today: 'Today', yesterday: 'Yesterday',
    last_7: 'Last 7 days',
    this_week: 'This week', last_week: 'Last week',
    last_30: 'Last 30 days',
    this_month: 'This month', last_month: 'Last month',
    custom: 'Custom…',
  };

  return (
    <div style={{ position: 'relative' }}>
      <select value={preset} onChange={e => handlePreset(e.target.value as PresetKey)}>
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
          <div className="popover" style={{
            position: 'fixed', top: 60, right: 16, zIndex: 100,
            padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
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
                background: 'var(--accent)', color: '#000', border: 'none',
                borderRadius: 'var(--radius-sm)', padding: '9px 0',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                transition: 'opacity 0.15s',
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

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  function toggle() {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }

  return { theme, toggle };
}

// Wrap each view with a page-enter animation keyed on route
function AnimatedPage({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-enter">
      {children}
    </div>
  );
}

function AppShell() {
  const { theme, toggle } = useTheme();

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <span className="topbar-brand">🥗 Khana</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <DateRangePicker />
            <button
              onClick={toggle}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 18, lineHeight: 1, padding: '4px',
                borderRadius: 8, color: 'var(--text-2)',
                transition: 'opacity 0.15s, transform 0.2s',
                flexShrink: 0,
              }}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      <main className="shell">
        <Suspense fallback={
          <div style={{ textAlign: 'center', marginTop: 60, color: 'var(--text-3)', fontSize: 15 }}>
            Loading…
          </div>
        }>
          <Routes>
            <Route path="/" element={<Navigate to="/goals" replace />} />
            <Route path="/goals"   element={<AnimatedPage><GoalsView /></AnimatedPage>} />
            <Route path="/meals"   element={<AnimatedPage><MealsView /></AnimatedPage>} />
            <Route path="/pantry"  element={<AnimatedPage><PantryView /></AnimatedPage>} />
            <Route path="/catalog" element={<AnimatedPage><CatalogView /></AnimatedPage>} />
          </Routes>
        </Suspense>
      </main>

      <nav className="bottom-nav">
        {NAV.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="nav-icon">{icon}</span>
            <span className="nav-label">{label}</span>
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
