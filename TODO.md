# TODO｜頭竹苗福利社平台下一階段

## 1. 上傳與部署
- [ ] 將扁平版檔案全部上傳到 GitHub Repository 根目錄
- [ ] 確認 GitHub Pages 可正常打開 `index.html`
- [ ] 確認每個頁面連結正常
- [ ] 確認手機版選單正常

## 2. 特約商資料整理
- [ ] 將現有 Google 表單回應整理成正式特約商資料
- [ ] 每家店建立固定 `shop_id`
- [ ] 補齊分類、地區、優惠、地址、電話、社群連結
- [ ] 更新 `shops.json`
- [ ] 設定精選店家 `is_featured: true`

## 3. Logo 圖片
- [ ] 將特約商 Logo 放到 `pics/logo/`
- [ ] 每張 Logo 建議以 `shop_id` 命名，例如 `shop001.png`
- [ ] 修改 `shops.json` 的 `logo` 欄位
- [ ] 沒有 Logo 的店家先使用 `pics/logo/default-logo.svg`

## 4. 特約商專區表單
- [ ] 將現有 Google 表單第一題改為「我要加入特約商店 / 我已是特約商，要更新資料」
- [ ] 新店家導向完整申請區段
- [ ] 已合作店家導向資料更新區段
- [ ] 官網 `merchant.html` 的 CTA 連到該表單

## 5. 未來自動化
- [ ] 用 Google Apps Script 將正式資料輸出成 JSON
- [ ] 用 Codex 協助建立 Logo 批次下載工具
- [ ] 用半自動流程更新 `shops.json`
