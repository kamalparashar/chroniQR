import React from 'react';
import { FocusInput, FocusTextarea, S } from '../ui/FocusInput';
import { CustomSelect } from '../ui/CustomSelect';
import { TimezonePicker } from '../ui/TimezonePicker';
import { TimeRuleBuilder } from '../TimeRuleBuilder';
import type { DestinationType, TimeRule } from '../../types/qr';
import { FALLBACK_OPTIONS } from '../../constants/destinations';

interface DestinationFieldsProps {
  destinationType: DestinationType;
  
  url: string; setUrl: (v: string) => void;
  
  waPhone: string; setWaPhone: (v: string) => void;
  waMsg: string; setWaMsg: (v: string) => void;
  
  callNumber: string; setCallNumber: (v: string) => void;
  callCta: string; setCallCta: (v: string) => void;
  
  emailTo: string; setEmailTo: (v: string) => void;
  emailSub: string; setEmailSub: (v: string) => void;
  emailBody: string; setEmailBody: (v: string) => void;
  
  vcName: string; setVcName: (v: string) => void;
  vcPhone: string; setVcPhone: (v: string) => void;
  vcEmail: string; setVcEmail: (v: string) => void;
  vcCompany: string; setVcCompany: (v: string) => void;
  vcWebsite: string; setVcWebsite: (v: string) => void;
  vcNote: string; setVcNote: (v: string) => void;
  
  timezone: string; setTimezone: (v: string) => void;
  rules: TimeRule[]; setRules: (v: TimeRule[]) => void;
  defaultType: string; setDefaultType: (v: string) => void;
  defaultUrl: string; setDefaultUrl: (v: string) => void;
  defaultWaPhone: string; setDefaultWaPhone: (v: string) => void;
  defaultWaMsg: string; setDefaultWaMsg: (v: string) => void;
  defaultCallNumber: string; setDefaultCallNumber: (v: string) => void;
  defaultCallCta: string; setDefaultCallCta: (v: string) => void;
  
  livePreviewText: string;
}

export const DestinationFields: React.FC<DestinationFieldsProps> = (props) => {
  const { destinationType } = props;

  return (
    <>
      {destinationType === 'url' && (
        <div>
          <label style={S.label}>Destination URL</label>
          <FocusInput
            type="url"
            value={props.url}
            placeholder="https://example.com/promo"
            onChange={e => props.setUrl(e.target.value)}
            style={{ fontFamily: 'var(--font-geistmono)', fontSize: 13 }}
            required
          />
          <p className="text-muted" style={{ fontSize: 11, marginTop: 4 }}>Scanners are redirected to this URL (with UTM params appended).</p>
        </div>
      )}

      {destinationType === 'whatsapp' && (
        <div className="flex flex-col gap-3">
          <div>
            <label style={S.label}>WhatsApp Number (E.164)</label>
            <FocusInput type="tel" value={props.waPhone} placeholder="+919876543210" onChange={e => props.setWaPhone(e.target.value)} required />
          </div>
          <div>
            <label style={S.label}>Default Message</label>
            <FocusTextarea rows={3} value={props.waMsg} placeholder="Hello, I'd like to inquire about…" onChange={e => props.setWaMsg(e.target.value)} />
          </div>
        </div>
      )}

      {destinationType === 'call' && (
        <div className="flex flex-col gap-3">
          <div>
            <label style={S.label}>AI Agent Number (E.164)</label>
            <FocusInput type="tel" value={props.callNumber} placeholder="+14155552671" onChange={e => props.setCallNumber(e.target.value)} required />
          </div>
          <div>
            <label style={S.label}>Landing Page CTA Text</label>
            <FocusInput type="text" value={props.callCta} placeholder="Connect with our AI assistant" maxLength={120} onChange={e => props.setCallCta(e.target.value)} />
          </div>
        </div>
      )}

      {destinationType === 'email' && (
        <div className="flex flex-col gap-3">
          <div>
            <label style={S.label}>To Email Address</label>
            <FocusInput type="email" value={props.emailTo} placeholder="info@company.com" onChange={e => props.setEmailTo(e.target.value)} required />
          </div>
          <div>
            <label style={S.label}>Subject</label>
            <FocusInput type="text" value={props.emailSub} placeholder="Inquiry" maxLength={255} onChange={e => props.setEmailSub(e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Body Template</label>
            <FocusTextarea rows={3} value={props.emailBody} placeholder="I am interested in…" onChange={e => props.setEmailBody(e.target.value)} />
          </div>
        </div>
      )}

      {destinationType === 'vcard' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={S.label}>Display Name</label>
            <FocusInput type="text" value={props.vcName} placeholder="Jane Doe" onChange={e => props.setVcName(e.target.value)} required />
          </div>
          <div>
            <label style={S.label}>Phone</label>
            <FocusInput type="tel" value={props.vcPhone} placeholder="+14155551212" onChange={e => props.setVcPhone(e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Email</label>
            <FocusInput type="email" value={props.vcEmail} placeholder="jane@company.com" onChange={e => props.setVcEmail(e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Company</label>
            <FocusInput type="text" value={props.vcCompany} placeholder="Acme Corp" onChange={e => props.setVcCompany(e.target.value)} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={S.label}>Website</label>
            <FocusInput type="url" value={props.vcWebsite} placeholder="https://acme.com" onChange={e => props.setVcWebsite(e.target.value)} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={S.label}>Note</label>
            <FocusTextarea rows={2} value={props.vcNote} placeholder="Dynamic contact card from chroniQR" onChange={e => props.setVcNote(e.target.value)} />
          </div>
        </div>
      )}

      {destinationType === 'time_based' && (
        <div className="flex flex-col gap-5">
          {/* Timezone */}
          <div>
            <label style={S.label}>Evaluation Timezone</label>
            <TimezonePicker value={props.timezone} onChange={props.setTimezone} />
          </div>

          {/* Rule Builder */}
          <TimeRuleBuilder rules={props.rules} onChange={props.setRules} />

          {/* Fallback */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--color-text-primary)' }}>Fallback Destination</p>
            <div style={{ marginBottom: 12 }}>
              <label style={S.label}>Fallback Type</label>
              <CustomSelect
                value={props.defaultType}
                options={FALLBACK_OPTIONS}
                onChange={val => props.setDefaultType(val)}
              />
            </div>
            {props.defaultType === 'url' && (
              <div>
                <label style={S.label}>Fallback URL</label>
                <FocusInput type="url" value={props.defaultUrl} placeholder="https://example.com/closed" onChange={e => props.setDefaultUrl(e.target.value)} style={{ fontFamily: 'var(--font-geistmono)', fontSize: 13 }} required />
              </div>
            )}
            {props.defaultType === 'whatsapp' && (
              <div className="flex flex-col gap-2">
                <div>
                  <label style={S.label}>Phone (E.164)</label>
                  <FocusInput type="tel" value={props.defaultWaPhone} placeholder="+919876543210" onChange={e => props.setDefaultWaPhone(e.target.value)} required />
                </div>
                <div>
                  <label style={S.label}>Message</label>
                  <FocusInput type="text" value={props.defaultWaMsg} placeholder="We are closed…" onChange={e => props.setDefaultWaMsg(e.target.value)} />
                </div>
              </div>
            )}
            {props.defaultType === 'call' && (
              <div className="flex flex-col gap-2">
                <div>
                  <label style={S.label}>Caller Number (E.164)</label>
                  <FocusInput type="tel" value={props.defaultCallNumber} placeholder="+14155552671" onChange={e => props.setDefaultCallNumber(e.target.value)} required />
                </div>
                <div>
                  <label style={S.label}>CTA Text</label>
                  <FocusInput type="text" value={props.defaultCallCta} placeholder="Office closed — schedule a callback" onChange={e => props.setDefaultCallCta(e.target.value)} />
                </div>
              </div>
            )}
          </div>

          {/* Live Preview */}
          {props.livePreviewText && (
            <div style={{
              backgroundColor: '#080808',
              border: '1px solid var(--color-border)',
              padding: '10px 14px',
              borderRadius: 6,
              fontSize: 13,
              fontFamily: 'var(--font-geistmono)',
              color: 'var(--color-accent)',
            }}>
              ⚡ {props.livePreviewText}
            </div>
          )}
        </div>
      )}
    </>
  );
};
