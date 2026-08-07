# cert-quest

A gamified study site for certification exams. Pull a random set of questions from a
pool, build a test from the ones you miss most, and get a deep explanation with
reference links for every answer.

Currently ships with a **CISSP** pack of **483 questions**.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve the production build
```

## Study modes

| Mode | What it does |
| --- | --- |
| **Practice test** | Random draw from the pool. Choose 10, 20, 40, 100, all, or type a custom number. |
| **Weak first** | Orders by weakness: recent misses, then cards falling due, then never-seen. |
| **Most missed** | Only questions you have gotten wrong, worst offenders at the top. |
| **Flashcards** | Read, commit to an answer, reveal, self-grade. Feeds the same scheduler. |
| **Browse** | Search all questions by keyword, number, or domain. Filter by mastery. |
| **Progress** | Streaks, lifetime accuracy, mastery breakdown, 30-day heatmap, per-domain accuracy. |

## Scheduling

`src/lib/srs.ts` implements a simplified SM-2. A correct answer grows the interval by
the card's ease factor; a miss resets the interval, increments a lapse counter, and
puts the card back in the queue for the same session rather than pushing it days out.
That is deliberate — the aim is passing a dated exam, not maintaining knowledge
indefinitely.

Mastery is derived from the consecutive-correct streak and rendered as a
classification banner on each card:

| Level | Meaning |
| --- | --- |
| Unseen | never answered |
| Missed | last attempt was wrong |
| Learning | 1 correct in a row |
| Solid | 2–3 correct in a row |
| Mastered | 4+ correct in a row |

## Explanations

Each enriched question carries: why the keyed answer is right, why every distractor
fails, the underlying concept, the exam trap, weblinks to primary sources (NIST,
OWASP, ISO, AICPA, (ISC)²), and optionally an interactive explainer.

Explainers are data-driven, so adding one is a matter of writing a config object
rather than a component. Six primitives are available: `steps`, `matrix`, `timeline`,
`nested`, `compare`, and `ladder`. See `src/components/Visual.tsx`.

Questions whose source answer key is contested carry a `disputed` field, which renders
a visible warning explaining the disagreement rather than silently teaching one side.

## Adding a certification

The app is not CISSP-specific. A pack is a `CertPack`:

```ts
{ id, name, blurb, questions: Question[], enrichment: Record<string, Enrichment> }
```

Drop a new folder under `src/data/`, export a pack, and register it in
`src/data/index.ts`.

## Progress storage

Progress lives in `localStorage` under `cert-quest:progress:v1`. Export and import
buttons on the Progress page produce a JSON file, so you can move between browsers or
back up before clearing site data.

## Licence

MIT
