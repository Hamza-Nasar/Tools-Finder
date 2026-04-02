import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { mainNav, siteConfig } from "@/lib/constants";
import { HeaderAuthControls } from "@/components/layout/header-auth-controls";
import { HeaderChrome } from "@/components/layout/header-chrome";
import { MobileNavSheet } from "@/components/layout/mobile-nav-sheet";

export async function SiteHeader() {
  const session = await getServerSession(authOptions);
  const isAuthenticated = Boolean(session?.user);
  const isAdmin = session?.user?.role === "admin";
  const userName = session?.user?.name ?? null;
  const userEmail = session?.user?.email ?? null;

  return (
    <HeaderChrome>
      <div className="page-frame py-3 md:py-4">
        <div className="section-shell rounded-[1.6rem] px-4 py-3 md:px-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-4">
              <Link href="/" className="group flex min-w-0 items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/75 font-[family-name:var(--font-heading)] text-lg font-bold text-primary-foreground shadow-glow transition-transform duration-300 group-hover:scale-105">
                  AI
                </div>
                <div className="min-w-0">
                  <p className="truncate font-[family-name:var(--font-heading)] text-lg font-bold">{siteConfig.name}</p>
                  <p className="hidden truncate text-xs text-muted-foreground sm:block">
                    AI buyer research, daily signals, and premium discovery routes
                  </p>
                </div>
              </Link>

              <nav className="no-scrollbar hidden max-w-[44rem] items-center gap-1 overflow-x-auto rounded-full border border-border/70 bg-white/72 p-1 shadow-sm md:flex">
                {mainNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="interactive-control shrink-0 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-white hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex shrink-0 items-center gap-2 md:gap-3">
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
