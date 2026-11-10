'use client';
import {useMemo} from 'react';
import CardShowcase from './CardShowcase';
import {listingName} from '../lib/project';
import {isMediaPath,isOptimizedImage,previewUrl} from '../lib/media';

// Penang photography fills the wall when there are few project photos.
const PLACES=[
 ['streets','A traditional Penang shophouse framed by greenery'],
 ['coast','Soft evening light along the Penang coastline'],
 ['skyline','Penang’s skyline and the Penang Bridge at sunrise'],
 ['hills','Homes among the green hills of Paya Terubong'],
 ['heritage','Boats at the waterfront in Penang'],
];
// Small same-origin versions for textures: uploads have a preview beside them; everything else goes through the image optimizer.
const optimized=src=>`/_next/image?url=${encodeURIComponent(src)}&w=640&q=75`;
function photo(src){
 if(isMediaPath(src)){const preview=previewUrl(src);return {src:preview,sources:preview===src?[src]:[preview,src]}}
 if(isOptimizedImage(src)||src.startsWith('/'))return {src,sources:[optimized(src),src]};
 return {src,sources:[src]};
}

export function showcaseCards(projects){
 const fromProjects=projects.filter(p=>typeof p.images?.[0]==='string').map(p=>({id:p.id,...photo(p.images[0]),alt:listingName(p),title:listingName(p),category:p.type,href:'/projects/'+encodeURIComponent(p.id)}));
 const fromPlaces=PLACES.map(([name,alt])=>({id:'penang-'+name,...photo(`/penang/${name}.jpg`),alt,category:'Penang'}));
 return [...fromProjects,...fromPlaces];
}

export default function HotProjectsShowcase({candidates=[]}){
 const cards=useMemo(()=>showcaseCards(candidates),[candidates]);
 return <CardShowcase cards={cards} label="THE PROPERTY COLLECTION" heading={['Every corner','of Penang.']} copy="Apartments, landed homes and commercial spaces from George Town to Batu Kawan, across the island and the mainland." cta={{href:'/projects',label:'Explore properties'}}/>;
}
