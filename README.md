# Bagyt — a direction of your own

[Open Bagyt](https://bagyt-pink.vercel.app) · [Public repository](https://github.com/tokha-t/bagyt)

## 1. Problem statement

Students in grades 9–11 in Kazakhstan must compare academic requirements, tuition, languages and locations, then turn that comparison into a preparation plan. Relevant information is fragmented and its certainty varies.

## 2. Solution and target user

Nine questions in three back-navigable steps produce explained university fit scores, a comparison of two or three programs, a dated roadmap and one next action. Only grade and field are required. This is a planning prototype; users should verify official requirements before acting.

[Demo persona Aisha: grade 11, UNT 118, IT, ₸3–6m, Kazakhstan and abroad](https://bagyt-pink.vercel.app/profile?g=11&f=it&gb=g&unt=118&l=kk:f,ru:f,en:w&ec=planned&b=3-6m&r=kazakhstan,europe&y=2027).

## 3. Stack and exact versions

Node 22.22.3 locally (minimum 20.9), npm 10.9.8, Next.js App Router, React, TypeScript strict mode, Tailwind CSS v4 and Vercel. Exact lockfile versions:

- `next`: `16.3.5`
- `react`: `19.2.8`
- `react-dom`: `19.2.8`
- `tailwindcss`: `4.3.3`
- `typescript`: `5.9.3`
- `eslint`: `9.39.5`
- `@tailwindcss/postcss`: `4.3.3`

No database, authentication, analytics, component framework or animation package. npm lockfile is committed. Formatter and one-off local verification utilities were invoked with npx and are not runtime dependencies.

## 4. Architecture

| Stage | Route | Responsibility |
| --- | --- | --- |
| 1 | `/` | Landing, one primary CTA |
| 2 | `/profile` | Nine questions, three steps |
| 3 | `/diagnostic` | Deterministic profile summary |
| 4 | `/matches` | Ranking, edits, deltas, relaxation and selection |
| 5 | `/compare` | Responsive comparison |
| 6 | `/roadmap` | Four phases, dated tasks and progress |
| 7 | `/next-action` | Earliest incomplete task |

`app/journey.tsx` owns UI orchestration. `components/` contains the 14 specified presentational components. Profile and selection changes use the native History API integrated with Next navigation; after the initial load, the journey does not require further page fetches. Every route also supports a direct entry and reload. Browser back/forward restores query state.

`lib/types.ts` is the domain contract. `lib/profile.ts` validates and serializes URL state. `lib/scoring.ts` computes six clamped integer dimensions and deterministic ID-tiebroken scores. `lib/reasons.ts` provides score-band-aware numerical explanations. `lib/roadmap.ts` back-dates applicable task templates; shared tasks are deduplicated. `lib/storage.ts` guards all completion storage. `lib/data.ts` validates provenance. JSON data is statically imported.

The only server API is `POST /api/summary`. It validates input and returns a cached complete template. The UI has the same local template and makes no request on the critical path.

Weights adapt in declared order. Fixed values are preserved while the remaining weights are redistributed proportionally. The reference date is injected into scoring; the client supplies today in Asia/Almaty. No I/O, current-clock calls or randomness exist inside the scoring engine. On fewer than three direct matches, constraints relax in ascending weight order and widened results are explicitly labelled.

## 5. Local setup

```sh
git clone https://github.com/tokha-t/bagyt.git
cd bagyt
npm ci
npm run dev
```

Open http://localhost:3000. No environment variables are required.

```sh
npm run lint
npm run build
npm start
npm audit
```

Environment files are ignored from the initial commit. Never put secrets in client-prefixed environment variables. Vercel is connected to `main`; the public alias is listed above.

## 6. Verification scenario

There is no automated test suite deliverable. See [QA.md](QA.md) for executed checks and outstanding gates, and [SPEC.md](SPEC.md) for the reconstructed requirement register and current progress state. Do not treat an unchecked gate as passed.

1. At 390×844 open landing and confirm the CTA is visible.
2. Complete all nine questions, testing step back and browser back/forward.
3. Repeat with grade and field only.
4. Confirm the diagnostic names your grade and field, plus supplied values.
5. Confirm at least three recommendations and all six numerical explanations.
6. Change UNT 118 to 92; observe reranking, cause text, deltas above five points and any departing option.
7. Change budget to grant-only and observe financial/academic weighting.
8. Select two options and compare; select three and attempt a fourth to verify the limit.
9. Verify four roadmap phases and date order within each phase.
10. Complete the highlighted next action and inspect its successor.
11. Reload and confirm the URL profile and completion are preserved.
12. Inspect badges and open a verified source.

Boundary URLs:

- [B-1](https://bagyt-pink.vercel.app/matches?g=11&f=undecided)
- [B-2](https://bagyt-pink.vercel.app/matches?g=11&f=engineering&unt=50&b=grant-only&r=kazakhstan)
- [B-3](https://bagyt-pink.vercel.app/matches?g=11&f=it&unt=140&b=over-6m&r=any)
- [B-4](https://bagyt-pink.vercel.app/matches?g=11&f=undecided&gb=u)
- [B-5](https://bagyt-pink.vercel.app/matches?g=11&f=medicine&l=kk:f&ec=none&r=kazakhstan)
- [B-6](https://bagyt-pink.vercel.app/matches?g=11&f=it&r=europe&b=under-1m)
- [B-7](https://bagyt-pink.vercel.app/matches?g=9&f=undecided&y=2029)
- [B-8](https://bagyt-pink.vercel.app/matches?g=11&f=it&gb=e&unt=140&l=kk:f,ru:f,en:f&ec=ielts:9&b=over-6m&r=any&y=2027)

Resilience: run without any API key, make the summary route unavailable, disable storage, enter malformed query parameters, visit an unknown route and inspect slow-network rendering. Actual Safari/iOS, Firefox, CPU-throttled timing, Lighthouse and unused-device checks must be recorded separately.

## 7. Team roles

Solo project. Product direction and registration: repository owner. Implementation, source research, documentation and desktop verification: Codex AI coding assistance. The registered team name was not supplied; no team identity was invented.

## 8. Data sources

Checked on 2026-09-18:

- [Astana IT University admissions](https://astanait.edu.kz/ru/how-to-apply): eight program rows carry verified **published grant participation thresholds** (not competitive outcomes or future intake requirements).
- [Ministry announcement for Қазақстан халқына charitable grants](https://www.gov.kz/memleket/entities/sci/press/news/details/1271028?lang=ru): the 1,000,000 ₸ ceiling belongs to this restricted charitable program. It is stored with its correct scope in `data/facts.json` and is not evidence of a universal state-grant cap.
- [2026 UNT announcement](https://www.gov.kz/memleket/entities/sci/press/news/details/1197627?lang=ru): general national eligibility thresholds, researched but not substituted for program competition scores.

Added on 2026-09-18 after a dedicated data-research pass:

- [KIMEP tuition and fees 2026-2027](https://www.kimep.kz/prospective-students/files/2026/05/tuition_fees_ugrad_eng.pdf): **verified**. KZT 163,230 per academic credit, a recommended 30–36 credits per year (KZT 4,896,900–5,876,280 per year) and 146 credits for the degree. The dataset stores 5,876,280 ₸/year, the 36-credit load needed to finish in four years.
- [Ministry of Science and Higher Education, grant results 2026-2027](https://www.gov.kz/memleket/entities/sci/press/news/details/1270585?lang=ru): **verified**. 60% of 2026-2027 grants directed to engineering and technical directions; more than 75,000 bachelor grant holders; about 127,000 applications; more than 2,000 «Serpin» grant holders in northern, eastern and central Kazakhstan. Allocation by direction is not an individual applicant's chance.
- univision.kz (tier-4 aggregator, checked 2026-09-18): annual prices for AITU (2,500,000 ₸ for every bachelor programme), KazNMU 6B10101 (1,230,700 ₸), Abai 6B01101 (900,000 ₸), KazNARU 6B08101 (800,000 ₸), Zhetysu 6B01301 (750,000 ₸) and the Satbayev 6B071xx engineering band (1,111,380 ₸). Also the 2025 grant passing scores (проходной балл, общий конкурс) used for `grantCutoff`. All of these render as **expected** with the aggregator and the scope named, not as verified — an aggregator is not a primary source.

Three different Kazakh numbers are deliberately kept apart in the dataset and the interface: the ministry **пороговый балл** (minimum to enter the competition), the **проходной балл** (what actually won a grant in a given year, stored as `grantCutoff` and labelled 2025) and a university's own **внутренний порог** (stored as `untCutoff`; the eight AITU rows carry the university's published participation thresholds).

Dataset: 36 program rows, 24 in Kazakhstan, 11 distinct fields, 24 demo grant-availability assumptions, eight source-linked cutoff rows. Tuition, unverified program details, foreign UNT proxies and other unsourced numerical benchmarks are visibly demo-labelled. Future dates are expected planning assumptions with a visible basis. There is no runtime scraping.

## 9. AI and APIs used

Codex assisted with code, design, source discovery, checks and this README. The live application currently uses a deterministic diagnostic template. Optional model generation (F18/S-1) is deferred; no student profile is sent to an AI provider. The summary route always returns `source: template` and a process-cached result for valid input, with 400 for malformed input. An unset `SUMMARY_API_KEY` is the normal supported configuration.

## 10. Pre-built components and tooling

Next.js `create-next-app` scaffold, Next routing/runtime, React, Tailwind CSS/PostCSS, TypeScript, ESLint, and Inter via `next/font/google` (Latin and Cyrillic subsets, self-hosted build output). All 14 application components and the visual layout were authored for Bagyt. No MUI, Chakra, shadcn, icon, chart, form, state, date or animation library was used. Browser inspection used Codex browser tooling. No stock illustration was used; the desktop direction graphic is CSS.

## 11. Known limitations and specification clarifications

- This is a 36-row prototype, not a comprehensive admissions catalogue. Six of the 24 Kazakh tuition figures and nine grant cut-offs now carry a source; the rest remain demo data.
- Tuition that could **not** be found and therefore stays demo: KBTU (publishes a per-credit price only, and the current price list on the site is 2025-2026), SDU (per-ECTS prices published inside a Google Drive PDF that cannot be read), IITU, ENU Gumilyov, Al-Farabi KazNU, Astana Medical University, Buketov University, Korkyt Ata University (univision lists no price at all) and Turan Design (univision shows the arts cluster at 1,284,000 ₸ but no Design row). Blank was chosen over a plausible guess in every one of these.
- The requested universal state-grant cap could not be verified. A simulated 1,000,000 ₸ cap exercises the specified financial formula but is disclosed as demo; F16 AC16.4 is not claimed passed. Do not use the simulated gap as a quote for actual grant coverage.
- AITU values are published participation thresholds, not historical competitive results. The specification’s “typical competitive score” interpretation is therefore not claimed verified. Eight verified threshold rows exist with their precise scope visible.
- Foreign UNT benchmarks are demo proxies, not foreign admissions requirements. Test subject combinations, creative exams, AITU AET, visas and individual grant eligibility are not modelled.
- The city is not collected, so “my city” produces a neutral, explained location score.
- A profile edit recomputes immediately, but an unchanged relevant input or rounding may preserve scores/order. Grade alone does not enter the stipulated six formulas; the cause line explicitly says so.
- All future task dates are expected assumptions, not announced 2027–2029 deadlines. Leap years may shift a fixed-day offset by one calendar day. Changing intake creates a separate completion namespace.
- Optional model-generated prose is not enabled. COULD features remain deferred according to the scope gate.
- The separate plan document was not provided. Slides, submission links and event moderation instructions cannot be reconstructed from this technical document.
- Physical-device, unrehearsed timing and scheduled freeze checks are pending until recorded in QA.md. This repository is not labelled fully submission-ready while those gates are open.
