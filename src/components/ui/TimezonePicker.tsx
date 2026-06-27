import { useState } from 'react';
import { Globe } from 'lucide-react';
import { TZ_OPTIONS, DETECTED_TZ, getGmtOffset } from '../../constants/timezones';
import { FocusInput } from './FocusInput';

export function TimezonePicker({ value, onChange }: { value: string; onChange: (tz: string) => void }) {
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? TZ_OPTIONS.filter(tz =>
        tz.name.toLowerCase().includes(search.toLowerCase()) ||
        tz.offset.toLowerCase().includes(search.toLowerCase())
      )
    : TZ_OPTIONS;

  const isAutoDetected = value === DETECTED_TZ;
  const currentOffset = getGmtOffset(value);

  return (
    <div>
      {/* Auto-detected badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 12px',
          backgroundColor: isAutoDetected ? 'var(--color-accent-dim)' : 'var(--color-surface-hover)',
          border: `1px solid ${isAutoDetected ? 'rgba(204,255,0,0.2)' : 'var(--color-border)'}`,
          borderRadius: 6,
          fontSize: 13,
          fontFamily: 'var(--font-geistmono)',
          color: isAutoDetected ? 'var(--color-accent)' : 'var(--color-text-primary)',
        }}>
          <Globe size={13} />
          <span>{value}</span>
          {currentOffset && (
            <span style={{
              fontSize: '11px',
              opacity: 0.8,
              marginLeft: '4px',
              fontVariantNumeric: 'tabular-nums'
            }}>({currentOffset})</span>
          )}
          {isAutoDetected && (
            <span style={{
              fontSize: 10, fontWeight: 600,
              backgroundColor: 'var(--color-accent)', color: '#000',
              borderRadius: 3, padding: '1px 5px', marginLeft: 4,
            }}>AUTO</span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOverrideOpen(o => !o)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12, color: 'var(--color-text-secondary)',
            textDecoration: 'underline', padding: 0,
          }}
        >
          {overrideOpen ? 'Cancel override' : 'Override timezone'}
        </button>

        {!isAutoDetected && (
          <button
            type="button"
            onClick={() => { onChange(DETECTED_TZ); setSearch(''); setOverrideOpen(false); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, color: 'var(--color-accent)', padding: 0,
            }}
          >
            Reset to auto
          </button>
        )}
      </div>

      {overrideOpen && (
        <div>
          <FocusInput
            type="text"
            placeholder="Search timezone… (e.g. Kolkata, Tokyo, New_York)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ marginBottom: 6 }}
          />
          <div style={{
            maxHeight: '180px',
            overflowY: 'auto',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            backgroundColor: '#080808',
            display: 'flex',
            flexDirection: 'column',
            gap: '1px',
            padding: '4px',
          }}>
            {filtered.slice(0, 100).map(tz => {
              const isSelected = tz.name === value;
              return (
                <div
                  key={tz.name}
                  onClick={() => { onChange(tz.name); setSearch(''); setOverrideOpen(false); }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontFamily: 'var(--font-geistmono)',
                    backgroundColor: isSelected ? 'var(--color-accent)' : 'transparent',
                    color: isSelected ? '#000000' : 'var(--color-text-primary)',
                    fontWeight: isSelected ? 600 : 400,
                    transition: 'all 0.1s ease-out',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
                      e.currentTarget.style.color = 'var(--color-accent)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--color-text-primary)';
                    }
                  }}
                >
                  <span>{tz.name}</span>
                  <span style={{
                    fontSize: '11px',
                    color: isSelected ? 'rgba(0,0,0,0.6)' : 'var(--color-text-secondary)',
                    marginLeft: '8px',
                    fontVariantNumeric: 'tabular-nums'
                  }}>{tz.offset}</span>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--color-text-disabled)' }}>
                No timezones found.
              </div>
            )}
          </div>
          {filtered.length > 100 && (
            <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4 }}>
              Showing first 100 of {filtered.length} — refine your search.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
