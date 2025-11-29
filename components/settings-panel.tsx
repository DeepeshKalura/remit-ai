"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Settings, Shield, Bell, Zap } from "lucide-react"

export default function SettingsPanel() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-cyan-400" />
        <h2 className="text-lg font-semibold text-white">Settings</h2>
      </div>

      {/* Security */}
      <Card className="bg-slate-800 border-slate-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-white">Security</h3>
          </div>
          <Badge className="bg-green-500/20 text-green-400">Enabled</Badge>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">2FA Protection</span>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Testnet Only</span>
            <Switch defaultChecked />
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="bg-slate-800 border-slate-700 p-4">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-orange-400" />
          <h3 className="font-semibold text-white">Notifications</h3>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Transaction Updates</span>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Rate Alerts</span>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Promotional Offers</span>
            <Switch />
          </div>
        </div>
      </Card>

      {/* Performance */}
      <Card className="bg-slate-800 border-slate-700 p-4">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-5 h-5 text-yellow-400" />
          <h3 className="font-semibold text-white">Performance</h3>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Enable Price Cache</span>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Auto-Refresh Rates</span>
            <Switch defaultChecked />
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-red-500/10 border-red-500/30 p-4">
        <h3 className="font-semibold text-red-400 mb-3">Danger Zone</h3>
        <Button variant="outline" className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent">
          Clear All Data
        </Button>
      </Card>
    </div>
  )
}
