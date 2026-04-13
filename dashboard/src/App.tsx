import { Suspense, useState, useRef, useEffect } from 'react';
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
          <div onClick={() => setPopoverOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
          <div className="popover" style={{
            position: 'fixed', top: 60, right: 16, zIndex: 100,
            padding: 16, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 240,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>Custom range</div>
            <div className="date-picker-row" style={{ justifyContent: 'space-between' }}>
              <input type="date" value={tmpFrom} onChange={e => setTmpFrom(e.target.value)} style={{ flex: 1 }} />
              <span style={{ color: 'var(--text-3)' }}>–</span>
              <input type="date" value={tmpTo} onChange={e => setTmpTo(e.target.value)} style={{ flex: 1 }} />
            </div>
            <button onClick={applyCustom} style={{
              background: 'var(--accent)', color: '#000', border: 'none',
              borderRadius: 'var(--radius-sm)', padding: '9px 0',
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}>Apply</button>
          </div>
        </>
      )}
    </div>
  );
}

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

  return { theme, toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') };
}

const TABS = [
  { icon: '🎯', label: 'Goals',   Component: GoalsView   },
  { icon: '🍽', label: 'Meals',   Component: MealsView   },
  { icon: '🥫', label: 'Pantry',  Component: PantryView  },
  { icon: '📋', label: 'Catalog', Component: CatalogView },
];

const TOPBAR_H = 52;

function AppShell() {
  const { theme, toggle } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [dragDelta, setDragDelta] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);
  const activeTabRef = useRef(activeTab);
  const dragDeltaRef = useRef(dragDelta);
  activeTabRef.current = activeTab;
  dragDeltaRef.current = dragDelta;

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      isHorizontalSwipe.current = null;
    };

    const onTouchMove = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - touchStartX.current;
      const dy = e.touches[0].clientY - touchStartY.current;

      if (isHorizontalSwipe.current === null) {
        if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
          isHorizontalSwipe.current = Math.abs(dx) > Math.abs(dy);
        }
        return;
      }

      if (!isHorizontalSwipe.current) return;
      e.preventDefault();

      const tab = activeTabRef.current;
      let delta = dx;
      // Rubber band at edges
      if ((tab === 0 && dx > 0) || (tab === TABS.length - 1 && dx < 0)) {
        delta = dx * 0.2;
      }
      setIsDragging(true);
      setDragDelta(delta);
    };

    const onTouchEnd = () => {
      if (!isHorizontalSwipe.current) return;
      const delta = dragDeltaRef.current;
      const tab = activeTabRef.current;
      if (delta < -60 && tab < TABS.length - 1) setActiveTab(tab + 1);
      else if (delta > 60 && tab > 0) setActiveTab(tab - 1);
      setIsDragging(false);
      setDragDelta(0);
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  const translateX = -activeTab * 100 + (dragDelta / window.innerWidth * 100);

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
                borderRadius: 8, color: 'var(--text-2)', flexShrink: 0,
              }}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {/* Swipe carousel */}
      <div
        ref={carouselRef}
        style={{
          position: 'fixed',
          top: TOPBAR_H,
          left: 0, right: 0, bottom: 0,
          overflow: 'hidden',
        }}
      >
        <div style={{
          display: 'flex',
          height: '100%',
          transform: `translateX(${translateX}%)`,
          transition: isDragging ? 'none' : 'transform 0.38s cubic-bezier(0.25,1,0.5,1)',
          willChange: 'transform',
        }}>
          {TABS.map(({ Component }, i) => (
            <div
              key={i}
              style={{
                width: '100vw',
                flexShrink: 0,
                height: '100%',
                overflowY: 'auto',
                overflowX: 'hidden',
                WebkitOverflowScrolling: 'touch' as never,
              }}
            >
              <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 16px 120px' }}>
                <Suspense fallback={
                  <div style={{ textAlign: 'center', marginTop: 60, color: 'var(--text-3)', fontSize: 15 }}>
                    Loading…
                  </div>
                }>
                  <Component />
                </Suspense>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <nav className="bottom-nav">
        {TABS.map(({ icon, label }, i) => (
          <button
            key={i}
            className={activeTab === i ? 'active' : ''}
            onClick={() => setActiveTab(i)}
          >
            <span className="nav-icon">{icon}</span>
            <span className="nav-label">{label}</span>
          </button>
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
