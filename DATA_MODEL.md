# PokerCircle — Game Finder: מודל הנתונים (DATA_MODEL.md)

במערכת קיימת הפרדה מהותית בין **מארגן (Organizer)**, **אירוע (Event)** ו**פרסום (Publication)**.

---

## 1. Profiles / Users
מייצג משתמש במערכת (שחקן או מנהל).
- `id`: מזהה ייחודי (UUID / String).
- `email`: כתובת דוא״ל ייחודית ומאומתת.
- `displayName`: כינוי לתצוגה.
- `role`: תפקיד (`'user'` או `'admin'`). מוגן משינוי עצמי.
- `createdAt`: תאריך יצירה.

---

## 2. Organizers
מייצג מארגן או מועדון פיזי שניתן לדרג.
- `id`: מזהה ייחודי (`org_...`).
- `name`: שם המארגן או המועדון.
- `type`: סוג פעילות (`'club'` עבור מועדון קבוע או `'organizer'` עבור מארגן עצמאי).
- `description`: תיאור קצר של הפעילות, המקום ורמת המשחק.
- `city`: עיר הפעילות הראשית.
- `whatsapp`: מספר טלפון לקישור שיחה ישיר ב־WhatsApp.
- `telegram`: שם משתמש או ערוץ Telegram.
- `phone`: טלפון ישיר.
- `website`: קישור לאתר או עמוד רשמי.
- `isVisible`: האם המארגן גלוי למשתמשים (`boolean`).
- `isDemo`: האם מדובר בנתון הדגמה לבדיקות.
- `createdAt`, `updatedAt`: תאריכי יצירה ועדכון.

---

## 3. Events (טורנירים חיים)
מייצג טורניר חי ספציפי בלוח הזמנים.
- `id`: מזהה ייחודי (`evt_...`).
- `organizerId`: מפתח זר למארגן האחראי.
- `title`: שם האירוע.
- `activityType`: סוג הפעילות (`'live_tournament'`).
- `city`: עיר קיום האירוע.
- `region`: אזור בארץ (`מרכז`, `תל אביב`, `שרון`, `שפלה`, `ירושלים`, `צפון`, `דרום`).
- `startDateTime`: מועד התחלה (ISO 8601 UTC, מוצג ב־`Asia/Jerusalem`).
- `estimatedEndDateTime`: מועד סיום משוער.
- **שקיפות במחיר (Price Transparency)**:
  - `prizePoolAmount`: סכום המועבר לקופת הפרסים (ש״ח).
  - `houseFeeAmount`: עמלת המארגן / הבית (ש״ח).
  - `extraFeeAmount`: תשלום חובה נוסף (ש״ח, ברירת מחדל 0).
  - `extraFeeDescription`: הסבר מחייב עבור תשלום החובה הנוסף.
  - `totalBuyIn`: סך הכול לתשלום = `prizePoolAmount + houseFeeAmount + extraFeeAmount`.
- **מבנה הטורניר**:
  - `startingStack`: ערימת פתיחה (צ'יפים).
  - `levelDuration`: משך רמה (בדקות).
  - `reEntryTerms`: תנאי כניסה חוזרת ותוספות (Re-entry & Add-on).
  - `description`: מידע והערות שמסר המארגן.
- **ניהול ותוקף**:
  - `status`: סטטוס (`'draft'`, `'active'`, `'hidden'`, `'canceled'`).
  - `publicationStart`: תחילת תקופת הפרסום.
  - `publicationExpiresAt`: מועד פקיעת הפרסום (עד 7 ימים ממועד הפרסום או עד סיום האירוע).
  - `promotionType`: סוג קידום (`'regular'`, `'featured'`, `'sponsored'`).
  - `isPaidPromotion`: האם מדובר בפרסום בתשלום או תקופת הרצה חינם.
  - `paidAmount`: סכום שנגבה עבור הפרסום (אם רלוונטי).

---

## 4. OnlineClubs
מייצג מועדון אונליין באפליקציית ClubGG.
- `id`: מזהה ייחודי (`club_...`).
- `organizerId`: מפתח זר למארגן (אופציונלי).
- `name`: שם המועדון.
- `clubggId`: מספר מועדון ב־ClubGG (לדוגמה: `822466` עבור PokerCircle).
- `description`: תיאור הפעילות.
- `joinLink`: קישור להצטרפות או לטופס הרשמה.
- `isPokerCircleClub`: האם מדובר במועדון הרשמי של PokerCircle.
- `status`: סטטוס (`'active'` או `'hidden'`).
- `publicationExpiresAt`: תוקף פרסום שבועי (עבור מועדונים חיצוניים).

---

## 5. Reviews
ביקורות שחקנים על מארגנים ומועדונים.
- `id`: מזהה ייחודי (`rev_...`).
- `targetType`: סוג היעד (`'organizer'` או `'club'`).
- `targetId`: מזהה המארגן או המועדון.
- `userId`: מזהה המשתמש שכתב את הביקורת.
- `displayName`: כינוי השחקן לתצוגה.
- `rating`: דירוג כוכבים מ-1 עד 5.
- `comment`: תוכן הביקורת.
- `status`: מצב הביקורת (`'pending'`, `'approved'`, `'hidden'`).
- `internalHideReason`: סיבת הסתרה פנימית של המנהל (אינה מוצגת לציבור).
- `createdAt`, `reviewedAt`: תאריך הגשה ותאריך בדיקה ע״י המנהל.

---

## 6. InteractionEvents
תיעוד לחיצות ואינטראקציות למדידת ביקוש ללא איסוף מידע אישי.
- `id`: מזהה ייחודי.
- `actionType`: סוג הפעולה (`whatsapp_click`, `telegram_click`, `prereg_form_click`, `share_click`, `view_details`).
- `targetType`: יעד הפעולה (`event`, `club`, `organizer`).
- `targetId`: מזהה האירוע או המועדון.
- `channel`: ערוץ הפעולה (`whatsapp`, `telegram`, `web`).
- `timestamp`: מועד הפעולה.

---

## 7. ContactMessages
פניות יצירת קשר מהאתר לצוות PokerCircle (`alon.pokercircle@gmail.com`).
- `id`: מזהה פנייה.
- `type`: סוג הפנייה (`advertising` או `general`).
- `name`: שם הפונה.
- `email`: דוא״ל לחזרה.
- `message`: תוכן הפנייה.
- `createdAt`: מועד הפנייה.
