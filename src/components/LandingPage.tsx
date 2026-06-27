import React, { useEffect, useRef, useState } from 'react';
import { QrCode, Clock, Globe, Radio, BarChart3, Zap, Lock, ArrowRight, ChevronDown } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

// ── Intersection Observer Hook ───────────────────────────────────────────────
function useInView(options: IntersectionObserverInit = { threshold: 0.1 }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.unobserve(el);
      }
    }, options);
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return { ref, inView };
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

// ── Wave Dot Grid (canvas) ───────────────────────────────────────────────────
function ClothDotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ── Constants ─────────────────────────────────────────────────────────
    const SPACING = 32;   // dot grid spacing (px)
    const MOUSE_R = 120;  // cursor influence radius
    const PUSH = 5;    // max push strength
    const SPRING = 0.08; // spring constant (pulls back to rest)
    const DAMPING = 0.82; // velocity damping (higher = snappier return)

    type Pt = { x: number; y: number; vx: number; vy: number; ox: number; oy: number };

    let pts: Pt[] = [];
    let cols = 0, rows = 0;
    const mouse = { x: -9999, y: -9999 };
    let active = false; // only loop while mouse is inside

    // ── Build grid ─────────────────────────────────────────────────────────
    const init = () => {
      cols = Math.ceil(canvas.width / SPACING) + 1;
      rows = Math.ceil(canvas.height / SPACING) + 1;
      pts = [];
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const x = c * SPACING, y = r * SPACING;
          pts.push({ x, y, vx: 0, vy: 0, ox: x, oy: y });
        }
    };

    // ── Draw static grid (white dots) ─────────────────────────────────────
    const drawStatic = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.ox, p.oy, 1, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(237, 237, 237, 0.25)';
        ctx.fill();
      }
    };

    // ── Animated loop (only while cursor is active) ────────────────────────
    let animId = 0;

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let anyMoved = false;

      for (const p of pts) {
        // Spring back to rest
        const sx = (p.ox - p.x) * SPRING;
        const sy = (p.oy - p.y) * SPRING;
        p.vx = (p.vx + sx) * DAMPING;
        p.vy = (p.vy + sy) * DAMPING;

        // Cursor repulsion
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < MOUSE_R && d > 0) {
          const f = ((MOUSE_R - d) / MOUSE_R) ** 2 * PUSH;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Track if any dot is still moving (above threshold)
        const distFromRest = Math.abs(p.x - p.ox) + Math.abs(p.y - p.oy);
        if (distFromRest > 0.15) anyMoved = true;

        // Draw — white at rest, blooms lime when displaced
        const disp = Math.sqrt((p.x - p.ox) ** 2 + (p.y - p.oy) ** 2);
        const norm = Math.min(disp / 20, 1);
        // Interpolate: white (237,237,237) → lime (204,255,0)
        const r_ch = Math.round(237 - norm * (237 - 28));
        const g_ch = Math.round(237 + norm * (255 - 237));
        const b_ch = Math.round(237 - norm * 237);
        const opacity = 0.25 + norm * 0.65;
        const radius = 1 + norm * 1.0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r_ch}, ${g_ch}, ${b_ch}, ${opacity})`;
        ctx.fill();
      }

      // Keep looping only if dots are still settling; otherwise freeze
      if (active || anyMoved) {
        animId = requestAnimationFrame(loop);
      } else {
        drawStatic();
      }
    };

    // ── Events ─────────────────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      if (!active) { active = true; cancelAnimationFrame(animId); loop(); }
    };

    const onMouseLeave = () => {
      mouse.x = -9999; mouse.y = -9999;
      active = false; // loop will self-terminate once all dots settle
    };

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      init();
      drawStatic();
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);
    canvas.closest('section')?.addEventListener('mouseleave', onMouseLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      canvas.closest('section')?.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

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
  const { ref, inView } = useInView({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="feature-card-glow"
      style={{
        backgroundColor: 'rgba(10, 10, 10, 0.7)',
        backdropFilter: 'blur(8px)',
        border: `1.5px solid ${hovered ? 'rgba(255, 255, 255, 0.2)' : 'var(--color-border)'}`,
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        cursor: 'default',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: inView ? (hovered ? 'translateY(-4px)' : 'translateY(0)') : 'translateY(24px)',
        opacity: inView ? 1 : 0,
        boxShadow: hovered ? '0 12px 32px rgba(0,0,0,0.5)' : 'none',
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
      className="stat-pill"
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
  const { ref, inView } = useInView({ threshold: 0.2 });

  return (
    <div ref={ref} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: 12,
      flex: 1,
      transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      transitionDelay: `${n * 100}ms`,
      transform: inView ? 'translateY(0)' : 'translateY(24px)',
      opacity: inView ? 1 : 0,
    }}>
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
          </div>

          {/* Nav Actions */}
          <div className="nav-actions" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              id="landing-login-btn"
              className="btn btn-secondary btn-login-lime"
              style={{
                fontSize: 14,
                borderColor: 'var(--color-accent)',
                color: 'var(--color-accent)',
              }}
              onClick={onLogin}
            >
              <span>Log in</span>
            </button>
            <button id="landing-signup-btn" className="btn btn-accent btn-accent-glow nav-hide-mobile" style={{ fontSize: 14 }} onClick={onGetStarted}>
              Get started free
            </button>
          </div>
        </div>
      </header>

      <main>
      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <section className="hero-section" style={{ padding: '80px 0 96px', position: 'relative', backgroundColor: 'var(--color-app-bg)' }}>
        {/* Cloth physics dot grid */}
        <ClothDotGrid />

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
          <h1 className="hero-headline" style={{
            fontSize: 'clamp(28px, 5vw, 72px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            maxWidth: 900,
            width: '100%',
            color: 'var(--color-text-primary)',
            overflowWrap: 'break-word',
            position: 'relative',
            zIndex: 1,
            overflow: 'visible',
          }}>
            QR Codes that know{' '}
            <span className="gradient-text-animated" style={{
              fontStyle: 'italic',
              display: 'inline-block',
              paddingRight: '0.15em',
            }}>what time it is.</span>
          </h1>

          {/* Subheading */}
          <p className="hero-subheading" style={{
            fontSize: 18,
            color: 'var(--color-text-secondary)',
            maxWidth: 560,
            lineHeight: 1.6,
          }}>
            Dynamic, timezone-aware QR codes that route your audience differently by hour, day, and channel — URL, WhatsApp, Call, Email, or vCard.
          </p>

          {/* CTAs */}
          <div className="hero-ctas" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
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
          <div className="qr-matrix-wrap" style={{ marginTop: 16 }}>
            <QrMatrix />
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '32px 0' }}>
        <div className="container stats-bar-inner" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <StatPill value="<10ms" label="Avg redirect latency" />
          <StatPill value="400+" label="IANA timezones" />
          <StatPill value="6" label="Destination channels" />
          <StatPill value="∞" label="Scans per code" />
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────────────────────── */}
      <section ref={featuresRef} className="section-features" style={{ padding: '96px 0' }}>
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
      <section className="section-how-it-works" style={{ padding: '80px 0', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontFamily: 'var(--font-geistmono)', color: 'var(--color-accent)', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 12, textTransform: 'uppercase' }}>
              How it works
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 600, letterSpacing: '-0.02em' }}>
              Three steps. Zero friction.
            </h2>
          </div>

          <div className="how-steps" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', position: 'relative' }}>
            {/* Connector line (decorative, hidden on mobile via .how-steps-connector) */}
            <div className="how-steps-connector" style={{
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
      <section className="section-cta" style={{ padding: '80px 0 96px', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <div className="cta-banner-inner" style={{
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
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--color-border)',
        padding: '32px 0',
        backgroundColor: 'var(--color-surface)',
      }}>
        <div className="container landing-footer-inner" style={{
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
          <span style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>
            © 2026 chroniQR Inc.
          </span>
        </div>
      </footer>

    </div>
  );
};
