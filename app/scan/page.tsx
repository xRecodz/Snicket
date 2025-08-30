"use client"

import { useState } from "react"
import { QrScanner } from "@yudiel/react-qr-scanner"  // ✅ default import

export default function ScanPage() {
  const [result, setResult] = useState<string | null>(null)
  const [checkinStatus, setCheckinStatus] = useState<any>(null)

  const handleScan = async (text: string) => {
    if (!text) return
    setResult(text)

    try {
      let url = text

      if (text.startsWith("ticket:")) {
        const parts = text.split(":")
        const tokenId = parts[1]
        const eventId = parts[2]
        url = `/checkin?tokenId=${tokenId}&eventId=${eventId}`
      }

      const res = await fetch(url)
      const json = await res.json()
      setCheckinStatus(json)
    } catch (err) {
      console.error(err)
      setCheckinStatus({ error: "Failed to check ticket" })
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">Ticket Scanner</h1>

      <div className="w-full max-w-md rounded-lg overflow-hidden">
        <QrScanner
          onDecode={(res) => handleScan(res)}
          onError={(err) => console.error(err?.message)}
        />
      </div>

      {result && (
        <div className="mt-6 w-full max-w-md bg-slate-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-400">Scanned QR:</p>
          <p className="text-primary-400 font-mono break-all">{result}</p>
        </div>
      )}

      {checkinStatus && (
        <div className="mt-6 w-full max-w-md bg-slate-800 p-4 rounded-lg shadow">
          {checkinStatus.valid ? (
            <div className="text-green-400 font-bold text-lg">✅ Ticket Valid</div>
          ) : (
            <div className="text-red-400 font-bold text-lg">❌ Ticket Invalid</div>
          )}

          <pre className="text-xs text-gray-300 mt-2 overflow-x-auto">
            {JSON.stringify(checkinStatus, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
