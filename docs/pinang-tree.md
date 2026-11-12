# Pinang tree website asset

Generated with the built-in imagegen tool. Transparent PNG master: `public/images/pinang-tree-3d.png`. Web-optimized transparent asset: `public/images/pinang-tree-3d.webp`.

Use the reusable component:

```jsx
import PinangTree from './PinangTree';

<PinangTree size={180}/>
<PinangTree size={96} decorative/>
<PinangTree size={240} animated={false}/>
```

The icon is a 3D-rendered image with CSS swaying, not a downloadable 3D mesh. Animation uses only transforms, anchors near the trunk base, requires no client JavaScript, and respects reduced motion. No production page placement is selected yet. Preview at `/pinang-tree-preview.html`.

Generation prompt: “Use case: stylized-concept. Asset type: transparent 3D website icon. Create ONE elegant stylized 3D Pinang tree (areca palm / Areca catechu): slender upright warm tan ringed trunk, smooth green crownshaft, a compact crown of graceful feather-like pinnate green fronds, small orange areca nuts nestled below the crown. Premium softly sculpted 3D render, gently rounded shapes, believable botanical silhouette, clean detailed leaflets readable at icon scale. Centered full tree, three-quarter view, entire canopy and base within canvas with generous transparent margin. Small neat rounded patch of earth at the base, no pot, no scene, no text, no lettering, no watermark. Soft warm studio lighting and ambient occlusion, natural deep green leaves and warm sand brown trunk, suitable for a refined Penang property website. Actual transparent alpha background. Single isolated object, square composition.”
