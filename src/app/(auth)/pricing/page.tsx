'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Star } from 'lucide-react';
import Image from 'next/image';
import styles from './page.module.css';
import { startCheckout, fetchStripePrices, StripePublicPrice } from '@/lib/stripeClient';
import PromoCodeModal from '@/components/ui/PromoCodeModal';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged, type User } from 'firebase/auth';


export default function PricingPage() {
  const [showPlans, setShowPlans] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('annual');
  // const [paymentMethod, setPaymentMethod] = useState<'google' | 'apple'>('google');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPromo, setShowPromo] = useState(false);
  const [applied, setApplied] = useState<{ code: string; compUntil?: string; compDays?: number } | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();

  // Dynamic Stripe prices
  const monthlyId = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID as string | undefined;
  const yearlyId = process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID as string | undefined;
  const [prices, setPrices] = useState<Record<string, StripePublicPrice | null> | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setPriceError(null);
      try {
        const ids = [monthlyId, yearlyId].filter(Boolean) as string[];
        if (ids.length === 0) return; // no configured IDs, keep fallbacks
        const p = await fetchStripePrices(ids);
        if (mounted) setPrices(p);
      } catch (e: any) {
        if (mounted) setPriceError(e?.message || 'Unable to load pricing');
      }
    }
    load();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Observe auth state for gating the checkout CTA
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u));
    return () => unsub();
  }, []);

  function formatMoney(currency: string | undefined, amountMinor: number | undefined) {
    if (!currency || typeof amountMinor !== 'number') return null;
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amountMinor / 100);
    } catch {
      return `$${(amountMinor / 100).toFixed(2)}`;
    }
  }

  const monthlyPrice = prices && monthlyId ? prices[monthlyId] : null;
  const yearlyPrice = prices && yearlyId ? prices[yearlyId] : null;

  const displayMonthly = useMemo(() => {
    return formatMoney(monthlyPrice?.currency, monthlyPrice?.unit_amount) || '$6.99';
  }, [monthlyPrice]);

  const displayYearlyTotal = useMemo(() => {
    return formatMoney(yearlyPrice?.currency, yearlyPrice?.unit_amount) || '$59.99';
  }, [yearlyPrice]);

  const displayYearlyEffectiveMonthly = useMemo(() => {
    if (yearlyPrice?.unit_amount && yearlyPrice?.currency) {
      const perMonthMinor = Math.round(yearlyPrice.unit_amount / 12);
      return formatMoney(yearlyPrice.currency, perMonthMinor) || '$4.99';
    }
    return '$4.99';
  }, [yearlyPrice]);

  const savePercent = useMemo(() => {
    if (yearlyPrice?.unit_amount && monthlyPrice?.unit_amount) {
      const effMonthly = yearlyPrice.unit_amount / 12;
      const pct = 1 - effMonthly / monthlyPrice.unit_amount;
      const rounded = Math.max(0, Math.round(pct * 100));
      if (isFinite(rounded) && rounded > 0) return `Save ${rounded}%`;
    }
    return 'Save 29%';
  }, [yearlyPrice, monthlyPrice]);

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Start with 10 days free</h1>
          
          <div className={styles.features}>
            <p className={styles.featuresTitle}>Capture your baby's journey today with:</p>
            <ul className={styles.featureList}>
              <li className={styles.featureItem}><Check size={20} className={styles.featureIcon} /><span>Effortless photo & memory journaling</span></li>
              <li className={styles.featureItem}><Check size={20} className={styles.featureIcon} /><span>AI powered, shareable recaps</span></li>
              <li className={styles.featureItem}><Check size={20} className={styles.featureIcon} /><span>Automatic, secure family sharing & more</span></li>
            </ul>
          </div>

          <div className={styles.testimonialCard}>
            <div className={styles.testimonialHeader}>
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} fill="#f59e0b" strokeWidth={0} size={20} />
                ))}
              </div>
              <div className={styles.testimonialAuthor}>
                <p className={styles.authorName}>Alexandra W.</p>
                <Image
                  src="/assets/sampleProfile.png"
                  alt="Alexandra W."
                  width={32}
                  height={32}
                  className={styles.authorImage}
                />
              </div>
            </div>
            <p className={styles.testimonialText}>
              “This app made it so easy to capture all the precious early memories with my baby”
            </p>
          </div>

          <div className={styles.pricingInfo}>
            <p className={styles.price}>Get 10 days free, then just {displayYearlyEffectiveMonthly}/month</p>
            <p className={styles.billingCycle}>(billed {displayYearlyTotal}/year)</p>
          </div>

          {applied && (
            <div style={{ marginTop: 12, padding: 12, background: '#E6F4EA', border: '1px solid #C7E8D1', borderRadius: 8, textAlign: 'center' }}>
              Code {applied.code} applied{applied.compUntil ? ` – free until ${new Date(applied.compUntil).toLocaleDateString()}` : ''}
            </div>
          )}

          {showPlans && (
            <>
            <div className={styles.planSelector}>
              <div className={`${styles.planOption} ${selectedPlan === 'annual' ? styles.selected : ''}`} onClick={() => setSelectedPlan('annual')}>
                <div className={`${styles.innerPlanBox} ${selectedPlan === 'annual' ? styles.hasBadge : ''}`}>
                  {selectedPlan === 'annual' && <span className={styles.popularBadge}>Most popular</span>}
                  <div className={styles.radioCircle}>
                    {selectedPlan === 'annual' && <Check size={16} strokeWidth={3} />}
                  </div>
                  <div className={styles.planDetails}>
                    <span className={styles.planPrice}>{displayYearlyEffectiveMonthly}/month</span>
                    <span className={styles.planBilling}>Billed at {displayYearlyTotal}/year</span>
                  </div>
                  <span className={styles.saveBadge}>{savePercent}</span>
                </div>
              </div>
              <div className={`${styles.planOption} ${selectedPlan === 'monthly' ? styles.selected : ''}`} onClick={() => setSelectedPlan('monthly')}>
                <div className={styles.innerPlanBox}>
                  <div className={styles.radioCircle}>
                    {selectedPlan === 'monthly' && <Check size={16} strokeWidth={3} />}
                  </div>
                  <div className={styles.planDetails}>
                    <span className={styles.planPrice}>{displayMonthly}/month</span>
                    <span className={styles.planBilling}>Billed monthly</span>
                  </div>
                </div>
              </div>
            </div>
            <a href="#" className={`${styles.seeAllPlans} ${styles.hidePlansBottom}`} onClick={(e) => { e.preventDefault(); setShowPlans(false); }}>
              Hide plans
            </a>
            </>
          )}

          {!showPlans && (
            <a href="#" className={`${styles.seeAllPlans} ${styles.seePlansTop}`} onClick={(e) => { e.preventDefault(); setShowPlans(true); }}>
              See all plans
            </a>
          )}

          <div className={styles.buttonsContainer}>
            {currentUser ? (
              <button
                className={styles.paymentButton}
                onClick={async () => {
                  setError(null);
                  setSubmitting(true);
                  try {
                    const yearly = process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID;
                    const monthly = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID;
                    const priceId = selectedPlan === 'annual' ? yearly : monthly;
                    if (!priceId) throw new Error('Billing is not configured. Missing Stripe price ID.');
                    const origin = typeof window !== 'undefined' ? window.location.origin : '';
                    await startCheckout(priceId, {
                      successUrl: origin ? `${origin}/download` : undefined,
                      cancelUrl: origin ? `${origin}/pricing` : undefined,
                    });
                  } catch (e: any) {
                    const msg = e?.message || 'Unable to start checkout';
                    setError(msg);
                  } finally {
                    setSubmitting(false);
                  }
                }}
                disabled={submitting}
              >
                <span>{submitting ? 'Processing…' : 'Continue to Checkout'}</span>
              </button>
            ) : (
              <button
                className={styles.paymentButton}
                onClick={() => router.push('/signup?next=/pricing')}
                disabled={submitting}
              >
                Sign up to continue
              </button>
            )}
          </div>

          <p className={styles.moreWaysToPay} style={{ textAlign: 'center', marginTop: 8 }}>
            Apple Pay / Google Pay will be offered by Stripe Checkout when supported on your device.
          </p>

          {error && (
            <p style={{ color: '#DC2626', textAlign: 'center', marginTop: 12 }}>{error}</p>
          )}

          <PromoCodeModal
            open={showPromo}
            onClose={() => setShowPromo(false)}
            onApplied={(result) => setApplied(result)}
          />

          <div className={styles.footerLinks}>
            <p>Get 10 days free before being charged</p>
            <p>Have a promo code? <a href="#" onClick={(e) => { e.preventDefault(); setShowPromo(true); }}>Redeem code</a></p>
          </div>
        </div>
      </main>
    </div>
  );
}
