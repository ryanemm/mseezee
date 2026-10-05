import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CreateWizard } from "@/components/create/CreateWizard";

export const metadata: Metadata = { title: "Start a circle" };

export default async function CreatePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/create");
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <CreateWizard />
    </div>
  );
}
