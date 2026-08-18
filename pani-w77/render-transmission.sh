#!/usr/bin/env bash
set -euo pipefail

cp pani-w77/transmission.css pani-w77/transmission.js public/
cp pani-w77/transmission-sprites.css pani-w77/transmission-sprites.js public/

# Conceitos continuam usando seu atlas empacotado como arquivo.
base64 --decode pani-w77/tx-concept-sprite.b64 > public/tx-concept-sprite.webp

# A-Z / 0-9 v16: converter as 36 imagens embutidas da fonte de build em
# ARQUIVOS FÍSICOS same-origin. O navegador nunca recebe data: URI.
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
    assert key in items,key
    # A geração v15 deixou '=' em excesso em alguns Data URLs. Navegadores
    # exibiram imagem quebrada. Removemos todo padding antigo e recalculamos
    # o padding Base64 correto antes de decodificar.
    raw=items[key].rstrip('=')
    raw += '='*((4-len(raw)%4)%4)
    blob=base64.b64decode(raw,validate=True)
    assert len(blob)>250, (key,len(blob))
    assert blob[:4]==b'RIFF' and blob[8:12]==b'WEBP',key
    declared=struct.unpack('<I',blob[4:8])[0]+8
    assert declared==len(blob),(key,declared,len(blob))
    assert blob[12:16] in (b'VP8 ',b'VP8L',b'VP8X'),(key,blob[12:16])
    (out/f'{key}.webp').write_bytes(blob)
print('PANI glyph extraction OK // 36 normalized same-origin WebP files')
PY

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

# Remove loaders alfanuméricos antigos. v16 usa apenas arquivos em ./glyphs/.
s=re.sub(r'<script\s+src=["\']\./alphabet-atlas-data\.js(?:\?v=[^"\']*)?["\']\s*></script>','',s)
s=re.sub(r'<script\s+src=["\']\./alphabet-glyphs\.js(?:\?v=[^"\']*)?["\']\s*></script>','',s)

version=(os.environ.get('RENDER_GIT_COMMIT') or 'pani-v16')[:12]
s=re.sub(r'(["\'])(\./[^"\']+\.(?:js|css))(?:\?v=[^"\']*)?(["\'])',lambda m:f'{m.group(1)}{m.group(2)}?v={version}{m.group(3)}',s)
if 'http-equiv="Cache-Control"' not in s:
    s=s.replace('<head>','<head><meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"><meta http-equiv="Pragma" content="no-cache"><meta http-equiv="Expires" content="0">',1)

for asset in ('transmission.css','transmission-sprites.css','transmission.js','transmission-sprites.js','runtime.js','core.js'):
    assert f'./{asset}?v={version}' in s,asset
assert './alphabet-glyphs.js' not in s
assert './alphabet-atlas-data.js' not in s
assert s.index('./transmission.js') > s.index('./runtime.js')
assert s.index('./transmission-sprites.js') > s.index('./transmission.js')
p.write_text(s,encoding='utf-8')

base=Path('public/transmission.js').read_text(encoding='utf-8')
for needle in ('pani_master_transmission_catalog','pani_master_transmission_dispatch','pani_master_transmission_stop','pani_master_transmission_active','pani_crew_transmission_feed','TRANSMITIR SÍMBOLO'):
    assert needle in base,needle

fix=Path('public/transmission-sprites.js').read_text(encoding='utf-8')
for needle in ('ALFABETO PARANORMAL v16','./glyphs/${asset}.webp','SAME-ORIGIN GLYPHS READY','txShowPlayerSignal=function','txRenderSelected=function'):
    assert needle in fix,needle
for forbidden in ('PANI_ALPHA_GLYPHS','data:image/webp','PANI_ALPHA_ATLAS_DATA','GLYPH ERROR','txAlphaPaint','txAlphaCanvasMarkup','<svg class=','background-position:${s.pos}'):
    assert forbidden not in fix,forbidden

css=Path('public/transmission-sprites.css').read_text(encoding='utf-8')
for needle in ('tx-alpha-host','tx-alpha-img'):
    assert needle in css,needle

# Validação final de todos os arquivos realmente publicados.
for i in range(1,37):
    key=f'a{i:02d}'
    b=Path(f'public/glyphs/{key}.webp').read_bytes()
    assert b[:4]==b'RIFF' and b[8:12]==b'WEBP' and len(b)>250,key

b=Path('public/tx-concept-sprite.webp').read_bytes();assert b[:4]==b'RIFF' and b[8:12]==b'WEBP' and len(b)>5000

core=Path('public/core.js').read_text(encoding='utf-8')
runtime=Path('public/runtime.js').read_text(encoding='utf-8')
assert 'eyJpc3MiOiJzdXBhYmFzZS' in core
assert 'eyJpc3MiOiJIUzI1Ni' not in core
assert 'backendHealth' in core
assert "toast('PIN inválido.'" in runtime
assert 'PIN inválido ou backend indisponível.' not in runtime
print(f'PANI production audit OK // ALPHABET-SAME-ORIGIN-36 v16 // {version}')
PY

node --check public/core.js
node --check public/views.js
node --check public/files.js
node --check public/runtime.js
node --check public/mission.js
node --check public/mission-runtime.js
node --check public/assistance.js
node --check public/transmission.js
node --check public/transmission-sprites.js
