/* PROJECT002 章节切换菜单 + 进度记忆（全章节共享） */
(function () {
  "use strict";

  var CHAPTERS = [
    { n: 1, title: "两个对象？", file: "index.html" },
    { n: 2, title: "交换证词", file: "chapter2.html" },
    { n: 3, title: "对照时间线", file: "chapter3.html" },
    { n: 4, title: "两种生活", file: "chapter4.html" },
    { n: 5, title: "最后选择", file: "chapter5.html" }
  ];

  var KEY = "p002_progress";

  function loadProgress() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return { unlocked: 1, last: "index.html" };
      var data = JSON.parse(raw);
      return {
        unlocked: Math.max(1, Math.min(5, Number(data.unlocked) || 1)),
        last: CHAPTERS.some(function (c) { return c.file === data.last; }) ? data.last : "index.html"
      };
    } catch (err) {
      return { unlocked: 1, last: "index.html" };
    }
  }

  function saveProgress(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (err) { /* 忽略隐私模式 */ }
  }

  function currentPage() {
    var name = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (name === "" || name === "index.html") return "index.html";
    if (name.indexOf("chapter2") === 0) return "chapter2.html";
    if (name.indexOf("chapter3") === 0) return "chapter3.html";
    if (name.indexOf("chapter4") === 0) return "chapter4.html";
    if (name.indexOf("chapter5") === 0) return "chapter5.html";
    return "index.html";
  }

  function chapterOf(file) {
    for (var i = 0; i < CHAPTERS.length; i++) {
      if (CHAPTERS[i].file === file) return CHAPTERS[i].n;
    }
    return 1;
  }

  /* 进入页面时更新进度：解锁当前章，记录最后所在章 */
  var current = currentPage();
  var progress = loadProgress();
  progress.unlocked = Math.max(progress.unlocked, chapterOf(current));
  progress.last = current;
  saveProgress(progress);

  /* ---------- 菜单弹层 ---------- */
  var modal = null;

  function buildModal() {
    if (modal) return modal;
    modal = document.createElement("div");
    modal.className = "p002-menu-modal";
    modal.setAttribute("aria-hidden", "true");

    var sheet = document.createElement("div");
    sheet.className = "p002-menu-sheet";
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-modal", "true");
    sheet.setAttribute("aria-label", "章节目录");

    var top = document.createElement("div");
    top.className = "p002-menu-top";
    var topTitle = document.createElement("div");
    var kicker = document.createElement("span");
    kicker.textContent = "章节目录";
    var strong = document.createElement("strong");
    strong.textContent = "切换章节";
    topTitle.appendChild(kicker);
    topTitle.appendChild(strong);
    var closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "p002-menu-close";
    closeBtn.textContent = "关闭";
    closeBtn.addEventListener("click", closeMenu);
    top.appendChild(topTitle);
    top.appendChild(closeBtn);

    var hint = document.createElement("p");
    hint.className = "p002-menu-hint";
    hint.textContent = "进度会自动记录，随时可以回到这里继续。";

    var list = document.createElement("div");
    list.className = "p002-menu-list";
    CHAPTERS.forEach(function (chapter) {
      var item = document.createElement("button");
      item.type = "button";
      item.className = "p002-menu-item";
      if (chapter.file === current) item.classList.add("current");
      if (chapter.n > progress.unlocked) item.classList.add("locked");

      var badge = document.createElement("span");
      badge.className = "p002-menu-badge";
      badge.textContent = chapter.file === current
        ? "当前"
        : (chapter.n <= progress.unlocked ? "已解锁" : "未解锁");

      var name = document.createElement("strong");
      name.textContent = "第" + "一二三四五".charAt(chapter.n - 1) + "章";
      var title = document.createElement("small");
      title.textContent = chapter.title;

      item.appendChild(badge);
      item.appendChild(name);
      item.appendChild(title);
      item.addEventListener("click", function () {
        window.location.href = "./" + chapter.file;
      });
      list.appendChild(item);
    });

    sheet.appendChild(top);
    sheet.appendChild(hint);
    sheet.appendChild(list);
    modal.appendChild(sheet);
    modal.addEventListener("click", function (event) {
      if (event.target === modal) closeMenu();
    });
    document.body.appendChild(modal);
    return modal;
  }

  function openMenu() {
    var node = buildModal();
    node.classList.add("open");
    node.setAttribute("aria-hidden", "false");
  }

  function closeMenu() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMenu();
  });

  /* 绑定顶栏菜单按钮 */
  var menuBtn = document.querySelector('.topbar button[aria-label="菜单"]');
  if (menuBtn) menuBtn.addEventListener("click", openMenu);

  /* 对外暴露：章末跳转用 */
  window.P002ChapterMenu = {
    open: openMenu,
    close: closeMenu,
    gotoNext: function () {
      var n = chapterOf(current);
      if (n < 5) window.location.href = "./" + CHAPTERS[n].file;
      else window.location.href = "./index.html";
    },
    gotoFirst: function () {
      window.location.href = "./index.html";
    }
  };
})();
