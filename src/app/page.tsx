import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome to MyNews</h1>
      <p>Your source for the latest news stories.</p>
      <nav>
        <Link href="/signin">
          Sign In
        </Link>{' '}
        |{' '}
        <Link href="/signup">
          Sign Up
        </Link>
      </nav>
    </div>
  );
}