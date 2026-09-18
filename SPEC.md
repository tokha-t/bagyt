# Bagyt — conformance and progress state

Audited against **Bagyt — Technical Specification v1** (2026-09-18, LOCUS Case 2, freeze 19 Sept 09:30
Astana). Audit run 18 September 2026 against local `main` `9b743bd` plus uncommitted working-tree changes.

The specification document itself is not committed to this repository. Section and AC numbers below
reference it directly.

Legend: **PASS** = evidenced. **PARTIAL** = implemented, one AC line short. **OPEN** = not yet verified.
**NOT BUILT** = deliberately absent. **FAIL** = implemented contrary to the AC.

## 1. Headline

Every MUST (M-1..M-14) is implemented. Five of six SHOULD items are implemented. The build is not
freeze-ready: five §12.5 gates are unverified, one SHOULD is unbuilt, and three working-tree changes are
uncommitted.

| Block | State |
| --- | --- |
| MUST M-1..M-14 | 14 / 14 implemented |
| SHOULD S-1..S-6 | 5 / 6 — S-1 not built |
| COULD S-7..S-10 | 0 / 4 — permitted, §2.4 gate not reached |
| Success criteria SC-1..SC-10 | 8 PASS, 2 OPEN (SC-1, SC-5) |
| Pre-freeze gates G-1..G-10 | 5 PASS, 5 OPEN |
| Feature ACs §4–§5 | 3 deviations, listed in §5 |

## 2. Scope — §2.2 MUST

| ID | Item | State | Evidence |
| --- | --- | --- | --- |
| M-1 | Seven stages implemented and reachable | PASS | 8 static routes build; `/`, `/profile`, `/diagnostic`, `/matches`, `/compare`, `/roadmap`, `/next-action` |
| M-2 | 9-question profile, 3 steps, back-navigable | PASS | 9 `<legend>` blocks, `step === 1|2|3` gating (`app/journey.tsx:89,135,240`) |
| M-3 | Deterministic 6-dimension scoring | PASS | `lib/scoring.ts`, no clock or randomness, `today` injected |
| M-4 | Per-dimension visible score + reason | PASS | `MatchCard` renders 6 `DimensionBar`s, fixed order |
| M-5 | Re-rank with delta chip + cause line | PASS | `DeltaChip`, cause text at `app/journey.tsx:422` |
| M-6 | ≥ 3 recommendations for every valid profile | PASS | B-1..B-8 produced 5,5,5,5,3,5,5,5 |
| M-7 | Comparison of 2–3 programs | PASS | 4th blocked with stated reason |
| M-8 | Date-ordered roadmap, 4 phases | PASS | `PhaseGroup`, date sort within phase |
| M-9 | Single next action + completion toggle | PASS | `NextActionCard`, successor promoted on completion |
| M-10 | Provenance badge on every rendered fact | PASS (audit open) | `SourceBadge` everywhere; G-10 sweep not yet run |
| M-11 | Mobile layout 320–430 px | PASS | 49-combination sweep, zero horizontal overflow |
| M-12 | Designed empty + error state per surface | PASS | `EmptyState`, `app/error.tsx`, `app/not-found.tsx` |
| M-13 | Deployed public URL, no auth | PASS | `GET /` 200 in 0.53 s, no credentials |
| M-14 | Public repo, ≥ 15 commits, README per §12.6 | PASS | 16 commits; all 11 README sections present |

## 3. Scope — §2.3 SHOULD

| ID | Item | State | Note |
| --- | --- | --- | --- |
| S-1 | LLM diagnostic paragraph with template fallback | **NOT BUILT** | `app/api/summary/route.ts` always returns `source: 'template'`. §2.3 says build SHOULD once every MUST is green — every MUST is green, so this is the one outstanding scope item |
| S-2 | Profile encoded in URL query string | PASS | `lib/profile.ts`, full round-trip stable |
| S-3 | Roadmap completion persisted to `localStorage` | PASS | `lib/storage.ts`, both functions wrapped |
| S-4 | Adaptive dimension weights | PASS | `resolveWeights`, all four §7.1.2 rules present |
| S-5 | Collapsed "not yet" tier with exclusion reason | PASS | `app/journey.tsx:761`, per-program binding reason |
| S-6 | Grant-gap calculation against the 1,000,000 ₸ cap | PARTIAL | gap computed and displayed; AC16.3 closed 18 Sept; AC16.4 still deviates — §5 |

§2.4 COULD (S-7 share link, S-8 scholarship filter, S-9 print roadmap, S-10 language toggle): none built.
Permitted — the gate is 19 Sept 07:00 with all SHOULD done, and S-1 is not done.

## 4. Success criteria §1.5

| ID | Threshold | State | Measurement |
| --- | --- | --- | --- |
| SC-1 | Full path ≤ 180 s, cold start, mobile | OPEN | needs one unrehearsed human run on a phone |
| SC-2 | Re-rank ≤ 2 s perceived, CPU 4× | **PASS** | CDP `setCPUThrottlingRate 4`, 12 keypresses: median **13.0 ms**, p95 19.3 ms |
| SC-3 | 7 of 7 stages reachable | PASS | route-by-route walk |
| SC-4 | ≥ 3 recommendations always | PASS | B-1..B-8, minimum observed 3 |
| SC-5 | 100% of facts badged | OPEN | G-10 unbadged-fact sweep not yet executed |
| SC-6 | Full path with `SUMMARY_API_KEY` unset | PASS | no key exists in code at all; full journey works |
| SC-7 | No horizontal scroll 320–430 px | PASS | 49-combination sweep |
| SC-8 | 0 console errors on full path | PASS | zero errors or warnings across the sweep |
| SC-9 | Body-text contrast ≥ 4.5:1 | PASS | ink 16.77:1, muted 5.65:1, faint 5.02:1 |
| SC-10 | ≥ 15 descriptive commits on `main` | PASS | 16, each naming its feature IDs |

## 5. Feature AC deviations

Three AC lines do not pass as written. Everything else in §4 and §5 passes.

**AC16.4 — FAIL, deliberate.** The spec states the 1,000,000 ₸ ceiling "renders a verified badge with its
source link" and §6.1 comments `GRANT_TUITION_CEILING` as "verified". The located official source
(gov.kz 1271028) covers the Қазақстан халқына **charitable** program, not a universal state-grant cap.
`data/facts.json` therefore stores `grantCap` as `demo` and the charitable figure separately as `verified`
with its restricted scope. Badging an unverified universal cap as verified would breach NFR-27..NFR-29 and
the §1.7 prohibition, which outrank a SHOULD. The deviation is disclosed in README §11.

**AC16.3 — CLOSED 18 Sept.** `components/MatchCard.tsx` now states it under the gap figure: "A grant
covering tuition is not the same as studying free: this gap, plus living costs, stays payable."

**AC3.3 — PARTIAL.** The profile-step slider shows a live derived count ("N dataset benchmarks reached
(not eligibility)") updating same-frame, satisfying the intent. The second slider on `/matches`
(`app/journey.tsx:639`) uses a static hint, "Move the slider to explore academic fit." Either wire the
same derived count or note the divergence.

**§7.2.1 — interpretive.** The spec asks for 6 dimensions × 4 bands = 24 reason templates.
`lib/reasons.ts` composes 4 band lead phrases with 6 dimension bodies, so 24 distinct strings are produced
and every one interpolates a number, but the body itself is not band-specific. Output contract satisfied;
template count satisfied combinatorially, not literally.

**§10.2 token change — justified.** `--color-ink-faint` is `#626C79`, not the specified `#8B94A0`. The
spec's value fails NFR-7 on `--color-paper` (≈2.6:1); the shipped value measures 5.02:1. NFR-7 explicitly
requires this pair to be verified, so the token was corrected rather than the requirement.

**§10.4 layout addition.** The spec's tree routes F12 through `roadmap/page.tsx`. The build adds
`app/next-action/page.tsx` as a seventh route and `app/journey.tsx` as the shared orchestrator. AC12.3
reachability from `/matches`, `/compare` and `/roadmap` is satisfied (`app/journey.tsx:800,830,879`).

## 6. Data contracts §6 — all satisfied

| §6.6 constraint | Required | Actual |
| --- | --- | --- |
| Rows in `data/programs.json` | ≥ 18, target 36 | **36** |
| Distinct fields covered | ≥ 8 of 12 | **11** |
| Rows with `country === 'KZ'` | ≥ 20 | **24** |
| Rows with verified `cutoffProvenance` | ≥ 8 | **8** |
| Rows with `grantAvailable === true` | ≥ 10 | **24** |
| Rows priced above the ceiling | ≥ 4 | **31** |
| `data/facts.json` present | required | present |

Invariants hold: every `verified` provenance carries `sourceUrl` and `checkedOn`; `grantAvailable === false`
implies `grantCutoff === null`. `lib/types.ts` matches §6.1–§6.5 field for field, `strict: true`, no `any`.

## 7. Module contracts §7 — all satisfied

`rankPrograms`, `scoreProgram`, `resolveWeights`, `tierOf` exported with the specified shapes (`opts` adds
an optional `today` for §7.1.5 determinism). Base weights and all four §7.1.2 adaptation rules match.
`TASK_TEMPLATES` contains all twelve required IDs — `unt-register`, `unt-sit`, `ielts-book`, `ielts-sit`,
`transcript`, `id-passport`, `motivation-letter`, `recommendation`, `grant-documents`,
`university-application`, `portfolio-olympiad`, `scholarship-application`. `encodeProfile`,
`decodeProfile`, `profileHash`, `DEFAULT_PROFILE` present; `decodeProfile` does not throw on malformed
input. `readCompleted` / `writeCompleted` both wrapped.

## 8. API §8

The route exists, is `runtime = 'nodejs'`, caches by `profileHash` for the process lifetime, returns 400 on
a malformed body and never 5xx. Because S-1 is not built there is no upstream call, so §8.3's 6000 ms
`AbortController` timeout, the 320-character output cap and §8.4.1's post-generation validation have no
code path. AC18.5 (`SUMMARY_API_KEY` unset → full path works) passes trivially: no key is read anywhere.
AC18.1, AC18.2, AC18.3 and AC18.6 are vacuous until S-1 is built; AC18.4 passes — the template is complete
prose with no fallback notice.

## 9. Non-functional §11

| ID | Target | State |
| --- | --- | --- |
| NFR-1 | Scoring < 16 ms | PASS — 0.09–0.13 ms over 36 rows |
| NFR-2 | Re-rank ≤ 2 s, CPU 4× | **PASS** — median 13.0 ms, p95 19.3 ms |
| NFR-3 | FCP ≤ 2.5 s, Lighthouse mobile | **PASS** — 1.3 s production |
| NFR-4 | JS ≤ 300 KB gzipped | PASS — 194,702 B |
| NFR-5 | CLS ≤ 0.1 | **PASS** — 0 |
| NFR-6 | Slider hint same frame | PASS on the profile slider; see AC3.3 |
| NFR-7..NFR-14 | Accessibility | PASS — Lighthouse accessibility **100** mobile and desktop; contrast, focus rings, text-not-colour, reduced motion all verified |
| NFR-15 | Chrome, Safari, Firefox current | PARTIAL — Chromium only; Firefox not installed, Safari not drivable headlessly |
| NFR-16 | 320–1920 px no horizontal scroll | PASS — 49 combinations |
| NFR-17 | Private browsing, storage unavailable | PARTIAL — module-level throwing-store run passes; browser-level private window open |
| NFR-18 | No network after initial load | PASS — full journey traversed with the server stopped |
| NFR-19..NFR-25 | Resilience | PASS — R-1..R-5 executed; R-6 Slow 4G open |
| NFR-26..NFR-31 | Content integrity | PASS by construction; G-10 sweep open |
| NFR-32..NFR-38 | Security and compliance | PASS — `.env*` ignored from commit 1, no `NEXT_PUBLIC_` key, `git grep` finds no secret, `npm audit` 0 findings, external links carry `rel="noopener noreferrer"`, AI assistance disclosed in README §9 |

## 10. Pre-freeze gate §12.5

| # | Check | State |
| --- | --- | --- |
| G-1 | `npm run build` exits 0, no type errors | PASS |
| G-2 | `npm audit` 0 critical / 0 high | PASS — 0 total |
| G-3 | ≥ 15 commits | PASS — 16 |
| G-4 | No live secret | PASS — `git grep -i -E "api[_-]?key|secret" -- ':!*.md'` returns nothing |
| G-5 | §12.2 walkthrough 12 of 12 | OPEN — W-1..W-12 covered piecemeal, never as one uninterrupted devtools-free pass |
| G-6 | §12.3 boundary profiles 8 of 8 | PASS |
| G-7 | §12.4 resilience 6 of 6 | OPEN — R-6 Slow 4G skeleton/CLS check outstanding |
| G-8 | Production URL, private window, unused device | OPEN — non-negotiable per §12.5.1 |
| G-9 | Lighthouse mobile accessibility ≥ 90 | **PASS — 100** |
| G-10 | Unbadged-fact audit, 0 found | OPEN |

## 11. Defect found and fixed in this audit

Closing G-9 surfaced a real mobile legibility defect: Lighthouse reported only **45.88% legible text** on
the landing page. `.scope` and `.eyebrow` were 11px and `.landing-footer` dropped to 10px inside the
≤720px media query — the smallest type sat exactly where the screen was narrowest, against M-11 and the
spirit of NFR-7.

Fix: all 25 `font-size: 10px` / `11px` rules in `app/globals.css` raised to 12px, covering eyebrow labels,
`.source` provenance badges, tier chips, dimension explanations, comparison cells and the landing footer.
Post-fix: font-size audit 100% legible, Lighthouse mobile best-practices 96 → 100, 49-combination sweep
still zero overflow and zero console output, build and lint clean.

## 12. What remains, in order

1. **Commit and deploy.** `QA.md`, this `SPEC.md` and the 12px fix are all uncommitted. `README.md`
   already links `QA.md`, so that link 404s on GitHub right now. Commit, push to `main`, confirm Vercel
   serves the new SHA. `.omc/` is tool state and belongs in `.gitignore`, not in the commit.
2. **AC3.3** — wire the derived program count into the `/matches` slider hint, or record the divergence.
4. **S-1 / F18** — the one unbuilt SHOULD. Requires §8.3 timeout and §8.4.1 post-generation validation, not
   just an API call. Deferring it is defensible; leaving it undecided at freeze is not.
5. **G-5** — one uninterrupted 12-item walkthrough, no devtools.
6. **G-7 / R-6** — Slow 4G skeleton and layout-shift check.
7. **G-10 / SC-5** — unbadged-fact sweep across every rendered state.
8. **NFR-15** — desktop Safari and current Firefox, then real iOS Safari per §11.3.1 (slider, accordion,
   `100vh`).
9. **SC-1** — unrehearsed participant, physical phone, stopwatch.
10. **G-8** — production URL in a private window on an unused device.
11. **§13.2 freeze protocol** — run §12.5 twice (19 Sept 07:00 and immediately before 09:30), then record
    the SHA and confirm production serves exactly it.

Items 8–10 need the owner, a second browser and a second device; they cannot be executed from here.
Per §13.2 rule 4, anything discovered after the freeze is documented in README §11, not fixed.
