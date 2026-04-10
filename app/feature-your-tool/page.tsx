import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { getDefaultPaidListingPlan, getListingPlans, getPaidListingPlans } from "@/lib/listing-plans";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/shared/page-hero";
import { Button } from "@/components/ui/button";

export const metadata = buildMetadata({
  title: "Feature Your AI Tool",
  description: "Promote your approved AI tool with premium placement across homepage and category discovery surfaces.",
  path: "/feature-your-tool"
});

const placementBenefits = [
  "Homepage featured placement for buyers already exploring the market",
  "Category spotlight visibility where workflow-specific visitors are comparing options",
  "A clear paid upgrade that keeps the directory trustworthy instead of turning it into an ad wall",
  "Promotion layered on top of search, alternatives, comparison pages, and daily discovery routes"
];

const operatingSteps = [
  {
    step: "01",
    title: "Submit your tool",
    description: "Start with a normal directory submission so the listing can be reviewed and structured properly."
  },
  {
    step: "02",
    title: "Get approved",
    description: "Approved tools become eligible for search, category pages, comparison routes, and other organic discovery surfaces."
  },
  {
    step: "03",
    title: "Choose a paid plan",
    description: "Upgrade into monthly, quarterly, or annual premium placement once you want more visibility."
  }
];

export default function FeatureYourToolPage() {
  const featuredOffer = getDefaultPaidListingPlan();
  const listingPlans = getListingPlans();
  const paidPlans = getPaidListingPlans();

  return (
    <div className="page-frame py-12">
      <PageHero
        eyebrow="Founder Growth"
        title="Turn this directory into a paid acquisition channel."
        description="The product already has buyer traffic surfaces, comparison routes, and daily discovery modules. Listing plans now make the free baseline and paid visibility windows explicit."
        actions={
          <>
            <Button asChild size="lg">
              <Link href="/submit">
                Submit your tool
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/tools?sort=featured">Browse featured tools</Link>
            </Button>
          </>
        }
        stats={[
          { label: "Base paid plan", value: featuredOffer.priceLabel, detail: `${featuredOffer.durationLabel} of featured placement` },
          { label: "Paid tiers", value: String(paidPlans.length), detail: "monthly, quarterly, and annual options" },
          { label: "Checkout", value: "Stripe", detail: "promotion codes already supported" }
        ]}
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="surface-card p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Why founders would pay</p>
            <h2 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-semibold">
              A simple premium offer with real discovery context.
            </h2>
            <div className="mt-6 grid gap-3">
              {placementBenefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-start gap-3 rounded-[1.2rem] border border-border/70 bg-background/60 px-4 py-4"
                >
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="h-4 w-4" />
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground">{benefit}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-card p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Offer structure</p>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              {operatingSteps.map((item) => (
                <div key={item.step} className="rounded-[1.4rem] border border-border/70 bg-background/60 p-5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary">{item.step}</p>
                  <h3 className="mt-3 font-[family-name:var(--font-heading)] text-2xl font-semibold">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-card p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Listing plans</p>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {listingPlans.map((plan) => (
                <div key={plan.id} className="rounded-[1.4rem] border border-border/70 bg-background/60 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">{plan.name}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold">{plan.priceLabel}</p>
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{plan.durationLabel}</p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm leading-7 text-muted-foreground">
                    {plan.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="surface-card p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Current monetization offer</p>
                <h2 className="mt-3 font-[family-name:var(--font-heading)] text-4xl font-semibold">
                  {featuredOffer.priceLabel}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">{featuredOffer.name} for {featuredOffer.durationLabel}.</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm text-muted-foreground">
              <p>Founders can submit for free, then upgrade once the tool is approved.</p>
              <p>Paid plans map to real promotion windows, so founders know exactly how long the boost lasts.</p>
              <p>Free listing is standard directory placement. Paid plans unlock featured distribution.</p>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Button asChild size="lg">
                <Link href="/submit">
                  Start with submission
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/tools">Open the directory</Link>
              </Button>
            </div>
          </section>

          <section className="surface-card p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">How this makes money</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
              <li>Charge founders for featured placement.</li>
              <li>Offer monthly, quarterly, and annual visibility windows instead of one flat upgrade.</li>
              <li>Use affiliate URLs on relevant tools for click revenue.</li>
              <li>Grow newsletter leads, then sell sponsorship slots later.</li>
              <li>Package higher-tier founder services after traffic grows: sponsored collections, comparison placement, or launch bundles.</li>
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              {paidPlans.map((plan) => (
                <span
                  key={plan.id}
                  className="rounded-full border border-border/70 bg-background/60 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                >
                  {plan.name}: {plan.summaryLabel}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
