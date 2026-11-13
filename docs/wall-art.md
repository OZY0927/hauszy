# Bicycle wall-art loading icon

Generated using the built-in image generation tool. Based on the user's photograph of Penang's two children riding a bicycle mural.

Final generation prompt:

> Create a polished miniature 3D clay/resin icon for a Penang travel website loading indicator, based on the attached reference of the famous two children riding a bicycle street mural. Reference image is subject guidance only. A small thick fragment of aged cream plaster wall with gently irregular edges, showing two joyful Asian children riding an antique black bicycle toward the left: older child steering, younger child sitting behind. The bicycle and children are sculptural bas relief projecting from the wall, with simple rounded forms, warm ivory clothing, charcoal bicycle, muted terracotta and sage accents. Charming premium 3D collectible, match soft studio-lit Penang landmark icons. Three-quarter near frontal view, entire wall fragment and wheels visible, centered square composition, clear silhouette readable at 112px, minimal fine details. Genuinely transparent background with alpha, no environment, no floor, no frame, no typography, no signage, no watermark. The outer wall piece is a compact rounded irregular slab, not a large rectangular photograph.

Files:
- `public/images/wall-art-3d.png`: generated master.
- `public/images/wall-art-3d.webp`: web display asset.
- `public/images/loading/wallArt.webp`: optimized loading asset.

`WallArt` provides the static illustration; `WallArtLoading` uses the shared `LandmarkLoading` colour fill, gentle sway, and completion state. Registered as `wallArt` in the random loading-icon selection. Reduced motion uses the same accessible fallback as the other landmarks.

## Realistic revision

Built-in image edit using the initial wall-art icon as the edit target and `penang-trishaw-3d.webp` as the material/style reference. Revision prompt: keep the two-children bicycle mural composition on a compact aged plaster wall fragment, replace the cartoon clay proportions with natural human proportions and weathered painted mural figures, use slender steel bicycle tubing, realistic thin spokes, black rubber tyres and a front basket. Match the existing trishaw's realistic photographed miniature materials and studio lighting. Preserve transparent alpha, no text or watermark.

Revised assets use `wall-art-3d-v2` and `loading/wallArt-v2.webp`; the original generation is retained. Animation remains the shared landmark loader.
