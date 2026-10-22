import unittest,tempfile,pathlib,json,zipfile,hashlib,sys
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parents[1]/'tools'))
from apply_changes import apply
class Integration(unittest.TestCase):
 def make(self,root):
  p=pathlib.Path(root)/'data/layouts/Test/map.bin';p.parent.mkdir(parents=True);p.write_bytes(b'old');z=pathlib.Path(root)/'changes.zip';entry={'path':'data/layouts/Test/map.bin','size':3,'originalSha256':hashlib.sha256(b'old').hexdigest(),'sha256':hashlib.sha256(b'new').hexdigest()}
  with zipfile.ZipFile(z,'w') as f:f.writestr(entry['path'],b'new');f.writestr('tileforge-changes.json',json.dumps({'format':'tileforge-changes','formatVersion':1,'files':[entry]}))
  return p,z
 def test_dry_run_apply_and_backup(self):
  with tempfile.TemporaryDirectory() as d:
   p,z=self.make(d);apply(z,d);self.assertEqual(p.read_bytes(),b'old');apply(z,d,True);self.assertEqual(p.read_bytes(),b'new');self.assertEqual(next(pathlib.Path(d).glob('.tileforge-backups/**/map.bin')).read_bytes(),b'old')
 def test_conflict_blocks_overwrite(self):
  with tempfile.TemporaryDirectory() as d:
   p,z=self.make(d);p.write_bytes(b'owner-edit')
   with self.assertRaisesRegex(ValueError,'CONFLICT'):apply(z,d,True)
   self.assertEqual(p.read_bytes(),b'owner-edit')
 def paired(self,root):
  root=pathlib.Path(root);files={'data/maps/Test/map.json':(b'{"object_events":[]}',b'{"object_events":[{"x":2}]}'),'data/maps/Test/scripts.inc':(b'Existing::\n\tend\n',b'Existing::\n\tend\nNew::\n\tend\n')};entries=[]
  z=root/'npc.zip'
  with zipfile.ZipFile(z,'w') as out:
   for name,(old,new) in files.items():
    p=root/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(old);out.writestr(name,new);entries.append({'path':name,'size':len(new),'originalSha256':hashlib.sha256(old).hexdigest(),'sha256':hashlib.sha256(new).hexdigest()})
   out.writestr('tileforge-changes.json',json.dumps({'format':'tileforge-changes','formatVersion':1,'files':entries}))
  return z,files
 def test_npc_map_and_script_apply_together(self):
  with tempfile.TemporaryDirectory() as d:
   z,files=self.paired(d);apply(z,d);apply(z,d,True)
   for name,(old,new) in files.items():
    self.assertEqual((pathlib.Path(d)/name).read_bytes(),new)
    self.assertEqual(next(pathlib.Path(d).glob('.tileforge-backups/**/'+name)).read_bytes(),old)
 def test_script_conflict_leaves_npc_map_untouched(self):
  with tempfile.TemporaryDirectory() as d:
   z,files=self.paired(d);(pathlib.Path(d)/'data/maps/Test/scripts.inc').write_bytes(b'owner story edits')
   with self.assertRaisesRegex(ValueError,'CONFLICT'):apply(z,d,True)
   self.assertEqual((pathlib.Path(d)/'data/maps/Test/map.json').read_bytes(),files['data/maps/Test/map.json'][0])
if __name__=='__main__':unittest.main()
