#!/bin/sh
# Extrait la colonne « Exemples de réussite » d'un document Éduscol (sources/raw), par section.
# Usage : scripts/exemples.sh <id-fichier>
awk 'BEGIN { p = 1 }
  { p += gsub(/\f/, "") }
  /^Objectifs d/ { ex = 0; print "\n## " prev " (p." p ")"; next }
  /^• L[^ ]*élève/ { ex = 1 }
  /^(Culture littéraire|Écriture|Oral|Vocabulaire|Grammaire)/ && length($0) < 60 { ex = 0 }
  ex && !/^[0-9]+$/ { print }
  { if ($0 !~ /^[[:space:]]*$/) prev = $0 }' "sources/raw/$1.txt"
