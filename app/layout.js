import './globals.css';
import 'leaflet/dist/leaflet.css';
import Header from '../components/Header';
import Motion from '../components/Motion';
import Footer from '../components/Footer';
import GoogleAnalytics from '../components/GoogleAnalytics';
import {getSiteUrl} from '../lib/seo';
const siteUrl=getSiteUrl();
export const metadata={...(siteUrl?{metadataBase:new URL(siteUrl)}:{}),...(process.env.GOOGLE_SITE_VERIFICATION?{verification:{google:process.env.GOOGLE_SITE_VERIFICATION}}:{}),title:{default:'Hauszy — A place for your next chapter',template:'%s · Hauszy'},description:'Discover new launch property projects and homes in Malaysia with Hauszy.'};
export default function Layout({children}){return <html lang="en-MY" data-scroll-behavior="smooth"><body><Header/>{children}<Motion/><Footer/><GoogleAnalytics/></body></html>}
