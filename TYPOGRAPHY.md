# Hauszy typography

Project info pages use the final scoped scale in `app/project-typography.css`,
loaded after section styles. All project text uses the existing Manrope family.
Hero titles range from 44–104px, animated overview statements 40–92px,
section headings 32–56px, and subheadings 24–44px. Body text is 17px,
supporting text 15px, and captions 13px. Headings use weight 500, overview
statements 600, and changing facility names 800; facility side phrases remain 400.
These overrides apply only inside `.project-story`.

Sizes assume the browser's default 16px root. The root respects user preferences;
headings grow smoothly with viewport width using `clamp()`, rather than scaling
the entire interface on wide screens.

| Category | Token | Mobile → desktop | Line height |
| --- | --- | --- | --- |
| Hero title | `--text-title` | 41–97px | 1.1 |
| Page title | `--text-page` | 33–57px | 1.15 |
| Section heading / editorial statement | `--text-section` | 29–49px | 1.2 |
| Subheading / dialog title | `--text-subheading` | 21–33px | 1.3 |
| Card title | `--text-card` | 19–25px | 1.35 |
| Content / form values | `--text-body` | 17px | 1.75 for content |
| Buttons / navigation / supporting text | `--text-control`, `--text-small` | 15px | Inherited from component |
| Eyebrow / caption / metadata | `--text-label`, `--text-caption` | 13px | 1.5–1.6 |
| Calculator result | `--text-metric` | 29–49px | 1.2 |

The ranges are the minimum and maximum bounds, not fixed breakpoint sizes.
Define tokens in `app/globals.css` and map component roles in
`app/typography.css`. Use tokens for new text styles; preserve separate sizes
for decorative wordmarks and icons. Mobile form values have a 16px minimum.
The admin studio keeps its scoped scale, increased by the same 1px.
