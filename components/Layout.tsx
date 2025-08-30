"use client"

import type React from "react"
import Navbar from "./Navbar"
import { Providers } from "./providers"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>

        <footer className="bg-muted border-t border-border py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-muted-foreground">
              © 2025 Snicket. Built with blockchain technology for secure event ticketing.
            </p>
          </div>
        </footer>
      </div>
    </Providers>
  )
}
