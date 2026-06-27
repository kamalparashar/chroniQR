import React, { useState, useEffect, useRef } from 'react';
import { S } from './FocusInput';

export interface CustomSelectOption {
  value: string;
  label: string;
}

export function CustomSelect({ value, options, onChange, style }: {
  value: string;
  options: readonly CustomSelectOption[] | CustomSelectOption[];
  onChange: (value: string) => void;
  style?: React.CSSProperties;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', ...style }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...S.input,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          textAlign: 'left',
          paddingRight: '14px',
          borderColor: isOpen ? 'var(--color-accent)' : 'var(--color-border)',
          boxShadow: isOpen ? '0 0 0 3px var(--color-accent-dim)' : 'none',
        }}
      >
        <span>{selectedOption ? selectedOption.label : 'Select...'}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="var(--color-text-secondary)"
          strokeWidth="2"
          style={{
            width: 16,
            height: 16,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          width: '100%',
          maxHeight: '240px',
          overflowY: 'auto',
          border: '1px solid var(--color-border)',
          borderRadius: '6px',
          backgroundColor: '#080808',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.5)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          gap: '1px',
          padding: '4px',
        }}>
          {options.map(opt => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontFamily: 'var(--font-inter)',
                  backgroundColor: isSelected ? 'var(--color-accent)' : 'transparent',
                  color: isSelected ? '#000000' : 'var(--color-text-primary)',
                  fontWeight: isSelected ? 600 : 400,
                  transition: 'all 0.1s ease-out',
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
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
