import { useMemo } from 'react';
import type { QrCodeData } from '../types/qr';

export function useDashboardStats(qrs: QrCodeData[]) {
  return useMemo(() => {
    const totalQrs  = qrs.length;
    const activeQrs = qrs.filter(qr => qr.is_active && (!qr.expires_at || new Date(qr.expires_at) > new Date())).length;
    
    let totalScans = 0;
    let topQrName = 'N/A';
    let topQrScans = 0;
    
    qrs.forEach(qr => {
      const s = qr.scans_count || 0;
      totalScans += s;
      if (s > topQrScans) { 
        topQrScans = s; 
        topQrName = qr.name; 
      }
    });

    return { totalQrs, activeQrs, totalScans, topQrName, topQrScans };
  }, [qrs]);
}
