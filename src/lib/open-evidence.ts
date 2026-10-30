'use client';

import { sourcePassages, scorePassages } from './evidence-passages.js';

/** Apache-2.0 weights run in the browser via the open-source Transformers.js library.
 * The model is fetched by the browser on first use and cached by the model runtime.
 * No Hugging Face API key and no off-device evidence upload are required for this step.
 */
const MODEL = 'Xenova/all-MiniLM-L6-v2';
const QUERY = 'Which infrastructure components failed, when did failures occur, and how did they affect dependent services? Identify evidence for causes, impacts, and recovery.';
let extractorPromise: Promise<Awaited<ReturnType<typeof loadExtractor>>> | undefined;

async function loadExtractor() {
  const { pipeline } = await import('@huggingface/transformers');
  return pipeline('feature-extraction', MODEL, { device: 'wasm', dtype: 'q8' });
}

export type EvidenceHit = { text: string; similarity: number; order: number };
export async function runOpenEvidenceLens(report: string): Promise<EvidenceHit[]> {
  const passages: string[] = sourcePassages(report, 24);
  if (!passages.length) throw new Error('Provide a report with at least one evidence passage.');
  if (!extractorPromise) extractorPromise = loadExtractor();
  let extractor;
  try { extractor = await extractorPromise; }
  catch (error) { extractorPromise = undefined; throw error; }
  const vectorTensor = await extractor([QUERY, ...passages], { pooling: 'mean', normalize: true });
  const vectors = vectorTensor.tolist() as number[][];
  return scorePassages(vectors, passages, 5);
}
export const openEvidenceModel = MODEL;
