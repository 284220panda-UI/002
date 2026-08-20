/* ============================================================
 * AudioManager —《谁是你的对象》音频管理器 v2
 * ------------------------------------------------------------
 * 架构：事件驱动。业务代码只调用 Audio.play('event:/...')，
 *       不直接接触文件路径。总线：Master -> { Music, SFX, UI }
 *
 * 用法：
 *   Audio.play('event:/BGM/Dialogue/Daily')      // 切 BGM（自动淡入淡出）
 *   Audio.play('event:/UI/Click')                // 一次性 SFX
 *   Audio.setVolume('music', 0.6)                // 音量 0~1（localStorage 持久化）
 *   Audio.duck(true)                             // 对话时压低 BGM（-6dB）
 *
 * 场景自动播放：页面 <body data-bgm="menu|daily|..."> 会在首次交互后自动起播
 * 音量面板：自动注入右下角喇叭按钮，点击弹出 BGM/音效滑块 + 静音开关
 *
 * 事件命名规范（FMOD 风格）：
 *   event:/BGM/[场景]/[曲名]
 *   event:/UI/[交互]
 *   event:/SFX/[类别]/[名称]
 * ============================================================ */
(function (global) {
  "use strict";

  var BGM_TRACKS = {
    "event:/BGM/Menu/Menu_Theme":        "assets/audio/menu_theme.mp3",
    "event:/BGM/Dialogue/Daily":         "assets/audio/daily_dialogue.mp3"
  };

  var SFX_EVENTS = {
    "event:/UI/Click":       "assets/audio/sfx_ui_click.mp3",
    "event:/UI/PageTurn":    "assets/audio/sfx_page_turn.mp3",
    "event:/UI/Evidence":    "assets/audio/sfx_evidence.mp3",
    "event:/SFX/Notify/404": "assets/audio/sfx_notify.mp3",
    "event:/SFX/Type/Tick":  "assets/audio/sfx_type.mp3"
  };

  // 场景 -> 默认 BGM 的映射（页面 body[data-bgm] 引用 key）
  var SCENE_BGM = {
    menu:    "event:/BGM/Menu/Menu_Theme",     // 菜单 / 温情剧情
    daily:   "event:/BGM/Dialogue/Daily"       // 日常对话
  };

  var Audio = {
    _ctx: null,
    _master: null,
    _musicBus: null,
    _sfxBus: null,
    _uiBus: null,
    _current: null,        // { audio, gain, src }
    _vol: { master: 0.75, music: 0.6, sfx: 0.7, ui: 0.7 },
    _muted: false,
    _ducked: false,
    _ready: false,
    _sfxCache: {},

    /* ---------- 初始化（首次用户交互时解锁，浏览器自动播放策略） ---------- */
    init: function () {
      if (this._ready) return;
      try {
        var AC = global.AudioContext || global.webkitAudioContext;
        if (!AC) return;
        this._ctx = new AC();
        this._master = this._ctx.createGain();
        this._master.gain.value = this._muted ? 0 : this._vol.master;
        this._master.connect(this._ctx.destination);

        this._musicBus = this._ctx.createGain();
        this._musicBus.gain.value = this._vol.music;
        this._musicBus.connect(this._master);

        this._sfxBus = this._ctx.createGain();
        this._sfxBus.gain.value = this._vol.sfx;
        this._sfxBus.connect(this._master);

        this._uiBus = this._ctx.createGain();
        this._uiBus.gain.value = this._vol.ui;
        this._uiBus.connect(this._master);

        // 读取持久化音量
        try {
          var saved = JSON.parse(localStorage.getItem("p002_audio_vol") || "{}");
          for (var k in this._vol) if (saved[k] != null) this._vol[k] = saved[k];
        } catch (e) { /* ignore */ }
        try {
          this._muted = localStorage.getItem("p002_audio_muted") === "1";
        } catch (e) { /* ignore */ }

        if (this._muted && this._master) this._master.gain.value = 0;
        this._ready = true;
      } catch (e) {
        console.warn("[Audio] init failed:", e);
      }
    },

    /* ---------- 通用事件入口 ---------- */
    play: function (eventName, opts) {
      opts = opts || {};
      if (!this._ready) this.init();
      if (!this._ready) return;
      if (this._ctx.state === "suspended") this._ctx.resume();

      if (BGM_TRACKS[eventName]) return this._playBgm(eventName, opts);
      if (SFX_EVENTS[eventName]) return this._playSfx(eventName, opts);
      console.warn("[Audio] unknown event:", eventName);
    },

    /* ---------- BGM：跨曲淡入淡出切换 + 无缝循环 ---------- */
    _playBgm: function (eventName, opts) {
      var self = this;
      var src = BGM_TRACKS[eventName];
      var fade = opts.fade != null ? opts.fade : 0.8;

      if (this._current && this._current.src === src) return; // 已在播

      this._load(src, function (buf) {
        // 旧曲淡出
        if (self._current) {
          var old = self._current;
          var now = self._ctx.currentTime;
          old.gain.gain.cancelScheduledValues(now);
          old.gain.gain.setValueAtTime(old.gain.gain.value, now);
          old.gain.gain.linearRampToValueAtTime(0, now + fade);
          setTimeout(function () {
            try { old.audio.stop(); } catch (e) { /* ignore */ }
            old.audio.disconnect();
          }, fade * 1000 + 50);
        }
        // 新曲进入
        var source = self._ctx.createBufferSource();
        source.buffer = buf;
        source.loop = true;
        var gain = self._ctx.createGain();
        gain.gain.setValueAtTime(0, self._ctx.currentTime);
        gain.gain.linearRampToValueAtTime(1, self._ctx.currentTime + fade);
        source.connect(gain);
        gain.connect(self._musicBus);
        source.start();
        self._current = { audio: source, gain: gain, src: src };
        if (self._ducked) self._applyDuck();
      });
    },

    /* ---------- SFX：一次性播放（带轻微随机 pitch，避免机械感） ---------- */
    _playSfx: function (eventName, opts) {
      var self = this;
      var src = SFX_EVENTS[eventName];
      var bus = eventName.indexOf("/UI/") === 0 ? this._uiBus : this._sfxBus;
      this._load(src, function (buf) {
        var source = self._ctx.createBufferSource();
        source.buffer = buf;
        var rnd = 1 + (Math.random() - 0.5) * 0.06; // ±3% pitch 变化
        source.playbackRate.value = rnd;
        var gain = self._ctx.createGain();
        gain.gain.value = 1;
        source.connect(gain);
        gain.connect(bus);
        source.start();
      });
    },

    /* ---------- 资源加载（缓存） ---------- */
    _load: function (url, cb) {
      var self = this;
      if (this._sfxCache[url]) { cb(this._sfxCache[url]); return; }
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.responseType = "arraybuffer";
      xhr.onload = function () {
        self._ctx.decodeAudioData(xhr.response, function (buf) {
          self._sfxCache[url] = buf;
          cb(buf);
        }, function () {
          console.warn("[Audio] decode failed:", url);
        });
      };
      xhr.onerror = function () {
        console.warn("[Audio] load failed:", url);
      };
      xhr.send();
    },

    /* ---------- 对话 ducking：BGM 自动 -6dB ---------- */
    duck: function (on) {
      this._ducked = on;
      this._applyDuck();
    },

    _applyDuck: function () {
      if (!this._current || !this._ctx) return;
      var target = this._ducked ? 0.5 : 1; // -6dB ≈ 0.5
      var now = this._ctx.currentTime;
      var g = this._current.gain.gain;
      g.cancelScheduledValues(now);
      g.setValueAtTime(g.value, now);
      g.linearRampToValueAtTime(target, now + 0.35);
    },

    /* ---------- 音量控制（持久化） ---------- */
    setVolume: function (bus, v) {
      this._vol[bus] = Math.max(0, Math.min(1, v));
      if (bus === "master" && this._muted && v > 0) this._muted = false;
      var g = { master: this._master, music: this._musicBus, sfx: this._sfxBus, ui: this._uiBus }[bus];
      var target = (bus === "master" && this._muted) ? 0 : this._vol[bus];
      if (g && this._ctx) {
        g.gain.setTargetAtTime(target, this._ctx.currentTime, 0.05);
      }
      try {
        localStorage.setItem("p002_audio_vol", JSON.stringify(this._vol));
        localStorage.setItem("p002_audio_muted", this._muted ? "1" : "0");
      } catch (e) { /* ignore */ }
      this._syncUi();
    },

    getVolume: function (bus) { return this._vol[bus]; },
    isMuted: function () { return this._muted; },

    setMuted: function (m) {
      this._muted = m;
      var target = m ? 0 : this._vol.master;
      if (this._master && this._ctx) {
        this._master.gain.setTargetAtTime(target, this._ctx.currentTime, 0.05);
      }
      try {
        localStorage.setItem("p002_audio_muted", m ? "1" : "0");
      } catch (e) { /* ignore */ }
      this._syncUi();
    },

    /* 场景快捷入口：Audio.scene('daily')，unlock 后自动播放 */
    scene: function (name) {
      if (SCENE_BGM[name]) this.play(SCENE_BGM[name]);
    },

    stopBgm: function (fade) {
      fade = fade || 0.6;
      var old = this._current;
      if (!old || !this._ctx) return;
      var now = this._ctx.currentTime;
      old.gain.gain.cancelScheduledValues(now);
      old.gain.gain.setValueAtTime(old.gain.gain.value, now);
      old.gain.gain.linearRampToValueAtTime(0, now + fade);
      var src = old.src;
      setTimeout(function () {
        try { old.audio.stop(); } catch (e) { /* ignore */ }
        old.audio.disconnect();
      }, fade * 1000 + 50);
      this._current = null;
    },

    /* ---------- 音量面板 UI ---------- */
    _uiInjected: false,
    _injectUi: function () {
      if (this._uiInjected) return;
      this._uiInjected = true;

      var style = document.createElement("style");
      style.textContent = [
        "#p002AudioBtn{position:fixed;right:14px;bottom:14px;z-index:99990;width:46px;height:46px;border-radius:50%;",
        "border:1px solid rgba(126,156,137,.5);background:rgba(246,243,239,.95);color:#4a6a58;",
        "box-shadow:0 4px 14px rgba(46,46,46,.18);cursor:pointer;display:grid;place-items:center;",
        "font-size:20px;line-height:1;transition:transform .15s ease,box-shadow .15s ease;}",
        "#p002AudioBtn:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(46,46,46,.22);}",
        "#p002AudioBtn svg{width:22px;height:22px;fill:currentColor;}",
        "#p002AudioPanel{position:fixed;right:14px;bottom:70px;z-index:99991;width:min(240px,calc(100vw - 40px));",
        "background:#fffdf8;border:1px solid #d7cec2;border-radius:14px;box-shadow:0 16px 48px rgba(46,46,46,.18);",
        "padding:14px 16px;display:none;font-family:'PingFang SC','Microsoft YaHei','Noto Sans SC',system-ui,sans-serif;}",
        "#p002AudioPanel.open{display:block;}",
        "#p002AudioPanel h4{margin:0 0 10px;font-size:13px;color:#2e2e2e;letter-spacing:.08em;font-weight:700;}",
        ".p002-vol-row{display:flex;align-items:center;gap:8px;margin-bottom:10px;}",
        ".p002-vol-row label{flex:none;width:34px;font-size:12px;color:#7b7a72;text-align:left;}",
        ".p002-vol-row input[type=range]{flex:1;accent-color:#7e9c89;height:4px;cursor:pointer;}",
        "#p002AudioMute{width:100%;margin-top:2px;padding:8px 0;border:1px solid #d7cec2;border-radius:999px;",
        "background:#edf2ef;color:#4a6a58;font-size:13px;cursor:pointer;transition:background .15s ease;}",
        "#p002AudioMute:hover{background:#dbe5c8;}",
        "#p002AudioMute.muted{background:#f3dede;color:#a55f5f;border-color:#e0c2c2;}"
      ].join("");
      document.head.appendChild(style);

      // 喇叭按钮（SVG 图标）
      var btn = document.createElement("button");
      btn.type = "button";
      btn.id = "p002AudioBtn";
      btn.setAttribute("aria-label", "声音设置");
      btn.innerHTML =
        '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4.03v8.05A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z"/></svg>';
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        Audio._togglePanel();
      });
      document.body.appendChild(btn);

      // 音量面板
      var panel = document.createElement("div");
      panel.id = "p002AudioPanel";
      panel.innerHTML =
        '<h4>声音设置</h4>' +
        '<div class="p002-vol-row"><label>音乐</label><input id="p002VolMusic" type="range" min="0" max="100" value="60"></div>' +
        '<div class="p002-vol-row"><label>音效</label><input id="p002VolSfx" type="range" min="0" max="100" value="70"></div>' +
        '<button id="p002AudioMute" type="button">静音</button>';
      document.body.appendChild(panel);

      var musicSlider = panel.querySelector("#p002VolMusic");
      var sfxSlider = panel.querySelector("#p002VolSfx");
      var muteBtn = panel.querySelector("#p002AudioMute");

      musicSlider.addEventListener("input", function () {
        Audio.setVolume("music", this.value / 100);
      });
      sfxSlider.addEventListener("input", function () {
        Audio.setVolume("sfx", this.value / 100);
      });
      muteBtn.addEventListener("click", function () {
        Audio.setMuted(!Audio.isMuted());
      });
      panel.addEventListener("click", function (e) { e.stopPropagation(); });
      document.addEventListener("pointerdown", function (e) {
        if (!e.target.closest("#p002AudioPanel, #p002AudioBtn")) Audio._closePanel();
      });

      this._syncUi();
    },

    _togglePanel: function () {
      var panel = document.getElementById("p002AudioPanel");
      if (!panel) return;
      panel.classList.toggle("open");
    },
    openSettings: function () {
      if (!this._ready) this.init();
      var bodyBgm = document.body && document.body.getAttribute("data-bgm");
      if (bodyBgm && SCENE_BGM[bodyBgm]) this.scene(bodyBgm);
      this._injectUi();
      var panel = document.getElementById("p002AudioPanel");
      if (panel) panel.classList.add("open");
    },
    _closePanel: function () {
      var panel = document.getElementById("p002AudioPanel");
      if (panel) panel.classList.remove("open");
    },
    _syncUi: function () {
      var musicSlider = document.getElementById("p002VolMusic");
      var sfxSlider = document.getElementById("p002VolSfx");
      var muteBtn = document.getElementById("p002AudioMute");
      if (musicSlider) musicSlider.value = Math.round(this._vol.music * 100);
      if (sfxSlider) sfxSlider.value = Math.round(this._vol.sfx * 100);
      if (muteBtn) {
        muteBtn.textContent = this._muted ? "取消静音" : "静音";
        muteBtn.classList.toggle("muted", this._muted);
      }
    }
  };

  // 首次用户交互时解锁 AudioContext（移动端必须），并自动起播页面场景 BGM
  function unlock() {
    Audio.init();
    var bodyBgm = document.body && document.body.getAttribute("data-bgm");
    if (bodyBgm && SCENE_BGM[bodyBgm]) Audio.scene(bodyBgm);
    Audio._injectUi();
    document.removeEventListener("pointerdown", unlock);
    document.removeEventListener("touchstart", unlock);
    document.removeEventListener("keydown", unlock);
  }
  document.addEventListener("pointerdown", unlock);
  document.addEventListener("touchstart", unlock);
  document.addEventListener("keydown", unlock);
  document.addEventListener("click", function (event) {
    var button = event.target.closest('[data-action="audio"]');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    Audio.openSettings();
  });

  global.Audio = Audio;
})(window);
