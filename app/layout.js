import './globals.css';
import 'leaflet/dist/leaflet.css';
import './typography.css';
import './home-motion.css';
import './catalog.css';
import Header from '../components/Header';
import SiteIntro from '../components/SiteIntro';
import Motion from '../components/Motion';
import Footer from '../components/Footer';
import GoogleAnalytics from '../components/GoogleAnalytics';
import ProjectActivity from '../components/ProjectActivity';
import ImageGuard from '../components/ImageGuard';
import BackgroundMusic from '../components/SiteBackgroundMusic';
import {getSiteUrl} from '../lib/seo';
const siteUrl=getSiteUrl();
export const metadata={...(siteUrl?{metadataBase:new URL(siteUrl)}:{}),...(process.env.GOOGLE_SITE_VERIFICATION?{verification:{google:process.env.GOOGLE_SITE_VERIFICATION}}:{}),title:{default:'Hauszy — Penang Property & New Launches',template:'%s · Hauszy'},description:'Explore Penang properties with Hauszy. Compare homes, commercial spaces and industrial projects across Penang Island and Seberang Perai.'};
export default function Layout({children}){return <html lang="en-MY" data-scroll-behavior="smooth"><body><SiteIntro/><Header/>{children}<Motion/><Footer/><GoogleAnalytics/><ProjectActivity/><ImageGuard/><BackgroundMusic/></body></html>}
