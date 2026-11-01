import {absoluteUrl} from '../lib/seo';
export default function robots(){return {rules:{userAgent:'*',allow:'/',disallow:['/api/']},...(absoluteUrl('/sitemap.xml')?{sitemap:absoluteUrl('/sitemap.xml')}: {})}}
