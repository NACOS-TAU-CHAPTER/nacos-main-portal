import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

const validateEmail = (email) => {
  const trimmed = email.trim().toLowerCase();
  return /^[a-zA-Z0-9._%+-]+@(st\.)?tau\.edu\.ng$/.test(trimmed);
};

const validateMatricNumber = (matric) => {
  const trimmed = matric.trim().toUpperCase();
  const patterns = [
    /^TAU\/[A-Z]{2,4}\/\d{2,4}\/\d{3,4}$/, 
    /^[A-Z]{2,4}\/\d{2,4}\/\d{3,4}$/, 
    /^\d{2}\/\d{2}[A-Z]{2,4}\d{3,4}$/
  ];
  return patterns.some((pattern) => pattern.test(trimmed));
};

const validatePasswordStrength = (password) => {
  if (!password || password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }
  const strength = [/[a-z]/, /[A-Z]/, /[0-9]/, /[$@#&!]/].reduce(
    (count, regex) => count + (regex.test(password) ? 1 : 0),
    0
  );
  if (strength < 2) {
    return { valid: false, message: 'Password is too weak' };
  }
  return { valid: true, message: '' };
};

export default function StudentSignup() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [matricNo, setMatricNo] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter both first and last names.');
      return;
    }

    if (!validateMatricNumber(matricNo)) {
      setError('Enter a valid matric number, such as TAU/CS/20/001.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Use your valid TAU student email (@st.tau.edu.ng or @tau.edu.ng).');
      return;
    }

    const passwordResult = validatePasswordStrength(password);
    if (!passwordResult.valid) {
      setError(passwordResult.message);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!acceptedTerms) {
      setError('You must agree to the terms and conditions.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          matricNo: matricNo.trim(),
          department
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Registration failed. Please try again.');
      }

      if (result.session) {
        const { error: sessionError } = await supabase.auth.setSession(result.session);
        if (sessionError) {
          console.error('Session set error:', sessionError);
        }
      }

      setMessage('Registration successful. Redirecting to your dashboard...');
      router.push('/student-dashboard');
    } catch (submitError) {
      console.error('Signup submit error:', submitError);
      setError(submitError.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Student Sign Up | NACOS - Thomas Adewumi University</title>
        <meta
          name="description"
          content="Create a student account for NACOS TAU to access the student dashboard, past questions, timetables, and more."
        />
      </Head>

      <main style={{ minHeight: '100vh', background: '#f4f9f3' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px' }}>
          <header style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
            <div style={{ textAlign: 'center' }}>
              <img src="/assets/img/tau_logo-removebg-preview.png" alt="TAU Logo" style={{ maxHeight: 80, marginBottom: 12 }} />
              <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Student Registration</h1>
              <p style={{ marginTop: 8, color: '#4f5e58' }}>
                Register to access your NACOS student dashboard and member resources.
              </p>
            </div>
          </header>

          <div
            style={{
              background: '#ffffff',
              borderRadius: 18,
              boxShadow: '0 18px 60px rgba(15,41,22,0.08)',
              padding: 32,
              display: 'grid',
              gap: 24
            }}
          >
            <section>
              <h2 style={{ marginBottom: 8 }}>Sign Up</h2>
              <p style={{ marginTop: 0, color: '#4f5e58' }}>
                Enter details to register on the platform.
              </p>
              <p style={{ marginTop: 8 }}>
                Already registered?{' '}
                <Link href="/student-login" style={{ color: '#1b8c0c', textDecoration: 'underline' }}>
                  Sign in here.
                </Link>
              </p>
            </section>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 20 }}>
              <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                <label style={{ display: 'grid', gap: 8 }}>
                  <span style={{ fontWeight: 600 }}>First Name</span>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                    required
                    style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd', width: '100%' }}
                  />
                </label>
                <label style={{ display: 'grid', gap: 8 }}>
                  <span style={{ fontWeight: 600 }}>Last Name</span>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                    required
                    style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd', width: '100%' }}
                  />
                </label>
              </div>

              <label style={{ display: 'grid', gap: 8 }}>
                <span style={{ fontWeight: 600 }}>Matric Number</span>
                <input
                  type="text"
                  value={matricNo}
                  onChange={(e) => setMatricNo(e.target.value)}
                  placeholder="e.g. TAU/CS/20/001"
                  required
                  style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd' }}
                />
                <small style={{ color: '#6c757d' }}>Format: TAU/CS/20/001 or 23/10MSC014</small>
              </label>

              <label style={{ display: 'grid', gap: 8 }}>
                <span style={{ fontWeight: 600 }}>Department</span>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd' }}
                >
                  <option value="">Select your department</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Cyber Security">Cyber Security</option>
                </select>
              </label>

              <label style={{ display: 'grid', gap: 8 }}>
                <span style={{ fontWeight: 600 }}>School Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@st.tau.edu.ng"
                  required
                  style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd' }}
                />
                <small style={{ color: '#6c757d' }}>Use your official TAU email address.</small>
              </label>

              <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                <label style={{ display: 'grid', gap: 8, position: 'relative' }}>
                  <span style={{ fontWeight: 600 }}>Password</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={{
                      position: 'absolute',
                      right: 16,
                      top: 34,
                      background: 'transparent',
                      border: 'none',
                      color: '#1b8c0c',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </label>

                <label style={{ display: 'grid', gap: 8, position: 'relative' }}>
                  <span style={{ fontWeight: 600 }}>Confirm Password</span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    required
                    style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    style={{
                      position: 'absolute',
                      right: 16,
                      top: 34,
                      background: 'transparent',
                      border: 'none',
                      color: '#1b8c0c',
                      cursor: 'pointer'
                    }}
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </label>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  style={{ width: 18, height: 18 }}
                />
                <span style={{ fontSize: '0.95rem' }}>
                  I agree to the{' '}
                  <Link href="/terms-conditions" style={{ color: '#1b8c0c', textDecoration: 'underline' }}>
                    Terms and Conditions
                  </Link>
                </span>
              </label>

              {error && (
                <p style={{ margin: 0, color: '#9b2c2c', fontWeight: 600 }}>{error}</p>
              )}
              {message && (
                <p style={{ margin: 0, color: '#1b8c0c', fontWeight: 600 }}>{message}</p>
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
                {loading ? 'Creating account...' : 'Sign Up'}
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
