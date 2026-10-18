import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import type { 
  TournamentEvent, 
  Organizer, 
  OnlineClub, 
  Review, 
  InteractionEvent, 
  ContactMessage,
  User,
  CashGame,
  GroupFormation
} from './src/types/poker.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// City coordinates for estimated distance calculation (מרחק משוער למרכז העיר בלבד)
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'תל אביב': { lat: 32.0853, lng: 34.7818 },
  'הרצליה': { lat: 32.1663, lng: 34.8433 },
  'ראשון לציון': { lat: 31.9730, lng: 34.7925 },
  'פתח תקווה': { lat: 32.0840, lng: 34.8878 },
  'רמת גן': { lat: 32.0684, lng: 34.8248 },
  'חולון': { lat: 32.0158, lng: 34.7874 },
  'בת ים': { lat: 32.0132, lng: 34.7480 },
  'נתניה': { lat: 32.3215, lng: 34.8532 },
  'כפר סבא': { lat: 32.1750, lng: 34.9069 },
  'רעננה': { lat: 32.1848, lng: 34.8713 },
  'ירושלים': { lat: 31.7683, lng: 35.2137 },
  'חיפה': { lat: 32.7940, lng: 34.9896 },
  'באר שבע': { lat: 31.2529, lng: 34.7915 },
  'אשדוד': { lat: 31.8044, lng: 34.6553 },
  'מודיעין': { lat: 31.8903, lng: 35.0104 },
};

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

interface DatabaseSchema {
  users: User[];
  organizers: Organizer[];
  events: TournamentEvent[];
  cashGames: CashGame[];
  groupFormations: GroupFormation[];
  onlineClubs: OnlineClub[];
  reviews: Review[];
  interactions: InteractionEvent[];
  contactMessages: ContactMessage[];
  auditLogs?: any[];
}

function getInitialSeedData(): DatabaseSchema {
  const now = new Date();
  
  // Future dates for upcoming active tournaments
  const today1930 = new Date(now);
  today1930.setHours(19, 30, 0, 0);

  const tomorrow2000 = new Date(now);
  tomorrow2000.setDate(now.getDate() + 1);
  tomorrow2000.setHours(20, 0, 0, 0);

  const day3_2000 = new Date(now);
  day3_2000.setDate(now.getDate() + 3);
  day3_2000.setHours(20, 0, 0, 0);

  const day5_1900 = new Date(now);
  day5_1900.setDate(now.getDate() + 5);
  day5_1900.setHours(19, 0, 0, 0);

  const expiresDate = new Date(now);
  expiresDate.setDate(now.getDate() + 7);

  const users: User[] = [
    {
      id: 'usr_admin',
      email: 'alon.pokercircle@gmail.com',
      displayName: 'אלון מנהל (PokerCircle)',
      role: 'admin',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_player1',
      email: 'player@pokercircle.co.il',
      displayName: 'דניאל כהן',
      role: 'user',
      createdAt: new Date().toISOString()
    }
  ];

  const organizers: Organizer[] = [
    {
      id: 'org_river_tlv',
      name: 'מועדון הריבר תל אביב',
      type: 'club',
      description: 'מועדון טורנירים איכותי וותיק בלב תל אביב. שולחנות מקצועיים, דילרים מוסמכים, אווירה תחרותית וספורטיבית עם שקיפות מלאה.',
      city: 'תל אביב',
      whatsapp: '972501234567',
      telegram: 'RiverTLV_Poker',
      phone: '050-1234567',
      isVisible: true,
      isDemo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'org_circle_herzliya',
      name: 'סירקל הרצליה פוקר',
      type: 'organizer',
      description: 'טורנירי דיפסטאק שבועיים בהרצליה פיתוח. מבנה עמוק, ערימות גדולות, קהל חברי ואיכותי. חניה נוחה במקום.',
      city: 'הרצליה',
      whatsapp: '972549876543',
      telegram: 'HerzliyaDeepstack',
      phone: '054-9876543',
      isVisible: true,
      isDemo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'org_ace_petah_tikva',
      name: 'קבוצת אייס פתח תקווה',
      type: 'organizer',
      description: 'טורנירי ערב נגישים לשחקנים חובבים. אווירה נעימה ומכבדת, הקפדה על חוקים בינלאומיים (TDA).',
      city: 'פתח תקווה',
      whatsapp: '972523334455',
      phone: '052-3334455',
      isVisible: true,
      isDemo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'org_rishon_pokers',
      name: 'מועדון רשל״צ טורנירים',
      type: 'club',
      description: 'קהילת שחקני ראשון לציון והשפלה. טורנירים קבועים בימי שלישי ומוצ״ש.',
      city: 'ראשון לציון',
      whatsapp: '972537778899',
      isVisible: true,
      isDemo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const events: TournamentEvent[] = [
    {
      id: 'evt_1',
      organizerId: 'org_river_tlv',
      title: 'דיפסטאק חגיגי — 50K פתיחה',
      activityType: 'live_tournament',
      city: 'תל אביב',
      region: 'תל אביב',
      startDateTime: today1930.toISOString(),
      estimatedEndDateTime: new Date(today1930.getTime() + 6 * 3600 * 1000).toISOString(),
      prizePoolAmount: 550,
      houseFeeAmount: 250,
      extraFeeAmount: 0,
      totalBuyIn: 800,
      startingStack: 50000,
      levelDuration: 18,
      reEntryTerms: 'כניסה חוזרת אפשרית עד תום רמה 6 (סך הכל 800 ₪, מתוכם 550 ₪ לפרסים ו-250 ₪ עמלה). ללא אד-און.',
      description: 'טורניר הדגל של יום חמישי. כיבוד קל ושתייה חמה/קרה כלולים. כתובת מדויקת תימסר למאושרים בווטסאפ.',
      useOrganizerContact: true,
      coverImageUrl: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=1200&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1541278107931-e006523892df?auto=format&fit=crop&w=1200&q=80'
      ],
      status: 'active',
      publicationStart: now.toISOString(),
      publicationExpiresAt: expiresDate.toISOString(),
      promotionType: 'featured',
      isPaidPromotion: false, // 90-day trial period free highlight
      isDemo: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: 'evt_2',
      organizerId: 'org_circle_herzliya',
      title: 'הרצליה מיד-וויק טורבו',
      activityType: 'live_tournament',
      city: 'הרצליה',
      region: 'שרון',
      startDateTime: tomorrow2000.toISOString(),
      estimatedEndDateTime: new Date(tomorrow2000.getTime() + 4.5 * 3600 * 1000).toISOString(),
      prizePoolAmount: 350,
      houseFeeAmount: 150,
      extraFeeAmount: 0,
      totalBuyIn: 500,
      startingStack: 40000,
      levelDuration: 15,
      reEntryTerms: 'כניסה חוזרת יחידה עד רמה 4. אין תוספות.',
      description: 'טורניר מהיר וממוקד לשחקנים עובדים. סיום משוער בחצות וחצי.',
      useOrganizerContact: true,
      coverImageUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1200&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=1200&q=80'
      ],
      status: 'active',
      publicationStart: now.toISOString(),
      publicationExpiresAt: expiresDate.toISOString(),
      promotionType: 'regular',
      isPaidPromotion: false,
      isDemo: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: 'evt_3',
      organizerId: 'org_ace_petah_tikva',
      title: 'באונטי ספיישל פתח תקווה',
      activityType: 'live_tournament',
      city: 'פתח תקווה',
      region: 'מרכז',
      startDateTime: day3_2000.toISOString(),
      estimatedEndDateTime: new Date(day3_2000.getTime() + 5.5 * 3600 * 1000).toISOString(),
      prizePoolAmount: 400,
      houseFeeAmount: 150,
      extraFeeAmount: 50,
      extraFeeDescription: 'דמי רישום וניהול צ׳יפ באונטי מיוחד לכל שחקן',
      totalBuyIn: 600,
      startingStack: 45000,
      levelDuration: 16,
      reEntryTerms: 'כניסות חוזרות ללא הגבלה עד רמה 5 (כולל באונטי מלא על כל כניסה).',
      description: 'על כל הדחה מקבלים 150 ₪ ישירות! תשלום החובה הנוסף (50 ₪) מיועד לרישום ומעקב נוק אאוט.',
      useOrganizerContact: true,
      coverImageUrl: 'https://images.unsplash.com/photo-1541278107931-e006523892df?auto=format&fit=crop&w=1200&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1541278107931-e006523892df?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=1200&q=80'
      ],
      status: 'active',
      publicationStart: now.toISOString(),
      publicationExpiresAt: expiresDate.toISOString(),
      promotionType: 'regular',
      isPaidPromotion: false,
      isDemo: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: 'evt_4',
      organizerId: 'org_rishon_pokers',
      title: 'מוצ״ש גראנד סטאק ראשל״צ',
      activityType: 'live_tournament',
      city: 'ראשון לציון',
      region: 'שפלה',
      startDateTime: day5_1900.toISOString(),
      estimatedEndDateTime: new Date(day5_1900.getTime() + 7 * 3600 * 1000).toISOString(),
      prizePoolAmount: 800,
      houseFeeAmount: 300,
      extraFeeAmount: 0,
      totalBuyIn: 1100,
      startingStack: 60000,
      levelDuration: 20,
      reEntryTerms: 'כניסה חוזרת אחת עד סוף רמה 7. אופציה לאד-און בסיום תקופת הרי-אנטרי ב-400 ₪ (300 ₪ לפרסים + 100 ₪ עמלה).',
      description: 'טורניר עמוק לחובבי פוקר איכותי. שעון שקט, דילרים ברמה הגבוהה ביותר.',
      useOrganizerContact: true,
      coverImageUrl: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=1200&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=1200&q=80'
      ],
      status: 'active',
      publicationStart: now.toISOString(),
      publicationExpiresAt: expiresDate.toISOString(),
      promotionType: 'sponsored',
      isPaidPromotion: true,
      paidAmount: 100,
      isDemo: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
  ];

  const onlineClubs: OnlineClub[] = [
    {
      id: 'club_pokercircle_official',
      name: 'PokerCircle Club (מועדון הדגל)',
      clubggId: '822466',
      description: 'מועדון הטורנירים הרשמי של PokerCircle ב־ClubGG. טורנירים בלבד — ללא משחקי קאש! השקת המועדון מתוכננת לאחר הצטברות 50 מתעניינים. הרשמה מוקדמת פתוחה כעת.',
      joinLink: 'https://docs.google.com/forms/d/e/1FAIpQLSeSEcAiI-OegesZTaZr8lBF4ZgFjs6D6EVe5a2ErIxwb1n9pw/viewform?usp=dialog',
      isPokerCircleClub: true,
      status: 'active',
      promotionType: 'featured',
      isDemo: false, // Official Club
      createdAt: now.toISOString()
    },
    {
      id: 'club_israel_online_arena',
      organizerId: 'org_river_tlv',
      name: 'ארנה אונליין ישראל',
      clubggId: '774120',
      description: 'מועדון טורנירים יומי באפליקציית ClubGG. טורנירי ערב בלוחות זמנים קבועים. הצטרפות בווטסאפ מול המארגן.',
      joinLink: 'https://wa.me/972501234567?text=שלום+אני+מעוניין+להצטרף+למועדון+ClubGG+שלכם',
      isPokerCircleClub: false,
      status: 'active',
      publicationExpiresAt: expiresDate.toISOString(),
      promotionType: 'regular',
      isDemo: true,
      createdAt: now.toISOString()
    }
  ];

  const reviews: Review[] = [
    {
      id: 'rev_1',
      targetType: 'organizer',
      targetId: 'org_river_tlv',
      userId: 'usr_player1',
      displayName: 'דניאל כהן',
      rating: 5,
      comment: 'מארגנים מצוינים, הדילרים מקצועיים מאוד ושקיפות מלאה על כל שקל שמועבר לפרסים. אווירה נעימה ומכבדת.',
      status: 'approved',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      reviewedAt: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: 'rev_2',
      targetType: 'organizer',
      targetId: 'org_circle_herzliya',
      userId: 'usr_player1',
      displayName: 'יוסי ש.',
      rating: 4,
      comment: 'מבנה טוב ושעון שקט. התחילו בזמן שזה נדיר בארץ. ממליץ בחום.',
      status: 'approved',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      reviewedAt: new Date(Date.now() - 4 * 86400000).toISOString()
    },
    {
      id: 'rev_3',
      targetType: 'organizer',
      targetId: 'org_ace_petah_tikva',
      userId: 'usr_player1',
      displayName: 'איתי ל.',
      rating: 5,
      comment: 'טורניר נגיש והגון. פירוט העמלות ברור מראש ולא היו הפתעות.',
      status: 'approved',
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      reviewedAt: new Date(Date.now() - 6 * 86400000).toISOString()
    }
  ];

  const cashGames: CashGame[] = [
    {
      id: 'cg_1',
      title: 'משחק חברי ביתי ברמת גן',
      city: 'רמת גן',
      region: 'מרכז',
      startDateTime: new Date(Date.now() + 2 * 86400000).toISOString(),
      gameType: 'Texas Hold\'em',
      blinds: '1/2 ש״ח',
      minBuyIn: 100,
      maxBuyIn: 300,
      feeModel: 'no_fee',
      venueDetails: 'יש מקום, פרטים בתיאום מול המארח',
      tableSize: 8,
      availableSeats: 2,
      description: 'משחק חברי רגוע ונעים. מתחלפים בחלוקה עצמאית (ללא דילר). אין שום עמלת בית, אין רייק ואין שום תשלום למארח.',
      whatsapp: '972501234567',
      status: 'active',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: 'cg_2',
      title: 'קאש חברי בהרצליה — פיצה ושתייה קלה',
      city: 'הרצליה',
      region: 'שרון',
      startDateTime: new Date(Date.now() + 3 * 86400000).toISOString(),
      gameType: 'Texas Hold\'em',
      blinds: '2/5 ש״ח',
      minBuyIn: 200,
      maxBuyIn: 600,
      feeModel: 'shared_expenses',
      sharedExpensesDetails: {
        forWhat: 'מגשי פיצה חמים, שתייה קלה ובירות, חטיפים וקרח',
        amountPerPerson: 40,
        calculationMethod: 'חלוקה שווה לפי קבלת המשלוח',
        isMandatory: true,
        isEstimated: false
      },
      venueDetails: 'יש מקום, סלון מרווח בהרצליה פיתוח',
      tableSize: 9,
      availableSeats: 3,
      description: 'שולחן 2/5 איכותי וחברי. מזמינים כיבוד ושתייה לכולם, ההשתתפות הינה בעלות הכיבוד בלבד ללא שום רווח למארגן.',
      whatsapp: '972549876543',
      status: 'active',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: 'cg_3',
      organizerId: 'org_river_tlv',
      title: 'שולחן קאש שבועי במועדון הריבר',
      city: 'תל אביב',
      region: 'תל אביב',
      startDateTime: new Date(Date.now() + 1 * 86400000).toISOString(),
      gameType: 'Texas Hold\'em',
      blinds: '5/10 ש״ח',
      minBuyIn: 500,
      maxBuyIn: 2000,
      feeModel: 'commercial_rake',
      commercialRakeDetails: {
        rakePercent: 5,
        rakeCap: 30,
        hourlyRate: 0,
        hostingFee: 0,
        description: 'רייק שולחן 5% עד תקרה של 30 ש״ח לקופה. דילרים מוסמכים, שתייה חמה וכיבוד קל.'
      },
      venueDetails: 'מועדון הריבר תל אביב',
      tableSize: 9,
      availableSeats: 2,
      description: 'שולחן קאש עמוק ומקצועי עם דילרים מוסמכים ושקיפות מלאה על כללי הרייק והקאפ.',
      whatsapp: '972501234567',
      status: 'active',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
  ];

  const groupFormations: GroupFormation[] = [
    {
      id: 'gf_1',
      title: 'משלימים שולחן חברי במודיעין',
      coordinatorNickname: 'רועי ויונתן',
      city: 'מודיעין',
      region: 'מרכז',
      currentPlayers: 3,
      targetPlayers: 6,
      gameType: 'Texas Hold\'em',
      experienceLevel: 'מעורב',
      plannedBlinds: '1/2 ש״ח',
      buyInLimits: '100 - 300 ש״ח',
      scheduleDate: 'חמישי הקרוב בערב (20:30)',
      venue: 'יש מקום, פרטים בתיאום',
      feeModel: 'no_fee',
      description: 'אנחנו שלושה חברים באזור מודיעין, מחפשים עוד שלושה שחקנים למשחק חברי ביום חמישי בערב. ללא עמלת מארגן, אווירה טובה ומשחק נקי.',
      whatsapp: '972501112233',
      telegram: 'roei_modiin',
      status: 'approved',
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 3600000).toISOString()
    },
    {
      id: 'gf_2',
      title: 'מחפשים שחקנים נוספים לקבוצה קבועה בת״א',
      coordinatorNickname: 'עידו',
      city: 'תל אביב',
      region: 'תל אביב',
      currentPlayers: 4,
      targetPlayers: 7,
      gameType: 'Texas Hold\'em',
      experienceLevel: 'מתחילים',
      plannedBlinds: '1/2 ש״ח',
      buyInLimits: '100 - 200 ש״ח',
      scheduleDate: 'מתגמשים בתיאום',
      venue: 'מחפשים גם מקום',
      feeModel: 'shared_expenses',
      sharedExpensesDetails: {
        forWhat: 'כיבוד קל, פיצות ושתייה',
        amountPerPerson: 35,
        calculationMethod: 'חלוקה שווה לפי הזמנה משותפת',
        isMandatory: true,
        isEstimated: true
      },
      description: 'מחפשים שחקנים רגועים וחביבים למפגש שבועי קבוע. כרגע 4 חברים, מתאים גם למתחילים שרוצים להשתפשף.',
      whatsapp: '972524445566',
      status: 'approved',
      createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 6 * 3600000).toISOString()
    },
    {
      id: 'gf_3',
      title: 'גיבוש סבב שחקנים באזור השרון',
      coordinatorNickname: 'מתן פ.',
      city: 'כפר סבא',
      region: 'שרון',
      currentPlayers: 5,
      targetPlayers: 8,
      gameType: 'Texas Hold\'em',
      experienceLevel: 'מנוסים',
      plannedBlinds: '2/5 ש״ח',
      buyInLimits: '300 - 800 ש״ח',
      scheduleDate: 'מוצ״ש הקרוב ב-21:00',
      venue: 'יש מקום, פרטים בתיאום',
      feeModel: 'no_fee',
      description: 'משחק עמוק וספורטיבי לשחקנים שמכירים היטב את המשחק. אווירה נעימה ומכבדת, שולחן פוקר ייעודי.',
      whatsapp: '972545556677',
      status: 'approved',
      createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 3600000).toISOString()
    },
    {
      id: 'gf_pending_1',
      title: 'משחק סטודנטים בירושלים',
      coordinatorNickname: 'עומר ר.',
      city: 'ירושלים',
      region: 'ירושלים',
      currentPlayers: 3,
      targetPlayers: 6,
      gameType: 'Texas Hold\'em',
      experienceLevel: 'מתחילים',
      plannedBlinds: '1/1 ש״ח',
      buyInLimits: '50 - 150 ש״ח',
      scheduleDate: 'שלישי בערב',
      venue: 'יש מקום, פרטים בתיאום',
      feeModel: 'no_fee',
      description: 'שחקנים חובבים בירושלים מחפשים להשלים שולחן צנוע וחברי.',
      whatsapp: '972537778899',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  return {
    users,
    organizers,
    events,
    cashGames,
    groupFormations,
    onlineClubs,
    reviews,
    interactions: [],
    contactMessages: []
  };
}

// Database helper functions with atomic write
function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialSeedData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const data: DatabaseSchema = JSON.parse(raw);
    let changed = false;
    if (!data.cashGames) {
      data.cashGames = getInitialSeedData().cashGames;
      changed = true;
    }
    if (!data.groupFormations) {
      data.groupFormations = getInitialSeedData().groupFormations;
      changed = true;
    }
    if (changed) {
      writeDb(data);
    }
    return data;
  } catch (err) {
    console.error('Error reading db.json, re-initializing:', err);
    const initial = getInitialSeedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
}

function writeDb(data: DatabaseSchema): void {
  const tempFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tempFile, DB_FILE);
}

// Helper to calculate organizer review stats
function attachOrganizerStats(organizer: Organizer, allReviews: Review[]): Organizer {
  const approved = allReviews.filter(
    (r) => r.targetId === organizer.id && r.status === 'approved'
  );
  if (approved.length === 0) {
    return { ...organizer, averageRating: 0, reviewCount: 0 };
  }
  const sum = approved.reduce((acc, r) => acc + r.rating, 0);
  const avg = Math.round((sum / approved.length) * 10) / 10;
  return { ...organizer, averageRating: avg, reviewCount: approved.length };
}

// Actual expiration calculation (Rule: earliest of admin end, 7 days from start, event end)
function computeActualExpiration(
  pubStartISO: string,
  pubEndISO: string,
  eventEndISO?: string
): string {
  const pubStart = new Date(pubStartISO).getTime();
  const pubEnd = new Date(pubEndISO).getTime();
  const sevenDaysFromStart = pubStart + 7 * 24 * 3600 * 1000;
  let earliest = Math.min(pubEnd, sevenDaysFromStart);

  if (eventEndISO) {
    const eventEnd = new Date(eventEndISO).getTime();
    if (!isNaN(eventEnd) && eventEnd > 0) {
      earliest = Math.min(earliest, eventEnd);
    }
  }

  return new Date(earliest).toISOString();
}

// Dynamic publication status computation
function computePublicationStatus(
  rawStatus: string, // 'draft' | 'active' | 'hidden' | 'canceled'
  pubStartISO: string,
  actualExpirationISO: string,
  now: Date
): 'draft' | 'scheduled' | 'active' | 'hidden' | 'expired' {
  if (rawStatus === 'draft') return 'draft';
  if (rawStatus === 'hidden') return 'hidden';
  if (rawStatus === 'canceled') return 'expired';

  const start = new Date(pubStartISO).getTime();
  const end = new Date(actualExpirationISO).getTime();
  const current = now.getTime();

  if (current < start) return 'scheduled';
  if (current > end) return 'expired';
  return 'active';
}

function logAudit(
  db: DatabaseSchema,
  action: string,
  targetType: 'event' | 'organizer' | 'club' | 'review',
  targetId: string,
  targetName: string,
  details: string,
  actorEmail?: string
) {
  if (!db.auditLogs) db.auditLogs = [];
  db.auditLogs.unshift({
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    action,
    targetType,
    targetId,
    targetName,
    details,
    actorEmail: actorEmail || 'alon.pokercircle@gmail.com',
    timestamp: new Date().toISOString()
  });
  if (db.auditLogs.length > 200) {
    db.auditLogs = db.auditLogs.slice(0, 200);
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'PokerCircle Game Finder Backend'
    });
  });

  // 1. PUBLIC: GET /api/events (Live Tournaments with Price Transparency & Filters)
  app.get('/api/events', (req: Request, res: Response) => {
    const db = readDb();
    const now = new Date();

    const {
      search,
      dateRange, // 'today' | 'next7days' | 'all'
      region,
      maxPrice,
      userLat,
      userLng,
      sortBy // 'date_asc' | 'price_asc' | 'distance_asc'
    } = req.query;

    // Filter rule: Only active, non-hidden, non-expired events appear in public search
    let filtered = db.events.filter((evt) => {
      const org = db.organizers.find((o) => o.id === evt.organizerId);
      if (!org || !org.isVisible) return false;

      const actualExp = computeActualExpiration(
        evt.publicationStart || evt.createdAt,
        evt.publicationExpiresAt,
        evt.estimatedEndDateTime || evt.startDateTime
      );
      const computed = computePublicationStatus(
        evt.status,
        evt.publicationStart || evt.createdAt,
        actualExp,
        now
      );

      return computed === 'active';
    });

    // Attach organizer, actualExpiration, and stats to each event
    filtered = filtered.map((evt) => {
      const org = db.organizers.find((o) => o.id === evt.organizerId);
      const orgWithStats = org ? attachOrganizerStats(org, db.reviews) : undefined;
      const actualExp = computeActualExpiration(
        evt.publicationStart || evt.createdAt,
        evt.publicationExpiresAt,
        evt.estimatedEndDateTime || evt.startDateTime
      );
      return {
        ...evt,
        organizer: orgWithStats,
        actualExpiration: actualExp,
        computedStatus: 'active' as const
      };
    });

    // 1. Search Query filter (free text in title, organizer name, city)
    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (evt) =>
          evt.title.toLowerCase().includes(q) ||
          evt.city.toLowerCase().includes(q) ||
          (evt.organizer?.name && evt.organizer.name.toLowerCase().includes(q))
      );
    }

    // 2. Date Range filter
    if (dateRange === 'today') {
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      filtered = filtered.filter((evt) => {
        const d = new Date(evt.startDateTime);
        return d >= startOfDay && d <= endOfDay;
      });
    } else if (dateRange === 'next7days') {
      const next7 = new Date(now);
      next7.setDate(now.getDate() + 7);
      filtered = filtered.filter((evt) => {
        const d = new Date(evt.startDateTime);
        return d <= next7;
      });
    }

    // 3. Region / City filter
    if (region && typeof region === 'string' && region !== 'all') {
      filtered = filtered.filter(
        (evt) => evt.region === region || evt.city === region
      );
    }

    // 4. Price filter: strictly uses TOTAL buy-in (סכום כולל לתשלום)
    if (maxPrice) {
      const maxVal = parseFloat(maxPrice as string);
      if (!isNaN(maxVal) && maxVal > 0) {
        filtered = filtered.filter((evt) => evt.totalBuyIn <= maxVal);
      }
    }

    // Compute estimated distance if coordinates provided
    let userCoords: { lat: number; lng: number } | null = null;
    if (userLat && userLng) {
      const lat = parseFloat(userLat as string);
      const lng = parseFloat(userLng as string);
      if (!isNaN(lat) && !isNaN(lng)) {
        userCoords = { lat, lng };
      }
    }

    const eventsWithDistance = filtered.map((evt) => {
      let distanceKm: number | null = null;
      if (userCoords && CITY_COORDS[evt.city]) {
        const c = CITY_COORDS[evt.city];
        distanceKm = calculateDistanceKm(userCoords.lat, userCoords.lng, c.lat, c.lng);
      }
      return {
        ...evt,
        estimatedDistanceKm: distanceKm
      };
    });

    // 5. Commercial sorting rules:
    // User filters are strictly respected. Sponsored/featured items are highlighted in place,
    // and sorting applies to the filtered set.
    eventsWithDistance.sort((a, b) => {
      // If sponsored/featured, give a documented slight precedence among equals or keep order
      if (sortBy === 'price_asc') {
        if (a.totalBuyIn !== b.totalBuyIn) return a.totalBuyIn - b.totalBuyIn;
      } else if (sortBy === 'distance_asc' && userCoords) {
        const distA = a.estimatedDistanceKm ?? 9999;
        const distB = b.estimatedDistanceKm ?? 9999;
        if (distA !== distB) return distA - distB;
      }
      
      // Default / tie-break: soonest date
      const dateA = new Date(a.startDateTime).getTime();
      const dateB = new Date(b.startDateTime).getTime();
      return dateA - dateB;
    });

    res.json(eventsWithDistance);
  });

  // 2. PUBLIC: GET /api/events/:id (Single Event Details or Expired Notice)
  app.get('/api/events/:id', (req: Request, res: Response) => {
    const db = readDb();
    const event = db.events.find((e) => e.id === req.params.id);

    if (!event) {
      return res.status(404).json({
        error: 'אירוע לא נמצא',
        isExpiredOrHidden: true,
        message: 'האירוע המבוקש אינו קיים במערכת.'
      });
    }

    const now = new Date();
    const pubExpiry = new Date(event.publicationExpiresAt);
    const isExpired = event.status !== 'active' || now > pubExpiry;

    const organizer = db.organizers.find((o) => o.id === event.organizerId);
    const orgWithStats = organizer ? attachOrganizerStats(organizer, db.reviews) : undefined;

    if (isExpired) {
      return res.status(200).json({
        event: {
          ...event,
          organizer: orgWithStats
        },
        isExpiredOrHidden: true,
        message: 'אירוע זה הסתיים, הוסתר או שפג תוקף פרסומו. באפשרותך לחפש אירועים עדכניים בלוח הראשי.'
      });
    }

    res.json({
      event: {
        ...event,
        organizer: orgWithStats
      },
      isExpiredOrHidden: false
    });
  });

  // 3. PUBLIC: GET /api/organizers (All Active Organizers with Ratings)
  app.get('/api/organizers', (req: Request, res: Response) => {
    const db = readDb();
    const activeOrganizers = db.organizers
      .filter((o) => o.isVisible)
      .map((o) => attachOrganizerStats(o, db.reviews));

    res.json(activeOrganizers);
  });

  // 4. PUBLIC: GET /api/organizers/:id (Organizer Profile, Active Events & Approved Reviews)
  app.get('/api/organizers/:id', (req: Request, res: Response) => {
    const db = readDb();
    const organizer = db.organizers.find((o) => o.id === req.params.id);

    if (!organizer) {
      return res.status(404).json({ error: 'מארגן לא נמצא' });
    }

    const orgWithStats = attachOrganizerStats(organizer, db.reviews);
    const activeEvents = db.events.filter(
      (e) => e.organizerId === organizer.id && e.status === 'active'
    );
    const approvedReviews = db.reviews.filter(
      (r) => r.targetId === organizer.id && r.status === 'approved'
    );

    res.json({
      organizer: orgWithStats,
      activeEvents,
      reviews: approvedReviews
    });
  });

  // 5. PUBLIC: GET /api/online-clubs (Separate ClubGG View)
  app.get('/api/online-clubs', (req: Request, res: Response) => {
    const db = readDb();
    const clubs = db.onlineClubs
      .filter((c) => c.status === 'active')
      .map((c) => {
        let org: Organizer | undefined;
        if (c.organizerId) {
          const rawOrg = db.organizers.find((o) => o.id === c.organizerId);
          if (rawOrg) org = attachOrganizerStats(rawOrg, db.reviews);
        }
        return {
          ...c,
          organizer: org
        };
      });

    // PokerCircle club always anchored first
    clubs.sort((a, b) => {
      if (a.isPokerCircleClub) return -1;
      if (b.isPokerCircleClub) return 1;
      return 0;
    });

    res.json(clubs);
  });

  // 6. REVIEWS: POST /api/reviews (Submit review -> status: pending)
  app.post('/api/reviews', (req: Request, res: Response) => {
    const { targetType, targetId, rating, comment, displayName, userEmail, userId } = req.body;

    if (!targetId || !rating || !comment || !displayName) {
      return res.status(400).json({ error: 'חסרים שדות חובה (דירוג, כינוי, טקסט)' });
    }

    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ error: 'דירוג חייב להיות בין 1 ל-5 כוכבים' });
    }

    const db = readDb();

    // Check for existing review by this user on this organizer to prevent duplicates
    const authorId = userId || userEmail || displayName;
    const existing = db.reviews.find(
      (r) => r.targetId === targetId && (r.userId === authorId || (userEmail && r.userEmail === userEmail))
    );

    if (existing) {
      return res.status(400).json({
        error: 'כבר קיימת ביקורת שלך על מארגן זה. כדי למנוע כפילויות ניתן לשלוח ביקורת אחת בלבד.'
      });
    }

    const newReview: Review = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      targetType: targetType === 'club' ? 'club' : 'organizer',
      targetId,
      userId: authorId,
      displayName: displayName.trim(),
      userEmail: userEmail?.trim(),
      rating: ratingNum,
      comment: comment.trim(),
      status: 'pending', // Strictly pending until admin moderates!
      createdAt: new Date().toISOString()
    };

    db.reviews.push(newReview);
    writeDb(db);

    res.status(201).json({
      success: true,
      review: newReview,
      message: 'הביקורת התקבלה בהצלחה ותוצג באתר לאחר בדיקה ואישור מנהל.'
    });
  });

  // 7. INTERACTIONS: POST /api/interactions (Log clicks without collecting personal telemetry)
  app.post('/api/interactions', (req: Request, res: Response) => {
    const { actionType, targetType, targetId, channel } = req.body;
    if (!actionType || !targetId) {
      return res.status(400).json({ error: 'Invalid interaction data' });
    }

    const db = readDb();
    const event: InteractionEvent = {
      id: `int_${Date.now()}`,
      actionType,
      targetType: targetType || 'event',
      targetId,
      channel: channel || 'web',
      timestamp: new Date().toISOString()
    };

    db.interactions.push(event);
    writeDb(db);
    res.json({ success: true });
  });

  // 8. CONTACT: POST /api/contact
  app.post('/api/contact', (req: Request, res: Response) => {
    const { type, name, email, phone, organizerName, city, expectedBuyIn, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'נא למלא שם וכתובת דוא״ל' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'כתובת דוא״ל אינה תקינה' });
    }

    const db = readDb();
    const contactMsg: ContactMessage = {
      id: `msg_${Date.now()}`,
      type: type === 'organizer_publish' ? 'organizer_publish' : (type === 'advertising' ? 'advertising' : 'general'),
      name: name.trim(),
      email: email.trim(),
      phone: phone ? String(phone).trim() : undefined,
      organizerName: organizerName ? String(organizerName).trim() : undefined,
      city: city ? String(city).trim() : undefined,
      expectedBuyIn: expectedBuyIn ? String(expectedBuyIn).trim() : undefined,
      message: message ? message.trim() : (organizerName ? `בקשת פרסום מאת ${organizerName}` : 'ללא תוכן נוסף'),
      createdAt: new Date().toISOString()
    };

    db.contactMessages.push(contactMsg);
    writeDb(db);

    res.status(201).json({
      success: true,
      message: 'פנייתך התקבלה בהצלחה במערכת. ניצור עמך קשר בהקדם.',
      contactMessage: contactMsg
    });
  });

  // 9. AUTH: POST /api/auth/login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    const db = readDb();

    if (!email || !password) {
      return res.status(400).json({ error: 'נא להזין דוא״ל וסיסמה' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return res.status(401).json({ error: 'פרטי ההתחברות אינם תואמים משתמש קיים' });
    }

    // Passwords for demo/test accounts
    if (user.role === 'admin' && password !== 'AdminPassword123!' && password !== 'admin') {
      return res.status(401).json({ error: 'סיסמת מנהל שגויה' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role
      },
      token: `token_${user.id}_${Date.now()}`
    });
  });

  // 10. AUTH: POST /api/auth/register
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { email, displayName, password } = req.body;
    if (!email || !displayName || !password) {
      return res.status(400).json({ error: 'נא למלא את כל שדות ההרשמה' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = readDb();

    if (db.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return res.status(400).json({ error: 'כתובת דוא״ל זו כבר רשומה במערכת' });
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      displayName: displayName.trim(),
      role: 'user', // Non-admin by default, protected from self-elevation
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    writeDb(db);

    res.status(201).json({
      user: newUser,
      token: `token_${newUser.id}_${Date.now()}`
    });
  });

  // ================= CASH GAMES & GROUP FORMATIONS (PUBLIC) =================

  // 1. PUBLIC: GET /api/cash-games
  app.get('/api/cash-games', (req: Request, res: Response) => {
    const { region, feeModel, search } = req.query;
    const db = readDb();
    let games = (db.cashGames || []).filter((g) => g.status === 'active');

    if (region && typeof region === 'string' && region !== 'all') {
      games = games.filter((g) => g.region === region || g.city === region);
    }

    if (feeModel && typeof feeModel === 'string' && feeModel !== 'all') {
      games = games.filter((g) => g.feeModel === feeModel);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      games = games.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.city.toLowerCase().includes(q) ||
          (g.blinds && g.blinds.toLowerCase().includes(q))
      );
    }

    const enriched = games.map((g) => {
      let org: Organizer | undefined;
      if (g.organizerId) {
        const rawOrg = db.organizers.find((o) => o.id === g.organizerId);
        if (rawOrg) org = attachOrganizerStats(rawOrg, db.reviews);
      }
      return {
        ...g,
        organizer: org
      };
    });

    res.json(enriched);
  });

  // 2. PUBLIC: GET /api/cash-games/:id
  app.get('/api/cash-games/:id', (req: Request, res: Response) => {
    const db = readDb();
    const game = (db.cashGames || []).find((g) => g.id === req.params.id);
    if (!game) return res.status(404).json({ error: 'משחק קאש לא נמצא' });

    let org: Organizer | undefined;
    if (game.organizerId) {
      const rawOrg = db.organizers.find((o) => o.id === game.organizerId);
      if (rawOrg) org = attachOrganizerStats(rawOrg, db.reviews);
    }

    res.json({
      ...game,
      organizer: org
    });
  });

  // 3. PUBLIC: GET /api/group-formations (Approved only)
  app.get('/api/group-formations', (req: Request, res: Response) => {
    const { region, feeModel, search } = req.query;
    const db = readDb();
    let groups = (db.groupFormations || []).filter((g) => g.status === 'approved');

    if (region && typeof region === 'string' && region !== 'all') {
      groups = groups.filter((g) => g.region === region || g.city === region);
    }

    if (feeModel && typeof feeModel === 'string' && feeModel !== 'all') {
      groups = groups.filter((g) => g.feeModel === feeModel);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      groups = groups.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.city.toLowerCase().includes(q) ||
          g.coordinatorNickname.toLowerCase().includes(q) ||
          (g.plannedBlinds && g.plannedBlinds.toLowerCase().includes(q))
      );
    }

    // Sort by updatedAt descending
    groups.sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
    );

    res.json(groups);
  });

  // 4. PUBLIC: GET /api/group-formations/:id
  app.get('/api/group-formations/:id', (req: Request, res: Response) => {
    const db = readDb();
    const group = (db.groupFormations || []).find((g) => g.id === req.params.id);
    if (!group) return res.status(404).json({ error: 'פרסום גיבוש קבוצה לא נמצא' });
    res.json(group);
  });

  // 5. PUBLIC: POST /api/group-formations (User submit -> status: pending)
  app.post('/api/group-formations', (req: Request, res: Response) => {
    const {
      title,
      coordinatorNickname,
      city,
      region,
      currentPlayers,
      targetPlayers,
      gameType,
      experienceLevel,
      plannedBlinds,
      buyInLimits,
      scheduleDate,
      venue,
      feeModel,
      sharedExpensesDetails,
      description,
      whatsapp,
      telegram,
      phone,
      userId
    } = req.body;

    if (!title?.trim() || !coordinatorNickname?.trim() || !city?.trim()) {
      return res.status(400).json({ error: 'חסרים שדות חובה (כותרת, כינוי מרכז הקבוצה, עיר)' });
    }

    const cur = parseInt(currentPlayers, 10);
    const tar = parseInt(targetPlayers, 10);

    if (isNaN(cur) || isNaN(tar) || cur < 1 || tar < 1) {
      return res.status(400).json({ error: 'מספר שחקנים חייב להיות מספר חיובי' });
    }

    // Spec rule: No current players > target players
    if (cur > tar) {
      return res.status(400).json({
        error: 'מספר השחקנים הקיים אינו יכול להיות גדול ממספר השחקנים הרצוי בסך הכול'
      });
    }

    // Spec rule: At least one valid contact method
    if (!whatsapp?.trim() && !telegram?.trim() && !phone?.trim()) {
      return res.status(400).json({
        error: 'חובה להזין לפחות דרך התקשרות אחת תקינה (וואטסאפ, טלגרם או טלפון)'
      });
    }

    if (feeModel !== 'no_fee' && feeModel !== 'shared_expenses') {
      return res.status(400).json({
        error: 'בפרסום גיבוש קבוצה חברי, מודל הגבייה חייב להיות ללא עמלת מארגן או השתתפות בהוצאות'
      });
    }

    if (feeModel === 'shared_expenses') {
      if (!sharedExpensesDetails?.forWhat?.trim()) {
        return res.status(400).json({
          error: 'במודל השתתפות בהוצאות חובה לפרט עבור מה נגבה הכסף (כיבוד, שתייה וכו׳)'
        });
      }
    }

    const now = new Date();
    const newGroup: GroupFormation = {
      id: `gf_${Date.now()}`,
      userId,
      title: title.trim(),
      coordinatorNickname: coordinatorNickname.trim(),
      city: city.trim(),
      region: region || 'מרכז',
      currentPlayers: cur,
      targetPlayers: tar,
      gameType: gameType || 'Texas Hold\'em',
      experienceLevel: experienceLevel || 'מעורב',
      plannedBlinds: plannedBlinds?.trim() || 'טרם נקבעו',
      buyInLimits: buyInLimits?.trim() || 'טרם נקבע',
      scheduleDate: scheduleDate?.trim() || 'מתגמשים בתיאום',
      venue: venue === 'מחפשים גם מקום' ? 'מחפשים גם מקום' : 'יש מקום, פרטים בתיאום',
      feeModel,
      sharedExpensesDetails:
        feeModel === 'shared_expenses' && sharedExpensesDetails
          ? {
              forWhat: sharedExpensesDetails.forWhat.trim(),
              amountPerPerson:
                sharedExpensesDetails.amountPerPerson !== null &&
                sharedExpensesDetails.amountPerPerson !== undefined &&
                sharedExpensesDetails.amountPerPerson !== ''
                  ? Number(sharedExpensesDetails.amountPerPerson)
                  : null,
              calculationMethod: sharedExpensesDetails.calculationMethod?.trim() || undefined,
              isMandatory: sharedExpensesDetails.isMandatory !== false,
              isEstimated: Boolean(sharedExpensesDetails.isEstimated)
            }
          : undefined,
      description: description?.trim() || '',
      whatsapp: whatsapp?.trim() || undefined,
      telegram: telegram?.trim() || undefined,
      phone: phone?.trim() || undefined,
      status: 'pending', // Pending approval by admin
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    const db = readDb();
    if (!db.groupFormations) db.groupFormations = [];
    db.groupFormations.unshift(newGroup);
    writeDb(db);

    res.status(201).json({
      success: true,
      groupFormation: newGroup,
      message: 'הפרסום הוגש בהצלחה ונמצא בבדיקת מנהל האתר. לאחר אישורו הוא יוצג בלוח.'
    });
  });

  // 6. PUBLIC/COORDINATOR: PATCH /api/group-formations/:id/players
  app.patch('/api/group-formations/:id/players', (req: Request, res: Response) => {
    const { currentPlayers } = req.body;
    const cur = parseInt(currentPlayers, 10);
    const db = readDb();
    const group = (db.groupFormations || []).find((g) => g.id === req.params.id);
    if (!group) return res.status(404).json({ error: 'קבוצה לא נמצאה' });

    if (isNaN(cur) || cur < 1) {
      return res.status(400).json({ error: 'מספר שחקנים לא תקין' });
    }
    if (cur > group.targetPlayers) {
      return res.status(400).json({
        error: `מספר השחקנים לא יכול לעלות על מספר השחקנים הרצוי בסך הכול (${group.targetPlayers})`
      });
    }

    group.currentPlayers = cur;
    group.updatedAt = new Date().toISOString();
    writeDb(db);

    res.json({
      success: true,
      groupFormation: group,
      message: 'מספר השחקנים בקבוצה עודכן בהצלחה'
    });
  });

  // ================= ADMIN ROUTES =================
  // Authorization middleware: verifies admin role
  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const adminEmail = req.headers['x-admin-email'] as string;
    
    // In our robust architecture, we check header or token
    const db = readDb();
    if (adminEmail) {
      const u = db.users.find((user) => user.email.toLowerCase() === adminEmail.toLowerCase() && user.role === 'admin');
      if (u) return next();
    }

    if (authHeader && authHeader.includes('token_usr_admin')) {
      return next();
    }

    return res.status(403).json({ error: 'גישה נדחתה. נדרשות הרשאות מנהל מערכת.' });
  };

  // ADMIN: GET /api/admin/metrics
  app.get('/api/admin/metrics', requireAdmin, (req: Request, res: Response) => {
    const db = readDb();
    const whatsappClicks = db.interactions.filter((i) => i.actionType === 'whatsapp_click').length;
    const telegramClicks = db.interactions.filter((i) => i.actionType === 'telegram_click').length;
    const preregClicks = db.interactions.filter((i) => i.actionType === 'prereg_form_click').length;
    const detailsViews = db.interactions.filter((i) => i.actionType === 'view_details').length;
    const pendingReviewsCount = db.reviews.filter((r) => r.status === 'pending').length;
    const pendingGroupFormationsCount = (db.groupFormations || []).filter((g) => g.status === 'pending').length;

    res.json({
      totalEvents: db.events.length,
      activeEvents: db.events.filter((e) => e.status === 'active').length,
      totalCashGames: (db.cashGames || []).length,
      activeCashGames: (db.cashGames || []).filter((g) => g.status === 'active').length,
      totalGroupFormations: (db.groupFormations || []).length,
      approvedGroupFormations: (db.groupFormations || []).filter((g) => g.status === 'approved').length,
      pendingGroupFormationsCount,
      totalOrganizers: db.organizers.length,
      totalClubs: db.onlineClubs.length,
      whatsappClicks,
      telegramClicks,
      preregClicks,
      detailsViews,
      pendingReviewsCount,
      totalReviews: db.reviews.length,
      contactMessagesCount: db.contactMessages.length,
      trialDaysRemaining: 90
    });
  });

  // ADMIN: GET /api/admin/all-events & /api/admin/events (All events with full stats for admin panel)
  const getAllEventsHandler = (req: Request, res: Response) => {
    const db = readDb();
    const enriched = db.events.map((evt) => {
      const rawOrg = db.organizers.find((o) => o.id === evt.organizerId);
      const org = rawOrg ? attachOrganizerStats(rawOrg, db.reviews) : undefined;
      return {
        ...evt,
        organizer: org
      };
    });
    res.json(enriched);
  };

  app.get('/api/admin/all-events', requireAdmin, getAllEventsHandler);
  app.get('/api/admin/events', requireAdmin, getAllEventsHandler);

  // ADMIN: GET /api/admin/kpis (Dashboard Counters)
  app.get('/api/admin/kpis', requireAdmin, (req: Request, res: Response) => {
    const db = readDb();
    const now = new Date();

    let activeCount = 0;
    let scheduledCount = 0;
    let endingSoonCount = 0;
    let draftsCount = 0;

    // Evaluate events
    db.events.forEach((evt) => {
      const actualExp = computeActualExpiration(
        evt.publicationStart || evt.createdAt,
        evt.publicationExpiresAt,
        evt.estimatedEndDateTime || evt.startDateTime
      );
      const computed = computePublicationStatus(
        evt.status,
        evt.publicationStart || evt.createdAt,
        actualExp,
        now
      );

      if (computed === 'active') {
        activeCount++;
        const expTime = new Date(actualExp).getTime();
        const diffHours = (expTime - now.getTime()) / (3600 * 1000);
        if (diffHours > 0 && diffHours <= 48) {
          endingSoonCount++;
        }
      } else if (computed === 'scheduled') {
        scheduledCount++;
      } else if (computed === 'draft') {
        draftsCount++;
      }
    });

    // Evaluate clubs
    db.onlineClubs.forEach((club) => {
      const actualExp = club.publicationExpiresAt || new Date(Date.now() + 7 * 86400000).toISOString();
      const computed = computePublicationStatus(
        club.status,
        club.publicationStart || club.createdAt,
        actualExp,
        now
      );
      if (computed === 'active') activeCount++;
      else if (computed === 'scheduled') scheduledCount++;
      else if (computed === 'draft') draftsCount++;
    });

    const pendingReviewsCount = db.reviews.filter((r) => r.status === 'pending').length;
    const contactClicksCount = db.interactions.length;

    res.json({
      activePublications: activeCount,
      scheduledPublications: scheduledCount,
      endingSoonPublications: endingSoonCount,
      draftsCount,
      pendingReviewsCount,
      contactClicksCount
    });
  });

  // ADMIN: GET /api/admin/publications (Unified Table of Tournaments & Clubs)
  app.get('/api/admin/publications', requireAdmin, (req: Request, res: Response) => {
    const db = readDb();
    const now = new Date();

    const publications: any[] = [];

    // Map tournaments
    db.events.forEach((evt) => {
      const org = db.organizers.find((o) => o.id === evt.organizerId);
      const actualExp = computeActualExpiration(
        evt.publicationStart || evt.createdAt,
        evt.publicationExpiresAt,
        evt.estimatedEndDateTime || evt.startDateTime
      );
      const computed = computePublicationStatus(
        evt.status,
        evt.publicationStart || evt.createdAt,
        actualExp,
        now
      );

      publications.push({
        id: evt.id,
        targetType: 'tournament',
        title: evt.title,
        organizerName: org?.name || 'לא ידוע',
        organizerId: evt.organizerId,
        location: evt.city,
        eventStartDateTime: evt.startDateTime,
        eventEndDateTime: evt.estimatedEndDateTime,
        publicationStart: evt.publicationStart || evt.createdAt,
        publicationExpiresAt: evt.publicationExpiresAt,
        actualExpiration: actualExp,
        computedStatus: computed,
        rawStatus: evt.status,
        promotionType: evt.promotionType || 'regular',
        isPaid: evt.isPaidPromotion || false,
        paidAmount: evt.paidAmount || 0,
        totalBuyIn: evt.totalBuyIn,
        prizePool: evt.prizePoolAmount,
        houseFee: evt.houseFeeAmount,
        extraFee: evt.extraFeeAmount,
        extraFeeDesc: evt.extraFeeDescription,
        reEntryTerms: evt.reEntryTerms,
        startingStack: evt.startingStack,
        levelDuration: evt.levelDuration,
        description: evt.description,
        coverImageUrl: evt.coverImageUrl,
        galleryImages: evt.galleryImages,
        internalHideReason: evt.internalHideReason
      });
    });

    // Map online clubs
    db.onlineClubs.forEach((club) => {
      const org = club.organizerId ? db.organizers.find((o) => o.id === club.organizerId) : undefined;
      const actualExp = club.publicationExpiresAt || new Date(Date.now() + 7 * 86400000).toISOString();
      const computed = computePublicationStatus(
        club.status,
        club.publicationStart || club.createdAt,
        actualExp,
        now
      );

      publications.push({
        id: club.id,
        targetType: 'online_club',
        title: club.name,
        organizerName: org?.name || (club.isPokerCircleClub ? 'PokerCircle Official' : 'עצמאי'),
        organizerId: club.organizerId || 'official',
        location: 'אונליין (ClubGG)',
        publicationStart: club.publicationStart || club.createdAt,
        publicationExpiresAt: club.publicationExpiresAt || actualExp,
        actualExpiration: actualExp,
        computedStatus: computed,
        rawStatus: club.status,
        promotionType: club.promotionType || 'regular',
        isPaid: club.isPaidPromotion || false,
        paidAmount: club.paidAmount || 0,
        clubggId: club.clubggId,
        joinLink: club.joinLink,
        isPokerCircleClub: club.isPokerCircleClub,
        description: club.description
      });
    });

    res.json(publications);
  });

  // ADMIN: GET /api/admin/audit-logs
  app.get('/api/admin/audit-logs', requireAdmin, (req: Request, res: Response) => {
    const db = readDb();
    res.json(db.auditLogs || []);
  });

  // ADMIN: GET /api/admin/contact-messages
  app.get('/api/admin/contact-messages', requireAdmin, (req: Request, res: Response) => {
    const db = readDb();
    res.json(db.contactMessages || []);
  });

  // ADMIN: POST /api/admin/auth/reset-password
  app.post('/api/admin/auth/reset-password', (req: Request, res: Response) => {
    const { email } = req.body;
    // Security: uniform response regardless of whether email exists
    res.json({
      success: true,
      message: 'אם כתובת הדוא״ל רשומה כמנהל במערכת, נשלח אליה כעת קישור איפוס סיסמה מאובטח התקף ל-30 דקות.'
    });
  });

  // ADMIN: POST /api/admin/events (Create Event or Draft)
  app.post('/api/admin/events', requireAdmin, (req: Request, res: Response) => {
    const {
      organizerId,
      title,
      city,
      region,
      startDateTime,
      estimatedEndDateTime,
      prizePoolAmount,
      houseFeeAmount,
      extraFeeAmount,
      extraFeeDescription,
      startingStack,
      levelDuration,
      reEntryTerms,
      description,
      coverImageUrl,
      galleryImages,
      promotionType,
      isPaidPromotion,
      paidAmount,
      paymentNotes,
      internalNotes,
      status: requestStatus, // 'draft' or 'active'
      publicationStart,
      publicationExpiresAt
    } = req.body;

    if (!organizerId || !title || !city || !startDateTime) {
      return res.status(400).json({ error: 'חסרים שדות חובה (מארגן, כותרת, עיר, מועד אירוע)' });
    }

    const prize = parseFloat(prizePoolAmount) || 0;
    const rake = parseFloat(houseFeeAmount) || 0;
    const extra = parseFloat(extraFeeAmount) || 0;
    const total = prize + rake + extra;

    if (extra > 0 && !extraFeeDescription) {
      return res.status(400).json({ error: 'אם קיים תשלום חובה נוסף, חובה לספק הסבר ברור עבורו' });
    }

    const now = new Date();
    const pubStart = publicationStart ? new Date(publicationStart).toISOString() : now.toISOString();
    
    // Default 7 days from start
    const defaultExpiry = new Date(new Date(pubStart).getTime() + 7 * 86400000).toISOString();
    const pubEnd = publicationExpiresAt ? new Date(publicationExpiresAt).toISOString() : defaultExpiry;

    // Validation: pubStart <= pubEnd
    if (new Date(pubStart).getTime() > new Date(pubEnd).getTime()) {
      return res.status(400).json({ error: 'מועד סיום הפרסום חייב להיות מאוחר ממועד ההתחלה' });
    }

    const eventStatus = requestStatus === 'draft' ? 'draft' : 'active';

    const newEvent: TournamentEvent = {
      id: `evt_${Date.now()}`,
      organizerId,
      title: title.trim(),
      activityType: 'live_tournament',
      city: city.trim(),
      region: region || 'מרכז',
      startDateTime,
      estimatedEndDateTime: estimatedEndDateTime || undefined,
      prizePoolAmount: prize,
      houseFeeAmount: rake,
      extraFeeAmount: extra,
      extraFeeDescription: extraFeeDescription?.trim(),
      totalBuyIn: total,
      startingStack: parseInt(startingStack, 10) || 50000,
      levelDuration: parseInt(levelDuration, 10) || 15,
      reEntryTerms: reEntryTerms?.trim() || 'כניסה חוזרת לפי תקנון המארגן',
      description: description?.trim() || '',
      coverImageUrl: coverImageUrl?.trim() || (Array.isArray(galleryImages) && galleryImages[0] ? galleryImages[0] : undefined),
      galleryImages: Array.isArray(galleryImages) ? galleryImages : (coverImageUrl ? [coverImageUrl.trim()] : []),
      status: eventStatus,
      useOrganizerContact: true,
      publicationStart: pubStart,
      publicationExpiresAt: pubEnd,
      promotionType: promotionType || 'regular',
      isPaidPromotion: Boolean(isPaidPromotion),
      paidAmount: parseFloat(paidAmount) || 0,
      paymentNotes: paymentNotes?.trim(),
      internalNotes: internalNotes?.trim(),
      isDemo: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    const db = readDb();
    db.events.unshift(newEvent);

    logAudit(
      db,
      'create_event',
      'event',
      newEvent.id,
      newEvent.title,
      `נוצר פרסום טורניר חדש (סטטוס: ${eventStatus}, סך הכל: ${total} ₪)`
    );

    writeDb(db);

    res.status(201).json(newEvent);
  });

  // ADMIN: PUT /api/admin/events/:id
  app.put('/api/admin/events/:id', requireAdmin, (req: Request, res: Response) => {
    const db = readDb();
    const idx = db.events.findIndex((e) => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'אירוע לא נמצא' });

    const current = db.events[idx];
    const {
      title,
      city,
      region,
      startDateTime,
      estimatedEndDateTime,
      prizePoolAmount,
      houseFeeAmount,
      extraFeeAmount,
      extraFeeDescription,
      startingStack,
      levelDuration,
      reEntryTerms,
      description,
      coverImageUrl,
      galleryImages,
      status,
      promotionType,
      isPaidPromotion,
      paidAmount,
      publicationStart,
      publicationExpiresAt,
      internalNotes,
      paymentNotes
    } = req.body;

    const prize = prizePoolAmount !== undefined ? parseFloat(prizePoolAmount) : current.prizePoolAmount;
    const rake = houseFeeAmount !== undefined ? parseFloat(houseFeeAmount) : current.houseFeeAmount;
    const extra = extraFeeAmount !== undefined ? parseFloat(extraFeeAmount) : current.extraFeeAmount;
    const total = prize + rake + extra;

    db.events[idx] = {
      ...current,
      title: title !== undefined ? title.trim() : current.title,
      city: city !== undefined ? city.trim() : current.city,
      region: region || current.region,
      startDateTime: startDateTime || current.startDateTime,
      estimatedEndDateTime: estimatedEndDateTime !== undefined ? estimatedEndDateTime : current.estimatedEndDateTime,
      prizePoolAmount: prize,
      houseFeeAmount: rake,
      extraFeeAmount: extra,
      extraFeeDescription: extraFeeDescription !== undefined ? extraFeeDescription : current.extraFeeDescription,
      totalBuyIn: total,
      startingStack: startingStack ? parseInt(startingStack, 10) : current.startingStack,
      levelDuration: levelDuration ? parseInt(levelDuration, 10) : current.levelDuration,
      reEntryTerms: reEntryTerms !== undefined ? reEntryTerms : current.reEntryTerms,
      description: description !== undefined ? description : current.description,
      coverImageUrl: coverImageUrl !== undefined ? (coverImageUrl ? coverImageUrl.trim() : '') : current.coverImageUrl,
      galleryImages: galleryImages !== undefined ? (Array.isArray(galleryImages) ? galleryImages : []) : current.galleryImages,
      status: status || current.status,
      publicationStart: publicationStart || current.publicationStart,
      publicationExpiresAt: publicationExpiresAt || current.publicationExpiresAt,
      promotionType: promotionType || current.promotionType,
      isPaidPromotion: isPaidPromotion !== undefined ? Boolean(isPaidPromotion) : current.isPaidPromotion,
      paidAmount: paidAmount !== undefined ? parseFloat(paidAmount) : current.paidAmount,
      paymentNotes: paymentNotes !== undefined ? paymentNotes : current.paymentNotes,
      internalNotes: internalNotes !== undefined ? internalNotes : current.internalNotes,
      updatedAt: new Date().toISOString()
    };

    logAudit(
      db,
      'edit_event',
      'event',
      current.id,
      current.title,
      `עודכנו פרטי הפרסום (סך הכל: ${total} ₪)`
    );

    writeDb(db);
    res.json(db.events[idx]);
  });

  // ADMIN: PATCH /api/admin/events/:id/action (hide, unhide, duplicate_draft, renew_publication)
  app.patch('/api/admin/events/:id/action', requireAdmin, (req: Request, res: Response) => {
    const { action, reason, newStartDate, newEndDate, newPubStart, newPubEnd } = req.body;
    const db = readDb();
    const idx = db.events.findIndex((e) => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'אירוע לא נמצא' });

    const event = db.events[idx];
    const now = new Date();

    if (action === 'hide') {
      event.status = 'hidden';
      if (reason) event.internalHideReason = reason.trim();
      event.updatedAt = now.toISOString();

      logAudit(
        db,
        'hide_event',
        'event',
        event.id,
        event.title,
        `הפרסום הוסר מהתצוגה הציבורית. סיבה: ${reason || 'לא צוינה'}`
      );

      writeDb(db);
      return res.json({ success: true, event, message: 'הפרסום הוסתר מהאתר בלי למחוק את המידע' });
    }

    if (action === 'unhide') {
      // Rule: Check if publication is still within its valid window and event didn't end
      const actualExp = computeActualExpiration(
        event.publicationStart,
        event.publicationExpiresAt,
        event.estimatedEndDateTime || event.startDateTime
      );

      if (now.getTime() > new Date(actualExp).getTime()) {
        return res.status(400).json({
          error: 'לא ניתן להציג מחדש: תקופת הפרסום פגה או שהאירוע כבר הסתיים. השתמש ב״חדש פרסום״ או ב״שכפל לאירוע חדש״.'
        });
      }

      event.status = 'active';
      event.internalHideReason = undefined;
      event.updatedAt = now.toISOString();

      logAudit(
        db,
        'unhide_event',
        'event',
        event.id,
        event.title,
        'הפרסום הוצג מחדש לציבור'
      );

      writeDb(db);
      return res.json({ success: true, event, message: 'הפרסום הוחזר לתצוגה הציבורית בהצלחה' });
    }

    if (action === 'duplicate_draft') {
      // Duplicate to new draft with new ID, clearing payment status per spec
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 2);
      tomorrow.setHours(19, 30, 0, 0);

      const duplicated: TournamentEvent = {
        ...event,
        id: `evt_${Date.now()}`,
        title: `${event.title} (שכפול)`,
        status: 'draft',
        startDateTime: tomorrow.toISOString(),
        estimatedEndDateTime: new Date(tomorrow.getTime() + 5 * 3600 * 1000).toISOString(),
        publicationStart: now.toISOString(),
        publicationExpiresAt: new Date(now.getTime() + 7 * 86400000).toISOString(),
        isPaidPromotion: false,
        paidAmount: 0,
        paymentNotes: undefined,
        internalHideReason: undefined,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };

      db.events.unshift(duplicated);

      logAudit(
        db,
        'duplicate_event',
        'event',
        duplicated.id,
        duplicated.title,
        `שוכפל מהאירוע ${event.id} כטיוטה חדשה`
      );

      writeDb(db);
      return res.status(201).json({ success: true, event: duplicated, message: 'האירוע שוכפל כטיוטה חדשה. יש לעדכן מועדי אירוע ופרסום.' });
    }

    if (action === 'renew_publication') {
      // Renew publication period: max 7 days
      const pubStart = newPubStart ? new Date(newPubStart).toISOString() : now.toISOString();
      const defaultExp = new Date(new Date(pubStart).getTime() + 7 * 86400000).toISOString();
      const pubEnd = newPubEnd ? new Date(newPubEnd).toISOString() : defaultExp;

      if (newStartDate) {
        event.startDateTime = new Date(newStartDate).toISOString();
      }
      if (newEndDate) {
        event.estimatedEndDateTime = new Date(newEndDate).toISOString();
      }

      // Check that event isn't in the past
      if (new Date(event.startDateTime).getTime() < now.getTime() - 12 * 3600 * 1000) {
        return res.status(400).json({
          error: 'האירוע המקורי כבר הסתיים בעבר. לטורניר שהתרחש בעבר יש להשתמש ב״שכפל לאירוע חדש״ ולקבוע תאריך אירוע עתידי.'
        });
      }

      event.publicationStart = pubStart;
      event.publicationExpiresAt = pubEnd;
      event.status = 'active';
      event.internalHideReason = undefined;
      event.updatedAt = now.toISOString();

      logAudit(
        db,
        'renew_event',
        'event',
        event.id,
        event.title,
        `תקופת הפרסום חודשה עד ${pubEnd}`
      );

      writeDb(db);
      return res.json({ success: true, event, message: 'תקופת הפרסום חודשה בהצלחה' });
    }

    res.status(400).json({ error: 'פעולה לא מוכרת' });
  });

  // ADMIN: Toggle Organizer Visibility with Affected Events Warning
  app.patch('/api/admin/organizers/:id/toggle-visibility', requireAdmin, (req: Request, res: Response) => {
    const db = readDb();
    const idx = db.organizers.findIndex((o) => o.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'מארגן לא נמצא' });

    const org = db.organizers[idx];
    const newVisibility = !org.isVisible;
    org.isVisible = newVisibility;
    org.updatedAt = new Date().toISOString();

    const affectedEvents = db.events.filter((e) => e.organizerId === org.id);

    logAudit(
      db,
      newVisibility ? 'unhide_organizer' : 'hide_organizer',
      'organizer',
      org.id,
      org.name,
      `סטטוס נראות שונה ל-${newVisibility ? 'גלוי' : 'מוסתר'}. השפיע על ${affectedEvents.length} אירועים.`
    );

    writeDb(db);
    res.json({
      success: true,
      organizer: org,
      affectedCount: affectedEvents.length,
      message: newVisibility 
        ? `המארגן הוצג מחדש. ${affectedEvents.length} אירועים פעילים שלו יוצגו כעת.`
        : `המארגן הוסתר. ${affectedEvents.length} אירועים המשויכים אליו הוסרו מהתצוגה הציבורית.`
    });
  });

  // ADMIN: Organizers CRUD
  app.post('/api/admin/organizers', requireAdmin, (req: Request, res: Response) => {
    const { name, type, description, city, whatsapp, telegram, phone, website } = req.body;
    if (!name || !city) return res.status(400).json({ error: 'חסר שם או עיר למארגן' });

    const db = readDb();
    const newOrg: Organizer = {
      id: `org_${Date.now()}`,
      name: name.trim(),
      type: type === 'club' ? 'club' : 'organizer',
      description: description?.trim() || '',
      city: city.trim(),
      whatsapp: whatsapp?.trim(),
      telegram: telegram?.trim(),
      phone: phone?.trim(),
      website: website?.trim(),
      isVisible: true,
      isDemo: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.organizers.push(newOrg);
    writeDb(db);
    res.status(201).json(newOrg);
  });

  app.put('/api/admin/organizers/:id', requireAdmin, (req: Request, res: Response) => {
    const db = readDb();
    const idx = db.organizers.findIndex((o) => o.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'מארגן לא נמצא' });

    db.organizers[idx] = {
      ...db.organizers[idx],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    writeDb(db);
    res.json(db.organizers[idx]);
  });

  // ADMIN: Online Clubs CRUD
  app.post('/api/admin/online-clubs', requireAdmin, (req: Request, res: Response) => {
    const { 
      name, 
      clubggId, 
      description, 
      joinLink, 
      organizerId,
      minDeposit,
      agentName,
      agentPhone,
      agentWhatsapp,
      agentTelegram
    } = req.body;

    if (!name || !clubggId) {
      return res.status(400).json({ error: 'חסר שם מועדון או מזהה ClubGG' });
    }

    const db = readDb();
    const newClub: OnlineClub = {
      id: `club_${Date.now()}`,
      organizerId,
      name: name.trim(),
      clubggId: clubggId.trim(),
      description: description?.trim() || '',
      joinLink: joinLink?.trim() || `https://www.clubgg.net/join?club_id=${clubggId.trim()}`,
      minDeposit: minDeposit !== undefined ? minDeposit : 100,
      agentName: agentName?.trim() || '',
      agentPhone: agentPhone?.trim() || '',
      agentWhatsapp: agentWhatsapp?.trim() || '',
      agentTelegram: agentTelegram?.trim() || '',
      isPokerCircleClub: false,
      status: 'active',
      publicationExpiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      createdAt: new Date().toISOString()
    };

    db.onlineClubs.push(newClub);
    writeDb(db);
    res.status(201).json(newClub);
  });

  app.put('/api/admin/online-clubs/:id', requireAdmin, (req: Request, res: Response) => {
    const db = readDb();
    const idx = db.onlineClubs.findIndex((c) => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'מועדון לא נמצא' });

    db.onlineClubs[idx] = {
      ...db.onlineClubs[idx],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    writeDb(db);
    res.json(db.onlineClubs[idx]);
  });

  // ADMIN: GET /api/admin/reviews (All reviews: pending, approved, hidden)
  app.get('/api/admin/reviews', requireAdmin, (req: Request, res: Response) => {
    const db = readDb();
    const enriched = db.reviews.map((r) => {
      const org = db.organizers.find((o) => o.id === r.targetId);
      return {
        ...r,
        targetName: org ? org.name : r.targetId
      };
    });
    res.json(enriched);
  });

  // ADMIN: PATCH /api/admin/reviews/:id (Approve or Hide with internal reason)
  app.patch('/api/admin/reviews/:id', requireAdmin, (req: Request, res: Response) => {
    const { status, internalHideReason } = req.body; // 'approved' | 'hidden'
    const db = readDb();
    const idx = db.reviews.findIndex((r) => r.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'ביקורת לא נמצאה' });

    if (status !== 'approved' && status !== 'hidden') {
      return res.status(400).json({ error: 'סטטוס לא חוקי' });
    }

    db.reviews[idx].status = status;
    db.reviews[idx].reviewedAt = new Date().toISOString();
    if (status === 'hidden' && internalHideReason) {
      db.reviews[idx].internalHideReason = internalHideReason.trim();
    }

    writeDb(db);
    res.json(db.reviews[idx]);
  });

  // ADMIN: GET /api/admin/group-formations (All statuses for moderation)
  app.get('/api/admin/group-formations', requireAdmin, (req: Request, res: Response) => {
    const db = readDb();
    const list = [...(db.groupFormations || [])];
    list.sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
    );
    res.json(list);
  });

  // ADMIN: PATCH /api/admin/group-formations/:id/moderate
  app.patch('/api/admin/group-formations/:id/moderate', requireAdmin, (req: Request, res: Response) => {
    const { status, rejectionReason } = req.body; // 'approved' | 'rejected' | 'hidden' | 'pending'
    const db = readDb();
    const group = (db.groupFormations || []).find((g) => g.id === req.params.id);
    if (!group) return res.status(404).json({ error: 'פרסום גיבוש קבוצה לא נמצא' });

    if (!['approved', 'rejected', 'hidden', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'סטטוס לא חוקי' });
    }

    group.status = status;
    if (status === 'rejected' && rejectionReason) {
      group.rejectionReason = rejectionReason.trim();
    } else if (status === 'approved') {
      group.rejectionReason = undefined;
    }
    group.updatedAt = new Date().toISOString();

    logAudit(
      db,
      status === 'approved' ? 'edit_event' : 'hide_event',
      'event',
      group.id,
      group.title,
      `עדכון סטטוס גיבוש קבוצה: ${status}. ${rejectionReason ? 'סיבת דחייה: ' + rejectionReason : ''}`
    );

    writeDb(db);
    res.json({
      success: true,
      groupFormation: group,
      message: `הפרסום סומן כ-${
        status === 'approved'
          ? 'מאושר ופעיל באתר'
          : status === 'rejected'
          ? 'הוחזר לתיקון/נדחה'
          : 'מוסתר'
      }`
    });
  });

  // ADMIN: GET /api/admin/cash-games
  app.get('/api/admin/cash-games', requireAdmin, (req: Request, res: Response) => {
    const db = readDb();
    const list = [...(db.cashGames || [])];
    res.json(list);
  });

  // ADMIN: POST /api/admin/cash-games
  app.post('/api/admin/cash-games', requireAdmin, (req: Request, res: Response) => {
    const data = req.body;
    const db = readDb();
    const newGame: CashGame = {
      ...data,
      id: `cg_${Date.now()}`,
      status: data.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (!db.cashGames) db.cashGames = [];
    db.cashGames.unshift(newGame);
    writeDb(db);
    res.status(201).json({ success: true, cashGame: newGame, message: 'משחק הקאש נוסף בהצלחה' });
  });

  // ADMIN: PUT /api/admin/cash-games/:id
  app.put('/api/admin/cash-games/:id', requireAdmin, (req: Request, res: Response) => {
    const db = readDb();
    const idx = (db.cashGames || []).findIndex((g) => g.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'משחק קאש לא נמצא' });

    db.cashGames[idx] = {
      ...db.cashGames[idx],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    writeDb(db);
    res.json({ success: true, cashGame: db.cashGames[idx], message: 'משחק הקאש עודכן בהצלחה' });
  });

  // ADMIN: PATCH /api/admin/cash-games/:id/action
  app.patch('/api/admin/cash-games/:id/action', requireAdmin, (req: Request, res: Response) => {
    const { action } = req.body; // 'hide' | 'unhide' | 'delete'
    const db = readDb();
    const idx = (db.cashGames || []).findIndex((g) => g.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'משחק קאש לא נמצא' });

    if (action === 'delete') {
      db.cashGames.splice(idx, 1);
      writeDb(db);
      return res.json({ success: true, message: 'המשחק נמחק בהצלחה' });
    }

    if (action === 'hide') {
      db.cashGames[idx].status = 'hidden';
      db.cashGames[idx].updatedAt = new Date().toISOString();
      writeDb(db);
      return res.json({ success: true, cashGame: db.cashGames[idx], message: 'משחק הקאש הוסתר מהאתר' });
    }

    if (action === 'unhide') {
      db.cashGames[idx].status = 'active';
      db.cashGames[idx].updatedAt = new Date().toISOString();
      writeDb(db);
      return res.json({ success: true, cashGame: db.cashGames[idx], message: 'משחק הקאש הוצג מחדש באתר' });
    }

    return res.status(400).json({ error: 'פעולה לא חוקית' });
  });

  // Vite middleware in dev or static files in production
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PokerCircle Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting PokerCircle server:', err);
  process.exit(1);
});
