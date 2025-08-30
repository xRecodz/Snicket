"use client"

import Link from "next/link"
import { useState } from "react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isConnected } = useAccount()

  return (
    <nav className="bg-gradient-to-r from-[#dfe8ff] via-[#c7d2fe] to-[#e0e7ff] border-b border-[hsl(230,30%,85%)] shadow-xl backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TOP BAR */}
        <div className="flex justify-between items-center h-20">
          
          {/* LOGO */}
          <Link
            href="/"
            className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent font-serif hover:scale-110 transition-all duration-300 animate-cosmic-glow relative z-10"
          >
            <span className="relative">
              <span className="bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent font-bold text-4xl drop-shadow-lg">
                Snicket
              </span>
              <div className="absolute -inset-2 bg-gradient-to-r from-accent/40 via-primary/30 to-secondary/30 blur-lg opacity-70 hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Events */}
            <Link
              href="/events"
              className="relative px-4 py-2 text-foreground hover:text-accent transition-all duration-300 font-medium rounded-lg hover:bg-accent/10 border border-transparent hover:border-accent/30 hover:shadow-lg hover:shadow-accent/20 group"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Events</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
            </Link>

            {/* My Tickets */}
            <Link
              href="/my-tickets"
              className="relative px-4 py-2 text-foreground hover:text-secondary transition-all duration-300 font-medium rounded-lg hover:bg-secondary/10 border border-transparent hover:border-secondary/30 hover:shadow-lg hover:shadow-secondary/20 group"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"/>
                </svg>
                <span>My Tickets</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
            </Link>

            {/* Transfer */}
            <Link
              href="/transfer"
              className="relative px-4 py-2 text-foreground hover:text-primary transition-all duration-300 font-medium rounded-lg hover:bg-primary/10 border border-transparent hover:border-primary/30 hover:shadow-lg hover:shadow-primary/20 group"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4"/>
                </svg>
                <span>Transfer</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
            </Link>

            {/* Organizer (if connected) */}
            {isConnected && (
              <Link
                href="/organizer"
                className="relative px-4 py-2 text-foreground hover:text-primary transition-all duration-300 font-medium rounded-lg hover:bg-primary/10 border border-transparent hover:border-primary/30 hover:shadow-lg hover:shadow-primary/20 group"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                  </svg>
                  <span>Create Event</span>
                </span>
              </Link>
            )}

          </div>

          {/* WALLET BUTTON AREA */}
          <div className="flex items-center space-x-4">

            {/* CUSTOM CONNECT BUTTON */}
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
              }) => {
                const ready = mounted && authenticationStatus !== "loading"
                const connected = ready && account && chain && (!authenticationStatus || authenticationStatus === "authenticated")

                return (
                  <div
                    {...(!ready && {
                      "aria-hidden": true,
                      style: {
                        opacity: 0,
                        pointerEvents: "none",
                        userSelect: "none",
                      },
                    })}
                  >
                    {/* Not Connected */}
                    {!connected && (
                      <button
                        onClick={openConnectModal}
                        type="button"
                        className="relative px-6 py-3 bg-gradient-to-r from-[hsl(250,70%,60%)] to-[hsl(220,70%,55%)] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 border border-[hsl(250,70%,70%)]/40 hover:border-[hsl(250,70%,70%)]/70"
                      >
                        <span className="relative z-10 flex items-center space-x-2 font-bold">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                          </svg>
                          <span>Connect Wallet</span>
                        </span>
                      </button>
                    )}

                    {/* Wrong Network */}
                    {connected && chain.unsupported && (
                      <button
                        onClick={openChainModal}
                        type="button"
                        className="relative px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105"
                      >
                        Wrong network
                      </button>
                    )}

                    {/* Connected */}
                    {connected && !chain.unsupported && (
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={openChainModal}
                          className="relative px-5 py-2 bg-gradient-to-r from-primary to-accent 
                         text-white font-semibold rounded-lg shadow-md 
                         hover:shadow-xl hover:scale-105 transition-all duration-300"
                          type="button"
                            >
                          <span className="relative z-10 flex items-center space-x-2">
                            {chain.hasIcon && (
                              <div
                                style={{
                                  background: chain.iconBackground,
                                  width: 20,
                                  height: 20,
                                  borderRadius: 999,
                                  overflow: "hidden",
                                  marginRight: 4,
                                }}
                              >
                                {chain.iconUrl && (
                                  <img
                                    alt={chain.name ?? "Chain icon"}
                                    src={chain.iconUrl}
                                    style={{ width: 20, height: 20 }}
                                  />
                                )}
                              </div>
                            )}
                            <span className="text-sm font-medium">{chain.name}</span>
                          </span>
                        </button>

                        <button
                          onClick={openAccountModal}
                          type="button"
                          className="relative px-6 py-3 bg-gradient-to-r from-[hsl(250,70%,60%)] to-[hsl(260,60%,65%)] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 border border-[hsl(250,70%,70%)]/40 hover:border-[hsl(250,70%,70%)]/70"
                        >
                          <span className="relative z-10 flex items-center space-x-2 font-bold">
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                            <span>{account.displayName}</span>
                            {account.displayBalance && (
                              <span className="text-white/80 font-medium">({account.displayBalance})</span>
                            )}
                          </span>
                        </button>
                      </div>
                    )}

                  </div>
                )
              }}
            </ConnectButton.Custom>

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-3 rounded-lg text-foreground hover:text-accent hover:bg-accent/10 transition-all duration-300 border border-transparent hover:border-accent/30 hover:shadow-lg hover:shadow-accent/20"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
          </div>
        </div>

        {/* MOBILE NAVIGATION */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-primary/20 animate-slide-up backdrop-blur-sm">
            <div className="flex flex-col space-y-2">
              
              {/* Events */}
              <Link
                href="/events"
                className="text-foreground hover:text-accent transition-all duration-300 font-medium px-4 py-3 hover:bg-accent/10 rounded-lg border border-transparent hover:border-accent/30 hover:shadow-lg hover:shadow-accent/20"
                onClick={() => setMobileMenuOpen(false)}
              >
                Events
              </Link>

              {/* My Tickets */}
              <Link
                href="/my-tickets"
                className="text-foreground hover:text-secondary transition-all duration-300 font-medium px-4 py-3 hover:bg-secondary/10 rounded-lg border border-transparent hover:border-secondary/30 hover:shadow-lg hover:shadow-secondary/20"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Tickets
              </Link>

              {/* Transfer */}
              <Link
                href="/transfer"
                className="text-foreground hover:text-primary transition-all duration-300 font-medium px-4 py-3 hover:bg-primary/10 rounded-lg border border-transparent hover:border-primary/30 hover:shadow-lg hover:shadow-primary/20"
                onClick={() => setMobileMenuOpen(false)}
              >
                Transfer
              </Link>

              {/* Organizer */}
              {isConnected && (
                <Link
                  href="/organizer"
                  className="text-foreground hover:text-primary transition-all duration-300 font-medium px-4 py-3 hover:bg-primary/10 rounded-lg border border-transparent hover:border-primary/30 hover:shadow-lg hover:shadow-primary/20"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Organizer
                </Link>
              )}
            </div>
          </div>
        )}

      </div>
    </nav>
  )
}
