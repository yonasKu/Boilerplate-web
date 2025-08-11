import Image from 'next/image';
import styles from './SecondaryButton.module.css';

interface SecondaryButtonProps {
  provider: 'apple' | 'google';
  onClick: () => void;
}

const providerAssets = {
  apple: {
    logo: '/assets/Apple.png',
    name: 'Apple',
  },
  google: {
    logo: '/assets/Google.png',
    name: 'Google',
  },
};

const SecondaryButton: React.FC<SecondaryButtonProps> = ({ provider, onClick }) => {
  const { logo, name } = providerAssets[provider];

  return (
    <button className={styles.button} onClick={onClick}>
      <Image src={logo} alt={`${name} logo`} width={20} height={20} />
      <span>Continue with {name}</span>
    </button>
  );
};

export default SecondaryButton;
