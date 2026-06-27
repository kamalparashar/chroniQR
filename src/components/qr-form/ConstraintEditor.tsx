import React from 'react';
import { FocusInput, S } from '../ui/FocusInput';
import { TimezonePicker } from '../ui/TimezonePicker';
import type { DestinationType } from '../../types/qr';

interface ConstraintEditorProps {
  destinationType: DestinationType;
  hasConstraints: boolean;
  setHasConstraints: (v: boolean) => void;
  constraintTimezone: string;
  setConstraintTimezone: (v: string) => void;
  constraintDays: number[];
  toggleConstraintDay: (idx: number) => void;
  constraintStart: string;
  setConstraintStart: (v: string) => void;
  constraintEnd: string;
  setConstraintEnd: (v: string) => void;
  sectionCardStyle: React.CSSProperties;
}

export const ConstraintEditor: React.FC<ConstraintEditorProps> = (props) => {
  if (props.destinationType === 'time_based') return null;

  return (
    <div style={props.sectionCardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>Time Constraints</p>
          <p className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>Restrict this QR to specific hours/days.</p>
        </div>
        <label className="switch">
          <input type="checkbox" checked={props.hasConstraints} onChange={e => props.setHasConstraints(e.target.checked)} />
          <span className="slider" />
        </label>
      </div>

      {props.hasConstraints && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderTop: '1px solid var(--color-border)', paddingTop: 14 }}>
          <div>
            <label style={S.label}>Timezone</label>
            <TimezonePicker value={props.constraintTimezone} onChange={props.setConstraintTimezone} />
          </div>
          <div>
            <label style={S.label}>Active Days</label>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day, idx) => {
                const active = props.constraintDays.includes(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => props.toggleConstraintDay(idx)}
                    style={{
                      padding: '5px 10px', fontSize: 11, borderRadius: 4, border: 'none', cursor: 'pointer',
                      backgroundColor: active ? 'var(--color-accent)' : 'var(--color-surface-hover)',
                      color: active ? '#000' : 'var(--color-text-secondary)',
                      fontWeight: active ? 700 : 400,
                      transition: 'all 100ms',
                    }}
                  >{day}</button>
                );
              })}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={S.label}>Start Time</label>
              <FocusInput type="text" value={props.constraintStart} placeholder="09:00" onChange={e => props.setConstraintStart(e.target.value)} />
            </div>
            <div>
              <label style={S.label}>End Time</label>
              <FocusInput type="text" value={props.constraintEnd} placeholder="17:00" onChange={e => props.setConstraintEnd(e.target.value)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
