'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import PrimaryButton from '@/components/PrimaryButton';
import styles from './page.module.css';

const slideData = [
  {
    src: '/assets/onboarding-1.png',
    alt: 'Sproutbook Feature 1',
    title: <>Welcome<br />to Sproutbook</>,
    subtitle: 'Easily capture everyday moments and turn them into shareable, lasting memories.',
  },
  {
    src: '/assets/onboarding-2.png',
    alt: 'AI generated recaps',
    title: <>AI generated<br />shareable recaps</>,
    subtitle: 'Automatically turn your journal entries into weekly and monthly recaps to share with family.',
  },
  {
    src: '/assets/onboarding-3.png',
    alt: 'Search for memories',
    title: <>Easily search for<br />important memories</>,
    subtitle: 'Easily capture everyday moments and turn them into shareable, lasting memories.',
  },
];

export default function OnboardingPage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slideData.length);
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
          {slideData.map((slide, index) => (
            <div className={styles.slide} key={index}>
              <Image
                src={slide.src}
                alt={slide.alt}
                width={400}
                height={800}
                priority={index === 0}
                style={{ objectFit: 'contain' }}
              />
            </div>
          ))}
        </div>
        <div className={styles.dots}>
          {slideData.map((_, index) => (
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
          <div className={styles.textContentWrapper}>
            <div
              className={styles.textSlides}
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {slideData.map((slide, index) => (
                <div className={styles.textContent} key={index}>
                  <h1 className={styles.title}>{slide.title}</h1>
                  <p className={styles.subtitle}>{slide.subtitle}</p>
                </div>
              ))}
            </div>
          </div>
          <PrimaryButton href="/signup">Get Started</PrimaryButton>
        </div>
      </div>
    </div>
  );
}
