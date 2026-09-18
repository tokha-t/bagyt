# Verification record

Executed on 18 September 2026. This is an evidence ledger, not a claim that every freeze gate has passed.

## Checks executed

| Check | Evidence / result |
| --- | --- |
| Production build | `npm run build` exits 0; all seven UI routes and one API route generated |
| TypeScript strict / lint | Build type checking and `npm run lint` pass |
| Dependency audit | `npm audit`: 0 vulnerabilities |
| Clean clone | GitHub shallow clone into a separate directory; `npm ci` and `npm run build` pass |
| Public access | Public production alias returns HTTP 200 without credentials; landing opened in browser |
| Repository history | 16 descriptive commits on main before this report; .env files ignored in initial scaffold commit |
| Landing | 390×844 screenshot: primary CTA fully visible, one primary action |
| Required profile controls | Empty first step blocks forward with a clear inline reason; grade and field unlock it |
| Minimum-input journey | Grade 11 + undecided only reaches diagnostic and five matches |
| Diagnostic | Names grade and field, with a specific UNT prompt when absent |
| All boundary profiles | B-1..B-8 browser renders: 5, 5, 5, 5, 3, 5, 5, 5 cards respectively; each card has six dimensions |
| Boundary console | No warnings/errors during the eight-profile run |
| Numeric engine inspection | One-off local scripted inspection: integer scores in range, six non-empty numerical reasons, byte-identical repeated ranking, weights sum to exactly 1 |
| Engine speed | 100 runs/profile averaged 0.09–0.13 ms across 36 rows; not a CPU-throttled browser measurement |
| URL serialization | Full maximal profile round-trip stable; malformed fields default without throwing |
| Mutation | Keyboard slider action from 118 to 91 produces cause text, departed-program notice and deltas 100→89, 100→76, 95→71, 95→71 |
| Grant-only mutation | Financial weight 35%, academic weight 30%; shortlist and cause update |
| Comparison limit | Three selections accepted; fourth blocked with “Choose up to 3 programs. Remove one before adding another.” |
| Mobile comparison | Stacked details render; no horizontal overflow at 390 px |
| Responsive sweep | 42 combinations: landing, profile, matches, comparison, roadmap, next-action at 320, 360, 390, 430, 768, 1280, 1920 px; zero document horizontal overflow |
| Roadmap | Four phases, date-sorted tasks, year shift from 2027 to 2028 observed; shared tasks deduplicated |
| Completion | Marking next action updates progress; reload preserves progress; deduplicated successor changes from project task to UNT registration |
| Offline after load | Loaded landing, stopped local server, traversed all seven stages, compared two programs and completed next action; no console errors |
| API absent key | POST valid profile returns 200 with complete prose and source template; no key required for full UI journey |
| Storage failure | One-off execution with throwing localStorage getter: read returns empty set, write does not throw |
| Static JS size | All 13 static JavaScript chunks gzip to 194,702 bytes combined, below 300 KB; not a network-transfer trace |
| Contrast | Ink/paper 16.77:1; muted/paper 5.65:1; faint/paper 5.02:1; primary/white 5.36:1; verified green/light-blue 4.75:1; ink/gold 5.58:1 |
| Reduced motion | Source inspection: CSS disables transitions/animations; rank-position animation checks media preference before running |
| Provenance | Program identity, prices, cutoffs, numerical explanations, comparison facts and task dates use SourceBadge; expected basis visible and verified anchors external with noopener/noreferrer |

The range-input `fill()` convenience method in the browser tool changed the native thumb without triggering React’s input callback. Real keyboard ArrowLeft interaction did trigger the expected application behavior. Mutation evidence above uses keyboard interaction, not the incomplete tool fill.

## Gates open after the first run

- SC-1: unrehearsed participant, physical mobile device, stopwatch ≤180 seconds.
- SC-2/NFR-2: perceived rerank latency under 4× CPU throttling.
- NFR-3/NFR-5/G-9: Lighthouse mobile FCP, CLS and accessibility report.
- NFR-15: current Firefox, Safari desktop and actual iOS Safari checks.
- G-8: private window on an unused physical device. A public HTTP response and desktop walkthrough do not substitute for this.
- Full 12-item walkthrough with all nine inputs, explicit back/forward and source-link checks at the scheduled freeze passes.
- Slow 4G skeleton/CLS check and browser-level disabled-storage check (module-level failure handling was exercised).
- The two dated verification runs required for 19 September at 07:00 and immediately before 09:30 Astana time have not occurred yet.
- Final freeze SHA and confirmation that its exact deployment is live.
- Independent final unbadged-fact inspection across every rendered state.

## Second run — 18 September 2026, Chromium headless

Environment: Chrome headless via Lighthouse 12.8.2 and puppeteer-core CDP, macOS, Node 22.22.3.
Production alias for the first Lighthouse pair; local `next start` build for the post-fix pair.

| Check | Evidence / result |
| --- | --- |
| Rebuild after CSS change | `npm run build` exits 0; `npm run lint` clean; `npm audit` 0 vulnerabilities |
| Production reachability | `GET /` 200 in 0.53 s; `GET /matches?g=11&f=it` 200 |
| Lighthouse desktop (production) | performance 100, accessibility 100, best practices 100, SEO 100; FCP 0.4 s, LCP 0.7 s, CLS 0, TBT 0 ms |
| Lighthouse mobile (production, pre-fix) | performance 98, accessibility 100, best practices 96, SEO 100; FCP 1.3 s, LCP 2.1 s, CLS 0, TBT 30 ms |
| Legible font size (pre-fix) | **Failed**: 45.88% legible text. `.scope` 11px, `.landing-footer` 10px, `.eyebrow` 11px below the 12px threshold |
| Fix applied | Every `font-size: 10px` and `font-size: 11px` rule in `app/globals.css` raised to 12px (25 rules, base and the ≤720px media query) |
| Lighthouse mobile (local, post-fix) | performance 97, accessibility 100, best practices 100, SEO 100; font-size audit 100% legible text; FCP 0.8 s, LCP 2.6 s (localhost, no CDN), CLS 0, TBT 10 ms |
| Responsive re-sweep after the fix | 49 combinations (7 routes × 320/360/390/430/768/1280/1920 px): zero document horizontal overflow, zero rendered text below 12px, zero console errors or warnings |
| Rerank latency under 4× CPU throttling | `Emulation.setCPUThrottlingRate 4`, 390×844, 12 ArrowLeft presses on the UNT slider from 118 to 106. Keydown to first DOM mutation: min 11.8 ms, median 13.0 ms, p95 19.3 ms, max 19.3 ms. Every press produced a DOM change |

### Gates closed by this run

- NFR-3 mobile FCP: 1.3 s on production, 0.8 s locally after the fix.
- NFR-5 CLS: 0 on desktop and mobile, before and after the fix.
- G-9 accessibility: Lighthouse accessibility 100 on mobile and desktop.
- NFR-2 / SC-2 rerank latency: median 13.0 ms, p95 19.3 ms under 4× CPU throttling.

These are Chromium headless measurements. They do not substitute for a physical device, for Firefox or
Safari, or for an unrehearsed participant.

## Gates still open after the second run

- SC-1: unrehearsed participant, physical mobile device, stopwatch ≤180 seconds.
- NFR-15: current Firefox, desktop Safari and actual iOS Safari. Firefox is not installed on this machine;
  Safari cannot be driven headlessly.
- G-8: private window on an unused physical device.
- Full 12-item walkthrough with all nine inputs, explicit back/forward and source-link checks at the
  scheduled freeze passes.
- Slow 4G skeleton/CLS check and a browser-level disabled-storage check.
- The two dated verification runs required for 19 September at 07:00 and immediately before 09:30 Astana
  time.
- Final freeze SHA and confirmation that its exact deployment is live. The 12px fix is **not deployed**;
  production still serves the pre-fix CSS.
- Independent final unbadged-fact inspection across every rendered state.

## Third run — 18 September 2026, data research applied

Source research per the Data Research Brief, then the dataset change re-verified.

| Check | Evidence / result |
| --- | --- |
| Dataset edit | 14 tuition rows, 9 `grantCutoff` rows and 2 `untCutoff` rows updated with provenance; `untCutoff` and `grantCutoff` now differ on 6 rows, where before they were identical on all 36 |
| Provenance policy | Only the KIMEP price list and the ministry press release are marked `verified`; every aggregator-sourced figure is `expected` with the aggregator and its year named |
| New rendered fact | Match cards show the 2025 grant cut-off with its badge and a line stating it is history, not a requirement |
| Build / lint | `npm run build` exits 0, `npm run lint` clean after the data and component change |
| Boundary profiles re-run | B-1..B-8 at 390×844: 5, 5, 5, 5, 3, 5, 5, 5 cards — unchanged counts; six dimensions per card; no empty reason strings; zero horizontal overflow; zero console errors or warnings |
| B-6 | Still returns 5 cards through F17 relaxation; no empty set |

Ranking impact to note before recording the video: KazNMU Medicine fell from an invented 1,900,000 ₸ to a sourced 1,230,700 ₸ and KIMEP rose from 5,500,000 ₸ to 5,876,280 ₸, so the financial dimension and the order of the shortlist move for budget-constrained profiles. Record narration against the current numbers, not the earlier ones.

## Intentional deviations / unresolved source requirements

- F16 AC16.4: a universal state-grant ceiling of 1,000,000 ₸ is not verified. The located official source covers a specific charitable program. The app labels the formula’s cap as Demo.
- Verified AITU thresholds mean participation thresholds; they do not establish competitive outcomes or individual grant eligibility.
- S-1/F18 optional AI generation is deferred. The implemented server route and client diagnostic use complete deterministic templates.
- Absolute ranking change for every possible single-answer change is inconsistent with rounded formulas and a grade field absent from those formulas. Recalculation and a truthful cause are implemented.
- The document’s separate plan and submission materials were not provided.

No pending item is silently marked passed. Do not freeze or claim complete submission readiness until the applicable gates have evidence.
