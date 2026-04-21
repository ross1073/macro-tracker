// Macro Tracker — Google Apps Script Web App
// Paste this entire file into Extensions → Apps Script on your macro-tracker sheet.
// Then Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone.
// Copy the deployment URL and set it as APPS_SCRIPT_URL in Netlify.

const EXERCISE_TAB = 'Exercise';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    let tabName;
    if (data.type === 'exercise') {
      tabName = EXERCISE_TAB;
    } else {
      return json({ error: `Unsupported type: ${data.type}` });
    }

    const tab = ss.getSheetByName(tabName);
    if (!tab) return json({ error: `Tab "${tabName}" not found` });

    const lastCol = tab.getLastColumn();
    const headers = lastCol > 0
      ? tab.getRange(1, 1, 1, lastCol).getValues()[0]
      : [];

    // If the sheet is empty, write a sensible header row first.
    if (headers.length === 0 || headers.every(h => !h)) {
      const defaultHeaders = ['Timestamp', 'Activity', 'Duration (min)', 'Calories Burned', 'Notes'];
      tab.getRange(1, 1, 1, defaultHeaders.length).setValues([defaultHeaders]);
      const row = defaultHeaders.map(h => pick(data, h));
      tab.appendRow(row);
      return json({ ok: true, wroteHeaders: true });
    }

    const row = headers.map(h => pick(data, h));
    tab.appendRow(row);
    return json({ ok: true });
  } catch (err) {
    return json({ error: String(err && err.message || err) });
  }
}

// Match a header to an incoming data key. Loose matching so "Activity Type",
// "Activity", and "activity" all pair with data.activity, etc.
function pick(data, header) {
  if (!header) return '';
  const norm = s => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
  const target = norm(header);
  const keys = Object.keys(data);

  for (const k of keys) if (norm(k) === target) return data[k];
  for (const k of keys) {
    const nk = norm(k);
    if (target.startsWith(nk) || nk.startsWith(target)) return data[k];
  }
  return '';
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
