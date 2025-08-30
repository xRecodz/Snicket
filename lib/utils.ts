// lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const CONTRACT_ADDRESS = "0x1D164f8eb94040C63a75C2762e89dc18B0364EFd" // <- isi alamat kontrakmu
export const RPC_URL = "https://dream-rpc.somnia.network"

// Helper: IPFS -> HTTP
export function ipfsToHttp(uri?: string): string {
  if (!uri) return ""
  if (uri.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${uri.replace("ipfs://", "")}`
  }
  return uri
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Batas scan event (karena tidak ada eventCount di ABI)
export const SCAN_MAX = 100
