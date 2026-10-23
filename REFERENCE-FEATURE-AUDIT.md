# Porymap and Hex Maniac Advance feature audit

Reviewed 23 October 2026 for TileForge 0.6.0; source editors extended in 0.7.0. This is a feature and architecture audit of the primary manuals, UI entry points and relevant implementation/tests. It is not a claim that every source line was reviewed or that either desktop application was run on Android. TileForge remains an independent implementation.

## Reproducible reference snapshots

| Reference | Snapshot | Evidence inspected |
| --- | --- | --- |
| [Porymap](https://github.com/huderlem/porymap) | `26b919d7ff4b54152de010abd5bf344af2ebe116` | All 16 manual topic files under `docsrc/manual`, changelog/README, editor and prefab interfaces, prefab serialization/compatibility, map-image exporter, tileset/palette editor entry points. The scripting manual was inventoried by API family rather than treating its callbacks as implemented features. |
| [Hex Maniac Advance](https://github.com/haven1433/HexManiacAdvance) | `c8de1e8acf753522af7feed810d6324ce52474a3` | README, Wiki User Guide/interface/pointer documentation; EditorViewModel commands and find/navigation flow; ViewPort/Goto interfaces; map, table, sprite, code and image/text editor entry points; FindTests and model format resources. |

Porymap's reference covers navigation, map tiles, collisions, events, headers, connections, encounters, map creation, region maps, tilesets/palettes, project files, settings, shortcuts, breaking changes and scripting. Its tileset manual explicitly warns that some content predates 6.0; the source and changelog were consulted where relevant. HMA targets English Ruby, Sapphire, Emerald, FireRed and LeafGreen with reduced capabilities for other files. Its structured-ROM support does not imply that arbitrary modified engines have an identical layout.

## Comparison and integration decisions

“Existing” means a working TileForge capability before this audit, not desktop parity. “Added” means shipped in 0.6.0. “Partial” and “Deferred” identify concrete remaining gaps.

| Feature family | TileForge status | Result and remaining limits |
| --- | --- | --- |
| Source project navigation and map list | Existing / partial | Searchable layouts, local source ZIP and pinned live Legends. No map-group reordering or map creation. |
| Paint, fill, sample, pan, zoom and grid | Existing | Field-preserving single-metatile tools and connected field fills. No smart paths, pattern fill, map shift or straight-path constraint. |
| Rectangular map copy | Added | Touch/stylus drag selection and precise coordinate fallback, up to 64 by 64 cells. A copied area is a snapshot; events are excluded. |
| Reusable prefabs | Added as stamps | Name, preview, search, reuse and delete up to 64 project stamps. Saved in drafts and portable project metadata. Matching source symbols, paths and layout format required for artwork. No bundled game prefabs, sparse masks or Porymap-prefab file import. |
| Multi-field area placement | Added | Art only, movement only, or full block words. Art keeps destination collision/elevation; movement keeps destination artwork. Each tap is one Undo. Edge clipping is disclosed. |
| Ruler | Added | Signed X/Y displacement, Manhattan tile steps and inclusive rectangle dimensions. This measures geometry, not an engine pathfinding route. |
| Map image export | Added | Source-resolution static art PNG, without grid, markers, selection, border or collision overlays. No connected-map stitching, animations or edit-history GIF. |
| Collision/elevation | Existing | Adjustable overlay, standard 32 presets and independent raw fields. No custom project bit-mask configuration. |
| Repeating map border | Existing / partial | Paint and preview original border with Undo. No resizing or connected-map rendering. |
| Tileset switching | Existing | Search by compatible location, primary or secondary; original source symbols and paths retained. |
| Metatile discovery | Existing | Categories, provenance, search, pins, recent and current-map usage. No whole-project unused-tile deletion tool. |
| Metatile composition/properties | Added / partial (0.7.0) | Edit eight 8×8 piece IDs, flips and palette banks with before/after preview, declared shared-asset impact, stale guards and one Undo. Exact 16-byte entry patching; no behavior, terrain or layer-type writer. |
| Indexed graphics | Existing / partial | Source PNG pixel-index editing, preserving palette order/bit depth. No external-image import. Source palette RGB editor added in 0.7.0. |
| Palette editing and animation | Added / partial (0.7.0) | Explicit source JASC-PAL color editing with 5-bit RGB, preserved other rows/newlines, shared declaration references and Undo. No engine animation/seasonal playback or exhaustive code dependency tracking. |
| Events | Existing / partial | Standard NPC/sign/trigger/warp add/edit, first-tap factual summaries and owned dialogue blocks. Specialized events are inspectable; no delete/renumber, bulk move, heal-location or arbitrary script editor. |
| Event integrity guidance | Existing | Advisory deterministic checks and previewed safe fixes; optional local AI explains evidence. Neither interprets complete game logic. |
| Map header/properties | Deferred | Preserve metadata; no weather/music/running/location header form. Engine expressions and shared location names require validation. |
| Map connections and dive/emerge | Deferred | No connection writer or mirrored reciprocal connection editor. Requires consistent two-map changes and seam preview. |
| Resize, new maps/layouts | Deferred | Avoid changing engine limits, event bounds, map IDs or connection offsets without a complete validation path. |
| Wild encounters | Deferred | No encounter groups/slot weights/species/level editor or distribution chart. Legends time/season/custom tables need source-specific adapters. |
| Region/town map | Deferred | No region background tilemap, section layout or section-entry editor. |
| Custom scripting/plugins | Deferred | No arbitrary project script execution; existing generated dialogue stays isolated. |
| Hex inspection and byte edits | Existing / improved | Page previous/next, raw dump, byte writer with Undo and graphics jump. No typed structured table view. |
| ROM search | Added | Hex bytes with whole-byte `??`, literal case-sensitive printable ASCII, previous/next and tappable results. First 200 matches, chunked scan. Pokémon text encoding and HMA's structured searches remain unsupported. |
| Pointer navigation | Added / partial | Follow in-range little-endian 08/09 ROM pointers, Back/Forward, and raw pointer-reference candidates with aligned/default or unaligned search. No semantic anchor inference, Thumb decoding, pointer edits or automatic repointing. |
| Named locations | Added as bookmarks | Searchable named offsets, jump/delete, retained with ROM drafts. Not HMA TOML anchors and not embedded in the exported ROM. |
| Structured ROM profiles/tables/text | Deferred | No auto anchors, species/moves/trainers/evolution table editor, ROM event-script compiler or safe table expansion. Requires engine/version profiles and relocation tracking. |
| ROM graphics | Existing / partial | Known-offset uncompressed 4bpp writes and LZ77 read-only preview. No compressed writeback, sprite/palette pairing or ROM map decoder. |
| Binary comparison, patches, expansion | Deferred | No HMA-style semantic diff, IPS/BPS patch workflow or automatic free-space allocation. Existing full-copy export and baseline hashes remain. |
| History and saving | Existing / improved | Undo/Redo, autosaved independent drafts and soft deletion, portable source projects, changed-file ZIP/hash checking. New stamp metadata and ROM bookmarks survive their respective drafts. |

## How to use the additions

Open **Areas & stamps** in Map studio. Select an area with a drag, or enter X/Y/Width/Height and choose **Select coordinates**. Choose **Copy selected area**, select the fields to copy, then **Stamp** and tap its top-left destination. Give it a name and **Save stamp** for later. The list shows only the current tileset pair. **Ruler** measures without writes; **Clear guides** removes its drawing. **Map PNG** exports a clean image for discussing proposed edits.

In ROM workspace, expand **Hex, search & navigation**. Enter a hex offset and **Read bytes**. **Follow pointer** is available for an in-range candidate; **Find pointers to this offset** lists raw references. Expand **Find bytes or ASCII**, choose a format and search. Tap results or use Previous/Next. Add a named bookmark and **Save draft** to retain it on this device. These navigation actions do not add game-file Undo entries.

## Prioritized follow-up work

1. **Metatile attribute and engine layer-type editing** remains after 0.7.0 composition/palette editors. New writers must verify engine-specific masks and preserve every unrelated attribute bit.
2. **Connections with adjacent-map preview**, reciprocal updates in one undoable transaction, offset/seam checks and lazy loading of destination assets.
3. **Map properties and encounter adapters** for the inspected Legends revision, with explicit unsupported-expression handling and preservation of unknown fields.
4. **Smart paths and sparse stamps**, after configurable 3-by-3 brush mappings and transparent cells are represented safely. Current stamps place a complete rectangle.
5. **Versioned ROM profiles**, typed pointer/table models and compression/relocation checks before offering HMA-style structured writes. Generic byte searching is not a substitute for this infrastructure.

## Primary evidence links

- [Porymap map tools and prefabs](https://huderlem.github.io/porymap/manual/editing-map-tiles.html), [events and ruler](https://huderlem.github.io/porymap/manual/editing-map-events.html), [connections](https://huderlem.github.io/porymap/manual/editing-map-connections.html), [tileset/palette editor](https://huderlem.github.io/porymap/manual/tileset-editor.html).
- [Pinned Porymap prefab implementation](https://github.com/huderlem/porymap/blob/26b919d7ff4b54152de010abd5bf344af2ebe116/src/ui/prefab.cpp), [map-image exporter](https://github.com/huderlem/porymap/blob/26b919d7ff4b54152de010abd5bf344af2ebe116/src/ui/mapimageexporter.cpp).
- [HMA interface](https://github.com/haven1433/HexManiacAdvance/wiki/Overview-of-the-Interface), [pointers/anchors](https://github.com/haven1433/HexManiacAdvance/wiki/Pointers-and-Anchors), [pinned command/search flow](https://github.com/haven1433/HexManiacAdvance/blob/c8de1e8acf753522af7feed810d6324ce52474a3/src/HexManiac.Core/ViewModels/EditorViewModel.cs), [FindTests](https://github.com/haven1433/HexManiacAdvance/blob/c8de1e8acf753522af7feed810d6324ce52474a3/src/HexManiac.Tests/Before_Baseclass/FindTests.cs).

Porymap is LGPL-3.0; HMA is MIT. Their implementation code, game prefabs and artwork are not bundled. New modules were authored independently from the documented workflows and binary formats. Existing third-party assets and runtime notices remain in THIRD-PARTY-NOTICES.md.
