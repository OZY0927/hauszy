import Link from 'next/link';
export default function NotFound(){return <main className="property-missing"><h1>This page isn’t available.</h1><p>The project may no longer be published.</p><Link className="text-link" href="/projects">Explore projects ↗</Link></main>}
