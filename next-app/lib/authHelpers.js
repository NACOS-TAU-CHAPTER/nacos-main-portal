import { supabaseServer } from './supabaseServerClient';

export function getBearerToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
}

export async function getUserFromRequest(req) {
  const token = getBearerToken(req);
  if (!token) return { error: 'Authentication required' };

  const { data: { user }, error } = await supabaseServer.auth.getUser(token);
  if (error || !user) {
    return { error: 'Invalid or expired token' };
  }

  return { user };
}
