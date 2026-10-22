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
