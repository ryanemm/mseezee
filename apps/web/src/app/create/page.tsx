import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { api } from "@/lib/api";
import { CreateWizard } from "@/components/create/CreateWizard";

export const metadata: Metadata = { title: "Start a circle" };

export default async function CreatePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/create");
  }

  const areas = await api.listAreas();
  return (
    <div className="mx-auto w-full max-w-xl">
      <CreateWizard areas={areas} />
    </div>
  );
}
