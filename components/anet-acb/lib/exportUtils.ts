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

  // For 2024 tax year, transactions are split into two periods:
  // Period 1: Jan 1 - Jun 24 (fields use _temp suffix)
  // Period 2: Jun 25 - Dec 31 (fields use no suffix)
  const data = sells.map((e) => {
    const month = parseInt(e.date.substring(5, 7), 10);
    const day = parseInt(e.date.substring(8, 10), 10);
    // Period 1 if before June 25
    const period = (month < 6 || (month === 6 && day <= 24)) ? 1 : 2;
    return {
      typeKey: 'p', // Types "p" to select "Publicly traded shares..." in dropdown
      description: `ANET ${e.date}`.substring(0, 30),
      proceeds: (e.proceedsCad ?? 0).toFixed(2),
      costBase: (e.acbOfSharesSoldCad ?? 0).toFixed(2),
      expenses: e.sellingExpensesCad.toFixed(2),
      period,
    };
  });

  return `// ==UserScript==
// @name         WealthSimple Tax Capital Gains Auto-Fill (ANET ${year})
// @namespace    anet-acb
// @version      2.0
// @description  Auto-fill capital gains from ANET dispositions for tax year ${year}
// @match        https://my.wealthsimple.com/*
// @match        https://app.wealthsimple.com/*
// @grant        unsafeWindow
// @run-at       document-idle
// @sandbox      JavaScript
// ==/UserScript==

(function() {
  'use strict';

  const TRANSACTIONS = ${JSON.stringify(data, null, 2)};

  let running = false;

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  var FIELD_DELAY = 0;
  var ROW_DELAY = 0;

  // Type text into an input by emulating real keyboard events per character
  function emulateTyping(el, text) {
    return new Promise(function(resolve) {
      el.focus();
      var chars = String(text).split('');
      var i = 0;
      function typeNext() {
        if (i >= chars.length) {
          log('  typed: "' + text + '" -> value: "' + el.value + '"');
          resolve();
          return;
        }
        var c = chars[i];
        var code = c === '.' ? 'Period' : 'Digit' + c;
        var keyCode = c === '.' ? 190 : (c >= '0' && c <= '9') ? 48 + parseInt(c) : c.charCodeAt(0);

        el.dispatchEvent(new KeyboardEvent('keydown', {key:c, code:code, keyCode:keyCode, which:keyCode, bubbles:true, cancelable:true}));
        el.dispatchEvent(new KeyboardEvent('keypress', {key:c, code:code, keyCode:keyCode, which:keyCode, bubbles:true, cancelable:true}));
        el.dispatchEvent(new InputEvent('beforeinput', {data:c, inputType:'insertText', bubbles:true, cancelable:true}));
        el.dispatchEvent(new InputEvent('input', {data:c, inputType:'insertText', bubbles:true}));
        el.dispatchEvent(new KeyboardEvent('keyup', {key:c, code:code, keyCode:keyCode, which:keyCode, bubbles:true}));

        i++;
        setTimeout(typeNext, 30);
      }
      typeNext();
    });
  }

  // Press Tab to move to next field — scoped to the current row's table
  function pressTab() {
    var el = document.activeElement;
    if (!el) return;

    // Find the containing table so we don't jump outside the Capital Gains section
    var table = el.closest('table[data-son-sub-input]');
    var scope = table || el.closest('form') || document.body;

    // Build list of tabbable elements within the scoped container
    var focusable = Array.from(scope.querySelectorAll(
      'input:not([readonly]):not([type="hidden"]), select, textarea, button, [tabindex]:not([tabindex="-1"])'
    )).filter(function(f) {
      var s = window.getComputedStyle(f);
      return s.display !== 'none' && s.visibility !== 'hidden' && !f.disabled
        && f.offsetParent !== null;
    });
    var idx = focusable.indexOf(el);
    if (idx >= 0 && idx < focusable.length - 1) {
      focusable[idx + 1].focus();
    } else {
      // Last element in scope — look for the Add button right after this table
      log('Tab reached end of table scope, looking for Add button nearby');
    }
  }

  // Press Enter (to create new row after filling last field)
  function pressEnter() {
    var el = document.activeElement;
    if (!el) return;
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
    el.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', keyCode: 13, bubbles: true }));
  }


  // Split transactions by period
  var p1Txns = TRANSACTIONS.filter(function(t) { return t.period === 1; });
  var p2Txns = TRANSACTIONS.filter(function(t) { return t.period === 2; });

  var STEP_DELAY = 0;

  function log(msg) {
    var ae = document.activeElement;
    console.log('[ANET AutoFill] ' + msg);
    console.log('[ANET AutoFill]   activeElement:', ae?.tagName, 'type=' + ae?.type, 'name=' + ae?.name, 'id=' + ae?.id, 'class=' + ae?.className);
  }

  // Find the first empty Type <select> in the period's table
  function findFirstEmptyType(periodNum) {
    var target = periodNum === 1 ? 's3_t_temp' : 's3_t';
    var table = document.querySelector('table[data-son-sub-input="' + target + '"]');
    if (!table) { log('Table not found for target: ' + target); return null; }
    var rows = table.querySelectorAll('tbody > tr[data-son-form]');
    log('Found ' + rows.length + ' rows in ' + target);
    for (var i = 0; i < rows.length; i++) {
      var sel = rows[i].querySelector('td:first-child select');
      if (sel && sel.value === 'None') {
        log('Found empty Type select in row ' + i);
        return sel;
      }
    }
    log('No empty rows found');
    return null;
  }

  // Click "Add another disposition" for the period
  function clickAddButton(periodNum) {
    var target = periodNum === 1 ? 's3_t_temp' : 's3_t';
    var btn = document.querySelector('button.js-add-sub-input[data-son-sub-input-target="' + target + '"]');
    if (btn) { btn.click(); log('Clicked Add button for ' + target); return true; }
    log('Add button not found for ' + target);
    return false;
  }

  async function fillPeriod(periodNum, statusEl) {
    if (running) return;
    running = true;

    var txns = periodNum === 1 ? p1Txns : p2Txns;
    if (txns.length === 0) {
      statusEl.textContent = 'No transactions for Period ' + periodNum + '.';
      running = false;
      return;
    }

    log('=== Starting Period ' + periodNum + ' fill: ' + txns.length + ' transactions ===');

    var filled = 0;
    for (var i = 0; i < txns.length; i++) {
      if (!running) break;
      var tx = txns[i];
      var isLast = (i === txns.length - 1);
      statusEl.textContent = 'Period ' + periodNum + ': ' + (i + 1) + '/' + txns.length + ' — ' + tx.description;

      // Find or create an empty row, then focus its Type select
      var typeSelect = findFirstEmptyType(periodNum);
      if (!typeSelect) {
        log('No empty row — clicking Add');
        clickAddButton(periodNum);
        await sleep(STEP_DELAY);
        typeSelect = findFirstEmptyType(periodNum);
      }
      if (!typeSelect) {
        log('ERROR: Still no empty row after clicking Add');
        statusEl.textContent = 'Error: Could not create row for transaction ' + (i + 1);
        statusEl.style.background = '#dc2626';
        break;
      }

      // Set the Type select value programmatically (execCommand doesn't work on <select>)
      log('Row ' + (i + 1) + ': Setting Type select');
      // Find the "Publicly traded shares..." option by looking for value starting with "p" or containing "public"
      var typeOption = Array.from(typeSelect.options).find(function(opt) {
        return opt.value.toLowerCase().startsWith('p') && opt.value !== '';
      }) || typeSelect.options[1]; // fallback to first non-empty option
      if (typeOption) {
        typeSelect.value = typeOption.value;
        typeSelect.dispatchEvent(new Event('change', { bubbles: true }));
        typeSelect.dispatchEvent(new Event('input', { bubbles: true }));
        log('Row ' + (i + 1) + ': Set Type to "' + typeOption.value + '" (text: ' + typeOption.text + ')');
      } else {
        log('Row ' + (i + 1) + ': WARNING - could not find Type option');
      }
      await sleep(STEP_DELAY);

      // Focus Description — find it directly in the same row instead of relying on Tab
      var row = typeSelect.closest('tr');
      var allInputs = row ? Array.from(row.querySelectorAll('input:not([type="hidden"])')) : [];
      // Filter to only VISIBLE inputs
      var inputs = allInputs.filter(function(el) {
        if (el.offsetParent === null) return false;
        var s = window.getComputedStyle(el);
        if (s.display === 'none' || s.visibility === 'hidden') return false;
        // Also check parent td visibility
        var td = el.closest('td');
        if (td) {
          var ts = window.getComputedStyle(td);
          if (ts.display === 'none') return false;
        }
        return true;
      });
      log('Row ' + (i + 1) + ': Found ' + allInputs.length + ' total inputs, ' + inputs.length + ' visible');
      // Log each visible input for debugging
      inputs.forEach(function(inp, idx) {
        var sonField = inp.getAttribute('data-son-field') || '';
        var ro = inp.readOnly ? ' READONLY' : '';
        log('  input[' + idx + ']: id=' + inp.id + ' type=' + inp.type + ' readonly=' + inp.readOnly + ' son=' + sonField.substring(0, 60));
      });

      // Skip readonly inputs — we want: Description, Proceeds, Cost Base, Expenses
      var editableInputs = inputs.filter(function(el) { return !el.readOnly; });
      log('Row ' + (i + 1) + ': ' + editableInputs.length + ' editable visible inputs');

      if (editableInputs.length < 4) {
        log('Row ' + (i + 1) + ': ERROR - expected at least 4 editable inputs, found ' + editableInputs.length);
      }

      // Description = first editable input
      var descInput = editableInputs[0];
      if (descInput) descInput.focus();
      await sleep(STEP_DELAY);
      // Fill Description (editableInputs[0]) — String type, use execCommand
      log('Row ' + (i + 1) + ': Filling Description = ' + tx.description);
      if (descInput) {
        descInput.focus();
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, tx.description);
      }
      await sleep(FIELD_DELAY);

      // Fill Proceeds (editableInputs[1])
      var proceedsInput = editableInputs[1];
      if (proceedsInput) {
        log('Row ' + (i + 1) + ': Filling Proceeds = ' + tx.proceeds);
        await emulateTyping(proceedsInput, tx.proceeds);
      }
      await sleep(FIELD_DELAY);

      // Fill Cost Base (editableInputs[2])
      var costInput = editableInputs[2];
      if (costInput) {
        log('Row ' + (i + 1) + ': Filling Cost Base = ' + tx.costBase);
        await emulateTyping(costInput, tx.costBase);
      }
      await sleep(FIELD_DELAY);

      // Fill Expenses (editableInputs[3])
      var expInput = editableInputs[3];
      if (expInput) {
        log('Row ' + (i + 1) + ': Filling Expenses = ' + tx.expenses);
        await emulateTyping(expInput, tx.expenses);
      }
      await sleep(FIELD_DELAY);

      log('Row ' + (i + 1) + ': DONE');
      filled++;
    }

    log('=== Finished: ' + filled + '/' + txns.length + ' ===');
    if (filled === txns.length) {
      statusEl.textContent = 'Period ' + periodNum + ' done! ' + filled + '/' + txns.length + ' filled. Review values.';
      statusEl.style.background = '#22c55e';
    } else {
      statusEl.textContent = 'Stopped at ' + filled + '/' + txns.length;
    }
    running = false;
  }

  // ---- Shadow DOM Panel (survives WS page transitions) ----

  function txListHtml(txns) {
    if (txns.length === 0) return '';
    var rows = txns.map(function(t, i) {
      return '<tr><td>' + (i+1) + '</td><td>' + t.description + '</td><td>' + t.proceeds + '</td><td>' + t.costBase + '</td><td>' + t.expenses + '</td></tr>';
    }).join('');
    return '<div class="tx-list" style="display:none"><table>' +
      '<tr><th>#</th><th>Desc</th><th>Proceeds</th><th>ACB</th><th>Exp</th></tr>' +
      rows + '</table></div>';
  }

  var PANEL_ID = 'anet-acb-autofill-host';

  function createPanel() {
    if (document.getElementById(PANEL_ID)) return;

    var host = document.createElement('div');
    host.id = PANEL_ID;
    host.style.cssText = 'position:fixed;top:80px;right:0;z-index:2147483647;width:300px;';
    document.documentElement.appendChild(host);

    var shadow = host.attachShadow({ mode: 'open' });
    var wrapper = document.createElement('div');
    wrapper.innerHTML = [
      '<style>',
      '  :host { all: initial; font-family: system-ui, -apple-system, sans-serif; }',
      '  * { box-sizing: border-box; }',
      '  .panel { background:#1e293b; color:#e2e8f0; padding:16px; border-radius:8px 0 0 8px;',
      '    box-shadow:-4px 4px 16px rgba(0,0,0,0.4); font-size:13px; border:1px solid #334155; border-right:none; }',
      '  .title { font-weight:600; margin-bottom:4px; font-size:15px;',
      '    display:flex; justify-content:space-between; align-items:center; }',
      '  .subtitle { font-size:11px; color:#94a3b8; margin-bottom:10px; }',
      '  .status { margin-bottom:10px; padding:8px; border-radius:6px; background:#334155;',
      '    font-size:12px; min-height:20px; word-break:break-word; }',
      '  .period-section { border:1px solid #475569; border-radius:6px; padding:10px; margin-bottom:8px; }',
      '  .period-title { font-weight:600; font-size:12px; margin-bottom:4px; }',
      '  .period-count { font-size:11px; color:#8b8bff; margin-bottom:6px; cursor:pointer; text-decoration:underline; }',
      '  .period-count:hover { color:#a5a5ff; }',
      '  .period-dates { font-size:10px; color:#64748b; margin-bottom:6px; }',
      '  .tx-list { max-height:200px; overflow-y:auto; font-size:10px; margin:6px 0; border:1px solid #475569; border-radius:4px; }',
      '  .tx-list table { width:100%; border-collapse:collapse; }',
      '  .tx-list th { position:sticky; top:0; background:#334155; padding:3px 4px; text-align:left; color:#94a3b8; }',
      '  .tx-list td { padding:2px 4px; border-top:1px solid #334155; color:#cbd5e1; font-variant-numeric:tabular-nums; }',
      '  button { padding:8px 14px; border-radius:6px; border:none; color:white;',
      '    cursor:pointer; font-size:12px; font-family:inherit; width:100%; margin-bottom:4px; }',
      '  button:hover { opacity:0.85; }',
      '  button:disabled { opacity:0.4; cursor:not-allowed; }',
      '  .btn-p1 { background:#6366f1; font-weight:600; }',
      '  .btn-p2 { background:#22c55e; font-weight:600; }',
      '  .btn-stop { background:#ef4444; }',
      '  .btn-close { background:#475569; font-size:11px; margin-top:4px; }',
      '  .collapse-btn { background:none; color:#888; font-size:18px; padding:0;',
      '    width:auto; margin:0; line-height:1; }',
      '  .hint { font-size:10px; color:#64748b; margin-top:6px; line-height:1.4;',
      '    border-top:1px solid #334155; padding-top:6px; }',
      '  .none { color:#ef4444; font-style:italic; font-size:11px; }',
      '</style>',
      '<div class="panel">',
      '  <div class="title">',
      '    <span>ANET Auto-Fill (${year})</span>',
      '    <button class="collapse-btn" id="collapse-btn">\\u2212</button>',
      '  </div>',
      '  <div class="subtitle">' + TRANSACTIONS.length + ' total dispositions</div>',
      '  <div id="body">',
      '    <div class="status" id="status">Ready \\u2014 select a period to fill</div>',
      '',
      '    <div class="period-section">',
      '      <div class="period-title">Period 1</div>',
      '      <div class="period-dates">Jan 1 \\u2013 Jun 24, ${year}</div>',
      '      <div class="period-count" id="p1-count">' + p1Txns.length + ' transactions (click to view)</div>',
      txListHtml(p1Txns).replace('class="tx-list"', 'class="tx-list" id="p1-list"'),
      p1Txns.length > 0
        ? '      <button class="btn-p1" id="fill-p1-btn">Fill Period 1 (' + p1Txns.length + ')</button>'
        : '      <div class="none">No transactions in this period</div>',
      '    </div>',
      '',
      '    <div class="period-section">',
      '      <div class="period-title">Period 2</div>',
      '      <div class="period-dates">Jun 25 \\u2013 Dec 31, ${year}</div>',
      '      <div class="period-count" id="p2-count">' + p2Txns.length + ' transactions (click to view)</div>',
      txListHtml(p2Txns).replace('class="tx-list"', 'class="tx-list" id="p2-list"'),
      p2Txns.length > 0
        ? '      <button class="btn-p2" id="fill-p2-btn">Fill Period 2 (' + p2Txns.length + ')</button>'
        : '      <div class="none">No transactions in this period</div>',
      '    </div>',
      '',
      '    <button class="btn-stop" id="stop-btn" style="display:none">Stop</button>',
      '    <button class="btn-close" id="close-btn">Close</button>',
      '    <div class="hint">',
      '      1. Add "Capital Gains (or Losses)" to your return.',
      '      2. Click into the first empty Type dropdown in the period you want to fill.',
      '      3. Click the Fill button. The script tabs through fields automatically.',
      '      4. Review all values before submitting.',
      '    </div>',
      '  </div>',
      '</div>',
    ].join('\\n');
    shadow.appendChild(wrapper);

    var statusEl = shadow.getElementById('status');
    var stopBtn = shadow.getElementById('stop-btn');
    var bodyEl = shadow.getElementById('body');
    var collapseBtn = shadow.getElementById('collapse-btn');
    var collapsed = false;

    function runPeriod(periodNum) {
      var allBtns = shadow.querySelectorAll('button');
      allBtns.forEach(function(b) { b.disabled = true; });
      stopBtn.style.display = '';
      stopBtn.disabled = false;
      statusEl.style.background = '#f59e0b';
      fillPeriod(periodNum, statusEl).then(function() {
        allBtns.forEach(function(b) { b.disabled = false; });
        stopBtn.style.display = 'none';
        statusEl.style.background = running ? '#334155' : '#22c55e';
      });
    }

    var p1Btn = shadow.getElementById('fill-p1-btn');
    var p2Btn = shadow.getElementById('fill-p2-btn');
    if (p1Btn) p1Btn.addEventListener('click', function() { runPeriod(1); });
    if (p2Btn) p2Btn.addEventListener('click', function() { runPeriod(2); });

    // Toggle transaction list visibility on count click
    var p1Count = shadow.getElementById('p1-count');
    var p1List = shadow.getElementById('p1-list');
    if (p1Count && p1List) p1Count.addEventListener('click', function() {
      p1List.style.display = p1List.style.display === 'none' ? 'block' : 'none';
    });
    var p2Count = shadow.getElementById('p2-count');
    var p2List = shadow.getElementById('p2-list');
    if (p2Count && p2List) p2Count.addEventListener('click', function() {
      p2List.style.display = p2List.style.display === 'none' ? 'block' : 'none';
    });

    stopBtn.addEventListener('click', function() { running = false; });
    shadow.getElementById('close-btn').addEventListener('click', function() { host.remove(); });
    collapseBtn.addEventListener('click', function() {
      collapsed = !collapsed;
      bodyEl.style.display = collapsed ? 'none' : 'block';
      collapseBtn.textContent = collapsed ? '+' : '\\u2212';
      host.style.width = collapsed ? '180px' : '300px';
    });
  }

  function ensurePanel() {
    if (!document.getElementById(PANEL_ID)) createPanel();
  }

  ensurePanel();
  var observer = new MutationObserver(ensurePanel);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setInterval(ensurePanel, 2000);
})();
`;
}

