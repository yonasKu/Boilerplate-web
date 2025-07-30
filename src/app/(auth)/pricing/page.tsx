'use client';

import { useState } from 'react';
import { X, Sprout, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState('annual');

  return (
    <div className={styles.pageWrapper}>


      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.testimonialCard}>
            <div className={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} fill="#f59e0b" strokeWidth={0} />
              ))}
            </div>
            <p className={styles.testimonialText}>
              “This app made it so easy to capture all the precious early memories with my baby”
            </p>
            <div className={styles.testimonialAuthor}>
              <Image
                src="/assets/sampleProfile.png"
                alt="Alexandra W"
                width={40}
                height={40}
                className={styles.authorImage}
              />
              <div>
                <p className={styles.authorName}>Alexandra W</p>
                <p className={styles.authorLocation}>Carlsbad, CA</p>
              </div>
            </div>
          </div>

          <a href="#" className={styles.joinLink}>Join today for free!</a>

          <div className={styles.planOptions}>
            <div 
              className={`${styles.planOption} ${selectedPlan === 'monthly' ? styles.selected : ''}`}
              onClick={() => setSelectedPlan('monthly')}
            >
              <div className={styles.planContent}>
                <div className={styles.planDetails}>
                  <div className={styles.radioCircle}>
                    {selectedPlan === 'monthly' && <Image src="/assets/Checked_BIG.png" alt="Selected" width={20} height={20} />}
                  </div>
                  <div>
                    <div className={styles.planName}>Monthly</div>
                    <div className={styles.planPrice}>$4.99/month</div>
                  </div>
                </div>
              </div>
            </div>
            <div 
              className={`${styles.planOption} ${selectedPlan === 'annual' ? styles.selected : ''}`}
              onClick={() => setSelectedPlan('annual')}
            >
              <div className={styles.planContent}>
                <div className={styles.planDetails}>
                  <div className={styles.radioCircle}>
                    {selectedPlan === 'annual' && <Image src="/assets/Checked_BIG.png" alt="Selected" width={20} height={20} />}
                  </div>
                  <div>
                    <div className={styles.planName}>Annual</div>
                    <div className={styles.planPrice}>$44.99/year</div>
                  </div>
                </div>
                <div className={styles.popularBadge}>Most Popular</div>
              </div>
            </div>
          </div>

          <div className={styles.features}>
            <p className={styles.featuresTitle}>What's included</p>
            <ul className={styles.featureList}>
              <li className={styles.featureItem}><Image src="/assets/check.png" alt="Check" width={20} height={20} className={styles.featureIcon} /><p>Effortless photo & memory journaling</p></li>
              <li className={styles.featureItem}><Image src="/assets/check.png" alt="Check" width={20} height={20} className={styles.featureIcon} /><p>AI powered, shareable recaps</p></li>
              <li className={styles.featureItem}><Image src="/assets/check.png" alt="Check" width={20} height={20} className={styles.featureIcon} /><p>Personalized reminders, family access, & more</p></li>
            </ul>
          </div>

          <Link href="/checkout" className={styles.trialButton}>
            Start Free Trial
          </Link>

          <p className={styles.trialDisclaimer}>Get 10 days free before being charged</p>
        </div>
      </main>
    </div>
  );
}
