import os, io, json, base64
from PIL import Image

PUB = os.path.join(os.getcwd(), 'public')
OUT = os.path.join(os.getcwd(), 'app', 'lib', 'asset-data.json')

# Files to embed. logo keeps transparency (PNG); rest -> JPEG for small size.
KEEP_PNG = {'logo-t.png'}
MAX_DIM = 900
LOGO_MAX = 560

result = {}
for fn in sorted(os.listdir(PUB)):
    path = os.path.join(PUB, fn)
    if not os.path.isfile(path):
        continue
    ext = fn.lower().split('.')[-1]
    if ext not in ('png', 'jpg', 'jpeg', 'webp'):
        continue
    if fn == 'logo.png':  # skip old large full-bg logo, unused
        continue
    try:
        im = Image.open(path)
    except Exception as e:
        print('skip', fn, e)
        continue

    if fn in KEEP_PNG:
        im = im.convert('RGBA')
        m = LOGO_MAX
        if max(im.size) > m:
            im.thumbnail((m, m), Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, format='PNG', optimize=True)
        ct = 'image/png'
    else:
        im = im.convert('RGB')
        if max(im.size) > MAX_DIM:
            im.thumbnail((MAX_DIM, MAX_DIM), Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, format='JPEG', quality=80, optimize=True, progressive=True)
        ct = 'image/jpeg'

    data = buf.getvalue()
    b64 = base64.b64encode(data).decode('ascii')
    result[fn] = {'contentType': ct, 'data': b64}
    print(f'{fn}: {len(data)//1024} KB  ({ct})')

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, 'w') as f:
    json.dump(result, f)

total = sum(len(v['data']) for v in result.values())
print('---')
print('files:', len(result), 'json base64 total:', total // 1024, 'KB')
print('written to', OUT)
