#!/usr/bin/env python3
"""Inspect or apply TileForge source edits with original SHA-256 checks and backups."""
import re,argparse,hashlib,json,pathlib,zipfile,os,datetime

def apply(archive,root,write=False):
    root=pathlib.Path(root).resolve(); now=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
    with zipfile.ZipFile(archive) as z:
        info=z.getinfo('tileforge-changes.json')
        if info.file_size>1024*1024:raise ValueError('Manifest too large')
        manifest=json.loads(z.read(info));entries=manifest.get('files',[])
        if manifest.get('format')!='tileforge-changes' or manifest.get('formatVersion')!=1 or not entries:raise ValueError('Unsupported or empty change manifest')
        if len(entries)>10000:raise ValueError('Too many changes')
        work=[];seen=set();total=0
        for e in entries:
            name=e['path'];p=pathlib.PurePosixPath(name)
            if name in seen or p.is_absolute() or '..' in p.parts or '\\' in name or ':' in name or str(p)!=name:raise ValueError('Unsafe or duplicate path: '+name)
            if not (name in ('data/maps/map_groups.json','data/event_scripts.s') or name.startswith(('data/layouts/','data/tilesets/')) or re.fullmatch(r'data/maps/[A-Za-z0-9_-]+/(map\.json|scripts\.inc)',name)):raise ValueError('Unsupported write path: '+name)
            seen.add(name);dest=(root/name).resolve()
            if not dest.is_relative_to(root):raise ValueError('Path leaves project root: '+name)
            info=z.getinfo(name);total+=info.file_size
            if info.file_size>32*1024*1024 or total>220*1024*1024:raise ValueError('Edits exceed size limit')
            b=z.read(name)
            if len(b)!=e['size'] or hashlib.sha256(b).hexdigest()!=e['sha256']:raise ValueError('Changed file hash mismatch: '+name)
            old=dest.read_bytes() if dest.exists() else None
            if (hashlib.sha256(old).hexdigest() if old is not None else None)!=e.get('originalSha256'):raise ValueError('CONFLICT: original file changed: '+name)
            work.append((name,dest,b,old))
        # Validate every entry before changing any file. Refuse races again before committing.
        if write:
            backup=root/'.tileforge-backups'/now
            for name,dest,b,old in work:
                current=dest.read_bytes() if dest.exists() else None
                if current!=old:raise ValueError('CONFLICT: file changed during verification: '+name)
            for name,dest,b,old in work:
                if old is not None:
                    target=backup/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(old)
                dest.parent.mkdir(parents=True,exist_ok=True)
                temp=dest.with_name(dest.name+'.tileforge-tmp');temp.write_bytes(b);os.replace(temp,dest)
            print('Applied',len(work),'files. Original files backed up to',backup)
        else:print('Dry run passed:',len(work),'files; all original hashes match. Use --apply to write.')
        return [n for n,_,_,_ in work]
if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('archive');p.add_argument('project');p.add_argument('--apply',action='store_true');a=p.parse_args()
    try:apply(a.archive,a.project,a.apply)
    except (ValueError,KeyError,zipfile.BadZipFile,OSError) as e:p.exit(1,str(e)+'\n')
