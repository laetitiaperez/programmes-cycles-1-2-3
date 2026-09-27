#!/bin/sh
# Affiche les lignes contenant un terme, avec leur numéro de page.
# Usage : scripts/page.sh "terme" <id-fichier>
awk -v pat="$1" 'BEGIN { p = 1 }
  { p += gsub(/\f/, "") }
  index(tolower($0), tolower(pat)) { print "p." p ": " $0 }' "sources/txt/$2.txt"
