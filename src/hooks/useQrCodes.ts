import { useState, useCallback } from 'react';
import { callBackendAction, fetchFromBackend } from '../utils/api';
import type { QrCodeData, QrFormPayload } from '../types/qr';
import { useToast } from '../contexts/ToastContext';

export function useQrCodes(activeClient: string) {
  const toast = useToast();
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
      toast.error('Failed to load QR codes.');
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
      toast.success(isEditing ? 'QR code updated' : 'QR code created');
    } catch (err) {
      toast.error('Failed to save QR code');
      throw err;
    }
  };

  const handleToggleActive = async (qr: QrCodeData) => {
    try {
      await callBackendAction('/actions/update-qr', activeClient, { id: qr.id, is_active: !qr.is_active });
      await fetchQrs();
      toast.success(qr.is_active ? 'QR code deactivated' : 'QR code activated');
    } catch (err) {
      toast.error('Failed to toggle QR status. Is the backend running?');
    }
  };

  const handleDeleteQr = async (qr: QrCodeData) => {
    if (!window.confirm(`Delete "${qr.name}"? This cannot be undone.`)) return;
    try {
      await callBackendAction('/actions/delete-qr', activeClient, { id: qr.id });
      await fetchQrs();
      toast.success('QR code deleted');
    } catch (err) {
      toast.error('Failed to delete QR code');
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
