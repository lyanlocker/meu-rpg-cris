#!/usr/bin/env bash
set -euo pipefail

cp pani-w77/transmission.css pani-w77/transmission.js public/
cp pani-w77/transmission-sprites.css pani-w77/transmission-sprites.js public/
cp pani-w77/alphabet-glyphs.js public/

# Conceitos continuam usando seu atlas empacotado como arquivo.
base64 --decode pani-w77/tx-concept-sprite.b64 > public/tx-concept-sprite.webp

python3 - <<'PY'
from pathlib import Path
import os,re
p=Path('public/index.html')
s=p.read_text(encoding='utf-8')

if './transmission.css' not in s:
    s=s.replace('</head>','<link rel="stylesheet" href="./transmission.css"></head>',1)
if './transmission-sprites.css' not in s:
    if '<link rel="stylesheet" href="./transmission.css">' in s:
        s=s.replace('<link rel="stylesheet" href="./transmission.css">','<link rel="stylesheet" href="./transmission.css"><link rel="stylesheet" href="./transmission-sprites.css">',1)
    else:
        s=s.replace('</head>','<link rel="stylesheet" href="./transmission-sprites.css"></head>',1)

if './transmission.js' not in s:
    s=s.replace('</body>','<script src="./transmission.js"></script></body>',1)
if './transmission-sprites.js' not in s:
    if '<script src="./transmission.js"></script>' in s:
        s=s.replace('<script src="./transmission.js"></script>','<script src="./transmission.js"></script><script src="./transmission-sprites.js"></script>',1)
    else:
        s=s.replace('</body>','<script src="./transmission-sprites.js"></script></body>',1)

# Remove todos os loaders alfanuméricos antigos.
s=re.sub(r'<script\s+src=["\']\./alphabet-atlas-data\.js(?:\?v=[^"\']*)?["\']\s*></script>','',s)
s=re.sub(r'<script\s+src=["\']\./alphabet-glyphs\.js(?:\?v=[^"\']*)?["\']\s*></script>','',s)

# Insere 36 imagens independentes imediatamente antes do renderer.
pat=r'(<script\s+src=["\']\./transmission-sprites\.js(?:\?v=[^"\']*)?["\']\s*></script>)'
if re.search(pat,s):
    s=re.sub(pat,r'<script src="./alphabet-glyphs.js"></script>\1',s,count=1)
else:
    s=s.replace('</body>','<script src="./alphabet-glyphs.js"></script><script src="./transmission-sprites.js"></script></body>',1)

version=(os.environ.get('RENDER_GIT_COMMIT') or 'pani-v15')[:12]
s=re.sub(r'(["\'])(\./[^"\']+\.(?:js|css))(?:\?v=[^"\']*)?(["\'])',lambda m:f'{m.group(1)}{m.group(2)}?v={version}{m.group(3)}',s)
if 'http-equiv="Cache-Control"' not in s:
    s=s.replace('<head>','<head><meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"><meta http-equiv="Pragma" content="no-cache"><meta http-equiv="Expires" content="0">',1)

for asset in ('transmission.css','transmission-sprites.css','transmission.js','alphabet-glyphs.js','transmission-sprites.js','runtime.js','core.js'):
    assert f'./{asset}?v={version}' in s,asset
assert s.index('./transmission.js') > s.index('./runtime.js')
assert s.index('./alphabet-glyphs.js') > s.index('./transmission.js')
assert s.index('./transmission-sprites.js') > s.index('./alphabet-glyphs.js')
p.write_text(s,encoding='utf-8')

base=Path('public/transmission.js').read_text(encoding='utf-8')
for needle in ('pani_master_transmission_catalog','pani_master_transmission_dispatch','pani_master_transmission_stop','pani_master_transmission_active','pani_crew_transmission_feed','TRANSMITIR SÍMBOLO'):
    assert needle in base,needle

fix=Path('public/transmission-sprites.js').read_text(encoding='utf-8')
for needle in ('ALFABETO PARANORMAL v15','PANI_ALPHA_GLYPHS','txAlphaSrc','txAlphaMarkup','36 DIRECT GLYPHS READY','txShowPlayerSignal=function','txRenderSelected=function'):
    assert needle in fix,needle
for forbidden in ('PANI_ALPHA_ATLAS_DATA','GLYPH ERROR','txAlphaPaint','txAlphaCanvasMarkup','<svg class=','background-position:${s.pos}'):
    assert forbidden not in fix,forbidden

css=Path('public/transmission-sprites.css').read_text(encoding='utf-8')
for needle in ('GLIFOS CANÔNICOS v15','tx-alpha-host','tx-alpha-img'):
    assert needle in css,needle

glyphs=Path('public/alphabet-glyphs.js').read_text(encoding='utf-8')
assert '36 GLIFOS ALFANUMÉRICOS CANÔNICOS v15' in glyphs
for i in range(1,37):
    k=f'a{i:02d}'
    assert f'"{k}":"data:image/webp;base64,UklGR' in glyphs,k
assert 'PANI_ALPHA_ATLAS_DATA' not in glyphs

b=Path('public/tx-concept-sprite.webp').read_bytes();assert b[:4]==b'RIFF' and b[8:12]==b'WEBP' and len(b)>5000

core=Path('public/core.js').read_text(encoding='utf-8')
runtime=Path('public/runtime.js').read_text(encoding='utf-8')
assert 'eyJpc3MiOiJzdXBhYmFzZS' in core
assert 'eyJpc3MiOiJIUzI1Ni' not in core
assert 'backendHealth' in core
assert "toast('PIN inválido.'" in runtime
assert 'PIN inválido ou backend indisponível.' not in runtime
print(f'PANI production audit OK // ALPHABET-DIRECT-36 v15 // {version}')
PY

node --check public/core.js
node --check public/views.js
node --check public/files.js
node --check public/runtime.js
node --check public/mission.js
node --check public/mission-runtime.js
node --check public/assistance.js
node --check public/transmission.js
node --check public/alphabet-glyphs.js
node --check public/transmission-sprites.js
