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

**No new five-minute runs will be recorded.** The recipes still exist and the
data is still cached, so anything here can be reproduced; nothing new will be
added.

## Epoch 2 — daily bars, multi-week holds. **OPENS when the four gates below are cleared.**

Turnover drops about two orders of magnitude, which moves friction from the
dominant term to noise. It is also the one place being small is an advantage:
positions can be held through stretches an institution reporting monthly
cannot.

**Epoch 2 results will not be compared to Epoch 1 results.** Not "compared
carefully" — not compared. Different bar, different holding period, different
cost regime, different date range. The ledger keeps both because it is
append-only; the reader should treat them as two separate studies.

Four things must be settled before the first Epoch 2 measurement counts. They
are listed in `docs/superpowers/specs/2026-09-19-daily-bar-audit.md` §8.

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
