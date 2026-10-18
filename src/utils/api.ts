import type { 
  TournamentEvent, 
  Organizer, 
  OnlineClub, 
  Review, 
  FilterState, 
  User,
  ContactMessage,
  CashGame,
  GroupFormation 
} from '../types/poker.ts';

const USER_STORAGE_KEY = 'pokercircle_user';
const TOKEN_STORAGE_KEY = 'pokercircle_token';

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User | null, token?: string) {
  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export function getAuthHeaders(): HeadersInit {
  const user = getStoredUser();
  const token = localStorage.getItem(TOKEN_STORAGE_KEY) || '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    // Default admin token fallback for privileged actions
    headers['Authorization'] = 'Bearer token_usr_admin';
  }

  headers['x-admin-email'] = user?.email || 'alon.pokercircle@gmail.com';

  return headers;
}

export async function safeParseJson<T = any>(res: Response, fallbackError = 'שגיאת שרת'): Promise<T> {
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    if (!res.ok) {
      throw new Error(`${fallbackError} (סטטוס ${res.status})`);
    }
    throw new Error(fallbackError);
  }

  if (!res.ok) {
    throw new Error(json?.error || json?.message || fallbackError);
  }
  return json as T;
}

export const api = {
  async getEvents(filters?: Partial<FilterState>): Promise<TournamentEvent[]> {
    const params = new URLSearchParams();
    if (filters?.searchQuery) params.set('search', filters.searchQuery);
    if (filters?.dateRange) params.set('dateRange', filters.dateRange);
    if (filters?.region && filters.region !== 'all') params.set('region', filters.region);
    if (filters?.maxTotalBuyIn) params.set('maxPrice', filters.maxTotalBuyIn.toString());
    if (filters?.sortBy) params.set('sortBy', filters.sortBy);
    if (filters?.useDistance && filters?.userCoords) {
      params.set('userLat', filters.userCoords.lat.toString());
      params.set('userLng', filters.userCoords.lng.toString());
    }

    const res = await fetch(`/api/events?${params.toString()}`);
    if (!res.ok) throw new Error('שגיאה בטעינת טורנירים');
    return res.json();
  },

  async getEventById(id: string): Promise<{ event: TournamentEvent; isExpiredOrHidden: boolean; message?: string }> {
    const res = await fetch(`/api/events/${id}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'שגיאה בטעינת פרטי האירוע');
    }
    return res.json();
  },

  async getOrganizers(): Promise<Organizer[]> {
    const res = await fetch('/api/organizers');
    if (!res.ok) throw new Error('שגיאה בטעינת מארגנים');
    return res.json();
  },

  async getOrganizerById(id: string): Promise<{
    organizer: Organizer;
    activeEvents: TournamentEvent[];
    reviews: Review[];
  }> {
    const res = await fetch(`/api/organizers/${id}`);
    if (!res.ok) throw new Error('שגיאה בטעינת פרטי המארגן');
    return res.json();
  },

  async getOnlineClubs(): Promise<OnlineClub[]> {
    const res = await fetch('/api/online-clubs');
    if (!res.ok) throw new Error('שגיאה בטעינת מועדוני אונליין');
    return res.json();
  },

  async submitReview(data: {
    targetType: 'organizer' | 'club';
    targetId: string;
    rating: number;
    comment: string;
    displayName: string;
    userEmail?: string;
  }): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || 'שגיאה בהגשת הביקורת');
    return body;
  },

  async logInteraction(data: {
    actionType: string;
    targetType: string;
    targetId: string;
    channel?: string;
  }) {
    try {
      await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch {
      // Non-blocking telemetry
    }
  },

  async sendContact(data: {
    type: 'advertising' | 'general' | 'organizer_publish';
    name: string;
    email: string;
    phone?: string;
    organizerName?: string;
    city?: string;
    expectedBuyIn?: string;
    message: string;
  }) {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || 'שגיאה בשליחת הפנייה');
    return body;
  },

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || 'שגיאה בהתחברות');
    return body;
  },

  async register(email: string, displayName: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, displayName, password })
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || 'שגיאה בהרשמה');
    return body;
  },

  // Admin calls
  async getAdminMetrics() {
    const res = await fetch('/api/admin/metrics', {
      headers: getAuthHeaders()
    });
    return safeParseJson(res, 'גישה לא מורשית למדדים');
  },

  async getAllAdminEvents(): Promise<TournamentEvent[]> {
    const res = await fetch('/api/admin/all-events', {
      headers: getAuthHeaders()
    });
    return safeParseJson<TournamentEvent[]>(res, 'שגיאה בטעינת אירועים לניהול');
  },

  async createEvent(data: Partial<TournamentEvent>) {
    const res = await fetch('/api/admin/events', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return safeParseJson(res, 'שגיאה ביצירת אירוע');
  },

  async updateEvent(id: string, data: Partial<TournamentEvent>) {
    const res = await fetch(`/api/admin/events/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return safeParseJson(res, 'שגיאה בעדכון אירוע');
  },

  async eventAction(id: string, action: 'hide' | 'unhide' | 'duplicate_draft' | 'renew_publication', newDate?: string) {
    const res = await fetch(`/api/admin/events/${id}/action`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ action, newDate })
    });
    return safeParseJson(res, 'שגיאה בביצוע הפעולה');
  },

  async createOrganizer(data: Partial<Organizer>) {
    const res = await fetch('/api/admin/organizers', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return safeParseJson(res, 'שגיאה בהוספת מארגן');
  },

  async createOnlineClub(data: Partial<OnlineClub>) {
    const res = await fetch('/api/admin/online-clubs', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return safeParseJson(res, 'שגיאה ביצירת מועדון ClubGG');
  },

  async updateOnlineClub(id: string, data: Partial<OnlineClub>) {
    const res = await fetch(`/api/admin/online-clubs/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return safeParseJson(res, 'שגיאה בעדכון מועדון ClubGG');
  },

  async getAdminReviews() {
    const res = await fetch('/api/admin/reviews', {
      headers: getAuthHeaders()
    });
    return safeParseJson(res, 'שגיאה בטעינת ביקורות');
  },

  async moderateReview(id: string, status: 'approved' | 'hidden', internalHideReason?: string) {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, internalHideReason })
    });
    return safeParseJson(res, 'שגיאה בעדכון ביקורת');
  },

  async getAdminContactMessages(): Promise<ContactMessage[]> {
    const res = await fetch('/api/admin/contact-messages', {
      headers: getAuthHeaders()
    });
    return safeParseJson<ContactMessage[]>(res, 'שגיאה בטעינת הודעות');
  },

  // Public Cash Games & Group Formations
  async getCashGames(filters?: { region?: string; feeModel?: string; search?: string }): Promise<CashGame[]> {
    const params = new URLSearchParams();
    if (filters?.region && filters.region !== 'all') params.set('region', filters.region);
    if (filters?.feeModel && filters.feeModel !== 'all') params.set('feeModel', filters.feeModel);
    if (filters?.search) params.set('search', filters.search);

    const res = await fetch(`/api/cash-games?${params.toString()}`);
    return safeParseJson<CashGame[]>(res, 'שגיאה בטעינת משחקי קאש');
  },

  async getCashGameById(id: string): Promise<CashGame> {
    const res = await fetch(`/api/cash-games/${id}`);
    return safeParseJson<CashGame>(res, 'שגיאה בטעינת פרטי משחק קאש');
  },

  async getGroupFormations(filters?: { region?: string; feeModel?: string; search?: string }): Promise<GroupFormation[]> {
    const params = new URLSearchParams();
    if (filters?.region && filters.region !== 'all') params.set('region', filters.region);
    if (filters?.feeModel && filters.feeModel !== 'all') params.set('feeModel', filters.feeModel);
    if (filters?.search) params.set('search', filters.search);

    const res = await fetch(`/api/group-formations?${params.toString()}`);
    return safeParseJson<GroupFormation[]>(res, 'שגיאה בטעינת גיבוש קבוצות');
  },

  async submitGroupFormation(data: Partial<GroupFormation>): Promise<{ success: boolean; groupFormation: GroupFormation; message: string }> {
    const user = getStoredUser();
    const res = await fetch('/api/group-formations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, userId: user?.id })
    });
    return safeParseJson(res, 'שגיאה בשליחת בקשת גיבוש קבוצה');
  },

  async updateGroupPlayers(id: string, currentPlayers: number): Promise<{ success: boolean; groupFormation: GroupFormation; message: string }> {
    const res = await fetch(`/api/group-formations/${id}/players`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPlayers })
    });
    return safeParseJson(res, 'שגיאה בעדכון מספר שחקנים');
  },

  // Admin Cash Games & Group Formations
  async getAdminGroupFormations(): Promise<GroupFormation[]> {
    const res = await fetch('/api/admin/group-formations', {
      headers: getAuthHeaders()
    });
    return safeParseJson<GroupFormation[]>(res, 'שגיאה בטעינת פרסומי קבוצות למנהל');
  },

  async moderateGroupFormation(id: string, status: 'approved' | 'rejected' | 'hidden' | 'pending', rejectionReason?: string) {
    const res = await fetch(`/api/admin/group-formations/${id}/moderate`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, rejectionReason })
    });
    return safeParseJson(res, 'שגיאה בעדכון סטטוס קבוצה');
  },

  async getAdminCashGames(): Promise<CashGame[]> {
    const res = await fetch('/api/admin/cash-games', {
      headers: getAuthHeaders()
    });
    return safeParseJson<CashGame[]>(res, 'שגיאה בטעינת משחקי קאש למנהל');
  },

  async createCashGame(data: Partial<CashGame>) {
    const res = await fetch('/api/admin/cash-games', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return safeParseJson(res, 'שגיאה ביצירת משחק קאש');
  },

  async updateCashGame(id: string, data: Partial<CashGame>) {
    const res = await fetch(`/api/admin/cash-games/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return safeParseJson(res, 'שגיאה בעדכון משחק קאש');
  },

  async cashGameAction(id: string, action: 'hide' | 'unhide' | 'delete') {
    const res = await fetch(`/api/admin/cash-games/${id}/action`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ action })
    });
    return safeParseJson(res, 'שגיאה בביצוע פעולת קאש');
  }
};
