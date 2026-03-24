import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

export const firebaseConfig = {
  apiKey: "AIzaSyDG_-XAP-hzNVa6BtA34_YpYFeqE73L6mE",
  authDomain: "project-4875540944725487473.firebaseapp.com",
  projectId: "project-4875540944725487473",
  storageBucket: "project-4875540944725487473.firebasestorage.app",
  messagingSenderId: "266712033696",
  appId: "1:266712033696:web:311179722317a1903e9cc5",
  measurementId: "G-MFJ43LRCSQ"
};

export const appSettings = {
  collectionName: "tzammCalendar",
  settingsDocPath: "tzammCalendarMeta/current",
  members: ["אמיר", "יוני", "כנמהח", "אלי"],
  weekdayNames: ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"],
  defaultTitle: 'ניהול יציאות צמ"ם',
  defaultMonthLabel: "חודש נוכחי",
  defaultStartDay: 22,
  defaultEndDay: 31,
  defaultStartWeekday: 0,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
