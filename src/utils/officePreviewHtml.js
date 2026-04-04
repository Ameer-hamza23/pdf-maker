export function getOfficePreviewHtml(base64Data, options = {}) {
  const extension = JSON.stringify(options.extension || '');
  const fileName = JSON.stringify(options.fileName || 'document');
  const extraScripts = [];

  if (options.extension === 'docx') {
    extraScripts.push(
      '<script src="https://cdn.jsdelivr.net/npm/mammoth@1.11.0/mammoth.browser.min.js"></script>'
    );
  }

  if (options.extension === 'xlsx' || options.extension === 'xls') {
    extraScripts.push(
      '<script src="https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js"></script>'
    );
  }

  if (options.extension === 'pptx') {
    extraScripts.push(
      '<script src="https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js"></script>'
    );
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes"
  />
  <title>Office Preview</title>
  ${extraScripts.join('\n')}
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #eef2f7;
      color: #243447;
    }
    #shell {
      min-height: 100vh;
      padding: 16px 14px 28px;
    }
    #status {
      color: #5a6f86;
      font-size: 13px;
      text-align: center;
      margin-bottom: 12px;
    }
    #preview-root {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .empty-card,
    .preview-card,
    .sheet-card,
    .slide-card {
      background: #fff;
      border-radius: 14px;
      box-shadow: 0 10px 24px rgba(31, 45, 61, 0.08);
      border: 1px solid rgba(148, 163, 184, 0.22);
    }
    .empty-card {
      padding: 18px;
      text-align: center;
      color: #51657e;
      line-height: 1.6;
    }
    .preview-card {
      padding: 18px;
      overflow-x: auto;
    }
    .docx-body {
      outline: none;
      line-height: 1.6;
      color: #243447;
      min-height: 200px;
    }
    .docx-body img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 12px auto;
    }
    .docx-body img.office-selected-image,
    .slide-body img.office-selected-image,
    .editable-cell img.office-selected-image {
      outline: 3px solid #0d6e6e;
      outline-offset: 3px;
      box-shadow: 0 0 0 5px rgba(13, 110, 110, 0.18);
    }
    #image-selection-overlay {
      position: absolute;
      border: 2px solid #0d6e6e;
      border-radius: 6px;
      box-shadow: 0 0 0 4px rgba(13, 110, 110, 0.18);
      pointer-events: none;
      display: none;
      z-index: 999;
    }
    #image-selection-overlay.visible {
      display: block;
    }
    #image-selection-handle {
      position: absolute;
      width: 18px;
      height: 18px;
      right: -10px;
      bottom: -10px;
      border-radius: 999px;
      background: #0d6e6e;
      border: 2px solid #ffffff;
      box-shadow: 0 4px 10px rgba(13, 110, 110, 0.34);
      cursor: nwse-resize;
      pointer-events: auto;
      touch-action: none;
    }
    .tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 10px;
    }
    .tab {
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      color: #35506d;
      padding: 8px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
    }
    .tab.active {
      background: #0d6e6e;
      color: #fff;
      border-color: #0d6e6e;
    }
    .sheet-card,
    .slide-card {
      padding: 14px;
    }
    .sheet-card table {
      border-collapse: collapse;
      width: 100%;
      min-width: 640px;
      background: #fff;
    }
    .sheet-card th,
    .sheet-card td {
      border: 1px solid #d9e2ec;
      padding: 8px 10px;
      font-size: 13px;
      vertical-align: top;
      min-width: 72px;
    }
    .sheet-card th {
      background: #f8fafc;
      font-weight: 700;
    }
    .editable-cell {
      outline: none;
    }
    .slide-header {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #5c7088;
      margin-bottom: 10px;
      font-weight: 700;
    }
    .slide-body {
      background: #fff;
      min-height: 220px;
      border: 1px solid #d8e1eb;
      border-radius: 12px;
      padding: 18px;
      color: #233548;
      line-height: 1.55;
      outline: none;
      white-space: pre-wrap;
    }
    .slide-line + .slide-line {
      margin-top: 10px;
    }
    .ppt-deck,
    .ppt-deck-legacy {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .ppt-deck .slide-card,
    .ppt-deck-legacy .slide-card {
      padding: 0;
      overflow: hidden;
      border-radius: 16px;
      box-shadow: 0 14px 32px rgba(15, 23, 42, 0.2);
      border: none;
    }
    .ppt-deck .slide-header,
    .ppt-deck-legacy .slide-header {
      padding: 12px 18px 0;
      margin-bottom: 8px;
    }
    .ppt-deck .slide-body,
    .ppt-deck-legacy .slide-body {
      margin: 0 14px 14px;
      min-height: 160px;
    }
    .ppt-theme-default .slide-card {
      background: linear-gradient(155deg, #1a237e 0%, #303f9f 42%, #5c6bc0 100%);
    }
    .ppt-theme-default .slide-header {
      color: rgba(255, 255, 255, 0.95);
    }
    .ppt-theme-default .slide-body {
      background: rgba(255, 255, 255, 0.98);
      border: none;
      color: #1a237e;
    }
    .ppt-theme-ocean .slide-card {
      background: linear-gradient(155deg, #004d66 0%, #00838f 50%, #4dd0e1 100%);
    }
    .ppt-theme-ocean .slide-header {
      color: rgba(255, 255, 255, 0.95);
    }
    .ppt-theme-ocean .slide-body {
      background: rgba(255, 255, 255, 0.97);
      border: none;
      color: #004d66;
    }
    .ppt-theme-sunset .slide-card {
      background: linear-gradient(155deg, #bf360c 0%, #e65100 45%, #ffb74d 100%);
    }
    .ppt-theme-sunset .slide-header {
      color: rgba(255, 255, 255, 0.96);
    }
    .ppt-theme-sunset .slide-body {
      background: rgba(255, 248, 240, 0.98);
      border: none;
      color: #4e342e;
    }
    .ppt-theme-forest .slide-card {
      background: linear-gradient(155deg, #1b5e20 0%, #388e3c 48%, #81c784 100%);
    }
    .ppt-theme-forest .slide-header {
      color: rgba(255, 255, 255, 0.95);
    }
    .ppt-theme-forest .slide-body {
      background: rgba(255, 255, 255, 0.97);
      border: none;
      color: #1b5e20;
    }
    .ppt-theme-midnight .slide-card {
      background: linear-gradient(155deg, #0d1117 0%, #1c2333 50%, #37474f 100%);
    }
    .ppt-theme-midnight .slide-header {
      color: rgba(187, 211, 255, 0.92);
    }
    .ppt-theme-midnight .slide-body {
      background: rgba(30, 35, 48, 0.96);
      border: 1px solid rgba(100, 120, 160, 0.35);
      color: #e8eaf6;
    }
    .ppt-theme-paper .slide-card {
      background: linear-gradient(180deg, #faf7f2 0%, #f0ebe3 100%);
      box-shadow: 0 8px 24px rgba(60, 48, 36, 0.12);
    }
    .ppt-theme-paper .slide-header {
      color: #6d4c41;
    }
    .ppt-theme-paper .slide-body {
      background: #ffffff;
      border: 1px solid #e0d8ce;
      color: #3e342e;
    }
    .unsupported {
      color: #8b1e2d;
      font-weight: 600;
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <div id="shell">
    <div id="status">Preparing preview...</div>
    <div id="preview-root"></div>
    <div id="image-selection-overlay">
      <div id="image-selection-handle"></div>
    </div>
  </div>

  <script>
    const sourceBase64 = "${base64Data || ''}";
    const sourceExtension = ${extension};
    const sourceFileName = ${fileName};
    const previewRoot = document.getElementById('preview-root');
    const statusElement = document.getElementById('status');
    const imageSelectionOverlay = document.getElementById('image-selection-overlay');
    const imageSelectionHandle = document.getElementById('image-selection-handle');
    let currentSheetIndex = 0;
    let currentPreviewKind = 'unsupported';
    let canConvertToPdf = false;
    let isEditable = false;
    let lastFocusedEditable = null;
    let selectedImage = null;
    let activeImageResize = null;

    function sendMessage(payload) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      }
    }

    function setStatus(message) {
      statusElement.textContent = message;
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function base64ToUint8Array(base64) {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
      }
      return bytes;
    }

    function chunkAndSendHtml(requestId, html) {
      const chunkSize = 70000;
      const totalChunks = Math.max(1, Math.ceil(html.length / chunkSize));

      sendMessage({
        type: 'officePreviewExportMeta',
        requestId,
        totalChunks,
      });

      for (let index = 0; index < totalChunks; index += 1) {
        const start = index * chunkSize;
        const end = start + chunkSize;
        sendMessage({
          type: 'officePreviewExportChunk',
          requestId,
          index,
          chunk: html.slice(start, end),
        });
      }

      sendMessage({
        type: 'officePreviewExportComplete',
        requestId,
      });
    }

    function buildPrintableHtml(title) {
      const printableRoot = previewRoot.cloneNode(true);
      printableRoot.querySelectorAll('.office-selected-image').forEach((image) => {
        image.classList.remove('office-selected-image');
      });
      printableRoot.querySelectorAll('[data-sheet-panel]').forEach((sheetPanel) => {
        sheetPanel.style.display = 'block';
      });
      printableRoot.querySelectorAll('[data-sheet-tab]').forEach((sheetTab) => {
        sheetTab.remove();
      });

      return (
        '<!DOCTYPE html><html><head><meta charset="UTF-8" />' +
        '<meta name="viewport" content="width=device-width, initial-scale=1.0" />' +
        '<style>' +
        '@page { margin: 20px; }' +
        'body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #ffffff; color: #243447; }' +
        '#print-root { padding: 16px; }' +
        '.preview-card, .sheet-card, .slide-card { background: #fff; border-radius: 12px; border: 1px solid #d8e1eb; box-shadow: none; margin-bottom: 16px; page-break-inside: avoid; }' +
        '.preview-card { padding: 18px; overflow: hidden; }' +
        '.sheet-card, .slide-card { padding: 14px; }' +
        '.docx-body img { max-width: 100%; height: auto; display: block; margin: 12px auto; }' +
        '.sheet-card table { border-collapse: collapse; width: 100%; }' +
        '.sheet-card th, .sheet-card td { border: 1px solid #d9e2ec; padding: 8px 10px; font-size: 13px; vertical-align: top; }' +
        '.sheet-card th { background: #f8fafc; font-weight: 700; }' +
        '.tabs { display: none; }' +
        '.slide-body { min-height: 220px; border: 1px solid #d8e1eb; border-radius: 12px; padding: 18px; white-space: pre-wrap; }' +
        '.slide-line + .slide-line { margin-top: 10px; }' +
        '.slide-header { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #5c7088; margin-bottom: 10px; font-weight: 700; }' +
        '</style>' +
        '<title>' + escapeHtml(title || sourceFileName) + '</title></head><body><div id="print-root">' +
        printableRoot.innerHTML +
        '</div></body></html>'
      );
    }

    function notifyPreviewReady(kind, options) {
      currentPreviewKind = kind;
      canConvertToPdf = !!(options && options.canConvertToPdf);
      isEditable = !!(options && options.isEditable);
      sendMessage({
        type: 'officePreviewReady',
        previewKind: currentPreviewKind,
        canConvertToPdf,
        isEditable,
      });
    }

    function renderUnsupported(message) {
      previewRoot.innerHTML =
        '<div class="empty-card">' +
        '<div><strong>' + escapeHtml(sourceFileName) + '</strong></div>' +
        '<div class="unsupported">' + escapeHtml(message) + '</div>' +
        '<div style="margin-top: 10px;">Use Share to open it in Microsoft Office, PowerPoint, Excel, or another editor on your device.</div>' +
        '</div>';
      setStatus('Preview unavailable');
      notifyPreviewReady('unsupported', {
        canConvertToPdf: false,
        isEditable: false,
      });
    }

    function renderTextOnlyMessage(message) {
      previewRoot.innerHTML =
        '<div class="empty-card">' +
        '<div>' + escapeHtml(message) + '</div>' +
        '</div>';
    }

    function setHtmlPreview(html) {
      previewRoot.innerHTML = html;
    }

    function clearSelectedImage() {
      if (selectedImage) {
        selectedImage.classList.remove('office-selected-image');
      }
      selectedImage = null;
      imageSelectionOverlay.classList.remove('visible');
    }

    function updateSelectedImageOverlayPosition() {
      if (!selectedImage || !selectedImage.isConnected) {
        clearSelectedImage();
        return;
      }

      const bounds = selectedImage.getBoundingClientRect();
      imageSelectionOverlay.style.left = window.scrollX + bounds.left - 4 + 'px';
      imageSelectionOverlay.style.top = window.scrollY + bounds.top - 4 + 'px';
      imageSelectionOverlay.style.width = bounds.width + 8 + 'px';
      imageSelectionOverlay.style.height = bounds.height + 8 + 'px';
      imageSelectionOverlay.classList.add('visible');
    }

    function setSelectedImage(image) {
      clearSelectedImage();
      selectedImage = image;
      selectedImage.classList.add('office-selected-image');
      rememberEditableTarget(image);
      updateSelectedImageOverlayPosition();
    }

    function getEditableTarget(node) {
      if (!node) {
        return null;
      }

      if (node.nodeType === Node.TEXT_NODE) {
        return getEditableTarget(node.parentElement);
      }

      if (node instanceof HTMLElement && node.isContentEditable) {
        return node;
      }

      if (node instanceof HTMLElement) {
        return node.closest('[contenteditable="true"]');
      }

      return null;
    }

    function rememberEditableTarget(target) {
      const editableTarget = getEditableTarget(target);
      if (editableTarget) {
        lastFocusedEditable = editableTarget;
      }
    }

    function focusEditableTarget() {
      let target = getEditableTarget(document.activeElement);

      if (!target) {
        target = lastFocusedEditable;
      }

      if (!target) {
        target = previewRoot.querySelector('[contenteditable="true"]');
      }

      if (!target) {
        return null;
      }

      target.focus();
      lastFocusedEditable = target;
      return target;
    }

    function execFormattingCommand(commandName, value) {
      const target = focusEditableTarget();
      if (!target) {
        return false;
      }

      document.execCommand('styleWithCSS', false, true);
      return document.execCommand(commandName, false, value);
    }

    function getSelectionRangeWithinPreview() {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return null;
      }

      const range = selection.getRangeAt(0);
      if (!previewRoot.contains(range.commonAncestorContainer)) {
        return null;
      }

      return range;
    }

    function getFontSizeTarget() {
      const selection = window.getSelection();
      const anchorNode = selection && selection.anchorNode ? selection.anchorNode : null;
      const anchorElement =
        anchorNode && anchorNode.nodeType === Node.TEXT_NODE
          ? anchorNode.parentElement
          : anchorNode instanceof HTMLElement
            ? anchorNode
            : null;

      if (anchorElement) {
        const blockTarget = anchorElement.closest(
          'span, p, div, td, th, li, h1, h2, h3, h4, h5, h6'
        );
        if (blockTarget && previewRoot.contains(blockTarget)) {
          return blockTarget;
        }
      }

      return focusEditableTarget();
    }

    function getElementFontSize(element) {
      if (!element || !(element instanceof HTMLElement)) {
        return 16;
      }

      const parsedValue = parseFloat(window.getComputedStyle(element).fontSize);
      return Number.isFinite(parsedValue) ? parsedValue : 16;
    }

    function updateRangeSelection(element) {
      if (!element) {
        return;
      }

      const selection = window.getSelection();
      if (!selection) {
        return;
      }

      const range = document.createRange();
      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    function adjustFontSize(delta) {
      const target = focusEditableTarget();
      if (!target) {
        return false;
      }

      const range = getSelectionRangeWithinPreview();
      const numericDelta = Number(delta);
      const safeDelta = Number.isFinite(numericDelta) ? numericDelta : 0;

      if (!safeDelta) {
        return false;
      }

      if (range && !range.collapsed) {
        const workingRange = range.cloneRange();
        const currentSize = getElementFontSize(
          workingRange.startContainer.nodeType === Node.TEXT_NODE
            ? workingRange.startContainer.parentElement
            : workingRange.startContainer
        );
        const nextSize = Math.max(10, Math.min(currentSize + safeDelta, 72));
        const wrapper = document.createElement('span');
        wrapper.style.fontSize = nextSize + 'px';

        try {
          workingRange.surroundContents(wrapper);
        } catch (_) {
          const fragment = workingRange.extractContents();
          wrapper.appendChild(fragment);
          workingRange.insertNode(wrapper);
        }

        updateRangeSelection(wrapper);
        lastFocusedEditable = target;
        return true;
      }

      const sizeTarget = getFontSizeTarget();
      if (!sizeTarget) {
        return false;
      }

      const nextSize = Math.max(10, Math.min(getElementFontSize(sizeTarget) + safeDelta, 72));
      sizeTarget.style.fontSize = nextSize + 'px';
      lastFocusedEditable = target;
      return true;
    }

    function resetFontSize(value) {
      const sizeTarget = getFontSizeTarget();
      if (!sizeTarget) {
        return false;
      }

      const nextSize = Math.max(10, Math.min(Number(value) || 16, 72));
      sizeTarget.style.fontSize = nextSize + 'px';
      return true;
    }

    function applyFontWeightToSelection(weight) {
      const w = String(weight || '400');
      const target = focusEditableTarget();
      if (!target) {
        return false;
      }

      document.execCommand('styleWithCSS', false, true);
      const range = getSelectionRangeWithinPreview();
      if (range && !range.collapsed) {
        const span = document.createElement('span');
        span.style.fontWeight = w;
        try {
          range.surroundContents(span);
        } catch (_) {
          const fragment = range.extractContents();
          span.appendChild(fragment);
          range.insertNode(span);
        }
        return true;
      }

      const block = getFontSizeTarget();
      if (block && previewRoot.contains(block)) {
        block.style.fontWeight = w;
        return true;
      }

      return false;
    }

    function applyLineHeightToSelection(multiple) {
      const m = Number(multiple);
      if (!Number.isFinite(m) || m < 0.75 || m > 3.25) {
        return false;
      }

      if (!focusEditableTarget()) {
        return false;
      }

      const sel = window.getSelection();
      let el = null;
      if (sel && sel.rangeCount > 0) {
        var n = sel.getRangeAt(0).commonAncestorContainer;
        if (n.nodeType === Node.TEXT_NODE) {
          n = n.parentElement;
        }
        if (n && n.closest) {
          el = n.closest('p, div, li, h1, h2, h3, h4, td, th, section, article, .docx-body');
        }
      }

      if (!el || !previewRoot.contains(el)) {
        el = getFontSizeTarget();
      }

      if (el && previewRoot.contains(el)) {
        el.style.lineHeight = String(m);
        return true;
      }

      return false;
    }

    function applyHeadingTag(tagName) {
      var raw = String(tagName || 'p').toLowerCase();
      var allowed = { p: 'p', h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', blockquote: 'blockquote', pre: 'pre' };
      var tag = allowed[raw] || 'p';

      if (!focusEditableTarget()) {
        return false;
      }

      document.execCommand('styleWithCSS', false, true);
      return document.execCommand('formatBlock', false, tag);
    }

    function execUndo() {
      focusEditableTarget();
      return document.execCommand('undo', false, null);
    }

    function execRedo() {
      focusEditableTarget();
      return document.execCommand('redo', false, null);
    }

    function insertImageIntoPreview(dataUrl) {
      const target = focusEditableTarget();
      if (!target || !dataUrl) {
        return false;
      }

      const imageHtml =
        '<img src="' +
        dataUrl +
        '" alt="Inserted image" style="max-width: 100%; height: auto; display: block; margin: 12px auto;" />';

      document.execCommand('insertHTML', false, imageHtml);
      setTimeout(function() {
        const images = target.querySelectorAll('img');
        const lastImage = images[images.length - 1];
        if (lastImage) {
          setSelectedImage(lastImage);
        }
      }, 0);
      return true;
    }

    function scaleSelectedImage(factor) {
      if (!selectedImage) {
        return false;
      }

      const currentWidth =
        selectedImage.getBoundingClientRect().width ||
        selectedImage.clientWidth ||
        selectedImage.naturalWidth ||
        180;
      const nextWidth = Math.max(48, Math.min(currentWidth * factor, 1400));

      selectedImage.style.width = nextWidth + 'px';
      selectedImage.style.maxWidth = '100%';
      selectedImage.style.height = 'auto';
      updateSelectedImageOverlayPosition();
      return true;
    }

    function getPointerCoords(event) {
      if (event.touches && event.touches.length > 0) {
        return {
          clientX: event.touches[0].clientX,
          clientY: event.touches[0].clientY,
        };
      }

      if (event.changedTouches && event.changedTouches.length > 0) {
        return {
          clientX: event.changedTouches[0].clientX,
          clientY: event.changedTouches[0].clientY,
        };
      }

      return {
        clientX: event.clientX,
        clientY: event.clientY,
      };
    }

    function startImageResize(event) {
      if (!selectedImage) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const pointer = getPointerCoords(event);
      activeImageResize = {
        startClientX: pointer.clientX,
        startWidth:
          selectedImage.getBoundingClientRect().width ||
          selectedImage.clientWidth ||
          selectedImage.naturalWidth ||
          180,
      };
    }

    function updateImageResize(event) {
      if (!activeImageResize || !selectedImage) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const pointer = getPointerCoords(event);
      const deltaX = pointer.clientX - activeImageResize.startClientX;
      const nextWidth = Math.max(48, Math.min(activeImageResize.startWidth + deltaX, 1400));

      selectedImage.style.width = nextWidth + 'px';
      selectedImage.style.maxWidth = '100%';
      selectedImage.style.height = 'auto';
      updateSelectedImageOverlayPosition();
    }

    function endImageResize(event) {
      if (!activeImageResize) {
        return;
      }

      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      activeImageResize = null;
      updateSelectedImageOverlayPosition();
    }

    function attachSheetTabHandlers() {
      const tabs = Array.from(document.querySelectorAll('[data-sheet-tab]'));
      const sheets = Array.from(document.querySelectorAll('[data-sheet-panel]'));

      function showSheet(index) {
        currentSheetIndex = index;
        tabs.forEach((tab) => {
          tab.classList.toggle('active', Number(tab.dataset.sheetTab) === index);
        });
        sheets.forEach((sheet) => {
          sheet.style.display = Number(sheet.dataset.sheetPanel) === index ? 'block' : 'none';
        });
      }

      tabs.forEach((tab) => {
        tab.addEventListener('click', () => showSheet(Number(tab.dataset.sheetTab)));
      });

      showSheet(currentSheetIndex);
    }

    function makeSheetCellsEditable() {
      previewRoot.querySelectorAll('td, th').forEach((cell) => {
        cell.contentEditable = 'true';
        cell.classList.add('editable-cell');
      });
    }

    function extractSlideTexts(xml) {
      return Array.from(xml.getElementsByTagName('*'))
        .filter((node) => node.localName === 't')
        .map((node) => String(node.textContent || '').trim())
        .filter(Boolean);
    }

    function buildSlideMarkup(lines, slideNumber) {
      const bodyMarkup = (lines.length ? lines : ['[No text found on this slide.]'])
        .map((line) => '<div class="slide-line">' + escapeHtml(line) + '</div>')
        .join('');

      return (
        '<section class="slide-card">' +
        '<div class="slide-header">Slide ' + slideNumber + '</div>' +
        '<div class="slide-body" contenteditable="true">' + bodyMarkup + '</div>' +
        '</section>'
      );
    }

    function chunkLinesIntoSlides(lines, perSlide) {
      if (!lines.length) {
        return [['[No readable text extracted from this .ppt file.]']];
      }
      const chunks = [];
      let current = [];
      const maxPer = Math.max(4, Math.min(Number(perSlide) || 14, 40));
      for (let i = 0; i < lines.length; i++) {
        current.push(lines[i]);
        if (current.length >= maxPer) {
          chunks.push(current);
          current = [];
        }
      }
      if (current.length) {
        chunks.push(current);
      }
      return chunks;
    }

    function filterPptNoise(lines) {
      return lines.filter((line) => {
        const l = String(line || '').toLowerCase();
        if (l.length < 4) {
          return false;
        }
        if (l.indexOf('powerpoint') !== -1 && l.length < 48) {
          return false;
        }
        if (l.indexOf('microsoft office') !== -1) {
          return false;
        }
        if (l === 'slide' || l === 'slide show') {
          return false;
        }
        return true;
      });
    }

    function applyPresentationTheme(themeName) {
      const safe = String(themeName || 'default').replace(/[^a-z0-9_-]/gi, '') || 'default';
      const deck = previewRoot.querySelector('.ppt-deck, .ppt-deck-legacy');
      if (!deck) {
        return false;
      }
      deck.className = deck.className.replace(/\bppt-theme-[a-z0-9_-]+\b/gi, '').trim();
      deck.classList.add('ppt-theme-' + safe);
      return true;
    }

    function renderLegacyPpt() {
      setStatus('Rendering PowerPoint (.ppt)...');
      const bytes = base64ToUint8Array(sourceBase64);
      let lines = finalizeLegacyLines(
        extractUtf16Strings(bytes).concat(extractAsciiStrings(bytes))
      );
      lines = filterPptNoise(lines);
      const chunks = chunkLinesIntoSlides(lines, 14);
      const slideMarkup = chunks.map((chunk, index) => buildSlideMarkup(chunk, index + 1));
      setHtmlPreview(
        '<div class="ppt-deck-legacy ppt-theme-default">' + slideMarkup.join('') + '</div>'
      );
      setStatus('PowerPoint (.ppt) preview ready');
      notifyPreviewReady('presentation', {
        canConvertToPdf: true,
        isEditable: true,
      });
    }

    function finalizeLegacyLines(lines) {
      const uniqueLines = [];
      const seen = new Set();

      lines.forEach((line) => {
        const normalized = String(line || '')
          .replace(/[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F]+/g, ' ')
          .replace(/\\s+/g, ' ')
          .trim();

        if (normalized.length < 3) {
          return;
        }

        const lowerValue = normalized.toLowerCase();
        if (
          lowerValue === 'word.document' ||
          lowerValue === 'microsoft word' ||
          lowerValue.startsWith('worddocument') ||
          lowerValue.startsWith('macros')
        ) {
          return;
        }

        if (!seen.has(normalized)) {
          seen.add(normalized);
          uniqueLines.push(normalized);
        }
      });

      return uniqueLines;
    }

    function extractUtf16Strings(bytes) {
      const lines = [];
      let buffer = '';

      for (let index = 0; index < bytes.length - 1; index += 2) {
        const lowByte = bytes[index];
        const highByte = bytes[index + 1];
        const isPrintable =
          highByte === 0 &&
          (lowByte === 9 ||
            lowByte === 10 ||
            lowByte === 13 ||
            (lowByte >= 32 && lowByte <= 126));

        if (isPrintable) {
          buffer += String.fromCharCode(lowByte);
          continue;
        }

        if (buffer.length >= 4) {
          lines.push.apply(lines, buffer.split(/\\r?\\n+/));
        }
        buffer = '';
      }

      if (buffer.length >= 4) {
        lines.push.apply(lines, buffer.split(/\\r?\\n+/));
      }

      return lines;
    }

    function extractAsciiStrings(bytes) {
      const lines = [];
      let buffer = '';

      for (let index = 0; index < bytes.length; index += 1) {
        const byte = bytes[index];
        const isPrintable =
          byte === 9 ||
          byte === 10 ||
          byte === 13 ||
          (byte >= 32 && byte <= 126);

        if (isPrintable) {
          buffer += String.fromCharCode(byte);
          continue;
        }

        if (buffer.length >= 6) {
          lines.push.apply(lines, buffer.split(/\\r?\\n+/));
        }
        buffer = '';
      }

      if (buffer.length >= 6) {
        lines.push.apply(lines, buffer.split(/\\r?\\n+/));
      }

      return lines;
    }

    function renderLegacyDoc() {
      setStatus('Rendering legacy Word document...');
      const bytes = base64ToUint8Array(sourceBase64);
      const lines = finalizeLegacyLines(
        extractUtf16Strings(bytes).concat(extractAsciiStrings(bytes))
      );

      const bodyMarkup = (lines.length ? lines : ['[Preview found limited readable text in this .doc file.]'])
        .map((line) => '<p>' + escapeHtml(line) + '</p>')
        .join('');

      const html =
        '<article class="preview-card"><div class="docx-body" contenteditable="true">' +
        bodyMarkup +
        '</div></article>';

      setHtmlPreview(html);
      setStatus('Legacy Word preview ready');
      notifyPreviewReady('doc', {
        canConvertToPdf: true,
        isEditable: true,
      });
    }

    async function renderDocx() {
      if (!window.mammoth) {
        throw new Error('Word preview library failed to load.');
      }

      setStatus('Rendering Word document...');
      const result = await window.mammoth.convertToHtml(
        { arrayBuffer: base64ToUint8Array(sourceBase64).buffer },
        {
          convertImage: window.mammoth.images.imgElement(function(image) {
            return image.read('base64').then(function(imageBuffer) {
              return {
                src: 'data:' + image.contentType + ';base64,' + imageBuffer,
              };
            });
          }),
        }
      );

      const html =
        '<article class="preview-card"><div class="docx-body" contenteditable="true">' +
        result.value +
        '</div></article>';
      setHtmlPreview(html);
      setStatus('Word preview ready');
      notifyPreviewReady('docx', {
        canConvertToPdf: true,
        isEditable: true,
      });
    }

    function renderSpreadsheet() {
      if (!window.XLSX) {
        throw new Error('Spreadsheet preview library failed to load.');
      }

      setStatus('Rendering spreadsheet...');
      const workbook = window.XLSX.read(sourceBase64, {
        type: 'base64',
      });

      if (!workbook.SheetNames.length) {
        renderTextOnlyMessage('No worksheet data found in this spreadsheet.');
        setStatus('Spreadsheet preview ready');
        notifyPreviewReady('spreadsheet', {
          canConvertToPdf: true,
          isEditable: false,
        });
        return;
      }

      const tabsMarkup =
        '<div class="tabs">' +
        workbook.SheetNames.map(function(sheetName, index) {
          return (
            '<button type="button" class="tab" data-sheet-tab="' +
            index +
            '">' +
            escapeHtml(sheetName) +
            '</button>'
          );
        }).join('') +
        '</div>';

      const sheetsMarkup = workbook.SheetNames.map(function(sheetName, index) {
        const tableHtml = window.XLSX.utils.sheet_to_html(workbook.Sheets[sheetName], {
          editable: false,
        });
        return (
          '<section class="sheet-card" data-sheet-panel="' +
          index +
          '">' +
          tableHtml +
          '</section>'
        );
      }).join('');

      setHtmlPreview(tabsMarkup + sheetsMarkup);
      attachSheetTabHandlers();
      makeSheetCellsEditable();
      setStatus('Spreadsheet preview ready');
      notifyPreviewReady('spreadsheet', {
        canConvertToPdf: true,
        isEditable: true,
      });
    }

    async function renderPresentation() {
      if (!window.JSZip) {
        throw new Error('Presentation preview library failed to load.');
      }

      setStatus('Rendering presentation...');
      const zip = await window.JSZip.loadAsync(base64ToUint8Array(sourceBase64));
      const slideFiles = Object.keys(zip.files)
        .filter((name) => /^ppt\\/slides\\/slide\\d+\\.xml$/i.test(name))
        .sort((left, right) => {
          const leftNumber = Number((left.match(/slide(\\d+)\\.xml/i) || [])[1] || 0);
          const rightNumber = Number((right.match(/slide(\\d+)\\.xml/i) || [])[1] || 0);
          return leftNumber - rightNumber;
        });

      if (!slideFiles.length) {
        renderTextOnlyMessage('No slide data found in this presentation.');
        setStatus('Presentation preview ready');
        notifyPreviewReady('presentation', {
          canConvertToPdf: true,
          isEditable: true,
        });
        return;
      }

      const parser = new DOMParser();
      const slideMarkup = [];

      for (let index = 0; index < slideFiles.length; index += 1) {
        const xmlText = await zip.files[slideFiles[index]].async('text');
        const xml = parser.parseFromString(xmlText, 'application/xml');
        const slideLines = extractSlideTexts(xml);
        slideMarkup.push(buildSlideMarkup(slideLines, index + 1));
      }

      setHtmlPreview(
        '<div class="ppt-deck ppt-theme-default">' + slideMarkup.join('') + '</div>'
      );
      setStatus('Presentation preview ready');
      notifyPreviewReady('presentation', {
        canConvertToPdf: true,
        isEditable: true,
      });
    }

    async function renderPreview() {
      try {
        if (!sourceBase64) {
          renderUnsupported('This file preview is not available right now.');
          return;
        }

        if (sourceExtension === 'docx') {
          await renderDocx();
          return;
        }

        if (sourceExtension === 'doc') {
          renderLegacyDoc();
          return;
        }

        if (sourceExtension === 'xlsx' || sourceExtension === 'xls') {
          renderSpreadsheet();
          return;
        }

        if (sourceExtension === 'pptx') {
          await renderPresentation();
          return;
        }

        if (sourceExtension === 'ppt') {
          renderLegacyPpt();
          return;
        }

        renderUnsupported(
          'This file type is not supported for in-app preview. Try DOC, DOCX, PPT, PPTX, XLS, XLSX, or plain text / code files.'
        );
      } catch (error) {
        renderUnsupported(error && error.message ? error.message : 'Preview failed.');
      }
    }

    function handleOfficePreviewCommand(command) {
      if (!command) {
        return;
      }

      if (command.command === 'officeFormat') {
        switch (command.action) {
          case 'bold':
            execFormattingCommand('bold');
            break;
          case 'italic':
            execFormattingCommand('italic');
            break;
          case 'underline':
            execFormattingCommand('underline');
            break;
          case 'strikethrough':
            execFormattingCommand('strikeThrough');
            break;
          case 'subscript':
            execFormattingCommand('subscript');
            break;
          case 'superscript':
            execFormattingCommand('superscript');
            break;
          case 'justifyLeft':
            execFormattingCommand('justifyLeft');
            break;
          case 'justifyCenter':
            execFormattingCommand('justifyCenter');
            break;
          case 'justifyRight':
            execFormattingCommand('justifyRight');
            break;
          case 'justifyFull':
            execFormattingCommand('justifyFull');
            break;
          case 'insertUnorderedList':
            execFormattingCommand('insertUnorderedList');
            break;
          case 'insertOrderedList':
            execFormattingCommand('insertOrderedList');
            break;
          case 'indent':
            execFormattingCommand('indent');
            break;
          case 'outdent':
            execFormattingCommand('outdent');
            break;
          case 'removeFormat':
            execFormattingCommand('removeFormat');
            break;
          case 'hiliteColor':
            execFormattingCommand('hiliteColor', command.value || '#ffff00');
            break;
          case 'setColor':
            execFormattingCommand('foreColor', command.value || '#000000');
            break;
          case 'setFontSize':
            execFormattingCommand('fontSize', command.value || '3');
            break;
          case 'adjustFontSize':
            if (!adjustFontSize(command.value)) {
              sendMessage({
                type: 'officePreviewCommandError',
                message: 'Tap or select text first, then change the font size.',
              });
            }
            break;
          case 'resetFontSize':
            if (!resetFontSize(command.value)) {
              sendMessage({
                type: 'officePreviewCommandError',
                message: 'Tap inside the editable text first.',
              });
            }
            break;
          case 'setFontFamily':
            execFormattingCommand('fontName', command.value || 'Arial');
            break;
          case 'insertImage':
            if (!insertImageIntoPreview(command.dataUrl || '')) {
              sendMessage({
                type: 'officePreviewCommandError',
                message: 'Select an editable area before inserting an image.',
              });
            }
            break;
          case 'scaleImage':
            if (!scaleSelectedImage(Number(command.value) || 1)) {
              sendMessage({
                type: 'officePreviewCommandError',
                message: 'Tap an image first, then use the resize buttons.',
              });
            }
            break;
          case 'setFontWeight':
            if (!applyFontWeightToSelection(command.value)) {
              sendMessage({
                type: 'officePreviewCommandError',
                message: 'Select text or tap in the editor first.',
              });
            }
            break;
          case 'setLineHeight':
            if (!applyLineHeightToSelection(command.value)) {
              sendMessage({
                type: 'officePreviewCommandError',
                message: 'Tap inside a paragraph first.',
              });
            }
            break;
          case 'setHeading':
            if (!applyHeadingTag(command.value)) {
              sendMessage({
                type: 'officePreviewCommandError',
                message: 'Tap in the text first.',
              });
            }
            break;
          case 'undo':
            execUndo();
            break;
          case 'redo':
            execRedo();
            break;
          case 'setPresentationTheme':
            applyPresentationTheme(command.value);
            break;
        }
        return;
      }

      if (command.command !== 'exportPreview') {
        return;
      }

      const requestId = String(command.requestId || Date.now());

      if (!canConvertToPdf) {
        sendMessage({
          type: 'officePreviewExportError',
          requestId,
          message: 'This document preview cannot be converted to PDF.',
        });
        return;
      }

      const html = buildPrintableHtml(command.title || sourceFileName);
      chunkAndSendHtml(requestId, html);
    }

    window.dispatchViewerCommand = handleOfficePreviewCommand;

    function handleIncomingMessage(message) {
      try {
        const parsed = JSON.parse(message);
        handleOfficePreviewCommand(parsed);
      } catch (_) {}
    }

    window.addEventListener('message', function(event) {
      handleIncomingMessage(event.data);
    });
    document.addEventListener('message', function(event) {
      handleIncomingMessage(event.data);
    });
    document.addEventListener('focusin', function(event) {
      rememberEditableTarget(event.target);
    });
    document.addEventListener('click', function(event) {
      rememberEditableTarget(event.target);

      if (event.target instanceof HTMLImageElement && previewRoot.contains(event.target)) {
        setSelectedImage(event.target);
        return;
      }

      if (previewRoot.contains(event.target)) {
        clearSelectedImage();
      }
    });
    imageSelectionHandle.addEventListener('mousedown', startImageResize);
    imageSelectionHandle.addEventListener('touchstart', startImageResize, {
      passive: false,
    });
    document.addEventListener('mousemove', updateImageResize);
    document.addEventListener('mouseup', endImageResize);
    document.addEventListener('touchmove', updateImageResize, {
      passive: false,
    });
    document.addEventListener('touchend', endImageResize, {
      passive: false,
    });
    document.addEventListener('touchcancel', endImageResize, {
      passive: false,
    });
    window.addEventListener('resize', updateSelectedImageOverlayPosition);
    window.addEventListener('scroll', updateSelectedImageOverlayPosition, true);

    window.addEventListener(
      'error',
      function(event) {
        if (event && event.target && event.target.src) {
          renderUnsupported('Failed to load preview script: ' + event.target.src);
        }
      },
      true
    );

    renderPreview();
  </script>
</body>
</html>
  `.trim();
}
