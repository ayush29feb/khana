import { useState, useMemo } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import ColumnSelector from '../components/ColumnSelector.js';
import type { CatalogViewQuery } from './__generated__/CatalogViewQuery.graphql.js';

const query = graphql`
  query CatalogViewQuery {
    catalog(first: 100) {
      edges {
        node {
          id
          name
          brand
          servingSizeG
          proteinPerServing
          carbsPerServing
          fatPerServing
          caloriesPerServing
          healthNotes
          labelPhotoUrl
        }
      }
    }
  }
`;

type SortKey = 'name' | 'brand' | 'serving' | 'protein' | 'carbs' | 'fat' | 'calories';

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

type CatalogNode = { id: string; name: string; brand: string; servingSizeG: number; proteinPerServing: number; carbsPerServing: number; fatPerServing: number; caloriesPerServing?: number | null; healthNotes?: string | null; labelPhotoUrl?: string | null };

function CatalogRow({ node, visibleCols }: { node: CatalogNode; visibleCols: Set<string> }) {
  const [labelPhotoUrl, setLabelPhotoUrl] = useState(node.labelPhotoUrl ?? null);
  const [expanded, setExpanded] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`/upload/catalog/${node.id}`, { method: 'POST', body: form });
    if (res.ok) {
      const { url } = await res.json();
      setLabelPhotoUrl(url);
    }
    e.target.value = '';
  }

  const colSpan = visibleCols.size + 1;

  return (
    <>
      <tr
        onClick={() => setExpanded(e => !e)}
        style={{ cursor: 'pointer', borderBottom: expanded ? 'none' : undefined }}
      >
        <td style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden' }}>
            <span style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
              {node.name}
            </span>
            {labelPhotoUrl && (
              <span style={{ fontSize: 11, flexShrink: 0, lineHeight: 1 }}>📷</span>
            )}
          </div>
          {node.healthNotes && (
            <div style={{ fontSize: 10, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {node.healthNotes}
            </div>
          )}
        </td>
        {visibleCols.has('brand') && (
          <td style={{ fontSize: 11, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.brand}</td>
        )}
        {visibleCols.has('serving') && (
          <td style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-2)', fontVariantNumeric: 'tabular-nums' }}>{node.servingSizeG}g</td>
        )}
        {visibleCols.has('protein') && (
          <td style={{ textAlign: 'right', fontSize: 12, fontWeight: 600, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{node.proteinPerServing}g</td>
        )}
        {visibleCols.has('carbs') && (
          <td style={{ textAlign: 'right', fontSize: 12, color: 'var(--amber)', fontVariantNumeric: 'tabular-nums' }}>{node.carbsPerServing}g</td>
        )}
        {visibleCols.has('fat') && (
          <td style={{ textAlign: 'right', fontSize: 12, color: '#f97316', fontVariantNumeric: 'tabular-nums' }}>{node.fatPerServing}g</td>
        )}
        {visibleCols.has('calories') && (
          <td style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-2)', fontVariantNumeric: 'tabular-nums' }}>{node.caloriesPerServing ?? '—'}</td>
        )}
      </tr>
      {expanded && (
        <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
          <td colSpan={colSpan} style={{ padding: '6px 8px 10px' }}>
            {labelPhotoUrl && (
              <img
                src={labelPhotoUrl}
                style={{ width: '100%', maxHeight: 260, objectFit: 'contain', borderRadius: 6, display: 'block', marginBottom: 6 }}
              />
            )}
            <label style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer',
              fontSize: 11, color: 'var(--text-3)', padding: '4px 8px',
              border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)',
            }}>
              <span>📷</span>
              <span>{labelPhotoUrl ? 'Replace label photo' : 'Add label photo'}</span>
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
          </td>
        </tr>
      )}
    </>
  );
}

export default function CatalogView() {
  const data = useLazyLoadQuery<CatalogViewQuery>(query, {});
  const items = data.catalog.edges;

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('name');
  const [dir, setDir] = useState<1 | -1>(1);
  const [visibleCols, setVisibleCols] = useState<Set<string>>(
    () => new Set(['protein', 'carbs', 'fat', 'calories'])
  );

  const CATALOG_COLS = [
    { key: 'brand',    label: 'Brand' },
    { key: 'serving',  label: 'Serving' },
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
    else { setSort(col); setDir(col === 'name' || col === 'brand' ? 1 : -1); }
  }

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = items.filter(({ node }) =>
      node.name.toLowerCase().includes(q) ||
      node.brand?.toLowerCase().includes(q)
    );
    return filtered.slice().sort((a, b) => {
      const na = a.node, nb = b.node;
      let va: number | string, vb: number | string;
      switch (sort) {
        case 'name':     va = na.name;                    vb = nb.name; break;
        case 'brand':    va = na.brand ?? '';              vb = nb.brand ?? ''; break;
        case 'serving':  va = na.servingSizeG;             vb = nb.servingSizeG; break;
        case 'protein':  va = na.proteinPerServing;        vb = nb.proteinPerServing; break;
        case 'carbs':    va = na.carbsPerServing;          vb = nb.carbsPerServing; break;
        case 'fat':      va = na.fatPerServing;            vb = nb.fatPerServing; break;
        case 'calories': va = na.caloriesPerServing ?? 0;  vb = nb.caloriesPerServing ?? 0; break;
      }
      if (va < vb) return -dir;
      if (va > vb) return dir;
      return 0;
    });
  }, [items, search, sort, dir]);

  return (
    <div>
      <h2 className="page-title">Catalog</h2>

      <div className="card" style={{ marginBottom: 10, padding: '8px 12px' }}>
        <input
          type="search"
          placeholder="Search by name or brand…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', border: 'none', outline: 'none', fontSize: 14, background: 'transparent', color: 'var(--text-1)' }}
        />
      </div>

      <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>
        {rows.length} of {items.length} items
      </div>

      {items.length === 0 && (
        <p style={{ color: 'var(--text-3)' }}>No items. Use <code>food catalog add</code> to add items.</p>
      )}

      <ColumnSelector cols={CATALOG_COLS} visible={visibleCols} onChange={toggleCol} />

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="pantry-table" style={{ width: '100%', tableLayout: 'fixed' }}>
          <colgroup>
            <col />
            {visibleCols.has('brand')    && <col style={{ width: '22%' }} />}
            {visibleCols.has('serving')  && <col style={{ width: '12%' }} />}
            {visibleCols.has('protein')  && <col style={{ width: '11%' }} />}
            {visibleCols.has('carbs')    && <col style={{ width: '11%' }} />}
            {visibleCols.has('fat')      && <col style={{ width: '10%' }} />}
            {visibleCols.has('calories') && <col style={{ width: '13%' }} />}
          </colgroup>
          <thead>
            <tr>
              <SortHeader label="Name"  col="name"     sort={sort} dir={dir} left onSort={handleSort} />
              {visibleCols.has('brand')    && <SortHeader label="Brand"  col="brand"    sort={sort} dir={dir} left onSort={handleSort} />}
              {visibleCols.has('serving')  && <SortHeader label="Srv"    col="serving"  sort={sort} dir={dir}      onSort={handleSort} />}
              {visibleCols.has('protein')  && <SortHeader label="P"      col="protein"  sort={sort} dir={dir}      onSort={handleSort} />}
              {visibleCols.has('carbs')    && <SortHeader label="C"      col="carbs"    sort={sort} dir={dir}      onSort={handleSort} />}
              {visibleCols.has('fat')      && <SortHeader label="F"      col="fat"      sort={sort} dir={dir}      onSort={handleSort} />}
              {visibleCols.has('calories') && <SortHeader label="kcal"   col="calories" sort={sort} dir={dir}      onSort={handleSort} />}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ node }) => (
              <CatalogRow
                key={node.id}
                node={node}
                visibleCols={visibleCols}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
