import Link from 'next/link';
import Icon from '../../components/Icon';
import {getPublishedGuides} from '../../lib/firestore-server';
import {guideCoverAllowed,guideDateLabel,guidePath} from '../../lib/guides';
import {pageMetadata} from '../../lib/seo';

export const metadata=pageMetadata('Penang Property Guides','Read Hauszy’s Penang property buyer guides, condo layout comparisons and sourced project updates. Plan your budget and know what to ask before viewing.','/guides/',['/penang/skyline.jpg']);

export default async function Guides(){
 const guides=await getPublishedGuides();
 return <main className="guides-shell">
  <header className="guides-heading">
   <span className="eyebrow">PENANG ISLAND & SEBERANG PERAI</span>
   <h1>Penang property<br/><em>guides.</em></h1>
   <p>Know what to ask before buying, see how layouts compare, and follow updates that matter to your shortlist.</p>
  </header>
  {guides.length>0?<div className="guides-grid">
   {guides.map(guide=><article className="guide-card" key={guide.slug}>
    <Link href={guidePath(guide.slug)}>
     {guideCoverAllowed(guide.coverUrl)&&<img src={guide.coverUrl} alt={guide.coverAlt||''} loading="lazy" decoding="async"/>}
     <div className="guide-card-copy"><span className="eyebrow">{guide.category}</span>
      <h2>{guide.title}</h2><p>{guide.summary}</p>
      <div className="guide-card-bottom"><time dateTime={guide.publishedAt}>{guideDateLabel(guide.publishedAt)}</time><span>Read guide <Icon name="arrowUpRight"/></span></div>
     </div>
    </Link>
   </article>)}
  </div>:<p className="guides-empty">There are no published guides at the moment.</p>}
 </main>;
}
