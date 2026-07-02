const REDEEM_CONFIG = {
  shopsUrl: "shops.json",
  gasUrl: "https://script.google.com/macros/s/AKfycbzTQNG4GSWTSSLOI5hw37B-CnsYUjJObX2CxXEz_nrT541VjPgUune4_ywxnCb91jyn/exec?action=shops",
  logUrl: window.TZM_REDEEM_LOG_URL || "",
  defaultLogo: "pics/logo/tzm0000.png",
  lineUrl: "https://lin.ee/OuiR6gV"
};

const redeemState = {
  shop: null,
  source: "",
  from: "",
  clientId: "",
  confirmed: false,
  confirming: false,
  trackedPageView: false,
  activeAttemptId: ""
};

document.addEventListener("DOMContentLoaded", initRedeemPage);

async function initRedeemPage() {
  redeemState.clientId = getClientId();
  redeemState.source = getParam("source") || detectSource();
  redeemState.from = getParam("from") || "";

  try {
    const data = await loadStaticShopData();
    applyRedeemData(data);
    loadGasShopData()
      .then(applyRedeemData)
      .catch(error => console.warn("GAS API 背景更新失敗，不影響使用確認頁：", error));
  } catch (staticError) {
    console.warn("shops.json 載入失敗，改用 GAS API：", staticError);
    try {
      const data = await loadGasShopData();
      applyRedeemData(data);
    } catch (apiError) {
      showRedeemError("目前無法載入優惠資料，請稍後再試。");
      console.error("優惠資料載入失敗：", apiError);
    }
  }
}

async function loadStaticShopData() {
  const data = await fetchJson(REDEEM_CONFIG.shopsUrl, 5000);
  if (!data || !Array.isArray(data.shops)) throw new Error("shops.json 格式不正確");
  return data;
}

async function loadGasShopData() {
  const data = await fetchJson(REDEEM_CONFIG.gasUrl, 8000);
  if (!data || !Array.isArray(data.shops)) throw new Error("GAS API 格式不正確");
  return data;
}

async function fetchJson(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal, cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

function applyRedeemData(data) {
  if (redeemState.confirmed) return;
  const shopId = getParam("shop_id") || getParam("id");
  const shop = (data.shops || []).find(item => String(item.id) === String(shopId));
  if (!shop) {
    showRedeemError("找不到這筆店家優惠，請回到優惠店家頁重新選擇。");
    return;
  }
  redeemState.shop = normalizeShop(shop);
  renderRedeemPage(redeemState.shop);
  if (!redeemState.trackedPageView) {
    trackEvent("redeem_page_view", redeemGaParams("page_view"));
    redeemState.trackedPageView = true;
  }
}

function normalizeShop(shop) {
  return {
    id: shop.id || "",
    name: shop.name || "",
    category: shop.category || "其他",
    area: shop.area || "其他地區",
    offer: shop.offer || "請依店家現場公告為準",
    description: shop.description || "",
    address: shop.address || "",
    phone: shop.phone || "",
    business_hours: shop.business_hours || "",
    map_url: shop.map_url || "",
    logo: logoPath(shop.logo),
    updated_at: shop.updated_at || ""
  };
}

function renderRedeemPage(shop) {
  const app = document.getElementById("redeemApp");
  const nowText = new Date().toLocaleString("zh-TW", { hour12: false });
  app.innerHTML = `
    <div class="redeem-card">
      <div class="redeem-shop">
        <div class="redeem-logo"><img src="${attr(shop.logo)}" alt="${attr(shop.name)} LOGO" loading="lazy" onerror="this.onerror=null;this.src='${REDEEM_CONFIG.defaultLogo}';"></div>
        <div>
          <div class="tags"><span class="tag">${esc(shop.category)}</span><span class="tag area">${esc(shop.area)}</span></div>
          <h2>${esc(shop.name)}</h2>
          <p>${esc(shop.description || "頭竹苗福利社合作店家優惠使用確認。")}</p>
        </div>
      </div>
      <div class="redeem-offer">
        <span>本次使用優惠</span>
        <strong>${esc(shop.offer)}</strong>
      </div>
      <dl class="redeem-meta">
        ${shop.address ? `<div><dt>地址</dt><dd>${esc(shop.address)}</dd></div>` : ""}
        ${shop.phone ? `<div><dt>電話</dt><dd>${esc(shop.phone)}</dd></div>` : ""}
        ${shop.business_hours ? `<div><dt>營業時間</dt><dd>${esc(shop.business_hours)}</dd></div>` : ""}
        <div><dt>確認時間</dt><dd>${esc(nowText)}</dd></div>
      </dl>
      <div class="redeem-confirm-box" id="redeemConfirmBox">
        <p>請將此畫面出示給店家，由店家確認優惠適用後按下方按鈕。請勿由消費者自行點選確認。</p>
        <button class="btn btn-primary" type="button" id="confirmRedeemBtn">店家確認使用</button>
        <a class="btn btn-outline" href="shops.html">返回優惠店家</a>
        <small class="redeem-submit-status" id="redeemSubmitStatus" hidden></small>
      </div>
      <div class="redeem-result" id="redeemResult" hidden></div>
      <p class="redeem-note">優惠內容與使用方式以店家現場公告為準。此確認紀錄將協助平台了解優惠使用成效與熱門店家。</p>
    </div>
  `;

  document.getElementById("confirmRedeemBtn")?.addEventListener("click", confirmRedeem);
}

async function confirmRedeem() {
  const shop = redeemState.shop;
  if (!shop) return;
  if (redeemState.confirmed || redeemState.confirming) return;

  const ok = window.confirm("請確認此按鈕由店家或店員操作。是否完成本次優惠使用確認？");
  if (!ok) return;

  const eventId = `redeem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  redeemState.confirming = true;
  redeemState.activeAttemptId = eventId;
  setSubmitState("sending", "確認送出中，請稍候...");

  const recoveryTimer = window.setTimeout(() => {
    if (redeemState.confirming && redeemState.activeAttemptId === eventId && !redeemState.confirmed) {
      redeemState.confirming = false;
      redeemState.activeAttemptId = "";
      setSubmitState("ready", "送出時間較久，已恢復按鈕。可確認網路後再按一次。");
    }
  }, 15000);

  const payload = {
    event_id: eventId,
    event_type: "redeem_confirmed",
    confirmed_at: new Date().toISOString(),
    shop_id: shop.id,
    shop_name: shop.name,
    category: shop.category,
    area: shop.area,
    offer: shop.offer,
    source: redeemState.source,
    from: redeemState.from,
    client_id: redeemState.clientId,
    page_url: location.href,
    user_agent: navigator.userAgent
  };

  saveLocalRedeem(payload);
  trackEvent("redeem_confirmed", redeemGaParams("confirmed", { event_id: eventId }));
  await sendRedeemLog(payload);
  window.clearTimeout(recoveryTimer);
  if (redeemState.activeAttemptId !== eventId) return;
  redeemState.confirmed = true;
  redeemState.confirming = false;
  redeemState.activeAttemptId = "";
  showRedeemSuccess(payload);
}

function setSubmitState(state, message = "") {
  const button = document.getElementById("confirmRedeemBtn");
  const status = document.getElementById("redeemSubmitStatus");

  if (button) {
    const isSending = state === "sending";
    button.disabled = isSending;
    button.textContent = isSending ? "送出中，請稍候" : "店家確認使用";
    button.setAttribute("aria-busy", isSending ? "true" : "false");
    button.classList.toggle("is-sending", isSending);
  }

  if (status) {
    status.hidden = !message;
    status.textContent = message;
    status.classList.toggle("is-warning", state === "ready" && Boolean(message));
  }
}

async function sendRedeemLog(payload) {
  if (!REDEEM_CONFIG.logUrl) return { skipped: true };
  const body = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "text/plain;charset=UTF-8" });
      const sent = navigator.sendBeacon(REDEEM_CONFIG.logUrl, blob);
      if (sent) return { sent: true, method: "beacon" };
    }
    await fetch(REDEEM_CONFIG.logUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body
    });
    return { sent: true, method: "fetch" };
  } catch (error) {
    console.warn("使用紀錄送出失敗，已保留 GA4 與本機紀錄：", error);
    return { sent: false, error };
  }
}

function showRedeemSuccess(payload) {
  const result = document.getElementById("redeemResult");
  const confirmBox = document.getElementById("redeemConfirmBox");
  if (confirmBox) confirmBox.hidden = true;
  if (!result) return;
  result.hidden = false;
  result.innerHTML = `
    <strong>已完成優惠使用確認</strong>
    <span>確認時間：${esc(new Date(payload.confirmed_at).toLocaleString("zh-TW", { hour12: false }))}</span>
    <span>紀錄編號：${esc(payload.event_id)}</span>
    <a class="btn btn-line" href="${REDEEM_CONFIG.lineUrl}" target="_blank" rel="noopener">回到官方 LINE</a>
  `;
}

function showRedeemError(message) {
  const app = document.getElementById("redeemApp");
  if (!app) return;
  app.innerHTML = `
    <div class="empty redeem-empty">
      <strong>${esc(message)}</strong>
      <a class="btn btn-primary" href="shops.html">回到優惠店家查詢</a>
    </div>
  `;
}

function redeemGaParams(step, extra = {}) {
  const shop = redeemState.shop || {};
  return {
    step,
    shop_id: shop.id,
    shop_name: shop.name,
    category: shop.category,
    area: shop.area,
    source: redeemState.source,
    from: redeemState.from,
    ...extra
  };
}

function trackEvent(eventName, params = {}) {
  if (typeof window.gtag !== "function") return;
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
  window.gtag("event", eventName, {
    page_path: window.location.pathname,
    ...cleanParams
  });
}

function saveLocalRedeem(payload) {
  try {
    const key = "tzm_redeem_logs";
    const logs = JSON.parse(localStorage.getItem(key) || "[]");
    logs.unshift(payload);
    localStorage.setItem(key, JSON.stringify(logs.slice(0, 30)));
  } catch (error) {
    console.warn("本機使用紀錄儲存失敗：", error);
  }
}

function getClientId() {
  const key = "tzm_client_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = `tzm_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

function detectSource() {
  const ref = document.referrer || "";
  if (ref.includes("line.me") || ref.includes("lin.ee")) return "line";
  if (ref.includes(location.hostname)) return "website";
  return "direct";
}

function logoPath(logo) {
  const path = String(logo || "").trim();
  if (!path || path.includes("default-logo.svg") || path.includes("tzm0000.webp")) return REDEEM_CONFIG.defaultLogo;
  return path;
}

function getParam(name) {
  return new URLSearchParams(location.search).get(name);
}

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function attr(value) {
  return esc(value);
}
