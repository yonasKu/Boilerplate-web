'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { X, Sprout, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSubscription } from '@/hooks/useSubscription';
import styles from './page.module.css';

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState('apple');
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'annual';

  const { user, loading } = useSubscription();

  const planDetails = {
    monthly: {
      price: '$4.99/month',
      name: 'Monthly Plan',
    },
    annual: {
      price: '$44.99/year',
      name: 'Annual Plan',
    },
  };

  const selectedPlanDetails = plan === 'monthly' ? planDetails.monthly : planDetails.annual;

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.pageWrapper}>


      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.planInfo}>
            <Image src="/assets/Logo_text_small.png" alt="Sproutbook Logo" width={140} height={40} className={styles.mainSproutIcon} />
            <p className={styles.trialText}>7 days free, then</p>
            <p className={styles.priceText}>{selectedPlanDetails.price}</p>
            <div className={styles.planBadge}>{selectedPlanDetails.name}</div>
          </div>

          <p className={styles.paymentTitle}>Payment Option</p>

          <div className={styles.paymentOptions}>
            <div 
              className={`${styles.paymentOption} ${paymentMethod === 'apple' ? styles.selected : ''}`}
              onClick={() => setPaymentMethod('apple')}
            >
              <Image src="/assets/Apple.png" alt="Apple Pay" width={40} height={25} />
              <div className={styles.paymentDetails}>
                <span className={styles.paymentName}>Apple Pay</span>
                <span className={styles.paymentDesc}>Pay with Face/Touch ID</span>
              </div>
              {paymentMethod === 'apple' && <CheckCircle2 className={styles.checkIcon} />}
            </div>
            <div 
              className={`${styles.paymentOption} ${paymentMethod === 'google' ? styles.selected : ''}`}
              onClick={() => setPaymentMethod('google')}
            >
              <Image src="/assets/Google.png" alt="Google Pay" width={30} height={30} />
              <div className={styles.paymentDetails}>
                <span className={styles.paymentName}>Google Pay</span>
                <span className={styles.paymentDesc}>Pay with Google</span>
              </div>
              {paymentMethod === 'google' && <div className={styles.radioCircle}></div>}
            </div>
            <div 
              className={`${styles.paymentOption} ${paymentMethod === 'stripe' ? styles.selected : ''}`}
              onClick={() => setPaymentMethod('stripe')}
            >
               <Image src="/assets/Stripe.png" alt="Stripe" width={30} height={30} />
              <div className={styles.paymentDetails}>
                <span className={styles.paymentName}>Stripe</span>
                <span className={styles.paymentDesc}>Pay with Stripe</span>
              </div>
              {paymentMethod === 'stripe' && <div className={styles.radioCircle}></div>}
            </div>
          </div>

          <div className={styles.promoContainer}>
            <Image src="/assets/ticket.png" alt="Promo" width={24} height={24} className={styles.promoIcon} />
            <span className={styles.promoText}>Apply a promo code</span>
            <button className={styles.applyButton}>Apply</button>
          </div>

          <Link href="/download" className={styles.trialButton}>
            Start Free Trial
          </Link>

          <p className={styles.termsText}>
            By clicking continue you agree to our <br />
            <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a>
          </p>
        </div>
      </main>
    </div>
  );
}
