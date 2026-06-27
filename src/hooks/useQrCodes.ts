import { useState, useCallback } from 'react';
import { callBackendAction, fetchFromBackend } from '../utils/api';
import type { QrCodeData, QrFormPayload } from '../types/qr';

export function useQrCodes(activeClient: string) {
  const [qrs, setQrs] = useState<QrCodeData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQrs = useCallback(async () => {
    if (!activeClient) return;
    setLoading(true);
    try {
      const qrList: QrCodeData[] = await fetchFromBackend('/qr-codes', activeClient);
      let scansMap: Record<string, number> = {};
      try {
        scansMap = await fetchFromBackend('/scans/count', activeClient);
      } catch (_) {}
      
      const enriched = qrList.map(qr => ({ ...qr, scans_count: scansMap[qr.id] || 0 }));
      setQrs(enriched);
    } catch (err) {
      console.error('Failed to load QR codes:', err);
      setQrs([]);
    } finally {
      setLoading(false);
    }
  }, [activeClient]);

  const handleSaveQr = async (qrData: QrFormPayload, isEditing: boolean) => {
    try {
      if (isEditing) {
        await callBackendAction('/actions/update-qr', activeClient, qrData);
      } else {
        await callBackendAction('/actions/create-qr', activeClient, qrData);
      }
      await fetchQrs();
    } catch (err) {
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

  return {
    qrs,
    loading,
    fetchQrs,
    handleSaveQr,
    handleToggleActive,
    handleDeleteQr,
  };
}
