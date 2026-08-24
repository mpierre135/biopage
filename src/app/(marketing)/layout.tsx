"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
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
      className="flex items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-md"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
        <Sparkles className="h-4 w-4 text-primary-foreground" />
      </div>
      <span className="text-lg font-bold tracking-tight text-slate-900">
        {brandConfig.name}
      </span>
    </Link>
  );
}

function DesktopNav() {
  return (
    <nav className="hidden md:flex items-center gap-1">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="px-3 py-2 text-sm font-medium text-slate-600 rounded-md transition-colors duration-150 hover:text-slate-900 hover:bg-slate-100 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function DesktopActions() {
  return (
    <div className="hidden md:flex items-center gap-3">
      <SignedOut>
        <Link
          href="/sign-in"
          className="px-3 py-2 text-sm font-medium text-slate-600 rounded-md transition-colors duration-150 hover:text-slate-900 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          Sign in
        </Link>
        <Button
          render={<Link href="/sign-up" />}
          size="lg"
          className="cursor-pointer"
        >
          Get Started
        </Button>
      </SignedOut>
      <SignedIn>
        <Button
          render={<Link href="/dashboard" />}
          size="lg"
          className="cursor-pointer"
        >
          Dashboard
        </Button>
      </SignedIn>
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
              className="cursor-pointer"
              aria-label="Open menu"
            />
          }
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
                className="flex items-center h-11 px-3 text-sm font-medium text-slate-700 rounded-md transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-2 border-t border-border p-4">
            <SignedOut>
              <Button
                render={
                  <Link href="/sign-in" onClick={() => setOpen(false)} />
                }
                variant="outline"
                size="lg"
                className="w-full cursor-pointer"
              >
                Sign in
              </Button>
              <Button
                render={
                  <Link href="/sign-up" onClick={() => setOpen(false)} />
                }
                size="lg"
                className="w-full cursor-pointer"
              >
                Get Started
              </Button>
            </SignedOut>
            <SignedIn>
              <Button
                render={
                  <Link href="/dashboard" onClick={() => setOpen(false)} />
                }
                size="lg"
                className="w-full cursor-pointer"
              >
                Dashboard
              </Button>
            </SignedIn>
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
            <p className="mt-3 text-sm text-slate-600 max-w-xs">
              {brandConfig.description}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Product</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/features"
                  className="text-sm text-slate-600 transition-colors duration-150 hover:text-slate-900 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-sm"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-slate-600 transition-colors duration-150 hover:text-slate-900 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-sm"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/templates"
                  className="text-sm text-slate-600 transition-colors duration-150 hover:text-slate-900 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-sm"
                >
                  Templates
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Company</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href={`mailto:${brandConfig.supportEmail}`}
                  className="text-sm text-slate-600 transition-colors duration-150 hover:text-slate-900 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-sm"
                >
                  Support
                </a>
              </li>
              <li>
                <a
                  href={`https://twitter.com/${brandConfig.twitterHandle.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-600 transition-colors duration-150 hover:text-slate-900 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-sm"
                >
                  Twitter
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Legal</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-slate-600 transition-colors duration-150 hover:text-slate-900 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-sm"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-slate-600 transition-colors duration-150 hover:text-slate-900 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-sm"
                >
                  Terms
                </Link>
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
