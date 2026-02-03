export interface SessionResponse {
  session: TSession;
  user: TUser;
}

export interface TSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  ipAddress: string;
  userAgent: string;
}

export interface TUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  role: TUserRole;
  accountStatus: TAccountStatus;
  createdAt: string;   // ISO string
  updatedAt: string;   // ISO string
}

export type TUserRole = "CUSTOMER" | "PROVIDER" | "ADMIN" | "NONE";

export type TAccountStatus = "ACTIVE" | "SUSPENDED";

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;  // ISO string
  address?: string;
  contactNo?: string;
  userId: string;
}

export interface ProviderProfile {
  id: string;
  providerName: string;
  providerEmail: string;
  providerContact: string;
  providerAddress: string;
  ownerName: string;
  ownerEmail: string;
  userId: string;
}

export interface ProviderWithUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  role: TUserRole;
  accountStatus: TAccountStatus;
  createdAt: string;
  updatedAt: string;
  providerProfile: {
    id: string;
    providerName: string;
    providerEmail: string;
    providerContact: string;
    providerAddress: string;
    ownerName: string;
    ownerEmail: string;
    _count: {
      meals: number;
    };
  };
}

export interface AdminProfile {
  id: string;
  name: string;
  contact: string;
  userId: string;
}
