import Link from 'next/link';
import styles from './PrimaryButton.module.css';

interface PrimaryButtonProps {
  href?: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ href, children, onClick, type = 'button', fullWidth = false }) => {
  const buttonClasses = `${styles.button} ${fullWidth ? styles.fullWidth : ''}`.trim();
  if (href && !onClick) {
    return (
      <Link href={href} legacyBehavior>
        <a className={buttonClasses}>{children}</a>
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={buttonClasses}>
      {children}
    </button>
  );
};

export default PrimaryButton;
