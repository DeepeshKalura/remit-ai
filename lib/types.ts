export interface Transaction {
  id: string
  timestamp: Date
  sendAmount: number
  sendCurrency: string
  receiveAmount: number
  receiveCurrency: string
  recipientCountry: string
  status: "pending" | "processing" | "completed" | "failed"
  exchangeRate: number
  fee: number
  txHash?: string
}

export interface WalletState {
  address: string | null
  balance: number
  connected: boolean
}

export interface RemittanceData {
  sendAmount: number
  receivingCountry: string
  recipientName: string
  recipientPhone: string
  purpose: string
}
