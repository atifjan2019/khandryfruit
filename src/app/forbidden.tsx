import Link from "next/link";
export default function ForbiddenPage() { return <main className="admin-interrupt"><p className="eyebrow">403</p><h1>Access not permitted</h1><p>Your account does not have permission to open this administration area.</p><Link className="button" href="/de">Return to storefront</Link></main>; }
