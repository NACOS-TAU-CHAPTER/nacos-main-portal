import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        router.push('/student-login');
        return;
      }
      setSession(session);
      setLoading(false);
    };
    getSession();
  }, [router]);

  if (loading) return <div className="page-shell"><div className="card"><p>Loading dashboard...</p></div></div>;

  return (
    <main className="page-shell">
      <div className="card">
        <h1>Student Dashboard</h1>
        <p>Welcome, {session.user.email}</p>
        <button onClick={async () => {
          await supabase.auth.signOut();
          router.push('/student-login');
        }}>
          Sign Out
        </button>
      </div>
    </main>
  );
}
