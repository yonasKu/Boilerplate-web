import Image from 'next/image';
import styles from './page.module.css';
import PrimaryButton from '@/components/PrimaryButton';

export default function DownloadPage() {
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
            <PrimaryButton>
                Download app
            </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

