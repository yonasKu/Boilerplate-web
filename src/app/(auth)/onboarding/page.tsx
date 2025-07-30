'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

const images = [
  { src: '/assets/onboarding-1.png', alt: 'Sproutbook Feature 1' },
  { src: '/assets/onboarding-2.png', alt: 'Sproutbook Feature 2' },
  { src: '/assets/onboarding-3.png', alt: 'Sproutbook Feature 3' },
];

export default function OnboardingPage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.slider}>
        <div
          className={styles.slides}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div className={styles.slide} key={index}>
              <Image
                src={image.src}
                alt={image.alt}
                width={400}
                height={800}
                priority={index === 0}
                style={{ objectFit: 'contain' }}
              />
            </div>
          ))}
        </div>
        <div className={styles.dots}>
          {images.map((_, index) => (
            <span
              key={index}
              className={`${styles.dot} ${currentIndex === index ? styles.active : ''}`}
              onClick={() => setCurrentIndex(index)}
            ></span>
          ))}
        </div>
      </div>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>Welcome<br />To Sproutbook</h1>
          <p className={styles.subtitle}>
            Easily capture everyday moments and turn<br />them into shareable, lasting memories.
          </p>
          <Link href="/signup" legacyBehavior>
            <a className={styles.button}>Get Started</a>
          </Link>
        </div>
      </div>
    </div>
  );
}
