# TileForge Studio

The 0.7.0 update integrates missing workflows identified in a [Porymap / Hex Maniac Advance feature audit](REFERENCE-FEATURE-AUDIT.md): rectangular map selection, saved searchable stamps with explicit art/movement policy, a ruler, clean map PNG export, raw ROM byte/ASCII search, pointer navigation/reference candidates, Back/Forward and draft bookmarks. The comparison records partial support and larger remaining gaps; this is not full desktop-tool parity.

Open **Areas & stamps** in Map studio. Select a rectangle by drag or coordinates, copy it, choose the fields, and tap **Stamp** at the top-left destination. Saved stamps are tied to compatible source pairs and travel with drafts and portable projects. In ROM workspace, open **Hex, search & navigation** to find bytes, follow raw pointers or save a named offset. Navigation never changes ROM bytes.

Paint, Fill, Pick and Move labels remain visible at every screen size. Newly opened workspaces start in Move; new source projects select a labelled plain-grass patch when available (Legends General #001). Map changes keep the active tool/valid brush, and drafts retain their saved brush.

The 0.4.2 category audit covers all 171 Legends tileset symbols and reviews the full Littleroot palette. It fixes whole-word/numbered-label matching, inherited Secret Base labels and exact-file custom variant labels, adds puzzle/warp groups, and fills verified gaps with hash-gated artwork annotations. Uncertain tiles remain Other and user groups retain priority. The editor layout and retro landing design are retained.

**[Start-to-finish field guide](https://babycrttv.github.io/tileforge-studio/guide.html)** · **[Download the PDF](https://babycrttv.github.io/tileforge-studio/downloads/TileForge-Field-Guide.pdf)** · [Category audit](CATEGORY-AUDIT.md)

A tablet-first map and GBA graphics editor by **8BitTrade**. Version **0.7.0 alpha**.

**[Website and downloads](https://babycrttv.github.io/tileforge-studio/)** · **[Open the web app](https://babycrttv.github.io/tileforge-studio/editor.html)** · **[Download Android APK](https://babycrttv.github.io/tileforge-studio/downloads/TileForge-Studio-0.7.0.apk)**

## What works

- Guided **Load → Studio → Export** flow. The editor starts at project selection; the practice island is an explicit choice. Open Legends, another source project, a `.gba` file or a saved draft.
- Compact layouts for unfolded portrait/landscape screens and handheld PCs, including the Galaxy Fold and Legion Go. A searchable map strip replaces the left explorer below 1367 CSS pixels. Tool panels open over the canvas. The palette scrolls separately, with larger interface-only tile thumbnails. Below 541 CSS pixels it becomes a drawer so the canvas keeps the full width; small landscape screens also adapt automatically.
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
- Android APK bundles the app for offline use; uses Android's system file picker and Save As picker. Internet is the only requested permission. No login, advertising, telemetry, or broad storage permission.

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
