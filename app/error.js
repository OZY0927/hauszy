'use client';
import Icon from '../components/Icon';
export default function ErrorPage({reset}){return <main className="property-missing"><h1>We couldn’t load this page.</h1><p>Please check your connection and try again.</p><button className="search-btn" onClick={reset}><Icon name="refresh"/> Try again</button></main>}
