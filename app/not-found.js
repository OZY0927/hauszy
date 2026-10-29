import Link from 'next/link';
import Icon from '../components/Icon';
export default function NotFound(){return <main className="property-missing"><h1>This page isn’t available.</h1><p>The project may no longer be published.</p><Link className="text-link" href="/projects">Explore projects <Icon name="arrowRight"/></Link></main>}
