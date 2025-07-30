'use client';

import { useState } from 'react';
import { X, Sprout, EyeOff } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={styles.pageWrapper}>


      <main className={styles.main}>
        <div className={styles.logoContainer}>
          <Image src="/assets/Logo_text_small.png" alt="Sproutbook Logo" width={140} height={40} />
        </div>

        <form className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="email">Email<span>*</span></label>
            <div className={styles.inputWrapper}>
              <Image src="/assets/sms.png" alt="Email" width={20} height={20} className={styles.inputIcon} />
              <input type="email" id="email" placeholder="Email" className={styles.input} />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="password">Password<span>*</span></label>
            <div className={styles.inputWrapper}>
              <Image src="/assets/password-check.png" alt="Password" width={20} height={20} className={styles.inputIcon} />
              <input type={showPassword ? 'text' : 'password'} id="password" placeholder="Password" className={styles.input} />
              <div className={styles.passwordIcon} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} /> : <Image src="/assets/eye.png" alt="Show password" width={20} height={20} />}
              </div>
            </div>
          </div>

          <div className={styles.options}>
            <div className={styles.checkboxContainer}>
              <input type="checkbox" id="remember" className={styles.checkbox} />
              <label htmlFor="remember" className={styles.label}>Remember Me</label>
            </div>
            <Link href="/reset-password" className={styles.forgotPassword}>Forgot Password</Link>
          </div>

          <button type="submit" className={styles.loginButton}>Log In</button>
        </form>

        <div className={styles.divider}>Or</div>

        <div className={styles.socialLogins}>
          <button className={styles.socialButton}>
            <Image src="/assets/Google.png" alt="Google" width={20} height={20} />
            <span>Google</span>
          </button>
          <button className={styles.socialButton}>
            <Image src="/assets/Apple.png" alt="Apple" width={20} height={20} />
            <span>Apple</span>
          </button>
        </div>
      </main>
    </div>
  );
}
