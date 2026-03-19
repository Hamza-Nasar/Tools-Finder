import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-transparent">
      <div className="page-frame py-10">
        <div className="surface-card grid gap-8 p-8 md:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/75 font-[family-name:var(--font-heading)] text-lg font-bold text-primary-foreground">
                AI
              </div>
              <div>
                <p className="font-[family-name:var(--font-heading)] text-lg font-semibold">AI Tools Finder</p>
                <p className="text-sm text-muted-foreground">Modern discovery for premium AI products</p>
              </div>
            </div>
            <p className="max-w-xl text-sm leading-7 text-muted-foreground">
              Browse curated categories, compare standout tools, and submit products into a moderated directory built for scale.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <Link href="/tools" className="transition hover:text-foreground">Directory</Link>
            <Link href="/categories" className="transition hover:text-foreground">Categories</Link>
            <Link href="/best-ai-tools" className="transition hover:text-foreground">Best AI Tools</Link>
            <Link href="/best-free-ai-tools" className="transition hover:text-foreground">Best Free AI Tools</Link>
            <Link href="/submit" className="transition hover:text-foreground">Submit</Link>
            <Link href="/favorites" className="transition hover:text-foreground">Favorites</Link>
            <Link href="/admin" className="transition hover:text-foreground">Admin</Link>
            <Link href="/auth/sign-in" className="transition hover:text-foreground">Sign in</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
