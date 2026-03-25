import type { AcbEntry, TaxYearSummary } from '../types';

function fmtNum(n: number | null): string {
  if (n === null) return '';
  return n.toFixed(2);
}

export function exportAcbToCsv(entries: AcbEntry[]): string {
  const headers = [
    'Date',
    'Type',
    'Source',
    'Description',
    'Quantity',
    'Price/Share (USD)',
    'Total (USD)',
    'Commission (USD)',
    'Fee (USD)',
    'USD/CAD Rate',
    'Price/Share (CAD)',
    'Total (CAD)',
    'Selling Expenses (CAD)',
    'Shares Held',
    'Total ACB (CAD)',
    'ACB/Share (CAD)',
    'Proceeds (USD)',
    'Proceeds (CAD)',
    'ACB of Shares Sold (CAD)',
    'Capital Gain (CAD)',
    'Taxable Capital Gain (CAD)',
    'Superficial Loss Flag',
    'SfL Denied (CAD)',
  ];

  const rows = entries.map((e) => [
    e.date,
    e.type,
    `"${e.source}"`,
    `"${e.description}"`,
    e.quantity,
    fmtNum(e.pricePerShareUsd),
    fmtNum(e.totalUsd),
    fmtNum(e.commissionUsd),
    fmtNum(e.feeUsd),
    e.exchangeRate.toFixed(4),
    fmtNum(e.pricePerShareCad),
    fmtNum(e.totalCad),
    fmtNum(e.sellingExpensesCad),
    e.sharesHeld,
    fmtNum(e.totalAcbCad),
    fmtNum(e.acbPerShareCad),
    fmtNum(e.proceedsUsd),
    fmtNum(e.proceedsCad),
    fmtNum(e.acbOfSharesSoldCad),
    fmtNum(e.capitalGainCad),
    fmtNum(e.taxableCapitalGainCad),
    e.superficialLossFlag ? 'YES' : '',
    fmtNum(e.superficialLossDeniedCad),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function exportTaxYearsToCsv(summaries: TaxYearSummary[]): string {
  const headers = [
    'Tax Year',
    'Dispositions',
    'Acquisitions',
    'Total Proceeds (CAD)',
    'Total ACB of Shares Sold (CAD)',
    'Total Selling Expenses (CAD)',
    'Total Capital Gains (CAD)',
    'Total Taxable Capital Gains (CAD)',
  ];

  const rows = summaries.map((s) => [
    s.year,
    s.dispositionCount,
    s.acquisitionCount,
    fmtNum(s.totalProceedsCad),
    fmtNum(s.totalAcbOfSharesSoldCad),
    fmtNum(s.totalSellingExpensesCad),
    fmtNum(s.totalCapitalGainsCad),
    fmtNum(s.totalTaxableCapitalGainsCad),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function generateAuditReport(year: number, entries: AcbEntry[]): string {
  const yearEntries = entries.filter(
    (e) => parseInt(e.date.substring(0, 4), 10) === year,
  );
  const dispositions = yearEntries.filter((e) => e.type === 'sell');
  const acquisitions = yearEntries.filter((e) => e.type !== 'sell');

  const lines: string[] = [];
  const hr = '='.repeat(90);
  const hr2 = '-'.repeat(70);

  lines.push(hr);
  lines.push(`CAPITAL GAINS AUDIT REPORT - TAX YEAR ${year}`);
  lines.push(`Generated: ${new Date().toISOString().slice(0, 10)}`);
  lines.push(`Security: Arista Networks Inc. (ANET) - NYSE`);
  lines.push(`Method: Canadian Average Cost (Adjusted Cost Base)`);
  lines.push(hr);
  lines.push('');

  // Summary
  const totalProceedsUsd = dispositions.reduce((s, e) => s + (e.proceedsUsd ?? 0), 0);
  const totalProceeds = dispositions.reduce((s, e) => s + (e.proceedsCad ?? 0), 0);
  const totalAcbSold = dispositions.reduce((s, e) => s + (e.acbOfSharesSoldCad ?? 0), 0);
  const totalExpensesUsd = dispositions.reduce((s, e) => s + e.commissionUsd + e.feeUsd, 0);
  const totalExpenses = dispositions.reduce((s, e) => s + e.sellingExpensesCad, 0);
  const totalGains = dispositions.reduce((s, e) => s + (e.capitalGainCad ?? 0), 0);
  const totalTaxable = dispositions.reduce((s, e) => s + (e.taxableCapitalGainCad ?? 0), 0);

  lines.push('SUMMARY');
  lines.push(hr2);
  lines.push(`Number of dispositions:               ${dispositions.length}`);
  lines.push(`Number of acquisitions:               ${acquisitions.length}`);
  lines.push('');
  lines.push(`Total Proceeds (USD):                 $${totalProceedsUsd.toFixed(2)}`);
  lines.push(`Total Selling Expenses (USD):         $${totalExpensesUsd.toFixed(2)}`);
  lines.push('');
  lines.push(`Total Proceeds of Disposition (CAD):  $${totalProceeds.toFixed(2)}`);
  lines.push(`Total ACB of Shares Sold (CAD):       $${totalAcbSold.toFixed(2)}`);
  lines.push(`Total Selling Expenses (CAD):         $${totalExpenses.toFixed(2)}`);
  lines.push(`Total Capital Gains (CAD):            $${totalGains.toFixed(2)}`);
  lines.push(`Taxable Capital Gains (50%) (CAD):    $${totalTaxable.toFixed(2)}`);
  lines.push('');
  lines.push('Schedule 3, Part 3 - Publicly Traded Shares:');
  lines.push(`  Line 13199 (Proceeds):              $${totalProceeds.toFixed(2)} CAD`);
  lines.push(`  Line 13200 (ACB + Expenses):        $${(totalAcbSold + totalExpenses).toFixed(2)} CAD`);
  lines.push(`  Line 12700 (Taxable Capital Gain):  $${totalTaxable.toFixed(2)} CAD`);
  lines.push('');

  // ACB pool state leading into this year
  const allBeforeYear = entries.filter(
    (e) => parseInt(e.date.substring(0, 4), 10) < year,
  );
  const lastBefore = allBeforeYear.length > 0 ? allBeforeYear[allBeforeYear.length - 1] : null;

  lines.push('ACB POOL STATE AT START OF YEAR');
  lines.push(hr2);
  if (lastBefore) {
    lines.push(`Shares held:     ${lastBefore.sharesHeld}`);
    lines.push(`Total ACB (CAD): $${lastBefore.totalAcbCad.toFixed(2)}`);
    lines.push(`ACB/Share (CAD): $${lastBefore.acbPerShareCad.toFixed(4)}`);
  } else {
    lines.push('No prior transactions - pool starts at zero.');
  }
  lines.push('');

  // Chronological detail of every transaction this year
  lines.push('CHRONOLOGICAL TRANSACTION DETAIL');
  lines.push(hr);
  lines.push('');

  let txNum = 0;
  for (const e of yearEntries) {
    txNum++;
    const isAcquisition = e.type !== 'sell';

    lines.push(`${hr2}`);
    lines.push(`Transaction #${txNum}: ${isAcquisition ? 'ACQUISITION' : 'DISPOSITION'}`);
    lines.push(`${hr2}`);
    lines.push(`Date:        ${e.date}`);
    lines.push(`Type:        ${e.type === 'vest' ? 'RSU Vest' : e.type === 'espp_purchase' ? 'ESPP Purchase' : 'Sale'}`);
    lines.push(`Source:      ${e.source}`);
    lines.push(`Description: ${e.description}`);
    lines.push(`Quantity:    ${e.quantity} shares`);
    lines.push(`USD/CAD:     ${e.exchangeRate.toFixed(4)}`);
    lines.push('');

    if (isAcquisition) {
      lines.push('  Acquisition Calculation:');
      lines.push(`    Price per share (USD):  $${e.pricePerShareUsd.toFixed(4)}`);
      lines.push(`    Total cost (USD):       ${e.quantity} shares x $${e.pricePerShareUsd.toFixed(4)} = $${e.totalUsd.toFixed(2)} USD`);
      lines.push('');
      lines.push(`    USD/CAD rate:           ${e.exchangeRate.toFixed(4)}`);
      lines.push(`    Price per share (CAD):  $${e.pricePerShareUsd.toFixed(4)} x ${e.exchangeRate.toFixed(4)} = $${e.pricePerShareCad.toFixed(4)}`);
      lines.push(`    Cost added to ACB:      $${e.totalUsd.toFixed(2)} x ${e.exchangeRate.toFixed(4)} = $${e.totalCad.toFixed(2)} CAD`);
      lines.push('');
      lines.push('  ACB Pool After This Transaction:');
      lines.push(`    Shares held:     ${e.sharesHeld}`);
      lines.push(`    Total ACB (CAD): $${e.totalAcbCad.toFixed(2)}`);
      lines.push(`    ACB/Share (CAD): $${e.acbPerShareCad.toFixed(4)}`);
    } else {
      // Find the ACB per share BEFORE this sale
      const idx = entries.indexOf(e);
      const prevEntry = idx > 0 ? entries[idx - 1] : null;
      const acbPerShareBefore = prevEntry ? prevEntry.acbPerShareCad : 0;
      const sharesBeforeSale = prevEntry ? prevEntry.sharesHeld : 0;
      const totalAcbBefore = prevEntry ? prevEntry.totalAcbCad : 0;
      const expensesUsd = e.commissionUsd + e.feeUsd;

      lines.push('  ACB Pool Before This Sale:');
      lines.push(`    Shares held:     ${sharesBeforeSale}`);
      lines.push(`    Total ACB (CAD): $${totalAcbBefore.toFixed(2)}`);
      lines.push(`    ACB/Share (CAD): $${acbPerShareBefore.toFixed(4)}`);
      lines.push('');
      lines.push('  Disposition Calculation:');
      lines.push('');
      lines.push(`    Proceeds (USD):`);
      lines.push(`      = ${e.quantity} shares x $${e.pricePerShareUsd.toFixed(4)}/share`);
      lines.push(`      = $${(e.proceedsUsd ?? 0).toFixed(2)} USD`);
      lines.push('');
      lines.push(`    Selling Expenses (USD):`);
      lines.push(`      Commission: $${e.commissionUsd.toFixed(2)}`);
      lines.push(`      Fee:        $${e.feeUsd.toFixed(2)}`);
      lines.push(`      Total:      $${expensesUsd.toFixed(2)} USD`);
      lines.push('');
      lines.push(`    USD/CAD conversion (rate: ${e.exchangeRate.toFixed(4)}):`);
      lines.push('');
      lines.push(`    Proceeds of Disposition (CAD):`);
      lines.push(`      = $${(e.proceedsUsd ?? 0).toFixed(2)} USD x ${e.exchangeRate.toFixed(4)}`);
      lines.push(`      = $${(e.proceedsCad ?? 0).toFixed(2)} CAD`);
      lines.push('');
      lines.push(`    Selling Expenses (CAD):`);
      lines.push(`      = $${expensesUsd.toFixed(2)} USD x ${e.exchangeRate.toFixed(4)}`);
      lines.push(`      = $${e.sellingExpensesCad.toFixed(2)} CAD`);
      lines.push('');
      lines.push(`    ACB of Shares Sold (CAD):`);
      lines.push(`      = ACB/Share x Quantity`);
      lines.push(`      = $${acbPerShareBefore.toFixed(4)} x ${e.quantity}`);
      lines.push(`      = $${(e.acbOfSharesSoldCad ?? 0).toFixed(2)} CAD`);
      lines.push('');
      lines.push(`    Capital Gain (CAD):`);
      lines.push(`      = Proceeds - ACB of Shares Sold - Selling Expenses`);
      lines.push(`      = $${(e.proceedsCad ?? 0).toFixed(2)} - $${(e.acbOfSharesSoldCad ?? 0).toFixed(2)} - $${e.sellingExpensesCad.toFixed(2)}`);
      lines.push(`      = $${(e.capitalGainCad ?? 0).toFixed(2)} CAD`);
      lines.push('');
      lines.push(`    Taxable Capital Gain (50%):`);
      lines.push(`      = $${(e.capitalGainCad ?? 0).toFixed(2)} x 50%`);
      lines.push(`      = $${(e.taxableCapitalGainCad ?? 0).toFixed(2)} CAD`);

      if (e.superficialLossFlag && e.superficialLossDeniedCad != null) {
        const rawLoss = (e.capitalGainCad ?? 0) - e.superficialLossDeniedCad;
        lines.push('');
        lines.push('    *** SUPERFICIAL LOSS ADJUSTMENT (ITA s.40(2)(g)(i)) ***');
        lines.push(`    Raw capital loss:         $${rawLoss.toFixed(2)} CAD`);
        lines.push(`    Denied (added back to ACB): $${e.superficialLossDeniedCad.toFixed(2)} CAD`);
        lines.push(`    Adjusted capital gain:    $${(e.capitalGainCad ?? 0).toFixed(2)} CAD`);
        lines.push('    Identical property was acquired within the 61-day window');
        lines.push('    (30 days before to 30 days after settlement date).');
        lines.push('    The denied amount is added back to the ACB of remaining shares.');
      }

      lines.push('');
      lines.push('  ACB Pool After This Sale:');
      lines.push(`    Shares held:     ${e.sharesHeld}`);
      lines.push(`    Total ACB (CAD): $${e.totalAcbCad.toFixed(2)}`);
      lines.push(`    ACB/Share (CAD): $${e.acbPerShareCad.toFixed(4)}`);
    }
    lines.push('');
  }

  lines.push(hr);
  lines.push('END OF REPORT');
  lines.push(hr);
  lines.push('');
  lines.push('Note: This report is generated for reference purposes only.');
  lines.push('Consult a qualified Canadian tax professional for filing advice.');
  lines.push('All USD amounts converted to CAD using the USD/CAD exchange rate on the transaction date.');
  lines.push('Exchange rates sourced from Bank of Canada Valet API (CRA-compliant).');

  return lines.join('\n');
}

export function exportForAcbTool(entries: AcbEntry[]): string {
  // CSV format per https://github.com/tsiemens/acb/wiki/Transaction-Spreadsheets
  // Exchange rate is left blank so the acb tool does its own Bank of Canada
  // auto-lookup based on trade date, ensuring identical rate resolution.
  const headers = [
    'security',
    'trade date',
    'settlement date',
    'action',
    'shares',
    'amount/share',
    'commission',
    'currency',
    'exchange rate',
    'memo',
  ];

  const rows = entries.map((e) => {
    const action = e.type === 'sell' ? 'Sell' : 'Buy';
    const commission = e.commissionUsd + e.feeUsd;
    const memo = e.description.includes(',') ? `"${e.description}"` : e.description;

    return [
      'ANET',
      e.date,
      e.settlementDate,
      action,
      e.quantity,
      e.pricePerShareUsd,
      commission || '',
      'USD',
      '', // blank = acb tool auto-lookups from Bank of Canada
      memo,
    ];
  });

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function generateTamperMonkeyScript(entries: AcbEntry[], year: number): string {
  const sells = entries.filter(
    (e) => e.type === 'sell' && parseInt(e.date.substring(0, 4), 10) === year,
  );

  const data = sells.map((e) => ({
    description: `ANET ${e.date}`,
    proceeds: (e.proceedsCad ?? 0).toFixed(2),
    costBase: (e.acbOfSharesSoldCad ?? 0).toFixed(2),
    expenses: e.sellingExpensesCad.toFixed(2),
  }));

  return `// ==UserScript==
// @name         WealthSimple Tax Capital Gains Auto-Fill (ANET ${year})
// @namespace    etrade-abc
// @version      1.0
// @description  Auto-fill capital gains from ANET dispositions for tax year ${year}
// @match        *://simpletax.ca/*
// @match        *://app.wealthsimple.com/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  const TRANSACTIONS = ${JSON.stringify(data, null, 2)};

  const FIELD_DELAY = 100;
  const ROW_DELAY = 500;

  let running = false;

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function typeText(text) {
    const el = document.activeElement;
    if (!el) return;
    el.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('insertText', false, text);
  }

  function pressTab() {
    const focusable = Array.from(document.querySelectorAll(
      'input, select, textarea, button, [tabindex]:not([tabindex="-1"]), a[href]'
    )).filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && !el.disabled;
    });
    const idx = focusable.indexOf(document.activeElement);
    if (idx >= 0 && idx < focusable.length - 1) {
      focusable[idx + 1].focus();
    }
  }

  function pressEnter() {
    const el = document.activeElement;
    if (!el) return;
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
    el.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', keyCode: 13, bubbles: true }));
  }

  async function fillRow(tx, isLast) {
    // Type "p" to select "Publicly traded shares..." from dropdown
    typeText('p');
    await sleep(FIELD_DELAY);

    // Tab to Description
    pressTab();
    await sleep(FIELD_DELAY);
    typeText(tx.description);
    await sleep(FIELD_DELAY);

    // Tab to Proceeds
    pressTab();
    await sleep(FIELD_DELAY);
    typeText(tx.proceeds);
    await sleep(FIELD_DELAY);

    // Tab to Cost Base
    pressTab();
    await sleep(FIELD_DELAY);
    typeText(tx.costBase);
    await sleep(FIELD_DELAY);

    // Tab to Expenses
    pressTab();
    await sleep(FIELD_DELAY);
    typeText(tx.expenses);
    await sleep(FIELD_DELAY);

    // Tab past the auto-calculated Gain/Loss field
    pressTab();
    await sleep(FIELD_DELAY);

    if (!isLast) {
      // Enter to create new row
      pressEnter();
      await sleep(ROW_DELAY);
    }
  }

  async function startAutoFill() {
    if (running) return;
    running = true;
    const status = document.getElementById('etrade-abc-status');

    for (let i = 0; i < TRANSACTIONS.length; i++) {
      if (!running) break;
      if (status) status.textContent = 'Row ' + (i + 1) + ' of ' + TRANSACTIONS.length;
      await fillRow(TRANSACTIONS[i], i === TRANSACTIONS.length - 1);
    }

    if (status) status.textContent = running ? 'Done!' : 'Stopped';
    running = false;
  }

  // Create floating control panel
  const panel = document.createElement('div');
  panel.innerHTML = \`
    <div style="position:fixed;top:10px;right:10px;z-index:99999;background:#1e293b;color:#e2e8f0;
                padding:16px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.3);font-family:system-ui;
                font-size:14px;min-width:260px">
      <div style="font-weight:600;margin-bottom:8px">ANET Capital Gains (${year})</div>
      <div style="margin-bottom:8px;font-size:12px;color:#94a3b8">\${TRANSACTIONS.length} transactions to fill</div>
      <div style="display:flex;gap:8px;align-items:center">
        <button id="etrade-abc-start" style="background:#3b82f6;color:white;border:none;padding:6px 16px;
                border-radius:4px;cursor:pointer;font-size:13px">Start Auto-Fill</button>
        <button id="etrade-abc-stop" style="background:#ef4444;color:white;border:none;padding:6px 12px;
                border-radius:4px;cursor:pointer;font-size:13px;display:none">Stop</button>
        <span id="etrade-abc-status" style="font-size:12px;color:#94a3b8"></span>
      </div>
      <div style="margin-top:8px;font-size:11px;color:#64748b">
        Click into the first empty row's Type field, then click Start.
      </div>
    </div>
  \`;
  document.body.appendChild(panel);

  document.getElementById('etrade-abc-start').addEventListener('click', () => {
    document.getElementById('etrade-abc-start').style.display = 'none';
    document.getElementById('etrade-abc-stop').style.display = '';
    startAutoFill().then(() => {
      document.getElementById('etrade-abc-start').style.display = '';
      document.getElementById('etrade-abc-stop').style.display = 'none';
    });
  });

  document.getElementById('etrade-abc-stop').addEventListener('click', () => {
    running = false;
  });
})();
`;
}

