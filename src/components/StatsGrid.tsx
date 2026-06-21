import React from 'react';
import { BarChart2, CheckCircle2, QrCode, Award } from 'lucide-react';

interface StatsGridProps {
  totalQrs: number;
  activeQrs: number;
  totalScans: number;
  topQrName: string;
  topQrScans: number;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  totalQrs,
  activeQrs,
  totalScans,
  topQrName,
  topQrScans
}) => {
  const stats = [
    {
      title: 'Total QR Codes',
      value: totalQrs,
      description: 'Dynamic codes created',
      icon: <QrCode size={20} className="text-muted" />,
      accentColor: 'var(--color-call)'
    },
    {
      title: 'Active QRs',
      value: activeQrs,
      description: `${totalQrs > 0 ? Math.round((activeQrs / totalQrs) * 100) : 0}% active routing`,
      icon: <CheckCircle2 size={20} className="text-muted" />,
      accentColor: 'var(--color-success)'
    },
    {
      title: 'Total Scans',
      value: totalScans,
      description: 'Analytics points recorded',
      icon: <BarChart2 size={20} className="text-muted" />,
      accentColor: 'var(--color-accent)'
    },
    {
      title: 'Top Performing Route',
      value: topQrScans > 0 ? `${topQrScans} scans` : 'N/A',
      description: topQrScans > 0 ? topQrName : 'No scans logged yet',
      icon: <Award size={20} className="text-muted" />,
      accentColor: 'var(--color-email)'
    }
  ];

  return (
    <div className="layout-grid grid-cols-4" style={{ marginBottom: 'var(--spacing-32)' }}>
      {stats.map((stat, index) => (
        <div key={index} className="card" style={{
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '120px'
        }}>
          {/* Accent border bar on top */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '3px',
            backgroundColor: stat.accentColor
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 500, color: 'var(--color-smoke-500)' }}>
              {stat.title}
            </span>
            {stat.icon}
          </div>

          <div style={{ marginTop: 'var(--spacing-12)' }}>
            <h3 style={{
              fontFamily: 'var(--font-geistmono)',
              fontSize: '30px',
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)'
            }}>
              {stat.value}
            </h3>
            <p className="text-muted text-caption" style={{ marginTop: '4px' }}>
              {stat.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
