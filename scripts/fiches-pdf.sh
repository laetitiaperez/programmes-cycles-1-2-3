#!/bin/sh
# Génère le PDF (A4, via Chrome headless) des fiches qui n'ont pas de PDF d'origine,
# puis régénère les pages HTML pour y ajouter le bouton PDF.
# Usage : scripts/fiches-pdf.sh
set -e
cd "$(dirname "$0")/.."
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
python3 scripts/fiches.py
for md in fiches/src/*.md; do
  id=$(basename "$md" .md)
  grep -q '^pdf: ' "$md" && continue   # PDF d'origine fourni : on n'y touche pas
  "$CHROME" --headless --disable-gpu --no-pdf-header-footer --virtual-time-budget=2000 \
    --print-to-pdf="$PWD/fiches/pdf/$id.pdf" "file://$PWD/fiches/$id.html" 2>/dev/null
  echo "PDF : fiches/pdf/$id.pdf"
done
python3 scripts/fiches.py
