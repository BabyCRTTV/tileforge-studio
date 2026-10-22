# TileForge Studio handoff

Model: GPT-6 | Reasoning: format-specific source editing and conservative binary writeback.

User goal: a tablet-first Android APK and GitHub Pages editor inspired by Porymap and HMA. Primary practical workflow is editing Legends map/tileset source and uploading a small edit ZIP back to chat. User explicitly added Porymap-style collision/elevation viewing and editing during implementation.

## First milestone: 0.1.0 alpha

- Separate public repository: BabyCRTTV/tileforge-studio. Do not edit the Legends game while working on this tool.
- Browser app: dist/index.html, app.mjs, core.mjs, style.css, vendored fflate, PWA manifest and service worker. tools/build.mjs refreshes docs/ for main-branch GitHub Pages publication.
- Source import: full project ZIP or smaller tools/pack_project.py ZIP; live Legends pinned to GitHub commit, lazy map assets. Inspected current source VERSION 0.0.70, 872 layouts and all non-null tileset symbols. Custom General graphics/palettes are declared in src/graphics.c; custom light metatiles are in data/tilesets/legends_lights. FRLG layout_version is literally "frlg".
- Map painting, movement paint/fill/sample/overlay, pixel-index tileset painting, undo/redo, editable ZIP projects with original baselines, IndexedDB source drafts, changed-file ZIP with SHA-256 manifest. apply_changes.py performs an all-files preflight and backs up originals when applying; rejects source mismatches.
- Movement selector: 32 standard walkable/blocked presets across elevations 0–F, separate raw collision 0–3/elevation 0–15 controls, opacity slider, inspect readout. Art mode preserves movement fields. Movement fill uses selected-field boundaries across different metatiles.
- ROM mode: arbitrary appropriately sized .gba input, manually addressed uncompressed 4bpp and hex byte edits, new-ROM export, read-only LZ77 preview. No automated map parsing or decompilation. In-ROM map decoding and compressed graphics reinsertion are future work.
- Android Java shell: local HTTPS assets, no broad storage permission; Android document open/create pickers and bounded chunked export; external HTTPS links open browser; JS save bridge remains on packaged origin. Minimum Android 8, target SDK 35. Compiled using Android 23 API jar because the shell uses APIs available there; target manifest is 35. Native Android behavior has not been tested on a device.

## Validation

- 8 Node tests: all 65,536 block values round-trip, art/movement field isolation, movement fill boundaries and art preservation, PNG index/bit-depth round-trips, 4bpp nibble ordering and write bounds, malformed/valid LZ77, source ZIP filtering including src/graphics.c, custom-symbol resolution, and independent SHA-256 cross-checks (empty, abc, 1 MB, binary).
- 2 Python tests: dry-run/apply/backups and current-file conflict refusal.
- Live browser loaded Legends v0.0.70 and rendered Petalburg with actual project tiles. Demo movement edit readout reported C1/E4; undo restored zero changed files. Browser automatic blob downloads did not emit the cloud browser download event; switched to an explicit Save file link and retained scope for the final test.
- APK compiled and v2/v3 signatures verified. Device installation, stylus input, Android file picker, SAF export, split-screen, and rotation need device validation.

## Boundaries and next work

No event/script/warp editing, resizing, metatile assembly, palette-color editing, engine animations/seasons, emulator, compile toolchain, automated decompilation, or compressed-ROM graphics writeback. Preview uses static daytime source palettes. Full project ZIPs loaded online include map data only for opened layouts; missing layouts can load from the same pinned commit while online.

Before any future APK release, reuse the existing private alpha signing key, preserved privately as TileForge-Studio-Alpha-Signing-Key.jks. It must never enter the public GitHub tree. Only Internet permission is requested. Keep the APK source assets in sync with dist/ and docs/. Keep current .GBA downloads distinct from source edit exports; preserve all owner source paths and baseline hashes.
