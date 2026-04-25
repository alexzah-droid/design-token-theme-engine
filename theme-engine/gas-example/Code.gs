/**
 * Design System Engine 2 — GAS HTML Service Example
 *
 * Deploy as Web App (Execute as: Me, Who has access: Anyone)
 * or use as a Sheets/Docs add-on sidebar.
 */

function doGet() {
  var template = HtmlService.createTemplateFromFile('Page');
  return template.evaluate()
    .setTitle('Invoice Manager')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

/**
 * Helper: include contents of another HTML file.
 * Usage in templates: <?!= include('Styles'); ?>
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
