import Link from 'next/link';
import Icon from './Icon';
import SocialIcon,{SOCIALS} from './SocialIcon';
import {getProfile} from '../lib/firestore-server';
import {safeUrl} from '../lib/project';
const TOOLS=[['/tools/loan-calculator','calculator','Loan Calculator'],['/tools/upfront-cash-calculator','wallet','Upfront Cash Calculator'],['/tools/loan-eligibility','shieldCheck','Loan Eligibility (DSR)'],['/tools/roi-calculator','trendingUp','ROI Calculator']];
// Contact details and social links come from siteContent/about, edited in the admin "About me" section.
export default async function Footer(){let p={};try{p=await getProfile()||{}}catch{}
  const social=SOCIALS.filter(([key])=>safeUrl(p.social?.[key])),phone=String(p.phone||'').trim(),whatsapp=String(p.whatsapp||'').replace(/\D/g,''),email=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email||'')?p.email:'',ren=String(p.ren||'').trim();
  const contact=[phone&&{icon:'phone',label:phone,href:'tel:'+phone.replace(/[^\d+]/g,'')},whatsapp&&{icon:'message',label:'Chat on WhatsApp',href:'https://wa.me/'+whatsapp,external:true},email&&{icon:'mail',label:email,href:'mailto:'+email},p.serviceArea&&{icon:'mapPin',label:p.serviceArea}].filter(Boolean);
  return <footer className="site-footer"><div className="footer-main">
    <div className="footer-brand"><Link className="logo" href="/">hauszy<span>↗</span></Link><p className="footer-tagline">A place for your next chapter.</p><p>New launches and developer-direct homes in Malaysia, with personal guidance from your first enquiry to your keys.</p>
      {social.length>0&&<ul className="footer-social" aria-label="Social media">{social.map(([key,label])=><li key={key}><a href={p.social[key]} target="_blank" rel="noopener noreferrer" aria-label={`${label} (opens in a new tab)`} title={label}><SocialIcon name={key}/></a></li>)}</ul>}</div>
    <nav className="footer-col" aria-label="Explore"><h2>Explore</h2><ul><li><Link href="/"><Icon name="home"/>Home</Link></li><li><Link href="/projects"><Icon name="building"/>All projects</Link></li><li><Link href="/about"><Icon name="badgeCheck"/>About me</Link></li></ul></nav>
    <nav className="footer-col" aria-label="Tools"><h2>Tools</h2><ul>{TOOLS.map(([href,icon,label])=><li key={href}><Link href={href}><Icon name={icon}/>{label}</Link></li>)}</ul></nav>
    <div className="footer-col"><h2>Get in touch</h2>{(p.name||ren)&&<p className="footer-agent"><strong>{p.name||'Your property partner'}</strong><span>{[ren&&(/^ren/i.test(ren)?ren:'REN '+ren),p.agency].filter(Boolean).join(' · ')}</span></p>}
      {contact.length?<ul>{contact.map(c=><li key={c.icon}>{c.href?<a href={c.href} {...(c.external?{target:'_blank',rel:'noopener noreferrer'}:{})}><Icon name={c.icon}/>{c.label}</a>:<span><Icon name={c.icon}/>{c.label}</span>}</li>)}</ul>:<p>Contact details coming soon.</p>}</div>
  </div><div className="footer-bottom"><span>© {new Date().getFullYear()} Hauszy. All rights reserved.</span><span>Prices, availability and specifications may change. Calculator results are estimates, not financial advice.</span><a href="#" className="footer-top"><Icon name="arrowUp"/>Back to top</a></div></footer>}
