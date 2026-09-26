# Epochs — what may be compared with what

A backtest number means nothing on its own. It means something relative to
another number produced the same way. This file says where those lines fall,
so a reader never has to guess and the owner never has to re-derive it.

It exists because the lines kept being discovered one at a time, retrofitted
after a result had already been read the wrong way. Declaring them up front is
cheaper than discovering them.

---

## Epoch 1 — five-minute bars. **CLOSED 2026-09-20.**

**437 of the 468 ledger rows, from 2026-08-20 to 2026-09-20.** Momentum and
trend strategies on 5-minute bars in liquid US equities, held hours to days.

**It is closed because it was measured to be unwinnable, not because it got
boring.** Two structurally different strategies were walked forward across 22
folds each and landed in nearly the same place:

| | stockbot_momentum | TrendBot |
|---|---|---|
| windows profitable | 18.2% | 22.7% |
| total return | −66.6% | −68.5% |
| IS→OOS degradation | 0.94 | 0.92 |
| deflated Sharpe p | 0.0011 | 0.000006 |

Different universes, different signal logic, different trade counts, same
verdict and nearly the same overfitting signature. That is evidence about the
**arena**, not about either strategy. At this horizon roughly 7bp of
round-trip friction sits against roughly 1bp of gross signal, and no amount of
signal quality closes that gap.

**ONE DECLARED EXCEPTION, 2026-09-20: the sentiment ablation.** The three
rows meant to answer "does news help?" — `news-buggy`, `news-fixed`,
`news-off` — are VOID. All three executed news-off, because the news caches
held one truncated page and the coverage check correctly refused to serve
them. They are bit-identical to each other and measure nothing.

Re-running them under the repaired news path **repairs a broken measurement
rather than adding to the arena.** It is permitted here for three reasons,
stated before the runs rather than after:

1. It cannot change Epoch 1's verdict. It measures whether news moves the
   strategy, not whether the arena is winnable. That question was settled by
   two walk-forwards and is not reopened.
2. The question is the project's founding claim and has never been tested in
   482 rows. Leaving it unanswered is a hole a skeptic opens in one minute.
3. Sentiment data reaches back only to ~2015 and is thin on ETFs, so this is
   the ONLY arena where it can be asked at all. Deferring it to Epoch 2 would
   defer it forever.

Nothing else is exempt. A recipe that measures strategy performance at five
minutes stays closed.

**No new five-minute runs will be recorded.** The recipes still exist and the
data is still cached, so anything here can be reproduced; nothing new will be
added.

## Epoch 2 — daily bars, multi-week holds. **OPEN. Its first hypothesis is CLOSED, 2026-09-20.**

Turnover drops about two orders of magnitude, which moves friction from the
dominant term to noise. It is also the one place being small is an advantage:
positions can be held through stretches an institution reporting monthly
cannot.

### The epoch is open; the first strategy in it is finished

**This distinction is the whole point of the file.** An epoch is a
comparability boundary, not an iteration counter and not a strategy version.
Epoch 1 closed because the ARENA was measured unwinnable — two structurally
different strategies landed in the same place. Epoch 2's arena has not been
measured unwinnable. **One strategy inside it has.**

Trend-following on daily bars, run as `wf-sectors-daily-carry`: 11
survivorship-free sector and broad ETFs, 1999-03-10 to 2026-08-18, 27.4 years,
6,411 out-of-sample observations, four pre-registered configurations declared
as twelve trials after three instrument repairs.

| | measured | required |
|---|---|---|
| OOS Sharpe | **0.279** | 0.66 (deflated, 12 trials) |
| OOS Sharpe vs benchmark | **0.279** | above SPY's 0.569 |
| alpha p.a. | +0.0027 | above 0 |
| total return | +42.1% | — |
| SPY over the same stretch | **+889.2%** | — |

It clears one condition of three. **By the kill criteria written before the
run, this configuration is closed.** Do not re-run this grid hoping for a
different number.

**Three repairs preceded it, and each improved the result without changing the
verdict** — OOS Sharpe 0.080, then 0.119, then 0.279. Alpaca's daily bars were
serving unadjusted splits; the cost model charged 12.6x too much at daily
spacing; the walk-forward liquidated its whole book at every fold boundary.
The trend is real and a reader should be suspicious of it, which is exactly
why the benchmark condition matters more than the deflated-Sharpe one: SPY's
0.569 does not move when the instrument is repaired.

**What stays open.** The arena. The data is clean, spans 27 years, is
survivorship-free by construction, and now carries a benchmark on every row. A
second signal tested there is **more Epoch 2**, not Epoch 3 — same bar, same
universe, same dates, same bar to clear. `countries7` remains an untouched
cross-sectional holdout for whatever earns it.

**Epoch 2 results will not be compared to Epoch 1 results.** Not "compared
carefully" — not compared. Different bar, different holding period, different
cost regime, different date range. The ledger keeps both because it is
append-only; the reader should treat them as two separate studies.

Four things must be settled before the first Epoch 2 measurement counts. They
are listed in `docs/superpowers/specs/2026-09-19-daily-bar-audit.md` §8.

### Second hypothesis: cross-sectional sector momentum — RUN 2026-09-26, CLOSED

Pre-registered in `docs/superpowers/specs/2026-09-24-xsect-momentum-design.md`,
final at `c781720` and amended before the run at `bcbe346` (fold geometry),
`e10dd34` (no-sliver rule), `a2f0996` (how the fixed curves are computed) and
`b75afee` and `de92ce8` (the pre-run review, spec §15, including one
instrument repair):
the nine sector SPDRs, ranked by trailing 6- or 12-month
return, the top 3 or 5 held and re-ranked monthly, exits by rank drop only.
Four trials; bar OOS Sharpe ≥ 0.544 at deflated p ≥ 0.95 (the p as computed from
the curve's realized skew and kurtosis: about 0.547–0.551 at equity-like
moments, spec §15.2), plus Sharpe above
SPY's and positive alpha, with marginal passes read as indistinguishable
(spec §9). **Expected to fail**, and a negative closes sector rotation, not
cross-sectional momentum: the universe carries 2.27 effective bets (spec §3).

**Result.** Run once, as `wf-sectors9-xsmom` (2026-09-26, code `3c3298ee77f7`,
run `20260926_133029`), 2002-01-03 to 2026-08-17, 6,194 out-of-sample days.
Every instrument check declared in advance passed.

| | measured | required |
|---|---|---|
| deflated Sharpe p (4 trials) | **0.946** | ≥ 0.95 |
| OOS Sharpe vs SPY's | **0.537** vs 0.596 | above SPY's |
| Sharpe difference vs SPY | −0.059 ± 0.091 (z −0.65, correlation 0.90) | — |
| alpha p.a. | +0.0002 (t +0.01) | above 0 |
| total return | +557.9% | — |
| SPY over the same stretch | +931.2% | — |
| max drawdown | −46.3% (SPY −55.2%) | — |

**Two of three conditions fail: CLOSED.** A published negative, not a re-run.
Alpha is a rounding error, and the strategy's Sharpe is below SPY's by an amount
well inside the noise: this is ordinary market exposure at a beta of 0.80, not
an edge.

**Described, never gates.** The four configurations run as fixed choices over
the same walk-forward: 6×3 0.418, 6×5 0.569, 12×3 0.498, 12×5 0.586. Two of
them clear the deflated-p bar on their own (0.961 and 0.967), but none clears
SPY's Sharpe, and picking the best of four after seeing them is exactly the
multiple testing the four-trial deflation exists to charge for. Holding all
nine sectors at equal weight, rebalanced monthly and frictionless like SPY,
earned a Sharpe of **0.618**, above both SPY and the ranking: **the ranking
subtracted value relative to simply holding the sectors.** The book was 95.3%
invested on average, and 31 of 256 entries were under-filled, only two of them
in 2002–03, so the liquidity-cap slivers feared before the run (spec §15.4)
barely occurred.

**Against the published evidence.** The best modern primary source for this
exact strategy (Beluska, Quantpedia 2024: the same nine SPDRs, 1998–2024,
gross, rf = 0) reports top-3 at 0.55, the equal-weight nine at 0.57 and the
S&P 500 at 0.49. This run shows the same ordering after costs: ranking behind
equal weight. The spec's pre-run prior had mis-cited those tables; the
correction is dated in its §2.

**Scope, as written before the run.** This closes **sector rotation** by
trailing return on the nine SPDRs, a specific and popular strategy. It does not
close cross-sectional momentum as a family: with 2.27 effective bets this arena
lacks the breadth that test needs.

**Decided 2026-09-26: nothing further runs on this universe.** Neither the
volatility-managed version (spec §9 item 5, a contested prior) nor the
low-volatility tilt (§12, mostly a fixed defensive basket) is run on the nine
sector SPDRs. Both would draw on the same 2.27 effective bets that just
produced a negative, so neither spends trials here. The open question is
breadth: a universe with more independent bets, researched before anything is
pre-registered.

**Corrected 2026-09-26, after the run: "2.27 effective bets" above is the wrong
measure of breadth for a ranking strategy.** It counts total diversification,
which the common market move dominates. A ranking bets on differences between
sectors, and with the market removed the nine sectors carry about **7**
independent bets (6.4–7.1 by three methods), against about **25** for Ken
French's 48 industry portfolios over the same years. The verdict and the scope
of the negative stand; the correction and its method are dated in spec §3.

**Epoch 2 trials to date: 12 (trend) + 4 (this) = 16.** Each study deflates by
its own count; the running total is here for a reader who wants a family-wise
view.

### Third study: industry momentum after publication — RUN 2026-09-26, SURVIVED

Pre-registered in `docs/superpowers/specs/2026-09-26-industry-momentum-decay-design.md`
(final `0d85c3f`, with a dated amendment before the run). A **decay measurement,
not an edge search**: Moskowitz & Grinblatt's industry-momentum rule (6-month
ranking, top 7 of Ken French's 48 industries, overlapping 6-month holds) against
the equal-weighted 48. It must first **replicate** their published long-side
result in their own sample, 1963–1995 (t ≥ 2), which checks the instrument;
only then is the **test**, 1999–2026, read (t ≥ 1.645). One trial. The standard
58% post-publication haircut predicts a result almost exactly on the bar.

**Epoch 2 trials to date: 12 + 4 + 1 = 17.**

**Result.** Run once, as `imom-decay` (2026-09-26, code `3d91277e795a` at
`da950fe`, run `20260926_154617`). Every instrument check declared in advance
passed: the data pins, 385 and 332 gated months, 47–48 industries, six cohorts
of seven in every gated month, and the benchmark cross-check at 2e-16. Gross
of costs, active return against the equal-weighted 48:

| window | mean | t (Newey-West, 6 lags) | gate |
|---|---|---|---|
| replication, 1963-07 → 1995-07 | **+0.295%/month** (+3.5% a year) | **2.93** | t ≥ 2: **pass** (M&G's own long side: 0.36, t 4.38) |
| test, 1999-01 → 2026-08 | **+0.241%/month** (+2.9% a year) | **1.90** | t ≥ 1.645: **pass** |

**SURVIVED**, by the rule written before the run: the instrument reproduced
the published effect in its own sample, and after publication the edge over
holding every industry equally persisted, on paper. **These portfolios are not
investable,** so this is a statement about the effect, not a strategy anyone
could have run.

**How narrow the pass is, stated plainly.** Each point below is disclosure,
not a change to the bar.
- t = 1.90 clears the pre-registered one-sided 1.645, but not a two-sided 5%
  test (1.96).
- Counted as one search across all 17 Epoch 2 trials, it would need t ≥ 2.75
  (Bonferroni, one-sided). It does not reach that.
- The after-publication edge is uneven. By decade: 2000s +0.12%/month
  (t 0.48), 2010s +0.10 (t 0.92), 2020s +0.50 (t 2.24). Much of the evidence is
  in the last six years.
- Measured decay is smaller than the literature average: −18% against this
  study's own replication window, −33% against M&G's published 0.36, where the
  58% haircut predicted about 0.15.

**Described, never gates.**
- 1927–1963: +0.26%/month, t 2.34.
- The 1995–98 gap: +0.33%/month, t 1.47.
- Tracking error 6.6% a year before 1995, 9.6% after.
- One-way turnover about 156% a year; the break-even one-way trading cost
  after publication is 0.93%.
- The 1-month-hold variant: t 2.83 before, 1.42 after.

**What this does and does not say.** It is the first positive result in this
record, and it is about an effect, not an edge: industry momentum measured on
non-investable CRSP industry portfolios did not disappear after 1999. It says
nothing about the sector SPDRs, where the same idea closed negative on nine
funds, and it earns no claim until it replicates somewhere investable.

---

## Boundaries inside the record

Six, stated once here rather than rediscovered.

**1. The account boundary — 2026-09-19.** The paper account was deleted and
recreated. Account, starting equity, margin multiplier and deployed commit all
changed at once, so the two live series measure different systems. Detail in
`live/README.md`. **The two must never be concatenated.**

**2. The news boundary — 2026-09-18.** Every run before this date executed
**news-off** while its configuration claimed news was on, because the news
caches held one truncated page and the coverage check correctly refused to
serve them. The results are valid as measurements of a news-off strategy. They
are not evidence about news.

**3. The universe boundary — always.** One added symbol has been measured to
flip the sign of gross P&L. **Compare only rows sharing a `universe_hash`.**
Nine distinct universes appear in the ledger.

**4. The code boundary — 16 fingerprints.** `code_fingerprint` hashes engine
bytes and cannot tell a log line from a logic change, so a differing
fingerprint does not by itself mean results differ. The lineage, and which
changes were proven inert, is documented in `test_experiment_log.py`.

**5. The daily-Sharpe erratum — 30 rows.** `sharpe`, `sortino` and
`alpha_annualized` are understated by 1.92x on daily-bar rows recorded before
code fingerprint `d490f8677c49`. See `ERRATA.md`. `deflated_sharpe_p` is
unaffected.

**6. Everything here is PAPER.** Real broker fills, simulated money. Slippage
realism is therefore unproven.

---

## What this file is not

It is not a claim that Epoch 1 was wasted. It produced the reconciliation that
showed the simulator and the live bot were different systems, two rigorous
negative walk-forwards, and the measurement that closed the arena. A negative
result that closes a direction is the deliverable this project is built to
produce.

It is also not a deletion. Nothing is removed and nothing is rewritten. The
record is append-only; what changes is only which rows a new result should be
read against.
