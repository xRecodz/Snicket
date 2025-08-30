"use client"

import { useEffect, useState } from "react"
import { ethers } from "ethers"
import Layout from "@/components/Layout"
import TicketDetailsModal from "@/components/TicketDetailsModal"
import { useContract } from "@/hooks/useContract"
import { useAccount } from "wagmi"
import { SCAN_MAX, showToast } from "@/lib/utils"

// EventRow type with image support
type EventRow = {
  id: number
  name: string
  startTime: number
  endTime: number
  priceWei: bigint | string
  maxSupply: number
  minted: number
  active: boolean
  image?: string
}

export default function EventsPage() {
  const contract = useContract()
  const { isConnected } = useAccount()
  const [events, setEvents] = useState<EventRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [buyingId, setBuyingId] = useState<number | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<EventRow | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filter, setFilter] = useState<"all" | "available" | "sold-out">("all")
  const [sortBy, setSortBy] = useState<"date" | "price" | "availability">("date")

  useEffect(() => {
    const loadEvents = async () => {
      if (!contract) return
      setLoading(true)
      setError(null)
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

            if (name && (Number(start) > 0 || Number(end) > 0)) {
              let image: string | undefined
              try {
                const tokenUri = await (contract as any).tokenURI(i)
                const metaRes = await fetch(resolveIPFS(tokenUri))
                const meta = await metaRes.json()
                image = meta.image
              } catch {
                image = undefined // Fallback if tokenURI or metadata fetch fails
              }

              found.push({
                id: i,
                name: String(name),
                startTime: Number(start),
                endTime: Number(end),
                priceWei: typeof price === "bigint" ? price : BigInt(price?.toString?.() ?? "0"),
                maxSupply: Number(maxSupply),
                minted: Number(minted),
                active,
                image,
              })
            }
          } catch {
            // Skip invalid index
          }
        }
        setEvents(found.filter((e) => e.active))
      } catch (e: any) {
        console.error("Error loading events:", e)
        setError(e?.message || String(e))
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [contract])

  const formatDate = (ts: number) =>
    new Date(ts * 1000).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  const formatPrice = (p: bigint | string) => {
    const v = typeof p === "bigint" ? p : BigInt(p)
    return ethers.formatEther(v)
  }

  const buy = async (id: number, price: bigint | string) => {
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

      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (e: any) {
      console.error(e)
      showToast.error("Purchase failed", e?.message || "Please try again later")
    } finally {
      setBuyingId(null)
    }
  }

  const handleTicketClick = (event: EventRow) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedEvent(null)
  }

  const filteredAndSortedEvents = events
    .filter((event) => {
      if (filter === "available") return event.minted < event.maxSupply
      if (filter === "sold-out") return event.minted >= event.maxSupply
      return true
    })
    .sort((a, b) => {
      if (sortBy === "date") return a.startTime - b.startTime
      if (sortBy === "price") {
        const priceA = typeof a.priceWei === "bigint" ? a.priceWei : BigInt(a.priceWei)
        const priceB = typeof b.priceWei === "bigint" ? b.priceWei : BigInt(b.priceWei)
        return priceA < priceB ? -1 : priceA > priceB ? 1 : 0
      }
      if (sortBy === "availability") return b.maxSupply - b.minted - (a.maxSupply - a.minted)
      return 0
    })

  const getEventStatus = (event: EventRow) => {
    const now = Date.now() / 1000
    if (event.minted >= event.maxSupply) return "sold-out"
    if (now < event.startTime) return "upcoming"
    if (now > event.endTime) return "ended"
    return "live"
  }

  return (
    <Layout>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>

        <div className="relative min-h-[40vh] flex items-center py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 font-serif">
                Cosmic{" "}
                <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-cosmic-glow">
                  Events
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Discover exclusive events in the metaverse and secure your NFT tickets on the blockchain
              </p>

              <div className="flex justify-center items-center space-x-8 mt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{events.length}</div>
                  <div className="text-sm text-muted-foreground">Active Events</div>
                </div>
                <div className="w-px h-12 bg-border"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">
                    {events.filter((e) => e.minted < e.maxSupply).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Available</div>
                </div>
                <div className="w-px h-12 bg-border"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">
                    {events.reduce((sum, e) => sum + (e.maxSupply - e.minted), 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Tickets Left</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {error && (
          <div className="mb-8 p-4 border border-destructive/50 bg-destructive/10 rounded-xl text-destructive text-sm backdrop-blur-sm animate-fade-in">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {!loading && events.length > 0 && (
          <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-muted-foreground">Filter:</span>
                <div className="flex rounded-lg border border-border overflow-hidden">
                  {[
                    { key: "all", label: "All Events" },
                    { key: "available", label: "Available" },
                    { key: "sold-out", label: "Sold Out" },
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setFilter(option.key as any)}
                      className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                        filter === option.key
                          ? "bg-primary text-primary-foreground"
                          : "bg-card hover:bg-accent/10 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-gradient-to-r from-card to-card/80 border border-accent/30 rounded-lg hover:border-accent/60 transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 text-foreground font-medium min-w-[140px] focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/70"
              >
                <option value="date" className="bg-card text-foreground">
                  Event Date
                </option>
                <option value="price" className="bg-card text-foreground">
                  Price
                </option>
                <option value="availability" className="bg-card text-foreground">
                  Availability
                </option>
              </select>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-primary/20 border-t-primary mx-auto mb-6"></div>
              <div
                className="absolute inset-0 rounded-full h-20 w-20 border-4 border-accent/20 border-r-accent mx-auto animate-spin"
                style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
              ></div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Loading Cosmic Events</h3>
            <p className="text-muted-foreground">Scanning the blockchain for available NFT tickets...</p>
          </div>
        ) : filteredAndSortedEvents.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gradient-to-br from-muted/50 to-muted/20 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-cosmic-glow">
              <svg className="w-16 h-16 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-4 font-serif">
              {events.length === 0 ? "No Events Found" : "No Events Match Your Filter"}
            </h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-md mx-auto">
              {events.length === 0
                ? "The cosmic event calendar is currently empty. Check back soon for new NFT ticket drops."
                : "Try adjusting your filters to discover more events."}
            </p>
            {events.length === 0 && (
              <button onClick={() => window.location.reload()} className="btn-primary">
                Refresh Events
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
            {filteredAndSortedEvents.map((ev, index) => {
              const status = getEventStatus(ev)
              return (
                <div
                  key={ev.id}
                  onClick={() => handleTicketClick(ev)}
                  className="card-event animate-fade-in group cursor-pointer relative overflow-hidden"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="aspect-[4/3] rounded-xl mb-6 overflow-hidden relative border border-primary/20 group-hover:border-accent/40 transition-all duration-300">
                    {ev.image ? (
                      <img
                        src={resolveIPFS(ev.image)}
                        alt={ev.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20">
                        <div className="text-center relative z-10">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary/30 to-accent/30 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                            <svg
                              className="w-8 h-8 text-primary group-hover:text-accent transition-colors duration-300"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <p className="text-xs text-muted-foreground group-hover:text-accent/80 transition-colors duration-300 font-medium">
                            Click for Details
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      {status === "sold-out" && <span className="status-badge-sold-out">Sold Out</span>}
                      {status === "available" && <span className="status-badge-available">Available</span>}
                      {status === "live" && <span className="status-badge-available animate-pulse">🔴 Live</span>}
                      {status === "upcoming" && (
                        <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium">
                          ⏰ Soon
                        </span>
                      )}
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2 font-serif leading-tight">
                        {ev.name}
                      </h3>
                      <div className="flex items-center text-muted-foreground text-sm">
                        <svg
                          className="w-4 h-4 mr-2 text-accent flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="truncate">{formatDate(ev.startTime)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="price-badge text-base">
                        <svg
                          className="w-4 h-4 mr-1 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                          />
                        </svg>
                        <span className="font-bold">{formatPrice(ev.priceWei)} STT</span>
                      </div>

                      <div className="flex items-center text-muted-foreground">
                        <svg
                          className="w-4 h-4 mr-1 text-secondary flex-shrink-0"
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
                        <span className="text-sm font-medium">
                          {Math.max(ev.maxSupply - ev.minted, 0)}/{ev.maxSupply}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Tickets Sold</span>
                        <span>{Math.round((ev.minted / ev.maxSupply) * 100)}%</span>
                      </div>
                      <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-accent to-secondary transition-all duration-500 rounded-full"
                          style={{ width: `${(ev.minted / ev.maxSupply) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        buy(ev.id, ev.priceWei)
                      }}
                      disabled={!isConnected || ev.minted >= ev.maxSupply || buyingId === ev.id}
                      className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100 text-sm py-3"
                    >
                      {buyingId === ev.id ? (
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
                          <span>Processing...</span>
                        </div>
                      ) : !isConnected ? (
                        "Connect Wallet"
                      ) : ev.minted >= ev.maxSupply ? (
                        "Sold Out"
                      ) : (
                        "Buy NFT Ticket"
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {filteredAndSortedEvents.length > 12 && (
          <div className="text-center mt-12 p-6 card">
            <p className="text-muted-foreground mb-4">Showing {filteredAndSortedEvents.length} events</p>
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <div
                className="w-2 h-2 bg-accent rounded-full animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-secondary rounded-full animate-pulse"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <TicketDetailsModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={closeModal}
        onBuyTicket={buy}
        buyingId={buyingId}
        isConnected={isConnected}
      />
    </Layout>
  )
}