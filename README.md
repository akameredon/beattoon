# BeatToon — Free Music Video Studio

An open-source, local-first starter for turning music into cartoon-style music videos in the browser. No accounts, paid APIs, credits, or audio-upload backend.

## MVP
- Upload browser-supported audio (MP3/WAV/M4A/OGG depending on browser codec support).
- Four code-drawn cartoon visual moods.
- Music-reactive character motion, lights, confetti and visualizer bars.
- Record canvas and soundtrack locally, then convert to MP4 using FFmpeg WebAssembly.
- No AI model or paid API required.

## Run locally
Requires Node.js 20.19+ or 22.12+ recommended.

```bash
npm install
npm run dev
```

Build with `npm run build`; deploy `dist/` to a static host.

## Limitations
This is an early MVP, not a lyric-faithful AI film. It uses original code-drawn cartoon figures; it does not transcribe lyrics or generate unique AI images. Recording runs in real time, so a 3-minute song takes roughly 3 minutes plus conversion. Browser codec, memory, and performance vary. Start with a short track and recent desktop Chromium. iOS/Safari needs testing.

## Licensing
Original project code: MIT (see `LICENSE`). Vite is MIT. `@ffmpeg/ffmpeg` is MIT; FFmpeg and its WebAssembly core/codecs have separate licensing obligations. Review the exact build configuration before redistribution. No third-party images or model weights are included.

## Privacy
Audio is processed locally; there is no upload endpoint. Use HTTPS and a restrictive Content Security Policy in production.

## Roadmap
1. Verify exports across browsers.
2. Improve audio muxing, cancellation and error recovery.
3. Add user-provided lyric timing.
4. Add original/licensed cartoon assets.
5. Add vertical and square exports.
6. Improve scene pacing based on beats and song sections.
