// GENERATED SOURCE - edit quantlab/publish/site/detail.js.
'use strict';

// Fields are grouped so identity and reproducibility come first and the
// diagnostic firehose comes last. Anything unlisted falls into "Other", so a
// new column appears on the page the day it appears in the data.
const GROUPS = [
  { title: 'Identity', keys: ['run_id', 'variant', 'mode', 'label', 'experiment', 'timestamp_utc', 'timestamp_local'] },
  { title: 'Window and universe', keys: ['start', 'end', 'timeframe', 'n_symbols', 'symbols', 'universe_hash'] },
  { title: 'Reproducibility', keys: ['code_fingerprint', 'data_fingerprint', 'python_version', 'runtime_sec'] },
  { title: 'Results', keys: ['total_return', 'cagr', 'sharpe', 'sortino', 'calmar', 'max_drawdown', 'n_trades', 'win_rate', 'profit_factor', 'expectancy', 'deflated_sharpe_p', 'n_trials', 'benchmark_total_return', 'alpha_annualized', 'beta', 'information_ratio', 'total_costs', 'pnl_before_costs'] },
];

function qs(name) { return new URLSearchParams(location.search).get(name); }

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

function fieldTable(rec, keys) {
  const t = document.createElement('table');
  t.className = 'fields';
  for (const k of keys) {
    if (!(k in rec)) continue;
    const tr = document.createElement('tr');
    const th = document.createElement('th'); th.textContent = k;
    const td = document.createElement('td');
    const v = rec[k];
    td.textContent = (v === null || v === undefined || v === 'nan') ? MISSING : String(v);
    if (k === 'code_fingerprint' || k === 'data_fingerprint') td.className = 'mono strong';
    tr.append(th, td); t.appendChild(tr);
  }
  return t;
}

function renderRecord(rec, heading) {
  const out = document.createElement('div');
  const h = document.createElement('h1'); h.textContent = heading; out.appendChild(h);

  const shown = new Set();
  for (const g of GROUPS) {
    const present = g.keys.filter((k) => k in rec);
    if (!present.length) continue;
    present.forEach((k) => shown.add(k));
    const h2 = document.createElement('h2'); h2.textContent = g.title;
    out.append(h2, fieldTable(rec, present));
  }
  const params = Object.keys(rec).filter((k) => k.startsWith('param_')).sort();
  const diags = Object.keys(rec).filter((k) => k.startsWith('diag_')).sort();
  const rest = Object.keys(rec)
    .filter((k) => !shown.has(k) && !k.startsWith('param_') && !k.startsWith('diag_')).sort();
  for (const [title, keys] of [['Parameters', params], ['Other', rest], ['Diagnostics', diags]]) {
    if (!keys.length) continue;
    const h2 = document.createElement('h2'); h2.textContent = title;
    out.append(h2, fieldTable(rec, keys));
  }
  return out;
}

function renderSweep(entry) {
  const out = document.createElement('div');
  const h = document.createElement('h1');
  h.textContent = `${entry.head.label || entry.run_id} — ${entry.rows.length} variants`;
  out.appendChild(h);

  const p = document.createElement('p');
  p.className = 'lede';
  p.textContent = 'One robustness run emits one row per parameter variant. '
    + 'Each row below is a separate result; pick one to see every field it recorded.';
  out.appendChild(p);

  const t = document.createElement('table');
  t.innerHTML = '<thead><tr><th>Variant</th><th class="num">Return</th>'
    + '<th class="num">Sharpe</th><th class="num">Trades</th></tr></thead>';
  const body = document.createElement('tbody');
  for (const r of entry.rows) {
    const tr = document.createElement('tr');
    const a = document.createElement('a');
    a.href = 'run.html?id=' + encodeURIComponent(entry.run_id)
           + '&variant=' + encodeURIComponent(r.variant);
    a.textContent = r.variant;
    const td0 = document.createElement('td'); td0.appendChild(a);
    const cells = [pct(r.total_return), dec(r.sharpe), int(r.n_trades)]
      .map((v) => { const td = document.createElement('td'); td.className = 'num'; td.textContent = v; return td; });
    tr.append(td0, ...cells);
    body.appendChild(tr);
  }
  t.appendChild(body);
  out.appendChild(t);
  return out;
}

function fail(msg) {
  const p = document.createElement('p');
  p.className = 'warn';
  p.innerHTML = esc(msg) + ' <a href="./">Back to the ledger</a>. Raw data: '
    + '<a href="experiments.csv">experiments.csv</a> or '
    + '<a href="experiments.jsonl">experiments.jsonl</a>.';
  return p;
}

async function main() {
  const out = document.getElementById('out');
  const id = qs('id'), variant = qs('variant');
  if (!id) { out.replaceChildren(fail('No run id in the URL.')); return; }

  let entries;
  try {
    entries = groupEntries(await loadRecords('experiments.jsonl'));
  } catch (err) {
    out.replaceChildren(fail('Could not load the ledger (' + err.message + ').'));
    return;
  }

  const entry = entries.find((e) => e.run_id === id);
  if (!entry) { out.replaceChildren(fail(`No run with id "${id}".`)); return; }

  if (variant !== null) {
    const rec = entry.rows.find((r) => String(r.variant) === variant);
    if (!rec) { out.replaceChildren(fail(`Run "${id}" has no variant "${variant}".`)); return; }
    document.title = `${id} / ${variant}`;
    out.replaceChildren(renderRecord(rec, `${entry.head.label || id} — ${variant}`));
    return;
  }

  document.title = id;
  out.replaceChildren(entry.sweep ? renderSweep(entry) : renderRecord(entry.head, entry.head.label || id));
}

main();
