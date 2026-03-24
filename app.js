import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
  collection,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { db, auth } from "./firebase-config.js";

const titleInput = document.getElementById("calendarTitle");
const monthLabelInput = document.getElementById("monthLabel");
const startDayInput = document.getElementById("startDay");
const endDayInput = document.getElementById("endDay");
const startWeekdayInput = document.getElementById("startWeekday");
const buildBtn = document.getElementById("buildBtn");
const reloadBtn = document.getElementById("reloadBtn");
const saveAllBtn = document.getElementById("saveAllBtn");
const exportBtn = document.getElementById("exportBtn");
const calendarGrid = document.getElementById("calendarGrid");
const summaryGrid = document.getElementById("summaryGrid");
const weekdayHeader = document.getElementById("weekdayHeader");
const statusEl = document.getElementById("status");
const legendMembers = document.getElementById("legendMembers");
const template = document.getElementById("dayCardTemplate");

const state = {
  app: null,
  db: null,
  auth: null,
  user: null,
  meta: {
    title: db.defaultTitle,
    monthLabel: db.defaultMonthLabel,
    startDay: db.defaultStartDay,
    endDay: db.defaultEndDay,
    startWeekday: db.defaultStartWeekday,
  },
  days: new Map(),
};

function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`.trim();
}

function hasRealFirebaseConfig() {
  return firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("PASTE_");
}

function buildDayKey(dateNumber) {
  return `day-${String(dateNumber).padStart(2, "0")}`;
}

function getWeekdayName(index) {
  return db.weekdayNames[index] || "";
}

function buildDaysFromMeta(meta) {
  const days = [];
  const start = Number(meta.startDay);
  const end = Number(meta.endDay);
  let weekdayIndex = Number(meta.startWeekday);

  for (let date = start; date <= end; date += 1) {
    const key = buildDayKey(date);
    const existing = state.days.get(key);
    days.push({
      key,
      date,
      weekdayIndex,
      weekdayName: getWeekdayName(weekdayIndex),
      slots: existing?.slots || ["", "", "", ""],
      notes: existing?.notes || "",
    });
    weekdayIndex = (weekdayIndex + 1) % 7;
  }

  return days;
}

function renderWeekdayHeader() {
  weekdayHeader.innerHTML = "";
  db.weekdayNames.forEach((name) => {
    const el = document.createElement("div");
    el.className = "weekday-head";
    el.textContent = name;
    weekdayHeader.appendChild(el);
  });
}

function createSlotSelect(slotIndex, selectedValue, dayObj) {
  const wrapper = document.createElement("div");
  wrapper.className = "slot-box";

  const label = document.createElement("label");
  const labelText = document.createElement("span");
  labelText.className = "slot-label";
  labelText.textContent = `נוכחות ${slotIndex + 1}`;

  const select = document.createElement("select");
  const emptyOpt = document.createElement("option");
  emptyOpt.value = "";
  emptyOpt.textContent = "ללא";
  select.appendChild(emptyOpt);

  db.members.forEach((member) => {
    const option = document.createElement("option");
    option.value = member;
    option.textContent = member;
    if (member === selectedValue) option.selected = true;
    select.appendChild(option);
  });

  select.addEventListener("change", (event) => {
    dayObj.slots[slotIndex] = event.target.value;
    updateSummary();
    refreshBadges();
  });

  label.append(labelText, select);
  wrapper.appendChild(label);
  return wrapper;
}

function countFilledSlots(slots = []) {
  return slots.filter(Boolean).length;
}

function refreshBadges() {
  document.querySelectorAll(".day-card").forEach((card) => {
    const key = card.dataset.dayKey;
    const dayObj = state.days.get(key);
    const badge = card.querySelector(".day-badge");
    badge.textContent = `${countFilledSlots(dayObj?.slots)} / 4`;
  });
}

function updateSummary() {
  const counts = Object.fromEntries(db.members.map((name) => [name, 0]));
  [...state.days.values()].forEach((day) => {
    day.slots.forEach((slot) => {
      if (slot) counts[slot] += 1;
    });
  });

  summaryGrid.innerHTML = "";
  db.members.forEach((member) => {
    const card = document.createElement("div");
    card.className = "summary-card";
    card.innerHTML = `
      <div class="name">${member}</div>
      <div class="count">${counts[member]}</div>
      <div class="name">סה"כ שיבוצים</div>
    `;
    summaryGrid.appendChild(card);
  });
}

function renderLegend() {
  legendMembers.innerHTML = "";
  db.members.forEach((member) => {
    const pill = document.createElement("div");
    pill.className = "legend-pill";
    pill.textContent = member;
    legendMembers.appendChild(pill);
  });
}

async function saveDay(dayObj) {
  if (!state.db) {
    setStatus("לא קיים חיבור ל-Firebase. יש לעדכן firebase-config.js", "warn");
    return;
  }
  await setDoc(doc(state.db, db.collectionName, dayObj.key), {
    key: dayObj.key,
    date: dayObj.date,
    weekdayIndex: dayObj.weekdayIndex,
    weekdayName: dayObj.weekdayName,
    slots: dayObj.slots,
    notes: dayObj.notes,
    monthLabel: state.meta.monthLabel,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

async function saveMeta() {
  if (!state.db) return;
  await setDoc(doc(state.db, ...db.settingsDocPath.split("/")), {
    ...state.meta,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

function renderCalendar() {
  calendarGrid.innerHTML = "";
  const days = buildDaysFromMeta(state.meta);
  state.days = new Map(days.map((d) => [d.key, d]));

  for (let i = 0; i < Number(state.meta.startWeekday); i += 1) {
    const empty = document.createElement("div");
    empty.className = "empty-day";
    calendarGrid.appendChild(empty);
  }

  days.forEach((dayObj) => {
    const fragment = template.content.cloneNode(true);
    const card = fragment.querySelector(".day-card");
    card.dataset.dayKey = dayObj.key;
    fragment.querySelector(".day-weekday").textContent = dayObj.weekdayName;
    fragment.querySelector(".day-date").textContent = `${state.meta.monthLabel} · ${dayObj.date}`;
    fragment.querySelector(".day-badge").textContent = `${countFilledSlots(dayObj.slots)} / 4`;

    const slotsGrid = fragment.querySelector(".slots-grid");
    dayObj.slots.forEach((slotValue, index) => {
      slotsGrid.appendChild(createSlotSelect(index, slotValue, dayObj));
    });

    const textarea = fragment.querySelector("textarea");
    textarea.value = dayObj.notes || "";
    textarea.addEventListener("input", (event) => {
      dayObj.notes = event.target.value;
    });

    fragment.querySelector(".save-day-btn").addEventListener("click", async () => {
      try {
        await saveDay(dayObj);
        setStatus(`נשמר בהצלחה: ${dayObj.weekdayName} ${dayObj.date}`, "ok");
      } catch (error) {
        console.error(error);
        setStatus(`שגיאה בשמירת היום ${dayObj.date}: ${error.message}`, "error");
      }
    });

    fragment.querySelector(".clear-day-btn").addEventListener("click", () => {
      dayObj.slots = ["", "", "", ""];
      dayObj.notes = "";
      renderCalendar();
      updateSummary();
    });

    calendarGrid.appendChild(fragment);
  });

  updateSummary();
}

async function saveAll() {
  try {
    state.meta.title = titleInput.value.trim() || db.defaultTitle;
    state.meta.monthLabel = monthLabelInput.value.trim() || db.defaultMonthLabel;
    state.meta.startDay = Number(startDayInput.value);
    state.meta.endDay = Number(endDayInput.value);
    state.meta.startWeekday = Number(startWeekdayInput.value);

    await saveMeta();
    for (const day of state.days.values()) {
      await saveDay(day);
    }
    setStatus("כל הנתונים נשמרו בהצלחה", "ok");
  } catch (error) {
    console.error(error);
    setStatus(`שגיאה בשמירה: ${error.message}`, "error");
  }
}

function exportJson() {
  const payload = {
    meta: state.meta,
    days: [...state.days.values()],
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tzamm-calendar-export.json";
  a.click();
  URL.revokeObjectURL(url);
}

async function loadDataFromFirestore() {
  const metaRef = doc(state.db, ...db.settingsDocPath.split("/"));
  const metaSnap = await getDoc(metaRef);
  if (metaSnap.exists()) {
    const metaData = metaSnap.data();
    state.meta = {
      title: metaData.title || db.defaultTitle,
      monthLabel: metaData.monthLabel || db.defaultMonthLabel,
      startDay: Number(metaData.startDay ?? db.defaultStartDay),
      endDay: Number(metaData.endDay ?? db.defaultEndDay),
      startWeekday: Number(metaData.startWeekday ?? db.defaultStartWeekday),
    };
  }

  titleInput.value = state.meta.title;
  monthLabelInput.value = state.meta.monthLabel;
  startDayInput.value = state.meta.startDay;
  endDayInput.value = state.meta.endDay;
  startWeekdayInput.value = state.meta.startWeekday;

  const querySnap = await getDocs(collection(state.db, db.collectionName));
  const loaded = new Map();
  querySnap.forEach((item) => {
    const data = item.data();
    loaded.set(item.id, {
      key: item.id,
      date: data.date,
      weekdayIndex: data.weekdayIndex,
      weekdayName: data.weekdayName,
      slots: Array.isArray(data.slots) ? data.slots : ["", "", "", ""],
      notes: data.notes || "",
    });
  });
  state.days = loaded;
}

function applyMetaFromInputs() {
  state.meta = {
    title: titleInput.value.trim() || db.defaultTitle,
    monthLabel: monthLabelInput.value.trim() || db.defaultMonthLabel,
    startDay: Math.max(1, Number(startDayInput.value) || db.defaultStartDay),
    endDay: Math.max(Number(startDayInput.value) || db.defaultStartDay, Number(endDayInput.value) || db.defaultEndDay),
    startWeekday: Number(startWeekdayInput.value) || 0,
  };
}

async function initFirebase() {
  if (!hasRealFirebaseConfig()) {
    renderLegend();
    renderWeekdayHeader();
    renderCalendar();
    setStatus("המערכת מוכנה, אבל firebase-config.js עדיין עם ערכי placeholder. יש להדביק את קונפיגורציית 8109.", "warn");
    return;
  }

  state.app = initializeApp(firebaseConfig);
  state.db = getFirestore(state.app);
  state.auth = getAuth(state.app);

  await signInAnonymously(state.auth);

  onAuthStateChanged(state.auth, async (user) => {
    state.user = user;
    try {
      await loadDataFromFirestore();
      renderLegend();
      renderWeekdayHeader();
      renderCalendar();
      setStatus(`מחובר ל-Firebase בהצלחה${user ? " · התחברות מאומתת" : ""}`, "ok");
    } catch (error) {
      console.error(error);
      renderLegend();
      renderWeekdayHeader();
      renderCalendar();
      setStatus(`התחברות בוצעה אבל טעינת הנתונים נכשלה: ${error.message}`, "error");
    }
  });
}

buildBtn.addEventListener("click", () => {
  applyMetaFromInputs();
  renderCalendar();
  setStatus("הלוח נבנה מחדש מקומית. לחץ על 'שמירת הכל' כדי לשמור ל-Firebase.");
});

reloadBtn.addEventListener("click", async () => {
  try {
    if (state.db) {
      await loadDataFromFirestore();
      renderCalendar();
      setStatus("הנתונים נטענו מחדש מ-Firebase", "ok");
    } else {
      renderCalendar();
      setStatus("אין חיבור ל-Firebase כרגע. הוצגה תצוגה מקומית.", "warn");
    }
  } catch (error) {
    console.error(error);
    setStatus(`שגיאה בטעינה מחדש: ${error.message}`, "error");
  }
});

saveAllBtn.addEventListener("click", saveAll);
exportBtn.addEventListener("click", exportJson);

renderLegend();
renderWeekdayHeader();
renderCalendar();
initFirebase();
