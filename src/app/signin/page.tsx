import Link from 'next/link';

export default function SignIn() {
    return (
        <div className="container">
            <h1>Sign In</h1>
            <form>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input id="email" type="email" name="email" required />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input id="password" type="password" name="password" required />
                </div>
                <button type="submit">Sign In</button>
            </form>
            <p>
                Don't have an account?{' '}
                <Link href="/signup">
                    Sign Up
                </Link>
            </p>
        </div>
    );
}
