import { useState, useMemo } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import ColumnSelector from '../components/ColumnSelector.js';
import MacroDonut from '../components/MacroDonut.js';
import type { PantryViewQuery } from './__generated__/PantryViewQuery.graphql.js';

const query = graphql`
  query PantryViewQuery {
    pantry {
      edges {
        node {
          id
          servingsRemaining
          proteinAvailable
          catalogItem {
            name
            brand
            healthNotes
            proteinPerServing
            carbsPerServing
            fatPerServing
            caloriesPerServing
            category
          }
        }
      }
    }
    pantryProteinTotal
  }
`;

type SortKey = 'name' | 'servings' | 'protein' | 'carbs' | 'fat' | 'calories';

function InfoIcon({ note }: { note: string }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button className={`info-btn${show ? ' active' : ''}`} onClick={() => setShow(v => !v)} title={note}>i</button>
      {show && (
        <span style={{
          position: 'absolute', left: 22, top: -4, zIndex: 10,
          background: '#1e293b', color: '#fff', fontSize: 12,
          padding: '6px 10px', borderRadius: 'var(--radius-sm)',
          whiteSpace: 'normal', lineHeight: 1.5, width: 220,
          boxShadow: 'var(--shadow-md)',
        }}>{note}</span>
      )}
    </span>
  );
}

function SortHeader({ label, col, sort, dir, left, onSort }: {
  label: string; col: SortKey; sort: SortKey; dir: 1 | -1;
  left?: boolean; onSort: (c: SortKey) => void;
}) {
  const active = sort === col;
  return (
    <th onClick={() => onSort(col)} style={{
      padding: '6px 6px', textAlign: left ? 'left' : 'right',
      cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
      color: active ? 'var(--accent)' : 'var(--text-3)',
      fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em',
    }}>
      {label}{active ? (dir === 1 ? '↑' : '↓') : ''}
    </th>
  );
}

const CATEGORY_ORDER = ['dairy & eggs', 'protein', 'produce', 'grains', 'snacks', 'condiments', 'frozen', 'beverages', 'other'];

type PantryNode = {
  id: string;
  servingsRemaining: number;
  proteinAvailable: number;
  catalogItem: {
    name: string;
    brand?: string | null;
    healthNotes?: string | null;
    proteinPerServing: number;
    carbsPerServing: number;
    fatPerServing: number;
    caloriesPerServing?: number | null;
    category?: string | null;
  };
};

function PantryTable({ nodes, sort, dir, visibleCols, onSort }: {
  nodes: PantryNode[];
  sort: SortKey;
  dir: 1 | -1;
  visibleCols: Set<string>;
  onSort: (c: SortKey) => void;
}) {
  return (
    <table className="pantry-table" style={{ width: '100%', tableLayout: 'fixed' }}>
      <colgroup>
        <col />
        {visibleCols.has('servings') && <col style={{ width: '13%' }} />}
        {visibleCols.has('protein')  && <col style={{ width: '13%' }} />}
        {visibleCols.has('carbs')    && <col style={{ width: '13%' }} />}
        {visibleCols.has('fat')      && <col style={{ width: '12%' }} />}
        {visibleCols.has('calories') && <col style={{ width: '14%' }} />}
      </colgroup>
      <thead>
        <tr>
          <SortHeader label="Item"  col="name"     sort={sort} dir={dir} left onSort={onSort} />
          {visibleCols.has('servings') && <SortHeader label="Srv"   col="servings" sort={sort} dir={dir} onSort={onSort} />}
          {visibleCols.has('protein')  && <SortHeader label="P/srv" col="protein"  sort={sort} dir={dir} onSort={onSort} />}
          {visibleCols.has('carbs')    && <SortHeader label="C/srv" col="carbs"    sort={sort} dir={dir} onSort={onSort} />}
          {visibleCols.has('fat')      && <SortHeader label="F/srv" col="fat"      sort={sort} dir={dir} onSort={onSort} />}
          {visibleCols.has('calories') && <SortHeader label="kcal"  col="calories" sort={sort} dir={dir} onSort={onSort} />}
        </tr>
      </thead>
      <tbody>
        {nodes.map(node => {
          const ci = node.catalogItem;
          return (
            <tr key={node.id}>
              <td style={{ overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden' }}>
                  <span style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ci.name}
                  </span>
                  {ci.healthNotes && <InfoIcon note={ci.healthNotes} />}
                </div>
                {ci.brand && <div className="pantry-item-brand">{ci.brand}</div>}
              </td>
              {visibleCols.has('servings') && (
                <td style={{ textAlign: 'right', fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>
                  {node.servingsRemaining.toFixed(1)}
                </td>
              )}
              {visibleCols.has('protein') && (
                <td style={{ textAlign: 'right', fontSize: 12, fontWeight: 600, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>
                  {(ci.proteinPerServing ?? 0).toFixed(0)}g
                </td>
              )}
              {visibleCols.has('carbs') && (
                <td style={{ textAlign: 'right', fontSize: 12, color: 'var(--amber)', fontVariantNumeric: 'tabular-nums' }}>
                  {(ci.carbsPerServing ?? 0).toFixed(0)}g
                </td>
              )}
              {visibleCols.has('fat') && (
                <td style={{ textAlign: 'right', fontSize: 12, color: '#f97316', fontVariantNumeric: 'tabular-nums' }}>
                  {(ci.fatPerServing ?? 0).toFixed(0)}g
                </td>
              )}
              {visibleCols.has('calories') && (
                <td style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-2)', fontVariantNumeric: 'tabular-nums' }}>
                  {ci.caloriesPerServing ? ci.caloriesPerServing.toFixed(0) : '—'}
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function PantryView() {
  const data = useLazyLoadQuery<PantryViewQuery>(query, {});
  const entries = data.pantry.edges;

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('protein');
  const [dir, setDir] = useState<1 | -1>(-1);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [visibleCols, setVisibleCols] = useState<Set<string>>(
    () => new Set(['servings', 'protein', 'carbs', 'fat', 'calories'])
  );

  const PANTRY_COLS = [
    { key: 'servings', label: 'Servings' },
    { key: 'protein',  label: 'Protein' },
    { key: 'carbs',    label: 'Carbs' },
    { key: 'fat',      label: 'Fat' },
    { key: 'calories', label: 'Calories' },
  ];

  function toggleCol(key: string, on: boolean) {
    setVisibleCols(prev => { const s = new Set(prev); on ? s.add(key) : s.delete(key); return s; });
  }

  function handleSort(col: SortKey) {
    if (sort === col) setDir(d => (d === 1 ? -1 : 1));
    else { setSort(col); setDir(-1); }
  }

  function toggleCollapsed(cat: string) {
    setCollapsed(prev => {
      const s = new Set(prev);
      s.has(cat) ? s.delete(cat) : s.add(cat);
      return s;
    });
  }

  const totalCarbs    = entries.reduce((s, { node }) => s + (node.catalogItem.carbsPerServing ?? 0) * node.servingsRemaining, 0);
  const totalFat      = entries.reduce((s, { node }) => s + (node.catalogItem.fatPerServing ?? 0) * node.servingsRemaining, 0);
  const totalCalories = entries.reduce((s, { node }) => s + (node.catalogItem.caloriesPerServing ?? 0) * node.servingsRemaining, 0);

  const sortNodes = (nodes: PantryNode[]) =>
    nodes.slice().sort((a, b) => {
      const na = a.catalogItem, nb = b.catalogItem;
      let va: number | string, vb: number | string;
      switch (sort) {
        case 'name':     va = na.name;                    vb = nb.name; break;
        case 'servings': va = a.servingsRemaining;         vb = b.servingsRemaining; break;
        case 'protein':  va = na.proteinPerServing ?? 0;  vb = nb.proteinPerServing ?? 0; break;
        case 'carbs':    va = na.carbsPerServing ?? 0;    vb = nb.carbsPerServing ?? 0; break;
        case 'fat':      va = na.fatPerServing ?? 0;      vb = nb.fatPerServing ?? 0; break;
        case 'calories': va = na.caloriesPerServing ?? 0; vb = nb.caloriesPerServing ?? 0; break;
      }
      if (va < vb) return -dir;
      if (va > vb) return dir;
      return 0;
    });

  const activeNodes = useMemo(() =>
    entries
      .filter(({ node }) => node.servingsRemaining > 0)
      .map(({ node }) => node),
    [entries]
  );

  // Search: flat sorted list
  const searchResults = useMemo(() => {
    if (!search) return [];
    const q = search.toLowerCase();
    const filtered = activeNodes.filter(node =>
      node.catalogItem.name.toLowerCase().includes(q) ||
      node.catalogItem.brand?.toLowerCase().includes(q)
    );
    return sortNodes(filtered);
  }, [activeNodes, search, sort, dir]);

  // Grouped by category
  const sections = useMemo(() => {
    const groups = new Map<string, PantryNode[]>();
    for (const node of activeNodes) {
      const cat = node.catalogItem.category ?? 'other';
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(node);
    }
    return CATEGORY_ORDER
      .filter(cat => groups.has(cat))
      .map(cat => ({ cat, nodes: sortNodes(groups.get(cat)!) }))
      .concat(
        [...groups.keys()]
          .filter(cat => !CATEGORY_ORDER.includes(cat))
          .map(cat => ({ cat, nodes: sortNodes(groups.get(cat)!) }))
      );
  }, [activeNodes, sort, dir]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 className="page-title" style={{ margin: 0 }}>Pantry</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 12, display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{data.pantryProteinTotal.toFixed(0)}g P</span>
            <span style={{ color: 'var(--amber)' }}>{totalCarbs.toFixed(0)}g C</span>
            <span style={{ color: '#f97316' }}>{totalFat.toFixed(0)}g F</span>
            {totalCalories > 0 && <span style={{ color: 'var(--text-3)' }}>{totalCalories.toFixed(0)} kcal</span>}
          </div>
          <MacroDonut protein={data.pantryProteinTotal} carbs={totalCarbs} fat={totalFat} size={36} />
        </div>
      </div>

      <div className="card" style={{ marginBottom: 10, padding: '8px 12px' }}>
        <input
          type="search"
          placeholder="Search by name or brand…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', border: 'none', outline: 'none', fontSize: 14, background: 'transparent', color: 'var(--text-1)' }}
        />
      </div>

      {entries.length === 0 && <p style={{ color: 'var(--text-3)' }}>Pantry is empty.</p>}

      <ColumnSelector cols={PANTRY_COLS} visible={visibleCols} onChange={toggleCol} />

      {search ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <PantryTable nodes={searchResults} sort={sort} dir={dir} visibleCols={visibleCols} onSort={handleSort} />
        </div>
      ) : (
        sections.map(({ cat, nodes }) => {
          const isCollapsed = collapsed.has(cat);
          return (
            <div key={cat} style={{ marginBottom: 10 }}>
              <button
                onClick={() => toggleCollapsed(cat)}
                style={{
                  width: '100%', textAlign: 'left', background: 'none', border: 'none',
                  cursor: 'pointer', padding: '0 2px 4px',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <span style={{
                  fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: 'var(--text-3)',
                }}>{cat}</span>
                <span style={{ fontSize: 9, color: 'var(--text-3)', opacity: 0.6 }}>{nodes.length}</span>
                <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-3)', opacity: 0.5 }}>
                  {isCollapsed ? '▸' : '▾'}
                </span>
              </button>
              {!isCollapsed && (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <PantryTable nodes={nodes} sort={sort} dir={dir} visibleCols={visibleCols} onSort={handleSort} />
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
