#!/usr/bin/env bash
set -euo pipefail

cp pani-w77/transmission.css pani-w77/transmission.js public/
cp pani-w77/transmission-sprites.css pani-w77/transmission-sprites.js public/
base64 --decode pani-w77/tx-concept-sprite.b64 > public/tx-concept-sprite.webp

# A-Z / 0-9 v17
# The v15 embedded glyphs were discovered to contain bytes after the RIFF-declared
# end of each WebP. Browsers correctly rejected those malformed data URLs.
# We decode the source only at build time, normalize Base64 padding, then trim
# every image to its own RIFF-declared byte length and publish physical files.
python3 - <<'PY'
from pathlib import Path
import re,base64,struct
src=Path('pani-w77/alphabet-glyphs.js').read_text(encoding='utf-8')
out=Path('public/glyphs');out.mkdir(parents=True,exist_ok=True)
pat=re.compile(r'"(a\d{2})":"data:image/webp;base64,([A-Za-z0-9+/=]+)"')
items=dict(pat.findall(src))
assert len(items)==36, f'expected 36 glyphs, found {len(items)}'
for i in range(1,37):
    key=f'a{i:02d}'
    raw=items[key].rstrip('=')
    raw += '='*((4-len(raw)%4)%4)
    blob=base64.b64decode(raw,validate=True)
    assert len(blob)>=20 and blob[:4]==b'RIFF' and blob[8:12]==b'WEBP', key
    declared=struct.unpack('<I',blob[4:8])[0]+8
    assert 20 <= declared <= len(blob), (key,declared,len(blob))
    # Critical repair: discard trailing garbage that made the browser reject it.
    blob=blob[:declared]
    assert len(blob)==declared
    assert blob[12:16] in (b'VP8 ',b'VP8L',b'VP8X'), (key,blob[12:16])
    (out/f'{key}.webp').write_bytes(blob)
print('PANI glyph repair OK // 36 RIFF-trimmed same-origin WebP files')
PY

python3 - <<'PY'
from pathlib import Path
import os,re,struct
p=Path('public/index.html');s=p.read_text(encoding='utf-8')
if './transmission.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="./transmission.css"></head>',1)
if './transmission-sprites.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="./transmission-sprites.css"></head>',1)
if './transmission.js' not in s:s=s.replace('</body>','<script src="./transmission.js"></script></body>',1)
if './transmission-sprites.js' not in s:s=s.replace('</body>','<script src="./transmission-sprites.js"></script></body>',1)
s=re.sub(r'<script\s+src=["\']\./alphabet-(?:atlas-data|glyphs)\.js(?:\?v=[^"\']*)?["\']\s*></script>','',s)
version=(os.environ.get('RENDER_GIT_COMMIT') or 'pani-v17')[:12]
s=re.sub(r'(["\'])(\./[^"\']+\.(?:js|css))(?:\?v=[^"\']*)?(["\'])',lambda m:f'{m.group(1)}{m.group(2)}?v={version}{m.group(3)}',s)
if 'http-equiv="Cache-Control"' not in s:s=s.replace('<head>','<head><meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"><meta http-equiv="Pragma" content="no-cache"><meta http-equiv="Expires" content="0">',1)
p.write_text(s,encoding='utf-8')

fix=Path('public/transmission-sprites.js').read_text(encoding='utf-8')
assert './glyphs/${asset}.webp' in fix
assert 'data:image/webp' not in fix
assert 'PANI_ALPHA_GLYPHS' not in fix
for i in range(1,37):
    key=f'a{i:02d}';b=Path(f'public/glyphs/{key}.webp').read_bytes()
    assert b[:4]==b'RIFF' and b[8:12]==b'WEBP',key
    assert struct.unpack('<I',b[4:8])[0]+8==len(b),key
print(f'PANI production audit OK // ALPHABET-RIFF-REPAIR v17 // {version}')
PY

node --check public/transmission.js
node --check public/transmission-sprites.js
