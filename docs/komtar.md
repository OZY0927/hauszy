# Komtar website icon

Created with the built-in imagegen tool to match the softly sculpted 3D style of the existing Pinang tree. The corrected square PNG master and optimized transparent WebP are in `public/images/komtar-3d-v3.png` and `public/images/komtar-3d-v3.webp`. The site uses the photo-matched v3 asset.

This is a rendered image, not a 3D mesh. Following the requested silhouette, the icon has a uniform cylindrical tower, vertical facade ribs, a green-glass top with no antenna or flared crown, and a compact podium in warm ivory and muted blue-grey.

The web asset is shown through the shared project loader (`components/LandmarkLoading.js`), registered in `lib/project-loading-icons.js`.

The decorative loading variant uses a wavy fill from grayscale to color. Its surrounding screen provides the accessible loading status. It respects reduced-motion preferences.

Project navigation now randomly chooses the tree, Penang flag or Komtar. Each icon keeps its own animation. Once the destination is rendered (and project preview images are prepared), the chosen icon completes its color fill, fireworks burst briefly, and the page reveals from the center. Reduced-motion mode skips the fireworks and uses a short fade. Route errors skip the celebration.
