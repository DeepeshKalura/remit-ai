// Cardano CIP-30 Wallet Interface
export interface CardanoWallet {
  name: string
  icon?: string
  enable: () => Promise<CardanoAPI>
  isEnabled: () => Promise<boolean>
}

export interface CardanoAPI {
  getBalance: () => Promise<string>
  getUsedAddresses: () => Promise<string[]>
  getUnusedAddresses: () => Promise<string[]>
  signTx: (tx: string) => Promise<string>
  submitTx: (tx: string) => Promise<string>
}

export interface WalletInfo {
  name: string
  address: string
  balance: number
  isTestnet: boolean
}

class CardanoWalletManager {
  private wallet: CardanoAPI | null = null
  private walletName = ""

  async getAvailableWallets(): Promise<CardanoWallet[]> {
    const wallets: CardanoWallet[] = []

    // Nami
    if ((window as any).cardano?.nami) {
      wallets.push({
        name: "Nami",
        enable: () => (window as any).cardano.nami.enable(),
        isEnabled: () => (window as any).cardano.nami.isEnabled(),
      })
    }

    // Eternl
    if ((window as any).cardano?.eternl) {
      wallets.push({
        name: "Eternl",
        enable: () => (window as any).cardano.eternl.enable(),
        isEnabled: () => (window as any).cardano.eternl.isEnabled(),
      })
    }

    // Flint
    if ((window as any).cardano?.flint) {
      wallets.push({
        name: "Flint",
        enable: () => (window as any).cardano.flint.enable(),
        isEnabled: () => (window as any).cardano.flint.isEnabled(),
      })
    }

    // If no wallets found, return mock for demo
    if (wallets.length === 0) {
      console.log("[v0] No Cardano wallets detected. Using mock wallet for demo.")
      wallets.push({
        name: "Mock Wallet (Demo)",
        enable: async () => this.getMockWalletAPI(),
        isEnabled: async () => true,
      })
    }

    return wallets
  }

  private getMockWalletAPI(): CardanoAPI {
    return {
      getBalance: async () => "1250450000", // 1250.45 ADA in lovelace
      getUsedAddresses: async () => ["addr_test1qz2k4r8x9w2v3u4t5s6r7q8p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4"],
      getUnusedAddresses: async () => [],
      signTx: async (tx) => {
        console.log("[v0] Mock wallet signing transaction")
        return `signed_${tx.slice(0, 20)}`
      },
      submitTx: async (tx) => {
        console.log("[v0] Mock wallet submitting transaction")
        return `0x${Math.random().toString(16).slice(2)}`
      },
    }
  }

  async connect(walletName: string): Promise<WalletInfo> {
    try {
      const wallets = await this.getAvailableWallets()
      const selectedWallet = wallets.find((w) => w.name === walletName)

      if (!selectedWallet) {
        throw new Error(`Wallet ${walletName} not found`)
      }

      console.log(`[v0] Connecting to ${walletName}...`)
      this.wallet = await selectedWallet.enable()
      this.walletName = walletName

      const addresses = await this.wallet.getUsedAddresses()
      const balance = await this.wallet.getBalance()

      const lovelaceBalance = Number.parseInt(balance, 10)
      const adaBalance = lovelaceBalance / 1_000_000

      return {
        name: walletName,
        address: addresses[0] || "unknown",
        balance: adaBalance,
        isTestnet: true, // Demo assumes testnet
      }
    } catch (error) {
      console.error("[v0] Wallet connection failed:", error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    this.wallet = null
    this.walletName = ""
    console.log("[v0] Wallet disconnected")
  }

  async signTransaction(txHex: string): Promise<string> {
    if (!this.wallet) {
      throw new Error("Wallet not connected")
    }
    console.log("[v0] Signing transaction with", this.walletName)
    return this.wallet.signTx(txHex)
  }

  async submitTransaction(signedTxHex: string): Promise<string> {
    if (!this.wallet) {
      throw new Error("Wallet not connected")
    }
    console.log("[v0] Submitting transaction with", this.walletName)
    return this.wallet.submitTx(signedTxHex)
  }

  isConnected(): boolean {
    return this.wallet !== null
  }

  getWalletName(): string {
    return this.walletName
  }
}

export const cardanoWalletManager = new CardanoWalletManager()
