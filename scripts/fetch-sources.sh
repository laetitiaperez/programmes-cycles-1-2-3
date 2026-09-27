#!/bin/sh
# Télécharge les PDF listés dans sources/urls.tsv et extrait leur texte.
# Usage : scripts/fetch-sources.sh
set -eu
cd "$(dirname "$0")/.."
mkdir -p sources/pdf sources/txt sources/raw
while IFS="$(printf '\t')" read -r id url; do
  [ -z "$id" ] && continue
  pdf="sources/pdf/$id.pdf"
  if [ ! -s "$pdf" ]; then
    curl -sSL -A "Mozilla/5.0" -o "$pdf" "$url" || true
  fi
  if ! file "$pdf" | grep -q PDF; then
    echo "ÉCHEC : $id n'est pas un PDF ($url)" >&2
    continue
  fi
  pdftotext -layout "$pdf" "sources/txt/$id.txt"
  pdftotext -raw "$pdf" "sources/raw/$id.txt"
  # PDF « imprimé » sans couche texte : OCR avec macOS Vision (scripts/ocr.swift).
  if [ "$(tr -d '[:space:]' < "sources/txt/$id.txt" | wc -c)" -lt 100 ]; then
    mkdir -p sources/png
    rm -f "sources/png/$id"-*.png
    pdftoppm -r 200 -png "$pdf" "sources/png/$id"
    swift scripts/ocr.swift $(ls "sources/png/$id"-*.png | sort -V) > "sources/txt/$id.txt" 2>/dev/null
    cp "sources/txt/$id.txt" "sources/raw/$id.txt"
    echo "   (OCR)"
  fi
  echo "OK $id ($(grep -c . "sources/txt/$id.txt") lignes)"
done < sources/urls.tsv
