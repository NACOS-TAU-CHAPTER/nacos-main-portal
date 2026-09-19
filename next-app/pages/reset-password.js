import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function ResetPassword() {
  const router = useRouter();
  const [status, setStatus] = useState('Loading reset page...');
  const [statusType, setStatusType] = useState('info');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [canReset, setCanReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const { access_token, error_description, error, type } = router.query;

    if (error_description || error) {
      setStatusType('error');
      setStatus(error_description || error || 'Unable to verify reset link.');
      setCanReset(false);
      return;
    }

    if (!access_token || type !== 'recovery') {
      setStatusType('error');
      setStatus('Invalid or expired reset link. Please request a new password reset.');
      setCanReset(false);
      return;
    }

    setStatusType('info');
    setStatus('Your link is valid. Enter a new password to complete the reset.');
    setCanReset(true);
  }, [router.query]);

  const handleReset = async (event) => {
    event.preventDefault();
    setStatus('');
    setStatusType('info');

    if (!newPassword || !confirmPassword) {
      setStatusType('error');
      setStatus('Please enter and confirm your new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusType('error');
      setStatus('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setStatusType('error');
      setStatus('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      setStatusType('error');
      setStatus(error.message || 'Failed to reset password. Please try again.');
      return;
    }

    setSuccess(true);
    setStatusType('success');
    setStatus('Password reset successfully! You can now sign in with your new password.');
  };

  return (
    <>
      <Head>
        <title>Password Reset | NACOS - Thomas Adewumi University</title>
        <meta
          name="description"
          content="Reset your NACOS student password using the recovery link sent to your email."
        />
      </Head>

      <main style={{ minHeight: '100vh', background: '#f4f9f3' }}>
        <div style={{ maxWidth: 780, margin: '0 auto', padding: '24px' }}>
          <section
            style={{
              background: '#ffffff',
              borderRadius: 18,
              boxShadow: '0 18px 60px rgba(15,41,22,0.08)',
              padding: 32,
              marginTop: 48
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <h1 style={{ margin: 0, fontSize: '2rem' }}>Password Reset</h1>
              <p style={{ marginTop: 10, color: '#4f5e58' }}>
                Use the secure link from your email to set a new password.
              </p>
            </div>

            <div
              style={{
                padding: '18px 22px',
                borderRadius: 14,
                marginBottom: 24,
                background: statusType === 'error' ? '#f8d7da' : statusType === 'success' ? '#d1e7dd' : '#f7fbf6',
                border: statusType === 'error' ? '1px solid #f5c2c7' : statusType === 'success' ? '1px solid #badbcc' : '1px solid #d4ecd6',
                color: statusType === 'error' ? '#842029' : statusType === 'success' ? '#0f5132' : '#1f4723'
              }}
            >
              {status}
            </div>

            {canReset && !success && (
              <form onSubmit={handleReset} style={{ display: 'grid', gap: 18 }}>
                <label style={{ display: 'grid', gap: 8 }}>
                  <span style={{ fontWeight: 600 }}>New Password</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd', width: '100%' }}
                  />
                </label>

                <label style={{ display: 'grid', gap: 8 }}>
                  <span style={{ fontWeight: 600 }}>Confirm Password</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd', width: '100%' }}
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: 12,
                    border: 'none',
                    background: '#1b8c0c',
                    color: '#fff',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  {loading ? 'Saving password...' : 'Save New Password'}
                </button>
              </form>
            )}

            {success && (
              <div style={{ display: 'grid', gap: 12, textAlign: 'center' }}>
                <Link href="/student-login" style={{ color: '#1b8c0c', textDecoration: 'underline' }}>
                  Return to login
                </Link>
              </div>
            )}

            {!canReset && (
              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <Link href="/forgot-password" style={{ color: '#1b8c0c', textDecoration: 'underline' }}>
                  Request a new reset link
                </Link>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
