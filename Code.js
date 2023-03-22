/*
  w1jp LOGGER
190424:v0.1: W1JP JON
221009:v0.2: jon@pellant.com: Updated to V8 (ES6ish)
---------------------------
*/

// GLOBALS
const version = 0.2; // Version of this script.

// Process global properties
const props = PropertiesService.getScriptProperties().getProperties();
props.debug = JSON.parse(props.debug);
if (props.session) props.session = JSON.parse(props.session);
else props.session = {key: null, expire:0};
props.columns = fetchColNames();
props.TIMESTAMP_COL = props.columns.findIndex(e => e === "TIMESTAMP");

// MENU SET
function onOpen(e) {
  SpreadsheetApp.getUi()
      .createMenu('W1JP Logger')
      .addItem('Add new log', 'addLog')
      .addItem('QRZ Lookup', 'showSidebar')
      .addItem('Clear log entries', 'clearSheet')
      .addToUi();
}

// FUNCTIONS
function jlog(msg) {
  console.log(`W1JP Logger (v${version}): ${msg}`);

}
function dlog(msg) {
  if (props.debug) jlog(msg);
}

// FETCH COLUMN NAMES
// Fetch the column names from the spreadsheet (so I don't have to hard-code them)
function fetchColNames(){
  const sheet = SpreadsheetApp.getActiveSheet();
  // Column lables are on row 3.
  const columns = sheet.getRange(3,1,1, sheet.getLastColumn()).getValues()[0];
  dlog('Columns: '+columns);
  return columns;
}

// ADDTOSHEET
// This function adds the current sidebar call sign to the sheet with embedded details if they exist.
// ham = object of column names.
function addToSheet(ham){
  const msg = 'addToSheet: ';
  dlog(msg+'Invoked with: '+ham);
  const sheet = SpreadsheetApp.getActiveSheet();
  
  // create row data
  const row = columns.map(col => {
    if (col === "INDEX") return sheet.getLastRow() - 2;
    else if (col === "TIMESTAMP") return new Date();
    else if (col === "FREQUENCY") return (ham.frequency)? ham.frequency:'';
    else if (col === "CALL") return (ham.call)? ham.call:'';
    else if (col === "GIVEN NAME") return (ham.fname)? ham.fname:'';
    else if (col === "SIRNAME") return (ham.lname)? ham.lname:'';
    else if (col === "LATLNG") {
      
    }
    else return '';
  })
  // append the row
  sheet.appendRow(row);
  jlog(msg+'Appended row: '+row);
  sheet.getRange(sheet.getLastRow(), props.TIMESTAMP_COL).setNumberFormat('hh:mm:ss'); // update the format of the timestamp to match
  
}

// CLEARSHEET
/// This will clear all of the entries in the sheet
function clearSheet(){
  const sheet = SpreadsheetApp.getActiveSheet();
  sheet.getRange(4, 1, sheet.getLastRow()-3, sheet.getLastColumn()).clearContent(); // entries start at row 4.
}

// ADDLOG
/// this will add a new sheet and copy the header.
function addLog(){
  const date = new Date();
  let dateStr = '';
  // create datestring
  dateStr += leadZero(date.getFullYear()-2000);
  dateStr += leadZero(date.getMonth()+1);
  dateStr += leadZero(date.getDate());
  // create new sheet
  const ssheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ssheet.insertSheet(dateStr);
  // copy header from first sheet
  const source = ssheet.getSheets()[0];
  source.getRange(1,1, 3, source.getLastColumn()).copyTo(sheet.getRange(1,1));
  // copy the column widths.
  let widths = [];
  for (let i = 1; i <= source.getLastColumn(); ++i){
    const srcWidth = source.getColumnWidth(i);
    widths.push(srcWidth);
    sheet.setColumnWidth(i, srcWidth);
  }
  dlog(`addLog: added column widths: ${widths}`);

  // change the date to today
  const dateField = 'F2';
  sheet.getRange(dateField).setValue(date).setNumberFormat('MM/dd/yy');

}


// LEADZERO
function leadZero(n){
  let s = '';
  if (n<10) s+= '0';
  return s+= n;
}

// SIDEBAR
function showSidebar() {
  const sidebar = HtmlService.createHtmlOutputFromFile('logger');
  sidebar.setTitle('QRZ Search');
  SpreadsheetApp.getUi().showSidebar(sidebar);
}