# TileForge Studio development

Read DEVELOPMENT-HANDOFF.md before changes. This is a companion editor in its own repository, not the Legends game.

- Primary platform: Android tablets, landscape first; preserve touch targets, stylus/pointer input, and usable smaller-screen behavior.
- Preserve owner Porymap edits. Import/export source paths exactly. Compare original SHA-256 before integration. Never blindly overwrite current game files or modify the game repository automatically.
- Map block fields: metatile bits 0–9, collision bits 10–11, elevation bits 12–15. Editing any field must preserve the others. Collision fills must preserve visual tile IDs.
- Preserve indexed PNG pixel indices, palette order, and bit depth. Resolve actual source symbols and custom asset paths; do not assume conventional tileset directories. FRLG layouts have a different primary tile/metatile/palette split.
- Keep the APK, web app, help and README consistent. Never claim universal map detection, automated decompilation, ROM rebuild, or Android runtime verification without evidence.
- Keep the APK keystore private and reuse it for future updates. Never commit it to this public repository. It is excluded from Git.
- Run focused binary/round-trip and conflict checks after parser/export changes. Use the connected GitHub tools for repository writes. Publish the generated docs/ mirror for Pages, and verify the live app and APK before reporting them complete.
- Update the handoff at each milestone with verification and outstanding limitations. No game ROMs or proprietary tool code may be committed.

- Preserve the Load → Studio → Export entry flow: never open an editing map before the user chooses a project or draft. Keep the practice island an explicit choice.
- Check compact layouts in both orientations and at handheld-PC scaling. Keep the map canvas within the usable viewport, tool panels reachable, thumbnails larger than source pixels, and Undo labelled.
- Drafts must retain original baselines, independent project identities, and binary undo/redo entries. Cancel a pending autosave before replacing its workspace. Border editing must write only the declared border file and preserve unrelated block bits.

- The owner explicitly approved enabling GitHub Actions for this repository on 2026-10-22. Pages uses the prepared Actions workflow; routine future publications do not need that same permission requested again. Keep landing-page aesthetic changes scoped to the landing page unless the user also asks to restyle the editor.

- New Legends/source imports prefer Littleroot when present; saved project/draft selections take priority. The optional offline practice island lives in Help. Never skip the project Load stage.
- Category inference must use descriptive labels, behaviors or conservative map-event evidence. Strip tileset namespaces before classifying; keep uncertain tiles in Other. Preserve legacy pair-scoped category keys while writing new tags/pins by format, source symbol and local metatile ID. Show actual primary/secondary provenance and location usage without implying a borrowed set was copied from one unique map.
- Keep the release query on editor module/CSS URLs, relative module imports, and service-worker precache URLs consistent when releasing, so existing browser caches cannot silently retain old code. Android asset URLs use their path; query versions must remain compatible with bundled assets.

- Reviewed artwork categories must require the exact inspected primary/secondary PNG and metatile hashes and fill only Other. Keep uncertain/blank entries unclassified; primary inherited labels must not leak to unrelated pairs. Guide changes should preserve the distinction between local drafts, portable projects, changed-source exports and the separate game build.

- Keep Paint, Fill, Pick and Move text visible at all viewport widths. New source/ROM workspaces open in Move; new source projects prefer explicitly labelled plain grass, then short-grass behavior, with a valid first-tile fallback. Preserve the active tool across ordinary map changes and the saved brush when restoring drafts.

- Location switches reset palette browsing filters/scroll to the layout's current saved tileset pair, without reverting edited pair references. Event review is advisory: disclose unloaded/external dependencies and never promise arbitrary script correctness. Only deterministic, previewed, stale-guarded corrections may write source fields, with Undo. Local-model output is plain text with no executable/source-write path. AI assets load on explicit request and cache separately from editor updates.
- Draft Delete moves a snapshot to Deleted drafts, preserving baselines/history for Restore. Serialize deletion/restoration behind pending writes; detach the open draft and cancel its pending autosave before deleting it. Keep the header Guide entry visible on every viewport and preserve the workspace beneath guide dialogs.

- Existing event markers and Select event open a read-only summary first; Edit event is explicit. Move-mode taps may inspect a marker or complete explicitly chosen event placement, but drags/cancelled captures must keep panning without opening a summary. Preserve overlapping-event selection and read-only inspection of specialized events; never infer a script's full purpose from its label.
