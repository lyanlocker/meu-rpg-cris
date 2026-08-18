#!/usr/bin/env bash
set -euo pipefail

cp pani-w77/transmission.css pani-w77/transmission.js public/
cp pani-w77/transmission-sprites.css pani-w77/transmission-sprites.js public/

# Conceitos continuam usando o atlas empacotado como arquivo.
base64 --decode pani-w77/tx-alphabet-sprite.b64 > public/tx-alphabet-sprite.webp
base64 --decode pani-w77/tx-concept-sprite.b64 > public/tx-concept-sprite.webp

# A-Z / 0-9 v14: atlas também é embutido em JS como DATA URI.
# O renderer Canvas não faz request de imagem externa para o alfabeto.
python3 - <<'PY'
from pathlib import Path
import base64,re
raw=''.join(Path('pani-w77/tx-alphabet-sprite.b64').read_text(encoding='utf-8').split())
blob=base64.b64decode(raw,validate=True)
assert blob[:4]==b'RIFF' and blob[8:12]==b'WEBP'
assert len(blob)>5000
Path('public/alphabet-atlas-data.js').write_text(
    'window.PANI_ALPHA_ATLAS_DATA="data:image/webp;base64,'+raw+'";\n',
    encoding='utf-8'
)
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

# Remove eventual referência antiga e reinsere o atlas-data imediatamente antes do renderer.
s=re.sub(r'<script\s+src=["\']\./alphabet-atlas-data\.js(?:\?v=[^"\']*)?["\']\s*></script>','',s)
pat=r'(<script\s+src=["\']\./transmission-sprites\.js(?:\?v=[^"\']*)?["\']\s*></script>)'
if re.search(pat,s):
    s=re.sub(pat,r'<script src="./alphabet-atlas-data.js"></script>\1',s,count=1)
else:
    s=s.replace('</body>','<script src="./alphabet-atlas-data.js"></script><script src="./transmission-sprites.js"></script></body>',1)

# Cada commit recebe URLs diferentes; elimina reaproveitamento de JS/CSS antigo pelo Chrome.
version=(os.environ.get('RENDER_GIT_COMMIT') or 'pani-v14')[:12]
s=re.sub(r'(["\'])(\./[^"\']+\.(?:js|css))(?:\?v=[^"\']*)?(["\'])',lambda m:f'{m.group(1)}{m.group(2)}?v={version}{m.group(3)}',s)
if 'http-equiv="Cache-Control"' not in s:
    s=s.replace('<head>','<head><meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"><meta http-equiv="Pragma" content="no-cache"><meta http-equiv="Expires" content="0">',1)

for asset in ('transmission.css','transmission-sprites.css','transmission.js','alphabet-atlas-data.js','transmission-sprites.js','runtime.js','core.js'):
    assert f'./{asset}?v={version}' in s,asset
assert s.index('./transmission.js') > s.index('./runtime.js')
assert s.index('./alphabet-atlas-data.js') > s.index('./transmission.js')
assert s.index('./transmission-sprites.js') > s.index('./alphabet-atlas-data.js')
p.write_text(s,encoding='utf-8')

base=Path('public/transmission.js').read_text(encoding='utf-8')
for needle in ('pani_master_transmission_catalog','pani_master_transmission_dispatch','pani_master_transmission_stop','pani_master_transmission_active','pani_crew_transmission_feed','TRANSMITIR SÍMBOLO'):
    assert needle in base,needle

# Auditoria dedicada ao alfabeto v14.
fix=Path('public/transmission-sprites.js').read_text(encoding='utf-8')
for needle in ('ALFABETO PARANORMAL v14','PANI_ALPHA_ATLAS_DATA','txAlphaCanvasMarkup','txAlphaPaint','drawImage','source-in','txAlphaValidateImage','CANVAS READY','txShowPlayerSignal=function','txRenderSelected=function'):
    assert needle in fix,needle
for forbidden in ('<svg class=','alpha-img-v11','background-position:${s.pos}','left:-${s.col*100}%'):
    assert forbidden not in fix,forbidden

css=Path('public/transmission-sprites.css').read_text(encoding='utf-8')
for needle in ('GLIFOS CANÔNICOS v14','tx-alpha-host','tx-alpha-canvas'):
    assert needle in css,needle

data=Path('public/alphabet-atlas-data.js').read_text(encoding='utf-8')
assert data.startswith('window.PANI_ALPHA_ATLAS_DATA="data:image/webp;base64,UklGR')
assert len(data)>5000

for asset in ('public/tx-alphabet-sprite.webp','public/tx-concept-sprite.webp'):
    b=Path(asset).read_bytes();assert b[:4]==b'RIFF' and b[8:12]==b'WEBP',asset;assert len(b)>5000,asset

core=Path('public/core.js').read_text(encoding='utf-8')
runtime=Path('public/runtime.js').read_text(encoding='utf-8')
assert 'eyJpc3MiOiJzdXBhYmFzZS' in core
assert 'eyJpc3MiOiJIUzI1Ni' not in core
assert 'backendHealth' in core
assert "toast('PIN inválido.'" in runtime
assert 'PIN inválido ou backend indisponível.' not in runtime
assert 'MASTER // BACKEND INDISPONÍVEL' in runtime
print(f'PANI production audit OK // ALPHABET-CANVAS v14 // {version}')
PY

node --check public/core.js
node --check public/views.js
node --check public/files.js
node --check public/runtime.js
node --check public/mission.js
node --check public/mission-runtime.js
node --check public/assistance.js
node --check public/transmission.js
node --check public/alphabet-atlas-data.js
node --check public/transmission-sprites.js
