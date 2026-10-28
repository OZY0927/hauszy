import './globals.css';
import 'leaflet/dist/leaflet.css';
import Header from '../components/Header';
export const metadata={title:{default:'Hauszy — A place for your next chapter',template:'%s · Hauszy'},description:'Discover new launch projects and developer-direct homes in Malaysia with Hauszy.'};
export default function Layout({children}){return <html lang="en-MY" data-scroll-behavior="smooth"><body><Header/>{children}<footer><a className="logo" href="/">hauszy<span>↗</span></a><p>A place for your next chapter.</p><span>Malaysia · Hauszy</span></footer></body></html>}
