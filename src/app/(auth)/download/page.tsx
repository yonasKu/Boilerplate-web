import Link from 'next/link';
import Image from 'next/image';
import { X } from 'lucide-react';
import styles from './page.module.css';

export default function DownloadPage() {
  return (
    <div className={styles.pageWrapper}>
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.logoContainer}>
            <Image src="/assets/Logo_text.png" alt="Sproutbook Logo" width={240} height={60} />
          </div>
          <p className={styles.subText}>
            You're almost there. Download the mobile app to start journaling.
          </p>
          <Link href="/login" className={styles.downloadButton}>
            Download app
          </Link>
        </div>
      </main>
    </div>
  );
}
