#!/usr/bin/env python3
"""REVIEW-ONLY MRXPANEL 1200x630 Open Graph PNG. No network or production writes.
Usage: python3 scripts/mrxpanel_og_generator.py output.png
Requires Pillow and DejaVu Sans installed on build runner.
"""
from __future__ import annotations
from PIL import Image, ImageDraw, ImageFont
import sys
from pathlib import Path

TARGET=(1200,630)
SCALE=2
W,H=(n*SCALE for n in TARGET)
C={'background':'#111318','panel':'#171A20','gold':'#F1CC6C','gold2':'#D6A73A','white':'#FFFFFF','secondary':'#AEB4BF','border':'#2A2F38','subtle':'#9297A0'}
img=Image.new('RGB',(W,H),C['background'])
d=ImageDraw.Draw(img)

def P(v): return round(v*SCALE)
def rect(xy,fill,radius=0,outline=None,width=1):
    d.rounded_rectangle(tuple(P(v) for v in xy),P(radius),fill=fill,outline=outline,width=P(width))
def line(points,fill,width=1):
    d.line([(P(x),P(y)) for x,y in points],fill=fill,width=P(width),joint='curve')
def ellipse(xy,fill=None,outline=None,width=1):
    d.ellipse(tuple(P(v) for v in xy),fill=fill,outline=outline,width=P(width))
def font(bold,size):
    name='DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf'
    for location in ('/usr/share/fonts/truetype/dejavu/'+name,name):
        try: return ImageFont.truetype(location,P(size))
        except OSError: pass
    raise RuntimeError('DejaVu Sans required')
def text(x,y,message,size,bold=False,color='white',anchor='lt'):
    d.text((P(x),P(y)),message,font=font(bold,size),fill=C.get(color,color),anchor=anchor,stroke_width=0)

rect([0,0,1200,630],C['background'])
rect([22,22,1178,608],C['background'],radius=25,outline=C['border'])
rect([60,64,128,72],C['gold'],radius=4)
rect([750,105,1120,531],C['panel'],radius=29,outline='#333844')
line([(770,155),(1097,155)],'#2A2F38')
rect([781,125,817,145],C['gold2'],radius=6)
text(832,124,'RINGKASAN PANEL',13,True,'secondary')
rect([787,186,1081,278],'#1D222B',radius=17,outline=C['border'])
text(812,203,'KELOLA LAYANAN',13,True,'secondary')
rect([813,237,975,247],C['gold'],radius=5)
rect([985,237,1055,247],'#4B5462',radius=5)
rect([787,294,930,394],'#1D222B',radius=17,outline=C['border'])
rect([945,294,1081,394],'#1D222B',radius=17,outline=C['border'])
text(807,311,'SALDO',12,True,'secondary')
text(965,311,'PESANAN',12,True,'secondary')
rect([807,348,900,361],'#4A5461',radius=6)
rect([965,348,1055,361],C['gold2'],radius=6)
rect([786,413,1082,491],'#1D222B',radius=18,outline=C['border'])
for i,x in enumerate((810,895,980)):
    ellipse([x,432,x+25,457],fill=[C['gold2'],'#6B7381','#475160'][i])
    rect([x,470,x+52,477],fill='#49515E',radius=3)
ellipse([904,-165,1399,330],outline='#2E2A21',width=2)
ellipse([930,-125,1359,304],outline='#5C492B',width=2)
rect([65,123,127,185],C['gold'],radius=17)
text(79,142,'M',29,True,'background')
text(148,120,'MRXPANEL',57,True,'white')
text(66,230,'Panel SMM Indonesia',33,True,'white')
text(66,278,'untuk Reseller & Bisnis',31,True,'gold')
text(68,351,'Kelola layanan, saldo, dan pesanan',20,False,'secondary')
text(68,383,'dalam satu dashboard member.',20,False,'secondary')
for bounds,label in [
    ([68,457,255,500],'Katalog layanan'),
    ([268,457,429,500],'Saldo member'),
    ([442,457,628,500],'Status pesanan'),
]:
    rect(bounds,'#1B2028',radius=20,outline=C['border'])
    text(bounds[0]+23,bounds[1]+11,label,14,True,'white')
line([(65,542),(1135,542)],C['border'])
text(67,559,'MRXPANEL.COM',16,True,'gold')
text(1126,559,'Panduan resmi MRXPANEL',13,False,'secondary',anchor='rt')
img=img.resize(TARGET,Image.Resampling.LANCZOS)
output=Path(sys.argv[1]) if len(sys.argv)>1 else Path('mrxpanel-og-review-1200x630.png')
output.parent.mkdir(parents=True,exist_ok=True)
img.save(output,format='PNG',optimize=True)
print(f'OG_IMAGE_REVIEW_RENDER_PASS|SIZE={img.width}x{img.height}|BYTES={output.stat().st_size}')
