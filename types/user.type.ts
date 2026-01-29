export interface SessionResponse {
  session: TSession;
  user: TUser;
}

export interface TSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;   // ISO string
  createdAt: string;   // ISO string
  updatedAt: string;   // ISO string
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

export type TUserRole = "CUSTOMER" | "PROVIDER" | "ADMIN";

export type TAccountStatus = "ACTIVE" | "SUSPENDED";
