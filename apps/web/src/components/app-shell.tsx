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
  SettingsIcon,
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
  { href: "/settings", label: "Settings", icon: SettingsIcon },
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
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r bg-card py-4 transition-[width] duration-300 md:flex px-3 relative",
          collapsed ? "w-16 " : "w-56"
        )}
      >
        <div className={cn("mb-6 inline-flex items-center justify-end gap-0", collapsed ? "h-6" : "")}>
          <span className="flex h-8 w-8  items-center justify-center rounded-lg bg-card  mr-auto fixed left-0 pl-4 w-12 m-0 pt-0 pb-0 m-0 pr-0">
            <div className="bg-primary h-8 w-8 rounded-lg flex items-center justify-center m-0 border border-black text-primary-foreground">
        <CoffeeIcon className="size-4"/>
            </div>
            
          </span>
          
            <span className={cn("font-heading font-semibold tracking-tight text-nowrap  flex justify-end overflow-hidden mr-2", collapsed ? "" : "")}>Cafe Manager</span>
          
          <Button
            variant="ghost"
            size="icon-xs"
            className={cn("absolute -right-6 top-0 rounded-tl-none m-0", collapsed ? "" : "")}
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
                "flex items-center rounded-lg text-sm justify-end font-medium transition-colors h-8 p-2 mr-2",
                collapsed ? " " : "  ",
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : " "
              )}
            >
              <div className={cn("fixed left-0 z-1 flex items-center rounded-lg h-8 w-12 pl-4 pr-0 justify-end bg-card ")} >
                 <item.icon className={cn("h-8 w-8 p-2 m-0 rounded-lg transition-colors border", isActive(item.href)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground bg-card border-muted")} />
              </div>
             
              <p
                className={cn(" m-0 p-0 h-5 flex justify-end", collapsed ? "" : "")}
                style={{
                  // transition: "width 700ms"
                }}
              >
              {item.label}</p>
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