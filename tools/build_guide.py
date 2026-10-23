# Requires Python 3, reportlab, beautifulsoup4 and pandoc.
from pathlib import Path
import subprocess,html,re,json,textwrap
from bs4 import BeautifulSoup,Tag,NavigableString
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,PageBreak,Table,TableStyle,KeepTogether,Preformatted
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_LEFT
root=Path(__file__).resolve().parents[1];out=root/'dist/downloads';out.mkdir(parents=True,exist_ok=True)
body=subprocess.check_output(['pandoc',str(root/'USER-GUIDE.md'),'-f','gfm','-t','html5'],text=True)
soup=BeautifulSoup(body,'html.parser')
for t in soup.find_all('table'):
 wrap=soup.new_tag('div',attrs={'class':'table-scroll'});t.wrap(wrap)
css='''*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:74px}body{margin:0;background:#087b7b;color:#243c35;font:17px/1.65 system-ui,sans-serif}.bar{position:sticky;top:0;z-index:2;background:#c8c9c5;border-bottom:3px solid #333;display:flex;gap:18px;align-items:center;padding:12px max(16px,calc((100% - 1020px)/2))}.bar a{color:#123f48;font-weight:750;white-space:nowrap}.bar a:last-child{margin-left:auto}.window{max-width:1020px;margin:32px auto 80px;background:#f7f6ec;border:3px outset #eee;box-shadow:8px 8px #003f43}.titlebar{background:#142d7d;color:white;padding:8px 18px;font-weight:700;font-size:14px;letter-spacing:.04em}main{padding:30px 56px 55px}h1{font-size:clamp(28px,4vw,42px);line-height:1.15;color:#163e35;margin:16px 0}h2{font-size:27px;line-height:1.25;border-top:2px solid #ccd5c5;padding-top:28px;margin-top:48px;scroll-margin-top:72px}h3{font-size:20px;line-height:1.3;margin-top:28px}a{color:#146563}p,li{max-width:86ch}li{padding-left:4px;margin:8px 0}strong{color:#183f37}code{background:#e8ecdf;padding:1px 4px;border-radius:3px;font-size:.88em;overflow-wrap:anywhere}pre{padding:18px;background:#e8ecdf;overflow-x:auto;border-left:4px solid #1f6655}pre code{background:none;padding:0;overflow-wrap:normal}table{border-collapse:collapse;width:100%;font-size:15px;line-height:1.5}th,td{text-align:left;border:1px solid #cbd2c5;padding:12px;vertical-align:top}th{background:#dfe8d6}.table-scroll{overflow-x:auto;margin:24px 0}nav.contents{background:#e7ecdc;padding:18px 24px;margin:28px 0;border:1px solid #bdc9b8}nav.contents ol{columns:2;padding-left:22px;margin:0;font-size:15px}nav.contents a{text-decoration:none}.print{font:inherit;border:2px outset #eee;background:#ddd;padding:4px 12px;color:#243c35;cursor:pointer}@media(max-width:650px){body{font-size:16px}.bar{gap:12px;font-size:13px;flex-wrap:wrap}.bar a:last-child{margin-left:0}.window{margin:12px 8px 30px}main{padding:20px 18px 35px}h2{font-size:24px}nav.contents ol{columns:1}th,td{padding:8px;min-width:120px}}@media print{body{background:white;color:#111;font-size:10pt}.bar,.titlebar,.contents{display:none}.window{border:0;box-shadow:none;margin:0;max-width:none}main{padding:0}h2{break-before:page;margin-top:0}a{color:inherit}pre{white-space:pre-wrap;overflow-wrap:anywhere}table{font-size:9pt}tr,pre{break-inside:avoid}.table-scroll{overflow:visible}}'''
heads=soup.find_all('h2');toc='<nav class="contents" aria-label="Guide contents"><ol>'+''.join('<li><a href="#'+h['id']+'">'+h.get_text()+'</a></li>' for h in heads)+'</ol></nav>'
first=soup.find('h2');first.insert_before(BeautifulSoup(toc,'html.parser'))
htmlpage='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Start-to-finish TileForge guide: load Legends, edit maps, collision, borders, tilesets and NPCs, save drafts, export and integrate."><title>TileForge field guide · 8BitTrade</title><link rel="icon" href="./icon.svg"><style>'+css+'</style></head><body><nav class="bar"><a href="./">← TileForge</a><a href="./editor.html" target="_blank" rel="noopener">Open studio ↗</a><a href="./downloads/TileForge-Field-Guide.pdf" download>Download PDF ↓</a><button class="print" onclick="print()">Print</button></nav><div class="window"><div class="titlebar">TILEFORGE STUDIO / FIELD GUIDE / 0.6.0</div><main>'+str(soup)+'</main></div></body></html>'
(root/'dist/guide.html').write_text(htmlpage)
fonts='/usr/share/fonts/truetype/dejavu/'
for name,file in [('Guide','DejaVuSans.ttf'),('GuideBold','DejaVuSans-Bold.ttf'),('GuideMono','DejaVuSansMono.ttf')]:pdfmetrics.registerFont(TTFont(name,fonts+file))
pdfmetrics.registerFontFamily('Guide',normal='Guide',bold='GuideBold',italic='Guide',boldItalic='GuideBold')
st={}
st['body']=ParagraphStyle('body',fontName='Guide',fontSize=9.2,leading=13.1,textColor=colors.HexColor('#263b34'),spaceAfter=8)
st['h2']=ParagraphStyle('h2',parent=st['body'],fontName='GuideBold',fontSize=18,leading=23,textColor=colors.HexColor('#185346'),spaceAfter=16,keepWithNext=True)
st['h3']=ParagraphStyle('h3',parent=st['body'],fontName='GuideBold',fontSize=11.3,leading=16,spaceBefore=12,spaceAfter=8,keepWithNext=True)
st['table']=ParagraphStyle('table',parent=st['body'],fontSize=8.2,leading=11.4,spaceAfter=0)
st['list']=ParagraphStyle('list',parent=st['body'],leftIndent=17,firstLineIndent=-13,spaceAfter=7)
st['code']=ParagraphStyle('code',fontName='GuideMono',fontSize=7.2,leading=10,textColor=colors.HexColor('#214d43'),backColor=colors.HexColor('#eef2e8'),leftIndent=8,rightIndent=6,spaceBefore=5,spaceAfter=12)
def normalize(s):return s.replace('–','-').replace('—','-').replace('‑','-')
def inline(el):
 if isinstance(el,NavigableString):return html.escape(normalize(str(el)))
 tag=el.name;inner=''.join(inline(c) for c in el.children)
 if tag in ['strong','b']:return '<b>'+inner+'</b>'
 if tag in ['em','i']:return '<i>'+inner+'</i>'
 if tag=='code':return '<font name="GuideMono">'+inner+'</font>'
 if tag=='a' and not el.get('href','').startswith('#'):return '<a color="#146563" href="'+html.escape(el.get('href',''),quote=True)+'">'+inner+'</a>'
 if tag=='br':return '<br/>'
 return inner
class GuideDoc(SimpleDocTemplate):
 def afterFlowable(self,f):
  if isinstance(f,Paragraph) and f.style.name=='h2':
   title=f.getPlainText();key='chapter-'+str(len(self._headings)+1);self.canv.bookmarkPage(key);self.canv.addOutlineEntry(title,key,0,False);self._headings.append(title)
def footer(c,d):
 c.setFillColor(colors.HexColor('#185346'));c.rect(0,808,595.3,34,fill=1,stroke=0);c.setFillColor(colors.white);c.setFont('GuideBold',8);c.drawString(42,820,'8BITTRADE   /   TILEFORGE FIELD GUIDE')
 c.setStrokeColor(colors.HexColor('#cbd3c5'));c.line(42,34,553,34);c.setFillColor(colors.HexColor('#52675d'));c.setFont('Guide',7.2);c.drawString(42,22,'0.6.0 alpha  ·  23 October 2026');c.drawRightString(553,22,str(d.page))
doc=GuideDoc(str(out/'TileForge-Field-Guide.pdf'),pagesize=(595.3,841.9),rightMargin=42,leftMargin=42,topMargin=54,bottomMargin=48,title='TileForge Studio field guide',author='8BitTrade');doc._headings=[]
story=[Spacer(1,36),Paragraph('YOUR NEXT MAP<br/>STARTS HERE.',ParagraphStyle('title',fontName='GuideBold',fontSize=34,leading=39,textColor=colors.HexColor('#185346'),spaceAfter=20)),Paragraph('TileForge Studio field guide',ParagraphStyle('subtitle',parent=st['body'],fontSize=19,leading=25,spaceAfter=16)),Paragraph('A complete reference for loading Emerald: Legends, editing maps and graphics, saving drafts, sharing the required files and getting a tested game build.',ParagraphStyle('lead',parent=st['body'],fontSize=12,leading=19,spaceAfter=20)),Paragraph('LOAD  /  STUDIO  /  EXPORT',st['h3']),Paragraph('For the quickest first session: load Legends, make one small map edit, check movement, save a draft, then export the edits ZIP and a portable project backup.',st['body']),Spacer(1,24)]
for h in heads:story.append(Paragraph(h.get_text(),st['body']))
story+=[Spacer(1,24),Paragraph('<a color="#146563" href="https://babycrttv.github.io/tileforge-studio/guide.html">Online guide and downloads</a>',st['body']),Paragraph('Version 0.6.0 alpha · By 8BitTrade',st['body'])]
# Convert the guide body after the title and link/metadata preamble.
started=False
for el in BeautifulSoup(body,'html.parser').children:
 if not isinstance(el,Tag):continue
 if el.name=='h2':
  started=True;story.append(PageBreak());story.append(Paragraph(inline(el),st['h2']));continue
 if not started:continue
 if el.name=='h3':
  if el.get_text()=='Ideas worth prioritizing':story.append(PageBreak())
  story.append(Paragraph(inline(el),st['h3']))
 elif el.name=='p':story.append(Paragraph(inline(el),st['body']))
 elif el.name in ['ol','ul']:
  for i,li in enumerate(el.find_all('li',recursive=False),1):story.append(Paragraph((str(i)+'. ' if el.name=='ol' else '• ')+inline(li),st['list']))
 elif el.name=='pre' or el.name=='div' and el.find('pre'):
  lines=[]
  code=el if el.name=='pre' else el.find('pre')
  for line in code.get_text().splitlines():
   parts=textwrap.wrap(line,width=106,break_long_words=False,break_on_hyphens=False) or ['']
   for n,part in enumerate(parts):lines.append(('  ' if n else '')+part+(' \\' if n<len(parts)-1 else ''))
  story.append(Preformatted('\n'.join(lines),st['code']))
 elif el.name=='table':
  data=[[Paragraph(inline(cell),st['table']) for cell in row.find_all(['th','td'],recursive=False)] for row in el.find_all('tr')];n=len(data[0]);widths=[155,356] if n==2 else [113,154,244]
  table=Table(data,colWidths=widths,repeatRows=1,hAlign='LEFT');table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e0e9d8')),('GRID',(0,0),(-1,-1),.5,colors.HexColor('#c4cebe')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8)]));story+=[Spacer(1,6),table,Spacer(1,12)]
doc.build(story,onFirstPage=footer,onLaterPages=footer)

print(out/'TileForge-Field-Guide.pdf')
