# TileForge Studio

The editor includes the compact-screen work: full-width map and larger Tiles drawer on Fold-sized windows, a cover-screen notice, one scrollable palette with collapsible filters, resizable Android/DeX windows, simple passage brushes that keep elevation, and persistent beginner explanations beside the controls. Hardware Fold/DeX behavior remains unverified.
It also includes two-finger pinch zoom/pan, a one-tap **Original / Edited** source-map comparison, and a tile window you can resize by its left-edge grip. Original renders the imported baseline, including shared tiles/palettes, movement, borders and visible events, with a read-only canvas and unchanged Undo. Palette widths persist by orientation; manual zoom is retained while resizing.

The 0.6.0 update integrates missing workflows identified in a [Porymap / Hex Maniac Advance feature audit](REFERENCE-FEATURE-AUDIT.md): rectangular map selection, saved searchable stamps with explicit art/movement policy, a ruler, clean map PNG export, raw ROM byte/ASCII search, pointer navigation/reference candidates, Back/Forward and draft bookmarks. The comparison records partial support and larger remaining gaps; this is not full desktop-tool parity.

Open **Areas & stamps** in Map studio. Select a rectangle by drag or coordinates, copy it, choose the fields, and tap **Stamp** at the top-left destination. Saved stamps are tied to compatible source pairs and travel with drafts and portable projects. In ROM workspace, open **Hex, search & navigation** to find bytes, follow raw pointers or save a named offset. Navigation never changes ROM bytes.

Paint, Fill, Pick and Move labels remain visible at every screen size. Newly opened workspaces start in Move; new source projects select a labelled plain-grass patch when available (Legends General #001). Map changes keep the active tool/valid brush, and drafts retain their saved brush.

The 0.4.2 category audit covers all 171 Legends tileset symbols and reviews the full Littleroot palette. It fixes whole-word/numbered-label matching, inherited Secret Base labels and exact-file custom variant labels, adds puzzle/warp groups, and fills verified gaps with hash-gated artwork annotations. Uncertain tiles remain Other and user groups retain priority. The editor layout and retro landing design are retained.

**[Start-to-finish field guide](https://babycrttv.github.io/tileforge-studio/guide.html)** · **[Download the PDF](https://babycrttv.github.io/tileforge-studio/downloads/TileForge-Field-Guide.pdf)** · [Category audit](CATEGORY-AUDIT.md)

A tablet-first map and GBA graphics editor by **8BitTrade**. Version **0.17.0 alpha**.

**[Website and downloads](https://babycrttv.github.io/tileforge-studio/)** · **[Open the web app](https://babycrttv.github.io/tileforge-studio/editor.html)** · **[Download Android APK](https://babycrttv.github.io/tileforge-studio/downloads/TileForge-Studio-0.17.0.apk)**

## What works

- Guided **Load → Studio → Export** flow. The editor starts at project selection; the practice island is an explicit choice. Open Legends, another source project, a `.gba` file or a saved draft.
- Compact layouts for unfolded portrait/landscape screens and handheld PCs, including the Galaxy Fold and Legion Go. A searchable map strip replaces the left explorer below 1367 CSS pixels. Tool panels open over the canvas. The palette uses one scroll area and collapsible filters, with larger interface-only tile thumbnails. At widths up to 1100 CSS pixels it becomes a drawer so the canvas keeps the full width; small landscape screens also adapt automatically.
- A labelled Undo button with an available-edit count; Ctrl+Z / Ctrl+Shift+Z still work. Device drafts save automatically after edits or immediately with Save draft. Multiple source/ROM drafts appear on the Load screen and retain undo/redo history and original baselines. Local drafts depend on this browser/app's storage; editable project exports provide portable backups.
- Source map border painting and repeating-border preview. Borders load from their original `border_filepath`, use declared dimensions or the Emerald 2 × 2 default, preserve movement bits, support undo and export the exact changed border file. Border resizing and connected-map rendering are outside this release.

- Open Pokémon Emerald: Legends directly from its public source, pinned to a specific commit. Browse 872 layout entries in the source inspected for this release; only the assets for selected maps are downloaded.
- Open a pokeemerald-style source ZIP or a saved TileForge project.
- Paint map metatiles; fill connected areas; sample a cell; pan and zoom; undo and redo. Copy rectangular areas, save/search reusable stamps, copy art/movement/both, measure tile distances and export clean map PNGs.
- View movement as an adjustable-opacity overlay, with white/red elevation labels like Porymap's walkable/blocked display. Choose any of the 32 standard elevation/collision presets, including transition (0), surf (1), and multi-level (F). Inspect coordinates, metatile ID, collision, and elevation. Edit collision values 0–3 and elevation 0–15 independently, or paint both. Movement fills preserve artwork and use the selected movement fields as their boundary.
- Borrow primary/secondary tilesets from compatible locations through searchable dropdowns. Existing cell collision/elevation is preserved. Missing metatiles appear magenta and must be replaced before sharing a tileset change.
- Browse metatiles under category headers, with a separate searchable category filter (cliffs, water, signs and more), tile search and custom category tags saved in editable projects. Automatic categories use source labels and behaviors plus a limited exact-asset artwork review; unknown tiles can be tagged manually.
- Add and edit NPCs, signs, trigger events and warps in source mode. Tap a marker for a read-only summary, including its position, appearance, movement, conditions, script/dialogue and warp destination where applicable. Choose Edit event to open its editing controls. Move-mode taps inspect events while drags still pan. Keep an existing script or create simple dialogue. Map metadata and generated dialogue undo together; original story/trainer fields and existing event order are preserved.
- Search dropdowns throughout the app; tap the small help buttons for tablet-friendly tooltips.
- Edit indexed tileset PNG pixels in Pixel studio, with the map's palette. Shared graphics changes immediately appear when returning to maps that use them.
- Search ROM hex bytes (`??` wildcard) or literal ASCII, follow in-range raw 08/09 pointers, search aligned/unaligned pointer candidates, navigate pages and Back/Forward, and save named offsets with ROM drafts. These are raw binary tools, not automatic structured data detection.
- Open any appropriately sized `.gba` file for hex edits or manual-offset uncompressed 4bpp graphics edits; save a new `.gba` copy. GBA LZ77 graphics preview is read-only.
- Export **only changed source files** with original paths, original/changed SHA-256 hashes, source commit, and editor version. Save complete editable projects with baseline data. Local source and ROM drafts use IndexedDB.
- Android APK bundles the app for offline use; uses Android's system file picker and Save As picker. Internet and Android package-install permission are requested for in-app updates. No login, advertising, telemetry, or broad storage permission.

## Legends workflow

1. At **Load**, choose **Emerald: Legends**, **Open your files**, or a saved draft. For unpushed local Porymap edits, import a ZIP made from that local checkout instead.
2. In **Studio**, choose a layout in the explorer or searchable map strip. Use **Tiles** for artwork or **Movement** for collision/elevation.
3. Open **Map tilesets** to borrow sets, or **NPCs & events** to add an event and tap its position. Close the event panel to resume tile painting. Use **Pixel studio** for indexed tileset graphics. These assets may be shared by many maps.
4. Use **Save draft** to pause on this device. In **Export**, review the changed paths, then choose **Share edits ZIP → Save file**. Upload that ZIP back to chat.
5. Before integration, verify hashes against the current game checkout. `python3 tools/apply_changes.py edits.zip /path/to/legends` performs a dry run. Add `--apply` to apply verified files and back up the originals. It refuses to overwrite mismatched files.
6. Build Legends with its existing build pipeline to make a new game ROM. TileForge does not modify the game repository, releases, saves, or builds itself.

## Current limits

This is a working first alpha, not a Porymap or Hex Maniac Advance replacement. GBA engines use different data formats: loading an arbitrary ROM does **not** provide automatic map recognition. For Legends map editing, source mode is the supported route. A compiled ROM cannot automatically recover the original decompilation project, comments, source paths, and symbols.

Source support targets the standard two-layer / 16-byte Gen III metatile format. Emerald uses 512 primary tiles/metatiles and six primary palettes; FRLG layouts use 640 and seven. Source headers resolve Legends' custom lighting paths and declarations in `src/graphics.c`. The preview composites static metatile layers and daytime palettes; NPCs/events appear as labelled source markers. It does not run the engine's animation, seasons, NPC movement, runtime overlays or scripts. Null secondary tilesets are handled. Unknown tiles appear magenta. Specialized clone NPCs, hidden-item/weather events and general script code are not editable. Existing function-based Pokémon appearance expressions are preserved but cannot be authored here. Event deletion is omitted to preserve existing IDs. Simple dialogue accepts standard ASCII text and wraps at 32 characters; engine compilation and in-game behavior still require testing in the game project. No map resizing, metatile attribute editor, automated ROM map profiles, emulator, ROM rebuilding, automated decompiler, or compressed-ROM graphics writeback is included.

Exports preserve the original collision/elevation bits during art painting; source PNGs preserve palette indices and indexed bit depth. A modified PNG is re-encoded, so its compressed bytes will differ. No-op painting preserves the original PNG bytes. A saved project includes only currently loaded map binaries when opened from GitHub; the metadata retains the pinned revision so more maps can load online.

The signed APK's build and signatures were verified. Installation and Android file-picker/export behavior require physical device testing. Keep exported projects when trying this alpha. Browser testing covered source and ROM draft recovery with working undo history, border painting/preview, map coordinates with borders shown, the guided flow and viewport checks for folded-device portrait/landscape and handheld layouts; see `DEVELOPMENT-HANDOFF.md` for the final verification record.

## Development

No npm dependencies are needed at runtime or to build the static app. fflate 0.8.2 is vendored under its MIT license.

```sh
node --test tests/*.test.mjs
python3 -m unittest discover -s tests -p 'test_*.py'
node tools/build.mjs
```

GitHub Actions is enabled with owner approval, and Pages uses `.github/workflows/pages.yml` to publish `docs/` after the round-trip checks. The web app and signed APK are distributed together through Pages. Run **Publish TileForge Pages → Run workflow → main** if an API-created commit does not trigger publication automatically. The public landing page uses a responsive retro desktop design; the editor keeps its existing layout. `dist/index.html` is the landing page, `dist/editor.html` is the editor, and `dist/` contains their shared assets; `node tools/build.mjs` refreshes the tracked Pages copy.

To prepare a source pack: `python3 tools/pack_project.py /path/to/legends legends-source.zip`.

Android uses a minimal Java WebView shell with bundled assets, HTTPS asset interception, navigation restrictions, and a chunked file-export bridge. `android/build.sh` documents the required SDK tools, R8, and signing inputs. A persistent signing keystore must be reused for upgrade-compatible APKs. Never publish the keystore. Build output is ignored.

## Inspiration and credits

- [Porymap](https://github.com/huderlem/porymap) and its [collision editor documentation](https://huderlem.github.io/porymap/manual/editing-map-collisions.html): source-first workflow, metatile palette, movement selector, and undo/redo concepts.
- [Hex Maniac Advance](https://github.com/haven1433/HexManiacAdvance): approachable binary exploration and game-specific editor concepts.
- [pret/pokeemerald](https://github.com/pret/pokeemerald), [RHH pokeemerald-expansion](https://github.com/rh-hideout/pokeemerald-expansion), and [Emerald: Legends](https://github.com/BabyCRTTV/pokeemerald-emerald-legends): source format references.
- [fflate](https://github.com/101arrowz/fflate), MIT license, for ZIP and zlib support.

TileForge is an independent implementation. No Porymap/HMA implementation code or game ROMs are bundled. The practice island uses original programmatically drawn sample assets. Nintendo, Pokémon, Porymap and Hex Maniac Advance are not affiliated with this project. Imported source assets retain their original rights.

To rebuild the reference guide, install Python packages `reportlab` and `beautifulsoup4` plus `pandoc`, then run `python3 tools/build_guide.py`. This creates `dist/guide.html` and its downloadable PDF. The normal static build needs no Python guide dependencies.

## Earlier workflow updates

Location switches reset palette filters and scrolling to that layout's actual saved primary/secondary pair. The searchable location/pair selector starts on the current location; borrowed tilesets and saved pair edits remain editable.

**Review events** offers advisory integrity findings for the active and changed loaded maps, coverage notes, event-editor links and previewed, undoable field corrections. An optional on-device SmolLM2 360M assistant explains the supplied findings; download size is about 390 MB and CPU/WASM inference requires enough device memory. It runs in a worker; no project data is sent to a model server. Small-model text is experimental, cannot apply edits, and does not prove arbitrary game logic.

Saved drafts have individual Delete controls with confirmation and autosave race protection. The header's **? Guide** remains reachable on phones and supports F1, with contextual links inside dialogs. Fuecoco is now the web/PWA/APK icon. See [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) for provenance and pinned AI assets.

### 0.7.0 source tileset editors

Map studio → Selected tile → **Edit selected metatile** previews and edits the eight 8×8 pieces, palette banks and flips. Pixel studio → **Edit palette colors** edits one declared JASC-PAL color using 5-bit RGB channels. Both show exact source paths and shared-layout references, stage changes until Apply, reject stale dependencies and create one Undo entry. Metatile attributes and engine layer types remain unchanged; static previews still need in-game validation.

### 0.7.1 export guidance

The source Export panel now explains: save the edits ZIP to your device, upload it back to chat for current-source checks and integration, then rebuild/test the game. Export does not automatically update the source folder or GitHub. Save editable project is identified as a portable TileForge backup. ROM export shows separate-copy guidance instead of source integration instructions.

### 0.8.0 Settings and updates

Use the header gear → Settings → Check for updates. Android downloads the APK in private storage, verifies size/hash/package/version/signer, and opens Android confirmation. Only Internet and REQUEST_INSTALL_PACKAGES permissions are declared; installation permission remains under Android control. The browser can save a draft and refresh after verifying the new editor is published. Both paths save an open workspace as a draft first; failed saves pause the update. Older APKs need this version installed manually once.

Release process: update package/core/Android versions and package release notes, build and sign the APK with the existing key, then run `node tools/build.mjs`. The build prepares `dist/update.json` from the actual signed APK bytes and mirrors everything into docs. Never edit its size/hash manually or bundle the update manifest into the APK; publish metadata and APK in the same Pages deployment.

### Source cell creation and guided warp links (0.11.0)

New cell creates an interior/exterior with independent source files from a selected artwork template. Link warp chooses a destination entrance by coordinates, can append a paired return point, and can create a new interior first. Preview/Apply, stale-source guards and one-step Undo protect each operation. Direct Next guidance suggests painting, linking, reviewing and exporting. New files retain their missing-original baseline in portable projects.

Windows x64: [Download installer](https://github.com/BabyCRTTV/tileforge-studio/releases/download/windows-v0.17.0/TileForge-Studio-0.17.0-Setup.exe). Windows uses the same bundled editor assets as APK and web; CI verifies hashes and launches the packaged application before release. Unsigned alpha installer. Source creation requires map_groups.json and data/event_scripts.s, included by the updated pack tool.


### More Porymap-inspired tools (0.12.0)

More map tools now offers source map properties, mirrored cardinal and dive/emerge connections with an alignment diagram, replace-all artwork with collision/elevation preserved, and wraparound terrain shifting. All use Preview/Apply, stale guards and one-step Undo. Terrain shifting deliberately leaves events and script coordinates in place with explicit acknowledgement. Ctrl+Y also redoes edits. Connected terrain rendering, coordinated resizing and encounter editors remain future work.


### Beginner workflow and draft capacity (0.13.0)

Tools & tasks presents common goals first, with additional map operations under More map tools. The next-step action opens the relevant brush, Paint tool or event review. Map-setting names and doorway labels use friendlier wording while source values stay intact. New-area names may include spaces; the source name uses underscores.

Each app/browser profile supports 10 active drafts total across source and ROM workspaces. Saving an existing draft remains allowed at capacity. Creating or restoring a draft requires a free slot; deletes remain recoverable and no draft is removed automatically. Existing profiles with more than 10 drafts keep their data but cannot add another until below the limit. Capacity checks occur in one IndexedDB read/write transaction, including concurrent tabs.

NPC/event selectors, NPC appearance choices and summaries now show small static source sprite previews. Explicit graphics-info/frame/image declarations resolve PNGs or uncompressed 4bpp with a supported source palette. Custom asset paths are retained; missing/dynamic/ambiguous mappings show a placeholder. Source-only loads pin to the imported revision and never modify game files. Sprites are lazy-loaded for visible entries; proprietary sprite assets are not bundled in TileForge.

### Full NPC sprite catalog (0.14.0)

**NPC catalog & placed events** defaults to **All NPC sprites**, with searchable pictures from the project's object graphics definitions rather than the current terrain tileset or placed NPCs. Choose a sprite, then tap a map cell to add it. **On this map** keeps existing events and their read-only summaries available. **+ Add NPC · all sprites** opens the same catalog. Missing preview assets do not hide choices; runtime-variable slots and source range/count constants are not fixed character sprites.

### Deleted draft cleanup (0.15.0)

Under **Load → Deleted drafts**, **Delete permanently** removes one deleted snapshot and **Clear deleted drafts** removes the reviewed deleted list. Both require confirmation and permanently remove its baseline/history from this device. Active/restored drafts and open work remain available. Restore and the ten active draft slots are unchanged.

Browser storage/UI regression checks: set `TILEFORGE_PLAYWRIGHT` to your Playwright module and `TILEFORGE_CHROMIUM` to a Chromium executable, then run `node tests/drafts.browser.mjs`. The harness uses an isolated browser profile and real IndexedDB.

### System safe areas (0.17.0)

Android now places the WebView inside a native FrameLayout that handles status/navigation bars, display cutouts, mandatory gesture space, keyboard insets and desktop captions. It changes the actual web viewport rather than padding the WebView. Handled insets are forwarded as zeros to avoid duplicate or stale padding. Browser/PWA overlays share usable-viewport bounds, and short floating tool panels scroll inside those bounds. Install the matching APK to update its native shell. Physical Fold/DeX devices still require user-device verification.

Run `tests/safe-area.browser.mjs` with the same Playwright/Chromium variables as the draft test. `tools/build_inset_tests.sh` builds a separate, same-signer Android instrumentation APK for API 30+ native bounds/zero-inset checks; it is not part of the release installer. See the script for its emulator command.

### Visible menu close buttons (0.17.0)

Floating tool menus have a top-right × that stays visible while scrolling. Tap × or press Escape to review **Close this menu?**, then choose **Keep menu open** or **Close menu**. Closing NPCs & events exits event mode; Done tucks its controls away for continued placement. APK, Windows and web share these controls.
