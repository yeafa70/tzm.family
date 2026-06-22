# 頭竹苗福利社｜扁平版 GitHub Pages 官網

這版已改成「好上傳、好修改」的扁平資料夾結構。

## 檔案結構

```txt
/
├─ index.html
├─ card.html
├─ shops.html
├─ merchant.html
├─ company.html
├─ about.html
├─ news.html
├─ style.css
├─ main.js
├─ shops.js
├─ shops.json
├─ categories.json
├─ areas.json
├─ README.md
├─ TODO.md
└─ pics/
   └─ logo/
      └─ default-logo.svg
```

## 設計原則

- HTML、CSS、JS、JSON 都放第一層，方便直接在 GitHub 修改與上傳。
- 只有圖片放在 `pics/` 裡。
- 已取消 `assets/css/`、`assets/js/`、`data/` 這種第二層資料夾。
- 已取消 `update.html`，店家加入與資料更新統一放在 `merchant.html`。
- 所有資料更新入口都導向 `merchant.html#update`。

## 部署到 GitHub Pages

1. 將此資料夾內所有檔案上傳到 GitHub Repository 根目錄。
2. Repository → Settings → Pages。
3. Source 選 `Deploy from a branch`。
4. Branch 選 `main`，資料夾選 `/root`。
5. 儲存後等待 GitHub Pages 產生網址。

## 修改特約商資料

目前特約商資料在：

```txt
shops.json
```

Logo 圖片路徑建議放在：

```txt
pics/logo/
```

例如：

```json
"logo": "pics/logo/shop001.png"
```


## GA4 追蹤

已加入 GA4 Measurement ID：

```txt
G-5YNZ2NS7L2
```

目前包含：
- 基礎頁面瀏覽追蹤
- 免費領卡點擊：`line_card_click`
- 特約商申請表單點擊：`merchant_form_click`
- 特約公司合作點擊：`company_partner_click`
- 店家地圖導航點擊：`shop_map_click`
- 店家詳情點擊：`shop_detail_click`
- 店家分享點擊：`shop_share_click`
- 特約商搜尋：`shop_search`
- 分類 / 地區篩選：`shop_filter_change`
