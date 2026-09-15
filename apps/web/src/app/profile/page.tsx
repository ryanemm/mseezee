import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { Placeholder } from "@/components/layout/Placeholder";
import { ButtonLink } from "@/components/ui/Button";
import { LinkPhoneForm } from "@/components/auth/LinkPhoneForm";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <Placeholder
        title="Profile"
        body="Sign in with your phone number or email to manage your circles, set your home area, and see your giving history."
      />
    );
  }

  const { user } = session;
  const label = user.name || user.email || user.phone || "You";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-5 lg:px-8">
      <header className="flex flex-col gap-1">
        <p className="eyebrow">Profile</p>
        <h1 className="text-2xl">{label}</h1>
      </header>

      <dl className="flex flex-col divide-y divide-line rounded-card border border-line bg-surface text-sm shadow-card">
        {user.email && (
          <div className="flex justify-between gap-4 p-3.5">
            <dt className="text-ink-faint">Email</dt>
            <dd className="font-medium text-ink">{user.email}</dd>
          </div>
        )}
        {user.phone && (
          <div className="flex justify-between gap-4 p-3.5">
            <dt className="text-ink-faint">Phone</dt>
            <dd className="font-medium text-ink">{user.phone}</dd>
          </div>
        )}
      </dl>

      {!user.phone && <LinkPhoneForm />}

      <ButtonLink href="/dashboard" className="w-full">
        Your circles
      </ButtonLink>

      <p className="text-center text-sm text-ink-faint">
        Banking details for receiving funds aren't collected here yet — that
        arrives once MseeZee's payout model is finalised.{" "}
        <Link href="/about/safety" className="font-semibold text-forest">
          Learn more
        </Link>
      </p>
    </div>
  );
}
