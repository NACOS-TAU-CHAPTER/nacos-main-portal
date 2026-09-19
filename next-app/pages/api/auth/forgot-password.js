import { supabaseServer } from '../../../lib/supabaseServerClient';
import { validateEmail } from '../../../lib/validators';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    const { error } = await supabaseServer.auth.resetPasswordForEmail(email.toLowerCase(), {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
    });

    if (error) {
      console.error('Password reset error:', error);
      return res.status(200).json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link.'
      });
    }

    res.json({ success: true, message: 'Password reset link sent to your email.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to send reset link. Please try again.' });
  }
}
