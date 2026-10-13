import { BackLink, PageTopBar } from "@/components/ui/IconButton";

export function StepHeader({
  backHref,
  step,
  total,
  title,
}: {
  backHref: string;
  step: number;
  total: number;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-4 px-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] md:pt-8">
      <PageTopBar back={<BackLink href={backHref} />} title={title} />
      <div
        className="mx-auto flex w-24 gap-1.5"
        role="img"
        aria-label={`Step ${step} of ${total}`}
      >
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full ${i < step ? "bg-night" : "bg-line"}`}
          />
        ))}
      </div>
    </div>
  );
}
