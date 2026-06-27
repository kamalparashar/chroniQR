import React, { useState, useEffect } from 'react';
import { Shield, Key, Trash, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { callBackendAction } from '../utils/api';

interface SettingsViewProps {
  clientID: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ clientID }) => {
  const [measurementId, setMeasurementId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [hasCredentials, setHasCredentials] = useState(false);

  useEffect(() => {
    fetchCredentials();
  }, [clientID]);

  const fetchCredentials = async () => {
    setLoading(true);
    setStatusMsg(null);
    try {
      // Fetch GA4 credentials for client
      const res = await callBackendAction<{ ga4_measurement_id?: string; ga4_key?: string }>('/actions/get-credentials', clientID, {});
      if (res && res.ga4_measurement_id) {
        setMeasurementId(res.ga4_measurement_id);
        setApiKey(res.ga4_key || '••••••••••••••••••••••••••••••••');
        setHasCredentials(true);
      } else {
        setMeasurementId('');
        setApiKey('');
        setHasCredentials(false);
      }
    } catch (err: any) {
      console.warn("Failed to retrieve GA4 credentials:", err);
      // If error occurs, assume none exist yet
      setMeasurementId('');
      setApiKey('');
      setHasCredentials(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    if (!measurementId.trim() || !apiKey.trim()) {
      setStatusMsg({ type: 'error', text: 'Both Measurement ID and API Key/Secret are required.' });
      setLoading(false);
      return;
    }

    try {
      // Upsert credentials
      await callBackendAction('/actions/upsert-credentials', clientID, {
        ga4_measurement_id: measurementId.trim(),
        ga4_key: apiKey.trim()
      });

      setStatusMsg({ type: 'success', text: 'GA4 credentials saved and encrypted successfully!' });
      setHasCredentials(true);
      // Refresh to load visual state
      fetchCredentials();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to save credentials.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to remove your GA4 integration credentials? Tracking will be disabled for your QR codes.")) {
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      await callBackendAction('/actions/delete-credentials', clientID, {});
      setStatusMsg({ type: 'success', text: 'GA4 credentials deleted successfully.' });
      setMeasurementId('');
      setApiKey('');
      setHasCredentials(false);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to delete credentials.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-32)' }}>
      {/* Overview Block */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-satoshi)', fontSize: 'var(--text-heading-sm)', fontWeight: 500, marginBottom: 'var(--spacing-8)' }}>
          Workspace Settings
        </h2>
        <p className="text-muted text-sm">
          Configure external integrations and inspect security configurations for your dynamic QR platform instance.
        </p>
      </div>

      {/* GA4 Integration Form */}
      <div className="card" style={{ border: '1px solid var(--color-smoke-200)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-12)', marginBottom: 'var(--spacing-20)' }}>
          <div style={{
            backgroundColor: 'rgba(124, 58, 237, 0.1)',
            color: 'var(--color-arc-violet)',
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: 'var(--text-body)', fontWeight: 600 }}>Google Analytics 4 (GA4) Integration</h3>
            <p className="text-muted text-caption">Track QR scan events in real-time within your analytics property.</p>
          </div>
        </div>

        {statusMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--spacing-12)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-lg)',
            fontSize: 'var(--text-body-sm)',
            backgroundColor: statusMsg.type === 'success' ? 'rgba(22, 163, 74, 0.08)' : 'rgba(234, 88, 12, 0.08)',
            color: statusMsg.type === 'success' ? 'var(--color-pulse-green)' : 'var(--color-ember-orange)',
            marginBottom: 'var(--spacing-20)'
          }}>
            {statusMsg.type === 'success' ? <Check size={16} style={{ marginTop: '2px', flexShrink: 0 }} /> : <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">GA4 Measurement ID</label>
            <input
              type="text"
              className="form-input font-mono"
              placeholder="e.g. G-XXXXXXXXXX"
              value={measurementId}
              onChange={e => setMeasurementId(e.target.value)}
              disabled={loading}
              required
            />
            <p className="text-muted text-caption" style={{ marginTop: '4px' }}>
              Create a web data stream in your GA4 property and retrieve the Measurement ID starting with G-.
            </p>
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--spacing-24)' }}>
            <label className="form-label">GA4 API Secret Key</label>
            <input
              type={hasCredentials ? "text" : "password"}
              className="form-input font-mono"
              placeholder="API Measurement Secret"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              disabled={loading}
              required
            />
            <p className="text-muted text-caption" style={{ marginTop: '4px' }}>
              Create a Measurement Protocol API secret under Admin &gt; Data Collection &gt; Data Streams &gt; Stream Settings.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-smoke-100)', paddingTop: 'var(--spacing-16)' }}>
            <div className="text-caption text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Key size={12} />
              <span>Credentials encrypted at rest using AES-GCM (256-bit).</span>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-8)' }}>
              {hasCredentials && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  <Trash size={14} style={{ marginRight: '4px' }} /> Delete
                </button>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? <RefreshCw size={14} className="spin" style={{ marginRight: '4px' }} /> : null}
                Save Credentials
              </button>
            </div>
          </div>
        </form>
      </div>


    </div>
  );
};
