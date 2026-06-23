const SHOP_CONFIG = {
  dataUrl: "shops.json",
  lineCardUrl: "https://lin.ee/rQzJS3i",
  defaultLogo: "pics/logo/default-logo.svg"
};

const FALLBACK_SHOPS = [
  {
    id: "fallback-001",
    name: "竹南小島咖啡",
    category: "美食餐飲",
    area: "竹南",
    offer: "持福利卡消費享指定飲品優惠。",
    description: "提供咖啡、輕食與安靜座位，適合日常聚會與工作休息。",
    address: "苗栗縣竹南鎮",
    map_url: "https://www.google.com/maps/search/?api=1&query=竹南咖啡",
    is_featured: true,
    is_active: true
  },
  {
    id: "fallback-002",
    name: "頭份日常選物",
    category: "生活雜貨",
    area: "頭份",
    offer: "福利卡會員享生活選品專屬優惠。",
    description: "整理居家、禮品與日常用品，讓在地採買更方便。",
    address: "苗栗縣頭份市",
    map_url: "https://www.google.com/maps/search/?api=1&query=頭份生活選物",
    is_featured: true,
    is_active: true
  },
  {
    id: "fallback-003",
    name: "苗栗慢旅生活館",
    category: "住宿旅遊",
    area: "苗栗市",
    offer: "指定旅遊體驗與住宿方案可享合作優惠。",
    description: "提供苗栗慢遊資訊、住宿與在地體驗規劃。",
    address: "苗栗縣苗栗市",
    map_url: "https://www.google.com/maps/search/?api=1&query=苗栗旅遊",
    is_featured: true,
    is_active: true
  },
  {
    id: "fallback-004",
    name: "頭份健康照護所",
    category: "健康照護",
    area: "頭份",
    offer: "預約指定服務享福利卡合作優惠。",
    description: "提供日常保健、舒壓與健康照護相關服務。",
    address: "苗栗縣頭份市",
    map_url: "https://www.google.com/maps/search/?api=1&query=頭份健康照護",
    is_featured: true,
    is_active: true
  }
];

let shops = [];

const $ = id => document.getElementById(id);

function normalizeShop(row) {
  return {
    id: row.id || row.shop_id || row.name || "",
    name: row.name || row.shop_name || "未命名店家",
    category: row.category || "其他分類",
    area: row.area || "其他地區",
    offer: row.offer || row.discount || "詳細優惠以店家現場公告為準。",
    description: row.description || row.desc || "",
    address: row.address || "",
    phone: row.phone || "",
    map_url: row.map_url || row.mapUrl || "",
    website_url: row.website_url || row.websiteUrl || "",
    facebook_url: row.facebook_url || row.facebookUrl || "",
    instagram_url: row.instagram_url || row.instagramUrl || "",
    logo: row.logo || SHOP_CONFIG.defaultLogo,
    is_featured: row.is_featured === true || row.featured === true || row.is_featured === "TRUE",
    is_active: row.is_active !== false && row.active !== false
  };
}

async function loadShops() {
  try {
    const response = await fetch(SHOP_CONFIG.dataUrl, { cache: "no-store" });
    if (!response.ok) throw new Error("shops.json load failed");
    const data = await response.json();
    const source = Array.isArray(data) ? data : data.shops || [];
    shops = source.map(normalizeShop).filter(shop => shop.is_active);
  } catch (error) {
    shops = FALLBACK_SHOPS.map(normalizeShop);
  }

  if ($("shopGrid")) initShopDirectory();
  if ($("featuredShopGrid")) renderFeaturedShops();
}

function uniqueValues(key) {
  return [...new Set(shops.map(shop => shop[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh-Hant"));
}

function initShopDirectory() {
  const categorySelect = $("categorySelect");
  const areaSelect = $("areaSelect");
  const categoryChips = $("categoryChips");
  const searchInput = $("searchInput");
  const resetBtn = $("resetBtn");
  const queryCategory = new URLSearchParams(window.location.search).get("category") || "";

  const categories = uniqueValues("category");
  const areas = uniqueValues("area");

  categorySelect.innerHTML = '<option value="">全部分類</option>' + categories.map(value => `<option value="${esc(value)}">${esc(value)}</option>`).join("");
  areaSelect.innerHTML = '<option value="">全部地區</option>' + areas.map(value => `<option value="${esc(value)}">${esc(value)}</option>`).join("");
  categoryChips.innerHTML = '<button class="chip active" type="button" data-category="">全部</button>' + categories.map(value => `<button class="chip" type="button" data-category="${esc(value)}">${esc(value)}</button>`).join("");

  if (queryCategory && categories.includes(queryCategory)) {
    categorySelect.value = queryCategory;
  }

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
  const searchInput = $("searchInput");
  const categorySelect = $("categorySelect");
  const areaSelect = $("areaSelect");
  const keyword = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;
  const area = areaSelect.value;

  return shops.filter(shop => {
    const text = [shop.name, shop.category, shop.area, shop.offer, shop.description, shop.address].join(" ").toLowerCase();
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
    <div class="feature-photo"></div>
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
  if (!grid) return;

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
    <div class="shop-photo"></div>
    <div class="shop-content">
      <div class="shop-head">
        <div><h3>${esc(shop.name)}</h3></div>
        <button class="mini-btn" type="button" onclick="shareShop('${js(shop.id)}')">分享</button>
      </div>
      <div class="tags"><span class="tag">${esc(shop.category)}</span><span class="tag area">${esc(shop.area)}</span></div>
      <div class="offer">${esc(shop.offer)}</div>
      <p class="shop-desc">${esc(shop.description || "更多店家資訊將陸續補上。")}</p>
      <div class="shop-actions">
        <button class="mini-btn primary" type="button" onclick="openShop('${js(shop.id)}')">查看資訊</button>
        <a class="mini-btn" href="${attr(shop.map_url || mapUrl(shop.name))}" target="_blank" rel="noopener">地圖</a>
      </div>
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
    shop.website_url ? `<a class="btn btn-outline" href="${attr(shop.website_url)}" target="_blank" rel="noopener">官方網站</a>` : "",
    shop.facebook_url ? `<a class="btn btn-outline" href="${attr(shop.facebook_url)}" target="_blank" rel="noopener">Facebook</a>` : "",
    shop.instagram_url ? `<a class="btn btn-outline" href="${attr(shop.instagram_url)}" target="_blank" rel="noopener">Instagram</a>` : ""
  ].join("");

  $("modalBody").innerHTML = `<div class="offer">${esc(shop.offer)}</div>
    <p>${esc(shop.description || "更多店家資訊將陸續補上。")}</p>
    <p><b>地址：</b>${esc(shop.address || "待補充")}</p>
    <p><b>電話：</b>${esc(shop.phone || "待補充")}</p>
    <div class="shop-actions">
      <a class="btn btn-primary" href="${attr(shop.map_url || mapUrl(shop.name))}" target="_blank" rel="noopener">Google 地圖</a>
      ${links}
      <a class="btn btn-line" href="${SHOP_CONFIG.lineCardUrl}" target="_blank" rel="noopener">加入 LINE 領福利卡</a>
    </div>
    <div class="notice">優惠內容與使用方式以店家現場公告為準，建議消費前先向店家確認。</div>`;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

async function shareShop(id) {
  const shop = shops.find(item => item.id === id);
  if (!shop) return;

  const text = `我在頭竹苗福利社看到 ${shop.name} 的優惠：${shop.offer}`;
  const url = location.href.split("#")[0];

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

function mapUrl(keyword) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(keyword)}`;
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
