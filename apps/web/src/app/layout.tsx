import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { SessionProvider } from "@/components/auth/SessionProvider";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  // Link previews (WhatsApp, Facebook, X) need absolute image URLs. The
  // production image is built without NEXT_PUBLIC_APP_URL, so it falls back
  // to the live domain.
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://mseezee.co.za"),
  title: {
    default: "MseeZee — close to home, close to heart",
    template: "%s · MseeZee",
  },
  description:
    "Support the people and causes closest to you — funerals, families and community projects across South Africa, in seconds. Close to home, close to heart.",
  applicationName: "MseeZee",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0e100e" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={jakarta.variable}>
        <SessionProvider>
          <AppShell>{children}</AppShell>
        </SessionProvider>
      </body>
    </html>
  );
}
