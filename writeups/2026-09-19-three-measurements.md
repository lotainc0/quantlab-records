# Three measurements, and one conclusion I had backwards

**Date:** 2026-09-19
**Author:** Yuepheng Yang
**Status:** final. These results are not expected to change.

This is a writeup of three measurements on a systematic US-equity trading
system I built. The first two came back negative. The third corrected a
conclusion I had drawn from the live record and published here in an earlier
revision of this document.

I am publishing all three because the honest negative result is the point, not a
setback on the way to a positive one — and because a result nobody can check is
not a result.

Every number below is reproducible from this repository. Commands and run IDs
are at the end.

---

## The short version

I tested a momentum-and-news strategy on 5-minute bars in liquid US equities,
three ways:

1. **A walk-forward test** — repeatedly fit parameters on past data, then trade
   the next month with them, never letting the fit see the future.
2. **A reconciliation** — comparing six months of the simulator's decisions
   against six months of real broker fills from the same strategy trading a
   paper account.
3. **A controlled A/B** — re-running the strategy with one declared-but-unenforced
   risk rule switched on and off, to price what that rule was actually worth.

The walk-forward lost **66.6%** over 22 windows, with only 18.2% of windows
profitable. The reconciliation found that the simulator and the live bot were
**taking different trades entirely** — only 6% overlapped — which means the
apparent disagreement between them was never a paradox to resolve. They were
two different strategies.

The A/B reversed a conclusion. A rule the live bot declares and never enforces
looked like the source of the account's entire profit. Measured properly,
enforcing it is **better** by 5.1 points of total return, and the apparent profit
was survivorship inside the sample.

**My conclusion: this system has no edge at this horizon, I do not believe the
paper account's profit is evidence of one, and the most interesting thing I
found was that I had misread my own record until I ran the controlled test.**

---

## What was being tested

A long-only intraday and swing strategy on a universe of 18 liquid US names.
Entries combine a momentum signal, a news-sentiment score and a volatility
filter. Exits are stop-loss, take-profit, a trailing stop, and time-based
force-closes. It runs on 5-minute bars during regular and extended hours.

The simulator it was tested in has a tested look-ahead guard, next-bar fills, a
cost model charging commission, spread and market impact, and a fingerprint of
the engine source recorded with every run so results cannot be silently
attributed to the wrong code.

---

## Measurement 1 — the walk-forward

**Why this test.** A backtest that fits parameters on all the data and then
reports how well those parameters did on that same data measures nothing except
its own ability to fit. A walk-forward avoids that: fit on a training window,
trade the following window with the fit frozen, roll forward, repeat. Only the
out-of-sample windows are counted.

**Setup.** 22 windows over 2024-11-18 to 2026-08-18, 90 training days and 30
test days each, on a 10-name volatile universe, starting from $100,000.

**Result.**

| | |
|---|---|
| Total return, out-of-sample | **−66.6%** |
| Ending equity | $33,384 from $100,000 |
| Windows profitable | **4 of 22 (18.2%)** |
| Sharpe ratio | −0.50 |
| Trades | 1,174 (692 day, 482 swing) |
| In-sample → out-of-sample Sharpe degradation | **0.94** |
| Deflated Sharpe probability | **0.0011** |

Two of those lines carry most of the meaning.

**The degradation of 0.94 Sharpe** is the gap between how well the strategy did
on the data it was fitted to and how it did on data it had never seen. A gap
that large is the signature of overfitting: the parameter search was finding
noise in the training window and calling it signal.

**The deflated Sharpe probability of 0.0011** is an estimate of the probability
that the true Sharpe ratio is above zero, adjusted for the fact that 27
parameter combinations were tried. Trying many variants and reporting the best
one inflates the apparent result; this correction removes that inflation. The
bar I set in advance was 0.95. The result came in at 0.0011 — roughly a
thousand to one against, in the wrong direction.

**Interpretation.** This is not a marginal negative. A strategy that lost
two-thirds of its capital, was profitable in fewer than one window in five, and
degraded by nearly a full Sharpe point out of sample is not a system that needs
tuning. The parameters were fitting noise.

---

## Measurement 2 — the reconciliation

**Why this test.** The simulator said this family of strategies lost heavily
over two years. A paper trading account running the live bot showed a profit
over five months. Both cannot describe the same algorithm. Before believing
either, I wanted to know which.

**Setup.** Every real fill from the paper account between 2026-03-09 and
2026-08-18, paired into round trips, matched against the simulator run over the
identical window and universe. A trade counts as "the same trade" if the
simulator entered the same symbol within 60 minutes of the live bot.

**Result.**

| | |
|---|---|
| Live round trips in window | 1,261 |
| Simulated round trips | 687 |
| **Matched** | **81 — about 6%** |
| Median entry price difference | simulator 55 bps **worse** than live |
| Median hold time | simulator 8.1h vs live 27.6h |
| Median per-trade result | simulator −0.82% vs live −4.98% |

**Interpretation, and it is not the one I expected.** The headline is not any
of the price or timing numbers. It is the **6% match rate.** The simulator and
the live bot were overwhelmingly taking *different trades*. Every aggregate
comparison below that line is comparing two populations that barely overlap, so
it describes two strategies rather than one strategy measured twice.

That dissolves the contradiction instead of resolving it. There was never a
puzzle about why the simulation and the live account disagreed. They were not
running the same thing.

One genuinely useful finding survives: **the simulator's fills are 55 bps worse
than the broker actually gave.** The cost model is conservative. Whatever else
is wrong, simulated results are not flattered by optimistic fills — if
anything they understate.

The hold-time gap (8.1h vs 27.6h) pointed at the specific cause, and it turned
out to be concrete: the live bot declares a 10-day limit on swing positions in
its configuration and **never enforces it anywhere in its code.** The simulator
enforced it. That is one documented reason the two diverged.

---

## What about the paper account's profit?

The paper account realised **+$22,393** across 1,713 round trips between
2026-03-09 and 2026-09-18. I do not count this as evidence, for three reasons.

**It is not one experiment.** The strategy, its parameters and the engine all
changed during the window. There is no single configuration that the record
describes.

**The profit is concentrated in trades that broke the stated rules.** Of those
1,713 trades, **242 (14.1%) ran past the 10-day swing limit the configuration
declares and the code never enforces. Those 242 made +$46,594. The other 1,471
lost $24,201 between them.**

**The book that traded intraday lost badly.** Same-day round trips: 292 trades,
**−$53,682.**

A record that is profitable only because of an unimplemented rule is not a track
record. It is a finding about the code — and, as measurement 3 below shows, not
even the finding it first appeared to be.

---

## Measurement 3 — what the unenforced rule was actually worth

**Why this test.** The 242 rule-breaking trades made +$46,594, which reads as
evidence that the 10-day limit was costing money and should be dropped. Before
freezing a configuration around that belief, I wanted it measured rather than
inferred.

**Setup.** The same strategy, universe, window and engine, run twice with one
variable changed: the swing limit at its declared 10 days, versus disabled.
Identical code fingerprint `0f7087e523c1` and universe hash `d848afd031` on both
legs, so nothing else moved.

**Result.**

| | limit ON (10d) | limit OFF | delta |
|---|---|---|---|
| Total return | −47.5% | **−52.6%** | −5.1 pts |
| **P&L before costs** | **+$24,114** | **+$11,436** | **−$12,679** |
| Total costs | $71,636 | $64,033 | −$7,604 |
| Profit factor | 0.902 | 0.882 | −0.020 |
| Sharpe | −0.050 | −0.097 | −0.047 |
| Max drawdown | −60.1% | −63.7% | −3.7 pts |

**Removing the limit halved profit before costs**, and made total return 5.1
points worse — while *lowering* trading costs, because there was less turnover.
So the limit is not earning its keep by reducing friction. Removing it destroys
gross edge faster than it saves costs.

**The mechanism is visible directly.** The limit force-closed only **48 of 1,350
trades** (3.6%). Left to run, those positions resolved as 18 more stop-losses, 9
more trailing stops and 11 more take-profits — they went on to hit their stop
roughly two and a half times as often as their target. A second-order effect
compounds it: holding longer ties up capital, and orders rejected for exceeding
the exposure limit rose from 990 to 1,024.

**Interpretation — I had this backwards, and so did the record.** The +$46,594
is survivorship *inside the sample*. A trade only runs past 10 days if it has not
already hit a stop, so the long-held subset is selected for not having lost yet.
Observing that it was profitable says nothing about whether letting trades run is
a good policy; the losers had already left the sample.

So the unenforced rule was not producing the profit. It was concentrating the
account's losses into trades that had already been stopped out, and leaving a
flattering residue behind. **The correct conclusion is the opposite of the
obvious one: the limit helps, and the code should enforce what it declares.**

This is the clearest example in the project of why a controlled re-run beats
reasoning about a live record. The live figure was real; the inference from it
was wrong.

---

## What I believe, and what I don't

**I believe:**

- The strategy has no edge on 5-minute bars in this universe. Three
  measurements agree, and the better-controlled ones are emphatic.
- The cost model is conservative, measured against real fills.
- Costs are not the binding constraint. A related strategy (TrendBot) returned
  **+$5,930 before any costs** over two years against a benchmark that returned
  **+41.8%**. It loses by roughly 36 points to a passive alternative *with a
  perfect, free broker*. Better execution cannot fix that.

- That a declared risk rule should be dropped because the trades that escaped
  it look profitable. Measurement 3 priced that intuition and it was backwards.

**I do not believe:**

- That the paper account's profit indicates an edge.
- Anything inferred from a subset of a live record selected on survival. That
  was the specific mistake measurement 3 caught, and it was mine.
- That these results generalise beyond what was tested — one universe, one
  timeframe, one strategy family.

**What remains genuinely open:** turnover. Both legs of measurement 3 were
gross-positive and net-deeply-negative — the better leg made **+$24,114 before
costs** and paid **$71,636** to trade. An earlier swing-only run showed the same
shape: +$29,970 gross against $69,978 of costs on 1,211 trades.

Costs run to roughly three times gross profit. That does not rescue the
strategy — a three-fold gap is not closed by better execution, and measurement 3
showed that cutting turnover by removing a rule made things *worse*, so turnover
is not a dial to be turned down carelessly either. What it does suggest is that
the arithmetic is dominated by trading *frequency* rather than by signal
quality. That is a claim about the arena rather than the system, and it is
testable: at a multi-week holding period turnover falls by roughly two orders of
magnitude, which is where the next research goes.

---

## Limitations, stated plainly

- **Paper fills, not real money.** Every live figure here comes from an Alpaca
  paper account. Fills are simulated by the broker, so real slippage is unproven.
- **One walk-forward, one universe.** 22 windows on a 10-name volatile preset.
  No walk-forward has been completed for TrendBot, on the current engine
  fingerprint, or on the 18-name universe.
- **Results are sensitive to universe composition.** In one measured case a
  single added symbol moved total return by 16 points and flipped gross P&L
  negative. Capital is a contended queue; one more competitor cascades.
- **The news module has a known bug**, unfixed deliberately: its keyword matching
  uses substrings, so "exe*cut*ive" scores bearish and "s*up*ply" scores bullish.
  Results above include it, because that is what was running.
- **A labelling defect in the historical ledger.** Every run recorded before
  2026-09-18 claims news was enabled while actually running with it disabled.
  Results before and after that date are not directly comparable.

---

## What happens next

Two things, in order.

**Change the arena.** 5-minute bars into roughly 7bp of round-trip friction with
about 1bp of gross signal has no solution in it at any signal quality. The next
research moves to daily bars and multi-week holds, where turnover falls by
roughly two orders of magnitude and friction stops being the dominant term.

**Keep a verifiable forward record running.** The strategy above now runs on a
server I control, from a named commit, with the deployed code verifiable against
the published repository. The record starts 2026-09-19. Whether it wins or
loses, it will be reported honestly, with period boundaries wherever the
configuration changes.

I set a stopping condition in advance: if nothing clears the bar by the end of
March 2027 — walk-forward positive after measured costs, a deflated Sharpe
defensible to a skeptic, and a risk-adjusted improvement over simply holding the
universe — the conclusion I publish is that I could not find an exploitable edge
in US equities using public data and technical signals at this horizon. That is
a legitimate ending, and writing it down in advance is what stops a negative
result from quietly becoming a reason to build more machinery.

---

## Reproducing this

Both measurements are ledger rows in `results/experiments.csv`, keyed by run ID.
Each records the engine source fingerprint and universe hash, so a result cannot
be silently attributed to the wrong code or the wrong symbol list.

**The walk-forward:**

```
run_id           20260821_155543_walkforward_wf-volatile_a625f7
code_fingerprint a625f708f76e
universe_hash    4349f37fcd
preset           volatile10        timeframe  5Min
window           2024-11-18 to 2026-08-18
```

```bash
bash runs.sh wf-volatile
```

**The reconciliation:**

```bash
python export_fills.py --start 2026-03-01 --end 2026-08-20
python reconcile.py --live results/live/live_trades.csv \
    --start 2026-03-01 --end 2026-08-20
```

Output, including the per-trade matching, is in
`results/live/reconciliation/`. The exported broker history is in
`results/live/` — note that it came from a paper account that has since been
deleted, and `results/live/README.md` explains the boundary.

**The swing-limit A/B (measurement 3):**

```bash
bash runs.sh swing-only            # the limit at its declared 10 days
bash runs.sh swing-only-noclock    # the limit disabled, as the live bot runs
```

```
limit ON   20260918_231922_single_swing-only_0f7087
limit OFF  20260918_233221_single_swing-only-noclock_0f7087
both on    code_fingerprint 0f7087e523c1, universe_hash d848afd031
```

**The supporting figures:**

```
TrendBot, 2 years   20260916_171706_single_trendbot-first-light_0d4a5f
swing-only, 2 years 20260916_125536_single_swing-only_617a6c
```

The test suite that guards the engine — look-ahead, next-bar fills, accounting,
and whether the simulator still matches the live bot — runs with:

```bash
./check.sh
```
