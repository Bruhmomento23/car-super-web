import React, { useState } from 'react';
import styles from '../../styles/LoginPage.module.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    console.log('Login submitted', { email, password });
  };

  return (
    <div className={styles.container}>
      {/* LEFT PANEL - illustration */}
      <div
        className={styles.imagePane}
        style={{ backgroundImage: 'url(/assets/illustration.png)' }}
      />

      {/* RIGHT PANEL - login form */}
      <div className={styles.formPane}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.logo}>🚗</div>

          <h2 className={styles.title}>Welcome back to Car Super</h2>
          <p className={styles.subtitle}>Sign in to continue to your account</p>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.field}>
            <label htmlFor="email">Email address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className={styles.linksRow}>
            <a href="#" className={styles.forgotLink}>
              Forgot password?
            </a>
          </div>

          <button type="submit" className={styles.button}>
            Log In
          </button>

          <button type="button" className={styles.outlineButton}>
            Create account
          </button>
        </form>

        {/* end form */}
      </div>
    </div>
  );
};

export default LoginPage;