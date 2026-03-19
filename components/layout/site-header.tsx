import Link from "next/link";
import { mainNav, siteConfig } from "@/lib/constants";
import { HeaderAuthControls } from "@/components/layout/header-auth-controls";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-2xl">
      <div className="page-frame py-4">
        <div className="surface-card flex items-center justify-between gap-4 rounded-[1.6rem] px-4 py-3 md:px-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/75 font-[family-name:var(--font-heading)] text-lg font-bold text-primary-foreground shadow-glow">
              AI
            </div>
            <div>
              <p className="font-[family-name:var(--font-heading)] text-lg font-bold">{siteConfig.name}</p>
              <p className="text-xs text-muted-foreground">Premium discovery for modern AI workflows</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 rounded-full border border-border/70 bg-white/70 p-1 md:flex">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-white hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <HeaderAuthControls />
        </div>

        <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 md:hidden">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full border border-border bg-white/80 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/favorites"
            className="whitespace-nowrap rounded-full border border-border bg-white/80 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm"
          >
            Favorites
          </Link>
        </nav>
      </div>
    </header>
  );
}
