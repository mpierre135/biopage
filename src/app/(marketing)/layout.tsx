"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";
import { Show } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { brandConfig } from "@/lib/brand";

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
] as const;

function Logo() {
  return (
    <Link
      href="/"
      className="flex cursor-pointer items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
        <Sparkles className="h-4 w-4 text-primary-foreground" aria-hidden />
      </div>
      <span className="text-lg font-bold tracking-tight text-slate-900">
        {brandConfig.name}
      </span>
    </Link>
  );
}

function DesktopNav() {
  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function DesktopActions() {
  return (
    <div className="hidden items-center gap-3 md:flex">
      <Show when="signed-out">
        <Link
          href="/sign-in"
          className="inline-flex min-h-11 cursor-pointer items-center rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Sign in
        </Link>
        <Link href="/sign-up" className="cursor-pointer">
          <Button size="lg" className="min-h-11 cursor-pointer">
            Get Started
          </Button>
        </Link>
      </Show>
      <Show when="signed-in">
        <Link href="/dashboard" className="cursor-pointer">
          <Button size="lg" className="min-h-11 cursor-pointer">
            Dashboard
          </Button>
        </Link>
      </Show>
    </div>
  );
}

function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="min-h-11 min-w-11 cursor-pointer"
              aria-label="Open menu"
            />
          }
        >
          {open ? (
            <X className="h-5 w-5" aria-hidden />
          ) : (
            <Menu className="h-5 w-5" aria-hidden />
          )}
        </SheetTrigger>
        <SheetContent side="right" className="w-[280px] p-0">
          <SheetHeader className="border-b border-border px-4 py-4">
            <SheetTitle>
              <Logo />
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 p-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex h-11 cursor-pointer items-center rounded-md px-3 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-2 border-t border-border p-4">
            <Show when="signed-out">
              <Link
                href="/sign-in"
                onClick={() => setOpen(false)}
                className="cursor-pointer"
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="min-h-11 w-full cursor-pointer"
                >
                  Sign in
                </Button>
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setOpen(false)}
                className="cursor-pointer"
              >
                <Button size="lg" className="min-h-11 w-full cursor-pointer">
                  Get Started
                </Button>
              </Link>
            </Show>
            <Show when="signed-in">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="cursor-pointer"
              >
                <Button size="lg" className="min-h-11 w-full cursor-pointer">
                  Dashboard
                </Button>
              </Link>
            </Show>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <DesktopNav />
        </div>
        <DesktopActions />
        <MobileMenu />
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-slate-600">
              {brandConfig.description}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Product</h3>
            <ul className="mt-3 space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="cursor-pointer rounded-sm text-sm text-slate-600 transition-colors duration-200 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Company</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href={`mailto:${brandConfig.supportEmail}`}
                  className="cursor-pointer rounded-sm text-sm text-slate-600 transition-colors duration-200 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Legal</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <span className="text-sm text-slate-500">Privacy (soon)</span>
              </li>
              <li>
                <span className="text-sm text-slate-500">Terms (soon)</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-gray-200 pt-6 text-center">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} {brandConfig.name}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
