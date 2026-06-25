const SHOP_CONFIG = {
  dataUrl: "shops.json",
  lineCardUrl: "https://lin.ee/OuiR6gV",
  defaultLogo: "pics/logo/default-logo.svg"
};

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
const AREA_ORDER = ["竹南", "頭份", "苗栗市", "南庄", "後龍", "公館", "其他地區"];

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
  ["公館", "公館"]
]);

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

const $ = id => document.getElementById(id);

function normalizeCategory(category) {
  const value = String(category || "").trim();
  if (!value) return "其他";
  if (CATEGORY_ORDER.includes(value)) return value;
  return LEGACY_CATEGORY_MAP.get(value) || "其他";
}

function normalizeArea(area) {
  const value = String(area || "").trim();
  if (!value || /^https?:\/\//i.test(value)) return "其他地區";
  return AREA_MAP.get(value) || "其他地區";
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
    ...row,
    id: String(row.id || row.shop_id || row.name || `shop-${index + 1}`),
    name: row.name || row.shop_name || "未命名店家",
    category: normalizeCategory(row.category),
    area: normalizeArea(row.area),
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

async function loadShops() {
  let data = null;
  try {
    const response = await fetch(SHOP_CONFIG.dataUrl, { cache: "no-store" });
    if (!response.ok) throw new Error("shops.json load failed");
    data = await response.json();
    const source = Array.isArray(data) ? data : data.shops || [];
    shops = source
      .map(normalizeShop)
      .filter(shop => shop.is_active)
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, "zh-Hant"));
  } catch (error) {
    shops = FALLBACK_SHOPS.map(normalizeShop);
    console.warn("使用備用店家資料：", error);
  }

  categoryOptions = buildOptions(data?.categories, shops.map(shop => shop.category), normalizeCategory, CATEGORY_ORDER);
  areaOptions = buildOptions(data?.areas, shops.map(shop => shop.area), normalizeArea, AREA_ORDER);

  if ($("shopGrid")) initShopDirectory();
  if ($("featuredShopGrid")) renderFeaturedShops();
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

function initShopDirectory() {
  const categorySelect = $("categorySelect");
  const areaSelect = $("areaSelect");
  const categoryChips = $("categoryChips");
  const searchInput = $("searchInput");
  const resetBtn = $("resetBtn");
  if (!categorySelect || !areaSelect || !categoryChips || !searchInput || !resetBtn) return;

  const query = new URLSearchParams(window.location.search);
  const rawQueryCategory = query.get("category") || "";
  const rawQueryArea = query.get("area") || "";
  const queryCategory = rawQueryCategory ? normalizeCategory(rawQueryCategory) : "";
  const queryArea = rawQueryArea ? normalizeArea(rawQueryArea) : "";
  const categories = categoryOptions.length ? categoryOptions : buildOptions(null, shops.map(shop => shop.category), normalizeCategory, CATEGORY_ORDER);
  const areas = areaOptions.length ? areaOptions : buildOptions(null, shops.map(shop => shop.area), normalizeArea, AREA_ORDER);

  categorySelect.innerHTML = '<option value="">全部分類</option>' + categories.map(value => `<option value="${esc(value)}">${esc(value)}</option>`).join("");
  areaSelect.innerHTML = '<option value="">全部地區</option>' + areas.map(value => `<option value="${esc(value)}">${esc(value)}</option>`).join("");
  categoryChips.innerHTML = '<button class="chip active" type="button" data-category="">全部</button>' + categories.map(value => `<button class="chip" type="button" data-category="${esc(value)}">${esc(value)}</button>`).join("");

  if (categories.includes(queryCategory)) categorySelect.value = queryCategory;
  if (areas.includes(queryArea)) areaSelect.value = queryArea;
  searchInput.value = query.get("q") || "";

  document.querySelectorAll(".chip").forEach(chip => {
    chip.classList.toggle("active", (chip.dataset.category || "") === categorySelect.value);
    chip.addEventListener("click", () => {
      categorySelect.value = chip.dataset.category || "";
      document.querySelectorAll(".chip").forEach(item => item.classList.remove("active"));
      chip.classList.add("active");
      renderShops();
    });
  });

  searchInput.addEventListener("input", renderShops);
  categorySelect.addEventListener("change", () => {
    document.querySelectorAll(".chip").forEach(chip => {
      chip.classList.toggle("active", (chip.dataset.category || "") === categorySelect.value);
    });
    renderShops();
  });
  areaSelect.addEventListener("change", renderShops);
  resetBtn.addEventListener("click", () => {
    searchInput.value = "";
    categorySelect.value = "";
    areaSelect.value = "";
    document.querySelectorAll(".chip").forEach(chip => chip.classList.toggle("active", !chip.dataset.category));
    renderShops();
  });

  renderShops();
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

  const featured = shops.filter(shop => shop.is_featured).slice(0, 4);
  const list = featured.length ? featured : shops.slice(0, 4);
  grid.innerHTML = list.map(featuredCard).join("");
}

function featuredCard(shop) {
  return `<article class="feature-card">
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
  </article>`;
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
      <button class="mini-btn primary" type="button" onclick="openShop('${js(shop.id)}')">查看資訊</button>
      <a class="mini-btn" href="${attr(shop.map_url || mapUrl(shop))}" target="_blank" rel="noopener">地圖</a>
      <button class="mini-btn" type="button" onclick="shareShop('${js(shop.id)}')">分享</button>
    </div>
  </article>`;
}

function openShop(id) {
  const shop = shops.find(item => item.id === id);
  const modal = $("shopModal");
  if (!shop || !modal) return;

  $("modalTitle").textContent = shop.name;
  $("modalMeta").textContent = `${shop.area}｜${shop.category}`;

  const links = [
    shop.map_url || shop.name || shop.address ? `<a class="btn btn-primary" href="${attr(shop.map_url || mapUrl(shop))}" target="_blank" rel="noopener">Google 地圖</a>` : "",
    shop.website_url ? `<a class="btn btn-outline" href="${attr(shop.website_url)}" target="_blank" rel="noopener">官方網站</a>` : "",
    shop.facebook_url ? `<a class="btn btn-outline" href="${attr(shop.facebook_url)}" target="_blank" rel="noopener">Facebook</a>` : "",
    shop.instagram_url ? `<a class="btn btn-outline" href="${attr(shop.instagram_url)}" target="_blank" rel="noopener">Instagram</a>` : "",
    shop.line_url ? `<a class="btn btn-line" href="${attr(shop.line_url)}" target="_blank" rel="noopener">店家 LINE</a>` : "",
    `<a class="btn btn-line" href="${SHOP_CONFIG.lineCardUrl}" target="_blank" rel="noopener">加入 LINE 領福利卡</a>`
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
  return shop.logo || SHOP_CONFIG.defaultLogo;
}

function logoImage(shop, className) {
  return `<img class="${className}" src="${attr(logoPath(shop))}" alt="${attr(`${shop.name} LOGO`)}" loading="lazy" onerror="this.onerror=null;this.src='${SHOP_CONFIG.defaultLogo}';">`;
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
