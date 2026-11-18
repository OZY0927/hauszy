# Penang state flag website asset

Generated with the built-in imagegen tool, in the same asset family as the Pinang tree. PNG master: `public/images/penang-flag-3d.png` (the original with a pole; superseded by the flag-only revision below).

This is a stylized 3D-rendered image rather than a 3D mesh or a fabric simulation. The site shows the flag through the shared project loader (`components/LandmarkLoading.js`, loading asset `public/images/loading/flag.webp`), registered in `lib/project-loading-icons.js`.

Design reference: [Penang government — State Flag, Emblems, State Anthem](https://www.penang.gov.my/index.php/en/kerajaan-6/info-umum-kerajaan/jata-bendera-lagu).

Generation prompt: “Use case: stylized-concept. Asset type: isolated transparent 3D website icon. Create one premium 3D-rendered Penang state flag, Malaysia. Correct flag design: horizontal rectangular flag approximately 2:1, THREE EQUAL VERTICAL bands, light sky blue at the hoist/left, white in the middle, golden yellow on the fly/right. The white center band contains the Penang areca palm emblem: green pinnate fronds, slender brown trunk standing on a small green mound. Flag design must remain clearly legible. Soft sculpted fabric with just two gentle folds, subtle satin weave, natural soft studio lighting and ambient occlusion, polished elegant website icon. Flag hangs from a slim brushed warm silver pole on the left with a small rounded finial and discreet circular base. Full pole and flag visible, centered square composition, generous transparent padding on every side. Three-quarter view nearly frontal. Match a refined sculpted botanical 3D icon style, realistic materials with softly rounded edges. Actual transparent alpha background, no ground plane, no text or lettering, no watermark, no crescent or stars, no extra symbols. Keep the fabric large and emblem visible; do not hide emblem inside a fold.”

## Flag-only revision

PNG master: `public/images/penang-flag-only-3d.png`. Pole, finial and base were removed with the built-in imagegen editing tool. The new render is 1536 × 1024 with transparent exterior pixels.

Edit prompt: “Background removal only. Keep the exact entire Penang flag fabric with its shape, colors, palm emblem and 3D folds unchanged. Remove ALL the blurred blue/grey/yellow background outside the fabric silhouette. The exterior must be fully transparent alpha, not a gradient, not a solid color, not checkerboard artwork. Sharp clean alpha cutout following the curved cloth edges. No pole, no base, no stand. Only the isolated fabric flag remains.”
