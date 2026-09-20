# Errata

Corrections to published results, kept because a record that quietly fixes
itself is worth less than one that says what it got wrong.

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
