"use client";

import React from 'react';
import Image from 'next/image';
import styles from './page.module.css';
import PrimaryButton from '@/components/PrimaryButton';

export default function DownloadPage() {
  const ANDROID_PACKAGE = process.env.NEXT_PUBLIC_ANDROID_PACKAGE || 'com.palex.sproutbook';
  const IOS_APP_ID = process.env.NEXT_PUBLIC_APPLE_APP_ID || '';
  const APP_STORE_COUNTRY = process.env.NEXT_PUBLIC_APP_STORE_COUNTRY || 'us';

  const PLAY_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
  const APP_STORE_URL = IOS_APP_ID ? `https://apps.apple.com/${APP_STORE_COUNTRY}/app/id${IOS_APP_ID}` : '';

  function resolveStoreUrl(): string {
    if (typeof navigator === 'undefined') return PLAY_URL;
    const ua = navigator.userAgent || '';
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    if (isIOS && APP_STORE_URL) return APP_STORE_URL;
    if (isAndroid) return PLAY_URL;
    return PLAY_URL;
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Image
          src="/assets/Logo_with_text.png"
          alt="Sproutbook Logo"
          width={200}
          height={200}
        />
        <p className={styles.subtitle}>
          You're almost there. Download the mobile app to start journaling.
        </p>
        <div className={styles.buttonContainer}>
            <PrimaryButton onClick={() => { const url = resolveStoreUrl(); window.location.href = url; }}>
                Download app
            </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

