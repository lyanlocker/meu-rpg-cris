#!/usr/bin/env bash
set -euo pipefail

cp pani-w77/transmission.css pani-w77/transmission.js public/
cp pani-w77/transmission-sprites.css pani-w77/transmission-sprites.js public/
cp pani-w77/alphabet-paths.js public/
base64 --decode pani-w77/tx-concept-sprite.b64 > public/tx-concept-sprite.webp

python3 - <<'PY'
from pathlib import Path
import os,re
p=Path('public/index.html');s=p.read_text(encoding='utf-8')

if './transmission.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="./transmission.css"></head>',1)
if './transmission-sprites.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="./transmission-sprites.css"></head>',1)
if './transmission.js' not in s:s=s.replace('</body>','<script src="./transmission.js"></script></body>',1)
if './transmission-sprites.js' not in s:s=s.replace('</body>','<script src="./transmission-sprites.js"></script></body>',1)

# Remove qualquer loader alfanumérico raster antigo.
s=re.sub(r'<script\s+src=["\']\./alphabet-(?:atlas-data|glyphs|paths)\.js(?:\?v=[^"\']*)?["\']\s*></script>','',s)

# Os paths precisam existir antes do renderer.
pat=r'(<script\s+src=["\']\./transmission-sprites\.js(?:\?v=[^"\']*)?["\']\s*></script>)'
if re.search(pat,s):
    s=re.sub(pat,r'<script src="./alphabet-paths.js"></script>\1',s,count=1)
else:
    s=s.replace('</body>','<script src="./alphabet-paths.js"></script><script src="./transmission-sprites.js"></script></body>',1)

version=(os.environ.get('RENDER_GIT_COMMIT') or 'pani-v18')[:12]
s=re.sub(r'(["\'])(\./[^"\']+\.(?:js|css))(?:\?v=[^"\']*)?(["\'])',lambda m:f'{m.group(1)}{m.group(2)}?v={version}{m.group(3)}',s)
if 'http-equiv="Cache-Control"' not in s:s=s.replace('<head>','<head><meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"><meta http-equiv="Pragma" content="no-cache"><meta http-equiv="Expires" content="0">',1)
p.write_text(s,encoding='utf-8')

for asset in ('transmission.css','transmission-sprites.css','transmission.js','alphabet-paths.js','transmission-sprites.js','runtime.js','core.js'):
    assert f'./{asset}?v={version}' in s,asset
assert s.index('./alphabet-paths.js') > s.index('./transmission.js')
assert s.index('./transmission-sprites.js') > s.index('./alphabet-paths.js')

paths=Path('public/alphabet-paths.js').read_text(encoding='utf-8')
assert 'PANI_ALPHA_PATHS' in paths
for i in range(1,37):
    assert f'"a{i:02d}":"M' in paths,f'a{i:02d}'

fix=Path('public/transmission-sprites.js').read_text(encoding='utf-8')
for needle in ('ALFABETO PARANORMAL v18','PANI_ALPHA_PATHS','tx-alpha-svg','36 INLINE SVG GLYPHS READY','txShowPlayerSignal=function'):
    assert needle in fix,needle
for forbidden in ('data:image/webp','./glyphs/${asset}.webp','PANI_ALPHA_GLYPHS','PANI_ALPHA_ATLAS_DATA','GLYPH ERROR','txAlphaPaint'):
    assert forbidden not in fix,forbidden

b=Path('public/tx-concept-sprite.webp').read_bytes();assert b[:4]==b'RIFF' and b[8:12]==b'WEBP' and len(b)>5000
print(f'PANI production audit OK // ALPHABET-INLINE-SVG-36 v18 // {version}')
PY

node --check public/core.js
node --check public/views.js
node --check public/files.js
node --check public/runtime.js
node --check public/mission.js
node --check public/mission-runtime.js
node --check public/assistance.js
node --check public/transmission.js
node --check public/alphabet-paths.js
node --check public/transmission-sprites.js
