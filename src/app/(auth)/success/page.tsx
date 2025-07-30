'use client';

import { Check, X, Sprout } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

export default function SuccessPage() {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.confetti}></div>


      <main className={styles.main}>
        <div className={styles.content}>
            <div className={styles.successIconContainer}>
                <Check size={60} color="#ffffff" strokeWidth={3} />
            </div>
            <h1 className={styles.title}>Account created successfully</h1>
        </div>
        
        <Link href="/pricing" className={styles.button}>
          Continue
        </Link>
      </main>
    </div>
  );
}
