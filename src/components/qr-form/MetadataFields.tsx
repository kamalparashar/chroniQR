import React from 'react';
import { FocusInput, S } from '../ui/FocusInput';

interface MetadataFieldsProps {
  utmSource: string;
  setUtmSource: (v: string) => void;
  utmMedium: string;
  setUtmMedium: (v: string) => void;
  utmCampaign: string;
  setUtmCampaign: (v: string) => void;
  tagsInput: string;
  setTagsInput: (v: string) => void;
  expiresAt: string;
  setExpiresAt: (v: string) => void;
  ga4Enabled: boolean;
  setGa4Enabled: (v: boolean) => void;
  sectionCardStyle: React.CSSProperties;
}

export const MetadataFields: React.FC<MetadataFieldsProps> = (props) => {
  return (
    <>
      {/* UTM Config */}
      <div className="flex flex-col gap-4" style={props.sectionCardStyle}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>UTM Attribution</p>
        <p className="text-muted" style={{ fontSize: 12, marginTop: -8 }}>Parameters appended to destination URLs automatically.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={S.label}>Source</label>
            <FocusInput type="text" value={props.utmSource} placeholder="qr_code" onChange={e => props.setUtmSource(e.target.value)} style={{ fontFamily: 'var(--font-geistmono)', fontSize: 13 }} />
          </div>
          <div>
            <label style={S.label}>Medium</label>
            <FocusInput type="text" value={props.utmMedium} placeholder="print" onChange={e => props.setUtmMedium(e.target.value)} style={{ fontFamily: 'var(--font-geistmono)', fontSize: 13 }} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={S.label}>Campaign</label>
            <FocusInput type="text" value={props.utmCampaign} placeholder="summer_2026_newsletter" onChange={e => props.setUtmCampaign(e.target.value)} style={{ fontFamily: 'var(--font-geistmono)', fontSize: 13 }} />
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex flex-col gap-4" style={props.sectionCardStyle}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>Metadata & Analytics</p>
        <div>
          <label style={S.label}>Tags (comma separated)</label>
          <FocusInput type="text" value={props.tagsInput} placeholder="newsletter, marketing, print_run_1" onChange={e => props.setTagsInput(e.target.value)} />
        </div>
        <div>
          <label style={S.label}>Expiration Date / Time</label>
          <FocusInput type="datetime-local" value={props.expiresAt} onChange={e => props.setExpiresAt(e.target.value)} />
        </div>
        <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 14 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>GA4 Measurement Tracking</p>
            <p className="text-muted" style={{ fontSize: 11, marginTop: 2 }}>Fires real-time events to Google Analytics.</p>
          </div>
          <label className="switch">
            <input type="checkbox" checked={props.ga4Enabled} onChange={e => props.setGa4Enabled(e.target.checked)} />
            <span className="slider" />
          </label>
        </div>
      </div>
    </>
  );
};
