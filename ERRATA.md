# Errata

Corrections to published results, kept because a record that quietly fixes
itself is worth less than one that says what it got wrong.

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
