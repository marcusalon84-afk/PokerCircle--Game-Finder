export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}

export type OrganizerType = 'organizer' | 'club';

export interface Organizer {
  id: string;
  name: string;
  type: OrganizerType;
  description: string;
  city: string;
  whatsapp?: string;
  telegram?: string;
  website?: string;
  phone?: string;
  isVisible: boolean;
  internalNotes?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
  // Computed / joined fields
  averageRating?: number;
  reviewCount?: number;
  activeEventsCount?: number;
}

export type EventStatus = 'draft' | 'active' | 'hidden' | 'canceled';
export type PromotionType = 'regular' | 'featured' | 'sponsored';
export type ComputedPublicationStatus = 'draft' | 'scheduled' | 'active' | 'hidden' | 'expired';

export interface TournamentEvent {
  id: string;
  organizerId: string;
  title: string;
  activityType: 'live_tournament';
  city: string;
  region: 'מרכז' | 'תל אביב' | 'שרון' | 'שפלה' | 'ירושלים' | 'צפון' | 'דרום';
  startDateTime: string; // ISO string UTC (מועד תחילת האירוע)
  estimatedEndDateTime?: string; // ISO string UTC (מועד סיום האירוע)
  
  // Price Transparency (שקיפות במחיר)
  prizePoolAmount: number; // סכום המועבר לקופת הפרסים (ש״ח)
  houseFeeAmount: number; // עמלת המארגן / הבית (ש״ח)
  extraFeeAmount: number; // כל תשלום חובה נוסף (ש״ח)
  extraFeeDescription?: string; // הסבר לתשלום החובה הנוסף
  totalBuyIn: number; // סך הכול לתשלום = prizePoolAmount + houseFeeAmount + extraFeeAmount

  // Structure & Rules
  startingStack: number; // ערימת פתיחה (e.g. 50,000)
  levelDuration: number; // משך רמה בדקות (e.g. 15 או 20)
  reEntryTerms: string; // תנאי כניסה חוזרת ותוספות
  description: string; // מידע נוסף שמסר המארגן
  
  // Custom contact overrides
  customRegistrationLink?: string;
  useOrganizerContact?: boolean;

  // Media & Gallery (תמונת נושא וגלריית תמונות)
  coverImageUrl?: string; // תמונת נושא ראשית לכרטיס ולעמוד האירוע
  galleryImages?: string[]; // גלריית תמונות: מקום האירוע, מבנה הטורניר, אווירה ועוד

  // Publication Window & Schedule (תקופת הפרסום - מופרדת ממועד האירוע)
  status: EventStatus;
  publicationStart: string; // מועד תחילת הפרסום באתר
  publicationExpiresAt: string; // מועד סיום הפרסום
  actualExpiration?: string; // המוקדם מבין: סיום פרסום, 7 ימים מתחילה, סיום האירוע
  computedStatus?: ComputedPublicationStatus; // טיוטה / מתוזמן / פעיל / מוסתר / הסתיים

  // Promotion & Commercial
  promotionType: PromotionType;
  isPaidPromotion: boolean;
  paidAmount?: number;
  paymentNotes?: string;
  internalNotes?: string;
  internalHideReason?: string;
  isDemo?: boolean;

  createdAt: string;
  updatedAt: string;

  // Joined fields
  organizer?: Organizer;
}

export interface OnlineClub {
  id: string;
  organizerId?: string;
  name: string;
  clubggId: string;
  description: string;
  joinLink: string;
  isPokerCircleClub: boolean;
  status: 'active' | 'hidden';
  publicationStart?: string;
  publicationExpiresAt?: string;
  computedStatus?: ComputedPublicationStatus;
  promotionType?: PromotionType;
  isPaidPromotion?: boolean;
  paidAmount?: number;
  internalNotes?: string;
  isDemo?: boolean;
  minDeposit?: number | string;
  agentName?: string;
  agentPhone?: string;
  agentWhatsapp?: string;
  agentTelegram?: string;
  createdAt: string;
  updatedAt?: string;
  // Computed fields
  organizer?: Organizer;
  averageRating?: number;
  reviewCount?: number;
}

export type ReviewStatus = 'pending' | 'approved' | 'hidden';

export interface Review {
  id: string;
  targetType: 'organizer' | 'club';
  targetId: string; // organizerId or clubId
  userId: string;
  displayName: string;
  userEmail?: string;
  rating: number; // 1 to 5
  comment: string;
  status: ReviewStatus;
  internalHideReason?: string;
  createdAt: string;
  reviewedAt?: string;
}

export type InteractionActionType =
  | 'whatsapp_click'
  | 'telegram_click'
  | 'phone_click'
  | 'prereg_form_click'
  | 'share_click'
  | 'view_details';

export interface InteractionEvent {
  id: string;
  actionType: InteractionActionType;
  targetType: 'event' | 'club' | 'organizer';
  targetId: string;
  channel: string;
  timestamp: string;
}

export interface ContactMessage {
  id: string;
  type: 'advertising' | 'general' | 'organizer_publish';
  name: string;
  email: string;
  phone?: string;
  organizerName?: string;
  city?: string;
  expectedBuyIn?: string;
  message: string;
  createdAt: string;
}

export interface FilterState {
  searchQuery: string;
  dateRange: 'all' | 'today' | 'next7days';
  region: string;
  maxTotalBuyIn: number | null;
  userCoords: { lat: number; lng: number } | null;
  sortBy: 'date_asc' | 'price_asc' | 'distance_asc';
  useDistance: boolean;
}

export interface AuditLog {
  id: string;
  action: 
    | 'create_event'
    | 'edit_event'
    | 'hide_event'
    | 'unhide_event'
    | 'duplicate_event'
    | 'renew_event'
    | 'create_organizer'
    | 'edit_organizer'
    | 'hide_organizer'
    | 'unhide_organizer'
    | 'create_club'
    | 'edit_club'
    | 'approve_review'
    | 'hide_review';
  targetType: 'event' | 'organizer' | 'club' | 'review';
  targetId: string;
  targetName: string;
  details: string;
  actorEmail: string;
  timestamp: string;
}

export interface UnifiedPublication {
  id: string;
  targetType: 'tournament' | 'online_club';
  title: string;
  organizerName: string;
  organizerId: string;
  location: string;
  eventStartDateTime?: string;
  eventEndDateTime?: string;
  publicationStart: string;
  publicationExpiresAt: string;
  actualExpiration: string;
  computedStatus: ComputedPublicationStatus;
  rawStatus: string;
  promotionType: PromotionType;
  isPaid: boolean;
  paidAmount?: number;
  totalBuyIn?: number;
  prizePool?: number;
  houseFee?: number;
  extraFee?: number;
  extraFeeDesc?: string;
  reEntryTerms?: string;
  startingStack?: number;
  levelDuration?: number;
  description?: string;
  joinLink?: string;
  clubggId?: string;
  isPokerCircleClub?: boolean;
  internalHideReason?: string;
}

export type CashFeeModel = 'no_fee' | 'shared_expenses' | 'commercial_rake';

export interface SharedExpensesDetails {
  forWhat: string; // פירוט: עבור מה נגבה הכסף (אוכל, שתייה, שכירת ציוד)
  amountPerPerson?: number | null; // סכום לאדם (אם ידוע)
  costPerPerson?: string | number; // סכום לאדם או אופן החישוב
  calculationMethod?: string; // אופן החישוב אם טרם נקבע סכום מדויק
  isMandatory: boolean; // חובה או רשות
  isEstimated: boolean; // סופי או משוער
}

export interface CommercialRakeDetails {
  rakePercent?: number; // e.g. 5%
  rakeCap?: number; // e.g. 25 ש״ח
  hourlyRate?: number; // e.g. 40 ש״ח
  hostingFee?: number; // דמי אירוח
  description?: string; // פירוט נוסף
}

export interface CashGame {
  id: string;
  organizerId?: string;
  title: string;
  city: string;
  region: 'מרכז' | 'תל אביב' | 'שרון' | 'שפלה' | 'ירושלים' | 'צפון' | 'דרום';
  startDateTime: string; // מועד תחילת המשחק
  estimatedEndDateTime?: string;
  gameType: 'Texas Hold\'em' | 'Omaha' | 'Mix' | 'Dealer\'s Choice' | 'אחר';
  blinds: string; // e.g. '1/2 ש״ח', '2/5 ש״ח'
  minBuyIn: number; // סכום כניסה מינימלי (ש״ח)
  maxBuyIn: number; // סכום כניסה מקסימלי (ש״ח)
  
  // מודל הגבייה
  feeModel: CashFeeModel;
  sharedExpensesDetails?: SharedExpensesDetails;
  commercialRakeDetails?: CommercialRakeDetails;
  rakeDescription?: string;

  venueDetails?: string; // e.g. 'יש מקום, פרטים בתיאום'
  tableSize?: number; // מספר מושבים בשולחן (8 או 9)
  seats?: number; // מושבים
  availableSeats?: number; // מושבים פנויים כעת
  description?: string;
  
  // יצירת קשר
  whatsapp?: string;
  telegram?: string;
  phone?: string;

  status: 'active' | 'hidden' | 'draft';
  createdAt: string;
  updatedAt: string;
  organizer?: Organizer;
}

export interface GroupFormation {
  id: string;
  userId?: string;
  title: string; // כותרת המודעה
  coordinatorNickname: string; // כינוי מרכז הקבוצה (חובה, אין חובה לשם מלא)
  city: string; // עיר או אזור
  region: 'מרכז' | 'תל אביב' | 'שרון' | 'שפלה' | 'ירושלים' | 'צפון' | 'דרום' | 'כל הארץ';
  currentPlayers: number; // מספר שחקנים שכבר בקבוצה (כולל מרכז הקבוצה)
  targetPlayers: number; // מספר השחקנים הרצוי בסך הכול
  gameType: 'Texas Hold\'em' | 'Omaha' | 'אחר';
  experienceLevel: 'מתחילים' | 'מעורב' | 'מנוסים';
  plannedBlinds: string; // '1/2 ש״ח', '2/5 ש״ח' או 'טרם נקבעו'
  buyInLimits: string; // '100 - 300 ש״ח' או 'טרם נקבע'
  scheduleDate: string; // 'חמישי הקרוב, 20:30' או 'מתגמשים בתיאום'
  venue: 'יש מקום, פרטים בתיאום' | 'מחפשים גם מקום';
  feeModel: 'no_fee' | 'shared_expenses';
  sharedExpensesDetails?: SharedExpensesDetails;
  description: string; // תיאור קצר - אופי הערב ומה מחפשים
  
  // דרכי פנייה (לפחות אחת תקינה)
  whatsapp?: string;
  telegram?: string;
  phone?: string;

  status: 'pending' | 'approved' | 'rejected' | 'hidden';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * פונקציית עזר לחישוב זכאות לתג "משחק חברי · ללא עמלת מארגן"
 * מחושב מתוך נתוני הגבייה בלבד: אין דמי אירוח, אין רייק/אחוז מהקופה, אין תשלום זמן, אין תשלום חובה למארגן.
 */
export function isFriendlyNoRakeGame(game: CashGame | GroupFormation): boolean {
  if (game.feeModel !== 'no_fee') return false;
  if ('commercialRakeDetails' in game && game.commercialRakeDetails) {
    const r = game.commercialRakeDetails;
    if ((r.rakePercent && r.rakePercent > 0) ||
        (r.rakeCap && r.rakeCap > 0) ||
        (r.hourlyRate && r.hourlyRate > 0) ||
        (r.hostingFee && r.hostingFee > 0)) {
      return false;
    }
  }
  return true;
}
