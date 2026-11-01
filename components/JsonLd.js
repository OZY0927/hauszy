import {serializeJsonLd} from '../lib/seo';
export default function JsonLd({data}){return data?<script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(data)}}/>:null}
