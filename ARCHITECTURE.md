# PokerCircle — Game Finder: ארכיטקטורת המערכת (ARCHITECTURE.md)

## 1. מבנה השכבות וההפרדה המחייבת

המערכת בנויה לפי הפרדת אחריות קפדנית, כך שמידע שהמנהל מזין מופיע בזמן אמת לכל המשתמשים בכל מכשיר (אין הסתמכות על `localStorage` כמסד ראשי):

| שכבה | טכנולוגיה | אחריות |
|---|---|---|
| **ממשק משתמש (Frontend)** | React 19, TypeScript, Vite, Tailwind CSS | הצגת מסכים, טפסי חיפוש וסינון, כרטיסי אירועים, חלוניות מודאליות, שיתוף, נגישות בעברית |
| **לוגיקה עסקית (Business Logic)** | TypeScript Modules (`src/utils/`, `server.ts`) | חישוב מחיר כולל, בדיקת תוקף פרסום (7 ימים), סינון מרחקים (Haversine), כללי דירוג מסחרי |
| **אימות והרשאות (Auth & RBAC)** | Express Server Middleware + Token Headers | הפרדה בין תפקיד משתמש רגיל (`user`) למנהל (`admin`). הגנה על נתיבי ניהול בשרת |
| **שרת נתונים (Persistence & Server)** | Express 4, Node.js (`server.ts`) | ניהול קובץ נתונים אטומי `data/db.json` / התחברות ל־PostgreSQL, שרתי API, מנגנון Vite middleware |
| **מסד נתונים להפצה (Production DB)** | PostgreSQL / Supabase Migration | סקריפט SQL מובנה ב־`migrations/001_initial_schema.sql` לפריסה קלה ב־Hostinger / Supabase |

---

## 2. זרימת הנתונים במערכת

```
[Browser / Client (Desktop & Mobile)]
        │
        ├── HTTP GET /api/events?dateRange=...&region=...&maxPrice=...
        ├── HTTP GET /api/events/:id
        ├── HTTP GET /api/organizers/:id
        ├── HTTP POST /api/reviews (Status: Pending)
        ├── HTTP POST /api/contact
        └── HTTP POST /api/auth/login
        │
        ▼
[Express Backend Server (server.ts)]
        │
        ├── Authentication & Role Validator (requireAdmin middleware)
        ├── Price Breakdown Calculator & Expiry Enforcement Engine
        └── Atomic Read/Write File Storage (data/db.json)
                 │
                 ▼ (Ready for Hostinger Production)
        [PostgreSQL / Supabase Database Schema]
```

---

## 3. הגנה על פעולות ניהול (Security & Access Control)
- משתמש רגיל שנרשם מקבל תפקיד `user`. אין לו גישה לשנות את התפקיד שלו.
- כל פעולות הניהול (`POST /api/admin/events`, `PUT /api/admin/events/:id`, `PATCH /api/admin/reviews/:id`) נבדקות בשרת ע״י `requireAdmin`.
- הסתרת כפתור בממשק היא רק שכבת UX; אבטחת המידע נאכפת תמיד בשרת.

---

## 4. מנגנון תוקף ופקיעה (Publication Lifecycle)
- לכל אירוע מוגדרים שדות `publicationStart` ו־`publicationExpiresAt`.
- בחיפוש הציבורי מוחזרים אך ורק אירועים עם `status: 'active'` ושמועד פקיעתם טרם חלף.
- אירוע שפג אינו נמחק מהמסד: הוא נשמר לעיון המנהל וניתן לחידוש (`renew_publication`) לשבוע נוסף בלחיצה אחת.
