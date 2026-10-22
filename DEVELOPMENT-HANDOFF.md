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
- Live browser loaded Legends v0.0.70 and rendered Petalburg with actual project tiles. Demo movement edit readout reported C1/E4; undo restored zero changed files. HTTP preview downloads could not be captured in the cloud browser. On the published HTTPS GitHub Pages app, explicit Save file downloads succeeded. Independently inspected downloaded edit ZIP and editable project: SHA-256 matched, the original baseline matched, exactly one cell changed at (12,10), tile ID 1 was retained, and C1/E4 persisted. The downloaded ZIP passed tools/apply_changes.py dry-run and application against that exact baseline. No game repository was altered.
- APK compiled and v2/v3 signatures verified. Device installation, stylus input, Android file picker, SAF export, split-screen, and rotation need device validation.

## Boundaries and next work

No general script-code editing, resizing, metatile assembly, palette-color editing, engine animations/seasons, emulator, compile toolchain, automated decompilation, or compressed-ROM graphics writeback. Preview uses static daytime source palettes. Full project ZIPs loaded online include map data only for opened layouts; missing layouts can load from the same pinned commit while online.

Before any future APK release, reuse the existing private alpha signing key, preserved privately as TileForge-Studio-Alpha-Signing-Key.jks. It must never enter the public GitHub tree. Only Internet permission is requested. Keep the APK source assets in sync with dist/ and docs/. Keep current .GBA downloads distinct from source edit exports; preserve all owner source paths and baseline hashes.

## Published verification receipt

- GitHub implementation commit: 79acaeb4e9eed2c74ec317da37d418a71d0503fb. Pages workflow run 39780853890: build, deploy, and status jobs succeeded.
- Public app: https://babycrttv.github.io/tileforge-studio/ . Live index, app module, and APK returned HTTP 200 and matched local SHA-256 values. The live browser showed all 32 movement presets.
- APK: docs/downloads/TileForge-Studio-0.1.0.apk, 70,882 bytes; SHA-256 2c6e76ba182fc5297e0af00d12c68e8abb3c9eb43dcdbe61ae465a993d7e781f. v2/v3 signature verification passed. Bundled app.mjs/core.mjs matched dist/ byte-for-byte.
- Additional owner-private Sites deployment succeeded from source commit 69a0ec25969c0eead915d5ae221342dc812f40e4. GitHub Pages remains the requested public delivery.
- Native device runtime remains unverified. Future work should start with Android installation, file picker/export, rotation/split-screen, and touch/stylus testing.

## Website entry and APK download page

Model: GPT-6 | Reasoning: focused entry-page update.

- User requested the main Pages URL offer entering the web app or downloading the APK.
- Root index.html is now a responsive landing page with Open Web App and Download APK actions. The editor moved to editor.html beside the same assets, preserving its origin, source draft storage, and relative file links.
- PWA start_url points to editor.html; the service worker cache includes both pages with a new cache version. Future native builds copy editor.html over their bundled index.html so the installed app still opens straight into editing.
- The existing signed APK is unchanged. This is a website-only navigation update.
- Verified both landing links resolve, editor/APK match the prior release byte-for-byte, dist/docs mirrors match, and PWA start URL targets the editor. Browser QA confirmed the landing layout and Open Web App navigation to a working editor.

## Searchable map tools: 0.2.0 alpha

- New `project.mjs` isolates source metadata, event and dialogue transforms; `studio.mjs` / `studio.css` add searchable touch-sized dropdowns, compatible tileset borrowing, category headers/filter/search, category tagging, NPC/sign/trigger/warp placement and tap-to-edit forms with contextual help.
- A map still uses one primary and one secondary tileset; compatibility is filtered by actual Emerald/FRLG layout format. Changing sets changes only the active layout's references. Map block bytes, collision and elevation stay intact. Missing metatile cells show magenta and changed-source export is blocked until repaired; editable project saves remain available.
- Automatic tile groups derive from source metatile names and behavior IDs. Unlabelled tiles go to Other; manual tags are saved in editable project metadata and local drafts, scoped to the format/tileset pair/metatile ID. These tags are not engine assets.
- Events load from data/maps/<map>/map.json, independently of layouts that may be shared by multiple maps. New events append, preserving existing indices/local IDs. NPC edits preserve trainer/story/unknown fields. Standard signs, triggers and warps are editable; clones, hidden-item/weather events are displayed as markers but remain read-only. No deletion. Pokémon appearance macro expressions are preserved when unchanged; new macro authoring is outside this UI.
- Dialogue adds or replaces only a marked TileForge-owned block in the map scripts.inc. NPC blocks lock/faceplayer; sign/trigger blocks lockall; both release and end. Existing script content is retained. ASCII dialogue wraps at 32 characters with engine escape codes; no arbitrary script code editor. Map JSON and dialogue form one undo entry.
- Offline source packs/import retain data/maps JSON/scripts, map groups and constant headers. Conflict-checked integration now allows exact map.json/scripts.inc paths as well as layouts and tilesets. A conflict in either paired file prevents all writes.
- Browser QA: demo NPC placement at (12,10), searchable appearance selection, dialogue save, tapping its marker to reopen, and undo back to zero changed files. Live Legends loaded all 872 layouts, switched Littleroot's secondary from Petalburg to Rustboro via location search, and filtered a Water group with 129 metatiles. Category headers and all dropdown search controls were observed in the live UI.
- Automated checks: 15 Node tests cover binary invariants plus compatible swaps, semantic groups, label/behavior lookup, NPC story metadata/ID preservation, dialogue block isolation and source ZIP event round-trip. Four Python integration tests include paired map/script application/backups and conflict rejection before either file is written.
- Release uses the same private alpha signing key; APK versionCode 2 / versionName 0.2.0. Bundled assets must be compared with dist after building. Native device runtime, in-game script behavior and game rebuild remain unverified. GitHub Pages root continues to offer web entry and APK download; the native app opens directly into editing.
- APK verification: 91,632 bytes; SHA-256 `5f4d654376f831e6290573695cfe9b1b9d417f81b34ecc27e027adbd07ed0181`. APK v2/v3 signatures passed; signer certificate matches 0.1.0. Bundled editor/app/core/project/studio assets and the docs/dist mirror match byte-for-byte. Android runtime testing remains outstanding.
