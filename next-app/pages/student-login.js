import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function StudentLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('remembered_email');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }

    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!error && session) {
        router.replace('/student-dashboard');
      }
    };

    checkSession();
  }, [router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(result.error || 'Login failed. Please try again.');
      return;
    }

    if (rememberMe) {
      localStorage.setItem('remembered_email', email);
    } else {
      localStorage.removeItem('remembered_email');
    }

    if (result.session) {
      const { error: sessionError } = await supabase.auth.setSession(result.session);
      if (sessionError) {
        console.error('Session set error:', sessionError);
      }
    }

    router.push('/student-dashboard');
  };

  return (
    <>
      <Head>
        <title>Student Login | NACOS - Thomas Adewumi University</title>
        <meta
          name="description"
          content="Sign in to your NACOS student dashboard to access past questions, timetables, career resources, and academic materials."
        />
      </Head>

      <main style={{ minHeight: '100vh', background: '#f4f9f3' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '24px' }}>
          <header style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
            <div style={{ textAlign: 'center' }}>
              <img src="/assets/img/nacos logo.jpg" alt="NACOS Logo" style={{ maxHeight: 80, marginBottom: 12 }} />
              <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Student Login</h1>
            </div>
          </header>

          <div
            style={{
              background: '#fff',
              borderRadius: 18,
              boxShadow: '0 18px 60px rgba(15,41,22,0.08)',
              padding: 32,
              display: 'grid',
              gap: 24
            }}
          >
            <section>
              <h2 style={{ marginBottom: 10 }}>Sign in</h2>
              <p style={{ marginTop: 0, color: '#4f5e58' }}>
                Enter details to gain access to your dashboard
              </p>
              <p style={{ marginTop: 8 }}>
                Not registered?{' '}
                <Link href="/student-signup" style={{ color: '#1b8c0c', textDecoration: 'underline' }}>
                  Click here to signup.
                </Link>
              </p>
            </section>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 18 }}>
              <div style={{ display: 'grid', gap: 8 }}>
                <label htmlFor="email" style={{ fontWeight: 600 }}>Student Email:</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter student email (e.g., name@st.tau.edu.ng)"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: '1px solid #ddd',
                    fontSize: '1rem'
                  }}
                />
                <small style={{ color: '#6c757d' }}>
                  Use your official TAU student email address
                </small>
              </div>

              <div style={{ display: 'grid', gap: 8, position: 'relative' }}>
                <label htmlFor="password" style={{ fontWeight: 600 }}>Password:</label>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: '1px solid #ddd',
                    fontSize: '1rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#1b8c0c',
                    cursor: 'pointer',
                    fontSize: '0.95rem'
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  id="rememberCheckbox"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: 18, height: 18 }}
                />
                <label htmlFor="rememberCheckbox" style={{ margin: 0, fontSize: '0.95rem' }}>
                  Remember Me
                </label>
              </div>

              <div style={{ textAlign: 'center' }}>
                <Link href="/forgot-password" style={{ color: '#1b8c0c', textDecoration: 'none' }}>
                  Forgot Password?
                </Link>
              </div>

              {error && (
                <p style={{ color: '#9b2c2c', margin: 0, fontWeight: 600 }}>{error}</p>
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
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>

          <footer style={{ marginTop: 32, textAlign: 'center', color: '#6c757d' }}>
            <p>© NACOS - TAU Development Team</p>
          </footer>
        </div>
      </main>
    </>
  );
}
