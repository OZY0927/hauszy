# Background music

The public site plays original, lyric-free synthesized instrumental ambience.
Three passages alternate every 32 beats: pentatonic plucked strings,
bamboo-like tones, and resonant string/drone textures. These are instrument-inspired
sound designs, not recordings or claims of authentic traditional performances.
There are no third-party audio downloads or music licensing dependencies.

`lib/background-music.js` defines the melodies, timbres, gentle echoes and output
gain. The default master gain is 0.32 and the user volume range is 0–0.6;
these are audio gain values, not calibrated speaker loudness measurements.
The fixed music control remembers mute and volume choices in local storage.

Playback attempts to start on arrival. Where browser autoplay policy blocks
audio, the first pointer or keyboard interaction resumes it. Music persists
across public route navigation and stops on admin routes or when the tab is hidden.

`lib/video-audio-focus.js` watches native video playback and the existing
YouTube/Vimeo project players and homepage film. Music fades out and suspends
while videos play or buffer, then resumes when all videos pause, end or close.
Embedded players reserve audio from mounting until a trusted player state
arrives, so they cannot overlap music while loading. Minimizing an embedded
player removes its iframe and releases audio; native videos release it on pause.
Player messages must match both the iframe window and its exact origin.

The browser audio context is suspended rather than recreated during video
playback, preserving the musical position. Turning music off remains respected
when video playback finishes.
