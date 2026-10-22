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
if __name__=='__main__':unittest.main()
