"use client"

import { useState } from "react"
import ChatInterface from "@/components/chat-interface"
import DexRates from "@/components/dex-rates"
import RemittanceForm from "@/components/remittance-form"
import TransactionHistory from "@/components/transaction-history"
import WalletState from "@/components/wallet-state"
import DashboardAnalytics from "@/components/dashboard-analytics"
import SettingsPanel from "@/components/settings-panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Send, TrendingUp, Wallet, History, BarChart3, Settings } from "lucide-react"
import ConnectWalletButton from "@/components/connect-wallet-button"


export default function Home() {
  const [activeTab, setActiveTab] = useState("chat")

  console.log("[v0] RemitAI dashboard loaded")

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-700 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center font-bold text-slate-900">
              R
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">RemitAI</h1>
              <p className="text-xs text-slate-400">Powered by Cardano</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ConnectWalletButton />
            <div className="flex items-center gap-2 text-xs bg-slate-700 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-slate-300">Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Card className="bg-slate-800 border-slate-700 p-4 text-center">
            <p className="text-xs text-slate-400 mb-1">Exchange Rate</p>
            <p className="text-lg font-bold text-cyan-400">1.12x</p>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4 text-center">
            <p className="text-xs text-slate-400 mb-1">Avg Fee</p>
            <p className="text-lg font-bold text-green-400">0.5%</p>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4 text-center sm:col-span-1">
            <p className="text-xs text-slate-400 mb-1">Speed</p>
            <p className="text-lg font-bold text-orange-400">&lt; 2min</p>
          </Card>
        </div>

        {/* Wallet Section */}
        <WalletState />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-slate-700/50 overflow-x-auto">
            <TabsTrigger value="chat" className="text-xs gap-1 flex items-center justify-center">
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="rates" className="text-xs gap-1 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Rates</span>
            </TabsTrigger>
            <TabsTrigger value="send" className="text-xs gap-1 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs gap-1 flex items-center justify-center">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs gap-1 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs gap-1 flex items-center justify-center">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-6 space-y-4">
            <ChatInterface />
          </TabsContent>

          <TabsContent value="rates" className="mt-6 space-y-4">
            <DexRates />
          </TabsContent>

          <TabsContent value="send" className="mt-6 space-y-4">
            <RemittanceForm />
          </TabsContent>

          <TabsContent value="history" className="mt-6 space-y-4">
            <TransactionHistory />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6 space-y-4">
            <DashboardAnalytics />
          </TabsContent>

          <TabsContent value="settings" className="mt-6 space-y-4">
            <SettingsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
