import { cookies } from "next/headers";
import { prisma } from "./prisma";

const SESSION_COOKIE = "sk_session";

export type SessionUser = {
  id: string;
  namaLengkap: string;
  nip: string | null;
  unitKerja: string | null;
  jabatan: string | null;
  role: string;
};

export async function setSession(userId: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const id = jar.get(SESSION_COOKIE)?.value;
  if (!id) return null;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      namaLengkap: true,
      nip: true,
      unitKerja: true,
      jabatan: true,
      role: true,
    },
  });
  return user;
}

export async function requireUser(role?: "pemohon" | "kasubag" | "admin") {
  const user = await getSessionUser();
  if (!user) return null;
  if (role && user.role !== role) return null;
  return user;
}
