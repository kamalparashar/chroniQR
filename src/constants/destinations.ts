import React from 'react';
import { Globe, MessageSquare, Phone, Mail, User, Clock } from 'lucide-react';

// ── Destination type card definitions (used in QrForm) ───────────────────────
export const DEST_TYPES = [
  { value: 'url' as const,        label: 'Website URL',     desc: 'Redirect to any HTTPS URL', icon: Globe,         color: '#60A5FA' },
  { value: 'whatsapp' as const,   label: 'WhatsApp',        desc: 'Open a WhatsApp chat',      icon: MessageSquare, color: '#25D366' },
  { value: 'call' as const,       label: 'AI Voice Call',   desc: 'Click-to-call or callback', icon: Phone,         color: '#7C3AED' },
  { value: 'email' as const,      label: 'Email',           desc: 'Pre-fill email template',   icon: Mail,          color: '#3B82F6' },
  { value: 'vcard' as const,      label: 'vCard Contact',   desc: 'Download contact card',     icon: User,          color: '#EA580C' },
  { value: 'time_based' as const, label: 'Time-Based',      desc: 'Route by hour & day rules', icon: Clock,         color: '#CCFF00' },
] as const;

// ── Channel badge config (used in QrCard, AnalyticsView) ─────────────────────
export const CHANNEL_MAP: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  url:        { icon: Globe,          label: 'Short Link',  color: '#60A5FA' },
  whatsapp:   { icon: MessageSquare,  label: 'WhatsApp',    color: '#25D366' },
  call:       { icon: Phone,          label: 'AI Call',     color: '#7C3AED' },
  email:      { icon: Mail,           label: 'Email',       color: '#3B82F6' },
  vcard:      { icon: User,           label: 'vCard',       color: '#EA580C' },
  time_based: { icon: Clock,          label: 'Time-Based',  color: '#CCFF00' },
};

// ── Fallback destination options for time-based default routing ───────────────
export const FALLBACK_OPTIONS = [
  { value: 'url',      label: 'Website URL' },
  { value: 'whatsapp', label: 'WhatsApp Chat' },
  { value: 'call',     label: 'AI Call Interface' },
] as const;

// ── Helper: get channel info with fallback ───────────────────────────────────
export function getChannel(type: string) {
  return CHANNEL_MAP[type] ?? { icon: Globe, label: type, color: '#A1A1AA' };
}
