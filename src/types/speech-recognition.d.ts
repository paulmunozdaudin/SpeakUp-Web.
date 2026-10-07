/**
 * Safari-specific typing not yet in lib.dom.d.ts.
 */
interface Window {
  /** Safari's prefixed AudioContext — used for real-time pause/silence
   *  detection via the Web Audio API (see use-speech-recorder.ts). */
  webkitAudioContext?: typeof AudioContext;
}
