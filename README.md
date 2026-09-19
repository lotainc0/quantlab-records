# Trading research — the record

A public, checkable record of a systematic US-equity trading project: what was
tested, what the results were, and what is running now.

**Both completed measurements came back negative.** They are published here in
full. That is the point of the repository, not an admission buried in it.

---

## Why this exists

Anyone can claim a backtest. What is hard to fake is a dated record showing what
was declared, when, and what happened next.

So this repository holds the **evidence**, not the pitch:

- every experiment ever run, with the parameters used and the results obtained
- the raw broker record — real fills, not a simulation of them
- the writeups, including the ones that say the strategy does not work
- the currently deployed commit, verifiable against the running system

The engine source is not here. Everything needed to *check a claim* is.

---

## The results so far

### 1. Walk-forward test — the strategy has no edge

Parameters fitted on a training window, then traded forward on data the fit had
never seen. 22 windows, 2024-11-18 to 2026-08-18.

| | |
|---|---|
| Out-of-sample return | **−66.6%** ($100,000 → $33,384) |
| Windows profitable | 4 of 22 (18.2%) |
| In-sample → out-of-sample Sharpe degradation | 0.94 |
| Deflated Sharpe probability | **0.0011** against a 0.95 bar |

The degradation figure is the signature of overfitting: the parameter search was
finding noise in the training window. The deflated Sharpe probability accounts
for having tried 27 parameter combinations — trying many and reporting the best
inflates results, and this removes that inflation.

`ledger/experiments.csv` → `20260821_155543_walkforward_wf-volatile_a625f7`

### 2. Reconciliation — the simulator and the live bot were different systems

Six months of real broker fills matched against the simulator over the same
window and universe.

| | |
|---|---|
| Live round trips | 1,261 |
| Simulated round trips | 687 |
| **Matched** | **81 — about 6%** |
| Simulator entry fills vs live | 55 bps **worse** (conservative) |

The 6% match rate is the finding. An apparent contradiction — the simulator
showing heavy losses while a paper account showed a profit — was never a paradox
to resolve. The two were taking different trades.

One useful thing survives: the cost model is **conservative**, so simulated
results are not flattered by optimistic fills.

`live/reconciliation/verdict.json`

### 3. A rule that was declared and never enforced

The live bot's configuration declares a 10-day limit on swing positions. Its
code never implements it. 242 of 1,713 paper trades (14.1%) ran past that limit
and made +$46,594, while the other 1,471 lost $24,201 — which looked like
evidence that the limit was costing money.

It was not. Re-running the backtest with the limit disabled, changing nothing
else, **halved profit before costs** (+$24,114 → +$11,436) and made total return
5.1 points worse, *despite* lower trading costs.

The +$46,594 was survivorship inside the sample: a trade only runs past 10 days
if it has not already hit a stop. Of the trades the limit was cutting, letting
them run produced 18 more stop-losses against 11 more take-profits.

`ledger/experiments.csv` → labels `swing-only` and `swing-only-noclock`,
fingerprint `0f7087e523c1`, universe hash `d848afd031`

---

## What is here

| path | what |
|---|---|
| `writeups/` | the results, in plain English |
| `ledger/experiments.csv` | every run: 463+ rows, parameters and results |
| `ledger/experiments.jsonl` | the same, append-only |
| `live/` | the raw broker record — fills, orders, round trips |
| `live/reconciliation/` | simulator vs live, trade by trade |
| `deployment/DEPLOYED.md` | the commit currently running, machine-generated |

Each ledger row records a **code fingerprint** (a hash of the engine source) and
a **universe hash** (a hash of the symbol list). A result therefore cannot be
silently attributed to the wrong code or the wrong symbols — if either changed,
the hash changed.

The parameters used are published too: 69 populated `param_*` and `limit_*`
columns, covering indicator periods, thresholds, stops, targets and position
limits. Withholding them would make the results uncheckable, which would defeat
the purpose.

## What is not here, and why

- **The engine source.** Not required to check any claim above.
- **Market data.** Roughly 103 MB of cached bars, re-fetchable from the vendor.
- **Credentials, and the server's address.** The deployment record has its host
  redacted; it grants no verification value and only invites scanning.

## An important limitation, stated up front

**All trading here is on a paper account.** Fills are simulated by the broker, so
real-world slippage is unproven. This is a research record, not a real-money
track record, and no claim here should be read as one.

Other limitations are listed in each writeup — including a deliberately unfixed
bug in the news module, sensitivity to universe composition, and a labelling
defect in ledger rows written before 2026-09-18.

---

## The forward record

The strategy now runs on a server under systemd, deployed from a named commit,
with the deployed code verifiable against the published repository. A local
script confirms the running commit matches the published one, that the checkout
is clean, and how many times the process has restarted.

**The forward record starts 2026-09-19**, on a fresh $100,000 paper account.
Results from before that date came from a different account that has since been
deleted, under configurations that changed during the window — `live/README.md`
explains the boundary. **The two must not be concatenated.**

## The stopping condition

Written in advance, so a negative result cannot quietly become a reason to build
more machinery:

> If no strategy has cleared the bar by the end of March 2027 — walk-forward
> positive after measured costs, a deflated Sharpe defensible to a skeptic, and a
> risk-adjusted improvement over simply holding the universe — the conclusion
> published is that I could not find an exploitable edge in US equities using
> public data and technical signals at this horizon.

That is a legitimate ending. Publishing it is the same commitment as publishing a
positive result would be.

---

*Yuepheng Yang — last updated 2026-09-19*
