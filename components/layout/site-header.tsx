import Link from "next/link";
import type { Session } from "next-auth";
import { Heart, Search } from "lucide-react";
import { mainNav, siteConfig } from "@/lib/constants";
import { HeaderAuthControls } from "@/components/layout/header-auth-controls";
import { HeaderChrome } from "@/components/layout/header-chrome";
import { MobileNavSheet } from "@/components/layout/mobile-nav-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from "@/components/ui/navigation-menu";

const navPreviewMap: Record<string, { title: string; description: string; links: Array<{ label: string; href: string }> }> = {
  "/tools": {
    title: "Directory",
    description: "Browse and filter the full catalog by workflow and quality signals.",
    links: [
      { label: "All Tools", href: "/tools" },
      { label: "Trending Tools", href: "/today-ai-tools" },
      { label: "Top Free Tools", href: "/best-free-ai-tools" }
    ]
  },
  "/find-ai-tool": {
    title: "AI Finder",
    description: "Describe your task and get practical tool recommendations.",
    links: [
      { label: "Open AI Finder", href: "/find-ai-tool" },
      { label: "For Developers", href: "/best-ai-tools-for-developers" },
      { label: "For Marketers", href: "/ai-tools-for-marketers" }
    ]
  }
};

const primaryDesktopLinks = ["/tools", "/find-ai-tool", "/workflows", "/prompts"];
const moreDesktopLinks = ["/pricing", "/categories", "/blog"];

export function SiteHeader({ session }: { session: Session | null }) {
  const isAuthenticated = Boolean(session?.user);
  const isAdmin = session?.user?.role === "admin";
  const userName = session?.user?.name ?? null;
  const userEmail = session?.user?.email ?? null;

  const desktopPrimaryNav = mainNav.filter((item) => primaryDesktopLinks.includes(item.href));
  const desktopMoreNav = mainNav.filter((item) => moreDesktopLinks.includes(item.href));

  return (
    <HeaderChrome>
      <div className="page-frame py-2.5 md:py-3">
        <div className="glass-nav rounded-[1.2rem] px-2.5 py-2 transition-[border-color,box-shadow,background-color] duration-300 md:px-3.5">
          <div className="flex items-center justify-between gap-2 lg:hidden">
            <Link href="/" className="group flex min-w-0 items-center gap-3">
              <div className="spotlight-ring grid size-10 shrink-0 place-items-center rounded-[1rem] bg-gradient-to-br from-primary via-secondary-foreground to-primary font-[family-name:var(--font-heading)] text-base font-bold text-primary-foreground transition-transform duration-300 group-hover:scale-105">
                TF
              </div>
            </Link>
            <MobileNavSheet
              navItems={mainNav}
              isAuthenticated={isAuthenticated}
              isAdmin={isAdmin}
              userName={userName}
              userEmail={userEmail}
            />
          </div>

          <div className="hidden lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <Link href="/" className="group flex min-w-0 items-center gap-3">
                <div className="spotlight-ring grid size-10 shrink-0 place-items-center rounded-[1rem] bg-gradient-to-br from-primary via-secondary-foreground to-primary font-[family-name:var(--font-heading)] text-base font-bold text-primary-foreground transition-transform duration-300 group-hover:scale-105">
                  TF
                </div>
                <div className="min-w-0">
                  <p className="truncate font-[family-name:var(--font-heading)] text-[1.75rem] font-bold leading-none xl:text-lg">
                    {siteConfig.name}
                  </p>
                </div>
              </Link>
              <div className="h-8 w-px shrink-0 bg-border/80" />
            </div>

            <div className="min-w-0">
              <NavigationMenu className="w-full" delayDuration={0} skipDelayDuration={0}>
                <NavigationMenuList className="justify-start gap-1">
                  {desktopPrimaryNav.map((item) => {
                    const preview = navPreviewMap[item.href];
                    if (!preview) {
                      return (
                        <NavigationMenuItem key={item.href} className="relative shrink-0">
                          <NavigationMenuLink asChild>
                            <Link
                              href={item.href}
                              className="nav-link-modern interactive-control block rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium text-foreground/90 hover:bg-white hover:text-foreground"
                            >
                              {item.label}
                            </Link>
                          </NavigationMenuLink>
                        </NavigationMenuItem>
                      );
                    }

                    return (
                      <NavigationMenuItem key={item.href} className="relative shrink-0">
                        <NavigationMenuTrigger className="h-9 rounded-[var(--radius-control)] bg-transparent px-3 text-sm font-medium text-foreground/90 hover:bg-white hover:text-foreground data-[state=open]:bg-white data-[state=open]:text-foreground">
                          {item.label}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent className="z-[60]">
                          <div className="w-[22rem] rounded-[1rem] border border-border/70 bg-background/95 p-4 shadow-floating">
                            <p className="font-semibold text-foreground">{preview.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{preview.description}</p>
                            <div className="mt-3 grid gap-1">
                              {preview.links.map((linkItem) => (
                                <NavigationMenuLink key={linkItem.href} asChild>
                                  <Link
                                    href={linkItem.href}
                                    className="interactive-control rounded-[0.8rem] px-3 py-2 text-sm font-medium text-foreground hover:bg-white"
                                  >
                                    {linkItem.label}
                                  </Link>
                                </NavigationMenuLink>
                              ))}
                            </div>
                          </div>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    );
                  })}

                  {desktopMoreNav.length ? (
                    <NavigationMenuItem className="relative shrink-0">
                      <NavigationMenuTrigger className="h-9 rounded-[var(--radius-control)] bg-transparent px-3 text-sm font-medium text-foreground/90 hover:bg-white hover:text-foreground data-[state=open]:bg-white data-[state=open]:text-foreground">
                        More
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="z-[60]">
                        <div className="w-[14rem] rounded-[1rem] border border-border/70 bg-background/95 p-2 shadow-floating">
                          {desktopMoreNav.map((item) => (
                            <NavigationMenuLink key={item.href} asChild>
                              <Link
                                href={item.href}
                                className="interactive-control block rounded-[0.8rem] px-3 py-2 text-sm font-medium text-foreground hover:bg-white"
                              >
                                {item.label}
                              </Link>
                            </NavigationMenuLink>
                          ))}
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ) : null}
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <form
                action="/tools"
                className="hidden h-10 w-[9.5rem] items-center gap-2 rounded-[var(--radius-control)] border border-white/85 bg-white/78 px-2 lg:flex xl:w-[10.5rem] 2xl:w-[12rem]"
              >
                <Search className="ml-1 h-4 w-4 text-muted-foreground" />
                <Input
                  name="q"
                  placeholder="Search..."
                  className="h-8 border-0 bg-transparent px-1 text-sm shadow-none focus-visible:ring-0"
                />
              </form>
              <Button asChild size="sm" className="h-10 rounded-[0.8rem] px-4">
                <Link href="/tools">Find</Link>
              </Button>
              <Button asChild size="sm" className="h-10 rounded-[0.8rem] px-5">
                <Link href={isAuthenticated ? "/submit" : "/auth/login?callbackUrl=%2Fsubmit"}>Submit Tool</Link>
              </Button>
              {isAuthenticated ? (
                <Button asChild variant="ghost" size="sm" className="h-10 w-10 p-0">
                  <Link href="/favorites" aria-label="Favorites">
                    <Heart className="h-4 w-4" />
                  </Link>
                </Button>
              ) : null}
              <HeaderAuthControls compact />
            </div>
          </div>
        </div>
      </div>
    </HeaderChrome>
  );
}
