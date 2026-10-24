# TileForge Studio field guide

**From your first map edit to a new game build**  
TileForge 0.11.0 alpha · 24 October 2026 · By 8BitTrade

[Open TileForge](https://babycrttv.github.io/tileforge-studio/) · [Open the editor](https://babycrttv.github.io/tileforge-studio/editor.html) · [Read this guide online](https://babycrttv.github.io/tileforge-studio/guide.html)

## 1. Choose the right starting point

For Emerald: Legends maps, use **source mode**. TileForge edits the project's map, graphics and event files. You export those changes, then build the game project to produce a new ROM. Opening an existing `.gba` instead gives you manual graphics and hex editing; it does not unlock source maps or decompile the game.

| What you have | What to open |
| --- | --- |
| The published Legends project, with no unpublished local edits | On the Load screen, choose **Emerald: Legends**. This reads the current public source and pins this session to that commit. |
| A Legends checkout with your own Porymap changes | Make a source pack from that checkout, then choose **Open your files**. This is the way to keep your local changes as the starting point. |
| Another compatible pokeemerald-style project | Open its source ZIP or a source pack. Standard Emerald and FRLG layout splits are supported. |
| A previously exported TileForge project ZIP | Open that ZIP to continue its files, original baselines, pins, custom groups and saved stamps. |
| A draft on this device | Tap its entry under saved drafts on the Load screen. |
| Only a `.gba` file | Use the ROM workspace for known-offset uncompressed 4bpp or hex edits. Ask for the source project to edit maps. |

**Important for your Legends work:** the live Legends button reads GitHub. It cannot see edits sitting only in your local Porymap folder. If you have those edits, import a pack made from that folder.

**Quick help is always nearby:** tap **? Guide** in the header (including on narrow screens), or press **F1**. The quick guide opens over your work. Closing it restores the same workspace. Event, export and review dialogs also offer a small guide link. The full field guide opens separately.

### Install or open

The [TileForge home page](https://babycrttv.github.io/tileforge-studio/) offers **Open Web App** and **Download APK**. In a browser, open the web app. On Android, download the APK, open it through your file manager and follow Android's installer prompts. If Android requests it, allow that particular browser/file manager to install this app. Future updates should install over the same app rather than requiring you to clear its data.

The web app and installed APK have separate draft storage. Moving between them requires an exported editable project. For a first try, Help contains an optional **Offline practice island**. Your real source files are only changed after exported edits are integrated into the game project.

### Check for app updates

Open **Settings** with the gear button in the header, then **Check for updates**. This is available on the Load screen and while editing. Settings shows your current version, the latest checked version, the check time and release notes.

On Android, **Download and install update** downloads the APK inside TileForge and shows progress. The app checks the expected download size and SHA-256, the package name/version and the installed signing certificate. Android then asks you to confirm the update. If prompted, allow updates from TileForge in Android settings and return to the app; it resumes installation. If you cancel, Settings lets you reopen the installer. Installation remains your choice.

Your current workspace is saved as a draft before starting the update. Updating over the existing signed installation keeps app storage, including drafts; do not uninstall first. Keep an exported editable project as a separate backup. If draft saving fails, the update pauses so you can export your work.

In a browser, **Apply web update** saves a draft and refreshes the editor. Resume your saved draft from Load afterward. It verifies that the newer editor entry is available before refreshing. Offline or incomplete releases show a retry message instead of reporting that you are current. Update checks start only when you press Check; there are no background model or update downloads.

Versions before 0.8.0 need one manual APK installation to gain the Settings updater. Future versions can be installed through this menu. Android may require installation permission for TileForge; this is not broad access to your files. Physical-device installation and system permission behavior still require device validation.

### Make a source pack on a computer

Download the [TileForge source](https://github.com/BabyCRTTV/tileforge-studio) and keep its tools folder available. With Python 3 installed, run:

```sh
python3 "/path/to/tileforge-studio/tools/pack_project.py" "/path/to/legends" "legends-source.zip"
```

Replace both example paths with your folders. Transfer `legends-source.zip` to the tablet, then open it in TileForge. The pack excludes ROMs and saves, includes map/event/tileset sources, and preserves source paths. A full source ZIP is also accepted; use the smaller pack if the full archive is too large. The file picker limit is 350 MB; imported source contents have a separate 220 MB limit.

## 2. Load, orient yourself and make a tiny first edit

1. Open TileForge and stay on **1 · Load** until you choose a project or a draft.
2. Choose **Emerald: Legends** for the public project. A new import starts in **Littleroot** when that layout exists. A saved project/draft keeps its previously selected map.
3. Choose **Map studio**. On a wide screen, maps appear in the left explorer. On a compact screen, use the searchable map dropdown above the canvas.
4. Tap **Fit** to frame the map. Use **+ / -** or pinch with two fingers to zoom. A two-finger gesture pans as its midpoint moves and cancels an in-progress paint or stamp. Lift both fingers before painting again. Select **Move** to drag the canvas with one finger without painting. Fit resumes automatic fitting after a rotation or resize.
5. Choose **Tiles** in the palette. In **Collision & display**, leave **Paint collision** and **Paint elevation** off for an artwork-only edit.
6. Choose **Pick**, then tap an existing ground cell. The tile becomes your brush, and the status readout shows X/Y, tile, collision and elevation. Coordinates start at zero at the map's top-left corner.
7. Choose **Paint**, tap one nearby cell, then tap **Undo** to restore it. This confirms the basic editing loop before you make a larger change.
8. Tap **Save draft** and wait for **Draft saved**. Continue with the task below that matches your edit.

On narrow phones, the palette is behind **Tiles** in the toolbar. Selecting a brush closes the drawer and returns to the map. On compact displays, panels open over the canvas; **Done** tucks them away. The app adapts to available CSS viewport space, including system scaling and split-screen; device marketing resolution is not the same thing as that usable space.

### Compare original and edited

In **Map studio**, tap **Original** beside the zoom controls to view the imported baseline. The button becomes **Edited**; tap it to return to your working map. The original view includes the original tileset assignment, pixels, metatile pieces, palettes, map movement, repeated border and event markers when event mode is shown. It uses the baseline preserved with the draft or editable project, not a newly fetched latest game revision. The preview remains static daytime art.

The original canvas is read-only; you can pan or pinch to inspect it. The toggle preserves zoom, scroll, your edits and Undo history. Source editing through other controls returns to the edited view when applied. Changing map or studio also returns to Edited. Export always uses your working edits.

### Resize the tile window

Drag the grip on the tile window's **left edge** left to widen it or right to narrow it. Tile thumbnails rearrange to use the space. The map refits only while **Fit** is active; a manual zoom stays as you set it. The size is remembered on this device separately for portrait/landscape and the narrow phone drawer. Window limits keep the map usable.

On a narrow phone, open **Tiles** first and drag the same grip on the drawer. A keyboard can focus the grip and use **Left/Right** arrows to adjust it; **Home** restores the default size. Resizing only changes the interface, never game tile dimensions or exported files.

## 3. Find the right tile and paint the map

A **metatile** is the 16 × 16 unit you place on a map. The thumbnail is enlarged for your fingers; this does not enlarge the actual game art. A **tileset** supplies many metatiles. A map uses one primary set and one secondary set.

| Palette control | What it does |
| --- | --- |
| **P / S**, source legend and category subheaders | Identify the actual primary or secondary tileset supplying the tile. |
| **Tileset source** dropdown | Show both sets, only the primary, or only the secondary. |
| **Tile category** dropdown | Browse a type such as Cliffs, Water, Signs or Furniture & interiors. Search inside the dropdown. Empty categories are hidden. |
| **Search tiles** | Search names, categories, behaviors, tileset names, location usage or IDs. Try `water`, `Petalburg` or `#01B`. Filters combine. |
| **Pinned** | Show brushes you starred. Select a brush and tap the star beside its source to pin/unpin it. |
| **Used** | Show metatiles present on the active map. This counts map cells, not the border or other maps. |
| **Recent** | Show the last 16 selected brush identities. This is a filter, not a chronological history panel. |
| **Clear filters** | Restore the full primary/secondary palette if a tile seems to have disappeared. |
| **Selected tile → Tile group → Group selected tile** | Override a tile's category. Choose **Automatic group** to remove your override. |

The ID on a thumbnail is its combined map ID, written in hexadecimal. Selected tile details also show its local ID within its own source. Matching numbers in different tilesets do not guarantee matching artwork.

Automatic groups use descriptive source labels, then behaviors, plus a limited artwork review for the exact inspected Littleroot pair. Uncertain tiles stay in **Other**. Your custom grouping has priority. Grouping changes palette organization; it does not change collision, elevation, interactions or game files. Pins and groups travel in editable project ZIPs and drafts, rather than the changed-source ZIP.

### Paint, fill and sample

Select a metatile, choose **Paint**, then tap or drag across the map. One completed stroke becomes one Undo entry. **Fill** replaces a connected region matching the selected field: in art mode this is the same metatile ID, even where movement values differ. Art painting/fill preserves existing collision and elevation. **Pick** samples a cell, including its movement readout; select Paint again to place the brush.

### Copy an area and reuse it as a stamp

1. Open **Areas & stamps** in Map studio. Choose **Select area** and drag from one corner to the other. Alternatively, enter **X**, **Y**, **Width** and **Height**, then choose **Select coordinates**. Coordinates start at zero. The maximum copied area is 64 by 64 cells.
2. Open the panel again and choose **Copy selected area**. This captures the current map cells without changing the map. Events are not copied.
3. Choose what the stamp copies: **Art only** keeps the destination's movement; **Art + collision + elevation** copies complete block values; **Movement only** keeps destination art. The two movement fields are copied together in movement mode.
4. Choose **Stamp**, then tap the destination's top-left cell. One tap makes one Undo entry. Cells beyond a map edge are skipped rather than wrapping to another row. A drag does not place a stamp.
5. For reuse, enter a **Stamp name** and choose **Save stamp**. Search the saved list by name, then tap a preview to use it. Up to 64 stamps save in this project's drafts and portable editable ZIP. They do not appear in the changed-source ZIP because they are editor metadata.
6. The saved list only shows stamps for the active tileset pair and format. A copied art stamp cannot be applied after switching to an incompatible pair; return to the original pair or copy movement only. This protects the meaning of its metatile IDs. Shared graphics may still change when those assets are edited.
7. Choose **Move**, Paint or another regular tool to leave the area tool. **Clear guides** removes selection/ruler outlines. Choosing a normal palette tile leaves Stamp and returns to Paint.

Stamps place a full rectangular snapshot, not a moving selection. They do not remove the original area or create new game tiles. Sparse masks, smart paths and automatic edge joining remain future work.

### Measure and export a clean map preview

Choose **Areas & stamps → Ruler**, then drag between two cells. Reopen the panel to read signed X/Y displacement, Manhattan tile steps and the inclusive rectangle size. Tile steps measure geometry; they do not account for collision or calculate a walkable route. **Clear guides** removes the ruler.

Choose **Map PNG** to export static map artwork at 16 pixels per metatile. Editor selection/grid/movement overlays, event markers and the repeating border are omitted. This is useful for sharing a visual plan; the image does not contain editable source data. Use the changed-source ZIP for integration. Large images above 16,777,216 pixels are refused.

### Use tiles from another location

Each location opens its own saved primary and secondary tilesets. Changing maps clears palette search, category/source and quick filters and resets palette scrolling. The location picker shows the active map. This does not revert an edited tileset assignment: saved source references remain authoritative. You can still search other locations, switch either set, scroll the entire active pair, or apply any category/source filter.

1. Save a draft or editable project before experimenting.
2. Open **Map tilesets**.
3. Search **Use pair from location** to choose an existing location's compatible primary/secondary pair. Alternatively, search **Primary tileset** or **Secondary tileset** to replace just one half.
4. Review the whole map and the border. Existing cell IDs remain the same, so changing a set can change existing artwork throughout the layout. Collision/elevation stay intact.
5. If cells turn magenta, choose available replacement tiles or Undo the swap. Changed-source export is blocked if a changed tileset pair still leaves missing tiles. An editable project can still preserve the unfinished work.

This changes the active layout's references; it does not copy one isolated metatile or add a third tileset. Other source maps sharing this layout also share its visual map data. Location details show where a shared set is used, rather than claiming it belongs to a single town.

### Compact screens, Fold and DeX

At widths up to 1100 CSS pixels, **Tiles** opens a larger brush drawer and leaves the map at full width. On a cover screen or small window, a notice recommends opening the Fold or using a larger window for the full experience. This follows available window space rather than guessing a device model. **Browse & filter tiles** holds the search, source, category and pin filters. Close it to leave more space for artwork; the palette has one scroll area so the last tile remains reachable. Choose a tile to close the drawer, or close it with ×. Larger windows keep the resizable palette alongside the map.

Android windows are resizable for DeX and split screen. Fold/unfold, keyboard and display-size changes retain the current workspace; Fit automatically reframes only while Fit mode is active. Short windows allow the editor to scroll rather than cut off the canvas. Use mouse scrolling, the labelled tools, keyboard shortcuts and the palette resize grip on a monitor. Physical Fold/DeX hardware behavior still needs device testing.

Tap a **?** beside controls for an explanation that stays open until you close it. Help covers map tools, tile filters, shared artwork, movement, borders, stamps, tilesets and events.

## 4. View and edit collision and elevation

**Collision** controls passability. **Elevation** controls which level connects to another. A picture of water, a bridge or a cliff is not enough by itself to set the correct movement.

1. Open **Collision & display**, enable **Movement overlay**, and adjust **Opacity** so the art remains visible. Viewing the overlay alone does not edit anything.
2. Choose **Pick** and tap a working nearby cell to inspect its collision/elevation. For routine edits, copy the values used by the same feature nearby.
3. Open **Tiles** to show the palette on compact screens, then choose **Movement**. Choose **Allow passage** or **Block passage** for a simple collision brush that keeps each cell’s existing elevation.
4. Choose **Paint** and apply the brush to the relevant cells. For height changes, expand **Set passage + elevation together** and select a preset. Those presets replace both fields; artwork is retained. A–F label heights 10–15.
5. For a change to only one field, use **Paint collision** / **Paint elevation** in Collision & display. Enable only what you intend to change; set collision 0–3 and elevation 0–15.
6. Choose **Tiles** when finished, and check the two paint toggles before returning to artwork edits.

| Common elevation | Typical purpose |
| --- | --- |
| **0**, walkable | Transition between different levels, commonly on stairs. |
| **0**, blocked | Common level-independent obstacle setting. |
| **1** | Surf-related level. Copy an existing working shore/water arrangement. |
| **2–E** | Ordinary distinct elevation levels. Many outdoor paths use 3, but inspect the actual map. |
| **F** | Multi-level bridge behavior; preserves the player's approach level. |

These describe the conventional Gen III movement model; the game's engine/scripts and metatile behaviors still determine the result. Do not flatten a cliff or bridge to one value just because it looks connected. Keep raw collision values 2/3 when they already have a project-specific use. A blocked overlay is red, and walkable labels are white. Movement fill follows only the enabled movement fields and can cross different art tiles.

When you export, request a game test that walks the changed route from both directions and checks stairs, surf edges and bridges. An overlay is an editing aid, not a gameplay simulation.

## 5. Change the map border or tileset pixels

### Repeating map border

Open **Map border** above the palette, choose a metatile, then tap the small border-pattern cell you want to replace. Enable **Show around map** to preview the repeated pattern. Undo restores border painting. Source exports include the layout's exact declared border file. The common Emerald pattern is 2 × 2, but declared supported dimensions are retained.

This edits the repeating border pattern. It does not draw connected neighboring maps or resize the map/border. A shared border file affects every layout referencing that file.

### Pixel studio: change the artwork itself

1. Save an editable project before a shared graphics change.
2. Open **Pixel studio**. Choose the primary/secondary **Sheet** and the appropriate display **Palette**. The Palette dropdown chooses the display bank. **Edit palette colors** changes its declared source palette file.
3. Zoom in, choose a color index from 0 to 15, then paint a pixel. Pick samples a pixel's existing index. Color 0 is transparent in upper metatile layers.
4. Return to Map studio to inspect the change. Open another layout using the same graphics to check how the shared edit looks there.
5. Undo if necessary. The exported change is the indexed PNG at its original source path; the palette indices and indexed bit depth are retained.

Pixel painting edits the existing indexed graphics sheet. The separate composition and color editors below change metatile words or source palettes. New-image import is not included. The preview uses static daytime palettes; seasonal transformations, animations, lighting overlays and NPC movement run in the game. The narrowly reviewed artwork categories only apply while their exact inspected graphics/metatile pair still matches; changed artwork can fall back to source-based groups or Other. You can tag it yourself.

### Compose a metatile from 8×8 pieces

1. In **Map studio**, select the metatile you want to change. Open **Selected tile** in the brush palette and choose **Edit selected metatile**.
2. Read the exact source path and expand the shared-layout count. Alias tilesets that declare the same source file are counted too. The list is based on layout/tileset declarations; other engine and seasonal dependencies are not exhaustively counted. Changes apply to all uses, including maps not opened in this session.
3. Tap one of the eight piece buttons: four lower pieces, followed by four upper pieces. Their numbers run top left, top right, bottom left, bottom right.
4. Choose a primary/secondary 8×8 tile thumbnail or enter its global tile ID. Choose an available palette bank and optional horizontal/vertical flips. Emerald uses a primary split at tile 512; FRLG uses 640. Undeclared palettes and new out-of-sheet references are refused.
5. Compare **Current source** with **Proposed tile**. These are static two-layer previews. Upper-layer index 0 is transparent; behavior and engine layer-type attributes are preserved and can change how the game renders the result.
6. Choose **Apply to shared source** to save one Undo entry. Cancel or closing the dialog discards the preview. The app checks that source dependencies are unchanged before writing.

Only the selected 16-byte metatile entry can change. Attribute files, map cells, collision and elevation are retained. The editor does not create new metatile IDs or edit behaviors, terrain or engine layer-type attributes. Unknown layout splits and nonstandard metatile formats are refused. Edited metatiles invalidate exact-hash artwork-category reviews as intended.

### Edit source palette colors

1. In **Pixel studio**, choose the display **Palette**, then **Edit palette colors**. Read the actual palette source path and shared-layout notice.
2. Select a color index. The current and proposed swatches initially match; opening or selecting colors does not change source bytes.
3. Adjust Red/Green/Blue from 0 to 31, or use the color picker. The proposed color is rounded to the game's 5-bit channels. Only that selected color row is staged. Choosing another index discards the un-applied color preview.
4. Choose **Apply to shared source**. The map and pixel preview refresh. Undo restores the original file bytes; Redo reapplies the color. The active Pixel studio sheet and display bank are retained.

The declared JASC-PAL file is edited directly; other rows, newline style and extra palette entries are preserved. The indexed PNG, its embedded palette order, pixel indices and bit depth are not changed by color editing. Global background color 0 is forced black by the engine; upper-layer color 0 is transparent. Alternate nighttime palettes, seasonal tint, lighting, animation and other code references need an in-game check. The runtime's reserved palette banks are not offered as new source bank assignments.

## 6. Add or edit NPCs, signs, triggers and warps

1. Open **NPCs & events**. Confirm **Event map** is the intended source map. Several maps can share a layout, while their events remain separate.
2. Tap a marker or choose it in **Select event** to open its summary. It shows the stored event type, position, appearance, movement, conditions, interaction script or dialogue, and warp destination as applicable. Tap **Edit event** to make changes; **Back to map** leaves everything untouched. A tap works in Move, while dragging still pans. If several events share a position, select the one you want at the top of the summary. Specialized source events can be inspected but remain read-only.

   To edit an existing event, choose **Edit event** from its summary. Markers are **N** (NPC), **S** (sign), **T** (trigger) and **W** (warp); these are source markers rather than animated character sprites.
3. To add an event, tap **+ NPC**, **+ Sign**, **+ Trigger** or **+ Warp**, then tap the desired map cell. On compact screens the controls tuck away so you can place it.
4. Set X/Y and elevation. For an NPC, choose appearance and movement; set movement ranges only if needed. A visibility flag of 0 means no hide flag. Existing story flags should stay unchanged unless you intentionally want different story behavior.
5. For NPCs/signs/triggers, keep **Existing script** when preserving the original interaction. For a simple new conversation, choose **Dialogue text**, enter standard ASCII text and press **Save event**. Existing script blocks remain intact; TileForge creates its own separate block. Changing an existing NPC's interaction to dialogue can replace its story/trainer interaction even though its other metadata is preserved.
6. Tap the saved marker to reopen it and verify the fields. Undo rolls back map metadata and generated dialogue together.

A sign also needs a suitable sign metatile on the map; placing an S marker does not paint the sign artwork. A trigger additionally needs its required variable and value. A warp needs the correct destination map and destination warp **index** (the source list is zero-based). Leave unfamiliar constants alone and describe your intended behavior when sharing edits.

Dialogue is wrapped for the game's text box, with a 1,500-character limit. Use standard letters/punctuation; `$`, backslash, braces and non-ASCII characters are reserved. This is not a general script editor. New events append so existing indices stay in place. Specialized clone NPCs and hidden-item/weather events are displayed but cannot be edited; event deletion is not included.

**Return to tile painting:** close event mode. On compact screens, **Done** keeps event mode active while hiding its controls; tap the highlighted NPCs & events header to reopen the controls, then close the panel. Use Move at any time to pan.

### Review events before sharing

Open **NPCs & events → Review events**, or choose **Review events before sharing** in Export. It checks the active source map and changed loaded maps. For live Legends, it also tries to load their local scripts and named warp destinations. Source packs are checked using their available files.

The review covers numeric event bounds, duplicate NPC local IDs, changed overlapping placements, changed NPC collision/elevation and movement ranges, loaded script labels, incomplete TileForge dialogue blocks, and warp indices in loaded destinations. A finding can describe an intentional story setup. It never blocks export or alters files merely by running.

- **Open event** takes you to the normal event editor.
- **Preview correction** shows the exact field and before/after values when a bounded correction is available. **Apply this correction** changes only that event field and adds an Undo entry. Review again after other edits; stale corrections are refused.
- Overlaps, script identities, story flags and warp destinations require your judgment. The app will not automatically renumber NPCs, pick a different destination or rewrite arbitrary story scripts.
- Expand **Files and references not verified** for missing or external dependencies. “No issues found” only describes these available checks. It is not proof the game is bug-free.

**Optional local AI:** expand **Local AI assistant** and tap **Download / load local AI**. The first load downloads approximately 390 MB of pinned SmolLM2 360M and Transformers.js/ONNX runtime assets from Hugging Face and jsDelivr. Use Wi-Fi and allow several minutes and enough device memory. The model runs on your device in a worker, using CPU/WebAssembly; no API key, AI server or project upload is used. Cached downloads can work offline while browser storage retains them. **Stop / unload** cancels loading/generation and frees the worker; **Remove AI downloads** clears its downloaded cache.

After loading, tap **Ask local AI** on a finding for an explanation and suggested manual test. This small general model is experimental; it is not trained on your complete game and can be wrong. Deterministic source checks supply the evidence and offered field corrections. Model text cannot execute code or apply edits. Neither path simulates arbitrary scripts or story progression. Build and playtest NPC interaction, flags, warps and return trips before keeping the result.

## 7. Navigate a ROM without changing it

Open a `.gba` through **Load → Open your files**, then use **ROM workspace → Hex, search & navigation**. This is manual binary work; use source mode for Legends maps.

- Enter a hexadecimal **Offset** and choose **Read bytes**. Previous/next page moves 256 bytes. **View here as 4bpp** uses that offset and the existing graphics tile count; only uncompressed data can be painted.
- Expand **Find bytes or ASCII**. In hex mode enter pairs such as `DE AD ?? EF`; `??` matches one arbitrary byte. At least one fixed byte is required. ASCII mode searches literal printable characters, case-sensitively, and does not decode Pokémon dialogue. Choose **Find**, then tap a result or use **Previous match / Next match**. At most the first 200 matches appear. Search yields between chunks so the interface stays responsive.
- If the selected four bytes form an in-range little-endian `08`/`09` ROM address, **Follow pointer** jumps to it. **Back / Forward** revisit navigation jumps. A raw candidate may be coincidental; the tool does not understand Thumb pointers, table types or story logic.
- **Find pointers to this offset** searches raw references. Default candidates start on four-byte boundaries. **Include unaligned candidates** broadens the scan. Results are evidence to inspect, not proof every reference belongs to a particular asset. Nothing is repointed automatically.
- Enter **Name this offset → Add bookmark** to keep a named location. Filter bookmarks by name or hexadecimal offset, tap to jump, or Delete to remove one. Up to 100 bookmarks and the selected offset are retained with **Save draft**. They are not embedded in an exported `.gba`; Back/Forward and search results are temporary.

Search, ruler, selection, image export and navigation do not write game data or create game-file Undo entries. ROM **Write byte** and uncompressed pixel painting do write the local working copy and support Undo. The original ROM is retained for draft recovery; export a new `.gba` copy when ready. There is no automatic ROM map detection, ROM table expansion, compressed graphics writeback or decompilation.

## 8. Save drafts, undo mistakes and make backups

| Save option | Use it for | What to remember |
| --- | --- | --- |
| **Save draft** / automatic draft | Pausing and resuming on the same browser/app | Keeps original files and undo/redo history. Wait for Draft saved. Drafts are local to this app/origin, not cloud sync. |
| **Export → Save editable project** | Portable source backup or moving between web and APK | Keeps loaded source files, original baselines, chosen map, pins, category tags and saved stamps. Reopening starts a new undo history. Live-source exports contain only maps/assets already loaded; more can load online from the pinned revision. |
| **Export → Share edits ZIP** | Sending source changes for review/integration | Contains changed files and a hash manifest. It is not a complete workspace or a ROM. |
| **Export edited GBA** in ROM mode | Keeping your manual ROM changes | Creates a new ROM copy. Source projects cannot use this route to compile a ROM. |

Automatic drafts run after changes. Use the explicit button and inspect its success label before closing the app. Clearing browser storage, uninstalling the app or changing origins can remove access to drafts. Export a portable project at meaningful milestones.

The labelled **Undo** button shows the number of available edits; **Redo** restores an undone edit. Undo spans map, collision, border, tileset pixel and event changes. Pins, category tags and saved stamps are editor preferences and do not add game-file Undo entries.

Keyboard shortcuts, when focus is outside an input or dialog: **B** Paint, **F** Fill, **I** Pick, **H** Move, **Ctrl/Cmd+Z** Undo, **Ctrl/Cmd+Shift+Z** Redo, **Ctrl/Cmd+S** export an editable source project (or a ROM copy in ROM mode). Ctrl+S is a portable export, not Save draft.

After a set of edits has been integrated, open a fresh source pack or a fresh live session based on that integrated revision before starting the next batch. An old draft intentionally keeps its old baseline; re-exporting cumulative changes from it can conflict with files already integrated.

### Delete old drafts

Choose **Load**, find the saved draft and tap **Delete**. The confirmation identifies the project and timestamp. Deleted drafts stay on this device and can be restored; deleting is not a portable backup or a way to clear their storage. Export a portable project first if you need a backup. Confirming moves that device copy to **Deleted drafts**, where **Restore** recovers it with its original baseline and undo history; it does not delete exported files or the open workspace. If the deleted draft was open, pending autosave is cancelled and the app does not immediately recreate it. Your next edit or explicit **Save draft** creates a new draft. Other drafts keep their own identity and baselines.

## 9. Export and send the required files back to chat

1. Press **3 · Export**.
2. Open **Review changed files**. For a map edit you normally see its `map.bin`; a border edit adds `border.bin`; a tileset swap changes `data/layouts/layouts.json`; pixels change a `.png`; events change the map's `map.json`, and new dialogue also changes `scripts.inc`. Actual paths follow your source project.
3. If an unrelated file appears, go back and inspect/Undo the accidental change.
4. Choose **Share edits ZIP**. In the browser, the next dialog is **Save to your device → Save file**. In the APK, use Android's Save As picker. Finish that save action so the ZIP actually exists on the device.
5. Also save an **editable project** for your own backup.
6. Attach the edits ZIP to chat. Include the note below. Attach the editable project too if your custom categories/pins or full working context matter.

Suggested handoff note:

```text
Project: Emerald: Legends
Started from: live source / my local source pack
Map/layout: LittlerootTown_Layout
Changed area: X __ to __, Y __ to __
Intent: describe the visual or movement change
Also changed: collision / border / pixels / events / none
Local Porymap edits to preserve: describe them
Please compare the manifest baselines, show the diff, integrate
only matching files, then build and test the changed area.
```

A screenshot can help explain intent, but the ZIP supplies the exact files and original hashes. You do not need to upload a ROM for source integration. The app does not push to GitHub, update the game repository or publish a game release when you press Export.

## 10. Integrate, build and check the result

If you hand the ZIP back to chat, the integration work can be done there. If doing it yourself, keep a backup/branch of your current game checkout and use the helper from the **TileForge** repository:

```sh
python3 "/path/to/tileforge-studio/tools/apply_changes.py" "TileForge-edits.zip" "/path/to/legends"
```

This is a dry run. It compares every original file hash and checks the changed bytes before writing anything. If all files match, apply:

```sh
python3 "/path/to/tileforge-studio/tools/apply_changes.py" "TileForge-edits.zip" "/path/to/legends" --apply
```

Original files are backed up under `.tileforge-backups/<timestamp>/` in that game checkout. Inspect the source diff, including paired map/script edits. If you see **CONFLICT: original file changed**, stop and reconcile the current files against the exported baseline; do not overwrite the current file or remove the manifest's check. This is how your other Porymap work is protected. The preflight catches source mismatches; the helper is not a version-control merge tool.

With the Legends build environment already installed according to its [INSTALL.md](https://github.com/BabyCRTTV/pokeemerald-emerald-legends/blob/master/INSTALL.md), run the appropriate build in the **Legends game folder**:

```sh
make release
```

The Legends README documents `make release` for the normal player build and `make` for the Debug/developer build. Use its current build pipeline and output paths; TileForge itself does not install the compiler or build the ROM. Source editing does not require the TileForge APK to become an emulator.

Test the built result: inspect the whole edited area, walk from each approach, try changed doors/warps, read signs, talk to NPCs and verify shared graphics in another affected map. For bridges/stairs/water, test the relevant elevations and shore crossings. Keep your original game/save backup and test a copy. A successful compilation alone does not prove the movement or event logic is correct.

## 11. Troubleshooting and next improvements

| What you see | What to do |
| --- | --- |
| A tile seems missing from the palette | Press Clear filters; check the active P/S source and category. It may be in Other. |
| A category looks wrong | Select the tile, open Selected tile and set Group selected tile. Save a draft/project. Report the source name and #ID for a future automatic fix. |
| A category vanished after editing pixels | Reviewed artwork annotations require exact inspected bytes. Your source labels/behaviors and manual tags still work. |
| Magenta map or border cells | The active pair lacks those metatile IDs. Replace them or Undo the tileset swap before sharing. |
| Touching the map will not paint | Choose Paint, turn off event mode, and confirm you are in Map studio with Tiles selected. |
| Artwork stays unchanged while painting | Check Paint collision / Paint elevation. Movement tools intentionally retain artwork. |
| The map looks wrong in Pixel studio | Try the palette actually used by the metatile. A single sheet can be referenced with several palettes. |
| An imported pack cannot open a map | It may lack that map or custom assets. Make a complete source pack from the actual working checkout. |
| Live Legends cannot load | Check connectivity or open a previously exported project/source pack. Live assets need network access. |
| A draft does not appear on another device | Drafts are local. Export/import an editable project to transfer work. |
| The game ROM opens without maps | Open source files for map editing. Automatic ROM map detection and decompilation are not included. |
| Export says no changed files | Category tags/pins alone are not game edits, or all game edits were undone. Save an editable project to keep preferences. |

### Ideas worth prioritizing

These are proposals beyond 0.11.0; the current tools are described above:

1. **Before/after export preview and affected-map list.** Show changed cells and which maps share an edited graphics/border/layout file before integration. This would make shared asset edits easier to review.
2. **Sparse stamps and smart edges.** Extend the shipped rectangular stamps with transparent cells and optional path/shore edge joining. Porymap's prefabs and smart paths are useful references.
3. **Batch category review and portable category packs.** Select several unknown tiles, assign a group once, and share a small versioned metadata file without sending the whole project. Keep provenance and exact asset checks.
4. **Draft names and checkpoints.** Let you name milestones, compare them and return to a checkpoint, while keeping the current Undo behavior.
5. **A focused gameplay check after integration.** Complement Review events with a local test build that checks movement, flags and return warps in the actual game. This needs game/build tooling beyond the source checker.

The highest-value next feature is the before/after export preview: it helps you verify exactly what you will send and catches unintended shared changes early.

### Sources and scope

This guide follows the TileForge 0.11.0 source and its actual UI labels. Feature comparison: [REFERENCE-FEATURE-AUDIT.md](https://github.com/BabyCRTTV/tileforge-studio/blob/main/REFERENCE-FEATURE-AUDIT.md). Category audit: [CATEGORY-AUDIT.md](https://github.com/BabyCRTTV/tileforge-studio/blob/main/CATEGORY-AUDIT.md). The editor is an independent alpha inspired by [Porymap](https://huderlem.github.io/porymap/) and [Hex Maniac Advance](https://github.com/haven1433/HexManiacAdvance).

Reference reading: Porymap's [map tiles and borders](https://huderlem.github.io/porymap/manual/editing-map-tiles.html), [collision model](https://huderlem.github.io/porymap/manual/editing-map-collisions.html), and [tileset label/behavior documentation](https://huderlem.github.io/porymap/manual/tileset-editor.html). Build commands: [Legends README](https://github.com/BabyCRTTV/pokeemerald-emerald-legends#building). Porymap's documented capabilities are references, not claims that TileForge implements all of them.

Browser viewport checks and automated source/binary tests support this release. Physical Android installation, file-picker/export behavior, Fold/Legion Go hardware and in-game behavior need testing on those devices/builds. Source previews are static daytime views. No map resizing, metatile attribute editor, animation playback, arbitrary script editor, compressed ROM graphics reinsertion, general ROM map detection or automated decompilation is included.

### Asset and local AI sources

The Fuecoco app sprite is the front sprite from the pinned [Emerald: Legends source](https://github.com/BabyCRTTV/pokeemerald-emerald-legends/blob/7cf9a7bfcb515ad33b4840ce38cd7d2e88008b8d/graphics/pokemon/fuecoco/front.png), based on RHH/pokeemerald-expansion; see its [contributors and sprite credits](https://github.com/rh-hideout/pokeemerald-expansion/blob/master/CREDITS.md). Pokémon/Fuecoco belong to their respective rights holders. The local assistant uses HuggingFaceTB's [SmolLM2](https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct), the [ONNX Community conversion](https://huggingface.co/onnx-community/SmolLM2-360M-Instruct-ONNX) and [Transformers.js](https://huggingface.co/docs/transformers.js). These assets do not change ownership of game artwork.

## Create a cell and connect a doorway

In Map studio choose **New cell**, give it a unique source name (letters/digits/underscores), choose **Interior** or **Exterior**, and select a template with matching artwork. Choose a size from 4 to 128 tiles per side. **Preview cell** lists the exact files; **Apply** creates a blank map with its own layout, events, border and script. It inherits the template's tilesets and header settings, without its NPCs, warps, connections or story scripts. Paint the new floor/ground and walls next. Tile #000 is only a starting fill; it is not automatically a suitable floor in every tileset.

New cells append a separate map group so existing map IDs stay in place. The source ZIP must include `data/maps/map_groups.json` and `data/event_scripts.s`; current editor packs include these. Online Legends loads them as needed. Creating maps is source-project work; arbitrary GBA ROMs do not expose this feature.

For a doorway, open **NPCs & events**, choose **+ Warp**, and tap its map tile. Alternatively **Link warp** opens the wizard with editable source coordinates. Choose a destination cell, then choose an existing entrance by its coordinates or keep **Create a return warp linked back here** enabled and set an empty destination tile. **Create a new interior first** creates a cell and returns to the link wizard. Preview shows all affected source files before Apply. Existing warp entries are appended to rather than renumbered. One Undo restores the whole link or creation operation.

Warp events alone do not make ordinary floor trigger a warp: paint suitable doorway/stair/warp metatiles, check movement and elevation, run **Review events**, then save a draft and export. Test both directions in the rebuilt game. The **Next** guidance beneath the toolbar suggests the next action. Cell creation and linking do not automatically integrate into the game repository or build a ROM.

## Windows desktop

The Windows x64 installer bundles the same editor modules as Android and web. File pickers and export downloads run through the desktop window. Drafts live in the desktop app's local profile. Settings checks the official version information and opens the matching Windows release page after saving a draft; run the downloaded installer to replace the application. The alpha installer is unsigned. Windows packaging verifies bundled file hashes and launches the packaged editor in CI; that does not replace testing your own exports and gameplay.
