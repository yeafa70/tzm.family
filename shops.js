const SHOP_CONFIG = {
  lineCardUrl: "https://lin.ee/OuiR6gV",
  defaultLogo: "pics/logo/tzm0000.png"
};

const SHOPS_API_URL = 'https://script.google.com/macros/s/AKfycbzTQNG4GSWTSSLOI5hw37B-CnsYUjJObX2CxXEz_nrT541VjPgUune4_ywxnCb91jyn/exec?action=shops';
// GitHub Pages 同一 repo / 同一目錄下的靜態 shops.json，作為快速顯示與備援資料。
const SHOPS_FALLBACK_URL = 'shops.json';

const CATEGORY_ORDER = [
  "美食飲品",
  "美容美體",
  "生活服務",
  "零售購物",
  "親子教育",
  "通訊3C",
  "休閒娛樂",
  "居家修繕",
  "醫療保健",
  "交通機車",
  "住宿旅遊",
  "企業服務",
  "其他"
];
const AREA_ORDER = ["竹南", "頭份", "苗栗市", "後龍", "公館", "南庄", "造橋", "三灣", "西湖", "頭屋", "銅鑼", "三義", "通霄", "苑裡", "卓蘭", "大湖", "獅潭", "泰安", "外縣市", "其他地區"];
const FEATURED_SHOP_MATCHERS = [
  { label: "丘森茶室", tests: ["丘森茶室"] },
  { label: "買樂購", tests: ["買樂購"] },
  { label: "親蜜家優床館", tests: ["親蜜家優床館", "親密家優床館"] },
  { label: "十畝園味", tests: ["十畝園味"] }
];

const LEGACY_CATEGORY_MAP = new Map([
  ["食", "美食飲品"],
  ["美食餐飲", "美食飲品"],
  ["衣", "零售購物"],
  ["零售業", "零售購物"],
  ["住", "生活服務"],
  ["行", "交通機車"],
  ["服務業", "生活服務"],
  ["育", "親子教育"],
  ["樂", "休閒娛樂"],
  ["通訊業", "通訊3C"]
]);

const AREA_MAP = new Map([
  ["竹南鎮", "竹南"],
  ["竹南", "竹南"],
  ["頭份市", "頭份"],
  ["頭份", "頭份"],
  ["苗栗市", "苗栗市"],
  ["南庄鄉", "南庄"],
  ["南庄", "南庄"],
  ["後龍鎮", "後龍"],
  ["後龍", "後龍"],
  ["公館鄉", "公館"],
  ["公館", "公館"],
  ["造橋鄉", "造橋"],
  ["造橋", "造橋"],
  ["三灣鄉", "三灣"],
  ["三灣", "三灣"],
  ["西湖鄉", "西湖"],
  ["西湖", "西湖"],
  ["頭屋鄉", "頭屋"],
  ["頭屋", "頭屋"],
  ["銅鑼鄉", "銅鑼"],
  ["銅鑼", "銅鑼"],
  ["三義鄉", "三義"],
  ["三義", "三義"],
  ["通霄鎮", "通霄"],
  ["通霄", "通霄"],
  ["苑裡鎮", "苑裡"],
  ["苑裡", "苑裡"],
  ["卓蘭鎮", "卓蘭"],
  ["卓蘭", "卓蘭"],
  ["大湖鄉", "大湖"],
  ["大湖", "大湖"],
  ["獅潭鄉", "獅潭"],
  ["獅潭", "獅潭"],
  ["泰安鄉", "泰安"],
  ["泰安", "泰安"]
]);

const EXTERNAL_AREA_PATTERN = /(新竹|桃園|台中|臺中|台北|臺北|新北|基隆|宜蘭|彰化|南投|雲林|嘉義|台南|臺南|高雄|屏東|花蓮|台東|臺東|澎湖|金門|連江)/;

const FALLBACK_SHOPS = [
  {
    id: "fallback-001",
    name: "竹南小島咖啡",
    category: "美食飲品",
    area: "竹南",
    offer: "持福利卡消費享指定飲品優惠。",
    description: "提供咖啡、輕食與安靜座位，適合日常聚會與工作休息。",
    address: "苗栗縣竹南鎮",
    phone: "",
    business_hours: "",
    map_url: "https://www.google.com/maps/search/?api=1&query=竹南咖啡",
    website_url: "",
    facebook_url: "",
    instagram_url: "",
    line_url: "",
    logo: SHOP_CONFIG.defaultLogo,
    images: [],
    is_featured: true,
    is_active: true,
    sort_order: 1,
    updated_at: ""
  }
];

let shops = [];
let categoryOptions = [];
let areaOptions = [];
let shopDirectoryInitialized = false;

const $ = id => document.getElementById(id);

function normalizeCategory(category) {
  const value = String(category || "").trim();
  if (!value) return "其他";
  if (CATEGORY_ORDER.includes(value)) return value;
  return LEGACY_CATEGORY_MAP.get(value) || "其他";
}

function normalizeArea(area, address = "") {
  const text = [area, address].map(value => String(value || "").trim()).filter(Boolean).join(" ");
  if (!text || /^https?:\/\//i.test(text)) return "其他地區";
  for (const [needle, label] of AREA_MAP.entries()) {
    if (text.includes(needle)) return label;
  }
  if (EXTERNAL_AREA_PATTERN.test(text)) return "外縣市";
  return "其他地區";
}

function resolveCategoryParam(category) {
  const value = String(category || "").trim();
  if (!value) return "";
  if (CATEGORY_ORDER.includes(value) || LEGACY_CATEGORY_MAP.has(value)) return normalizeCategory(value);
  return "";
}

function resolveAreaParam(area) {
  const value = String(area || "").trim();
  if (!value) return "";
  if (AREA_ORDER.includes(value) || AREA_MAP.has(value)) return normalizeArea(value);
  return "";
}

function normalizeImages(images) {
  if (Array.isArray(images)) return images.map(value => String(value).trim()).filter(Boolean);
  if (typeof images === "string") return images.split(/[,，、\n\r]+/).map(value => value.trim()).filter(Boolean);
  return [];
}

function normalizeBoolean(value, defaultValue = true) {
  if (value === true) return true;
  if (value === false) return false;
  const text = String(value ?? "").trim().toUpperCase();
  if (["TRUE", "是", "YES", "Y", "1"].includes(text)) return true;
  if (["FALSE", "否", "NO", "N", "0"].includes(text)) return false;
  return defaultValue;
}

function normalizeShop(row, index = 0) {
  const sort = Number(row.sort_order);

  return {
    id: String(row.id || row.shop_id || row.name || `shop-${index + 1}`),
    name: row.name || row.shop_name || "未命名店家",
    category: normalizeCategory(row.category),
    area: normalizeArea(row.area, row.address),
    offer: row.offer || row.discount || "詳細優惠以本平台公告為主要依據。",
    description: row.description || row.desc || "",
    address: row.address || "",
    phone: row.phone || "",
    business_hours: row.business_hours || row.hours || "",
    map_url: row.map_url || row.mapUrl || "",
    website_url: row.website_url || row.websiteUrl || "",
    facebook_url: row.facebook_url || row.facebookUrl || "",
    instagram_url: row.instagram_url || row.instagramUrl || "",
    line_url: row.line_url || row.lineUrl || "",
    logo: row.logo || row.logo_url || row.logoUrl || SHOP_CONFIG.defaultLogo,
    images: normalizeImages(row.images),
    is_featured: normalizeBoolean(row.is_featured ?? row.featured, false),
    is_active: normalizeBoolean(row.is_active ?? row.active, true),
    sort_order: Number.isFinite(sort) ? sort : index + 1,
    updated_at: row.updated_at || ""
  };
}

async function fetchWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }

    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function loadStaticShopsJson() {
  const data = await fetchWithTimeout(SHOPS_FALLBACK_URL, 5000);
  if (!data || !Array.isArray(data.shops)) {
    throw new Error('shops.json 回傳格式不正確');
  }
  return {
    shops: data.shops || [],
    categories: data.categories || [],
    areas: data.areas || [],
    updated_at: data.updated_at || '',
    source: 'shops_json_static'
  };
}

async function loadGasApiData() {
  const data = await fetchWithTimeout(SHOPS_API_URL, 8000);
  if (!data || !Array.isArray(data.shops)) {
    throw new Error('GAS API 回傳格式不正確');
  }
  return {
    shops: data.shops || [],
    categories: data.categories || [],
    areas: data.areas || [],
    updated_at: data.updated_at || '',
    source: 'gas_api_background'
  };
}

function applyShopsData(data) {
  shops = (data?.shops || [])
    .map(normalizeShop)
    .filter(shop => shop.is_active)
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, "zh-Hant"));

  if (!shops.length) {
    console.warn("店家資料目前為空。");
  }

  categoryOptions = sortByPreferredOrder([
    ...CATEGORY_ORDER,
    ...buildOptions(data?.categories, shops.map(shop => shop.category), normalizeCategory, CATEGORY_ORDER)
  ], CATEGORY_ORDER);
  areaOptions = collectAreasFromShops(shops, data?.areas);

  if ($("shopGrid")) {
    if (shopDirectoryInitialized) {
      populateDirectoryFilters({ preserveCurrent: true });
      updateDirectoryUrl();
      renderShops();
    } else {
      initShopDirectory();
    }
  }
  if ($("featuredShopGrid")) renderFeaturedShops();
}

async function initShopsPage() {
  try {
    const staticData = await loadStaticShopsJson();
    applyShopsData(staticData);
    console.log('已先從 GitHub Pages shops.json 載入資料', staticData);

    loadGasApiData()
      .then(apiData => {
        applyShopsData(apiData);
        console.log('已用 GAS API 背景資料更新畫面', apiData);
      })
      .catch(apiError => {
        console.warn('GAS API 背景更新失敗，不影響畫面：', apiError);
      });
  } catch (staticError) {
    console.warn('shops.json 載入失敗，改嘗試 GAS API：', staticError);

    try {
      const apiData = await loadGasApiData();
      applyShopsData(apiData);
      console.log('shops.json 失敗，已改用 GAS API 載入資料', apiData);
    } catch (apiError) {
      console.error('shops.json 與 GAS API 都失敗：', apiError);
      showShopLoadError();
    }
  }
}

async function loadShops() {
  await initShopsPage();
}

function showShopLoadError(error) {
  console.error("店家資料載入失敗：", error);
  const grid = $("shopGrid");
  const empty = $("emptyState");
  if (grid) grid.innerHTML = "";
  if (empty) {
    empty.textContent = "目前無法載入店家資料，請稍後再試。";
    empty.style.display = "block";
  }
}

function optionName(option) {
  if (typeof option === "string") return option;
  if (option && typeof option === "object") return option.name || option.title || option.id || "";
  return "";
}

function sortByPreferredOrder(values, preferred) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => {
    const ai = preferred.indexOf(a);
    const bi = preferred.indexOf(b);
    if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    return a.localeCompare(b, "zh-Hant");
  });
}

function buildOptions(sourceOptions, fallbackValues, normalizer, preferred) {
  const raw = Array.isArray(sourceOptions) && sourceOptions.length
    ? sourceOptions.map(optionName)
    : fallbackValues;
  const normalized = raw.map(normalizer).filter(Boolean);
  return sortByPreferredOrder(normalized, preferred);
}

function collectAreasFromShops(shopList, sourceAreas) {
  const source = Array.isArray(sourceAreas) ? sourceAreas.map(optionName) : [];
  const detected = shopList.flatMap(shop => [
    normalizeArea(shop.area, shop.address),
    normalizeArea("", shop.address)
  ]);
  const values = [...source.map(value => normalizeArea(value)), ...detected].filter(value => value && value !== "其他地區");
  return sortByPreferredOrder(values, AREA_ORDER);
}

function trackGaEvent(eventName, params = {}) {
  if (typeof window.gtag !== "function") return;
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
  window.gtag("event", eventName, {
    page_path: window.location.pathname,
    ...cleanParams
  });
}

function shopGaParams(shop, params = {}) {
  if (!shop) return params;
  return {
    shop_id: shop.id || "",
    shop_name: shop.name || "",
    category: shop.category || "",
    area: shop.area || "",
    ...params
  };
}

function populateDirectoryFilters({ preserveCurrent = true } = {}) {
  const categorySelect = $("categorySelect");
  const areaSelect = $("areaSelect");
  const categoryChips = $("categoryChips");
  const searchInput = $("searchInput");
  if (!categorySelect || !areaSelect || !categoryChips || !searchInput) return;

  const query = new URLSearchParams(window.location.search);
  const rawQueryCategory = preserveCurrent ? categorySelect.value : query.get("category") || "";
  const rawQueryArea = preserveCurrent ? areaSelect.value : query.get("area") || "";
  const queryCategory = resolveCategoryParam(rawQueryCategory);
  const queryArea = resolveAreaParam(rawQueryArea);
  const categories = categoryOptions.length ? categoryOptions : buildOptions(null, shops.map(shop => shop.category), normalizeCategory, CATEGORY_ORDER);
  const areas = areaOptions.length ? areaOptions : buildOptions(null, shops.map(shop => shop.area), normalizeArea, AREA_ORDER);

  categorySelect.innerHTML = '<option value="">全部分類</option>' + categories.map(value => `<option value="${esc(value)}">${esc(value)}</option>`).join("");
  areaSelect.innerHTML = '<option value="">全部地區</option>' + areas.map(value => `<option value="${esc(value)}">${esc(value)}</option>`).join("");
  categoryChips.innerHTML = '<button class="chip active" type="button" data-category="">全部</button>' + categories.map(value => `<button class="chip" type="button" data-category="${esc(value)}">${esc(value)}</button>`).join("");

  if (categories.includes(queryCategory)) categorySelect.value = queryCategory;
  if (areas.includes(queryArea)) areaSelect.value = queryArea;
  if (!preserveCurrent) searchInput.value = query.get("q") || "";

  document.querySelectorAll(".chip").forEach(chip => {
    chip.classList.toggle("active", (chip.dataset.category || "") === categorySelect.value);
    chip.addEventListener("click", () => {
      categorySelect.value = chip.dataset.category || "";
      document.querySelectorAll(".chip").forEach(item => item.classList.remove("active"));
      chip.classList.add("active");
      updateDirectoryUrl();
      trackGaEvent("category_filter_change", {
        category: categorySelect.value || "全部分類",
        section: "shops_filter"
      });
      renderShops();
    });
  });
}

function initShopDirectory() {
  const categorySelect = $("categorySelect");
  const areaSelect = $("areaSelect");
  const categoryChips = $("categoryChips");
  const searchInput = $("searchInput");
  const resetBtn = $("resetBtn");
  if (!categorySelect || !areaSelect || !categoryChips || !searchInput || !resetBtn) return;

  populateDirectoryFilters({ preserveCurrent: false });

  searchInput.addEventListener("input", () => {
    updateDirectoryUrl();
    renderShops();
  });
  categorySelect.addEventListener("change", () => {
    document.querySelectorAll(".chip").forEach(chip => {
      chip.classList.toggle("active", (chip.dataset.category || "") === categorySelect.value);
    });
    updateDirectoryUrl();
    trackGaEvent("category_filter_change", {
      category: categorySelect.value || "全部分類",
      section: "shops_filter"
    });
    renderShops();
  });
  areaSelect.addEventListener("change", () => {
    updateDirectoryUrl();
    trackGaEvent("area_filter_change", {
      area: areaSelect.value || "全部地區",
      section: "shops_filter"
    });
    renderShops();
  });
  resetBtn.addEventListener("click", () => {
    searchInput.value = "";
    categorySelect.value = "";
    areaSelect.value = "";
    document.querySelectorAll(".chip").forEach(chip => chip.classList.toggle("active", !chip.dataset.category));
    updateDirectoryUrl();
    renderShops();
  });

  shopDirectoryInitialized = true;
  updateDirectoryUrl();
  renderShops();
}

function updateDirectoryUrl() {
  if (!window.history || typeof window.history.replaceState !== "function") return;
  const params = new URLSearchParams();
  const keyword = ($("searchInput")?.value || "").trim();
  const category = $("categorySelect")?.value || "";
  const area = $("areaSelect")?.value || "";

  if (keyword) params.set("q", keyword);
  if (category) params.set("category", category);
  if (area) params.set("area", area);

  const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}${window.location.hash || ""}`;
  window.history.replaceState({}, "", nextUrl);
}

function getFilteredShops() {
  const keyword = ($("searchInput")?.value || "").trim().toLowerCase();
  const category = $("categorySelect")?.value || "";
  const area = $("areaSelect")?.value || "";

  return shops.filter(shop => {
    const text = [
      shop.name,
      shop.category,
      shop.area,
      shop.offer,
      shop.description,
      shop.address,
      shop.phone,
      shop.business_hours
    ].join(" ").toLowerCase();
    return (!keyword || text.includes(keyword)) && (!category || shop.category === category) && (!area || shop.area === area);
  });
}

function renderFeaturedShops() {
  const grid = $("featuredShopGrid");
  if (!grid) return;

  const list = FEATURED_SHOP_MATCHERS.map(matcher => {
    const found = shops.find(shop => matcher.tests.some(test => shop.name.includes(test)));
    if (!found) console.warn(`找不到精選合作店家：${matcher.label}`);
    return found;
  }).filter(Boolean);
  grid.innerHTML = list.map(featuredCard).join("");
}

function featuredCard(shop) {
  const linkUrl = `shops.html?q=${encodeURIComponent(shop.name)}`;
  return `<a class="feature-card" href="${attr(linkUrl)}" data-ga-event="featured_shop_click" data-ga-section="featured_shops" data-ga-shop-name="${attr(shop.name)}" data-ga-shop-id="${attr(shop.id)}">
    <div class="feature-photo logo-frame">${logoImage(shop, "feature-logo")}</div>
    <div class="feature-content">
      <div class="feature-title">${esc(shop.name)}</div>
      <div class="feature-meta">${esc(shop.area)}</div>
      <div class="feature-tag-row">
        <span class="feature-tag">${esc(shop.category)}</span>
        <span class="feature-tag">${esc(shop.area)}</span>
      </div>
      <div class="feature-offer">${esc(shop.offer)}</div>
    </div>
  </a>`;
}

function renderShops() {
  const grid = $("shopGrid");
  const empty = $("emptyState");
  if (!grid || !empty) return;

  const list = getFilteredShops();
  if (!list.length) {
    grid.innerHTML = "";
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";
  grid.innerHTML = list.map(shopCard).join("");
}

function shopCard(shop) {
  const navigationUrl = shop.map_url || mapUrl(shop);
  const useOfferUrl = redeemUrl(shop, "shop_card");
  return `<article class="shop-card">
    <div class="shop-logo-box">${logoImage(shop, "shop-logo")}</div>
    <div class="shop-content">
      <div class="shop-head">
        <div><h3>${esc(shop.name)}</h3></div>
      </div>
      <div class="tags"><span class="tag">${esc(shop.category)}</span><span class="tag area">${esc(shop.area)}</span></div>
      <div class="offer">${esc(shop.offer)}</div>
    </div>
    <div class="shop-actions">
      <a class="mini-btn primary" href="${attr(useOfferUrl)}" aria-label="使用 ${attr(shop.name)} 優惠" onclick="trackRedeemStart('${js(shop.id)}', this.href, 'shop_card')">使用</a>
      <button class="mini-btn" type="button" aria-label="查看 ${attr(shop.name)} 詳情" onclick="openShop('${js(shop.id)}')">詳情</button>
      <a class="mini-btn" href="${attr(navigationUrl)}" target="_blank" rel="noopener" aria-label="開啟 ${attr(shop.name)} Google 地圖導航" onclick="trackShopNavigation('${js(shop.id)}', this.href, 'shop_card')">導航</a>
      <button class="mini-btn" type="button" onclick="shareShop('${js(shop.id)}')">分享</button>
    </div>
  </article>`;
}

function trackShopNavigation(id, linkUrl, section = "shop_card") {
  const shop = shops.find(item => item.id === id);
  trackGaEvent(section === "shop_modal" ? "shop_modal_navigation_click" : "shop_navigation_click", shopGaParams(shop, {
    cta_text: section === "shop_modal" ? "Google 地圖" : "導航",
    link_url: linkUrl,
    section
  }));
}

function openShop(id) {
  const shop = shops.find(item => item.id === id);
  const modal = $("shopModal");
  if (!shop || !modal) return;

  trackGaEvent("shop_detail_click", shopGaParams(shop, {
    cta_text: "詳情",
    section: "shop_card"
  }));

  $("modalTitle").textContent = shop.name;
  $("modalMeta").textContent = `${shop.area}｜${shop.category}`;
  const useOfferUrl = redeemUrl(shop, "shop_modal");

  const links = [
    `<a class="btn btn-primary" href="${attr(useOfferUrl)}" aria-label="使用 ${attr(shop.name)} 優惠" onclick="trackRedeemStart('${js(shop.id)}', this.href, 'shop_modal')">使用優惠</a>`,
    shop.map_url || shop.name || shop.address ? `<a class="btn btn-primary" href="${attr(shop.map_url || mapUrl(shop))}" target="_blank" rel="noopener" aria-label="開啟 ${attr(shop.name)} Google 地圖導航" onclick="trackShopNavigation('${js(shop.id)}', this.href, 'shop_modal')">Google 地圖</a>` : "",
    shop.website_url ? `<a class="btn btn-outline" href="${attr(shop.website_url)}" target="_blank" rel="noopener">官方網站</a>` : "",
    shop.facebook_url ? `<a class="btn btn-outline" href="${attr(shop.facebook_url)}" target="_blank" rel="noopener">Facebook</a>` : "",
    shop.instagram_url ? `<a class="btn btn-outline" href="${attr(shop.instagram_url)}" target="_blank" rel="noopener">Instagram</a>` : "",
    shop.line_url ? `<a class="btn btn-line" href="${attr(shop.line_url)}" target="_blank" rel="noopener">店家 LINE</a>` : "",
    `<a class="btn btn-line" href="${SHOP_CONFIG.lineCardUrl}" target="_blank" rel="noopener" aria-label="開啟頭竹苗福利卡" onclick="trackWelfareCardOpen('${js(shop.id)}', this.href)">開啟福利卡</a>`
  ].join("");

  $("modalBody").innerHTML = `<div class="modal-shop-summary">
      <div class="modal-logo-box">${logoImage(shop, "modal-logo")}</div>
      <div>
        <div class="tags"><span class="tag">${esc(shop.category)}</span><span class="tag area">${esc(shop.area)}</span></div>
        <div class="offer">${esc(shop.offer)}</div>
      </div>
    </div>
    ${shop.description ? `<p>${esc(shop.description)}</p>` : ""}
    ${detailRow("地址", shop.address)}
    ${detailRow("電話", shop.phone)}
    ${shop.line_url ? detailRow("LINE", shop.line_url) : ""}
    ${shop.business_hours ? detailRow("營業時間", shop.business_hours) : ""}
    <div class="shop-actions">${links}</div>
    <div class="notice">福利優惠以本平台公告為主要依據；如遇店家臨時公休、營運調整或資料尚未即時更新，建議消費前可先向店家確認。若店家需調整優惠內容，請提交修改資料，經審核後更新公告。</div>`;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

async function shareShop(id) {
  const shop = shops.find(item => item.id === id);
  if (!shop) return;

  trackGaEvent("shop_share_click", shopGaParams(shop, {
    cta_text: "分享",
    section: "shop_card"
  }));

  const text = `我在頭竹苗福利社看到 ${shop.name} 的優惠：${shop.offer}`;
  const url = `${location.origin}${location.pathname}`;

  if (navigator.share) {
    try {
      await navigator.share({ title: shop.name, text, url });
    } catch (error) {
      return;
    }
  } else if (navigator.clipboard) {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    alert("已複製店家資訊");
  }
}

function trackWelfareCardOpen(id, linkUrl) {
  const shop = shops.find(item => item.id === id);
  trackGaEvent("welfare_card_open_click", shopGaParams(shop, {
    cta_text: "開啟福利卡",
    link_url: linkUrl,
    section: "shop_modal"
  }));
}

function redeemUrl(shop, section = "shop_card") {
  const params = new URLSearchParams();
  params.set("shop_id", shop.id);
  params.set("source", currentPageSource());
  params.set("from", section);
  return `redeem.html?${params.toString()}`;
}

function currentPageSource() {
  const source = new URLSearchParams(location.search).get("source");
  return source || "shops";
}

function trackRedeemStart(id, linkUrl, section = "shop_card") {
  const shop = shops.find(item => item.id === id);
  trackGaEvent("redeem_start_click", shopGaParams(shop, {
    cta_text: "使用優惠",
    link_url: linkUrl,
    section
  }));
}

function closeModal() {
  const modal = $("shopModal");
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

function mapUrl(shop) {
  const keyword = typeof shop === "string" ? shop : [shop.name, shop.address].filter(Boolean).join(" ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(keyword)}`;
}

function detailRow(label, value) {
  if (!value) return "";
  return `<p><b>${esc(label)}：</b>${esc(value)}</p>`;
}

function logoPath(shop) {
  const logo = String(shop?.logo || "").trim();
  if (!logo || logo === "pics/logo/default-logo.svg" || logo.endsWith("/default-logo.svg") || logo === "pics/logo/tzm0000.webp" || logo.endsWith("/tzm0000.webp")) {
    return SHOP_CONFIG.defaultLogo;
  }
  return logo;
}

function logoImage(shop, className) {
  return `<img class="${className}" src="${attr(logoPath(shop))}" alt="${attr(logoAlt(shop))}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${SHOP_CONFIG.defaultLogo}';this.alt='${attr(defaultLogoAlt(shop))}';">`;
}

function logoAlt(shop) {
  if (!shop?.name) return "頭竹苗福利社特約商店 LOGO";
  if (!shop.logo || logoPath(shop) === SHOP_CONFIG.defaultLogo) return defaultLogoAlt(shop);
  return `${shop.name} LOGO｜頭竹苗福利社特約商店`;
}

function defaultLogoAlt(shop) {
  return shop?.name
    ? `${shop.name} 尚未提供 LOGO｜頭竹苗福利社特約商店`
    : "店家尚未提供 LOGO｜頭竹苗福利社特約商店";
}

function esc(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function attr(value) {
  return esc(value).replaceAll("`", "&#096;");
}

function js(value) {
  return String(value || "").replaceAll("\\", "\\\\").replaceAll("'", "\\'");
}

document.addEventListener("DOMContentLoaded", () => {
  const closeButton = $("modalClose");
  const modal = $("shopModal");
  if (closeButton) closeButton.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", event => {
      if (event.target === modal) closeModal();
    });
  }
  loadShops();
});
