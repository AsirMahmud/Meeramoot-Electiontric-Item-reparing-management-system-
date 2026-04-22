const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

export function getAuthHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}
/* =========================================================
   CORE REQUEST HELPERS
========================================================= */

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}/api${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
<<<<<<< HEAD
    throw new Error(data.message || `Request failed with status ${response.status}`);
=======
    throw new Error((data as any)?.message || `Request failed with status ${response.status}`);
>>>>>>> 4bc9e005b7817c1c5b3c773557f6c38b0bcb14ba
  }

  return data as T;
}

<<<<<<< HEAD
export type Shop = {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  distanceKm: number;
  averagePrice: number;
  heroTag: string;
};
=======
async function authedRequest<T>(path: string, token?: string, init?: RequestInit): Promise<T> {
  return request<T>(path, {
    ...init,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });
}

/* =========================================================
   TYPES
========================================================= */

export type ShopCategory = "COURIER_PICKUP" | "IN_SHOP_REPAIR" | "SPARE_PARTS";
export type ShopServicePricingType = "FIXED" | "STARTING_FROM" | "INSPECTION_REQUIRED";
>>>>>>> 4bc9e005b7817c1c5b3c773557f6c38b0bcb14ba

/** 🔥 Unified shop type (merged both versions) */
export type Shop = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
<<<<<<< HEAD
  logoUrl?: string | null;
=======
>>>>>>> 4bc9e005b7817c1c5b3c773557f6c38b0bcb14ba
  address: string;
  city?: string | null;
  area?: string | null;

  ratingAvg: number;
  reviewCount: number;
  priceLevel: number;
<<<<<<< HEAD
  hasVoucher: boolean;
  freeDelivery: boolean;
  hasDeals: boolean;
  categories: string[];
  specialties: string[];
  acceptsDirectOrders: boolean;
=======

  logoUrl?: string | null;
  bannerUrl?: string | null;

  lat?: number | null;
  lng?: number | null;

  /** discovery fields */
  distanceKm?: number | null;
  etaMinutes?: number | null;
  etaText?: string | null;
  resultTag?: string | null;
  offerSummary?: string | null;
  matchReasons?: string[];

  /** flags */
  isFeatured?: boolean;
  hasVoucher: boolean;
  freeDelivery: boolean;
  hasDeals: boolean;

  /** classification */
  categories?: ShopCategory[] | string[];
  specialties?: string[];

  /** capabilities */
  acceptsDirectOrders?: boolean;
>>>>>>> 4bc9e005b7817c1c5b3c773557f6c38b0bcb14ba
  supportsPickup?: boolean;
  supportsOnsiteRepair?: boolean;

<<<<<<< HEAD
export type ShopService = {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string | null;
  description?: string | null;
  deviceType?: string | null;
  issueCategory?: string | null;
  pricingType?: string | null;
  basePrice?: number | null;
  priceMax?: number | null;
  estimatedDaysMin?: number | null;
  estimatedDaysMax?: number | null;
  includesPickup?: boolean;
  includesDelivery?: boolean;
  isFeatured?: boolean;
};

export type ShopDetail = ShopSummary & {
  bannerUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  openingHoursText?: string | null;
  services: ShopService[];
=======
  /** details */
  phone?: string | null;
  email?: string | null;
>>>>>>> 4bc9e005b7817c1c5b3c773557f6c38b0bcb14ba
};
export type VendorApplicationPayload = {
  ownerName: string;
  businessEmail: string;
  phone: string;
  password: string;
  confirmPassword: string;
  shopName: string;
  tradeLicenseNo?: string;
  address: string;
  city?: string;
  area?: string;
  specialties?: string[] | string;
  courierPickup?: boolean;
  inShopRepair?: boolean;
  spareParts?: boolean;
  notes?: string;
};

export function createVendorApplication(data: VendorApplicationPayload) {
  return request<{
    message: string;
    application: {
      id: string;
      userId: string;
      ownerName: string;
      businessEmail: string;
      shopName: string;
      status: string;
      createdAt: string;
    };
  }>("/vendor/applications", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function vendorLogin(data: { identifier: string; password: string }) {
  return request<{
    message: string;
    token: string;
    user: {
      id: string;
      username: string;
      email: string;
      name?: string | null;
      phone?: string | null;
      role?: string | null;
    };
  }>("/vendor/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export type VendorApplicationStatusResponse = {
  application?: {
    id: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    rejectionReason?: string | null;
    rejectedAt?: string | null;
    rejectionVisibleUntil?: string | null;

    ownerName?: string;
    businessEmail?: string;
    phone?: string;
    shopName?: string;
    tradeLicenseNo?: string | null;
    address?: string;
    city?: string | null;
    area?: string | null;
    specialties?: string[];
    courierPickup?: boolean;
    inShopRepair?: boolean;
    spareParts?: boolean;
    notes?: string | null;

    createdAt?: string;
  };
  message?: string;
};
export function getMyVendorApplication(token: string) {
  return authedRequest<{ application?: VendorApplicationStatusResponse["application"]; message?: string }>(
    "/vendor/application-status",
    token
  );
}
export async function getVendorApplicationStatus(
  token: string
): Promise<VendorApplicationStatusResponse> {
  return authedRequest("/vendor/application-status", token);
}
export function updateVendorApplication(
  token: string,
  data: {
    ownerName: string;
    businessEmail: string;
    phone: string;
    shopName: string;
    tradeLicenseNo?: string;
    address: string;
    city?: string;
    area?: string;
    specialties?: string[] | string;
    courierPickup?: boolean;
    inShopRepair?: boolean;
    spareParts?: boolean;
    notes?: string;
  }
) {
  return request<{
    message: string;
    application: {
      id: string;
      status: "PENDING" | "APPROVED" | "REJECTED";
      ownerName: string;
      businessEmail: string;
      phone: string;
      shopName: string;
      tradeLicenseNo?: string | null;
      address?: string;
      city?: string | null;
      area?: string | null;
      specialties?: string[];
      courierPickup?: boolean;
      inShopRepair?: boolean;
      spareParts?: boolean;
      notes?: string | null;
      rejectionReason?: string | null;
      rejectionVisibleUntil?: string | null;
      createdAt: string;
    };
  }>("/vendor/application-status", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

export type EditableVendorApplication = {
  id?: string;
  ownerName: string;
  businessEmail: string;
  phone: string;
  shopName: string;
  tradeLicenseNo?: string | null;
  address: string;
  city?: string | null;
  area?: string | null;
  specialties?: string[] | string;
  courierPickup?: boolean;
  inShopRepair?: boolean;
  spareParts?: boolean;
  notes?: string | null;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string | null;
  rejectionVisibleUntil?: string | null;
};

export type AdminVendorApplication = {
  id: string;
  userId: string;
  ownerName: string;
  businessEmail: string;
  phone: string;
  shopName: string;
  tradeLicenseNo?: string | null;
  address: string;
  city?: string | null;
  area?: string | null;
  specialties: string[];
  courierPickup: boolean;
  inShopRepair: boolean;
  spareParts: boolean;
  notes?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
};

export function getAdminVendorApplications(token: string) {
  return request<{ applications: AdminVendorApplication[] }>("/vendor/applications/admin", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function approveAdminVendorApplication(token: string, id: string) {
  return request<{ message: string; application: AdminVendorApplication }>(
    `/vendor/applications/admin/${encodeURIComponent(id)}/approve`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export function rejectAdminVendorApplication(token: string, id: string, reason: string) {
  return request<{ message: string; application: AdminVendorApplication }>(
    `/vendor/applications/admin/${encodeURIComponent(id)}/reject`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    }
  );
}
/* =========================================================
   AUTH
========================================================= */

export type AuthPayload = {
  message: string;
  token: string;
  user: {
    id: string;
    name?: string | null;
    username: string | null;
    email: string | null;
    phone?: string | null;
  };
};

export function signup(data: {
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
}) {
  return request<AuthPayload>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function checkUsername(username: string) {
  return request<{ available: boolean }>(
    `/auth/check-username?username=${encodeURIComponent(username)}`
  );
}

/* =========================================================
   SHOPS
========================================================= */

export type ShopQuery = {
  q?: string;
  category?: string;
  sort?: string;
  featured?: boolean;
  voucher?: boolean;
  freeDelivery?: boolean;
  deals?: boolean;
  maxDistanceKm?: number;
  take?: number;
<<<<<<< HEAD
}) {
  const query = new URLSearchParams();
  if (params?.category) query.set("category", params.category);
  if (params?.sort) query.set("sort", params.sort);
  if (params?.q) query.set("q", params.q);
  if (params?.featured) query.set("featured", "true");
  if (params?.take) query.set("take", String(params.take));
  const suffix = query.toString() ? `?${query}` : "";
  return request<ShopSummary[]>(`/shops${suffix}`, { cache: "no-store" });
}

export function getFeaturedShops() {
  return request<ShopSummary[]>("/shops/featured", { cache: "no-store" });
}

export function getShopBySlug(slug: string) {
  return request<ShopDetail>(`/shops/${encodeURIComponent(slug)}`, { cache: "no-store" });
}

export function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") {
    return {};
  }

  const token = localStorage.getItem("meramot.token");

  if (!token) {
    return {};
  }

  return { Authorization: `Bearer ${token}` };
}


export function login(data: { identifier: string; password: string }) {
  return request<AuthPayload>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
=======
};

function buildQuery(params: ShopQuery = {}) {
  const q = new URLSearchParams();

  if (params.q) q.set("q", params.q);
  if (params.category) q.set("category", params.category);
  if (params.sort) q.set("sort", params.sort);
  if (params.featured) q.set("featured", "true");
  if (params.voucher) q.set("voucher", "true");
  if (params.freeDelivery) q.set("freeDelivery", "true");
  if (params.deals) q.set("deals", "true");
  if (params.maxDistanceKm) q.set("maxDistanceKm", String(params.maxDistanceKm));
  if (params.take) q.set("take", String(params.take));

  return q.toString() ? `?${q}` : "";
}

export function getShops(params: ShopQuery = {}) {
  return request<Shop[]>(`/shops${buildQuery(params)}`);
}

export function getFeaturedShops() {
  return request<Shop[]>("/shops/featured");
}

export function getShopBySlug(slug: string) {
  return request<Shop>(`/shops/${encodeURIComponent(slug)}`);
>>>>>>> 4bc9e005b7817c1c5b3c773557f6c38b0bcb14ba
}

/* =========================================================
   SERVICES / REQUESTS
========================================================= */

export async function createRepairRequest(payload: any, token?: string) {
  return authedRequest("/requests", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMyOrders(token: string) {
  return authedRequest<any[]>("/requests/mine", token);
}

/* =========================================================
   REVIEWS
========================================================= */

export async function getShopReviews(slug: string) {
  const data = await request<any>(`/shops/${slug}/reviews`);
  return Array.isArray(data) ? data : data.reviews || [];
}

export async function getReviewEligibility(
  shopSlug: string,
  accessToken?: string
) {
  return request<{
    eligible: boolean;
    hasCompletedJob: boolean;
    hasExistingReview: boolean;
  }>(`/shops/${shopSlug}/review-eligibility`, {
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
}

export async function createReview(
  slug: string,
  payload: { score: number; review?: string },
  token?: string
) {
  return authedRequest(`/shops/${slug}/reviews`, token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* =========================================================
   PROFILE
========================================================= */

export function getProfile(token?: string) {
  return authedRequest("/profile/me", token);
}

export function updateProfile(token: string, payload: any) {
  return authedRequest("/profile/me", token, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/* =========================================================
   DELIVERY (RIDER)
========================================================= */

export const DELIVERY_TOKEN_STORAGE_KEY = "meeramoot_delivery_token";

export function deliveryLogin(data: { identifier: string; password: string }) {
  return request("/delivery/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function fetchDeliveryMe(token: string) {
  return authedRequest("/delivery/me", token);
}

export function fetchDeliveryDeliveries(token: string, status?: string) {
  const q = status ? `?status=${status}` : "";
  return authedRequest(`/delivery/deliveries${q}`, token);
}

export function updateDeliveryStatus(token: string, id: string, status: string) {
  return authedRequest(`/delivery/deliveries/${id}/status`, token, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function acceptDelivery(token: string, id: string) {
  return authedRequest(`/delivery/deliveries/${id}/accept`, token, {
    method: "PATCH",
  });
}

/* =========================================================
   DELIVERY ADMIN
========================================================= */

export const DELIVERY_ADMIN_TOKEN_STORAGE_KEY = "meeramoot_delivery_admin_token";

export function deliveryAdminLogin(data: { identifier: string; password: string }) {
  return request("/delivery-admin/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function fetchDeliveryAdminStats(token: string) {
  return authedRequest("/delivery-admin/stats", token);
}

export function fetchDeliveryAdminPartners(token: string, status?: string) {
  const q = status ? `?registrationStatus=${status}` : "";
  return authedRequest(`/delivery-admin/partners${q}`, token);
}

export function approveDeliveryPartnerAdmin(token: string, id: string) {
  return authedRequest(`/delivery-admin/partners/${id}/approve`, token, {
    method: "PATCH",
  });
}

export function rejectDeliveryPartnerAdmin(token: string, id: string) {
  return authedRequest(`/delivery-admin/partners/${id}/reject`, token, {
    method: "PATCH",
  });
}