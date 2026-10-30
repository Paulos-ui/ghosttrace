# GHOSTTRACE

## The Infrastructure Afterlife

**Every system leaves a ghost.** A haunting forensic laboratory that uses an **open-weight evidence model** and optional **Anthropic Claude reconstruction** to explore incident records without inventing the past.

New standalone project for the 2026 Hacktoberfest DEV Week 4 **Ghost in the Machine** challenge. It has no Appwrite dependency and does not reuse RUPTUREMAP source code.

**Integrity:** The supplied Bellwether and other demo archives are fictional. GHOSTTRACE does not predict disasters, confirm historical events, impersonate deceased people, or establish real-world causation.

## Real functionality

1. **Open Evidence Lens (open-weight AI):** The Apache-2.0 model [`Xenova/all-MiniLM-L6-v2`](https://huggingface.co/Xenova/all-MiniLM-L6-v2), through the open-source [`@huggingface/transformers`](https://huggingface.co/docs/transformers.js), runs in the **browser**. It embeds the incident text and ranks relevant passages using cosine similarity. The model downloads on first use and caches through the browser runtime. The evidence lens **works without any API key**. It does not upload incident text to an embedding server.
2. **Claude reconstruction:** Clicking *Reconstruct with Claude* first runs the open-weight evidence lens, then sends the full report and the locally selected passages to a **server-side Anthropic Messages API** call. Claude extracts graph nodes, possible dependencies, chronology, source quotations, hypotheses and unknowns. This step needs `ANTHROPIC_API_KEY` and incurs Anthropic usage charges where applicable.
3. **Verbatim quote checking:** Claimed supporting quotes are checked against the original report. Unmatched quotes are flagged. A match means *the words appear in the supplied document*, not that the document or inferred causal links have been independently verified.
4. **Interactive network and counterfactuals:** Explore a directed dependency graph and hypothetical containment scenarios using deterministic traversal logic, not a trained damage-prediction model.
5. **The Memory Vigil:** Light a symbolic lantern for a source-backed system trace, preserving fragments in browser-local storage. This commemorative exhibit is inspired by remembrance around Día de los Muertos; it never invents victim testimony or fictionalizes a person's real memories.
6. **Archive and export:** Keep up to 12 local investigations and export a Markdown dossier of evidence and remembered traces.

## Why this meets the open-source AI requirement

The **open-weight MiniLM evidence model** provides the core source retrieval capability, visibly demonstrates local inference, and supplies the passages used for reconstruction. Claude, a **proprietary model**, provides optional structured interpretation after that open step. We never describe Claude as open source or open weight. We do not claim the complete application works offline: the initial MiniLM download and the optional Claude request need network access. The open lens itself works without an inference API key once the model is available.

The model weights use **Apache-2.0**; inspect the [model card](https://huggingface.co/Xenova/all-MiniLM-L6-v2) for details. The application source is **MIT-licensed**. Local embeddings rank relevance; they do *not* decide whether a conclusion is true.

## Stack

Next.js 16, React 19, TypeScript 5.9, custom CSS, Lucide React, Transformers.js, Apache-2.0 MiniLM embeddings, Anthropic Claude Messages API, Node.js, GitHub Actions (checks), and Vercel.

## Run locally

```bash
cp .env.example .env.local
# Set the private ANTHROPIC_API_KEY, and optionally CLAUDE_MODEL
npm install
npm run dev
```

Use `http://localhost:3000`. The **Open Evidence Lens** and both fictional sample cases work **without Claude API credentials**. Model weights are downloaded from Hugging Face on the first local lens run; network restrictions may block downloads. Claude API usage may incur charges. Never include the API key in a `NEXT_PUBLIC_` variable.

## Deploy from GitHub to Vercel (no local npm required)

1. Create a **new empty public repository** `paulos-ui/ghosttrace` at https://github.com/new and push the contents of this ZIP to its root.
2. Open https://vercel.com/new and import `paulos-ui/ghosttrace`; use Next.js and Root Directory `./`.
3. Add `ANTHROPIC_API_KEY` in Vercel Environment Variables (server-only). Obtain it from https://console.anthropic.com/settings/keys. Optional: `CLAUDE_MODEL=claude-sonnet-4-6`.
4. Deploy, then check `/api/health` (`status: ok`) and `/api/status` (`configured: true`). Neither endpoint exposes your key.
5. On the live site, run **Open evidence lens** and confirm ranked passages appear; then run **Reconstruct with Claude** and confirm the graph changes to **LIVE MODEL OUTPUT**.
6. Visit Memory Vigil, light a lantern, reload and verify it remains lit. Export an evidence dossier.

> A build or deployment is not considered verified until the real production build and both model paths are tested. The source-package preparation environment could not access npm registry or a private Anthropic API account.

## Data handling and safety

- The local model's **weights** are fetched from Hugging Face; **report text** is processed on-device by the local evidence lens.
- Clicking *Reconstruct with Claude* sends the **whole report** and selected evidence passages to Anthropic, through the Next.js server. Read Anthropic's privacy terms before submitting sensitive text.
- Never use real confidential infrastructure records, incident credentials, medical records, private personal memories or sensitive operational plans for a public demo.
- Reports imported via `.txt`, `.log` or `.md` are read locally; files are not uploaded merely by selecting them.
- Saved case content and Memory Vigil lanterns are stored in the **current browser** and will be lost if browser data is cleared unless exported.
- There is an in-memory per-instance courtesy limit for Claude calls, not a globally enforced spend ceiling. Configure actual budget and rate restrictions in your Anthropic account and hosting platform.

## Project architecture

```text
Browser / Next.js
  ├─ Source report and sample archives
  ├─ Open Evidence Lens: Transformers.js + local MiniLM embeddings
  │    └─ Ranks actual source passages and displays relevance scores
  ├─ Claude reconstruction (explicit opt-in)
  │    └─ POST /api/analyze → Next.js server → Anthropic Messages API
  │         └─ validate evidence quotations / normalize graph response
  ├─ Directed-graph traversal, containment, timeline and inspector
  ├─ Memory Vigil, lanterns and export
  └─ Browser-local saved cases
```

`src/lib/open-evidence.ts` runs the open model in the browser, `src/lib/evidence-passages.js` ranks source passages, `src/app/api/analyze/route.ts` contains the Claude server call, `src/lib/reconstruction.ts` normalizes the model's output, and `src/lib/engine.js` does deterministic graph traversal.

## Verification

```bash
npm test
npm run typecheck
npm run build
```

`npm test` runs offline engine and retrieval tests. **A complete Next.js production build and real network calls still require your deployment to confirm.**

## Challenge submission

Official: https://dev.to/challenges/hacktoberfest-week4-2026-10-26

Read `docs/DEPLOYMENT.md`, `docs/DEMO_SCRIPT.md`, `docs/DEV_SUBMISSION_DRAFT.md`, and `docs/COMPETITION_CHECKLIST.md` before publishing. A **.tech domain is optional**. Check any Hacktoberfest promotion's checkout and renewal costs before purchasing.

## License

MIT for project source. MiniLM's model weights are Apache-2.0. Claude is proprietary and requires a paid API when applicable.
