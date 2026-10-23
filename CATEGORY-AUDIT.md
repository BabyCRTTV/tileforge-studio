# Category audit - TileForge 0.4.2

23 October 2026. Source inspected: Emerald: Legends 0.0.70, commit `7cf9a7bfcb515ad33b4840ce38cd7d2e88008b8d`.

The audit covered the labels and behavior attributes of all **171 tileset symbols**, **131 unique metatile files**, and **171 active primary/secondary combinations** referenced by **872 layouts**. Artwork samples were rendered and inspected for Littleroot outdoors, Brendan's house, Granite Cave, Pacifidlog, Sootopolis Gym, the Vermilion Fan Club, Oak's lab and a red-cave Secret Base. The complete 656-entry General/Petalburg palette was also reviewed. This does not assert a visual review of every metatile across the whole game.

## Findings and fixes

- Whole-word matching prevents `MB_INDOOR_ENCOUNTER` from matching "door," and "Flash" from matching "ash." Numbered labels such as `Escalator1F` and `Painting0` still work.
- Added singular stair warps, bike rails, Pacifidlog log bridges, hot springs, rock climb, wardrobes, kitchen/dresser/cup objects, laptops and generators. Water beneath a bridge stays Water rather than becoming a bridge deck.
- Added **Puzzles & switches** and **Warps & transitions** for meaningful functional groups. Generic arrow warps no longer imply a door or a puzzle floor. "No running," directional impassability, indoor encounters and reserved/unused behaviors are insufficient evidence to infer artwork.
- Custom Legends variants reuse labels from declarations that point at the **exact same metatile file**. Underscore variations such as GeneralFrlg / General_Frlg match. Similar names or a shared attribute file alone do not authorize label reuse. Actual source provenance stays the custom symbol.
- Primary namespaces can intentionally label secondary IDs, as in Secret Base decorations. The secondary's own label takes priority; changing to an unrelated primary does not retain those inherited labels.
- Source comments are ignored; an unsupported label expression is left unresolved instead of accidentally parsing its first number as an ID.
- Added a limited, independently written artwork review for General + Petalburg. It contains category/ID annotations and file hashes, **no game artwork**. All four inspected primary/secondary PNG/metatile files must match SHA-256 before it applies. The review fills only Other; explicit labels/behaviors and user tags retain priority. Blank and uncertain entries remain Other.

## Littleroot palette coverage

These counts compare the original 0.4.1 source classifier with 0.4.2 for the inspected General + Petalburg pair, before optional map-event hints. They count all 656 available metatiles, including unused/blank entries, rather than map cells.

| Group | Before | After |
| --- | ---: | ---: |
| Cliffs | 52 | 130 |
| Water | 113 | 127 |
| Signs | 0 | 1 |
| Buildings & doors | 12 | 135 |
| Stairs & bridges | 6 | 19 |
| Trees & plants | 18 | 105 |
| Ground & paths | 5 | 28 |
| Rocks & caves | 6 | 13 |
| Fences & edges | 0 | 24 |
| Warps & transitions | 0 | 1 |
| Other | 444 | 73 |

Thus, 583 of 656 entries have a supported group, up from 212. One additional otherwise-unknown tile is classified as a sign through conservative Littleroot sign-event evidence in the live map, giving 72 Other and 2 Signs there. Map hints apply only if every use of that tile has a sign event. They are context-dependent, not a new global label.

Across the entire metadata inventory, descriptive labels were recovered for **2,314 source-local identities**, up from **637**. **2,035** category assignments changed. **26,029 of 34,522** source-local identities still remain Other. Many entries are blank, unused or labeled only MB_NORMAL; filling all of them from a tileset's name would create false certainty. The symbol-local totals count variants sharing the same assets separately, and use the first actual pair when context differs. They are not a count of unique visible artwork.

## Ongoing review

Select a tile and inspect its source, local ID and reason. Override with **Selected tile → Tile group → Group selected tile**; **Automatic group** removes the override. Manual groups/pins are saved in drafts and editable projects, not written into the game's source or changed-file export. The reviewed-artwork profile deliberately stops applying after its source graphics/metatile pair changes.

High-value follow-ups are batch category tagging, portable versioned category packs and a visual review queue with primary/secondary context. A category should describe the useful foreground object rather than a background word such as "Wall" on a plant's wall variant. No pixel-based automated classifier is used.

## Reproduce the inventory

With a local source checkout (no ROM needed):

```sh
node tools/audit_categories.mjs /path/to/legends report.json
```

The script reads source files without changing them. It outputs metadata coverage and the per-tile assignment/reason, including the exact-asset artwork review when applicable. Map-event hints and local user overrides are intentionally excluded from this inventory. Its optional report contains metadata only; do not commit source graphics or ROMs.

Regression checks cover namespace isolation, exact-file aliases, primary/secondary inherited-label precedence, unsupported expressions/comments, numbered labels and whole words, reserved behaviors, bridge-under-water distinctions and hash-gated artwork annotations. Existing map bit/PNG/ZIP/conflict tests remain in place. Full automated result: **27 Node tests + 4 Python tests passed**.

References: [Porymap metatile labels/behaviors](https://huderlem.github.io/porymap/manual/tileset-editor.html), [Legends metatile labels](https://github.com/BabyCRTTV/pokeemerald-emerald-legends/blob/7cf9a7bfcb515ad33b4840ce38cd7d2e88008b8d/include/constants/metatile_labels.h), [Legends behaviors](https://github.com/BabyCRTTV/pokeemerald-emerald-legends/blob/7cf9a7bfcb515ad33b4840ce38cd7d2e88008b8d/include/constants/metatile_behaviors.h). These are format/evidence references; TileForge is independently implemented.
