import './globals.css';
import 'leaflet/dist/leaflet.css';
import Header from '../components/Header';
import Motion from '../components/Motion';
import Footer from '../components/Footer';
export const metadata={title:{default:'Hauszy — A place for your next chapter',template:'%s · Hauszy'},description:'Discover new launch projects and developer-direct homes in Malaysia with Hauszy.'};
export default function Layout({children}){return <html lang="en-MY" data-scroll-behavior="smooth"><body><Header/>{children}<Motion/><Footer/></body></html>}
