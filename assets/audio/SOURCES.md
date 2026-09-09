# Audio sources

The checked-in audio is intentionally sourced from openly licensed game-audio libraries. None of these files were extracted from GTA, Rockstar Games, or another commercial game.

## Water ambience

- Local file: `waves-source.mp3`
- Original file: `VistulaShort.mp3`
- Work: [Sea and river wave sounds](https://opengameart.org/content/sea-and-river-wave-sounds)
- Creator: RandomMind
- License: [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)
- Note: a five-minute peaceful recording of small waves on the Vistula river. It is used as a calm coastal bed rather than a crashing-surf effect. The local file is the original download, renamed only.

## Vehicle engine loops

- Local files: `car-engine-low.wav`, `car-engine-mid.wav`, `car-engine-high.wav`
- Original files: `loop_0.wav`, `loop_2_0.wav`, `loop_5_0.wav`
- Work: [racing car engine sound loops](https://opengameart.org/content/racing-car-engine-sound-loops)
- Creator: domasx2
- License: [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)
- Note: the source page states that the loops were remade from a public-domain recording. The three selected files differ in pitch and are further staggered and spatialized at runtime.

Attribution is not required by CC0, but the links are retained for provenance and future maintenance.

## Vehicle horn

The click-to-honk sound is synthesized at runtime in `app/coast/audio-engine.ts` from two generated tones with a short envelope. It does not use an external recording.
