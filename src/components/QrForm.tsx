import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { RefreshCw, AlertTriangle, Globe, MessageSquare, Phone, Mail, User, Clock, Check } from 'lucide-react';
import { TimeRuleBuilder } from './TimeRuleBuilder';
import { resolveTimeBasedPreview } from '../utils/routingPreview';
import type { TimeRule } from '../utils/routingPreview';
import type { QrCodeData } from './QrCard';

interface QrFormProps {
  qr: QrCodeData | null;
  clientID: string;
  onSave: (qrData: any) => Promise<void>;
  onCancel: () => void;
}

// ── All IANA timezones from browser ─────────────────────────────────────────
const ALL_TIMEZONES: string[] = (() => {
  try {
    return (Intl as any).supportedValuesOf('timeZone') as string[];
  } catch {
    // Fallback for older browsers
    return [
      'UTC','Africa/Cairo','America/Chicago','America/Los_Angeles','America/New_York',
      'America/Sao_Paulo','Asia/Dubai','Asia/Kolkata','Asia/Singapore','Asia/Tokyo',
      'Australia/Sydney','Europe/Berlin','Europe/London','Europe/Paris',
    ];
  }
})();

const DETECTED_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

// ── Destination type card definitions ────────────────────────────────────────
const DEST_TYPES = [
  { value: 'url',        label: 'Website URL',     desc: 'Redirect to any HTTPS URL', icon: Globe,         color: '#60A5FA' },
  { value: 'whatsapp',   label: 'WhatsApp',        desc: 'Open a WhatsApp chat',      icon: MessageSquare, color: '#25D366' },
  { value: 'call',       label: 'AI Voice Call',   desc: 'Click-to-call or callback', icon: Phone,         color: '#7C3AED' },
  { value: 'email',      label: 'Email',           desc: 'Pre-fill email template',   icon: Mail,          color: '#3B82F6' },
  { value: 'vcard',      label: 'vCard Contact',   desc: 'Download contact card',     icon: User,          color: '#EA580C' },
  { value: 'time_based', label: 'Time-Based',      desc: 'Route by hour & day rules', icon: Clock,         color: '#CCFF00' },
] as const;

type DestType = typeof DEST_TYPES[number]['value'];

// ── Reusable dark input style ────────────────────────────────────────────────
const S = {
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

const FocusInput = React.forwardRef<
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

const FocusSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    style={{
      ...S.input,
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23A1A1AA' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 14px center',
      backgroundSize: 16,
      paddingRight: 40,
      ...props.style,
    }}
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

const FocusTextarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
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

// ── Timezone picker sub-component ────────────────────────────────────────────
function TimezonePicker({ value, onChange }: { value: string; onChange: (tz: string) => void }) {
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? ALL_TIMEZONES.filter(tz => tz.toLowerCase().includes(search.toLowerCase()))
    : ALL_TIMEZONES;

  const isAutoDetected = value === DETECTED_TZ;

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
          {value}
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
          <FocusSelect
            value={value}
            onChange={e => { onChange(e.target.value); setSearch(''); setOverrideOpen(false); }}
            size={6}
            style={{ height: 'auto', paddingRight: 14 }}
          >
            {filtered.slice(0, 100).map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </FocusSelect>
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

// ── Main QrForm ───────────────────────────────────────────────────────────────
export const QrForm: React.FC<QrFormProps> = ({ qr, clientID: _clientID, onSave, onCancel }) => {
  const [name, setName]                       = useState('');
  const [destinationType, setDestinationType] = useState<DestType>('url');

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
    setDestinationType(qr.destination_type as DestType);
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
    display: 'flex', flexDirection: 'column', gap: 8,
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
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 32, alignItems: 'flex-start' }}>
      {/* ── Left: Form ───────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
            <p style={{ color: 'var(--color-error)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={14} /> Validation Errors
            </p>
            <ul style={{ paddingLeft: 16, marginTop: 4, fontSize: 12, color: 'var(--color-error)' }}>
              {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        )}

        {/* Basic Info */}
        <div style={sectionCard}>
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
        <div style={sectionCard}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>Destination Channel</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {DEST_TYPES.map(({ value, label, desc, icon: Icon, color }) => {
              const selected = destinationType === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDestinationType(value)}
                  style={cardStyle(color, selected)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 6,
                      backgroundColor: `${color}18`,
                      border: `1px solid ${color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color,
                    }}>
                      <Icon size={16} />
                    </div>
                    {selected && (
                      <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
        <div style={sectionCard}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>Destination Config</p>

          {destinationType === 'url' && (
            <div>
              <label style={S.label}>Destination URL</label>
              <FocusInput
                type="url"
                value={url}
                placeholder="https://example.com/promo"
                onChange={e => setUrl(e.target.value)}
                style={{ fontFamily: 'var(--font-geistmono)', fontSize: 13 }}
                required
              />
              <p className="text-muted" style={{ fontSize: 11, marginTop: 4 }}>Scanners are redirected to this URL (with UTM params appended).</p>
            </div>
          )}

          {destinationType === 'whatsapp' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={S.label}>WhatsApp Number (E.164)</label>
                <FocusInput type="tel" value={waPhone} placeholder="+919876543210" onChange={e => setWaPhone(e.target.value)} required />
              </div>
              <div>
                <label style={S.label}>Default Message</label>
                <FocusTextarea rows={3} value={waMsg} placeholder="Hello, I'd like to inquire about…" onChange={e => setWaMsg(e.target.value)} />
              </div>
            </div>
          )}

          {destinationType === 'call' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={S.label}>AI Agent Number (E.164)</label>
                <FocusInput type="tel" value={callNumber} placeholder="+14155552671" onChange={e => setCallNumber(e.target.value)} required />
              </div>
              <div>
                <label style={S.label}>Landing Page CTA Text</label>
                <FocusInput type="text" value={callCta} placeholder="Connect with our AI assistant" maxLength={120} onChange={e => setCallCta(e.target.value)} />
              </div>
            </div>
          )}

          {destinationType === 'email' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={S.label}>To Email Address</label>
                <FocusInput type="email" value={emailTo} placeholder="info@company.com" onChange={e => setEmailTo(e.target.value)} required />
              </div>
              <div>
                <label style={S.label}>Subject</label>
                <FocusInput type="text" value={emailSub} placeholder="Inquiry" maxLength={255} onChange={e => setEmailSub(e.target.value)} />
              </div>
              <div>
                <label style={S.label}>Body Template</label>
                <FocusTextarea rows={3} value={emailBody} placeholder="I am interested in…" onChange={e => setEmailBody(e.target.value)} />
              </div>
            </div>
          )}

          {destinationType === 'vcard' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={S.label}>Display Name</label>
                <FocusInput type="text" value={vcName} placeholder="Jane Doe" onChange={e => setVcName(e.target.value)} required />
              </div>
              <div>
                <label style={S.label}>Phone</label>
                <FocusInput type="tel" value={vcPhone} placeholder="+14155551212" onChange={e => setVcPhone(e.target.value)} />
              </div>
              <div>
                <label style={S.label}>Email</label>
                <FocusInput type="email" value={vcEmail} placeholder="jane@company.com" onChange={e => setVcEmail(e.target.value)} />
              </div>
              <div>
                <label style={S.label}>Company</label>
                <FocusInput type="text" value={vcCompany} placeholder="Acme Corp" onChange={e => setVcCompany(e.target.value)} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={S.label}>Website</label>
                <FocusInput type="url" value={vcWebsite} placeholder="https://acme.com" onChange={e => setVcWebsite(e.target.value)} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={S.label}>Note</label>
                <FocusTextarea rows={2} value={vcNote} placeholder="Dynamic contact card from chroniQR" onChange={e => setVcNote(e.target.value)} />
              </div>
            </div>
          )}

          {destinationType === 'time_based' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Timezone */}
              <div>
                <label style={S.label}>Evaluation Timezone</label>
                <TimezonePicker value={timezone} onChange={setTimezone} />
              </div>

              {/* Rule Builder */}
              <TimeRuleBuilder rules={rules} onChange={setRules} />

              {/* Fallback */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--color-text-primary)' }}>Fallback Destination</p>
                <div style={{ marginBottom: 12 }}>
                  <label style={S.label}>Fallback Type</label>
                  <FocusSelect value={defaultType} onChange={e => setDefaultType(e.target.value)}>
                    <option value="url">Website URL</option>
                    <option value="whatsapp">WhatsApp Chat</option>
                    <option value="call">AI Call Interface</option>
                  </FocusSelect>
                </div>
                {defaultType === 'url' && (
                  <div>
                    <label style={S.label}>Fallback URL</label>
                    <FocusInput type="url" value={defaultUrl} placeholder="https://example.com/closed" onChange={e => setDefaultUrl(e.target.value)} style={{ fontFamily: 'var(--font-geistmono)', fontSize: 13 }} required />
                  </div>
                )}
                {defaultType === 'whatsapp' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <label style={S.label}>Phone (E.164)</label>
                      <FocusInput type="tel" value={defaultWaPhone} placeholder="+919876543210" onChange={e => setDefaultWaPhone(e.target.value)} required />
                    </div>
                    <div>
                      <label style={S.label}>Message</label>
                      <FocusInput type="text" value={defaultWaMsg} placeholder="We are closed…" onChange={e => setDefaultWaMsg(e.target.value)} />
                    </div>
                  </div>
                )}
                {defaultType === 'call' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <label style={S.label}>Caller Number (E.164)</label>
                      <FocusInput type="tel" value={defaultCallNumber} placeholder="+14155552671" onChange={e => setDefaultCallNumber(e.target.value)} required />
                    </div>
                    <div>
                      <label style={S.label}>CTA Text</label>
                      <FocusInput type="text" value={defaultCallCta} placeholder="Office closed — schedule a callback" onChange={e => setDefaultCallCta(e.target.value)} />
                    </div>
                  </div>
                )}
              </div>

              {/* Live Preview */}
              {livePreviewText && (
                <div style={{
                  backgroundColor: '#080808',
                  border: '1px solid var(--color-border)',
                  padding: '10px 14px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontFamily: 'var(--font-geistmono)',
                  color: 'var(--color-accent)',
                }}>
                  ⚡ {livePreviewText}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Time Constraints (non-time_based) */}
        {destinationType !== 'time_based' && (
          <div style={sectionCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>Time Constraints</p>
                <p className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>Restrict this QR to specific hours/days.</p>
              </div>
              <label className="switch">
                <input type="checkbox" checked={hasConstraints} onChange={e => setHasConstraints(e.target.checked)} />
                <span className="slider" />
              </label>
            </div>

            {hasConstraints && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderTop: '1px solid var(--color-border)', paddingTop: 14 }}>
                <div>
                  <label style={S.label}>Timezone</label>
                  <TimezonePicker value={constraintTimezone} onChange={setConstraintTimezone} />
                </div>
                <div>
                  <label style={S.label}>Active Days</label>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day, idx) => {
                      const active = constraintDays.includes(idx);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleConstraintDay(idx)}
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
                    <FocusInput type="text" value={constraintStart} placeholder="09:00" onChange={e => setConstraintStart(e.target.value)} />
                  </div>
                  <div>
                    <label style={S.label}>End Time</label>
                    <FocusInput type="text" value={constraintEnd} placeholder="17:00" onChange={e => setConstraintEnd(e.target.value)} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* UTM Config */}
        <div style={sectionCard}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>UTM Attribution</p>
          <p className="text-muted" style={{ fontSize: 12, marginTop: -8 }}>Parameters appended to destination URLs automatically.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={S.label}>Source</label>
              <FocusInput type="text" value={utmSource} placeholder="qr_code" onChange={e => setUtmSource(e.target.value)} style={{ fontFamily: 'var(--font-geistmono)', fontSize: 13 }} />
            </div>
            <div>
              <label style={S.label}>Medium</label>
              <FocusInput type="text" value={utmMedium} placeholder="print" onChange={e => setUtmMedium(e.target.value)} style={{ fontFamily: 'var(--font-geistmono)', fontSize: 13 }} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={S.label}>Campaign</label>
              <FocusInput type="text" value={utmCampaign} placeholder="summer_2026_newsletter" onChange={e => setUtmCampaign(e.target.value)} style={{ fontFamily: 'var(--font-geistmono)', fontSize: 13 }} />
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div style={sectionCard}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>Metadata & Analytics</p>
          <div>
            <label style={S.label}>Tags (comma separated)</label>
            <FocusInput type="text" value={tagsInput} placeholder="newsletter, marketing, print_run_1" onChange={e => setTagsInput(e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Expiration Date / Time</label>
            <FocusInput type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: 14 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>GA4 Measurement Tracking</p>
              <p className="text-muted" style={{ fontSize: 11, marginTop: 2 }}>Fires real-time events to Google Analytics.</p>
            </div>
            <label className="switch">
              <input type="checkbox" checked={ga4Enabled} onChange={e => setGa4Enabled(e.target.checked)} />
              <span className="slider" />
            </label>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
          <button type="button" className="btn btn-secondary" disabled={loading} onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn-accent" disabled={loading} style={{ minWidth: 140 }}>
            {loading ? <><RefreshCw size={14} className="spin" /> Saving…</> : (qr ? 'Update QR Code' : 'Create QR Code')}
          </button>
        </div>
      </form>

      {/* ── Right: Preview Card ───────────────────────────────────────────── */}
      <div style={{ position: 'sticky', top: 88 }}>
        <div style={{ ...sectionCard, alignItems: 'center', textAlign: 'center', gap: 20 }}>
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

          <div style={{ width: '100%', borderTop: '1px solid var(--color-border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Config</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <span className="text-muted">Channel:</span>
              <span className="tag-chip" style={{ fontFamily: 'var(--font-geistmono)', fontSize: 10 }}>{destinationType}</span>
            </div>
            {destinationType === 'time_based' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <span className="text-muted">TZ:</span>
                <span className="tag-chip tag-chip-lime" style={{ fontFamily: 'var(--font-geistmono)', fontSize: 10 }}>{timezone}</span>
              </div>
            )}
            {utmSource && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <span className="text-muted">UTM source:</span>
                <span className="tag-chip tag-chip-orange" style={{ fontSize: 10 }}>{utmSource}</span>
              </div>
            )}
            {expiresAt && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
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
