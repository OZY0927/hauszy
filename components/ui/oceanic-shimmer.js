// GradientBackground — "Oceanic Shimmer", made with the 21st.dev Gradient
// Builder and exported as live CSS (the builder's own Copy-CSS background,
// plus its soften-blur and grain passes). Zero dependencies: one <div> that
// fills its parent. Drop it behind your content:
// <div className="relative h-96"><GradientBackground className="absolute inset-0" /></div>
// Remix the source recipe (colors, mode, finish) in the editor:
// https://21st.dev/community/gradients/editor?from=edd345b3-bbfc-488d-9798-87a22acf7276
// Ported from the original .tsx to plain JS for this project (no TypeScript or Tailwind needed: inline styles only).
// `colors` swaps the palette: base fill plus four blobs, top to bottom, as "r, g, b" strings.
const OCEANIC={base:'#123A6B',stops:['234, 247, 251','127, 198, 230','46, 124, 192','18, 58, 107']};
const POSITIONS=['41.58% 6%','42.42% 33%','51.19% 67%','53.67% 94%'];
export function GradientBackground({className,colors=OCEANIC}){
 const blobs=colors.stops.map((rgb,i)=>`radial-gradient(150% 48.4% at ${POSITIONS[i]}, rgba(${rgb}, 0.92) 0%, rgba(${rgb}, 0) 53%)`).join(', ');
 return <div aria-hidden="true" className={className} style={{position:'relative',overflow:'hidden',width:'100%',height:'100%',containerType:'size'}}>
  <div style={{
   position:'absolute',inset:0,backgroundColor:colors.base,
   backgroundImage:`url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.215'/></svg>"), ${blobs}`,
   backgroundSize:'120px 120px, auto, auto, auto, auto',
   backgroundBlendMode:'overlay, normal, normal, normal, normal'
  }}/>
  <svg aria-hidden="true" style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:.215,mixBlendMode:'overlay'}}>
   <filter id="grain-edd345b3"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
   <rect width="100%" height="100%" filter="url(#grain-edd345b3)"/>
  </svg>
 </div>;
}
