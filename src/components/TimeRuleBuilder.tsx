import React from 'react';
import { Plus, Trash, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';
import type { TimeRule } from '../utils/routingPreview';

interface TimeRuleBuilderProps {
  rules: TimeRule[];
  onChange: (rules: TimeRule[]) => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const TimeRuleBuilder: React.FC<TimeRuleBuilderProps> = ({ rules, onChange }) => {
  const addRule = () => {
    const newRule: TimeRule = {
      days: [1, 2, 3, 4, 5],
      start_time: '09:00',
      end_time: '17:00',
      destination_type: 'url',
      destination_config: { url: 'https://' }
    };
    onChange([...rules, newRule]);
  };

  const removeRule = (index: number) => {
    const updated = rules.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateRuleField = (index: number, field: keyof TimeRule, value: any) => {
    const updated = rules.map((rule, i) => {
      if (i === index) {
        return { ...rule, [field]: value };
      }
      return rule;
    });
    onChange(updated);
  };

  const updateRuleConfig = (index: number, configField: string, value: any) => {
    const updated = rules.map((rule, i) => {
      if (i === index) {
        return {
          ...rule,
          destination_config: {
            ...rule.destination_config,
            [configField]: value
          }
        };
      }
      return rule;
    });
    onChange(updated);
  };

  const moveRule = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === rules.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newRules = [...rules];
    const temp = newRules[index];
    newRules[index] = newRules[targetIndex];
    newRules[targetIndex] = temp;
    onChange(newRules);
  };

  const toggleDay = (ruleIndex: number, day: number) => {
    const rule = rules[ruleIndex];
    const newDays = rule.days.includes(day)
      ? rule.days.filter(d => d !== day)
      : [...rule.days, day].sort();
    updateRuleField(ruleIndex, 'days', newDays);
  };

  const isMidnightSpanning = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return false;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;
    return endMins < startMins;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-16)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ fontFamily: 'var(--font-satoshi)', fontSize: 'var(--text-body)', fontWeight: 500 }}>Active Routing Rules</h4>
          <p className="text-muted text-caption">Rules are evaluated sequentially. The first matching rule applies.</p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={addRule}>
          <Plus size={16} /> Add Rule
        </button>
      </div>

      {rules.length === 0 ? (
        <div style={{
          border: '1px dashed var(--color-smoke-200)',
          borderRadius: 'var(--radius-cards)',
          padding: 'var(--spacing-24)',
          textAlign: 'center',
          color: 'var(--color-smoke-500)'
        }}>
          No active routing rules. QR will always redirect to the fallback destination.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-16)' }}>
          {rules.map((rule, idx) => {
            const spansMidnight = isMidnightSpanning(rule.start_time, rule.end_time);

            return (
              <div key={idx} className="card" style={{ border: '1px solid var(--color-smoke-200)' }}>
                {/* Header Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-12)', paddingBottom: 'var(--spacing-8)', borderBottom: '1px solid var(--color-smoke-100)' }}>
                  <span className="font-mono text-caption" style={{ fontWeight: 600 }}>Rule #{idx + 1}</span>
                  <div style={{ display: 'flex', gap: 'var(--spacing-8)' }}>
                    <button type="button" className="btn btn-secondary" style={{ padding: '4px 8px', borderRadius: '4px' }} disabled={idx === 0} onClick={() => moveRule(idx, 'up')}>
                      <ArrowUp size={14} />
                    </button>
                    <button type="button" className="btn btn-secondary" style={{ padding: '4px 8px', borderRadius: '4px' }} disabled={idx === rules.length - 1} onClick={() => moveRule(idx, 'down')}>
                      <ArrowDown size={14} />
                    </button>
                    <button type="button" className="btn btn-danger" style={{ padding: '4px 8px', borderRadius: '4px' }} onClick={() => removeRule(idx)}>
                      <Trash size={14} />
                    </button>
                  </div>
                </div>

                {/* Days of Week */}
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 'var(--text-caption)' }}>Target Days</label>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {DAYS.map((day, dIdx) => {
                      const active = rule.days.includes(dIdx);
                      return (
                        <button
                          key={day}
                          type="button"
                          className="btn"
                          style={{
                            padding: '4px 10px',
                            fontSize: '11px',
                            backgroundColor: active ? 'var(--color-ink-black)' : 'var(--color-smoke-50)',
                            color: active ? 'var(--color-paper-white)' : 'var(--color-smoke-700)',
                            border: `1px solid ${active ? 'var(--color-ink-black)' : 'var(--color-smoke-200)'}`,
                            borderRadius: '4px'
                          }}
                          onClick={() => toggleDay(idx, dIdx)}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Window */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-12)', marginBottom: 'var(--spacing-12)' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: 'var(--text-caption)' }}>Start Time (24h)</label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ padding: '8px 12px' }}
                      value={rule.start_time || ''}
                      placeholder="09:00"
                      onChange={e => updateRuleField(idx, 'start_time', e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: 'var(--text-caption)' }}>End Time (24h)</label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ padding: '8px 12px' }}
                      value={rule.end_time || ''}
                      placeholder="17:00"
                      onChange={e => updateRuleField(idx, 'end_time', e.target.value)}
                    />
                  </div>
                </div>

                {/* Midnight Spanning Warning */}
                {spansMidnight && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-8)',
                    fontSize: 'var(--text-caption)',
                    color: 'var(--color-ember-orange)',
                    backgroundColor: 'rgba(234, 88, 12, 0.08)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: 'var(--spacing-12)'
                  }}>
                    <AlertTriangle size={14} />
                    <span>This rule spans midnight (e.g., from evening to early morning)</span>
                  </div>
                )}

                {/* Destination Config */}
                <div style={{ borderTop: '1px solid var(--color-smoke-100)', paddingTop: 'var(--spacing-12)', marginTop: 'var(--spacing-12)' }}>
                  <div className="form-group" style={{ marginBottom: 'var(--spacing-12)' }}>
                    <label className="form-label" style={{ fontSize: 'var(--text-caption)' }}>Destination Type</label>
                    <select
                      className="form-input form-select"
                      style={{ padding: '8px 12px' }}
                      value={rule.destination_type || 'url'}
                      onChange={e => {
                        const newType = e.target.value;
                        const defaultConfigs: Record<string, any> = {
                          url: { url: 'https://' },
                          whatsapp: { phone: '+91', message: 'Hello' },
                          call: { caller_number: '+91', landing_page_text: 'Connect with AI' },
                          email: { to: '', subject: 'Inquiry', body: '' },
                          vcard: { name: '', phone: '', email: '', company: '', website: '', note: '' }
                        };
                        updateRuleField(idx, 'destination_type', newType);
                        updateRuleField(idx, 'destination_config', defaultConfigs[newType]);
                      }}
                    >
                      <option value="url">Website URL</option>
                      <option value="whatsapp">WhatsApp Message</option>
                      <option value="call">AI Voice Call</option>
                      <option value="email">Email Prompt</option>
                      <option value="vcard">vCard Contact Download</option>
                    </select>
                  </div>

                  {/* Dynamic fields based on rule.destination_type */}
                  {rule.destination_type === 'url' && (
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: 'var(--text-caption)' }}>Target URL</label>
                      <input
                        type="url"
                        className="form-input"
                        style={{ padding: '8px 12px' }}
                        value={rule.destination_config?.url || ''}
                        placeholder="https://example.com/business"
                        onChange={e => updateRuleConfig(idx, 'url', e.target.value)}
                      />
                    </div>
                  )}

                  {rule.destination_type === 'whatsapp' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: 'var(--text-caption)' }}>WhatsApp Phone Number (E.164)</label>
                        <input
                          type="tel"
                          className="form-input"
                          style={{ padding: '8px 12px' }}
                          value={rule.destination_config?.phone || ''}
                          placeholder="+919876543210"
                          onChange={e => updateRuleConfig(idx, 'phone', e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: 'var(--text-caption)' }}>Message Template (Optional)</label>
                        <textarea
                          className="form-input"
                          rows={2}
                          style={{ padding: '8px 12px' }}
                          value={rule.destination_config?.message || ''}
                          placeholder="Interested in business hours catalog..."
                          onChange={e => updateRuleConfig(idx, 'message', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {rule.destination_type === 'call' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: 'var(--text-caption)' }}>Caller Number (E.164)</label>
                        <input
                          type="tel"
                          className="form-input"
                          style={{ padding: '8px 12px' }}
                          value={rule.destination_config?.caller_number || ''}
                          placeholder="+14155552671"
                          onChange={e => updateRuleConfig(idx, 'caller_number', e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: 'var(--text-caption)' }}>Landing Page CTA Text</label>
                        <input
                          type="text"
                          className="form-input"
                          style={{ padding: '8px 12px' }}
                          value={rule.destination_config?.landing_page_text || ''}
                          placeholder="Speak with our AI agent"
                          maxLength={120}
                          onChange={e => updateRuleConfig(idx, 'landing_page_text', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {rule.destination_type === 'email' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: 'var(--text-caption)' }}>To Email Address</label>
                        <input
                          type="email"
                          className="form-input"
                          style={{ padding: '8px 12px' }}
                          value={rule.destination_config?.to || ''}
                          placeholder="sales@company.com"
                          onChange={e => updateRuleConfig(idx, 'to', e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: 'var(--text-caption)' }}>Subject Line</label>
                        <input
                          type="text"
                          className="form-input"
                          style={{ padding: '8px 12px' }}
                          value={rule.destination_config?.subject || ''}
                          placeholder="Inquiry from chroniQR"
                          maxLength={255}
                          onChange={e => updateRuleConfig(idx, 'subject', e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: 'var(--text-caption)' }}>Email Body Template</label>
                        <textarea
                          className="form-input"
                          rows={2}
                          style={{ padding: '8px 12px' }}
                          value={rule.destination_config?.body || ''}
                          placeholder="Hi, I scanned your QR and would like..."
                          onChange={e => updateRuleConfig(idx, 'body', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {rule.destination_type === 'vcard' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-8)' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: 'var(--text-caption)' }}>Full Name</label>
                        <input
                          type="text"
                          className="form-input"
                          style={{ padding: '8px 12px' }}
                          value={rule.destination_config?.name || ''}
                          placeholder="Jane Doe"
                          onChange={e => updateRuleConfig(idx, 'name', e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: 'var(--text-caption)' }}>Phone Number</label>
                        <input
                          type="tel"
                          className="form-input"
                          style={{ padding: '8px 12px' }}
                          value={rule.destination_config?.phone || ''}
                          placeholder="+14155552671"
                          onChange={e => updateRuleConfig(idx, 'phone', e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: 'var(--text-caption)' }}>Email</label>
                        <input
                          type="email"
                          className="form-input"
                          style={{ padding: '8px 12px' }}
                          value={rule.destination_config?.email || ''}
                          placeholder="jane@company.com"
                          onChange={e => updateRuleConfig(idx, 'email', e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: 'var(--text-caption)' }}>Company</label>
                        <input
                          type="text"
                          className="form-input"
                          style={{ padding: '8px 12px' }}
                          value={rule.destination_config?.company || ''}
                          placeholder="Acme Inc"
                          onChange={e => updateRuleConfig(idx, 'company', e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2', margin: 0 }}>
                        <label className="form-label" style={{ fontSize: 'var(--text-caption)' }}>Website</label>
                        <input
                          type="url"
                          className="form-input"
                          style={{ padding: '8px 12px' }}
                          value={rule.destination_config?.website || ''}
                          placeholder="https://acme.com"
                          onChange={e => updateRuleConfig(idx, 'website', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
