import type { Transaction } from "./types"

const mockTransactions: Transaction[] = [
  {
    id: "tx_001",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    sendAmount: 50,
    sendCurrency: "ADA",
    receiveAmount: 2645,
    receiveCurrency: "PHP",
    recipientCountry: "philippines",
    status: "completed",
    exchangeRate: 1.12,
    fee: 0.5,
    txHash: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p",
  },
  {
    id: "tx_002",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    sendAmount: 100,
    sendCurrency: "ADA",
    receiveAmount: 9423,
    receiveCurrency: "INR",
    recipientCountry: "india",
    status: "completed",
    exchangeRate: 1.12,
    fee: 0.5,
    txHash: "0x2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q",
  },
]

export class TransactionService {
  static async getTransactionHistory(): Promise<Transaction[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockTransactions
  }

  static async createTransaction(data: {
    sendAmount: number
    recipientCountry: string
  }): Promise<Transaction> {
    const exchangeRates: Record<string, number> = {
      philippines: 52.9,
      vietnam: 25565,
      india: 94.23,
      mexico: 17.85,
      kenya: 129.5,
    }

    const rate = exchangeRates[data.recipientCountry] || 1.12
    const receiveAmount = data.sendAmount * rate * 0.995

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      timestamp: new Date(),
      sendAmount: data.sendAmount,
      sendCurrency: "ADA",
      receiveAmount,
      receiveCurrency: "USD",
      recipientCountry: data.recipientCountry,
      status: "processing",
      exchangeRate: 1.12,
      fee: 0.5,
    }

    mockTransactions.unshift(newTx)

    // Simulate completion
    await new Promise((resolve) => setTimeout(resolve, 3000))
    newTx.status = "completed"
    newTx.txHash = `0x${Math.random().toString(16).slice(2)}`

    return newTx
  }

  static async getTransactionStatus(txId: string): Promise<Transaction | null> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockTransactions.find((tx) => tx.id === txId) || null
  }
}
