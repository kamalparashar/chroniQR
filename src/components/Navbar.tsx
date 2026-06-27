import React from 'react';
import { QrCode, LogOut } from 'lucide-react';
import type { AuthUser } from '../utils/auth';

interface NavbarProps {
  authUser: AuthUser;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ authUser, onLogout }) => {
  // Get initials for avatar
  const initials = authUser.name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header style={{
      borderBottom: '1px solid var(--color-border)',
      backgroundColor: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="container" style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            backgroundColor: 'var(--color-accent)',
            color: '#000',
            width: 32, height: 32,
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <QrCode size={18} />
          </div>
          <span className="font-satoshi" style={{ fontSize: 20, fontWeight: 600 }}>
            chroni<span style={{ color: 'var(--color-accent)' }}>QR</span>
          </span>
          <span className="tag-chip tag-chip-lime" style={{ marginLeft: 4, fontSize: 10 }}>Beta</span>
        </div>

        {/* User section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Avatar + info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Avatar circle */}
            <div style={{
              width: 32, height: 32,
              borderRadius: '50%',
              backgroundColor: 'var(--color-accent-dim)',
              border: '1px solid rgba(204,255,0,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-geistmono)',
              fontSize: 12, fontWeight: 600,
              color: 'var(--color-accent)',
              flexShrink: 0,
            }}>
              {initials}
            </div>

            {/* Name + email */}
            <div className="dashboard-navbar-user-name" style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {authUser.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-geistmono)' }}>
                {authUser.email}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 24, backgroundColor: 'var(--color-border)' }} />

          {/* Logout */}
          <button
            id="navbar-logout-btn"
            type="button"
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: 13, gap: 6 }}
            onClick={onLogout}
            title="Log out"
          >
            <LogOut size={14} />
            Log out
          </button>
        </div>
      </div>
    </header>
  );
};
