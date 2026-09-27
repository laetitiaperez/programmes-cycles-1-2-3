#!/bin/sh
# Liste les lignes-titres (courtes, sans point final) avec leur page PDF.
# Usage : scripts/titres.sh <id-fichier> [motif-grep]
awk 'BEGIN { p = 1 } { p += gsub(/\f/, "") }
  { t = $0; gsub(/^[ \t]+|[ \t]+$/, "", t) }
  length(t) > 3 && length(t) < 90 && t !~ /[.;,:]$/ && t !~ /\|/ && t !~ /  / { print "p." p ": " t }' "sources/txt/$1.txt" | grep -E "${2:-.}"
