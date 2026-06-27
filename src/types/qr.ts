import type { TimeRule } from '../utils/routingPreview';

// Re-export TimeRule so consumers can import from a single place
export type { TimeRule };

// ── Destination type union ───────────────────────────────────────────────────
export type DestinationType = 'url' | 'whatsapp' | 'call' | 'email' | 'vcard' | 'time_based';

// ── QR Code data (persisted record from backend) ─────────────────────────────
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

// ── UTM configuration ────────────────────────────────────────────────────────
export interface UtmConfig {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

// ── QR Form payload (sent to backend on create/update) ───────────────────────
export interface QrFormPayload {
  id?: string;                                    // present on update
  is_active?: boolean;                            // present on update
  name: string;
  destination_type: DestinationType;
  destination_config: Record<string, any>;
  utm_config: UtmConfig;
  tags: string[];
  expires_at: string | null;
  ga4_tracking_enabled: boolean;
}
