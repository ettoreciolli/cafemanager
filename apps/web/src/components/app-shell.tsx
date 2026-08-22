"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  CalendarClockIcon,
  ClipboardListIcon,
  CoffeeIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MoonIcon,
  PackageIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  SunIcon,
  TruckIcon,
  UsersIcon,
  UtensilsIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/orders", label: "Orders", icon: ClipboardListIcon },
  { href: "/menu", label: "Menu", icon: UtensilsIcon },
  { href: "/ingredients", label: "Ingredients", icon: PackageIcon },
  { href: "/suppliers", label: "Suppliers", icon: TruckIcon },
  { href: "/deliveries", label: "Deliveries", icon: CalendarClockIcon },
  { href: "/staff", label: "Staff", icon: UsersIcon },
];

export function AppShell({
  userName,
  children,
}: {
  userName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = React.useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="flex min-h-full flex-1">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r bg-card py-4 transition-[width] duration-200 md:flex px-3",
          collapsed ? "w-16 " : "w-56 "
        )}
      >
        <div className={cn("mb-6 inline-flex items-center justify-center", collapsed ? "h-6" : "")}>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground mr-auto fixed left-4">
            <CoffeeIcon className="size-4" />
          </span>
          {!collapsed && (
            <span className="font-heading font-semibold tracking-tight text-nowrap ml-10">Cafe Manager</span>
          )}
          <Button
            variant="ghost"
            size="icon-xs"
            className={cn("absolute -right-10", collapsed ? "" : "")}
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpenIcon /> : <PanelLeftCloseIcon />}
          </Button>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "flex items-center rounded-lg text-sm font-medium transition-colors",
                collapsed ? "justify-center py-2 px-2.5" : "gap-2 px-2.5 py-1.5",
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="size-4 shrink-0 mr-auto" />
              {!collapsed && item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2 border-t pt-3">
          <div
            className={cn(
              "flex items-center",
              collapsed ? "justify-center" : "justify-between px-1"
            )}
          >
            {!collapsed && (
              <span className="min-w-0 truncate text-xs text-muted-foreground">{userName}</span>
            )}
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />}
            </Button>
          </div>
          {collapsed ? (
            <Button variant="outline" size="icon-sm" title="Sign out" onClick={logout}>
              <LogOutIcon className="size-3.5" />
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOutIcon className="size-3.5" /> Sign out
            </Button>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-1.5 overflow-x-auto border-b bg-background/80 px-4 backdrop-blur md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium",
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="size-3.5" /> {item.label}
            </Link>
          ))}
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}