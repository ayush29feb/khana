interface ColDef {
  key: string;
  label: string;
}

interface Props {
  cols: ColDef[];
  visible: Set<string>;
  onChange: (key: string, on: boolean) => void;
}

export default function ColumnSelector({ cols, visible, onChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
      {cols.map(({ key, label }) => {
        const on = visible.has(key);
        return (
          <button
            key={key}
            onClick={() => onChange(key, !on)}
            style={{
              fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 99,
              border: '1.5px solid var(--border)',
              background: on ? 'var(--accent)' : 'transparent',
              color: on ? '#fff' : 'var(--text-3)',
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
