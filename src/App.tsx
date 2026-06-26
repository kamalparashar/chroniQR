import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StatsGrid } from './components/StatsGrid';
import { QrCard } from './components/QrCard';
import type { QrCodeData } from './components/QrCard';
import { QrForm } from './components/QrForm';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { AuthScreen } from './components/AuthScreen';
import { LandingPage } from './components/LandingPage';
import { QrPreviewModal } from './components/QrPreviewModal';
import { callBackendAction, fetchFromBackend } from './utils/api';
import { getSession, sessionToAuthUser, logout } from './utils/auth';
import type { AuthUser } from './utils/auth';
import { supabase } from './utils/supabaseClient';
import { Plus, Search, Filter, RefreshCw } from 'lucide-react';

function App() {
  const [authUser, setAuthUser]   = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authTab, setAuthTab]     = useState<'login' | 'signup'>('login');
  // 'landing' = first-time visitor, 'auth' = explicitly navigated to login/signup
  const [view, setView]           = useState<'landing' | 'auth'>('landing');

  // ── Session bootstrap — check for an existing session on page load ──────
  useEffect(() => {
    getSession().then(session => {
      if (session) setAuthUser(sessionToAuthUser(session));
      setAuthLoading(false);
    }).catch(err => {
      console.error('Session bootstrap failed:', err);
      setAuthLoading(false);
    });

    // Listen for auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAuthUser(sessionToAuthUser(session));
      } else {
        setAuthUser(null);
        setQrs([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Dashboard tab state ────────────────────────────────────────────────────
  const [activeTab, setActiveTab]                       = useState<'qrs' | 'settings'>('qrs');
  const [selectedQrForAnalytics, setSelectedQrForAnalytics] = useState<QrCodeData | null>(null);
  const [editingQr, setEditingQr]                       = useState<QrCodeData | null>(null);
  const [previewQr, setPreviewQr]                       = useState<QrCodeData | null>(null);
  const [showCreateForm, setShowCreateForm]             = useState(false);

  // ── Data state ─────────────────────────────────────────────────────────────
  const [qrs, setQrs]   = useState<QrCodeData[]>([]);
  const [stats, setStats] = useState({
    totalQrs: 0, activeQrs: 0, totalScans: 0, topQrName: '', topQrScans: 0,
  });

  // ── Filter state ───────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery]   = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [loading, setLoading]           = useState(true);

  // ── Load QR data when user is authenticated ────────────────────────────────
  useEffect(() => {
    if (authUser) fetchQrs();
  }, [authUser?.id]);

  const activeClient = authUser?.id ?? '';

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await logout();
    // onAuthStateChange listener above will clear authUser.
    // Send the user to the auth screen (not the landing page) after logout.
    setView('auth');
  };

  // ── Backend integration ────────────────────────────────────────────────────
  const fetchQrs = async () => {
    if (!authUser) return;
    try {
      const qrList: QrCodeData[] = await fetchFromBackend('/qr-codes', authUser.id);
      let scansMap: Record<string, number> = {};
      try {
        scansMap = await fetchFromBackend('/scans/count', authUser.id);
      } catch (_) {}
      const enriched = qrList.map(qr => ({ ...qr, scans_count: scansMap[qr.id] || 0 }));
      setQrs(enriched);
      calculateStats(enriched);
    } catch (err) {
      console.error('Failed to load QR codes:', err);
      setQrs([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (list: QrCodeData[]) => {
    const totalQrs  = list.length;
    const activeQrs = list.filter(qr => qr.is_active && (!qr.expires_at || new Date(qr.expires_at) > new Date())).length;
    let totalScans = 0, topQrName = 'N/A', topQrScans = 0;
    list.forEach(qr => {
      const s = qr.scans_count || 0;
      totalScans += s;
      if (s > topQrScans) { topQrScans = s; topQrName = qr.name; }
    });
    setStats({ totalQrs, activeQrs, totalScans, topQrName, topQrScans });
  };

  const handleSaveQr = async (qrData: any) => {
    try {
      if (editingQr) {
        await callBackendAction('/actions/update-qr', activeClient, qrData);
      } else {
        await callBackendAction('/actions/create-qr', activeClient, qrData);
      }
      setEditingQr(null);
      setShowCreateForm(false);
      await fetchQrs();
    } catch (err: any) {
      console.error('Failed to save QR code:', err);
      throw err;
    }
  };

  const handleToggleActive = async (qr: QrCodeData) => {
    try {
      await callBackendAction('/actions/update-qr', activeClient, { id: qr.id, is_active: !qr.is_active });
      await fetchQrs();
    } catch (err) {
      console.error('Failed to toggle QR active status:', err);
      alert('Failed to toggle QR status. Check if the backend is running on port 3001.');
    }
  };

  const handleDeleteQr = async (qr: QrCodeData) => {
    if (!window.confirm(`Delete "${qr.name}"? This cannot be undone.`)) return;
    try {
      await callBackendAction('/actions/delete-qr', activeClient, { id: qr.id });
      await fetchQrs();
    } catch (err) {
      console.error('Failed to delete QR code:', err);
      alert('Failed to delete QR code.');
    }
  };

  const filteredQrs = qrs.filter(qr => {
    const matchesSearch =
      qr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qr.short_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qr.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const isExpired = qr.expires_at ? new Date(qr.expires_at) < new Date() : false;
    if (statusFilter === 'active')   return matchesSearch && qr.is_active && !isExpired;
    if (statusFilter === 'inactive') return matchesSearch && !qr.is_active && !isExpired;
    if (statusFilter === 'expired')  return matchesSearch && isExpired;
    return matchesSearch;
  });

  // ── Auth loading / gate ───────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-app-bg)' }}>
        <RefreshCw size={28} className="spin text-muted" />
      </div>
    );
  }

  if (!authUser) {
    // First-time visitor (no prior session) → show marketing landing page
    if (view === 'landing') {
      return (
        <LandingPage
          onGetStarted={() => { setAuthTab('signup'); setView('auth'); }}
          onLogin={() => { setAuthTab('login'); setView('auth'); }}
        />
      );
    }
    // Explicit navigation or post-logout → show auth screen
    return (
      <AuthScreen
        initialTab={authTab}
        onAuth={(user) => setAuthUser(user)}
        onSwitchTab={setAuthTab}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-app-bg)' }}>
      <Navbar authUser={authUser!} onLogout={handleLogout} />

      <main className="container" style={{ padding: 'var(--spacing-32) var(--spacing-24)', flex: 1 }}>
        {selectedQrForAnalytics ? (
          <AnalyticsView qr={selectedQrForAnalytics} onBack={() => { setSelectedQrForAnalytics(null); fetchQrs(); }} />
        ) : showCreateForm || editingQr ? (
          <QrForm
            qr={editingQr}
            clientID={activeClient}
            onSave={handleSaveQr}
            onCancel={() => { setEditingQr(null); setShowCreateForm(false); }}
          />
        ) : (
          <>
            {/* Dashboard Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-32)', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <h1 className="font-satoshi" style={{ fontSize: 'var(--text-heading-lg)', fontWeight: 600 }}>
                  Overview Dashboard
                </h1>
                <p className="text-muted text-sm" style={{ marginTop: 4 }}>
                  Manage dynamic, time-based URL redirects and track scanner conversions.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 'var(--spacing-12)', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`btn ${activeTab === 'qrs' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setActiveTab('qrs')}
                >
                  QR Codes
                </button>
                <button
                  type="button"
                  className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setActiveTab('settings')}
                >
                  Settings
                </button>
                <button
                  type="button"
                  className="btn btn-accent"
                  onClick={() => setShowCreateForm(true)}
                >
                  <Plus size={16} /> New Code
                </button>
              </div>
            </div>

            {activeTab === 'settings' ? (
              <SettingsView clientID={activeClient} />
            ) : (
              <>
                <StatsGrid
                  totalQrs={stats.totalQrs}
                  activeQrs={stats.activeQrs}
                  totalScans={stats.totalScans}
                  topQrName={stats.topQrName}
                  topQrScans={stats.topQrScans}
                />

                {/* Filter Bar */}
                <div className="card" style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  gap: 'var(--spacing-16)', padding: '12px 16px',
                  marginBottom: 'var(--spacing-24)', flexWrap: 'wrap',
                  backgroundColor: 'var(--color-surface)',
                }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
                    <Search size={16} className="text-muted" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: 36, paddingTop: 8, paddingBottom: 8, margin: 0 }}
                      placeholder="Search by name, code slug, or tags…"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Filter size={14} className="text-muted" />
                    <span style={{ fontSize: 'var(--text-caption)', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Status:</span>
                    <div style={{
                      display: 'flex', gap: 2,
                      border: '1px solid var(--color-border)',
                      borderRadius: 6, overflow: 'hidden',
                      backgroundColor: 'var(--color-surface-hover)',
                    }}>
                      {(['all', 'active', 'inactive', 'expired'] as const).map(type => (
                        <button
                          key={type}
                          type="button"
                          className="btn"
                          style={{
                            padding: '6px 12px', fontSize: 11, borderRadius: 0, border: 'none',
                            backgroundColor: statusFilter === type ? 'var(--color-surface)' : 'transparent',
                            color: statusFilter === type ? 'var(--color-text-primary)' : 'var(--color-text-disabled)',
                            fontWeight: statusFilter === type ? 600 : 400,
                          }}
                          onClick={() => setStatusFilter(type)}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* QR Grid */}
                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 8 }}>
                    <RefreshCw size={24} className="spin text-muted" />
                    <span className="text-muted text-caption">Loading QR codes…</span>
                  </div>
                ) : filteredQrs.length === 0 ? (
                  <div style={{
                    border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-cards)',
                    padding: 'var(--spacing-64) var(--spacing-24)', textAlign: 'center',
                    backgroundColor: 'var(--color-surface)',
                  }}>
                    <h3 style={{ fontFamily: 'var(--font-satoshi)', fontSize: 'var(--text-subheading)', fontWeight: 500, marginBottom: 8 }}>
                      No Dynamic QRs found
                    </h3>
                    <p className="text-muted text-sm" style={{ marginBottom: 'var(--spacing-24)', maxWidth: 400, marginInline: 'auto' }}>
                      {searchQuery || statusFilter !== 'all'
                        ? 'No results match your filters. Try clearing search or status filter.'
                        : 'Create your first time-based QR to route scanners by schedule and channel.'}
                    </p>
                    {!(searchQuery || statusFilter !== 'all') && (
                      <button type="button" className="btn btn-accent" onClick={() => setShowCreateForm(true)}>
                        <Plus size={16} /> Create QR Code
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="layout-grid grid-cols-2">
                    {filteredQrs.map(qr => (
                      <QrCard
                        key={qr.id}
                        qr={qr}
                        onEdit={setEditingQr}
                        onViewAnalytics={setSelectedQrForAnalytics}
                        onToggleActive={handleToggleActive}
                        onDelete={handleDeleteQr}
                        onSelectForPreview={setPreviewQr}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-32) 0', marginTop: 'auto' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-16)', fontSize: 'var(--text-caption)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="font-satoshi" style={{ fontWeight: 600 }}>
              chroni<span style={{ color: 'var(--color-accent)' }}>QR</span>
            </span>
            <span className="text-muted">|</span>
            <span className="text-muted">© 2026 chroniQR. All rights reserved.</span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-16)' }}>
            <span className="highlight-pill highlight-pill-violet" style={{ fontSize: 10 }}>Secure Encrypted</span>
            <span className="highlight-pill highlight-pill-lime" style={{ fontSize: 10 }}>Dynamic Redirection</span>
            <span className="highlight-pill highlight-pill-green" style={{ fontSize: 10 }}>Precision Analytics</span>
          </div>
        </div>
      </footer>
      {previewQr && (
        <QrPreviewModal
          qr={previewQr}
          onClose={() => setPreviewQr(null)}
        />
      )}
    </div>
  );
}

export default App;
