/* PROJECT002 页面内编辑器 v3（免代码：文案 / 排版 / 外观 / 链接分享）
 * - 所有修改自动保存到浏览器，刷新不丢（无需手动保存）
 * - 「导出备份」下载 JSON；「导入备份」可恢复；发给 AI 可写回源码
 * - 「复制链接」生成带修改的链接，任何设备打开都带你的调整
 * - v3 修复：默认不再覆盖页面原生样式，只有用户实际调过才生效
 */
(function () {
  "use strict";
  if (window.__p002EditorLoaded) return;
  window.__p002EditorLoaded = true;

  var LS_TEXT = "p002_text_overrides";
  var LS_STYLE = "p002_style_v3";          // v3 key：彻底丢弃旧污染数据
  var page = location.pathname.split("/").pop() || "index.html";

  function load(k, fb) {
    try { return JSON.parse(localStorage.getItem(k)) || fb; } catch (e) { return fb; }
  }
  function save(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

  var overrides = load(LS_TEXT, {});

  // 默认值 = 和页面原生 CSS 一致（深黑半透明、圆角 4px、灰黑角色框）
  var DEFAULTS = {
    fs: 13, lh: 1.62, pad: 14, npfs: 12,
    npOn: true,
    panelBg: "#000000", panelAlpha: 0.75,
    panelText: "#ffffff", radius: 4,
    npBg: "#1f1f1f", npText: "#ffffff",
    barColor: "#6b7280"
  };

  // 只有当用户之前实际保存过样式数据时，才应用覆盖；否则保持原生 CSS
  var hasStoredStyle = localStorage.getItem(LS_STYLE) !== null;
  var cfg = load(LS_STYLE, Object.assign({}, DEFAULTS));

  /* ---------- 从 URL 链接导入修改 ---------- */
  if (location.hash.indexOf("#p002=") === 0) {
    try {
      var fromUrl = JSON.parse(decodeURIComponent(location.hash.slice(6)));
      if (fromUrl.t) { overrides = fromUrl.t; save(LS_TEXT, overrides); }
      if (fromUrl.s) { cfg = Object.assign(cfg, fromUrl.s); save(LS_STYLE, cfg); hasStoredStyle = true; }
      history.replaceState(null, "", location.pathname + location.search);
    } catch (e) {}
  }

  /* ---------- 应用样式 ---------- */
  function hexToRgb(h) {
    h = h.replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  var styleEl = document.createElement("style");
  styleEl.id = "p002-editor-style";
  document.head.appendChild(styleEl);
  function applyStyle() {
    var rgb = hexToRgb(cfg.panelBg);
    var npRgb = hexToRgb(cfg.npBg);
    styleEl.textContent =
      ".dialogue-text{font-size:" + cfg.fs + "px!important;line-height:" + cfg.lh + "!important;color:" + cfg.panelText + "!important;}" +
      ".dialogue-panel{padding:" + cfg.pad + "px!important;background:rgba(" + rgb.join(",") + "," + cfg.panelAlpha + ")!important;border-radius:" + cfg.radius + "px!important;}" +
      ".dialogue-nameplate{display:" + (cfg.npOn ? "" : "none") + "!important;font-size:" + cfg.npfs + "px!important;background:rgba(" + npRgb.join(",") + ",0.82)!important;color:" + cfg.npText + "!important;}" +
      ".dialogue-panel.is-narration .dialogue-text{border-left-color:" + cfg.barColor + "!important;}";
  }
  if (hasStoredStyle) applyStyle();   // ← 核心修复：有数据才覆盖，无数据保持原生

  /* ---------- 文案替换 ---------- */
  function swapIfOverridden(el) {
    var t = (el.textContent || "").trim();
    if (t && overrides[t] && overrides[t] !== t) el.textContent = overrides[t];
  }
  new MutationObserver(function () {
    document.querySelectorAll(".dialogue-text, .dialogue-nameplate").forEach(swapIfOverridden);
  }).observe(document.body, { childList: true, subtree: true, characterData: true });

  /* ---------- 轻提示 ---------- */
  var toastTimer = null;
  function toast(msg) {
    var t = document.getElementById("p002-toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "p002-toast";
      t.style.cssText = "position:fixed;left:50%;bottom:70px;transform:translateX(-50%);z-index:100000;" +
        "background:rgba(20,20,26,.92);color:#fff;padding:8px 16px;border-radius:10px;font:12px/1.4 system-ui;" +
        "box-shadow:0 4px 12px rgba(0,0,0,.4);transition:opacity .25s;opacity:0;pointer-events:none;";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = "1";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.style.opacity = "0"; }, 1600);
  }

  /* ---------- 文案编辑模式 ---------- */
  var editMode = false;
  document.addEventListener("click", function (ev) {
    if (!editMode) return;
    var el = ev.target.closest(".dialogue-text, .dialogue-nameplate");
    if (!el) return;
    ev.preventDefault(); ev.stopPropagation();
    if (el.isContentEditable) return;
    var original = (el.textContent || "").trim();
    el.dataset.p002Original = original;
    el.contentEditable = "true";
    el.style.outline = "2px dashed #f76c6c";
    el.focus();
    el.addEventListener("blur", function () {
      var next = (el.textContent || "").trim();
      var orig = el.dataset.p002Original || original;
      if (next && next !== orig) { overrides[orig] = next; save(LS_TEXT, overrides); refreshBadge(); toast("已自动保存（本浏览器）"); }
      el.contentEditable = "false";
      el.style.outline = "";
      delete el.dataset.p002Original;
    }, { once: true });
  }, true);

  /* ---------- 底部工具条 ---------- */
  var bar = document.createElement("div");
  bar.style.cssText = "position:fixed;right:14px;bottom:14px;z-index:99999;display:flex;gap:8px;align-items:center;" +
    "background:rgba(30,30,38,.92);color:#fff;padding:8px 12px;border-radius:12px;font:12px/1 system-ui,sans-serif;" +
    "box-shadow:0 4px 16px rgba(0,0,0,.35);flex-wrap:wrap;max-width:92vw;";
  bar.innerHTML =
    '<button id="p002-edit" style="padding:5px 10px;border:0;border-radius:8px;cursor:pointer;background:#5b8def;color:#fff;font-size:12px;">✏️ 编辑文案</button>' +
    '<button id="p002-panel" style="padding:5px 10px;border:0;border-radius:8px;cursor:pointer;background:#444;color:#fff;font-size:12px;">🎛 定制面板</button>' +
    '<span id="p002-badge" style="opacity:.75;color:#ffd479"></span>' +
    '<button id="p002-link" style="padding:5px 10px;border:0;border-radius:8px;cursor:pointer;background:#8a6cd9;color:#fff;font-size:12px;">🔗 复制链接</button>' +
    '<button id="p002-export" style="padding:5px 10px;border:0;border-radius:8px;cursor:pointer;background:#3aa675;color:#fff;font-size:12px;">⬇ 导出备份</button>' +
    '<button id="p002-import" style="padding:5px 10px;border:0;border-radius:8px;cursor:pointer;background:#2e7d8f;color:#fff;font-size:12px;">⬆ 导入</button>' +
    '<button id="p002-clear" style="padding:5px 10px;border:0;border-radius:8px;cursor:pointer;background:#777;color:#fff;font-size:12px;">↩ 清除</button>' +
    '<input id="p002-file" type="file" accept=".json" style="display:none">';
  document.body.appendChild(bar);

  var badge = bar.querySelector("#p002-badge");
  function refreshBadge() {
    var n = Object.keys(overrides).length;
    badge.textContent = n ? ("已改 " + n + " 处") : "";
  }
  refreshBadge();

  var editBtn = bar.querySelector("#p002-edit");
  editBtn.addEventListener("click", function () {
    editMode = !editMode;
    editBtn.style.background = editMode ? "#f76c6c" : "#5b8def";
    editBtn.textContent = editMode ? "✏️ 编辑中(点文字)" : "✏️ 编辑文案";
  });

  /* ---------- 定制面板 ---------- */
  var panel = document.createElement("div");
  panel.style.cssText = "position:fixed;right:14px;bottom:64px;z-index:99999;background:rgba(28,28,36,.96);color:#fff;" +
    "padding:14px;border-radius:12px;font:12px/1.6 system-ui,sans-serif;box-shadow:0 4px 20px rgba(0,0,0,.45);display:none;width:250px;max-height:78vh;overflow-y:auto;";
  function row(label, ctrl) { return '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px;"><span>' + label + '</span><span>' + ctrl + '</span></div>'; }
  function slider(id, min, max, step, val) { return '<input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '" style="width:120px;">'; }
  function color(id, val) { return '<input id="' + id + '" type="color" value="' + val + '" style="width:34px;height:22px;border:0;background:none;cursor:pointer;">'; }

  panel.innerHTML =
    '<div style="font-weight:600;margin-bottom:8px;border-bottom:1px solid #444;padding-bottom:6px;">排 版</div>' +
    row("正文字号", slider("p002-fs", 11, 20, 0.5, cfg.fs)) +
    row("行距", slider("p002-lh", 1.2, 2.4, 0.05, cfg.lh)) +
    row("对话框边距", slider("p002-pad", 4, 30, 1, cfg.pad)) +
    row("对话框圆角", slider("p002-radius", 0, 30, 1, cfg.radius)) +
    '<div style="font-weight:600;margin:10px 0 8px;border-bottom:1px solid #444;padding-bottom:6px;">角 色 框</div>' +
    row("显示角色框", '<input id="p002-npOn" type="checkbox"' + (cfg.npOn ? " checked" : "") + ' style="transform:scale(1.2);cursor:pointer;">') +
    row("角色框字号", slider("p002-npfs", 10, 18, 0.5, cfg.npfs)) +
    row("框背景色", color("p002-npBg", cfg.npBg)) +
    row("框文字色", color("p002-npText", cfg.npText)) +
    '<div style="font-weight:600;margin:10px 0 8px;border-bottom:1px solid #444;padding-bottom:6px;">对 话 框</div>' +
    row("背景色", color("p002-panelBg", cfg.panelBg)) +
    row("背景不透明度", slider("p002-panelAlpha", 0.3, 1, 0.02, cfg.panelAlpha)) +
    row("文字颜色", color("p002-panelText", cfg.panelText)) +
    row("叙述竖杠色", color("p002-bar", cfg.barColor)) +
    '<div style="opacity:.6;margin-top:8px">所有改动实时生效并自动保存在本浏览器。</div>';
  document.body.appendChild(panel);

  function bind(id, key) {
    var el = panel.querySelector("#" + id);
    if (!el) return;
    el.addEventListener("input", function () {
      cfg[key] = el.type === "checkbox" ? el.checked : (el.type === "range" ? parseFloat(el.value) : el.value);
      save(LS_STYLE, cfg);
      if (!hasStoredStyle) { hasStoredStyle = true; } // 首次拖动后标记为已存储
      applyStyle();
    });
  }
  bind("p002-fs", "fs"); bind("p002-lh", "lh"); bind("p002-pad", "pad"); bind("p002-radius", "radius");
  bind("p002-npOn", "npOn"); bind("p002-npfs", "npfs"); bind("p002-npBg", "npBg"); bind("p002-npText", "npText");
  bind("p002-panelBg", "panelBg"); bind("p002-panelAlpha", "panelAlpha");
  bind("p002-panelText", "panelText"); bind("p002-bar", "barColor");

  bar.querySelector("#p002-panel").addEventListener("click", function () {
    panel.style.display = panel.style.display === "none" ? "block" : "none";
  });

  /* ---------- 复制带修改的链接 ---------- */
  bar.querySelector("#p002-link").addEventListener("click", function () {
    var hash = "#p002=" + encodeURIComponent(JSON.stringify({ t: overrides, s: cfg }));
    var url = location.origin + location.pathname + hash;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { toast("链接已复制，发给谁都能看到你的修改"); },
        function () { prompt("复制下面的链接：", url); });
    } else { prompt("复制下面的链接：", url); }
  });

  /* ---------- 导出 / 导入 ---------- */
  bar.querySelector("#p002-export").addEventListener("click", function () {
    var data = { page: page, exportedAt: new Date().toISOString(), textOverrides: overrides, style: cfg };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "p002_backup_" + page.replace(/\.html$/, "") + ".json";
    a.click();
    URL.revokeObjectURL(a.href);
    toast("备份已下载（这是备份/交稿用，平时不用点）");
  });

  var fileInput = bar.querySelector("#p002-file");
  bar.querySelector("#p002-import").addEventListener("click", function () { fileInput.click(); });
  fileInput.addEventListener("change", function () {
    var f = fileInput.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var d = JSON.parse(r.result);
        if (d.textOverrides) { overrides = d.textOverrides; save(LS_TEXT, overrides); }
        if (d.style) { cfg = Object.assign(cfg, d.style); save(LS_STYLE, cfg); }
        location.reload();
      } catch (e) { toast("文件格式不对，导入失败"); }
    };
    r.readAsText(f);
  });

  /* ---------- 清除 ---------- */
  bar.querySelector("#p002-clear").addEventListener("click", function () {
    if (!confirm("清除本页全部修改（文案+排版+外观）？")) return;
    localStorage.removeItem(LS_TEXT);
    localStorage.removeItem(LS_STYLE);
    location.reload();
  });
})();
