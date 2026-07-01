# 頭竹苗福利社 Logo 樣式與缺圖整理報告

## 一、整理結果摘要
- 店家資料筆數：68 家
- 預設缺圖 Logo：pics/logo/tzm0000.png
- 店家正式 Logo 規則：pics/logo/{shop.id}.webp，例如 pics/logo/tzm0001.webp
- Logo 卡片樣式：單層容器、無內框、零 padding、圖片滿版顯示。
- 店家正式 WebP：已重新裁白邊並整理成正方形，降低縮在中間的狀況。
- 缺圖店家：4 家

## 二、本次調整
- shops.js：fallback 預設圖改為 pics/logo/tzm0000.png。
- shops.js：保留先讀 shops.json、背景讀 GAS API 的資料流程。
- style.css：店家卡片、Modal、首頁精選 Logo 容器改為單層、無內框、零 padding、滿版顯示。
- pics/logo/tzm0000.png：透明背景福利社預設 Logo。
- pics/logo/tzm0073.webp：補上奕星攝影個人工作室正式 Logo。

## 三、缺圖店家
- tzm0005｜沐寶髮浴｜pics/logo/tzm0005.webp｜缺圖，使用 pics/logo/tzm0000.png
- tzm0006｜世鼎國際事業有限公司｜pics/logo/tzm0006.webp｜缺圖，使用 pics/logo/tzm0000.png
- tzm0048｜Na’s Studio｜耳燭｜體雕｜頭療｜暖宮｜pics/logo/tzm0048.webp｜缺圖，使用 pics/logo/tzm0000.png
- tzm0067｜全植薆經典美容館｜pics/logo/tzm0067.webp｜缺圖，使用 pics/logo/tzm0000.png

## 四、確認事項
- 未修改 index.html。
- 未修改 shops.json 店家 id。
- 未改店家正式 Logo 命名規則。
- 未改成優先讀 GAS。
