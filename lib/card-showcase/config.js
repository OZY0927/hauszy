// Every tunable of the card showcase in one place. Distances are world units where a card is 1 wide;
// angles are radians; phase values are fractions of the section's scroll progress (0 = section top
// reaches the viewport top, 1 = the pinned scene releases).
export const SHOWCASE_CONFIG={
 desktop:{
  scroll:4.6,                 // section height, in viewport heights
  smoothing:.085,             // seconds; time constant of the scroll smoothing (no overshoot)
  maxDpr:1.75,
  textureSize:512,            // square texture each photo is drawn into (power of two for mipmaps)
  segments:24,                // card subdivisions across its width, for bending
  fov:35,                     // vertical field of view, degrees
  card:{aspect:4/3,radius:.045},
  ring:{
   tiers:2,                   // stacked rows of cards around the axis
   tierGap:.2,
   radius:2.35,
   opening:.42,               // half-angle left empty at the front and back, so the centre stays open
   tilt:.26,                  // seen slightly from above
   roll:-.08,
   wave:.12,                  // vertical ripple along the ring
   cardRoll:.07,              // per-card in-plane jitter
   spin:.4,                   // how far the ring turns while it is being established
   width:.36,                 // share of the viewport width the ring occupies
   height:.55,                // and the most of its height it may take
  },
  grid:{
   cols:7,rows:5,             // also the card count
   gutter:.07,                // share of the card width
   tilt:.6,                   // plane tipped back, top receding
   yaw:.3,                    // right side receding
   roll:-.24,                 // clockwise turn so rows run toward the upper right
   center:[0,0,-.8],          // slightly behind the ring, so it forms beyond it
   fill:.85,                  // camera sees this share of the grid's width when framed
   minDistance:5.4,
  },
  motion:{
   stagger:.62,               // share of the unfold window spent staggering card departures
   arc:.9,                    // cards bow toward the viewer on the way
   lift:.3,
  },
  bend:{strength:.75},        // peak curvature during travel; 0 keeps cards rigid
  optics:{soften:2.2,chroma:.0035,fog:.22},
  split:{side:'left',amount:.5},
  phases:{
   ring:[0,.15],
   unfold:[.15,.5],
   expand:[.4,.72],
   split:[.7,.9],
   text:[.8,.84],             // hidden below the first value, revealed above the second
  },
 },
 compact:{
  scroll:3.4,
  smoothing:.06,
  maxDpr:1.5,
  textureSize:256,
  segments:12,
  fov:40,
  card:{aspect:4/3,radius:.05},
  ring:{tiers:2,tierGap:.18,radius:1.45,opening:.45,tilt:.24,roll:-.06,wave:.08,cardRoll:.06,spin:.3,width:.6,height:.42},
  grid:{cols:4,rows:4,gutter:.07,tilt:.55,yaw:.24,roll:-.2,center:[0,0,-.6],fill:.9,minDistance:4.2},
  motion:{stagger:.55,arc:.6,lift:.2},
  bend:{strength:.45},
  optics:{soften:1,chroma:0,fog:.15},
  split:{side:'top',amount:.56},  // gallery keeps the top 44%; keep in step with .cs-panel's top in globals.css
  phases:{ring:[0,.12],unfold:[.12,.5],expand:[.38,.72],split:[.7,.88],text:[.78,.82]},
 },
};

export const COMPACT_QUERY='(max-width: 800px)';
