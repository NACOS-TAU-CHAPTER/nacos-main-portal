import Head from 'next/head';
import { useState } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setStatus('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Unable to send password reset link.');
      }

      setStatus(result.message || 'If your email is registered, you will receive a password reset link.');
      setEmail('');
    } catch (err) {
      console.error('Forgot password submit error:', err);
      setError(err.message || 'Unable to send password reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Forgot Password | NACOS - Thomas Adewumi University</title>
        <meta
          name="description"
          content="Request a password reset link for your NACOS student account."
        />
      </Head>

      <main style={{ minHeight: '100vh', background: '#f4f9f3' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px' }}>
          <section
            style={{
              background: '#fff',
              borderRadius: 18,
              boxShadow: '0 18px 60px rgba(15,41,22,0.08)',
              padding: 32,
              marginTop: 48
            }}
          >
            <h1 style={{ marginBottom: 12 }}>Forgot Password</h1>
            <p style={{ marginTop: 0, color: '#4f5e58' }}>
              Enter the email address linked to your NACOS account and we will send you a reset link.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 18, marginTop: 24 }}>
              <label style={{ display: 'grid', gap: 8 }}>
                <span style={{ fontWeight: 600 }}>Email Address</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@st.tau.edu.ng"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: '1px solid #ddd',
                    fontSize: '1rem'
                  }}
                />
              </label>

              {error && (
                <div
                  style={{
                    padding: '14px 16px',
                    background: '#fff1f0',
                    borderRadius: 12,
                    border: '1px solid #f5c2c7',
                    color: '#842029'
                  }}
                >
                  {error}
                </div>
              )}

              {status && (
                <div
                  style={{
                    padding: '14px 16px',
                    background: '#f7fbf6',
                    borderRadius: 12,
                    border: '1px solid #d4ecd6',
                    color: '#1f4723'
                  }}
                >
                  {status}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: 12,
                  border: 'none',
                  background: '#1b8c0c',
                  color: 'white',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                {loading ? 'Sending reset link...' : 'Send Reset Link'}
              </button>
            </form>

            <p style={{ marginTop: 20, color: '#6c757d' }}>
              Already have a reset link?{' '}
              <a href="/reset-password" style={{ color: '#1b8c0c', textDecoration: 'underline' }}>
                Continue to reset password.
              </a>
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
