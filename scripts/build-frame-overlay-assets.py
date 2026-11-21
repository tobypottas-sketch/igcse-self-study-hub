#!/usr/bin/env python3
"""Derive transparent equipped-only frame overlays from original shop artwork.

Shop listings keep their illustrated image. The avatar must never show its
rectangular pastel background. Run with pip install pillow numpy opencv-python-headless.
"""
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageFilter

ROOT=Path(__file__).resolve().parents[1]/"assets/vocabulary/rewards"
FRAMES=("gold-frame","scholar-frame","aurora-frame")

def build(name):
    src=ROOT/f"{name}.png"
    rgb=np.asarray(Image.open(src).convert("RGB"),dtype=np.uint8)
    h,w=rgb.shape[:2]
    yy,xx=np.ogrid[:h,:w]
    # These graphics have circular wreaths on 720x420 landscape backdrops.
    # The geometric prior isolates the ring and decorated lower corners
    # without retaining the surrounding rectangle or the empty centre.
    x=(xx-(w-1)*.5)/(w*.31)
    y=(yy-(h-1)*.51)/(h*.52)
    radius=np.sqrt(x*x+y*y)
    hsv=cv2.cvtColor(rgb,cv2.COLOR_RGB2HSV)
    sat=hsv[:,:,1]/255.0
    near_ring=(radius>.67)&(radius<1.32)
    bright=(sat>.28)
    if name=="aurora-frame":
        bright=sat>.35
    elif name=="scholar-frame":
        bright=sat>.27
    # Book and ribbons reach into the bottom inner circle on Scholar.
    book=(name=="scholar-frame")&(yy>h*.69)&(xx>w*.30)&(xx<w*.70)
    # The wreaths' crossed laurels reach beneath the centre on Golden.
    cross=(name=="gold-frame")&(yy>h*.78)&(xx>w*.32)&(xx<w*.68)
    mask=np.full((h,w),cv2.GC_PR_BGD,dtype=np.uint8)
    probable=near_ring|(book&bright)|(cross&bright)
    mask[probable]=cv2.GC_PR_FGD
    mask[(radius<.68)&~book&~cross]=cv2.GC_BGD
    mask[(radius>1.33)]=cv2.GC_BGD
    # The outermost corners must be completely transparent.
    mask[((xx<w*.05)|(xx>w*.95))&((yy<h*.12)|(yy>h*.87))]=cv2.GC_BGD
    sure_fg=(radius>.77)&(radius<1.12)&(sat>.46)
    if name=="aurora-frame":
        sure_fg=(radius>.79)&(radius<1.15)&(sat>.55)
    mask[sure_fg]=cv2.GC_FGD
    if name=="scholar-frame":
        # Keep the actual illustrated book, not the pale area around it.
        book_colors=book&(sat>.27)
        mask[book_colors]=cv2.GC_FGD
    if name=="gold-frame":
        mask[cross&(sat>.48)]=cv2.GC_FGD
    bg=np.zeros((1,65),np.float64)
    fg=np.zeros((1,65),np.float64)
    cv2.grabCut(cv2.cvtColor(rgb,cv2.COLOR_RGB2BGR),mask,None,bg,fg,7,cv2.GC_INIT_WITH_MASK)
    alpha=np.where((mask==cv2.GC_FGD)|(mask==cv2.GC_PR_FGD),255,0).astype(np.uint8)
    # Force the empty middle and surrounding backdrop away regardless of
    # any colour-model false positives. Keep central book/cross details.
    alpha[(radius<.66)&~book&~cross]=0
    alpha[radius>1.32]=0
    # Remove isolated backdrop flecks; keep all connected main-frame details.
    n,labels,stats,_=cv2.connectedComponentsWithStats(alpha,8)
    keep=np.zeros_like(alpha)
    for i in range(1,n):
        if stats[i,cv2.CC_STAT_AREA]>=max(65,h*w*.00016):
            keep[labels==i]=255
    # A 1-pixel feather softens extraction edges at avatar sizes.
    pil_alpha=Image.fromarray(keep,"L").filter(ImageFilter.GaussianBlur(.55))
    image=Image.fromarray(rgb,"RGB").convert("RGBA")
    image.putalpha(pil_alpha)
    bounds=pil_alpha.getbbox()
    if not bounds:
        raise RuntimeError("No foreground found for "+name)
    # Convert landscape source into a square overlay. Never squash the wreath
    # when it is fitted to a round/square 100px student avatar.
    art=image.crop(bounds)
    bw,bh=art.size
    padding=max(8,int(max(bw,bh)*.035))
    side=max(bw,bh)+padding*2
    canvas=Image.new("RGBA",(side,side),(0,0,0,0))
    canvas.alpha_composite(art,((side-bw)//2,(side-bh)//2))
    canvas=canvas.resize((512,512),Image.Resampling.LANCZOS)
    target=ROOT/f"{name}-overlay.png"
    canvas.save(target,optimize=True)
    a=np.asarray(canvas.getchannel("A"))
    print(name,"source",w,h,"bbox",bounds,"overlay",target.name,
          "transparent_corners",int((a[0,0]==0)&(a[0,-1]==0)&(a[-1,0]==0)&(a[-1,-1]==0)),
          "center_alpha",int(a[256,256]),"opaque_pct",round((a>220).mean()*100,1),
          "bytes",target.stat().st_size)

if __name__=="__main__":
    for name in FRAMES: build(name)
