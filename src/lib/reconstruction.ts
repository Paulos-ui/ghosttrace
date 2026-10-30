import type { Confidence, NodeKind, Reconstruction, TraceHypothesis, TraceLink, TraceMoment, TraceNode } from './types';

const kinds: NodeKind[] = ['power', 'water', 'transport', 'communications', 'health', 'other'];
const confidences: Confidence[] = ['low', 'medium', 'high'];
const obj = (v: unknown): Record<string, unknown> => v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : {};
const str = (v: unknown, fallback = '', max = 260): string => typeof v === 'string' ? v.trim().slice(0, max) : fallback;
const bounded = (v: unknown, fallback: number): number => Number.isFinite(Number(v)) ? Math.max(1, Math.min(5, Math.round(Number(v)))) : fallback;
const quoteIsGrounded = (quote: string, report: string) => {
  const normalized = (value: string) => value.toLowerCase().replace(/[\s“”‘’'".,;:!?()]+/g, ' ').trim();
  return quote.length >= 8 && normalized(report).includes(normalized(quote));
};

export function normalizeReconstruction(raw: unknown, report: string, model: string): Reconstruction {
  const data = obj(raw);
  if (!Array.isArray(data.nodes) || data.nodes.length === 0) throw new Error('AI response has no reconstructable systems. Add a report with named infrastructure and causal events.');
  const used = new Set<string>();
  const nodes: TraceNode[] = data.nodes.slice(0, 9).map((item: unknown, index: number) => {
    const r = obj(item);
    const id = str(r.id, `node-${index + 1}`, 24).toLowerCase().replace(/[^a-z0-9-]/g, '-') || `node-${index + 1}`;
    const uid = used.has(id) ? `${id}-${index}` : id;
    used.add(uid);
    const kind = kinds.includes(r.kind as NodeKind) ? r.kind as NodeKind : 'other';
    const evidence = str(r.evidence, '', 360);
    return { id: uid, label: str(r.label, `System ${index + 1}`, 42), kind, role: str(r.role, 'Referenced infrastructure component', 140), evidence, evidenceVerified: quoteIsGrounded(evidence, report), criticality: bounded(r.criticality, 3) };
  });
  const nodeIds = new Set(nodes.map(n => n.id));
  const links: TraceLink[] = (Array.isArray(data.links) ? data.links : []).slice(0, 18).map((item: unknown) => {
    const r = obj(item); const evidence = str(r.evidence, '', 360);
    return { from: str(r.from, '', 24).toLowerCase(), to: str(r.to, '', 24).toLowerCase(), relation: str(r.relation, 'depends on', 95), evidence, evidenceVerified: quoteIsGrounded(evidence, report), strength: bounded(r.strength, 3) };
  }).filter(l => nodeIds.has(l.from) && nodeIds.has(l.to) && l.from !== l.to);
  const timeline: TraceMoment[] = (Array.isArray(data.timeline) ? data.timeline : []).slice(0, 7).map((item: unknown) => {
    const r = obj(item); const evidence = str(r.evidence, '', 360);
    return { time: str(r.time, 'Unknown time', 70), event: str(r.event, '', 210), evidence, evidenceVerified: quoteIsGrounded(evidence, report) };
  }).filter(t => t.event.length);
  const hypotheses: TraceHypothesis[] = (Array.isArray(data.hypotheses) ? data.hypotheses : []).slice(0, 4).map((item: unknown) => {
    const r = obj(item); const evidence = str(r.evidence, '', 360);
    return { claim: str(r.claim, '', 220), confidence: confidences.includes(r.confidence as Confidence) ? r.confidence as Confidence : 'low', reasoning: str(r.reasoning, '', 390), evidence, evidenceVerified: quoteIsGrounded(evidence, report) };
  }).filter(h => h.claim.length);
  const origin = str(data.origin, '', 24).toLowerCase();
  return {
    title: str(data.title, 'Unresolved system archive', 90),
    summary: str(data.summary, 'A partial reconstruction from supplied evidence.', 700),
    origin: nodeIds.has(origin) ? origin : nodes[0].id,
    nodes, links, timeline, hypotheses,
    unresolved: (Array.isArray(data.unresolved) ? data.unresolved : []).slice(0, 5).map((i: unknown) => str(i, '', 180)).filter(Boolean),
    model, source: 'ai', createdAt: new Date().toISOString(),
  };
}
