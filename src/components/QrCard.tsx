import React, { useState } from 'react';
import { Calendar, Tag, BarChart3, ExternalLink, Settings, Eye, Trash2, Globe, MessageSquare, Phone, Mail, User, Clock } from 'lucide-react';

export interface QrCodeData {
  id: string;
  client_id: string;
  short_code: string;
  short_url: string;
  name: string;
  destination_type: string;
  destination_config: Record<string, any>;
  utm_config: Record<string, any>;
  style_config: Record<string, any>;
  tags: string[];
  is_active: boolean;
  expires_at: string | null;
  ga4_tracking_enabled: boolean;
  updated_at: string;
  scans_count?: number;
}

interface QrCardProps {
  qr: QrCodeData;
  onEdit: (qr: QrCodeData) => void;
  onViewAnalytics: (qr: QrCodeData) => void;
  onToggleActive: (qr: QrCodeData) => void;
  onDelete: (qr: QrCodeData) => void;
}

// ── Channel badge config ──────────────────────────────────────────────────────
const CHANNEL_MAP: Record<string, { icon: React.ElementType; label: string; color: string; }> = {
  url:        { icon: Globe,          label: 'Short Link',      color: '#60A5FA' },
  whatsapp:   { icon: MessageSquare,  label: 'WhatsApp',        color: '#25D366' },
  call:       { icon: Phone,          label: 'AI Call',         color: '#7C3AED' },
  email:      { icon: Mail,           label: 'Email',           color: '#3B82F6' },
  vcard:      { icon: User,           label: 'vCard',           color: '#EA580C' },
  time_based: { icon: Clock,          label: 'Time-Based',      color: '#CCFF00' },
};

function ChannelBadge({ type }: { type: string }) {
  const channel = CHANNEL_MAP[type] ?? { icon: Globe, label: type, color: '#A1A1AA' };
  const Icon = channel.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 8px',
      backgroundColor: `${channel.color}15`,
      border: `1px solid ${channel.color}30`,
      borderRadius: 4,
      fontSize: 11, fontWeight: 600,
      color: channel.color,
    }}>
      <Icon size={11} />
      {channel.label}
    </span>
  );
}

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const getDestDesc = (type: string, config: Record<string, any>) => {
  switch (type) {
    case 'url':        return config.url || '';
    case 'whatsapp':   return `wa.me/${config.phone || ''}`;
    case 'call':       return `Call: ${config.caller_number || ''}`;
    case 'email':      return `To: ${config.to || ''}`;
    case 'vcard':      return `Contact: ${config.name || ''}`;
    case 'time_based': return `${config.timezone || 'UTC'} · ${config.rules?.length ?? 0} rules`;
    default:           return '';
  }
};

// ── QrCard Component ──────────────────────────────────────────────────────────
export const QrCard: React.FC<QrCardProps> = ({ qr, onEdit, onViewAnalytics, onToggleActive, onDelete }) => {
  const [hovered, setHovered] = useState(false);
  const isExpired   = qr.expires_at ? new Date(qr.expires_at) < new Date() : false;
  const scansCount  = qr.scans_count ?? 0;
  const isTimeBased = qr.destination_type === 'time_based';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column', gap: 14,
        backgroundColor: 'var(--color-surface)',
        border: `1px solid ${hovered ? '#2a2a2a' : 'var(--color-border)'}`,
        borderRadius: 12,
        padding: 20,
        transition: 'border-color 100ms ease-out, box-shadow 100ms ease-out',
        boxShadow: hovered ? '0 0 0 1px #2a2a2a, 0 8px 24px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      {/* Top row: badges + toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, overflow: 'hidden', flex: 1 }}>
          {/* Channel badge + status chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <ChannelBadge type={qr.destination_type} />
            {isExpired && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, backgroundColor: 'var(--color-error-dim)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--color-error)', textTransform: 'uppercase' }}>
                Expired
              </span>
            )}
            {!qr.is_active && !isExpired && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, backgroundColor: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', color: 'var(--color-text-disabled)', textTransform: 'uppercase' }}>
                Inactive
              </span>
            )}
          </div>

          {/* Name */}
          <h3 style={{
            fontFamily: 'var(--font-satoshi)',
            fontSize: 18, fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginTop: 4,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }} title={qr.name}>
            {qr.name}
          </h3>

          {/* Short code */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <span style={{
              fontFamily: 'var(--font-geistmono)',
              fontSize: 11,
              color: 'var(--color-text-secondary)',
              backgroundColor: 'var(--color-surface-hover)',
              padding: '2px 8px',
              borderRadius: 4,
              border: '1px solid var(--color-border)',
            }}>
              /{qr.short_code}
            </span>
            <a href={qr.short_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text-disabled)', display: 'inline-flex' }} title="Visit redirect URL">
              <ExternalLink size={11} />
            </a>
          </div>
        </div>

        {/* Active toggle */}
        <label className="switch" title="Toggle active status" style={{ flexShrink: 0 }}>
          <input type="checkbox" checked={qr.is_active && !isExpired} disabled={isExpired} onChange={() => onToggleActive(qr)} />
          <span className="slider" />
        </label>
      </div>

      {/* Destination description */}
      <div style={{
        fontSize: 12,
        color: 'var(--color-text-secondary)',
        fontFamily: qr.destination_type === 'url' || isTimeBased ? 'var(--font-geistmono)' : 'inherit',
        wordBreak: 'break-all',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        lineHeight: 1.5,
        padding: '8px 10px',
        backgroundColor: 'var(--color-surface-hover)',
        borderRadius: 6,
        border: '1px solid var(--color-border)',
      }}>
        {getDestDesc(qr.destination_type, qr.destination_config) || '—'}
      </div>

      {/* Tags */}
      {qr.tags && qr.tags.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {qr.tags.map(tag => (
            <span key={tag} className="tag-chip" style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, padding: '2px 7px' }}>
              <Tag size={9} /> {tag}
            </span>
          ))}
        </div>
      )}

      {/* Bottom bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderTop: '1px solid var(--color-border)',
        paddingTop: 12,
        fontSize: 12,
      }}>
        <div style={{ display: 'flex', gap: 14, color: 'var(--color-text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-geistmono)', fontWeight: 600 }}>
            <BarChart3 size={13} />
            {scansCount.toLocaleString()} scans
          </span>
          {qr.expires_at && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={12} /> {formatDate(qr.expires_at)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '5px 10px', fontSize: 11 }}
            title="View analytics"
            onClick={() => onViewAnalytics(qr)}
          >
            <Eye size={12} /> Analytics
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '5px 10px', fontSize: 11 }}
            title="Edit QR"
            onClick={() => onEdit(qr)}
          >
            <Settings size={12} />
          </button>
          <button
            type="button"
            className="btn btn-danger"
            style={{ padding: '5px 10px', fontSize: 11 }}
            title="Delete QR"
            onClick={() => onDelete(qr)}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
