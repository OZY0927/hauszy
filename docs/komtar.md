# Komtar website icon

Created with the built-in imagegen tool to match the softly sculpted 3D style of the existing Pinang tree. The corrected square PNG master and optimized transparent WebP are in `public/images/komtar-3d-v3.png` and `public/images/komtar-3d-v3.webp`. Components use the photo-matched v3 asset.

This is a rendered image, not a 3D mesh. Following the requested silhouette, the icon has a uniform cylindrical tower, vertical facade ribs, a green-glass top with no antenna or flared crown, and a compact podium in warm ivory and muted blue-grey.

```jsx
import Komtar from './Komtar';
import KomtarLoading from './KomtarLoading';

<Komtar size={180}/>
<Komtar size={96} decorative animated={false}/>
<KomtarLoading/>
```

The decorative loading variant uses a wavy fill from grayscale to color. Its surrounding screen provides the accessible loading status. Both components respect reduced-motion preferences.

Project navigation now randomly chooses the tree, Penang flag or Komtar. Each icon keeps its own animation. Once the destination is rendered (and project preview images are prepared), the chosen icon completes its color fill, fireworks burst briefly, and the page reveals from the center. Reduced-motion mode skips the fireworks and uses a short fade. Route errors skip the celebration.
