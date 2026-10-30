(function () {
  "use strict";

  var ROOT_KEY = "daftar_root_v1";
  var DATA_PREFIX = "daftar_data_";
  var DRAFT_PREFIX = "daftar_draft_";
  var VERSION = 1;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var pad = function (n) { return n < 10 ? "0" + n : "" + n; };
  var uid = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); };
  var esc = function (v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var clamp = function (n, a, b) { return Math.max(a, Math.min(b, n)); };
  var nowISO = function () { return new Date().toISOString(); };
  var dateKey = function (d) { d = d || new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  var parseKey = function (k) { var p = String(k || "").split("-"); return new Date(+p[0], +p[1] - 1, +p[2] || 1); };
  var todayKey = function () { return dateKey(new Date()); };
  var addDays = function (d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; };
  var addMonths = function (d, n) { var x = new Date(d); x.setMonth(x.getMonth() + n); return x; };
  var startOfMonth = function (d) { return new Date(d.getFullYear(), d.getMonth(), 1); };
  var endOfMonth = function (d) { return new Date(d.getFullYear(), d.getMonth() + 1, 0); };
  var monthKey = function (d) { d = d || new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1); };
  var startOfWeek = function (d) { d = new Date(d); var off = (d.getDay() + 1) % 7; return addDays(d, -off); };
  var endOfWeek = function (d) { return addDays(startOfWeek(d), 6); };
  var daysInMonth = function (y, m) { return new Date(y, m + 1, 0).getDate(); };
  var dayIndex = function (d) { return (d.getDay() + 1) % 7; };
  var timeNow = function () { var d = new Date(); return pad(d.getHours()) + ":" + pad(d.getMinutes()); };
  var isoToKey = function (iso) { if (!iso) return ""; var d = new Date(iso); return isNaN(d) ? "" : dateKey(d); };
  var safeInt = function (n, d) { n = parseInt(n, 10); return isNaN(n) ? d : n; };

  var CATS = {
    personal: { ar: "شخصي", en: "Personal", em: "🌿" },
    work: { ar: "عمل", en: "Work", em: "💼" },
    study: { ar: "دراسة", en: "Study", em: "📚" },
    health: { ar: "صحة", en: "Health", em: "🫀" },
    home: { ar: "منزل", en: "Home", em: "🏡" },
    other: { ar: "أخرى", en: "Other", em: "✨" }
  };
  var PRIORITIES = {
    high: { ar: "مرتفعة", en: "High", cls: "high" },
    med: { ar: "متوسطة", en: "Medium", cls: "med" },
    low: { ar: "منخفضة", en: "Low", cls: "low" }
  };
  var REPEATS = {
    none: { ar: "بدون تكرار", en: "No repeat" },
    daily: { ar: "يومياً", en: "Daily" },
    weekly: { ar: "أسبوعياً", en: "Weekly" },
    monthly: { ar: "شهرياً", en: "Monthly" }
  };
  var MOODS = [
    { id: "happy", em: "😊", ar: "سعيد", en: "Happy" },
    { id: "calm", em: "😌", ar: "هادئ", en: "Calm" },
    { id: "excited", em: "🤩", ar: "متحمس", en: "Excited" },
    { id: "neutral", em: "😐", ar: "عادي", en: "Neutral" },
    { id: "tired", em: "😴", ar: "متعب", en: "Tired" },
    { id: "sad", em: "😔", ar: "حزين", en: "Sad" },
    { id: "anxious", em: "😟", ar: "قلق", en: "Anxious" },
    { id: "angry", em: "😠", ar: "غاضب", en: "Angry" }
  ];
  var GOAL_CATS = {
    personal: { ar: "شخصي", en: "Personal", em: "🌱" },
    health: { ar: "صحة", en: "Health", em: "🫀" },
    career: { ar: "مهني", en: "Career", em: "💼" },
    learning: { ar: "تعلم", en: "Learning", em: "📖" },
    financial: { ar: "مالي", en: "Financial", em: "💰" },
    spiritual: { ar: "روحي", en: "Spiritual", em: "🕊️" },
    other: { ar: "أخرى", en: "Other", em: "✨" }
  };
  var NOTE_CATS = {
    general: { ar: "عامة", en: "General", em: "🗒️" },
    ideas: { ar: "أفكار", en: "Ideas", em: "💡" },
    study: { ar: "دراسة", en: "Study", em: "📚" },
    work: { ar: "عمل", en: "Work", em: "💼" }
  };
  var EXPENSE_CATS = {
    food: { ar: "طعام", en: "Food", em: "🍽️" },
    transport: { ar: "مواصلات", en: "Transport", em: "🚗" },
    housing: { ar: "سكن", en: "Housing", em: "🏠" },
    bills: { ar: "فواتير", en: "Bills", em: "🧾" },
    health: { ar: "صحة", en: "Health", em: "💊" },
    education: { ar: "تعليم", en: "Education", em: "🎓" },
    fun: { ar: "ترفيه", en: "Leisure", em: "🎬" },
    shopping: { ar: "تسوق", en: "Shopping", em: "🛍️" },
    other: { ar: "أخرى", en: "Other", em: "✨" }
  };
  var INCOME_CATS = {
    salary: { ar: "راتب", en: "Salary", em: "💼" },
    freelance: { ar: "عمل حر", en: "Freelance", em: "💻" },
    gift: { ar: "هدية", en: "Gift", em: "🎁" },
    other: { ar: "أخرى", en: "Other", em: "✨" }
  };
  var NOTE_COLORS = {
    default: { ar: "افتراضي", en: "Default", color: "" },
    green: { ar: "أخضر", en: "Green", color: "green" },
    blue: { ar: "أزرق", en: "Blue", color: "blue" },
    purple: { ar: "بنفسجي", en: "Purple", color: "purple" },
    clay: { ar: "طيني", en: "Clay", color: "clay" }
  };
  var LIST_ICONS = ["📋", "🎬", "📺", "📚", "📍", "🛍️", "🌟", "🎧", "🧩", "🍜", "✈️", "💡"];
  var HABIT_ICONS = ["💧", "🏃", "📖", "🧘", "🌙", "✍️", "🥗", "🦷", "🚶", "💊", "🎯", "🌿"];
  var ACCENTS = [
    { id: "sage", color: "#3f6b55" },
    { id: "forest", color: "#2f5d48" },
    { id: "teal", color: "#2f6f6c" },
    { id: "olive", color: "#67713f" },
    { id: "sky", color: "#476d88" },
    { id: "clay", color: "#97624e" }
  ];
  var QUOTES = [
    "ابدأ صغيراً، لكن ابدأ اليوم.",
    "الخطوات الصغيرة تصنع حياة مختلفة.",
    "ما تكتبه اليوم سيصبح ذكرى تعود إليها غداً.",
    "لا تنتظر الشعور بالحماس، ابدأ وسيأتي.",
    "الهدوء ليس فراغاً، بل مساحة لترتيب نفسك.",
    "من يعتني بأيامه الصغيرة يعتني بحياته كلها.",
    "أفضل وقت لزراعة شجرة كان قبل عشرين سنة، والثاني الآن.",
    "اكتب فكرتك قبل أن يسرقها النسيان.",
    "الإنجاز ليس سرعة، بل استمرار.",
    "اجعل لنفسك مساحة تشبهك."
  ];
  var QUOTES_EN = [
    "Start small, but start today.",
    "Small steps make a different life.",
    "What you write today becomes a memory you return to tomorrow.",
    "Don't wait for motivation; begin and it will come.",
    "Calm is not emptiness; it is space to gather yourself.",
    "Those who care for their small days care for their whole life.",
    "The best time to plant a tree was twenty years ago. The second best is now.",
    "Write your idea before forgetfulness steals it.",
    "Achievement is not speed; it is continuation.",
    "Make a space for yourself that feels like you."
  ];

  var PAGES = {
    home: { em: "🏠", ar: "الرئيسية", subAr: "ملخص يومك", en: "Home", subEn: "Your day at a glance", group: "today" },
    tasks: { em: "✅", ar: "المهام والمخطط", subAr: "ما تريد إنجازه", en: "Tasks", subEn: "What you want to get done", group: "today" },
    calendar: { em: "📅", ar: "التقويم", subAr: "مواعيدك ومناسباتك", en: "Calendar", subEn: "Appointments and occasions", group: "today" },
    journal: { em: "📔", ar: "اليوميات", subAr: "مساحتك للكتابة", en: "Journal", subEn: "Your writing space", group: "space" },
    goals: { em: "🎯", ar: "الأهداف", subAr: "أحلامك خطوة بخطوة", en: "Goals", subEn: "Dreams, one step at a time", group: "space" },
    habits: { em: "🌱", ar: "العادات", subAr: "أيامك الصغيرة المتكررة", en: "Habits", subEn: "Your small daily wins", group: "space" },
    lists: { em: "📋", ar: "القوائم", subAr: "أفلام، كتب، أمنيات وأكثر", en: "Lists", subArEn: "Movies, books, wishes and more", group: "space" },
    notes: { em: "🗒️", ar: "الملاحظات", subAr: "أفكارك السريعة", en: "Notes", subEn: "Your quick thoughts", group: "space" },
    money: { em: "💰", ar: "المصروفات", subAr: "ميزانيتك الشهرية", en: "Money", subEn: "Your monthly budget", group: "space" },
    review: { em: "📈", ar: "مراجعة التقدم", subAr: "ماذا تغيّر فيك؟", en: "Progress", subEn: "What changed in you?", group: "reflect" },
    reminders: { em: "🔔", ar: "التذكيرات", subAr: "ما يحتاج انتباهك", en: "Reminders", subEn: "What needs your attention", group: "reflect" },
    settings: { em: "⚙️", ar: "الإعدادات", subAr: "حسابك ومظهرك", en: "Settings", subEn: "Account and appearance", group: "reflect" }
  };
  var NAV_GROUPS = [
    { ar: "يومك", en: "Your day", items: ["home", "tasks", "calendar"] },
    { ar: "مساحتك", en: "Your space", items: ["journal", "goals", "habits", "lists", "notes", "money"] },
    { ar: "مراجعة", en: "Reflect", items: ["review", "reminders", "settings"] }
  ];
  var BOTTOM = ["home", "tasks", "calendar", "journal"];

  var EN = {
    "مساحتك الشخصية": "Your personal space",
    "مساحتك الشخصية للحياة والأفكار": "Your calm space for life and ideas",
    "ملخص يومك": "Your day at a glance",
    "ما تريد إنجازه": "What you want to get done",
    "مواعيدك ومناسباتك": "Appointments and occasions",
    "مساحتك للكتابة": "Your writing space",
    "أحلامك خطوة بخطوة": "Dreams, one step at a time",
    "أيامك الصغيرة المتكررة": "Your small daily wins",
    "أفلام، كتب، أمنيات وأكثر": "Movies, books, wishes and more",
    "أفكارك السريعة": "Your quick thoughts",
    "ميزانيتك الشهرية": "Your monthly budget",
    "ماذا تغيّر فيك؟": "What changed in you?",
    "ما يحتاج انتباهك": "What needs your attention",
    "حسابك ومظهرك": "Account and appearance",
    "يومك": "Your day",
    "مساحتك": "Your space",
    "مراجعة": "Reflect",
    "عام": "General",
    "إضافة": "Add",
    "حفظ": "Save",
    "إلغاء": "Cancel",
    "تعديل": "Edit",
    "حذف": "Delete",
    "إغلاق": "Close",
    "رجوع": "Back",
    "اليوم": "Today",
    "غداً": "Tomorrow",
    "أمس": "Yesterday",
    "الكل": "All",
    "بحث": "Search",
    "بحث شامل": "Search everywhere",
    "لا توجد نتائج": "No results",
    "لم تُضف شيئاً بعد": "Nothing added yet",
    "الوضع الليلي": "Dark mode",
    "الوضع النهاري": "Light mode",
    "الحساب": "Account",
    "البيانات": "Data",
    "الخصوصية": "Privacy",
    "اسمك": "Your name",
    "سيُحذف كل محتوى دفترك من هذا الجهاز.": "All content in your notebook will be removed from this device.",
    "القائمة": "Menu",
    "الرئيسية": "Home",
    "المهام والمخطط": "Tasks",
    "التقويم": "Calendar",
    "اليوميات": "Journal",
    "الأهداف": "Goals",
    "العادات": "Habits",
    "القوائم": "Lists",
    "الملاحظات": "Notes",
    "المصروفات": "Money",
    "مراجعة التقدم": "Progress",
    "التذكيرات": "Reminders",
    "الإعدادات": "Settings",
    "تسجيل الخروج": "Log out",
    "صباح الخير": "Good morning",
    "مساء الخير": "Good evening",
    "أهلاً بك": "Welcome",
    "اقتباس اليوم": "Quote of the day",
    "مهام اليوم": "Today's tasks",
    "المهام القادمة": "Upcoming tasks",
    "الأهداف الحالية": "Current goals",
    "تذكيرات اليوم": "Today's reminders",
    "آخر ما كتبته": "Latest journal entry",
    "ملخص الأسبوع": "Week summary",
    "الإنجاز": "Done",
    "مهمة منجزة": "tasks done",
    "من إجمالي": "of",
    "لا توجد مهام اليوم": "No tasks today",
    "أضف مهمة لتبدأ يومك": "Add a task to start your day",
    "لا توجد مهام قادمة": "No upcoming tasks",
    "كل شيء تحت السيطرة": "Everything is under control",
    "لا توجد أهداف نشطة": "No active goals",
    "ابدأ بهدف واحد صغير": "Start with one small goal",
    "لا توجد تذكيرات": "No reminders",
    "يومك هادئ": "Your day is calm",
    "لا توجد يوميات": "No journal entries",
    "اكتب أول صفحة من يومك": "Write the first page of your day",
    "مقفلة": "Locked",
    "اليوميات مقفلة": "Journal is locked",
    "افتح القفل لعرض آخر كتاباتك": "Unlock to see your latest writing",
    "عرض الكل": "View all",
    "إضافة مهمة": "Add task",
    "مهمة جديدة": "New task",
    "تعديل المهمة": "Edit task",
    "اسم المهمة": "Task title",
    "وصف مختصر": "Short description",
    "التاريخ": "Date",
    "الوقت": "Time",
    "الأولوية": "Priority",
    "التصنيف": "Category",
    "التكرار": "Repeat",
    "مرتفعة": "High",
    "متوسطة": "Medium",
    "منخفضة": "Low",
    "بدون تكرار": "No repeat",
    "يومياً": "Daily",
    "أسبوعياً": "Weekly",
    "شهرياً": "Monthly",
    "شخصي": "Personal",
    "عمل": "Work",
    "دراسة": "Study",
    "صحة": "Health",
    "منزل": "Home",
    "أخرى": "Other",
    "متأخرة": "Overdue",
    "مكتملة": "Completed",
    "مفتوحة": "Open",
    "الكل": "All",
    "تأجيل": "Postpone",
    "تم التأجيل ليوم": "Postponed by one day",
    "تمت إضافة المهمة": "Task added",
    "تم حفظ التعديلات": "Changes saved",
    "تم حذف المهمة": "Task deleted",
    "هل تحذف هذه المهمة؟": "Delete this task?",
    "سيتم حذفها نهائياً.": "It will be permanently deleted.",
    "إضافة سريعة": "Quick add",
    "اكتب مهمة ثم اضغط Enter": "Type a task and press Enter",
    "الأسبوع": "Week",
    "الشهر": "Month",
    "فلترة": "Filter",
    "حسب الحالة": "By status",
    "حسب الأولوية": "By priority",
    "لا توجد مهام مطابقة": "No matching tasks",
    "جرّب تغيير البحث أو الفلتر": "Try changing the search or filter",
    "نسبة إنجاز اليوم": "Today's completion",
    "إضافة حدث": "Add event",
    "حدث جديد": "New event",
    "تعديل الحدث": "Edit event",
    "اسم الحدث": "Event title",
    "التفاصيل": "Details",
    "النوع": "Type",
    "حدث شخصي": "Personal event",
    "مناسبة مهمة": "Important occasion",
    "مناسبة": "Occasion",
    "تذكير قبل": "Remind before",
    "دقيقة": "minutes",
    "بدون تذكير": "No reminder",
    "حدث مهم": "Important",
    "تمت إضافة الحدث": "Event added",
    "لا توجد مواعيد": "No appointments",
    "أضف حدثاً أو مناسبة": "Add an event or occasion",
    "عرض": "View",
    "شهري": "Month",
    "أسبوعي": "Week",
    "يومي": "Day",
    "الشهر السابق": "Previous month",
    "الشهر التالي": "Next month",
    "الأسبوع السابق": "Previous week",
    "الأسبوع التالي": "Next week",
    "اليوم السابق": "Previous day",
    "اليوم التالي": "Next day",
    "المهام والمواعيد": "Tasks and appointments",
    "مهمة": "Task",
    "موعد": "Event",
    "إضافة يومية": "New entry",
    "يومية جديدة": "New journal entry",
    "تعديل اليومية": "Edit journal entry",
    "عنوان اليومية": "Journal title",
    "اكتب ما تشعر به...": "Write what you feel...",
    "الحالة المزاجية": "Mood",
    "إضافة صور": "Add photos",
    "الصور": "Photos",
    "لا توجد صور": "No photos",
    "حفظ تلقائي": "Autosave",
    "تُحفظ المسودة تلقائياً أثناء الكتابة": "Your draft is saved automatically while you write",
    "اقفل اليوميات الآن": "Lock journal now",
    "اليوميات مقفلة بكلمة مرور": "Journal is password protected",
    "أدخل كلمة المرور للوصول": "Enter your password to continue",
    "كلمة المرور": "Password",
    "فتح": "Unlock",
    "كلمة المرور غير صحيحة": "Incorrect password",
    "ذكريات اليوم": "On this day",
    "من سنوات سابقة": "From previous years",
    "بدون عنوان": "Untitled",
    "تم حفظ اليومية": "Journal entry saved",
    "تم حذف اليومية": "Journal entry deleted",
    "هل تحذف هذه اليومية؟": "Delete this journal entry?",
    "اكتب شيئاً أولاً": "Write something first",
    "هدف جديد": "New goal",
    "تعديل الهدف": "Edit goal",
    "عنوان الهدف": "Goal title",
    "لماذا هذا الهدف؟": "Why this goal?",
    "الموعد النهائي": "Deadline",
    "نسبة الإنجاز": "Progress",
    "الخطوات": "Steps",
    "أضف خطوة صغيرة": "Add a small step",
    "خطوة جديدة": "New step",
    "لا توجد خطوات بعد": "No steps yet",
    "نشط": "Active",
    "مكتمل": "Completed",
    "متوقف": "Paused",
    "إيقاف": "Pause",
    "استئناف": "Resume",
    "إنجاز الهدف": "Complete goal",
    "سجل التطور": "Progress history",
    "لا يوجد سجل بعد": "No history yet",
    "تمت إضافة الهدف": "Goal added",
    "تم حذف الهدف": "Goal deleted",
    "هل تحذف هذا الهدف؟": "Delete this goal?",
    "لا توجد أهداف": "No goals",
    "أضف هدفاً تريد تحقيقه": "Add a goal you want to achieve",
    "متبقي": "left",
    "يوم": "days",
    "انتهت المدة": "Deadline passed",
    "عاداتك": "Your habits",
    "عادة جديدة": "New habit",
    "تعديل العادة": "Edit habit",
    "اسم العادة": "Habit name",
    "الرمز": "Icon",
    "عدد المرات": "Target count",
    "مرة": "times",
    "في اليوم": "per day",
    "في الأسبوع": "per week",
    "سلسلة الأيام": "Day streak",
    "أفضل سلسلة": "Best streak",
    "الالتزام": "Adherence",
    "تسجيل": "Log",
    "تم التسجيل": "Logged",
    "تمت إعادة ضبط اليوم": "Today reset",
    "لا توجد عادات": "No habits",
    "ابدأ بعادة صغيرة تدوم": "Start with one small habit",
    "تقويم العادات": "Habit calendar",
    "آخر ١٢ أسبوعاً": "Last 12 weeks",
    "نسبة الالتزام": "Adherence",
    "عادات اليوم": "Today's habits",
    "تمت إضافة العادة": "Habit added",
    "تم حذف العادة": "Habit deleted",
    "هل تحذف هذه العادة؟": "Delete this habit?",
    "قوائمك": "Your lists",
    "قائمة جديدة": "New list",
    "تعديل القائمة": "Edit list",
    "اسم القائمة": "List name",
    "اسم العنصر": "Item name",
    "ملاحظة قصيرة": "Short note",
    "عنصر جديد": "New item",
    "تعديل العنصر": "Edit item",
    "لا توجد عناصر": "No items",
    "أضف أول عنصر إلى القائمة": "Add the first item to this list",
    "قائمة": "List",
    "عنصر": "item",
    "عناصر": "items",
    "تمت إضافة القائمة": "List added",
    "تم حذف القائمة": "List deleted",
    "هل تحذف هذه القائمة؟": "Delete this list?",
    "سيتم حذف كل عناصرها.": "All its items will be deleted.",
    "ملاحظة جديدة": "New note",
    "تعديل الملاحظة": "Edit note",
    "عنوان الملاحظة": "Note title",
    "اكتب ملاحظتك هنا...": "Write your note here...",
    "تثبيت": "Pin",
    "مثبتة": "Pinned",
    "عامة": "General",
    "أفكار": "Ideas",
    "اللون": "Color",
    "لا توجد ملاحظات": "No notes",
    "أضف فكرة سريعة": "Add a quick thought",
    "تم حفظ الملاحظة": "Note saved",
    "تم حذف الملاحظة": "Note deleted",
    "هل تحذف هذه الملاحظة؟": "Delete this note?",
    "الميزانية": "Budget",
    "الدخل": "Income",
    "المصروف": "Expenses",
    "المتبقي": "Remaining",
    "تعديل الميزانية": "Edit budget",
    "ميزانية الشهر": "Monthly budget",
    "أضف مصروفاً": "Add expense",
    "أضف دخلاً": "Add income",
    "حركة جديدة": "New transaction",
    "تعديل الحركة": "Edit transaction",
    "نوع الحركة": "Transaction type",
    "المبلغ": "Amount",
    "بيان": "Note",
    "مصروف": "Expense",
    "دخل": "Income",
    "ينفق": "Spent",
    "متبقي من الميزانية": "Budget remaining",
    "تجاوزت الميزانية": "Over budget",
    "توزيع المصروفات": "Expense breakdown",
    "آخر ٦ أشهر": "Last 6 months",
    "الحركات": "Transactions",
    "لا توجد حركات": "No transactions",
    "سجّل أول مصروف أو دخل": "Record your first expense or income",
    "تم حفظ الحركة": "Transaction saved",
    "تم حذف الحركة": "Transaction deleted",
    "هل تحذف هذه الحركة؟": "Delete this transaction?",
    "لا توجد ميزانية محددة": "No budget set",
    "تحديد ميزانية": "Set budget",
    "الإجمالي": "Total",
    "مراجعة يومية": "Daily review",
    "مراجعة أسبوعية": "Weekly review",
    "مراجعة شهرية": "Monthly review",
    "المهام المنجزة": "Tasks completed",
    "التزام العادات": "Habit adherence",
    "تطور الأهداف": "Goal progress",
    "اليوميات المكتوبة": "Journal entries",
    "أكثر أيامك إنتاجية": "Your most productive days",
    "أسئلة للمراجعة": "Reflection questions",
    "ما الذي سار جيداً؟": "What went well?",
    "ما الذي يمكن تحسينه؟": "What could be improved?",
    "ما أهم درس تعلمته؟": "What was your biggest lesson?",
    "ما أول خطوة للفترة القادمة؟": "What is your first step next?",
    "حفظ المراجعة": "Save review",
    "تم حفظ المراجعة": "Review saved",
    "لا توجد بيانات كافية": "Not enough data yet",
    "أنجز بعض المهام أو اكتب يومية لتبدأ": "Complete some tasks or write a journal entry",
    "لا توجد مهام في هذه الفترة": "No tasks in this period",
    "إنتاجيتك": "Your productivity",
    "تذكيراتك": "Your reminders",
    "عرض الإعدادات": "Open settings",
    "تفعيل الإشعارات": "Enable notifications",
    "الإشعارات مفعّلة": "Notifications enabled",
    "الإشعارات متوقفة": "Notifications off",
    "تنبيه المهام": "Task reminders",
    "تنبيه المواعيد": "Event reminders",
    "تنبيه العادات": "Habit reminders",
    "تنبيه الأهداف": "Goal reminders",
    "وقت تذكير العادات": "Habit reminder time",
    "التنبيه قبل الموعد": "Remind before",
    "دقائق": "minutes",
    "المتصفح لا يدعم الإشعارات": "This browser does not support notifications",
    "تم تفعيل الإشعارات": "Notifications enabled",
    "لم يُسمح بالإشعارات": "Notification permission denied",
    "لا توجد تذكيرات قريبة": "No upcoming reminders",
    "كل شيء تحت السيطرة": "Everything is under control",
    "مهمة اليوم": "Today's task",
    "موعد اليوم": "Today's event",
    "عادة لم تُسجل": "Habit not logged",
    "هدف يقترب موعده": "Goal deadline approaching",
    "الإعدادات والحساب": "Settings and account",
    "الملف الشخصي": "Profile",
    "الاسم": "Name",
    "البريد الإلكتروني": "Email",
    "حفظ الملف الشخصي": "Save profile",
    "تم تحديث الملف الشخصي": "Profile updated",
    "الأمان": "Security",
    "كلمة المرور الحالية": "Current password",
    "كلمة المرور الجديدة": "New password",
    "تأكيد كلمة المرور": "Confirm password",
    "تغيير كلمة المرور": "Change password",
    "تم تغيير كلمة المرور": "Password changed",
    "كلمة المرور الحالية غير صحيحة": "Current password is incorrect",
    "كلمتا المرور غير متطابقتين": "Passwords do not match",
    "كلمة المرور قصيرة": "Password is too short",
    "قفل اليوميات": "Journal lock",
    "قفل اليوميات بكلمة مرور إضافية": "Password-protect your journal",
    "إضافة قفل": "Add lock",
    "إزالة القفل": "Remove lock",
    "أدخل رمزاً من ٤ أرقام على الأقل": "Enter a PIN of at least 4 digits",
    "رمز القفل": "Journal PIN",
    "تأكيد الرمز": "Confirm PIN",
    "تم تفعيل قفل اليوميات": "Journal lock enabled",
    "تم إزالة القفل": "Journal lock removed",
    "المظهر": "Appearance",
    "الوضع": "Mode",
    "نهاري": "Light",
    "ليلي": "Dark",
    "تلقائي": "Auto",
    "اللون الأساسي": "Accent color",
    "اللغة": "Language",
    "العربية": "Arabic",
    "الإنجليزية": "English",
    "حجم الخط": "Font size",
    "الإشعارات": "Notifications",
    "تفعيل الإشعارات": "Enable notifications",
    "البيانات والنسخ الاحتياطي": "Data and backup",
    "تصدير نسخة احتياطية": "Export backup",
    "استيراد نسخة احتياطية": "Import backup",
    "استعادة": "Restore",
    "تم تصدير النسخة": "Backup exported",
    "آخر نسخة احتياطية": "Last backup",
    "لم تُنشأ نسخة بعد": "No backup yet",
    "التطبيق": "App",
    "تثبيت التطبيق": "Install app",
    "التطبيق مثبت ويعمل دون اتصال.": "The app is installed and works offline.",
    "لتثبيت التطبيق، افتح قائمة المتصفح ثم اختر «إضافة إلى الشاشة الرئيسية».": "To install, open the browser menu and choose “Add to Home screen”.",
    "تم تثبيت التطبيق": "App installed",
    "يمكنك تثبيته لاحقاً": "You can install it later",
    "حسناً": "OK",
    "تم استيراد البيانات": "Data imported",
    "ملف غير صالح": "Invalid file",
    "هل تستبدل بياناتك الحالية؟": "Replace your current data?",
    "سيتم استبدال كل البيانات الحالية بالنسخة المستوردة.": "All current data will be replaced by the imported backup.",
    "المزامنة السحابية": "Cloud sync",
    "رابط المزامنة": "Sync URL",
    "اسم المستخدم": "Username",
    "رابط الخادم (WebDAV)": "Server URL (WebDAV)",
    "تفعيل المزامنة التلقائية": "Enable automatic sync",
    "حفظ إعدادات المزامنة": "Save sync settings",
    "رفع الآن": "Upload now",
    "تنزيل الآن": "Download now",
    "تم رفع النسخة": "Backup uploaded",
    "تم تنزيل النسخة": "Backup downloaded",
    "تعذّرت المزامنة": "Sync failed",
    "اختياري: يدعم WebDAV أو أي رابط JSON يقبل CORS": "Optional: supports WebDAV or any CORS-enabled JSON endpoint",
    "حذف كل البيانات": "Delete all data",
    "حذف الحساب": "Delete account",
    "هل تحذف كل البيانات؟": "Delete all data?",
    "سيبقى حسابك لكن ستُمسح كل محتوياته.": "Your account stays, but all content will be erased.",
    "هل تحذف الحساب نهائياً؟": "Delete your account permanently?",
    "سيُحذف حسابك وكل بياناتك من هذا الجهاز.": "Your account and all data will be removed from this device.",
    "تم مسح البيانات": "Data cleared",
    "تم حذف الحساب": "Account deleted",
    "حول دفتر": "About Daftar",
    "دفتر ليس مجرد تطبيق لإدارة الوقت. اجعله مكاناً تعود إليه بعد سنوات لتجد أهدافك وأفكارك وذكرياتك.": "Daftar is not just a time-management app. Let it be a place you return to years later to find your goals, ideas and memories.",
    "بياناتك محفوظة على جهازك فقط": "Your data is stored only on your device",
    "تسجيل الدخول": "Log in",
    "إنشاء حساب": "Create account",
    "أنشئ حسابك الخاص": "Create your private account",
    "مرحباً بعودتك": "Welcome back",
    "ابدأ مساحتك الشخصية": "Start your personal space",
    "أدخل بياناتك للمتابعة": "Enter your details to continue",
    "الاسم الكامل": "Full name",
    "تأكيد كلمة المرور": "Confirm password",
    "ليس لديك حساب؟": "No account yet?",
    "لديك حساب بالفعل؟": "Already have an account?",
    "أنشئ حساباً الآن": "Create one now",
    "سجّل الدخول": "Log in",
    "بيانات غير صحيحة": "Incorrect details",
    "هذا البريد مسجل مسبقاً": "This email is already registered",
    "أكمل جميع الحقول": "Please fill in all fields",
    "مكان تعود إليه بعد سنوات،": "A place you return to years later,",
    "لتجد أهدافك وأفكارك وذكرياتك.": "to find your goals, ideas and memories.",
    "مهام، أهداف، عادات، يوميات، قوائم، ملاحظات ومصروفات — في مساحة واحدة خاصة بك.": "Tasks, goals, habits, journal, lists, notes and expenses — in one private space.",
    "لا تجعل الدفتر مجرد أداة لإدارة الوقت، بل ذاكرة صغيرة لحياتك.": "Don't make Daftar just a time-management tool. Let it be a small memory of your life.",
    "بياناتك تُحفظ على جهازك فقط، ولا تُرسل إلى أي خادم.": "Your data stays on your device and is never sent to a server.",
    "تم إنشاء الحساب": "Account created",
    "مرحباً": "Hello",
    "أضف": "Add",
    "عرض التفاصيل": "Details",
    "محفوظ": "Saved",
    "تعديل البيانات": "Edit details",
    "فتح القائمة": "Open menu",
    "إغلاق القائمة": "Close menu",
    "بحث في كل شيء": "Search everything",
    "اكتب كلمة للبحث في المهام واليوميات والملاحظات...": "Type to search tasks, journal, notes...",
    "إجمالي": "Total",
    "خلال": "during",
    "هذا الأسبوع": "this week",
    "هذا الشهر": "this month",
    "من إنجاز": "completed",
    "منجزة": "done",
    "نشطة": "active",
    "عادات": "habits",
    "يوميات": "journal entries",
    "مهمة اليوم": "today's tasks",
    "تذكير": "reminder",
    "الآن": "Now",
    "بعد": "in",
    "سنة": "year",
    "سنتين": "2 years",
    "سنوات": "years",
    "شهر": "month",
    "أشهر": "months",
    "أيام": "days",
    "ساعة": "hour",
    "ساعات": "hours",
    "دقيقة": "minute",
    "دقائق": "minutes",
    "لا يوجد": "None",
    "غير محدد": "Not set",
    "اختر": "Choose",
    "مثال": "Example",
    "اختياري": "Optional",
    "سجل": "Log",
    "عرض الكل": "View all",
    "أضف أول عنصر": "Add first item",
    "تم": "Done",
    "تخطي": "Skip",
    "الاستمرار": "Continue",
    "تأكيد": "Confirm",
    "حذف نهائي": "Delete permanently",
    "بدء": "Start",
    "عودة": "Back",
    "الأحدث": "Newest",
    "الأقدم": "Oldest",
    "الأفضل": "Best",
    "إعدادات": "Settings",
    "تخصيص": "Customize",
    "تفاصيل": "Details",
    "ملاحظة": "Note",
    "صورة": "Photo",
    "الصور": "Photos",
    "إضافة صورة": "Add photo",
    "حذف الصورة": "Remove photo",
    "حجم الصورة": "Image size",
    "أنشئ قائمة لأي شيء تحبه": "Create a list for anything you love",
    "العملة": "Currency",
    "المهام": "Tasks",
    "المهام، اليوميات، الملاحظات، القوائم...": "Tasks, journal, notes, lists...",
    "بحث داخل الملاحظات": "Search notes",
    "بحث في اليوميات": "Search journal",
    "بدون موعد": "No date",
    "تذكير بالعادات": "Habit reminder",
    "تم حذف الحدث": "Event deleted",
    "جرّب كلمة أخرى": "Try another word",
    "حدث": "Event",
    "سيتم حذفه نهائياً.": "It will be permanently deleted.",
    "لا توجد قائمة": "No list",
    "ملاحظة سريعة": "Quick note",
    "هل تحذف هذا الحدث؟": "Delete this event?",
    "يدوي": "Manual",
    "تلقائي": "Auto"
  };

  var root = loadRoot();
  var user = null;
  var D = null;
  var currentPage = "home";
  var authMode = "register";
  var journalUnlocked = false;
  var notifTimers = [];
  var notifyQueue = null;
  var draftTimer = null;
  var searchTimer = null;
  var deferredPrompt = null;
  var booted = false;

  var taskView = "today";
  var taskSearch = "";
  var taskPriority = "all";
  var taskStatus = "open";
  var calView = "month";
  var calCursor = new Date();
  var calSel = todayKey();
  var journalQuery = "";
  var journalMood = "all";
  var goalFilter = "active";
  var listOpen = null;
  var listFilter = "";
  var notesQuery = "";
  var notesCat = "all";
  var moneyMonth = monthKey();
  var reviewType = "week";
  var reviewCursor = new Date();

  function t(s) {
    if (!D || D.prefs.lang !== "en") return s;
    return EN[s] || s;
  }

  function locale() {
    return D && D.prefs.lang === "en" ? "en-GB" : "ar-EG";
  }

  function fmtDate(k, opts) {
    var d = typeof k === "string" ? parseKey(k) : k;
    if (!d || isNaN(d)) return "—";
    opts = opts || {};
    try {
      return new Intl.DateTimeFormat(locale(), opts).format(d);
    } catch (e) { return dateKey(d); }
  }

  function fmtFull(k) {
    return fmtDate(k, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  function fmtShort(k) {
    return fmtDate(k, { day: "numeric", month: "short" });
  }

  function fmtMonth(d) {
    return fmtDate(d, { month: "long", year: "numeric" });
  }

  function time12(v) {
    if (!v) return "";
    var p = String(v).split(":");
    var h = +p[0], m = p[1] || "00";
    var am = h < 12, hh = h % 12 || 12;
    if (D && D.prefs.lang === "en") return hh + ":" + m + " " + (am ? "AM" : "PM");
    return hh + ":" + m + " " + (am ? "ص" : "م");
  }

  function moneyFmt(n) {
    var v = Number(n) || 0;
    try {
      return new Intl.NumberFormat(locale(), { maximumFractionDigits: 2 }).format(v);
    } catch (e) { return String(v); }
  }

  function catLabel(id, map) {
    var c = (map || CATS)[id];
    return c ? (D && D.prefs.lang === "en" ? c.en : c.ar) : (id || "أخرى");
  }

  function listName(l) {
    return D && D.prefs.lang === "en" && l.en ? l.en : l.name;
  }

  function prioLabel(id) { var p = PRIORITIES[id] || PRIORITIES.med; return D && D.prefs.lang === "en" ? p.en : p.ar; }
  function repeatLabel(id) { var r = REPEATS[id] || REPEATS.none; return D && D.prefs.lang === "en" ? r.en : r.ar; }
  function moodOf(id) { return MOODS.filter(function (m) { return m.id === id; })[0] || MOODS[3]; }
  function moodLabel(m) { return D && D.prefs.lang === "en" ? m.en : m.ar; }

  function weekdayShort(d) {
    var ar = ["سبت", "أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة"];
    var en = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
    return (D && D.prefs.lang === "en" ? en : ar)[dayIndex(d)];
  }

  function weekdayLong(d) {
    var ar = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
    var en = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    return (D && D.prefs.lang === "en" ? en : ar)[dayIndex(d)];
  }

  function pageTitle(p) {
    var m = PAGES[p] || PAGES.home;
    return D && D.prefs.lang === "en" ? m.en : m.ar;
  }
  function pageSub(p) {
    var m = PAGES[p] || PAGES.home;
    return D && D.prefs.lang === "en" ? (m.subEn || m.subAr || "") : (m.subAr || "");
  }

  function toast(msg) {
    var el = $("#toast");
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    requestAnimationFrame(function () { el.classList.add("show"); });
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      el.classList.remove("show");
      setTimeout(function () { el.hidden = true; }, 260);
    }, 2400);
  }

  function haptic(ms) {
    try { if (navigator.vibrate) navigator.vibrate(ms || 10); } catch (e) {}
  }

  function loadRoot() {
    try {
      var p = JSON.parse(localStorage.getItem(ROOT_KEY) || "null");
      if (p && Array.isArray(p.users)) return { users: p.users, session: p.session || null };
    } catch (e) {}
    return { users: [], session: null };
  }
  function saveRoot() {
    try { localStorage.setItem(ROOT_KEY, JSON.stringify(root)); } catch (e) {}
  }

  function defaultData() {
    return {
      version: VERSION,
      tasks: [], events: [], journal: [], goals: [], habits: [], habitLogs: {},
      lists: [
        { id: uid(), name: "أفلام أريد مشاهدتها", en: "Movies to watch", icon: "🎬", createdAt: nowISO(), items: [] },
        { id: uid(), name: "كتب أريد قراءتها", en: "Books to read", icon: "📚", createdAt: nowISO(), items: [] },
        { id: uid(), name: "أماكن أريد زيارتها", en: "Places to visit", icon: "📍", createdAt: nowISO(), items: [] },
        { id: uid(), name: "قائمة أمنياتي", en: "My wishlist", icon: "🌟", createdAt: nowISO(), items: [] }
      ],
      notes: [], transactions: [], budgets: {}, reviews: [],
      prefs: {
        theme: "light", accent: "sage", lang: "ar", fs: 1, currency: "ر.س",
        notify: { enabled: false, tasks: true, events: true, habits: true, goals: true, leadMin: 10, habitTime: "20:00" },
        journalLock: { enabled: false, pinHash: "", salt: "" },
        sync: { url: "", user: "", pass: "", enabled: false, lastAt: "" },
        lastPage: "home", onboarded: false, lastBackup: ""
      },
      meta: { createdAt: nowISO() }
    };
  }

  function loadData(id) {
    var d = null;
    try { d = JSON.parse(localStorage.getItem(DATA_PREFIX + id) || "null"); } catch (e) {}
    var base = defaultData();
    if (!d || typeof d !== "object") return base;
    var keys = ["tasks", "events", "journal", "goals", "habits", "lists", "notes", "transactions", "reviews"];
    keys.forEach(function (k) { if (!Array.isArray(d[k])) d[k] = base[k]; });
    if (!d.habitLogs || typeof d.habitLogs !== "object") d.habitLogs = {};
    if (!d.budgets || typeof d.budgets !== "object") d.budgets = {};
    d.prefs = Object.assign({}, base.prefs, d.prefs || {});
    d.prefs.notify = Object.assign({}, base.prefs.notify, d.prefs.notify || {});
    d.prefs.journalLock = Object.assign({}, base.prefs.journalLock, d.prefs.journalLock || {});
    d.prefs.sync = Object.assign({}, base.prefs.sync, d.prefs.sync || {});
    d.meta = Object.assign({}, base.meta, d.meta || {});
    return d;
  }

  function saveData() {
    if (!user || !D) return;
    D.version = VERSION;
    try {
      localStorage.setItem(DATA_PREFIX + user.id, JSON.stringify(D));
      queueSync();
    } catch (e) {
      toast("⚠️ " + (D.prefs.lang === "en" ? "Storage is full. Try removing some photos." : "المساحة ممتلئة. جرّب حذف بعض الصور."));
    }
  }

  function userDataKey() { return user ? DRAFT_PREFIX + user.id : ""; }

  function saveDraft(draft) {
    if (!user) return;
    try {
      if (!draft) localStorage.removeItem(userDataKey());
      else localStorage.setItem(userDataKey(), JSON.stringify(draft));
    } catch (e) {}
  }
  function loadDraft() {
    try { return JSON.parse(localStorage.getItem(userDataKey()) || "null"); } catch (e) { return null; }
  }

  function queueSync() {
    if (!D || !D.prefs.sync.enabled || !D.prefs.sync.url) return;
    clearTimeout(queueSync._t);
    queueSync._t = setTimeout(function () { syncUpload(true); }, 3500);
  }

  function applyPrefs() {
    if (!D) return;
    var p = D.prefs;
    document.documentElement.setAttribute("data-theme", resolveTheme());
    document.documentElement.setAttribute("data-accent", p.accent || "sage");
    document.documentElement.style.setProperty("--fs", p.fs || 1);
    var lang = p.lang === "en" ? "en" : "ar";
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "en" ? "ltr" : "rtl";
    var tc = document.querySelector('meta[name="theme-color"]');
    if (tc) tc.setAttribute("content", resolveTheme() === "dark" ? "#0d1511" : "#2f5d4a");
    applyStaticI18n();
  }

  var STATIC_EN = {
    authTag: "The place you return to after years, to find your goals, ideas and memories.",
    authSub: "Tasks, goals, habits, journal, lists, notes and expenses — in one private space.",
    authQuote: "Don't make the notebook just a time-management tool; make it a small memory of your life.",
    localOnly: "🔒 Your data stays on this device and is never sent to a server.",
    brandSub: "Your personal space",
    menu: "Menu",
    search: "Search everywhere",
    theme: "Dark mode"
  };

  function applyStaticI18n() {
    var en = !!(D && D.prefs.lang === "en");
    $$("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (!el.hasAttribute("data-i18n-ar")) el.setAttribute("data-i18n-ar", el.innerHTML);
      var original = el.getAttribute("data-i18n-ar");
      el.innerHTML = en ? (STATIC_EN[key] || original) : original;
    });
    $$("[data-i18n-aria]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria");
      if (!el.hasAttribute("data-i18n-aria-ar")) el.setAttribute("data-i18n-aria-ar", el.getAttribute("aria-label") || "");
      var original = el.getAttribute("data-i18n-aria-ar");
      el.setAttribute("aria-label", en ? (STATIC_EN[key] || original) : original);
    });
  }

  function isStandalone() {
    return !!(window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
  }

  function installApp() {
    if (!deferredPrompt) {
      openModal({
        title: t("تثبيت التطبيق"),
        body: '<p class="muted" style="font-size:13.5px;line-height:1.9">' + t("لتثبيت التطبيق، افتح قائمة المتصفح ثم اختر «إضافة إلى الشاشة الرئيسية».") + '</p>',
        submitText: t("حسناً"),
        onSubmit: function () { return true; }
      });
      return;
    }
    deferredPrompt.prompt();
    var promptRef = deferredPrompt;
    deferredPrompt = null;
    if (promptRef.userChoice && promptRef.userChoice.then) {
      promptRef.userChoice.then(function (choice) {
        toast(choice && choice.outcome === "accepted" ? t("تم تثبيت التطبيق") : t("يمكنك تثبيته لاحقاً"));
        renderSettings();
      }).catch(function () {});
    }
  }

  function resolveTheme() {
    if (!D) return "light";
    if (D.prefs.theme === "auto") return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    return D.prefs.theme === "dark" ? "dark" : "light";
  }

  function applyThemeToggle() {
    if (!D) return;
    D.prefs.theme = resolveTheme() === "dark" ? "light" : "dark";
    saveData();
    applyPrefs();
    renderChrome();
    if (currentPage === "settings") renderPage("settings");
  }

  function setDirForLang() {
    applyPrefs();
  }

  async function hashText(salt, text) {
    var value = salt + "::" + text;
    try {
      if (window.crypto && crypto.subtle) {
        var buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
        return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
      }
    } catch (e) {}
    var h1 = 0x811c9dc5, h2 = 0x1000193;
    for (var i = 0; i < value.length; i++) {
      var c = value.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
      h2 = Math.imul(h2 + c, 2246822519) >>> 0;
    }
    return "f" + h1.toString(16) + h2.toString(16);
  }

  function findUser(email) {
    email = String(email || "").trim().toLowerCase();
    return root.users.filter(function (u) { return String(u.email || "").toLowerCase() === email; })[0] || null;
  }

  function showAuth() {
    document.getElementById("shell").hidden = true;
    var auth = document.getElementById("authScreen");
    auth.hidden = false;
    applyStaticI18n();
    authMode = root.users.length ? "login" : "register";
    renderAuth();
  }

  function authError(msg) {
    var el = $("#authError");
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
  }

  function renderAuth() {
    var body = "";
    if (authMode === "register") {
      body = '<div class="field"><label>' + t("الاسم الكامل") + '</label><input class="input" name="name" autocomplete="name" placeholder="' + t("مثال") + ': ' + (D && D.prefs.lang === "en" ? "Sara" : "سارة") + '" required></div>' +
        '<div class="field"><label>' + t("البريد الإلكتروني") + '</label><input class="input" name="email" type="email" autocomplete="email" placeholder="name@email.com" required></div>' +
        '<div class="field"><label>' + t("كلمة المرور") + '</label><input class="input" name="password" type="password" autocomplete="new-password" placeholder="••••••••" required></div>' +
        '<div class="field"><label>' + t("تأكيد كلمة المرور") + '</label><input class="input" name="confirm" type="password" autocomplete="new-password" placeholder="••••••••" required></div>' +
        '<div class="form-error" id="authError" hidden></div>' +
        '<button class="btn block" type="submit">' + t("إنشاء حساب") + '</button>' +
        '<div class="auth-switch">' + t("لديك حساب بالفعل؟") + ' <button type="button" data-authmode="login">' + t("سجّل الدخول") + '</button></div>';
    } else {
      body = '<div class="field"><label>' + t("البريد الإلكتروني") + '</label><input class="input" name="email" type="email" autocomplete="email" placeholder="name@email.com" required></div>' +
        '<div class="field"><label>' + t("كلمة المرور") + '</label><input class="input" name="password" type="password" autocomplete="current-password" placeholder="••••••••" required></div>' +
        '<div class="form-error" id="authError" hidden></div>' +
        '<button class="btn block" type="submit">' + t("تسجيل الدخول") + '</button>' +
        '<div class="auth-switch">' + t("ليس لديك حساب؟") + ' <button type="button" data-authmode="register">' + t("أنشئ حساباً الآن") + '</button></div>';
    }
    $("#authMount").innerHTML =
      '<h1>' + (authMode === "register" ? t("أنشئ حسابك الخاص") : t("مرحباً بعودتك")) + '</h1>' +
      '<p class="sub">' + (authMode === "register" ? t("ابدأ مساحتك الشخصية") : t("أدخل بياناتك للمتابعة")) + '</p>' +
      '<div class="auth-tabs"><button type="button" class="' + (authMode === "login" ? "on" : "") + '" data-authmode="login">' + t("تسجيل الدخول") + '</button><button type="button" class="' + (authMode === "register" ? "on" : "") + '" data-authmode="register">' + t("إنشاء حساب") + '</button></div>' +
      '<form id="authForm" novalidate>' + body + '</form>';
    $("#authForm").addEventListener("submit", onAuthSubmit);
    $$("[data-authmode]", $("#authMount")).forEach(function (b) {
      b.addEventListener("click", function () { authMode = b.getAttribute("data-authmode"); renderAuth(); });
    });
  }

  async function onAuthSubmit(e) {
    e.preventDefault();
    var f = e.target;
    var data = {};
    Array.prototype.forEach.call(f.elements, function (el) { if (el.name) data[el.name] = el.value; });
    var btn = f.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = "…"; }
    try {
      if (authMode === "register") {
        var name = String(data.name || "").trim();
        var email = String(data.email || "").trim().toLowerCase();
        var pass = String(data.password || "");
        if (!name || !email || !pass || !data.confirm) throw new Error(t("أكمل جميع الحقول"));
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error(D && D.prefs.lang === "en" ? "Enter a valid email" : "أدخل بريداً إلكترونياً صالحاً");
        if (findUser(email)) throw new Error(t("هذا البريد مسجل مسبقاً"));
        if (pass.length < 4) throw new Error(t("كلمة المرور قصيرة"));
        if (pass !== data.confirm) throw new Error(t("كلمتا المرور غير متطابقتين"));
        var salt = uid();
        var hash = await hashText(salt, pass);
        var u = { id: uid(), name: name, email: email, salt: salt, hash: hash, createdAt: nowISO() };
        root.users.push(u);
        root.session = u.id;
        saveRoot();
        user = u;
        D = defaultData();
        D.prefs.theme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        saveData();
        enterApp();
        toast(t("تم إنشاء الحساب"));
      } else {
        var em = String(data.email || "").trim().toLowerCase();
        var pw = String(data.password || "");
        var found = findUser(em);
        if (!found) throw new Error(t("بيانات غير صحيحة"));
        var h = await hashText(found.salt, pw);
        if (h !== found.hash) throw new Error(t("بيانات غير صحيحة"));
        root.session = found.id;
        saveRoot();
        user = found;
        D = loadData(found.id);
        enterApp();
      }
    } catch (err) {
      authError(err.message || t("بيانات غير صحيحة"));
      if (btn) { btn.disabled = false; btn.textContent = authMode === "register" ? t("إنشاء حساب") : t("تسجيل الدخول"); }
    }
  }

  function enterApp() {
    document.getElementById("authScreen").hidden = true;
    document.getElementById("shell").hidden = false;
    applyPrefs();
    journalUnlocked = false;
    if (!D.prefs.onboarded) {
      D.prefs.onboarded = true;
      saveData();
    }
    var hashPage = (location.hash || "").replace(/^#\//, "");
    var start = PAGES[hashPage] ? hashPage : (PAGES[D.prefs.lastPage] ? D.prefs.lastPage : "home");
    currentPage = start;
    renderChrome();
    renderPage(currentPage);
    scheduleNotifications();
    setupAutoTimers();
  }

  function logout() {
    root.session = null;
    saveRoot();
    user = null;
    D = null;
    journalUnlocked = false;
    clearTimeout(queueSync._t);
    notifTimers.forEach(clearTimeout);
    notifTimers = [];
    document.getElementById("shell").hidden = true;
    showAuth();
  }

  function renderChrome() {
    if (!D) return;
    document.documentElement.setAttribute("data-accent", D.prefs.accent || "sage");
    $("#pageTitle").textContent = pageTitle(currentPage);
    $("#pageSub").textContent = pageSub(currentPage);
    $("#themeBtn").textContent = resolveTheme() === "dark" ? "☀️" : "🌙";
    $("#themeBtn").setAttribute("aria-label", resolveTheme() === "dark" ? t("الوضع النهاري") : t("الوضع الليلي"));
    var displayName = user.name || (D.prefs.lang === "en" ? "My space" : "مساحتي");
    var displaySub = user.email || (D.prefs.lang === "en" ? "On this device" : "على هذا الجهاز");
    var initials = String(displayName).trim().charAt(0) || "د";
    $("#avatarBtn").textContent = initials;
    $("#sideUser").innerHTML = '<div class="user-pill"><span class="avatar">' + esc(initials) + '</span><div><b>' + esc(displayName) + '</b><small>' + esc(displaySub) + '</small></div></div>';
    $("#drawerSub").textContent = displayName;
    $("#drawerFoot").innerHTML = '<p class="hint">🔒 ' + t("بياناتك محفوظة على جهازك فقط") + '</p>';
    $("#sideNav").innerHTML = navHTML(true);
    $("#drawerNav").innerHTML = navHTML(false);
    $("#bottomNav").innerHTML = BOTTOM.map(function (p) {
      return '<button class="' + (currentPage === p ? "active" : "") + '" data-nav="' + p + '"><span class="em">' + PAGES[p].em + '</span><small>' + pageTitle(p) + '</small></button>';
    }).join("") + '<button data-action="open-drawer"><span class="em">☰</span><small>' + (D.prefs.lang === "en" ? "More" : "المزيد") + '</small></button>';
  }

  function navHTML(grouped) {
    var out = "";
    NAV_GROUPS.forEach(function (g) {
      if (grouped) out += '<div class="nav-sep">' + (D.prefs.lang === "en" ? g.en : g.ar) + '</div>';
      g.items.forEach(function (p) {
        out += '<a href="#/' + p + '" data-nav="' + p + '" class="' + (currentPage === p ? "active" : "") + '"><span class="em">' + PAGES[p].em + '</span><span>' + pageTitle(p) + '</span></a>';
      });
    });
    return out;
  }

  function openDrawer() {
    var d = $("#drawer"), o = $("#overlay");
    d.hidden = false; o.hidden = false;
    requestAnimationFrame(function () { d.classList.add("open"); });
  }
  function closeDrawer() {
    var d = $("#drawer"), o = $("#overlay");
    if (!d || d.hidden) return;
    d.classList.remove("open");
    o.hidden = true;
    setTimeout(function () { d.hidden = true; }, 300);
  }

  function navigate(page, replace) {
    if (!PAGES[page]) page = "home";
    if (currentPage === page) {
      closeDrawer();
      renderPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    currentPage = page;
    D.prefs.lastPage = page;
    saveData();
    if (location.hash !== "#/" + page) {
      if (replace) history.replaceState(null, "", "#/" + page);
      else location.hash = "#/" + page;
    }
    closeDrawer();
    renderChrome();
    renderPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderPage(page) {
    applyPrefs();
    $$(".page").forEach(function (s) { s.hidden = s.getAttribute("data-page") !== page; });
    var fn = {
      home: renderHome, tasks: renderTasks, calendar: renderCalendar, journal: renderJournal,
      goals: renderGoals, habits: renderHabits, lists: renderLists, notes: renderNotes,
      money: renderMoney, review: renderReview, reminders: renderReminders, settings: renderSettings
    }[page];
    if (fn) fn();
  }

  function refresh() {
    saveData();
    if (D) renderPage(currentPage);
    scheduleNotifications();
  }

  function emptyState(em, title, sub, action) {
    return '<div class="empty"><span class="em">' + em + '</span><b>' + esc(title) + '</b><p>' + esc(sub || "") + '</p>' +
      (action ? '<div style="margin-top:14px">' + action + '</div>' : "") + '</div>';
  }

  function progressBar(pct, cls) {
    return '<div class="progress ' + (cls || "") + '"><i style="width:' + clamp(pct, 0, 100) + '%"></i></div>';
  }

  function pageHead(title, sub, actions) {
    return '<div class="section-title"><div><h2>' + esc(title) + '</h2>' + (sub ? '<div class="sub">' + esc(sub) + '</div>' : '') + '</div><div class="row">' + (actions || "") + '</div></div>';
  }

  function addBtn(label, action, icon) {
    return '<button class="btn" data-action="' + action + '">' + (icon || "＋") + ' ' + esc(label) + '</button>';
  }

  function goBtn(label, page, icon) {
    return '<button class="btn ghost sm" data-nav="' + page + '">' + (icon || "") + ' ' + esc(label) + '</button>';
  }

  function taskDoneOn(task) {
    if (!task.done) return "";
    var k = task.doneAt ? isoToKey(task.doneAt) : "";
    return k || task.date;
  }

  function taskItemsForRange(view) {
    var today = new Date();
    var from, to;
    if (view === "today") { from = todayKey(); to = todayKey(); }
    else if (view === "week") { from = dateKey(startOfWeek(today)); to = dateKey(endOfWeek(today)); }
    else if (view === "month") { from = dateKey(startOfMonth(today)); to = dateKey(endOfMonth(today)); }
    else { from = "0000-01-01"; to = "9999-12-31"; }
    return { from: from, to: to };
  }

  function tasksMatching(from, to) {
    return D.tasks.filter(function (t) {
      var inRange = t.date >= from && t.date <= to;
      var matchesSearch = !taskSearch || (t.title + " " + (t.desc || "") + " " + catLabel(t.category)).toLowerCase().indexOf(taskSearch.toLowerCase()) !== -1;
      var matchesPriority = taskPriority === "all" || t.priority === taskPriority;
      var matchesStatus = taskStatus === "all" || (taskStatus === "done" ? t.done : !t.done);
      return inRange && matchesSearch && matchesPriority && matchesStatus;
    }).sort(function (a, b) {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      return (a.time || "99:99").localeCompare(b.time || "99:99");
    });
  }

  function overdueTasks() {
    return D.tasks.filter(function (t) { return !t.done && t.date < todayKey(); }).sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
  }

  function taskMarkup(task) {
    var overdue = !task.done && task.date < todayKey();
    var cat = CATS[task.category] || CATS.other;
    var pr = PRIORITIES[task.priority] || PRIORITIES.med;
    return '<article class="task ' + (task.done ? "done" : "") + (overdue ? " overdue" : "") + (task.repeat && task.repeat !== "none" ? " repeat" : "") + '">' +
      '<button class="task-check ' + (task.done ? "on" : "") + '" data-action="toggle-task" data-id="' + esc(task.id) + '" aria-label="' + t("مكتملة") + '">' + (task.done ? "✓" : "") + '</button>' +
      '<div class="task-body">' +
      '<div class="t-title">' + esc(task.title) + '</div>' +
      (task.desc ? '<div class="t-desc">' + esc(task.desc) + '</div>' : '') +
      '<div class="t-meta">' +
      '<span class="pill ' + pr.cls + '">' + prioLabel(task.priority) + '</span>' +
      '<span class="pill">📅 ' + fmtShort(task.date) + (task.time ? " · " + time12(task.time) : "") + '</span>' +
      '<span class="pill">' + cat.em + ' ' + catLabel(task.category) + '</span>' +
      (task.repeat && task.repeat !== "none" ? '<span class="pill accent">↻ ' + repeatLabel(task.repeat) + '</span>' : '') +
      (overdue ? '<span class="pill high">' + t("متأخرة") + '</span>' : '') +
      '</div></div>' +
      '<div class="t-actions">' +
      '<button class="icon-action" data-action="edit-task" data-id="' + esc(task.id) + '" aria-label="' + t("تعديل") + '">✎</button>' +
      '<button class="icon-action" data-action="postpone-task" data-id="' + esc(task.id) + '" aria-label="' + t("تأجيل") + '">⏭</button>' +
      '<button class="icon-action danger" data-action="delete-task" data-id="' + esc(task.id) + '" aria-label="' + t("حذف") + '">🗑</button>' +
      '</div></article>';
  }

  function eventItemsFor(k) {
    return D.events.filter(function (e) { return e.date === k; }).sort(function (a, b) { return (a.time || "99:99").localeCompare(b.time || "99:99"); });
  }

  function reminderItemsFor(k) {
    var out = [];
    D.tasks.filter(function (t) { return t.date === k && !t.done; }).forEach(function (t) {
      out.push({ type: "task", em: "✅", title: t.title, time: t.time, sub: catLabel(t.category), id: t.id });
    });
    eventItemsFor(k).forEach(function (e) {
      out.push({ type: "event", em: e.important ? "⭐" : "📅", title: e.title, time: e.time, sub: e.important ? t("مناسبة مهمة") : t("حدث شخصي"), id: e.id });
    });
    D.habits.forEach(function (h) {
      if (!(D.habitLogs[h.id] || {})[k]) out.push({ type: "habit", em: h.icon || "🌱", title: h.name, time: "", sub: t("عادة لم تُسجل"), id: h.id });
    });
    D.goals.filter(function (g) { return g.status === "active" && g.deadline; }).forEach(function (g) {
      if (g.deadline === k) out.push({ type: "goal", em: "🎯", title: g.title, time: "", sub: t("هدف يقترب موعده"), id: g.id });
    });
    return out.sort(function (a, b) { return (a.time || "99:99").localeCompare(b.time || "99:99"); });
  }

  function renderHome() {
    var today = todayKey();
    var now = new Date();
    var name = user && user.name ? user.name.split(" ")[0] : "";
    var greet = now.getHours() < 12 ? t("صباح الخير") : t("مساء الخير");
    var hello = name ? greet + "، " + esc(name) : greet;
    var todays = D.tasks.filter(function (x) { return x.date === today; });
    var done = todays.filter(function (x) { return x.done; }).length;
    var pct = todays.length ? Math.round(done / todays.length * 100) : 0;
    var upcoming = D.tasks.filter(function (x) { return !x.done && x.date > today; }).sort(function (a, b) { return (a.date + (a.time || "")) .localeCompare(b.date + (b.time || "")); }).slice(0, 5);
    var activeGoals = D.goals.filter(function (g) { return g.status === "active"; });
    var reminders = reminderItemsFor(today);
    var latest = D.journal.slice().sort(function (a, b) { return (b.createdAt || "").localeCompare(a.createdAt || ""); })[0];
    var weekStart = dateKey(startOfWeek(now)), weekEnd = dateKey(endOfWeek(now));
    var weekDone = D.tasks.filter(function (x) { var k = taskDoneOn(x); return k >= weekStart && k <= weekEnd; }).length;
    var monthStart = dateKey(startOfMonth(now)), monthEnd = dateKey(endOfMonth(now));
    var monthDone = D.tasks.filter(function (x) { var k = taskDoneOn(x); return k >= monthStart && k <= monthEnd; }).length;
    var monthJournals = D.journal.filter(function (j) { return j.date >= monthStart && j.date <= monthEnd; }).length;
    var todayHabitsDone = D.habits.filter(function (h) { return isHabitDone(h, today); }).length;
    var quotePool = D.prefs.lang === "en" ? QUOTES_EN : QUOTES;
    var quote = quotePool[Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000) % quotePool.length];

    var todayTasksMarkup = todays.length ? todays.slice(0, 5).map(taskMarkup).join("") : emptyState("🌿", t("لا توجد مهام اليوم"), t("أضف مهمة لتبدأ يومك"), '<button class="btn sm" data-action="open-task">＋ ' + t("إضافة مهمة") + '</button>');
    var upcomingMarkup = upcoming.length ? upcoming.map(function (x) {
      return '<div class="reminder-row"><span class="em">📌</span><div style="flex:1"><b>' + esc(x.title) + '</b><small>' + fmtShort(x.date) + (x.time ? " · " + time12(x.time) : "") + " · " + t("مهمة") + '</small></div><span class="pill">' + prioLabel(x.priority) + '</span></div>';
    }).join("") : emptyState("🍃", t("لا توجد مهام قادمة"), t("كل شيء تحت السيطرة"));
    var goalsMarkup = activeGoals.length ? activeGoals.slice(0, 4).map(function (g) {
      var p = goalProgress(g);
      return '<div class="mini-goal"><span class="g-ic">' + (GOAL_CATS[g.category] || GOAL_CATS.other).em + '</span><div class="g-body"><b>' + esc(g.title) + '</b><small>' + p + '% · ' + (g.deadline ? fmtShort(g.deadline) : t("بدون موعد")) + '</small>' + progressBar(p) + '</div></div>';
    }).join("") : emptyState("🎯", t("لا توجد أهداف نشطة"), t("ابدأ بهدف واحد صغير"), '<button class="btn sm" data-action="open-goal">＋ ' + t("هدف جديد") + '</button>');
    var remindersMarkup = reminders.length ? reminders.slice(0, 6).map(function (r) {
      return '<div class="reminder-row"><span class="em">' + r.em + '</span><div style="flex:1"><b>' + esc(r.title) + '</b><small>' + esc(r.sub) + (r.time ? " · " + time12(r.time) : "") + '</small></div></div>';
    }).join("") : emptyState("🌙", t("لا توجد تذكيرات"), t("يومك هادئ"));
    var journalMarkup;
    if (D.prefs.journalLock.enabled && !journalUnlocked) {
      journalMarkup = emptyState("🔒", t("اليوميات مقفلة"), t("افتح القفل لعرض آخر كتاباتك"), '<button class="btn sm" data-nav="journal">' + t("فتح") + '</button>');
    } else if (latest) {
      journalMarkup = '<div class="latest-journal"><div class="row between" style="margin-bottom:5px"><b>' + esc(latest.title || t("بدون عنوان")) + '</b><span class="journal-mood" style="width:28px;height:28px;font-size:15px">' + moodOf(latest.mood).em + '</span></div>' +
        '<p>' + esc(latest.body || "") + '</p><div class="row between" style="margin-top:9px"><small class="muted">' + fmtFull(latest.date) + '</small><button class="link-btn" data-action="edit-journal" data-id="' + esc(latest.id) + '">' + t("تعديل") + ' ↗</button></div></div>';
    } else {
      journalMarkup = emptyState("📔", t("لا توجد يوميات"), t("اكتب أول صفحة من يومك"), '<button class="btn sm" data-action="open-journal">＋ ' + t("يومية جديدة") + '</button>');
    }

    var weekBars = "";
    for (var i = 6; i >= 0; i--) {
      var d = addDays(now, -i), k = dateKey(d);
      var n = D.tasks.filter(function (x) { return taskDoneOn(x) === k; }).length;
      var max = Math.max(1, weekDone);
      weekBars += '<div class="weekbar' + (k === today ? " today" : "") + '"><i class="' + (n ? "hot" : "") + '" style="height:' + (n ? Math.max(8, n / max * 100) : 5) + '%"></i><span>' + weekdayShort(d) + '</span></div>';
    }

    $("#page-home").innerHTML =
      '<div class="hero"><div class="hero-in"><div class="hero-copy">' +
      '<div class="hero-greet">' + hello + ' 👋</div>' +
      '<h1>' + (todays.length === 0 ? t("يومك هادئ") : pct === 100 ? (D.prefs.lang === "en" ? "You did it all today ✨" : "أنجزت كل شيء اليوم ✨") : (D.prefs.lang === "en" ? "A little progress is enough" : "خطوة صغيرة تكفي")) + '</h1>' +
      '<div class="hero-date"><span>📅 ' + fmtFull(today) + '</span><span>·</span><span>' + weekdayLong(now) + '</span></div>' +
      '<div class="hero-quote">“' + esc(quote) + '”<small>' + t("اقتباس اليوم") + '</small></div>' +
      '</div><div class="ring-wrap"><div class="ring" style="--p:' + pct + '"><div class="ring-in"><b>' + pct + '%</b><small>' + t("نسبة إنجاز اليوم") + '</small></div></div><div class="ring-cap">' + done + " " + t("من إجمالي") + " " + todays.length + '</div></div></div></div>' +

      '<div class="stats">' +
      '<div class="stat"><span class="em">✅</span><b>' + done + '/' + todays.length + '</b><small>' + t("مهام اليوم") + '</small></div>' +
      '<div class="stat"><span class="em">🌱</span><b>' + todayHabitsDone + '/' + D.habits.length + '</b><small>' + t("عادات اليوم") + '</small></div>' +
      '<div class="stat"><span class="em">🎯</span><b>' + activeGoals.length + '</b><small>' + t("الأهداف الحالية") + '</small></div>' +
      '<div class="stat"><span class="em">📔</span><b>' + monthJournals + '</b><small>' + t("اليوميات المكتوبة") + '</small></div>' +
      '</div>' +

      '<div class="home-cols"><div class="home-col">' +
      '<div class="card"><div class="card-head"><h3>✅ ' + t("مهام اليوم") + '</h3><button class="link-btn" data-nav="tasks">' + t("عرض الكل") + ' ←</button></div><div class="task-list">' + todayTasksMarkup + '</div></div>' +
      '<div class="card"><div class="card-head"><h3>📌 ' + t("المهام القادمة") + '</h3></div>' + upcomingMarkup + '</div>' +
      '<div class="card"><div class="card-head"><h3>📈 ' + t("ملخص الأسبوع") + '</h3><span class="muted small">' + weekDone + ' ' + t("مهمة منجزة") + '</span></div><div class="weekbars">' + weekBars + '</div>' +
      '<div class="row between" style="margin-top:12px"><span class="muted small">' + t("هذا الشهر") + ' · ' + monthDone + ' ' + t("مهمة منجزة") + '</span><button class="link-btn" data-nav="review">' + t("مراجعة التقدم") + ' ←</button></div></div>' +
      '</div><div class="home-col">' +
      '<div class="card"><div class="card-head"><h3>🎯 ' + t("الأهداف الحالية") + '</h3><button class="link-btn" data-nav="goals">' + t("عرض الكل") + ' ←</button></div>' + goalsMarkup + '</div>' +
      '<div class="card"><div class="card-head"><h3>🔔 ' + t("تذكيرات اليوم") + '</h3><button class="link-btn" data-nav="reminders">' + t("عرض الكل") + ' ←</button></div>' + remindersMarkup + '</div>' +
      '<div class="card"><div class="card-head"><h3>📔 ' + t("آخر ما كتبته") + '</h3><button class="link-btn" data-nav="journal">' + t("عرض الكل") + ' ←</button></div>' + journalMarkup + '</div>' +
      '</div></div>';
  }
  function renderTasks() {
    var counts = {
      open: D.tasks.filter(function (x) { return !x.done; }).length,
      done: D.tasks.filter(function (x) { return x.done; }).length,
      overdue: overdueTasks().length
    };
    $("#page-tasks").innerHTML =
      '<form class="quick-add" data-form="quick-task"><input class="input" name="title" placeholder="' + t("اكتب مهمة ثم اضغط Enter") + '" maxlength="180" autocomplete="off"><button class="btn" type="submit">＋ ' + t("إضافة") + '</button></form>' +
      '<div class="task-counts"><span class="count-chip">' + t("مفتوحة") + ' <b>' + counts.open + '</b></span><span class="count-chip">' + t("متأخرة") + ' <b>' + counts.overdue + '</b></span><span class="count-chip">' + t("مكتملة") + ' <b>' + counts.done + '</b></span></div>' +
      '<div class="tabs">' + [["today", t("اليوم")], ["week", t("الأسبوع")], ["month", t("الشهر")], ["all", t("الكل")]].map(function (v) {
        return '<button class="tab ' + (taskView === v[0] ? "active" : "") + '" data-action="task-view" data-view="' + v[0] + '">' + v[1] + '</button>';
      }).join("") + '</div>' +
      '<div class="toolbar"><input class="input" id="taskSearch" data-filter="taskSearch" value="' + esc(taskSearch) + '" placeholder="' + t("بحث") + '">' +
      '<select class="select" data-filter="taskPriority"><option value="all">' + t("حسب الأولوية") + '</option>' + Object.keys(PRIORITIES).map(function (p) { return '<option value="' + p + '"' + (taskPriority === p ? " selected" : "") + '>' + prioLabel(p) + '</option>'; }).join("") + '</select>' +
      '<select class="select" data-filter="taskStatus"><option value="open"' + (taskStatus === "open" ? " selected" : "") + '>' + t("مفتوحة") + '</option><option value="done"' + (taskStatus === "done" ? " selected" : "") + '>' + t("مكتملة") + '</option><option value="all"' + (taskStatus === "all" ? " selected" : "") + '>' + t("الكل") + '</option></select>' +
      '<button class="btn" data-action="open-task">＋ ' + t("إضافة مهمة") + '</button></div>' +
      '<div id="tasksBody"></div>';
    renderTaskBody();
  }

  function renderTaskBody() {
    var body = $("#tasksBody");
    if (!body) return;
    var range = taskItemsForRange(taskView);
    var list = tasksMatching(range.from, range.to);
    var overdue = taskStatus === "done" ? [] : overdueTasks().filter(function (t) {
      return (!taskSearch || (t.title + " " + (t.desc || "")).toLowerCase().indexOf(taskSearch.toLowerCase()) !== -1) &&
        (taskPriority === "all" || t.priority === taskPriority);
    });
    var html = "";
    if (overdue.length && taskView !== "all") {
      html += '<div class="task-group-title overdue">⚠️ ' + t("متأخرة") + ' <span class="pill high">' + overdue.length + '</span></div><div class="task-list">' + overdue.map(taskMarkup).join("") + '</div>';
    }
    var groups = {};
    list.forEach(function (t) { (groups[t.date] = groups[t.date] || []).push(t); });
    var dates = Object.keys(groups).sort();
    if (!dates.length && !overdue.length) {
      html += emptyState("🍃", t("لا توجد مهام مطابقة"), t("جرّب تغيير البحث أو الفلتر"), '<button class="btn sm" data-action="open-task">＋ ' + t("إضافة مهمة") + '</button>');
    } else {
      dates.forEach(function (k) {
        var label = k === todayKey() ? t("اليوم") : k === dateKey(addDays(new Date(), 1)) ? t("غداً") : fmtFull(k);
        html += '<div class="task-group-title">' + esc(label) + ' <span class="tiny">' + groups[k].length + '</span></div><div class="task-list">' + groups[k].map(taskMarkup).join("") + '</div>';
      });
    }
    body.innerHTML = html;
  }

  function openTaskModal(id) {
    var task = id ? D.tasks.filter(function (x) { return x.id === id; })[0] : null;
    var isEdit = !!task;
    task = task || { id: "", title: "", desc: "", date: todayKey(), time: "", priority: "med", category: "personal", repeat: "none" };
    var body = '<div class="field"><label>' + t("اسم المهمة") + '</label><input class="input" name="title" maxlength="200" required value="' + esc(task.title) + '" placeholder="' + t("مثال") + ': ' + (D.prefs.lang === "en" ? "Call the doctor" : "الاتصال بالطبيب") + '"></div>' +
      '<div class="field"><label>' + t("وصف مختصر") + '</label><textarea class="textarea" name="desc" rows="2" maxlength="600" placeholder="' + t("اختياري") + '">' + esc(task.desc || "") + '</textarea></div>' +
      '<div class="form-row"><div class="field"><label>' + t("التاريخ") + '</label><input class="input" type="date" name="date" value="' + esc(task.date) + '" required></div>' +
      '<div class="field"><label>' + t("الوقت") + '</label><input class="input" type="time" name="time" value="' + esc(task.time || "") + '"></div></div>' +
      '<div class="form-row"><div class="field"><label>' + t("الأولوية") + '</label><select class="select" name="priority">' + Object.keys(PRIORITIES).map(function (p) { return '<option value="' + p + '"' + (task.priority === p ? " selected" : "") + '>' + prioLabel(p) + '</option>'; }).join("") + '</select></div>' +
      '<div class="field"><label>' + t("التصنيف") + '</label><select class="select" name="category">' + Object.keys(CATS).map(function (c) { return '<option value="' + c + '"' + (task.category === c ? " selected" : "") + '>' + (CATS[c].em + " " + catLabel(c)) + '</option>'; }).join("") + '</select></div></div>' +
      '<div class="field"><label>' + t("التكرار") + '</label><select class="select" name="repeat">' + Object.keys(REPEATS).map(function (r) { return '<option value="' + r + '"' + (task.repeat === r ? " selected" : "") + '>' + repeatLabel(r) + '</option>'; }).join("") + '</select><div class="hint">' + (D.prefs.lang === "en" ? "When completed, the next occurrence is created automatically." : "عند إكمال المهمة يُنشأ الموعد التالي تلقائياً.") + '</div></div>';
    openModal({
      title: isEdit ? t("تعديل المهمة") : t("مهمة جديدة"),
      body: body,
      submitText: isEdit ? t("حفظ") : t("إضافة مهمة"),
      onSubmit: function (data) {
        var title = String(data.title || "").trim();
        if (!title) return false;
        var item = isEdit ? task : { id: uid(), done: false, doneAt: null, createdAt: nowISO() };
        item.title = title;
        item.desc = String(data.desc || "").trim();
        item.date = data.date || todayKey();
        item.time = data.time || "";
        item.priority = data.priority || "med";
        item.category = data.category || "other";
        item.repeat = data.repeat || "none";
        item.updatedAt = nowISO();
        if (!isEdit) D.tasks.push(item);
        refresh();
        toast(isEdit ? t("تم حفظ التعديلات") : t("تمت إضافة المهمة"));
        return true;
      }
    });
  }

  function toggleTask(id) {
    var task = D.tasks.filter(function (x) { return x.id === id; })[0];
    if (!task) return;
    if (!task.done) {
      task.done = true;
      task.doneAt = nowISO();
      if (task.repeat && task.repeat !== "none") {
        var nextDate = nextRepeatDate(task.date, task.repeat);
        var exists = D.tasks.some(function (x) { return x.sourceId === (task.sourceId || task.id) && x.date === nextDate && !x.done; });
        if (!exists) {
          var clone = Object.assign({}, task, {
            id: uid(), done: false, doneAt: null, date: nextDate, createdAt: nowISO(), updatedAt: nowISO(),
            sourceId: task.sourceId || task.id, nextId: ""
          });
          D.tasks.push(clone);
          task.nextId = clone.id;
        }
      }
      haptic(18);
    } else {
      task.done = false;
      task.doneAt = null;
      if (task.nextId) {
        var nid = task.nextId;
        var clone2 = D.tasks.filter(function (x) { return x.id === nid; })[0];
        if (clone2 && !clone2.done) D.tasks = D.tasks.filter(function (x) { return x.id !== nid; });
        task.nextId = "";
      }
    }
    refresh();
  }

  function nextRepeatDate(k, repeat) {
    var d = parseKey(k);
    if (repeat === "daily") return dateKey(addDays(d, 1));
    if (repeat === "weekly") return dateKey(addDays(d, 7));
    if (repeat === "monthly") {
      var day = d.getDate();
      var next = addMonths(d, 1);
      if (next.getDate() !== day) next = new Date(next.getFullYear(), next.getMonth(), 0);
      return dateKey(next);
    }
    return k;
  }

  function deleteTask(id) {
    openConfirm(t("هل تحذف هذه المهمة؟"), t("سيتم حذفها نهائياً."), function () {
      D.tasks = D.tasks.filter(function (x) { return x.id !== id; });
      refresh();
      toast(t("تم حذف المهمة"));
    }, t("حذف"));
  }

  function postponeTask(id) {
    var task = D.tasks.filter(function (x) { return x.id === id; })[0];
    if (!task) return;
    task.date = dateKey(addDays(parseKey(task.date), 1));
    task.updatedAt = nowISO();
    refresh();
    toast(t("تم التأجيل ليوم"));
  }

  function renderCalendar() {
    var body = "";
    if (calView === "month") {
      var y = calCursor.getFullYear(), m = calCursor.getMonth();
      var first = new Date(y, m, 1), total = daysInMonth(y, m), offset = dayIndex(first);
      var cells = "";
      for (var i = 0; i < offset; i++) cells += '<div class="cal-day out"></div>';
      for (var d = 1; d <= total; d++) {
        var k = y + "-" + pad(m + 1) + "-" + pad(d);
        var tasks = D.tasks.filter(function (x) { return x.date === k; });
        var events = eventItemsFor(k);
        var dots = "";
        events.slice(0, 3).forEach(function (e) { dots += '<i class="dot ' + (e.important ? "imp" : "event") + '"></i>'; });
        tasks.slice(0, Math.max(0, 4 - events.length)).forEach(function (x) { dots += '<i class="dot ' + (x.done ? "done" : "") + '"></i>'; });
        var extra = tasks.length + events.length;
        cells += '<button class="cal-day' + (k === todayKey() ? " today" : "") + (k === calSel ? " sel" : "") + '" data-action="cal-select" data-date="' + k + '"><span class="num">' + d + '</span><span class="dots">' + dots + '</span>' + (extra > 4 ? '<span class="num-badge">+' + (extra - 4) + '</span>' : '') + '</button>';
      }
      body = '<div class="card"><div class="cal-bar"><button class="icon-btn" data-action="cal-prev" aria-label="' + t("الشهر السابق") + '">‹</button><b class="cal-title">' + fmtMonth(calCursor) + '</b><button class="icon-btn" data-action="cal-next" aria-label="' + t("الشهر التالي") + '">›</button></div>' +
        '<div class="cal-grid">' + [0, 1, 2, 3, 4, 5, 6].map(function (i) { return '<div class="cal-dow">' + weekdayShort(addDays(startOfWeek(new Date()), i)) + '</div>'; }).join("") + cells + '</div>' +
        '<div class="cal-legend"><span><i class="legend-dot" style="background:var(--accent)"></i>' + t("مهمة") + '</span><span><i class="legend-dot" style="background:var(--gold)"></i>' + t("حدث") + '</span><span><i class="legend-dot" style="background:var(--danger)"></i>' + t("مناسبة مهمة") + '</span></div></div>' +
        agendaMarkup(calSel);
    } else if (calView === "week") {
      var ws = startOfWeek(calCursor);
      var cols = "";
      for (var j = 0; j < 7; j++) {
        var wd = addDays(ws, j), wk = dateKey(wd);
        var witems = reminderItemsFor(wk).slice(0, 4);
        cols += '<div class="week-col' + (wk === todayKey() ? " today" : "") + (wk === calSel ? " sel" : "") + '" data-action="cal-select" data-date="' + wk + '"><h4>' + weekdayShort(wd) + '</h4><span class="wd">' + wd.getDate() + '</span>' +
          witems.map(function (r) { return '<div class="wi ' + (r.type === "event" ? "ev" : "tsk") + '">' + esc(r.title) + '</div>'; }).join("") +
          (reminderItemsFor(wk).length > 4 ? '<div class="more">+' + (reminderItemsFor(wk).length - 4) + '</div>' : '') + '</div>';
      }
      body = '<div class="card"><div class="cal-bar"><button class="icon-btn" data-action="cal-prev">‹</button><b class="cal-title">' + fmtShort(dateKey(ws)) + ' — ' + fmtShort(dateKey(endOfWeek(calCursor))) + '</b><button class="icon-btn" data-action="cal-next">›</button></div><div class="week-grid">' + cols + '</div></div>' + agendaMarkup(calSel);
    } else {
      body = '<div class="card"><div class="cal-bar"><button class="icon-btn" data-action="cal-prev">‹</button><b class="cal-title">' + fmtFull(calSel) + '</b><button class="icon-btn" data-action="cal-next">›</button></div>' + agendaHtml(calSel) + '</div>';
    }
    $("#page-calendar").innerHTML =
      '<div class="row between" style="margin-bottom:14px"><div class="seg">' + [["month", t("شهري")], ["week", t("أسبوعي")], ["day", t("يومي")]].map(function (v) { return '<button class="' + (calView === v[0] ? "on" : "") + '" data-action="cal-view" data-view="' + v[0] + '">' + v[1] + '</button>'; }).join("") + '</div><div class="row"><button class="btn ghost sm" data-action="cal-today">' + t("اليوم") + '</button><button class="btn" data-action="open-event">＋ ' + t("إضافة حدث") + '</button></div></div>' + body;
  }

  function agendaMarkup(k) {
    return '<div class="card"><div class="card-head"><h3>📅 ' + t("المهام والمواعيد") + '</h3><button class="link-btn" data-action="open-event">＋ ' + t("إضافة حدث") + '</button></div>' + agendaHtml(k) + '</div>';
  }

  function agendaHtml(k) {
    var tasks = D.tasks.filter(function (x) { return x.date === k; }).sort(function (a, b) { return (a.time || "99:99").localeCompare(b.time || "99:99"); });
    var events = eventItemsFor(k);
    var items = tasks.map(function (x) { return { type: "task", time: x.time, data: x }; }).concat(events.map(function (x) { return { type: "event", time: x.time, data: x }; }));
    items.sort(function (a, b) { return (a.time || "99:99").localeCompare(b.time || "99:99"); });
    if (!items.length) return emptyState("🍃", t("لا توجد مواعيد"), t("أضف حدثاً أو مناسبة"), '<button class="btn sm" data-action="open-event">＋ ' + t("إضافة حدث") + '</button>');
    return '<div class="agenda-day"><div><b>' + fmtFull(k) + '</b><br><small>' + weekdayLong(parseKey(k)) + '</small></div><div class="row"><span class="pill accent">' + tasks.length + ' ' + t("مهمة") + '</span><span class="pill">' + events.length + ' ' + t("موعد") + '</span></div></div>' +
      items.map(function (it) {
        if (it.type === "task") {
          var x = it.data;
          return '<div class="agenda-item ' + (x.done ? "task-done" : "") + '"><span class="a-time">' + (x.time ? time12(x.time) : t("اليوم")) + '</span><div class="a-body"><b>' + esc(x.title) + '</b><small>' + catLabel(x.category) + ' · ' + prioLabel(x.priority) + '</small></div><button class="task-check ' + (x.done ? "on" : "") + '" data-action="toggle-task" data-id="' + esc(x.id) + '">' + (x.done ? "✓" : "") + '</button></div>';
        }
        var e = it.data;
        return '<div class="agenda-item"><span class="a-time">' + (e.time ? time12(e.time) : t("اليوم")) + '</span><div class="a-body"><b>' + (e.important ? "⭐ " : "") + esc(e.title) + '</b><small>' + (e.desc ? esc(e.desc) + ' · ' : '') + (e.important ? t("مناسبة مهمة") : t("حدث شخصي")) + '</small></div><div class="row"><button class="icon-action" data-action="edit-event" data-id="' + esc(e.id) + '">✎</button><button class="icon-action danger" data-action="delete-event" data-id="' + esc(e.id) + '">🗑</button></div></div>';
      }).join("");
  }

  function openEventModal(id) {
    var ev = id ? D.events.filter(function (x) { return x.id === id; })[0] : null;
    var isEdit = !!ev;
    ev = ev || { id: "", title: "", desc: "", date: calSel || todayKey(), time: "", type: "event", important: false, remind: 10 };
    var body = '<div class="field"><label>' + t("اسم الحدث") + '</label><input class="input" name="title" maxlength="200" required value="' + esc(ev.title) + '"></div>' +
      '<div class="field"><label>' + t("التفاصيل") + '</label><textarea class="textarea" name="desc" rows="2" maxlength="500">' + esc(ev.desc || "") + '</textarea></div>' +
      '<div class="form-row"><div class="field"><label>' + t("التاريخ") + '</label><input class="input" type="date" name="date" value="' + esc(ev.date) + '" required></div><div class="field"><label>' + t("الوقت") + '</label><input class="input" type="time" name="time" value="' + esc(ev.time || "") + '"></div></div>' +
      '<div class="form-row"><div class="field"><label>' + t("النوع") + '</label><select class="select" name="type"><option value="event"' + (ev.type === "event" ? " selected" : "") + '>' + t("حدث شخصي") + '</option><option value="occasion"' + (ev.type === "occasion" ? " selected" : "") + '>' + t("مناسبة مهمة") + '</option></select></div>' +
      '<div class="field"><label>' + t("تذكير قبل") + '</label><select class="select" name="remind">' + [0, 5, 10, 30, 60, 1440].map(function (m) { return '<option value="' + m + '"' + (+ev.remind === m ? " selected" : "") + '>' + (m ? m + " " + t("دقيقة") : t("بدون تذكير")) + '</option>'; }).join("") + '</select></div></div>' +
      '<label class="row" style="gap:8px;font-size:12.5px;font-weight:800"><input type="checkbox" name="important"' + (ev.important ? " checked" : "") + '> ' + t("حدث مهم") + '</label>';
    openModal({
      title: isEdit ? t("تعديل الحدث") : t("حدث جديد"),
      body: body,
      submitText: isEdit ? t("حفظ") : t("إضافة حدث"),
      onSubmit: function (data, form) {
        var title = String(data.title || "").trim();
        if (!title) return false;
        var item = isEdit ? ev : { id: uid(), createdAt: nowISO() };
        item.title = title;
        item.desc = String(data.desc || "").trim();
        item.date = data.date || todayKey();
        item.time = data.time || "";
        item.type = data.type || "event";
        item.important = !!(form.elements.important && form.elements.important.checked) || item.type === "occasion";
        item.remind = safeInt(data.remind, 10);
        item.updatedAt = nowISO();
        if (!isEdit) D.events.push(item);
        calSel = item.date;
        calCursor = parseKey(item.date);
        refresh();
        toast(isEdit ? t("تم حفظ التعديلات") : t("تمت إضافة الحدث"));
        return true;
      }
    });
  }

  function deleteEvent(id) {
    openConfirm(t("هل تحذف هذا الحدث؟"), t("سيتم حذفه نهائياً."), function () {
      D.events = D.events.filter(function (x) { return x.id !== id; });
      refresh();
      toast(t("تم حذف الحدث"));
    }, t("حذف"));
  }

  function renderJournal() {
    if (D.prefs.journalLock.enabled && !journalUnlocked) {
      $("#page-journal").innerHTML = '<div class="card lock-screen"><div class="lock-em">🔒</div><h2>' + t("اليوميات مقفلة بكلمة مرور") + '</h2><p>' + t("أدخل كلمة المرور للوصول") + '</p>' +
        '<div class="field"><input class="input" id="journalPin" type="password" inputmode="numeric" placeholder="' + t("كلمة المرور") + '" autocomplete="off"></div>' +
        '<button class="btn block" data-action="journal-unlock">' + t("فتح") + '</button></div>';
      return;
    }
    var entries = D.journal.slice().sort(function (a, b) {
      return (b.date + (b.time || "") + (b.createdAt || "")).localeCompare(a.date + (a.time || "") + (a.createdAt || ""));
    });
    if (journalQuery) entries = entries.filter(function (j) { return (j.title + " " + j.body).toLowerCase().indexOf(journalQuery.toLowerCase()) !== -1; });
    if (journalMood !== "all") entries = entries.filter(function (j) { return j.mood === journalMood; });
    var memories = D.journal.filter(function (j) {
      var d = parseKey(j.date);
      var n = new Date();
      return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() < n.getFullYear();
    }).sort(function (a, b) { return b.date.localeCompare(a.date); });
    var memoriesHtml = memories.length ? '<div class="card memories"><div class="card-head"><h3>✨ ' + t("ذكريات اليوم") + '</h3><span class="muted small">' + t("من سنوات سابقة") + '</span></div>' +
      memories.slice(0, 5).map(function (j) { return '<div class="mem-item"><b>' + esc(j.title || t("بدون عنوان")) + '</b><small>' + fmtFull(j.date) + ' · ' + moodOf(j.mood).em + ' ' + moodLabel(moodOf(j.mood)) + '</small><p>' + esc(j.body || "") + '</p></div>'; }).join("") + '</div>' : "";
    var list = entries.length ? '<div class="journal-list">' + entries.map(function (j) {
      var mood = moodOf(j.mood);
      return '<article class="journal-card"><div class="j-top"><span class="journal-mood" title="' + moodLabel(mood) + '">' + mood.em + '</span><div class="row" style="gap:4px"><button class="icon-action" data-action="edit-journal" data-id="' + esc(j.id) + '">✎</button><button class="icon-action danger" data-action="delete-journal" data-id="' + esc(j.id) + '">🗑</button></div></div>' +
        '<div class="date">' + fmtFull(j.date) + (j.time ? ' · ' + time12(j.time) : '') + ' · ' + moodLabel(mood) + '</div>' +
        '<h3>' + esc(j.title || t("بدون عنوان")) + '</h3><p>' + esc(j.body || "") + '</p>' +
        (j.images && j.images.length ? '<div class="journal-thumbs">' + j.images.slice(0, 4).map(function (src) { return '<img src="' + esc(src) + '" alt="">'; }).join("") + (j.images.length > 4 ? '<span>+' + (j.images.length - 4) + '</span>' : '') + '</div>' : '') +
        '</article>';
    }).join("") + '</div>' : emptyState("📔", t("لا توجد يوميات"), t("اكتب أول صفحة من يومك"), '<button class="btn sm" data-action="open-journal">＋ ' + t("يومية جديدة") + '</button>');
    $("#page-journal").innerHTML =
      '<div class="row between" style="margin-bottom:14px"><div class="row"><button class="btn" data-action="open-journal">＋ ' + t("إضافة يومية") + '</button>' +
      (D.prefs.journalLock.enabled ? '<button class="btn ghost sm" data-action="journal-lock-now">🔒 ' + t("اقفل اليوميات الآن") + '</button>' : '<button class="btn ghost sm" data-action="open-journal-lock">🔐 ' + t("إضافة قفل") + '</button>') + '</div></div>' +
      '<div class="toolbar"><input class="input" id="journalSearch" data-filter="journalSearch" value="' + esc(journalQuery) + '" placeholder="' + t("بحث في اليوميات") + '"><select class="select" data-filter="journalMood"><option value="all">' + t("الحالة المزاجية") + ': ' + t("الكل") + '</option>' + MOODS.map(function (m) { return '<option value="' + m.id + '"' + (journalMood === m.id ? " selected" : "") + '>' + m.em + ' ' + moodLabel(m) + '</option>'; }).join("") + '</select></div>' +
      memoriesHtml + '<div id="journalListMount">' + list + '</div><button class="j-fab" data-action="open-journal" aria-label="' + t("إضافة يومية") + '">＋</button>';
  }

  function renderJournalListOnly() {
    var mount = $("#journalListMount");
    if (!mount) { renderJournal(); return; }
    var entries = D.journal.slice().sort(function (a, b) { return (b.date + (b.time || "") + (b.createdAt || "")).localeCompare(a.date + (a.time || "") + (a.createdAt || "")); });
    if (journalQuery) entries = entries.filter(function (j) { return (j.title + " " + j.body).toLowerCase().indexOf(journalQuery.toLowerCase()) !== -1; });
    if (journalMood !== "all") entries = entries.filter(function (j) { return j.mood === journalMood; });
    mount.innerHTML = entries.length ? '<div class="journal-list">' + entries.map(function (j) {
      var mood = moodOf(j.mood);
      return '<article class="journal-card"><div class="j-top"><span class="journal-mood">' + mood.em + '</span><div class="row" style="gap:4px"><button class="icon-action" data-action="edit-journal" data-id="' + esc(j.id) + '">✎</button><button class="icon-action danger" data-action="delete-journal" data-id="' + esc(j.id) + '">🗑</button></div></div>' +
        '<div class="date">' + fmtFull(j.date) + (j.time ? ' · ' + time12(j.time) : '') + ' · ' + moodLabel(mood) + '</div><h3>' + esc(j.title || t("بدون عنوان")) + '</h3><p>' + esc(j.body || "") + '</p>' +
        (j.images && j.images.length ? '<div class="journal-thumbs">' + j.images.slice(0, 4).map(function (src) { return '<img src="' + esc(src) + '" alt="">'; }).join("") + (j.images.length > 4 ? '<span>+' + (j.images.length - 4) + '</span>' : '') + '</div>' : '') + '</article>';
    }).join("") + '</div>' : emptyState("📔", t("لا توجد يوميات"), t("اكتب أول صفحة من يومك"), '<button class="btn sm" data-action="open-journal">＋ ' + t("يومية جديدة") + '</button>');
  }

  async function unlockJournal() {
    var input = $("#journalPin");
    var pin = input ? input.value : "";
    if (!pin) return;
    var lock = D.prefs.journalLock;
    var h = await hashText(lock.salt, pin);
    if (h === lock.pinHash) {
      journalUnlocked = true;
      renderJournal();
      toast(t("محفوظ"));
    } else {
      toast(t("كلمة المرور غير صحيحة"));
      if (input) { input.value = ""; input.focus(); }
    }
  }

  function openJournalModal(id) {
    if (D.prefs.journalLock.enabled && !journalUnlocked) { toast(t("اليوميات مقفلة")); return; }
    var entry = id ? D.journal.filter(function (x) { return x.id === id; })[0] : null;
    var isEdit = !!entry;
    var draft = !isEdit ? loadDraft() : null;
    var j = entry || draft || { id: "", title: "", body: "", mood: "calm", date: todayKey(), time: timeNow(), images: [] };
    var images = Array.isArray(j.images) ? j.images.slice() : [];
    var body = '<div class="journal-editor"><div class="field"><label>' + t("عنوان اليومية") + '</label><input class="input" name="title" maxlength="180" value="' + esc(j.title || "") + '" placeholder="' + (D.prefs.lang === "en" ? "A day worth remembering" : "يوم يستحق أن يُكتب") + '"></div>' +
      '<div class="field"><label>' + t("الحالة المزاجية") + '</label><div class="mood-picks">' + MOODS.map(function (m) { return '<button type="button" class="mood-pick ' + (j.mood === m.id ? "on" : "") + '" data-mood="' + m.id + '" title="' + moodLabel(m) + '">' + m.em + '</button>'; }).join("") + '</div><input type="hidden" name="mood" value="' + esc(j.mood || "calm") + '"></div>' +
      '<div class="field"><label>' + t("اكتب ما تشعر به...") + '</label><textarea class="textarea body" name="body" rows="10">' + esc(j.body || "") + '</textarea><div class="hint">✎ ' + t("تُحفظ المسودة تلقائياً أثناء الكتابة") + '</div></div>' +
      '<div class="form-row"><div class="field"><label>' + t("التاريخ") + '</label><input class="input" type="date" name="date" value="' + esc(j.date || todayKey()) + '"></div><div class="field"><label>' + t("الوقت") + '</label><input class="input" type="time" name="time" value="' + esc(j.time || timeNow()) + '"></div></div>' +
      '<div class="field"><label>' + t("الصور") + '</label><input class="input" type="file" id="journalFiles" accept="image/*" multiple><div class="img-preview" id="journalPreview"></div></div></div>';
    openModal({
      title: isEdit ? t("تعديل اليومية") : t("يومية جديدة"),
      body: body,
      size: "lg",
      submitText: isEdit ? t("حفظ") : t("إضافة يومية"),
      onSubmit: function (data) {
        var title = String(data.title || "").trim();
        var text = String(data.body || "").trim();
        if (!title && !text && !images.length) { toast(t("اكتب شيئاً أولاً")); return false; }
        var item = isEdit ? entry : { id: uid(), createdAt: nowISO() };
        item.title = title;
        item.body = text;
        item.mood = data.mood || "calm";
        item.date = data.date || todayKey();
        item.time = data.time || timeNow();
        item.images = images;
        item.updatedAt = nowISO();
        if (!isEdit) D.journal.push(item);
        if (!isEdit) saveDraft(null);
        journalUnlocked = true;
        refresh();
        toast(t("تم حفظ اليومية"));
        return true;
      }
    });
    var form = $("#modalForm");
    var preview = $("#journalPreview");
    function paintPreview() {
      preview.innerHTML = images.map(function (src, i) {
        return '<div class="img-box"><img src="' + esc(src) + '" alt=""><button type="button" data-imgdel="' + i + '">✕</button></div>';
      }).join("");
      $$("[data-imgdel]", preview).forEach(function (b) {
        b.addEventListener("click", function () { images.splice(+b.getAttribute("data-imgdel"), 1); paintPreview(); });
      });
    }
    paintPreview();
    $$(".mood-pick", form).forEach(function (b) {
      b.addEventListener("click", function () {
        $$(".mood-pick", form).forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        form.elements.mood.value = b.getAttribute("data-mood");
      });
    });
    var fileInput = $("#journalFiles");
    fileInput.addEventListener("change", async function () {
      var files = Array.prototype.slice.call(fileInput.files || []).slice(0, 6 - images.length);
      for (var i = 0; i < files.length; i++) {
        try {
          var src = await compressImage(files[i]);
          if (src) images.push(src);
        } catch (e) { toast(t("ملف غير صالح")); }
      }
      fileInput.value = "";
      paintPreview();
    });
    if (!isEdit) {
      var autosave = function () {
        clearTimeout(draftTimer);
        draftTimer = setTimeout(function () {
          saveDraft({
            title: form.elements.title.value, body: form.elements.body.value, mood: form.elements.mood.value,
            date: form.elements.date.value, time: form.elements.time.value, images: images
          });
        }, 500);
      };
      form.addEventListener("input", autosave);
    }
  }

  function compressImage(file) {
    return new Promise(function (resolve, reject) {
      if (!file || !/^image\//.test(file.type)) { reject(new Error("bad")); return; }
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error("read")); };
      reader.onload = function () {
        var img = new Image();
        img.onerror = function () { reject(new Error("img")); };
        img.onload = function () {
          var max = 1280;
          var scale = Math.min(1, max / Math.max(img.width, img.height));
          var w = Math.round(img.width * scale), h = Math.round(img.height * scale);
          var canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          var ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          try { resolve(canvas.toDataURL("image/jpeg", 0.76)); } catch (e) { reject(e); }
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function deleteJournal(id) {
    openConfirm(t("هل تحذف هذه اليومية؟"), t("سيتم حذفها نهائياً."), function () {
      D.journal = D.journal.filter(function (x) { return x.id !== id; });
      refresh();
      toast(t("تم حذف اليومية"));
    }, t("حذف"));
  }
  function goalProgress(g) {
    if (g.steps && g.steps.length) {
      var d = g.steps.filter(function (s) { return s.done; }).length;
      return Math.round(d / g.steps.length * 100);
    }
    return clamp(safeInt(g.progress, 0), 0, 100);
  }

  function goalLog(g, note) {
    g.history = g.history || [];
    g.history.push({ at: nowISO(), value: goalProgress(g), note: note || "" });
    if (g.history.length > 40) g.history = g.history.slice(-40);
  }

  function renderGoals() {
    var all = D.goals.slice();
    var active = all.filter(function (g) { return g.status === "active"; });
    var done = all.filter(function (g) { return g.status === "done"; });
    var paused = all.filter(function (g) { return g.status === "paused"; });
    var avg = active.length ? Math.round(active.reduce(function (s, g) { return s + goalProgress(g); }, 0) / active.length) : 0;
    var shown = all.filter(function (g) { return goalFilter === "all" || g.status === goalFilter; });
    shown.sort(function (a, b) { return (a.deadline || "9999").localeCompare(b.deadline || "9999"); });
    $("#page-goals").innerHTML =
      '<div class="row between" style="margin-bottom:14px"><div class="row"><span class="count-chip">' + t("نشطة") + ' <b>' + active.length + '</b></span><span class="count-chip">' + t("مكتملة") + ' <b>' + done.length + '</b></span><span class="count-chip">' + t("متوقف") + ' <b>' + paused.length + '</b></span></div><button class="btn" data-action="open-goal">＋ ' + t("هدف جديد") + '</button></div>' +
      (active.length ? '<div class="card tint"><div class="row between"><div><b style="font-size:13px">' + t("تطور الأهداف") + '</b><div class="muted small">' + active.length + ' ' + t("نشطة") + '</div></div><b style="font-size:24px;color:var(--accent-deep)">' + avg + '%</b></div>' + progressBar(avg) + '</div>' : '') +
      '<div class="tabs">' + [["active", t("نشط")], ["done", t("مكتمل")], ["paused", t("متوقف")], ["all", t("الكل")]].map(function (v) { return '<button class="tab ' + (goalFilter === v[0] ? "active" : "") + '" data-action="goal-filter" data-filter="' + v[0] + '">' + v[1] + '</button>'; }).join("") + '</div>' +
      '<div id="goalsMount">' + goalsMarkup(shown) + '</div>';
  }

  function goalsMarkup(list) {
    if (!list.length) return emptyState("🎯", t("لا توجد أهداف"), t("أضف هدفاً تريد تحقيقه"), '<button class="btn sm" data-action="open-goal">＋ ' + t("هدف جديد") + '</button>');
    return '<div class="goal-grid">' + list.map(function (g) {
      var p = goalProgress(g);
      var cat = GOAL_CATS[g.category] || GOAL_CATS.other;
      var dl = "";
      if (g.deadline) {
        var diff = Math.ceil((parseKey(g.deadline) - parseKey(todayKey())) / 86400000);
        dl = diff < 0 ? t("انتهت المدة") : diff === 0 ? t("اليوم") : diff + " " + t("يوم") + " " + t("متبقي");
      }
      var steps = (g.steps || []).map(function (s) {
        return '<div class="step-row ' + (s.done ? "done" : "") + '"><button class="step-check ' + (s.done ? "on" : "") + '" data-action="toggle-step" data-goal="' + esc(g.id) + '" data-step="' + esc(s.id) + '">' + (s.done ? "✓" : "") + '</button><span>' + esc(s.text) + '</span><button class="step-del" data-action="delete-step" data-goal="' + esc(g.id) + '" data-step="' + esc(s.id) + '">✕</button></div>';
      }).join("");
      var history = (g.history || []).slice(-3).reverse().map(function (h) {
        return '<div><span>' + fmtShort(isoToKey(h.at)) + '</span><span>' + h.value + '%</span></div>';
      }).join("");
      return '<article class="goal-card ' + (g.status === "paused" ? "paused" : "") + (g.status === "done" ? "finished" : "") + '"><div class="goal-top"><div><h3>' + esc(g.title) + '</h3><div class="cat">' + cat.em + ' ' + catLabel(g.category, GOAL_CATS) + (g.deadline ? ' · ' + dl : '') + '</div></div><span class="goal-pct">' + p + '<small>%</small></span></div>' +
        progressBar(p, g.status === "done" ? "" : "") +
        (g.desc ? '<div class="muted small" style="margin-top:5px">' + esc(g.desc) + '</div>' : '') +
        '<div class="steps">' + (steps || '<div class="muted small" style="padding:4px 0">' + t("لا توجد خطوات بعد") + '</div>') + '</div>' +
        (g.status === "active" ? '<form class="goal-step-add" data-form="goal-step" data-id="' + esc(g.id) + '"><input class="input" name="text" placeholder="' + t("أضف خطوة صغيرة") + '" maxlength="140"><button class="btn soft sm" type="submit">＋</button></form>' : '') +
        (history ? '<div class="history-list" style="margin-top:9px">' + history + '</div>' : '') +
        '<div class="goal-foot"><small>' + (g.status === "done" ? "✅ " + t("مكتمل") : g.status === "paused" ? "⏸ " + t("متوقف") : "🌱 " + t("نشط")) + '</small><div class="goal-actions">' +
        '<button class="icon-action" data-action="edit-goal" data-id="' + esc(g.id) + '" title="' + t("تعديل") + '">✎</button>' +
        (g.status === "done" ? '<button class="icon-action" data-action="toggle-goal-status" data-id="' + esc(g.id) + '" title="' + t("استئناف") + '">↺</button>' : '<button class="icon-action" data-action="toggle-goal-status" data-id="' + esc(g.id) + '" title="' + (g.status === "paused" ? t("استئناف") : t("إيقاف")) + '">' + (g.status === "paused" ? "▶" : "⏸") + '</button>') +
        (g.status !== "done" ? '<button class="icon-action" data-action="finish-goal" data-id="' + esc(g.id) + '" title="' + t("إنجاز الهدف") + '">✓</button>' : '') +
        '<button class="icon-action danger" data-action="delete-goal" data-id="' + esc(g.id) + '" title="' + t("حذف") + '">🗑</button></div></div></article>';
    }).join("") + '</div>';
  }

  function openGoalModal(id) {
    var g = id ? D.goals.filter(function (x) { return x.id === id; })[0] : null;
    var isEdit = !!g;
    g = g || { id: "", title: "", desc: "", category: "personal", deadline: "", status: "active", steps: [], progress: 0, history: [] };
    var body = '<div class="field"><label>' + t("عنوان الهدف") + '</label><input class="input" name="title" maxlength="200" required value="' + esc(g.title) + '"></div>' +
      '<div class="field"><label>' + t("لماذا هذا الهدف؟") + '</label><textarea class="textarea" name="desc" rows="2" maxlength="500">' + esc(g.desc || "") + '</textarea></div>' +
      '<div class="form-row"><div class="field"><label>' + t("التصنيف") + '</label><select class="select" name="category">' + Object.keys(GOAL_CATS).map(function (c) { return '<option value="' + c + '"' + (g.category === c ? " selected" : "") + '>' + GOAL_CATS[c].em + ' ' + catLabel(c, GOAL_CATS) + '</option>'; }).join("") + '</select></div>' +
      '<div class="field"><label>' + t("الموعد النهائي") + '</label><input class="input" type="date" name="deadline" value="' + esc(g.deadline || "") + '"></div></div>' +
      '<div class="field"><label>' + t("نسبة الإنجاز") + ' <span class="muted small">(' + (g.steps && g.steps.length ? t("الخطوات") + ': ' + goalProgress(g) + '%' : t("يدوي")) + ')</span></label><input class="input" type="number" name="progress" min="0" max="100" value="' + goalProgress(g) + '"></div>' +
      '<div class="hint">' + (D.prefs.lang === "en" ? "Add small steps from the goal card to track progress automatically." : "أضف خطوات صغيرة من بطاقة الهدف ليُحسب التقدم تلقائياً.") + '</div>';
    openModal({
      title: isEdit ? t("تعديل الهدف") : t("هدف جديد"),
      body: body,
      submitText: isEdit ? t("حفظ") : t("هدف جديد"),
      onSubmit: function (data) {
        var title = String(data.title || "").trim();
        if (!title) return false;
        var item = isEdit ? g : { id: uid(), status: "active", steps: [], history: [], createdAt: nowISO() };
        item.title = title;
        item.desc = String(data.desc || "").trim();
        item.category = data.category || "other";
        item.deadline = data.deadline || "";
        var before = goalProgress(item);
        if (!item.steps || !item.steps.length) item.progress = clamp(safeInt(data.progress, 0), 0, 100);
        if (!isEdit) item.history = [{ at: nowISO(), value: goalProgress(item), note: "created" }];
        else if (goalProgress(item) !== before) goalLog(item, "updated");
        item.updatedAt = nowISO();
        if (!isEdit) D.goals.push(item);
        refresh();
        toast(isEdit ? t("تم حفظ التعديلات") : t("تمت إضافة الهدف"));
        return true;
      }
    });
  }

  function toggleGoalStatus(id) {
    var g = D.goals.filter(function (x) { return x.id === id; })[0];
    if (!g) return;
    g.status = g.status === "active" ? "paused" : "active";
    if (g.status === "active" && goalProgress(g) === 100) g.status = "active";
    g.updatedAt = nowISO();
    refresh();
  }

  function finishGoal(id) {
    var g = D.goals.filter(function (x) { return x.id === id; })[0];
    if (!g) return;
    g.status = g.status === "done" ? "active" : "done";
    if (!g.steps || !g.steps.length) g.progress = g.status === "done" ? 100 : Math.min(99, safeInt(g.progress, 0));
    g.updatedAt = nowISO();
    goalLog(g, g.status === "done" ? "done" : "reopened");
    refresh();
    toast(g.status === "done" ? "🎉 " + t("مكتمل") : t("نشط"));
  }

  function deleteGoal(id) {
    openConfirm(t("هل تحذف هذا الهدف؟"), t("سيتم حذفه نهائياً."), function () {
      D.goals = D.goals.filter(function (x) { return x.id !== id; });
      refresh();
      toast(t("تم حذف الهدف"));
    }, t("حذف"));
  }

  function addGoalStep(goalId, text) {
    var g = D.goals.filter(function (x) { return x.id === goalId; })[0];
    if (!g || !text) return;
    g.steps = g.steps || [];
    g.steps.push({ id: uid(), text: text, done: false });
    goalLog(g, "step-added");
    refresh();
  }

  function toggleGoalStep(goalId, stepId) {
    var g = D.goals.filter(function (x) { return x.id === goalId; })[0];
    if (!g) return;
    var s = (g.steps || []).filter(function (x) { return x.id === stepId; })[0];
    if (!s) return;
    s.done = !s.done;
    goalLog(g, "step");
    if (g.status === "active" && goalProgress(g) === 100) { g.status = "done"; toast("🎉 " + t("مكتمل")); }
    else if (g.status === "done" && goalProgress(g) < 100) g.status = "active";
    refresh();
  }

  function deleteGoalStep(goalId, stepId) {
    var g = D.goals.filter(function (x) { return x.id === goalId; })[0];
    if (!g) return;
    g.steps = (g.steps || []).filter(function (x) { return x.id !== stepId; });
    goalLog(g, "step-deleted");
    refresh();
  }

  function isHabitDone(h, k) {
    var count = ((D.habitLogs[h.id] || {})[k] || 0);
    if (h.frequency === "weekly") {
      var total = habitWeekTotal(h.id, parseKey(k));
      return total >= (h.target || 1);
    }
    return count >= (h.target || 1);
  }

  function habitWeekTotal(id, day) {
    var logs = D.habitLogs[id] || {};
    var start = startOfWeek(day);
    var total = 0;
    for (var i = 0; i < 7; i++) total += logs[dateKey(addDays(start, i))] || 0;
    return total;
  }

  function habitStreak(id) {
    var logs = D.habitLogs[id] || {};
    var d = new Date();
    if (!(logs[dateKey(d)] > 0)) d = addDays(d, -1);
    var n = 0, guard = 0;
    while ((logs[dateKey(d)] || 0) > 0 && guard < 1500) { n++; d = addDays(d, -1); guard++; }
    return n;
  }

  function habitBest(id) {
    var logs = D.habitLogs[id] || {};
    var keys = Object.keys(logs).filter(function (k) { return logs[k] > 0; }).sort();
    var best = 0, run = 0, prev = null;
    keys.forEach(function (k) {
      if (prev && dateKey(addDays(parseKey(prev), 1)) === k) run++;
      else run = 1;
      prev = k;
      if (run > best) best = run;
    });
    return best;
  }

  function overallHabitLevel(k) {
    if (!D.habits.length) return 0;
    var done = D.habits.filter(function (h) { return (D.habitLogs[h.id] || {})[k] > 0; }).length;
    var p = done / D.habits.length;
    return p === 0 ? 0 : p < 0.34 ? 1 : p < 0.67 ? 2 : p < 1 ? 3 : 4;
  }

  function renderHabits() {
    var best = D.habits.reduce(function (m, h) { return Math.max(m, habitBest(h.id), habitStreak(h.id)); }, 0);
    var todayDone = D.habits.filter(function (h) { return isHabitDone(h, todayKey()); }).length;
    var heat = "";
    for (var i = 83; i >= 0; i--) {
      var k = dateKey(addDays(new Date(), -i));
      var lv = overallHabitLevel(k);
      heat += '<div class="heat-cell ' + (lv ? "l" + lv : "") + '" title="' + fmtShort(k) + '"></div>';
    }
    var cards = D.habits.map(function (h) {
      var count = (D.habitLogs[h.id] || {})[todayKey()] || 0;
      var total = h.frequency === "weekly" ? habitWeekTotal(h.id, new Date()) : count;
      var target = h.target || 1;
      var done = isHabitDone(h, todayKey());
      var days = "";
      for (var i = 13; i >= 0; i--) {
        var k2 = dateKey(addDays(new Date(), -i));
        var c = (D.habitLogs[h.id] || {})[k2] || 0;
        var lv2 = c <= 0 ? 0 : c < target ? 1 : c >= target * 2 ? 3 : 2;
        days += '<div class="habit-day ' + (lv2 ? "l" + lv2 : "") + (k2 === todayKey() ? " today" : "") + '" title="' + fmtShort(k2) + ': ' + c + '"></div>';
      }
      return '<article class="habit-card"><div class="habit-top"><span class="habit-ic">' + esc(h.icon || "🌱") + '</span><div><h3>' + esc(h.name) + '</h3><small>' + (h.frequency === "weekly" ? target + " " + t("في الأسبوع") : target + " " + t("في اليوم")) + '</small></div><div class="streak"><b>' + habitStreak(h.id) + '</b><small>' + t("سلسلة الأيام") + '</small></div></div>' +
        '<div class="habit-mid"><div class="habit-count"><b>' + total + '</b> / ' + target + ' <small class="muted">' + (h.frequency === "weekly" ? t("هذا الأسبوع") : t("اليوم")) + '</small></div><button class="habit-tap ' + (done ? "done" : "") + '" data-action="log-habit" data-id="' + esc(h.id) + '" aria-label="' + t("تسجيل") + '">' + (done ? "✓" : "＋") + '</button></div>' +
        '<div class="habit-days">' + days + '</div>' +
        '<div class="habit-foot"><span class="habit-streak-best">🏅 ' + t("أفضل سلسلة") + ': ' + habitBest(h.id) + '</span><div class="habit-actions"><button class="icon-action" data-action="reset-habit" data-id="' + esc(h.id) + '" title="' + t("تمت إعادة ضبط اليوم") + '">↺</button><button class="icon-action" data-action="edit-habit" data-id="' + esc(h.id) + '">✎</button><button class="icon-action danger" data-action="delete-habit" data-id="' + esc(h.id) + '">🗑</button></div></div></article>';
    }).join("");
    $("#page-habits").innerHTML =
      '<div class="row between" style="margin-bottom:14px"><div class="row"><span class="count-chip">' + t("عادات اليوم") + ' <b>' + todayDone + '/' + D.habits.length + '</b></span><span class="count-chip">🏅 ' + t("أفضل سلسلة") + ' <b>' + best + '</b></span></div><button class="btn" data-action="open-habit">＋ ' + t("عادة جديدة") + '</button></div>' +
      (D.habits.length ? '<div class="card"><div class="card-head"><h3>🌿 ' + t("تقويم العادات") + '</h3><span class="muted small">' + t("آخر ١٢ أسبوعاً") + '</span></div><div class="heatmap">' + heat + '</div></div>' : '') +
      (cards ? '<div class="habit-grid">' + cards + '</div>' : emptyState("🌱", t("لا توجد عادات"), t("ابدأ بعادة صغيرة تدوم"), '<button class="btn sm" data-action="open-habit">＋ ' + t("عادة جديدة") + '</button>'));
  }

  function openHabitModal(id) {
    var h = id ? D.habits.filter(function (x) { return x.id === id; })[0] : null;
    var isEdit = !!h;
    h = h || { id: "", name: "", icon: "🌱", frequency: "daily", target: 1, createdAt: nowISO() };
    var body = '<div class="field"><label>' + t("اسم العادة") + '</label><input class="input" name="name" maxlength="120" required value="' + esc(h.name) + '" placeholder="' + (D.prefs.lang === "en" ? "Drink water" : "شرب الماء") + '"></div>' +
      '<div class="field"><label>' + t("الرمز") + '</label><div class="picker-grid" id="habitIcons">' + HABIT_ICONS.map(function (em) { return '<button type="button" class="' + (h.icon === em ? "on" : "") + '" data-icon="' + em + '">' + em + '</button>'; }).join("") + '</div><input type="hidden" name="icon" value="' + esc(h.icon) + '"></div>' +
      '<div class="form-row"><div class="field"><label>' + t("التكرار") + '</label><select class="select" name="frequency"><option value="daily"' + (h.frequency === "daily" ? " selected" : "") + '>' + t("يومياً") + '</option><option value="weekly"' + (h.frequency === "weekly" ? " selected" : "") + '>' + t("أسبوعياً") + '</option></select></div>' +
      '<div class="field"><label>' + t("عدد المرات") + '</label><input class="input" type="number" min="1" max="99" name="target" value="' + (h.target || 1) + '"></div></div>';
    openModal({
      title: isEdit ? t("تعديل العادة") : t("عادة جديدة"),
      body: body,
      submitText: isEdit ? t("حفظ") : t("عادة جديدة"),
      onSubmit: function (data) {
        var name = String(data.name || "").trim();
        if (!name) return false;
        var item = isEdit ? h : { id: uid(), createdAt: nowISO() };
        item.name = name;
        item.icon = data.icon || "🌱";
        item.frequency = data.frequency || "daily";
        item.target = clamp(safeInt(data.target, 1), 1, 99);
        item.updatedAt = nowISO();
        if (!isEdit) { D.habits.push(item); D.habitLogs[item.id] = {}; }
        refresh();
        toast(isEdit ? t("تم حفظ التعديلات") : t("تمت إضافة العادة"));
        return true;
      }
    });
    var form = $("#modalForm");
    $$("#habitIcons button", form).forEach(function (b) {
      b.addEventListener("click", function () {
        $$("#habitIcons button", form).forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        form.elements.icon.value = b.getAttribute("data-icon");
      });
    });
  }

  function logHabit(id) {
    var h = D.habits.filter(function (x) { return x.id === id; })[0];
    if (!h) return;
    var k = todayKey();
    D.habitLogs[id] = D.habitLogs[id] || {};
    D.habitLogs[id][k] = (D.habitLogs[id][k] || 0) + 1;
    haptic(12);
    refresh();
    if (isHabitDone(h, k)) toast("✓ " + t("تم التسجيل"));
  }

  function resetHabit(id) {
    if (D.habitLogs[id]) delete D.habitLogs[id][todayKey()];
    refresh();
    toast(t("تمت إعادة ضبط اليوم"));
  }

  function deleteHabit(id) {
    openConfirm(t("هل تحذف هذه العادة؟"), t("سيتم حذفها نهائياً."), function () {
      D.habits = D.habits.filter(function (x) { return x.id !== id; });
      delete D.habitLogs[id];
      refresh();
      toast(t("تم حذف العادة"));
    }, t("حذف"));
  }

  function renderLists() {
    if (listOpen) {
      var list = D.lists.filter(function (x) { return x.id === listOpen; })[0];
      if (!list) { listOpen = null; renderLists(); return; }
      var items = list.items || [];
      var done = items.filter(function (x) { return x.done; }).length;
      var filtered = items.filter(function (x) { return !listFilter || (x.text + " " + (x.note || "")).toLowerCase().indexOf(listFilter.toLowerCase()) !== -1; });
      var markup = filtered.length ? '<div class="list-items">' + filtered.map(function (it) {
        return '<div class="list-item ' + (it.done ? "done" : "") + '"><button class="task-check ' + (it.done ? "on" : "") + '" data-action="toggle-list-item" data-list="' + esc(list.id) + '" data-id="' + esc(it.id) + '">' + (it.done ? "✓" : "") + '</button><div class="li-body"><div class="li-title">' + esc(it.text) + '</div>' + (it.note ? '<div class="li-note">' + esc(it.note) + '</div>' : '') + '</div><div class="row" style="gap:4px"><button class="icon-action" data-action="edit-list-item" data-list="' + esc(list.id) + '" data-id="' + esc(it.id) + '">✎</button><button class="icon-action danger" data-action="delete-list-item" data-list="' + esc(list.id) + '" data-id="' + esc(it.id) + '">🗑</button></div></div>';
      }).join("") + '</div>' : emptyState("📝", t("لا توجد عناصر"), t("أضف أول عنصر إلى القائمة"));
      $("#page-lists").innerHTML =
        '<div class="list-detail-head"><button class="icon-btn" data-action="back-lists">←</button><span class="l-em">' + esc(list.icon || "📋") + '</span><div style="flex:1"><h2>' + esc(listName(list)) + '</h2><small>' + done + ' / ' + items.length + ' ' + t("عناصر") + '</small></div><div class="row"><button class="icon-action" data-action="edit-list" data-id="' + esc(list.id) + '">✎</button><button class="icon-action danger" data-action="delete-list" data-id="' + esc(list.id) + '">🗑</button></div></div>' +
        progressBar(items.length ? done / items.length * 100 : 0) +
        '<form class="list-add" data-form="list-item" data-id="' + esc(list.id) + '" style="margin-top:14px"><input class="input" name="text" placeholder="' + t("عنصر جديد") + '" maxlength="200"><button class="btn" type="submit">＋</button></form>' +
        '<div class="toolbar"><input class="input" id="listSearch" data-filter="listSearch" value="' + esc(listFilter) + '" placeholder="' + t("بحث") + '"></div><div id="listItemsMount">' + markup + '</div>';
      return;
    }
    var cards = D.lists.map(function (l) {
      var done = (l.items || []).filter(function (x) { return x.done; }).length;
      var total = (l.items || []).length;
      return '<article class="list-card" data-action="open-list" data-id="' + esc(l.id) + '"><span class="l-count">' + done + '/' + total + '</span><div class="l-em">' + esc(l.icon || "📋") + '</div><h3>' + esc(listName(l)) + '</h3><small>' + total + ' ' + t("عنصر") + '</small>' + progressBar(total ? done / total * 100 : 0) + '</article>';
    }).join("");
    $("#page-lists").innerHTML =
      '<div class="row between" style="margin-bottom:14px"><div><b class="muted small">' + t("قوائمك") + ' · ' + D.lists.length + '</b></div><button class="btn" data-action="open-list-modal">＋ ' + t("قائمة جديدة") + '</button></div>' +
      (cards ? '<div class="list-grid">' + cards + '</div>' : emptyState("📋", t("لا توجد قائمة"), t("أنشئ قائمة لأي شيء تحبه"), '<button class="btn sm" data-action="open-list-modal">＋ ' + t("قائمة جديدة") + '</button>'));
  }

  function openListModal(id) {
    var l = id ? D.lists.filter(function (x) { return x.id === id; })[0] : null;
    var isEdit = !!l;
    l = l || { id: "", name: "", icon: "📋", items: [] };
    var body = '<div class="field"><label>' + t("اسم القائمة") + '</label><input class="input" name="name" maxlength="120" required value="' + esc(listName(l)) + '"></div>' +
      '<div class="field"><label>' + t("الرمز") + '</label><div class="picker-grid" id="listIcons">' + LIST_ICONS.map(function (em) { return '<button type="button" class="' + (l.icon === em ? "on" : "") + '" data-icon="' + em + '">' + em + '</button>'; }).join("") + '</div><input type="hidden" name="icon" value="' + esc(l.icon) + '"></div>';
    openModal({
      title: isEdit ? t("تعديل القائمة") : t("قائمة جديدة"),
      body: body,
      submitText: isEdit ? t("حفظ") : t("قائمة جديدة"),
      onSubmit: function (data) {
        var name = String(data.name || "").trim();
        if (!name) return false;
        var item = isEdit ? l : { id: uid(), items: [], createdAt: nowISO() };
        item.name = name;
        if (D.prefs.lang === "en" && item.en) item.en = name;
        item.icon = data.icon || "📋";
        item.updatedAt = nowISO();
        if (!isEdit) D.lists.push(item);
        refresh();
        toast(isEdit ? t("تم حفظ التعديلات") : t("تمت إضافة القائمة"));
        return true;
      }
    });
    var form = $("#modalForm");
    $$("#listIcons button", form).forEach(function (b) {
      b.addEventListener("click", function () {
        $$("#listIcons button", form).forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        form.elements.icon.value = b.getAttribute("data-icon");
      });
    });
  }

  function openListItemModal(listId, itemId) {
    var l = D.lists.filter(function (x) { return x.id === listId; })[0];
    if (!l) return;
    var it = itemId ? (l.items || []).filter(function (x) { return x.id === itemId; })[0] : null;
    var isEdit = !!it;
    it = it || { id: "", text: "", note: "", done: false };
    openModal({
      title: isEdit ? t("تعديل العنصر") : t("عنصر جديد"),
      body: '<div class="field"><label>' + t("اسم العنصر") + '</label><input class="input" name="text" maxlength="200" required value="' + esc(it.text) + '"></div><div class="field"><label>' + t("ملاحظة قصيرة") + '</label><textarea class="textarea" name="note" rows="2" maxlength="400">' + esc(it.note || "") + '</textarea></div>',
      submitText: isEdit ? t("حفظ") : t("إضافة"),
      onSubmit: function (data) {
        var text = String(data.text || "").trim();
        if (!text) return false;
        var item = isEdit ? it : { id: uid(), done: false, createdAt: nowISO() };
        item.text = text;
        item.note = String(data.note || "").trim();
        item.updatedAt = nowISO();
        if (!isEdit) l.items.push(item);
        refresh();
        return true;
      }
    });
  }

  function deleteListItem(listId, itemId) {
    var l = D.lists.filter(function (x) { return x.id === listId; })[0];
    if (!l) return;
    l.items = (l.items || []).filter(function (x) { return x.id !== itemId; });
    refresh();
  }

  function deleteList(id) {
    openConfirm(t("هل تحذف هذه القائمة؟"), t("سيتم حذف كل عناصرها."), function () {
      D.lists = D.lists.filter(function (x) { return x.id !== id; });
      if (listOpen === id) listOpen = null;
      refresh();
      toast(t("تم حذف القائمة"));
    }, t("حذف"));
  }

  function noteMarkup(n) {
    var cat = NOTE_CATS[n.category] || NOTE_CATS.general;
    var color = (NOTE_COLORS[n.color] || NOTE_COLORS.default).color;
    return '<article class="note-card ' + (n.pinned ? "pinned" : "") + (color ? " color-" + color : "") + '"><div class="n-top"><div><h3>' + esc(n.title || t("بدون عنوان")) + '</h3></div><button class="note-pin ' + (n.pinned ? "on" : "") + '" data-action="pin-note" data-id="' + esc(n.id) + '" title="' + t("تثبيت") + '">📌</button></div>' +
      '<p>' + esc(n.body || "") + '</p><div class="n-foot"><small>' + cat.em + ' ' + catLabel(n.category, NOTE_CATS) + ' · ' + fmtShort(n.date || isoToKey(n.updatedAt)) + '</small><div class="row" style="gap:4px"><button class="icon-action" data-action="edit-note" data-id="' + esc(n.id) + '">✎</button><button class="icon-action danger" data-action="delete-note" data-id="' + esc(n.id) + '">🗑</button></div></div></article>';
  }

  function filteredNotes() {
    var list = D.notes.slice().sort(function (a, b) {
      if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
      return (b.updatedAt || b.createdAt || "").localeCompare(a.updatedAt || a.createdAt || "");
    });
    if (notesCat !== "all") list = list.filter(function (n) { return n.category === notesCat; });
    if (notesQuery) list = list.filter(function (n) { return (n.title + " " + n.body).toLowerCase().indexOf(notesQuery.toLowerCase()) !== -1; });
    return list;
  }

  function renderNotes() {
    $("#page-notes").innerHTML =
      '<form class="note-composer" data-form="quick-note"><div class="row between" style="margin-bottom:8px"><b style="font-size:13px">✎ ' + t("ملاحظة سريعة") + '</b><span class="muted tiny">' + t("حفظ تلقائي") + '</span></div><input class="input" name="title" placeholder="' + t("عنوان الملاحظة") + '" style="margin-bottom:7px"><textarea class="textarea" name="body" rows="3" placeholder="' + t("اكتب ملاحظتك هنا...") + '" required></textarea><div class="row between" style="margin-top:8px"><select class="select" name="category" style="width:auto">' + Object.keys(NOTE_CATS).map(function (c) { return '<option value="' + c + '">' + NOTE_CATS[c].em + ' ' + catLabel(c, NOTE_CATS) + '</option>'; }).join("") + '</select><div class="row"><label class="row" style="gap:5px;font-size:11.5px;font-weight:700"><input type="checkbox" name="pinned"> ' + t("تثبيت") + '</label><button class="btn sm" type="submit">＋ ' + t("إضافة") + '</button></div></div></form>' +
      '<div class="notes-toolbar"><input class="input" id="notesSearch" data-filter="notesSearch" value="' + esc(notesQuery) + '" placeholder="' + t("بحث داخل الملاحظات") + '">' + [["all", t("الكل")]].concat(Object.keys(NOTE_CATS).map(function (c) { return [c, catLabel(c, NOTE_CATS)]; })).map(function (v) { return '<button class="chip-btn ' + (notesCat === v[0] ? "on" : "") + '" data-action="notes-cat" data-cat="' + v[0] + '">' + v[1] + '</button>'; }).join("") + '</div>' +
      '<div id="notesMount">' + notesMarkup(filteredNotes()) + '</div>';
  }

  function notesMarkup(list) {
    if (!list.length) return emptyState("🗒️", t("لا توجد ملاحظات"), t("أضف فكرة سريعة"));
    return '<div class="notes-grid">' + list.map(noteMarkup).join("") + '</div>';
  }

  function renderNotesBody() {
    var mount = $("#notesMount");
    if (mount) mount.innerHTML = notesMarkup(filteredNotes());
  }

  function openNoteModal(id) {
    var n = id ? D.notes.filter(function (x) { return x.id === id; })[0] : null;
    var isEdit = !!n;
    n = n || { id: "", title: "", body: "", category: "general", color: "default", pinned: false };
    var body = '<div class="field"><label>' + t("عنوان الملاحظة") + '</label><input class="input" name="title" maxlength="160" value="' + esc(n.title) + '"></div>' +
      '<div class="field"><label>' + t("الملاحظات") + '</label><textarea class="textarea" name="body" rows="8" required>' + esc(n.body) + '</textarea></div>' +
      '<div class="form-row"><div class="field"><label>' + t("التصنيف") + '</label><select class="select" name="category">' + Object.keys(NOTE_CATS).map(function (c) { return '<option value="' + c + '"' + (n.category === c ? " selected" : "") + '>' + NOTE_CATS[c].em + ' ' + catLabel(c, NOTE_CATS) + '</option>'; }).join("") + '</select></div>' +
      '<div class="field"><label>' + t("اللون") + '</label><div class="color-options">' + Object.keys(NOTE_COLORS).map(function (c) { return '<button type="button" class="color-opt ' + (n.color === c ? "on" : "") + '" data-ncolor="' + c + '" style="background:' + ({ default: "var(--surface2)", green: "var(--tint)", blue: "#dce8f2", purple: "#e6dff2", clay: "#f0e2da" }[c]) + '"></button>'; }).join("") + '</div><input type="hidden" name="color" value="' + esc(n.color || "default") + '"></div></div>' +
      '<label class="row" style="gap:8px;font-size:12.5px;font-weight:800"><input type="checkbox" name="pinned"' + (n.pinned ? " checked" : "") + '> 📌 ' + t("تثبيت") + '</label>';
    openModal({
      title: isEdit ? t("تعديل الملاحظة") : t("ملاحظة جديدة"),
      body: body,
      submitText: isEdit ? t("حفظ") : t("إضافة"),
      onSubmit: function (data, form) {
        var text = String(data.body || "").trim();
        if (!text) return false;
        var item = isEdit ? n : { id: uid(), createdAt: nowISO() };
        item.title = String(data.title || "").trim();
        item.body = text;
        item.category = data.category || "general";
        item.color = data.color || "default";
        item.pinned = !!(form.elements.pinned && form.elements.pinned.checked);
        item.updatedAt = nowISO();
        item.date = item.date || todayKey();
        if (!isEdit) D.notes.push(item);
        refresh();
        toast(t("تم حفظ الملاحظة"));
        return true;
      }
    });
    var form = $("#modalForm");
    $$("[data-ncolor]", form).forEach(function (b) {
      b.addEventListener("click", function () {
        $$("[data-ncolor]", form).forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        form.elements.color.value = b.getAttribute("data-ncolor");
      });
    });
  }

  function deleteNote(id) {
    openConfirm(t("هل تحذف هذه الملاحظة؟"), t("سيتم حذفها نهائياً."), function () {
      D.notes = D.notes.filter(function (x) { return x.id !== id; });
      refresh();
      toast(t("تم حذف الملاحظة"));
    }, t("حذف"));
  }
  function renderMoney() {
    var tx = D.transactions.filter(function (x) { return String(x.date || "").slice(0, 7) === moneyMonth; });
    var income = tx.filter(function (x) { return x.type === "income"; }).reduce(function (s, x) { return s + (+x.amount || 0); }, 0);
    var expense = tx.filter(function (x) { return x.type === "expense"; }).reduce(function (s, x) { return s + (+x.amount || 0); }, 0);
    var budget = +(D.budgets[moneyMonth] || 0);
    var remaining = budget ? budget - expense : 0;
    var pct = budget ? Math.round(expense / budget * 100) : 0;
    var cur = D.prefs.currency || "ر.س";
    var cats = {};
    tx.filter(function (x) { return x.type === "expense"; }).forEach(function (x) { cats[x.category] = (cats[x.category] || 0) + (+x.amount || 0); });
    var catRows = Object.keys(cats).sort(function (a, b) { return cats[b] - cats[a]; }).map(function (c) {
      var info = EXPENSE_CATS[c] || EXPENSE_CATS.other;
      var p = expense ? Math.round(cats[c] / expense * 100) : 0;
      return '<div class="cat-bar"><span>' + info.em + ' ' + catLabel(c, EXPENSE_CATS) + '</span><div class="progress"><i style="width:' + p + '%"></i></div><b>' + moneyFmt(cats[c]) + ' ' + esc(cur) + '</b></div>';
    }).join("");
    var chart = "";
    var max = 1;
    var months = [];
    for (var i = 5; i >= 0; i--) {
      var d = addMonths(new Date(), -i), mk = monthKey(d);
      var mtx = D.transactions.filter(function (x) { return String(x.date || "").slice(0, 7) === mk; });
      var mi = mtx.filter(function (x) { return x.type === "income"; }).reduce(function (s, x) { return s + (+x.amount || 0); }, 0);
      var me = mtx.filter(function (x) { return x.type === "expense"; }).reduce(function (s, x) { return s + (+x.amount || 0); }, 0);
      max = Math.max(max, mi, me);
      months.push({ d: d, inc: mi, exp: me });
    }
    months.forEach(function (m) {
      chart += '<div class="chart-bar"><div style="display:flex;align-items:flex-end;gap:2px;width:100%;height:100%"><i class="inc" style="height:' + (m.inc / max * 100) + '%"></i><i class="exp" style="height:' + (m.exp / max * 100) + '%"></i></div><span>' + fmtDate(m.d, { month: "short" }) + '</span></div>';
    });
    var list = tx.slice().sort(function (a, b) { return (b.date + (b.createdAt || "")).localeCompare(a.date + (a.createdAt || "")); });
    var txHtml = list.length ? '<div class="tx-list">' + list.map(function (x) {
      var isInc = x.type === "income";
      var info = (isInc ? INCOME_CATS : EXPENSE_CATS)[x.category] || { em: "✨", ar: "أخرى", en: "Other" };
      return '<div class="tx ' + (isInc ? "inc" : "") + '"><span class="tx-ic">' + info.em + '</span><div class="tx-body"><b>' + esc(x.note || catLabel(x.category, isInc ? INCOME_CATS : EXPENSE_CATS)) + '</b><small>' + fmtShort(x.date) + ' · ' + catLabel(x.category, isInc ? INCOME_CATS : EXPENSE_CATS) + '</small></div><span class="tx-amt">' + (isInc ? "+" : "−") + moneyFmt(x.amount) + ' <small>' + esc(cur) + '</small></span><div class="row" style="gap:3px;margin-inline-start:5px"><button class="icon-action" data-action="edit-tx" data-id="' + esc(x.id) + '">✎</button><button class="icon-action danger" data-action="delete-tx" data-id="' + esc(x.id) + '">🗑</button></div></div>';
    }).join("") + '</div>' : emptyState("💰", t("لا توجد حركات"), t("سجّل أول مصروف أو دخل"), '<button class="btn sm" data-action="open-tx" data-type="expense">＋ ' + t("أضف مصروفاً") + '</button>');
    $("#page-money").innerHTML =
      '<div class="cal-bar"><button class="icon-btn" data-action="money-prev">‹</button><b class="cal-title">' + fmtDate(parseKey(moneyMonth + "-01"), { month: "long", year: "numeric" }) + '</b><button class="icon-btn" data-action="money-next">›</button></div>' +
      '<div class="money-stats"><div class="money-stat"><span class="m-ic">📊</span><small>' + t("الدخل") + '</small><b>' + moneyFmt(income) + ' <span class="cur">' + esc(cur) + '</span></b></div>' +
      '<div class="money-stat exp"><span class="m-ic">🧾</span><small>' + t("المصروف") + '</small><b>' + moneyFmt(expense) + ' <span class="cur">' + esc(cur) + '</span></b></div>' +
      '<div class="money-stat ' + (budget && remaining < 0 ? "exp" : "inc") + '"><span class="m-ic">💎</span><small>' + (budget ? t("المتبقي") : t("لا توجد ميزانية محددة")) + '</small><b>' + (budget ? moneyFmt(remaining) + ' <span class="cur">' + esc(cur) + '</span>' : "—") + '</b></div></div>' +
      '<div class="card"><div class="card-head"><h3>🎯 ' + t("ميزانية الشهر") + '</h3><button class="link-btn" data-action="edit-budget">' + (budget ? t("تعديل الميزانية") : t("تحديد ميزانية")) + ' ←</button></div>' +
      (budget ? '<div class="row between" style="margin-bottom:6px"><span class="muted small">' + moneyFmt(expense) + ' / ' + moneyFmt(budget) + ' ' + esc(cur) + '</span><b class="small" style="color:' + (remaining < 0 ? "var(--danger)" : "var(--accent-deep)") + '">' + (remaining < 0 ? t("تجاوزت الميزانية") + " " + moneyFmt(Math.abs(remaining)) : t("متبقي من الميزانية") + " " + moneyFmt(remaining)) + '</b></div>' + '<div class="progress"><i class="' + (remaining < 0 ? "over" : "") + '" style="width:' + Math.min(100, pct) + '%;' + (remaining < 0 ? "background:var(--danger)" : "") + '"></i></div>' : '<p class="muted small">' + (D.prefs.lang === "en" ? "Set a monthly budget to track what remains." : "حدّد ميزانية شهرية لتتابع ما تبقّى منها.") + '</p>') + '</div>' +
      '<div class="row between" style="margin-bottom:12px"><div class="row"><button class="btn" data-action="open-tx" data-type="expense">＋ ' + t("أضف مصروفاً") + '</button><button class="btn soft" data-action="open-tx" data-type="income">＋ ' + t("أضف دخلاً") + '</button></div></div>' +
      '<div class="home-cols"><div class="home-col"><div class="card"><div class="card-head"><h3>🏷️ ' + t("توزيع المصروفات") + '</h3></div>' + (catRows || emptyState("🍃", t("لا توجد حركات"), t("سجّل أول مصروف أو دخل"))) + '</div>' +
      '<div class="card"><div class="card-head"><h3>📈 ' + t("آخر ٦ أشهر") + '</h3><span class="muted tiny"><i class="legend-dot" style="background:var(--blue)"></i>' + t("الدخل") + ' <i class="legend-dot" style="background:var(--danger)"></i>' + t("المصروف") + '</span></div><div class="chart-bars">' + chart + '</div></div></div>' +
      '<div class="home-col"><div class="card"><div class="card-head"><h3>🧾 ' + t("الحركات") + '</h3><span class="muted small">' + list.length + '</span></div>' + txHtml + '</div></div></div>';
  }

  function openTransactionModal(id, forcedType) {
    var tx = id ? D.transactions.filter(function (x) { return x.id === id; })[0] : null;
    var isEdit = !!tx;
    tx = tx || { id: "", type: forcedType || "expense", amount: "", category: "food", date: todayKey(), note: "" };
    function catOptions(type, selected) {
      var map = type === "income" ? INCOME_CATS : EXPENSE_CATS;
      return Object.keys(map).map(function (c) { return '<option value="' + c + '"' + (selected === c ? " selected" : "") + '>' + map[c].em + ' ' + catLabel(c, map) + '</option>'; }).join("");
    }
    var body = '<div class="form-row"><div class="field"><label>' + t("نوع الحركة") + '</label><select class="select" name="type" id="txType"><option value="expense"' + (tx.type === "expense" ? " selected" : "") + '>' + t("مصروف") + '</option><option value="income"' + (tx.type === "income" ? " selected" : "") + '>' + t("دخل") + '</option></select></div>' +
      '<div class="field"><label>' + t("المبلغ") + '</label><input class="input" type="number" min="0" step="0.01" name="amount" required value="' + esc(tx.amount) + '" placeholder="0.00"></div></div>' +
      '<div class="form-row"><div class="field"><label>' + t("التصنيف") + '</label><select class="select" name="category" id="txCat">' + catOptions(tx.type, tx.category) + '</select></div><div class="field"><label>' + t("التاريخ") + '</label><input class="input" type="date" name="date" value="' + esc(tx.date) + '" required></div></div>' +
      '<div class="field"><label>' + t("بيان") + '</label><input class="input" name="note" maxlength="160" value="' + esc(tx.note || "") + '" placeholder="' + t("اختياري") + '"></div>';
    openModal({
      title: isEdit ? t("تعديل الحركة") : (tx.type === "income" ? t("أضف دخلاً") : t("أضف مصروفاً")),
      body: body,
      submitText: isEdit ? t("حفظ") : t("إضافة"),
      onSubmit: function (data) {
        var amount = parseFloat(data.amount);
        if (!amount || amount <= 0) return false;
        var item = isEdit ? tx : { id: uid(), createdAt: nowISO() };
        item.type = data.type || "expense";
        item.amount = amount;
        item.category = data.category || "other";
        item.date = data.date || todayKey();
        item.note = String(data.note || "").trim();
        item.updatedAt = nowISO();
        if (!isEdit) D.transactions.push(item);
        moneyMonth = item.date.slice(0, 7);
        refresh();
        toast(t("تم حفظ الحركة"));
        return true;
      }
    });
    var form = $("#modalForm");
    var typeSel = $("#txType"), catSel = $("#txCat");
    if (typeSel) typeSel.addEventListener("change", function () { catSel.innerHTML = catOptions(typeSel.value, ""); });
  }

  function deleteTransaction(id) {
    openConfirm(t("هل تحذف هذه الحركة؟"), t("سيتم حذفها نهائياً."), function () {
      D.transactions = D.transactions.filter(function (x) { return x.id !== id; });
      refresh();
      toast(t("تم حذف الحركة"));
    }, t("حذف"));
  }

  function openBudgetModal() {
    openModal({
      title: t("ميزانية الشهر"),
      body: '<div class="field"><label>' + t("المبلغ") + ' <span class="muted small">(' + (D.prefs.currency || "ر.س") + ')</span></label><input class="input" type="number" min="0" step="0.01" name="amount" value="' + esc(D.budgets[moneyMonth] || "") + '" placeholder="0.00"></div><p class="hint">' + (D.prefs.lang === "en" ? "Set 0 to remove the budget." : "اكتب 0 لإزالة الميزانية.") + '</p>',
      submitText: t("حفظ"),
      onSubmit: function (data) {
        var n = parseFloat(data.amount) || 0;
        if (n > 0) D.budgets[moneyMonth] = n; else delete D.budgets[moneyMonth];
        refresh();
        return true;
      }
    });
  }

  function reviewInfo() {
    var d = new Date(reviewCursor);
    var start, end, key;
    if (reviewType === "day") { start = end = dateKey(d); key = start; }
    else if (reviewType === "week") { start = dateKey(startOfWeek(d)); end = dateKey(endOfWeek(d)); key = start; }
    else { start = dateKey(startOfMonth(d)); end = dateKey(endOfMonth(d)); key = monthKey(d); }
    return { start: start, end: end, key: key, label: reviewType === "day" ? fmtFull(start) : reviewType === "week" ? fmtShort(start) + " — " + fmtShort(end) : fmtDate(d, { month: "long", year: "numeric" }) };
  }

  function renderReview() {
    var info = reviewInfo();
    var doneTasks = D.tasks.filter(function (x) { var k = taskDoneOn(x); return k >= info.start && k <= info.end; });
    var journals = D.journal.filter(function (j) { return j.date >= info.start && j.date <= info.end; });
    var activeGoals = D.goals.filter(function (g) { return g.status === "active"; });
    var avgGoal = activeGoals.length ? Math.round(activeGoals.reduce(function (s, g) { return s + goalProgress(g); }, 0) / activeGoals.length) : 0;
    var days = Math.round((parseKey(info.end) - parseKey(info.start)) / 86400000) + 1;
    var logDays = 0;
    for (var i = 0; i < days; i++) {
      var k = dateKey(addDays(parseKey(info.start), i));
      if (D.habits.some(function (h) { return (D.habitLogs[h.id] || {})[k] > 0; })) logDays++;
    }
    var adherence = days && D.habits.length ? Math.round(logDays / days * 100) : 0;
    var perDay = {};
    doneTasks.forEach(function (x) { var k = taskDoneOn(x); perDay[k] = (perDay[k] || 0) + 1; });
    var top = Object.keys(perDay).sort(function (a, b) { return perDay[b] - perDay[a]; }).slice(0, 5);
    var topHtml = top.length ? top.map(function (k) {
      var max = Math.max.apply(null, Object.keys(perDay).map(function (x) { return perDay[x]; }));
      return '<div class="prod-row"><span class="date">' + fmtShort(k) + '</span><span class="bar"><i style="width:' + (perDay[k] / max * 100) + '%"></i></span><b>' + perDay[k] + '</b></div>';
    }).join("") : '<p class="muted small">' + t("لا توجد بيانات كافية") + '</p>';
    var bars = "";
    var buckets = [];
    if (reviewType === "week") {
      for (var j = 0; j < 7; j++) buckets.push(dateKey(addDays(parseKey(info.start), j)));
    } else if (reviewType === "month") {
      var cur = startOfMonth(parseKey(info.start));
      while (dateKey(cur) <= info.end) { buckets.push(dateKey(cur)); cur = addDays(cur, 7); }
    } else buckets.push(info.start);
    var maxTask = Math.max(1, doneTasks.length);
    buckets.forEach(function (k) {
      var rangeEnd = reviewType === "month" ? dateKey(addDays(parseKey(k), 6)) : k;
      var n = doneTasks.filter(function (x) { var dk = taskDoneOn(x); return dk >= k && dk <= rangeEnd; }).length;
      bars += '<div class="weekbar"><i class="' + (n ? "hot" : "") + '" style="height:' + (n ? Math.max(10, n / maxTask * 100) : 5) + '%"></i><span>' + (reviewType === "day" ? weekdayShort(parseKey(k)) : reviewType === "month" ? fmtDate(parseKey(k), { day: "numeric" }) : weekdayShort(parseKey(k))) + '</span></div>';
    });
    var saved = D.reviews.filter(function (r) { return r.type === reviewType && r.period === info.key; })[0];
    var answers = saved ? saved.answers : {};
    var qs = ["ما الذي سار جيداً؟", "ما الذي يمكن تحسينه؟", "ما أهم درس تعلمته؟", "ما أول خطوة للفترة القادمة؟"];
    $("#page-review").innerHTML =
      '<div class="review-period"><div class="seg">' + [["day", t("يومي")], ["week", t("أسبوعي")], ["month", t("شهري")]].map(function (v) { return '<button class="' + (reviewType === v[0] ? "on" : "") + '" data-action="review-type" data-type="' + v[0] + '">' + v[1] + '</button>'; }).join("") + '</div>' +
      '<div class="row"><button class="icon-btn" data-action="review-prev">‹</button><b class="cal-title" style="font-size:14px">' + info.label + '</b><button class="icon-btn" data-action="review-next">›</button></div></div>' +
      '<div class="review-cards"><div class="review-card"><span class="em">✅</span><b>' + doneTasks.length + '</b><small>' + t("المهام المنجزة") + '</small></div><div class="review-card"><span class="em">🌱</span><b>' + adherence + '%</b><small>' + t("التزام العادات") + '</small></div><div class="review-card"><span class="em">🎯</span><b>' + avgGoal + '%</b><small>' + t("تطور الأهداف") + '</small></div><div class="review-card"><span class="em">📔</span><b>' + journals.length + '</b><small>' + t("اليوميات المكتوبة") + '</small></div></div>' +
      '<div class="home-cols"><div class="home-col"><div class="card"><div class="card-head"><h3>📈 ' + t("إنتاجيتك") + '</h3></div><div class="weekbars">' + bars + '</div></div>' +
      '<div class="card"><div class="card-head"><h3>🏆 ' + t("أكثر أيامك إنتاجية") + '</h3></div><div class="productivity-list">' + topHtml + '</div></div></div>' +
      '<div class="home-col"><form class="card" data-form="review" data-type="' + reviewType + '" data-period="' + info.key + '"><div class="card-head"><h3>🪞 ' + t("أسئلة للمراجعة") + '</h3><span class="muted tiny">' + (saved ? t("محفوظ") + ' · ' + fmtShort(isoToKey(saved.updatedAt)) : "") + '</span></div>' +
      qs.map(function (q, idx) { return '<div class="review-q"><label>' + t(q) + '</label><textarea class="textarea" name="q' + (idx + 1) + '" rows="2">' + esc(answers["q" + (idx + 1)] || "") + '</textarea></div>'; }).join("") +
      '<button class="btn block" type="submit">' + t("حفظ المراجعة") + '</button></form></div></div>';
  }

  function saveReview(type, period, answers) {
    var r = D.reviews.filter(function (x) { return x.type === type && x.period === period; })[0];
    if (!r) { r = { id: uid(), type: type, period: period, answers: {}, createdAt: nowISO() }; D.reviews.push(r); }
    r.answers = answers;
    r.updatedAt = nowISO();
    refresh();
    toast(t("تم حفظ المراجعة"));
  }

  function notificationState() {
    if (!("Notification" in window)) return "unsupported";
    return Notification.permission;
  }

  function nextGoalReminder() {
    var today = todayKey(), end = dateKey(addDays(new Date(), 7));
    return D.goals.filter(function (g) { return g.status === "active" && g.deadline && g.deadline >= today && g.deadline <= end; });
  }

  function renderReminders() {
    var today = todayKey(), end = dateKey(addDays(new Date(), 7));
    var items = [];
    D.tasks.filter(function (t) { return !t.done && t.date >= today && t.date <= end; }).forEach(function (t) {
      items.push({ date: t.date, time: t.time, em: "✅", title: t.title, sub: t("مهمة") + " · " + catLabel(t.category), type: "task", id: t.id });
    });
    D.events.filter(function (e) { return e.date >= today && e.date <= end; }).forEach(function (e) {
      items.push({ date: e.date, time: e.time, em: e.important ? "⭐" : "📅", title: e.title, sub: e.important ? t("مناسبة مهمة") : t("حدث شخصي"), type: "event", id: e.id });
    });
    D.habits.forEach(function (h) {
      if (!(D.habitLogs[h.id] || {})[today]) items.push({ date: today, time: D.prefs.notify.habitTime || "20:00", em: h.icon || "🌱", title: h.name, sub: t("عادة لم تُسجل"), type: "habit", id: h.id });
    });
    nextGoalReminder().forEach(function (g) {
      items.push({ date: g.deadline, time: "09:00", em: "🎯", title: g.title, sub: t("هدف يقترب موعده"), type: "goal", id: g.id });
    });
    items.sort(function (a, b) { return (a.date + " " + (a.time || "99:99")).localeCompare(b.date + " " + (b.time || "99:99")); });
    var groups = {};
    items.forEach(function (it) { (groups[it.date] = groups[it.date] || []).push(it); });
    var dates = Object.keys(groups).sort();
    var html = dates.map(function (k) {
      var label = k === today ? t("اليوم") : k === dateKey(addDays(new Date(), 1)) ? t("غداً") : fmtFull(k);
      return '<div class="task-group-title">' + esc(label) + '</div>' + groups[k].map(function (it) {
        return '<div class="rem-card"><span class="r-em">' + it.em + '</span><div class="r-body"><b>' + esc(it.title) + '</b><small>' + esc(it.sub) + '</small></div><span class="r-time">' + (it.time ? time12(it.time) : t("اليوم")) + '</span></div>';
      }).join("");
    }).join("");
    var notify = D.prefs.notify;
    var state = notificationState();
    var stateText = state === "granted" ? (notify.enabled ? t("الإشعارات مفعّلة") + " ✓" : t("الإشعارات متوقفة")) : state === "denied" ? (D.prefs.lang === "en" ? "Blocked in browser settings" : "محظورة من إعدادات المتصفح") : t("تفعيل الإشعارات");
    $("#page-reminders").innerHTML =
      '<div class="card tint"><div class="row between"><div><b style="font-size:13.5px">🔔 ' + t("تذكيراتك") + '</b><div class="muted small">' + stateText + '</div></div><div class="row"><button class="btn sm" data-action="request-notify">' + t("تفعيل الإشعارات") + '</button><button class="btn ghost sm" data-nav="settings">' + t("عرض الإعدادات") + '</button></div></div>' +
      '<div class="row muted" style="margin-top:10px;font-size:10.5px"><span class="pill">' + t("تنبيه المهام") + '</span><span class="pill">' + t("تنبيه المواعيد") + '</span><span class="pill">' + t("تنبيه العادات") + '</span><span class="pill">' + t("تنبيه الأهداف") + '</span></div></div>' +
      (html || emptyState("🌙", t("لا توجد تذكيرات قريبة"), t("كل شيء تحت السيطرة")));
  }

  function renderSettings() {
    var lock = D.prefs.journalLock;
    var sync = D.prefs.sync;
    var notify = D.prefs.notify;
    var state = notificationState();
    var displayName = user.name || (D.prefs.lang === "en" ? "My space" : "مساحتي");
    var standalone = isStandalone();
    var lastBackup = D.prefs.lastBackup ? fmtShort(isoToKey(D.prefs.lastBackup)) : "";
    $("#page-settings").innerHTML =
      '<div class="settings-grid"><div>' +
      '<div class="set-section"><h3>👤 ' + t("الملف الشخصي") + '</h3>' +
      '<div class="profile-head"><span class="profile-avatar">' + esc(String(displayName).charAt(0)) + '</span><div><b>' + esc(displayName) + '</b><div class="muted small">' + t("بياناتك محفوظة على جهازك فقط") + '</div></div></div>' +
      '<div class="field"><label>' + t("الاسم") + '</label><input class="input" id="profName" value="' + esc(user.name) + '" maxlength="80" placeholder="' + t("اسمك") + '"></div>' +
      '<button class="btn" data-action="save-profile">' + t("حفظ الملف الشخصي") + '</button></div>' +

      '<div class="set-section"><h3>🔐 ' + t("الخصوصية") + '</h3>' +
      '<div class="set-row"><div class="set-label">🔒 ' + t("قفل اليوميات") + '<small>' + t("قفل اليوميات بكلمة مرور إضافية") + '</small></div><label class="switch"><input type="checkbox" data-setting="journalLock"' + (lock.enabled ? " checked" : "") + '><span class="slider"></span></label></div></div>' +

      '<div class="set-section"><h3>🎨 ' + t("المظهر") + '</h3>' +
      '<div class="set-row"><span class="set-label">' + t("الوضع") + '</span><div class="seg">' + [["light", t("نهاري")], ["dark", t("ليلي")], ["auto", t("تلقائي")]].map(function (x) { return '<button class="' + (D.prefs.theme === x[0] ? "on" : "") + '" data-action="set-theme" data-theme="' + x[0] + '">' + x[1] + '</button>'; }).join("") + '</div></div>' +
      '<div class="set-row"><span class="set-label">' + t("اللون الأساسي") + '</span><div class="accent-row">' + ACCENTS.map(function (a) { return '<button class="accent-dot ' + (D.prefs.accent === a.id ? "on" : "") + '" data-action="set-accent" data-accent="' + a.id + '" style="background:' + a.color + '" aria-label="' + a.id + '"></button>'; }).join("") + '</div></div>' +
      '<div class="set-row"><span class="set-label">' + t("اللغة") + '</span><select class="select" data-setting="lang" style="width:auto"><option value="ar"' + (D.prefs.lang === "ar" ? " selected" : "") + '>العربية</option><option value="en"' + (D.prefs.lang === "en" ? " selected" : "") + '>English</option></select></div>' +
      '<div class="set-row"><span class="set-label">' + t("حجم الخط") + '</span><div class="seg"><button data-action="font-dec">ا−</button><button class="on">' + Math.round(D.prefs.fs * 100) + '%</button><button data-action="font-inc">ا＋</button></div></div>' +
      '<div class="set-row"><span class="set-label">' + t("العملة") + '</span><input class="input" data-setting="currency" value="' + esc(D.prefs.currency || "ر.س") + '" style="width:90px;text-align:center"></div></div>' +

      '<div class="set-section"><h3>🔔 ' + t("الإشعارات") + '</h3>' +
      '<div class="set-row"><div class="set-label">' + t("تفعيل الإشعارات") + '<small>' + (state === "unsupported" ? t("المتصفح لا يدعم الإشعارات") : state === "denied" ? (D.prefs.lang === "en" ? "Blocked in browser settings" : "محظورة من إعدادات المتصفح") : state === "granted" ? t("الإشعارات مفعّلة") : t("تفعيل الإشعارات")) + '</small></div><label class="switch"><input type="checkbox" data-setting="notifyEnabled"' + (notify.enabled ? " checked" : "") + '><span class="slider"></span></label></div>' +
      '<div class="set-row"><span class="set-label">' + t("تنبيه المهام") + '</span><label class="switch"><input type="checkbox" data-setting="notifyTasks"' + (notify.tasks ? " checked" : "") + '><span class="slider"></span></label></div>' +
      '<div class="set-row"><span class="set-label">' + t("تنبيه المواعيد") + '</span><label class="switch"><input type="checkbox" data-setting="notifyEvents"' + (notify.events ? " checked" : "") + '><span class="slider"></span></label></div>' +
      '<div class="set-row"><span class="set-label">' + t("تنبيه العادات") + '</span><label class="switch"><input type="checkbox" data-setting="notifyHabits"' + (notify.habits ? " checked" : "") + '><span class="slider"></span></label></div>' +
      '<div class="set-row"><span class="set-label">' + t("تنبيه الأهداف") + '</span><label class="switch"><input type="checkbox" data-setting="notifyGoals"' + (notify.goals ? " checked" : "") + '><span class="slider"></span></label></div>' +
      '<div class="set-row"><span class="set-label">' + t("التنبيه قبل الموعد") + '</span><select class="select" data-setting="leadMin" style="width:auto">' + [0, 5, 10, 15, 30, 60].map(function (m) { return '<option value="' + m + '"' + (+notify.leadMin === m ? " selected" : "") + '>' + (m ? m + " " + t("دقائق") : t("الآن")) + '</option>'; }).join("") + '</select></div>' +
      '<div class="set-row"><span class="set-label">' + t("وقت تذكير العادات") + '</span><input class="input" type="time" data-setting="habitTime" value="' + esc(notify.habitTime || "20:00") + '" style="width:110px"></div>' +
      '<button class="btn ghost sm" data-action="request-notify">' + t("تفعيل الإشعارات") + '</button></div></div><div>' +

      '<div class="set-section"><h3>💾 ' + t("البيانات والنسخ الاحتياطي") + '</h3>' +
      '<div class="row" style="margin-bottom:9px"><button class="btn soft sm" data-action="export-data">⬇️ ' + t("تصدير نسخة احتياطية") + '</button><button class="btn ghost sm" data-action="import-click">⬆️ ' + t("استيراد نسخة احتياطية") + '</button><input class="file-input" id="importFile" type="file" accept="application/json,.json"></div>' +
      '<p class="hint">' + t("بياناتك محفوظة على جهازك فقط") + ' · ' + (lastBackup ? t("آخر نسخة احتياطية") + ": " + lastBackup : t("لم تُنشأ نسخة بعد")) + '.</p></div>' +

      '<div class="set-section"><h3>📲 ' + t("التطبيق") + '</h3>' +
      (standalone ? '<p class="hint">' + t("التطبيق مثبت ويعمل دون اتصال.") + '</p>' : '<div class="row" style="margin-bottom:9px"><button class="btn ghost sm" data-action="install-app">📲 ' + t("تثبيت التطبيق") + '</button></div><p class="hint">' + t("لتثبيت التطبيق، افتح قائمة المتصفح ثم اختر «إضافة إلى الشاشة الرئيسية».") + '</p>') + '</div>' +

      '<div class="set-section"><h3>☁️ ' + t("المزامنة السحابية") + '</h3>' +
      '<div class="field"><label>' + t("رابط الخادم (WebDAV)") + '</label><input class="input" id="syncUrl" value="' + esc(sync.url || "") + '" placeholder="https://..."></div>' +
      '<div class="form-row"><div class="field"><label>' + t("اسم المستخدم") + '</label><input class="input" id="syncUser" value="' + esc(sync.user || "") + '" autocomplete="off"></div><div class="field"><label>' + t("كلمة المرور") + '</label><input class="input" id="syncPass" type="password" value="' + esc(sync.pass || "") + '" autocomplete="off"></div></div>' +
      '<div class="set-row" style="border:0;padding-top:0"><div class="set-label">' + t("تفعيل المزامنة التلقائية") + '</div><label class="switch"><input type="checkbox" data-setting="syncEnabled"' + (sync.enabled ? " checked" : "") + '><span class="slider"></span></label></div>' +
      '<div class="row" style="margin-top:8px"><button class="btn sm" data-action="save-sync">' + t("حفظ إعدادات المزامنة") + '</button><button class="btn soft sm" data-action="sync-upload">⬆️ ' + t("رفع الآن") + '</button><button class="btn ghost sm" data-action="sync-download">⬇️ ' + t("تنزيل الآن") + '</button></div>' +
      '<p class="hint">' + t("اختياري: يدعم WebDAV أو أي رابط JSON يقبل CORS") + '. ' + (sync.lastAt ? t("محفوظ") + ': ' + fmtShort(isoToKey(sync.lastAt)) : "") + '</p></div>' +

      '<div class="set-section danger-zone"><h3>⚠️ ' + t("البيانات") + '</h3><div class="row"><button class="btn ghost sm" data-action="delete-data">🗑️ ' + t("حذف كل البيانات") + '</button></div><p class="hint">' + t("سيُحذف كل محتوى دفترك من هذا الجهاز.") + '</p></div>' +

      '<div class="set-section about-box"><div class="em">📔</div><b>دفتر</b><p>' + t("دفتر ليس مجرد تطبيق لإدارة الوقت. اجعله مكاناً تعود إليه بعد سنوات لتجد أهدافك وأفكارك وذكرياتك.") + '</p><p style="margin-top:8px">v1.0</p></div></div></div>';
    var imp = $("#importFile");
    if (imp) imp.addEventListener("change", onImportFile);
  }

  function openJournalLockSetup() {
    openModal({
      title: t("قفل اليوميات"),
      body: '<p class="muted small" style="margin-bottom:10px">' + t("أدخل رمزاً من ٤ أرقام على الأقل") + '</p><div class="field"><label>' + t("رمز القفل") + '</label><input class="input" type="password" inputmode="numeric" name="pin" minlength="4" required autocomplete="new-password"></div><div class="field"><label>' + t("تأكيد الرمز") + '</label><input class="input" type="password" inputmode="numeric" name="confirm" minlength="4" required autocomplete="new-password"></div>',
      submitText: t("إضافة قفل"),
      onSubmit: async function (data) {
        var pin = String(data.pin || "");
        if (pin.length < 4) { toast(t("أدخل رمزاً من ٤ أرقام على الأقل")); return false; }
        if (pin !== data.confirm) { toast(t("كلمتا المرور غير متطابقتين")); return false; }
        var salt = uid();
        var h = await hashText(salt, pin);
        D.prefs.journalLock = { enabled: true, pinHash: h, salt: salt };
        journalUnlocked = true;
        saveData();
        renderPage(currentPage);
        toast(t("تم تفعيل قفل اليوميات"));
        return true;
      }
    });
  }

  function removeJournalLock() {
    openModal({
      title: t("إزالة القفل"),
      body: '<div class="field"><label>' + t("كلمة المرور") + '</label><input class="input" type="password" inputmode="numeric" name="pin" required autocomplete="current-password"></div>',
      submitText: t("إزالة القفل"),
      danger: true,
      onSubmit: async function (data) {
        var lock = D.prefs.journalLock;
        var h = await hashText(lock.salt, String(data.pin || ""));
        if (h !== lock.pinHash) { toast(t("كلمة المرور غير صحيحة")); return false; }
        D.prefs.journalLock = { enabled: false, pinHash: "", salt: "" };
        journalUnlocked = false;
        saveData();
        renderPage(currentPage);
        toast(t("تم إزالة القفل"));
        return true;
      }
    });
  }

  async function saveProfile() {
    var name = $("#profName").value.trim();
    if (!name) { toast(t("أكمل جميع الحقول")); return; }
    user.name = name;
    var ru = root.users.filter(function (x) { return x.id === user.id; })[0];
    if (ru) ru.name = name;
    saveRoot();
    renderChrome();
    renderSettings();
    toast(t("تم تحديث الملف الشخصي"));
  }

  async function changePassword() {
    var cur = $("#pwCurrent").value, nw = $("#pwNew").value, cf = $("#pwConfirm").value;
    if (!cur || !nw || !cf) { toast(t("أكمل جميع الحقول")); return; }
    var curHash = await hashText(user.salt, cur);
    if (curHash !== user.hash) { toast(t("كلمة المرور الحالية غير صحيحة")); return; }
    if (nw.length < 4) { toast(t("كلمة المرور قصيرة")); return; }
    if (nw !== cf) { toast(t("كلمتا المرور غير متطابقتين")); return; }
    user.salt = uid();
    user.hash = await hashText(user.salt, nw);
    var ru = root.users.filter(function (x) { return x.id === user.id; })[0];
    if (ru) { ru.salt = user.salt; ru.hash = user.hash; }
    saveRoot();
    renderSettings();
    toast(t("تم تغيير كلمة المرور"));
  }

  async function requestNotifications() {
    if (!("Notification" in window)) { toast(t("المتصفح لا يدعم الإشعارات")); return; }
    try {
      var perm = await Notification.requestPermission();
      if (perm === "granted") {
        D.prefs.notify.enabled = true;
        saveData();
        scheduleNotifications();
        toast(t("تم تفعيل الإشعارات"));
      } else {
        D.prefs.notify.enabled = false;
        saveData();
        toast(t("لم يُسمح بالإشعارات"));
      }
    } catch (e) { toast(t("لم يُسمح بالإشعارات")); }
    if (currentPage === "settings") renderSettings();
    if (currentPage === "reminders") renderReminders();
  }

  function backupPayload() {
    return { app: "daftar", version: VERSION, exportedAt: nowISO(), user: { name: user.name, email: user.email }, data: D };
  }

  function exportData() {
    var blob = new Blob([JSON.stringify(backupPayload(), null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "daftar-backup-" + todayKey() + ".json";
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    D.prefs.lastBackup = nowISO();
    saveData();
    if (currentPage === "settings") renderSettings();
    toast(t("تم تصدير النسخة"));
  }

  function normalizeData(d) {
    var base = defaultData();
    var out = Object.assign(base, d || {});
    ["tasks", "events", "journal", "goals", "habits", "lists", "notes", "transactions", "reviews"].forEach(function (k) { if (!Array.isArray(out[k])) out[k] = base[k]; });
    if (!out.habitLogs || typeof out.habitLogs !== "object") out.habitLogs = {};
    if (!out.budgets || typeof out.budgets !== "object") out.budgets = {};
    out.prefs = Object.assign({}, base.prefs, out.prefs || {});
    out.prefs.notify = Object.assign({}, base.prefs.notify, out.prefs.notify || {});
    out.prefs.journalLock = Object.assign({}, base.prefs.journalLock, out.prefs.journalLock || {});
    out.prefs.sync = Object.assign({}, base.prefs.sync, out.prefs.sync || {});
    out.meta = Object.assign({}, base.meta, out.meta || {});
    return out;
  }

  function applyImported(d) {
    D = normalizeData(d);
    saveData();
    journalUnlocked = false;
    applyPrefs();
    renderChrome();
    renderPage(currentPage);
    scheduleNotifications();
    toast(t("تم استيراد البيانات"));
  }

  function onImportFile(e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var parsed = JSON.parse(reader.result);
        var data = parsed.data || parsed;
        if (!data || typeof data !== "object") throw new Error("bad");
        openConfirm(t("هل تستبدل بياناتك الحالية؟"), t("سيتم استبدال كل البيانات الحالية بالنسخة المستوردة."), function () {
          applyImported(data);
        }, t("استعادة"));
      } catch (err) {
        toast(t("ملف غير صالح"));
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  }

  function syncHeaders() {
    var h = { "Content-Type": "application/json" };
    if (D.prefs.sync.user) {
      try { h.Authorization = "Basic " + btoa(unescape(encodeURIComponent(D.prefs.sync.user + ":" + (D.prefs.sync.pass || "")))); } catch (e) {}
    }
    return h;
  }

  async function syncUpload(silent) {
    if (!user || !D.prefs.sync.url) { if (!silent) toast(t("تعذّرت المزامنة")); return false; }
    try {
      var res = await fetch(D.prefs.sync.url, { method: "PUT", headers: syncHeaders(), body: JSON.stringify(backupPayload()) });
      if (!res.ok) throw new Error("http");
      D.prefs.sync.lastAt = nowISO();
      saveData();
      if (!silent) toast(t("تم رفع النسخة"));
      return true;
    } catch (e) {
      if (!silent) toast(t("تعذّرت المزامنة"));
      return false;
    }
  }

  async function syncDownload() {
    if (!D.prefs.sync.url) { toast(t("تعذّرت المزامنة")); return; }
    try {
      var res = await fetch(D.prefs.sync.url, { headers: syncHeaders() });
      if (!res.ok) throw new Error("http");
      var parsed = await res.json();
      var data = parsed.data || parsed;
      if (!data || typeof data !== "object") throw new Error("bad");
      openConfirm(t("هل تستبدل بياناتك الحالية؟"), t("سيتم استبدال كل البيانات الحالية بالنسخة المستوردة."), function () {
        applyImported(data);
        toast(t("تم تنزيل النسخة"));
      }, t("استعادة"));
    } catch (e) { toast(t("تعذّرت المزامنة")); }
  }

  function saveSyncSettings() {
    D.prefs.sync.url = ($("#syncUrl") || {}).value || "";
    D.prefs.sync.user = ($("#syncUser") || {}).value || "";
    D.prefs.sync.pass = ($("#syncPass") || {}).value || "";
    var en = $('[data-setting="syncEnabled"]');
    D.prefs.sync.enabled = !!(en && en.checked);
    saveData();
    toast(t("تم حفظ التعديلات"));
  }

  function deleteAllData() {
    openConfirm(t("هل تحذف كل البيانات؟"), t("سيبقى حسابك لكن ستُمسح كل محتوياته."), function () {
      var prefs = D.prefs;
      D = defaultData();
      D.prefs = prefs;
      saveDraft(null);
      journalUnlocked = false;
      saveData();
      applyPrefs();
      renderPage(currentPage);
      toast(t("تم مسح البيانات"));
    }, t("حذف كل البيانات"));
  }

  function deleteAccount() {
    openConfirm(t("هل تحذف الحساب نهائياً؟"), t("سيُحذف حسابك وكل بياناتك من هذا الجهاز."), function () {
      try { localStorage.removeItem(DATA_PREFIX + user.id); localStorage.removeItem(DRAFT_PREFIX + user.id); } catch (e) {}
      root.users = root.users.filter(function (x) { return x.id !== user.id; });
      root.session = null;
      saveRoot();
      user = null;
      D = null;
      journalUnlocked = false;
      document.getElementById("shell").hidden = true;
      showAuth();
      toast(t("تم حذف الحساب"));
    }, t("حذف نهائي"));
  }

  function updateNotifySetting(key, value) {
    if (key === "enabled") D.prefs.notify.enabled = value;
    if (key === "tasks") D.prefs.notify.tasks = value;
    if (key === "events") D.prefs.notify.events = value;
    if (key === "habits") D.prefs.notify.habits = value;
    if (key === "goals") D.prefs.notify.goals = value;
    if (key === "leadMin") D.prefs.notify.leadMin = safeInt(value, 10);
    if (key === "habitTime") D.prefs.notify.habitTime = value;
    saveData();
    scheduleNotifications();
  }

  function nextAt(datek, time, lead) {
    if (!datek || !time) return null;
    var d = parseKey(datek);
    var p = String(time).split(":");
    d.setHours(+p[0] || 0, +p[1] || 0, 0, 0);
    return d.getTime() - (lead || 0) * 60000;
  }

  function scheduleNotifications() {
    notifTimers.forEach(clearTimeout);
    notifTimers = [];
    if (!D || !D.prefs.notify.enabled) return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    var n = D.prefs.notify;
    var now = Date.now();
    function add(ms, title, body, tag) {
      if (!ms || ms <= now || ms - now > 86400000) return;
      notifTimers.push(setTimeout(function () {
        try { new Notification(title, { body: body, tag: tag, icon: "icon.svg" }); } catch (e) {}
        toast("🔔 " + title);
        haptic(200);
      }, ms - now));
    }
    if (n.tasks) {
      D.tasks.filter(function (t) { return !t.done && t.time && t.date >= todayKey(); }).forEach(function (t) {
        add(nextAt(t.date, t.time, n.leadMin), t.title, t("مهمة") + " · " + time12(t.time), "task-" + t.id);
      });
    }
    if (n.events) {
      D.events.filter(function (e) { return e.time && e.date >= todayKey(); }).forEach(function (e) {
        add(nextAt(e.date, e.time, e.remind == null ? n.leadMin : e.remind), e.title, t("موعد") + " · " + time12(e.time), "event-" + e.id);
      });
    }
    if (n.habits && n.habitTime) {
      var hd = D.habits.filter(function (h) { return !(D.habitLogs[h.id] || {})[todayKey()]; });
      if (hd.length) add(nextAt(todayKey(), n.habitTime, 0), t("تذكير بالعادات"), hd.map(function (h) { return h.name; }).slice(0, 3).join("، "), "habits");
    }
    if (n.goals) {
      D.goals.filter(function (g) { return g.status === "active" && g.deadline; }).forEach(function (g) {
        add(nextAt(g.deadline, "09:00", 0), g.title, t("هدف يقترب موعده"), "goal-" + g.id);
      });
    }
  }

  function setupAutoTimers() {
    if (setupAutoTimers._done) return;
    setupAutoTimers._done = true;
    setInterval(function () {
      if (!D || document.hidden) return;
      if (currentPage === "home") renderHome();
      if (currentPage === "reminders") renderReminders();
    }, 120000);
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && D) { scheduleNotifications(); renderChrome(); }
    });
  }

  function searchAll(q) {
    q = String(q || "").trim().toLowerCase();
    if (!q) return [];
    var groups = [];
    var tasks = D.tasks.filter(function (x) { return (x.title + " " + (x.desc || "")).toLowerCase().indexOf(q) !== -1; }).slice(0, 5);
    if (tasks.length) groups.push({ label: t("المهام"), items: tasks.map(function (x) { return { em: x.done ? "✅" : "📌", title: x.title, sub: fmtShort(x.date) + " · " + prioLabel(x.priority), type: "task", id: x.id, page: "tasks" }; }) });
    var events = D.events.filter(function (x) { return (x.title + " " + (x.desc || "")).toLowerCase().indexOf(q) !== -1; }).slice(0, 5);
    if (events.length) groups.push({ label: t("التقويم"), items: events.map(function (x) { return { em: "📅", title: x.title, sub: fmtShort(x.date), type: "event", id: x.id, page: "calendar", date: x.date }; }) });
    if (!(D.prefs.journalLock.enabled && !journalUnlocked)) {
      var js = D.journal.filter(function (x) { return (x.title + " " + x.body).toLowerCase().indexOf(q) !== -1; }).slice(0, 5);
      if (js.length) groups.push({ label: t("اليوميات"), items: js.map(function (x) { return { em: moodOf(x.mood).em, title: x.title || t("بدون عنوان"), sub: fmtShort(x.date), type: "journal", id: x.id, page: "journal" }; }) });
    }
    var goals = D.goals.filter(function (x) { return (x.title + " " + (x.desc || "")).toLowerCase().indexOf(q) !== -1; }).slice(0, 5);
    if (goals.length) groups.push({ label: t("الأهداف"), items: goals.map(function (x) { return { em: "🎯", title: x.title, sub: goalProgress(x) + "%", type: "goal", id: x.id, page: "goals" }; }) });
    var habits = D.habits.filter(function (x) { return x.name.toLowerCase().indexOf(q) !== -1; }).slice(0, 5);
    if (habits.length) groups.push({ label: t("العادات"), items: habits.map(function (x) { return { em: x.icon || "🌱", title: x.name, sub: t("سلسلة الأيام") + ": " + habitStreak(x.id), type: "habit", id: x.id, page: "habits" }; }) });
    var listItems = [];
    D.lists.forEach(function (l) { (l.items || []).forEach(function (it) { if ((it.text + " " + (it.note || "")).toLowerCase().indexOf(q) !== -1) listItems.push({ list: l, item: it }); }); });
    if (listItems.length) groups.push({ label: t("القوائم"), items: listItems.slice(0, 5).map(function (x) { return { em: x.list.icon || "📋", title: x.item.text, sub: listName(x.list), type: "listitem", id: x.list.id, page: "lists" }; }) });
    var notes = D.notes.filter(function (x) { return (x.title + " " + x.body).toLowerCase().indexOf(q) !== -1; }).slice(0, 5);
    if (notes.length) groups.push({ label: t("الملاحظات"), items: notes.map(function (x) { return { em: "🗒️", title: x.title || t("بدون عنوان"), sub: x.body.slice(0, 70), type: "note", id: x.id, page: "notes" }; }) });
    var txs = D.transactions.filter(function (x) { return ((x.note || "") + " " + catLabel(x.category, x.type === "income" ? INCOME_CATS : EXPENSE_CATS)).toLowerCase().indexOf(q) !== -1; }).slice(0, 5);
    if (txs.length) groups.push({ label: t("المصروفات"), items: txs.map(function (x) { return { em: x.type === "income" ? "💵" : "🧾", title: x.note || catLabel(x.category, x.type === "income" ? INCOME_CATS : EXPENSE_CATS), sub: moneyFmt(x.amount) + " " + (D.prefs.currency || "ر.س"), type: "tx", id: x.id, page: "money" }; }) });
    return groups;
  }

  function searchMarkup(groups) {
    if (!groups.length) return emptyState("🔍", t("لا توجد نتائج"), t("جرّب كلمة أخرى"));
    return groups.map(function (g) {
      return '<div class="search-group"><h4>' + esc(g.label) + '</h4>' + g.items.map(function (it) {
        return '<button type="button" class="search-item" data-action="search-open" data-type="' + esc(it.type) + '" data-id="' + esc(it.id) + '" data-page="' + esc(it.page) + '"' + (it.date ? ' data-date="' + esc(it.date) + '"' : '') + '><span class="em">' + it.em + '</span><span style="min-width:0"><b>' + esc(it.title) + '</b><small>' + esc(it.sub || "") + '</small></span><span class="go">↗</span></button>';
      }).join("") + '</div>';
    }).join("");
  }

  function openSearchModal() {
    openModal({
      title: "🔍 " + t("بحث شامل"),
      body: '<div class="search-box"><input class="input" id="globalSearch" placeholder="' + t("اكتب كلمة للبحث في المهام واليوميات والملاحظات...") + '" autocomplete="off"></div><div class="search-results" id="globalResults">' + emptyState("🔍", t("بحث في كل شيء"), t("المهام، اليوميات، الملاحظات، القوائم...")) + '</div>',
      submitText: false,
      footer: false
    });
    var input = $("#globalSearch");
    if (input) {
      input.focus();
      input.addEventListener("input", function () {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(function () {
          var mount = $("#globalResults");
          if (mount) mount.innerHTML = searchMarkup(searchAll(input.value));
        }, 160);
      });
      input.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
    }
  }

  function handleSearchOpen(el) {
    var type = el.getAttribute("data-type");
    var id = el.getAttribute("data-id");
    var page = el.getAttribute("data-page");
    var date = el.getAttribute("data-date");
    closeModal();
    if (page === "journal" && D.prefs.journalLock.enabled && !journalUnlocked) { navigate("journal"); return; }
    if (type === "event" && date) { calSel = date; calCursor = parseKey(date); }
    if (page === "lists") { listOpen = id; }
    navigate(page);
    setTimeout(function () {
      if (type === "task") openTaskModal(id);
      else if (type === "event") openEventModal(id);
      else if (type === "journal") openJournalModal(id);
      else if (type === "goal") openGoalModal(id);
      else if (type === "habit") openHabitModal(id);
      else if (type === "note") openNoteModal(id);
      else if (type === "tx") { var x = D.transactions.filter(function (t) { return t.id === id; })[0]; if (x) openTransactionModal(id); }
    }, 80);
  }

  function openModal(opts) {
    closeModal();
    var root = document.getElementById("modalRoot");
    var footer = opts.footer === false ? "" : '<div class="modal-foot"><button type="button" class="btn ghost" data-modal-close>' + t("إلغاء") + '</button><button type="submit" form="modalForm" class="btn ' + (opts.danger ? "danger" : "") + '">' + esc(opts.submitText || t("حفظ")) + '</button></div>';
    root.innerHTML = '<div class="modal-back"><div class="modal ' + (opts.size || "") + '"><div class="modal-head"><h3>' + esc(opts.title || "") + '</h3><button type="button" class="modal-close" data-modal-close aria-label="' + t("إغلاق") + '">✕</button></div>' +
      '<form class="modal-body" id="modalForm" novalidate>' + (opts.body || "") + '</form>' + footer + '</div></div>';
    document.body.style.overflow = "hidden";
    var back = $(".modal-back", root);
    if (back) back.addEventListener("mousedown", function (e) { if (e.target === back) closeModal(); });
    $$("[data-modal-close]", root).forEach(function (b) { b.addEventListener("click", closeModal); });
    var form = $("#modalForm");
    if (form) {
      form.addEventListener("submit", async function (e) {
        e.preventDefault();
        if (!opts.onSubmit) return;
        var data = {};
        try { new FormData(form).forEach(function (v, k) { data[k] = v; }); } catch (err) {}
        var ok = await opts.onSubmit(data, form);
        if (ok !== false) closeModal();
      });
      var first = form.querySelector("input:not([type=hidden]):not([type=checkbox]),textarea,select");
      if (first && opts.focus !== false) setTimeout(function () { try { first.focus(); } catch (e) {} }, 80);
    }
  }

  function closeModal() {
    var root = document.getElementById("modalRoot");
    if (root) root.innerHTML = "";
    document.body.style.overflow = "";
  }

  function openConfirm(title, msg, onYes, yesLabel) {
    openModal({
      title: title,
      body: '<p class="muted" style="font-size:13.5px;line-height:1.9">' + esc(msg) + '</p>',
      submitText: yesLabel || t("تأكيد"),
      danger: true,
      onSubmit: function () { onYes(); return true; }
    });
  }

  function openOrigin() {
    var action = arguments[0];
    switch (action) {
      case "logout": logout(); break;
      case "open-drawer": openDrawer(); break;
      case "open-task": openTaskModal(); break;
      case "edit-task": openTaskModal(arguments[1]); break;
      case "toggle-task": toggleTask(arguments[1]); break;
      case "delete-task": deleteTask(arguments[1]); break;
      case "postpone-task": postponeTask(arguments[1]); break;
      case "task-view": taskView = arguments[1]; renderTasks(); break;
      case "cal-view": calView = arguments[1]; renderCalendar(); break;
      case "cal-prev": adjustCalendar(-1); break;
      case "cal-next": adjustCalendar(1); break;
      case "cal-today": calCursor = new Date(); calSel = todayKey(); renderCalendar(); break;
      case "cal-select": calSel = arguments[1]; calCursor = parseKey(calSel); renderCalendar(); break;
      case "open-event": openEventModal(); break;
      case "edit-event": openEventModal(arguments[1]); break;
      case "delete-event": deleteEvent(arguments[1]); break;
      case "open-journal": openJournalModal(); break;
      case "edit-journal": openJournalModal(arguments[1]); break;
      case "delete-journal": deleteJournal(arguments[1]); break;
      case "journal-unlock": unlockJournal(); break;
      case "journal-lock-now": journalUnlocked = false; renderJournal(); break;
      case "open-journal-lock": openJournalLockSetup(); break;
      case "open-goal": openGoalModal(); break;
      case "edit-goal": openGoalModal(arguments[1]); break;
      case "delete-goal": deleteGoal(arguments[1]); break;
      case "goal-filter": goalFilter = arguments[1]; renderGoals(); break;
      case "toggle-goal-status": toggleGoalStatus(arguments[1]); break;
      case "finish-goal": finishGoal(arguments[1]); break;
      case "toggle-step": toggleGoalStep(arguments[1], arguments[2]); break;
      case "delete-step": deleteGoalStep(arguments[1], arguments[2]); break;
      case "open-habit": openHabitModal(); break;
      case "edit-habit": openHabitModal(arguments[1]); break;
      case "delete-habit": deleteHabit(arguments[1]); break;
      case "log-habit": logHabit(arguments[1]); break;
      case "reset-habit": resetHabit(arguments[1]); break;
      case "open-list": listOpen = arguments[1]; listFilter = ""; renderLists(); break;
      case "back-lists": listOpen = null; listFilter = ""; renderLists(); break;
      case "open-list-modal": openListModal(); break;
      case "edit-list": openListModal(arguments[1]); break;
      case "delete-list": deleteList(arguments[1]); break;
      case "toggle-list-item": toggleListItem(arguments[1], arguments[2]); break;
      case "edit-list-item": openListItemModal(arguments[1], arguments[2]); break;
      case "delete-list-item": deleteListItem(arguments[1], arguments[2]); break;
      case "open-note": openNoteModal(); break;
      case "edit-note": openNoteModal(arguments[1]); break;
      case "delete-note": deleteNote(arguments[1]); break;
      case "pin-note": pinNote(arguments[1]); break;
      case "notes-cat": notesCat = arguments[1]; renderNotes(); break;
      case "open-tx": openTransactionModal(null, arguments[1]); break;
      case "edit-tx": openTransactionModal(arguments[1]); break;
      case "delete-tx": deleteTransaction(arguments[1]); break;
      case "edit-budget": openBudgetModal(); break;
      case "money-prev": moneyMonth = monthKey(addMonths(parseKey(moneyMonth + "-01"), -1)); renderMoney(); break;
      case "money-next": moneyMonth = monthKey(addMonths(parseKey(moneyMonth + "-01"), 1)); renderMoney(); break;
      case "review-type": reviewType = arguments[1]; reviewCursor = new Date(); renderReview(); break;
      case "review-prev": adjustReview(-1); break;
      case "review-next": adjustReview(1); break;
      case "request-notify": requestNotifications(); break;
      case "set-theme": D.prefs.theme = arguments[1]; saveData(); applyPrefs(); renderChrome(); renderSettings(); break;
      case "set-accent": D.prefs.accent = arguments[1]; saveData(); applyPrefs(); renderChrome(); renderSettings(); break;
      case "font-dec": D.prefs.fs = Math.max(0.85, Math.round((D.prefs.fs - 0.05) * 100) / 100); saveData(); applyPrefs(); renderSettings(); break;
      case "font-inc": D.prefs.fs = Math.min(1.25, Math.round((D.prefs.fs + 0.05) * 100) / 100); saveData(); applyPrefs(); renderSettings(); break;
      case "save-profile": saveProfile(); break;
      case "change-password": changePassword(); break;
      case "export-data": exportData(); break;
      case "install-app": installApp(); break;
      case "import-click": { var fi = $("#importFile"); if (fi) fi.click(); break; }
      case "save-sync": saveSyncSettings(); break;
      case "sync-upload": syncUpload(false); break;
      case "sync-download": syncDownload(); break;
      case "delete-data": deleteAllData(); break;
      case "delete-account": deleteAccount(); break;
      case "search-open": handleSearchOpen(arguments[3]); break;
    }
  }

  function toggleListItem(listId, itemId) {
    var l = D.lists.filter(function (x) { return x.id === listId; })[0];
    if (!l) return;
    var it = (l.items || []).filter(function (x) { return x.id === itemId; })[0];
    if (!it) return;
    it.done = !it.done;
    it.updatedAt = nowISO();
    refresh();
    haptic();
  }

  function pinNote(id) {
    var n = D.notes.filter(function (x) { return x.id === id; })[0];
    if (!n) return;
    n.pinned = !n.pinned;
    n.updatedAt = nowISO();
    refresh();
  }

  function adjustCalendar(dir) {
    if (calView === "month") calCursor = addMonths(calCursor, dir);
    else if (calView === "week") calCursor = addDays(calCursor, dir * 7);
    else { calSel = dateKey(addDays(parseKey(calSel), dir)); calCursor = parseKey(calSel); }
    if (calView === "day") calCursor = parseKey(calSel);
    renderCalendar();
  }

  function adjustReview(dir) {
    if (reviewType === "day") reviewCursor = addDays(reviewCursor, dir);
    else if (reviewType === "week") reviewCursor = addDays(reviewCursor, dir * 7);
    else reviewCursor = addMonths(reviewCursor, dir);
    renderReview();
  }

  function handleAction(el) {
    var action = el.getAttribute("data-action");
    if (!action) return;
    var ds = el.dataset || {};
    switch (action) {
      case "logout": logout(); break;
      case "open-drawer": openDrawer(); break;
      case "open-task": openTaskModal(); break;
      case "edit-task": openTaskModal(ds.id); break;
      case "toggle-task": toggleTask(ds.id); break;
      case "delete-task": deleteTask(ds.id); break;
      case "postpone-task": postponeTask(ds.id); break;
      case "task-view": taskView = ds.view; renderTasks(); break;
      case "cal-view": calView = ds.view; renderCalendar(); break;
      case "cal-prev": adjustCalendar(-1); break;
      case "cal-next": adjustCalendar(1); break;
      case "cal-today": calCursor = new Date(); calSel = todayKey(); renderCalendar(); break;
      case "cal-select": calSel = ds.date; calCursor = parseKey(calSel); renderCalendar(); break;
      case "open-event": openEventModal(); break;
      case "edit-event": openEventModal(ds.id); break;
      case "delete-event": deleteEvent(ds.id); break;
      case "open-journal": openJournalModal(); break;
      case "edit-journal": openJournalModal(ds.id); break;
      case "delete-journal": deleteJournal(ds.id); break;
      case "journal-unlock": unlockJournal(); break;
      case "journal-lock-now": journalUnlocked = false; renderJournal(); break;
      case "open-journal-lock": openJournalLockSetup(); break;
      case "open-goal": openGoalModal(); break;
      case "edit-goal": openGoalModal(ds.id); break;
      case "delete-goal": deleteGoal(ds.id); break;
      case "goal-filter": goalFilter = ds.filter; renderGoals(); break;
      case "toggle-goal-status": toggleGoalStatus(ds.id); break;
      case "finish-goal": finishGoal(ds.id); break;
      case "toggle-step": toggleGoalStep(ds.goal, ds.step); break;
      case "delete-step": deleteGoalStep(ds.goal, ds.step); break;
      case "open-habit": openHabitModal(); break;
      case "edit-habit": openHabitModal(ds.id); break;
      case "delete-habit": deleteHabit(ds.id); break;
      case "log-habit": logHabit(ds.id); break;
      case "reset-habit": resetHabit(ds.id); break;
      case "open-list": listOpen = ds.id; listFilter = ""; renderLists(); break;
      case "back-lists": listOpen = null; listFilter = ""; renderLists(); break;
      case "open-list-modal": openListModal(); break;
      case "edit-list": openListModal(ds.id); break;
      case "delete-list": deleteList(ds.id); break;
      case "toggle-list-item": toggleListItem(ds.list, ds.id); break;
      case "edit-list-item": openListItemModal(ds.list, ds.id); break;
      case "delete-list-item": deleteListItem(ds.list, ds.id); break;
      case "open-note": openNoteModal(); break;
      case "edit-note": openNoteModal(ds.id); break;
      case "delete-note": deleteNote(ds.id); break;
      case "pin-note": pinNote(ds.id); break;
      case "notes-cat": notesCat = ds.cat; renderNotes(); break;
      case "open-tx": openTransactionModal(null, ds.type); break;
      case "edit-tx": openTransactionModal(ds.id); break;
      case "delete-tx": deleteTransaction(ds.id); break;
      case "edit-budget": openBudgetModal(); break;
      case "money-prev": moneyMonth = monthKey(addMonths(parseKey(moneyMonth + "-01"), -1)); renderMoney(); break;
      case "money-next": moneyMonth = monthKey(addMonths(parseKey(moneyMonth + "-01"), 1)); renderMoney(); break;
      case "review-type": reviewType = ds.type; reviewCursor = new Date(); renderReview(); break;
      case "review-prev": adjustReview(-1); break;
      case "review-next": adjustReview(1); break;
      case "request-notify": requestNotifications(); break;
      case "set-theme": D.prefs.theme = ds.theme; saveData(); applyPrefs(); renderChrome(); renderSettings(); break;
      case "set-accent": D.prefs.accent = ds.accent; saveData(); applyPrefs(); renderChrome(); renderSettings(); break;
      case "font-dec": D.prefs.fs = Math.max(0.85, Math.round((D.prefs.fs - 0.05) * 100) / 100); saveData(); applyPrefs(); renderSettings(); break;
      case "font-inc": D.prefs.fs = Math.min(1.25, Math.round((D.prefs.fs + 0.05) * 100) / 100); saveData(); applyPrefs(); renderSettings(); break;
      case "save-profile": saveProfile(); break;
      case "change-password": changePassword(); break;
      case "export-data": exportData(); break;
      case "install-app": installApp(); break;
      case "import-click": { var fi2 = $("#importFile"); if (fi2) fi2.click(); break; }
      case "save-sync": saveSyncSettings(); break;
      case "sync-upload": syncUpload(false); break;
      case "sync-download": syncDownload(); break;
      case "delete-data": deleteAllData(); break;
      case "delete-account": deleteAccount(); break;
      case "search-open": handleSearchOpen(el); break;
    }
  }

  function onGlobalClick(e) {
    var nav = e.target.closest("[data-nav]");
    if (nav) {
      e.preventDefault();
      navigate(nav.getAttribute("data-nav"));
      return;
    }
    var authBtn = e.target.closest("[data-authmode]");
    if (authBtn) return;
    var act = e.target.closest("[data-action]");
    if (act) {
      e.preventDefault();
      handleAction(act);
    }
  }

  function onGlobalInput(e) {
    var f = e.target.getAttribute("data-filter");
    if (!f) return;
    if (f === "taskSearch") { taskSearch = e.target.value; renderTaskBody(); }
    else if (f === "journalSearch") { journalQuery = e.target.value; renderJournalListOnly(); }
    else if (f === "listSearch") { listFilter = e.target.value; renderListItemsOnly(); }
    else if (f === "notesSearch") { notesQuery = e.target.value; renderNotesBody(); }
  }

  function renderListItemsOnly() {
    var list = D.lists.filter(function (x) { return x.id === listOpen; })[0];
    var mount = $("#listItemsMount");
    if (!list || !mount) { renderLists(); return; }
    var items = (list.items || []).filter(function (x) { return !listFilter || (x.text + " " + (x.note || "")).toLowerCase().indexOf(listFilter.toLowerCase()) !== -1; });
    mount.innerHTML = items.length ? '<div class="list-items">' + items.map(function (it) {
      return '<div class="list-item ' + (it.done ? "done" : "") + '"><button class="task-check ' + (it.done ? "on" : "") + '" data-action="toggle-list-item" data-list="' + esc(list.id) + '" data-id="' + esc(it.id) + '">' + (it.done ? "✓" : "") + '</button><div class="li-body"><div class="li-title">' + esc(it.text) + '</div>' + (it.note ? '<div class="li-note">' + esc(it.note) + '</div>' : '') + '</div><div class="row" style="gap:4px"><button class="icon-action" data-action="edit-list-item" data-list="' + esc(list.id) + '" data-id="' + esc(it.id) + '">✎</button><button class="icon-action danger" data-action="delete-list-item" data-list="' + esc(list.id) + '" data-id="' + esc(it.id) + '">🗑</button></div></div>';
    }).join("") + '</div>' : emptyState("📝", t("لا توجد عناصر"), t("أضف أول عنصر إلى القائمة"));
  }

  function onGlobalChange(e) {
    var key = e.target.getAttribute("data-setting");
    if (!key) {
      if (e.target.id === "importFile") onImportFile(e);
      return;
    }
    if (key === "lang") {
      D.prefs.lang = e.target.value === "en" ? "en" : "ar";
      saveData();
      applyPrefs();
      renderChrome();
      renderPage(currentPage);
      return;
    }
    if (key === "currency") {
      D.prefs.currency = String(e.target.value || "ر.س").trim().slice(0, 8) || "ر.س";
      saveData();
      return;
    }
    if (key === "journalLock") {
      e.target.checked = D.prefs.journalLock.enabled;
      if (!D.prefs.journalLock.enabled) openJournalLockSetup(); else removeJournalLock();
      return;
    }
    if (key === "notifyEnabled") {
      var checked = e.target.checked;
      if (checked && notificationState() !== "granted") {
        requestNotifications();
      } else {
        updateNotifySetting("enabled", checked);
        renderSettings();
      }
      return;
    }
    if (key === "notifyTasks" || key === "notifyEvents" || key === "notifyHabits" || key === "notifyGoals") {
      updateNotifySetting(key.replace("notify", "").toLowerCase(), e.target.checked);
      return;
    }
    if (key === "leadMin") { updateNotifySetting("leadMin", e.target.value); return; }
    if (key === "habitTime") { updateNotifySetting("habitTime", e.target.value); return; }
    if (key === "syncEnabled") {
      if (e.target.checked && !D.prefs.sync.enabled) toast(D.prefs.lang === "en" ? "Save sync settings to activate" : "احفظ إعدادات المزامنة للتفعيل");
      return;
    }
  }

  function onGlobalSubmit(e) {
    var form = e.target;
    var kind = form.getAttribute("data-form");
    if (!kind) return;
    e.preventDefault();
    if (kind === "quick-task") {
      var title = String(form.elements.title.value || "").trim();
      if (!title) return;
      D.tasks.push({ id: uid(), title: title, desc: "", date: todayKey(), time: "", priority: "med", category: "personal", repeat: "none", done: false, doneAt: null, createdAt: nowISO(), updatedAt: nowISO() });
      form.reset();
      refresh();
      toast(t("تمت إضافة المهمة"));
    } else if (kind === "quick-note") {
      var body = String(form.elements.body.value || "").trim();
      if (!body) return;
      var note = { id: uid(), title: String(form.elements.title.value || "").trim(), body: body, category: form.elements.category.value || "general", color: "default", pinned: !!(form.elements.pinned && form.elements.pinned.checked), createdAt: nowISO(), updatedAt: nowISO(), date: todayKey() };
      D.notes.push(note);
      form.reset();
      refresh();
      toast(t("تم حفظ الملاحظة"));
    } else if (kind === "goal-step") {
      var gid = form.getAttribute("data-id");
      var text = String(form.elements.text.value || "").trim();
      if (text) { addGoalStep(gid, text); form.reset(); }
    } else if (kind === "list-item") {
      var lid = form.getAttribute("data-id");
      var text2 = String(form.elements.text.value || "").trim();
      if (!text2) return;
      var l = D.lists.filter(function (x) { return x.id === lid; })[0];
      if (l) { l.items.push({ id: uid(), text: text2, note: "", done: false, createdAt: nowISO() }); form.reset(); refresh(); }
    } else if (kind === "review") {
      var answers = {};
      ["q1", "q2", "q3", "q4"].forEach(function (q) { answers[q] = form.elements[q] ? form.elements[q].value : ""; });
      saveReview(form.getAttribute("data-type"), form.getAttribute("data-period"), answers);
    }
  }

  function bindEvents() {
    document.addEventListener("click", onGlobalClick);
    document.addEventListener("input", onGlobalInput);
    document.addEventListener("change", onGlobalChange);
    document.addEventListener("submit", onGlobalSubmit);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeModal(); closeDrawer(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); if (user) openSearchModal(); }
    });
    $("#menuBtn").addEventListener("click", openDrawer);
    $("#drawerClose").addEventListener("click", closeDrawer);
    $("#overlay").addEventListener("click", closeDrawer);
    $("#searchBtn").addEventListener("click", function () { if (user) openSearchModal(); });
    $("#themeBtn").addEventListener("click", applyThemeToggle);
    $("#avatarBtn").addEventListener("click", function () { if (user) navigate("settings"); });
    window.addEventListener("hashchange", function () {
      if (!user) return;
      var p = (location.hash || "").replace(/^#\//, "");
      if (PAGES[p] && p !== currentPage) {
        currentPage = p;
        D.prefs.lastPage = p;
        saveData();
        renderChrome();
        renderPage(p);
        window.scrollTo({ top: 0 });
      }
    });
    if (window.matchMedia) {
      try { window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { if (D && D.prefs.theme === "auto") { applyPrefs(); renderChrome(); } }); } catch (e) {}
    }
    window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferredPrompt = e; });
    window.addEventListener("online", function () { if (user) syncUpload(true); });
  }

  function ensureLocalUser() {
    var u = null;
    if (root.session) u = root.users.filter(function (x) { return x.id === root.session; })[0] || null;
    if (!u && root.users.length) u = root.users[0];
    if (!u) {
      u = { id: "local", name: "", email: "", local: true, createdAt: nowISO() };
      root.users = [u];
    }
    root.session = u.id;
    saveRoot();
    return u;
  }

  function boot() {
    bindEvents();
    user = ensureLocalUser();
    D = loadData(user.id);
    enterApp();
    window.__BOOT = true;
    setTimeout(function () {
      var sp = document.getElementById("splash");
      if (sp) { sp.classList.add("hide"); setTimeout(function () { sp.remove(); }, 560); }
    }, 380);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
