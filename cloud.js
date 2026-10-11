/* =====================================================================
   cloud.js  —  real accounts (email + password) and cloud-saved data
   Uses Supabase. Loads BEFORE script.js and starts the planner only
   after the person is signed in and their data has been loaded.
   ===================================================================== */
(function () {
  "use strict";

  var cfg = window.PLANNER_CONFIG || {};
  var LS;
  try {
    LS = window.localStorage;
    LS.getItem("pl_probe");
  } catch (error) {
    LS = null;
  }

  var proto = Storage.prototype;
  var origGet = proto.getItem;
  var origSet = proto.setItem;
  var origRemove = proto.removeItem;

  /* ---------------- small helpers ---------------- */
  function $(id) { return document.getElementById(id); }

  function esc(value) {
    return String(value === undefined || value === null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function rd(key, fallback) {
    try {
      var raw = origGet.call(LS, key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  }

  function wr(key, value) {
    try {
      origSet.call(LS, key, JSON.stringify(value));
    } catch (error) {}
  }

  /* ---------------- language for the sign-in screen ---------------- */
  var lang = LS && rd("pl_lang", "en") === "fa" ? "fa" : "en";

  var FAD = {
    "Welcome back": "خوش برگشتی",
    "Create your space": "فضای خودت را بساز",
    "Your own calm space for plans, money and habits.": "فضای آرام و شخصی تو برای برنامه‌ها، پول و عادت‌ها.",
    "Sign in": "ورود",
    "Create account": "ساخت حساب",
    "Email": "ایمیل",
    "Password": "رمز عبور",
    "Your name": "نام تو",
    "Show password": "نمایش رمز عبور",
    "At least 8 characters.": "دست‌کم ۸ کاراکتر.",
    "Gender (optional)": "جنسیت (اختیاری)",
    "Female": "زن", "Male": "مرد", "Other": "سایر",
    "Prefer not to say": "ترجیح می‌دهم نگویم",
    "Forgot password?": "رمز عبور را فراموش کردی؟",
    "Send reset link": "ارسال لینک بازیابی",
    "Back to sign in": "بازگشت به ورود",
    "Reset your password": "بازیابی رمز عبور",
    "Enter your email and we will send you a link.": "ایمیلت را بنویس تا لینک بازیابی برایت بفرستیم.",
    "Set a new password": "رمز عبور جدید",
    "New password": "رمز عبور جدید",
    "Save new password": "ذخیره‌ی رمز جدید",
    "Password updated.": "رمز عبور عوض شد.",
    "Your data is saved to your account, so it stays safe and follows you to any device.": "اطلاعاتت در حساب خودت ذخیره می‌شود، پس امن می‌ماند و در هر دستگاهی همراهت است.",
    "Please enter a valid email.": "لطفاً یک ایمیل معتبر وارد کن.",
    "Please enter your password.": "لطفاً رمز عبورت را بنویس.",
    "Password must be at least 8 characters.": "رمز عبور باید دست‌کم ۸ کاراکتر باشد.",
    "Please enter your name.": "لطفاً نامت را وارد کن.",
    "Wrong email or password.": "ایمیل یا رمز عبور درست نیست.",
    "Please confirm your email first. Check your inbox.": "اول ایمیلت را تأیید کن. صندوق ورودی‌ات را ببین.",
    "This email already has an account. Try signing in.": "برای این ایمیل قبلاً حساب ساخته شده. وارد شو.",
    "Check your email to confirm your account, then sign in.": "برای تأیید حساب ایمیلت را ببین، بعد وارد شو.",
    "We sent you a link to reset your password.": "لینک بازیابی رمز عبور برایت ایمیل شد.",
    "Something went wrong. Please try again.": "مشکلی پیش آمد. دوباره امتحان کن.",
    "Loading your data…": "در حال بارگذاری اطلاعاتت…",
    "Signing you in…": "در حال ورود…",
    "Signing you out…": "در حال خروج…",
    "Try again": "تلاش دوباره",
    "Setup needed: add your Supabase URL and key in config.js.": "نیاز به تنظیم: آدرس و کلید Supabase را در config.js بنویس.",
    "Could not load the planner. Please refresh the page.": "برنامه‌ریز بالا نیامد. صفحه را رفرش کن.",
    "Saving…": "در حال ذخیره…",
    "All changes saved": "همه‌ی تغییرها ذخیره شد",
    "Not saved yet. Will retry.": "هنوز ذخیره نشده. دوباره تلاش می‌کنیم."
  };

  function t(text) {
    return lang === "fa" && FAD[text] ? FAD[text] : text;
  }

  function applyDir() {
    document.documentElement.setAttribute("dir", lang === "fa" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", lang === "fa" ? "fa" : "en");
  }
  applyDir();

  /* ---------------- sign-in screen ---------------- */
  var ui = { mode: "loading", text: "Signing you in…", email: "", name: "", gender: "none", msg: "", ok: false, busy: false };
  var overlay = null;
  var client = null;
  var started = false;
  var signingOut = false;
  var recovering = /type=recovery/.test(location.hash || "");

  function ensureOverlay() {
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "pl-overlay";
      overlay.id = "plAuth";
      overlay.addEventListener("click", onOverlayClick);
      overlay.addEventListener("change", onOverlayChange);
      overlay.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && event.target.tagName === "INPUT" && event.target.type !== "checkbox") {
          event.preventDefault();
          onGo();
        }
      });
      document.body.appendChild(overlay);
    }
    return overlay;
  }

  function capture() {
    if ($("plEmail")) { ui.email = $("plEmail").value.trim(); }
    if ($("plName")) { ui.name = $("plName").value.trim(); }
  }

  function chips(list, current, attr) {
    return list.map(function (item) {
      return "<button type='button' class='pl-chip" + (item[0] === current ? " on" : "") + "' " + attr + "='" + item[0] + "'>" + esc(item[1]) + "</button>";
    }).join("");
  }

  function render() {
    ensureOverlay();
    var m = ui.mode;
    var h = "<div class='pl-card'><div class='pl-logo'><svg class='ic'><use href='#i-heart'/></svg></div>";

    if (m === "loading") {
      h += "<h1>" + esc(t("Welcome back")) + "</h1><p class='pl-sub'>" + esc(t(ui.text)) + "</p></div>";
      overlay.innerHTML = h;
      return;
    }
    if (m === "fatal") {
      h += "<p class='pl-error'>" + esc(t(ui.text)) + "</p><button type='button' data-act='reload'>" + esc(t("Try again")) + "</button></div>";
      overlay.innerHTML = h;
      return;
    }

    var title = m === "signup" ? "Create your space" : m === "forgot" ? "Reset your password" : m === "recovery" ? "Set a new password" : "Welcome back";
    h += "<h1>" + esc(t(title)) + "</h1>";
    h += "<p class='pl-sub'>" + esc(t(m === "forgot" ? "Enter your email and we will send you a link." : "Your own calm space for plans, money and habits.")) + "</p>";
    h += "<div class='pl-row'>" + chips([["en", "English"], ["fa", "فارسی"]], lang, "data-lang") + "</div>";

    if (m === "login" || m === "signup") {
      h += "<div class='pl-row'>" + chips([["login", t("Sign in")], ["signup", t("Create account")]], m, "data-mode") + "</div>";
    }
    if (m !== "recovery") {
      h += "<input id='plEmail' type='email' autocomplete='email' placeholder='" + esc(t("Email")) + "' value='" + esc(ui.email) + "'>";
    }
    if (m === "signup") {
      h += "<input id='plName' type='text' autocomplete='name' placeholder='" + esc(t("Your name")) + "' value='" + esc(ui.name) + "'>";
    }
    if (m === "login" || m === "signup" || m === "recovery") {
      h += "<input id='plPass' type='password' autocomplete='" + (m === "login" ? "current-password" : "new-password") + "' placeholder='" + esc(t(m === "recovery" ? "New password" : "Password")) + "'>";
      h += "<label class='pl-check'><input type='checkbox' id='plShow'><span>" + esc(t("Show password")) + "</span></label>";
    }
    if (m === "signup" || m === "recovery") {
      h += "<p class='pl-hint'>" + esc(t("At least 8 characters.")) + "</p>";
    }
    if (m === "signup") {
      h += "<p class='pl-label'>" + esc(t("Gender (optional)")) + "</p><div class='pl-row'>" +
        chips([["female", t("Female")], ["male", t("Male")], ["other", t("Other")], ["none", t("Prefer not to say")]], ui.gender, "data-gender") + "</div>";
    }
    h += "<p class='pl-error' id='plMsg' style='" + (ui.ok ? "color:#5f8a68" : "") + "'>" + esc(ui.msg ? t(ui.msg) : "") + "</p>";
    var goLabel = m === "signup" ? "Create account" : m === "forgot" ? "Send reset link" : m === "recovery" ? "Save new password" : "Sign in";
    h += "<button type='button' data-act='go'" + (ui.busy ? " disabled" : "") + ">" + esc(t(goLabel)) + "</button>";
    if (m === "login") {
      h += "<button type='button' class='pl-ghost' data-act='forgot'>" + esc(t("Forgot password?")) + "</button>";
    }
    if (m === "forgot") {
      h += "<button type='button' class='pl-ghost' data-act='back'>" + esc(t("Back to sign in")) + "</button>";
    }
    h += "<p class='pl-hint'>" + esc(t("Your data is saved to your account, so it stays safe and follows you to any device.")) + "</p></div>";
    overlay.innerHTML = h;
  }

  function setMsg(text, ok) {
    ui.msg = text;
    ui.ok = !!ok;
    ui.busy = false;
    render();
  }

  function onOverlayChange(event) {
    if (event.target.id === "plShow" && $("plPass")) {
      $("plPass").type = event.target.checked ? "text" : "password";
    }
  }

  function onOverlayClick(event) {
    var button = event.target.closest("button");
    if (!button) {
      return;
    }
    capture();
    if (button.hasAttribute("data-lang")) {
      lang = button.getAttribute("data-lang") === "fa" ? "fa" : "en";
      if (LS) { wr("pl_lang", lang); }
      applyDir();
      ui.msg = "";
      render();
    } else if (button.hasAttribute("data-mode")) {
      ui.mode = button.getAttribute("data-mode");
      ui.msg = "";
      render();
    } else if (button.hasAttribute("data-gender")) {
      ui.gender = button.getAttribute("data-gender");
      overlay.querySelectorAll("[data-gender]").forEach(function (b) {
        b.classList.toggle("on", b === button);
      });
    } else if (button.getAttribute("data-act") === "go") {
      onGo();
    } else if (button.getAttribute("data-act") === "forgot") {
      ui.mode = "forgot";
      ui.msg = "";
      render();
    } else if (button.getAttribute("data-act") === "back") {
      ui.mode = "login";
      ui.msg = "";
      render();
    } else if (button.getAttribute("data-act") === "reload") {
      location.reload();
    }
  }

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function onGo() {
    if (ui.busy || !client) {
      return;
    }
    capture();
    var email = ui.email.toLowerCase();
    var pass = $("plPass") ? $("plPass").value : "";
    var m = ui.mode;

    if (m === "recovery") {
      if (pass.length < 8) { return setMsg("Password must be at least 8 characters."); }
      ui.busy = true;
      client.auth.updateUser({ password: pass }).then(function (res) {
        if (res.error) { return setMsg("Something went wrong. Please try again."); }
        try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
        recovering = false;
        start(res.data.user);
      }, function () { setMsg("Something went wrong. Please try again."); });
      return;
    }

    if (!EMAIL_RE.test(email)) { return setMsg("Please enter a valid email."); }

    if (m === "forgot") {
      ui.busy = true;
      client.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname }).then(function (res) {
        if (res.error) { return setMsg("Something went wrong. Please try again."); }
        setMsg("We sent you a link to reset your password.", true);
      }, function () { setMsg("Something went wrong. Please try again."); });
      return;
    }

    if (m === "login") {
      if (!pass) { return setMsg("Please enter your password."); }
      ui.busy = true;
      render();
      client.auth.signInWithPassword({ email: email, password: pass }).then(function (res) {
        if (res.error) {
          var text = String(res.error.message || "");
          if (/not confirmed/i.test(text)) { return setMsg("Please confirm your email first. Check your inbox."); }
          if (/invalid/i.test(text)) { return setMsg("Wrong email or password."); }
          console.error(res.error);
          return setMsg("Something went wrong. Please try again.");
        }
        start(res.data.user);
      }, function () { setMsg("Something went wrong. Please try again."); });
      return;
    }

    if (m === "signup") {
      if (!ui.name) { return setMsg("Please enter your name."); }
      if (pass.length < 8) { return setMsg("Password must be at least 8 characters."); }
      ui.busy = true;
      render();
      client.auth.signUp({
        email: email,
        password: pass,
        options: { data: { name: ui.name, gender: ui.gender, lang: lang, periodOn: ui.gender === "female" } }
      }).then(function (res) {
        if (res.error) {
          console.error(res.error);
          if (/registered|exists/i.test(String(res.error.message || ""))) {
            return setMsg("This email already has an account. Try signing in.");
          }
          return setMsg("Something went wrong. Please try again.");
        }
        var user = res.data && res.data.user;
        if (user && user.identities && user.identities.length === 0) {
          return setMsg("This email already has an account. Try signing in.");
        }
        if (res.data && res.data.session) {
          return start(user);
        }
        ui.mode = "login";
        setMsg("Check your email to confirm your account, then sign in.", true);
      }, function () { setMsg("Something went wrong. Please try again."); });
    }
  }

  function showLoading(text) {
    ui.mode = "loading";
    ui.text = text;
    render();
  }

  function fatal(text) {
    ui.mode = "fatal";
    ui.text = text;
    render();
  }

  /* ---------------- cloud data sync ---------------- */
  var uid = "";
  var pre = "";
  var pending = {};
  var flushTimer = null;
  var flushing = false;
  var flushAgain = false;
  var badge = null;
  var badgeTimer = null;

  function setBadge(text, good) {
    if (!badge) {
      badge = document.createElement("div");
      badge.id = "plSync";
      badge.style.cssText = "position:fixed;top:10px;right:12px;z-index:50;background:#fff;border:1px solid #f4e0e5;color:#a65a70;font:600 12px/1 sans-serif;padding:6px 12px;border-radius:999px;box-shadow:0 4px 14px rgba(196,115,138,.15);transition:opacity .4s;pointer-events:none";
      document.body.appendChild(badge);
    }
    badge.textContent = t(text);
    badge.style.opacity = "1";
    badge.style.color = good === false ? "#b04a5f" : "#a65a70";
    clearTimeout(badgeTimer);
    if (good) {
      badgeTimer = setTimeout(function () { badge.style.opacity = "0"; }, 2200);
    }
  }

  function savePending() {
    try { origSet.call(LS, "pl_pending_" + uid, JSON.stringify(pending)); } catch (error) {}
  }

  function queueKey(key) {
    pending[key] = 1;
    savePending();
    clearTimeout(flushTimer);
    flushTimer = setTimeout(flushNow, 900);
    setBadge("Saving…");
  }

  function flushNow() {
    clearTimeout(flushTimer);
    var keys = Object.keys(pending);
    if (!keys.length || !client || !uid) {
      return Promise.resolve();
    }
    if (flushing) {
      flushAgain = true;
      return Promise.resolve();
    }
    flushing = true;
    var snapshot = {};
    var upserts = [];
    var deletes = [];
    keys.forEach(function (key) {
      var value = origGet.call(LS, pre + key);
      snapshot[key] = value;
      if (value === null) {
        deletes.push(key);
      } else {
        upserts.push({ user_id: uid, key: key, value: value, updated_at: new Date().toISOString() });
      }
    });
    var jobs = [];
    if (upserts.length) {
      jobs.push(client.from("user_data").upsert(upserts, { onConflict: "user_id,key" }));
    }
    deletes.forEach(function (key) {
      jobs.push(client.from("user_data").delete().eq("user_id", uid).eq("key", key));
    });
    return Promise.all(jobs).then(function (results) {
      var failed = results.some(function (r) { return r && r.error; });
      if (failed) {
        console.error("Sync error", results);
        setBadge("Not saved yet. Will retry.", false);
        clearTimeout(flushTimer);
        flushTimer = setTimeout(flushNow, 10000);
        return;
      }
      keys.forEach(function (key) {
        if (origGet.call(LS, pre + key) === snapshot[key]) {
          delete pending[key];
        }
      });
      savePending();
      setBadge("All changes saved", true);
    }).catch(function (error) {
      console.error("Sync error", error);
      setBadge("Not saved yet. Will retry.", false);
      flushTimer = setTimeout(flushNow, 10000);
    }).then(function () {
      flushing = false;
      if (flushAgain) {
        flushAgain = false;
        flushTimer = setTimeout(flushNow, 300);
      }
    });
  }

  function pullAll() {
    return client.from("user_data").select("key,value").eq("user_id", uid).then(function (res) {
      if (res.error) {
        throw res.error;
      }
      (res.data || []).forEach(function (row) {
        if (!pending[row.key]) {
          origSet.call(LS, pre + row.key, row.value);
        }
      });
    });
  }

  function hasCache() {
    for (var i = 0; i < LS.length; i++) {
      var key = LS.key(i);
      if (key && key.indexOf(pre) === 0) {
        return true;
      }
    }
    return false;
  }

  function installHooks() {
    function track(key) {
      if (key.indexOf(pre) === 0) {
        queueKey(key.slice(pre.length));
      } else if (key === "pl_users") {
        try { origSet.call(LS, "pl_profile_dirty", uid); } catch (error) {}
      }
    }
    proto.setItem = function (key, value) {
      origSet.call(this, key, value);
      try { track(String(key)); } catch (error) {}
    };
    proto.removeItem = function (key) {
      origRemove.call(this, key);
      try { track(String(key)); } catch (error) {}
    };
  }

  /* ---------------- profile (name, gender, language) ---------------- */
  function profileFromUser(user) {
    var m = user.user_metadata || {};
    var g = m.gender || "none";
    return {
      id: user.id,
      email: user.email,
      name: m.name || String(user.email || "").split("@")[0],
      gender: g,
      lang: m.lang === "fa" ? "fa" : "en",
      periodOn: typeof m.periodOn === "boolean" ? m.periodOn : g === "female",
      created: Date.parse(user.created_at) || Date.now()
    };
  }

  function resolveProfile(user) {
    var base = profileFromUser(user);
    if (origGet.call(LS, "pl_profile_dirty") !== user.id) {
      return Promise.resolve(base);
    }
    var list = rd("pl_users", []);
    var local = null;
    (Array.isArray(list) ? list : []).forEach(function (u) {
      if (u && u.id === user.id) { local = u; }
    });
    if (!local) {
      origRemove.call(LS, "pl_profile_dirty");
      return Promise.resolve(base);
    }
    var merged = {
      id: base.id, email: base.email, created: base.created,
      name: local.name || base.name,
      gender: local.gender || base.gender,
      lang: local.lang === "fa" ? "fa" : "en",
      periodOn: !!local.periodOn
    };
    return client.auth.updateUser({
      data: { name: merged.name, gender: merged.gender, lang: merged.lang, periodOn: merged.periodOn }
    }).then(function (res) {
      if (!res.error) { origRemove.call(LS, "pl_profile_dirty"); }
      return merged;
    }, function () { return merged; });
  }

  /* ---------------- start / sign out ---------------- */
  function loadApp() {
    var script = document.createElement("script");
    script.src = "script.js";
    script.onload = function () {
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
        overlay = null;
      }
    };
    script.onerror = function () { fatal("Could not load the planner. Please refresh the page."); };
    document.body.appendChild(script);
  }

  function wireGlobalHandlers() {
    document.addEventListener("click", function (event) {
      var target = event.target && event.target.closest ? event.target.closest("#plSwitchBtn, [data-st='signout']") : null;
      if (target) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        doSignOut();
      }
    }, true);
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") { flushNow(); }
    });
    window.addEventListener("pagehide", function () { flushNow(); });
    window.addEventListener("online", function () { flushNow(); });
  }

  function start(user) {
    if (started || !user) {
      return;
    }
    started = true;
    uid = user.id;
    pre = "u:" + uid + ":";
    pending = rd("pl_pending_" + uid, {});
    ui.mode = "loading";
    ui.text = "Loading your data…";
    render();

    flushNow().then(function () {
      return pullAll().catch(function (error) {
        console.warn("Could not load from the cloud, using the saved copy.", error);
        if (!hasCache()) { throw error; }
      });
    }).then(function () {
      return resolveProfile(user);
    }).then(function (me) {
      wr("pl_users", [me]);
      wr("pl_active", me.id);
      wr("pl_lang", me.lang);
      installHooks();
      wireGlobalHandlers();
      loadApp();
    }).catch(function (error) {
      console.error(error);
      started = false;
      fatal("Could not load the planner. Please refresh the page.");
    });
  }

  function clearLocalCopy() {
    var doomed = [];
    for (var i = 0; i < LS.length; i++) {
      var key = LS.key(i);
      if (key && (key.indexOf(pre) === 0 || key === "pl_users" || key === "pl_active" || key === "pl_profile_dirty")) {
        doomed.push(key);
      }
    }
    doomed.forEach(function (key) { origRemove.call(LS, key); });
  }

  function doSignOut() {
    if (signingOut) {
      return;
    }
    signingOut = true;
    ensureOverlay();
    showLoading("Signing you out…");
    flushNow().then(function () {
      var unsynced = Object.keys(pending).length > 0;
      return client.auth.signOut().then(function () {
        if (!unsynced) { clearLocalCopy(); }
        location.reload();
      });
    }).catch(function () { location.reload(); });
  }

  /* ---------------- boot ---------------- */
  function boot() {
    render();
    if (!LS) {
      return fatal("Could not load the planner. Please refresh the page.");
    }
    if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY || /YOUR[_-]/i.test(cfg.SUPABASE_URL + cfg.SUPABASE_ANON_KEY) || !window.supabase) {
      return fatal("Setup needed: add your Supabase URL and key in config.js.");
    }
    client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: {
          getItem: function (key) { return origGet.call(LS, key); },
          setItem: function (key, value) { origSet.call(LS, key, value); },
          removeItem: function (key) { origRemove.call(LS, key); }
        }
      }
    });
    client.auth.onAuthStateChange(function (event) {
      if (event === "PASSWORD_RECOVERY") {
        recovering = true;
        setTimeout(function () {
          if (!started) {
            ui.mode = "recovery";
            ui.msg = "";
            render();
          }
        }, 0);
      } else if (event === "SIGNED_OUT" && started && !signingOut) {
        setTimeout(function () { location.reload(); }, 0);
      }
    });
    client.auth.getSession().then(function (res) {
      var session = res && res.data && res.data.session;
      if (recovering) {
        ui.mode = "recovery";
        ui.msg = "";
        render();
      } else if (session) {
        start(session.user);
      } else {
        ui.mode = "login";
        render();
      }
    }).catch(function (error) {
      console.error(error);
      fatal("Could not load the planner. Please refresh the page.");
    });
  }

  boot();
})();
