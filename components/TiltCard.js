'use client';
// Adapted from Bencho Tilt card, MIT licensed: https://bencho.dev/licence
import { useEffect, useRef } from "react";

/* ── inlined from lab/spring ──────────────────────── */
/* ── one spring, for everything that settles ───────────────
   The maths was already on this bench twice, copied by hand:
   Humidity's wheel and Brightness's column both accumulate
   velocity toward a target, damp it, and snap when both the
   delta and the velocity fall under 0.02. Two copies is a
   coincidence; five would be a policy, so it comes out here
   before the elastic blocks are written against it.

   The two shipped copies are deliberately NOT refactored onto
   this. They work, they are tuned, and rewriting the innards
   of two live components to prove a point about duplication
   is how a good afternoon becomes a bad one. This is the one
   new code uses.

   Frames, not milliseconds. `dt` is expressed in sixtieths of
   a second and the damping is RAISED to it rather than
   multiplied by it, so a dropped frame decays the same amount
   of energy as the two frames it replaced. Multiplying is the
   version that makes a spring behave differently on a busy
   page, which is the hardest kind of bug to see.

   The loop parks itself the moment the value has settled.
   CLAUDE.md is not complimentary about the one permanent
   requestAnimationFrame already on this bench and there is no
   case for five more. */

/* 0..100 into the two numbers a spring actually has.

   50 is what Humidity and Brightness were tuned at, which is
   the rule every elastic knob on this bench follows — see
   lab/motion. Turn the panel to the middle and nothing has
   changed.

   Both ends have to be usable, which is what fixes the range:
   at 0 it is slow and heavy and still arrives, at 100 it is
   quick with a visible overshoot, and nowhere in between does
   it ring for longer than it takes to read. */
/* The pair is chosen by DAMPING RATIO and then written back
   as stiffness and decay, because the ratio is the thing a
   person is actually setting and the two numbers on their own
   do not say what they add up to.

     zeta = -ln(d) / (2 * sqrt(k))

   The first version of this ran 0.06..0.26 stiffness against
   0.93..0.74 decay, which reads as a sensible spread and is
   not one: it puts zeta between 0.15 and 0.16 across the
   WHOLE range, so every setting overshot by about sixty per
   cent and the knob only changed how fast it did it. Pull's
   return went 130px past its own resting position and lifted
   the content off the top of the card.

     0   → zeta ~0.85, heavy, arrives without a ring
     50  → zeta ~0.41, near where Humidity and Brightness sit
     100 → zeta ~0.20, lively, two visible rebounds

   Both ends shippable, which is the constraint that fixed the
   numbers rather than taste. */
const springOf = (tune) => ({
  /* stiffness: how hard it is pulled toward the target */
  k: 0.08 + (tune / 100) * 0.16,
  /* decay, per frame: how much of the velocity survives */
  d: 0.62 + (tune / 100) * 0.2,
});

/* Units matter. The snap threshold is absolute, so a caller
   works in pixels or in 0..100 — a spring driven over 0..1
   would be "settled" before it had visibly moved.

   One step of one spring, in place. It used to be a hook with
   a loop and a setState of its own, which put three loops and
   three React renders into every frame of every card; now the
   card steps all three from one loop and paints the result
   itself. The maths is unchanged. Returns true once settled. */
const SPRING = springOf(50);
function settle(s, target, dt) {
  s.v += (target - s.at) * SPRING.k * dt;
  s.v *= Math.pow(SPRING.d, dt);
  s.at += s.v * dt;
  if (Math.abs(target - s.at) < 0.02 && Math.abs(s.v) < 0.02) {
    s.at = target;
    s.v = 0;
    return true;
  }
  return false;
}

/* Read once, the way the wheel and the pill nav do. A
   preference, not a live input. */
const stillness = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* BUTTERFLY was Bencho's own pictures, which is not licensed
   to travel. Point this at yours. */
// Hauszy supplies its own project image through the card children.

/* ══ Tilt ═════════════════════════════════════════════════
   A picture card that gives under the pointer.

   IT SINKS, IT DOES NOT LIFT. Every tilt card on the internet
   rotates TOWARD the cursor: the corner you are nearest rises
   to meet you and the card reads as a slab of glass catching
   the light. This one does the opposite — the point you are
   over goes AWAY, and the far side comes up. The difference
   is one minus sign and it is the whole component: a surface
   that rises to your finger is being displayed to you, and a
   surface that gives under it is being touched.

   Which means the sign is not a detail to get right by
   fiddling. Cursor at the top → the top edge has to go back,
   which is a POSITIVE rotateX; cursor at the right → the
   right edge goes back, which is a positive rotateY. Hence
   `rx = -ny` and `ry = +nx`, the negation of the usual pair.

   THE ROTATION ALONE IS NOT ENOUGH. A rotation about the
   centre is symmetric — the near side down, the far side up
   by the same amount — and on its own it reads as a card
   pivoting, not as one being pressed. What makes it a press
   is that the darkest point tracks the pointer: a depression
   catches shadow at its deepest, and the rim opposite catches
   light. Those two gradients are doing at least as much of
   the work as the transform is, and neither would convince on
   its own.

   ONE PAIR OF NUMBERS IS THE STATE. Two springs hold where
   the pointer is, normalised to -1..1, and the rotation, both
   gradients and the shadow are all read off them. Nothing
   here has a transition of its own — see the note on Sound
   for why that matters, which is the same reason. */

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const mix = (a, b, t) => a + (b - a) * t;

/* Portrait, and the picture is cropped to it by
   scripts/butterfly.sh rather than being fitted at runtime —
   change one and change the other or the crop moves. */
// The responsive project frame supplies the portrait dimensions.

/* ── how deep the room is ──────────────────────────────────
   The one number that decides whether this reads as a card
   turning or as a poster being sheared. Perspective is the
   distance from the viewer to the screen, so a small number
   is a face close to the glass: the near corner grows, the
   far corner shrinks, and ten degrees looks like thirty.

   800 against a 320px card is about two and a half card
   heights back — far enough that the foreshortening is a
   suggestion rather than a fisheye, close enough that the
   corners are visibly different sizes. It is not a knob
   because it is not a separate idea from the tilt: both
   answer "how 3D", and two sliders for one feeling is how a
   panel stops meaning anything. */
const DEPTH = 800;

/* how far the whole card retreats while it is being touched.
   Small on purpose — this is the difference between a card
   that tips and a card that is pushed, and at anything past
   about twenty it stops being a press and becomes a zoom. */
const SINK = 14;

const CORNER = 20;
const TILT = 10;
const SHADE = 60;


/* Everything the card shows, read off the three sprung numbers.
   Pure, so the server's first paint and every frame after it
   come from the same place and cannot drift apart. */
function look(sx, sy, lit, tilt, shade) {
  const max = clamp(tilt, 0, 20);
  const rx = -sy * max;
  const ry = sx * max;

  /* the pointer in the card's own terms, as a PERCENTAGE —
     the wall and the overlay both draw this block at their
     own scale, and a gradient placed in pixels would land
     somewhere else in each of them */
  const px = ((sx + 1) / 2) * 100;
  const py = ((sy + 1) / 2) * 100;

  const dark = (clamp(shade, 0, 100) / 100) * 0.55 * lit;
  const rim = (clamp(shade, 0, 100) / 100) * 0.34 * lit;

  return {
    /* translateZ FIRST, so the retreat is measured in
       the room's axes rather than in the card's own —
       after a rotation, the card's z points somewhere
       off to the side and "back" stops meaning back. */
    transform: `translateZ(${-SINK * lit}px) rotateX(${rx}deg) rotateY(${ry}deg)`,
    /* ── the shadow TIGHTENS ────────────────────────
       A thing pressed into a surface has less air under
       it, so the gap closes and the shadow draws in.
       Growing it on hover is the reflex — it is what a
       card that LIFTS would do — and it fights every
       other cue here. */
    boxShadow: `0 ${mix(20, 9, lit)}px ${mix(44, 24, lit)}px -8px rgba(53, 42, 37, ${mix(
      0.22,
      0.15,
      lit,
    )})`,
    /* ── the dent, and the rim opposite it ───────────
       The shadow pools where the surface is deepest,
       which is under the pointer, and the light catches
       the far edge that has risen — so the two are
       placed at mirrored points and neither is centred
       on anything. This is the layer that makes the
       transform read as a press. */
    backgroundImage: `radial-gradient(42% 34% at ${px}% ${py}%, rgba(53, 42, 37, ${dark}) 0%, rgba(53, 42, 37, 0) 100%), radial-gradient(52% 42% at ${
      100 - px
    }% ${100 - py}%, rgba(252, 248, 242, ${rim}) 0%, rgba(252, 248, 242, 0) 100%)`,
  };
}

export default function TiltCard({children, tilt = TILT, corner = CORNER, shade = SHADE}) {
  const skin = useRef(null);
  const face = useRef(null);
  const sheen = useRef(null);
  const still = stillness();

  /* ── the state, and there is only this ───────────────────
     Where the pointer is, as -1..1 on each axis, sprung. The
     spring is on the POSITION rather than on the rotation, so
     the gradients and the transform can never disagree about
     where the finger is — they are three readings of one
     number instead of three things being animated towards
     the same place.

     Sprung rather than tracked one-to-one because a card with
     no weight follows the cursor exactly and reads as a
     texture pinned to the mouse. The lag is what gives it
     mass, and the settle on the way out is the only reason
     leaving the card feels like anything at all.

     `lit` is one more for how much of any of this applies, so
     the shadow and the sheen fade rather than cutting.

     It lives in a ref, not in React state: a frame of this is
     three numbers and three style writes, and routing it
     through a render made the card's whole subtree reconcile
     sixty times a second for nothing. */
  const st = useRef(null);
  if (!st.current) st.current = { x: { at: 0, v: 0 }, y: { at: 0, v: 0 }, lit: { at: 0, v: 0 }, on: false, aim: { x: 0, y: 0 }, pointer: null, raf: 0, prev: 0 };
  const knobs = useRef({ tilt, shade });
  knobs.current = { tilt, shade };

  const paint = () => {
    const s = st.current;
    if (!face.current || !sheen.current) return;
    const l = look(s.x.at, s.y.at, s.lit.at, knobs.current.tilt, knobs.current.shade);
    face.current.style.transform = l.transform;
    face.current.style.boxShadow = l.boxShadow;
    sheen.current.style.backgroundImage = l.backgroundImage;
  };

  /* One loop for all three springs, parked the moment they have
     all settled. The pointer is only measured here, once a frame
     and before anything is written, so a fast mouse costs one
     layout read per frame rather than one per event, and never
     a read straight after a write. */
  const tick = (t) => {
    const s = st.current;
    const dt = s.prev ? clamp((t - s.prev) / 16.67, 0, 2.5) : 1;
    s.prev = t;
    if (s.pointer && skin.current) {
      /* measured from the FRAME, which never moves. Reading the
         card instead would be asking a rotating object where it
         is, and near the edges it has already turned away from
         the pointer that is asking. */
      const r = skin.current.getBoundingClientRect();
      s.aim = {
        x: clamp(((s.pointer.x - r.left) / r.width) * 2 - 1, -1, 1),
        y: clamp(((s.pointer.y - r.top) / r.height) * 2 - 1, -1, 1),
      };
      s.pointer = null;
    }
    const x = settle(s.x, s.on ? s.aim.x : 0, dt);
    const y = settle(s.y, s.on ? s.aim.y : 0, dt);
    const l = settle(s.lit, s.on ? 1 : 0, dt);
    paint();
    if (x && y && l) {
      s.raf = 0;
      s.prev = 0;
      return;
    }
    s.raf = requestAnimationFrame(tick);
  };
  const wake = () => {
    if (!st.current.raf) st.current.raf = requestAnimationFrame(tick);
  };
  const release = () => {
    if (!st.current.on) return;
    st.current.on = false;
    wake();
  };

  useEffect(() => () => {
    cancelAnimationFrame(st.current.raf);
    st.current.raf = 0;
  }, []);
  /* a knob turned mid-flight lands on the next frame, and at
     rest it repaints once rather than waiting for a pointer */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(paint, [tilt, shade]);

  const track = (e) => {
    if (!skin.current || still) return;
    st.current.pointer = { x: e.clientX, y: e.clientY };
    st.current.on = true;
    wake();
  };

  const rest = look(0, 0, 0, tilt, shade);

  return (
    <div
      className="tlt"
      ref={skin}
      style={{ perspective: DEPTH }}
      /* pointer, not mouse: the same handler carries a finger
         dragged across the card, so a phone gets the effect
         while it is being touched rather than getting nothing
         at all. */
      onPointerMove={track}
      onPointerUp={e => {if(e.pointerType !== 'mouse') release()}}
      /* ── `out` with a containment test, NOT `leave` ───────
         Which is what leave IS — the browser derives it from
         exactly this event by asking whether the thing you
         moved to is inside the thing you were on — so this is
         not a second mechanism, it is the same one written
         out. What it buys is the case React would not
         synthesise: the rehearsal drives a scripted pointer by
         dispatching `pointerout`, and its final beat walks off
         the card carrying `relatedTarget: null`. Measured, no
         `onPointerLeave` came of it, and every card on the
         wall finished its demo still sunk under a cursor that
         had gone.

         Null counts as outside, which is also the honest
         answer for a real pointer leaving the window. */
      onPointerOut={(e) => {
        const el = skin.current;
        const to = e.relatedTarget;
        if (!el || !to || !el.contains(to)) release();
      }}
      /* a touch taken over by a scroll never reports leaving */
      onPointerCancel={release}
    >
      {/* The style props are the resting pose only and never
          change between renders, so React writes them once and
          then leaves the loop's own writes alone. */}
      <div
        ref={face}
        className="tlt-card"
        style={{
          borderRadius: clamp(corner, 0, 40),
          transform: rest.transform,
          boxShadow: rest.boxShadow,
        }}
      >
        {children}
        <span
          ref={sheen}
          className="tlt-sheen"
          aria-hidden="true"
          style={{ backgroundImage: rest.backgroundImage }}
        />
      </div>
    </div>
  );
}
