// GENERATED SOURCE - edit quantlab/publish/site/table.js.
'use strict';

let ENTRIES = [];
let SORT = { key: 'date', dir: -1 };   // newest first
const FILTER = { modes: new Set(), text: '', deflatedOnly: false };

function allModes() {
  return [...new Set(ENTRIES.map((e) => e.head.mode).filter(Boolean))].sort();
}

function hasDeflated(e) {
  return e.rows.some((r) => num(r.deflated_sharpe_p) !== null);
}

function applyFilters() {
  const text = FILTER.text.trim().toLowerCase();
  return ENTRIES.filter((e) => {
    if (FILTER.modes.size && !FILTER.modes.has(e.head.mode)) return false;
    if (FILTER.deflatedOnly && !hasDeflated(e)) return false;
    if (text) {
      const hay = `${e.head.label || ''} ${e.run_id}`.toLowerCase();
      if (!hay.includes(text)) return false;
    }
    return true;
  }).sort((a, b) => {
    const ka = sortKey(a, SORT.key), kb = sortKey(b, SORT.key);
    if (ka < kb) return -SORT.dir;
    if (ka > kb) return SORT.dir;
    return 0;
  });
}

function renderControls() {
  const box = document.getElementById('controls');
  box.replaceChildren();

  const modes = document.createElement('fieldset');
  modes.innerHTML = '<legend>Mode</legend>';
  for (const m of allModes()) {
    const n = ENTRIES.filter((e) => e.head.mode === m).length;
    const lab = document.createElement('label');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.addEventListener('change', () => {
      cb.checked ? FILTER.modes.add(m) : FILTER.modes.delete(m);
      renderBody(applyFilters());
    });
    lab.append(cb, ` ${m} (${n})`);
    modes.appendChild(lab);
  }
  box.appendChild(modes);

  const other = document.createElement('fieldset');
  other.innerHTML = '<legend>Filter</legend>';

  const search = document.createElement('input');
  search.type = 'search';
  search.placeholder = 'label or run id';
  search.addEventListener('input', () => {
    FILTER.text = search.value;
    renderBody(applyFilters());
  });
  other.appendChild(search);

  const nDeflated = ENTRIES.filter(hasDeflated).length;
  const dLab = document.createElement('label');
  const dCb = document.createElement('input');
  dCb.type = 'checkbox';
  dCb.addEventListener('change', () => {
    FILTER.deflatedOnly = dCb.checked;
    renderBody(applyFilters());
  });
  dLab.append(dCb, ` only runs with a deflated Sharpe p-value (${nDeflated})`);
  other.appendChild(dLab);

  box.appendChild(other);
  box.hidden = false;
}

function renderHead() {
  const tr = document.createElement('tr');
  for (const col of SUMMARY_COLUMNS) {
    const th = document.createElement('th');
    th.textContent = col.label;
    if (col.numeric) th.classList.add('num');
    th.tabIndex = 0;
    th.setAttribute('role', 'button');
    if (SORT.key === col.key) th.setAttribute('aria-sort', SORT.dir === 1 ? 'ascending' : 'descending');
    const resort = () => {
      SORT = (SORT.key === col.key) ? { key: col.key, dir: -SORT.dir } : { key: col.key, dir: 1 };
      renderHead();
      renderBody(applyFilters());
    };
    th.addEventListener('click', resort);
    th.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); resort(); }
    });
    tr.appendChild(th);
  }
  document.querySelector('#ledger thead').replaceChildren(tr);
}

function renderBody(entries) {
  const body = document.querySelector('#ledger tbody');
  const rows = entries.map((e) => {
    const cells = summarise(e);
    const tr = document.createElement('tr');
    for (const col of SUMMARY_COLUMNS) {
      const td = document.createElement('td');
      if (col.key === 'label') {
        const a = document.createElement('a');
        a.href = 'run.html?id=' + encodeURIComponent(e.run_id);
        a.textContent = cells.label;
        td.appendChild(a);
      } else {
        td.textContent = cells[col.key];
      }
      if (col.numeric) td.classList.add('num');
      tr.appendChild(td);
    }
    return tr;
  });
  body.replaceChildren(...rows);
  const rowCount = entries.reduce((n, e) => n + e.rows.length, 0);
  const rowWord = rowCount === 1 ? 'row' : 'rows';
  document.getElementById('entry-count').textContent = (entries.length === ENTRIES.length)
    ? `${entries.length} entries from ${rowCount} rows.`
    : `${entries.length} of ${ENTRIES.length} entries shown, ${rowCount} ${rowWord}.`;
}

async function main() {
  const status = document.getElementById('status');
  try {
    ENTRIES = groupEntries(await loadRecords('experiments.jsonl'));
  } catch (err) {
    status.className = 'warn';
    status.innerHTML =
      'Could not load the ledger (' + String(err.message).replace(/</g, '&lt;') + '). ' +
      'The raw data still works: <a href="experiments.csv">experiments.csv</a> or ' +
      '<a href="experiments.jsonl">experiments.jsonl</a>.';
    document.getElementById('entry-count').textContent = '';
    return;
  }
  renderHead();
  renderControls();
  renderBody(applyFilters());
  status.hidden = true;
  document.getElementById('ledger').hidden = false;
}

main();
