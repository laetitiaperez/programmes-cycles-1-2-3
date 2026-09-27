#!/bin/sh
# Affiche un extrait lisible d'un texte extrait (espaces compactés, pages marquées).
# Usage : scripts/lire.sh <id-fichier> <ligne-début> <ligne-fin>
awk -v a="$2" -v b="$3" 'NR>=a && NR<=b' "sources/txt/$1.txt" \
  | perl -pe 's/\f/\n[— page —]\n/g; s/ {2,}/ | /g; s/^ \| //' | grep -v '^[[:space:]|]*$'
