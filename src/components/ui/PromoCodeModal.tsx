'use client';

import React from 'react';
import styles from './PromoCodeModal.module.css';
import { referralsClient } from '@/lib/referralsClient';

interface Props {
  open: boolean;
  onClose: () => void;
  onApplied?: (result: any & { code: string }) => void;
}

export default function PromoCodeModal({ open, onClose, onApplied }: Props) {
  const [code, setCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setCode('');
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleApply = async () => {
    if (!code.trim()) return;
    try {
      setLoading(true);
      setError(null);
      // Use redeemPromoCode (covers promo/gifts and pending referrals). You can swap to processReferral if desired.
      const result = await referralsClient.redeemPromoCode(code);
      onApplied?.({ ...result, code: code.trim().toUpperCase() });
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Failed to apply code');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>Have a code?</h3>
        <input
          ref={inputRef}
          className={styles.input}
          placeholder="Enter promo or referral code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\s+/g, ''))}
          disabled={loading}
          autoComplete="off"
          spellCheck={false}
          inputMode="text"
          maxLength={32}
          aria-label="Promo or referral code"
          pattern="[A-Za-z0-9-_]{3,32}"
        />
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose} disabled={loading}>Cancel</button>
          <button className={styles.apply} onClick={handleApply} disabled={loading || !code.trim()}>
            {loading ? 'Applying…' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
}
