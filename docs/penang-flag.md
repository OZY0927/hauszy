# Penang state flag website asset

Generated with the built-in imagegen tool, in the same asset family as the Pinang tree. PNG master: `public/images/penang-flag-3d.png`. Transparent web asset: `public/images/penang-flag-3d.webp`.

```jsx
import PenangFlag from './PenangFlag';

<PenangFlag size={180}/>
<PenangFlag size={96} decorative/>
<PenangFlag size={240} animated={false}/>
```

Preview: `/penang-flag-preview.html`. The component adds a gentle transform-based sway, requires no client JavaScript, and respects reduced motion. This is a stylized 3D-rendered image rather than a 3D mesh or a fabric simulation. No production page placement has been selected.

Design reference: [Penang government — State Flag, Emblems, State Anthem](https://www.penang.gov.my/index.php/en/kerajaan-6/info-umum-kerajaan/jata-bendera-lagu).

Generation prompt: “Use case: stylized-concept. Asset type: isolated transparent 3D website icon. Create one premium 3D-rendered Penang state flag, Malaysia. Correct flag design: horizontal rectangular flag approximately 2:1, THREE EQUAL VERTICAL bands, light sky blue at the hoist/left, white in the middle, golden yellow on the fly/right. The white center band contains the Penang areca palm emblem: green pinnate fronds, slender brown trunk standing on a small green mound. Flag design must remain clearly legible. Soft sculpted fabric with just two gentle folds, subtle satin weave, natural soft studio lighting and ambient occlusion, polished elegant website icon. Flag hangs from a slim brushed warm silver pole on the left with a small rounded finial and discreet circular base. Full pole and flag visible, centered square composition, generous transparent padding on every side. Three-quarter view nearly frontal. Match a refined sculpted botanical 3D icon style, realistic materials with softly rounded edges. Actual transparent alpha background, no ground plane, no text or lettering, no watermark, no crescent or stars, no extra symbols. Keep the fabric large and emblem visible; do not hide emblem inside a fold.”

## Flag-only revision

The component and preview now use `public/images/penang-flag-only-3d.webp`, with PNG master at `public/images/penang-flag-only-3d.png`. Pole, finial and base were removed with the built-in imagegen editing tool; the earlier pole version is retained as a separate asset. The new render is 1536 × 1024 with transparent exterior pixels.

Edit prompt: “Background removal only. Keep the exact entire Penang flag fabric with its shape, colors, palm emblem and 3D folds unchanged. Remove ALL the blurred blue/grey/yellow background outside the fabric silhouette. The exterior must be fully transparent alpha, not a gradient, not a solid color, not checkerboard artwork. Sharp clean alpha cutout following the curved cloth edges. No pole, no base, no stand. Only the isolated fabric flag remains.”

## Wind animation

The component now uses 40 narrow image strips with staggered phases to simulate a wave travelling across the fabric. Displacement increases toward the free edge; the left edge stays almost still. CSS transforms provide the movement without a video or 3D runtime. Reduced motion displays the unchanged static flag. The preview embeds the same stylesheet and strip settings.
