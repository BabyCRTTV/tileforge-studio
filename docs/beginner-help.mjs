// Explanations remain open until dismissed; source data never enters innerHTML.
const topics={
 movement:['Player movement',
  'Start with Pick on a nearby tile that already works in game. It copies that cell’s passage and elevation values into the controls.',
  'For a simple wall or floor fix, choose Collision, then Walkable or Blocked, then choose Paint and drag over cells. These brushes keep each cell’s height and tile art. Undo reverses the whole stroke.',
  'Fill replaces the connected area matching the fields you enabled. For a small correction, use Paint first. Fill can cross different-looking tiles when only collision is enabled.',
  'Elevation is a connection level, not the height of a drawing. Adjacent paths usually need compatible levels; bridges can use different levels above and below. Level 0 is a transition, 1 is commonly used for water, and F is a special multi-level value. Copy an existing working example rather than guessing.',
  'The passage + elevation presets replace both fields. A–F are hexadecimal labels for 10–15. Advanced movement also provides advanced collision values 2 and 3; retain them unless you know the project’s rules.',
  'The overlay is a preview: red marks nonzero collision and green marks passable cells; optional numbers show elevation. Tile behavior, events and scripts also affect movement, so confirm the result in the rebuilt game.'],
 tools:['Map tools',
  'Move pans the map without painting. Pinch with two fingers to zoom and pan. Fit frames the map again after manual zoom.',
  'Paint changes cells under your stroke. Fill changes a connected matching area. Pick samples a cell; in art mode it selects its tile, and it also loads its collision and elevation values into the controls.',
  'Tiles mode paints artwork while preserving movement. Collision mode enables passage painting while keeping art. Check Advanced movement before painting if you changed the advanced field toggles.',
  'Original shows the imported baseline without changing your work. Edited returns to your current version. Save draft keeps work on this device; Export creates files you can keep or send for integration.',
  'Keyboard: B Paint, F Fill, I Pick, H Move; Ctrl/Cmd+Z Undo, Shift+Ctrl/Cmd+Z Redo, Ctrl/Cmd+S editable project, F1 Guide. Mouse wheel scrolls the canvas; use + / − or pinch to zoom.'],
 areas:['Areas and stamps',
  'Select area: drag a rectangle over the map. Copy selected area turns it into a reusable stamp. Choose Stamp, then tap where its top-left corner should go.',
  'Art only keeps destination movement. Movement only keeps destination artwork. Art + collision + elevation replaces all three. Art stamps require the same tileset pair; events are not copied.',
  'Save stamp stores it with your drafts and editable projects. Ruler measures tile steps without changing files. Map PNG saves a static picture, not an editable game map.'],
 border:['Map border',
  'The border pattern repeats outside the map’s playable rectangle. Show around map previews that repeated pattern.',
  'Select a tile brush, then tap a border cell to replace its artwork. This changes the declared border file, not the map size or connections. Undo restores it.'],
 filters:['Finding tiles',
  'Show all tilesets starts checked. Interior/Exterior narrow the list in one tap. Another pair opens a preview before explicit Apply, with Undo. A map combines a primary and secondary tileset. Tileset source filters this list; it does not replace either set. Tile category and search narrow the list further.',
  'Pinned shows your starred tiles, Used shows tiles already on this map, and Recent shows recent brushes. Clear filters shows the complete active pair again.',
  'To change which tilesets the map actually uses, open Map tilesets. Changing that pair can change existing artwork, so inspect the result before exporting.'],
 shared:['Shared artwork',
  'A metatile is a 16 × 16 map tile assembled from smaller 8 × 8 pieces. Editing its composition changes every map using that source entry.',
  'Pixel studio changes shared image pixels. Palette editing changes shared colors. These can affect many locations, so review the displayed source paths and preview before Apply. Undo restores the change.']
};
export function createBeginnerHelp({$}){
 const dialog=$('contextHelp');
 for(const [id,topic] of [['brushToggle','tools'],['categoryControls','filters'],['editMetatile','shared']]){
  const target=$(id),button=document.createElement('button');button.type='button';button.className='help-tip';button.dataset.help=topic;button.textContent='?';button.setAttribute('aria-label','Help: '+topics[topic][0]);target.after(button);
 }
 // Tool help stays in its own row so core tool names remain readable.
 $('brushToggle').nextElementSibling.classList.add('tools-help');
 document.addEventListener('click',event=>{
  const button=event.target.closest('[data-help],[data-tip]');if(!button)return;
  const [title,...paragraphs]=topics[button.dataset.help]||[button.getAttribute('aria-label')||'Explanation',button.dataset.tip];
  $('contextHelpTitle').textContent=title;const body=$('contextHelpBody');body.replaceChildren();
  for(const text of paragraphs){const p=document.createElement('p');p.textContent=text;body.append(p);}
  if(!dialog.open)dialog.showModal();
 });
}
