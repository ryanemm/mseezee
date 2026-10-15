import type { Metadata } from "next";
import Link from "next/link";
import { formatZAR } from "@mseezee/shared";
import { auth } from "@/auth";
import { getMyOrganiserView } from "@/lib/api";
import { initials } from "@/lib/format";
import { Placeholder } from "@/components/layout/Placeholder";
import { LinkPhoneForm } from "@/components/auth/LinkPhoneForm";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { CircleTile } from "@/components/circle/CircleCard";
import { ListRow, RowIcon } from "@/components/ui/ListRow";
import { Watermark } from "@/components/ui/Watermark";
import {
  GridIcon,
  MailIcon,
  PhoneIcon,
  PlusIcon,
  ShieldIcon,
  UserIcon,
} from "@/components/ui/Icons";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <Placeholder
        title="Your profile"
        body="Sign in with your phone number or email to manage your circles, set your home area, and see your giving history."
        actionHref="/sign-in?callbackUrl=/profile"
        actionLabel="Sign in"
        icon={<UserIcon className="size-9" />}
      >
        <p className="text-sm text-ink-soft">
          New to MseeZee?{" "}
          <Link href="/sign-up" className="link">
            Create an account
          </Link>
        </p>
      </Placeholder>
    );
  }

  const { user } = session;
  const label = user.name || user.email || user.phone || "You";
  const view = await getMyOrganiserView(user.id);
  const totalSettled = view.circles.reduce((s, c) => s + c.settledCents, 0);
  const totalSupporters = view.circles.reduce((s, c) => s + c.supporterCount, 0);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-7 px-5 pt-[calc(env(safe-area-inset-top)+1.75rem)] lg:px-8 lg:pt-10">
      <header className="flex items-center gap-4">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-forest text-xl font-bold text-white">
          {initials(label)}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[1.5rem] font-bold">{label}</h1>
          {(user.email || user.phone) && (
            <p className="flex items-center gap-1.5 truncate text-ink-soft">
              {user.email ? <MailIcon className="size-4 shrink-0" /> : <PhoneIcon className="size-4 shrink-0" />}
              <span className="truncate">{user.email ?? user.phone}</span>
            </p>
          )}
        </div>
        <SignOutButton />
      </header>

      {view.circles.length > 0 ? (
        <section className="relative overflow-hidden rounded-[32px] bg-lime p-6 text-on-lime shadow-lime">
          <Watermark className="text-[2.6rem]" />
          <div className="relative flex flex-col gap-1">
            <p className="font-semibold">Raised across your circles</p>
            <p className="text-[2.9rem] font-extrabold leading-none tracking-[-0.04em] tnum">
              {formatZAR(totalSettled, { withDecimals: true })}
            </p>
          </div>
          <div className="relative mt-9 flex items-center justify-between gap-3">
            <p className="font-semibold tnum">
              {view.circles.length} {view.circles.length === 1 ? "circle" : "circles"} ·{" "}
              {totalSupporters} {totalSupporters === 1 ? "supporter" : "supporters"}
            </p>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-full bg-[#151815] px-5 py-3.5 font-bold text-white"
            >
              <GridIcon className="size-5" />
              Manage
            </Link>
          </div>
        </section>
      ) : (
        <section className="relative overflow-hidden rounded-[32px] bg-lime p-6 text-on-lime shadow-lime">
          <Watermark className="text-[2.6rem]" />
          <div className="relative flex flex-col gap-2">
            <p className="text-[1.6rem] font-extrabold leading-tight tracking-tight">
              Start your first circle
            </p>
            <p className="opacity-80">
              Raise money for a funeral, a family or your street — with the people around you.
            </p>
            <Link
              href="/create"
              className="mt-4 flex items-center gap-2 self-start rounded-full bg-[#151815] px-5 py-3.5 font-bold text-white"
            >
              <PlusIcon className="size-5" />
              Start a circle
            </Link>
          </div>
        </section>
      )}

      {view.circles.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[1.4rem] font-bold">Your circles</h2>
            <Link href="/create" className="flex items-center gap-1.5 font-bold">
              <PlusIcon className="size-5" />
              Start a circle
            </Link>
          </div>
          <div className="rail -mx-5 gap-3 px-5 lg:mx-0 lg:px-0">
            {view.circles.map(({ circle, settledCents }) => (
              <CircleTile
                key={circle.id}
                circle={circle}
                href={`/dashboard/${circle.slug}`}
                raisedCents={settledCents}
              />
            ))}
          </div>
        </section>
      )}

      <section className="rounded-[32px] bg-surface px-5 py-3 shadow-card lg:px-6">
        <h2 className="pb-1 pt-3 text-[1.4rem] font-bold">Account</h2>
        <div className="flex flex-col divide-y divide-line">
          {user.email && (
            <ListRow icon={<RowIcon><MailIcon className="size-6" /></RowIcon>} title="Email" subtitle={user.email} />
          )}
          {user.phone && (
            <ListRow icon={<RowIcon><PhoneIcon className="size-6" /></RowIcon>} title="Phone" subtitle={user.phone} />
          )}
          <ListRow
            href="/dashboard"
            icon={<RowIcon><GridIcon className="size-6" /></RowIcon>}
            title="Your circles"
            subtitle="Contributions, thank-yous and payouts"
          />
          <ListRow
            href="/about/safety"
            icon={<RowIcon><ShieldIcon className="size-6" /></RowIcon>}
            title="Keeping giving safe"
            subtitle="How MseeZee protects every rand"
          />
          <SignOutButton variant="row" />
        </div>
      </section>

      {!user.phone && <LinkPhoneForm />}

      <p className="pb-2 text-center text-sm text-ink-soft">
        Banking details for receiving funds aren&apos;t collected here yet — that
        arrives once MseeZee&apos;s payout model is finalised.{" "}
        <Link href="/about/safety" className="link">
          Learn more
        </Link>
      </p>
    </div>
  );
}
