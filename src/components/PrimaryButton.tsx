import Link from 'next/link';
import styles from './PrimaryButton.module.css';

interface PrimaryButtonProps {
  href?: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ href, children, onClick, type = 'button' }) => {
  if (href && !onClick) {
    return (
      <Link href={href} legacyBehavior>
        <a className={styles.button}>{children}</a>
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={styles.button}>
      {children}
    </button>
  );
};

export default PrimaryButton;
