"use client"
import { ethers } from "ethers"
import { useState } from "react"
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

interface TicketDetailsModalProps {
  event: EventRow | null
  isOpen: boolean
  onClose: () => void
  onBuyTicket: (id: number, price: bigint | string) => void
  buyingId: number | null
  isConnected: boolean
}

export default function TicketDetailsModal({
  event,
  isOpen,
  onClose,
  onBuyTicket,
  buyingId,
  isConnected,
}: TicketDetailsModalProps) {
  const [shareOpen, setShareOpen] = useState(false)

  if (!isOpen || !event) return null

  const formatDate = (ts: number) =>
    new Date(ts * 1000).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    })

  const formatPrice = (p: bigint | string) => {
    const v = typeof p === "bigint" ? p : BigInt(p)
    return ethers.formatEther(v)
  }

  const getEventStatus = () => {
    const now = Date.now() / 1000
    if (now < event.startTime) return "upcoming"
    if (now > event.endTime) return "ended"
    return "active"
  }

  const isSoldOut = event.minted >= event.maxSupply
  const availableTickets = Math.max(event.maxSupply - event.minted, 0)
  const eventStatus = getEventStatus()

  const handleCopyEventId = () => {
    navigator.clipboard.writeText(event.id.toString())
    showToast.success("Event ID copied to clipboard!")
  }

  const handleShareEvent = (platform: "whatsapp" | "facebook" | "instagram") => {
    const url = `${window.location.origin}/events?event=${event.id}`
    const text = `Check out this event: ${event.name}\n${url}`

    let shareUrl = ""
    switch (platform) {
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
        break
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case "instagram":
        // Instagram tidak punya direct share URL, fallback ke copy link
        navigator.clipboard.writeText(text)
        showToast.success("Event link copied! Open Instagram to share manually.")
        setShareOpen(false)
        return
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank")
      setShareOpen(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="card bg-gradient-to-br from-card/95 via-card/90 to-primary/5 border-primary/30 shadow-2xl shadow-primary/20">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-foreground mb-2 font-serif">{event.name}</h2>
              <div className="flex items-center space-x-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    eventStatus === "active"
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : eventStatus === "upcoming"
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                  }`}
                >
                  {eventStatus === "active" && "🔴 Live Event"}
                  {eventStatus === "upcoming" && "⏰ Upcoming"}
                  {eventStatus === "ended" && "⏹️ Event Ended"}
                </span>
                {isSoldOut && <span className="status-badge-sold-out">Sold Out</span>}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent/10 rounded-lg transition-colors border border-transparent hover:border-accent/30"
            >
              <svg
                className="w-6 h-6 text-muted-foreground hover:text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Event Image and Basic Info */}
            <div className="space-y-6">
              <div className="aspect-video bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 rounded-xl overflow-hidden relative flex items-center justify-center border border-primary/20">
                <div className="text-center">
                  <svg className="w-20 h-20 text-primary mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-muted-foreground">Event NFT Artwork</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-secondary/10 animate-cosmic-glow"></div>
              </div>

              {/* Quick Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={handleCopyEventId}
                  className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Copy ID</span>
                </button>

                {/* Share Dropdown */}
                <div className="relative flex-1">
                  <button
                    onClick={() => setShareOpen(!shareOpen)}
                    className="w-full btn-secondary text-sm py-2 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                      />
                    </svg>
                    <span>Share</span>
                  </button>

                  {shareOpen && (
                    <div className="absolute mt-2 right-0 bg-card border border-primary/20 rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => handleShareEvent("whatsapp")}
                        className="block px-4 py-2 text-sm hover:bg-accent/10 w-full text-left"
                      >
                        Share to WhatsApp
                      </button>
                      <button
                        onClick={() => handleShareEvent("facebook")}
                        className="block px-4 py-2 text-sm hover:bg-accent/10 w-full text-left"
                      >
                        Share to Facebook
                      </button>
                      <button
                        onClick={() => handleShareEvent("instagram")}
                        className="block px-4 py-2 text-sm hover:bg-accent/10 w-full text-left"
                      >
                        Share to Instagram
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-6">
              {/* Event Schedule */}
              <div className="card bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
                <h3 className="text-xl font-semibold mb-4 font-serif flex items-center space-x-2">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Event Schedule</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-muted-foreground">Starts</p>
                      <p className="font-medium text-foreground">{formatDate(event.startTime)}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ends</p>
                      <p className="font-medium text-foreground">{formatDate(event.endTime)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket Information */}
              <div className="card bg-gradient-to-br from-secondary/5 to-primary/5 border-secondary/20">
                <h3 className="text-xl font-semibold mb-4 font-serif flex items-center space-x-2">
                  <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                    />
                  </svg>
                  <span>Ticket Details</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="text-2xl font-bold text-warning">{formatPrice(event.priceWei)} STT</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Available</p>
                    <p className="text-2xl font-bold text-accent">
                      {availableTickets}/{event.maxSupply}
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm text-warning font-medium">NFT Ticket Benefits</p>
                  </div>
                  <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                    <li>• Immutable proof of ownership on blockchain</li>
                    <li>• Transferable to other wallet addresses</li>
                    <li>• Collectible digital asset with potential value</li>
                    <li>• Secure and fraud-proof verification</li>
                  </ul>
                </div>
              </div>

              {/* Blockchain Information */}
              <div className="card bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                <h3 className="text-xl font-semibold mb-4 font-serif flex items-center space-x-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                  <span>Blockchain Info</span>
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Event ID:</span>
                    <span className="font-mono text-accent">#{event.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Network:</span>
                    <span className="text-foreground">Somnia Testnet</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Token Standard:</span>
                    <span className="text-foreground">ERC-721 (NFT)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Minted:</span>
                    <span className="text-foreground">{event.minted} tickets</span>
                  </div>
                </div>
              </div>

              {/* Purchase Button */}
              <button
                onClick={() => onBuyTicket(event.id, event.priceWei)}
                disabled={!isConnected || isSoldOut || buyingId === event.id || eventStatus === "ended"}
                className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {buyingId === event.id ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Processing Purchase...</span>
                  </div>
                ) : !isConnected ? (
                  "Connect Wallet to Buy"
                ) : isSoldOut ? (
                  "Sold Out"
                ) : eventStatus === "ended" ? (
                  "Event Ended"
                ) : (
                  `Buy Ticket for ${formatPrice(event.priceWei)} STT`
                )}
              </button>

              {!isConnected && (
                <p className="text-center text-sm text-muted-foreground">Connect your wallet to purchase NFT tickets</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
