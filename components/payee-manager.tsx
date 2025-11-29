"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
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
    CheckCircle2
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
            setSuccess(`✓ ${formData.name} added successfully!`)

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
        <Card className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Payee Manager</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Manage your beneficiaries and recipients
                        </p>
                    </div>
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
                </div>
            )}
            {success && (
                <div className="mx-6 mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-green-700 dark:text-green-400">{success}</span>
                </div>
            )}

            {/* Tabs/Deck Interface */}
            <Tabs defaultValue="view" className="p-6">
                <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800">
                    <TabsTrigger value="view" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
                        <Users className="w-4 h-4 mr-2" />
                        View Payees
                    </TabsTrigger>
                    <TabsTrigger value="create" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add New
                    </TabsTrigger>
                </TabsList>

                {/* VIEW PAYEES TAB */}
                <TabsContent value="view" className="space-y-4 mt-6">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            placeholder="Search by name or tag (e.g., 'family', 'rent')..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10 h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        />
                    </div>

                    {/* Payee List */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                        </div>
                    ) : filteredPayees.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                {searchQuery ? "No payees found" : "No payees yet"}
                            </p>
                            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                                {searchQuery ? "Try a different search term" : "Add your first payee to get started"}
                            </p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-3">
                                {filteredPayees.map((payee) => (
                                    <button
                                        key={payee.id}
                                        onClick={() => setSelectedPayee(payee)}
                                        className="w-full text-left p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-all group"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                                                        {payee.name}
                                                    </h3>
                                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-2">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-4 h-4" />
                                                        {payee.country}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Wallet className="w-4 h-4" />
                                                        {payee.currency}
                                                    </span>
                                                </div>

                                                {/* Tags */}
                                                {payee.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {payee.tags.map((tag, idx) => (
                                                            <Badge
                                                                key={idx}
                                                                variant="secondary"
                                                                className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                                            >
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    )}

                    {/* Selected Payee Detail View */}
                    {selectedPayee && (
                        <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                        {selectedPayee.name}
                                    </h3>
                                    <Badge className="bg-green-500 text-white">Active Payee</Badge>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedPayee(null)}
                                    className="text-slate-500 hover:text-slate-700"
                                >
                                    ✕
                                </Button>
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Wallet Address</p>
                                        <code className="text-sm font-mono bg-white dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300 block break-all">
                                            {selectedPayee.wallet_address}
                                        </code>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Location & Currency</p>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                            {selectedPayee.country} • {selectedPayee.currency}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <TagIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">AI-Generated Tags</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {selectedPayee.tags.map((tag, idx) => (
                                                <Badge key={idx} className="bg-blue-500 text-white">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Created</p>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                            {new Date(selectedPayee.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </TabsContent>

                {/* CREATE PAYEE TAB */}
                <TabsContent value="create" className="mt-6">
                    <form onSubmit={handleCreatePayee} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="bg-slate-50 dark:bg-slate-800"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="country">Country *</Label>
                                <Input
                                    id="country"
                                    placeholder="India"
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    required
                                    className="bg-slate-50 dark:bg-slate-800"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="wallet">Cardano Wallet Address *</Label>
                            <Input
                                id="wallet"
                                placeholder="stake_test1uz..."
                                value={formData.wallet_address}
                                onChange={(e) => setFormData({ ...formData, wallet_address: e.target.value })}
                                required
                                className="font-mono bg-slate-50 dark:bg-slate-800"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="currency">Currency *</Label>
                            <Input
                                id="currency"
                                placeholder="INR"
                                value={formData.currency}
                                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                required
                                className="bg-slate-50 dark:bg-slate-800"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (for AI tagging) *</Label>
                            <textarea
                                id="description"
                                placeholder="e.g., My sister studying in Finland, I send her monthly support for rent and expenses"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                                rows={3}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md resize-none text-sm"
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                AI will generate smart tags based on this description
                            </p>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Add Payee
                                </>
                            )}
                        </Button>
                    </form>
                </TabsContent>
            </Tabs>
        </Card>
    )
}
