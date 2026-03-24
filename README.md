# ניהול יציאות צמ"ם – GitHub Pages + Firebase

פרויקט סטטי מוכן להעלאה ל-GitHub.

## הקבצים הכלולים

- `index.html` – הממשק הראשי
- `styles.css` – עיצוב Dark Tactical נקי ונגיש
- `app.js` – הלוגיקה של הלוח, עריכה, שמירה וטעינה
- `firebase-config.js` – קובץ ההגדרות של Firebase
- `firestore.rules` – חוקי Firestore מוצעים

## מה האפליקציה עושה

- לוח במבנה קלנדרי
- טווח ברירת מחדל: 22 עד 31
- יום ראשון בטווח מוגדר כברירת מחדל כיום ראשון
- לכל יום:
  - 4 שדות נוכחות
  - בחירת איש צוות מתוך: אמיר, יוני, כנמהח, אלי
  - אזור הערות חופשי
  - שמירת יום בודד
- שמירת כלל הלוח
- סיכום שיבוצים לכל איש צוות
- ייצוא JSON

## חיבור ל-Firebase

כרגע `firebase-config.js` מוכן, אבל ערכי הקונפיגורציה עצמם נשארו כ-placeholder.

יש להדביק בקובץ הזה את הערכים הקיימים של פרויקט Firebase שלך:

```js
export const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

## אוספים ב-Firestore

האפליקציה משתמשת ב:

- `tzammCalendarMeta/current`
- `tzammCalendarDays/{day-XX}`

## פריסה ל-GitHub Pages

1. פתח ריפו חדש ב-GitHub
2. העלה את כל הקבצים לתיקיית השורש
3. עדכן את `firebase-config.js`
4. ב-Firebase:
   - הפעל Firestore
   - הפעל Anonymous Authentication
   - עדכן את חוקי Firestore לפי `firestore.rules`
5. ב-GitHub:
   - Settings → Pages
   - Deploy from branch
   - בחר branch ראשי ותיקיית root

## הערה חשובה

ביקשת להשתמש בקונפיגורציית Firebase של גדוד 8109 שכבר קיימת אצלך.
בתוך השיחה הנוכחית לא היה לי את ה-object המלא של הקונפיגורציה, ולכן לא הטמעתי ערכים מומצאים.
המבנה מוכן, והחלק היחיד שצריך להשלים הוא הדבקת ערכי ה-Firebase האמיתיים שלך ב-`firebase-config.js`.
