import Link from "next/link";
import { getServerSession } from "next-auth";
import { ArrowUpRight } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { mainNav, siteConfig } from "@/lib/constants";
import { HeaderAuthControls } from "@/components/layout/header-auth-controls";
import { HeaderChrome } from "@/components/layout/header-chrome";
import { MobileNavSheet } from "@/components/layout/mobile-nav-sheet";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const session = await getServerSession(authOptions);
  const isAuthenticated = Boolean(session?.user);
  const isAdmin = session?.user?.role === "admin";
  const userName = session?.user?.name ?? null;
  const userEmail = session?.user?.email ?? null;

  return (
    <HeaderChrome>
      <div className="page-frame py-2.5 md:py-3">
        <div className="rounded-[1.15rem] border border-white/[0.72] bg-white/84 px-2.5 py-2 shadow-sm backdrop-blur-xl transition-[border-color,box-shadow,background-color] duration-300 md:px-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-4">
              <Link href="/" className="group flex min-w-0 items-center gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-[1rem] bg-primary font-[family-name:var(--font-heading)] text-base font-bold text-primary-foreground shadow-glow transition-transform duration-300 group-hover:scale-105">
                  AI
                </div>
                <div className="min-w-0">
                  <p className="truncate font-[family-name:var(--font-heading)] text-lg font-bold">{siteConfig.name}</p>
                  <p className="hidden truncate text-xs text-muted-foreground sm:block">
                    AI buyer research, daily signals, and premium discovery routes
                  </p>
                </div>
              </Link>

              <nav className="no-scrollbar hidden max-w-[48rem] items-center gap-1 overflow-x-auto rounded-[var(--radius-control)] border border-border/70 bg-background/60 p-1 md:flex">
                {mainNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="nav-link-modern interactive-control shrink-0 rounded-[var(--radius-control)] px-3.5 py-2 text-sm font-medium text-muted-foreground hover:bg-white/[0.9] hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex shrink-0 items-center gap-2 md:gap-3">
              <Button asChild size="sm" variant="outline" className="hidden lg:inline-flex">
                <Link href="/find-ai-tool">
                  AI Finder
                  <ArrowUpRight data-icon="inline-end" />
                </Link>
              </Button>
              <div className="hidden md:block">
                <HeaderAuthControls />
              </div>
              <MobileNavSheet
                navItems={mainNav}
                isAuthenticated={isAuthenticated}
                isAdmin={isAdmin}
                userName={userName}
                userEmail={userEmail}
              />
            </div>
          </div>
        </div>
      </div>
    </HeaderChrome>
  );
}
