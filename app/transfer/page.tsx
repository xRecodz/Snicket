"use client"

import Layout from "@/components/Layout"
import { useState, useEffect, useCallback } from "react"
import { useAccount } from "wagmi"
import { useContract } from "@/hooks/useContract"
import { showToast } from "@/lib/toast"
import { ipfsToHttp } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export default function TransferPage() {
  const { isConnected, address } = useAccount()
  const contract = useContract()

  const [selectedTicket, setSelectedTicket] = useState("")
  const [recipientAddress, setRecipientAddress] = useState("")
  const [isTransferring, setIsTransferring] = useState(false)
  const [userTickets, setUserTickets] = useState<any[]>([])
  const [loadingTickets, setLoadingTickets] = useState(true)
  const [showConfirm, setShowConfirm] = useState(false)
  const [step, setStep] = useState(1)

  const [addressValidation, setAddressValidation] = useState<{
    isValid: boolean
    message: string
    type: "success" | "error" | "warning" | "info"
  }>({ isValid: false, message: "", type: "info" })

  // ==== REFACTORED FUNCTION loadUserTickets ====
  const loadUserTickets = useCallback(async () => {
    if (!contract || !address) {
      setLoadingTickets(false)
      return
    }
    setLoadingTickets(true)
    try {
      const tickets = await (contract as any).getMyTickets(address)
      const ticketDetails = []

      for (const tokenId of tickets) {
        try {
          const eventId = await (contract as any).tokenEvent(tokenId)
          const event = await (contract as any).events(eventId)

          let imageUrl = "/nft-ticket.png"
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

          ticketDetails.push({
            id: tokenId.toString(),
            tokenId: tokenId.toString(),
            eventId: eventId.toString(),
            eventName: event.name || "Unknown Event",
            ticketType: "NFT Ticket",
            imageUrl,
            metadata,
            startTime: event.startTime ? Number(event.startTime) : 0,
          })
        } catch {}
      }

      setUserTickets(ticketDetails)
    } catch {
      showToast.error("Failed to load your tickets")
    } finally {
      setLoadingTickets(false)
    }
  }, [contract, address])

  // ==== USE EFFECT INIT LOAD ====
  useEffect(() => {
    loadUserTickets()
  }, [loadUserTickets])

  // ==== ADDRESS VALIDATION ====
  useEffect(() => {
    if (!recipientAddress) {
      setAddressValidation({ isValid: false, message: "", type: "info" })
      return
    }
    if (recipientAddress.length < 42) {
      setAddressValidation({
        isValid: false,
        message: `${42 - recipientAddress.length} more characters needed`,
        type: "info",
      })
      return
    }
    if (!recipientAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      setAddressValidation({
        isValid: false,
        message: "Invalid format",
        type: "error",
      })
      return
    }
    if (recipientAddress.toLowerCase() === address?.toLowerCase()) {
      setAddressValidation({
        isValid: false,
        message: "Cannot transfer to yourself",
        type: "warning",
      })
      return
    }
    setAddressValidation({
      isValid: true,
      message: "Valid wallet ✓",
      type: "success",
    })
  }, [recipientAddress, address])

  // ==== HANDLE TRANSFER (REVISED) ====
  const handleTransfer = async () => {
    setShowConfirm(false)
    if (!selectedTicket || !recipientAddress || !addressValidation.isValid) {
      showToast.warning("Please complete all fields")
      return
    }
    if (!isConnected || !contract) {
      showToast.error("Please connect wallet")
      return
    }
    setIsTransferring(true)
    try {
      const tx = await (contract as any).transferFrom(address, recipientAddress, selectedTicket)
      await showToast.promise(tx.wait(), {
        loading: "Processing transfer...",
        success: "✅ Ticket transferred!",
        error: "❌ Transfer failed",
      })

      // === REFRESH LIST AFTER TRANSFER SUCCESS ===
      await loadUserTickets()

      setSelectedTicket("")
      setRecipientAddress("")
      setStep(1)
    } catch (e: any) {
      showToast.error("Transfer failed", e?.message || "")
    } finally {
      setIsTransferring(false)
    }
  }

  if (!isConnected) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="card text-center max-w-md">
            <h2 className="text-2xl font-bold mb-2 font-serif">Connect Wallet</h2>
            <p className="text-muted-foreground">You need to connect your wallet to transfer NFT tickets</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen py-12">
        <div className="max-w-5xl mx-auto px-4">
          {/* Step Wizard */}
          <div className="flex justify-center mb-10 space-x-6">
            {["Select Ticket", "Recipient", "Confirm"].map((label, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    step >= i + 1 ? "bg-warning text-black" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </div>
                <span className={`${step >= i + 1 ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
                {i < 2 && <div className="w-10 h-[2px] bg-muted"></div>}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="card p-6"
              >
                <h2 className="text-xl font-bold mb-4">Select Ticket</h2>
                {loadingTickets ? (
                  <p>Loading tickets...</p>
                ) : userTickets.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-lg font-semibold">🎫 No Tickets</p>
                    <a href="/events" className="btn-primary mt-4">
                      Buy Ticket
                    </a>
                  </div>
                ) : (
                  <div className="flex flex-wrap justify-center gap-6">
                    {userTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        onClick={() => {
                          setSelectedTicket(ticket.tokenId)
                          setStep(2)
                        }}
                        className={`cursor-pointer border rounded-xl p-4 transition-all w-[260px] 
                          ${selectedTicket === ticket.tokenId ? "border-warning shadow-lg scale-[1.02]" : "hover:border-accent/50 hover:scale-[1.01]"}
                        `}
                      >
                        <img
                          src={ticket.imageUrl}
                          className="rounded-lg mb-3 w-full h-40 object-cover"
                        />
                        <h3 className="font-semibold truncate">{ticket.eventName}</h3>
                        <p className="text-sm text-muted-foreground">Token #{ticket.tokenId}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="card p-6 space-y-6"
              >
                <h2 className="text-xl font-bold">Enter Recipient</h2>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="0x1234567890abcdef..."
                  className="w-full px-4 py-3 rounded-lg font-mono text-sm
                             bg-card border border-accent/40 
                             text-black placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
                <p className={`text-sm ${addressValidation.type === "success" ? "text-green-500" : "text-red-400"}`}>
                  {addressValidation.message}
                </p>
                <div className="flex justify-between">
                  <button className="btn-secondary" onClick={() => setStep(1)}>
                    Back
                  </button>
                  <button className="btn-primary" disabled={!addressValidation.isValid} onClick={() => setStep(3)}>
                    Next
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="card p-6 space-y-6"
              >
                <h2 className="text-xl font-bold">Confirm Transfer</h2>
                <div className="p-4 border rounded-lg">
                  <p>Ticket ID: {selectedTicket}</p>
                  <p>Recipient: {recipientAddress}</p>
                </div>
                <div className="flex justify-between">
                  <button className="btn-secondary" onClick={() => setStep(2)}>
                    Back
                  </button>
                  <button className="btn-warning" onClick={() => setShowConfirm(true)}>
                    Confirm & Transfer
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Confirmation Modal */}
          <AnimatePresence>
            {showConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  className="card max-w-md w-full p-6"
                >
                  <h2 className="text-xl font-bold mb-4">Are you sure?</h2>
                  <p className="mb-6">This action cannot be undone.</p>
                  <div className="flex justify-end space-x-3">
                    <button className="btn-secondary" onClick={() => setShowConfirm(false)}>
                      Cancel
                    </button>
                    <button className="btn-warning" onClick={handleTransfer} disabled={isTransferring}>
                      {isTransferring ? "Transferring..." : "Yes, Transfer"}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  )
}
