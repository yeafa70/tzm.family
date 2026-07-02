/**
 * 頭竹苗福利社：優惠使用確認紀錄 Google Apps Script
 *
 * 使用方式：
 * 1. 建立一份 Google Sheet。
 * 2. 將下方 SPREADSHEET_ID 改成你的試算表 ID。
 * 3. 在 Apps Script 部署為 Web App。
 * 4. 執行身分選「我」，存取權限選「任何人」。
 * 5. 將 Web App URL 填到 redeem.html 的 window.TZM_REDEEM_LOG_URL。
 */

const SPREADSHEET_ID = '請填入你的 Google Sheet ID';
const SHEET_NAME = 'redeem_logs';

function doPost(e) {
  try {
    const data = parsePayload_(e);
    appendRedeemLog_(data);
    return json_({ ok: true });
  } catch (error) {
    return json_({ ok: false, error: String(error) });
  }
}

function doGet() {
  return json_({
    ok: true,
    service: 'tzm_redeem_tracker',
    message: '頭竹苗福利社優惠使用確認紀錄 API 正常'
  });
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('缺少 POST body');
  }
  return JSON.parse(e.postData.contents);
}

function appendRedeemLog_(data) {
  const sheet = getLogSheet_();
  sheet.appendRow([
    new Date(),
    data.event_id || '',
    data.event_type || 'redeem_confirmed',
    data.confirmed_at || '',
    data.shop_id || '',
    data.shop_name || '',
    data.category || '',
    data.area || '',
    data.offer || '',
    data.source || '',
    data.from || '',
    data.client_id || '',
    data.page_url || '',
    data.user_agent || ''
  ]);
}

function getLogSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  ensureHeader_(sheet);
  return sheet;
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() > 0) return;
  sheet.appendRow([
    '寫入時間',
    '紀錄編號',
    '事件類型',
    '確認時間',
    '店家ID',
    '店家名稱',
    '分類',
    '地區',
    '優惠內容',
    '來源',
    '入口位置',
    '匿名用戶ID',
    '頁面網址',
    'User Agent'
  ]);
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
