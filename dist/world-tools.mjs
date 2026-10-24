import * as C from './core.mjs?v=0.13.0';
const json=b=>JSON.parse(C.strFromU8(b)),encode=d=>C.strToU8(JSON.stringify(d,null,2)+'\n');
export function planCell(files,{name,kind,width,height,templatePath,tile=0,elevation=3}){
 if(!/^[A-Za-z][A-Za-z0-9_]{0,47}$/.test(name))throw Error('Use a name starting with a letter, followed by letters, digits or underscores (48 characters maximum).');
 if(!['interior','exterior'].includes(kind)||![width,height].every(n=>Number.isInteger(n)&&n>=4&&n<=128))throw Error('Choose interior/exterior and dimensions from 4 to 128.');
 if(!Number.isInteger(tile)||tile<0||tile>1023||!Number.isInteger(elevation)||elevation<0||elevation>15)throw Error('Invalid starting tile or elevation');
 const map=json(files.get(templatePath)),catalog=json(files.get('data/layouts/layouts.json')),template=catalog.layouts.find(l=>l.id===map.layout);if(!template)throw Error('Template layout is missing.');
 const groups=json(files.get('data/maps/map_groups.json')),scripts=files.get('data/event_scripts.s');if(!scripts)throw Error('Open a source pack including data/event_scripts.s before creating maps.');
 const constant=name.replace(/([a-z0-9])([A-Z])/g,'$1_$2').toUpperCase(),id='MAP_'+constant,lid='LAYOUT_'+constant;
 if(catalog.layouts.some(l=>l.id===lid||l.name===name)||Object.values(groups).some(v=>Array.isArray(v)&&v.includes(name))||[...files].some(([p,b])=>/^data\/maps\/[^/]+\/map.json$/.test(p)&&json(b).id===id))throw Error('That map name or source ID already exists. Choose another name.');
 const layout={...template,id:lid,name,width,height,border_filepath:`data/layouts/${name}/border.bin`,blockdata_filepath:`data/layouts/${name}/map.bin`};
 const doc={...map,id,name,layout:lid,map_type:kind==='interior'?'MAP_TYPE_INDOOR':'MAP_TYPE_ROUTE',weather:kind==='interior'?'WEATHER_NONE':map.weather,allow_cycling:kind==='exterior',allow_escaping:kind==='exterior',show_map_name:kind==='exterior',connections:null,object_events:[],warp_events:[],coord_events:[],bg_events:[]};
 delete doc.shared_events_map;delete doc.shared_scripts_map;
 const group='gMapGroup_TileForge';if(!Array.isArray(groups.group_order))throw Error('Unsupported map-group catalog.');if(!groups.group_order.includes(group)){if(groups.group_order.length>=255)throw Error('Map group limit reached.');groups.group_order.push(group);groups[group]=[];}if(!Array.isArray(groups[group])||groups[group].length>=255)throw Error('New-map group is full.');groups[group].push(name);catalog.layouts.push(layout);
 const border=files.get(template.border_filepath);if(!border)throw Error('Load the template border before creating a map.');
 const proposed=new Map([['data/layouts/layouts.json',encode(catalog)],['data/maps/map_groups.json',encode(groups)],['data/event_scripts.s',C.strToU8(C.strFromU8(scripts).trimEnd()+`\n\t.include "data/maps/${name}/scripts.inc"\n`)],
 [`data/maps/${name}/map.json`,encode(doc)],[`data/maps/${name}/scripts.inc`,C.strToU8(`${name}_MapScripts::\n\t.byte 0\n`)], [layout.blockdata_filepath,C.encodeBlocks(new Uint16Array(width*height).fill(C.paintBlock(0,tile,0,elevation)))],[layout.border_filepath,border.slice()]]);
 for(const p of proposed.keys())if(p.includes('/'+name+'/')&&files.has(p))throw Error('A source path already exists: '+p);
 return {layout,doc,changes:[...proposed].map(([path,after])=>({path,before:files.get(path),after}))};
}
export function planWarp(files,{sourcePath,x,y,elevation=0,destinationPath,index,returnPoint}){
 const source=json(files.get(sourcePath)),dest=sourcePath===destinationPath?source:json(files.get(destinationPath)),layouts=json(files.get('data/layouts/layouts.json')).layouts;
 const bounds=(doc,p)=>{const l=layouts.find(l=>l.id===doc.layout);if(!l||!Number.isInteger(p.x)||!Number.isInteger(p.y)||p.x<0||p.y<0||p.x>=l.width||p.y>=l.height||!Number.isInteger(p.elevation)||p.elevation<0||p.elevation>15)throw Error('Warp coordinates or elevation are outside the map.');};
 bounds(source,{x,y,elevation});if(!source.id||!dest.id)throw Error('Map IDs are missing.');source.warp_events||=[];dest.warp_events||=[];
 const sourceIndex=source.warp_events.length;if(sourceIndex>=255)throw Error('Source warp list is full.');
 if(source.warp_events.some(w=>w.x===x&&w.y===y))throw Error('A warp already occupies the source tile. Edit that warp instead.');
 if(returnPoint){bounds(dest,returnPoint);if(dest.warp_events.some(w=>w.x===returnPoint.x&&w.y===returnPoint.y)||source===dest&&returnPoint.x===x&&returnPoint.y===y)throw Error('Choose an empty return-warp tile.');index=dest.warp_events.length+(source===dest?1:0);if(index>=255)throw Error('Destination warp list is full.');}
 else if(!Number.isInteger(index)||index<0||index>=dest.warp_events.length)throw Error('Choose an existing destination entrance or create a return point.');
 source.warp_events.push({x,y,elevation,dest_map:dest.id,dest_warp_id:String(index)});
 if(returnPoint)dest.warp_events.push({...returnPoint,dest_map:source.id,dest_warp_id:String(sourceIndex)});
 const paths=[...new Set([sourcePath,destinationPath])];return paths.map(path=>({path,before:files.get(path),after:encode(path===sourcePath?source:dest)}));
}
