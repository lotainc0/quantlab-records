# What buy-and-hold was doing the whole time

**Date:** 2026-09-20
**Status:** the Epoch 2 negative. Published.

Four walk-forwards, two structurally different strategies, two arenas, and
twenty-seven years of data. None of them beat holding the index. Until
2026-09-20, none of them had been asked to.

---

## The short version

I spent a month building a lab to answer "does this strategy have an edge?"
and measured it carefully against the right statistical question — *is this
better than noise?* — using a deflated Sharpe ratio that charges you for every
configuration you tried.

It was the wrong bar. Or rather, it was one of two bars and I only ever
checked one.

`compare_to_benchmark` was wired into single-run mode and nowhere else. Every
walk-forward this project ever ran recorded `benchmark_total_return`,
`alpha_annualized`, `beta` and `information_ratio` as `nan` — including both
results that closed Epoch 1. The one comparison the governing plan actually
asks for, *risk-adjusted improvement over holding the universe*, was never
computed for any of the runs held to that standard.

When finally computed, from equity curves that had been sitting on disk the
whole time:

| run | strategy | SPY, same window | alpha p.a. |
|---|---|---|---|
| `wf-volatile` (5-minute) | −66.6%, Sharpe −0.498 | +33.5%, Sharpe **0.669** | **−25.4%** |
| `wf-trendbot` (5-minute) | −68.5%, Sharpe −1.319 | +33.5%, Sharpe **0.669** | **−29.7%** |
| `wf-sectors-daily-carry` (daily) | +42.1%, Sharpe 0.279 | +889.2%, Sharpe **0.569** | +0.3% |

The 5-minute strategies did not merely fail to find an edge. They destroyed a
quarter to a third of capital per year relative to doing nothing, across a
window in which doing nothing returned 33.5%.

## What the daily arena actually showed

Epoch 2 was the serious attempt. The reasoning behind it still holds and is
worth stating, because it is the most useful thing this project has produced.

**Statistical power comes from calendar span, not sampling frequency.** Two
years of 5-minute bars is 39,312 observations; two years of daily bars is 504.
Both require an annualised Sharpe of **1.91** to clear a deflated-Sharpe bar
at four trials. The annualisation cancels exactly. Sampling 78x faster buys
nothing at all — a fact I could have derived on paper in an afternoon and
instead discovered after a month of 5-minute experiments.

Only stretching the calendar moves the bar:

| span | observations | required Sharpe at 4 trials |
|---|---|---|
| 5-minute, 2 years | 39,312 | 1.91 |
| daily, 2 years | 504 | 1.91 |
| daily, 10.6 years | 2,671 | 0.83 |
| **daily, 27.4 years** | **6,411** | **0.53** |

A good systematic equity strategy runs a Sharpe of 0.5–1.0. Only the bottom
row puts the bar inside that band. So Epoch 2 ran on 27.4 years of
survivorship-free sector ETFs — the first universe in this project's history a
skeptic could not reject on survivorship grounds alone.

It returned +42.1% over 25.4 out-of-sample years, at a Sharpe of 0.279,
against a required 0.66. SPY returned +889.2% at 0.569.

## Three repairs, each of which improved the answer

This is the part worth being suspicious of, so it goes in the writeup rather
than a footnote. The result moved three times, upward, as I fixed defects:

| | OOS Sharpe | what was wrong |
|---|---|---|
| as first run | 0.080 | — |
| after the cost repair | 0.119 | slippage charged 12.6x too much at daily bars |
| after the boundary repair | 0.279 | every fold liquidated its whole book |

Plus a fourth defect that preceded all of them: the data vendor was serving
**unadjusted stock splits**, so three of eleven symbols carried a phantom −50%
crash that fired every stop and poisoned every indicator for 200 bars
afterwards.

A reasonable person looks at 0.080 → 0.119 → 0.279 and asks whether a fourth
repair reaches 0.66. I cannot prove there isn't one. What I can say is that
each defect was found independently — two of them while looking for something
else entirely — and that I raised the declared trial count each time, so the
bar rose with the number: 0.53, then 0.62, then 0.66.

**And this is precisely why the benchmark condition matters more than the
deflated-Sharpe one.** SPY's 0.569 does not move when I repair my own tooling.
A strategy has to beat a number that is completely indifferent to how many
bugs I find in my instruments. At 0.279 it is at half of it.

## What I would tell someone starting this

**Compute the benchmark first, not last.** Before any statistical apparatus,
before the deflated Sharpe, before walk-forward: what did the index do over
the same window? If you cannot beat it, the rest is decoration. I built the
apparatus first and the comparison last, and the comparison was more
informative than everything before it.

**Calendar span is the only thing that buys statistical power.** Not more
symbols — the observation count is trading days, so breadth buys
diversification and nothing else. Not finer bars — the annualisation cancels.
Only years.

**Your instruments are wrong in ways your outputs will not show you.** Four
separate defects here — a vendor serving unadjusted splits, a cost coefficient
whose units changed silently with bar size, a harness liquidating its book
every fold, a missing benchmark — and *not one of them raised an error*. Every
run exited zero with plausible-looking numbers. Three were found by accident
while investigating something unrelated. The only reliable defence was
cross-checking one measurement against a second, independent one.

**Write the kill criteria before the run.** Every result here was measured
against a bar declared in advance, and every re-run raised the declared trial
count. That is the only reason the repairs above read as corrections rather
than as fishing.

## What is closed and what is not

**Epoch 1 — five-minute bars — is closed.** Two strategies, 22 folds each,
18.2% and 22.7% of windows profitable, and now: both worse than the index by
25–30 percentage points a year. Roughly 7bp of round-trip friction against
roughly 1bp of gross signal has no solution in it.

**Epoch 2 is open. Its first hypothesis is closed.** Trend-following on daily
bars does not clear the bar. The arena does not inherit that verdict: the data
is clean, spans 27 years, is survivorship-free, and carries a benchmark on
every row. A second signal tested there is more Epoch 2, not a new epoch.

**Sentiment has never been measured, in 481 rows.** The ablation designed to
answer it ran news-off on both arms because of a data-truncation defect — the
two rows are bit-identical. The engine now serves news correctly. That
measurement remains owed, and the project is named after it.

---

*Everything here is paper trading: real broker fills, simulated money.
Slippage realism is unproven. Full ledger, raw data and the code that produced
every figure: https://lotainc0.github.io/quantlab-records/*
