function include(page) {
  if (!page) page = 'include';
  return HtmlService.createHtmlOutputFromFile(page).getContent();
}
