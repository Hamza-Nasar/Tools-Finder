import Link from "next/link";
import { getServerSession } from "next-auth";
import { ArrowUpRight, Search } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { mainNav, siteConfig } from "@/lib/constants";
import { HeaderAuthControls } from "@/components/layout/header-auth-controls";
import { HeaderChrome } from "@/components/layout/header-chrome";
import { MobileNavSheet } from "@/components/layout/mobile-nav-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export async function SiteHeader() {
  const session = await getServerSession(authOptions);
  const isAuthenticated = Boolean(session?.user);
  const isAdmin = session?.user?.role === "admin";
  const userName = session?.user?.name ?? null;
  const userEmail = session?.user?.email ?? null;

  return (
    <HeaderChrome>
      <div className="page-frame py-2.5 md:py-3">
        <div className="glass-nav rounded-[1.2rem] px-2.5 py-2 transition-[border-color,box-shadow,background-color] duration-300 md:px-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-4">
              <Link href="/" className="group flex min-w-0 items-center gap-3">
                <div className="spotlight-ring grid size-10 shrink-0 place-items-center rounded-[1rem] bg-gradient-to-br from-primary via-secondary-foreground to-primary font-[family-name:var(--font-heading)] text-base font-bold text-primary-foreground transition-transform duration-300 group-hover:scale-105">
                  TF
                </div>
                <div className="min-w-0">
                  <p className="truncate font-[family-name:var(--font-heading)] text-lg font-bold">{siteConfig.name}</p>
                  <p className="hidden truncate text-xs text-muted-foreground sm:block">
                    AI discovery intelligence for buyers and founders
                  </p>
                </div>
              </Link>

              <nav className="no-scrollbar hidden max-w-[48rem] items-center gap-1 overflow-x-auto rounded-[var(--radius-control)] border border-white/80 bg-background/70 p-1 md:flex">
                {mainNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="nav-link-modern interactive-control shrink-0 rounded-[var(--radius-control)] px-3.5 py-2 text-sm font-medium text-muted-foreground hover:bg-white hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex shrink-0 items-center gap-2 md:gap-3">
              <form action="/tools" className="hidden w-[20rem] items-center gap-2 rounded-[var(--radius-control)] border border-white/85 bg-white/78 px-2 py-1.5 xl:flex">
                <Search className="ml-1 h-4 w-4 text-muted-foreground" />
                <Input
                  name="q"
                  placeholder="Search any task or tool..."
                  className="h-8 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
                />
                <Button type="submit" size="sm" className="h-8 rounded-[0.7rem] px-3">
                  Find
                </Button>
              </form>
              <Button asChild size="sm" variant="outline" className="hidden lg:inline-flex">
                <Link href="/find-ai-tool">
                  Find my tool
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
