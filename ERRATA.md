# Errata

Corrections to published results, kept because a record that quietly fixes
itself is worth less than one that says what it got wrong.

---

## 2026-09-26 — after the first fold, in-sample scoring started from leftover cash

**What was wrong.** Since `180a96f` (2026-09-20, "positions carry across
walk-forward fold boundaries"), each fold after the first handed its
out-of-sample cash to two places. The next out-of-sample run was correct: it
received that cash plus the carried positions. The in-sample backtests that
choose the next fold's parameters also received the cash, but they start flat
and carry nothing, so they scored the grid on the cash left beside the book, not
on the fold's equity. Found by the pre-run review of the momentum study,
2026-09-25, and reproduced on synthetic data. For a fully invested book that is
a few hundred dollars.

**On the published trend result.** `wf-sectors-daily-carry` (all five rows)
chose its winners in folds 2–9 on 21% to 100% of fold equity. That is the cash
at each boundary, recomputed from the run's own trades, equity and frozen
closes:

| fold boundary | open positions | cash handed to in-sample scoring |
|---|---|---|
| 2004-03-08 | 3 | $40,588 (42%) |
| 2007-03-08 | 2 | $55,742 (60%) |
| 2010-03-07 | 0 | $97,198 (100%) |
| 2013-03-06 | 5 | $21,787 (21%) |
| 2016-03-05 | 0 | $123,052 (100%) |
| 2019-03-05 | 2 | $74,460 (60%) |
| 2022-03-04 | 1 | $99,761 (80%) |
| 2025-03-03 | 1 | $105,647 (80%) |

With 20% position caps in $20–$100 ETFs, $20,000 still buys positions of
$4,000 or more, so rounding error is a few percent and the selection was
probably little changed. That is an inference, not a measurement. **It is not
re-run**: the grid is closed after three declared looks, and a fourth would need
its own pre-registration. Its rows stand as recorded. They cannot be reproduced
under the repaired code (fingerprint `c597472342e6`), and the lineage note in
`test_experiment_log.py` says so.

**What changed.** In-sample scoring now starts from the previous fold's final
out-of-sample equity, and the out-of-sample handoff is unchanged (`8106fbc`).
Each fold records its in-sample starting equity (`is_start_equity` in
`walkforward_windows.csv`). Walk-forwards whose folds end flat are
byte-identical under the repair. Repaired before the momentum study's one look.

**One more property of daily bars, stated here.** The engine's 6% daily loss
limit cannot fire at daily spacing: each bar is its own "day", measured
against itself (`backtest/engine.py:876-898`). The kill-switch code is
unchanged since the repository's baseline, `830e09c` (2026-08-31 16:57 UTC),
so it was inert on the 14 daily-bar rows recorded since. The other 30 of the
44 predate the history; the 8 of those that record the counter all show 0.
No daily result relied on it.

---

## 2026-09-25 — symbol order changes results, and the ledger does not record it

The engine iterates the universe in the order its symbols were loaded, and the
order matters. Measured on the published `wf-sectors-daily-carry`: loading
the same bars (identical `data_fingerprint`) alphabetically instead of in the
`sectors11` preset's order gave **243 out-of-sample trades instead of 239 and
an equity curve up to $5,251 apart.** The ledger records `symbols` sorted, and
`universe_hash` sorts before hashing. So two rows with the same hash can be
different experiments.

**What it does not change.** 490 of the ledger's 491 rows name a preset, and
no preset list has ever been reordered (`git log -p universes.py` shows only
additions). For those rows the order is recoverable, and every run named in
EPOCH.md or the README is among them. No `universe_hash` in the ledger spans two
presets. The one exception is in the published ledger:
`reconcile-live-scanwin` (2026-09-18, 84 symbols passed with `--symbols`),
whose order cannot be recovered. The published reconciliation's
`verdict.json` records its window, not the simulator run it used. So whether
that finding rests on this row is not established here.

**What changed.** Nothing in the engine. `report_xsmom.py` reproduces a
recorded run only through its preset, and refuses a row without one.

---

## 2026-09-24 — three properties of the walk-forward, found while building the second study

**1. The first warmup bars of every out-of-sample window could decide
nothing.** Each test window was sliced with no history before it, and the
engine skips its first `warmup_bars` bars. A carried book sat frozen and
marked to market; no entry or exit could happen. Measured on the published
`wf-sectors-daily-carry`: eight of nine folds made their first out-of-sample
entry 157 to 301 trading bars in, and **21.7% of its out-of-sample bars could
not make a decision.** No published number changes — the equity through those
bars is real — but "nine folds of three years out of sample" meant less
decision-making than it says.

**2. In-sample selection favoured shorter warmups.** Each grid point was scored
over the whole training slice, flat through its warmup, which shrinks its
Sharpe by roughly the square root of the fraction it was active. Demonstrated:
two otherwise identical points with 10- and 60-bar warmups, the 10 won every
fold. **This did not affect the published trend result**: all four
`trendbot_daily` points have a 155-bar warmup (checked 2026-09-25).

**3. The warmup guard checked the first fold only**, on the stated assumption
that equal calendar widths hold equal bar counts. Holidays make 730-day daily
folds hold 502 to 506 bars. No published walk-forward had a fold below its
floor (checked for both daily geometries in use).

**What changed.** `--align-warmup` removes (1) and (2) for new runs; it is off
by default and off is byte-identical to before (0.000e+00 across both
reference runs). The guard now checks every fold. Code:
`backtest/walkforward.py`; tests: `test_rotation_levers.py`.

---

## 2026-09-20 — the sentiment ablation, finally run

**What was wrong.** Three ledger rows — `news-buggy`, `news-fixed`,
`news-off`, recorded 2026-08-21 — were meant to answer whether news sentiment
helps. All three executed **news-off**, because the news caches held one
truncated page and the coverage check correctly refused to serve them. They
are bit-identical and measure nothing. The project is named after the
question they failed to ask.

**Re-run 2026-09-20** under the repaired news path, all three arms under one
code fingerprint `3c354d0bc7c1`, same universe, same dates, 65,020 articles
across 18 symbols verified served:

| arm | return | Sharpe | trades | signals | vs news-off |
|---|---|---|---|---|---|
| **news-off** | **−56.22%** | **−0.237** | 1,447 | 2,138 | — |
| news-buggy (substring, as live runs it) | −59.02% | −0.272 | 1,657 | 2,812 | **−2.8pp** |
| news-fixed (word-boundary) | −61.50% | −0.293 | 1,610 | 2,658 | **−5.3pp** |

**Sentiment makes it worse, and the mechanism is measured.** News adds 24–32%
more signals (+520 and +674), which become 163–210 more trades, which cost a
further $3,984–$5,644 in friction. In an arena where roughly 7bp of round-trip
cost sits against roughly 1bp of gross signal, every extra trade is a loss. The
sentiment module is a turnover amplifier.

**Correcting the scoring bug made it worse, not better.** The word-boundary
version — the one that reads headlines *properly* — underperformed the buggy
substring version it was meant to fix, by 2.5pp. Whatever the lexicon is
detecting, reading it correctly does not help.

**What this does NOT establish.** One run per arm, no walk-forward, no deflated
Sharpe: this is an ablation, not a validated finding. It tests keyword-counting
sentiment weighted at `w_news = 0.10` inside a vote-counting momentum strategy
— not "sentiment" as a category. And it lives in the five-minute arena, which
is friction-dominated by construction, so the result may not transfer to a
horizon where turnover is cheap.

**Why it was run in a closed epoch.** Declared in `EPOCH.md` before the runs,
not after. It repairs a broken measurement rather than adding to the arena, it
cannot change Epoch 1's verdict, and sentiment data only reaches back to ~2015
and is thin on ETFs — so this is the only arena where the question can be
asked at all.

**The void rows are kept.** They are not deleted or rewritten. This entry is
the correction of record.

---

## 2026-09-20 — no walk-forward ever recorded what buy-and-hold earned

**What is missing.** `compare_to_benchmark` was called in single-run mode and
nowhere else, so **every walk-forward row in the ledger carries `nan` in
`benchmark_total_return`, `alpha_annualized`, `beta` and `information_ratio`.**
That includes both results that closed Epoch 1. It is the one comparison the
credential plan's bar actually names: *risk-adjusted improvement over holding
the universe.*

**Why it matters.** A deflated Sharpe answers "is this better than noise". It
is silent on "is this better than doing nothing". Every result in this ledger
before 2026-09-20 was read against the first question alone.

**The back-fill.** Computed from each run's saved out-of-sample equity curve —
no re-runs, no new trials. Each strategy is compared against SPY over its own
out-of-sample stretch, not from the command line's `--start`, because the first
training window is never traded.

| run | strategy return | strategy Sharpe | SPY return | SPY Sharpe | alpha p.a. |
|---|---|---|---|---|---|
| `wf-volatile` (5Min) | −66.6% | −0.498 | +33.5% | **0.669** | −0.2544 |
| `wf-trendbot` (5Min) | −68.5% | −1.319 | +33.5% | **0.669** | −0.2973 |
| `wf-sectors-daily` | +5.4% | 0.080 | +889.2% | **0.569** | −0.0016 |
| `wf-sectors-daily-costfix` | +9.1% | 0.119 | +889.2% | **0.569** | −0.0004 |
| `wf-sectors-daily-carry` | +42.1% | 0.279 | +889.2% | **0.569** | +0.0027 |

`wf-regime-daily` is deliberately absent. It ran on the corrupted Alpaca daily
bars described in the entry below and no conclusion should be drawn from it.

**What this changes.** The two Epoch 1 walk-forwards did not merely fail to
find an edge — they destroyed roughly a quarter to a third of capital per year
relative to holding the index, over a window in which the index rose 33.5% at
a Sharpe of 0.669. The Epoch 2 runs do not destroy capital, but they do not
beat the index either, and the benchmark's Sharpe of 0.569 sits **inside the
band those runs were being held to.**

**The rows are not rewritten.** The ledger is append-only and these figures are
not being written back into it. This entry is the record.

**Fixed going forward.** `benchmark_for_oos` in `backtest/walkforward.py`
computes the comparison on every walk-forward from 2026-09-20. A result now
needs three things, not one: a Sharpe above the benchmark's over the same
stretch, positive alpha after costs, and a deflated p of at least 0.95 at an
honest trial count.

---

## 2026-09-20 — every daily-bar row read an unadjusted stock split

**What is wrong.** All **32 rows at `timeframe = 1Day`** used the `regime`
preset, which contains XLE, XLK and XLU. Each of those three series, as served
by Alpaca under `adjustment="all"`, contains a 2-for-1 split on **2025-12-05**
recorded as if it were a price move:

| symbol | 2025-12-04 close | 2025-12-05 close | apparent one-day return |
|---|---|---|---|
| XLK | 289.92 | 146.02 | **-49.6%** |
| XLE | — | — | **-50.2%** |
| XLU | — | — | **-50.5%** |

Every one of the 32 rows covers a date range spanning 2025-12-05, so every one
of them fed at least one phantom -50% bar to the engine.

**Why it matters more than a wrong number.** A backtest does not complain
about a -50% bar. It fires every stop, records the drawdown as real, blows out
trailing volatility — which then shrinks position sizes for months — and
poisons every indicator whose lookback spans it, up to 200 bars afterwards.
The damage extends well past the single bad bar, and none of it is visible in
the output.

**How it was found.** By accident. A candidate long-history vendor was being
cross-checked against Alpaca over their overlapping 2016-2026 window, and the
comparison failed — on Alpaca. Yahoo's adjusted series shows **+0.73%** for
the XLK bar above. A clean single fetch into a throwaway cache directory
reproduces Alpaca's version exactly, so this is the vendor and not a stale
local cache.

**The most affected row, named.** `wf-regime-daily`
(`20260919_220844_walkforward_wf-regime-daily_501f3f`), the first Epoch 2
pilot, holds all three symbols. Its final fold, covering 2026-01-01 onward,
made **zero trades** — and poisoned indicators are the most likely reason.
**Read no conclusion about TrendBot from that row.** It is superseded by
`wf-sectors-daily`, run on Yahoo bars over 1999-2026.

**What is NOT affected.** The 437 rows at 5-minute spacing. Their cache was
scanned for the same signature and is clean: the only large one-day moves
found were VIXY +43.1% on 2024-08-05, which is the genuine August-2024
volatility spike, and one LCID 5-minute bar of +51.6% that has not yet been
explained and should be checked before LCID is used again.

**What changed.** Daily bars now come from Yahoo; Alpaca still serves
5-minute bars and news. Each vendor writes its own cache files, and every
ledger row now records `bar_provider`, because two daily rows from two vendors
would otherwise carry the same `code_fingerprint` and the same
`universe_hash` while holding different prices. `test_split_integrity.py`
scans every cached series on every `check.sh` run and fails the suite on any
one-day move shaped like a corporate action, so this class of defect can no
longer reach a backtest silently. The ten Alpaca daily cache files are
quarantined rather than deleted, under
`data_cache/_quarantine_alpaca_1day/`, so the finding stays reproducible.

**The rows are kept.** They are not deleted and not rewritten. This entry is
the correction of record.

---

## 2026-09-19 — Sharpe and Sortino understated on 30 daily-bar rows

**What is wrong.** 30 of the 465 rows in `ledger/experiments.csv` were run at
`timeframe = 1Day`. Their **`sharpe`, `sortino` and `alpha_annualized` are
understated by a factor of 1.92** — they read at 52% of their true value.
Every other column on those rows is correct, and the other 435 rows, all at
5-minute bars, are entirely unaffected.

**Why.** Annualising a Sharpe ratio needs a count of periods per year, which
the code inferred from the spacing between bars as
`6.5 trading hours / median gap`. That is right for intraday bars. At daily
spacing the median gap is 24 hours, so it computed 0.27 "bars per day" and
returned 68.25 where 252 is correct. Sharpe scales with the square root of
that number, and `sqrt(252/68.25) = 1.92`.

Nothing raised. The number was simply wrong.

**What is NOT affected, and it matters.** `deflated_sharpe_p` — the statistic
this project uses as its actual bar for whether a result is credible —
de-annualises using the same constant it was annualised by, so the error
cancels exactly. Measured difference: zero. `total_return`, `max_drawdown`,
`cagr`, `calmar`, trade counts and all cost figures are unaffected.

**So how should a reader treat those 30 rows?** Read
`deflated_sharpe_p`, which is correct as published. If you want the Sharpe,
multiply the published figure by 1.92. No conclusion in any writeup changes:
the affected rows range from −0.217 to +0.089 as published, or −0.417 to
+0.170 corrected, and neither range is an edge.

**Identifying them.** Filter the ledger for `timeframe = 1Day` and
`code_fingerprint` other than `d490f8677c49`. The labels are `regime-20yr`,
`regime-20yr-fixed`, `regime-baseline`, `regime-baseline-swing` and
`regime-swing-robustness`.

**What was done about it.** The defect is fixed as of code fingerprint
`d490f8677c49`, with a test covering five timeframes. The rows are **not
edited** — this ledger is append-only, and rewriting history to hide an error
is the opposite of what it is for. One affected experiment, `regime-20yr`, has
been re-run under the corrected code and appears as a new row
(`20260919_211536_single_regime-20yr_d490f8`, Sharpe −0.409). The other four
labels no longer correspond to a runnable recipe and cannot be reproduced;
they stand as published, with this correction attached.

**How it was found.** Not by a failure. An audit of what breaks when a bar
stops being five minutes, run deliberately before changing the research
timeframe, and before any conclusion had been drawn from a daily-bar result.
