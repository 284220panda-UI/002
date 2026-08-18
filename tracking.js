/* PROJECT002 数据打点（全章节共享）
 * 依赖：页面嵌入 51LA 统计代码（window._51la / 51LA 全局对象）
 * 职责：
 *   1. 页面进入自动上报 pageview（51LA 的 JS 本身也会统计 PV，这里补充章节语义）
 *   2. 章节切换上报 goto（从哪章 → 到哪章）
 *   3. 离开页面上报 exit（玩家在哪个章节退出），优先 sendBeacon
 *   4. 所有事件同时写入 localStorage(p002_track)，便于导出核对
 */
(function () {
  "use strict";

  var QUEUE_KEY = "p002_track_events";
  var SESSION_KEY = "p002_track_session";

  /* ---------- 工具 ---------- */

  function currentChapter() {
    var name = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (name === "" || name === "index.html") return 1;
    if (name.indexOf("chapter2") === 0) return 2;
    if (name.indexOf("chapter3") === 0) return 3;
    if (name.indexOf("chapter4") === 0) return 4;
    if (name.indexOf("chapter5") === 0) return 5;
    return 0;
  }

  function nowISO() {
    try { return new Date().toISOString(); } catch (e) { return String(Date.now()); }
  }

  function uid() {
    try {
      var s = localStorage.getItem(SESSION_KEY);
      if (!s) {
        s = "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        localStorage.setItem(SESSION_KEY, s);
      }
      return s;
    } catch (e) { return "s-anon"; }
  }

  function pushLocal(ev) {
    try {
      var arr = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
      arr.push(ev);
      if (arr.length > 500) arr = arr.slice(-500); // 防止无限增长
      localStorage.setItem(QUEUE_KEY, JSON.stringify(arr));
    } catch (e) { /* 忽略 */ }
  }

  /* ---------- 上报 ---------- */

  function track(name, payload) {
    var ev = {
      t: nowISO(),
      sid: uid(),
      ch: currentChapter(),
      ev: name,
      p: payload || {}
    };
    pushLocal(ev);

    // 51LA 自定义事件（存在则调用；不同版本 API 可能不同，做兼容）
    try {
      if (window._51la && typeof window._51la.sendEvent === "function") {
        window._51la.sendEvent("p002", name, JSON.stringify(ev));
      } else if (window._51La && typeof window._51La.sendEvent === "function") {
        window._51La.sendEvent("p002", name, JSON.stringify(ev));
      }
    } catch (e) { /* 忽略 */ }

    // 备选：sendBeacon 上报到 51LA beacon 接口（若统计代码暴露了地址）
    try {
      var beaconURL = (window._51la && window._51la.beaconURL) ||
                      (window._51La && window._51La.beaconURL);
      if (beaconURL && navigator.sendBeacon) {
        var body = new Blob([JSON.stringify(ev)], { type: "application/json" });
        navigator.sendBeacon(beaconURL, body);
      }
    } catch (e) { /* 忽略 */ }
  }

  /* ---------- 事件绑定 ---------- */

  function boot() {
    track("pageview", { from: document.referrer ? "referrer" : "direct" });

    // 章节跳转：捕获点击 .p002-menu-item / goto 类按钮
    document.addEventListener("click", function (e) {
      var el = e.target;
      while (el && el !== document) {
        if (el.classList && el.classList.contains("p002-menu-item")) {
          var to = el.getAttribute("data-file") || el.getAttribute("href") || "";
          track("goto", { to: to });
          break;
        }
        el = el.parentNode;
      }
    });

    // 退出/离开页面：beacon 或延迟同步上报
    var exitSent = false;
    function onExit() {
      if (exitSent) return;
      exitSent = true;
      track("exit", { dur: Math.round((Date.now() - pageStart) / 1000) });
    }
    window.addEventListener("pagehide", onExit);
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") onExit();
    });

    // 供其他脚本主动上报（如章末点"进入下一章"）
    window.P002Track = {
      track: track,
      chapter: currentChapter,
      current: currentChapter()
    };
  }

  var pageStart = Date.now();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
