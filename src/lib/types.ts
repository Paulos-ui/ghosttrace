export type Confidence = 'low' | 'medium' | 'high';
export type NodeKind = 'power' | 'water' | 'transport' | 'communications' | 'health' | 'other';
export interface TraceNode {
  id: string;
  label: string;
  kind: NodeKind;
  role: string;
  evidence: string;
  evidenceVerified: boolean;
  criticality: number;
}
export interface TraceLink {
  from: string;
  to: string;
  relation: string;
  evidence: string;
  evidenceVerified: boolean;
  strength: number;
}
export interface TraceMoment { time: string; event: string; evidence: string; evidenceVerified: boolean; }
export interface TraceHypothesis { claim: string; confidence: Confidence; reasoning: string; evidence: string; evidenceVerified: boolean; }
export interface Reconstruction {
  title: string;
  summary: string;
  origin: string;
  nodes: TraceNode[];
  links: TraceLink[];
  timeline: TraceMoment[];
  hypotheses: TraceHypothesis[];
  unresolved: string[];
  model: string;
  source: 'ai' | 'illustrative-sample';
  createdAt: string;
}
export interface ArchiveCase { id: string; name: string; eyebrow: string; district: string; date: string; report: string; reconstruction: Reconstruction; }
