#!/usr/bin/env python3
"""Pack a pokeemerald-style source project for tablet editing. Excludes ROMs and saves."""
import argparse,pathlib,zipfile,subprocess,json
p=argparse.ArgumentParser(description=__doc__);p.add_argument('project');p.add_argument('output');a=p.parse_args();root=pathlib.Path(a.project).resolve()
paths=[]
for pattern in ['data/layouts/**/*','data/tilesets/**/*','data/maps/**/map.json','data/maps/**/scripts.inc','data/maps/map_groups.json','include/constants/metatile_labels.h','include/constants/metatile_behaviors.h','include/constants/event_objects.h','include/constants/event_object_movement.h','src/data/tilesets/*.h','src/graphics.c','include/fieldmap.h','include/global.fieldmap.h','VERSION']:
    paths.extend(f for f in root.glob(pattern) if f.is_file() and f.suffix.lower() in ('.bin','.png','.pal','.json','.h','.c','.inc',''))
if not (root/'data/layouts/layouts.json').exists():p.error('Not a source project: data/layouts/layouts.json is missing')
try:revision=subprocess.check_output(['git','-C',str(root),'rev-parse','HEAD'],text=True,stderr=subprocess.DEVNULL).strip()
except (OSError,subprocess.CalledProcessError):revision=None
meta={'format':'tileforge-project','formatVersion':1,'source':{'type':'zip','name':root.name,'revision':revision},'baseline':{}}
with zipfile.ZipFile(a.output,'w',zipfile.ZIP_DEFLATED) as z:
    for f in sorted(set(paths)):z.write(f,f.relative_to(root))
    z.writestr('tileforge-project.json',json.dumps(meta))
print('Packed',len(set(paths)),'source files into',a.output)
