export function parseMarkup(text) {
  const tokens = [];
  let i = 0;
  while (i < text.length) {
    const open = text.indexOf('[[', i);
    if (open === -1) { tokens.push({ kind: 'text', value: text.slice(i) }); break; }
    const close = text.indexOf(']]', open + 2);
    if (close === -1) throw new Error(`balise [[ non fermée : « ${text.slice(open, open + 40)} »`);
    const inner = text.slice(open + 2, close);
    if (inner.includes('[[')) throw new Error(`balise [[ imbriquée : « ${text.slice(open, close + 2)} »`);
    if (!inner.trim()) throw new Error('balise [[ ]] vide');
    if (open > i) tokens.push({ kind: 'text', value: text.slice(i, open) });
    tokens.push({ kind: 'kw', value: inner });
    i = close + 2;
  }
  for (const t of tokens) {
    if (t.kind === 'text' && t.value.includes(']]')) throw new Error(`]] orphelin : « ${t.value.slice(0, 40)} »`);
  }
  return tokens;
}

export const extractKeywords = (text) => parseMarkup(text).filter(t => t.kind === 'kw').map(t => t.value);
export const stripMarkup = (text) => parseMarkup(text).map(t => t.value).join('');
