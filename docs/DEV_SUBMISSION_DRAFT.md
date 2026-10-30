# GHOSTTRACE: Every System Leaves a Ghost 👻

*An open-weight evidence lens, a forensic reconstruction laboratory, and a memory vigil for the systems history left behind.*

**Hacktoberfest 2026, Week 4: Ghost in the Machine**

**Live:** [ADD ACTUAL VERIFIED VERCEL OR .TECH DOMAIN]

**Source:** https://github.com/paulos-ui/ghosttrace

**Demo video:** [ADD A PUBLIC VIDEO URL IF AVAILABLE]

**Prize category:** Overall. Only request **Best Use of a .tech Domain** after you actually claim an eligible domain through the promotion, configure it, and verify the app runs at that domain.

## The incident that stayed in the archive

Imagine a fading town archive. A maintenance log records a transformer failure at 11:43 p.m. A water pump goes silent minutes later. By morning, responders are discussing several different emergencies. Their notes list events in chronological order, but those notes do not show the threads connecting one system to another.

The report outlasts the people who wrote it. The system gets rebuilt. The connections are harder to recover.

I started GHOSTTRACE with a question: **What if we could reconstruct the invisible map inside an old incident report, while refusing to make up what the document doesn't actually say?**

GHOSTTRACE is my response. It is a browser-based forensic laboratory, built around an open-weight evidence model, that lets you explore infrastructure incident records with the atmosphere of a haunted archive. The sample Bellwether incident and the other included sample case are **fictional**, designed for safe experimentation. They are not historical claims.

## What I built

The experience has two parts. The first is an investigation room. The second is a memory vigil.

In the **investigation room**, you can read a sample report or paste your own. Rather than immediately trusting an enormous language model to tell you what happened, GHOSTTRACE starts with an **open-weight evidence lens**. It runs the Apache-2.0 [`all-MiniLM-L6-v2`](https://huggingface.co/Xenova/all-MiniLM-L6-v2) embedding model locally in the visitor's browser through the open-source Transformers.js library.

The model turns the user's report passages and an infrastructure investigation query into embeddings. It ranks the passages by semantic similarity and shows the top excerpts with their scores. This doesn't prove they are correct or establish causality, but it makes the evidence selection **visible and inspectable**. Because those embeddings are computed in the browser, the evidence lens does not need an inference API key, and the source text does not have to be sent to an embedding service.

**[INSERT SCREENSHOT: actual open-weight evidence lens with ranked passages]**

When you choose **Reconstruct with Claude**, GHOSTTRACE uses the evidence passages as context and calls the Anthropic Claude API from a private server route. Claude proposes systems, directed dependencies, a timeline, uncertain hypotheses and open questions. The app limits and normalizes the result, checks whether its quoted evidence actually appears in the report and labels unmatched quotations as unverified. It distinguishes *what the report says* from *what a model interprets*.

I want to be explicit about a technical distinction: **Claude is proprietary**. I'm not submitting Claude as an open-weight model. The open-weight intelligence in this project is the local MiniLM retrieval model and the open-source Transformers.js inference system. Claude is a complementary reasoning service for structured reconstruction.

**[INSERT SCREENSHOT: Claude-reconstructed graph, selected node and source quote]**

The result becomes an interactive network. I can click a node to inspect its evidence, explore the event chronology, or try a hypothetical containment intervention. A small deterministic graph engine traces possible paths through directed dependencies. It is **not** a certified infrastructure hazard simulator or a prediction of real damage.

The second half is the **Memory Vigil**. Recovered systems become lantern cards, each attached to a source quotation. Lighting a lantern preserves that documented trace in browser-local storage; exporting a dossier creates a readable Markdown record. The exhibit is inspired by the season of remembrance around Día de los Muertos. It is about preserving knowledge with care, not about channeling deceased people or inventing victims' memories.

**[INSERT SCREENSHOT: lanterns lit in Memory Vigil]**

## Why I chose open-weight AI

There are two reasons open innovation matters to GHOSTTRACE.

First, it changes what the visitor can inspect. With MiniLM, GHOSTTRACE can expose the source passages retrieved *before* a proprietary model starts interpreting them. That open-weight retrieval is an independent, usable part of the product. It can be tested without an Anthropic key and, after downloading model weights, executed by the browser runtime without contacting an inference provider for each search.

Second, it makes a meaningful part of the system replaceable. The embedding weights and Transformers.js are openly available, so developers can study the implementation and experiment with alternative embedding models. A closed API can still be useful for interpretation, but the source-retrieval step does not have to be locked behind one provider.

There are limits to this openness. The model weights must be downloaded on first use, so I do not claim a cold-start offline experience. And anyone clicking Claude reconstruction sends the report to Anthropic; I disclose that plainly in the interface and README. Open-source retrieval is not the same as private end-to-end processing when a separate hosted API is used.

## How the technology works

- **Next.js, React, TypeScript:** the investigative interface and server endpoint.
- **Transformers.js + Apache-2.0 MiniLM:** browser-local semantic embeddings that rank evidence passages.
- **Anthropic Claude API:** user-triggered structured analysis, using the entire source report and locally selected evidence passages.
- **Source quote checker:** marks excerpts that can and cannot be located in the supplied document.
- **Directed-graph engine:** a deterministic model of hypothetical propagation and containment, not a learned risk forecast.
- **Memory Vigil + browser storage:** a source-grounded remembrance interface and exported dossier.
- **Vercel:** deployment target, with private Anthropic credentials kept server-side.

I built the interface around a ghostlight palette, archival typography, copper traces, restrained motion and a dark schematic graph. The spooky design draws attention; the evidence interface earns it.

I also put some guardrails in place. The incident report length is bounded. Model outputs are normalized. The UI shows source uncertainty rather than concealing it. Real sensitive incident reports and personal data should not be used for public demonstrations.

## The hard part wasn't making it eerie

The difficult part was resisting a deceptively easy shortcut: turning a narrative report into a confident-looking graph and treating every arrow as fact. If two failures occur near each other in a report, that doesn't necessarily establish a causal relationship. I wanted visitors to see the gaps, not just the lines.

Separating the open-weight evidence ranking, Claude's structured reconstruction, the verbatim quote checks, and the deterministic graph engine helped keep those distinctions visible. It also gave me a stronger story for why the open model matters: not as a logo in the tech stack, but as a usable piece of the investigation.

## Why Ghost in the Machine?

A ghost is something that remains present even when the original object is gone. Technical systems leave that kind of trace: an incident log, a warning signal, a dependency that nobody wrote down clearly, a lesson passed between operators.

For Halloween, I built a spectral investigation room that lets those traces resurface. For Día de los Muertos, the Memory Vigil gives them a place to be remembered. It honors the idea of remembrance without claiming to recreate anyone who has died.

The project closes on a deliberately modest promise: **not that AI can tell us the entire truth about the past, but that open tools can help us find the evidence worth keeping.**

**GHOSTTRACE. Every system leaves a ghost.**

---

### Before you publish

Replace the screenshot and URL placeholders, record an actual open-weight evidence retrieval and actual Claude response, and confirm that the implementation really works in production. Follow the **official challenge submission template and tag** on DEV. Do not claim fully offline inference or call Claude open source. Edit any feature descriptions that don't pass live testing.
