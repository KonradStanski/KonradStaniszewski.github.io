(function () {
  "use strict";

  if (window.__tmEtradeAcbToolbarLoaded) {
    return;
  }
  window.__tmEtradeAcbToolbarLoaded = true;

  const SCRIPT_VERSION = "0.16";
  const PREFIX = "[TM-ETrade]";
  let logCount = 0;
  const log = (message, ...args) =>
    console.log(`${PREFIX}[${++logCount}] ${message}`, ...args);
  const warn = (message, ...args) =>
    console.warn(`${PREFIX}[${logCount}] ${message}`, ...args);
  const err = (message, ...args) =>
    console.error(`${PREFIX}[${logCount}] ${message}`, ...args);

  const STYLE_ID = "tm-etrade-styles-b2f0d4";
  const HOST_ID = "tm-etrade-toolbar-b2f0d4";
  const TOOLBAR_HEIGHT = 56;
  const CHECK_INTERVAL_MS = 1000;
  const CLICK_DELAY_MS = 250;
  const CAPTURE_TIMEOUT_MS = 5000;
  const FETCH_DOWNLOAD_DELAY_MS = 650;
  const NATIVE_DOWNLOAD_DELAY_MS = 1400;
  const DOCS_RESULTS_SETTLE_MS = 1200;
  const DOCS_PRE_DOWNLOAD_DELAY_MS = 900;
  const DOCS_SPINNER_TIMEOUT_MS = 20000;

  const STOCK_PLAN_START_DATE = "11/01/04";
  const STOCK_PLAN_HASH = "/myAccount/stockPlanConfirmations";
  const STOCK_PLAN_URL =
    "https://us.etrade.com/etx/sp/stockplan?accountIndex=1&traxui=tsp_accountshome#/myAccount/stockPlanConfirmations";

  const ACCOUNT_DOCS_PATH = "/etx/pxy/accountdocs";
  const ACCOUNT_DOCS_HASH = "/documents";
  const ACCOUNT_DOCS_URL =
    "https://us.etrade.com/etx/pxy/accountdocs#/documents";
  const DOCS_DOCUMENT_TYPE = "Trade Confirmations";

  const SHADOW_STYLES = `
    :host {
      all: initial;
    }

    .tm-toolbar {
      width: 100% !important;
      height: ${TOOLBAR_HEIGHT}px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 12px !important;
      padding: 0 16px !important;
      background: linear-gradient(135deg, #101827, #18263a) !important;
      color: #e5edf5 !important;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35) !important;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
      box-sizing: border-box !important;
    }

    .tm-left,
    .tm-right {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      flex-shrink: 0 !important;
    }

    .tm-center {
      flex: 1 !important;
      min-width: 0 !important;
    }

    .tm-left {
      min-width: 0 !important;
      flex-shrink: 1 !important;
    }

    .tm-nav {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      margin-left: 8px !important;
      flex-shrink: 0 !important;
    }

    .tm-status {
      display: block !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      font-size: 12px !important;
      color: #a8c0d8 !important;
    }

    .tm-title {
      font-weight: 700 !important;
      color: #ffffff !important;
      font-size: 13px !important;
    }

    .tm-dot {
      width: 8px !important;
      height: 8px !important;
      border-radius: 999px !important;
      background: #34d399 !important;
      flex-shrink: 0 !important;
    }

    .tm-dot.active {
      background: #f59e0b !important;
    }

    .tm-page-indicator {
      font-size: 11px !important;
      padding: 3px 8px !important;
      border-radius: 999px !important;
      background: rgba(59, 130, 246, 0.16) !important;
      color: #bfdbfe !important;
    }

    .tm-page-indicator.off-page {
      background: rgba(239, 68, 68, 0.16) !important;
      color: #fecaca !important;
    }

    .tm-btn {
      appearance: none !important;
      border: 1px solid rgba(255, 255, 255, 0.18) !important;
      background: rgba(255, 255, 255, 0.08) !important;
      color: #f8fafc !important;
      border-radius: 6px !important;
      padding: 6px 12px !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
    }

    .tm-btn.primary {
      background: #38bdf8 !important;
      border-color: #38bdf8 !important;
      color: #082032 !important;
    }

    .tm-btn.warn {
      background: #dc2626 !important;
      border-color: #dc2626 !important;
      color: #ffffff !important;
    }

    .tm-btn:disabled {
      opacity: 0.45 !important;
      cursor: not-allowed !important;
    }
  `;

  const STOCK_PLAN_SELECTORS = {
    yearSelect: '[data-test-id="stockplanconf.year"] select',
    benefitTypeSelect: '[data-test-id="stockplanconf.benefittype"] select',
    startDateInput: "#order-start-date",
    endDateInput: "#order-end-date",
    applyButton: 'button[data-test-id="Filter applybtn"]',
    downloadButtons:
      'button[data-test-id="Stockplanconfig.transactiontable.download"]',
  };

  const DOCS_SELECTORS = {
    applyButton: 'button[track-id="allDocuments.applyBtn"]',
    pdfLinks: 'a[track-id="pdfLink.link"]',
    accountSelect:
      'ms-documents-filter[track-id="documentsFilterContainer.account"] mat-select',
    documentTypeSelect:
      'ms-documents-filter[track-id="documentsFilterContainer.documentType"] mat-select',
    timeframeSelect:
      'ms-documents-filter[track-id="documentsFilterContainer.timeframe"] mat-select',
    dropdownCandidates:
      '[role="combobox"], button[aria-haspopup="listbox"], .mat-select-trigger, .mat-mdc-select-trigger',
    dropdownOptions: 'ms-form-dropdown-option, [role="option"], mat-option',
    paginationSelect: "#pagination-selector",
    nextButton: "button.next-button",
    prevButton: "button.prev-button",
  };

  const state = {
    running: false,
    stopRequested: false,
    statusMessage: "Ready",
  };

  let shadowRoot = null;
  let statusEl = null;

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function normalizeText(text) {
    return String(text || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeKey(text) {
    return normalizeText(text).toLowerCase();
  }

  function isAnetStockPlanOption(text) {
    const normalized = normalizeKey(text);
    return normalized.includes("stock plan") && normalized.includes("anet");
  }

  function pickPreferredAnetStockPlanOption(options) {
    const candidates = options.filter(isAnetStockPlanOption);
    if (candidates.length === 0) {
      return null;
    }

    const preferred =
      candidates.find((option) => /\(\s*anet\s*\)/i.test(option)) ||
      candidates.find((option) => /\banet\b/i.test(option));
    return preferred || candidates[0];
  }

  function uniqueTexts(values) {
    return [...new Set(values.filter(Boolean))];
  }

  function isDocsYearOption(text) {
    return /^\d{4}$/.test(normalizeText(text));
  }

  function isDocsRelativeDateOption(text) {
    return /^(last \d+ days?|last 12 months|year to date)$/i.test(
      normalizeText(text),
    );
  }

  function isDocsDocumentTypeOption(text) {
    return /trade confirmations?/i.test(normalizeText(text));
  }

  function isYearToDateOption(text) {
    return normalizeKey(text) === "year to date";
  }

  function getTextFromLabelledByIds(idsValue) {
    return uniqueTexts(
      String(idsValue || "")
        .split(/\s+/)
        .map((id) => document.getElementById(id))
        .filter(Boolean)
        .map((element) => normalizeText(element.textContent)),
    ).join(" ");
  }

  function getDocsTriggerLabelText(trigger) {
    if (!trigger) {
      return "";
    }

    const texts = [];
    const pushText = (value) => {
      const normalized = normalizeText(value);
      if (normalized) {
        texts.push(normalized);
      }
    };

    const control =
      trigger.matches?.('[role="combobox"], [aria-haspopup="listbox"]')
        ? trigger
        : trigger.querySelector?.('[role="combobox"], [aria-haspopup="listbox"]');

    pushText(trigger.getAttribute?.("aria-label"));
    pushText(getTextFromLabelledByIds(trigger.getAttribute?.("aria-labelledby")));
    pushText(control?.getAttribute?.("aria-label"));
    pushText(getTextFromLabelledByIds(control?.getAttribute?.("aria-labelledby")));

    const fieldContainer =
      trigger.closest?.(
        [
          '[class*="filter"]',
          '[class*="dropdown"]',
          '[class*="select"]',
          ".mat-form-field",
        ].join(", "),
      ) || trigger.parentElement;

    if (fieldContainer) {
      pushText(fieldContainer.querySelector?.("label")?.textContent);
      pushText(
        fieldContainer.querySelector?.('[id^="ms-form-dropdown-label-"]')
          ?.textContent,
      );
    }

    return uniqueTexts(texts).join(" | ");
  }

  function isVisible(element) {
    if (!element) return false;
    const style = window.getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") {
      return false;
    }
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function checkStop() {
    if (state.stopRequested) {
      throw new Error("Stopped by user");
    }
  }

  function updateStatus(message) {
    state.statusMessage = message;
    if (statusEl) {
      statusEl.textContent = message;
    }
    log(`Status: ${message}`);
  }

  function isOnStockPlanPage() {
    return location.hash.includes(STOCK_PLAN_HASH);
  }

  function isOnAccountDocsPage() {
    return (
      location.pathname.includes(ACCOUNT_DOCS_PATH) &&
      location.hash.includes(ACCOUNT_DOCS_HASH)
    );
  }

  function getCurrentPageKind() {
    if (isOnStockPlanPage()) return "stock-plan";
    if (isOnAccountDocsPage()) return "account-docs";
    return "other";
  }

  function getCurrentPageLabel() {
    const pageKind = getCurrentPageKind();
    if (pageKind === "stock-plan") return "Stock Plan";
    if (pageKind === "account-docs") return "Trade Docs";
    return "Other Page";
  }

  function formatShortDate(date) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    return `${month}/${day}/${year}`;
  }

  function getCurrentFullYear() {
    return String(new Date().getFullYear());
  }

  function getDocsSelectionFileYear(selection) {
    const normalized = normalizeText(selection);
    if (isYearToDateOption(normalized)) {
      return getCurrentFullYear();
    }
    return /^\d{4}$/.test(normalized)
      ? normalized
      : normalized.replace(/[^a-zA-Z0-9._-]+/g, "_");
  }

  function getDocsSelectionStatusLabel(selection) {
    return normalizeText(selection);
  }

  function scrollIntoViewIfNeeded(element) {
    if (!element || !element.scrollIntoView) return;
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function realClick(element) {
    if (!element) return;
    scrollIntoViewIfNeeded(element);
    element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    element.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }

  async function clickAndWait(element, delayMs = CLICK_DELAY_MS) {
    realClick(element);
    await sleep(delayMs);
  }

  function activateDropdownTarget(element) {
    if (!element) return;
    scrollIntoViewIfNeeded(element);
    if (typeof element.focus === "function") {
      element.focus({ preventScroll: true });
    }
    element.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        cancelable: true,
        composed: true,
        pointerId: 1,
        pointerType: "mouse",
        isPrimary: true,
      }),
    );
    element.dispatchEvent(
      new MouseEvent("mousedown", {
        bubbles: true,
        cancelable: true,
        composed: true,
      }),
    );
    element.dispatchEvent(
      new PointerEvent("pointerup", {
        bubbles: true,
        cancelable: true,
        composed: true,
        pointerId: 1,
        pointerType: "mouse",
        isPrimary: true,
      }),
    );
    element.dispatchEvent(
      new MouseEvent("mouseup", {
        bubbles: true,
        cancelable: true,
        composed: true,
      }),
    );
    if (typeof element.click === "function") {
      element.click();
    } else {
      element.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          composed: true,
        }),
      );
    }
  }

  function setValue(element, value) {
    const prototype =
      element instanceof HTMLSelectElement
        ? HTMLSelectElement.prototype
        : HTMLInputElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
    if (!descriptor || typeof descriptor.set !== "function") {
      element.value = value;
    } else {
      descriptor.set.call(element, value);
    }
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
    element.dispatchEvent(new Event("blur", { bubbles: true }));
  }

  function isButtonDisabled(button) {
    if (!button) return true;
    return (
      button.disabled ||
      button.getAttribute("disabled") !== null ||
      button.getAttribute("aria-disabled") === "true" ||
      normalizeKey(button.className).includes("disabled")
    );
  }

  function makeAbsoluteUrl(url) {
    try {
      return new URL(url, location.origin).toString();
    } catch (_error) {
      return null;
    }
  }

  function filenameFromUrl(url) {
    if (!url) return null;
    try {
      const parsed = new URL(url, location.origin);
      const lastPart = parsed.pathname.split("/").filter(Boolean).pop();
      return lastPart || null;
    } catch (_error) {
      return null;
    }
  }

  function parseFilename(contentDisposition) {
    if (!contentDisposition) return null;
    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match) {
      return decodeURIComponent(utf8Match[1]);
    }
    const plainMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
    return plainMatch ? plainMatch[1] : null;
  }

  function saveBlob(blob, filename) {
    const blobUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = filename || "etrade-document.pdf";
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(blobUrl);
  }

  async function downloadPdf(url, fallbackName) {
    const response = await fetch(url, { credentials: "include" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const filename =
      parseFilename(response.headers.get("content-disposition")) ||
      fallbackName ||
      filenameFromUrl(response.url) ||
      "etrade-document.pdf";
    const blob = await response.blob();
    saveBlob(blob, filename);
    return filename;
  }

  function queryAllDeep(selector, root = document) {
    const results = [];
    const seen = new Set();

    function visit(node) {
      if (!node || seen.has(node) || typeof node.querySelectorAll !== "function") {
        return;
      }
      seen.add(node);
      results.push(...Array.from(node.querySelectorAll(selector)));
      const elements = node.querySelectorAll("*");
      for (const element of elements) {
        if (element.shadowRoot) {
          visit(element.shadowRoot);
        }
      }
    }

    visit(root);
    return results;
  }

  function getVisibleDocsSpinnerElements() {
    return Array.from(
      document.querySelectorAll(".et-spinner, .ms-fullscreen-spinner__focus"),
    ).filter((element) => isVisible(element));
  }

  async function waitFor(getValue, options = {}) {
    const timeoutMs = options.timeoutMs || 15000;
    const intervalMs = options.intervalMs || 100;
    const label = options.label || "condition";
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      checkStop();
      const value = getValue();
      if (value) {
        return value;
      }
      await sleep(intervalMs);
    }

    throw new Error(`Timed out waiting for ${label}`);
  }

  async function waitForStableCount(getCount, options = {}) {
    const timeoutMs = options.timeoutMs || 15000;
    const intervalMs = options.intervalMs || 150;
    const stableMs = options.stableMs || 600;
    const minCount = options.minCount || 0;
    const label = options.label || "stable count";
    const startedAt = Date.now();
    let lastCount = -1;
    let stableSince = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      checkStop();
      const count = getCount();
      if (count !== lastCount) {
        lastCount = count;
        stableSince = Date.now();
      }
      if (count >= minCount && Date.now() - stableSince >= stableMs) {
        return count;
      }
      await sleep(intervalMs);
    }

    warn(`Timed out waiting for ${label}`);
    return getCount();
  }

  async function captureDownloadFromClick(element, index) {
    return new Promise((resolve) => {
      let finished = false;
      const originalOpen = window.open;
      const originalFetch = window.fetch.bind(window);
      const originalXHROpen = XMLHttpRequest.prototype.open;
      const originalXHRSend = XMLHttpRequest.prototype.send;
      const originalAnchorClick = HTMLAnchorElement.prototype.click;
      const originalAnchorDispatchEvent = HTMLAnchorElement.prototype.dispatchEvent;
      const originalCreateObjectURL = URL.createObjectURL.bind(URL);

      const cleanup = () => {
        window.open = originalOpen;
        window.fetch = originalFetch;
        XMLHttpRequest.prototype.open = originalXHROpen;
        XMLHttpRequest.prototype.send = originalXHRSend;
        HTMLAnchorElement.prototype.click = originalAnchorClick;
        HTMLAnchorElement.prototype.dispatchEvent = originalAnchorDispatchEvent;
        URL.createObjectURL = originalCreateObjectURL;
        document.removeEventListener("click", anchorListener, true);
      };

      const finish = (result) => {
        if (finished) return;
        finished = true;
        cleanup();
        resolve(result);
      };

      const finishWithUrl = (url) => {
        const absoluteUrl = makeAbsoluteUrl(url);
        if (!absoluteUrl || absoluteUrl.startsWith("javascript:")) {
          return;
        }
        finish({
          mode: "captured-url",
          index,
          url: absoluteUrl,
          blob: null,
          filename: null,
        });
      };

      const finishWithBlob = (blob, filename, url) => {
        if (!(blob instanceof Blob) || blob.size === 0) {
          return;
        }
        finish({
          mode: "captured-blob",
          index,
          url: url ? makeAbsoluteUrl(url) : null,
          blob: blob.slice(0, blob.size, blob.type),
          filename: filename || null,
        });
      };

      const maybeCaptureResponse = (response) => {
        try {
          const contentType = response.headers.get("content-type") || "";
          const contentDisposition =
            response.headers.get("content-disposition") || "";
          const url = response.url || "";
          const looksLikePdf =
            /pdf/i.test(contentType) ||
            /\.pdf($|\?)/i.test(url) ||
            /filename=.*\.pdf/i.test(contentDisposition);

          if (!looksLikePdf) {
            return;
          }

          response
            .clone()
            .blob()
            .then((blob) =>
              finishWithBlob(
                blob,
                parseFilename(contentDisposition) || filenameFromUrl(url),
                url,
              ),
            )
            .catch((error) => {
              warn("Failed to clone PDF response:", error);
            });
        } catch (error) {
          warn("Failed to inspect fetch response:", error);
        }
      };

      const anchorListener = (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const anchor = target.closest("a[href]");
        if (!anchor) return;
        const href = anchor.getAttribute("href") || anchor.href || "";
        if (!href || href.startsWith("javascript:")) {
          return;
        }
        finishWithUrl(href);
      };

      window.open = function (url, ...args) {
        if (typeof url === "string" && url.length > 0) {
          finishWithUrl(url);
          return null;
        }
        return originalOpen.call(this, url, ...args);
      };

      window.fetch = async function (...args) {
        const response = await originalFetch(...args);
        maybeCaptureResponse(response);
        return response;
      };

      XMLHttpRequest.prototype.open = function (method, url, ...args) {
        this.__tmCaptureUrl = typeof url === "string" ? url : "";
        return originalXHROpen.call(this, method, url, ...args);
      };

      XMLHttpRequest.prototype.send = function (...args) {
        const xhr = this;
        const maybeCaptureXhr = () => {
          try {
            if (xhr.readyState !== 4) {
              return;
            }
            const contentType = xhr.getResponseHeader("content-type") || "";
            const contentDisposition =
              xhr.getResponseHeader("content-disposition") || "";
            const url = xhr.responseURL || xhr.__tmCaptureUrl || "";
            const looksLikePdf =
              /pdf/i.test(contentType) ||
              /\.pdf($|\?)/i.test(url) ||
              /filename=.*\.pdf/i.test(contentDisposition);
            if (!looksLikePdf) {
              return;
            }

            if (xhr.response instanceof Blob) {
              finishWithBlob(
                xhr.response,
                parseFilename(contentDisposition) || filenameFromUrl(url),
                url,
              );
              return;
            }

            if (xhr.response instanceof ArrayBuffer) {
              finishWithBlob(
                new Blob([xhr.response], {
                  type: contentType || "application/pdf",
                }),
                parseFilename(contentDisposition) || filenameFromUrl(url),
                url,
              );
            }
          } catch (error) {
            warn("Failed to inspect XHR PDF response:", error);
          }
        };

        xhr.addEventListener("load", maybeCaptureXhr);
        xhr.addEventListener("readystatechange", maybeCaptureXhr);
        return originalXHRSend.apply(this, args);
      };

      HTMLAnchorElement.prototype.click = function (...args) {
        const href = this.getAttribute("href") || this.href || "";
        if (href && !href.startsWith("javascript:")) {
          if (!href.startsWith("blob:")) {
            finishWithUrl(href);
          }
        }
        return originalAnchorClick.apply(this, args);
      };

      HTMLAnchorElement.prototype.dispatchEvent = function (event) {
        const href = this.getAttribute("href") || this.href || "";
        if (
          event &&
          event.type === "click" &&
          href &&
          !href.startsWith("javascript:")
        ) {
          if (!href.startsWith("blob:")) {
            finishWithUrl(href);
          }
        }
        return originalAnchorDispatchEvent.call(this, event);
      };

      URL.createObjectURL = function (object) {
        const objectUrl = originalCreateObjectURL(object);
        if (object instanceof Blob && /pdf/i.test(object.type || "")) {
          finishWithBlob(object, null, objectUrl);
        }
        return objectUrl;
      };

      document.addEventListener("click", anchorListener, true);

      realClick(element);
      setTimeout(
        () =>
          finish({
            mode: "native",
            index,
            url: null,
            blob: null,
            filename: null,
          }),
        CAPTURE_TIMEOUT_MS,
      );
    });
  }

  async function handleCapturedDownload(result, fallbackName) {
    if (result.blob) {
      const filename = result.filename || fallbackName || "etrade-document.pdf";
      saveBlob(result.blob, filename);
      return filename;
    }

    if (result.url && !result.url.startsWith("blob:")) {
      return downloadPdf(result.url, fallbackName);
    }

    return null;
  }

  async function waitForDocsSpinnerToClear(contextLabel) {
    await waitFor(
      () =>
        getVisibleDocsSpinnerElements().length === 0 ? true : null,
      {
        timeoutMs: DOCS_SPINNER_TIMEOUT_MS,
        intervalMs: 150,
        label: `documents spinner to clear for ${contextLabel}`,
      },
    );
    await sleep(300);
  }

  function getStockPlanDownloadButtons() {
    return Array.from(
      document.querySelectorAll(STOCK_PLAN_SELECTORS.downloadButtons),
    ).filter((button) => isVisible(button));
  }

  function findVisibleButtonByText(text) {
    const buttons = Array.from(document.querySelectorAll("button"));
    return (
      buttons.find(
        (button) => isVisible(button) && normalizeText(button.textContent) === text,
      ) || null
    );
  }

  async function waitForStableStockPlanButtons() {
    await waitForStableCount(() => getStockPlanDownloadButtons().length, {
      minCount: 1,
      label: "stock plan download buttons",
    });
    return getStockPlanDownloadButtons();
  }

  async function prepareStockPlanFilters() {
    if (!isOnStockPlanPage()) {
      throw new Error("Navigate to Stock Plan Confirmations first");
    }

    updateStatus("Waiting for stock plan filters...");

    const yearSelect = await waitFor(
      () => document.querySelector(STOCK_PLAN_SELECTORS.yearSelect),
      { label: "stock plan year filter" },
    );
    const benefitTypeSelect = await waitFor(
      () => document.querySelector(STOCK_PLAN_SELECTORS.benefitTypeSelect),
      { label: "stock plan benefit type filter" },
    );

    updateStatus("Setting year to Custom...");
    setValue(yearSelect, "Custom");
    await sleep(250);

    const startDateInput = await waitFor(
      () => document.querySelector(STOCK_PLAN_SELECTORS.startDateInput),
      { label: "stock plan start date" },
    );
    const endDateInput = await waitFor(
      () => document.querySelector(STOCK_PLAN_SELECTORS.endDateInput),
      { label: "stock plan end date" },
    );

    updateStatus("Setting benefit type to All...");
    setValue(benefitTypeSelect, "All");

    updateStatus(
      `Setting date range to ${STOCK_PLAN_START_DATE} through ${formatShortDate(
        new Date(),
      )}...`,
    );
    setValue(startDateInput, STOCK_PLAN_START_DATE);
    setValue(endDateInput, formatShortDate(new Date()));
    await sleep(250);
    checkStop();

    const applyButton = await waitFor(
      () => document.querySelector(STOCK_PLAN_SELECTORS.applyButton),
      { label: "stock plan Apply button" },
    );

    updateStatus("Applying stock plan filters...");
    await clickAndWait(applyButton, 400);
    await waitFor(
      () =>
        getStockPlanDownloadButtons().length > 0 ||
        findVisibleButtonByText("View All"),
      { label: "stock plan results" },
    );
  }

  async function expandStockPlanViewAll() {
    let button = findVisibleButtonByText("View All");
    let attempts = 0;

    while (button && attempts < 3) {
      attempts += 1;
      const beforeCount = getStockPlanDownloadButtons().length;
      updateStatus(`Clicking View All (${beforeCount} visible so far)...`);
      await clickAndWait(button, 350);
      await waitForStableStockPlanButtons();
      const afterCount = getStockPlanDownloadButtons().length;
      log(`Stock plan View All attempt ${attempts}: ${beforeCount} -> ${afterCount}`);
      if (afterCount <= beforeCount) {
        break;
      }
      button = findVisibleButtonByText("View All");
    }
  }

  function buildStockPlanFallbackFilename(button, index) {
    const row = button.closest("tr");
    const rowText = row ? normalizeText(row.textContent) : "";
    const safeRowText = rowText
      .replace(/[^a-zA-Z0-9._-]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 80);
    const prefix = safeRowText || "stock_plan_confirmation";
    return `etrade_${prefix}_${String(index).padStart(2, "0")}.pdf`;
  }

  async function prepareStockPlanOnly() {
    await prepareStockPlanFilters();
    updateStatus("Waiting for stock plan rows...");
    await waitForStableStockPlanButtons();
    await expandStockPlanViewAll();
    const count = getStockPlanDownloadButtons().length;
    updateStatus(`Ready: ${count} stock plan PDFs visible.`);
  }

  async function downloadAllStockPlanPdfs() {
    await prepareStockPlanFilters();
    updateStatus("Loading all stock plan rows...");
    await waitForStableStockPlanButtons();
    await expandStockPlanViewAll();

    const buttons = getStockPlanDownloadButtons();
    if (buttons.length === 0) {
      throw new Error("No stock plan download buttons found");
    }

    let capturedDownloads = 0;
    let nativeDownloads = 0;

    for (let index = 0; index < buttons.length; index += 1) {
      checkStop();
      const button = buttons[index];
      const sequence = index + 1;
      updateStatus(`Stock plan ${sequence}/${buttons.length}...`);
      const fallbackName = buildStockPlanFallbackFilename(button, sequence);
      const result = await captureDownloadFromClick(button, sequence);
      const handledFilename = await handleCapturedDownload(result, fallbackName);

      if (handledFilename) {
        capturedDownloads += 1;
        log(
          `Stock plan captured download ${sequence}/${buttons.length}: ${handledFilename}`,
        );
      } else {
        nativeDownloads += 1;
        log(`Stock plan native download triggered for row ${sequence}`);
      }

      await sleep(NATIVE_DOWNLOAD_DELAY_MS);
    }

    updateStatus(
      `Done: ${buttons.length} stock plan PDFs (${capturedDownloads} captured, ${nativeDownloads} native).`,
    );
  }

  function getVisibleDocsDropdownOptions() {
    return Array.from(document.querySelectorAll(DOCS_SELECTORS.dropdownOptions)).filter(
      (option) => isVisible(option) && normalizeText(option.textContent),
    );
  }

  function getDocsApplyButton() {
    const tracked = Array.from(
      document.querySelectorAll(DOCS_SELECTORS.applyButton),
    ).find((button) => isVisible(button));
    if (tracked) return tracked;
    return Array.from(document.querySelectorAll("button")).find(
      (button) => isVisible(button) && normalizeText(button.textContent) === "Apply",
    );
  }

  function getDocsFilterRoot() {
    const applyButton = getDocsApplyButton();
    if (!applyButton) return document.body;

    let current = applyButton.parentElement;
    while (current && current !== document.body) {
      const triggers = Array.from(
        current.querySelectorAll(DOCS_SELECTORS.dropdownCandidates),
      ).filter((trigger) => isVisible(trigger));
      if (triggers.length >= 3) {
        return current;
      }
      current = current.parentElement;
    }

    return document.body;
  }

  function getDocsDropdownTriggers(root = getDocsFilterRoot()) {
    const seen = new Set();
    return Array.from(root.querySelectorAll(DOCS_SELECTORS.dropdownCandidates))
      .map(
        (trigger) =>
          trigger.closest('[role="combobox"]') ||
          trigger.closest('[aria-haspopup="listbox"]') ||
          trigger,
      )
      .filter((trigger) => {
        if (!trigger || !isVisible(trigger) || seen.has(trigger)) {
          return false;
        }
        seen.add(trigger);
        return true;
      })
      .sort((left, right) => {
        const leftRect = left.getBoundingClientRect();
        const rightRect = right.getBoundingClientRect();
        if (Math.abs(leftRect.top - rightRect.top) > 8) {
          return leftRect.top - rightRect.top;
        }
        return leftRect.left - rightRect.left;
      });
  }

  function getVisibleDocsMatSelect(selector) {
    return Array.from(document.querySelectorAll(selector)).find((element) =>
      isVisible(element),
    );
  }

  function getDeterministicDocsDropdowns() {
    const account = getVisibleDocsMatSelect(DOCS_SELECTORS.accountSelect);
    const documentType = getVisibleDocsMatSelect(DOCS_SELECTORS.documentTypeSelect);
    const year = getVisibleDocsMatSelect(DOCS_SELECTORS.timeframeSelect);
    if (!account || !documentType || !year) {
      return null;
    }
    return {
      account,
      documentType,
      year,
      debug: [
        {
          source: "direct-selector",
          key: "account",
          triggerText: getTriggerDisplayText(account),
          labelText: getDocsTriggerLabelText(account),
        },
        {
          source: "direct-selector",
          key: "documentType",
          triggerText: getTriggerDisplayText(documentType),
          labelText: getDocsTriggerLabelText(documentType),
        },
        {
          source: "direct-selector",
          key: "year",
          triggerText: getTriggerDisplayText(year),
          labelText: getDocsTriggerLabelText(year),
        },
      ],
      source: "direct-selectors",
    };
  }

  function getDocsDropdownOpenTargets(trigger) {
    const targets = [];
    const seen = new Set();
    const pushTarget = (candidate) => {
      if (
        !candidate ||
        !(candidate instanceof Element) ||
        !isVisible(candidate) ||
        seen.has(candidate)
      ) {
        return;
      }
      seen.add(candidate);
      targets.push(candidate);
    };

    let current = trigger;
    for (let depth = 0; current && depth < 5; depth += 1) {
      pushTarget(current);
      pushTarget(current.querySelector?.(".mat-select-trigger"));
      pushTarget(current.querySelector?.(".mat-mdc-select-trigger"));
      pushTarget(current.querySelector?.('[role="combobox"]'));
      pushTarget(current.querySelector?.('[aria-haspopup="listbox"]'));
      current = current.parentElement;
    }

    const rect = trigger.getBoundingClientRect();
    const centerX = Math.round(rect.left + rect.width / 2);
    const centerY = Math.round(rect.top + rect.height / 2);
    const pointTarget = document.elementFromPoint(centerX, centerY);
    if (pointTarget instanceof Element) {
      pushTarget(pointTarget);
      pushTarget(pointTarget.closest('[role="combobox"]'));
      pushTarget(pointTarget.closest('[aria-haspopup="listbox"]'));
      pushTarget(pointTarget.closest(".mat-select-trigger"));
      pushTarget(pointTarget.closest(".mat-mdc-select-trigger"));
    }

    return targets;
  }

  function getTriggerDisplayText(trigger) {
    return normalizeText(trigger && trigger.textContent);
  }

  function getDocsDropdownControl(trigger) {
    if (!trigger) {
      return null;
    }
    if (trigger.matches?.("mat-select")) {
      return trigger;
    }
    return (
      trigger.closest?.("mat-select") ||
      trigger.querySelector?.("mat-select") ||
      trigger
    );
  }

  function getDocsDropdownPanel(control) {
    const ids = uniqueTexts(
      String(
        control?.getAttribute?.("aria-controls") ||
          control?.closest?.("mat-select")?.getAttribute?.("aria-controls") ||
          "",
      )
        .split(/\s+/)
        .map((value) => value.trim()),
    );
    for (const id of ids) {
      const panel = document.getElementById(id);
      if (panel) {
        return panel;
      }
    }
    return null;
  }

  async function closeDropdown(trigger) {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    document.dispatchEvent(
      new KeyboardEvent("keyup", { key: "Escape", bubbles: true }),
    );
    await sleep(120);
    if (getVisibleDocsDropdownOptions().length > 0 && trigger) {
      realClick(trigger);
      await sleep(120);
    }
  }

  async function openDropdown(trigger, label) {
    const control = getDocsDropdownControl(trigger);
    const preferredTrigger =
      control?.querySelector?.(".mat-select-trigger") ||
      control?.closest?.("mat-form-field")?.querySelector?.(".mat-select-trigger") ||
      null;
    const targets = [
      preferredTrigger,
      control,
      ...getDocsDropdownOpenTargets(trigger),
    ].filter(Boolean);

    for (const target of targets) {
      await closeDropdown(null);
      activateDropdownTarget(target);
      await sleep(220);
      try {
        return await waitFor(
          () => {
            const panel = getDocsDropdownPanel(control);
            const options = getVisibleDocsDropdownOptions();
            if (panel && isVisible(panel) && options.length > 0) {
              return options;
            }
            if (control?.getAttribute?.("aria-expanded") === "true" && options.length > 0) {
              return options;
            }
            return null;
          },
          {
            timeoutMs: 2500,
            intervalMs: 80,
            label: label || "documents dropdown options",
          },
        );
      } catch (_error) {
        await closeDropdown(null);
      }
    }

    throw new Error(
      `Timed out opening documents dropdown for ${getTriggerDisplayText(trigger) || "unknown trigger"}`,
    );
  }

  async function inspectDocsDropdownTrigger(trigger) {
    const options = await openDropdown(trigger, "documents dropdown inspection");
    const optionTexts = uniqueTexts(
      options.map((option) => normalizeText(option.textContent)),
    );
    await closeDropdown(trigger);
    return optionTexts;
  }

  async function identifyDocsDropdowns() {
    const deterministic = getDeterministicDocsDropdowns();
    if (deterministic) {
      return deterministic;
    }

    const triggers = getDocsDropdownTriggers();
    const debug = [];
    const mapping = {
      account: null,
      documentType: null,
      year: null,
    };

    for (const trigger of triggers) {
      checkStop();
      const labelText = getDocsTriggerLabelText(trigger);
      const normalizedLabel = normalizeKey(labelText);

      if (!mapping.account && /\baccounts?\b/.test(normalizedLabel)) {
        mapping.account = trigger;
      }
      if (
        !mapping.documentType &&
        /\bdocuments?\b/.test(normalizedLabel)
      ) {
        mapping.documentType = trigger;
      }
      if (
        !mapping.year &&
        /\b(date|time|range|period)\b/.test(normalizedLabel)
      ) {
        mapping.year = trigger;
      }

      let optionTexts = [];
      let inspectError = null;
      try {
        optionTexts = await inspectDocsDropdownTrigger(trigger);
      } catch (error) {
        inspectError = error instanceof Error ? error.message : String(error);
      }

      debug.push({
        triggerText: getTriggerDisplayText(trigger),
        labelText,
        optionTexts,
        inspectError,
      });

      if (inspectError) {
        continue;
      }

      const normalizedOptions = optionTexts.map(normalizeKey);
      if (
        !mapping.account &&
        optionTexts.some(isAnetStockPlanOption)
      ) {
        mapping.account = trigger;
        continue;
      }

      if (
        !mapping.documentType &&
        (optionTexts.some(isDocsDocumentTypeOption) ||
          normalizedOptions.includes(normalizeKey(DOCS_DOCUMENT_TYPE))
        )
      ) {
        mapping.documentType = trigger;
        continue;
      }

      if (
        !mapping.year &&
        optionTexts.some(
          (text) => isDocsYearOption(text) || isDocsRelativeDateOption(text),
        )
      ) {
        mapping.year = trigger;
      }

      if (mapping.account && mapping.documentType && mapping.year) {
        break;
      }
    }

    if (triggers.length >= 3) {
      const assigned = new Set(
        [mapping.account, mapping.documentType, mapping.year].filter(Boolean),
      );
      if (!mapping.account && !assigned.has(triggers[0])) {
        mapping.account = triggers[0];
        assigned.add(triggers[0]);
      }
      if (!mapping.documentType && !assigned.has(triggers[1])) {
        mapping.documentType = triggers[1];
        assigned.add(triggers[1]);
      }
      if (!mapping.year && !assigned.has(triggers[2])) {
        mapping.year = triggers[2];
        assigned.add(triggers[2]);
      }
    }

    if (!mapping.account || !mapping.documentType || !mapping.year) {
      if (triggers.length >= 3) {
        const orderedFallback = {
          account: triggers[0],
          documentType: triggers[1],
          year: triggers[2],
          debug,
          usedOrderedFallback: true,
        };
        warn(
          "Using ordered documents dropdown fallback:",
          orderedFallback.debug.map((entry) => ({
            triggerText: entry.triggerText,
            labelText: entry.labelText,
          })),
        );
        return orderedFallback;
      }
    }

    if (!mapping.account || !mapping.documentType || !mapping.year) {
      err("Documents dropdown detection failed:", debug);
      throw new Error("Could not identify all account documents filters");
    }

    return { ...mapping, debug };
  }

  async function selectDropdownOptionByText(trigger, targetText) {
    const desiredText = normalizeText(targetText);
    if (!desiredText) return false;

    if (normalizeKey(getTriggerDisplayText(trigger)).includes(normalizeKey(desiredText))) {
      log(`Dropdown already set to ${desiredText}`);
      return false;
    }

    const options = await openDropdown(trigger, `dropdown option ${desiredText}`);
    const targetOption =
      options.find(
        (option) => normalizeKey(option.textContent) === normalizeKey(desiredText),
      ) ||
      options.find((option) =>
        normalizeKey(option.textContent).includes(normalizeKey(desiredText)),
      );

    if (!targetOption) {
      await closeDropdown(trigger);
      throw new Error(`Could not find dropdown option "${desiredText}"`);
    }

    await clickAndWait(targetOption, 200);
    await sleep(120);
    return true;
  }

  async function selectDocsAnetAccount(trigger) {
    const currentText = getTriggerDisplayText(trigger);
    if (isAnetStockPlanOption(currentText)) {
      log(`Documents account already set to ${currentText}`);
      return {
        changed: false,
        selectedText: currentText,
      };
    }

    const options = await openDropdown(trigger, "ANET stock plan account options");
    const optionTexts = uniqueTexts(options.map((option) => normalizeText(option.textContent)));
    const targetText = pickPreferredAnetStockPlanOption(optionTexts);
    if (!targetText) {
      await closeDropdown(trigger);
      throw new Error("Could not find an ANET stock plan account option");
    }

    const targetOption = options.find(
      (option) => normalizeKey(option.textContent) === normalizeKey(targetText),
    );
    if (!targetOption) {
      await closeDropdown(trigger);
      throw new Error(`Could not activate ANET stock plan option "${targetText}"`);
    }

    await clickAndWait(targetOption, 200);
    await sleep(120);
    log(`Selected documents account: ${targetText}`);
    return {
      changed: true,
      selectedText: targetText,
    };
  }

  async function collectDocsYears(yearTrigger) {
    const options = await openDropdown(yearTrigger, "documents year options");
    const optionTexts = uniqueTexts(
      options.map((option) => normalizeText(option.textContent)),
    );
    const currentYear = getCurrentFullYear();
    const years = optionTexts
      .filter((text) => isDocsYearOption(text))
      .sort((left, right) => Number(right) - Number(left));
    const selections = [];
    if (optionTexts.some(isYearToDateOption)) {
      selections.push("Year To Date");
    }
    selections.push(
      ...years.filter(
        (year) =>
          !selections.some(isYearToDateOption) || year !== currentYear,
      ),
    );
    await closeDropdown(yearTrigger);
    return selections;
  }

  async function getDocsReadyApplyButton(contextLabel, expectEnabled) {
    return waitFor(
      () => {
        const applyButton = getDocsApplyButton();
        if (!applyButton) return null;
        if (!expectEnabled) {
          return applyButton;
        }
        return isButtonDisabled(applyButton) ? null : applyButton;
      },
      {
        timeoutMs: expectEnabled ? 4000 : 15000,
        intervalMs: 100,
        label: expectEnabled
          ? `documents Apply button enablement for ${contextLabel}`
          : `documents Apply button for ${contextLabel}`,
      },
    );
  }

  async function applyDocsFiltersIfNeeded(contextLabel, expectEnabled = false) {
    const applyButton = await getDocsReadyApplyButton(contextLabel, expectEnabled);
    if (isButtonDisabled(applyButton)) {
      log(`Apply already disabled for ${contextLabel}; assuming current results match.`);
      return false;
    }

    updateStatus(`Applying documents filters for ${contextLabel}...`);
    await clickAndWait(applyButton, 350);
    return true;
  }

  function getDocsPdfLinks() {
    return Array.from(document.querySelectorAll(DOCS_SELECTORS.pdfLinks)).filter(
      (link) => isVisible(link),
    );
  }

  function getFirstDeepText(selector, matcher) {
    return (
      queryAllDeep(selector)
        .map((element) => normalizeText(element.textContent))
        .find((text) => matcher.test(text)) || ""
    );
  }

  function getDocsPaginationInfo() {
    const pageRangeText = getFirstDeepText(
      ".page-range",
      /page\s+\d+\s+of\s+\d+/i,
    );
    const dataRangeText = getFirstDeepText(
      ".data-range .data, .pagination .data",
      /from\s+\d+\s+to\s+\d+\s+of\s+\d+/i,
    );

    const pageMatch = pageRangeText.match(/Page\s+(\d+)\s+of\s+(\d+)/i);
    const dataMatch = dataRangeText.match(/From\s+(\d+)\s+to\s+(\d+)\s+of\s+(\d+)/i);

    return {
      pageRangeText,
      dataRangeText,
      currentPage: pageMatch ? Number(pageMatch[1]) : 1,
      totalPages: pageMatch ? Number(pageMatch[2]) : 1,
      from: dataMatch ? Number(dataMatch[1]) : 0,
      to: dataMatch ? Number(dataMatch[2]) : 0,
      totalRows: dataMatch ? Number(dataMatch[3]) : 0,
    };
  }

  async function waitForDocsResults(label) {
    await waitFor(
      () => {
        const paginationInfo = getDocsPaginationInfo();
        const pdfLinkCount = getDocsPdfLinks().length;
        if (pdfLinkCount > 0) return { pdfLinkCount, paginationInfo };
        if (paginationInfo.dataRangeText) return { pdfLinkCount, paginationInfo };
        return null;
      },
      { label: `documents results for ${label}` },
    );

    await waitForStableCount(() => getDocsPdfLinks().length, {
      minCount: 0,
      intervalMs: 200,
      stableMs: 1000,
      label: `stable documents rows for ${label}`,
    });
    await sleep(DOCS_RESULTS_SETTLE_MS);
  }

  function getDocsPaginationSelect() {
    return queryAllDeep(DOCS_SELECTORS.paginationSelect).find((select) =>
      isVisible(select),
    );
  }

  function getDocsPaginationButton(selector) {
    return queryAllDeep(selector).find((button) => isVisible(button));
  }

  async function goToDocsPage(targetPage) {
    const currentInfo = getDocsPaginationInfo();
    if (currentInfo.currentPage === targetPage) {
      return;
    }

    const pageSelect = getDocsPaginationSelect();
    if (
      pageSelect &&
      Array.from(pageSelect.options).some(
        (option) => option.value === String(targetPage),
      )
    ) {
      setValue(pageSelect, String(targetPage));
      await waitFor(
        () => getDocsPaginationInfo().currentPage === targetPage,
        { label: `documents page ${targetPage}` },
      );
      await waitForDocsResults(`page ${targetPage}`);
      return;
    }

    const step = targetPage > currentInfo.currentPage ? 1 : -1;
    while (getDocsPaginationInfo().currentPage !== targetPage) {
      checkStop();
      const button =
        step > 0
          ? getDocsPaginationButton(DOCS_SELECTORS.nextButton)
          : getDocsPaginationButton(DOCS_SELECTORS.prevButton);
      if (!button || button.getAttribute("aria-disabled") === "true") {
        throw new Error(`Could not navigate to documents page ${targetPage}`);
      }
      await clickAndWait(button, 250);
      await waitForDocsResults(`page ${targetPage}`);
    }
  }

  function getDocsLinkKey(link) {
    const slotHost = link.closest('[slot^="pdfLinkData-"]');
    if (slotHost) {
      return slotHost.getAttribute("slot");
    }
    return (
      link.getAttribute("aria-label") ||
      normalizeText(link.textContent) ||
      `docs-link-${Math.random()}`
    );
  }

  function buildDocsFallbackFilename(link, selection, sequence) {
    const fileYear = getDocsSelectionFileYear(selection);
    const label =
      link.getAttribute("aria-label") ||
      normalizeText(link.textContent) ||
      `trade_confirmation_${sequence}`;
    const safeLabel = label
      .replace(/[^a-zA-Z0-9._-]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 90);
    return `etrade_trade_confirmation_${fileYear}_${String(sequence).padStart(3, "0")}_${safeLabel}.pdf`;
  }

  async function downloadDocsCurrentPage(selection, summary) {
    await sleep(DOCS_PRE_DOWNLOAD_DELAY_MS);
    await waitForDocsSpinnerToClear(
      `${getDocsSelectionStatusLabel(selection)} page ${getDocsPaginationInfo().currentPage} before scanning links`,
    );
    const links = getDocsPdfLinks();

    if (links.length === 0) {
      log(
        `No new document links found for ${getDocsSelectionStatusLabel(selection)} page ${getDocsPaginationInfo().currentPage}`,
      );
      return;
    }

    for (let index = 0; index < links.length; index += 1) {
      checkStop();
      const link = links[index];
      summary.totalTriggered += 1;
      updateStatus(
        `Docs ${getDocsSelectionStatusLabel(selection)} page ${getDocsPaginationInfo().currentPage}: ${index + 1}/${links.length}...`,
      );
      await waitForDocsSpinnerToClear(
        `${getDocsSelectionStatusLabel(selection)} page ${getDocsPaginationInfo().currentPage} before download ${index + 1}`,
      );
      realClick(link);
      summary.native += 1;
      log(`Docs native download triggered for ${getDocsLinkKey(link)}`);
      await waitForDocsSpinnerToClear(
        `${getDocsSelectionStatusLabel(selection)} page ${getDocsPaginationInfo().currentPage} after download ${index + 1}`,
      );
      await sleep(NATIVE_DOWNLOAD_DELAY_MS);
    }
  }

  async function prepareDocsOnly() {
    if (!isOnAccountDocsPage()) {
      throw new Error("Navigate to Trade Confirmations first");
    }

    updateStatus("Detecting document filters...");
    const dropdowns = await identifyDocsDropdowns();
    updateStatus("Setting ANET stock plan account...");
    const accountSelection = await selectDocsAnetAccount(dropdowns.account);
    updateStatus("Setting document type...");
    const documentTypeChanged = await selectDropdownOptionByText(
      dropdowns.documentType,
      DOCS_DOCUMENT_TYPE,
    );
    const years = await collectDocsYears(dropdowns.year);
    if (years.length === 0) {
      throw new Error("No document years were detected");
    }

    await applyDocsFiltersIfNeeded(
      "base filters",
      accountSelection.changed || documentTypeChanged,
    );
    await waitForDocsResults("base filters");
    updateStatus(
      `Trade docs ready for ${accountSelection.selectedText}. Selections detected: ${years
        .map(getDocsSelectionStatusLabel)
        .join(", ")}`,
    );
  }

  async function downloadAllTradeDocsPdfs() {
    if (!isOnAccountDocsPage()) {
      throw new Error("Navigate to Trade Confirmations first");
    }

    updateStatus("Detecting document filters...");
    const dropdowns = await identifyDocsDropdowns();

    updateStatus("Selecting ANET stock plan account...");
    const accountSelection = await selectDocsAnetAccount(dropdowns.account);
    updateStatus("Selecting Trade Confirmations...");
    const documentTypeChanged = await selectDropdownOptionByText(
      dropdowns.documentType,
      DOCS_DOCUMENT_TYPE,
    );

    const years = await collectDocsYears(dropdowns.year);
    if (years.length === 0) {
      throw new Error("No document years were detected");
    }

    const summary = {
      totalTriggered: 0,
      captured: 0,
      native: 0,
      pagesVisited: 0,
      years,
      skippedYears: [],
    };

    if (accountSelection.changed || documentTypeChanged) {
      await applyDocsFiltersIfNeeded(
        "base filters",
        accountSelection.changed || documentTypeChanged,
      );
      await waitForDocsResults("base filters");
    }

    for (const year of years) {
      checkStop();
      try {
        updateStatus(
          `Loading trade confirmations for ${getDocsSelectionStatusLabel(year)}...`,
        );
        const yearChanged = await selectDropdownOptionByText(dropdowns.year, year);
        await applyDocsFiltersIfNeeded(year, yearChanged);
        await waitForDocsResults(year);

        const firstPageInfo = getDocsPaginationInfo();
        const totalPages = Math.max(firstPageInfo.totalPages || 1, 1);
        log(`Selection ${getDocsSelectionStatusLabel(year)}:`, firstPageInfo);

        for (let page = 1; page <= totalPages; page += 1) {
          checkStop();
          if (page > 1) {
            updateStatus(
              `Navigating ${getDocsSelectionStatusLabel(year)} to page ${page}/${totalPages}...`,
            );
            await goToDocsPage(page);
          }

          await waitForDocsResults(`${year} page ${page}`);
          const pageInfo = getDocsPaginationInfo();
          summary.pagesVisited += 1;
          log(
            `Selection ${getDocsSelectionStatusLabel(year)}, page ${page}:`,
            pageInfo,
          );

          await downloadDocsCurrentPage(year, summary);
        }
      } catch (error) {
        if (error instanceof Error && error.message === "Stopped by user") {
          throw error;
        }
        const message = error instanceof Error ? error.message : String(error);
        warn(`Skipping selection ${getDocsSelectionStatusLabel(year)}: ${message}`);
        summary.skippedYears.push({
          year: getDocsSelectionStatusLabel(year),
          reason: message,
        });
        updateStatus(
          `Skipping ${getDocsSelectionStatusLabel(year)}: ${message}`,
        );
        await sleep(300);
        continue;
      }
    }

    updateStatus(
      `Done: ${summary.totalTriggered} trade docs for ${accountSelection.selectedText} across ${summary.years.length} selections and ${summary.pagesVisited} pages (${summary.native} native, ${summary.skippedYears.length} skipped selections).`,
    );
  }

  async function getDebugInfo() {
    const pageKind = getCurrentPageKind();
    const info = {
      pageKind,
      pageLabel: getCurrentPageLabel(),
      href: location.href,
    };

    if (pageKind === "stock-plan") {
      return {
        ...info,
        stockPlan: {
          downloadButtonCount: getStockPlanDownloadButtons().length,
          viewAllVisible: Boolean(findVisibleButtonByText("View All")),
          applyVisible: Boolean(
            document.querySelector(STOCK_PLAN_SELECTORS.applyButton),
          ),
        },
      };
    }

    if (pageKind === "account-docs") {
      let dropdownInfo = null;
      try {
        dropdownInfo = await identifyDocsDropdowns();
      } catch (error) {
        dropdownInfo = {
          error: error instanceof Error ? error.message : String(error),
        };
      }

      return {
        ...info,
        accountDocs: {
          applyDisabled: isButtonDisabled(getDocsApplyButton()),
          pagination: getDocsPaginationInfo(),
          pdfLinkCount: getDocsPdfLinks().length,
          dropdownInfo,
        },
      };
    }

    return info;
  }

  async function runPrepareOnly() {
    const pageKind = getCurrentPageKind();
    if (pageKind === "stock-plan") {
      return prepareStockPlanOnly();
    }
    if (pageKind === "account-docs") {
      return prepareDocsOnly();
    }
    throw new Error("Navigate to either Stock Plan or Trade Docs first");
  }

  async function runDownloadAll() {
    const pageKind = getCurrentPageKind();
    if (pageKind === "stock-plan") {
      return downloadAllStockPlanPdfs();
    }
    if (pageKind === "account-docs") {
      return downloadAllTradeDocsPdfs();
    }
    throw new Error("Navigate to either Stock Plan or Trade Docs first");
  }

  async function runManagedAction(action) {
    if (state.running) return;
    state.running = true;
    state.stopRequested = false;
    refreshToolbar();

    try {
      await action();
    } catch (error) {
      if (error instanceof Error && error.message === "Stopped by user") {
        updateStatus("Stopped.");
      } else {
        err("Action failed:", error);
        updateStatus(
          `Error: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    } finally {
      state.running = false;
      state.stopRequested = false;
      refreshToolbar();
    }
  }

  function stopAll() {
    state.stopRequested = true;
    updateStatus("Stopping...");
  }

  function openStockPlanPage() {
    location.href = STOCK_PLAN_URL;
  }

  function openTradeDocsPage() {
    location.href = ACCOUNT_DOCS_URL;
  }

  function pushPageDown() {
    if (!document.body) return;
    document.body.style.setProperty(
      "padding-top",
      `${TOOLBAR_HEIGHT}px`,
      "important",
    );
  }

  function createToolbar() {
    const toolbar = document.createElement("div");
    toolbar.className = "tm-toolbar";

    const pageKind = getCurrentPageKind();
    const supportedPage = pageKind !== "other";

    const left = document.createElement("div");
    left.className = "tm-left";
    left.innerHTML = `
      <span class="tm-dot${state.running ? " active" : ""}"></span>
      <span class="tm-title">E*Trade ACB v${SCRIPT_VERSION}</span>
      <span class="tm-page-indicator ${supportedPage ? "" : "off-page"}">${getCurrentPageLabel()}</span>
    `;

    const center = document.createElement("div");
    center.className = "tm-center";
    statusEl = document.createElement("span");
    statusEl.className = "tm-status";
    statusEl.textContent = supportedPage
      ? state.statusMessage
      : "Use the nav buttons to open Stock Plan Confirmations or Trade Docs.";
    center.appendChild(statusEl);

    const right = document.createElement("div");
    right.className = "tm-right";

    const stockPlanButton = document.createElement("button");
    stockPlanButton.className = "tm-btn";
    stockPlanButton.textContent = "Stock Plan";
    stockPlanButton.disabled = state.running;
    stockPlanButton.addEventListener("click", openStockPlanPage);

    const tradeDocsButton = document.createElement("button");
    tradeDocsButton.className = "tm-btn";
    tradeDocsButton.textContent = "Trade Docs";
    tradeDocsButton.disabled = state.running;
    tradeDocsButton.addEventListener("click", openTradeDocsPage);

    if (pageKind === "stock-plan") {
      stockPlanButton.classList.add("primary");
    } else if (pageKind === "account-docs") {
      tradeDocsButton.classList.add("primary");
    }

    const prepareButton = document.createElement("button");
    prepareButton.className = "tm-btn";
    prepareButton.textContent = "Prepare";
    prepareButton.disabled = !supportedPage || state.running;
    prepareButton.addEventListener("click", () =>
      runManagedAction(runPrepareOnly),
    );

    const downloadButton = document.createElement("button");
    downloadButton.className = "tm-btn primary";
    downloadButton.textContent = "Download All PDFs";
    downloadButton.disabled = !supportedPage || state.running;
    downloadButton.addEventListener("click", () =>
      runManagedAction(runDownloadAll),
    );

    const debugButton = document.createElement("button");
    debugButton.className = "tm-btn";
    debugButton.textContent = "Debug";
    debugButton.disabled = state.running;
    debugButton.addEventListener("click", () =>
      runManagedAction(async () => {
        const info = await getDebugInfo();
        console.group(`${PREFIX} Debug`);
        console.log(info);
        console.groupEnd();
        updateStatus(`Debug logged for ${getCurrentPageLabel()}. Check console.`);
      }),
    );

    const stopButton = document.createElement("button");
    stopButton.className = "tm-btn warn";
    stopButton.textContent = "Stop";
    stopButton.style.display = state.running ? "inline-block" : "none";
    stopButton.addEventListener("click", stopAll);

    const nav = document.createElement("div");
    nav.className = "tm-nav";
    nav.appendChild(stockPlanButton);
    nav.appendChild(tradeDocsButton);

    left.appendChild(nav);

    right.appendChild(prepareButton);
    right.appendChild(downloadButton);
    right.appendChild(debugButton);
    right.appendChild(stopButton);

    toolbar.appendChild(left);
    toolbar.appendChild(center);
    toolbar.appendChild(right);

    return toolbar;
  }

  function injectStyles() {
    let styleEl = document.getElementById(STYLE_ID);
    if (styleEl) return styleEl;

    styleEl = document.createElement("style");
    styleEl.id = STYLE_ID;
    styleEl.textContent = `
      #${HOST_ID} {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: ${TOOLBAR_HEIGHT}px !important;
        z-index: 2147483647 !important;
      }
    `;

    (document.head || document.documentElement).appendChild(styleEl);
    return styleEl;
  }

  function ensureToolbar() {
    injectStyles();

    let host = document.getElementById(HOST_ID);
    if (!host) {
      host = document.createElement("div");
      host.id = HOST_ID;
      document.body.prepend(host);
      shadowRoot = host.attachShadow({ mode: "open" });
    } else if (!shadowRoot) {
      shadowRoot = host.shadowRoot || host.attachShadow({ mode: "open" });
    }

    if (!shadowRoot) return;

    shadowRoot.innerHTML = "";
    const wrapperStyle = document.createElement("style");
    wrapperStyle.textContent = SHADOW_STYLES;
    shadowRoot.appendChild(wrapperStyle);
    shadowRoot.appendChild(createToolbar());
    pushPageDown();
  }

  function refreshToolbar() {
    if (!document.body) return;
    ensureToolbar();
  }

  function installLifecycleHooks() {
    const refreshSoon = () => setTimeout(refreshToolbar, 250);
    window.addEventListener("hashchange", refreshSoon);
    window.addEventListener("popstate", refreshSoon);
    window.addEventListener("load", refreshSoon);
    document.addEventListener("readystatechange", refreshSoon);
  }

  function startPolling() {
    setInterval(() => {
      if (!document.body) return;
      if (!document.getElementById(HOST_ID)) {
        shadowRoot = null;
      }
      refreshToolbar();
    }, CHECK_INTERVAL_MS);
  }

  function waitForBody() {
    if (document.body) {
      state.statusMessage = "Ready";
      refreshToolbar();
      installLifecycleHooks();
      startPolling();
      log("Toolbar loaded");
      return;
    }
    requestAnimationFrame(waitForBody);
  }

  waitForBody();
})();
