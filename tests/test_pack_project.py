import pathlib,subprocess,tempfile,unittest,zipfile

class PreviewSourcePack(unittest.TestCase):
 def test_pack_includes_referenced_object_and_field_effect_assets(self):
  with tempfile.TemporaryDirectory() as folder:
   root=pathlib.Path(folder)/'source';root.mkdir()
   source={'data/layouts/layouts.json':'{"layouts":[]}', 'src/data/object_events/pics.h':'const u16 doll[]=INCGFX_U16("graphics/props/doll.png", ".4bpp");','src/data/field_effects/field_effect_objects.h':'const u32 light[]=INCBIN_U32("graphics/effects/light.4bpp");','src/legends_appearance_graphics.c':'static const u16 sBaseGraphicsIds[2][9]={{0}};','graphics/props/doll.png':'image','graphics/effects/light.4bpp':'raw','graphics/unreferenced.png':'unused'}
   for path,text in source.items():
    p=root/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text)
   out=pathlib.Path(folder)/'pack.zip'
   subprocess.run(['python3',str(pathlib.Path(__file__).parents[1]/'tools/pack_project.py'),str(root),str(out)],check=True,capture_output=True)
   with zipfile.ZipFile(out) as z:
    names=set(z.namelist())
    for name in source:
     self.assertEqual(name in names,name!='graphics/unreferenced.png',name)
