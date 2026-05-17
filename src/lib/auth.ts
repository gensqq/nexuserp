import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-key-change-in-production"
);

export async function getAuthUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload?.userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: payload.userId as string },
    select: { id: true, email: true, name: true, role: true, companyId: true, isActive: true },
  });
  if (!user || !user.isActive) return null;
  return user;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function signToken(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

export type UserRole = "admin" | "manager" | "employee" | "viewer";

export const rolePermissions: Record<UserRole, string[]> = {
  admin: ["*"],
  manager: [
    "dashboard:read", "pos:read", "pos:write", "crm:read", "crm:write",
    "accounting:read", "hr:read", "hr:write", "projects:read", "projects:write",
    "inventory:read", "inventory:write", "mailing:read", "mailing:write", "reports:read",
  ],
  employee: [
    "dashboard:read", "pos:read", "pos:write", "crm:read",
    "projects:read", "projects:write", "inventory:read",
  ],
  viewer: ["dashboard:read", "reports:read"],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  const perms = rolePermissions[role];
  return perms.includes("*") || perms.includes(permission);
}
