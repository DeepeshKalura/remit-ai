"use client"

import HeroSectionOne from "@/components/hero-section-demo-1"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { ArrowRight, Shield, Zap, Globe, TrendingDown } from "lucide-react"

export default function LandingPage() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push("/app")
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Updated Hero Section with working buttons */}
      <div className="relative mx-auto my-10 flex max-w-7xl flex-col items-center justify-center">
        <HeroSectionOne onGetStarted={handleGetStarted} />
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 text-slate-800 dark:text-slate-200">
          Why Choose RemitAI?
        </h2>
        <p className="text-center text-lg text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
          Experience the future of remittance with blockchain-powered transfers
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 hover:shadow-xl transition-shadow border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center mb-4">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-xl mb-2 text-slate-800 dark:text-slate-200">Lowest Fees</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Save up to 90% on transfer fees compared to traditional remittance services
            </p>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-shadow border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-xl mb-2 text-slate-800 dark:text-slate-200">Instant Transfers</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Send money in under 2 minutes with blockchain-powered transactions
            </p>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-shadow border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-xl mb-2 text-slate-800 dark:text-slate-200">Secure & Safe</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Built on Cardano blockchain with enterprise-grade security
            </p>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-shadow border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-lg flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-xl mb-2 text-slate-800 dark:text-slate-200">South Asia Focus</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Specialized support for India, Pakistan, Bangladesh, Nepal, and Sri Lanka
            </p>
          </Card>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 py-20 border-t border-slate-200 dark:border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent mb-2">
              0.5%
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Average Fee</p>
          </div>
          <div>
            <div className="text-5xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent mb-2">
              &lt;2min
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Transfer Time</p>
          </div>
          <div>
            <div className="text-5xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
              5+
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Countries Supported</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 border-0 p-12 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Ready to Send Money?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust RemitAI for their international transfers
          </p>
          <button
            onClick={handleGetStarted}
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </Card>
      </div>
    </main>
  )
}
