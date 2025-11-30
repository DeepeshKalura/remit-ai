"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { motion, AnimatePresence } from "framer-motion"
import {
  UserPlus,
  Search,
  Users,
  Wallet,
  MapPin,
  Tag as TagIcon,
  Clock,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Globe,
  FileText,
  Sparkles
} from "lucide-react"

// --- Types ---
interface Payee {
  id: string
  name: string
  wallet_address: string
  country: string
  currency: string
  tags: string[]
  created_at: string
}

interface PayeeManagerProps {
  userId: number
  apiBaseUrl?: string
}

export default function PayeeManager({ userId, apiBaseUrl = "http://localhost:8000" }: PayeeManagerProps) {
  // State Management
  const [payees, setPayees] = useState<Payee[]>([])
  const [filteredPayees, setFilteredPayees] = useState<Payee[]>([])
  const [selectedPayee, setSelectedPayee] = useState<Payee | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Create Form State
  const [formData, setFormData] = useState({
    name: "",
    wallet_address: "",
    country: "",
    currency: "",
    description: ""
  })

  // --- API Calls ---

  // Fetch all payees
  const fetchPayees = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${apiBaseUrl}/api/users/${userId}/payees`)
      if (!response.ok) throw new Error("Failed to fetch payees")
      const data = await response.json()
      setPayees(data)
      setFilteredPayees(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payees")
    } finally {
      setLoading(false)
    }
  }

  // Search payees
  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredPayees(payees)
      return
    }

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/users/${userId}/payees/search?q=${encodeURIComponent(query)}`
      )
      if (!response.ok) throw new Error("Search failed")
      const data = await response.json()
      setFilteredPayees(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed")
    }
  }

  // Create new payee
  const handleCreatePayee = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`${apiBaseUrl}/api/users/${userId}/payees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error("Failed to create payee")

      const newPayee = await response.json()
      setPayees([...payees, newPayee])
      setFilteredPayees([...payees, newPayee])
      setSuccess(`${formData.name} added successfully!`)

      // Reset form
      setFormData({
        name: "",
        wallet_address: "",
        country: "",
        currency: "",
        description: ""
      })

      // Auto-dismiss success message
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create payee")
    } finally {
      setLoading(false)
    }
  }

  // Load payees on mount
  useEffect(() => {
    fetchPayees()
  }, [userId])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="w-full max-w-4xl mx-auto bg-card border-border shadow-xl overflow-hidden">
        {/* Header Gradient Bar */}
        <div className="h-1 bg-gradient-to-r from-chart-1 via-chart-2 to-chart-4" />

        {/* Header */}
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-7 h-7 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl text-card-foreground">Payee Manager</CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage your beneficiaries and recipients
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-destructive/10 border-destructive/30 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-destructive">Error</p>
                      <p className="text-sm text-destructive/80">{error}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setError(null)}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-chart-2/10 border-chart-2/30 p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-chart-2 flex-shrink-0" />
                    <p className="text-sm font-medium text-chart-2">{success}</p>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs */}
          <Tabs defaultValue="view" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-secondary p-1 rounded-lg">
              <TabsTrigger
                value="view"
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md transition-all"
              >
                <Users className="w-4 h-4 mr-2" />
                View Payees
              </TabsTrigger>
              <TabsTrigger
                value="create"
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md transition-all"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add New
              </TabsTrigger>
            </TabsList>

            {/* VIEW PAYEES TAB */}
            <TabsContent value="view" className="space-y-4 mt-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name or tag (e.g., 'family', 'rent')..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-12 h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Payee List */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-10 h-10 animate-spin text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">Loading payees...</p>
                </div>
              ) : filteredPayees.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 bg-secondary/50 rounded-xl border border-border"
                >
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-foreground font-medium mb-1">
                    {searchQuery ? "No payees found" : "No payees yet"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? "Try a different search term" : "Add your first payee to get started"}
                  </p>
                </motion.div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {filteredPayees.map((payee, index) => (
                      <motion.button
                        key={payee.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedPayee(payee)}
                        className="w-full text-left p-4 bg-secondary/50 hover:bg-secondary rounded-xl border border-border hover:border-primary/30 transition-all group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-lg font-bold text-primary">
                                {payee.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-card-foreground truncate">
                                  {payee.name}
                                </h3>
                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all" />
                              </div>

                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                <span className="flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {payee.country}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Wallet className="w-3.5 h-3.5" />
                                  {payee.currency}
                                </span>
                              </div>

                              {/* Tags */}
                              {payee.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {payee.tags.slice(0, 3).map((tag, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="secondary"
                                      className="text-xs bg-chart-1/10 text-chart-1 border-0"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                  {payee.tags.length > 3 && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs bg-muted text-muted-foreground border-0"
                                    >
                                      +{payee.tags.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {/* Selected Payee Detail View */}
              <AnimatePresence>
                {selectedPayee && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="mt-6 bg-secondary/30 border-border overflow-hidden">
                      <div className="h-1 bg-gradient-to-r from-chart-1 to-chart-2" />
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xl font-bold text-primary">
                                {selectedPayee.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-card-foreground mb-1">
                                {selectedPayee.name}
                              </h3>
                              <Badge className="bg-chart-2/20 text-chart-2 border-0">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Active Payee
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPayee(null)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <Separator className="my-4 bg-border" />

                        <div className="grid gap-4">
                          {/* Wallet Address */}
                          <div className="flex items-start gap-4 p-4 bg-background rounded-lg border border-border">
                            <div className="w-10 h-10 rounded-lg bg-chart-1/10 flex items-center justify-center flex-shrink-0">
                              <Wallet className="w-5 h-5 text-chart-1" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground mb-1">Wallet Address</p>
                              <code className="text-sm font-mono text-card-foreground break-all">
                                {selectedPayee.wallet_address}
                              </code>
                            </div>
                          </div>

                          {/* Location & Currency */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-start gap-4 p-4 bg-background rounded-lg border border-border">
                              <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-5 h-5 text-chart-2" />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Country</p>
                                <p className="text-sm font-medium text-card-foreground">
                                  {selectedPayee.country}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-background rounded-lg border border-border">
                              <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center flex-shrink-0">
                                <Globe className="w-5 h-5 text-chart-4" />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Currency</p>
                                <p className="text-sm font-medium text-card-foreground">
                                  {selectedPayee.currency}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Tags */}
                          <div className="flex items-start gap-4 p-4 bg-background rounded-lg border border-border">
                            <div className="w-10 h-10 rounded-lg bg-chart-5/10 flex items-center justify-center flex-shrink-0">
                              <TagIcon className="w-5 h-5 text-chart-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="text-xs text-muted-foreground">AI-Generated Tags</p>
                                <Sparkles className="w-3 h-3 text-chart-4" />
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {selectedPayee.tags.map((tag, idx) => (
                                  <Badge
                                    key={idx}
                                    className="bg-primary text-primary-foreground border-0"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Created Date */}
                          <div className="flex items-start gap-4 p-4 bg-background rounded-lg border border-border">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <Clock className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Created</p>
                              <p className="text-sm font-medium text-card-foreground">
                                {new Date(selectedPayee.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            {/* CREATE PAYEE TAB */}
            <TabsContent value="create" className="mt-6">
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                onSubmit={handleCreatePayee}
                className="space-y-6"
              >
                {/* Name and Country Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-medium text-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      Country
                    </Label>
                    <Input
                      id="country"
                      placeholder="India"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      required
                      className="h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                {/* Wallet Address */}
                <div className="space-y-2">
                  <Label htmlFor="wallet" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-muted-foreground" />
                    Cardano Wallet Address
                  </Label>
                  <Input
                    id="wallet"
                    placeholder="addr_test1qz..."
                    value={formData.wallet_address}
                    onChange={(e) => setFormData({ ...formData, wallet_address: e.target.value })}
                    required
                    className="h-12 font-mono bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    Currency
                  </Label>
                  <Input
                    id="currency"
                    placeholder="INR"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    required
                    className="h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    Description
                    <Badge variant="secondary" className="text-xs bg-chart-4/10 text-chart-4 border-0 ml-1">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Tagging
                    </Badge>
                  </Label>
                  <textarea
                    id="description"
                    placeholder="e.g., My sister studying in Finland, I send her monthly support for rent and expenses"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-lg resize-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-chart-4" />
                    AI will generate smart tags based on this description
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating Payee...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Add Payee
                    </>
                  )}
                </Button>
              </motion.form>
            </TabsContent>
          </Tabs>

          {/* Footer Stats */}
          <Separator className="bg-border" />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{payees.length} payee{payees.length !== 1 ? 's' : ''} saved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-chart-4" />
              <span>AI-powered tagging</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}