import { getUserFromRequest } from '../../../lib/authHelpers';
import { supabaseServer } from '../../../lib/supabaseServerClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user, error } = await getUserFromRequest(req);
  if (error) {
    return res.status(401).json({ error });
  }

  try {
    await supabaseServer.auth.signOut();
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Logout failed. Please try again.' });
  }
}
