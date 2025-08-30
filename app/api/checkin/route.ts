import { NextResponse } from "next/server"
import { ethers } from "ethers"
import snicket from "@/contracts/Snicket.json"
import { CONTRACT_ADDRESS, RPC_URL } from "@/lib/constants"

const provider = new ethers.JsonRpcProvider(RPC_URL)
const contract = new ethers.Contract(CONTRACT_ADDRESS, snicket.abi, provider)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const tokenId = searchParams.get("tokenId")
    const eventId = searchParams.get("eventId")

    if (!tokenId || !eventId) {
      return NextResponse.json({ error: "Missing tokenId or eventId" }, { status: 400 })
    }

    const owner = await contract.ownerOf(tokenId)
    const ticketEventId = await contract.tokenEvent(tokenId)

    if (Number(ticketEventId) !== Number(eventId)) {
      return NextResponse.json({ valid: false, reason: "Event mismatch" }, { status: 400 })
    }

    return NextResponse.json({ valid: true, tokenId, eventId, owner })
  } catch (err: any) {
    // 🔎 Log detail error ke terminal VSCode
    console.error("Check-in failed:", err)

    // kirim ke client error lebih jelas
    return NextResponse.json(
      { valid: false, error: err.reason || err.message || "Check-in error" },
      { status: 500 }
    )
  }
}
