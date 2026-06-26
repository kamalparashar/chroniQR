import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Download, ExternalLink, Link2, Copy, Check } from 'lucide-react';
import type { QrCodeData } from './QrCard';

interface QrPreviewModalProps {
  qr: QrCodeData;
  onClose: () => void;
}

export const QrPreviewModal: React.FC<QrPreviewModalProps> = ({ qr, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, qr.short_url, {
      width: 256,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    }, (err) => {
      if (err) console.error('Error generating QR code in modal:', err);
    });
  }, [qr.short_url]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${qr.name.replace(/\s+/g, '_')}_qr.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(qr.short_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 200ms ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#0c0c0e',
          border: '1px solid #27272a',
          borderRadius: 20,
          padding: 32,
          maxWidth: 400,
          width: '90%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(204, 255, 0, 0.05)',
          animation: 'slideUp 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-satoshi)', fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
            QR Code Preview
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
              padding: 4,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 100ms',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#18181b'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>

        {/* QR Code Container */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: 16,
          borderRadius: 16,
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <canvas ref={canvasRef} style={{ display: 'block', borderRadius: 8 }} />
        </div>

        {/* Info */}
        <div style={{ textAlign: 'center', width: '100%' }}>
          <h4 style={{ margin: '0 0 6px 0', fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {qr.name}
          </h4>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: 8,
            padding: '8px 12px',
            marginTop: 12,
            width: '100%',
            boxSizing: 'border-box',
          }}>
            <Link2 size={14} color="var(--color-text-secondary)" />
            <span style={{
              fontFamily: 'var(--font-geistmono)',
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flex: 1,
              textAlign: 'left',
            }}>
              {qr.short_url}
            </span>
            <a
              href={qr.short_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--color-text-disabled)',
                display: 'inline-flex',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-disabled)'}
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, width: '100%' }}>
          <button
            onClick={handleCopyLink}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 16px',
              borderRadius: 10,
              border: '1px solid #27272a',
              backgroundColor: 'transparent',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              transition: 'background-color 100ms',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#18181b'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {copied ? <Check size={16} color="var(--color-accent)" /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          
          <button
            onClick={handleDownload}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 16px',
              borderRadius: 10,
              border: 'none',
              backgroundColor: 'var(--color-accent)',
              color: '#000000',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 700,
              transition: 'transform 100ms, filter 100ms',
            }}
            onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Download size={16} />
            Download PNG
          </button>
        </div>
      </div>
      
      {/* Dynamic Keyframes injection */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};
