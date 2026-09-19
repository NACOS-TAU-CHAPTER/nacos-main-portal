import Link from 'next/link';

export default function Home() {
  return (
    <main className="page-shell">
      <div className="card">
        <h1>Welcome to NACOS</h1>
        <p>Move your student portal to a modern Next.js + Supabase experience.</p>
        <div className="button-row">
          <Link className="button" href="/student-login">Student Login</Link>
          <Link className="button secondary" href="/student-signup">Student Signup</Link>
        </div>
      </div>
    </main>
  );
}
