import Link from 'next/link';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {GUIDE_TOOLS,guideDateLabel,guideHref,guideCoverAllowed} from '../lib/guides';
import Icon from './Icon';

function MarkdownLink({href,children}){
 if(!href)return <span>{children}</span>;
 return href.startsWith('/')?<Link href={href}>{children}</Link>:<a href={href}>{children}</a>;
}

function ScrollTable({children}){
 return <div className="guide-table" role="region" aria-label="Article comparison table" tabIndex={0}><table>{children}</table></div>;
}

const markdownComponents={a:MarkdownLink,h1:'h2',table:ScrollTable};

export default function GuideArticle({guide,project,preview=false}){
 const tools=GUIDE_TOOLS.filter(([path])=>guide.tools?.includes(path));
 const sources=(guide.sources||[]).filter(source=>source.label&&guideHref(source.url));
 return <article className="guide-article">
  <header className="guide-article-heading">
   <span className="eyebrow">{guide.category}</span>
   <h1>{guide.title||'Untitled guide'}</h1>
   <p className="guide-answer">{guide.summary}</p>
   {(guide.author||guide.publishedAt)&&<p className="guide-byline">
    {guide.author&&<span>By {guide.author}</span>}
    {guide.publishedAt&&<time dateTime={guide.publishedAt}>{guideDateLabel(guide.publishedAt)}</time>}
    {guide.updatedAt&&guide.publishedAt&&guideDateLabel(guide.updatedAt)!==guideDateLabel(guide.publishedAt)&&<span>Updated <time dateTime={guide.updatedAt}>{guideDateLabel(guide.updatedAt)}</time></span>}
   </p>}
  </header>
  {(guideCoverAllowed(guide.coverUrl)||(preview&&guide.coverUrl?.startsWith('blob:')))&&<img className="guide-article-cover" src={guide.coverUrl} alt={guide.coverAlt||''} fetchPriority={preview?undefined:'high'}/>}
  <div className="guide-prose">
   <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents} urlTransform={guideHref} disallowedElements={['img','input']} skipHtml>{guide.body||''}</Markdown>
   {!!sources.length&&<section className="guide-article-extra" aria-labelledby="guide-sources-title">
    <h2 id="guide-sources-title">Sources</h2>
    <ul>{sources.map((source,index)=><li key={source.url+index}><a href={source.url}>{source.label}</a>{source.checkedOn&&<small>Checked <time dateTime={source.checkedOn}>{guideDateLabel(source.checkedOn)}</time></small>}</li>)}</ul>
   </section>}
   {(project||tools.length>0)&&<section className="guide-article-extra" aria-labelledby="guide-related-title">
    <h2 id="guide-related-title">Keep exploring</h2>
    <div className="guide-related">
     {project&&<Link className="project-story-pill" href={`/projects/${encodeURIComponent(project.id)}/`}>View {project.name} <Icon name="arrowUpRight"/></Link>}
     {tools.map(([path,name])=><Link key={path} className="project-story-pill" href={path}>{name} <Icon name="arrowUpRight"/></Link>)}
    </div>
   </section>}
  </div>
 </article>;
}
