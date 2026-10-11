/* =====================================================================
   NEW: profiles + language (English / فارسی) + money + cycle + settings
   PASTE THIS BLOCK AT THE VERY TOP OF THE JS PANE (above everything).
   ===================================================================== */
(function () {
  "use strict";

  var LS;
  try {
    LS = window.localStorage;
    LS.getItem("pl_probe");
  } catch (error) {
    return;
  }

  /* ------------------------------------------------------------------
     1. Storage that is separate for every profile
     ------------------------------------------------------------------ */
  var proto = Storage.prototype;
  var rawGet = proto.getItem;
  var rawSet = proto.setItem;
  var rawRemove = proto.removeItem;

  function gRead(key, fallback) {
    try {
      var raw = rawGet.call(LS, key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  }

  function gWrite(key, value) {
    try {
      rawSet.call(LS, key, JSON.stringify(value));
    } catch (error) {}
  }

  var users = gRead("pl_users", []);
  if (!Array.isArray(users)) {
    users = [];
  }
  var activeId = gRead("pl_active", "");
  var me = null;
  users.forEach(function (u) {
    if (u && u.id === activeId) {
      me = u;
    }
  });
  var lang = (me ? me.lang : gRead("pl_lang", "en")) === "fa" ? "fa" : "en";
  var prefix = "u:" + (me ? me.id : "guest") + ":";

  function mapKey(key) {
    key = String(key);
    return key.indexOf("pl_") === 0 ? key : prefix + key;
  }
  proto.getItem = function (key) { return rawGet.call(this, mapKey(key)); };
  proto.setItem = function (key, value) { return rawSet.call(this, mapKey(key), value); };
  proto.removeItem = function (key) { return rawRemove.call(this, mapKey(key)); };

  var LEGACY_KEYS = [
    "glasses", "glassesDate", "gratitudeList", "reminders", "mood", "moodDate",
    "studySessions", "journalEntries", "studyLog", "goals", "tasks",
    "weeklyStudyPlans", "weeklyStudyPlan", "selectedStudyWeek"
  ];

  function lj(key, fallback) {
    try {
      var raw = LS.getItem(key);
      if (raw === null) {
        return fallback;
      }
      var value = JSON.parse(raw);
      return value === null || value === undefined ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function sj(key, value) {
    try {
      LS.setItem(key, JSON.stringify(value));
    } catch (error) {}
  }

  /* ------------------------------------------------------------------
     2. Persian translation (works on the whole page automatically)
     ------------------------------------------------------------------ */
  if (lang === "fa") {
    document.documentElement.setAttribute("dir", "rtl");
    document.documentElement.setAttribute("lang", "fa");
  }

  var FA = {
    "My Daily Planner": "برنامه‌ریز روزانه‌ی من",
    "gentle plans for soft days": "برنامه‌های مهربان برای روزهای آرام",
    "Home": "خانه", "Study": "مطالعه", "Progress": "پیشرفت", "Calendar": "تقویم",
    "Journal": "دفتر خاطرات", "Goals": "اهداف", "Tasks": "کارها",
    "Money": "پول", "Cycle": "چرخه", "Settings": "تنظیمات",
    "How are you feeling today?": "امروز چه حسی داری؟",
    "Great": "عالی", "Good": "خوب", "Okay": "معمولی", "Not great": "نه چندان خوب", "Bad": "بد",
    "Today's Tasks": "کارهای امروز",
    "Add a new task...": "یک کار جدید اضافه کن...",
    "+ Add Task": "+ افزودن کار",
    "Daily Habits": "عادت‌های روزانه",
    "+ Add glass": "+ افزودن لیوان",
    "− Remove glass": "− کم کردن لیوان",
    "Today's Gratitude": "سپاسگزاری امروز",
    "Today I'm grateful for...": "امروز سپاسگزارم برای...",
    "Add Gratitude": "افزودن",
    "Reminders": "یادآورها",
    "What do you need to remember?": "چه چیزی باید یادت بماند؟",
    "Add Reminder": "افزودن یادآور",
    "Remove": "حذف",
    "Study Planner": "برنامه‌ی مطالعه",
    "Plan your study gently, one step at a time.": "مطالعه‌ات را آرام و قدم‌به‌قدم برنامه‌ریزی کن.",
    "← Previous": "→ قبلی",
    "Next →": "بعدی ←",
    "This Week": "این هفته",
    "Add what you would like to study each day.": "بنویس هر روز چه چیزی می‌خواهی بخوانی.",
    "Saturday": "شنبه", "Sunday": "یکشنبه", "Monday": "دوشنبه", "Tuesday": "سه‌شنبه",
    "Wednesday": "چهارشنبه", "Thursday": "پنج‌شنبه", "Friday": "جمعه",
    "Subject": "درس", "Topic": "مبحث", "Minutes": "دقیقه", "Tests": "تست‌ها",
    "Actual minutes": "دقیقه‌ی واقعی",
    "+ Add another": "+ افزودن مورد دیگر",
    "Done": "انجام شد",
    "Study Log": "گزارش مطالعه",
    "Record what you actually studied.": "آنچه واقعاً خواندی را ثبت کن.",
    "+ Add study session": "+ ثبت جلسه‌ی مطالعه",
    "Weekly Study Overview": "نمای کلی مطالعه‌ی هفته",
    "A calm view of everything you plan to study this week.": "نگاهی آرام به همه‌ی برنامه‌ی مطالعه‌ی این هفته.",
    "Planned study time": "زمان مطالعه‌ی برنامه‌ریزی‌شده",
    "Actual study time": "زمان مطالعه‌ی واقعی",
    "Planned tests": "تست‌های برنامه‌ریزی‌شده",
    "Actual tests": "تست‌های واقعی",
    "Planned sessions": "جلسه‌های برنامه‌ریزی‌شده",
    "Completed": "انجام‌شده",
    "Planned": "برنامه‌ریزی‌شده",
    "Nothing planned.": "چیزی برنامه‌ریزی نشده.",
    "No sessions logged this week.": "این هفته جلسه‌ای ثبت نشده.",
    "Total tests (optional)": "تعداد تست (اختیاری)",
    "Study session": "جلسه‌ی مطالعه",
    "No tasks for today yet.": "برای امروز هنوز کاری نیست.",
    "My Progress": "پیشرفت من",
    "Study Sessions": "جلسه‌های مطالعه",
    "Study Time": "زمان مطالعه",
    "Total Tests": "مجموع تست‌ها",
    "Correct": "درست", "Wrong": "غلط", "Unanswered": "نزده", "Percentage": "درصد",
    "minutes": "دقیقه",
    "This Week vs Last Week": "این هفته در برابر هفته‌ی قبل",
    "→ No change": "→ بدون تغییر",
    "Previous Weeks": "هفته‌های قبل",
    "No previous weeks yet.": "هنوز هفته‌ی قبلی‌ای نیست.",
    "All Time": "کل دوران",
    "Total Sessions": "کل جلسه‌ها",
    "Total Study Time": "کل زمان مطالعه",
    "Weekly Study Progress": "پیشرفت هفتگی مطالعه",
    "No study sessions yet.": "هنوز جلسه‌ی مطالعه‌ای ثبت نشده.",
    "See your tasks and important dates at a glance.": "کارها و تاریخ‌های مهمت را یک‌جا ببین.",
    "Today": "امروز",
    "Sun": "ی", "Mon": "د", "Tue": "س", "Wed": "چ", "Thu": "پ", "Fri": "ج", "Sat": "ش",
    "Deadline today": "مهلت امروز",
    "No tasks for this day.": "برای این روز کاری نیست.",
    "Not completed": "انجام‌نشده",
    "Mark as completed": "علامت‌گذاری به‌عنوان انجام‌شده",
    "Add Task for This Day": "افزودن کار برای این روز",
    "Work": "کار", "Personal": "شخصی", "Health": "سلامت", "Other": "سایر",
    "High": "زیاد", "Medium": "متوسط", "Low": "کم",
    "Untitled task": "کار بدون عنوان", "Untitled goal": "هدف بدون عنوان",
    "My Journal": "دفتر خاطرات من",
    "Write down your thoughts, feelings, or anything you want to remember.": "افکار و احساساتت یا هر چیزی که می‌خواهی به یاد بماند را بنویس.",
    "Dear diary...": "دفتر عزیزم...",
    "Save Entry": "ذخیره",
    "Delete": "حذف",
    "Keep track of the things you want to achieve.": "آنچه می‌خواهی به آن برسی را دنبال کن.",
    "+ Add Goal": "+ افزودن هدف",
    "No goals yet. Add your first one!": "هنوز هدفی نداری. اولین هدفت را اضافه کن!",
    "Milestones": "گام‌ها", "Milestone": "گام",
    "+ Add milestone": "+ افزودن گام",
    "New Goal": "هدف جدید", "Edit Goal": "ویرایش هدف",
    "Goal title": "عنوان هدف",
    "Description (optional)": "توضیحات (اختیاری)",
    "Save": "ذخیره", "Cancel": "انصراف", "Edit": "ویرایش",
    "Keep track of the little things you want to get done.": "کارهای کوچکی که می‌خواهی انجام بدهی را دنبال کن.",
    "Total": "کل", "Remaining": "باقی‌مانده",
    "Search tasks...": "جستجوی کارها...",
    "All categories": "همه‌ی دسته‌ها",
    "All priorities": "همه‌ی اولویت‌ها",
    "All tasks": "همه‌ی کارها",
    "Newest first": "جدیدترین",
    "Date: earliest first": "تاریخ: نزدیک‌ترین",
    "Priority: high first": "اولویت: بالا اول",
    "Incomplete first": "ناتمام‌ها اول",
    "Alphabetical": "الفبایی",
    "No tasks found.": "کاری پیدا نشد.",
    "Reschedule": "تغییر تاریخ",
    "No goal": "بدون هدف",
    "Task title": "عنوان کار",
    "New Task": "کار جدید", "Edit Task": "ویرایش کار",
    "little steps, big blooms": "قدم‌های کوچک، شکوفه‌های بزرگ",
    "Please enter valid study information.": "لطفاً اطلاعات معتبر وارد کن.",
    "Please enter a task title.": "لطفاً عنوان کار را وارد کن.",
    "Please enter a goal title.": "لطفاً عنوان هدف را وارد کن.",
    "Delete this task?": "این کار حذف شود؟",
    "Delete this goal?": "این هدف حذف شود؟",
    "Delete this journal entry?": "این یادداشت حذف شود؟",
    "Delete this study session?": "این جلسه حذف شود؟",
    "Task title:": "عنوان کار:",
    "New date (YYYY-MM-DD):": "تاریخ جدید (YYYY-MM-DD):",
    "Please use the format YYYY-MM-DD.": "لطفاً از قالب YYYY-MM-DD استفاده کن.",

    "Welcome": "خوش آمدی",
    "Your own calm space for plans, money and habits.": "فضای آرام و شخصی تو برای برنامه‌ها، پول و عادت‌ها.",
    "Continue as": "ادامه با",
    "Email": "ایمیل",
    "Your name": "نام تو",
    "New here? Add your name too. Coming back? Your email is enough.": "تازه آمده‌ای؟ نامت را هم بنویس. برگشته‌ای؟ ایمیل کافی است.",
    "Gender (optional)": "جنسیت (اختیاری)",
    "Gender": "جنسیت",
    "Female": "زن", "Male": "مرد",
    "Prefer not to say": "ترجیح می‌دهم نگویم",
    "Continue": "ادامه",
    "Your data stays on this device. No password is needed for now.": "اطلاعاتت فقط روی همین دستگاه می‌ماند. فعلاً به رمز عبور نیازی نیست.",
    "Please enter a valid email.": "لطفاً یک ایمیل معتبر وارد کن.",
    "Please enter your name.": "لطفاً نامت را وارد کن.",
    "Switch profile": "تغییر کاربر",

    "Keep an eye on what comes in and what goes out.": "ببین چه چیزی می‌آید و چه چیزی می‌رود.",
    "Income": "درآمد", "Expenses": "هزینه‌ها", "Expense": "هزینه",
    "Balance (all time)": "موجودی کل",
    "Monthly budget": "بودجه‌ی ماهانه",
    "Budget for this month (0 = none)": "بودجه‌ی این ماه (۰ = بدون بودجه)",
    "Spent": "خرج‌شده", "of": "از",
    "New entry": "ثبت جدید",
    "Amount": "مبلغ",
    "Note (optional)": "یادداشت (اختیاری)",
    "Add entry": "ثبت",
    "Spending by category": "هزینه به تفکیک دسته",
    "No spending this month.": "این ماه هزینه‌ای ثبت نشده.",
    "This month": "این ماه",
    "Nothing here yet.": "هنوز چیزی اینجا نیست.",
    "Please enter a valid amount.": "لطفاً مبلغ معتبر وارد کن.",
    "Toman": "تومان",
    "Food": "خوراک", "Transport": "رفت‌وآمد", "Shopping": "خرید", "Bills": "قبوض",
    "Fun": "تفریح", "Salary": "حقوق", "Allowance": "پول توجیبی", "Gift": "هدیه",

    "Gentle predictions based on your own dates.": "پیش‌بینی ملایم بر پایه‌ی تاریخ‌های خودت.",
    "Next period expected": "پریود بعدی احتمالاً",
    "Likely window": "بازه‌ی محتمل",
    "Log your first period to get a prediction.": "اولین پریودت را ثبت کن تا پیش‌بینی بگیری.",
    "Add at least two periods for a better estimate. Until then we use your typical cycle length.": "برای تخمین بهتر دست‌کم دو پریود ثبت کن. تا آن موقع از طول چرخه‌ی معمول تو استفاده می‌کنیم.",
    "Log a period": "ثبت پریود",
    "Period start": "شروع پریود",
    "Period end (optional)": "پایان پریود (اختیاری)",
    "Save period": "ذخیره‌ی پریود",
    "Typical cycle length (days)": "طول معمول چرخه (روز)",
    "Past periods": "پریودهای قبلی",
    "No periods logged yet.": "هنوز پریودی ثبت نشده.",
    "This is only an estimate based on your own logs. It isn't medical advice and can't be used to prevent or plan pregnancy.": "این فقط یک تخمین بر پایه‌ی ثبت‌های خودت است. توصیه‌ی پزشکی نیست و برای پیشگیری یا برنامه‌ریزی بارداری قابل استفاده نیست.",
    "Stored only on this device.": "فقط روی همین دستگاه ذخیره می‌شود.",
    "today": "امروز", "tomorrow": "فردا",
    "Your period may be a few days late. That's common. Log it when it arrives.": "ممکن است پریودت چند روز دیرتر بیاید. این معمول است. وقتی آمد ثبتش کن.",

    "Make this space yours.": "این فضا را مال خودت کن.",
    "Profile": "پروفایل",
    "Name": "نام",
    "Language": "زبان",
    "Show the cycle tracker": "نمایش بخش چرخه",
    "Save changes": "ذخیره‌ی تغییرات",
    "Your data": "اطلاعات تو",
    "Export my data": "خروجی گرفتن از اطلاعاتم",
    "Copy": "کپی",
    "Copied!": "کپی شد!",
    "Paste exported data here": "اطلاعات خروجی را اینجا بچسبان",
    "Import": "وارد کردن",
    "Delete all my data": "حذف همه‌ی اطلاعاتم",
    "Delete everything for this profile? This can't be undone.": "همه‌ی اطلاعات این پروفایل حذف شود؟ این کار برگشت‌پذیر نیست.",
    "Import finished.": "وارد کردن تمام شد.",
    "That doesn't look like exported planner data.": "این شبیه اطلاعات خروجی برنامه‌ریز نیست."
  };

  var FA_UNITS = { "minutes": "دقیقه", "tests": "تست", "percentage points": "واحد درصد" };

  var RULES = [
    [/^Water: (\d+) \/ 8 glasses$/, function (m) { return "آب: " + m[1] + " / 8 لیوان"; }],
    [/^Today you feel: (.+)$/, function (m) { return "امروز حس می‌کنی: " + (FA[m[1]] || m[1]); }],
    [/^Hello, (.+)$/, function (m) { return "سلام، " + m[1]; }],
    [/^in (\d+) days$/, function (m) { return m[1] + " روز دیگر"; }],
    [/^Average cycle: (\d+) days$/, function (m) { return "میانگین چرخه: " + m[1] + " روز"; }],
    [/^(\d+) days?$/, function (m) { return m[1] + " روز"; }],
    [/^(\d+) minutes?$/, function (m) { return m[1] + " دقیقه"; }],
    [/^(\d+) min$/, function (m) { return m[1] + " دقیقه"; }],
    [/^(\d+) min planned$/, function (m) { return m[1] + " دقیقه برنامه"; }],
    [/^(\d+) tests$/, function (m) { return m[1] + " تست"; }],
    [/^(\d+) study sessions$/, function (m) { return m[1] + " جلسه"; }],
    [/^↑ \+(-?[\d.]+) (minutes|tests|percentage points)$/, function (m) { return "↑ +" + m[1] + " " + FA_UNITS[m[2]]; }],
    [/^↓ (-?[\d.]+) (minutes|tests|percentage points)$/, function (m) { return "↓ " + m[1] + " " + FA_UNITS[m[2]]; }],
    [/^Week of (.+)$/, function (m) { return "هفته‌ی " + m[1]; }],
    [/^Sessions: (\d+)$/, function (m) { return "جلسه‌ها: " + m[1]; }],
    [/^Study time: (\d+) minutes$/, function (m) { return "زمان مطالعه: " + m[1] + " دقیقه"; }],
    [/^Tests: (\d+)$/, function (m) { return "تست‌ها: " + m[1]; }],
    [/^Percentage: (.+)%$/, function (m) { return "درصد: " + m[1] + "%"; }],
    [/^Progress: (\d+)%$/, function (m) { return "پیشرفت: " + m[1] + "%"; }],
    [/^Deadline: (.+)$/, function (m) { return "مهلت: " + m[1]; }],
    [/^Linked tasks: (\d+) \/ (\d+) done$/, function (m) { return "کارهای مرتبط: " + m[1] + " از " + m[2] + " انجام شد"; }],
    [/^Goal: (.+)$/, function (m) { return "هدف: " + m[1]; }],
    [/^(High|Medium|Low) priority$/, function (m) { return "اولویت " + FA[m[1]]; }],
    [/^(Correct|Wrong|Unanswered) (\d+)$/, function (m) { return FA[m[1]] + " " + m[2]; }],
    [/^(.+) Toman$/, function (m) { return m[1] + " تومان"; }]
  ];

  function trCore(text) {
    if (Object.prototype.hasOwnProperty.call(FA, text)) {
      return FA[text];
    }
    for (var i = 0; i < RULES.length; i++) {
      var match = text.match(RULES[i][0]);
      if (match) {
        return RULES[i][1](match);
      }
    }
    return null;
  }

  function tr(text) {
    if (text.indexOf(" · ") > -1) {
      return text.split(" · ").map(function (part) {
        var out = trCore(part.trim());
        return out === null ? part : out;
      }).join(" · ");
    }
    var result = trCore(text);
    return result === null ? text : result;
  }

  function faDigits(text) {
    return text
      .replace(/(\d),(?=\d)/g, "$1٬")
      .replace(/(\d)\.(?=\d)/g, "$1٫")
      .replace(/%/g, "٪")
      .replace(/\d/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹"[d]; });
  }

  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1 };

  function translateText(node) {
    var parent = node.parentNode;
    if (!parent || SKIP_TAGS[parent.nodeName]) {
      return;
    }
    var value = node.nodeValue;
    if (!value || node.__pl === value) {
      return;
    }
    var core = value.trim();
    if (core === "") {
      node.__pl = value;
      return;
    }
    var out = tr(core);
    if (!/[A-Za-z]/.test(out)) {
      out = faDigits(out);
    }
    var at = value.indexOf(core);
    var result = value.slice(0, at) + out + value.slice(at + core.length);
    if (result !== value) {
      node.nodeValue = result;
    }
    node.__pl = result;
  }

  function translateAttrs(element) {
    if (!element || element.nodeType !== 1) {
      return;
    }
    ["placeholder", "title", "aria-label"].forEach(function (name) {
      if (!element.hasAttribute(name)) {
        return;
      }
      var value = element.getAttribute(name);
      if (element["__pl_" + name] === value) {
        return;
      }
      var out = tr(value.trim());
      if (out !== value) {
        element.setAttribute(name, out);
      }
      element["__pl_" + name] = out;
    });
  }

  function translateTree(root) {
    if (!root) {
      return;
    }
    if (root.nodeType === 3) {
      translateText(root);
      return;
    }
    if (root.nodeType !== 1) {
      return;
    }
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var node;
    while ((node = walker.nextNode())) {
      translateText(node);
    }
    translateAttrs(root);
    var withAttrs = root.querySelectorAll("[placeholder],[title],[aria-label]");
    for (var i = 0; i < withAttrs.length; i++) {
      translateAttrs(withAttrs[i]);
    }
  }

  function startTranslator() {
    translateTree(document.body);
    var observer = new MutationObserver(function (records) {
      records.forEach(function (record) {
        if (record.type === "childList") {
          for (var i = 0; i < record.addedNodes.length; i++) {
            translateTree(record.addedNodes[i]);
          }
        } else if (record.type === "characterData") {
          translateText(record.target);
        } else if (record.type === "attributes") {
          translateAttrs(record.target);
        }
      });
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "title", "aria-label"]
    });
  }

  if (lang === "fa") {
    var nativeAlert = window.alert;
    var nativeConfirm = window.confirm;
    var nativePrompt = window.prompt;
    window.alert = function (message) { return nativeAlert.call(window, tr(String(message))); };
    window.confirm = function (message) { return nativeConfirm.call(window, tr(String(message))); };
    window.prompt = function (message, def) { return nativePrompt.call(window, tr(String(message)), def); };
  }

  /* ------------------------------------------------------------------
     3. Small helpers
     ------------------------------------------------------------------ */
  function $(id) { return document.getElementById(id); }

  function esc(value) {
    return String(value === undefined || value === null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function pad(n) { return String(n).padStart(2, "0"); }
  function dkey(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function pkey(k) { return new Date(k + "T00:00:00"); }
  function validKey(k) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(k))) return false;
    var d = pkey(k);
    return !isNaN(d.getTime()) && dkey(d) === String(k);
  }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function dayDiff(a, b) { return Math.round((pkey(dkey(a)) - pkey(dkey(b))) / 86400000); }
  function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)); }

  function fmtG(d, o) { try { return new Intl.DateTimeFormat("en-US", o).format(d); } catch (e) { return ""; } }
  function fmtP(d, o) { try { return new Intl.DateTimeFormat("fa-IR-u-ca-persian", o).format(d); } catch (e) { return ""; } }

  function niceDate(d) {
    var o = { year: "numeric", month: "long", day: "numeric" };
    return lang === "fa" ? fmtP(d, o) : fmtG(d, { year: "numeric", month: "short", day: "numeric" }) + " — " + fmtP(d, o);
  }

  function shortDate(d) {
    return lang === "fa" ? fmtP(d, { month: "long", day: "numeric" }) : fmtG(d, { month: "short", day: "numeric" });
  }

  function newId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      setTimeout(fn, 0);
    }
  }

  function saveUsers() { gWrite("pl_users", users); }

  function setLang(next) {
    if (me) {
      me.lang = next;
      saveUsers();
    }
    gWrite("pl_lang", next);
    location.reload();
  }

  function signOut() {
    gWrite("pl_active", "");
    location.reload();
  }

  function collectData() {
    var out = {};
    for (var i = 0; i < LS.length; i++) {
      var key = LS.key(i);
      if (key && key.indexOf(prefix) === 0) {
        out[key.slice(prefix.length)] = rawGet.call(LS, key);
      }
    }
    return out;
  }

  /* ------------------------------------------------------------------
     4. Sign in / create profile screen
     ------------------------------------------------------------------ */
  var GENDERS = [["female", "Female"], ["male", "Male"], ["other", "Other"], ["none", "Prefer not to say"]];

  function migrateLegacy(id) {
    if (gRead("pl_migrated", false)) {
      return;
    }
    var pre = "u:" + id + ":";
    LEGACY_KEYS.forEach(function (key) {
      var value = rawGet.call(LS, key);
      if (value !== null && rawGet.call(LS, pre + key) === null) {
        rawSet.call(LS, pre + key, value);
      }
    });
    gWrite("pl_migrated", true);
  }

  function showOverlay() {
    var overlay = document.createElement("div");
    overlay.className = "pl-overlay";
    overlay.id = "plOverlay";
    var gender = "none";

    var html =
      "<div class='pl-card'>" +
      "<div class='pl-logo'><svg class='ic'><use href='#i-heart'/></svg></div>" +
      "<h1>Welcome</h1>" +
      "<p class='pl-sub'>Your own calm space for plans, money and habits.</p>" +
      "<div class='pl-row'>" +
      "<button type='button' class='pl-chip" + (lang === "en" ? " on" : "") + "' data-lang='en'>English</button>" +
      "<button type='button' class='pl-chip" + (lang === "fa" ? " on" : "") + "' data-lang='fa'>فارسی</button>" +
      "</div>";
    if (users.length > 0) {
      html += "<p class='pl-label'>Continue as</p><div class='pl-row'>" +
        users.map(function (u) {
          return "<button type='button' class='pl-chip' data-user='" + esc(u.id) + "'>" + esc(u.name) + "</button>";
        }).join("") + "</div>";
    }
    html +=
      "<input id='plEmail' type='email' placeholder='Email' autocomplete='email'>" +
      "<input id='plName' type='text' placeholder='Your name'>" +
      "<p class='pl-hint'>New here? Add your name too. Coming back? Your email is enough.</p>" +
      "<p class='pl-label'>Gender (optional)</p><div class='pl-row'>" +
      GENDERS.map(function (g) {
        return "<button type='button' class='pl-chip" + (g[0] === "none" ? " on" : "") + "' data-gender='" + g[0] + "'>" + g[1] + "</button>";
      }).join("") + "</div>" +
      "<p class='pl-error' id='plErr'></p>" +
      "<button type='button' id='plGo'>Continue</button>" +
      "<p class='pl-hint'>Your data stays on this device. No password is needed for now.</p>" +
      "</div>";
    overlay.innerHTML = html;

    function showError(text) {
      $("plErr").textContent = text;
    }

    function enter(user) {
      gWrite("pl_active", user.id);
      gWrite("pl_lang", user.lang === "fa" ? "fa" : "en");
      location.reload();
    }

    function submit() {
      var email = $("plEmail").value.trim().toLowerCase();
      var name = $("plName").value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError("Please enter a valid email.");
        return;
      }
      var existing = null;
      users.forEach(function (u) {
        if (u.email === email) {
          existing = u;
        }
      });
      if (existing) {
        enter(existing);
        return;
      }
      if (name === "") {
        showError("Please enter your name.");
        return;
      }
      var user = {
        id: "u" + newId(),
        email: email,
        name: name,
        gender: gender,
        lang: lang,
        periodOn: gender === "female",
        created: Date.now()
      };
      migrateLegacy(user.id);
      users.push(user);
      saveUsers();
      enter(user);
    }

    overlay.addEventListener("click", function (event) {
      var button = event.target.closest("button");
      if (!button) {
        return;
      }
      if (button.hasAttribute("data-lang")) {
        gWrite("pl_lang", button.getAttribute("data-lang"));
        location.reload();
      } else if (button.hasAttribute("data-user")) {
        users.forEach(function (u) {
          if (u.id === button.getAttribute("data-user")) {
            enter(u);
          }
        });
      } else if (button.hasAttribute("data-gender")) {
        gender = button.getAttribute("data-gender");
        overlay.querySelectorAll("[data-gender]").forEach(function (b) {
          b.classList.toggle("on", b === button);
        });
      } else if (button.id === "plGo") {
        submit();
      }
    });
    overlay.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && event.target.tagName === "INPUT") {
        submit();
      }
    });
    document.body.appendChild(overlay);
  }

  /* ------------------------------------------------------------------
     5. Money
     ------------------------------------------------------------------ */
  var CURRENCIES = { USD: "$", EUR: "€", GBP: "£", TRY: "₺", IRT: "Toman" };
  var CURRENCY_LABELS = { USD: "USD ($)", EUR: "EUR (€)", GBP: "GBP (£)", TRY: "TRY (₺)", IRT: "Toman" };
  var EXPENSE_CATS = ["Food", "Transport", "Shopping", "Bills", "Health", "Fun", "Study", "Other"];
  var INCOME_CATS = ["Salary", "Allowance", "Gift", "Other"];
  var fin = null;
  var finMonth = dkey(new Date()).slice(0, 7);
  var finType = "expense";

  function loadFin() {
    var f = lj("finance", null);
    if (!f || typeof f !== "object") {
      f = {};
    }
    if (!Array.isArray(f.entries)) {
      f.entries = [];
    }
    if (!CURRENCIES[f.currency]) {
      f.currency = "USD";
    }
    f.budget = Number(f.budget) || 0;
    return f;
  }

  function saveFin() { sj("finance", fin); }

  function money(n) {
    var text = Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 2 });
    var body = fin.currency === "IRT" ? text + " Toman" : CURRENCIES[fin.currency] + text;
    return n < 0 ? "-" + body : body;
  }

  function shiftMonth(key, delta) {
    var p = key.split("-");
    var d = new Date(Number(p[0]), Number(p[1]) - 1 + delta, 1);
    return d.getFullYear() + "-" + pad(d.getMonth() + 1);
  }

  function catOptions(type, selected) {
    return (type === "income" ? INCOME_CATS : EXPENSE_CATS).map(function (c) {
      return "<option value='" + esc(c) + "'" + (c === selected ? " selected" : "") + ">" + esc(c) + "</option>";
    }).join("");
  }

  function renderFinance() {
    var page = $("financePage");
    if (!page || !fin) {
      return;
    }
    var parts = finMonth.split("-");
    var monthDate = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
    var monthEntries = fin.entries.filter(function (e) { return String(e.date).slice(0, 7) === finMonth; });
    var income = 0;
    var expenses = 0;
    var byCategory = {};
    monthEntries.forEach(function (e) {
      if (e.type === "income") {
        income += e.amount;
      } else {
        expenses += e.amount;
        byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
      }
    });
    var allTime = 0;
    fin.entries.forEach(function (e) { allTime += e.type === "income" ? e.amount : -e.amount; });

    var today = dkey(new Date());
    var defaultDate = finMonth === today.slice(0, 7) ? today : finMonth + "-01";

    var html =
      "<div class='finance-section'><h1>Money</h1>" +
      "<p class='calendar-intro'>Keep an eye on what comes in and what goes out.</p>" +
      "<div class='card'><div class='calendar-header'>" +
      "<button type='button' class='calendar-nav-button' data-fin='prev'>◀</button>" +
      "<h2>" + esc(fmtG(monthDate, { month: "long", year: "numeric" }) + " — " + fmtP(monthDate, { month: "long", year: "numeric" })) + "</h2>" +
      "<button type='button' class='calendar-nav-button' data-fin='next'>▶</button></div></div>" +
      "<div class='task-summary pl-sum'>" +
      "<div class='task-summary-item'><span dir='ltr' class='task-summary-number pl-in'>" + esc(money(income)) + "</span><span class='task-summary-label'>Income</span></div>" +
      "<div class='task-summary-item'><span dir='ltr' class='task-summary-number pl-out'>" + esc(money(expenses)) + "</span><span class='task-summary-label'>Expenses</span></div>" +
      "<div class='task-summary-item'><span dir='ltr' class='task-summary-number'>" + esc(money(allTime)) + "</span><span class='task-summary-label'>Balance (all time)</span></div>" +
      "</div>" +

      "<div class='card'><div class='card-head'><span class='ico r'><svg class='ic'><use href='#i-wallet'/></svg></span><h2>New entry</h2></div>" +
      "<div class='pl-row pl-start'>" +
      "<button type='button' class='pl-chip" + (finType === "expense" ? " on" : "") + "' data-fin='type' data-type='expense'>Expense</button>" +
      "<button type='button' class='pl-chip" + (finType === "income" ? " on" : "") + "' data-fin='type' data-type='income'>Income</button></div>" +
      "<div class='pl-form'><div class='pl-grid2'>" +
      "<input id='finAmount' type='number' min='0' step='any' placeholder='Amount'>" +
      "<select id='finCat'>" + catOptions(finType) + "</select>" +
      "<input id='finDate' type='date' value='" + defaultDate + "'>" +
      "<input id='finNote' type='text' placeholder='Note (optional)'></div>" +
      "<button type='button' data-fin='add'>Add entry</button></div></div>" +

      "<div class='card'><div class='card-head'><span class='ico g'><svg class='ic'><use href='#i-chart'/></svg></span><h2>Monthly budget</h2></div>" +
      "<div class='pl-form'><div class='pl-grid2'>" +
      "<input id='finBudget' type='number' min='0' step='any' placeholder='Budget for this month (0 = none)' value='" + (fin.budget || "") + "'>" +
      "<select id='finCur'>" + Object.keys(CURRENCIES).map(function (c) {
        return "<option value='" + c + "'" + (c === fin.currency ? " selected" : "") + ">" + CURRENCY_LABELS[c] + "</option>";
      }).join("") + "</select></div>" +
      "<button type='button' data-fin='saveBudget'>Save</button></div>";
    if (fin.budget > 0) {
      var pct = clamp(Math.round((expenses / fin.budget) * 100), 0, 100);
      html +=
        "<p class='pl-budget'><span>Spent</span> <b dir='ltr'>" + esc(money(expenses)) + "</b> <span>of</span> <b dir='ltr'>" + esc(money(fin.budget)) + "</b></p>" +
        "<div class='task-progress-bar'><div class='task-progress-fill' style='width:" + pct + "%'></div></div>";
    }
    html += "</div>";

    html += "<div class='card'><div class='card-head'><span class='ico l'><svg class='ic'><use href='#i-chart'/></svg></span><h2>Spending by category</h2></div>";
    var cats = Object.keys(byCategory).sort(function (a, b) { return byCategory[b] - byCategory[a]; });
    if (cats.length === 0) {
      html += "<p class='overview-empty'>No spending this month.</p>";
    } else {
      cats.forEach(function (c) {
        var share = expenses > 0 ? Math.round((byCategory[c] / expenses) * 100) : 0;
        html +=
          "<div class='pl-cat'><div class='pl-row2'><strong>" + esc(c) + "</strong><span dir='ltr'>" + esc(money(byCategory[c])) + "</span></div>" +
          "<div class='task-progress-bar'><div class='task-progress-fill' style='width:" + share + "%'></div></div></div>";
      });
    }
    html += "</div>";

    html += "<div class='card'><div class='card-head'><span class='ico'><svg class='ic'><use href='#i-tasks'/></svg></span><h2>This month</h2></div>";
    if (monthEntries.length === 0) {
      html += "<p class='overview-empty'>Nothing here yet.</p>";
    } else {
      monthEntries.slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); }).forEach(function (e) {
        html +=
          "<div class='study-log-card pl-row2'><div><strong>" + esc(e.category) + "</strong>" +
          (e.note ? "<p>" + esc(e.note) + "</p>" : "") +
          "<p>" + esc(shortDate(pkey(e.date))) + "</p></div>" +
          "<div dir='ltr' class='" + (e.type === "income" ? "pl-in" : "pl-out") + "'>" +
          esc((e.type === "income" ? "+" : "-") + money(e.amount).replace("-", "")) + "</div>" +
          "<button type='button' class='journal-delete' data-fin='del' data-id='" + esc(e.id) + "'>Delete</button></div>";
      });
    }
    html += "</div></div>";
    page.innerHTML = html;
  }

  function setupFinance(page) {
    page.addEventListener("click", function (event) {
      var button = event.target.closest("[data-fin]");
      if (!button) {
        return;
      }
      var action = button.getAttribute("data-fin");
      if (action === "prev" || action === "next") {
        finMonth = shiftMonth(finMonth, action === "next" ? 1 : -1);
        renderFinance();
      } else if (action === "type") {
        finType = button.getAttribute("data-type");
        page.querySelectorAll("[data-fin='type']").forEach(function (b) {
          b.classList.toggle("on", b === button);
        });
        $("finCat").innerHTML = catOptions(finType);
      } else if (action === "add") {
        var amount = Number($("finAmount").value);
        if (!(amount > 0)) {
          alert("Please enter a valid amount.");
          return;
        }
        var date = $("finDate").value;
        if (!validKey(date)) {
          date = dkey(new Date());
        }
        fin.entries.push({
          id: newId(),
          type: finType,
          amount: amount,
          category: $("finCat").value,
          note: $("finNote").value.trim(),
          date: date
        });
        saveFin();
        finMonth = date.slice(0, 7);
        renderFinance();
      } else if (action === "del") {
        var id = button.getAttribute("data-id");
        fin.entries = fin.entries.filter(function (e) { return e.id !== id; });
        saveFin();
        renderFinance();
      } else if (action === "saveBudget") {
        fin.budget = Math.max(0, Number($("finBudget").value) || 0);
        saveFin();
        renderFinance();
      }
    });
    page.addEventListener("change", function (event) {
      if (event.target.id === "finCur" && CURRENCIES[event.target.value]) {
        fin.currency = event.target.value;
        saveFin();
        renderFinance();
      }
    });
  }

  /* ------------------------------------------------------------------
     6. Cycle tracker
     ------------------------------------------------------------------ */
  var cyc = null;

  function loadCycle() {
    var c = lj("cycle", null);
    if (!c || typeof c !== "object") {
      c = {};
    }
    c.cycleLength = clamp(Number(c.cycleLength) || 28, 15, 60);
    if (!Array.isArray(c.log)) {
      c.log = [];
    }
    c.log = c.log.filter(function (e) { return e && validKey(e.start); });
    return c;
  }

  function saveCycle() { sj("cycle", cyc); }

  function cycleEstimate() {
    var starts = cyc.log.map(function (e) { return e.start; }).sort();
    var gaps = [];
    for (var i = 1; i < starts.length; i++) {
      var gap = dayDiff(pkey(starts[i]), pkey(starts[i - 1]));
      if (gap >= 15 && gap <= 60) {
        gaps.push(gap);
      }
    }
    gaps = gaps.slice(-6);
    var avg = cyc.cycleLength;
    if (gaps.length > 0) {
      var total = 0;
      gaps.forEach(function (g) { total += g; });
      avg = Math.round(total / gaps.length);
    }
    var last = starts.length > 0 ? pkey(starts[starts.length - 1]) : null;
    return { avg: avg, count: gaps.length, last: last, next: last ? addDays(last, avg) : null };
  }

  function renderCycle() {
    var page = $("cyclePage");
    if (!page || !cyc) {
      return;
    }
    var est = cycleEstimate();
    var hero;
    if (!est.last) {
      hero = "<p class='pl-big'>—</p><p>Log your first period to get a prediction.</p>";
    } else {
      var until = dayDiff(est.next, new Date());
      hero = "<p class='pl-muted'>Next period expected</p><p class='pl-big'>" + esc(niceDate(est.next)) + "</p>";
      if (until > 1) {
        hero += "<p>in " + until + " days</p>";
      } else if (until === 1) {
        hero += "<p>tomorrow</p>";
      } else if (until === 0) {
        hero += "<p>today</p>";
      } else {
        hero += "<p>Your period may be a few days late. That's common. Log it when it arrives.</p>";
      }
      hero += "<p><span>Likely window</span> <b>" + esc(shortDate(addDays(est.next, -2)) + " – " + shortDate(addDays(est.next, 2))) + "</b></p>" +
        "<p class='pl-muted'>Average cycle: " + est.avg + " days</p>";
      if (est.count < 1) {
        hero += "<p class='pl-muted'>Add at least two periods for a better estimate. Until then we use your typical cycle length.</p>";
      }
    }

    var html =
      "<div class='cycle-section'><h1>Cycle</h1>" +
      "<p class='calendar-intro'>Gentle predictions based on your own dates.</p>" +
      "<div class='card pl-hero'>" + hero + "</div>" +
      "<div class='card'><div class='card-head'><span class='ico r'><svg class='ic'><use href='#i-moon'/></svg></span><h2>Log a period</h2></div>" +
      "<div class='pl-form'><div class='pl-grid2'>" +
      "<div class='pl-field'><label>Period start</label><input id='cycStart' type='date' value='" + dkey(new Date()) + "'></div>" +
      "<div class='pl-field'><label>Period end (optional)</label><input id='cycEnd' type='date'></div></div>" +
      "<button type='button' data-cyc='save'>Save period</button>" +
      "<div class='pl-field'><label>Typical cycle length (days)</label>" +
      "<input id='cycLen' type='number' min='15' max='60' value='" + cyc.cycleLength + "'></div>" +
      "<button type='button' class='pl-ghost' data-cyc='saveLen'>Save</button></div></div>" +
      "<div class='card'><div class='card-head'><span class='ico l'><svg class='ic'><use href='#i-cal'/></svg></span><h2>Past periods</h2></div>";
    if (cyc.log.length === 0) {
      html += "<p class='overview-empty'>No periods logged yet.</p>";
    } else {
      cyc.log.slice().sort(function (a, b) { return b.start.localeCompare(a.start); }).forEach(function (e) {
        var length = e.end && validKey(e.end) ? dayDiff(pkey(e.end), pkey(e.start)) + 1 : 0;
        html +=
          "<div class='study-log-card pl-row2'><div><strong>" + esc(niceDate(pkey(e.start))) + "</strong>" +
          (length > 0 ? "<p>" + length + " days</p>" : "") + "</div>" +
          "<button type='button' class='journal-delete' data-cyc='del' data-start='" + esc(e.start) + "'>Delete</button></div>";
      });
    }
    html +=
      "</div><div class='card pl-soft'><p>This is only an estimate based on your own logs. It isn't medical advice and can't be used to prevent or plan pregnancy.</p>" +
      "<p class='pl-muted'>Stored only on this device.</p></div></div>";
    page.innerHTML = html;
  }

  function setupCycle(page) {
    page.addEventListener("click", function (event) {
      var button = event.target.closest("[data-cyc]");
      if (!button) {
        return;
      }
      var action = button.getAttribute("data-cyc");
      if (action === "save") {
        var start = $("cycStart").value;
        var end = $("cycEnd").value;
        if (!validKey(start)) {
          return;
        }
        if (!validKey(end) || end < start) {
          end = "";
        }
        cyc.log = cyc.log.filter(function (e) { return e.start !== start; });
        cyc.log.push({ start: start, end: end });
        cyc.log.sort(function (a, b) { return a.start.localeCompare(b.start); });
        saveCycle();
        renderCycle();
      } else if (action === "del") {
        var key = button.getAttribute("data-start");
        cyc.log = cyc.log.filter(function (e) { return e.start !== key; });
        saveCycle();
        renderCycle();
      } else if (action === "saveLen") {
        cyc.cycleLength = clamp(Number($("cycLen").value) || 28, 15, 60);
        saveCycle();
        renderCycle();
      }
    });
  }

  /* ------------------------------------------------------------------
     7. Settings
     ------------------------------------------------------------------ */
  var stGender = "none";
  var stLang = "en";

  function renderSettings() {
    var page = $("settingsPage");
    if (!page || !me) {
      return;
    }
    stGender = me.gender || "none";
    stLang = lang;
    var html =
      "<div class='settings-section'><h1>Settings</h1><p class='calendar-intro'>Make this space yours.</p>" +
      "<div class='card'><div class='card-head'><span class='ico l'><svg class='ic'><use href='#i-face'/></svg></span><h2>Profile</h2></div>" +
      "<div class='pl-form'>" +
      "<div class='pl-field'><label>Name</label><input id='stName' type='text' value='" + esc(me.name) + "'></div>" +
      "<div class='pl-field'><label>Email</label><input id='stEmail' type='email' value='" + esc(me.email) + "' disabled></div>" +
      "<div class='pl-field'><label>Gender</label><div class='pl-row pl-start'>" +
      GENDERS.map(function (g) {
        return "<button type='button' class='pl-chip" + (g[0] === stGender ? " on" : "") + "' data-st='gender' data-v='" + g[0] + "'>" + g[1] + "</button>";
      }).join("") + "</div></div>" +
      "<div class='pl-field'><label>Language</label><div class='pl-row pl-start'>" +
      "<button type='button' class='pl-chip" + (stLang === "en" ? " on" : "") + "' data-st='lang' data-v='en'>English</button>" +
      "<button type='button' class='pl-chip" + (stLang === "fa" ? " on" : "") + "' data-st='lang' data-v='fa'>فارسی</button></div></div>" +
      "<label class='pl-check'><input type='checkbox' id='stPeriod'" + (me.periodOn ? " checked" : "") + "><span>Show the cycle tracker</span></label>" +
      "<button type='button' data-st='save'>Save changes</button></div></div>" +

      "<div class='card'><div class='card-head'><span class='ico g'><svg class='ic'><use href='#i-journal'/></svg></span><h2>Your data</h2></div>" +
      "<div class='pl-form'>" +
      "<div class='pl-row pl-start'><button type='button' class='pl-ghost' data-st='export'>Export my data</button>" +
      "<button type='button' class='pl-ghost' data-st='copy'>Copy</button></div>" +
      "<textarea id='stExport' readonly style='display:none'></textarea>" +
      "<textarea id='stImport' placeholder='Paste exported data here'></textarea>" +
      "<button type='button' class='pl-ghost' data-st='import'>Import</button>" +
      "<p class='pl-msg' id='stMsg'></p>" +
      "<div class='pl-row pl-start'><button type='button' class='pl-ghost' data-st='signout'>Switch profile</button>" +
      "<button type='button' class='pl-danger' data-st='wipe'>Delete all my data</button></div>" +
      "</div></div></div>";
    page.innerHTML = html;
  }

  function setupSettings(page) {
    page.addEventListener("click", function (event) {
      var button = event.target.closest("[data-st]");
      if (!button || !me) {
        return;
      }
      var action = button.getAttribute("data-st");
      if (action === "gender" || action === "lang") {
        if (action === "gender") {
          stGender = button.getAttribute("data-v");
        } else {
          stLang = button.getAttribute("data-v");
        }
        page.querySelectorAll("[data-st='" + action + "']").forEach(function (b) {
          b.classList.toggle("on", b === button);
        });
      } else if (action === "save") {
        var name = $("stName").value.trim();
        if (name !== "") {
          me.name = name;
        }
        me.gender = stGender;
        me.periodOn = $("stPeriod").checked;
        me.lang = stLang;
        saveUsers();
        gWrite("pl_lang", stLang);
        location.reload();
      } else if (action === "export") {
        var box = $("stExport");
        box.style.display = "block";
        box.value = JSON.stringify({ app: "daily-planner", version: 1, user: { name: me.name, gender: me.gender }, data: collectData() });
        box.focus();
        box.select();
      } else if (action === "copy") {
        var area = $("stExport");
        if (area.style.display === "none") {
          return;
        }
        area.select();
        try {
          document.execCommand("copy");
          $("stMsg").textContent = "Copied!";
        } catch (error) {}
      } else if (action === "import") {
        try {
          var parsed = JSON.parse($("stImport").value);
          if (!parsed || typeof parsed.data !== "object" || parsed.data === null) {
            throw new Error("bad");
          }
          Object.keys(parsed.data).forEach(function (key) {
            if (typeof parsed.data[key] === "string") {
              rawSet.call(LS, prefix + key, parsed.data[key]);
            }
          });
          $("stMsg").textContent = "Import finished.";
          setTimeout(function () { location.reload(); }, 700);
        } catch (error) {
          $("stMsg").textContent = "That doesn't look like exported planner data.";
        }
      } else if (action === "signout") {
        signOut();
      } else if (action === "wipe") {
        if (confirm("Delete everything for this profile? This can't be undone.")) {
          Object.keys(collectData()).forEach(function (key) { rawRemove.call(LS, prefix + key); });
          users = users.filter(function (u) { return u.id !== me.id; });
          saveUsers();
          gWrite("pl_active", "");
          location.reload();
        }
      }
    });
  }

  /* ------------------------------------------------------------------
     8. Put everything on the page
     ------------------------------------------------------------------ */
  function addSprite() {
    var holder = document.createElement("div");
    holder.innerHTML =
      "<svg width='0' height='0' style='position:absolute' aria-hidden='true'><defs>" +
      "<symbol id='i-wallet' viewBox='0 0 24 24'><path d='M4 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z'/><path d='M4 7l11-3v3'/><circle cx='16.5' cy='13.5' r='1'/></symbol>" +
      "<symbol id='i-moon' viewBox='0 0 24 24'><path d='M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z'/></symbol>" +
      "<symbol id='i-sliders' viewBox='0 0 24 24'><path d='M4 7h10M18 7h2M4 17h2M10 17h10'/><circle cx='16' cy='7' r='2'/><circle cx='8' cy='17' r='2'/></symbol>" +
      "</defs></svg>";
    document.body.appendChild(holder.firstChild);
  }

  function init() {
    if (lang === "fa") {
      startTranslator();
    }
    var sidebar = $("sidebar");
    var content = document.querySelector("main.content, .content");
    if (!sidebar) {
      console.error("My Daily Planner: #sidebar was not found. Check the HTML pane.");
      return;
    }
    if (!content) {
      content = document.createElement("main");
      content.className = "content";
      var existingPages = Array.prototype.slice.call(document.querySelectorAll("body > .page"));
      if (existingPages.length) {
        document.body.insertBefore(content, existingPages[0]);
        existingPages.forEach(function (page) { content.appendChild(page); });
      } else {
        document.body.appendChild(content);
      }
    }
    var panel = document.querySelector(".panel") || content;
    addSprite();

    function addNav(id, label, icon, pageId) {
      var button = document.createElement("button");
      button.className = "nav-button";
      button.id = id;
      button.title = label;
      button.setAttribute("onclick", "showPage('" + pageId + "', this)");
      button.innerHTML = "<svg class='ic'><use href='#" + icon + "'/></svg><span class='nav-label'>" + label + "</span>";
      sidebar.appendChild(button);
      return button;
    }

    function addPage(id) {
      var page = document.createElement("div");
      page.id = id;
      page.className = "page";
      page.style.display = "none";
      content.appendChild(page);
      return page;
    }

    if (me) {
      fin = loadFin();
      cyc = loadCycle();
      addNav("navMoney", "Money", "i-wallet", "financePage");
      var cycleNav = addNav("navCycle", "Cycle", "i-moon", "cyclePage");
      if (!me.periodOn) {
        cycleNav.style.display = "none";
      }
      addNav("navSettings", "Settings", "i-sliders", "settingsPage");
      setupFinance(addPage("financePage"));
      setupCycle(addPage("cyclePage"));
      setupSettings(addPage("settingsPage"));

      var bar = document.createElement("div");
      bar.className = "pl-userbar";
      bar.innerHTML =
        "<span class='pl-hello'>Hello, " + esc(me.name) + "</span><span class='pl-spacer'></span>" +
        "<button type='button' class='pl-chip' id='plLangBtn'>" + (lang === "fa" ? "English" : "فارسی") + "</button>" +
        "<button type='button' class='pl-chip' id='plSwitchBtn'>Switch profile</button>";
      panel.insertBefore(bar, panel.firstChild);
      $("plLangBtn").addEventListener("click", function () { setLang(lang === "fa" ? "en" : "fa"); });
      $("plSwitchBtn").addEventListener("click", signOut);

      var hooks = { financePage: renderFinance, cyclePage: renderCycle, settingsPage: renderSettings };
      var originalShowPage = window.showPage;
      if (typeof originalShowPage === "function") {
        window.showPage = function (pageId, button) {
          originalShowPage(pageId, button);
          if (hooks[pageId]) {
            hooks[pageId]();
          }
        };
      }
    } else {
      showOverlay();
    }
  }

  ready(init);
})();

/* ===================== end of the new block ===================== */


function storageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error("Could not save " + key, error);
  }
}

function storageRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Could not remove " + key, error);
  }
}

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      return fallback;
    }
    const value = JSON.parse(raw);
    if (value === null || value === undefined) {
      return fallback;
    }
    if (Array.isArray(fallback) && !Array.isArray(value)) {
      return fallback;
    }
    return value;
  } catch (error) {
    return fallback;
  }
}

function saveJSON(key, value) {
  storageSet(key, JSON.stringify(value));
}

function getEl(id) {
  return document.getElementById(id);
}

function setText(id, value) {
  const element = getEl(id);
  if (element) {
    element.textContent = value;
  }
}

function escapeHtml(value) {
  return String(value === undefined || value === null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function calendarDateKey(date) {
  return dateKey(date);
}

function todayKey() {
  return dateKey(new Date());
}

function parseDateKey(key) {
  return new Date(key + "T00:00:00");
}

function isValidDateKey(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    return false;
  }
  const date = parseDateKey(value);
  return !isNaN(date.getTime()) && dateKey(date) === String(value);
}

function formatGregorian(date, options) {
  try {
    return new Intl.DateTimeFormat("en-US", options).format(date);
  } catch (error) {
    return "";
  }
}

function formatPersian(date, options) {
  try {
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", options).format(date);
  } catch (error) {
    return "";
  }
}

function calcPercentage(correct, wrong, total) {
  if (total <= 0) {
    return 0;
  }
  const value = ((correct - wrong / 3) / total) * 100;
  return Math.round(value * 100) / 100;
}

function normalizeChoice(input, options, fallback) {
  const wanted = String(input === null || input === undefined ? "" : input)
    .trim()
    .toLowerCase();
  const match = options.find(function(option) {
    return option.toLowerCase() === wanted;
  });
  return match || fallback;
}

function clearListExcept(list, keepClass) {
  Array.from(list.children).forEach(function(child) {
    if (!child.classList.contains(keepClass)) {
      child.remove();
    }
  });
}

const TASK_CATEGORIES = ["Study", "Work", "Personal", "Health", "Other"];
const TASK_PRIORITIES = ["High", "Medium", "Low"];

function getWeekStart(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 1) % 7));
  return d;
}

function getWeekKey(date) {
  const key = getWeekStart(date);
  key.setDate(key.getDate() + 2);
  return dateKey(key);
}

function getWeekStartFromKey(weekKey) {
  const d = parseDateKey(weekKey);
  d.setDate(d.getDate() - 2);
  return d;
}

function getStudyRecords() {
  const records = [];
  studySessions.forEach(function(session) {
    records.push({
      date: session.date,
      subject: session.subject,
      minutes: Number(session.minutes) || 0,
      total: Number(session.total) || 0,
      correct: Number(session.correct) || 0,
      wrong: Number(session.wrong) || 0,
      unanswered: Number(session.unanswered) || 0,
      percentage:
        session.percentage === undefined ? null : session.percentage
    });
  });
  studyLog.forEach(function(entry) {
    const correct = Number(entry.correct) || 0;
    const wrong = Number(entry.wrong) || 0;
    const unanswered = Number(entry.unanswered) || 0;
    const graded = correct + wrong + unanswered;
    records.push({
      date: entry.date,
      subject: entry.subject,
      minutes: Number(entry.minutes) || 0,
      total: Number(entry.tests) || graded,
      correct: correct,
      wrong: wrong,
      unanswered: unanswered,
      percentage: graded > 0 ? calcPercentage(correct, wrong, graded) : null
    });
  });
  return records;
}

function getSessionWeek(session) {
  if (!session || !session.date) {
    return null;
  }
  const date = parseDateKey(session.date);
  if (isNaN(date.getTime())) {
    return null;
  }
  return getWeekKey(date);
}

let glasses = Math.min(8, Math.max(0, Number(storageGet("glasses")) || 0));
let gratitudeList = loadJSON("gratitudeList", []);
let reminders = loadJSON("reminders", []);
let savedMood = storageGet("mood") || "";
let studySessions = loadJSON("studySessions", []);
let journalEntries = loadJSON("journalEntries", []);
let studyLog = loadJSON("studyLog", []);
let goals = loadJSON("goals", []);
let tasks = loadJSON("tasks", []);
let weeklyStudyPlans = loadJSON("weeklyStudyPlans", {});
let calendarDate = new Date();
let selectedCalendarDate = null;
let selectedStudyWeek = storageGet("selectedStudyWeek");
if (!selectedStudyWeek || !isValidDateKey(selectedStudyWeek)) {
  selectedStudyWeek = getWeekKey(new Date());
} else {
  selectedStudyWeek = getWeekKey(parseDateKey(selectedStudyWeek));
}

(function migrateOldWeeklyPlan() {
  const oldPlan = loadJSON("weeklyStudyPlan", null);
  if (Object.keys(weeklyStudyPlans).length === 0 && Array.isArray(oldPlan)) {
    weeklyStudyPlans[selectedStudyWeek] = oldPlan;
    saveJSON("weeklyStudyPlans", weeklyStudyPlans);
  }
})();

function showPage(pageId, button) {
  document.querySelectorAll(".page").forEach(function(page) {
    page.style.display = "none";
  });
  const selectedPage = getEl(pageId);
  if (selectedPage) {
    selectedPage.style.display = "block";
  }
  document.querySelectorAll(".nav-button").forEach(function(btn) {
    btn.classList.remove("active");
  });
  if (button) {
    button.classList.add("active");
  }
  if (pageId === "progressPage") {
    updateProgress();
  }
  if (pageId === "calendarPage") {
    renderCalendar();
    showCalendarDay(selectedCalendarDate || todayKey());
  }
}

function syncWaterDay() {
  const today = todayKey();
  const storedDay = storageGet("glassesDate");
  if (storedDay !== today) {
    if (storedDay !== null) {
      glasses = 0;
    }
    storageSet("glassesDate", today);
    storageSet("glasses", String(glasses));
  }
}

function updateWater() {
  syncWaterDay();
  setText("water", "Water: " + glasses + " / 8 glasses");
}

function addGlass() {
  syncWaterDay();
  if (glasses < 8) {
    glasses++;
    storageSet("glasses", String(glasses));
  }
  updateWater();
}

function removeGlass() {
  syncWaterDay();
  if (glasses > 0) {
    glasses--;
    storageSet("glasses", String(glasses));
  }
  updateWater();
}

function addGratitude() {
  const input = getEl("gratitude");
  if (!input) {
    return;
  }
  const text = input.value.trim();
  if (text !== "") {
    gratitudeList.push(text);
    saveJSON("gratitudeList", gratitudeList);
    input.value = "";
    showGratitude();
  }
}

function showGratitude() {
  const list = getEl("gratitudeList");
  if (!list) {
    return;
  }
  list.innerHTML = "";
  gratitudeList.forEach(function(item, index) {
    const wrapper = document.createElement("div");
    wrapper.className = "gratitude-item";
    const text = document.createElement("div");
    text.className = "gratitude-text";
    text.textContent = "" + item;
    const deleteButton = document.createElement("button");
    deleteButton.className = "gratitude-delete";
    deleteButton.type = "button";
    deleteButton.textContent = "Remove";
    deleteButton.onclick = function() {
      gratitudeList.splice(index, 1);
      saveJSON("gratitudeList", gratitudeList);
      showGratitude();
    };
    wrapper.appendChild(text);
    wrapper.appendChild(deleteButton);
    list.appendChild(wrapper);
  });
}

function addReminder() {
  const textInput = getEl("reminderText");
  const timeInput = getEl("reminderTime");
  if (!textInput || !timeInput) {
    return;
  }
  const text = textInput.value.trim();
  const time = timeInput.value;
  if (text !== "" && time !== "") {
    reminders.push({
      text: text,
      time: time
    });
    saveJSON("reminders", reminders);
    textInput.value = "";
    timeInput.value = "";
    showReminders();
  }
}

function showReminders() {
  const list = getEl("reminderList");
  if (!list) {
    return;
  }
  list.innerHTML = "";
  reminders.forEach(function(reminder, index) {
    const item = document.createElement("div");
    item.className = "reminder-item";
    const info = document.createElement("div");
    info.className = "reminder-info";
    const time = document.createElement("span");
    time.className = "reminder-time";
    time.textContent = reminder.time;
    const text = document.createTextNode(" — " + reminder.text);
    const deleteButton = document.createElement("button");
    deleteButton.className = "reminder-delete";
    deleteButton.type = "button";
    deleteButton.textContent = "Remove";
    deleteButton.onclick = function() {
      reminders.splice(index, 1);
      saveJSON("reminders", reminders);
      showReminders();
    };
    info.appendChild(time);
    info.appendChild(text);
    item.appendChild(info);
    item.appendChild(deleteButton);
    list.appendChild(item);
  });
}

function showDate() {
  const today = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  };
  setText("gregorianDate", "" + formatGregorian(today, options));
  setText("persianDate", "" + formatPersian(today, options));
}

function syncMoodDay() {
  if (!savedMood) {
    return;
  }
  const today = todayKey();
  const storedDay = storageGet("moodDate");
  if (storedDay === null) {
    storageSet("moodDate", today);
  } else if (storedDay !== today) {
    savedMood = "";
    storageRemove("mood");
    storageRemove("moodDate");
  }
}

function showMood() {
  syncMoodDay();
  if (savedMood) {
    setText("moodResult", "Today you feel: " + savedMood);
  }
}

function setMood(mood) {
  savedMood = mood;
  storageSet("mood", mood);
  storageSet("moodDate", todayKey());
  setText("moodResult", "Today you feel: " + mood);
}

function addStudySession() {
  const subjectInput = getEl("subject");
  const minutesInput = getEl("studyMinutes");
  const dateInput = getEl("studyDate");
  const correctInput = getEl("correctTests");
  const wrongInput = getEl("wrongTests");
  const unansweredInput = getEl("unansweredTests");
  if (
    !subjectInput || !minutesInput || !dateInput ||
    !correctInput || !wrongInput || !unansweredInput
  ) {
    return;
  }
  const subject = subjectInput.value.trim();
  const minutes = Number(minutesInput.value);
  const date = dateInput.value;
  const correct = Number(correctInput.value);
  const wrong = Number(wrongInput.value);
  const unanswered = Number(unansweredInput.value);
  if (
    subject === "" ||
    isNaN(minutes) || minutes <= 0 ||
    date === "" ||
    isNaN(correct) || correct < 0 ||
    isNaN(wrong) || wrong < 0 ||
    isNaN(unanswered) || unanswered < 0
  ) {
    alert("Please enter valid study information.");
    return;
  }
  const total = correct + wrong + unanswered;
  studySessions.push({
    subject: subject,
    minutes: minutes,
    date: date,
    total: total,
    correct: correct,
    wrong: wrong,
    unanswered: unanswered,
    percentage: calcPercentage(correct, wrong, total)
  });
  saveJSON("studySessions", studySessions);
  subjectInput.value = "";
  minutesInput.value = "";
  dateInput.value = "";
  correctInput.value = "";
  wrongInput.value = "";
  unansweredInput.value = "";
  loadStudySessions();
  updateProgress();
}

function loadStudySessions() {
  const list = getEl("studySessions");
  if (list) {
    list.innerHTML = "";
  }
  let totalMinutes = 0;
  studySessions.forEach(function(session) {
    totalMinutes += Number(session.minutes) || 0;
    if (!list) {
      return;
    }
    const card = document.createElement("div");
    card.className = "card";
    let dateText = "";
    if (session.date) {
      const date = parseDateKey(session.date);
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric"
      };
      dateText =
        "<p>" + escapeHtml(formatGregorian(date, options)) + "</p>" +
        "<p>" + escapeHtml(formatPersian(date, options)) + "</p>";
    }
    card.innerHTML =
      "<h3>" + escapeHtml(session.subject) + "</h3>" +
      dateText +
      "<p>Study time: " + escapeHtml(session.minutes) + " minutes</p>" +
      "<p>Total tests: " + escapeHtml(session.total) + "</p>" +
      "<p>Correct: " + escapeHtml(session.correct) + "</p>" +
      "<p>Wrong: " + escapeHtml(session.wrong) + "</p>" +
      "<p>Unanswered: " + escapeHtml(session.unanswered) + "</p>" +
      "<p>Percentage: " + escapeHtml(session.percentage) + "%</p>";
    list.appendChild(card);
  });
  setText("studyTime", totalMinutes);
}

function getWeekStats(weekKey) {
  const stats = {
    sessions: 0,
    minutes: 0,
    tests: 0,
    correct: 0,
    wrong: 0,
    unanswered: 0,
    percentage: 0
  };
  getStudyRecords().forEach(function(session) {
    if (getSessionWeek(session) === weekKey) {
      stats.sessions++;
      stats.minutes += Number(session.minutes) || 0;
      stats.tests += Number(session.total) || 0;
      stats.correct += Number(session.correct) || 0;
      stats.wrong += Number(session.wrong) || 0;
      stats.unanswered += Number(session.unanswered) || 0;
    }
  });
  stats.percentage = calcPercentage(
    stats.correct,
    stats.wrong,
    stats.correct + stats.wrong + stats.unanswered
  );
  return stats;
}

function updateProgress() {
  const today = new Date();
  const currentWeekKey = getWeekKey(today);
  const previousWeekDate = getWeekStart(today);
  previousWeekDate.setDate(previousWeekDate.getDate() - 7);
  const previousWeekKey = getWeekKey(previousWeekDate);
  const thisWeek = getWeekStats(currentWeekKey);
  const lastWeek = getWeekStats(previousWeekKey);
  setText("weekSessions", thisWeek.sessions);
  setText("weekMinutes", thisWeek.minutes);
  setText("weekTests", thisWeek.tests);
  setText("weekCorrect", thisWeek.correct);
  setText("weekWrong", thisWeek.wrong);
  setText("weekUnanswered", thisWeek.unanswered);
  setText("weekPercentage", thisWeek.percentage);
  const studyDifference = thisWeek.minutes - lastWeek.minutes;
  const testDifference = thisWeek.tests - lastWeek.tests;
  const percentageDifference =
    Math.round((thisWeek.percentage - lastWeek.percentage) * 100) / 100;
  setText("studyComparison", formatDifference(studyDifference, " minutes"));
  setText("testComparison", formatDifference(testDifference, " tests"));
  setText(
    "percentageComparison",
    formatDifference(percentageDifference, " percentage points")
  );
  let allMinutes = 0;
  let allTests = 0;
  const records = getStudyRecords();
  records.forEach(function(session) {
    allMinutes += Number(session.minutes) || 0;
    allTests += Number(session.total) || 0;
  });
  setText("allSessions", records.length);
  setText("allMinutes", allMinutes);
  setText("allTests", allTests);
  updatePreviousWeeks();
  updateStudyChart();
}

function formatDifference(value, unit) {
  if (value > 0) {
    return "↑ +" + value + unit;
  }
  if (value < 0) {
    return "↓ " + value + unit;
  }
  return "→ No change";
}

function formatWeekDate(weekKey) {
  const start = getWeekStartFromKey(weekKey);
  const gregorian = formatGregorian(start, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  const persian = formatPersian(start, {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
  return gregorian + " — " + persian;
}

function updatePreviousWeeks() {
  const container = getEl("previousWeeks");
  if (!container) {
    return;
  }
  container.innerHTML = "";
  const currentWeekKey = getWeekKey(new Date());
  const weeks = {};
  getStudyRecords().forEach(function(session) {
    const week = getSessionWeek(session);
    if (week) {
      weeks[week] = true;
    }
  });
  const previousWeekKeys = Object.keys(weeks)
    .filter(function(key) {
      return key < currentWeekKey;
    })
    .sort()
    .reverse();
  if (previousWeekKeys.length === 0) {
    container.innerHTML = "<p>No previous weeks yet.</p>";
    return;
  }
  previousWeekKeys.forEach(function(weekKey) {
    const stats = getWeekStats(weekKey);
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML =
      "<h3>Week of " + escapeHtml(formatWeekDate(weekKey)) + "</h3>" +
      "<p>Sessions: " + stats.sessions + "</p>" +
      "<p>Study time: " + stats.minutes + " minutes</p>" +
      "<p>Tests: " + stats.tests + "</p>" +
      "<p>Percentage: " + stats.percentage + "%</p>";
    container.appendChild(card);
  });
}

function updateStudyChart() {
  const chart = getEl("studyChart");
  if (!chart) {
    return;
  }
  chart.innerHTML = "";
  const weeklyMinutes = {};
  getStudyRecords().forEach(function(session) {
    const week = getSessionWeek(session);
    if (!week) {
      return;
    }
    if (!weeklyMinutes[week]) {
      weeklyMinutes[week] = 0;
    }
    weeklyMinutes[week] += Number(session.minutes) || 0;
  });
  const weeks = Object.keys(weeklyMinutes).sort();
  if (weeks.length === 0) {
    chart.innerHTML = "<p>No study sessions yet.</p>";
    return;
  }
  const maxMinutes = Math.max.apply(
    null,
    weeks.map(function(w) {
      return weeklyMinutes[w];
    })
  );
  weeks.forEach(function(week) {
    const row = document.createElement("div");
    row.style.marginBottom = "16px";
    const label = document.createElement("p");
    label.textContent = "" + formatWeekDate(week);
    const width = maxMinutes > 0
      ? (weeklyMinutes[week] / maxMinutes) * 100
      : 0;
    const bar = document.createElement("div");
    bar.style.height = "26px";
    bar.style.width = Math.max(width, 5) + "%";
    bar.style.background = "#d9a7b0";
    bar.style.borderRadius = "13px";
    bar.style.boxSizing = "border-box";
    bar.style.padding = "4px 10px";
    bar.style.color = "white";
    bar.style.fontWeight = "bold";
    bar.textContent = weeklyMinutes[week] + " min";
    row.appendChild(label);
    row.appendChild(bar);
    chart.appendChild(row);
  });
}

function renderCalendar() {
  const grid = getEl("calendarGrid");
  const monthTitle = getEl("calendarMonthTitle");
  if (!grid || !monthTitle) {
    return;
  }
  grid.innerHTML = "";
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  monthTitle.textContent =
    formatGregorian(calendarDate, { month: "long", year: "numeric" }) +
    " — " +
    formatPersian(calendarDate, { month: "long", year: "numeric" });
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(function(day) {
    const name = document.createElement("div");
    name.className = "calendar-day-name";
    name.textContent = day;
    grid.appendChild(name);
  });
  const startDay = new Date(year, month, 1).getDay();
  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement("div");
    empty.className = "calendar-day empty";
    grid.appendChild(empty);
  }
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDateKey = todayKey();
  const allStudyRecords = getStudyRecords();
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDateKey = calendarDateKey(new Date(year, month, day));
    const cell = document.createElement("div");
    cell.className = "calendar-day";
    const dayNumber = document.createElement("span");
    dayNumber.className = "calendar-day-number";
    dayNumber.textContent = day;
    cell.appendChild(dayNumber);
    if (currentDateKey === todayDateKey) {
      cell.classList.add("today");
    }
    const dayTasks = tasks.filter(function(task) {
      return task.date === currentDateKey;
    });
    const dayStudy = allStudyRecords.filter(function(session) {
      return session.date === currentDateKey;
    });
    const dayGoals = goals.filter(function(goal) {
      return goal.deadline === currentDateKey;
    });
    if (dayTasks.length > 0) {
      const taskIndicator = document.createElement("span");
      taskIndicator.className = "calendar-task-indicator";
      taskIndicator.textContent =
        "" + dayTasks.length + " task" + (dayTasks.length > 1 ? "s" : "");
      cell.appendChild(taskIndicator);
    }
    if (dayStudy.length > 0) {
      const studyIndicator = document.createElement("span");
      studyIndicator.className = "calendar-study-indicator";
      studyIndicator.textContent = "Study";
      cell.appendChild(studyIndicator);
    }
    if (dayGoals.length > 0) {
      const goalIndicator = document.createElement("span");
      goalIndicator.className = "calendar-goal-indicator";
      goalIndicator.textContent = "Goal";
      cell.appendChild(goalIndicator);
    }
    cell.addEventListener("click", function() {
      selectedCalendarDate = currentDateKey;
      showCalendarDay(currentDateKey);
    });
    grid.appendChild(cell);
  }
}

function showCalendarDay(selectedDate) {
  const info = getEl("selectedDateTasks");
  if (!info || !selectedDate) {
    return;
  }
  selectedCalendarDate = selectedDate;
  const date = parseDateKey(selectedDate);
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  };
  let html =
    "<div class='calendar-selected-header'>" +
    "<h3>" + escapeHtml(formatGregorian(date, options)) + "</h3>" +
    "<p>" + escapeHtml(formatPersian(date, options)) + "</p>" +
    "</div>";
  const dayGoals = goals.filter(function(goal) {
    return goal.deadline === selectedDate;
  });
  if (dayGoals.length > 0) {
    html += "<h3>Goals</h3>";
    dayGoals.forEach(function(goal) {
      html +=
        "<div class='calendar-goal-item'>" +
        "<strong>" + escapeHtml(goal.title || "Untitled goal") + "</strong>" +
        "<p>Deadline today</p>" +
        "</div>";
    });
  }
  const sessions = getStudyRecords().filter(function(session) {
    return session.date === selectedDate;
  });
  if (sessions.length > 0) {
    html += "<h3>Study</h3>";
    sessions.forEach(function(session) {
      html +=
        "<div class='calendar-study-item'>" +
        "<strong>" + escapeHtml(session.subject || "Study session") + "</strong>" +
        "<p>" + escapeHtml(session.minutes || 0) + " minutes</p>" +
        "<p>" + escapeHtml(session.total || 0) + " tests</p>" +
        (session.percentage !== null && session.percentage !== undefined
          ? "<p>" + escapeHtml(session.percentage) + "%</p>"
          : "") +
        "</div>";
    });
  }
  const dayTasks = tasks.filter(function(task) {
    return task.date === selectedDate;
  });
  html += "<h3>Tasks</h3>";
  if (dayTasks.length === 0) {
    html += "<p>No tasks for this day.</p>";
  } else {
    dayTasks.forEach(function(task) {
      const index = tasks.indexOf(task);
      const status = task.completed ? "Completed" : "Not completed";
      html +=
        "<div class='calendar-task-item'>" +
        "<p><strong>" + escapeHtml(task.title || "Untitled task") + "</strong></p>" +
        "<p>" + status + "</p>" +
        "<p>" + escapeHtml(task.category || "Other") + "</p>" +
        "<p>" + escapeHtml(task.priority || "Medium") + "</p>";
      if (task.description) {
        html += "<p>" + escapeHtml(task.description) + "</p>";
      }
      html +=
        "<label>" +
        "<input type='checkbox' data-task-index='" + index + "' " +
        (task.completed ? "checked" : "") + ">" +
        " Mark as completed" +
        "</label>" +
        "</div>";
    });
  }
  html +=
    "<button type='button' class='calendar-add-task-button'>" +
    "Add Task for This Day" +
    "</button>";
  info.innerHTML = html;

  info.querySelectorAll("input[data-task-index]").forEach(function(box) {
    box.addEventListener("change", function() {
      toggleCalendarTask(Number(box.getAttribute("data-task-index")));
    });
  });
  const addBtn = info.querySelector(".calendar-add-task-button");
  if (addBtn) {
    addBtn.addEventListener("click", addCalendarTask);
  }
}

function toggleCalendarTask(index) {
  const task = tasks[index];
  if (!task) {
    return;
  }
  task.completed = !task.completed;
  task.progress = task.completed ? 100 : 0;
  saveTasks();
  refreshTaskViews();
}

function addCalendarTask() {
  const selectedDate = selectedCalendarDate || todayKey();
  const title = prompt("Task title:");
  if (!title || title.trim() === "") {
    return;
  }
  const description = prompt("Description (optional):") || "";
  const categoryInput = prompt(
    "Category: Study, Work, Personal, Health, Other",
    "Personal"
  );
  const priorityInput = prompt(
    "Priority: High, Medium, Low",
    "Medium"
  );
  tasks.push({
    title: title.trim(),
    date: selectedDate,
    category: normalizeChoice(categoryInput, TASK_CATEGORIES, "Other"),
    priority: normalizeChoice(priorityInput, TASK_PRIORITIES, "Medium"),
    goalIndex: null,
    description: description.trim(),
    completed: false,
    progress: 0
  });
  saveTasks();
  refreshTaskViews();
}

function previousMonth() {
  calendarDate.setDate(1);
  calendarDate.setMonth(calendarDate.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  calendarDate.setDate(1);
  calendarDate.setMonth(calendarDate.getMonth() + 1);
  renderCalendar();
}

function goToTodayCalendar() {
  calendarDate = new Date();
  selectedCalendarDate = calendarDateKey(calendarDate);
  renderCalendar();
  showCalendarDay(selectedCalendarDate);
}

/* =====================================================================
   Helpers
   ===================================================================== */
function makeEl(tag, className, text) {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

function val(id, fallback) {
  const element = getEl(id);
  return element ? element.value : fallback;
}

function on(id, eventName, handler) {
  const element = getEl(id);
  if (element) {
    element.addEventListener(eventName, handler);
  }
}

function fullDateText(key) {
  if (!key || !isValidDateKey(key)) {
    return "";
  }
  const date = parseDateKey(key);
  return (
    formatGregorian(date, { month: "short", day: "numeric", year: "numeric" }) +
    " — " +
    formatPersian(date, { month: "long", day: "numeric", year: "numeric" })
  );
}

function optionList(list, selected) {
  return list.map(function(item) {
    return "<option value='" + escapeHtml(item) + "'" +
      (item === selected ? " selected" : "") + ">" + escapeHtml(item) + "</option>";
  }).join("");
}

function ensureHolder(id, beforeId) {
  let holder = getEl(id);
  if (!holder) {
    const target = getEl(beforeId);
    if (!target || !target.parentNode) {
      return null;
    }
    holder = document.createElement("div");
    holder.id = id;
    target.parentNode.insertBefore(holder, target);
  }
  return holder;
}

/* =====================================================================
   Saving + refreshing
   ===================================================================== */
function saveTasks() {
  saveJSON("tasks", tasks);
}

function saveGoals() {
  saveJSON("goals", goals);
}

function refreshTaskViews() {
  showHomeTasks();
  renderTasksPage();
  renderGoals();
  renderCalendar();
  showCalendarDay(selectedCalendarDate || todayKey());
}

/* =====================================================================
   Home page tasks
   ===================================================================== */
function addTask() {
  const input = getEl("newTask");
  if (!input) {
    return;
  }
  const title = input.value.trim();
  if (title === "") {
    return;
  }
  tasks.push({
    title: title,
    date: todayKey(),
    category: "Other",
    priority: "Medium",
    goalIndex: null,
    description: "",
    completed: false,
    progress: 0
  });
  input.value = "";
  saveTasks();
  refreshTaskViews();
}

function showHomeTasks() {
  const list = getEl("taskList");
  if (!list) {
    return;
  }
  list.innerHTML = "";
  const today = todayKey();
  const todays = [];
  tasks.forEach(function(task, index) {
    if (task.date === today) {
      todays.push({ task: task, index: index });
    }
  });
  if (todays.length === 0) {
    list.appendChild(makeEl("p", "overview-empty", "No tasks for today yet."));
    return;
  }
  todays.forEach(function(item) {
    const row = makeEl("div", "home-task-item");
    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = !!item.task.completed;
    box.addEventListener("change", function() {
      toggleTask(item.index);
    });
    const label = makeEl("div", "gratitude-text", item.task.title || "Untitled task");
    if (item.task.completed) {
      label.style.textDecoration = "line-through";
      label.style.opacity = "0.6";
    }
    const del = makeEl("button", "home-task-delete", "Remove");
    del.type = "button";
    del.addEventListener("click", function() {
      deleteTask(item.index, true);
    });
    row.appendChild(box);
    row.appendChild(label);
    row.appendChild(del);
    list.appendChild(row);
  });
}

function toggleTask(index) {
  const task = tasks[index];
  if (!task) {
    return;
  }
  task.completed = !task.completed;
  task.progress = task.completed ? 100 : 0;
  saveTasks();
  refreshTaskViews();
}

function setTaskProgress(index, value) {
  const task = tasks[index];
  if (!task) {
    return;
  }
  task.progress = Math.max(0, Math.min(100, Number(value) || 0));
  task.completed = task.progress >= 100;
  saveTasks();
  refreshTaskViews();
}

function deleteTask(index, skipConfirm) {
  if (!tasks[index]) {
    return;
  }
  if (!skipConfirm && !confirm("Delete this task?")) {
    return;
  }
  tasks.splice(index, 1);
  saveTasks();
  refreshTaskViews();
}

/* =====================================================================
   Tasks page
   ===================================================================== */
let editingTaskIndex = null;
const PRIORITY_RANK = { High: 0, Medium: 1, Low: 2 };

function taskCardHtml(task, index) {
  const done = !!task.completed;
  const progress = Math.max(0, Math.min(100, Number(task.progress) || 0));
  let html =
    "<div class='task-card" + (done ? " completed" : "") + "' data-index='" + index + "'>" +
    "<div class='task-complete-row'>" +
    "<input type='checkbox' data-act='toggle' " + (done ? "checked" : "") + ">" +
    "<h3>" + escapeHtml(task.title || "Untitled task") + "</h3></div>" +
    "<p>" + escapeHtml(task.category || "Other") + " · " +
    escapeHtml(task.priority || "Medium") + " priority" +
    (task.date ? " · " + escapeHtml(fullDateText(task.date)) : "") + "</p>";
  if (task.description) {
    html += "<p>" + escapeHtml(task.description) + "</p>";
  }
  if (typeof task.goalIndex === "number" && goals[task.goalIndex]) {
    html += "<p>Goal: " + escapeHtml(goals[task.goalIndex].title || "Untitled goal") + "</p>";
  }
  html +=
    "<div class='task-progress-label'>Progress: " + progress + "%</div>" +
    "<div class='task-progress-bar'><div class='task-progress-fill' style='width:" + progress + "%'></div></div>" +
    "<input type='range' min='0' max='100' step='5' value='" + progress + "' data-act='progress' style='margin-top:8px;padding:0'>" +
    "<div class='task-actions'>" +
    "<button type='button' class='edit-task-button' data-act='edit'>Edit</button>" +
    "<button type='button' class='reschedule-task-button' data-act='reschedule'>Reschedule</button>" +
    "<button type='button' class='delete-task-button' data-act='delete'>Delete</button>" +
    "</div></div>";
  return html;
}

function renderTasksPage() {
  const list = getEl("tasksList");
  if (!list) {
    return;
  }
  const doneCount = tasks.filter(function(t) { return t.completed; }).length;
  setText("totalTasks", tasks.length);
  setText("completedTasks", doneCount);
  setText("remainingTasks", tasks.length - doneCount);

  const search = val("taskSearchInput", "").trim().toLowerCase();
  const category = val("taskCategoryFilter", "all");
  const priority = val("taskPriorityFilter", "all");
  const status = val("taskStatusFilter", "all");
  const sort = val("taskSortFilter", "newest");

  const items = [];
  tasks.forEach(function(task, index) {
    const text = (String(task.title || "") + " " + String(task.description || "")).toLowerCase();
    if (search && text.indexOf(search) === -1) {
      return;
    }
    if (category !== "all" && (task.category || "Other") !== category) {
      return;
    }
    if (priority !== "all" && (task.priority || "Medium") !== priority) {
      return;
    }
    if (status === "completed" && !task.completed) {
      return;
    }
    if (status === "remaining" && task.completed) {
      return;
    }
    items.push({ task: task, index: index });
  });

  items.sort(function(a, b) {
    if (sort === "date") {
      return String(a.task.date || "9999").localeCompare(String(b.task.date || "9999"));
    }
    if (sort === "priority") {
      return (PRIORITY_RANK[a.task.priority] !== undefined ? PRIORITY_RANK[a.task.priority] : 1) -
        (PRIORITY_RANK[b.task.priority] !== undefined ? PRIORITY_RANK[b.task.priority] : 1);
    }
    if (sort === "incomplete") {
      return (a.task.completed ? 1 : 0) - (b.task.completed ? 1 : 0);
    }
    if (sort === "alphabetical") {
      return String(a.task.title || "").localeCompare(String(b.task.title || ""));
    }
    return b.index - a.index;
  });

  if (items.length === 0) {
    list.innerHTML = "<p class='overview-empty'>No tasks found.</p>";
    return;
  }
  list.innerHTML = items.map(function(item) {
    return taskCardHtml(item.task, item.index);
  }).join("");
}

function openTaskForm(index) {
  const holder = ensureHolder("taskFormHolder", "tasksList");
  if (!holder) {
    return;
  }
  editingTaskIndex = index;
  const task = index === null
    ? { title: "", description: "", date: todayKey(), category: "Personal", priority: "Medium", goalIndex: null }
    : tasks[index];
  let goalOptions = "<option value=''>No goal</option>";
  goals.forEach(function(goal, goalIndex) {
    goalOptions += "<option value='" + goalIndex + "'" +
      (task.goalIndex === goalIndex ? " selected" : "") + ">" +
      escapeHtml(goal.title || "Untitled goal") + "</option>";
  });
  holder.innerHTML =
    "<div class='task-form'>" +
    "<h3>" + (index === null ? "New Task" : "Edit Task") + "</h3>" +
    "<input id='tfTitle' type='text' placeholder='Task title' value='" + escapeHtml(task.title) + "'>" +
    "<textarea id='tfDesc' placeholder='Description (optional)'>" + escapeHtml(task.description) + "</textarea>" +
    "<input id='tfDate' type='date' value='" + escapeHtml(task.date || "") + "'>" +
    "<select id='tfCategory'>" + optionList(TASK_CATEGORIES, task.category) + "</select>" +
    "<select id='tfPriority'>" + optionList(TASK_PRIORITIES, task.priority) + "</select>" +
    "<select id='tfGoal'>" + goalOptions + "</select>" +
    "<div class='task-actions'>" +
    "<button type='button' id='tfSave'>Save</button>" +
    "<button type='button' class='delete-task-button' id='tfCancel'>Cancel</button>" +
    "</div></div>";
  on("tfSave", "click", saveTaskForm);
  on("tfCancel", "click", closeTaskForm);
  const titleInput = getEl("tfTitle");
  if (titleInput) {
    titleInput.focus();
  }
}

function closeTaskForm() {
  const holder = getEl("taskFormHolder");
  if (holder) {
    holder.innerHTML = "";
  }
  editingTaskIndex = null;
}

function saveTaskForm() {
  const title = val("tfTitle", "").trim();
  if (title === "") {
    alert("Please enter a task title.");
    return;
  }
  let date = val("tfDate", "");
  if (!isValidDateKey(date)) {
    date = todayKey();
  }
  const goalValue = val("tfGoal", "");
  const data = {
    title: title,
    description: val("tfDesc", "").trim(),
    date: date,
    category: normalizeChoice(val("tfCategory", "Other"), TASK_CATEGORIES, "Other"),
    priority: normalizeChoice(val("tfPriority", "Medium"), TASK_PRIORITIES, "Medium"),
    goalIndex: goalValue === "" ? null : Number(goalValue)
  };
  if (editingTaskIndex === null) {
    data.completed = false;
    data.progress = 0;
    tasks.push(data);
  } else if (tasks[editingTaskIndex]) {
    Object.assign(tasks[editingTaskIndex], data);
  }
  saveTasks();
  closeTaskForm();
  refreshTaskViews();
}

function setupTasksPage() {
  const list = getEl("tasksList");
  if (!list) {
    return;
  }
  list.addEventListener("click", function(event) {
    const button = event.target.closest("button[data-act]");
    if (!button) {
      return;
    }
    const card = button.closest("[data-index]");
    if (!card) {
      return;
    }
    const index = Number(card.getAttribute("data-index"));
    const action = button.getAttribute("data-act");
    if (action === "edit") {
      openTaskForm(index);
    } else if (action === "delete") {
      deleteTask(index);
    } else if (action === "reschedule") {
      const task = tasks[index];
      const next = prompt("New date (YYYY-MM-DD):", task ? task.date : todayKey());
      if (next && isValidDateKey(next.trim()) && task) {
        task.date = next.trim();
        saveTasks();
        refreshTaskViews();
      } else if (next) {
        alert("Please use the format YYYY-MM-DD.");
      }
    }
  });
  list.addEventListener("change", function(event) {
    const target = event.target;
    const action = target.getAttribute("data-act");
    const card = target.closest("[data-index]");
    if (!action || !card) {
      return;
    }
    const index = Number(card.getAttribute("data-index"));
    if (action === "toggle") {
      toggleTask(index);
    } else if (action === "progress") {
      setTaskProgress(index, target.value);
    }
  });
  on("addTaskButton", "click", function() {
    openTaskForm(null);
  });
  on("taskSearchInput", "input", renderTasksPage);
  ["taskCategoryFilter", "taskPriorityFilter", "taskStatusFilter", "taskSortFilter"].forEach(function(id) {
    on(id, "change", renderTasksPage);
  });
}

/* =====================================================================
   Goals
   ===================================================================== */
let editingGoalIndex = null;
let goalDraft = null;

function goalProgress(goal) {
  const milestones = Array.isArray(goal.milestones) ? goal.milestones : [];
  if (milestones.length > 0) {
    const done = milestones.filter(function(m) { return m.completed; }).length;
    return Math.round((done / milestones.length) * 100);
  }
  return goal.completed ? 100 : 0;
}

function renderGoals() {
  const list = getEl("goalsList");
  if (!list) {
    return;
  }
  if (goals.length === 0) {
    list.innerHTML = "<p class='overview-empty'>No goals yet. Add your first one!</p>";
    return;
  }
  list.innerHTML = goals.map(function(goal, index) {
    const milestones = Array.isArray(goal.milestones) ? goal.milestones : [];
    const progress = goalProgress(goal);
    const linked = tasks.filter(function(t) { return t.goalIndex === index; });
    const linkedDone = linked.filter(function(t) { return t.completed; }).length;
    let html =
      "<div class='goal-card" + (goal.completed ? " completed" : "") + "' data-index='" + index + "'>" +
      "<div class='goal-complete-row'>" +
      "<input type='checkbox' data-act='toggleGoal' " + (goal.completed ? "checked" : "") + ">" +
      "<h3>" + escapeHtml(goal.title || "Untitled goal") + "</h3></div>";
    if (goal.description) {
      html += "<p>" + escapeHtml(goal.description) + "</p>";
    }
    if (goal.deadline) {
      html += "<p>Deadline: " + escapeHtml(fullDateText(goal.deadline)) + "</p>";
    }
    html +=
      "<div class='task-progress-label'>Progress: " + progress + "%</div>" +
      "<div class='task-progress-bar'><div class='task-progress-fill' style='width:" + progress + "%'></div></div>";
    if (milestones.length > 0) {
      html += "<div class='milestone-section' style='margin-top:12px'><div class='milestone-title'>Milestones</div>";
      milestones.forEach(function(m, k) {
        html +=
          "<div class='milestone-item'>" +
          "<input type='checkbox' data-act='toggleMilestone' data-m='" + k + "' " + (m.completed ? "checked" : "") + ">" +
          "<span>" + escapeHtml(m.title) + "</span></div>";
      });
      html += "</div>";
    }
    if (linked.length > 0) {
      html += "<p>Linked tasks: " + linkedDone + " / " + linked.length + " done</p>";
    }
    html +=
      "<div class='task-actions'>" +
      "<button type='button' class='edit-goal-button' data-act='editGoal'>Edit</button>" +
      "<button type='button' class='delete-goal-button' data-act='deleteGoal'>Delete</button>" +
      "</div></div>";
    return html;
  }).join("");
}

function syncGoalDraft() {
  if (!goalDraft || !getEl("gfTitle")) {
    return;
  }
  goalDraft.title = val("gfTitle", "");
  goalDraft.description = val("gfDesc", "");
  goalDraft.deadline = val("gfDeadline", "");
  document.querySelectorAll("#goalFormHolder .gfMilestone").forEach(function(input, k) {
    if (goalDraft.milestones[k]) {
      goalDraft.milestones[k].title = input.value;
    }
  });
}

function renderGoalForm() {
  const holder = ensureHolder("goalFormHolder", "goalsList");
  if (!holder || !goalDraft) {
    return;
  }
  let milestonesHtml = "";
  goalDraft.milestones.forEach(function(m, k) {
    milestonesHtml +=
      "<div class='milestone-item'>" +
      "<input type='text' class='gfMilestone' placeholder='Milestone' value='" + escapeHtml(m.title) + "'>" +
      "<button type='button' class='remove-study-slot' data-remove='" + k + "'>Remove</button></div>";
  });
  holder.innerHTML =
    "<div class='goal-form'>" +
    "<h3>" + (editingGoalIndex === null ? "New Goal" : "Edit Goal") + "</h3>" +
    "<input id='gfTitle' type='text' placeholder='Goal title' value='" + escapeHtml(goalDraft.title) + "'>" +
    "<textarea id='gfDesc' placeholder='Description (optional)'>" + escapeHtml(goalDraft.description) + "</textarea>" +
    "<input id='gfDeadline' type='date' value='" + escapeHtml(goalDraft.deadline || "") + "'>" +
    "<div class='milestone-section'><div class='milestone-title'>Milestones</div>" + milestonesHtml +
    "<button type='button' class='add-milestone-button' id='gfAddMilestone'>+ Add milestone</button></div>" +
    "<div class='task-actions'>" +
    "<button type='button' id='gfSave'>Save</button>" +
    "<button type='button' class='delete-goal-button' id='gfCancel'>Cancel</button>" +
    "</div></div>";
  on("gfAddMilestone", "click", function() {
    syncGoalDraft();
    goalDraft.milestones.push({ title: "", completed: false });
    renderGoalForm();
    const inputs = document.querySelectorAll("#goalFormHolder .gfMilestone");
    if (inputs.length > 0) {
      inputs[inputs.length - 1].focus();
    }
  });
  on("gfSave", "click", saveGoalForm);
  on("gfCancel", "click", closeGoalForm);
  holder.querySelectorAll("button[data-remove]").forEach(function(button) {
    button.addEventListener("click", function() {
      syncGoalDraft();
      goalDraft.milestones.splice(Number(button.getAttribute("data-remove")), 1);
      renderGoalForm();
    });
  });
}

function openGoalForm(index) {
  editingGoalIndex = index;
  if (index === null) {
    goalDraft = { title: "", description: "", deadline: "", milestones: [], completed: false };
  } else {
    const goal = goals[index];
    goalDraft = {
      title: goal.title || "",
      description: goal.description || "",
      deadline: goal.deadline || "",
      milestones: (Array.isArray(goal.milestones) ? goal.milestones : []).map(function(m) {
        return { title: m.title, completed: !!m.completed };
      }),
      completed: !!goal.completed
    };
  }
  renderGoalForm();
  const titleInput = getEl("gfTitle");
  if (titleInput) {
    titleInput.focus();
  }
}

function closeGoalForm() {
  const holder = getEl("goalFormHolder");
  if (holder) {
    holder.innerHTML = "";
  }
  goalDraft = null;
  editingGoalIndex = null;
}

function saveGoalForm() {
  syncGoalDraft();
  const title = goalDraft.title.trim();
  if (title === "") {
    alert("Please enter a goal title.");
    return;
  }
  const milestones = goalDraft.milestones
    .map(function(m) { return { title: m.title.trim(), completed: !!m.completed }; })
    .filter(function(m) { return m.title !== ""; });
  const completed = milestones.length > 0
    ? milestones.every(function(m) { return m.completed; })
    : goalDraft.completed;
  const data = {
    title: title,
    description: goalDraft.description.trim(),
    deadline: isValidDateKey(goalDraft.deadline) ? goalDraft.deadline : "",
    milestones: milestones,
    completed: completed
  };
  if (editingGoalIndex === null) {
    goals.push(data);
  } else {
    goals[editingGoalIndex] = data;
  }
  saveGoals();
  closeGoalForm();
  refreshTaskViews();
}

function deleteGoal(index) {
  if (!goals[index] || !confirm("Delete this goal?")) {
    return;
  }
  goals.splice(index, 1);
  tasks.forEach(function(task) {
    if (typeof task.goalIndex === "number") {
      if (task.goalIndex === index) {
        task.goalIndex = null;
      } else if (task.goalIndex > index) {
        task.goalIndex--;
      }
    }
  });
  saveGoals();
  saveTasks();
  closeGoalForm();
  refreshTaskViews();
}

function setupGoalsPage() {
  const list = getEl("goalsList");
  if (!list) {
    return;
  }
  list.addEventListener("click", function(event) {
    const button = event.target.closest("button[data-act]");
    if (!button) {
      return;
    }
    const card = button.closest("[data-index]");
    if (!card) {
      return;
    }
    const index = Number(card.getAttribute("data-index"));
    const action = button.getAttribute("data-act");
    if (action === "editGoal") {
      openGoalForm(index);
    } else if (action === "deleteGoal") {
      deleteGoal(index);
    }
  });
  list.addEventListener("change", function(event) {
    const target = event.target;
    const action = target.getAttribute("data-act");
    const card = target.closest("[data-index]");
    if (!action || !card) {
      return;
    }
    const goal = goals[Number(card.getAttribute("data-index"))];
    if (!goal) {
      return;
    }
    if (!Array.isArray(goal.milestones)) {
      goal.milestones = [];
    }
    if (action === "toggleGoal") {
      goal.completed = !goal.completed;
      goal.milestones.forEach(function(m) {
        m.completed = goal.completed;
      });
    } else if (action === "toggleMilestone") {
      const m = goal.milestones[Number(target.getAttribute("data-m"))];
      if (m) {
        m.completed = !m.completed;
        goal.completed = goal.milestones.every(function(x) { return x.completed; });
      }
    }
    saveGoals();
    refreshTaskViews();
  });
  on("addGoalButton", "click", function() {
    openGoalForm(null);
  });
}

/* =====================================================================
   Journal
   ===================================================================== */
function saveJournal() {
  const input = getEl("journalText");
  if (!input) {
    return;
  }
  const text = input.value.trim();
  if (text === "") {
    return;
  }
  journalEntries.unshift({ date: todayKey(), text: text });
  saveJSON("journalEntries", journalEntries);
  input.value = "";
  renderJournal();
}

function renderJournal() {
  const list = getEl("journalEntries");
  if (!list) {
    return;
  }
  list.innerHTML = "";
  journalEntries.forEach(function(entry, index) {
    const item = makeEl("div", "journal-entry");
    item.appendChild(makeEl("div", "journal-date", fullDateText(entry.date) || String(entry.date || "")));
    item.appendChild(makeEl("div", "journal-text", entry.text));
    const del = makeEl("button", "journal-delete", "Delete");
    del.type = "button";
    del.addEventListener("click", function() {
      if (confirm("Delete this journal entry?")) {
        journalEntries.splice(index, 1);
        saveJSON("journalEntries", journalEntries);
        renderJournal();
      }
    });
    item.appendChild(del);
    list.appendChild(item);
  });
}

/* =====================================================================
   Study planner (weekly plan)
   ===================================================================== */
const WEEKDAY_NAMES = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function emptySlot() {
  return { subject: "", topic: "", minutes: "", tests: "", actualMinutes: "", completed: false };
}

function getPlan(weekKey) {
  let plan = weeklyStudyPlans[weekKey];
  if (!Array.isArray(plan)) {
    plan = [];
  }
  for (let i = 0; i < 7; i++) {
    if (!Array.isArray(plan[i])) {
      plan[i] = [];
    }
  }
  weeklyStudyPlans[weekKey] = plan;
  return plan;
}

function savePlans() {
  saveJSON("weeklyStudyPlans", weeklyStudyPlans);
}

function dayDate(dayIndex) {
  const start = getWeekStartFromKey(selectedStudyWeek);
  start.setDate(start.getDate() + dayIndex);
  return start;
}

function shiftStudyWeek(amount) {
  const start = getWeekStartFromKey(selectedStudyWeek);
  start.setDate(start.getDate() + 7 * amount);
  selectedStudyWeek = getWeekKey(start);
  storageSet("selectedStudyWeek", selectedStudyWeek);
  renderStudySection();
}

function createSlotElement(slot, dayIndex, slotIndex) {
  const row = makeEl("div", "study-slot");

  function addField(type, placeholder, prop, extraClass) {
    const input = document.createElement("input");
    input.type = type;
    input.placeholder = placeholder;
    if (type === "number") {
      input.min = "0";
    }
    if (extraClass) {
      input.className = extraClass;
    }
    input.value = slot[prop] === undefined || slot[prop] === null ? "" : slot[prop];
    input.addEventListener("input", function() {
      slot[prop] = input.value;
      savePlans();
      updateStudySummary();
      updateWeeklyOverview();
    });
    row.appendChild(input);
  }

  addField("text", "Subject", "subject");
  addField("text", "Topic", "topic");
  addField("number", "Minutes", "minutes");
  addField("number", "Tests", "tests");
  addField("number", "Actual minutes", "actualMinutes", "actual-minutes");

  const label = makeEl("label", "study-completion");
  const box = document.createElement("input");
  box.type = "checkbox";
  box.checked = !!slot.completed;
  box.addEventListener("change", function() {
    slot.completed = box.checked;
    savePlans();
    updateStudySummary();
    updateWeeklyOverview();
  });
  label.appendChild(box);
  label.appendChild(document.createTextNode("Done"));
  row.appendChild(label);

  const remove = makeEl("button", "remove-study-slot", "Remove");
  remove.type = "button";
  remove.addEventListener("click", function() {
    getPlan(selectedStudyWeek)[dayIndex].splice(slotIndex, 1);
    savePlans();
    renderStudyPlan();
    updateStudySummary();
    updateWeeklyOverview();
  });
  row.appendChild(remove);
  return row;
}

function renderStudyPlan() {
  const plan = getPlan(selectedStudyWeek);
  const isCurrent = selectedStudyWeek === getWeekKey(new Date());
  setText("studyWeekTitle", isCurrent ? "This Week" : formatWeekDate(selectedStudyWeek));
  document.querySelectorAll("#studyPage .study-day").forEach(function(dayElement, dayIndex) {
    if (dayIndex > 6) {
      return;
    }
    const dateElement = dayElement.querySelector(".study-day-date");
    if (dateElement) {
      const d = dayDate(dayIndex);
      dateElement.textContent =
        formatGregorian(d, { month: "short", day: "numeric" }) + " — " +
        formatPersian(d, { month: "long", day: "numeric" });
    }
    const slotsElement = dayElement.querySelector(".study-slots");
    if (!slotsElement) {
      return;
    }
    slotsElement.innerHTML = "";
    if (plan[dayIndex].length === 0) {
      plan[dayIndex].push(emptySlot());
    }
    plan[dayIndex].forEach(function(slot, slotIndex) {
      slotsElement.appendChild(createSlotElement(slot, dayIndex, slotIndex));
    });
  });
}

function updateWeeklyOverview() {
  const box = getEl("weeklyStudyOverview");
  if (!box) {
    return;
  }
  const plan = getPlan(selectedStudyWeek);
  box.innerHTML = "";
  WEEKDAY_NAMES.forEach(function(name, dayIndex) {
    const d = dayDate(dayIndex);
    box.appendChild(makeEl("p", "overview-day",
      name + " · " + formatGregorian(d, { month: "short", day: "numeric" })));
    const slots = plan[dayIndex].filter(function(s) {
      return String(s.subject || "").trim() !== "";
    });
    if (slots.length === 0) {
      box.appendChild(makeEl("p", "overview-empty", "Nothing planned."));
      return;
    }
    const cards = makeEl("div", "overview-cards");
    slots.forEach(function(slot) {
      const card = makeEl("div", "overview-card");
      card.innerHTML =
        "<strong>" + escapeHtml(slot.subject) + "</strong>" +
        (slot.topic ? "<p>" + escapeHtml(slot.topic) + "</p>" : "") +
        "<p>" + escapeHtml(Number(slot.minutes) || 0) + " min planned · " +
        escapeHtml(Number(slot.tests) || 0) + " tests</p>" +
        "<span class='overview-status'>" + (slot.completed ? "Completed" : "Planned") + "</span>";
      cards.appendChild(card);
    });
    box.appendChild(cards);
  });
}

function updateStudySummary() {
  const plan = getPlan(selectedStudyWeek);
  let plannedMinutes = 0;
  let actualMinutes = 0;
  let plannedTests = 0;
  let plannedSessions = 0;
  let completedSessions = 0;
  plan.forEach(function(daySlots) {
    daySlots.forEach(function(slot) {
      actualMinutes += Number(slot.actualMinutes) || 0;
      if (String(slot.subject || "").trim() === "") {
        return;
      }
      plannedMinutes += Number(slot.minutes) || 0;
      plannedTests += Number(slot.tests) || 0;
      plannedSessions++;
      if (slot.completed) {
        completedSessions++;
      }
    });
  });
  let actualTests = 0;
  studyLog.forEach(function(entry) {
    if (getSessionWeek(entry) === selectedStudyWeek) {
      actualMinutes += Number(entry.minutes) || 0;
      actualTests += Number(entry.tests) || 0;
      completedSessions++;
    }
  });
  setText("plannedStudyTime", plannedMinutes + " minutes");
  setText("actualStudyTime", actualMinutes + " minutes");
  setText("plannedStudyTests", plannedTests + " tests");
  setText("actualStudyTests", actualTests + " tests");
  setText("plannedStudySessions", plannedSessions + " study sessions");
  setText("completedStudySessions", completedSessions + " study sessions");
}

/* =====================================================================
   Study log
   ===================================================================== */
let studyLogFormOpen = false;

function renderStudyLog() {
  const box = getEl("studyLogEntries");
  if (!box) {
    return;
  }
  let html = "";
  if (studyLogFormOpen) {
    const defaultDate = selectedStudyWeek === getWeekKey(new Date())
      ? todayKey()
      : dateKey(dayDate(0));
    html +=
      "<div class='study-log-form'>" +
      "<input id='slDate' type='date' value='" + defaultDate + "'>" +
      "<input id='slSubject' type='text' placeholder='Subject'>" +
      "<input id='slMinutes' type='number' min='0' placeholder='Minutes'>" +
      "<input id='slTests' type='number' min='0' placeholder='Total tests (optional)'>" +
      "<input id='slCorrect' type='number' min='0' placeholder='Correct'>" +
      "<input id='slWrong' type='number' min='0' placeholder='Wrong'>" +
      "<input id='slUnanswered' type='number' min='0' placeholder='Unanswered'>" +
      "<button type='button' id='slSave'>Save</button>" +
      "<button type='button' class='delete-study-log-button' id='slCancel'>Cancel</button>" +
      "</div>";
  }
  const entries = [];
  studyLog.forEach(function(entry, index) {
    if (getSessionWeek(entry) === selectedStudyWeek) {
      entries.push({ entry: entry, index: index });
    }
  });
  entries.sort(function(a, b) {
    return String(b.entry.date).localeCompare(String(a.entry.date));
  });
  if (entries.length === 0 && !studyLogFormOpen) {
    html += "<p class='overview-empty'>No sessions logged this week.</p>";
  }
  entries.forEach(function(item) {
    const e = item.entry;
    const graded = (Number(e.correct) || 0) + (Number(e.wrong) || 0) + (Number(e.unanswered) || 0);
    html +=
      "<div class='study-log-card'>" +
      "<strong>" + escapeHtml(e.subject || "Study session") + "</strong>" +
      "<p>" + escapeHtml(fullDateText(e.date)) + "</p>" +
      "<p>" + escapeHtml(Number(e.minutes) || 0) + " minutes · " +
      escapeHtml(Number(e.tests) || graded) + " tests</p>" +
      (graded > 0
        ? "<p>Correct " + escapeHtml(e.correct || 0) + " · Wrong " + escapeHtml(e.wrong || 0) +
          " · Unanswered " + escapeHtml(e.unanswered || 0) + " · " +
          escapeHtml(calcPercentage(Number(e.correct) || 0, Number(e.wrong) || 0, graded)) + "%</p>"
        : "") +
      "<button type='button' class='delete-study-log-button' data-log='" + item.index + "'>Delete</button>" +
      "</div>";
  });
  box.innerHTML = html;
  on("slSave", "click", saveStudyLogEntry);
  on("slCancel", "click", function() {
    studyLogFormOpen = false;
    renderStudyLog();
  });
  box.querySelectorAll("button[data-log]").forEach(function(button) {
    button.addEventListener("click", function() {
      if (confirm("Delete this study session?")) {
        studyLog.splice(Number(button.getAttribute("data-log")), 1);
        afterStudyLogChange();
      }
    });
  });
}

function afterStudyLogChange() {
  saveJSON("studyLog", studyLog);
  renderStudyLog();
  updateStudySummary();
  updateProgress();
  renderCalendar();
}

function saveStudyLogEntry() {
  const date = val("slDate", "");
  const subject = val("slSubject", "").trim();
  const minutes = Number(val("slMinutes", 0)) || 0;
  const correct = Number(val("slCorrect", 0)) || 0;
  const wrong = Number(val("slWrong", 0)) || 0;
  const unanswered = Number(val("slUnanswered", 0)) || 0;
  let tests = Number(val("slTests", 0)) || 0;
  if (subject === "" || !isValidDateKey(date) || minutes <= 0 ||
      correct < 0 || wrong < 0 || unanswered < 0 || tests < 0) {
    alert("Please enter valid study information.");
    return;
  }
  if (tests === 0) {
    tests = correct + wrong + unanswered;
  }
  studyLog.push({
    date: date,
    subject: subject,
    minutes: minutes,
    tests: tests,
    correct: correct,
    wrong: wrong,
    unanswered: unanswered
  });
  studyLogFormOpen = false;
  afterStudyLogChange();
}

function renderStudySection() {
  renderStudyPlan();
  renderStudyLog();
  updateWeeklyOverview();
  updateStudySummary();
}

/* =====================================================================
   Start up
   ===================================================================== */
function initApp() {
  showDate();
  updateWater();
  showMood();
  showGratitude();
  showReminders();
  loadStudySessions();
  renderJournal();

  on("previousStudyWeek", "click", function() { shiftStudyWeek(-1); });
  on("nextStudyWeek", "click", function() { shiftStudyWeek(1); });
  on("addStudyLogButton", "click", function() {
    studyLogFormOpen = true;
    renderStudyLog();
  });
  document.querySelectorAll("#studyPage .add-study-slot").forEach(function(button, dayIndex) {
    button.addEventListener("click", function() {
      getPlan(selectedStudyWeek)[dayIndex].push(emptySlot());
      savePlans();
      renderStudyPlan();
    });
  });

  on("previousMonthButton", "click", previousMonth);
  on("nextMonthButton", "click", nextMonth);
  on("todayCalendarButton", "click", goToTodayCalendar);
  on("newTask", "keydown", function(event) {
    if (event.key === "Enter") {
      addTask();
    }
  });

  setupTasksPage();
  setupGoalsPage();
  renderStudySection();
  refreshTaskViews();

  const firstButton = document.querySelector(".nav-button");
  showPage("homePage", firstButton);
}

// Make every function used by an onclick="..." in the HTML reachable.
// This is needed when CodePen runs the JS as a module (then top-level
// functions are NOT global and clicks fail with "... is not defined").
(function exposeToWindow() {
  var exposed = {
    showPage: showPage,
    setMood: setMood,
    addGlass: addGlass,
    removeGlass: removeGlass,
    addGratitude: addGratitude,
    addReminder: addReminder,
    addStudySession: addStudySession,
    addTask: addTask,
    saveJournal: saveJournal
  };
  Object.keys(exposed).forEach(function (name) {
    window[name] = exposed[name];
  });
})();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
