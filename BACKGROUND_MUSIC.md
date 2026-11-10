# Background music

In Admin → Settings → Background music, paste a public HTTPS URL that serves
an audio file directly (for example MP3, M4A or OGG). Use the preview player to
check the link, then select **Save music settings**. Webpage links to music
services are not playable audio files. Leave the URL blank and save to disable.
There is no built-in synthesized fallback and no file-upload step.

The field is stored as `backgroundMusicUrl` in `siteContent/about`, using the
existing public-read/admin-write Firestore rules. Music saves merge just that
field; profile saves omit it and merge their own fields, so the forms cannot
overwrite each other's setting. The server shares the cached profile read with
the footer and revalidates the `profile` tag when music is saved. No rule change
or new collection is required. Existing open visitor sessions retain their track
until the next full page visit.

The public player loops the saved audio URL, with a soft default volume of 0.32,
a maximum control value of 0.6, and remembered visitor mute/volume preferences.
These are relative audio levels, not calibrated device loudness measurements.
Normal HTML audio playback does not require the host to enable Web Audio CORS.
The hosting service must allow public audio playback, and the format must be
supported by the visitor's browser. Broken sources fail silently for visitors.

Playback attempts to start on arrival. If browser autoplay policy blocks sound,
the first pointer or keyboard interaction retries playback. Music persists across
public routes, pauses when the tab is hidden, and is absent from admin routes.

`lib/video-audio-focus.js` watches native videos and the existing YouTube/Vimeo
project players and homepage film. Music fades out while videos play or buffer,
then resumes from its prior position when all videos pause, end or close.
An embedded player reserves audio from mounting until a trusted playback event
arrives; minimizing it removes its iframe and releases audio. Messages must match
both the iframe window and its exact origin. Visitor mute choices stay respected.
