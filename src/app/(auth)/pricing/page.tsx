'use client';

import { useState } from 'react';
import { Check, Star } from 'lucide-react';
import Image from 'next/image';
import styles from './page.module.css';


export default function PricingPage() {
  const [showPlans, setShowPlans] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('annual');
  const [paymentMethod, setPaymentMethod] = useState<'google' | 'apple'>('google');

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
            <div className={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} fill="#f59e0b" strokeWidth={0} size={20} />
              ))}
            </div>
            <p className={styles.testimonialText}>
              “This app made it so easy to capture all the precious early memories with my baby”
            </p>
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

          <div className={styles.pricingInfo}>
            <p className={styles.price}>Get 10 days free, then just $3.99/month</p>
            <p className={styles.billingCycle}>(billed $48/year)</p>
            <a href="#" className={styles.seeAllPlans} onClick={(e) => { e.preventDefault(); setShowPlans(!showPlans); }}>
              {showPlans ? 'Hide plans' : 'See all plans'}
            </a>
          </div>

          {showPlans && (
            <div className={styles.planSelector}>
              <div className={`${styles.planOption} ${selectedPlan === 'annual' ? styles.selected : ''}`} onClick={() => setSelectedPlan('annual')}>
                <span className={styles.popularBadge}>Most popular</span>
                <div className={styles.innerPlanBox}>
                  <div className={styles.radioCircle}>
                    {selectedPlan === 'annual' && <Check size={16} strokeWidth={3} />}
                  </div>
                  <div className={styles.planDetails}>
                    <span className={styles.planPrice}>$3.99/month</span>
                    <span className={styles.planBilling}>Billed at $48/year</span>
                  </div>
                  <span className={styles.saveBadge}>Save 33%</span>
                </div>
              </div>
              <div className={`${styles.planOption} ${selectedPlan === 'monthly' ? styles.selected : ''}`} onClick={() => setSelectedPlan('monthly')}>
                <div className={styles.radioCircle}>
                  {selectedPlan === 'monthly' && <Check size={16} strokeWidth={3} />}
                </div>
                <div className={styles.planDetails}>
                  <span className={styles.planPrice}>$5.99/month</span>
                  <span className={styles.planBilling}>Billed monthly</span>
                </div>
              </div>
            </div>
          )}

          <div className={styles.buttonsContainer}>
            <button className={styles.paymentButton}>
              <span>Continue with</span>
              <div className={styles.paymentIconContainer}>
                <Image 
                  src={paymentMethod === 'google' ? '/assets/Google.png' : '/assets/Apple.png'}
                  alt={paymentMethod === 'google' ? 'Pay' : 'Pay'}
                  layout="fill"
                  objectFit="contain"
                />
              </div>
              {paymentMethod === 'google' ? <span>Pay</span> : <span>Pay</span>}
            </button>
          </div>

          <a href="#" className={styles.moreWaysToPay} onClick={(e) => {
            e.preventDefault();
            setPaymentMethod(paymentMethod === 'google' ? 'apple' : 'google');
          }}>
            More ways to pay
          </a>

          <div className={styles.footerLinks}>
            <p>Get 10 days free before being charged</p>
            <p>Have a promo code? <a href="#">Redeem code</a></p>
          </div>
        </div>
      </main>
    </div>
  );
}
