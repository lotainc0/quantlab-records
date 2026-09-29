# The conclusion: I could not find an exploitable edge

**Date:** 2026-09-29
**Author:** Yuepheng Yang
**Status:** final. This closes the research. Corrections go to
[`ERRATA.md`](../ERRATA.md), never into this file silently.

Before running the work it would judge, I set a stopping condition and
published it in this record's [README](../README.md):

> If no strategy has cleared the bar by the end of March 2027 — walk-forward
> positive after measured costs, a deflated Sharpe defensible to a skeptic, and a
> risk-adjusted improvement over simply holding the universe — the conclusion
> published is that I could not find an exploitable edge in US equities using
> public data and technical signals at this horizon.

Nothing cleared it. I am publishing the conclusion six months early. The one
study left to run could not be shown to have even odds of answering its own
question, and I chose not to spend trials on tests likely to fail whatever
the truth is. The reasons are below.

**The conclusion: I could not find an exploitable edge in US equities using
public data and technical signals.** The condition was written for the daily
horizon; I state it for the five-minute horizon too, which closed on its own
evidence first.

That is a statement about what I tested, not a claim that no edge exists.

---

## What was tested

Two arenas, each closed on its own evidence. The details are in the earlier
writeups; this is the whole list.

**Five-minute bars, 2024–2026, liquid US stocks**
([three measurements](2026-09-19-three-measurements.md),
[buy-and-hold](2026-09-20-what-buy-and-hold-was-doing.md)):

| what | result | against holding SPY (+33.5%, Sharpe 0.67) |
|---|---|---|
| momentum strategy, walk-forward (its news module was inert in this run; see [`EPOCH.md`](../EPOCH.md)) | −66.6%, Sharpe −0.50 | alpha −25.4% a year |
| trend-following strategy, walk-forward | −68.5%, Sharpe −1.32 | alpha −29.7% a year |
| the momentum strategy with keyword news sentiment on and off, one run per arm, not a walk-forward | news made it 2.8–5.3 points worse | — |

**Daily bars, up to a century, three studies with their bars fixed in advance,
17 counted trials** ([Epoch 2](2026-09-26-epoch-2.md)):

| study | result | against its benchmark |
|---|---|---|
| trend-following on 11 ETFs, 2001–2026 | Sharpe 0.279 | SPY 0.569: **CLOSED** |
| sector rotation on the nine sector SPDRs, 2002–2026 | Sharpe 0.537 | SPY 0.596, and holding all nine equally earned 0.618: **CLOSED** |
| industry momentum after its publication, Ken French's 48 industries | +0.24% a month over holding all 48 equally, t 1.90 against a bar of 1.645 | **SURVIVED narrowly, not investable** |

**No strategy that could actually be traded beat holding the market.** The
five-minute strategies lost heavily to it. The daily ones fell short of it,
the sector rotation by an amount inside the noise (a Sharpe difference of
−0.059 ± 0.091). The one positive result is about an effect in research
portfolios nobody can buy.

## Why the one positive does not change the conclusion

The industry-momentum result is real by the rule written before it ran, and I
am not going to talk it down further than the numbers do. It beat its
benchmark on paper. But it does not meet the stopping condition's bar as
written:

- **Not a walk-forward after costs.** It is a gross-of-costs calculation on
  research portfolios. A one-way trading cost of 0.93% would erase it, at
  about 156% turnover a year.
- **Not investable.** French's industry portfolios are built from the whole
  CRSP universe. No fund tracks them.
- **Not defensible to a skeptic across the family.** Counted as one search
  across 17 trials, it would need t ≥ 2.75. It also fails a two-sided test
  (1.96). As a disclosure, not a combined test (the studies test different
  nulls), neither the Holm nor the BHY correction leaves it standing.
- **Concentrated in time.** By decade: the 2000s +0.12% a month (t 0.48), the
  2010s +0.10% (t 0.92), the 2020s +0.50% (t 2.24).

It says industry momentum did not vanish after 1999, on paper. It does not say
anyone could have earned it.

## Why I stopped early instead of testing more

On 2026-09-29, before designing another study, I adopted three stopping rules
and published them in [`EPOCH.md`](../EPOCH.md). The first says a study is not
run unless it has at least even odds of detecting the effect it tests,
assuming the effect has shrunk after publication as much as published effects
typically do. McLean & Pontiff (2016) put that shrinkage at 58%.

The two candidates left both fail it:

- **Repeating the industry result on industry ETFs**, which can be bought.
  Power is about 26% at the shrunken effect and 49% at the study's own
  measured one. That uses the study's published precision and ETF listing
  dates I took from memory rather than checked. The ETFs also cover only
  months the industry study already used, so a result would add little new
  evidence.
- **Single-stock momentum after publication**, the canonical technical
  anomaly. Using Jegadeesh & Titman's published long-side return, power is
  43–62% depending on a tracking error no source publishes, and the 50% line
  falls where this lab's own industry study landed. "Not demonstrated" is not
  "at least 50%".

The rest of the candidate list was either decided against before this point
(a low-volatility tilt and a volatility-managed variant, both on the same nine
sectors) or belongs to a family already closed here (long-only market timing,
which is also how multi-asset trend-following would run in this engine).
Single stocks on a real point-in-time S&P 500 universe were ruled out on data.
The best free dataset I found reports 588 of 1,231 historical members without
prices before a paid-source fallback, and no free source documents delisting
returns. Those are the two gaps a momentum test is most exposed to.

The same rules allowed up to three more trials. **I am choosing not to use
them.** Epoch 2 closes at 17, recorded with a date in `EPOCH.md`. Closing
earlier than a rule allows is stricter, not looser.

## What I am confident of, and what I am not

**Confident:**
- None of the tradeable strategies tested beat holding the market after
  costs.
- In the five-minute arena, trading costs of about 7 basis points a round
  trip swamp a gross signal of about 1 for these strategies. Better signals of
  the same kind would not close that.
- The five-minute losses are far too large to blame on fills. The simulator's
  entry fills were 55 bps *worse* than the broker's at the median, but only on
  the 6% of trades the two systems shared. The gap to SPY was 25–30 points a
  year.

**Not confident, and not claimed:**
- That no technical edge exists in US equities. I tested a handful of rules,
  mostly on ETFs and sectors, with public data.
- That single-stock momentum is dead. It was not tested, for the power reason
  above.
- That sentiment cannot help. One keyword lexicon, one run per arm, in a
  friction-dominated arena, made things worse.
- That the forward record will look like the backtests. It is ten days old.

## What a skeptic should attack first

I would start here, so I am saying it before anyone else does.

- **The pre-registrations are not publicly timestamped before their runs.**
  Each study's specification lives in my private repository. Its history shows
  it was written and amended before the run, but on this public record every
  Epoch 2 declaration arrived in the same commit as its result. A reader
  cannot verify the order from here. What a reader can check is narrower: the
  freeze, the stopping rules above (published before any further study), and
  the dated errata. With no further study planned, there is nothing left to
  pre-register publicly.
- **The trend study's grid was looked at three times**, each look after an
  instrument repair, and each repair raised the result (0.080, then 0.119,
  then 0.279). It is counted as 12 trials for that reason. A later-found
  defect in how it chose parameters was recorded, not re-run, and its
  out-of-sample stretch spent 21.7% of its bars warming up. None of this is
  hidden, and the gap to SPY is large. But the closed number was never
  reproduced on the fully repaired instrument.
- **The industry study had no independent review before its run**, only its
  own tests. The sector study did, and that review found a real defect.
- **Everything live is a paper account.** Fills are the broker's simulation.
- **The engine source is not public.** Each result can be checked against its
  ledger row, code fingerprint and universe hash, not re-run from here.

The errata, all dated, are in [`ERRATA.md`](../ERRATA.md). The [Epoch 2
writeup](2026-09-26-epoch-2.md) lists what went wrong and how it was caught.

## What continues

- **The forward record.** The frozen configuration keeps running on a paper
  account from its 2026-09-19 boundary. The bot runs unattended; I export its
  fills weekly by hand, with its boundaries stated in
  [`live/README.md`](../live/README.md). The broker's margin multiplier
  changed on 2026-09-24, but the bot's own exposure cap did not, so it still
  never borrows. The record is not evidence of an edge, and the measurements
  above give no reason to expect one. It is evidence that a declared
  configuration was left alone.
- **The ledger stays append-only.** Nothing in it is deleted or rewritten.
- **Epoch 2 is closed at 17 trials.** No further study is added to it.

## What would change this conclusion

- An investable test of industry momentum with enough history to have power.
  On current ETF history that is years away.
- A single-stock test whose power could be shown in advance, on
  survivorship-free data with delisting returns.
- A forward record that beats holding the market over years, not weeks, under
  one unchanged configuration. If that happens, the freeze makes it
  checkable.

None of these is available now. The honest answer today is the one I wrote
down before starting.

---

*Sources: McLean & Pontiff (2016), JF 71(1); Jegadeesh & Titman (2001), JF
56(2), Table I; Moskowitz & Grinblatt (1999), JF 54(4); Bailey & López de
Prado (2014), JPM 40(5). Power calculations use published figures only; no
data was read for them.*
