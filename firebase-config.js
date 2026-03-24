// חשוב:
// לא הצלחתי לשחזר מתוך השיחה הנוכחית את ערכי ה-Firebase המדויקים של גדוד 8109.
// לכן השארתי כאן מקום מוכן להדבקה.
// ברגע שתדביק את הקונפיגורציה הקיימת שלך, המערכת תהיה מוכנה להעלאה ל-GitHub Pages.

export const firebaseConfig = {
  apiKey: "PASTE_YOUR_8109_API_KEY_HERE",
  authDomain: "PASTE_YOUR_8109_AUTH_DOMAIN_HERE",
  projectId: "PASTE_YOUR_8109_PROJECT_ID_HERE",
  storageBucket: "PASTE_YOUR_8109_STORAGE_BUCKET_HERE",
  messagingSenderId: "PASTE_YOUR_8109_MESSAGING_SENDER_ID_HERE",
  appId: "PASTE_YOUR_8109_APP_ID_HERE"
};

export const appSettings = {
  collectionName: "tzammCalendarDays",
  settingsDocPath: "tzammCalendarMeta/current",
  members: ["אמיר", "יוני", "כנמהח", "אלי"],
  weekdayNames: ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"],
  defaultTitle: 'ניהול יציאות צמ"ם',
  defaultMonthLabel: "חודש נוכחי",
  defaultStartDay: 22,
  defaultEndDay: 31,
  defaultStartWeekday: 0
};
