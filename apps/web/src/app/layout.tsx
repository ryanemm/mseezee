import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { SessionProvider } from "@/components/auth/SessionProvider";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  // Link previews (WhatsApp, Facebook, X) need absolute image URLs. The
  // production image is built without NEXT_PUBLIC_APP_URL, so it falls back
  // to the live domain.
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://mseezee.co.za"),
  title: {
    default: "MseeZee — give where you live",
    template: "%s · MseeZee",
  },
  description:
    "Find funerals, families and community projects near you in South Africa, and contribute in seconds. Together, we uplift.",
  applicationName: "MseeZee",
};

export const viewport: Viewport = {
  themeColor: "#1f4a34",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${jakarta.variable}`}>
        <SessionProvider>
          <AppShell>{children}</AppShell>
        </SessionProvider>
      </body>
    </html>
  );
}
