"use client"

import { useEffect, useState, useCallback } from "react"
import Layout from "@/components/Layout"
import { useContract } from "@/hooks/useContract"
import { ipfsToHttp } from "@/lib/utils"
import { useAccount } from "wagmi"
// 👉 import qrcode.react
import { QRCodeCanvas } from "qrcode.react"

type TicketItem = {
  tokenId: number
  eventId: number
  eventName: string
  imageUrl: string
  metadata?: any
}

export default function MyTicketsPage() {
  const contract = useContract()
  const { address: account, isConnected } = useAccount()

  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState<TicketItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null)

  // ==== FUNGSI RELOAD TIKET ====
  const loadTickets = useCallback(async () => {
    if (!contract || !isConnected || !account) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const tokenIds: any[] = await (contract as any).getMyTickets(account)
      const items: TicketItem[] = []

      for (const rawId of tokenIds) {
        try {
          const tokenId = Number(rawId)

          let imageUrl = "/event-ticket.png"
          let metadata: any = undefined
          try {
            const tokenURI: string = await (contract as any).tokenURI(tokenId)
            const httpURI = ipfsToHttp(tokenURI)
            if (httpURI && httpURI.startsWith("http")) {
              const res = await fetch(httpURI)
              if (res.ok) {
                metadata = await res.json()
                const img = ipfsToHttp(metadata?.image || "")
                imageUrl = img || imageUrl
              }
            }
          } catch {}

          let eventId = 0
          try {
            const evId = await (contract as any).tokenEvent(tokenId)
            eventId = Number(evId)
          } catch {}
          let eventName = "Unknown Event"
          try {
            const ev = await (contract as any).events(eventId)
            if (ev?.name) eventName = String(ev.name)
          } catch (e) {
            console.error("Failed loading event for ticket", tokenId, e)
          }

          items.push({ tokenId, eventId, eventName, imageUrl, metadata })
        } catch (inner) {
          console.error("Failed loading a ticket:", inner)
        }
      }

      setTickets(items)
    } catch (e: any) {
      console.error(e)
      setError(e?.message || "Failed to load your tickets")
    } finally {
      setLoading(false)
    }
  }, [contract, isConnected, account])

  // ==== INITIAL LOAD ====
  useEffect(() => {
    loadTickets()
  }, [loadTickets])

  // ==== REALTIME EVENT LISTENER ====
  useEffect(() => {
    if (!contract || !account) return

    const onTransfer = async (from: string, to: string, tokenId: any) => {
      // Hanya refetch kalau user yang terlibat (from atau to == account)
      if (
        from?.toLowerCase() === account.toLowerCase() ||
        to?.toLowerCase() === account.toLowerCase()
      ) {
        await loadTickets()
      }
    }

    ;(contract as any).on("Transfer", onTransfer)

    return () => {
      ;(contract as any).off("Transfer", onTransfer)
    }
  }, [contract, account, loadTickets])

  if (!isConnected) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-white mb-4">My Tickets</h1>
          <p className="text-gray-400">Please connect your wallet to view your tickets.</p>
        </div>
      </Layout>
    )
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading your tickets...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white">My Tickets</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 border border-red-600/50 bg-red-900/20 rounded text-red-200 text-sm">{error}</div>
        )}

        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">You don&apos;t have any tickets yet.</p>
            <a href="/events" className="btn-primary">
              Browse Events
            </a>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {tickets.map((t) => (
              <div
                key={`${t.tokenId}-${t.eventId}`}
                onClick={() => setSelectedTicket(t)}
                className="cursor-pointer group relative bg-card border border-border rounded-xl p-4 shadow-sm hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
              >
                <div className="aspect-[4/3] bg-muted rounded-lg mb-3 overflow-hidden relative">
                  <img
                    src={t.imageUrl || "/placeholder.svg"}
                    alt={`Ticket for ${t.eventName}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = "/event-ticket.png"
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <span className="bg-green-500/90 text-white text-xs px-2 py-1 rounded-full font-medium backdrop-blur-sm">
                      Valid
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                  {t.eventName}
                </h3>

                <div className="space-y-1 text-xs text-gray-400 mb-3">
                  <div className="flex justify-between">
                    <span>Token ID:</span>
                    <span className="text-primary-400 font-medium">#{t.tokenId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Event ID:</span>
                    <span className="text-primary-400 font-medium">#{t.eventId}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="inline-flex items-center bg-gradient-to-r from-primary-600 to-primary-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                    NFT Ticket
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Detail Ticket */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-slate-900 rounded-2xl shadow-lg max-w-lg w-full overflow-hidden animate-fadeIn">
            <div className="relative">
              <img
                src={selectedTicket.imageUrl}
                alt={`Ticket for ${selectedTicket.eventName}`}
                className="w-full h-64 object-cover"
              />
              <button
                onClick={() => setSelectedTicket(null)}
                className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-3">{selectedTicket.eventName}</h2>
              <p className="text-gray-400 mb-4">
                Token ID: <span className="text-primary-400">#{selectedTicket.tokenId}</span> | Event ID:{" "}
                <span className="text-primary-400">#{selectedTicket.eventId}</span>
              </p>
              {selectedTicket.metadata?.description && (
                <p className="text-gray-300 mb-4">{selectedTicket.metadata.description}</p>
              )}
              {selectedTicket.metadata?.date && (
                <p className="text-sm text-gray-400">Date: {selectedTicket.metadata.date}</p>
              )}
              {selectedTicket.metadata?.location && (
                <p className="text-sm text-gray-400">Location: {selectedTicket.metadata.location}</p>
              )}
            </div>

            {/* 👉 Tambahkan QR Code di bagian bawah modal */}
            <div className="mt-6 flex justify-center pb-6">
              <QRCodeCanvas
                value={`http://localhost:3000/checkin?tokenId=${selectedTicket.tokenId}&eventId=${selectedTicket.eventId}`}
                size={180}
                bgColor="#ffffff"
                fgColor="#000000"
                includeMargin={true}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
