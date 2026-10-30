/** Browser-independent source splitting for the open-weight evidence lens. */
export function sourcePassages(report, max = 30) {
  if (typeof report !== 'string') return [];
  const sections = report.replace(/\r/g, '').split(/\n\s*\n|(?<=[.!?])\s+(?=[A-Z0-9])/g);
  const result = [];
  for (const section of sections) {
    const clean = section.trim();
    if (clean.length < 25) continue;
    for (let start = 0; start < clean.length && result.length < max; start += 480) {
      const part = clean.slice(start, start + 540).trim();
      if (part.length >= 25) result.push(part);
    }
    if (result.length >= max) break;
  }
  if (!result.length && report.trim().length > 0) result.push(report.trim().slice(0, 540));
  return result;
}

/** Normalized embeddings from Transformers.js are ranked with dot products. */
export function scorePassages(vectors, passages, topK = 5) {
  if (!Array.isArray(vectors) || vectors.length !== passages.length + 1) throw new Error('Embedding shape mismatch');
  const query = vectors[0];
  return passages.map((text, index) => {
    const v = vectors[index + 1];
    if (!Array.isArray(v) || v.length !== query.length) throw new Error('Embedding dimension mismatch');
    const similarity = v.reduce((sum, n, j) => sum + n * query[j], 0);
    return { text, similarity: Math.max(-1, Math.min(1, similarity)), order: index };
  }).sort((a,b) => b.similarity - a.similarity).slice(0, topK);
}
