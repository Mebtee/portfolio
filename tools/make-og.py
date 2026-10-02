from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1200, 630
BG      = (7, 10, 16)
BG2     = (12, 19, 31)
ACCENT  = (56, 189, 248)
ACCENT2 = (129, 140, 248)
TEXT    = (233, 238, 246)
MUTED   = (163, 177, 198)
FAINT   = (127, 142, 166)

img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

# vertical gradient wash
for y in range(H):
    t = y / H
    r = int(BG[0] + (BG2[0] - BG[0]) * (1 - t) * 0.9)
    g = int(BG[1] + (BG2[1] - BG[1]) * (1 - t) * 0.9)
    b = int(BG[2] + (BG2[2] - BG[2]) * (1 - t) * 0.9)
    d.line([(0, y), (W, y)], fill=(r, g, b))

# soft accent glows (rendered separately then screen-blended)
glow = Image.new("RGB", (W, H), (0, 0, 0))
gd = ImageDraw.Draw(glow)
gd.ellipse([-220, -300, 520, 250], fill=(14, 58, 92))
gd.ellipse([820, 380, 1420, 820], fill=(28, 30, 86))
glow = glow.filter(ImageFilter.GaussianBlur(140))
px = img.load()
gp = glow.load()
for y in range(H):
    for x in range(W):
        r, g, b = px[x, y]
        gr, gg, gb = gp[x, y]
        px[x, y] = (min(255, r + gr), min(255, g + gg), min(255, b + gb))
d = ImageDraw.Draw(img)

# subtle grid
for x in range(0, W, 48):
    d.line([(x, 0), (x, H)], fill=(18, 26, 40), width=1)
for y in range(0, H, 48):
    d.line([(0, y), (W, y)], fill=(18, 26, 40), width=1)

# faint network graph
edges = [((90,140),(260,80)), ((260,80),(400,190)), ((400,190),(560,120)),
         ((560,120),(720,240)), ((720,240),(900,170)),
         ((40,330),(220,400)), ((220,400),(400,320)), ((400,320),(560,450)),
         ((560,450),(740,370)), ((740,370),(920,480)), ((920,480),(1120,410)),
         ((260,80),(220,400)), ((400,190),(400,320)), ((560,120),(560,450)),
         ((720,240),(740,370)), ((900,170),(920,480)), ((300,540),(560,450)),
         ((740,370),(860,560))]
for (x1,y1),(x2,y2) in edges:
    d.line([(x1,y1),(x2,y2)], fill=(26, 52, 78), width=1)
for (x,y) in [(260,80),(400,190),(560,120),(720,240),(220,400),(400,320),
              (560,450),(740,370),(920,480)]:
    d.ellipse([x-3,y-3,x+3,y+3], fill=(60,110,150))

SEGOE = "C:/Windows/Fonts/segoeui.ttf"
SEGOE_B = "C:/Windows/Fonts/segoeuib.ttf"
SEGOE_SB = "C:/Windows/Fonts/seguisb.ttf"

f_eyebrow = ImageFont.truetype(SEGOE_SB, 22)
f_name    = ImageFont.truetype(SEGOE_B, 78)
f_title   = ImageFont.truetype(SEGOE, 40)
f_meta    = ImageFont.truetype(SEGOE, 25)

LEFT = 92
TOP  = 190

# logo — the supplied personal logo, on its own light plate (it is opaque
# near-white by design, which reads correctly on this dark card)
LOGO = Image.open("assets/images/logo.png").convert("RGB").resize((70, 70), Image.LANCZOS)
plate = Image.new("RGB", (86, 86), (248, 249, 250))
plate.paste(LOGO, (8, 8))
mask = Image.new("L", (86, 86), 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, 85, 85], radius=16, fill=255)
img.paste(plate, (LEFT - 8, TOP - 96), mask)

# eyebrow
d.text((LEFT, TOP+8), "FULL-STACK SOFTWARE ENGINEER  ·  QA ENGINEER", font=f_eyebrow, fill=ACCENT)

# name
d.text((LEFT, TOP+52), "Tamene Behailu", font=f_name, fill=TEXT)

# headline
d.text((LEFT, TOP+160), "Building reliable software for real-world problems.", font=f_title, fill=MUTED)

# accent rule
d.line([(LEFT, TOP+232), (LEFT+120, TOP+232)], fill=ACCENT, width=3)
d.line([(LEFT+124, TOP+232), (LEFT+260, TOP+232)], fill=ACCENT2, width=3)

# footer meta
d.text((LEFT, H-96), "Addis Ababa, Ethiopia", font=f_meta, fill=FAINT)
d.text((LEFT, H-60), "React  ·  Next.js  ·  TypeScript  ·  Node.js  ·  Python  ·  TensorFlow  ·  QA",
       font=ImageFont.truetype(SEGOE, 22), fill=(110, 126, 148))

img.save("assets/img/og-image.png", "PNG", optimize=True)
print("written assets/img/og-image.png", img.size)
