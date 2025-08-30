"use client"

import { useEffect, useState } from "react"
import { ethers } from "ethers"
import Snicket from "@/contracts/Snicket.json"
import { CONTRACT_ADDRESS, RPC_URL } from "@/lib/utils"

export function useContract() {
  const [contract, setContract] = useState<ethers.Contract | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        let signerOrProvider: any

        if (typeof window !== "undefined" && (window as any)?.ethereum) {
          // prefer signer jika wallet ada
          const browserProvider = new ethers.BrowserProvider((window as any).ethereum)
          try {
            const signer = await browserProvider.getSigner()
            signerOrProvider = signer
          } catch {
            // belum connect; tetap pakai provider read-only
            signerOrProvider = browserProvider
          }
        } else {
          // pure read-only
          signerOrProvider = new ethers.JsonRpcProvider(RPC_URL)
        }

        const c = new ethers.Contract(CONTRACT_ADDRESS, (Snicket as any).abi, signerOrProvider)
        if (alive) setContract(c)
      } catch (e) {
        console.error("Failed to init contract:", e)
        if (alive) setContract(null)
      }
    })()

    return () => {
      alive = false
    }
  }, [])

  return contract
}
