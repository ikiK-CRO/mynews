import Link from 'next/link';

export default function SignUp() {
    return (
        <div style={{ padding: '2rem' }}>
            <h1>Sign Up</h1>
            <form>
                <div>
                    <label htmlFor="firstName">First Name:</label>
                    <input id="firstName" type="text" name="firstName" required />
                </div>
                <div>
                    <label htmlFor="lastName">Last Name:</label>
                    <input id="lastName" type="text" name="lastName" required />
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input id="email" type="email" name="email" required />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input id="password" type="password" name="password" required />
                </div>
                <button type="submit">Sign Up</button>
            </form>
            <p>
                Already have an account?{' '}
                <Link href="/signin">
                    Sign In
                </Link>
            </p>
        </div>
    );
}
