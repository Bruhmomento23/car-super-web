import React from 'react';
import styles from '../../styles/LandingPage.module.css';
import NavScrollExample from '../../components/Navbar';


interface Workshop {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
}

const featuredWorkshops: Workshop[] = [
  {
    id: 1,
    name: 'FixMyCar Certified Garage',
    description: 'Expert mechanics for all makes and models.',
    imageUrl: 'https://via.placeholder.com/300x200?text=Workshop+1',
  },
  {
    id: 2,
    name: 'Speedy Repairs',
    description: 'Fast turnaround on oil changes and brakes.',
    imageUrl: 'https://via.placeholder.com/300x200?text=Workshop+2',
  },
  {
    id: 3,
    name: 'Premium Auto Service',
    description: 'Luxury treatment for your vehicle.',
    imageUrl: 'https://via.placeholder.com/300x200?text=Workshop+3',
  },
  {
    id: 4,
    name: 'Budget Auto Care',
    description: 'Affordable rates without compromising quality.',
    imageUrl: 'https://via.placeholder.com/300x200?text=Workshop+4',
  },
];

const LandingPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <NavScrollExample />
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Welcome to Car Super</h1>
          <p>Your one-stop destination for car services, parts and certified workshops.</p>
          <a href="/login" className={styles.ctaButton}>
            Get Started
          </a>
        </div>
      </header>

      <section className={styles.workshopsSection}>
        <h2 className={styles.sectionTitle}>Featured Workshops</h2>
        <div className={styles.cardGrid}>
          {featuredWorkshops.map(w => (
            <div key={w.id} className={styles.card}>
              <img src={w.imageUrl} alt={w.name} className={styles.cardImage} />
              <h3 className={styles.cardTitle}>{w.name}</h3>
              <p className={styles.cardDescription}>{w.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
