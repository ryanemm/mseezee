import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { verifyOtp } from "@/lib/otp";
import { toE164ZA } from "@/lib/smsportal";

/**
 * Two sign-in methods today: email+password and phone+OTP (via SMSPortal).
 * Google and a magic-link email provider are the obvious next additions —
 * add them to `providers` below once there's a Google OAuth client and a
 * transactional-email account; nothing else here needs to change.
 *
 * A phone number that verifies successfully but doesn't match an existing
 * account creates one — that's the expected flow for "sign up with your
 * phone." Email+password is deliberately separate and explicit (a real
 * `/sign-up` step), since a password is being set.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  // Self-hosted on a single known deployment (not multi-tenant), so trusting
  // the request Host header is safe — needed whenever the app runs on a port
  // other than the one baked into NEXT_PUBLIC_APP_URL (e.g. local testing).
  trustHost: true,
  providers: [
    Credentials({
      id: "email-password",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const email = String(creds?.email ?? "").trim().toLowerCase();
        const password = String(creds?.password ?? "");
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name ?? undefined, email: user.email ?? undefined };
      },
    }),
    Credentials({
      id: "phone-otp",
      name: "Phone",
      credentials: {
        phone: { label: "Phone", type: "text" },
        code: { label: "Code", type: "text" },
      },
      async authorize(creds) {
        const phoneRaw = String(creds?.phone ?? "");
        const code = String(creds?.code ?? "");
        const phone = toE164ZA(phoneRaw);
        if (!phone || !code) return null;

        const result = await verifyOtp(phoneRaw, code);
        if (!result.ok) return null;

        const user = await prisma.user.upsert({
          where: { phone },
          create: { phone, phoneVerified: new Date() },
          update: { phoneVerified: new Date() },
        });

        return { id: user.id, name: user.name ?? undefined, phone: user.phone ?? undefined };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Only `name`/`email` are carried onto the token automatically —
        // custom fields like `phone` need to be copied across explicitly.
        if (user.phone) token.phone = user.phone;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (token.id) session.user.id = token.id as string;
        if (token.phone) session.user.phone = token.phone as string;
      }
      return session;
    },
  },
});
