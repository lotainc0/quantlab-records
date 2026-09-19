# results/live — broker fills, and an account boundary that matters

## Read this before quoting any figure in here

**Everything in this directory came from an Alpaca paper account that no longer
exists.** It was deleted on 2026-09-18. These CSVs are the only surviving copy.

**"live" here means "real broker fills, as opposed to backtest." It does not
mean real money.** The word appears throughout this repo and reads as though it
does. Every figure below was produced on a *paper* account, so fills are
simulated: slippage realism is unproven, and nothing here is a real-money track
record. Any claim built on this data has to say so.

## The boundary

| | before | after |
|---|---|---|
| account | `PA3O…` (deleted 2026-09-18) | `PA3XIV0R8EDH` |
| starting equity | unknown, ended at $136,210.17 | $100,000.00 |
| margin multiplier | 4 | 2 |
| period | 2026-03-09 → 2026-09-18 | 2026-09-19 → |
| deployed on | a machine nobody could inspect | a server I control, commit recorded |
| StockBot commit | not knowable | `ed854ce`, verified |

**These are two different records and must not be concatenated.** The account
changed, the starting equity changed, the multiplier changed, and the code
changed. Anything that appends new fills to `live_trades.csv` and treats the
result as one series is producing a number that describes nothing.

## What is in here

| file | what |
|---|---|
| `live_fills.csv` | 2,119 raw fill activities |
| `live_trades.csv` | 1,713 round trips, FIFO-paired into the backtest's schema |
| `live_orders.csv` | order records, including unfilled |
| `reconciliation/` | output of `reconcile.py` against a matched backtest |

Headline figures for the old account, for reference rather than for reuse:
realised **+$22,393.32**, win rate 40.7%, profit factor 1.06, median hold 47.4
hours, 17.0% same-day round trips, 88.5% of entries in extended hours.

**The figure that matters is not the headline.** 242 of those trades (14.1%)
ran past the 10-day swing clock that `StockBot/config.py` declares and never
implements, and those 242 made **+$46,594**. The other 1,471 net **−$24,201**.
The only profitable behaviour this strategy has demonstrated came from a bug.
See `BACKLOG.md`.

## Why this directory is tracked at all

It was not, until 2026-09-18. `.gitignore` covered it under `results/*` and the
only copy lived on one laptop — the same exposure that nearly destroyed
`results/runs` on 2026-09-17. It was committed hours before the account it came
from was deleted.

## Regenerating

```
python export_fills.py --start YYYY-MM-DD --end YYYY-MM-DD
```

This overwrites the files in place. **Against the new account it will return
only post-2026-09-19 data**, because the old account is gone — so a naive
re-export silently replaces six months of history with a few days of it, and
nothing warns you.

It is recoverable, but only because this directory is now tracked:

```
git checkout -- results/live/
```

That safety net is the entire reason the directory was committed. Before it
was, the same mistake would have been permanent. Better still, export the new
account somewhere else and leave these files alone.
