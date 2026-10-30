/**
 * Deterministic, inspectable propagation over AI-extracted directed edges.
 * This is a hypothetical graph traversal, not a scientific probability model.
 */
export function traceCascade(nodes, links, origin, secured = []) {
  const known = new Set(nodes.map((node) => node.id));
  const sealed = new Set(secured.filter((id) => known.has(id)));
  const affected = new Set();
  const paths = {};
  const waves = [];
  if (!known.has(origin)) return { affected: [], paths, waves, sealed: [...sealed] };
  let frontier = [origin];
  paths[origin] = [origin];
  while (frontier.length) {
    const wave = [];
    const next = [];
    for (const id of frontier) {
      if (affected.has(id) || sealed.has(id)) continue;
      affected.add(id);
      wave.push(id);
      for (const edge of links) {
        if (edge.from !== id || !known.has(edge.to)) continue;
        if (!affected.has(edge.to) && !sealed.has(edge.to) && !next.includes(edge.to)) {
          paths[edge.to] = [...paths[id], edge.to];
          next.push(edge.to);
        }
      }
    }
    if (wave.length) waves.push(wave);
    frontier = next;
  }
  return { affected: [...affected], paths, waves, sealed: [...sealed] };
}

export function positionNodes(nodes) {
  const total = nodes.length;
  return nodes.map((node, index) => {
    const theta = -Math.PI / 2 + (index * 2 * Math.PI) / Math.max(total, 1);
    return { ...node, x: 360 + 250 * Math.cos(theta), y: 245 + 162 * Math.sin(theta) };
  });
}
