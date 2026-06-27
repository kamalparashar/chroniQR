import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { RefreshCw, AlertTriangle, Check } from 'lucide-react';
import { resolveTimeBasedPreview } from '../utils/routingPreview';
import type { QrCodeData, QrFormPayload, DestinationType, TimeRule } from '../types/qr';
import { DEST_TYPES } from '../constants/destinations';
import { DETECTED_TZ } from '../constants/timezones';

interface QrFormProps {
  qr: QrCodeData | null;
  clientID: string;
  onSave: (qrData: QrFormPayload) => Promise<void>;
  onCancel: () => void;
}



import { FocusInput, S } from './ui/FocusInput';
import { DestinationFields } from './qr-form/DestinationFields';
import { ConstraintEditor } from './qr-form/ConstraintEditor';
import { MetadataFields } from './qr-form/MetadataFields';

// ── Main QrForm ───────────────────────────────────────────────────────────────
export const QrForm: React.FC<QrFormProps> = ({ qr, clientID: _clientID, onSave, onCancel }) => {
  const [name, setName]                       = useState('');
  const [destinationType, setDestinationType] = useState<DestinationType>('url');

  // URL
  const [url, setUrl] = useState('https://');

  // WhatsApp
  const [waPhone, setWaPhone] = useState('+91');
  const [waMsg, setWaMsg]     = useState('Hello!');

  // Call
  const [callNumber, setCallNumber] = useState('+91');
  const [callCta, setCallCta]       = useState('Speak with our AI assistant');

  // Email
  const [emailTo, setEmailTo]   = useState('');
  const [emailSub, setEmailSub] = useState('Inquiry');
  const [emailBody, setEmailBody] = useState('');

  // vCard
  const [vcName, setVcName]       = useState('');
  const [vcPhone, setVcPhone]     = useState('');
  const [vcEmail, setVcEmail]     = useState('');
  const [vcCompany, setVcCompany] = useState('');
  const [vcWebsite, setVcWebsite] = useState('');
  const [vcNote, setVcNote]       = useState('');

  // Time-Based
  const [timezone, setTimezone]     = useState(DETECTED_TZ);
  const [rules, setRules]           = useState<TimeRule[]>([]);
  const [defaultType, setDefaultType]   = useState('url');
  const [defaultUrl, setDefaultUrl]     = useState('https://');
  const [defaultWaPhone, setDefaultWaPhone] = useState('+91');
  const [defaultWaMsg, setDefaultWaMsg]     = useState('We are closed right now.');
  const [defaultCallNumber, setDefaultCallNumber] = useState('+91');
  const [defaultCallCta, setDefaultCallCta]       = useState('Out of business hours');

  // Constraints (for non-time_based types)
  const [hasConstraints, setHasConstraints]   = useState(false);
  const [constraintTimezone, setConstraintTimezone] = useState(DETECTED_TZ);
  const [constraintDays, setConstraintDays]   = useState<number[]>([1, 2, 3, 4, 5]);
  const [constraintStart, setConstraintStart] = useState('09:00');
  const [constraintEnd, setConstraintEnd]     = useState('17:00');

  // UTM + metadata
  const [utmSource, setUtmSource]   = useState('');
  const [utmMedium, setUtmMedium]   = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [utmTerm, setUtmTerm]       = useState('');
  const [utmContent, setUtmContent] = useState('');
  const [tagsInput, setTagsInput]   = useState('');
  const [expiresAt, setExpiresAt]   = useState('');
  const [ga4Enabled, setGa4Enabled] = useState(false);

  const [loading, setLoading]               = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [livePreviewText, setLivePreviewText] = useState('');

  // ── Populate form when editing ─────────────────────────────────────────────
  useEffect(() => {
    if (!qr) return;
    setName(qr.name);
    setDestinationType(qr.destination_type as DestinationType);
    setUtmSource(qr.utm_config?.utm_source || '');
    setUtmMedium(qr.utm_config?.utm_medium || '');
    setUtmCampaign(qr.utm_config?.utm_campaign || '');
    setUtmTerm(qr.utm_config?.utm_term || '');
    setUtmContent(qr.utm_config?.utm_content || '');
    setTagsInput(qr.tags ? qr.tags.join(', ') : '');
    setExpiresAt(qr.expires_at ? qr.expires_at.substring(0, 16) : '');
    setGa4Enabled(qr.ga4_tracking_enabled);

    const cfg = qr.destination_config || {};
    if (qr.destination_type === 'url') {
      setUrl(cfg.url || 'https://');
      if (cfg.timezone || cfg.days || cfg.start_time || cfg.end_time) {
        setHasConstraints(true);
        setConstraintTimezone(cfg.timezone || DETECTED_TZ);
        setConstraintDays(cfg.days || [1,2,3,4,5]);
        setConstraintStart(cfg.start_time || '09:00');
        setConstraintEnd(cfg.end_time || '17:00');
      }
    } else if (qr.destination_type === 'whatsapp') {
      setWaPhone(cfg.phone || ''); setWaMsg(cfg.message || '');
    } else if (qr.destination_type === 'call') {
      setCallNumber(cfg.caller_number || ''); setCallCta(cfg.landing_page_text || '');
    } else if (qr.destination_type === 'email') {
      setEmailTo(cfg.to || ''); setEmailSub(cfg.subject || ''); setEmailBody(cfg.body || '');
    } else if (qr.destination_type === 'vcard') {
      setVcName(cfg.name || ''); setVcPhone(cfg.phone || ''); setVcEmail(cfg.email || '');
      setVcCompany(cfg.company || ''); setVcWebsite(cfg.website || ''); setVcNote(cfg.note || '');
    } else if (qr.destination_type === 'time_based') {
      setTimezone(cfg.timezone || DETECTED_TZ);
      setRules(cfg.rules || []);
      setDefaultType(cfg.default_type || 'url');
      const defCfg = cfg.default_config || {};
      setDefaultUrl(defCfg.url || cfg.default_url || 'https://');
      setDefaultWaPhone(defCfg.phone || '');
      setDefaultWaMsg(defCfg.message || '');
      setDefaultCallNumber(defCfg.caller_number || '');
      setDefaultCallCta(defCfg.landing_page_text || '');
    }
  }, [qr]);

  // ── Live routing preview ───────────────────────────────────────────────────
  useEffect(() => {
    if (destinationType !== 'time_based') { setLivePreviewText(''); return; }
    const cfg: any = {
      type: 'time_based', timezone,
      default_type: defaultType,
      default_config: defaultType === 'url' ? { url: defaultUrl }
        : defaultType === 'whatsapp' ? { phone: defaultWaPhone, message: defaultWaMsg }
        : { caller_number: defaultCallNumber, landing_page_text: defaultCallCta },
      rules,
    };
    const preview = resolveTimeBasedPreview(cfg);
    const target  = preview.matchedRuleIndex !== -1
      ? `Rule #${preview.matchedRuleIndex + 1} (${preview.destination_type})`
      : `Fallback (${preview.destination_type})`;
    setLivePreviewText(`Now (${preview.currentTimeString} ${preview.currentDayName}) → ${target}`);
  }, [destinationType, timezone, rules, defaultType, defaultUrl, defaultWaPhone, defaultWaMsg, defaultCallNumber, defaultCallCta]);

  // ── QR Code canvas preview ─────────────────────────────────────────────────
  useEffect(() => {
    const drawQR = async () => {
      if (!canvasRef.current) return;
      const previewText = qr ? qr.short_url : 'http://localhost:3001/preview';
      try {
        await QRCode.toCanvas(canvasRef.current, previewText, {
          width: 160, margin: 1,
          color: { dark: '#000000', light: '#ffffff' },
        });
      } catch (err) { console.error('QR draw error:', err); }
    };
    drawQR();
  }, [qr, destinationType, url, waPhone, waMsg, callNumber, callCta]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setValidationErrors([]);
    const errors: string[] = [];
    if (!name.trim()) errors.push('Name is required.');

    let destConfig: Record<string, any> = {};
    if (destinationType === 'url') {
      destConfig = { url: url.trim() };
      if (hasConstraints) {
        destConfig.timezone   = constraintTimezone;
        destConfig.days       = constraintDays;
        destConfig.start_time = constraintStart;
        destConfig.end_time   = constraintEnd;
      }
    } else if (destinationType === 'whatsapp') {
      if (!waPhone.trim()) errors.push('WhatsApp number is required.');
      destConfig = { phone: waPhone.trim(), message: waMsg.trim() };
    } else if (destinationType === 'call') {
      if (!callNumber.trim()) errors.push('Caller number is required.');
      destConfig = { caller_number: callNumber.trim(), landing_page_text: callCta.trim() };
    } else if (destinationType === 'email') {
      if (!emailTo.trim()) errors.push('To Email is required.');
      destConfig = { to: emailTo.trim(), subject: emailSub.trim(), body: emailBody.trim() };
    } else if (destinationType === 'vcard') {
      if (!vcName.trim()) errors.push('vCard Name is required.');
      destConfig = { name: vcName.trim(), phone: vcPhone.trim(), email: vcEmail.trim(), company: vcCompany.trim(), website: vcWebsite.trim(), note: vcNote.trim() };
    } else if (destinationType === 'time_based') {
      if (rules.length === 0) errors.push('At least one routing rule is required.');
      let default_config: Record<string, any> = {};
      if (defaultType === 'url')       default_config = { url: defaultUrl.trim() };
      else if (defaultType === 'whatsapp') default_config = { phone: defaultWaPhone.trim(), message: defaultWaMsg.trim() };
      else if (defaultType === 'call')     default_config = { caller_number: defaultCallNumber.trim(), landing_page_text: defaultCallCta.trim() };
      destConfig = { type: 'time_based', timezone, default_type: defaultType, default_config, rules };
    }

    if (errors.length > 0) { setValidationErrors(errors); setLoading(false); return; }

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const utm_config: Record<string, any> = {};
    if (utmSource.trim())   utm_config.utm_source   = utmSource.trim();
    if (utmMedium.trim())   utm_config.utm_medium   = utmMedium.trim();
    if (utmCampaign.trim()) utm_config.utm_campaign = utmCampaign.trim();
    if (utmTerm.trim())     utm_config.utm_term     = utmTerm.trim();
    if (utmContent.trim())  utm_config.utm_content  = utmContent.trim();

    const payload: any = {
      name: name.trim(),
      destination_type: destinationType,
      destination_config: destConfig,
      utm_config,
      tags,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      ga4_tracking_enabled: ga4Enabled,
    };
    if (qr) { payload.id = qr.id; payload.is_active = qr.is_active; }

    try {
      await onSave(payload);
    } catch (err: any) {
      setValidationErrors([err.message || 'An error occurred.']);
    } finally {
      setLoading(false);
    }
  };

  const toggleConstraintDay = (day: number) => {
    setConstraintDays(constraintDays.includes(day)
      ? constraintDays.filter(d => d !== day)
      : [...constraintDays, day].sort());
  };

  // ── Card style ─────────────────────────────────────────────────────────────
  const cardStyle = (color: string, selected: boolean): React.CSSProperties => ({
    padding: '14px 16px',
    backgroundColor: selected ? `${color}10` : 'var(--color-surface)',
    border: `1px solid ${selected ? color : 'var(--color-border)'}`,
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 100ms ease-out',
    boxShadow: selected ? `0 0 0 1px ${color}40` : 'none',
  });

  const sectionCard: React.CSSProperties = {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    padding: 20,
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 32, alignItems: 'flex-start' }}>
      {/* ── Left: Form ───────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Header */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-satoshi)', fontSize: 24, fontWeight: 600 }}>
            {qr ? 'Edit QR Code' : 'Create Dynamic QR Code'}
          </h2>
          <p className="text-muted text-sm" style={{ marginTop: 4 }}>
            Configure time-aware routing rules and destination channels.
          </p>
        </div>

        {/* Errors */}
        {validationErrors.length > 0 && (
          <div style={{ border: '1px solid rgba(239,68,68,0.3)', backgroundColor: 'var(--color-error-dim)', padding: '12px 16px', borderRadius: 6 }}>
            <p className="flex items-center gap-2" style={{ color: 'var(--color-error)', fontSize: 13, fontWeight: 600 }}>
              <AlertTriangle size={14} /> Validation Errors
            </p>
            <ul style={{ paddingLeft: 16, marginTop: 4, fontSize: 12, color: 'var(--color-error)' }}>
              {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        )}

        {/* Basic Info */}
        <div className="flex flex-col gap-4" style={sectionCard}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>Basic Information</p>
          <div>
            <label style={S.label}>QR Code Name</label>
            <FocusInput
              type="text"
              value={name}
              placeholder="e.g. Summer Promo Campaign"
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Destination Type — Visual Card Picker */}
        <div className="flex flex-col gap-4" style={sectionCard}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>Destination Channel</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {DEST_TYPES.map(({ value, label, desc, icon: Icon, color }) => {
              const selected = destinationType === value;
              return (
                <button
                  key={value}
                  type="button"
                  className="flex flex-col gap-2"
                  onClick={() => setDestinationType(value)}
                  style={cardStyle(color, selected)}
                >
                  <div className="flex justify-between items-start w-full">
                    <div className="flex items-center justify-center" style={{
                      width: 32, height: 32, borderRadius: 6,
                      backgroundColor: `${color}18`,
                      border: `1px solid ${color}30`,
                      color,
                    }}>
                      <Icon size={16} />
                    </div>
                    {selected && (
                      <div className="flex items-center justify-center" style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: color }}>
                        <Check size={11} color="#000" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: selected ? color : 'var(--color-text-primary)', marginBottom: 2 }}>{label}</p>
                    <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Destination Config */}
        <div className="flex flex-col gap-4" style={sectionCard}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>Destination Config</p>
          <DestinationFields 
            destinationType={destinationType}
            url={url} setUrl={setUrl}
            waPhone={waPhone} setWaPhone={setWaPhone}
            waMsg={waMsg} setWaMsg={setWaMsg}
            callNumber={callNumber} setCallNumber={setCallNumber}
            callCta={callCta} setCallCta={setCallCta}
            emailTo={emailTo} setEmailTo={setEmailTo}
            emailSub={emailSub} setEmailSub={setEmailSub}
            emailBody={emailBody} setEmailBody={setEmailBody}
            vcName={vcName} setVcName={setVcName}
            vcPhone={vcPhone} setVcPhone={setVcPhone}
            vcEmail={vcEmail} setVcEmail={setVcEmail}
            vcCompany={vcCompany} setVcCompany={setVcCompany}
            vcWebsite={vcWebsite} setVcWebsite={setVcWebsite}
            vcNote={vcNote} setVcNote={setVcNote}
            timezone={timezone} setTimezone={setTimezone}
            rules={rules} setRules={setRules}
            defaultType={defaultType} setDefaultType={setDefaultType}
            defaultUrl={defaultUrl} setDefaultUrl={setDefaultUrl}
            defaultWaPhone={defaultWaPhone} setDefaultWaPhone={setDefaultWaPhone}
            defaultWaMsg={defaultWaMsg} setDefaultWaMsg={setDefaultWaMsg}
            defaultCallNumber={defaultCallNumber} setDefaultCallNumber={setDefaultCallNumber}
            defaultCallCta={defaultCallCta} setDefaultCallCta={setDefaultCallCta}
            livePreviewText={livePreviewText}
          />
        </div>

        {/* Time Constraints */}
        <ConstraintEditor 
          destinationType={destinationType}
          hasConstraints={hasConstraints} setHasConstraints={setHasConstraints}
          constraintTimezone={constraintTimezone} setConstraintTimezone={setConstraintTimezone}
          constraintDays={constraintDays} toggleConstraintDay={toggleConstraintDay}
          constraintStart={constraintStart} setConstraintStart={setConstraintStart}
          constraintEnd={constraintEnd} setConstraintEnd={setConstraintEnd}
          sectionCardStyle={sectionCard}
        />

        {/* UTM & Metadata Config */}
        <MetadataFields 
          utmSource={utmSource} setUtmSource={setUtmSource}
          utmMedium={utmMedium} setUtmMedium={setUtmMedium}
          utmCampaign={utmCampaign} setUtmCampaign={setUtmCampaign}
          tagsInput={tagsInput} setTagsInput={setTagsInput}
          expiresAt={expiresAt} setExpiresAt={setExpiresAt}
          ga4Enabled={ga4Enabled} setGa4Enabled={setGa4Enabled}
          sectionCardStyle={sectionCard}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-4">
          <button type="button" className="btn btn-secondary" disabled={loading} onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn-accent" disabled={loading} style={{ minWidth: 140 }}>
            {loading ? <><RefreshCw size={14} className="spin" /> Saving…</> : (qr ? 'Update QR Code' : 'Create QR Code')}
          </button>
        </div>
      </form>

      {/* ── Right: Preview Card ───────────────────────────────────────────── */}
      <div style={{ position: 'sticky', top: 88 }}>
        <div className="flex flex-col items-center text-center gap-5" style={sectionCard}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            QR Preview
          </p>

          {/* QR canvas on white bg */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: 16, borderRadius: 12,
            border: '1px solid #1F1F1F',
          }}>
            <canvas ref={canvasRef} style={{ width: 160, height: 160 }} />
          </div>

          <div style={{ width: '100%' }}>
            <p style={{ fontFamily: 'var(--font-satoshi)', fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {name.trim() || 'Unnamed QR Code'}
            </p>
            <p style={{ fontFamily: 'var(--font-geistmono)', fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4 }}>
              {qr ? qr.short_url : 'http://localhost:3001/xxxxxx'}
            </p>
          </div>

          <div className="flex flex-col gap-2 w-full text-left mt-4" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Config</p>
            <div className="flex items-center gap-2" style={{ fontSize: 12 }}>
              <span className="text-muted">Channel:</span>
              <span className="tag-chip" style={{ fontFamily: 'var(--font-geistmono)', fontSize: 10 }}>{destinationType}</span>
            </div>
            {destinationType === 'time_based' && (
              <>
                <div className="flex items-center gap-2" style={{ fontSize: 12 }}>
                  <span className="text-muted">TZ:</span>
                  <span className="tag-chip tag-chip-lime" style={{ fontFamily: 'var(--font-geistmono)', fontSize: 10 }}>{timezone}</span>
                </div>
                {livePreviewText && (
                  <div className="flex flex-col gap-2 text-left" style={{
                    marginTop: 6,
                    padding: '8px 10px',
                    backgroundColor: 'var(--color-accent-dim)',
                    border: '1px solid rgba(204,255,0,0.15)',
                    borderRadius: 6,
                    fontSize: 11,
                    textAlign: 'left'
                  }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>Routing Preview</span>
                    <span style={{ fontFamily: 'var(--font-geistmono)', color: 'var(--color-text-primary)', wordBreak: 'break-all' }}>{livePreviewText}</span>
                  </div>
                )}
              </>
            )}
            {utmSource && (
              <div className="flex items-center gap-2" style={{ fontSize: 12 }}>
                <span className="text-muted">UTM source:</span>
                <span className="tag-chip tag-chip-orange" style={{ fontSize: 10 }}>{utmSource}</span>
              </div>
            )}
            {expiresAt && (
              <div className="flex items-center gap-2" style={{ fontSize: 12 }}>
                <span className="text-muted">Expires:</span>
                <span style={{ color: 'var(--color-text-primary)' }}>{new Date(expiresAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
