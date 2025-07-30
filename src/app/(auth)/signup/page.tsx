'use client';

import { useState } from 'react';
import { X, Sprout, EyeOff } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={styles.pageWrapper}>


      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Create your account</h1>

          <div className={styles.socialButtons}>
            <button className={styles.socialButton}>
              <Image src="/assets/Google.png" alt="Google" width={20} height={20} />
              <span>Google</span>
            </button>
            <button className={styles.socialButton}>
              <Image src="/assets/Apple.png" alt="Apple" width={20} height={20} />
              <span>Apple</span>
            </button>
          </div>

          <div className={styles.separator}>Or</div>

          <form className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>Name*</label>
              <div className={styles.inputContainer}>
                <Image src="/assets/user.png" alt="Full Name" width={20} height={20} className={styles.inputIcon} />
                <input id="name" name="name" type="text" placeholder="Name" className={styles.input} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>Email*</label>
              <div className={styles.inputContainer}>
                <Image src="/assets/sms.png" alt="Email" width={20} height={20} className={styles.inputIcon} />
                <input id="email" name="email" type="email" placeholder="Email" className={styles.input} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>Password*</label>
              <div className={styles.inputContainer}>
                <Image src="/assets/password-check.png" alt="Password" width={20} height={20} className={styles.inputIcon} />
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Password" className={styles.input} />
                <div className={styles.passwordToggle} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} /> : <Image src="/assets/eye.png" alt="Show password" width={20} height={20} />}
                </div>
              </div>
            </div>

            <Link href="/success" className={styles.button}>
              Continue
            </Link>
          </form>

          <div className={styles.footer}>
            <p className={styles.terms}>
              By clicking continue you agree to our <Link href="/terms">Terms of Use</Link> and <Link href="/privacy">Privacy Policy</Link>
            </p>
            <p className={styles.signIn}>
              Already have an account? <Link href="/login">Sign In</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
