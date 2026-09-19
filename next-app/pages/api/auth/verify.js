import { getUserFromRequest } from '../../../lib/authHelpers';
import { supabaseServer } from '../../../lib/supabaseServerClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user, error } = await getUserFromRequest(req);
  if (error) {
    return res.status(401).json({ error });
  }

  const { data: student, error: studentError } = await supabaseServer
    .from('students')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (studentError && studentError.code !== 'PGRST116') {
    console.error('Student profile fetch error:', studentError);
  }

  res.json({
    authenticated: true,
    user: { id: user.id, email: user.email, role: 'student' },
    student: student || null
  });
}
