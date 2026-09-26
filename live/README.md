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
| account | `PA3O…` (deleted 2026-09-18) | `account-redacted` |
| starting equity | unknown, ended at $136,210.17 | $100,000.00 |
| margin multiplier | 4 | **1**; **2** from 2026-09-24 (see below) |
| period | 2026-03-09 → 2026-09-18 | 2026-09-19 → |
| deployed on | a machine nobody could inspect | a server I control, commit recorded |
| StockBot commit | not knowable | `ed854ce` at the boundary, verified |

**Corrected 2026-09-20.** This table read `2` for the new account's
multiplier. The broker reports **1**, queried directly from the account. The
difference is not cosmetic: a multiplier of 1 is a cash account with no margin,
so the bot's buying power is its equity rather than twice it, and every
position it can open is half the size the number 2 implied. The old account ran
at 4. Nothing else in this table changed.

**Changed 2026-09-24, and why that is NOT a new boundary.** The owner set the
account's multiplier to 2 in the Alpaca dashboard. StockBot's own
`MAX_TOTAL_EXPOSURE_PCT` stayed at 1.0, and it refuses every entry past 100% of
equity whatever buying power the broker offers, so **the bot's behaviour did not
change and it still never borrows.** Raising the bot's cap to 2.0 was built and
tested that day and decided against: leverage scales a strategy's mean and
volatility together, so it cannot make a forward record prove anything faster,
it would have broken Freeze #1, and at 2x the maintenance floor comes within
reach — Alpaca's requirement is 30% or more for every symbol on the watchlist,
and the book held that day would have hit it on a 20.7% decline. The work is
parked on StockBot branch `exposure-2x-peak-persistence`.

The multiplier is now machine-read: `deploy/verify.sh` records it in
`deploy/DEPLOYED.md`, and `test_freeze.py` fails if the frozen exposure cap
ever exceeds it. This table is no longer the only record of it, which matters
because this row had been wrong in both directions.

The commit above is the one running when this boundary was drawn; the
currently deployed commit is in `deployment/DEPLOYED.md`, which is
regenerated on every verify.

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

## The new account's record lives in a subdirectory

**Account numbers are redacted in the public copy from 2026-09-26.** The
public record's `publish.sh` rewrites any broker account number to
`account-redacted`, in paths and in text, and refuses to publish one that
survives. Versions published from 2026-09-19 to 2026-09-26 carried the new
paper account's number in full, in this file and in the freeze record; it
remains in the public repository's history, which is not rewritten. It is a
paper account's number, not a credential.

**`results/live/account-redacted/`** — re-exported 2026-09-24 with
`--start 2026-09-19 --end 2026-09-25`, so it runs through that day's last fill
(15:23:37 UTC). Same three filenames, one directory down, because the warning at
the bottom of this file is real and was proved so on the way in: the export
wrote over six months of history and said nothing. The old files were restored
from git and the new ones moved aside.

| | old account (this directory) | `account-redacted/` |
|---|---|---|
| round trips | 1,713 | **56** (106 fills) |
| span | 2026-03-09 → 2026-09-16 | 2026-09-21 → 2026-09-24 |
| realised | +$22,393.32 | **−$2,963.14** |
| win rate | 40.7% | 17.9% |
| profit factor | 1.06 | 0.15 |
| median hold | 47.4 h | 24.3 h |
| same-day share | 17.0% | 16.1% |
| extended-hours entries | 88.5% | **100%** |

**Fifty-six round trips over four sessions is not a result and must not be
quoted as one.** It is a check that the pipe is connected, and it is: the first
fill landed on 2026-09-21, the Monday the handoff named.

At `verify.sh` on 2026-09-24 19:33 UTC: equity $97,883.63, 13 open positions.
Total drawdown from the $100,000 start is $2,116.37 against $2,963.14 realised,
so the open book is **up** $846.77 unrealised — an inference that holds only
while there are no deposits or withdrawals. (An earlier export the same day
read "32 round trips, −$1,444.52"; it stopped at midnight, see Regenerating.)

**There is a seam inside this record.** The service restarted at
2026-09-23 06:31:30 UTC — manually, so systemd's restart count stayed at 0 and
`verify.sh` reported "restarts 0" until it learned to compare start times. The
trailing-stop high-water marks live in memory, so every position open at that
moment began trailing from its gain at the restart rather than from its peak.
Commit and config did not change, so this is a seam and not a boundary; it is
recorded so a reader who finds an oddly late or missing trailing-stop exit on
2026-09-23 knows where to look.

**The two directories are the two records in the boundary table. They are not to
be concatenated, and keeping them in separate directories is how that stays
true.**

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

**`--end` is exclusive at midnight.** It is parsed as a date and sent to Alpaca
as `until`, so `--end 2026-09-24` stops at 00:00 that day and silently drops
every fill from it. To include a day, end on the day after.

The procedure that keeps both records whole, until `export_fills.py` learns an
output directory (it is in `BACKLOG.md`):

```
python export_fills.py --start 2026-09-19 --end YYYY-MM-DD
mv results/live/live_fills.csv results/live/live_orders.csv results/live/live_trades.csv results/live/account-redacted/
git checkout -- results/live/live_fills.csv results/live/live_orders.csv results/live/live_trades.csv
```
