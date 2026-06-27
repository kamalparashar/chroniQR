import React, { useRef } from 'react';

// ── Reusable dark input style ────────────────────────────────────────────────
export const S = {
  input: {
    width: '100%',
    fontFamily: 'var(--font-inter)',
    fontSize: 14,
    color: 'var(--color-text-primary)',
    backgroundColor: '#080808',
    border: '1px solid var(--color-border)',
    borderRadius: 6,
    padding: '11px 14px',
    outline: 'none',
  } as React.CSSProperties,
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    marginBottom: 6,
  } as React.CSSProperties,
};

export const FocusInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  const localRef = useRef<HTMLInputElement>(null);
  const resolvedRef = (ref as React.RefObject<HTMLInputElement>) || localRef;
  return (
    <input
      ref={resolvedRef}
      {...props}
      style={{ ...S.input, ...props.style }}
      onFocus={e => {
        e.currentTarget.style.borderColor = 'var(--color-accent)';
        e.currentTarget.style.boxShadow   = '0 0 0 3px var(--color-accent-dim)';
      }}
      onBlur={e => {
        e.currentTarget.style.borderColor = 'var(--color-border)';
        e.currentTarget.style.boxShadow   = 'none';
      }}
    />
  );
});
FocusInput.displayName = 'FocusInput';

export const FocusTextarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    style={{ ...S.input, resize: 'vertical', ...props.style }}
    onFocus={e => {
      e.currentTarget.style.borderColor = 'var(--color-accent)';
      e.currentTarget.style.boxShadow   = '0 0 0 3px var(--color-accent-dim)';
    }}
    onBlur={e => {
      e.currentTarget.style.borderColor = 'var(--color-border)';
      e.currentTarget.style.boxShadow   = 'none';
    }}
  />
);
