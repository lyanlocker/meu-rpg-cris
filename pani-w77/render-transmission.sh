#!/usr/bin/env bash
set -euo pipefail

cp pani-w77/transmission.css pani-w77/transmission.js public/
cp pani-w77/transmission-sprites.css pani-w77/transmission-sprites.js public/

# Os atlas são versionados como Base64 para não depender de Storage externo.
base64 --decode pani-w77/tx-alphabet-sprite.b64 > public/tx-alphabet-sprite.webp
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

# Cada deploy recebe URLs únicas para impedir que Chrome reutilize JS/CSS de builds anteriores.
version=(os.environ.get('RENDER_GIT_COMMIT') or 'pani-v9')[:12]
s=re.sub(r'(["\'])(\./[^"\']+\.(?:js|css))(?:\?v=[^"\']*)?(["\'])',lambda m:f'{m.group(1)}{m.group(2)}?v={version}{m.group(3)}',s)
if 'http-equiv="Cache-Control"' not in s:
    s=s.replace('<head>','<head><meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"><meta http-equiv="Pragma" content="no-cache"><meta http-equiv="Expires" content="0">',1)

for asset in ('transmission.css','transmission-sprites.css','transmission.js','transmission-sprites.js','runtime.js','core.js'):
    assert f'./{asset}?v={version}' in s, asset
assert s.index('./transmission.js') > s.index('./runtime.js')
assert s.index('./transmission-sprites.js') > s.index('./transmission.js')
p.write_text(s,encoding='utf-8')

js=Path('public/transmission.js').read_text(encoding='utf-8')
for needle in ('pani_master_transmission_catalog','pani_master_transmission_dispatch','pani_master_transmission_stop','pani_master_transmission_active','pani_crew_transmission_feed','TRANSMITIR SÍMBOLO'):
    assert needle in js,needle
fix=Path('public/transmission-sprites.js').read_text(encoding='utf-8')
for needle in ('txSpriteMeta','txMaskStyle=function','txShowPlayerSignal=function','txRenderSelected=function'):
    assert needle in fix,needle

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
print(f'PANI final production audit OK // CACHE-BUST v9 // {version}')
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
