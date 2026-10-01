// Photo Selection Feedback – Apps Script backend (bound to a Google Sheet)
// Setup: Project Settings > Script properties > add ADMIN_KEY = <long random string>
const SHEET_NAME = "Feedback";
const TZ = "Asia/Kolkata";
const HEADERS = ["id","timestamp","received_at","rating","useful","features","time_saved",
  "cost","reuse","recommend","interest","phone","suggestion","consent","email"];

function json_(o){
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function clean_(v, max){ return String(v == null ? "" : v).trim().slice(0, max || 300); }

function getSheet_(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  // Old 12-column layout? Keep it as a dated archive instead of mixing columns.
  if (sh && sh.getLastRow() > 0 && sh.getRange(1,1).getValue() !== "id") {
    sh.setName("Feedback_old_" + Utilities.formatDate(new Date(), TZ, "yyyyMMdd_HHmm"));
    sh = null;
  }
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, sh.getMaxRows(), HEADERS.length).setNumberFormat("@"); // plain text: no formula injection, phones keep format
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }
  if (sh.getLastRow() > 0 && sh.getLastColumn() < HEADERS.length) {   // older sheet: add the newest column(s)
    sh.getRange(1, 1, sh.getMaxRows(), HEADERS.length).setNumberFormat("@");
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight("bold");
  }
  return sh;
}

function doPost(e){
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);                       // safe for simultaneous submissions
    const d = JSON.parse(e.postData.contents);
    if (d.website) return json_({ok:true});     // honeypot: silently drop bots
    const rating = Number(d.rating);
    const phone = clean_(d.phone, 20).replace(/[\s-]/g, "");
    const email = clean_(d.email, 120).toLowerCase();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json_({ok:false, error:"invalid"});
    if (!(rating >= 1 && rating <= 5)) return json_({ok:false, error:"invalid"});
    if (phone && !/^(\+?91)?[6-9]\d{9}$/.test(phone)) return json_({ok:false, error:"invalid"});

    const sh = getSheet_();
    const id = clean_(d.id, 40);
    if (id && sh.getRange("A:A").createTextFinder(id).matchEntireCell(true).findNext())
      return json_({ok:true, duplicate:true});  // retry of an already-saved submission

    sh.appendRow([id, clean_(d.timestamp,40), new Date().toISOString(), String(rating),
      clean_(d.useful,60), clean_(d.features,300), clean_(d.time_saved,40), clean_(d.cost,40),
      clean_(d.reuse,40), clean_(d.recommend,40), clean_(d.interest,60), phone,
      clean_(d.suggestion,1500), clean_(d.consent,10), email]);
    return json_({ok:true});
  } catch (err) {
    return json_({ok:false, error:"server"});
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function doGet(e){
  const p = e.parameter || {};
  if (p.action !== "list") return ContentService.createTextOutput("OK");
  const key = PropertiesService.getScriptProperties().getProperty("ADMIN_KEY");
  if (!key || p.key !== key) return json_({error:"unauthorized"});   // contact numbers are no longer public
  const sh = getSheet_();
  if (sh.getLastRow() < 2) return json_([]);
  const v = sh.getDataRange().getValues(), h = v.shift();
  return json_(v.map(r => Object.fromEntries(h.map((k,i) => [k, r[i]]))));
}

// Daily copy of the sheet into a Drive folder; copies older than 30 days are trashed.
// Run setupBackupTrigger() once from the editor.
function dailyBackup(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const it = DriveApp.getFoldersByName("Feedback Backups");
  const folder = it.hasNext() ? it.next() : DriveApp.createFolder("Feedback Backups");
  DriveApp.getFileById(ss.getId()).makeCopy(
    ss.getName() + " backup " + Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd"), folder);
  const cutoff = Date.now() - 30 * 864e5, files = folder.getFiles();
  while (files.hasNext()) { const f = files.next(); if (f.getDateCreated().getTime() < cutoff) f.setTrashed(true); }
}
function setupBackupTrigger(){ ScriptApp.newTrigger("dailyBackup").timeBased().everyDays(1).atHour(2).create(); }
