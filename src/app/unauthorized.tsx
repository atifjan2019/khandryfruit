import Link from "next/link";
export default function UnauthorizedPage() { return <main className="admin-interrupt"><p className="eyebrow">401</p><h1>Sign in required</h1><p>Please sign in with an authorised staff account to continue.</p><Link className="button" href="/de/sign-in?callbackURL=/admin">Sign in</Link></main>; }
