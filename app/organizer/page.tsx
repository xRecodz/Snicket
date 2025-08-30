"use client"

import type React from "react"
import { useState } from "react"
import Layout from "@/components/Layout"
import { useContract } from "@/hooks/useContract"
import { useAccount } from "wagmi"
import { ethers } from "ethers"

export default function OrganizerPage() {
  const contract = useContract()
  const { isConnected, address: account } = useAccount()

  const [name, setName] = useState("")
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [price, setPrice] = useState("0.01")
  const [max, setMax] = useState(100)

  // 🔗 Tambah IPFS URI
  const [preBaseURI, setPreBaseURI] = useState("ipfs://")
  const [postBaseURI, setPostBaseURI] = useState(".json")

  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contract || !isConnected || !account) {
      setMsg("⚠️ Connect wallet first.")
      return
    }
    setBusy(true)
    setMsg(null)

    try {
      const startTs = Math.floor(new Date(start).getTime() / 1000)
      const endTs = Math.floor(new Date(end).getTime() / 1000)
      const priceWei = ethers.parseEther(price)

      const tx = await contract.createEvent(
        name,
        startTs,
        endTs,
        preBaseURI,
        postBaseURI,
        priceWei,
        max,
        account
      )
      await tx.wait()

      setMsg("✅ Event created successfully!")
      setName("")
      setStart("")
      setEnd("")
      setPrice("0.01")
      setMax(100)
      setPreBaseURI("ipfs://")
      setPostBaseURI(".json")
    } catch (e: any) {
      console.error(e)
      setMsg(e?.reason || e?.message || "❌ Failed to create event")
    } finally {
      setBusy(false)
    }
  }

  if (!isConnected) {
    return (
      <Layout>
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-6">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">Event Organizer</h1>
              <p className="text-gray-400 mb-6">
                Connect your wallet to start creating amazing events and managing your NFT tickets.
              </p>
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-300 text-sm">
                  💡 Once connected, you'll be able to create events, set ticket prices, and manage your event portfolio.
                </p>
              </div>
            </div>
          </div>
        </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-foreground mb-10 text-center">Create New Event</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm border border-border rounded-xl p-8 shadow-xl"
        >
          <div className="space-y-6">
            <div>
            <label className="block text-sm font-medium text-foreground mb-2">Event Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="e.g. Blockchain Conference 2025"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                <input
                  type="datetime-local"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
                <input
                  type="datetime-local"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Ticket Price (STT)</label>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Max Supply</label>
                <input
                  type="number"
                  min="1"
                  value={max}
                  onChange={(e) => setMax(Number(e.target.value))}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Pre Base URI</label>
                <input
                  type="text"
                  value={preBaseURI}
                  onChange={(e) => setPreBaseURI(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="ipfs://Qm..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Post Base URI</label>
                <input
                  type="text"
                  value={postBaseURI}
                  onChange={(e) => setPostBaseURI(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder=".json"
                />
              </div>
            </div>

            {msg && (
              <div
                className={`p-4 rounded-lg text-sm ${
                  msg.startsWith("✅")
                    ? "bg-green-500/10 border border-green-500/30 text-green-400"
                    : msg.startsWith("⚠️")
                    ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"
                    : "bg-red-500/10 border border-red-500/30 text-red-400"
                }`}
              >
                {msg}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full btn-primary py-3 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {busy ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating Event...
                </div>
              ) : (
                "Create Event"
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
