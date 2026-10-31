/**
 * Type declarations for the deterministic simulation engine implemented in
 * engine.js. This preserves the runtime JS module and its Node tests while
 * giving Next.js/TypeScript correctly typed return values.
 */
import type { TraceNode, TraceLink } from './types';

export type PositionedTraceNode = TraceNode & { x: number; y: number };

export interface CascadeResult {
  affected: string[];
  paths: Record<string, string[]>;
  waves: string[][];
  sealed: string[];
}

export function positionNodes(nodes: TraceNode[]): PositionedTraceNode[];
export function traceCascade(
  nodes: TraceNode[],
  links: TraceLink[],
  origin: string,
  secured?: string[],
): CascadeResult;
