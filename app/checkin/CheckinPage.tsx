"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, Loader2, Home } from "lucide-react"

export default function CheckinPage() {
  const searchParams = useSearchParams()
  const tokenId = searchParams.get("tokenId")
  const eventId = searchParams.get("eventId")
  const router = useRouter()

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`/api/checkin?tokenId=${tokenId}&eventId=${eventId}`)
        const data = await res.json()

        if (data.valid) {
          setStatus("success")
          setMessage(`Tiket valid 🎉\nOwner: ${data.owner}`)
        } else {
          setStatus("error")
          setMessage(data.reason || data.error || "Check-in failed ❌")
        }
      } catch (err: any) {
        setStatus("error")
        setMessage(err.message || "An error occurred during check-in")
      }
    }

    if (tokenId && eventId) {
      check()
    } else {
      setStatus("error")
      setMessage("TokenId or EventId Not valid")
    }
  }, [tokenId, eventId])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-background text-foreground">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-6 max-w-md"
      >
        <h1 className="text-4xl font-extrabold text-primary">Check-in Tiket</h1>
  
        {status === "loading" && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg text-foreground/80">Memverifikasi tiket...</p>
          </div>
        )}
  
        {status === "success" && (
          <div className="flex flex-col items-center gap-3 text-green-600">
            <CheckCircle className="h-14 w-14" />
            <p className="whitespace-pre-line text-lg font-medium">{message}</p>
          </div>
        )}
  
        {status === "error" && (
          <div className="flex flex-col items-center gap-3 text-red-600">
            <XCircle className="h-14 w-14" />
            <p className="whitespace-pre-line text-lg font-medium">{message}</p>
          </div>
        )}
  
        <button
          onClick={() => router.push("/")}
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium 
                     hover:opacity-90 transition-colors"
        >
          <Home className="h-5 w-5" />
          Kembali ke Home
        </button>
      </motion.div>
    </div>
  )  
}
