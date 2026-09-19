// GENERATED SOURCE — edit quantlab/publish/site/ledger.js.
// This copy lives in the public record repo and is overwritten by publish.sh
// on every publish. Edits made here are deleted, not merged.
'use strict';

const SUMMARY_COLUMNS = [
  { key: 'date',         label: 'Date',    numeric: false },
  { key: 'mode',         label: 'Mode',    numeric: false },
  { key: 'label',        label: 'Label',   numeric: false },
  { key: 'window',       label: 'Window',  numeric: false },
  { key: 'universe',     label: 'Universe', numeric: false },
  { key: 'total_return', label: 'Return',  numeric: true },
  { key: 'sharpe',       label: 'Sharpe',  numeric: true },
  { key: 'n_trades',     label: 'Trades',  numeric: true },
];

const MISSING = '—'; // em dash

// JSON cannot hold NaN, so 2 of 465 rows carry the STRING "nan" in
// total_return and sharpe. Everything numeric goes through here, so those
// become null and render as an em dash rather than sorting as text.
function num(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const f = parseFloat(v);
  return Number.isFinite(f) ? f : null;
}

// total_return is a FRACTION: -0.666 means -66.6%.
function pct(v) { const n = num(v); return n === null ? MISSING : (n * 100).toFixed(1) + '%'; }
function dec(v, places = 2) { const n = num(v); return n === null ? MISSING : n.toFixed(places); }
function int(v) { const n = num(v); return n === null ? MISSING : String(Math.round(n)); }

// Handles both '2026-08-21T20:55:43Z' and '2024-11-18 09:00:00+00:00'.
function day(v) { return (typeof v === 'string' && v.length >= 10) ? v.slice(0, 10) : MISSING; }

async function loadRecords(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const text = await res.text();
  return text.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
}

// 465 rows -> 76 entries. A robustness run emits ~24 rows, one per variant.
function groupEntries(records) {
  const by = new Map();
  for (const r of records) {
    if (!by.has(r.run_id)) by.set(r.run_id, []);
    by.get(r.run_id).push(r);
  }
  return Array.from(by, ([run_id, rows]) => ({
    run_id, rows, sweep: rows.length > 1, head: rows[0],
  }));
}

// For a sweep, a single number would be a lie — show the spread across variants.
function spread(rows, field, fmt) {
  const vals = rows.map((r) => num(r[field])).filter((v) => v !== null);
  if (!vals.length) return MISSING;
  const lo = Math.min(...vals), hi = Math.max(...vals);
  return lo === hi ? fmt(lo) : `${fmt(lo)} … ${fmt(hi)}`;
}

function summarise(e) {
  const h = e.head;
  const pctRaw = (v) => (v * 100).toFixed(1) + '%';
  return {
    date: day(h.timestamp_utc),
    mode: h.mode || MISSING,
    label: e.sweep ? `${h.label || MISSING} (${e.rows.length} variants)` : (h.label || MISSING),
    window: `${day(h.start)} → ${day(h.end)}`,
    universe: `${h.n_symbols ?? MISSING} · ${String(h.universe_hash || '').slice(0, 6)}`,
    total_return: e.sweep ? spread(e.rows, 'total_return', pctRaw) : pct(h.total_return),
    sharpe: e.sweep ? spread(e.rows, 'sharpe', (v) => v.toFixed(2)) : dec(h.sharpe),
    n_trades: e.sweep ? spread(e.rows, 'n_trades', (v) => String(Math.round(v))) : int(h.n_trades),
  };
}

// Sorting uses the underlying value, never the formatted string: '9%' > '10%'
// lexically, and a sweep's "lo … hi" cell has no single value at all. For a
// sweep, sort on the best variant.
function sortKey(e, column) {
  const h = e.head;
  switch (column) {
    case 'date': return h.timestamp_utc || '';
    case 'mode': return h.mode || '';
    case 'label': return h.label || '';
    case 'window': return h.start || '';
    case 'universe': return num(h.n_symbols) ?? -Infinity;
    case 'total_return':
    case 'sharpe':
    case 'n_trades': {
      const vals = e.rows.map((r) => num(r[column])).filter((v) => v !== null);
      return vals.length ? Math.max(...vals) : -Infinity;
    }
    default: return '';
  }
}
