import React, { useEffect, useRef, useState } from 'react';
import { QrCode, Clock, Globe, Radio, BarChart3, Zap, Lock, ArrowRight, ChevronDown } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

// ── Decorative QR Matrix (CSS-only) ─────────────────────────────────────────
const QR_PATTERN = [
  [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0],
  [0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1],
  [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0],
  [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0],
  [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0],
  [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1],
];

// Accent cells that pulse lime
const ACCENT_CELLS = new Set(['2-10', '3-10', '4-10', '9-3', '10-3', '11-9', '12-4']);

function QrMatrix() {
  return (
    <div style={{
      display: 'inline-grid',
      gridTemplateColumns: `repeat(${QR_PATTERN[0].length}, 10px)`,
      gridTemplateRows: `repeat(${QR_PATTERN.length}, 10px)`,
      gap: '2px',
      padding: '16px',
      backgroundColor: '#000',
      border: '1px solid #1F1F1F',
      borderRadius: '12px',
      boxShadow: '0 0 0 1px #1F1F1F, 0 0 40px rgba(204,255,0,0.08)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Laser scan line overlay */}
      <div className="scan-line" />

      {QR_PATTERN.map((row, r) =>
        row.map((cell, c) => {
          const isAccent = cell === 1 && ACCENT_CELLS.has(`${r}-${c}`);
          return (
            <div
              key={`${r}-${c}`}
              className={`qr-cell ${isAccent ? 'pulse-glow' : ''}`}
              style={{
                width: 10,
                height: 10,
                borderRadius: '1px',
                backgroundColor: cell === 0
                  ? 'transparent'
                  : isAccent
                    ? 'var(--color-accent)'
                    : '#EDEDED',
              }}
            />
          );
        })
      )}
    </div>
  );
}

// ── Feature Card ─────────────────────────────────────────────────────────────
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  accentColor?: string;
}
function FeatureCard({ icon, title, desc, accentColor = 'var(--color-accent)' }: FeatureCardProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="feature-card-glow"
      style={{
        backgroundColor: 'rgba(10, 10, 10, 0.7)',
        backdropFilter: 'blur(8px)',
        border: `1px solid ${hovered ? 'transparent' : 'var(--color-border)'}`,
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        cursor: 'default',
      }}
    >
      <div
        className="feature-icon"
        style={{
          width: 40,
          height: 40,
          borderRadius: '8px',
          backgroundColor: `${accentColor}18`,
          border: `1px solid ${accentColor}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: accentColor,
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4, fontSize: 15 }}>{title}</p>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{desc}</p>
      </div>
    </div>
  );
}

// ── Stat Pill ─────────────────────────────────────────────────────────────────
function StatPill({ value, label }: { value: string; label: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: '20px 32px',
        backgroundColor: 'rgba(10, 10, 10, 0.7)',
        backdropFilter: 'blur(8px)',
        border: `1px solid ${hovered ? 'var(--color-accent)' : 'var(--color-border)'}`,
        borderRadius: '12px',
        flex: 1,
        minWidth: 140,
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 8px 20px rgba(204, 255, 0, 0.05)' : 'none',
        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <span style={{
        fontFamily: 'var(--font-geistmono)',
        fontSize: 28,
        fontWeight: 600,
        color: 'var(--color-accent)',
        letterSpacing: '-0.5px',
      }}>{value}</span>
      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{label}</span>
    </div>
  );
}

// ── Step ──────────────────────────────────────────────────────────────────────
function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12, flex: 1 }}>
      <div className="step-number-container">
        <div
          className="step-number-pulse"
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: 'var(--color-accent-dim)',
            border: '1px solid var(--color-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-geistmono)',
            fontWeight: 600,
            fontSize: 18,
            color: 'var(--color-accent)',
          }}
        >
          {n}
        </div>
      </div>
      <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: 15 }}>{title}</p>
      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5, maxWidth: 220 }}>{desc}</p>
    </div>
  );
}

// ── Landing Page ─────────────────────────────────────────────────────────────
export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  const featuresRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-app-bg)', color: 'var(--color-text-primary)' }}>

      {/* ── Sticky Top Nav ────────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: scrolled ? 'rgba(0,0,0,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent',
        transition: 'all 200ms ease-out',
      }}>
        <div className="container" style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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

          {/* Nav Actions */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button id="landing-login-btn" className="btn btn-secondary" style={{ fontSize: 14 }} onClick={onLogin}>
              Log in
            </button>
            <button id="landing-signup-btn" className="btn btn-accent btn-accent-glow" style={{ fontSize: 14 }} onClick={onGetStarted}>
              Get started free
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <section className="dot-grid-bg" style={{ padding: '80px 0 96px', position: 'relative', overflow: 'hidden' }}>
        {/* Ambient float orbs */}
        <div className="glow-orb-container">
          <div className="glow-orb glow-orb-1" />
          <div className="glow-orb glow-orb-2" />
          <div className="glow-orb glow-orb-3" />
        </div>

        {/* Radial fade overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(204,255,0,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 32,
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px',
            backgroundColor: 'var(--color-accent-dim)',
            border: '1px solid rgba(204,255,0,0.2)',
            borderRadius: 9999,
            fontSize: 12, fontWeight: 600,
            color: 'var(--color-accent)',
            fontFamily: 'var(--font-geistmono)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-accent)', display: 'inline-block' }} />
            Time-aware dynamic QR platform
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(40px, 6vw, 72px)',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            maxWidth: 800,
            color: 'var(--color-text-primary)',
          }}>
            QR Codes that know{' '}
            <span className="gradient-text-animated" style={{
              fontStyle: 'italic',
            }}>what time it is.</span>
          </h1>

          {/* Subheading */}
          <p style={{
            fontSize: 18,
            color: 'var(--color-text-secondary)',
            maxWidth: 560,
            lineHeight: 1.6,
          }}>
            Dynamic, timezone-aware QR codes that route your audience differently by hour, day, and channel — URL, WhatsApp, Call, Email, or vCard.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              id="hero-get-started-btn"
              className="btn btn-accent btn-accent-glow"
              style={{ fontSize: 15, padding: '12px 28px', gap: 8 }}
              onClick={onGetStarted}
            >
              Get started free <ArrowRight size={16} />
            </button>
            <button
              id="hero-how-it-works-btn"
              className="btn btn-secondary"
              style={{ fontSize: 15, padding: '12px 24px', gap: 6 }}
              onClick={scrollToFeatures}
            >
              See how it works <ChevronDown size={15} />
            </button>
          </div>

          {/* QR Matrix Hero */}
          <div style={{ marginTop: 16 }}>
            <QrMatrix />
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '32px 0' }}>
        <div className="container" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <StatPill value="<10ms" label="Avg redirect latency" />
          <StatPill value="400+" label="IANA timezones" />
          <StatPill value="6" label="Destination channels" />
          <StatPill value="∞" label="Scans per code" />
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────────────────────── */}
      <section ref={featuresRef} style={{ padding: '96px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontFamily: 'var(--font-geistmono)', color: 'var(--color-accent)', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 12, textTransform: 'uppercase' }}>
              Capabilities
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 600, letterSpacing: '-0.02em', maxWidth: 500, margin: '0 auto' }}>
              One QR. Every channel. Any timezone.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <FeatureCard
              icon={<Clock size={20} />}
              title="Time-Based Routing"
              desc="Define rules by hour, day, and date range. Route differently during business hours vs off-hours — automatically."
              accentColor="var(--color-accent)"
            />
            <FeatureCard
              icon={<Globe size={20} />}
              title="IANA Timezone Aware"
              desc="Auto-detects the scanner's timezone. Configure rules in any of 400+ IANA zones — no manual conversion needed."
              accentColor="#60A5FA"
            />
            <FeatureCard
              icon={<Radio size={20} />}
              title="Omnichannel"
              desc="One QR code can route to a URL, WhatsApp chat, AI voice call, email template, or vCard — all in one."
              accentColor="var(--color-whatsapp)"
            />
            <FeatureCard
              icon={<BarChart3 size={20} />}
              title="Precision Analytics"
              desc="Track device type, OS, browser, city, UTM parameters, and scan timestamps — all timezone-normalized."
              accentColor="var(--color-call)"
            />
            <FeatureCard
              icon={<Zap size={20} />}
              title="Instant Redirects"
              desc="Sub-10ms routing decisions powered by Go backend and Postgres. No scanner lag, ever."
              accentColor="var(--color-accent)"
            />
            <FeatureCard
              icon={<Lock size={20} />}
              title="Always Secure"
              desc="HTTPS-only short links. Set expiration dates. Toggle active status instantly. Full audit trail."
              accentColor="var(--color-success)"
            />
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 0', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontFamily: 'var(--font-geistmono)', color: 'var(--color-accent)', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 12, textTransform: 'uppercase' }}>
              How it works
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 600, letterSpacing: '-0.02em' }}>
              Three steps. Zero friction.
            </h2>
          </div>

          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', position: 'relative' }}>
            {/* Connector line (decorative) */}
            <div style={{
              position: 'absolute',
              top: 24,
              left: '20%',
              right: '20%',
              height: 1,
              backgroundColor: 'var(--color-border)',
              zIndex: 0,
            }} />
            <Step n={1} title="Create a dynamic QR" desc="Define time-based routing rules, choose destination channels, set your timezone." />
            <Step n={2} title="Print & share" desc="Download the QR code. Place it on menus, flyers, packaging — anywhere offline or online." />
            <Step n={3} title="Watch it work" desc="Track real-time scans, routing decisions, and analytics — all from your dashboard." />
          </div>
        </div>
      </section>

      {/* ── Final CTA Banner ──────────────────────────────────────────────── */}
      <section style={{ padding: '80px 0 96px', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 16,
            padding: '56px 48px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Lime radial glow */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse 60% 60% at 50% 100%, rgba(204,255,0,0.06) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            <p style={{
              fontFamily: 'var(--font-geistmono)',
              fontSize: 12,
              color: 'var(--color-accent)',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}>
              Start for free
            </p>

            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              marginBottom: 16,
              maxWidth: 600,
              margin: '0 auto 16px',
            }}>
              Your QR codes should work as hard as you do.
            </h2>

            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 32, fontSize: 16 }}>
              No credit card required. Create your first time-based QR in under 2 minutes.
            </p>

            <button
              id="cta-get-started-btn"
              className="btn btn-accent btn-accent-glow"
              style={{ fontSize: 16, padding: '14px 36px', gap: 8 }}
              onClick={onGetStarted}
            >
              Start building <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--color-border)',
        padding: '32px 0',
        backgroundColor: 'var(--color-surface)',
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          fontSize: 13,
        }}>
          <span className="font-satoshi" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
            chroni<span style={{ color: 'var(--color-accent)' }}>QR</span>
          </span>
          <div style={{ display: 'flex', gap: 24, color: 'var(--color-text-secondary)' }}>
            <span className="highlight-pill highlight-pill-lime" style={{ fontSize: 10 }}>Timezone Aware</span>
            <span className="highlight-pill highlight-pill-violet" style={{ fontSize: 10 }}>Omnichannel</span>
            <span className="highlight-pill highlight-pill-green" style={{ fontSize: 10 }}>Analytics</span>
          </div>
          <span style={{ color: 'var(--color-text-disabled)', fontSize: 12 }}>
            © 2026 chroniQR Inc.
          </span>
        </div>
      </footer>

    </div>
  );
};
