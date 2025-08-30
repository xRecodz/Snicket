"use client"

import Layout from "@/components/Layout"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useContract } from "@/hooks/useContract"
import { useAccount } from "wagmi"
import { ethers } from "ethers"
import { SCAN_MAX } from "@/lib/utils"
import { showToast } from "@/lib/toast"

type EventRow = {
  id: number
  name: string
  startTime: number
  endTime: number
  priceWei: bigint | string
  maxSupply: number
  minted: number
  active: boolean
}

export default function HomePage() {
  const contract = useContract()
  const { isConnected } = useAccount()
  const [featuredEvents, setFeaturedEvents] = useState<EventRow[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [buyingId, setBuyingId] = useState<number | null>(null)

  useEffect(() => {
    const loadFeaturedEvents = async () => {
      if (!contract) return
      setLoadingEvents(true)
      try {
        const found: EventRow[] = []
        for (let i = 0; i < SCAN_MAX; i++) {
          try {
            const ev: any = await (contract as any).events(i)
            const name = ev?.name ?? ""
            const start = ev?.startTime ?? 0
            const end = ev?.endTime ?? 0
            const price = ev?.priceWei ?? 0n
            const maxSupply = ev?.maxSupply ?? 0
            const minted = ev?.minted ?? 0
            const active = !!ev?.active

            if (name && (Number(start) > 0 || Number(end) > 0) && active && minted < maxSupply) {
              found.push({
                id: i,
                name: String(name),
                startTime: Number(start),
                endTime: Number(end),
                priceWei: typeof price === "bigint" ? price : BigInt(price?.toString?.() ?? "0"),
                maxSupply: Number(maxSupply),
                minted: Number(minted),
                active,
              })
            }
          } catch {
            // index ini tidak valid; lanjut saja
          }
        }
        // Show only first 3 active events for homepage
        setFeaturedEvents(found.slice(0, 3))
      } catch (e: any) {
        console.error("Error loading featured events:", e)
      } finally {
        setLoadingEvents(false)
      }
    }

    loadFeaturedEvents()
  }, [contract])

  const formatPrice = (p: bigint | string) => {
    const v = typeof p === "bigint" ? p : BigInt(p)
    return ethers.formatEther(v)
  }

  const formatDate = (ts: number) =>
    new Date(ts * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })

  const buyTicket = async (id: number, price: bigint | string) => {
    if (!contract || !isConnected) {
      showToast.error("Please connect your wallet first")
      return
    }
    setBuyingId(id)
    try {
      const value = typeof price === "bigint" ? price : BigInt(price)
      const tx = await (contract as any).buyTicket(id, { value })

      showToast.promise(tx.wait(), {
        loading: "Processing your ticket purchase...",
        success: "Ticket purchased successfully! 🎫",
        error: "Failed to purchase ticket. Please try again.",
      })
    } catch (e: any) {
      console.error(e)
      showToast.error("Purchase failed", e?.message || "Please try again later")
    } finally {
      setBuyingId(null)
    }
  }

  return (
    <Layout>
      <div className="hero-gradient min-h-screen flex items-center relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Content */}
            <div className="animate-fade-in">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 mb-8">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">Blockchain-Powered Ticketing</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-black text-foreground mb-6 leading-tight">
                Unlock Your Experience with{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  NFT Ticketing
                </span>
              </h1>

              <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl">
                Experience the future of event access. Secure, transparent, and truly yours - every ticket is a unique
                NFT that you own completely.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/events" className="btn-primary text-lg inline-flex items-center justify-center space-x-2">
                  <span>Explore Events</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>

                <Link
                  href="/organizer"
                  className="btn-outline text-lg inline-flex items-center justify-center space-x-2"
                >
                  <span>Create Event</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-8 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>100% Secure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span>Fraud-Proof</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Instant Transfer</span>
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
<div className="animate-slide-up lg:animate-fade-in">
  <div className="relative">
    <img
      src="/konser.jpg"
      alt="Concert"
      className="rounded-3xl shadow-xl object-cover w-full h-full"
    />
  </div>
</div>
          </div>
        </div>
      </div>

      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-foreground mb-4">
              Why Choose <span className="text-primary">Snicket</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the next generation of event ticketing with blockchain technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-feature animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">100% Authentic</h3>
              <p className="text-muted-foreground leading-relaxed">
                Every ticket is a unique NFT with immutable proof of authenticity. No counterfeits, no fraud.
              </p>
            </div>

            <div className="card-feature animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="w-16 h-16 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">Lightning Fast</h3>
              <p className="text-muted-foreground leading-relaxed">
                Instant transactions and transfers. Buy, sell, or transfer your tickets in seconds.
              </p>
            </div>

            <div className="card-feature animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">Truly Yours</h3>
              <p className="text-muted-foreground leading-relaxed">
                You own your tickets completely. Transfer, resell, or keep as collectibles - your choice.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-foreground mb-4">
              Featured <span className="text-primary">Live Events</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Don't miss out on these exclusive events with limited NFT tickets available now
            </p>
          </div>

          {loadingEvents ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground text-lg">Loading featured events...</p>
            </div>
          ) : featuredEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-muted to-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">No Active Events</h3>
              <p className="text-muted-foreground text-lg mb-6">
                Check back soon for new event announcements and ticket drops.
              </p>
              <Link href="/events" className="btn-primary">
                Browse All Events
              </Link>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {featuredEvents.map((event, index) => (
                  <div
                    key={event.id}
                    className="card animate-fade-in group"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="aspect-video bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10 rounded-xl mb-6 overflow-hidden relative flex items-center justify-center border border-primary/10 group-hover:border-primary/20 transition-all duration-300">
                      <div className="text-center">
                        <svg
                          className="w-16 h-16 text-primary group-hover:text-secondary transition-colors duration-300 mx-auto mb-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p className="text-xs text-muted-foreground">NFT Event Ticket</p>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="status-badge">🔥 Hot</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {event.name}
                        </h3>
                        <div className="flex items-center text-muted-foreground text-sm">
                          <svg
                            className="w-4 h-4 mr-2 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>{formatDate(event.startTime)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="price-badge text-lg">
                          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                            />
                          </svg>
                          <span className="font-bold">{formatPrice(event.priceWei)} STT</span>
                        </div>

                        <div className="flex items-center text-muted-foreground text-sm">
                          <svg
                            className="w-4 h-4 mr-1 text-secondary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                            />
                          </svg>
                          <span className="font-medium">{Math.max(event.maxSupply - event.minted, 0)} left</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <button
                          onClick={() => buyTicket(event.id, event.priceWei)}
                          disabled={!isConnected || buyingId === event.id}
                          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {buyingId === event.id ? (
                            <div className="flex items-center justify-center space-x-2">
                              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              <span>Buying...</span>
                            </div>
                          ) : !isConnected ? (
                            "Connect Wallet to Buy"
                          ) : (
                            "Buy NFT Ticket"
                          )}
                        </button>

                        <Link href="/events" className="w-full btn-outline text-center block">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Link
                  href="/events"
                  className="btn-secondary text-lg px-8 py-3 inline-flex items-center space-x-3 group"
                >
                  <span>View All Events</span>
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  )
}
