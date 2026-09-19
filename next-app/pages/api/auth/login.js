import { supabaseServer } from '../../../lib/supabaseServerClient';
import { validateEmail } from '../../../lib/validators';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (!validateEmail(normalizedEmail)) {
      return res.status(400).json({ error: 'Please use a valid TAU student email' });
    }

    const { data, error } = await supabaseServer.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });

    if (error) {
      console.error('Login error:', error);
      return res.status(401).json({ error: 'Invalid email or password. Please try again.' });
    }

    const { data: studentProfile, error: profileError } = await supabaseServer
      .from('students')
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile fetch error:', profileError);
    }

    if (studentProfile?.status === 'rejected') {
      return res.status(403).json({ error: 'Your account registration was rejected. Please contact support.' });
    }

    if (studentProfile?.status === 'banned') {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: { id: data.user.id, email: data.user.email, student: studentProfile || null },
      session: data.session
    });
  } catch (error) {
    console.error('Login route error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
}
